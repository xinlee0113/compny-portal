# 网站访问指南

## 网站概述

公司门户网站包含以下页面：
- 首页: http://localhost:3001
- 公司介绍: http://localhost:3001/about
- 产品展示: http://localhost:3001/products
- 新闻动态: http://localhost:3001/news
- 联系我们: http://localhost:3001/contact

## 启动网站

### 方法一：使用npm命令
```bash
npm start
```

### 方法二：直接运行服务器文件
```bash
node src/server.js
```

## 访问网站

启动服务器后，可以在浏览器中访问以下地址：

1. 首页: http://localhost:3001
2. 公司介绍: http://localhost:3001/about
3. 产品展示: http://localhost:3001/products
4. 新闻动态: http://localhost:3001/news
5. 联系我们: http://localhost:3001/contact

## 功能特点

### 响应式设计
网站采用响应式设计，可以在各种设备上正常显示：
- 桌面电脑
- 平板电脑
- 手机设备

### 页面功能

#### 首页
- 展示公司核心价值和主要业务
- 提供导航到其他页面的链接

#### 公司介绍
- 公司概况
- 发展历程
- 团队介绍

#### 产品展示
- 产品分类展示
- 产品详情查看

#### 新闻动态
- 公司新闻列表
- 新闻详情查看

#### 联系我们
- 公司联系方式
- 在线联系表单
- 表单验证功能

## 技术架构

- 后端：Node.js + Express.js
- 模板引擎：EJS
- 前端：HTML5 + CSS3 + JavaScript
- 样式框架：Bootstrap 5

## 注意事项

1. 确保Node.js环境已正确安装
2. 确保所有项目依赖已安装（运行`npm install`）
3. 确保端口3001未被其他程序占用
4. 如果遇到问题，请检查终端输出的错误信息