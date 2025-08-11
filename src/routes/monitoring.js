const express = require('express');
const router = express.Router();
const { getPerformanceReport, getAllMetrics } = require('../middleware/performance');

// 监控仪表板主页
router.get('/dashboard', (req, res) => {
  const pageData = {
    title: '性能监控仪表板',
    description: '网站性能监控和系统健康状况',
  };

  res.render('monitoring/dashboard', { pageData });
});

// 获取性能报告API
router.get('/api/report', (req, res) => {
  try {
    const report = getPerformanceReport();
    res.json({
      success: true,
      data: report,
    });
  } catch (error) {
    console.error('Performance report error:', error);
    res.status(500).json({
      success: false,
      message: '获取性能报告失败',
    });
  }
});

// 获取实时指标API
router.get('/api/metrics', (req, res) => {
  try {
    const metrics = getAllMetrics();
    res.json({
      success: true,
      data: metrics,
    });
  } catch (error) {
    console.error('Metrics API error:', error);
    res.status(500).json({
      success: false,
      message: '获取监控指标失败',
    });
  }
});

// 健康检查状态页面
router.get('/health', (req, res) => {
  const pageData = {
    title: '系统健康状况',
    description: '查看系统服务状态和健康指标',
  };

  res.render('monitoring/health', { pageData });
});

module.exports = router;
