## 监控与告警环境变量

为方便不同环境配置性能监控与告警，新增以下环境变量（可写入 `config/env.local` 或部署环境的变量管理）：

- PERF_MEMORY_THRESHOLD: 内存使用率阈值（百分比，默认 95）
- PERF_CPU_THRESHOLD: CPU 使用率阈值（百分比，默认 80）
- PERF_DISK_THRESHOLD: 磁盘使用率阈值（百分比，默认 85）
- ALERT_RECIPIENTS: 告警收件人，逗号分隔邮箱列表，如 `ops@example.com,admin@example.com`
- ALERT_CHANNELS: 告警通道，逗号分隔，可选 `email,sms,slack`（默认三者）
- ALERT_DEBOUNCE_MS: 关键告警去抖间隔（毫秒，默认 30000）

示例（Windows PowerShell 临时设置）：

```powershell
$env:PERF_MEMORY_THRESHOLD="95"; $env:PERF_CPU_THRESHOLD="80"; $env:PERF_DISK_THRESHOLD="85"; $env:ALERT_RECIPIENTS="ops@example.com,admin@example.com"; $env:ALERT_CHANNELS="email,slack"; $env:ALERT_DEBOUNCE_MS="30000"
```

示例（.env 文件）：

```
PERF_MEMORY_THRESHOLD=95
PERF_CPU_THRESHOLD=80
PERF_DISK_THRESHOLD=85
ALERT_RECIPIENTS=ops@example.com,admin@example.com
ALERT_CHANNELS=email,slack
ALERT_DEBOUNCE_MS=30000
```
# 开发环境配置指南

## 概述

本文档详细说明了如何配置公司门户网站项目的开发环境，包括必需工具的安装和配置步骤。

## 系统要求

### 操作系统
- Windows 10/11 (64位)
- macOS 10.15或更高版本
- Linux (Ubuntu 20.04+/CentOS 8+/Fedora 34+)

### 硬件要求
- 至少4GB RAM（推荐8GB或更高）
- 至少10GB可用磁盘空间
- 支持64位的处理器

## 必需工具安装

### 1. Node.js 和 npm

项目需要 Node.js v14.x 或更高版本。

#### Windows/macOS 安装方式：

1. 访问 [Node.js官网](https://nodejs.org/)
2. 下载并安装LTS版本
3. 验证安装：
   ```bash
   node --version
   npm --version
   ```

#### Linux (Ubuntu/Debian) 安装方式：

```bash
# 使用NodeSource仓库安装
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt-get install -y nodejs
```

#### Linux (CentOS/RHEL/Fedora) 安装方式：

```bash
# 使用NodeSource仓库安装
curl -fsSL https://rpm.nodesource.com/setup_lts.x | sudo bash -
sudo dnf install -y nodejs npm
```

### 2. Docker 和 docker-compose

Docker用于容器化部署和开发环境的一致性。

#### Windows/macOS 安装方式：

1. 下载并安装 [Docker Desktop](https://www.docker.com/products/docker-desktop)
2. 启动Docker Desktop
3. 验证安装：
   ```bash
   docker --version
   docker-compose --version
   ```

#### Linux 安装方式：

```bash
# 安装Docker
sudo apt update
sudo apt install docker.io

# 启动Docker服务
sudo systemctl start docker
sudo systemctl enable docker

# 将当前用户添加到docker组
sudo usermod -aG docker $USER

# 安装docker-compose
sudo apt install docker-compose

# 验证安装
docker --version
docker-compose --version
```

## 项目初始化

### 1. 克隆项目代码

```bash
git clone <项目仓库地址>
cd company-portal
```

### 2. 安装项目依赖

```bash
npm install
```

### 3. 环境变量配置

复制 [.env.example](file://E:\01_lixin_work_space\01_code\company-portal\.env.example) 文件并重命名为 [.env](file://E:\01_lixin_work_space\01_code\company-portal\.env)，然后根据需要修改配置：

```bash
cp .env.example .env
```

### 4. 启动开发服务器

```bash
# 开发模式（带热重载）
npm run dev

# 生产模式
npm start
```

## 可选工具安装

### 1. VS Code 及推荐插件

推荐使用 VS Code 作为代码编辑器，并安装以下插件：
- ESLint - JavaScript代码检查
- Prettier - 代码格式化
- GitLens - Git增强工具
- Docker - Docker文件支持
- JavaScript (ES6) code snippets - JavaScript代码片段

### 2. nodemon 全局安装

虽然项目中已包含本地的nodemon，但也可以全局安装以便在其他项目中使用：

```bash
npm install -g nodemon
```

## Docker环境配置

项目支持通过Docker进行容器化部署。

### 1. 构建和启动容器

```bash
# 构建并启动所有服务
docker-compose up -d

# 查看服务状态
docker-compose ps

# 查看日志
docker-compose logs
```

### 2. 停止和清理容器

```bash
# 停止所有服务
docker-compose down

# 停止并删除所有数据卷
docker-compose down -v
```

## 测试环境配置

### 运行测试

```bash
# 运行所有测试
npm test

# 运行测试并生成覆盖率报告
npm run test:coverage

# 监听模式运行测试（开发时使用）
npm run test:watch
```

### 代码检查

```bash
# 运行代码检查
npm run lint

# 自动修复代码格式问题
npm run lint:fix
```

## 常见问题解决

### 1. 权限问题（Linux/macOS）

如果遇到权限问题，可能需要修复npm目录权限：

```bash
sudo chown -R $(whoami) ~/.npm
```

### 2. 端口占用

如果3000端口被占用，可以在 [.env](file://E:\01_lixin_work_space\01_code\company-portal\.env) 文件中修改PORT变量：

```env
PORT=3001
```

### 3. Docker权限问题（Linux）

如果遇到Docker权限问题，确保用户已添加到docker组并重新登录：

```bash
sudo usermod -aG docker $USER
```

## 验证环境配置

完成所有配置后，运行以下命令验证环境是否正确设置：

```bash
# 检查Node.js和npm版本
node --version
npm --version

# 检查Docker和docker-compose版本
docker --version
docker-compose --version

# 安装项目依赖
npm install

# 运行测试
npm test

# 启动开发服务器
npm run dev
```

如果所有命令都能正常执行，说明环境配置成功。

## 下一步

环境配置完成后，可以开始进行开发工作：

1. 查看[开发流程提示词](../prompt/DevelopmentWorkflowPrompt.md)
2. 参考[项目实施检查表](../deployment/ImplementationChecklist.md)
3. 查看[工作汇报](WorkReport.md)了解当前进度