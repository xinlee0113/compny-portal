/**
 * 开发中心路由
 * 处理开发工具访问和管理
 */

const express = require('express');
const router = express.Router();
const devCenterController = require('../controllers/devCenterController');
const { apiRateLimit } = require('../middleware/security');

/**
 * 开发中心首页
 */
router.get('/', devCenterController.renderDevCenter);

/**
 * 直接重定向到具体工具
 * 支持查询参数: ?access=internal|external|auto
 */
router.get('/confluence', (req, res) => {
  req.params.toolName = 'confluence';
  devCenterController.redirectToTool(req, res);
});

router.get('/jira', (req, res) => {
  req.params.toolName = 'jira';
  devCenterController.redirectToTool(req, res);
});

router.get('/gerrit', (req, res) => {
  req.params.toolName = 'gerrit';
  devCenterController.redirectToTool(req, res);
});

router.get('/jenkins', (req, res) => {
  req.params.toolName = 'jenkins';
  devCenterController.redirectToTool(req, res);
});

/**
 * 通用工具重定向路由
 */
router.get('/:toolName', devCenterController.redirectToTool);

/**
 * API路由
 */

// 获取开发中心状态
router.get('/api/status', apiRateLimit, devCenterController.getDevCenterStatus);

// 更新外网IP地址
router.post('/api/update-ip', apiRateLimit, devCenterController.updateExternalIP);

// 工具访问统计
router.post('/api/track', apiRateLimit, (req, res) => {
  try {
    const { tool, accessType, timestamp } = req.body;

    // 记录访问日志
    console.log(`工具访问统计: ${tool} - ${accessType} - ${timestamp} - IP: ${req.ip}`);

    res.json({
      success: true,
      message: '统计记录成功',
    });
  } catch (error) {
    console.error('访问统计失败:', error);
    res.status(500).json({
      success: false,
      message: '统计失败',
    });
  }
});

/**
 * 健康检查路由
 */
router.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    services: {
      confluence: 'running',
      jira: 'running',
      gerrit: 'running',
      jenkins: 'running',
    },
  });
});

/**
 * 错误处理中间件
 */
router.use((error, req, res, next) => {
  console.error('开发中心路由错误:', error);

  if (req.path.startsWith('/api/')) {
    // API路由返回JSON错误
    res.status(500).json({
      success: false,
      message: '服务器内部错误',
      code: 'DEV_CENTER_ERROR',
    });
  } else {
    // 页面路由返回错误页面
    res.status(500).render('500', {
      title: '服务器错误',
    });
  }
});

module.exports = router;
