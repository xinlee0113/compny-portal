/**
 * 监控工具测试
 */

const monitor = require('../../src/utils/monitor');

describe('Monitor', () => {
  beforeEach(() => {
    // 重置监控数据
    monitor.reset();
  });

  describe('基础功能', () => {
    test('应该正确初始化监控指标', () => {
      const health = monitor.getHealthStatus();

      expect(health.status).toBe('healthy');
      expect(health.metrics.totalRequests).toBe(0);
      expect(health.metrics.totalErrors).toBe(0);
      expect(health.metrics.errorRate).toBe(0);
      expect(health.metrics.averageResponseTime).toBe(0);
    });

    test('应该正确记录响应时间', () => {
      monitor.recordResponseTime(100);
      monitor.recordResponseTime(200);
      monitor.recordResponseTime(300);

      const avgTime = monitor.getAverageResponseTime();
      expect(avgTime).toBe(200);
    });

    test('应该正确计算错误率', () => {
      // 模拟5个请求，2个错误
      monitor.metrics.requests = 5;
      monitor.metrics.errors = 2;

      const errorRate = monitor.getErrorRate();
      expect(errorRate).toBe(0.4); // 2/5 = 0.4
    });

    test('应该限制响应时间记录数量', () => {
      // 添加超过1000条记录
      for (let i = 0; i < 1200; i++) {
        monitor.recordResponseTime(100);
      }

      expect(monitor.metrics.responseTime.length).toBe(1000);
    });
  });

  describe('健康状态检查', () => {
    test('应该返回健康状态', () => {
      const health = monitor.getHealthStatus();

      expect(health).toHaveProperty('status');
      expect(health).toHaveProperty('timestamp');
      expect(health).toHaveProperty('uptime');
      expect(health).toHaveProperty('uptimeHuman');
      expect(health).toHaveProperty('metrics');
      expect(health).toHaveProperty('version');
      expect(health).toHaveProperty('environment');
    });

    test('高错误率时应该返回不健康状态', () => {
      // 模拟高错误率场景
      monitor.metrics.requests = 100;
      monitor.metrics.errors = 15; // 15% 错误率

      const health = monitor.getHealthStatus();
      expect(health.status).toBe('unhealthy');
      expect(health.issues).toContain('高错误率');
    });

    test('响应时间过长时应该返回不健康状态', () => {
      // 模拟慢响应
      for (let i = 0; i < 10; i++) {
        monitor.recordResponseTime(3000); // 3秒响应时间
      }

      const health = monitor.getHealthStatus();
      expect(health.status).toBe('unhealthy');
      expect(health.issues).toContain('响应时间过长');
    });

    test('应该正确格式化运行时间', () => {
      const formatUptime = monitor.formatUptime.bind(monitor);

      expect(formatUptime(30000)).toBe('0分钟 30秒');
      expect(formatUptime(90000)).toBe('1分钟 30秒');
      expect(formatUptime(3600000)).toBe('1小时 0分钟');
      expect(formatUptime(90000000)).toBe('1天 1小时 0分钟');
    });
  });

  describe('内存监控', () => {
    test('应该正确记录内存使用情况', () => {
      monitor.recordMemoryUsage();

      expect(monitor.metrics.memoryUsage.length).toBe(1);
      expect(monitor.metrics.memoryUsage[0]).toHaveProperty('timestamp');
      expect(monitor.metrics.memoryUsage[0]).toHaveProperty('rss');
      expect(monitor.metrics.memoryUsage[0]).toHaveProperty('heapTotal');
      expect(monitor.metrics.memoryUsage[0]).toHaveProperty('heapUsed');
      expect(monitor.metrics.memoryUsage[0]).toHaveProperty('external');
    });

    test('应该限制内存记录数量', () => {
      // 添加超过100条记录
      for (let i = 0; i < 120; i++) {
        monitor.recordMemoryUsage();
      }

      expect(monitor.metrics.memoryUsage.length).toBe(100);
    });
  });

  describe('中间件功能', () => {
    test('应该返回有效的中间件函数', () => {
      const middleware = monitor.requestMiddleware();

      expect(typeof middleware).toBe('function');
      expect(middleware.length).toBe(3); // req, res, next
    });

    test('应该正确处理请求和响应', (done) => {
      const middleware = monitor.requestMiddleware();

      const mockReq = {
        method: 'GET',
        url: '/test',
        ip: '127.0.0.1',
        get: jest.fn().mockReturnValue('test-agent'),
      };

      const mockRes = {
        statusCode: 200,
        on: jest.fn((event, callback) => {
          if (event === 'finish') {
            // 模拟响应完成
            setTimeout(() => {
              callback();

              // 验证请求计数增加
              expect(monitor.metrics.requests).toBe(1);
              done();
            }, 10);
          }
        }),
      };

      const mockNext = jest.fn();

      middleware(mockReq, mockRes, mockNext);
      expect(mockNext).toHaveBeenCalled();
    });

    test('应该记录慢请求', () => {
      // 直接测试 logSlowRequest 方法
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      monitor.logSlowRequest({
        method: 'GET',
        url: '/slow-api',
        responseTime: 1500,
      });

      expect(consoleSpy).toHaveBeenCalledWith('⚠️  慢请求:', {
        level: 'warning',
        type: 'slow_request',
        timestamp: expect.any(String),
        method: 'GET',
        url: '/slow-api',
        responseTime: 1500,
      });

      consoleSpy.mockRestore();
    });

    test('应该记录错误状态码', (done) => {
      const middleware = monitor.requestMiddleware();

      // 模拟错误日志
      const logErrorSpy = jest.spyOn(monitor, 'logError').mockImplementation();

      const mockReq = {
        method: 'GET',
        url: '/error-api',
        ip: '127.0.0.1',
        get: jest.fn().mockReturnValue('test-agent'),
      };

      const mockRes = {
        statusCode: 500,
        on: jest.fn((event, callback) => {
          if (event === 'finish') {
            setTimeout(() => {
              callback();

              // 验证错误被记录
              setTimeout(() => {
                expect(logErrorSpy).toHaveBeenCalledWith({
                  method: 'GET',
                  url: '/error-api',
                  statusCode: 500,
                  responseTime: expect.any(Number),
                  userAgent: 'test-agent',
                  ip: '127.0.0.1',
                });

                logErrorSpy.mockRestore();
                done();
              }, 10);
            }, 10);
          }
        }),
      };

      const mockNext = jest.fn();

      middleware(mockReq, mockRes, mockNext);
    });
  });

  describe('日志功能', () => {
    test('应该正确记录错误日志', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      monitor.logError({
        method: 'GET',
        url: '/test',
        statusCode: 500,
        responseTime: 100,
      });

      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    test('应该正确记录慢请求日志', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      monitor.logSlowRequest({
        method: 'GET',
        url: '/test',
        responseTime: 2000,
      });

      expect(consoleSpy).toHaveBeenCalledWith('⚠️  慢请求:', {
        level: 'warning',
        type: 'slow_request',
        timestamp: expect.any(String),
        method: 'GET',
        url: '/test',
        responseTime: 2000,
      });

      consoleSpy.mockRestore();
    });
  });

  describe('报告生成', () => {
    test('应该生成监控报告', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      monitor.generateMonitoringReport();

      expect(consoleSpy).toHaveBeenCalledWith('📊 系统监控报告:');
      consoleSpy.mockRestore();
    });
  });

  describe('重置功能', () => {
    test('应该正确重置所有指标', () => {
      // 添加一些数据
      monitor.recordResponseTime(100);
      monitor.recordMemoryUsage();
      monitor.metrics.requests = 10;
      monitor.metrics.errors = 2;

      // 重置
      monitor.reset();

      // 验证重置后的状态
      expect(monitor.metrics.requests).toBe(0);
      expect(monitor.metrics.errors).toBe(0);
      expect(monitor.metrics.responseTime.length).toBe(0);
      expect(monitor.metrics.memoryUsage.length).toBe(0);
    });
  });
});
