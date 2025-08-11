const express = require('express');
const router = express.Router();
const portfolioController = require('../controllers/portfolioController');

// 作品集主页
router.get('/', portfolioController.index);

// 项目详情页
router.get('/project/:id', portfolioController.projectDetail);

// 按分类筛选
router.get('/category/:category', portfolioController.category);

// 技术栈筛选
router.get('/tech/:tech', portfolioController.technology);

// 项目搜索
router.get('/search', portfolioController.search);

// 获取作品集统计
router.get('/api/stats', portfolioController.getStats);

module.exports = router;
