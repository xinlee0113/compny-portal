/**
 * 管理员路由
 * 处理后台管理相关的路由
 */

const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const {
  requireAdmin,
  requireManager,
  extractToken,
  verifyToken,
} = require('../middleware/auth');
const { apiRateLimit } = require('../middleware/security');

/**
 * 自定义管理员认证中间件（用于页面访问）
 * 未认证时显示登录页面而不是JSON错误
 */
const requireAdminWithLogin = async (req, res, next) => {
  try {
    const token = extractToken(req);

    if (!token) {
      // 未提供令牌，显示登录页面
      return res.render('admin-login');
    }

    // 验证令牌
    let decoded;
    try {
      decoded = verifyToken(token);
    } catch (error) {
      // 令牌无效，显示登录页面
      return res.render('admin-login');
    }

    // 检查权限 - 修复JWT payload结构
    if (!decoded || decoded.role !== 'admin') {
      // 权限不足，显示错误页面
      return res.status(403).render('403', {
        title: '访问被拒绝',
        message: '您没有访问管理员面板的权限',
      });
    }

    // 将decoded信息存储到req.user
    req.user = {
      id: decoded.userId,
      username: decoded.username,
      email: decoded.email,
      role: decoded.role,
      status: decoded.status,
    };
    next();
  } catch (error) {
    console.error('管理员认证错误:', error);
    res.render('admin-login');
  }
};

/**
 * 页面路由 - 需要管理员权限
 */

// 管理员面板首页
router.get('/', requireAdminWithLogin, adminController.renderDashboard);

// 用户管理页面
router.get('/users', requireAdmin, adminController.renderUserManagement);

// 系统监控页面
router.get('/monitor', requireManager, adminController.renderSystemMonitor);

// 日志管理页面
router.get('/logs', requireAdmin, adminController.renderLogManagement);

// 系统设置页面
router.get('/settings', requireAdmin, adminController.renderSystemSettings);

/**
 * API路由 - 需要相应权限
 */

// 获取实时系统状态
router.get(
  '/api/system/status',
  requireManager,
  apiRateLimit,
  adminController.getSystemStatus
);

// 用户管理API
router.post(
  '/api/users/:userId/manage',
  requireAdmin,
  apiRateLimit,
  adminController.manageUser
);

// 系统设置API
router.post(
  '/api/settings/update',
  requireAdmin,
  apiRateLimit,
  adminController.updateSystemSettings
);

// 日志清理API
router.post(
  '/api/logs/clear',
  requireAdmin,
  apiRateLimit,
  adminController.clearLogs
);

/**
 * 错误处理中间件
 */
router.use((error, req, res, next) => {
  console.error('管理员路由错误:', error);

  if (req.path.startsWith('/api/')) {
    // API路由返回JSON错误
    res.status(500).json({
      success: false,
      message: '服务器内部错误',
      code: 'ADMIN_ROUTE_ERROR',
    });
  } else {
    // 页面路由返回错误页面
    res.status(500).render('500', {
      title: '服务器错误',
    });
  }
});

module.exports = router;
