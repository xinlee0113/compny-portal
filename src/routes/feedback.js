const express = require('express');
const router = express.Router();
const feedbackController = require('../controllers/feedbackController');

// 反馈表单页面
router.get('/', feedbackController.index);

// 提交反馈
router.post('/submit', feedbackController.submit);

// 反馈评价 (点赞/差评)
router.post('/rate/:id', feedbackController.rate);

// 获取反馈统计
router.get('/api/stats', feedbackController.getStats);

// 获取反馈列表 (用于展示)
router.get('/api/list', feedbackController.getList);

module.exports = router;
