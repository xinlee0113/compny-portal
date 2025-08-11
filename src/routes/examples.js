const express = require('express');
const router = express.Router();
const examplesController = require('../controllers/examplesController');

// 代码示例主页
router.get('/', examplesController.index);

// 示例分类页面
router.get('/category/:category', examplesController.category);

// 具体示例页面
router.get('/demo/:id', examplesController.demo);

// 在线运行代码
router.post('/run', examplesController.runCode);

// 获取示例统计
router.get('/api/stats', examplesController.getStats);

module.exports = router;
