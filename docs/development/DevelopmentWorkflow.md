# 开发流程说明

## 概述

本文档定义公司门户项目的标准开发流程，覆盖从“需求→实现→测试→提交→发布→复盘”的全周期，并对文档管理、质量门禁和安全（含 Push Protection）进行统一规范。

## 开发工作流（与项目要求对齐）

1. 功能清单 → 工作拆解（WBS） → 技术方案（含选型与边界）
2. 实施计划/跟踪（里程碑/看板/负责人/验收标准）
3. MVP 开发（最小可行版本）
4. 测试通过（包含功能与非功能：性能/安全/兼容）
5. 生成报告（测试报告、质量报告、工作汇报）
6. 规范符合性检查（代码/接口/安全/可观测性）
7. 文档管理整洁规范（所有文档统一在 `docs/`，版本化与唯一性）
8. 工程结构整洁，去掉冗余内容
9. 合入代码并更新状态，输出下一步工作建议

## 开发前准备

- Node.js 环境与锁定依赖：优先使用 `npm ci` 安装依赖，确保锁定版本可复现
- 统一格式与换行：仓库已配置 `.prettierrc.json`、`.editorconfig`、`.gitattributes`（统一为 LF）
- 文本与多语言：避免在模板硬编码文案，集中在 `src/config/i18n.js` 维护

## 文档分析

开始实现前，仔细阅读并确认：

- `docs/product/PRD.md` 产品需求文档
- `docs/architecture/SystemArchitecture.md` 系统架构
- `docs/deployment/DeploymentArchitecture.md` 部署架构
- `docs/product/UE.md` 用户体验规范、`docs/product/UI.md` 界面规范
- 功能清单与优先级、实施计划与检查表

## 编码实现（MVP）

遵循 MVC 结构与现有技术栈（Node.js + Express + EJS），实现核心路径：

1. 建立目录与骨架，严格遵循代码规范与命名规则
2. 统一配置/常量/文案来源，禁止散落硬编码
3. 引入必要的可观测性（`src/utils/monitor.js`）与安全中间件

## 测试策略

1. 单元测试（Jest）
   - 覆盖核心业务逻辑；建议覆盖率阈值≥80%
2. 集成测试
   - API、数据库、视图渲染
3. 非功能测试
   - 性能基准（`tests/performance/benchmark.test.js`）
   - 安全与限流（中间件维度）
4. 常用命令

```bash
# 运行所有测试
npm test

# CI覆盖率模式
npm run test:ci

# 生成覆盖率报告
npm run test:coverage

# 监听模式
npm run test:watch
```

## 代码质量与格式

优先执行自动修复，再做检查：

```bash
npm run lint:fix
npm run lint
```

Husky 钩子（已配置）：
- pre-commit：先 `lint:fix` 再 `lint`，然后跑 `test:ci`
- pre-push：`npm run quality-check`（风格、测试与安全检查）

## 提交与消息规范

遵循 Angular Commit Message 规范，参考：[Git提交规范](GitCommitGuidelines.md)

```
<type>(<scope>): <subject>

<body>

<footer>
```

示例：

```bash
git add .
git commit -m "feat(api): add search endpoint with validation"
# 或使用模板
git commit -t .gitmessage
```

## 推送与安全门禁（Push Protection）

GitHub 会阻止包含密钥/Token 的推送。处理流程：

1. 识别位置：根据 GitHub 返回的路径/提交号定位泄露位置（含历史提交）
2. 清理内容：将文档中的真实 Token 改为环境变量占位（如 `${FIGMA_API_TOKEN}`），并在示例中说明从环境加载
3. 清理历史：
   - 若刚产生：`git commit --amend` 覆盖本地提交
   - 若已多次提交：`git reset --soft origin/master`，保留改动为未提交，重新生成“干净提交”
4. 以 `--force-with-lease` 推送（防误覆盖）

严禁将密钥写入仓库；示例/模板一律使用占位符，真实值通过 CI/CD 或本地环境变量注入。

## CI/CD 与发布

- 每次推送触发：依赖安装 → Lint → Test → Build →（可选）Docker 镜像
- 质量检查脚本：`npm run quality-check` 会输出报告至 `reports/`
- Actions 页面可查看执行状态与日志

## 报告与文档管理

- 测试报告：`docs/test-report/` 使用模板 `template_test_report.md` 衍生版本化报告
- 工作汇报：`docs/work-reports/WorkReport_YYYY-MM-DD_HH-mm-ss.md`
- 所有文档统一位于 `docs/`，保持“唯一同质文档”，避免重复与过时

## 常见问题（FAQ）

1) 提交被拒（格式）
- 检查提交信息是否符合[Git提交规范](GitCommitGuidelines.md)；使用模板或 `commitizen`

2) 测试失败
- 使用 `npm run test:watch` 定位并修复；严禁为“测试通过”而降低测试质量

3) Lint 失败
- 先 `npm run lint:fix` 再 `npm run lint`；必要时按规则修正缩进、引号、换行

4) Push Protection 拦截
- 按“推送与安全门禁”一节清理内容与历史；确保示例改为占位符

## 附录

- 主要脚本：`package.json` → `lint/lint:fix/test/test:ci/quality-check`
- 主要中间件：`src/middleware/`（安全、性能、国际化、限流）
- 文案/i18n：`src/config/i18n.js`（集中管理）