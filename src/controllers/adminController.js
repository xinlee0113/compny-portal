/**
 * 管理员控制器
 * 处理后台管理相关的业务逻辑
 */

const { User, Session } = require('../models');
const monitor = require('../utils/monitor');
const { cache } = require('../config/database');

/**
 * 渲染管理员面板首页
 */
const renderDashboard = async (req, res) => {
  try {
    // 获取系统统计数据
    const stats = await getSystemStats();

    res.render('admin/dashboard', {
      title: '管理员面板',
      layout: false,
      user: req.user,
      stats,
    });
  } catch (error) {
    console.error('渲染管理员面板失败:', error);
    res.status(500).render('500', {
      title: '服务器错误',
    });
  }
};

/**
 * 获取系统统计数据
 */
const getSystemStats = async () => {
  try {
    // 模拟数据，实际应从数据库获取
    const stats = {
      users: {
        total: 150,
        active: 89,
        newToday: 5,
        trend: '+12%',
      },
      sessions: {
        online: 23,
        total: 456,
        avgDuration: '25分钟',
        trend: '+8%',
      },
      system: {
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        cpu: await getCpuUsage(),
        requests: monitor.getStats(),
      },
      security: {
        blockedIPs: 12,
        suspiciousAttempts: 3,
        successfulLogins: 234,
        failedLogins: 18,
      },
    };

    return stats;
  } catch (error) {
    console.error('获取系统统计失败:', error);
    return null;
  }
};

/**
 * 获取CPU使用率（模拟）
 */
const getCpuUsage = async () => {
  // 简单的CPU使用率检测
  const startUsage = process.cpuUsage();
  await new Promise(resolve => setTimeout(resolve, 100));
  const endUsage = process.cpuUsage(startUsage);

  const totalUsage = endUsage.user + endUsage.system;
  const percentage = Math.round((totalUsage / 100000) * 100) / 100;

  return Math.min(percentage, 100);
};

/**
 * 用户管理页面
 */
const renderUserManagement = async (req, res) => {
  try {
    // 模拟用户数据
    const users = getMockUsers();

    res.render('admin/users', {
      title: '用户管理',
      layout: false,
      user: req.user,
      users,
    });
  } catch (error) {
    console.error('渲染用户管理页面失败:', error);
    res.status(500).render('500', {
      title: '服务器错误',
    });
  }
};

/**
 * 获取模拟用户数据
 */
const getMockUsers = () => {
  return [
    {
      id: '1',
      username: 'admin',
      email: 'admin@company.com',
      firstName: '系统',
      lastName: '管理员',
      role: 'admin',
      status: 'active',
      lastLogin: new Date('2025-07-29T00:30:00Z'),
      createdAt: new Date('2025-01-01T00:00:00Z'),
      loginCount: 324,
    },
    {
      id: '2',
      username: 'manager1',
      email: 'manager1@company.com',
      firstName: '李',
      lastName: '经理',
      role: 'manager',
      status: 'active',
      lastLogin: new Date('2025-07-28T16:45:00Z'),
      createdAt: new Date('2025-02-15T00:00:00Z'),
      loginCount: 156,
    },
    {
      id: '3',
      username: 'employee1',
      email: 'employee1@company.com',
      firstName: '张',
      lastName: '员工',
      role: 'employee',
      status: 'active',
      lastLogin: new Date('2025-07-28T18:20:00Z'),
      createdAt: new Date('2025-03-10T00:00:00Z'),
      loginCount: 89,
    },
    {
      id: '4',
      username: 'testuser',
      email: 'test@example.com',
      firstName: '测试',
      lastName: '用户',
      role: 'user',
      status: 'pending',
      lastLogin: null,
      createdAt: new Date('2025-07-25T00:00:00Z'),
      loginCount: 0,
    },
    {
      id: '5',
      username: 'suspended',
      email: 'suspended@example.com',
      firstName: '被暂停',
      lastName: '用户',
      role: 'user',
      status: 'suspended',
      lastLogin: new Date('2025-07-20T00:00:00Z'),
      createdAt: new Date('2025-05-01T00:00:00Z'),
      loginCount: 12,
    },
  ];
};

/**
 * 系统监控页面
 */
const renderSystemMonitor = async (req, res) => {
  try {
    const systemInfo = {
      server: {
        nodeVersion: process.version,
        platform: process.platform,
        architecture: process.arch,
        uptime: process.uptime(),
        pid: process.pid,
      },
      memory: process.memoryUsage(),
      performance: monitor.getStats(),
      environment: {
        nodeEnv: process.env.NODE_ENV || 'development',
        port: process.env.PORT || 3001,
        httpsEnabled: !!process.env.HTTPS_PORT,
      },
    };

    res.render('admin/monitor', {
      title: '系统监控',
      layout: false,
      user: req.user,
      systemInfo,
    });
  } catch (error) {
    console.error('渲染系统监控页面失败:', error);
    res.status(500).render('500', {
      title: '服务器错误',
    });
  }
};

/**
 * 日志管理页面
 */
const renderLogManagement = async (req, res) => {
  try {
    // 模拟日志数据
    const logs = getMockLogs();

    res.render('admin/logs', {
      title: '日志管理',
      layout: false,
      user: req.user,
      logs,
    });
  } catch (error) {
    console.error('渲染日志管理页面失败:', error);
    res.status(500).render('500', {
      title: '服务器错误',
    });
  }
};

/**
 * 获取模拟日志数据
 */
const getMockLogs = () => {
  const levels = ['info', 'warn', 'error', 'debug'];
  const actions = [
    'login',
    'logout',
    'register',
    'profile_update',
    'password_change',
    'api_call',
  ];
  const logs = [];

  for (let i = 0; i < 50; i++) {
    const level = levels[Math.floor(Math.random() * levels.length)];
    const action = actions[Math.floor(Math.random() * actions.length)];
    const timestamp = new Date(
      Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000
    );

    logs.push({
      id: i + 1,
      level,
      action,
      message: `用户执行${action}操作`,
      ip: `192.168.1.${Math.floor(Math.random() * 255)}`,
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      userId: Math.floor(Math.random() * 100) + 1,
      timestamp,
      details: {
        endpoint: '/api/auth/' + action,
        statusCode: level === 'error' ? 500 : 200,
        responseTime: Math.floor(Math.random() * 500) + 10,
      },
    });
  }

  return logs.sort((a, b) => b.timestamp - a.timestamp);
};

/**
 * 系统设置页面
 */
const renderSystemSettings = async (req, res) => {
  try {
    const settings = {
      security: {
        passwordMinLength: 6,
        sessionTimeout: 7 * 24 * 60, // 7天，分钟
        maxLoginAttempts: 5,
        lockoutDuration: 15 * 60, // 15分钟，秒
        enableTwoFactor: false,
      },
      system: {
        siteName: '车载应用开发服务公司',
        adminEmail: 'admin@company.com',
        maintenance: false,
        registrationEnabled: true,
        emailVerificationRequired: false,
      },
      performance: {
        enableCaching: true,
        cacheTimeout: 60 * 60, // 1小时，秒
        enableCompression: true,
        maxRequestSize: 10, // MB
        enableRateLimit: true,
      },
    };

    res.render('admin/settings', {
      title: '系统设置',
      layout: false,
      user: req.user,
      settings,
    });
  } catch (error) {
    console.error('渲染系统设置页面失败:', error);
    res.status(500).render('500', {
      title: '服务器错误',
    });
  }
};

/**
 * API: 获取实时系统状态
 */
const getSystemStatus = async (req, res) => {
  try {
    const status = {
      timestamp: new Date().toISOString(),
      server: {
        status: 'online',
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        cpu: await getCpuUsage(),
      },
      database: {
        status: 'disconnected', // 实际项目中应检查数据库连接
        connections: 0,
      },
      cache: {
        status: 'disconnected', // 实际项目中应检查Redis连接
        connections: 0,
      },
      performance: monitor.getStats(),
    };

    res.json({
      success: true,
      data: status,
    });
  } catch (error) {
    console.error('获取系统状态失败:', error);
    res.status(500).json({
      success: false,
      message: '获取系统状态失败',
      code: 'SYSTEM_STATUS_ERROR',
    });
  }
};

/**
 * API: 用户管理操作
 */
const manageUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { action, ...data } = req.body;

    // 在实际项目中，这里应该操作数据库
    switch (action) {
      case 'update_status':
        // 更新用户状态
        res.json({
          success: true,
          message: '用户状态更新成功',
          data: { userId, status: data.status },
        });
        break;

      case 'update_role':
        // 更新用户角色
        res.json({
          success: true,
          message: '用户角色更新成功',
          data: { userId, role: data.role },
        });
        break;

      case 'reset_password':
        // 重置用户密码
        res.json({
          success: true,
          message: '密码重置成功，新密码已发送到用户邮箱',
          data: { userId },
        });
        break;

      default:
        res.status(400).json({
          success: false,
          message: '无效的操作类型',
          code: 'INVALID_ACTION',
        });
    }
  } catch (error) {
    console.error('用户管理操作失败:', error);
    res.status(500).json({
      success: false,
      message: '用户管理操作失败',
      code: 'USER_MANAGEMENT_ERROR',
    });
  }
};

/**
 * API: 更新系统设置
 */
const updateSystemSettings = async (req, res) => {
  try {
    const { category, settings } = req.body;

    // 在实际项目中，这里应该更新配置文件或数据库
    console.log(`更新${category}设置:`, settings);

    res.json({
      success: true,
      message: '系统设置更新成功',
      data: { category, settings },
    });
  } catch (error) {
    console.error('更新系统设置失败:', error);
    res.status(500).json({
      success: false,
      message: '更新系统设置失败',
      code: 'SETTINGS_UPDATE_ERROR',
    });
  }
};

/**
 * API: 清理系统日志
 */
const clearLogs = async (req, res) => {
  try {
    const { category, days } = req.body;

    // 在实际项目中，这里应该清理日志文件或数据库记录
    console.log(`清理${category}日志，保留${days}天`);

    res.json({
      success: true,
      message: '日志清理成功',
      data: { category, days, cleared: Math.floor(Math.random() * 1000) },
    });
  } catch (error) {
    console.error('清理日志失败:', error);
    res.status(500).json({
      success: false,
      message: '清理日志失败',
      code: 'LOG_CLEANUP_ERROR',
    });
  }
};

module.exports = {
  renderDashboard,
  renderUserManagement,
  renderSystemMonitor,
  renderLogManagement,
  renderSystemSettings,
  getSystemStatus,
  manageUser,
  updateSystemSettings,
  clearLogs,
};
