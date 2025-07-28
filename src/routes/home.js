const express = require('express');
const router = express.Router();
const homeController = require('../controllers/homeController');
const productController = require('../controllers/productController');
const { validateContactForm } = require('../middleware/validation');
const security = require('../middleware/security');

// 首页路由
router.get('/', homeController.getIndex);

// 公司介绍路由
router.get('/about', homeController.getAbout);

// 产品展示路由（更新为使用新的产品控制器）
router.get('/products', productController.renderProductsPage);

// 新闻动态路由
router.get('/news', homeController.getNews);

// 联系我们路由
router.get('/contact', homeController.getContact);

// 处理联系表单提交 (带速率限制)
router.post('/contact', security.contactRateLimit, validateContactForm, homeController.postContact);

module.exports = router;