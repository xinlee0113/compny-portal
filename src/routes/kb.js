const express = require('express');
const router = express.Router();
const kbController = require('../controllers/kbController');

// 知识库主页
router.get('/', kbController.index);

// FAQ页面
router.get('/faq', kbController.faq);

// 知识库分类页面
router.get('/category/:category', kbController.category);

// 知识库文章详情
router.get('/article/:id', kbController.article);

// 搜索知识库
router.get('/search', kbController.search);

// 文章评价
router.post('/article/:id/rate', kbController.rateArticle);

// 获取知识库统计
router.get('/api/stats', kbController.getStats);

module.exports = router;
