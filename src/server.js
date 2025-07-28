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

// 设置端口
const PORT = process.env.PORT || 3001;

// 启动服务器
app.listen(PORT, () => {
  console.log(`服务器运行在端口 ${PORT}`);
  console.log(`访问地址: http://localhost:${PORT}`);
  console.log(`公司首页: http://localhost:${PORT}`);
  console.log(`公司介绍: http://localhost:${PORT}/about`);
  console.log(`产品展示: http://localhost:${PORT}/products`);
  console.log(`新闻动态: http://localhost:${PORT}/news`);
  console.log(`联系我们: http://localhost:${PORT}/contact`);
});

module.exports = app;