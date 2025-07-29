/**
 * 监控和性能追踪工具
 */

class Monitor {
  constructor() {
    this.metrics = {
      requests: 0,
      errors: 0,
      responseTime: [],
      memoryUsage: [],
      startTime: Date.now(),
    };
    this.isProduction = process.env.NODE_ENV === 'production';
  }

  /**
   * 请求中间件
   */
  requestMiddleware() {
    return (req, res, next) => {
      const startTime = Date.now();

      // 增加请求计数
      this.metrics.requests++;

      // 监听响应完成
      res.on('finish', () => {
        const responseTime = Date.now() - startTime;
        this.recordResponseTime(responseTime);

        // 记录错误
        if (res.statusCode >= 400) {
          this.metrics.errors++;
          this.logError({
            method: req.method,
            url: req.url,
            statusCode: res.statusCode,
            responseTime,
            userAgent: req.get('User-Agent'),
            ip: req.ip,
          });
        }

        // 记录慢请求
        if (responseTime > 1000) {
          this.logSlowRequest({
            method: req.method,
            url: req.url,
            responseTime,
          });
        }
      });

      next();
    };
  }

  /**
   * 记录响应时间
   */
  recordResponseTime(time) {
    this.metrics.responseTime.push(time);

    // 保留最近1000条记录
    if (this.metrics.responseTime.length > 1000) {
      this.metrics.responseTime.shift();
    }
  }

  /**
   * 记录内存使用情况
   */
  recordMemoryUsage() {
    const usage = process.memoryUsage();
    this.metrics.memoryUsage.push({
      timestamp: Date.now(),
      rss: usage.rss,
      heapTotal: usage.heapTotal,
      heapUsed: usage.heapUsed,
      external: usage.external,
    });

    // 保留最近100条记录
    if (this.metrics.memoryUsage.length > 100) {
      this.metrics.memoryUsage.shift();
    }
  }

  /**
   * 获取系统健康状态
   */
  getHealthStatus() {
    const now = Date.now();
    const uptime = now - this.metrics.startTime;
    const avgResponseTime = this.getAverageResponseTime();
    const errorRate = this.getErrorRate();
    const memoryUsage = process.memoryUsage();

    const status = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: uptime,
      uptimeHuman: this.formatUptime(uptime),
      metrics: {
        totalRequests: this.metrics.requests,
        totalErrors: this.metrics.errors,
        errorRate: errorRate,
        averageResponseTime: avgResponseTime,
        currentMemoryUsage: {
          rss: `${Math.round(memoryUsage.rss / 1024 / 1024)}MB`,
          heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)}MB`,
          heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)}MB`,
        },
      },
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
    };

    // 判断健康状态
    if (errorRate > 0.1) {
      // 错误率超过10%
      status.status = 'unhealthy';
      status.issues = status.issues || [];
      status.issues.push('高错误率');
    }

    if (avgResponseTime > 2000) {
      // 平均响应时间超过2秒
      status.status = 'unhealthy';
      status.issues = status.issues || [];
      status.issues.push('响应时间过长');
    }

    if (memoryUsage.heapUsed > 500 * 1024 * 1024) {
      // 内存使用超过500MB
      status.status = 'warning';
      status.issues = status.issues || [];
      status.issues.push('内存使用偏高');
    }

    return status;
  }

  /**
   * 获取平均响应时间
   */
  getAverageResponseTime() {
    if (this.metrics.responseTime.length === 0) return 0;

    const sum = this.metrics.responseTime.reduce((acc, time) => acc + time, 0);
    return Math.round(sum / this.metrics.responseTime.length);
  }

  /**
   * 获取错误率
   */
  getErrorRate() {
    if (this.metrics.requests === 0) return 0;
    return this.metrics.errors / this.metrics.requests;
  }

  /**
   * 格式化运行时间
   */
  formatUptime(ms) {
    const seconds = Math.floor(ms / 1000) % 60;
    const minutes = Math.floor(ms / (1000 * 60)) % 60;
    const hours = Math.floor(ms / (1000 * 60 * 60)) % 24;
    const days = Math.floor(ms / (1000 * 60 * 60 * 24));

    if (days > 0) {
      return `${days}天 ${hours}小时 ${minutes}分钟`;
    } else if (hours > 0) {
      return `${hours}小时 ${minutes}分钟`;
    } else {
      return `${minutes}分钟 ${seconds}秒`;
    }
  }

  /**
   * 记录错误日志
   */
  logError(errorInfo) {
    const logData = {
      level: 'error',
      timestamp: new Date().toISOString(),
      ...errorInfo,
    };

    if (this.isProduction) {
      // 生产环境：发送到日志收集服务
      this.sendToLogService(logData);
    } else {
      // 开发环境：控制台输出
      console.error('❌ 错误:', logData);
    }
  }

  /**
   * 记录慢请求日志
   */
  logSlowRequest(requestInfo) {
    const logData = {
      level: 'warning',
      type: 'slow_request',
      timestamp: new Date().toISOString(),
      ...requestInfo,
    };

    if (this.isProduction) {
      this.sendToLogService(logData);
    } else {
      console.warn('⚠️  慢请求:', logData);
    }
  }

  /**
   * 发送日志到收集服务
   */
  sendToLogService(logData) {
    // 这里可以集成第三方日志服务，如：
    // - ELK Stack (Elasticsearch, Logstash, Kibana)
    // - Splunk
    // - CloudWatch Logs
    // - 自建日志服务

    // 目前暂时输出到控制台
    console.log('📊 Log:', JSON.stringify(logData));
  }

  /**
   * 启动定期监控
   */
  startPeriodicMonitoring() {
    // 每分钟记录一次内存使用情况
    setInterval(() => {
      this.recordMemoryUsage();
    }, 60000);

    // 每10分钟输出一次监控报告
    setInterval(() => {
      this.generateMonitoringReport();
    }, 600000);
  }

  /**
   * 生成监控报告
   */
  generateMonitoringReport() {
    const health = this.getHealthStatus();

    console.log('📊 系统监控报告:');
    console.log('================');
    console.log(`状态: ${health.status}`);
    console.log(`运行时间: ${health.uptimeHuman}`);
    console.log(`总请求数: ${health.metrics.totalRequests}`);
    console.log(`错误率: ${(health.metrics.errorRate * 100).toFixed(2)}%`);
    console.log(`平均响应时间: ${health.metrics.averageResponseTime}ms`);
    console.log(`内存使用: ${health.metrics.currentMemoryUsage.heapUsed}`);

    if (health.issues) {
      console.log(`⚠️  问题: ${health.issues.join(', ')}`);
    }
  }

  /**
   * 重置监控指标
   */
  reset() {
    this.metrics = {
      requests: 0,
      errors: 0,
      responseTime: [],
      memoryUsage: [],
      startTime: Date.now(),
    };
  }
}

// 创建单例
const monitor = new Monitor();

module.exports = monitor;
