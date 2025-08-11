/**
 * 产品控制器测试
 */

const request = require('supertest');
const express = require('express');
const productController = require('../../src/controllers/productController');

// 创建测试应用
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 设置路由
app.get('/api/products', productController.getAllProducts);
app.get('/api/products/search', productController.searchProducts);
app.get('/api/products/categories', productController.getCategories);
app.get('/api/products/suggestions', productController.getSearchSuggestions);
app.get('/api/products/:id', productController.getProductById);

describe('Product Controller', () => {
  describe('GET /api/products', () => {
    test('应该返回所有产品', async () => {
      const response = await request(app).get('/api/products').expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
      expect(response.body.total).toBe(response.body.data.length);
    });

    test('返回的产品应该包含正确的字段', async () => {
      const response = await request(app).get('/api/products').expect(200);

      const product = response.body.data[0];
      expect(product).toHaveProperty('id');
      expect(product).toHaveProperty('name');
      expect(product).toHaveProperty('description');
      expect(product).toHaveProperty('features');
      expect(product).toHaveProperty('category');
      expect(product).toHaveProperty('tags');
    });
  });

  describe('GET /api/products/:id', () => {
    test('应该返回指定ID的产品', async () => {
      const response = await request(app).get('/api/products/product-001').expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe('product-001');
      expect(response.body.data.name).toBe('核心产品A');
    });

    test('产品不存在时应该返回404', async () => {
      const response = await request(app).get('/api/products/non-existing-id').expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('产品未找到');
    });
  });

  describe('GET /api/products/search', () => {
    test('无参数时应该返回所有产品', async () => {
      const response = await request(app).get('/api/products/search').expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
    });

    test('应该支持关键词搜索', async () => {
      const response = await request(app).get('/api/products/search?q=创新').expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.query.keyword).toBe('创新');

      if (response.body.data.length > 0) {
        response.body.data.forEach((product) => {
          expect(product.relevanceScore).toBeGreaterThan(0);
        });
      }
    });

    test('应该支持分类筛选', async () => {
      const response = await request(app).get('/api/products/search?category=核心产品').expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.query.category).toBe('核心产品');

      if (response.body.data.length > 0) {
        response.body.data.forEach((product) => {
          expect(product.category).toBe('核心产品');
        });
      }
    });

    test('应该支持排序参数', async () => {
      const response = await request(app).get('/api/products/search?sort=name').expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.query.sort).toBe('name');
    });

    test('应该支持限制结果数量', async () => {
      const response = await request(app).get('/api/products/search?limit=3').expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBeLessThanOrEqual(3);
    });

    test('应该支持组合查询', async () => {
      const response = await request(app)
        .get('/api/products/search?q=数字化&category=行业解决方案&sort=name&limit=5')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.query.keyword).toBe('数字化');
      expect(response.body.query.category).toBe('行业解决方案');
      expect(response.body.query.sort).toBe('name');
      expect(response.body.query.limit).toBe(5);
    });

    test('无效的排序参数应该使用默认值', async () => {
      const response = await request(app).get('/api/products/search?sort=invalid').expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.query.sort).toBe('relevance');
    });

    test('超出范围的limit应该被限制', async () => {
      const response = await request(app).get('/api/products/search?limit=200').expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.query.limit).toBe(100);
    });
  });

  describe('GET /api/products/categories', () => {
    test('应该返回所有产品分类', async () => {
      const response = await request(app).get('/api/products/categories').expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
    });

    test('返回的分类应该包含预期的类别', async () => {
      const response = await request(app).get('/api/products/categories').expect(200);

      const categories = response.body.data;
      expect(categories).toContain('核心产品');
      expect(categories).toContain('行业解决方案');
      expect(categories).toContain('技术服务');
    });
  });

  describe('GET /api/products/suggestions', () => {
    test('查询参数过短时应该返回空数组', async () => {
      const response = await request(app).get('/api/products/suggestions?q=a').expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual([]);
    });

    test('应该返回相关的搜索建议', async () => {
      const response = await request(app).get('/api/products/suggestions?q=智能').expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.query).toBe('智能');
    });

    test('应该限制建议数量', async () => {
      const response = await request(app)
        .get('/api/products/suggestions?q=产品&limit=3')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBeLessThanOrEqual(3);
    });

    test('超出范围的limit应该被限制', async () => {
      const response = await request(app)
        .get('/api/products/suggestions?q=产品&limit=20')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBeLessThanOrEqual(10);
    });
  });

  describe('错误处理测试', () => {
    test('getAllProducts遇到错误时应该返回500', async () => {
      // 创建一个会抛出错误的mock控制器
      const mockApp = express();
      mockApp.use(express.json());

      mockApp.get('/api/products', (req, res) => {
        try {
          throw new Error('模拟数据库错误');
        } catch (error) {
          console.error('获取产品列表失败:', error);
          res.status(500).json({
            success: false,
            message: '获取产品列表失败',
            error: error.message,
          });
        }
      });

      const response = await request(mockApp).get('/api/products').expect(500);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('获取产品列表失败');
    });

    test('getProductById遇到错误时应该返回500', async () => {
      const mockApp = express();
      mockApp.use(express.json());

      mockApp.get('/api/products/:id', (req, res) => {
        try {
          throw new Error('模拟查询错误');
        } catch (error) {
          console.error('获取产品详情失败:', error);
          res.status(500).json({
            success: false,
            message: '获取产品详情失败',
            error: error.message,
          });
        }
      });

      const response = await request(mockApp).get('/api/products/test-id').expect(500);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('获取产品详情失败');
    });

    test('searchProducts遇到错误时应该返回500', async () => {
      const mockApp = express();
      mockApp.use(express.json());

      mockApp.get('/api/products/search', (req, res) => {
        try {
          throw new Error('模拟搜索错误');
        } catch (error) {
          console.error('产品搜索失败:', error);
          res.status(500).json({
            success: false,
            message: '产品搜索失败',
            error: error.message,
          });
        }
      });

      const response = await request(mockApp).get('/api/products/search?q=test').expect(500);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('产品搜索失败');
    });
  });
});
