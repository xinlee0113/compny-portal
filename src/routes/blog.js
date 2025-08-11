const express = require('express');
const router = express.Router();
const blogController = require('../controllers/blogController');

// 博客首页 - 文章列表
router.get('/', blogController.index);

// 文章分类页面
router.get('/category/:category', blogController.category);

// 文章详情页面
router.get('/article/:slug', blogController.article);

// 文章搜索
router.get('/search', blogController.search);

// RSS订阅
router.get('/rss', blogController.rss);

// 标签页面
router.get('/tag/:tag', blogController.tag);

module.exports = router;
