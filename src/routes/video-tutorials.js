/**
 * 视频教程路由
 * 处理视频教程相关的路由
 */

const express = require('express');
const router = express.Router();
const VideoTutorialsController = require('../controllers/videoTutorialsController');
const { requireAuth } = require('../middleware/auth');

// 页面路由
router.get('/', VideoTutorialsController.renderVideoTutorials);

// API路由
router.get('/api/categories', VideoTutorialsController.getVideoCategories);
router.get('/api/videos', VideoTutorialsController.getVideoList);
router.get('/api/videos/:id', VideoTutorialsController.getVideoDetail);

// 需要认证的路由（将来可用于收藏、评论等功能）
// router.post('/api/videos/:id/like', requireAuth, VideoTutorialsController.likeVideo);
// router.post('/api/videos/:id/comment', requireAuth, VideoTutorialsController.addComment);

module.exports = router;
