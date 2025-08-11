const express = require('express');
const router = express.Router();
const homeController = require('../controllers/homeController');
const productController = require('../controllers/productController');
const { validateContactForm } = require('../middleware/validation');
const security = require('../middleware/security');

// 首页路由
router.get('/', homeController.getIndex);
router.get('/about', homeController.getAbout);
router.get('/products', productController.renderProductsPage);
router.get('/news', homeController.getNews);
router.get('/contact', homeController.getContact);
// API文档静态页路由（与 /api/docs JSON 接口并存）
router.get('/api-docs', (req, res) => res.render('api-docs'));

// 处理联系表单提交 (带速率限制)
router.post('/contact', security.contactRateLimit, validateContactForm, homeController.postContact);

module.exports = router;
