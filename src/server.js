const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
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
app.use(cookieParser());

// 国际化中间件
const { i18nMiddleware } = require('./config/i18n');
const companyInfo = require('./config/company');
app.use(i18nMiddleware);

// 公司信息中间件 - 为所有模板提供公司信息
app.use((req, res, next) => {
  res.locals.company = companyInfo;
  next();
});

// 社交媒体分享中间件
const { generateShareData, socialMetaTags } = require('./middleware/social');
app.use(generateShareData);
app.use(socialMetaTags);

// 多语言支持中间件
const { detectLanguage, translate, generateLanguageUrls } = require('./middleware/multilingual');
app.use(detectLanguage);
app.use(translate);
app.use(generateLanguageUrls);

// 在线客服聊天中间件
const { initializeChatConfig } = require('./middleware/livechat');
app.use(initializeChatConfig);

// 性能监控中间件
const {
  requestPerformanceMonitor,
  errorMonitor,
  startSystemMonitoring,
} = require('./middleware/performance');
app.use(requestPerformanceMonitor);

// 启动系统监控
startSystemMonitoring();

// 路由
app.use('/', require('./routes/home'));
app.use('/auth', require('./routes/auth-pages'));
app.use('/admin', require('./routes/admin')); // 管理员路由
app.use('/api', require('./routes/api'));
app.use('/services', require('./routes/services')); // 车载应用服务路由
app.use('/tools', require('./routes/tools')); // 开发工具路由
app.use('/video-tutorials', require('./routes/video-tutorials')); // 视频教程路由
app.use('/case-studies', require('./routes/case-studies')); // 案例研究路由
app.use('/downloads', require('./routes/downloads')); // 下载中心路由
app.use('/dev-center', require('./routes/dev-center')); // 开发中心路由
app.use('/contact', require('./routes/contact')); // 联系我们路由
app.use('/blog', require('./routes/blog')); // 技术博客路由
app.use('/search', require('./routes/search')); // 全站搜索路由
app.use('/company', require('./routes/company')); // 公司页面路由
app.use('/newsletter', require('./routes/newsletter')); // Newsletter订阅路由
app.use('/feedback', require('./routes/feedback')); // 用户反馈路由
app.use('/kb', require('./routes/kb')); // 知识库路由
app.use('/testimonials', require('./routes/testimonials')); // 客户推荐路由
app.use('/portfolio', require('./routes/portfolio')); // 项目作品集路由
app.use('/examples', require('./routes/examples')); // 在线代码示例路由
app.use('/monitoring', require('./routes/monitoring')); // 性能监控路由

// SEO路由 (注册在根路径)
app.use('/', require('./routes/seo'));

// 错误处理中间件（包含性能监控）
app.use(errorMonitor);
app.use((err, req, res, next) => {
  // eslint-disable-line no-unused-vars
  console.error(err.stack);
  res.status(500).render('500', {
    title: '服务器内部错误',
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
