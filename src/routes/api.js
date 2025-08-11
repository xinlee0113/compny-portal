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
 * 开发中心API路由
 */
router.use(
  '/dev-center',
  require('./dev-center').Router
    ? require('./dev-center')
    : (() => {
      const devCenterRouter = express.Router();
      const devCenterController = require('../controllers/devCenterController');
      devCenterRouter.get(
        '/status',
        security.apiRateLimit,
        devCenterController.getDevCenterStatus
      );
      devCenterRouter.post(
        '/update-ip',
        security.apiRateLimit,
        devCenterController.updateExternalIP
      );
      devCenterRouter.post('/track', security.apiRateLimit, (req, res) => {
        try {
          const { tool, accessType, timestamp } = req.body;
          console.log(`工具访问统计: ${tool} - ${accessType} - ${timestamp} - IP: ${req.ip}`);
          res.json({ success: true, message: '统计记录成功' });
        } catch (error) {
          console.error('访问统计失败:', error);
          res.status(500).json({ success: false, message: '统计失败' });
        }
      });
      return devCenterRouter;
    })()
);

/**
 * 产品相关API路由
 */

// GET /api/products - 获取所有产品
router.get('/products', productController.getAllProducts);

// GET /api/products/search - 搜索产品 (带特殊速率限制)
router.get('/products/search', security.searchRateLimit, productController.searchProducts);

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

    // 健康：200，错误：500（与测试期望保持一致）
    const statusCode = healthStatus.status === 'error' ? 500 : 200;
    // 显式设置CORS头部，方便演示脚本检查
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Vary', 'Origin');
    res.status(statusCode).json({
      success: true,
      ...healthStatus,
    });
  } catch (error) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Vary', 'Origin');
    res.status(500).json({
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
  // 始终返回JSON，满足测试对JSON结构的断言
  const companyInfo = require('../config/company');
  const apiDocs = {
    title: `${companyInfo.name} API 文档`,
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
      search: '/api/products/search?q=创新&category=核心产品&sort=relevance&limit=10',
      suggestions: '/api/products/suggestions?q=智能&limit=5',
      productById: '/api/products/product-001',
    },
  };
  return res.json(apiDocs);
});

// 详细API文档页面
router.get('/docs/detailed', (req, res) => {
  res.render('api-docs/detailed');
});

// 交互式API文档页面
router.get('/docs/interactive', (req, res) => {
  res.render('api-docs/interactive');
});

// OpenAPI规范
router.get('/docs/openapi', (req, res) => {
  const companyInfo = require('../config/company');
  const openApiSpec = {
    openapi: '3.0.0',
    info: {
      title: `${companyInfo.name}车载应用开发API`,
      version: '1.0.0',
      description: '提供车载应用开发相关的API服务',
      contact: {
        name: `${companyInfo.name}技术支持`,
        email: companyInfo.contact.apiEmail,
        url: companyInfo.website.url,
      },
    },
    servers: [
      {
        url: '/api',
        description: '生产环境',
      },
    ],
    paths: {
      '/products': {
        get: {
          summary: '获取所有产品',
          tags: ['Products'],
          responses: {
            200: {
              description: '成功获取产品列表',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean' },
                      data: {
                        type: 'array',
                        items: { $ref: '#/components/schemas/Product' },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      '/products/search': {
        get: {
          summary: '搜索产品',
          tags: ['Products'],
          parameters: [
            {
              name: 'q',
              in: 'query',
              description: '搜索关键词',
              required: false,
              schema: { type: 'string' },
            },
            {
              name: 'category',
              in: 'query',
              description: '产品分类',
              required: false,
              schema: { type: 'string' },
            },
          ],
          responses: {
            200: {
              description: '搜索结果',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean' },
                      data: {
                        type: 'array',
                        items: { $ref: '#/components/schemas/Product' },
                      },
                      total: { type: 'integer' },
                    },
                  },
                },
              },
            },
          },
        },
      },
      '/health': {
        get: {
          summary: '系统健康检查',
          tags: ['System'],
          responses: {
            200: {
              description: '系统健康',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean' },
                      status: { type: 'string' },
                      timestamp: { type: 'string' },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    components: {
      schemas: {
        Product: {
          type: 'object',
          properties: {
            id: { type: 'string', description: '产品ID' },
            name: { type: 'string', description: '产品名称' },
            category: { type: 'string', description: '产品分类' },
            description: { type: 'string', description: '产品描述' },
            features: {
              type: 'array',
              items: { type: 'string' },
              description: '产品特性',
            },
            platforms: {
              type: 'array',
              items: { type: 'string' },
              description: '支持平台',
            },
          },
        },
      },
    },
  };

  res.json(openApiSpec);
});

module.exports = router;
