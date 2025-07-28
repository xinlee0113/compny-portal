// 控制器：处理主页相关请求
const path = require('path');

// 渲染主页
exports.getIndex = (req, res) => {
  res.render('home/index', {
    title: '公司首页',
    page: 'home'
  });
};

// 渲染公司介绍页面
exports.getAbout = (req, res) => {
  res.render('home/about', {
    title: '公司介绍',
    page: 'about'
  });
};

// 渲染产品展示页面
exports.getProducts = (req, res) => {
  res.render('home/products', {
    title: '产品展示',
    page: 'products'
  });
};

// 渲染新闻动态页面
exports.getNews = (req, res) => {
  res.render('home/news', {
    title: '新闻动态',
    page: 'news'
  });
};

// 渲染联系我们页面
exports.getContact = (req, res) => {
  res.render('home/contact', {
    title: '联系我们',
    page: 'contact'
  });
};