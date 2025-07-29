/**
 * 产品模型测试
 */

const Product = require('../../src/models/Product');

describe('Product Model', () => {
  let productModel;

  beforeEach(() => {
    productModel = new Product();
  });

  describe('getAllProducts', () => {
    test('应该返回所有产品', () => {
      const products = productModel.getAllProducts();
      expect(products).toBeDefined();
      expect(Array.isArray(products)).toBe(true);
      expect(products.length).toBeGreaterThan(0);
    });

    test('返回的产品应该包含必要的字段', () => {
      const products = productModel.getAllProducts();
      const firstProduct = products[0];

      expect(firstProduct).toHaveProperty('id');
      expect(firstProduct).toHaveProperty('name');
      expect(firstProduct).toHaveProperty('description');
      expect(firstProduct).toHaveProperty('features');
      expect(firstProduct).toHaveProperty('category');
      expect(firstProduct).toHaveProperty('tags');
      expect(firstProduct).toHaveProperty('created_at');
    });
  });

  describe('getProductById', () => {
    test('应该根据ID返回正确的产品', () => {
      const product = productModel.getProductById('product-001');
      expect(product).toBeDefined();
      expect(product.id).toBe('product-001');
      expect(product.name).toBe('核心产品A');
    });

    test('应该在产品不存在时返回undefined', () => {
      const product = productModel.getProductById('non-existing-id');
      expect(product).toBeUndefined();
    });
  });

  describe('getCategories', () => {
    test('应该返回所有产品分类', () => {
      const categories = productModel.getCategories();
      expect(categories).toBeDefined();
      expect(Array.isArray(categories)).toBe(true);
      expect(categories.length).toBeGreaterThan(0);
    });

    test('返回的分类应该去重', () => {
      const categories = productModel.getCategories();
      const uniqueCategories = [...new Set(categories)];
      expect(categories.length).toBe(uniqueCategories.length);
    });
  });

  describe('searchProducts', () => {
    test('无搜索条件时应该返回所有产品', () => {
      const results = productModel.searchProducts({});
      const allProducts = productModel.getAllProducts();
      expect(results.length).toBe(allProducts.length);
    });

    test('应该支持关键词搜索', () => {
      const results = productModel.searchProducts({ query: '创新' });
      expect(results.length).toBeGreaterThan(0);
      results.forEach(product => {
        expect(product.relevanceScore).toBeGreaterThan(0);
      });
    });

    test('应该支持分类筛选', () => {
      const results = productModel.searchProducts({ category: '核心产品' });
      expect(results.length).toBeGreaterThan(0);
      results.forEach(product => {
        expect(product.category).toBe('核心产品');
      });
    });

    test('应该支持名称排序', () => {
      const results = productModel.searchProducts({ sort: 'name' });
      expect(results.length).toBeGreaterThan(1);

      for (let i = 1; i < results.length; i++) {
        expect(
          results[i - 1].name.localeCompare(results[i].name, 'zh-CN')
        ).toBeLessThanOrEqual(0);
      }
    });

    test('应该支持日期排序', () => {
      const results = productModel.searchProducts({ sort: 'date' });
      expect(results.length).toBeGreaterThan(1);

      for (let i = 1; i < results.length; i++) {
        const prevDate = new Date(results[i - 1].created_at);
        const currDate = new Date(results[i].created_at);
        expect(prevDate >= currDate).toBe(true);
      }
    });

    test('应该支持结果数量限制', () => {
      const results = productModel.searchProducts({ limit: 3 });
      expect(results.length).toBeLessThanOrEqual(3);
    });

    test('组合搜索应该正常工作', () => {
      const results = productModel.searchProducts({
        query: '数字化',
        category: '行业解决方案',
        sort: 'name',
        limit: 5,
      });

      expect(Array.isArray(results)).toBe(true);
      expect(results.length).toBeLessThanOrEqual(5);

      if (results.length > 0) {
        results.forEach(product => {
          expect(product.category).toBe('行业解决方案');
          expect(product.relevanceScore).toBeGreaterThan(0);
        });
      }
    });
  });

  describe('calculateRelevanceScore', () => {
    test('名称匹配应该有更高的分数', () => {
      const product = {
        name: '智能产品',
        description: '一般描述',
        features: ['功能1'],
        tags: ['标签1'],
        category: '分类1',
      };

      const score = productModel.calculateRelevanceScore(product, '智能');
      expect(score).toBeGreaterThanOrEqual(10);
    });

    test('特性匹配应该有合适的分数', () => {
      const product = {
        name: '产品',
        description: '描述',
        features: ['智能控制'],
        tags: ['标签1'],
        category: '分类1',
      };

      const score = productModel.calculateRelevanceScore(product, '智能');
      expect(score).toBeGreaterThanOrEqual(8);
    });

    test('无匹配时应该返回0分', () => {
      const product = {
        name: '产品',
        description: '描述',
        features: ['功能'],
        tags: ['标签'],
        category: '分类',
      };

      const score = productModel.calculateRelevanceScore(product, 'xyz');
      expect(score).toBe(0);
    });
  });

  describe('getSearchSuggestions', () => {
    test('查询长度小于2时应该返回空数组', () => {
      const suggestions = productModel.getSearchSuggestions('a');
      expect(suggestions).toEqual([]);
    });

    test('应该返回相关的搜索建议', () => {
      const suggestions = productModel.getSearchSuggestions('智能');
      expect(Array.isArray(suggestions)).toBe(true);
      expect(suggestions.length).toBeGreaterThan(0);
    });

    test('应该限制建议数量', () => {
      const suggestions = productModel.getSearchSuggestions('产品', 3);
      expect(suggestions.length).toBeLessThanOrEqual(3);
    });

    test('建议应该包含查询关键词', () => {
      const suggestions = productModel.getSearchSuggestions('智能');
      suggestions.forEach(suggestion => {
        expect(suggestion.toLowerCase()).toContain('智能');
      });
    });
  });
});
