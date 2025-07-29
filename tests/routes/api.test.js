/**
 * API路由测试
 */

const request = require('supertest');
const express = require('express');
const monitor = require('../../src/utils/monitor');

// 创建测试应用
const app = express();
app.use(express.json());

// 添加监控中间件
app.use(monitor.requestMiddleware());

// 引入API路由
app.use('/api', require('../../src/routes/api'));

describe('API Routes', () => {
  beforeEach(() => {
    // 重置监控数据
    monitor.reset();
  });

  describe('GET /api/status', () => {
    test('应该返回API状态信息', async () => {
      const response = await request(app).get('/api/status').expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message', 'API服务正常运行');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('version', '1.0.0');
    });
  });

  describe('GET /api/health', () => {
    test('应该返回系统健康状态', async () => {
      const response = await request(app).get('/api/health').expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('status');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('uptime');
      expect(response.body).toHaveProperty('uptimeHuman');
      expect(response.body).toHaveProperty('metrics');
      expect(response.body).toHaveProperty('version');
      expect(response.body).toHaveProperty('environment');
    });

    test('健康状态应该包含正确的指标', async () => {
      const response = await request(app).get('/api/health').expect(200);

      const metrics = response.body.metrics;
      expect(metrics).toHaveProperty('totalRequests');
      expect(metrics).toHaveProperty('totalErrors');
      expect(metrics).toHaveProperty('errorRate');
      expect(metrics).toHaveProperty('averageResponseTime');
      expect(metrics).toHaveProperty('currentMemoryUsage');
    });

    test('应该正确报告健康状态', async () => {
      const response = await request(app).get('/api/health').expect(200);

      expect(['healthy', 'warning', 'unhealthy']).toContain(
        response.body.status
      );
    });
  });

  describe('GET /api/metrics', () => {
    test('应该返回监控指标', async () => {
      const response = await request(app).get('/api/metrics').expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('metrics');
      expect(response.body).toHaveProperty('timestamp');
    });

    test('监控指标应该包含所有必要数据', async () => {
      const response = await request(app).get('/api/metrics').expect(200);

      const metrics = response.body.metrics;
      expect(metrics).toHaveProperty('totalRequests');
      expect(metrics).toHaveProperty('totalErrors');
      expect(metrics).toHaveProperty('errorRate');
      expect(metrics).toHaveProperty('averageResponseTime');
      expect(typeof metrics.totalRequests).toBe('number');
      expect(typeof metrics.errorRate).toBe('number');
    });
  });

  describe('GET /api/docs', () => {
    test('应该返回API文档', async () => {
      const response = await request(app).get('/api/docs').expect(200);

      expect(response.body).toHaveProperty('title');
      expect(response.body).toHaveProperty('version');
      expect(response.body).toHaveProperty('endpoints');
      expect(response.body.endpoints).toHaveProperty('products');
      expect(response.body.endpoints).toHaveProperty('system');
    });

    test('API文档应该包含健康检查端点', async () => {
      const response = await request(app).get('/api/docs').expect(200);

      const systemEndpoints = response.body.endpoints.system;
      expect(systemEndpoints).toHaveProperty('GET /health');
      expect(systemEndpoints).toHaveProperty('GET /metrics');
    });
  });

  describe('监控中间件集成', () => {
    test('应该正确记录请求统计', async () => {
      // 发送几个请求
      await request(app).get('/api/status');
      await request(app).get('/api/health');
      await request(app).get('/api/metrics');

      const response = await request(app).get('/api/metrics').expect(200);

      const metrics = response.body.metrics;
      expect(metrics.totalRequests).toBeGreaterThan(0);
      expect(metrics.errorRate).toBe(0);
    });

    test('应该记录错误统计', async () => {
      // 请求不存在的端点
      await request(app).get('/api/nonexistent').expect(404);

      const response = await request(app).get('/api/metrics').expect(200);

      const metrics = response.body.metrics;
      expect(metrics.totalErrors).toBeGreaterThan(0);
      expect(metrics.errorRate).toBeGreaterThan(0);
    });

    test('应该测量响应时间', async () => {
      await request(app).get('/api/status');

      const response = await request(app).get('/api/metrics').expect(200);

      const metrics = response.body.metrics;
      expect(metrics.averageResponseTime).toBeGreaterThanOrEqual(0);
    });
  });

  describe('错误处理', () => {
    test('不存在的API端点应该返回404', async () => {
      await request(app).get('/api/nonexistent').expect(404);

      // 验证这被记录为错误
      const metricsResponse = await request(app)
        .get('/api/metrics')
        .expect(200);

      expect(metricsResponse.body.metrics.totalErrors).toBeGreaterThan(0);
    });

    test('健康检查错误应该被正确处理', async () => {
      // 模拟监控系统错误
      const originalGetHealthStatus = monitor.getHealthStatus;
      monitor.getHealthStatus = jest.fn(() => {
        throw new Error('模拟错误');
      });

      const response = await request(app).get('/api/health').expect(500);

      expect(response.body.success).toBe(false);
      expect(response.body.status).toBe('error');
      expect(response.body.message).toBe('健康检查失败');

      // 恢复原始方法
      monitor.getHealthStatus = originalGetHealthStatus;
    });

    test('监控指标错误应该被正确处理', async () => {
      // 模拟监控系统错误
      const originalGetHealthStatus = monitor.getHealthStatus;
      monitor.getHealthStatus = jest.fn(() => {
        throw new Error('模拟错误');
      });

      const response = await request(app).get('/api/metrics').expect(500);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('获取监控指标失败');

      // 恢复原始方法
      monitor.getHealthStatus = originalGetHealthStatus;
    });
  });

  describe('性能测试', () => {
    test('健康检查应该在合理时间内响应', async () => {
      const startTime = Date.now();

      await request(app).get('/api/health').expect(200);

      const responseTime = Date.now() - startTime;
      expect(responseTime).toBeLessThan(100); // 应该在100ms内响应
    });

    test('监控指标应该在合理时间内响应', async () => {
      const startTime = Date.now();

      await request(app).get('/api/metrics').expect(200);

      const responseTime = Date.now() - startTime;
      expect(responseTime).toBeLessThan(100); // 应该在100ms内响应
    });

    test('大量请求下应该保持性能', async () => {
      const requests = [];
      for (let i = 0; i < 10; i++) {
        requests.push(request(app).get('/api/health'));
      }

      const startTime = Date.now();
      await Promise.all(requests);
      const totalTime = Date.now() - startTime;

      expect(totalTime).toBeLessThan(500); // 10个请求应该在500ms内完成
    });
  });
});
