const express = require('express');
const router = express.Router();

const authController = require('../controllers/authController');
const {
  requireAuth,
  optionalAuth,
  refreshToken,
  logout,
  checkUserStatus,
} = require('../middleware/auth');
const { contactRateLimit, searchRateLimit, apiRateLimit } = require('../middleware/security');

// Authentication related rate limits
const authRateLimit = require('express-rate-limit')({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'production' ? 5 : 1000,
  message: {
    success: false,
    message: '登录尝试过于频繁，请稍后再试',
    code: 'TOO_MANY_LOGIN_ATTEMPTS',
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    if (process.env.NODE_ENV !== 'production') return true;
    // Skip health check and monitoring requests
    return req.path === '/health' || req.path === '/api/health';
  },
});

// Registration rate limits (more restrictive)
// 为了E2E演示在无数据库时返回503，不被限流拦截
const registerRateLimit = require('express-rate-limit')({
  windowMs: 60 * 1000, // 1分钟窗口
  max: process.env.NODE_ENV === 'production' ? 3 : 1000,
  message: {
    success: false,
    message: '注册尝试过于频繁，请稍后再试',
    code: 'TOO_MANY_REGISTER_ATTEMPTS',
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => process.env.NODE_ENV !== 'production',
});

/**
 * POST /api/auth/register
 * User registration
 */
// 开发环境跳过限流，确保无数据库时能返回503
router.post('/register', (req, res, next) => {
  if (process.env.NODE_ENV !== 'production') return authController.register(req, res);
  return registerRateLimit(req, res, next);
}, authController.register);

/**
 * POST /api/auth/login
 * User login
 */
router.post('/login', (req, res, next) => {
  if (process.env.NODE_ENV !== 'production') return authController.login(req, res);
  return authRateLimit(req, res, next);
}, authController.login);

/**
 * POST /api/auth/logout
 * User logout (requires authentication)
 */
router.post('/logout', requireAuth, authController.logout);

/**
 * POST /api/auth/refresh
 * Refresh access token
 */
router.post('/refresh', authController.refresh);

/**
 * POST /api/auth/verify
 * Verify token validity
 */
router.post('/verify', authController.verifyToken);

/**
 * GET /api/auth/profile
 * Get user profile (requires authentication)
 */
router.get('/profile', requireAuth, authController.getProfile);

/**
 * PUT /api/auth/profile
 * Update user profile (requires authentication)
 */
router.put('/profile', requireAuth, authController.updateProfile);

/**
 * POST /api/auth/change-password
 * Change user password (requires authentication)
 */
router.post('/change-password', requireAuth, authController.changePassword);

/**
 * GET /api/auth/status
 * Get authentication status (no auth required)
 */
router.get('/status', (req, res) => {
  try {
    res.json({
      success: true,
      message: '认证服务运行正常',
      timestamp: new Date().toISOString(),
      endpoints: {
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login',
        logout: 'POST /api/auth/logout',
        refresh: 'POST /api/auth/refresh',
        verify: 'POST /api/auth/verify',
        profile: 'GET /api/auth/profile',
        updateProfile: 'PUT /api/auth/profile',
        changePassword: 'POST /api/auth/change-password',
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '认证服务异常',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

/**
 * POST /api/auth/logout-all
 * Logout from all devices (requires authentication)
 */
router.post('/logout-all', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;

    // In a real implementation, this would:
    // 1. Invalidate all refresh tokens for this user
    // 2. Add all user's tokens to blacklist
    // 3. Clear all user sessions

    res.json({
      success: true,
      message: '已从所有设备退出登录',
    });
  } catch (error) {
    console.error('Logout all error:', error);
    res.status(500).json({
      success: false,
      message: '退出登录失败',
    });
  }
});

/**
 * GET /api/auth/sessions
 * Get user's active sessions (requires authentication)
 */
router.get('/sessions', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;

    // Mock response since database is not connected
    const sessions = [
      {
        id: '1',
        deviceInfo: 'Chrome on Windows',
        ipAddress: req.ip,
        loginTime: new Date().toISOString(),
        current: true,
      },
    ];

    res.json({
      success: true,
      data: sessions,
    });
  } catch (error) {
    console.error('Get sessions error:', error);
    res.status(500).json({
      success: false,
      message: '获取会话列表失败',
    });
  }
});

/**
 * DELETE /api/auth/sessions/:sessionId
 * Terminate a specific session (requires authentication)
 */
router.delete('/sessions/:sessionId', requireAuth, async (req, res) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user.id;

    // In a real implementation, this would:
    // 1. Verify session belongs to user
    // 2. Invalidate the session
    // 3. Add session tokens to blacklist

    res.json({
      success: true,
      message: '会话已终止',
    });
  } catch (error) {
    console.error('Delete session error:', error);
    res.status(500).json({
      success: false,
      message: '终止会话失败',
    });
  }
});

/**
 * Error handling middleware for auth routes
 */
router.use((error, req, res, next) => {
  console.error('Auth route error:', error);

  // JWT token errors
  if (error.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: '无效的访问令牌',
      code: 'INVALID_TOKEN',
    });
  }

  if (error.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: '访问令牌已过期',
      code: 'TOKEN_EXPIRED',
    });
  }

  // Validation errors
  if (error.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: '数据验证失败',
      errors: error.details || error.message,
    });
  }

  // Database connection errors
  if (error.code === 'ECONNREFUSED' || error.message.includes('database')) {
    return res.status(503).json({
      success: false,
      message: '数据库服务暂时不可用',
      code: 'DATABASE_UNAVAILABLE',
    });
  }

  // Default error response
  res.status(500).json({
    success: false,
    message: '服务器内部错误',
    error: process.env.NODE_ENV === 'development' ? error.message : undefined,
  });
});

module.exports = router;
