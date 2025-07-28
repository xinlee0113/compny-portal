# Git提交规范

## 提交信息格式

每次提交都应包含一个简洁的标题和一个详细的描述。提交信息应遵循以下格式：

```
<type>(<scope>): <subject>

<body>

<footer>
```

### 类型(Type)

必须是以下之一：

- **feat**: 新功能
- **fix**: 修复bug
- **docs**: 文档变更
- **style**: 代码格式调整（不影响代码运行的变动）
- **refactor**: 重构（即不是新增功能，也不是修改bug的代码变动）
- **test**: 增加测试
- **chore**: 构建过程或辅助工具的变动

### 范围(Scope)

范围可以是任何内容，例如：`server`、`client`、`database`、`api`等。

### 主题(Subject)

主题包含对变更的简洁描述：

- 使用现在时态，例如："change"而不是"changed"
- 首字母不要大写
- 末尾不要加句号

### 正文(Body)

正文应包含变更的详细描述：

- 使用现在时态，例如："change"而不是"changed"
- 应该说明变更的动机以及与之前行为的对比

### 页脚(Footer)

页脚应包含以下信息：

- **Breaking Changes**: 以`BREAKING CHANGE:`开头
- **关联的Issues**: 例如`Closes #123, #456`

## 示例

### 功能提交示例

```
feat(api): add user authentication endpoint

Implement JWT-based authentication for user login and registration.
The endpoint returns a token that can be used for subsequent requests.

- Add /api/auth/login endpoint
- Add /api/auth/register endpoint
- Implement JWT token generation
- Add authentication middleware

Closes #123
```

### 修复提交示例

```
fix(client): resolve navigation issue on mobile devices

Fix the issue where navigation menu was not closing properly on mobile
after selecting an item. The event listener was not properly attached
to the menu items.

- Add proper event delegation for menu items
- Fix CSS z-index issue
- Improve touch event handling

Fixes #456
```

### 文档提交示例

```
docs(readme): update deployment instructions

Add detailed instructions for Docker deployment and environment
configuration. Include examples for common deployment scenarios.

- Add Docker deployment section
- Update environment variables documentation
- Add troubleshooting section

Closes #789
```

## 提交流程

1. 确保代码已通过所有测试
2. 运行代码格式化工具（如适用）
3. 编写符合规范的提交信息
4. 提交代码到本地仓库
5. 推送到远程仓库

## 自动化检查

项目配置了git hooks来自动检查提交信息格式。如果提交信息不符合规范，提交将被拒绝。

## 工具支持

可以使用以下命令来帮助生成符合规范的提交信息：

```bash
# 使用模板创建提交
git commit -t .gitmessage

# 使用commitizen工具
npx cz
```