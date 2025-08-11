const express = require('express');
const router = express.Router();
const testimonialsController = require('../controllers/testimonialsController');

// 客户推荐主页
router.get('/', testimonialsController.index);

// 提交客户推荐
router.post('/submit', testimonialsController.submit);

// 推荐评价
router.post('/:id/rate', testimonialsController.rate);

// 获取推荐统计
router.get('/api/stats', testimonialsController.getStats);

module.exports = router;
