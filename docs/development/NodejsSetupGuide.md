# Node.js 环境配置指南

## 问题描述

在尝试运行 `npm start` 命令时，出现以下错误：
```
bash: npm: command not found
```

这表示系统中未安装 Node.js 或者环境变量未正确配置。

## 解决方案

### 方法一：使用项目中的安装包安装（推荐）

项目目录中已包含 Node.js 安装文件 [nodejs.msi](file://E:\01_lixin_work_space\01_code\company-portal\nodejs.msi)，可以直接使用：

1. 双击运行项目目录中的 [nodejs.msi](file://E:\01_lixin_work_space\01_code\company-portal\nodejs.msi) 文件
2. 按照安装向导完成安装（默认会安装到 `C:\Program Files\nodejs\`）
3. 安装完成后，重启 Git Bash 终端
4. 验证安装：
   ```bash
   node --version
   npm --version
   ```

### 方法二：使用 Windows 安装包安装

1. 访问 Node.js 官方网站：https://nodejs.org/
2. 下载 LTS 版本的 Windows 安装包（.msi 文件）
3. 运行安装包并按照提示完成安装
4. 重新启动 Git Bash 终端
5. 验证安装：
   ```bash
   node --version
   npm --version
   ```

### 方法三：使用 winget 安装（Windows 10/11）

如果您使用的是 Windows 10 或 Windows 11，可以使用内置的包管理器 winget：

1. 打开 PowerShell（以管理员身份运行）
2. 执行以下命令安装 Node.js：
   ```powershell
   winget install OpenJS.NodeJS
   ```
3. 重新启动 Git Bash 终端
4. 验证安装：
   ```bash
   node --version
   npm --version
   ```

### 方法四：使用 Chocolatey 安装

如果您已安装 Chocolatey 包管理器：

1. 打开 PowerShell（以管理员身份运行）
2. 执行以下命令安装 Node.js：
   ```powershell
   choco install nodejs
   ```
3. 重新启动 Git Bash 终端
4. 验证安装：
   ```bash
   node --version
   npm --version
   ```

### 方法五：使用 Conda 安装

如果您已安装 Anaconda 或 Miniconda：

1. 打开 Anaconda Prompt 或终端
2. 执行以下命令安装 Node.js：
   ```bash
   conda install -c conda-forge nodejs
   ```
3. 验证安装：
   ```bash
   node --version
   npm --version
   ```

## 环境变量配置

安装完成后，通常会自动配置环境变量。如果没有，请手动添加：

1. 找到 Node.js 安装目录（通常在 `C:\Program Files\nodejs\`）
2. 将该路径添加到系统环境变量 PATH 中：
   - 右键"此电脑" -> "属性"
   - 点击"高级系统设置"
   - 点击"环境变量"
   - 在"系统变量"中找到"Path"并编辑
   - 添加 Node.js 安装路径

## 验证安装

安装完成后，在 Git Bash 中执行以下命令验证：

```bash
node --version
npm --version
```

应该能看到类似以下的输出：
```
v18.17.0
9.6.7
```

## 安装项目依赖

环境配置完成后，进入项目目录并安装依赖：

```bash
cd /e/01_lixin_work_space/01_code/company-portal
npm install
```

## 启动项目

安装依赖后，可以使用以下命令启动项目：

```bash
npm start
```

或者直接运行：

```bash
node src/server.js
```

## 常见问题

### 1. 仍然提示 command not found

- 确保重新启动了终端
- 检查环境变量是否正确配置
- 尝试注销并重新登录 Windows

### 2. 权限问题

在 Windows 上，可能需要以管理员身份运行终端来安装某些全局包。

### 3. 版本冲突

如果之前通过其他方式安装过 Node.js，可能会出现版本冲突。建议卸载旧版本后再重新安装。

## 参考资料

- Node.js 官方网站：https://nodejs.org/
- npm 官方文档：https://docs.npmjs.com/