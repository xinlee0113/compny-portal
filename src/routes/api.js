/**
 * API路由
 * 定义产品相关的API端点
 */

const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const monitor = require('../utils/monitor');
const security = require('../middleware/security');

// 导入认证路由
const authRoutes = require('./auth');

/**
 * 认证相关API路由
 */
router.use('/auth', authRoutes);

/**
 * 产品相关API路由
 */

// GET /api/products - 获取所有产品
router.get('/products', productController.getAllProducts);

// GET /api/products/search - 搜索产品 (带特殊速率限制)
router.get(
  '/products/search',
  security.searchRateLimit,
  productController.searchProducts
);

// GET /api/products/categories - 获取产品分类
router.get('/products/categories', productController.getCategories);

// GET /api/products/suggestions - 获取搜索建议
router.get('/products/suggestions', productController.getSearchSuggestions);

// GET /api/products/:id - 根据ID获取单个产品
router.get('/products/:id', productController.getProductById);

/**
 * API状态检查
 */
router.get('/status', (req, res) => {
  res.json({
    success: true,
    message: 'API服务正常运行',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
});

/**
 * CORS预检请求处理
 */
router.options('/health', (req, res) => {
  // 绕过中间件，直接设置CORS头部
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization'
  );
  res.header('Access-Control-Max-Age', '86400');
  res.header('Vary', 'Origin');
  res.sendStatus(200);
});

/**
 * 系统健康检查
 */
router.get('/health', (req, res) => {
  try {
    const healthStatus = monitor.getHealthStatus();

    // 对于健康检查，只要服务能响应就返回200
    // 除非是严重的系统错误才返回503
    const statusCode = healthStatus.status === 'error' ? 503 : 200;

    res.status(statusCode).json({
      success: true,
      ...healthStatus,
    });
  } catch (error) {
    res.status(503).json({
      success: false,
      status: 'error',
      message: '健康检查失败',
      error: error.message,
    });
  }
});

/**
 * 监控指标
 */
router.get('/metrics', (req, res) => {
  try {
    const healthStatus = monitor.getHealthStatus();

    res.json({
      success: true,
      metrics: healthStatus.metrics,
      timestamp: healthStatus.timestamp,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '获取监控指标失败',
      error: error.message,
    });
  }
});

/**
 * API文档页面
 */
router.get('/docs', (req, res) => {
  // 检查是否请求JSON格式
  if (req.headers.accept && req.headers.accept.includes('application/json')) {
    const apiDocs = {
      title: '公司门户网站 API 文档',
      version: '1.0.0',
      baseUrl: '/api',
      endpoints: {
        products: {
          'GET /products': '获取所有产品',
          'GET /products/search': '搜索产品 (参数: q, category, sort, limit)',
          'GET /products/categories': '获取产品分类',
          'GET /products/suggestions': '获取搜索建议 (参数: q, limit)',
          'GET /products/:id': '根据ID获取单个产品',
        },
        system: {
          'GET /status': 'API状态检查',
          'GET /health': '系统健康检查',
          'GET /metrics': '监控指标',
          'GET /docs': 'API文档',
        },
      },
      examples: {
        search:
          '/api/products/search?q=创新&category=核心产品&sort=relevance&limit=10',
        suggestions: '/api/products/suggestions?q=智能&limit=5',
        productById: '/api/products/product-001',
      },
    };
    return res.json(apiDocs);
  }

  // 默认渲染HTML页面
  res.render('api-docs');
});

module.exports = router;
