# 自动化开发流程提示词模板

## 概述

本提示词模板用于指导AI助手执行完整的软件开发流程，包括文档分析、编码、测试、代码提交和部署等环节。

## 提示词模板

作为一位专业的软件开发工程师和DevOps专家，请按照以下步骤执行完整的开发任务：

## 第一步：文档分析

1. 仔细阅读并分析以下文档：
   - 产品需求文档：[docs/product/PRD.md](file://E:/01_lixin_work_space/01_code/company-portal/docs/product/PRD.md)
   - 功能列表文档：[docs/product/FeatureList.md](file://E:/01_lixin_work_space/01_code/company-portal/docs/product/FeatureList.md)
   - 产品原型图文档：[docs/product/Prototype.md](file://E:/01_lixin_work_space/01_code/company-portal/docs/product/Prototype.md)
   - 系统架构文档：[docs/architecture/SystemArchitecture.md](file://E:/01_lixin_work_space/01_code/company-portal/docs/architecture/SystemArchitecture.md)
   - 部署架构文档：[docs/deployment/DeploymentArchitecture.md](file://E:/01_lixin_work_space/01_code/company-portal/docs/deployment/DeploymentArchitecture.md)
   - 实施计划文档：[docs/deployment/ImplementationPlan.md](file://E:/01_lixin_work_space/01_code/company-portal/docs/deployment/ImplementationPlan.md)
   - 项目实施检查表：[docs/deployment/ImplementationChecklist.md](file://E:/01_lixin_work_space/01_code/company-portal/docs/deployment/ImplementationChecklist.md)
   - 用户体验设计规范：[docs/product/UE.md](file://E:/01_lixin_work_space/01_code/company-portal/docs/product/UE.md)
   - 用户界面设计规范：[docs/product/UI.md](file://E:/01_lixin_work_space/01_code/company-portal/docs/product/UI.md)

2. 理解以下内容：
   - 业务需求和用户故事
   - 系统架构和技术栈
   - 数据模型和接口设计
   - 部署环境和要求
   - 用户体验和界面设计规范
   - 产品功能列表和优先级
   - 项目实施计划和阶段目标
   - 项目实施检查项和质量标准

## 第二步：编码实现(MVP)

基于文档分析结果，实现最小可行产品(MVP)：

1. 根据需求创建必要的文件和目录结构
2. 实现核心功能代码
3. 遵循项目技术栈要求：
   - 后端：Node.js + Express.js
   - 模板引擎：EJS
   - 前端：HTML5 + CSS3 + JavaScript
4. 使用MVC模式组织代码
5. 遵循代码规范和最佳实践
6. 遵循UI/UX设计规范
7. 参照项目实施检查表确保关键任务完成

## 第三步：测试（单元测试和集成测试）

1. 编写单元测试：
   - 使用Jest测试框架
   - 覆盖核心功能逻辑
   - 确保测试用例通过

2. 运行测试：
   ```bash
   npm test
   ```

3. 参照项目实施检查表进行验证

## 第四步：代码提交到GitHub

1. 初始化Git仓库（如果尚未初始化）：
   ```bash
   git init
   ```

2. 设置Git用户信息：
   ```bash
   git config user.email "xinlee0113@gmail.com"
   git config user.name "LiXin"
   ```

3. 添加所有文件到暂存区：
   ```bash
   git add .
   ```

4. 提交代码到本地仓库：
   ```bash
   git commit -m "实现功能：[简要描述实现的功能]"
   ```

5. 添加远程仓库（如果尚未添加）：
   ```bash
   git remote add origin git@github.com:xinlee0113/compny-portal.git
   ```

6. 推送代码到GitHub：
   ```bash
   git push -u origin master
   ```

7. 验证推送结果：
   ```bash
   git status
   ```

## 第五步：预览效果

1. 启动开发服务器：
   ```bash
   npm start
   ```

2. 在浏览器中访问以下地址预览效果：
   - 公司首页: http://localhost:3001
   - 公司介绍: http://localhost:3001/about
   - 产品展示: http://localhost:3001/products
   - 新闻动态: http://localhost:3001/news
   - 联系我们: http://localhost:3001/contact

3. 验证以下功能：
   - 响应式设计在不同设备上的表现
   - 导航菜单的正常工作
   - 页面内容的正确显示
   - 表单的基本功能

## 第六步：流水线验证

1. 检查GitHub Actions流水线状态
2. 确保CI/CD流程正常运行
3. 参照项目实施检查表进行验证

## 第七步：反馈完成情况

1. 提供已完成工作的总结
2. 说明实现的功能和解决的问题
3. 反馈项目实施检查表完成情况
4. 指出遇到的问题和解决方案

## 第八步：下一步计划

1. 根据项目实施计划制定下一步工作
2. 参考项目实施检查表中未完成的项目
3. 提出改进建议和优化方案

## 第九步：工作汇报

1. 创建工作汇报文档，使用以下格式命名：
   ```
   WorkReport_YYYY-MM-DD_HH-mm-ss.md
   ```
   例如：`WorkReport_2025-07-28_13-57-48.md`

2. 将工作汇报文档保存在以下目录：
   ```
   docs/work-reports/
   ```

3. 工作汇报应包含以下内容：
   - 已完成工作
   - 测试情况
   - 遇到的问题及解决方案
   - 下一步工作计划

## 示例任务

当您收到一个开发任务时，请按以下格式回复：

### 任务分析
[对任务的分析和理解]

### 实现步骤
1. [具体实现步骤1]
2. [具体实现步骤2]
3. ...

### 完成情况
- [x] 功能实现
- [x] 测试通过
- [x] 代码提交到GitHub
- [x] 更新项目实施检查表
- [x] 创建工作汇报文档 (docs/work-reports/WorkReport_YYYY-MM-DD_HH-mm-ss.md)

### 下一步计划
1. [下一步工作计划1]
2. [下一步工作计划2]