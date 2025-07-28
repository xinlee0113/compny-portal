const express = require('express');
const path = require('path');
const security = require('./middleware/security');
const monitor = require('./utils/monitor');
const dotenv = require('dotenv');

// 加载环境变量
dotenv.config();

// 创建Express应用
const app = express();

// 安全中间件
app.use(security.helmet);
app.use(security.cors);
app.use(security.sanitizeInput);
app.use(security.securityHeaders);
app.use(security.requestLogger);

// 速率限制中间件
app.use('/api', security.apiRateLimit);

// 监控中间件
app.use(monitor.requestMiddleware());

// 设置视图引擎
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// 静态文件中间件
app.use(express.static(path.join(__dirname, '../public')));

// 解析请求体中间件
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// 路由
app.use('/', require('./routes/home'));
app.use('/api', require('./routes/api'));

// 错误处理中间件
app.use((err, req, res, next) => { // eslint-disable-line no-unused-vars
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
  console.log(`API文档: http://localhost:${PORT}/api/docs`);
  console.log(`API状态: http://localhost:${PORT}/api/status`);
  console.log(`系统监控: http://localhost:${PORT}/api/health`);
  
  // 启动监控系统
  monitor.startPeriodicMonitoring();
  console.log('📊 监控系统已启动');
});

module.exports = app;