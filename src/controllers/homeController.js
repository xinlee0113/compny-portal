// 控制器：处理主页相关请求
// const path = require('path'); // 暂时不需要

// 渲染主页
exports.getIndex = (req, res) => {
  res.render('home/index', {
    title: '公司首页',
    page: 'home',
  });
};

// 渲染公司介绍页面
exports.getAbout = (req, res) => {
  res.render('home/about', {
    title: '公司介绍',
    page: 'about',
  });
};

// 注意：产品展示页面现在由 productController.renderProductsPage 处理

// 渲染新闻动态页面
exports.getNews = (req, res) => {
  res.render('home/news', {
    title: '新闻动态',
    page: 'news',
  });
};

// 渲染联系我们页面
exports.getContact = (req, res) => {
  res.render('home/contact', {
    title: '联系我们',
    page: 'contact',
  });
};

// 处理联系表单提交
exports.postContact = (req, res) => {
  // 这里应该处理表单数据，例如保存到数据库或发送邮件
  // 目前我们只是模拟处理并返回成功响应

  const { name, email, phone, message } = req.body;

  // 模拟处理过程（实际项目中应该保存到数据库或发送邮件）
  console.log('收到联系表单:', { name, email, phone, message });

  // 返回成功响应
  res.json({
    success: true,
    message: '您的消息已成功发送，我们会尽快与您联系。',
  });
};

// 404错误页面控制器
exports.get404 = (req, res) => {
  res.status(404).render('404', {
    title: '页面未找到',
    page: '404',
  });
};

// 500错误页面控制器
exports.get500 = (req, res) => {
  res.status(500).render('500', {
    title: '服务器内部错误',
    page: '500',
  });
};
