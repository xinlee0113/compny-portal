/**
 * 安全中间件
 * 实现综合安全防护措施
 */

const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const cors = require('cors');

/**
 * 速率限制配置
 */
const createRateLimiter = (windowMs, max, message) => {
  return rateLimit({
    windowMs,
    max,
    message: {
      success: false,
      message,
      retryAfter: Math.ceil(windowMs / 1000),
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      res.status(429).json({
        success: false,
        message,
        retryAfter: Math.ceil(windowMs / 1000),
      });
    },
  });
};

/**
 * API速率限制
 */
const apiRateLimit = createRateLimiter(
  15 * 60 * 1000, // 15分钟
  100, // 最多100个请求
  '请求过于频繁，请稍后再试'
);

/**
 * 搜索API特殊限制
 */
const searchRateLimit = createRateLimiter(
  1 * 60 * 1000, // 1分钟
  30, // 最多30个搜索请求
  '搜索请求过于频繁，请稍后再试'
);

/**
 * 联系表单限制
 */
const contactRateLimit = createRateLimiter(
  60 * 60 * 1000, // 1小时
  5, // 最多5次提交
  '联系表单提交过于频繁，请稍后再试'
);

/**
 * Helmet安全配置
 */
const helmetConfig = helmet({
  // 内容安全策略
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: [
        "'self'",
        "'unsafe-inline'",
        'https://cdn.jsdelivr.net',
        'https://cdnjs.cloudflare.com',
      ],
      scriptSrc: [
        "'self'",
        "'unsafe-inline'",
        'https://cdn.jsdelivr.net',
        'https://cdnjs.cloudflare.com',
      ],
      imgSrc: ["'self'", 'data:', 'https:'],
      fontSrc: [
        "'self'",
        'https://cdn.jsdelivr.net',
        'https://cdnjs.cloudflare.com',
      ],
      connectSrc: ["'self'"],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      workerSrc: ["'none'"],
      childSrc: ["'none'"],
      formAction: ["'self'"],
      frameAncestors: ["'none'"],
      baseUri: ["'self'"],
      manifestSrc: ["'self'"],
    },
  },

  // X-Frame-Options
  frameguard: { action: 'deny' },

  // Hide X-Powered-By header
  hidePoweredBy: true,

  // HTTP Strict Transport Security
  hsts: {
    maxAge: 31536000, // 1年
    includeSubDomains: true,
    preload: true,
  },

  // X-Content-Type-Options
  noSniff: true,

  // Referrer Policy
  referrerPolicy: { policy: 'same-origin' },

  // X-XSS-Protection
  xssFilter: true,
});

/**
 * CORS配置
 */
const corsConfig = cors({
  origin: function (origin, callback) {
    // 开发环境下允许所有来源
    if (process.env.NODE_ENV === 'development') {
      return callback(null, true);
    }

    // 生产环境的域名列表
    const allowedOrigins = [
      'http://localhost:3001',
      'https://localhost:3001',
      'http://127.0.0.1:3001',
      'https://127.0.0.1:3001',
    ];

    if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error('CORS策略不允许此来源'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
  preflightContinue: false, // 确保预检请求被正确处理
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin',
  ],
  exposedHeaders: ['X-Total-Count'],
});

/**
 * 输入验证和清理
 */
const sanitizeInput = (req, res, next) => {
  // 清理查询参数
  if (req.query) {
    for (const key in req.query) {
      if (typeof req.query[key] === 'string') {
        // 移除潜在的XSS字符
        req.query[key] = req.query[key]
          .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
          .replace(/<[^>]*>/g, '')
          .trim();
      }
    }
  }

  // 清理请求体
  if (req.body) {
    for (const key in req.body) {
      if (typeof req.body[key] === 'string') {
        req.body[key] = req.body[key]
          .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
          .replace(/<[^>]*>/g, '')
          .trim();
      }
    }
  }

  next();
};

/**
 * 安全头信息
 */
const securityHeaders = (req, res, next) => {
  // 添加自定义安全头
  res.setHeader('X-API-Version', '1.0.0');
  res.setHeader('X-Response-Time', Date.now() - req.startTime);

  // 防止信息泄露
  res.removeHeader('X-Powered-By');
  res.removeHeader('Server');

  next();
};

/**
 * IP白名单验证（可选）
 */
const ipWhitelist = (req, res, next) => {
  // 开发环境跳过IP验证
  if (process.env.NODE_ENV === 'development') {
    return next();
  }

  const clientIP =
    req.ip ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    (req.connection.socket ? req.connection.socket.remoteAddress : null);

  // 允许的IP列表（生产环境需要配置）
  const allowedIPs = ['127.0.0.1', '::1', 'localhost'];

  if (allowedIPs.includes(clientIP)) {
    next();
  } else {
    res.status(403).json({
      success: false,
      message: '访问被拒绝',
    });
  }
};

/**
 * API密钥验证（可选）
 */
const apiKeyAuth = (req, res, next) => {
  // 对于公开API，跳过密钥验证
  const publicPaths = ['/api/status', '/api/health', '/api/docs'];
  if (publicPaths.includes(req.path)) {
    return next();
  }

  const apiKey = req.headers['x-api-key'];
  const validApiKeys = process.env.VALID_API_KEYS
    ? process.env.VALID_API_KEYS.split(',')
    : ['dev-key-123'];

  if (!apiKey) {
    return res.status(401).json({
      success: false,
      message: '需要API密钥',
    });
  }

  if (!validApiKeys.includes(apiKey)) {
    return res.status(403).json({
      success: false,
      message: 'API密钥无效',
    });
  }

  next();
};

/**
 * 请求日志中间件
 */
const requestLogger = (req, res, next) => {
  req.startTime = Date.now();

  // 记录请求信息
  console.log(
    `[${new Date().toISOString()}] ${req.method} ${req.url} - ${req.ip}`
  );

  // 记录响应完成
  res.on('finish', () => {
    const duration = Date.now() - req.startTime;
    console.log(
      `[${new Date().toISOString()}] ${req.method} ${req.url} - ${res.statusCode} - ${duration}ms`
    );
  });

  next();
};

/**
 * 错误处理中间件
 */
const errorHandler = (err, req, res, next) => {
  // eslint-disable-line no-unused-vars
  console.error('安全中间件错误:', err);

  // CORS错误
  if (err.message.includes('CORS')) {
    return res.status(403).json({
      success: false,
      message: '跨域请求被拒绝',
    });
  }

  // 速率限制错误
  if (err.status === 429) {
    return res.status(429).json({
      success: false,
      message: '请求过于频繁，请稍后再试',
    });
  }

  // 通用安全错误
  res.status(500).json({
    success: false,
    message: '安全验证失败',
  });
};

module.exports = {
  // 基础安全中间件
  helmet: helmetConfig,
  cors: corsConfig,
  sanitizeInput,
  securityHeaders,
  requestLogger,
  errorHandler,

  // 速率限制
  apiRateLimit,
  searchRateLimit,
  contactRateLimit,

  // 可选安全中间件
  ipWhitelist,
  apiKeyAuth,

  // 工具函数
  createRateLimiter,
};
