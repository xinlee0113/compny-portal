/**
 * Analytics中间件
 * 集成Google Analytics和用户行为追踪
 */

// Google Analytics配置
const GA_TRACKING_ID = process.env.GA_TRACKING_ID || 'G-XXXXXXXXXX';

// 页面浏览统计
const pageViews = new Map();
const dailyStats = new Map();

/**
 * Google Analytics中间件
 */
exports.googleAnalytics = (req, res, next) => {
  // 注入Google Analytics脚本到所有页面
  const originalRender = res.render;

  res.render = function (view, locals = {}) {
    // 添加GA配置到模板变量
    locals.analytics = {
      gaTrackingId: GA_TRACKING_ID,
      enableAnalytics: process.env.NODE_ENV === 'production',
    };

    return originalRender.call(this, view, locals);
  };

  next();
};

/**
 * 页面访问统计中间件
 */
exports.pageViewTracker = (req, res, next) => {
  const path = req.path;
  const userAgent = req.get('User-Agent') || '';
  const ip = req.ip || req.connection.remoteAddress;
  const referer = req.get('Referer') || '';

  // 忽略静态资源和API请求
  if (
    path.startsWith('/css/') ||
    path.startsWith('/js/') ||
    path.startsWith('/images/') ||
    path.startsWith('/api/') ||
    path.includes('.')
  ) {
    return next();
  }

  // 记录页面访问
  const today = new Date().toISOString().split('T')[0];
  const pageKey = `${today}:${path}`;

  if (!pageViews.has(path)) {
    pageViews.set(path, {
      totalViews: 0,
      uniqueViews: new Set(),
      dailyViews: new Map(),
      referrers: new Map(),
      userAgents: new Map(),
    });
  }

  const pageData = pageViews.get(path);
  pageData.totalViews++;

  // 记录唯一访问者（基于IP）
  pageData.uniqueViews.add(ip);

  // 记录每日访问量
  if (!pageData.dailyViews.has(today)) {
    pageData.dailyViews.set(today, 0);
  }
  pageData.dailyViews.set(today, pageData.dailyViews.get(today) + 1);

  // 记录来源
  if (referer) {
    const refererCount = pageData.referrers.get(referer) || 0;
    pageData.referrers.set(referer, refererCount + 1);
  }

  // 记录用户代理（浏览器信息）
  const browser = parseBrowser(userAgent);
  const browserCount = pageData.userAgents.get(browser) || 0;
  pageData.userAgents.set(browser, browserCount + 1);

  // 记录全站统计
  if (!dailyStats.has(today)) {
    dailyStats.set(today, {
      totalViews: 0,
      uniqueVisitors: new Set(),
      pages: new Set(),
    });
  }

  const dayStats = dailyStats.get(today);
  dayStats.totalViews++;
  dayStats.uniqueVisitors.add(ip);
  dayStats.pages.add(path);

  // 记录访问日志
  console.log(
    `[Analytics] ${new Date().toISOString()} - ${req.method} ${path} - ${ip} - ${browser}`
  );

  next();
};

/**
 * 用户行为追踪API中间件
 */
exports.userBehaviorTracker = (req, res, next) => {
  // 为客户端提供行为追踪API
  if (req.path === '/api/analytics/track') {
    const { event, category, action, label, value } = req.body;

    // 记录用户行为事件
    console.log(
      `[Behavior] ${new Date().toISOString()} - Event: ${event}, Category: ${category}, Action: ${action}, Label: ${label}, Value: ${value}`
    );

    // 这里可以将数据发送到Google Analytics或其他分析服务

    return res.json({ success: true, message: 'Event tracked' });
  }

  next();
};

/**
 * 获取分析统计数据API
 */
exports.getAnalytics = (req, res) => {
  const { period = '7d', page } = req.query;

  try {
    const stats = generateAnalyticsReport(period, page);
    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({
      success: false,
      message: '获取分析数据失败',
    });
  }
};

/**
 * 生成分析报告
 */
function generateAnalyticsReport(period, specificPage) {
  const endDate = new Date();
  const startDate = new Date();

  // 计算时间范围
  switch (period) {
  case '1d':
    startDate.setDate(endDate.getDate() - 1);
    break;
  case '7d':
    startDate.setDate(endDate.getDate() - 7);
    break;
  case '30d':
    startDate.setDate(endDate.getDate() - 30);
    break;
  default:
    startDate.setDate(endDate.getDate() - 7);
  }

  const report = {
    period: period,
    dateRange: {
      start: startDate.toISOString().split('T')[0],
      end: endDate.toISOString().split('T')[0],
    },
    overview: {
      totalViews: 0,
      uniqueVisitors: 0,
      avgSessionDuration: 0,
      bounceRate: 0,
    },
    pages: [],
    referrers: [],
    browsers: [],
    dailyStats: [],
  };

  // 如果指定了特定页面
  if (specificPage && pageViews.has(specificPage)) {
    const pageData = pageViews.get(specificPage);
    report.pageSpecific = {
      path: specificPage,
      totalViews: pageData.totalViews,
      uniqueViews: pageData.uniqueViews.size,
      referrers: Array.from(pageData.referrers.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10),
      browsers: Array.from(pageData.userAgents.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10),
    };
  }

  // 汇总所有页面数据
  let totalUniqueVisitors = new Set();

  for (const [path, data] of pageViews.entries()) {
    report.overview.totalViews += data.totalViews;
    data.uniqueViews.forEach((visitor) => totalUniqueVisitors.add(visitor));

    report.pages.push({
      path: path,
      views: data.totalViews,
      uniqueViews: data.uniqueViews.size,
    });
  }

  report.overview.uniqueVisitors = totalUniqueVisitors.size;

  // 排序页面（按访问量）
  report.pages.sort((a, b) => b.views - a.views);
  report.pages = report.pages.slice(0, 20); // 取前20个页面

  // 汇总每日统计
  for (const [date, stats] of dailyStats.entries()) {
    if (date >= report.dateRange.start && date <= report.dateRange.end) {
      report.dailyStats.push({
        date: date,
        views: stats.totalViews,
        visitors: stats.uniqueVisitors.size,
        pages: stats.pages.size,
      });
    }
  }

  // 按日期排序
  report.dailyStats.sort((a, b) => a.date.localeCompare(b.date));

  return report;
}

/**
 * 解析浏览器信息
 */
function parseBrowser(userAgent) {
  if (!userAgent) return 'Unknown';

  if (userAgent.includes('Chrome') && !userAgent.includes('Edg')) return 'Chrome';
  if (userAgent.includes('Firefox')) return 'Firefox';
  if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) return 'Safari';
  if (userAgent.includes('Edg')) return 'Edge';
  if (userAgent.includes('Opera')) return 'Opera';
  if (userAgent.includes('bot') || userAgent.includes('Bot')) return 'Bot';

  return 'Other';
}

/**
 * 清理旧数据（可以设置定时任务调用）
 */
exports.cleanupOldData = () => {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const cutoffDate = thirtyDaysAgo.toISOString().split('T')[0];

  // 清理超过30天的每日统计数据
  for (const [date] of dailyStats.entries()) {
    if (date < cutoffDate) {
      dailyStats.delete(date);
    }
  }

  // 清理页面的每日访问数据
  for (const [path, data] of pageViews.entries()) {
    for (const [date] of data.dailyViews.entries()) {
      if (date < cutoffDate) {
        data.dailyViews.delete(date);
      }
    }
  }

  console.log(`[Analytics] Cleaned up data older than ${cutoffDate}`);
};
