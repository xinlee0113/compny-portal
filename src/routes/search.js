const express = require('express');
const router = express.Router();
const searchController = require('../controllers/searchController');

// 搜索结果页面
router.get('/', searchController.search);

// 搜索建议API (自动完成)
router.get('/api/suggestions', searchController.suggestions);

// 高级搜索页面
router.get('/advanced', searchController.advanced);

// 搜索统计API
router.get('/api/stats', searchController.stats);

module.exports = router;
