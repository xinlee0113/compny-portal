# 数据库环境配置指南

本指南提供多种方式在Windows环境下配置PostgreSQL和Redis数据库。

---

## 🐳 选项1: Docker配置（推荐）

### 前提条件
- ✅ Docker Desktop已安装
- ✅ Docker Desktop正在运行

### 快速启动
```bash
# 启动数据库服务
docker-compose up -d postgres redis

# 检查服务状态
docker-compose ps

# 查看日志
docker-compose logs postgres redis
```

### 数据库连接信息
```
PostgreSQL:
- Host: localhost
- Port: 5432
- Database: company_portal
- Username: postgres
- Password: company_portal_2025

Redis:
- Host: localhost
- Port: 6379
- Password: company_portal_2025
```

---

## 💻 选项2: 本地安装

### PostgreSQL 安装

#### 方法1: 官方安装包
1. 下载PostgreSQL 15: https://www.postgresql.org/download/windows/
2. 运行安装程序
3. 设置密码: `company_portal_2025`
4. 保持默认端口: `5432`

#### 方法2: Chocolatey
```powershell
# 安装Chocolatey (如果未安装)
Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))

# 安装PostgreSQL
choco install postgresql15 -y
```

#### 数据库初始化
```bash
# 创建数据库
createdb -U postgres company_portal

# 运行初始化脚本
psql -U postgres -d company_portal -f scripts/init-db.sql
```

### Redis 安装

#### 方法1: 官方Windows版本
1. 下载Redis for Windows: https://github.com/microsoftarchive/redis/releases
2. 解压到 `C:\Redis`
3. 修改配置文件 `redis.windows.conf`:
   ```
   requirepass company_portal_2025
   ```

#### 方法2: Chocolatey
```powershell
# 安装Redis
choco install redis-64 -y
```

#### 启动Redis服务
```bash
# 方法1: 命令行启动
cd C:\Redis
redis-server.exe redis.windows.conf

# 方法2: 安装为Windows服务
redis-server.exe --service-install redis.windows.conf
redis-server.exe --service-start
```

---

## 🌥️ 选项3: 云数据库（生产环境）

### PostgreSQL云服务
- **Azure Database for PostgreSQL**
- **AWS RDS PostgreSQL**
- **Google Cloud SQL PostgreSQL**
- **ElephantSQL** (免费层可用)

### Redis云服务
- **Azure Cache for Redis**
- **AWS ElastiCache**
- **Redis Cloud**
- **Upstash** (免费层可用)

---

## ⚙️ 环境变量配置

### 创建.env文件
```bash
# 复制配置模板
cp config/env.example .env

# 根据您的安装方式编辑.env文件
```

### 本地安装配置
```env
# PostgreSQL
DB_HOST=localhost
DB_PORT=5432
DB_NAME=company_portal
DB_USER=postgres
DB_PASSWORD=company_portal_2025
DB_SSL=false

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=company_portal_2025
REDIS_DB=0
```

### Docker配置（默认）
```env
# 使用Docker Compose中定义的服务名
DB_HOST=postgres  # 容器内使用
REDIS_HOST=redis  # 容器内使用

# 本地开发使用localhost
DB_HOST=localhost
REDIS_HOST=localhost
```

---

## 🧪 连接测试

### 测试数据库连接
```bash
# 使用npm脚本测试
npm run db:test

# 手动测试PostgreSQL连接
psql -h localhost -p 5432 -U postgres -d company_portal

# 手动测试Redis连接
redis-cli -h localhost -p 6379 -a company_portal_2025
```

### 初始化数据库
```bash
# 执行数据库迁移和种子数据
npm run db:init

# 重置数据库（谨慎使用）
npm run db:reset

# 查看数据库统计
npm run db:stats
```

---

## 🔧 故障排除

### 常见问题

#### PostgreSQL连接失败
```bash
# 检查服务状态
net start postgresql-x64-15

# 重启服务
net stop postgresql-x64-15
net start postgresql-x64-15

# 检查防火墙设置
netsh advfirewall firewall add rule name="PostgreSQL" dir=in action=allow protocol=TCP localport=5432
```

#### Redis连接失败
```bash
# 检查Redis进程
tasklist | findstr redis

# 重启Redis服务
net stop Redis
net start Redis

# 检查配置文件路径
```

#### Docker问题
```bash
# 重启Docker Desktop
# 通过系统托盘图标或开始菜单

# 检查Docker状态
docker version
docker-compose version

# 清理Docker缓存
docker system prune -f
```

---

## 📊 性能优化

### PostgreSQL优化
```sql
-- 查看数据库大小
SELECT pg_database_size('company_portal') / 1024 / 1024 AS size_mb;

-- 创建索引
CREATE INDEX CONCURRENTLY idx_users_email ON users(email);
CREATE INDEX CONCURRENTLY idx_products_search ON products USING gin(to_tsvector('chinese', name || ' ' || description));
```

### Redis优化
```bash
# 查看内存使用
redis-cli info memory

# 设置内存限制
redis-cli config set maxmemory 256mb
redis-cli config set maxmemory-policy allkeys-lru
```

---

## 🔐 安全配置

### PostgreSQL安全
```sql
-- 创建应用专用用户
CREATE USER company_portal_app WITH PASSWORD 'strong_password_2025';
GRANT CONNECT ON DATABASE company_portal TO company_portal_app;
GRANT USAGE ON SCHEMA public TO company_portal_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO company_portal_app;
```

### Redis安全
```bash
# 在redis.conf中配置
requirepass your_strong_password
bind 127.0.0.1
protected-mode yes
```

---

## 📋 备份策略

### PostgreSQL备份
```bash
# 数据库备份
pg_dump -U postgres -h localhost company_portal > backup_$(date +%Y%m%d).sql

# 恢复备份
psql -U postgres -h localhost company_portal < backup_20250729.sql
```

### Redis备份
```bash
# 手动备份
redis-cli save
copy "C:\Redis\dump.rdb" "backup\dump_$(Get-Date -Format 'yyyyMMdd').rdb"

# 自动备份（在redis.conf中配置）
save 900 1
save 300 10
save 60 10000
```

---

选择适合您环境的安装方式，然后返回主项目继续开发！