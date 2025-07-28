#!/bin/bash

# 自动化部署脚本
# 用于将应用部署到生产环境

set -e  # 遇到错误立即退出

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 日志函数
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 配置变量
PROJECT_NAME="company-portal"
DEPLOY_ENV=${1:-"staging"}  # 默认部署到staging环境
BACKUP_DIR="/var/backups/$PROJECT_NAME"
APP_DIR="/var/www/$PROJECT_NAME"
SERVICE_NAME="$PROJECT_NAME"

log_info "开始部署 $PROJECT_NAME 到 $DEPLOY_ENV 环境"

# 1. 环境检查
log_info "检查部署环境..."

# 检查Node.js版本
if ! command -v node &> /dev/null; then
    log_error "Node.js 未安装"
    exit 1
fi

NODE_VERSION=$(node --version)
log_info "Node.js 版本: $NODE_VERSION"

# 检查npm版本
if ! command -v npm &> /dev/null; then
    log_error "npm 未安装"
    exit 1
fi

NPM_VERSION=$(npm --version)
log_info "npm 版本: $NPM_VERSION"

# 检查PM2 (生产环境进程管理器)
if ! command -v pm2 &> /dev/null; then
    log_warning "PM2 未安装，正在安装..."
    npm install -g pm2
fi

# 2. 创建备份
if [ -d "$APP_DIR" ]; then
    log_info "创建当前版本备份..."
    BACKUP_NAME="backup-$(date +%Y%m%d-%H%M%S)"
    mkdir -p "$BACKUP_DIR"
    cp -r "$APP_DIR" "$BACKUP_DIR/$BACKUP_NAME"
    log_success "备份已创建: $BACKUP_DIR/$BACKUP_NAME"
fi

# 3. 部署前检查
log_info "运行部署前检查..."

# 运行测试
log_info "运行测试套件..."
npm run test:ci
if [ $? -ne 0 ]; then
    log_error "测试失败，停止部署"
    exit 1
fi
log_success "所有测试通过"

# 运行质量检查
log_info "运行质量检查..."
npm run quality-check
if [ $? -ne 0 ]; then
    log_error "质量检查失败，停止部署"
    exit 1
fi
log_success "质量检查通过"

# 4. 构建应用
log_info "构建应用..."
npm run build
if [ $? -ne 0 ]; then
    log_error "构建失败，停止部署"
    exit 1
fi
log_success "构建完成"

# 5. 部署应用
log_info "部署应用到 $APP_DIR..."

# 创建应用目录
mkdir -p "$APP_DIR"

# 复制应用文件
rsync -av --exclude='node_modules' --exclude='.git' --exclude='tests' --exclude='coverage' . "$APP_DIR/"

# 安装生产依赖
cd "$APP_DIR"
npm ci --only=production

# 6. 配置环境变量
log_info "配置环境变量..."

if [ "$DEPLOY_ENV" = "production" ]; then
    cat > "$APP_DIR/.env" << EOF
NODE_ENV=production
PORT=3001
DEBUG=
EOF
else
    cat > "$APP_DIR/.env" << EOF
NODE_ENV=staging
PORT=3001
DEBUG=app:*
EOF
fi

# 7. PM2 配置
log_info "配置 PM2..."

cat > "$APP_DIR/ecosystem.config.js" << EOF
module.exports = {
  apps: [{
    name: '$PROJECT_NAME-$DEPLOY_ENV',
    script: 'src/server.js',
    cwd: '$APP_DIR',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: '$DEPLOY_ENV',
      PORT: 3001
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3001
    },
    error_file: '/var/log/$PROJECT_NAME/error.log',
    out_file: '/var/log/$PROJECT_NAME/out.log',
    log_file: '/var/log/$PROJECT_NAME/combined.log',
    time: true,
    max_memory_restart: '1G',
    node_args: '--max-old-space-size=1024'
  }]
};
EOF

# 创建日志目录
mkdir -p "/var/log/$PROJECT_NAME"

# 8. 启动服务
log_info "启动服务..."

# 停止旧服务
pm2 delete "$PROJECT_NAME-$DEPLOY_ENV" 2>/dev/null || true

# 启动新服务
pm2 start ecosystem.config.js --env $DEPLOY_ENV

# 保存PM2配置
pm2 save

# 9. 健康检查
log_info "执行健康检查..."

# 等待服务启动
sleep 10

# 检查服务状态
if ! pm2 describe "$PROJECT_NAME-$DEPLOY_ENV" | grep -q "online"; then
    log_error "服务启动失败"
    exit 1
fi

# 检查HTTP健康状态
for i in {1..30}; do
    if curl -f http://localhost:3001/api/health > /dev/null 2>&1; then
        log_success "健康检查通过"
        break
    fi
    
    if [ $i -eq 30 ]; then
        log_error "健康检查失败"
        exit 1
    fi
    
    log_info "等待服务启动... ($i/30)"
    sleep 2
done

# 10. 部署后验证
log_info "部署后验证..."

# 获取健康状态
HEALTH_STATUS=$(curl -s http://localhost:3001/api/health | jq -r '.status' 2>/dev/null || echo "unknown")
log_info "应用健康状态: $HEALTH_STATUS"

# 获取应用版本
APP_VERSION=$(curl -s http://localhost:3001/api/status | jq -r '.version' 2>/dev/null || echo "unknown")
log_info "应用版本: $APP_VERSION"

# 11. Nginx配置 (可选)
if command -v nginx &> /dev/null; then
    log_info "配置 Nginx..."
    
    cat > "/etc/nginx/sites-available/$PROJECT_NAME" << EOF
server {
    listen 80;
    server_name _;
    
    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
    
    location /api/health {
        proxy_pass http://localhost:3001/api/health;
        access_log off;
    }
}
EOF
    
    # 启用站点
    ln -sf "/etc/nginx/sites-available/$PROJECT_NAME" "/etc/nginx/sites-enabled/$PROJECT_NAME"
    
    # 重载Nginx配置
    nginx -t && systemctl reload nginx
    log_success "Nginx 配置完成"
fi

# 12. 设置开机自启
log_info "设置开机自启..."
pm2 startup
pm2 save

# 13. 清理
log_info "清理临时文件..."
cd /tmp
rm -rf /tmp/deploy-*

# 14. 部署报告
log_success "部署完成！"
echo "=================================="
echo "部署信息:"
echo "  环境: $DEPLOY_ENV"
echo "  版本: $APP_VERSION"
echo "  健康状态: $HEALTH_STATUS"
echo "  部署时间: $(date)"
echo "  访问地址: http://$(hostname):3001"
echo "=================================="

# 15. 监控命令提示
echo ""
echo "常用监控命令:"
echo "  查看应用状态: pm2 status"
echo "  查看日志: pm2 logs $PROJECT_NAME-$DEPLOY_ENV"
echo "  重启应用: pm2 restart $PROJECT_NAME-$DEPLOY_ENV"
echo "  查看监控: pm2 monit"
echo "  健康检查: curl http://localhost:3001/api/health"

log_success "部署脚本执行完成！"