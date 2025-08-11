/**
 * 性能监控中间件
 */

// 性能数据存储（实际应该使用专业的监控服务如New Relic, DataDog等）
const performanceMetrics = {
  requests: [],
  errors: [],
  alerts: [],
  systemHealth: {
    cpu: { usage: 0, threshold: 80 },
    memory: { usage: 0, threshold: 90 },
    disk: { usage: 0, threshold: 85 },
    uptime: process.uptime(),
  },
};

// 请求性能监控中间件
const requestPerformanceMonitor = (req, res, next) => {
  const startTime = Date.now();
  const startMemory = process.memoryUsage();

  // 重写res.end方法以捕获响应完成时间
  const originalEnd = res.end;
  res.end = function (...args) {
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    const endMemory = process.memoryUsage();

    // 收集性能指标
    const metric = {
      timestamp: new Date().toISOString(),
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      responseTime: responseTime,
      userAgent: req.get('User-Agent') || 'Unknown',
      ip: req.ip || req.connection.remoteAddress,
      memoryBefore: startMemory,
      memoryAfter: endMemory,
      memoryDelta: {
        rss: endMemory.rss - startMemory.rss,
        heapUsed: endMemory.heapUsed - startMemory.heapUsed,
        heapTotal: endMemory.heapTotal - startMemory.heapTotal,
      },
    };

    // 添加到性能指标数组
    performanceMetrics.requests.push(metric);

    // 保持最近1000条记录
    if (performanceMetrics.requests.length > 1000) {
      performanceMetrics.requests.shift();
    }

    // 检查性能阈值
    checkPerformanceThresholds(metric);

    // 调用原始的end方法
    originalEnd.apply(this, args);
  };

  next();
};

// 错误监控中间件
const errorMonitor = (err, req, res, next) => {
  const errorInfo = {
    timestamp: new Date().toISOString(),
    message: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    userAgent: req.get('User-Agent'),
    ip: req.ip || req.connection.remoteAddress,
    statusCode: err.status || 500,
    severity: determineSeverity(err),
  };

  // 记录错误
  performanceMetrics.errors.push(errorInfo);

  // 保持最近500条错误记录
  if (performanceMetrics.errors.length > 500) {
    performanceMetrics.errors.shift();
  }

  // 检查错误率阈值
  checkErrorRateThreshold();

  console.error('Error monitored:', errorInfo);
  next(err);
};

// 系统资源监控
const systemResourceMonitor = () => {
  const usage = process.memoryUsage();
  const cpuUsage = process.cpuUsage();

  // 更新系统健康状况
  performanceMetrics.systemHealth = {
    timestamp: new Date().toISOString(),
    cpu: {
      usage: Math.random() * 30 + 10, // 模拟CPU使用率10-40%
      threshold: 80,
    },
    memory: {
      usage: Math.round((usage.heapUsed / usage.heapTotal) * 100),
      heapUsed: usage.heapUsed,
      heapTotal: usage.heapTotal,
      rss: usage.rss,
      threshold: 90,
    },
    disk: {
      usage: Math.random() * 20 + 30, // 模拟磁盘使用率30-50%
      threshold: 85,
    },
    uptime: process.uptime(),
    loadAverage: process.platform !== 'win32' ? require('os').loadavg() : [0, 0, 0],
  };

  // 检查系统资源阈值
  checkSystemResourceThresholds();
};

// 检查性能阈值
const checkPerformanceThresholds = (metric) => {
  const slowRequestThreshold = 2000; // 2秒
  const errorStatusCodes = [400, 401, 403, 404, 500, 502, 503, 504];

  // 慢请求告警
  if (metric.responseTime > slowRequestThreshold) {
    createAlert('slow_request', 'warning', {
      message: `慢请求检测: ${metric.url} 响应时间 ${metric.responseTime}ms`,
      threshold: slowRequestThreshold,
      actual: metric.responseTime,
      url: metric.url,
      method: metric.method,
    });
  }

  // HTTP错误状态码告警
  if (errorStatusCodes.includes(metric.statusCode)) {
    createAlert('http_error', 'error', {
      message: `HTTP错误: ${metric.method} ${metric.url} 返回 ${metric.statusCode}`,
      statusCode: metric.statusCode,
      url: metric.url,
      method: metric.method,
    });
  }

  // 内存使用异常告警
  if (metric.memoryDelta.heapUsed > 50 * 1024 * 1024) {
    // 50MB内存增长
    createAlert('memory_spike', 'warning', {
      message: `单次请求内存增长过大: ${Math.round(metric.memoryDelta.heapUsed / 1024 / 1024)}MB`,
      memoryDelta: metric.memoryDelta.heapUsed,
      url: metric.url,
    });
  }
};

// 检查错误率阈值
const checkErrorRateThreshold = () => {
  const last10Minutes = Date.now() - 10 * 60 * 1000;
  const recentRequests = performanceMetrics.requests.filter(
    (r) => new Date(r.timestamp).getTime() > last10Minutes
  );
  const recentErrors = performanceMetrics.errors.filter(
    (e) => new Date(e.timestamp).getTime() > last10Minutes
  );

  if (recentRequests.length > 50) {
    // 有足够样本
    const errorRate = (recentErrors.length / recentRequests.length) * 100;
    if (errorRate > 5) {
      // 错误率超过5%
      createAlert('high_error_rate', 'critical', {
        message: `错误率过高: ${errorRate.toFixed(2)}% (最近10分钟)`,
        errorRate: errorRate,
        totalRequests: recentRequests.length,
        totalErrors: recentErrors.length,
      });
    }
  }
};

// 检查系统资源阈值
const checkSystemResourceThresholds = () => {
  const health = performanceMetrics.systemHealth;

  // CPU使用率告警
  if (health.cpu.usage > health.cpu.threshold) {
    createAlert('high_cpu', 'critical', {
      message: `CPU使用率过高: ${health.cpu.usage.toFixed(2)}%`,
      usage: health.cpu.usage,
      threshold: health.cpu.threshold,
    });
  }

  // 内存使用率告警
  if (health.memory.usage > health.memory.threshold) {
    createAlert('high_memory', 'critical', {
      message: `内存使用率过高: ${health.memory.usage}%`,
      usage: health.memory.usage,
      threshold: health.memory.threshold,
      heapUsed: health.memory.heapUsed,
      heapTotal: health.memory.heapTotal,
    });
  }

  // 磁盘使用率告警
  if (health.disk.usage > health.disk.threshold) {
    createAlert('high_disk', 'warning', {
      message: `磁盘使用率过高: ${health.disk.usage.toFixed(2)}%`,
      usage: health.disk.usage,
      threshold: health.disk.threshold,
    });
  }
};

// 创建告警
const createAlert = (type, severity, details) => {
  const alert = {
    id: generateAlertId(),
    type: type,
    severity: severity,
    timestamp: new Date().toISOString(),
    details: details,
    status: 'active',
    acknowledged: false,
  };

  performanceMetrics.alerts.push(alert);

  // 保持最近100条告警
  if (performanceMetrics.alerts.length > 100) {
    performanceMetrics.alerts.shift();
  }

  // 根据严重程度决定是否立即通知
  if (severity === 'critical') {
    console.error(`[CRITICAL ALERT] ${details.message}`);
    // 这里可以集成邮件、短信、Slack等通知服务
    sendCriticalAlertNotification(alert);
  } else if (severity === 'error') {
    console.warn(`[ERROR ALERT] ${details.message}`);
  } else {
    console.info(`[WARNING ALERT] ${details.message}`);
  }
};

// 发送关键告警通知
const sendCriticalAlertNotification = async (alert) => {
  // 这里集成实际的通知服务
  console.log('发送关键告警通知:', {
    alert: alert,
    recipients: ['admin@chuqi-tech.com', 'ops@chuqi-tech.com'],
    channels: ['email', 'sms', 'slack'],
  });
};

// 确定错误严重程度
const determineSeverity = (err) => {
  if (err.status >= 500) return 'error';
  if (err.status >= 400) return 'warning';
  return 'info';
};

// 生成告警ID
const generateAlertId = () => {
  return 'alert_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
};

// 获取性能报告
const getPerformanceReport = () => {
  const now = Date.now();
  const last24Hours = now - 24 * 60 * 60 * 1000;
  const lastHour = now - 60 * 60 * 1000;

  const recent24hRequests = performanceMetrics.requests.filter(
    (r) => new Date(r.timestamp).getTime() > last24Hours
  );
  const recentHourRequests = performanceMetrics.requests.filter(
    (r) => new Date(r.timestamp).getTime() > lastHour
  );

  const recent24hErrors = performanceMetrics.errors.filter(
    (e) => new Date(e.timestamp).getTime() > last24Hours
  );

  // 计算统计指标
  const avgResponseTime =
    recent24hRequests.length > 0
      ? recent24hRequests.reduce((sum, r) => sum + r.responseTime, 0) / recent24hRequests.length
      : 0;

  const p95ResponseTime = calculatePercentile(
    recent24hRequests.map((r) => r.responseTime),
    95
  );
  const p99ResponseTime = calculatePercentile(
    recent24hRequests.map((r) => r.responseTime),
    99
  );

  return {
    timestamp: new Date().toISOString(),
    period: '24小时',
    requests: {
      total: recent24hRequests.length,
      lastHour: recentHourRequests.length,
      rps: recent24hRequests.length / (24 * 60 * 60), // 每秒请求数
      avgResponseTime: Math.round(avgResponseTime),
      p95ResponseTime: Math.round(p95ResponseTime),
      p99ResponseTime: Math.round(p99ResponseTime),
    },
    errors: {
      total: recent24hErrors.length,
      rate:
        recent24hRequests.length > 0
          ? (recent24hErrors.length / recent24hRequests.length) * 100
          : 0,
      byStatus: groupErrorsByStatus(recent24hErrors),
    },
    system: performanceMetrics.systemHealth,
    alerts: {
      active: performanceMetrics.alerts.filter((a) => a.status === 'active').length,
      critical: performanceMetrics.alerts.filter((a) => a.severity === 'critical').length,
      recent: performanceMetrics.alerts.slice(-10),
    },
  };
};

// 计算百分位数
const calculatePercentile = (values, percentile) => {
  if (values.length === 0) return 0;

  const sorted = values.sort((a, b) => a - b);
  const index = Math.ceil((percentile / 100) * sorted.length) - 1;
  return sorted[index] || 0;
};

// 按状态码分组错误
const groupErrorsByStatus = (errors) => {
  const grouped = {};
  errors.forEach((error) => {
    const status = error.statusCode;
    grouped[status] = (grouped[status] || 0) + 1;
  });
  return grouped;
};

// 启动系统资源监控
const startSystemMonitoring = () => {
  // 每30秒检查一次系统资源
  setInterval(systemResourceMonitor, 30000);
  console.log('系统资源监控已启动');
};

// 获取所有性能数据
const getAllMetrics = () => {
  return {
    requests: performanceMetrics.requests.slice(-100), // 最近100条请求
    errors: performanceMetrics.errors.slice(-50), // 最近50条错误
    alerts: performanceMetrics.alerts.slice(-20), // 最近20条告警
    systemHealth: performanceMetrics.systemHealth,
    report: getPerformanceReport(),
  };
};

module.exports = {
  requestPerformanceMonitor,
  errorMonitor,
  startSystemMonitoring,
  getPerformanceReport,
  getAllMetrics,
  createAlert,
};
