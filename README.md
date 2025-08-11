# 公司门户网站

公司门户网站项目，用于展示公司能力、产品和服务，并提供必要入口。

## 项目结构

```
company-portal/
├── docs/                 # 项目文档
│   ├── architecture/     # 架构文档
│   ├── development/      # 开发文档
│   └── deployment/       # 部署文档
├── public/               # 静态资源文件
├── src/                  # 源代码
│   ├── controllers/      # 控制器
│   ├── models/           # 数据模型
│   ├── routes/           # 路由
│   ├── views/            # 视图模板
│   └── server.js         # 应用入口
├── tests/                # 测试文件
├── .env                  # 环境变量配置
├── .gitignore            # Git忽略文件
└── package.json          # 项目配置
```

## 功能特性

- 公司介绍页面
- 产品展示页面
- 新闻动态页面
- 联系我们页面
- 响应式设计
- SEO优化

## 技术栈

- Node.js + Express.js (后端)
- EJS 模板引擎
- HTML5 + CSS3 + JavaScript (前端)
- Docker (容器化部署)

## 快速开始

### 开发环境

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

### 生产环境

```bash
# 构建项目
npm run build

# 启动生产服务器
npm start
```

## 部署与测试

### Docker 部署（推荐）

```bash
# 构建并启动容器
docker-compose up -d

# 查看容器状态
docker-compose ps

# 查看日志
docker-compose logs
```

### 直接部署

```bash
# 安装生产依赖
npm ci --only=production

# 启动应用
npm start
```

### 测试

#### 单元/集成
- 运行所有测试：`npm test`
- 生成覆盖率：`npm run test:coverage`
- CI 模式：`npm run test:ci`

#### UI 端到端（Playwright）
- 安装依赖：`npm i -D @playwright/test`
- 安装浏览器：`npx playwright install`
- 运行：`npm run test:ui`
- 查看报告：`npm run test:ui:report`

## 文档

- [架构文档](docs/architecture/README.md)
- [开发文档](docs/development/README.md)
- [部署文档](docs/deployment/README.md)