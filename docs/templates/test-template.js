/**
 * [模块名称] 测试模板
 * 
 * 使用说明：
 * 1. 复制此模板文件
 * 2. 替换所有 [占位符] 为实际值
 * 3. 根据需要添加或删除测试用例
 * 4. 确保测试覆盖所有核心功能
 */

const request = require('supertest');
const [ModuleName] = require('../src/[module-path]');

// 如果是API测试，引入app
// const app = require('../src/server');

describe('[模块名称] 测试', () => {
  // 测试前设置
  beforeEach(() => {
    // 初始化测试数据
    // 重置模拟对象
    // 清理缓存等
  });

  // 测试后清理
  afterEach(() => {
    // 清理测试数据
    // 重置状态
  });

  // 所有测试完成后清理
  afterAll(() => {
    // 关闭数据库连接
    // 清理全局资源
  });

  describe('[功能模块1]', () => {
    test('应该正确处理正常情况', () => {
      // Arrange - 准备测试数据
      const input = { /* 测试输入数据 */ };
      const expected = { /* 期望输出 */ };

      // Act - 执行被测试的功能
      const result = [functionName](input);

      // Assert - 验证结果
      expect(result).toEqual(expected);
    });

    test('应该正确处理边界情况', () => {
      // 测试边界值
      const edgeCases = [null, undefined, '', 0, []];
      
      edgeCases.forEach(edgeCase => {
        expect(() => [functionName](edgeCase)).not.toThrow();
      });
    });

    test('应该正确处理错误情况', () => {
      // 测试错误输入
      const invalidInput = { /* 无效输入 */ };
      
      expect(() => [functionName](invalidInput)).toThrow('[错误信息]');
    });
  });

  // API测试示例
  describe('API 端点测试', () => {
    describe('GET /api/[resource]', () => {
      test('应该返回资源列表', async () => {
        const response = await request(app)
          .get('/api/[resource]')
          .expect(200);

        expect(response.body).toHaveProperty('success', true);
        expect(response.body).toHaveProperty('data');
        expect(Array.isArray(response.body.data)).toBe(true);
      });

      test('应该支持查询参数', async () => {
        const response = await request(app)
          .get('/api/[resource]?param=value')
          .expect(200);

        expect(response.body.success).toBe(true);
        // 验证查询参数效果
      });

      test('应该处理无效查询参数', async () => {
        const response = await request(app)
          .get('/api/[resource]?invalid=param')
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body).toHaveProperty('message');
      });
    });

    describe('POST /api/[resource]', () => {
      test('应该成功创建资源', async () => {
        const newResource = {
          // 有效的创建数据
        };

        const response = await request(app)
          .post('/api/[resource]')
          .send(newResource)
          .expect(201);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toHaveProperty('id');
      });

      test('应该验证必填字段', async () => {
        const invalidResource = {
          // 缺少必填字段的数据
        };

        const response = await request(app)
          .post('/api/[resource]')
          .send(invalidResource)
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.message).toContain('必填');
      });
    });

    describe('PUT /api/[resource]/:id', () => {
      test('应该成功更新资源', async () => {
        const updateData = {
          // 更新数据
        };

        const response = await request(app)
          .put('/api/[resource]/test-id')
          .send(updateData)
          .expect(200);

        expect(response.body.success).toBe(true);
      });

      test('应该处理不存在的资源', async () => {
        const response = await request(app)
          .put('/api/[resource]/non-existent-id')
          .send({})
          .expect(404);

        expect(response.body.success).toBe(false);
      });
    });

    describe('DELETE /api/[resource]/:id', () => {
      test('应该成功删除资源', async () => {
        const response = await request(app)
          .delete('/api/[resource]/test-id')
          .expect(200);

        expect(response.body.success).toBe(true);
      });
    });
  });

  // 异步功能测试示例
  describe('[异步功能]', () => {
    test('应该正确处理Promise', async () => {
      const result = await [asyncFunction]();
      expect(result).toBeDefined();
    });

    test('应该正确处理Promise错误', async () => {
      await expect([asyncFunction]()).rejects.toThrow('[错误信息]');
    });

    test('应该在超时内完成', async () => {
      const startTime = Date.now();
      await [asyncFunction]();
      const duration = Date.now() - startTime;
      
      expect(duration).toBeLessThan(1000); // 1秒内完成
    });
  });

  // 性能测试示例
  describe('性能测试', () => {
    test('应该在合理时间内完成大量数据处理', () => {
      const largeDataSet = new Array(10000).fill().map((_, i) => ({ id: i }));
      
      const startTime = Date.now();
      const result = [functionName](largeDataSet);
      const duration = Date.now() - startTime;

      expect(duration).toBeLessThan(100); // 100ms内完成
      expect(result).toBeDefined();
    });
  });

  // 集成测试示例
  describe('集成测试', () => {
    test('应该正确集成多个模块', () => {
      // 测试模块间的交互
    });
  });
});

// 测试工具函数
const createMockRequest = (data = {}) => ({
  body: data.body || {},
  query: data.query || {},
  params: data.params || {},
  headers: data.headers || {},
});

const createMockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res);
  res.render = jest.fn().mockReturnValue(res);
  return res;
};

// 常用测试数据
const testData = {
  validInput: {
    // 有效输入数据
  },
  invalidInput: {
    // 无效输入数据
  },
  edgeCases: [null, undefined, '', 0, [], {}],
};

/**
 * 测试最佳实践：
 * 
 * 1. 测试命名：使用描述性的测试名称
 *    ✅ '应该返回正确的搜索结果'
 *    ❌ '测试搜索功能'
 * 
 * 2. 测试结构：遵循 AAA 模式
 *    - Arrange: 准备测试数据和环境
 *    - Act: 执行被测试的功能
 *    - Assert: 验证结果
 * 
 * 3. 测试覆盖：
 *    - 正常情况
 *    - 边界情况
 *    - 错误情况
 *    - 性能要求
 * 
 * 4. 测试独立性：
 *    - 每个测试都应该独立运行
 *    - 不依赖其他测试的执行顺序
 *    - 使用beforeEach/afterEach清理状态
 * 
 * 5. 断言明确：
 *    - 使用具体的断言而不是模糊的检查
 *    - 一个测试应该只验证一个行为
 *    - 使用有意义的错误消息
 */