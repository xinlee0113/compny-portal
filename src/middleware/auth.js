/**
 * JWT认证中间件
 * 提供用户身份验证、角色权限控制和会话管理
 */

const jwt = require('jsonwebtoken');
const { cache } = require('../config/database');

// JWT配置
const JWT_SECRET = process.env.JWT_SECRET || 'company-portal-jwt-secret-key-2025';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '30d';

/**
 * 生成JWT令牌
 */
function generateTokens(user) {
  const payload = {
    userId: user.id,
    username: user.username,
    email: user.email,
    role: user.role,
    status: user.status,
    tokenType: 'access',
  };

  const refreshPayload = {
    userId: user.id,
    tokenType: 'refresh',
  };

  const accessToken = jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
    issuer: 'company-portal',
    audience: 'company-portal-users',
  });

  const refreshToken = jwt.sign(refreshPayload, JWT_SECRET, {
    expiresIn: JWT_REFRESH_EXPIRES_IN,
    issuer: 'company-portal',
    audience: 'company-portal-users',
  });

  return {
    accessToken,
    refreshToken,
    expiresIn: JWT_EXPIRES_IN,
    tokenType: 'Bearer',
  };
}

/**
 * 验证JWT令牌
 */
function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET, {
      issuer: 'company-portal',
      audience: 'company-portal-users',
    });
  } catch (error) {
    throw new Error(`Token验证失败: ${error.message}`);
  }
}

/**
 * 从请求中提取令牌
 */
function extractToken(req) {
  // 1. Authorization header
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }

  // 2. Cookie中的token
  if (req.cookies && req.cookies.accessToken) {
    return req.cookies.accessToken;
  }

  // 3. Query参数（不推荐，仅用于开发）
  if (req.query.token) {
    return req.query.token;
  }

  return null;
}

/**
 * 检查令牌是否在黑名单中
 */
async function isTokenBlacklisted(tokenId) {
  try {
    const blacklisted = await cache.get(`blacklist:${tokenId}`);
    return !!blacklisted;
  } catch (error) {
    console.warn('检查令牌黑名单失败:', error.message);
    return false;
  }
}

/**
 * 将令牌加入黑名单
 */
async function blacklistToken(tokenId, expiresIn = 3600) {
  try {
    await cache.set(`blacklist:${tokenId}`, true, expiresIn);
  } catch (error) {
    console.warn('令牌黑名单操作失败:', error.message);
  }
}

/**
 * 基础认证中间件
 */
const authenticate = (options = {}) => {
  const { optional = false } = options;

  return async (req, res, next) => {
    try {
      const token = extractToken(req);

      if (!token) {
        if (optional) {
          req.user = null;
          return next();
        }

        return res.status(401).json({
          success: false,
          message: '缺少访问令牌',
          code: 'MISSING_TOKEN',
        });
      }

      // 验证令牌
      let decoded;
      try {
        decoded = verifyToken(token);
      } catch (error) {
        return res.status(401).json({
          success: false,
          message: '无效的访问令牌',
          code: 'INVALID_TOKEN',
          error: error.message,
        });
      }

      // 检查令牌类型
      if (decoded.tokenType !== 'access') {
        return res.status(401).json({
          success: false,
          message: '令牌类型错误',
          code: 'INVALID_TOKEN_TYPE',
        });
      }

      // 检查黑名单
      if (await isTokenBlacklisted(decoded.jti)) {
        return res.status(401).json({
          success: false,
          message: '令牌已被撤销',
          code: 'TOKEN_REVOKED',
        });
      }

      // 尝试获取用户信息（如果数据库可用）
      let user = null;
      try {
        const models = require('../models');
        if (models && models.User) {
          user = await models.User.findByPk(decoded.userId, {
            attributes: { exclude: ['password_hash'] },
          });

          if (!user) {
            return res.status(401).json({
              success: false,
              message: '用户不存在',
              code: 'USER_NOT_FOUND',
            });
          }

          if (user.status !== 'active') {
            return res.status(401).json({
              success: false,
              message: '用户账户已被禁用',
              code: 'USER_DISABLED',
            });
          }
        }
      } catch (dbError) {
        console.warn('数据库查询失败，使用令牌中的用户信息:', dbError.message);
        // 数据库不可用时，使用令牌中的信息
        user = {
          id: decoded.userId,
          username: decoded.username,
          email: decoded.email,
          role: decoded.role,
          status: decoded.status,
        };
      }

      // 将用户信息添加到请求对象
      req.user = user;
      req.token = token;
      req.tokenPayload = decoded;

      next();
    } catch (error) {
      console.error('认证中间件错误:', error);
      return res.status(500).json({
        success: false,
        message: '认证服务内部错误',
        code: 'AUTH_SERVICE_ERROR',
      });
    }
  };
};

/**
 * 角色权限控制中间件
 */
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: '用户未认证',
        code: 'USER_NOT_AUTHENTICATED',
      });
    }

    if (allowedRoles.length === 0) {
      return next(); // 无角色限制
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: '权限不足',
        code: 'INSUFFICIENT_PERMISSIONS',
        required: allowedRoles,
        current: req.user.role,
      });
    }

    next();
  };
};

/**
 * 刷新令牌中间件
 */
const refreshToken = async (req, res, next) => {
  try {
    const refreshToken = req.body.refreshToken || req.cookies.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: '缺少刷新令牌',
        code: 'MISSING_REFRESH_TOKEN',
      });
    }

    let decoded;
    try {
      decoded = verifyToken(refreshToken);
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: '无效的刷新令牌',
        code: 'INVALID_REFRESH_TOKEN',
      });
    }

    if (decoded.tokenType !== 'refresh') {
      return res.status(401).json({
        success: false,
        message: '令牌类型错误',
        code: 'INVALID_TOKEN_TYPE',
      });
    }

    // 尝试获取用户信息
    let user = null;
    try {
      const models = require('../models');
      if (models && models.User) {
        user = await models.User.findByPk(decoded.userId);

        if (!user || user.status !== 'active') {
          return res.status(401).json({
            success: false,
            message: '用户不存在或已被禁用',
            code: 'USER_NOT_FOUND',
          });
        }
      } else {
        // 数据库不可用时返回错误
        throw new Error('用户数据服务不可用');
      }
    } catch (error) {
      return res.status(503).json({
        success: false,
        message: '用户数据服务不可用',
        code: 'USER_SERVICE_UNAVAILABLE',
      });
    }

    req.user = user;
    req.refreshToken = refreshToken;

    next();
  } catch (error) {
    console.error('刷新令牌中间件错误:', error);
    return res.status(500).json({
      success: false,
      message: '令牌刷新服务内部错误',
      code: 'REFRESH_SERVICE_ERROR',
    });
  }
};

/**
 * 登出中间件（撤销令牌）
 */
const logout = async (req, res, next) => {
  try {
    const token = extractToken(req);

    if (token) {
      try {
        const decoded = verifyToken(token);

        // 将令牌加入黑名单
        const expiresIn = decoded.exp - Math.floor(Date.now() / 1000);
        if (expiresIn > 0) {
          await blacklistToken(decoded.jti, expiresIn);
        }
      } catch (error) {
        console.warn('撤销令牌失败:', error.message);
      }
    }

    // 清除cookies
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');

    req.user = null;
    next();
  } catch (error) {
    console.error('登出中间件错误:', error);
    next(); // 继续执行，不阻止登出
  }
};

/**
 * 用户状态检查中间件
 */
const checkUserStatus = (req, res, next) => {
  if (!req.user) {
    return next();
  }

  if (req.user.status === 'suspended') {
    return res.status(403).json({
      success: false,
      message: '账户已被暂停',
      code: 'ACCOUNT_SUSPENDED',
    });
  }

  if (req.user.status === 'pending') {
    return res.status(403).json({
      success: false,
      message: '账户等待激活',
      code: 'ACCOUNT_PENDING',
    });
  }

  next();
};

/**
 * API密钥认证中间件
 */
const authenticateApiKey = (req, res, next) => {
  const apiKey = req.headers['x-api-key'] || req.query.apiKey;
  const validApiKey = process.env.API_KEY || 'company-portal-api-key-2025';

  if (!apiKey) {
    return res.status(401).json({
      success: false,
      message: '缺少API密钥',
      code: 'MISSING_API_KEY',
    });
  }

  if (apiKey !== validApiKey) {
    return res.status(401).json({
      success: false,
      message: '无效的API密钥',
      code: 'INVALID_API_KEY',
    });
  }

  req.apiAuthenticated = true;
  next();
};

module.exports = {
  // 核心功能
  generateTokens,
  verifyToken,
  extractToken,

  // 中间件
  authenticate,
  authorize,
  refreshToken,
  logout,
  checkUserStatus,
  authenticateApiKey,

  // 令牌管理
  blacklistToken,
  isTokenBlacklisted,

  // 常用组合中间件
  requireAuth: authenticate(),
  optionalAuth: authenticate({ optional: true }),
  requireAdmin: [authenticate(), authorize('admin')],
  requireManager: [authenticate(), authorize('admin', 'manager')],
  requireStaff: [authenticate(), authorize('admin', 'manager', 'employee')],

  // 配置
  JWT_SECRET,
  JWT_EXPIRES_IN,
};
