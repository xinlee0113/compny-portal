/**
 * 性能基准测试
 * 建立系统性能基线，监控关键指标
 */

const request = require('supertest');
const express = require('express');

// 模拟完整的应用设置
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 添加监控中间件
const monitor = require('../../src/utils/monitor');
app.use(monitor.requestMiddleware());

// 添加路由
app.use('/', require('../../src/routes/home'));
app.use('/api', require('../../src/routes/api'));

describe('性能基准测试', () => {
  beforeEach(() => {
    // 重置监控数据
    monitor.reset();
  });

  describe('API性能基准', () => {
    test('API状态检查响应时间应该小于50ms', async () => {
      const startTime = Date.now();

      await request(app).get('/api/status').expect(200);

      const responseTime = Date.now() - startTime;
      expect(responseTime).toBeLessThan(50);
      console.log(`API状态检查响应时间: ${responseTime}ms`);
    });

    test('产品列表API响应时间应该小于100ms', async () => {
      const startTime = Date.now();

      await request(app).get('/api/products').expect(200);

      const responseTime = Date.now() - startTime;
      expect(responseTime).toBeLessThan(100);
      console.log(`产品列表API响应时间: ${responseTime}ms`);
    });

    test('产品搜索API响应时间应该小于150ms', async () => {
      const startTime = Date.now();

      await request(app)
        .get('/api/products/search?q=智能&category=核心产品&sort=relevance&limit=10')
        .expect(200);

      const responseTime = Date.now() - startTime;
      expect(responseTime).toBeLessThan(150);
      console.log(`产品搜索API响应时间: ${responseTime}ms`);
    });

    test('健康检查API响应时间应该小于30ms', async () => {
      const startTime = Date.now();

      await request(app).get('/api/health').expect(200);

      const responseTime = Date.now() - startTime;
      expect(responseTime).toBeLessThan(30);
      console.log(`健康检查API响应时间: ${responseTime}ms`);
    });
  });

  describe('并发性能测试', () => {
    test('应该能处理10个并发的产品列表请求', async () => {
      const concurrentRequests = 10;
      const requests = [];

      const startTime = Date.now();

      for (let i = 0; i < concurrentRequests; i++) {
        requests.push(request(app).get('/api/products'));
      }

      const responses = await Promise.all(requests);
      const totalTime = Date.now() - startTime;

      // 验证所有请求都成功
      responses.forEach((response) => {
        expect(response.status).toBe(200);
      });

      // 平均响应时间应该合理
      const averageTime = totalTime / concurrentRequests;
      expect(averageTime).toBeLessThan(200);

      console.log(`${concurrentRequests}个并发请求总时间: ${totalTime}ms`);
      console.log(`平均响应时间: ${averageTime.toFixed(2)}ms`);
    });

    test('应该能处理20个并发的搜索请求', async () => {
      const concurrentRequests = 20;
      const requests = [];
      const searchQueries = ['智能', '创新', '数字化', '平台', '解决方案'];

      const startTime = Date.now();

      for (let i = 0; i < concurrentRequests; i++) {
        const query = searchQueries[i % searchQueries.length];
        requests.push(request(app).get(`/api/products/search?q=${query}`));
      }

      const responses = await Promise.all(requests);
      const totalTime = Date.now() - startTime;

      // 验证所有请求都成功
      responses.forEach((response) => {
        expect(response.status).toBe(200);
      });

      // 吞吐量测试
      const requestsPerSecond = (concurrentRequests / totalTime) * 1000;
      expect(requestsPerSecond).toBeGreaterThan(50); // 至少50 RPS

      console.log(`${concurrentRequests}个并发搜索请求总时间: ${totalTime}ms`);
      console.log(`吞吐量: ${requestsPerSecond.toFixed(2)} 请求/秒`);
    });
  });

  describe('负载测试', () => {
    test('持续负载测试 - 50个请求', async () => {
      const totalRequests = 50;
      const batchSize = 5;
      const batches = totalRequests / batchSize;

      const results = {
        totalTime: 0,
        successCount: 0,
        errorCount: 0,
        responseTimes: [],
      };

      const overallStartTime = Date.now();

      for (let batch = 0; batch < batches; batch++) {
        const batchRequests = [];

        for (let i = 0; i < batchSize; i++) {
          const requestStartTime = Date.now();
          batchRequests.push(
            request(app)
              .get('/api/products')
              .then((response) => {
                const requestTime = Date.now() - requestStartTime;
                results.responseTimes.push(requestTime);
                return response;
              })
          );
        }

        try {
          const responses = await Promise.all(batchRequests);
          responses.forEach((response) => {
            if (response.status === 200) {
              results.successCount++;
            } else {
              results.errorCount++;
            }
          });
        } catch (error) {
          results.errorCount += batchSize;
        }

        // 批次间短暂休息
        await new Promise((resolve) => setTimeout(resolve, 10));
      }

      results.totalTime = Date.now() - overallStartTime;

      // 计算统计数据
      const averageResponseTime =
        results.responseTimes.reduce((a, b) => a + b, 0) / results.responseTimes.length;
      const minResponseTime = Math.min(...results.responseTimes);
      const maxResponseTime = Math.max(...results.responseTimes);
      const successRate = (results.successCount / totalRequests) * 100;

      // 性能要求
      expect(successRate).toBeGreaterThanOrEqual(99); // 99%成功率
      expect(averageResponseTime).toBeLessThan(200); // 平均响应时间小于200ms
      expect(maxResponseTime).toBeLessThan(500); // 最大响应时间小于500ms

      console.log('=== 负载测试结果 ===');
      console.log(`总请求数: ${totalRequests}`);
      console.log(`成功请求: ${results.successCount}`);
      console.log(`失败请求: ${results.errorCount}`);
      console.log(`成功率: ${successRate.toFixed(2)}%`);
      console.log(`总时间: ${results.totalTime}ms`);
      console.log(`平均响应时间: ${averageResponseTime.toFixed(2)}ms`);
      console.log(`最小响应时间: ${minResponseTime}ms`);
      console.log(`最大响应时间: ${maxResponseTime}ms`);
      console.log(`吞吐量: ${((totalRequests / results.totalTime) * 1000).toFixed(2)} 请求/秒`);
    });
  });

  describe('内存性能测试', () => {
    test('大量数据处理不应该导致内存泄漏', async () => {
      const initialMemory = process.memoryUsage();

      // 使用不限制速率的产品列表API，减少请求次数
      for (let i = 0; i < 20; i++) {
        await request(app).get('/api/products').expect(200);
      }

      // 强制垃圾回收（如果可用）
      if (global.gc) {
        global.gc();
      }

      const finalMemory = process.memoryUsage();
      const memoryIncrease = finalMemory.heapUsed - initialMemory.heapUsed;

      // 内存增长应该在合理范围内（小于20MB，考虑20次API调用）
      expect(memoryIncrease).toBeLessThan(20 * 1024 * 1024);

      console.log('=== 内存使用情况 ===');
      console.log(`初始堆内存: ${(initialMemory.heapUsed / 1024 / 1024).toFixed(2)}MB`);
      console.log(`最终堆内存: ${(finalMemory.heapUsed / 1024 / 1024).toFixed(2)}MB`);
      console.log(`内存增长: ${(memoryIncrease / 1024 / 1024).toFixed(2)}MB`);
    });
  });

  describe('数据结构性能测试', () => {
    test('产品搜索算法性能测试', async () => {
      const Product = require('../../src/models/Product');
      const product = new Product();

      // 测试搜索性能
      const searchTerms = ['智能', '创新', '数字化', '平台', '解决方案', '技术', '服务', '系统'];
      const iterations = 1000;

      const startTime = Date.now();

      for (let i = 0; i < iterations; i++) {
        const searchTerm = searchTerms[i % searchTerms.length];
        product.searchProducts({
          keyword: searchTerm,
          sort: 'relevance',
          limit: 10,
        });
      }

      const totalTime = Date.now() - startTime;
      const averageTime = totalTime / iterations;

      // 每次搜索应该在合理时间内完成
      expect(averageTime).toBeLessThan(5); // 平均每次搜索小于5ms

      console.log('搜索算法性能测试:');
      console.log(`${iterations}次搜索总时间: ${totalTime}ms`);
      console.log(`平均每次搜索时间: ${averageTime.toFixed(3)}ms`);
    });

    test('相关性评分算法性能测试', async () => {
      const Product = require('../../src/models/Product');
      const product = new Product();
      const products = product.getAllProducts();

      const testQueries = ['智能平台', '创新解决方案', '数字化转型', '核心技术'];
      const iterations = 5000;

      const startTime = Date.now();

      for (let i = 0; i < iterations; i++) {
        const query = testQueries[i % testQueries.length];
        const testProduct = products[i % products.length];
        product.calculateRelevanceScore(testProduct, query);
      }

      const totalTime = Date.now() - startTime;
      const averageTime = totalTime / iterations;

      // 相关性评分应该很快
      expect(averageTime).toBeLessThan(1); // 平均每次评分小于1ms

      console.log('相关性评分性能测试:');
      console.log(`${iterations}次评分总时间: ${totalTime}ms`);
      console.log(`平均每次评分时间: ${averageTime.toFixed(3)}ms`);
    });
  });

  afterAll(() => {
    console.log('\n🏁 性能基准测试完成');
    console.log('📊 性能基线已建立，可用于后续性能监控和优化');
  });
});
