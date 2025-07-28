const express = require('express');
const router = express.Router();
const homeController = require('../controllers/homeController');

// 主页路由
router.get('/', homeController.getIndex);

// 公司介绍页面路由
router.get('/about', homeController.getAbout);

// 产品展示页面路由
router.get('/products', homeController.getProducts);

// 新闻动态页面路由
router.get('/news', homeController.getNews);

// 联系我们页面路由
router.get('/contact', homeController.getContact);

module.exports = router;