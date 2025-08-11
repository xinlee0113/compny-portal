const express = require('express');
const router = express.Router();
const newsletterController = require('../controllers/newsletterController');

// Newsletter订阅页面
router.get('/', newsletterController.index);

// 处理订阅请求
router.post('/subscribe', newsletterController.subscribe);

// 取消订阅
router.get('/unsubscribe/:token', newsletterController.unsubscribe);

// 确认订阅
router.get('/confirm/:token', newsletterController.confirm);

// Newsletter管理API
router.get('/api/stats', newsletterController.getStats);

module.exports = router;
