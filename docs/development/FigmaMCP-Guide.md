# Figma-MCP 集成指南

## 配置完成状态 ✅

Figma-MCP已成功配置到Cursor中。配置文件位置：`%USERPROFILE%\.cursor\mcp.json`

## 完整配置步骤

### 步骤一：启用 Figma 官方 Dev Mode MCP Server（推荐）

1. **更新 Figma 桌面应用**
   - 确保使用最新版本的 Figma 桌面应用
   - 下载地址：https://www.figma.com/downloads/

2. **在 Figma 中启用 MCP Server**
   - 打开 Figma 桌面应用
   - 菜单栏 → Preferences → Enable Dev Mode MCP Server
   - 确认服务运行在：`http://127.0.0.1:3845/sse`

3. **更新 Cursor MCP 配置**
   - 打开 `%USERPROFILE%\.cursor\mcp.json`
   - 替换为完整配置（见上方配置文件内容）

### 步骤二：验证配置

1. **重启 Cursor 和 Figma**
   - 关闭 Cursor IDE
   - 关闭 Figma 桌面应用
   - 重新打开 Figma 桌面应用
   - 重新打开 Cursor IDE

2. **验证 MCP 服务器状态**
   - Cursor中：设置 (Ctrl+,) → MCP
   - 确认所有服务器状态为绿色

### 步骤三：使用完整的 Figma-MCP 功能

#### 方法一：Agent模式
1. 按 `Ctrl+I` 打开Cursor Agent
2. 粘贴Figma设计链接，例如：
   ```
   https://www.figma.com/file/your-file-id/project-name?node-id=123%3A456
   ```
3. 输入指令，例如：
   ```
   请帮我实现这个登录页面设计，使用React和Tailwind CSS
   ```

#### 方法二：Composer模式
1. 按 `Ctrl+Shift+I` 打开Composer
2. 粘贴Figma链接
3. 描述你想要的实现

## 支持的功能

### 🎯 方案一：Figma 官方 Dev Mode MCP Server
**核心工具：**
- `get_code` - 生成 React + Tailwind 代码（可定制框架）
- `get_variable_defs` - 提取设计变量和样式token
- `get_code_connect_map` - 组件代码映射（连接设计和代码）
- `get_image` - 获取高保真设计截图

**功能特点：**
- ✅ 直接从 Figma 选择的元素生成代码
- ✅ 支持多种框架：React, Vue, iOS, Android
- ✅ 自动提取设计系统变量
- ✅ 代码组件复用和映射
- ✅ 像素级精确的视觉还原

### 🔧 方案二：第三方 Figma Developer MCP
**基础工具：**
- `get_figma_data` - 获取设计文件数据
- `download_figma_images` - 下载图片资源

**功能特点：**
- ✅ 获取完整设计文件结构
- ✅ 批量下载SVG/PNG资源
- ✅ 提取基础设计信息

### 🚀 方案三：Figma Tools MCP（Python版）
**扩展工具：**
- `get_figma_file_json` - 获取文件完整JSON
- `get_figma_screens_info` - 提取屏幕信息
- `get_figma_node_details_json` - 获取节点详情
- `get_figma_node_image_url` - 生成节点图片URL

**功能特点：**
- ✅ 更细粒度的数据提取
- ✅ 支持节点级别的操作
- ✅ 灵活的图片格式和缩放
- ✅ 异步处理性能优化

## 最佳实践

### 1. 链接使用技巧
- 链接到特定的Frame或组件，而非整个文件
- 在Figma中使用 `Cmd+L` (Mac) 或 `Ctrl+L` (Windows) 复制链接
- 右键选择"Copy Link"获取精确链接

### 2. 指令优化
- 明确指定技术栈：React、Vue、HTML+CSS等
- 描述具体需求：组件化、响应式、动画等
- 提供上下文：项目结构、已有样式等

### 3. 设计文件优化
- 使用清晰的图层命名
- 建立设计系统和组件库
- 保持设计文件结构整洁

## 完整的自动化开发工作流示例

### 🎯 使用官方 Dev Mode MCP Server

#### 示例1：组件代码生成
```bash
# 1. 在 Figma 中选择一个按钮组件
# 2. 在 Cursor 中执行：
"请基于我在 Figma 中选择的按钮组件生成 React 代码，使用我们的设计系统变量"

# MCP 会自动：
# - 调用 get_code 生成基础代码
# - 调用 get_variable_defs 获取设计变量
# - 调用 get_code_connect_map 映射现有组件
# - 生成符合项目规范的代码
```

#### 示例2：设计系统提取
```bash
# 1. 选择设计系统的主色板
# 2. 执行命令：
"请提取当前选择的颜色变量，生成 CSS 变量文件和 Tailwind 配置"

# 输出：
# - colors.css 文件
# - tailwind.config.js 更新
# - 设计token文档
```

#### 示例3：页面完整实现
```bash
# 1. 选择整个页面设计
# 2. 执行命令：
"请实现这个登录页面，使用现有的组件库，确保响应式设计"

# MCP 会：
# - 分析页面布局结构
# - 识别可复用的组件
# - 生成页面级别的 React 组件
# - 包含路由和状态管理逻辑
```

### 🔧 使用多个 MCP Server 的组合工作流

#### 工作流1：完整的设计到代码流水线
```bash
# 步骤1：使用 Figma Developer MCP 获取设计数据
"请分析这个 Figma 文件，提取所有页面和组件的结构信息"

# 步骤2：使用 Dev Mode MCP 生成核心组件
"基于提取的组件信息，为每个组件生成对应的 React 代码"

# 步骤3：使用 Figma Tools MCP 处理资源
"请下载所有设计中的图标和图片资源，并生成资源索引文件"

# 步骤4：整合和优化
"基于生成的组件和资源，创建完整的页面实现"
```

#### 工作流2：设计系统自动化
```bash
# 步骤1：设计系统分析
"分析这个 Figma 设计系统，提取所有组件、颜色、字体和间距规范"

# 步骤2：代码架构生成
"基于设计系统创建对应的代码架构：
- 组件库结构
- 样式系统
- 设计token配置"

# 步骤3：文档自动生成
"为设计系统生成 Storybook 文档和使用指南"
```

### 🚀 高级用法示例

#### 示例4：批量组件生成
```bash
"请遍历这个 Figma 文件中的所有组件，为每个组件生成：
1. React 组件代码
2. TypeScript 类型定义
3. 单元测试文件
4. Storybook stories"
```

#### 示例5：响应式设计实现
```bash
"基于这个设计的桌面和移动端版本，生成响应式的 React 组件，
使用 Tailwind CSS 的响应式断点"
```

#### 示例6：国际化支持
```bash
"提取设计中的所有文本内容，生成国际化配置文件，
并更新组件代码以支持多语言"
```

## 故障排除

### MCP服务器未启动
1. 检查网络连接
2. 确认Figma API token有效
3. 重启Cursor
4. 查看Cursor开发者工具中的错误信息

### 生成代码不准确
1. 确保Figma设计结构清晰
2. 提供更详细的实现要求
3. 分步骤处理复杂设计

### API访问问题
1. 检查Figma token权限
2. 确认文件共享设置
3. 验证文件链接格式

## 配置文件内容

### 方案一：Figma 官方 Dev Mode MCP Server（推荐）
需要先在 Figma 桌面应用中启用：
```json
{
  "mcpServers": {
    "Figma Dev Mode MCP": {
      "url": "http://127.0.0.1:3845/sse"
    }
  }
}
```

### 方案二：第三方 Figma Developer MCP（当前配置）
```json
{
  "mcpServers": {
    "Figma-MCP": {
      "command": "npx",
      "args": ["-y", "figma-developer-mcp", "--figma-api-key=${FIGMA_API_TOKEN}", "--stdio"],
      "env": { "FIGMA_API_TOKEN": "<your-figma-token-here>" }
    }
  }
}
```

### 方案三：混合配置（功能最全）
```json
{
  "mcpServers": {
    "Figma Dev Mode MCP": {
      "url": "http://127.0.0.1:3845/sse"
    },
    "Figma Developer MCP": {
      "command": "npx",
      "args": ["-y", "figma-developer-mcp", "--figma-api-key=${FIGMA_API_TOKEN}", "--stdio"],
      "env": { "FIGMA_API_TOKEN": "<your-figma-token-here>" }
    },
    "Figma Tools MCP": {
      "command": "python",
      "args": ["-m", "pip", "install", "mcp-figma-tools", "&&", "mcp-figma-tools"],
      "env": {"FIGMA_API_TOKEN": "<your-figma-token-here>"}
    }
  }
}
```

## 支持资源

- [Figma API文档](https://www.figma.com/developers/api)
- [MCP协议文档](https://spec.modelcontextprotocol.io/)
- [Cursor MCP指南](https://docs.cursor.com/features/mcp)

## 💡 总结：完整的 UE/UI 自动化开发能力

通过配置完整的 Figma MCP 工具集，你将拥有：

### ✅ 设计分析能力
- 自动提取设计系统（颜色、字体、间距）
- 分析组件结构和层级关系
- 获取设计文件的完整元数据

### ✅ 代码生成能力
- 从设计直接生成多框架代码（React、Vue、iOS、Android）
- 自动应用设计系统变量和组件映射
- 生成像素级精确的布局和样式

### ✅ 资源管理能力
- 批量下载和优化图片、图标资源
- 自动生成资源索引和引用文件
- 支持多种格式和缩放比例

### ✅ 工作流集成能力
- 与现有代码库无缝集成
- 支持设计系统和组件库复用
- 自动生成测试、文档和类型定义

### 🚀 下一步行动计划

1. **立即升级配置**
   - 启用 Figma 官方 Dev Mode MCP Server
   - 配置多个 MCP Server 获得完整功能

2. **建立标准化工作流**
   - 制定设计文件规范
   - 建立代码生成模板
   - 配置自动化脚本

3. **团队协作优化**
   - 培训团队使用新工具
   - 建立设计-开发协作流程
   - 持续优化和改进

---

**更新日期**: 2025-08-01  
**配置状态**: 🔄 需要升级到完整版本  
**推荐行动**: 立即配置 Figma 官方 Dev Mode MCP Server