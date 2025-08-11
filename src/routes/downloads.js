/**
 * 下载中心路由
 * 处理技术文档下载相关功能
 */

const express = require('express');
const router = express.Router();
const downloadsController = require('../controllers/downloadsController');
const { apiRateLimit } = require('../middleware/security');

/**
 * 页面路由
 */

// 下载中心首页
router.get('/', downloadsController.renderDownloadsIndex);

// 具体文档页面（在线阅读或下载）
router.get('/:filename', downloadsController.downloadDocument);

/**
 * API路由
 */

// 跟踪下载统计
router.post('/api/track', apiRateLimit, downloadsController.trackDownload);

// 获取下载统计数据
router.get('/api/stats', apiRateLimit, downloadsController.getDownloadStats);

/**
 * 错误处理中间件
 */
router.use((error, req, res, next) => {
  console.error('下载路由错误:', error);

  if (req.path.startsWith('/api/')) {
    // API路由返回JSON错误
    res.status(500).json({
      success: false,
      message: '服务器内部错误',
      code: 'DOWNLOADS_ROUTE_ERROR',
    });
  } else {
    // 页面路由返回错误页面
    res.status(500).render('500', {
      title: '服务器错误',
    });
  }
});

module.exports = router;
