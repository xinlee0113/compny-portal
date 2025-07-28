const express = require('express');
const path = require('path');
const helmet = require('helmet');
const cors = require('cors');
const dotenv = require('dotenv');

// 加载环境变量
dotenv.config();

// 创建Express应用
const app = express();

// 安全中间件
app.use(helmet());
app.use(cors());

// 设置视图引擎
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// 静态文件中间件
app.use(express.static(path.join(__dirname, '../public')));

// 解析请求体
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// 路由
const homeRoutes = require('./routes/home');
app.use('/', homeRoutes);

// 404错误处理
app.use((req, res, next) => {
  res.status(404).render('404', {
    title: '页面未找到'
  });
});

// 全局错误处理
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render('500', {
    title: '服务器内部错误'
  });
});

// 启动服务器
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`服务器运行在端口 ${PORT}`);
});

module.exports = app;