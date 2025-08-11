/**
 * 管理员控制器
 * 处理后台管理相关的业务逻辑
 */

const { User, Session } = require('../models');
const monitor = require('../utils/monitor');
const { cache } = require('../config/database');
const { exec } = require('child_process');
const fs = require('fs').promises;
const path = require('path');

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
  await new Promise((resolve) => setTimeout(resolve, 100));
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
  const actions = ['login', 'logout', 'register', 'profile_update', 'password_change', 'api_call'];
  const logs = [];

  for (let i = 0; i < 50; i++) {
    const level = levels[Math.floor(Math.random() * levels.length)];
    const action = actions[Math.floor(Math.random() * actions.length)];
    const timestamp = new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000);

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

/**
 * 渲染数据管理页面
 */
const renderBackupManagement = async (req, res) => {
  try {
    res.render('admin/backup', {
      title: '数据管理',
      layout: false,
      user: req.user,
    });
  } catch (error) {
    console.error('渲染数据管理页面失败:', error);
    res.status(500).render('500', {
      title: '服务器错误',
    });
  }
};

/**
 * 执行数据备份
 */
const performBackup = async (req, res) => {
  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const backupDir = path.join(process.cwd(), 'backups');

    // 确保备份目录存在
    await fs.mkdir(backupDir, { recursive: true });
    await fs.mkdir(path.join(backupDir, 'postgresql'), { recursive: true });
    await fs.mkdir(path.join(backupDir, 'redis'), { recursive: true });

    const results = {
      postgresql: null,
      redis: null,
      timestamp,
      success: false,
    };

    // PostgreSQL 备份
    const pgBackupFile = path.join(backupDir, 'postgresql', `backup_${timestamp}.sql`);
    const pgCommand = `pg_dump -h localhost -U postgres -d company_portal > "${pgBackupFile}"`;

    // Redis 备份
    const redisBackupFile = path.join(backupDir, 'redis', `backup_${timestamp}.rdb`);
    const redisCommand = `redis-cli --rdb "${redisBackupFile}"`;

    // 执行备份（模拟成功）
    results.postgresql = { file: pgBackupFile, size: '2.5MB' };
    results.redis = { file: redisBackupFile, size: '1.2MB' };
    results.success = true;

    res.json({
      success: true,
      message: '备份完成',
      filename: `backup_${timestamp}`,
      results,
    });
  } catch (error) {
    console.error('备份失败:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * 执行数据恢复
 */
const performRestore = async (req, res) => {
  try {
    const { backupFile } = req.body;

    if (!backupFile) {
      return res.status(400).json({
        success: false,
        error: '请选择备份文件',
      });
    }

    // 模拟恢复过程
    setTimeout(() => {
      res.json({
        success: true,
        message: `数据恢复完成: ${backupFile}`,
      });
    }, 2000);
  } catch (error) {
    console.error('恢复失败:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * 获取备份历史
 */
const getBackupHistory = async (req, res) => {
  try {
    // 模拟备份历史数据
    const backups = [
      {
        filename: 'backup_2025-01-30T15-00-00',
        date: '2025-01-30 15:00:00',
        size: '3.7MB',
        type: 'auto',
      },
      {
        filename: 'backup_2025-01-30T12-00-00',
        date: '2025-01-30 12:00:00',
        size: '3.5MB',
        type: 'auto',
      },
      {
        filename: 'backup_2025-01-30T09-00-00',
        date: '2025-01-30 09:00:00',
        size: '3.4MB',
        type: 'manual',
      },
      {
        filename: 'backup_2025-01-29T18-00-00',
        date: '2025-01-29 18:00:00',
        size: '3.2MB',
        type: 'auto',
      },
      {
        filename: 'backup_2025-01-29T15-00-00',
        date: '2025-01-29 15:00:00',
        size: '3.1MB',
        type: 'auto',
      },
    ];

    res.json(backups);
  } catch (error) {
    console.error('获取备份历史失败:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * 删除备份文件
 */
const deleteBackup = async (req, res) => {
  try {
    const { filename } = req.params;

    // 模拟删除操作
    res.json({
      success: true,
      message: `备份文件 ${filename} 已删除`,
    });
  } catch (error) {
    console.error('删除备份文件失败:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * 下载备份文件
 */
const downloadBackup = async (req, res) => {
  try {
    const { filename } = req.params;

    // 模拟文件下载
    res.json({
      success: true,
      message: '下载链接已生成',
      downloadUrl: `/admin/downloads/${filename}.zip`,
    });
  } catch (error) {
    console.error('下载备份文件失败:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * 渲染公司信息管理页面
 */
const renderCompanyManagement = async (req, res) => {
  try {
    const companyInfo = require('../config/company');
    const { texts } = require('../config/i18n');

    res.render('admin/company', {
      title: '公司信息管理',
      layout: false,
      user: req.user,
      company: companyInfo,
      texts: texts.zh,
    });
  } catch (error) {
    console.error('渲染公司信息管理页面失败:', error);
    res.status(500).render('500', {
      title: '服务器错误',
    });
  }
};

/**
 * 更新公司信息
 */
const updateCompanyInfo = async (req, res) => {
  try {
    const updates = req.body;
    const companyConfigPath = path.join(process.cwd(), 'src', 'config', 'company.js');

    // 读取当前配置文件
    const currentConfig = require('../config/company');

    // 深度合并更新数据
    const updatedConfig = deepMerge(currentConfig, updates);

    // 生成新的配置文件内容
    const configContent = `/**
 * 公司信息统一配置
 * 所有硬编码的公司信息都从这里获取
 */

const companyInfo = ${JSON.stringify(updatedConfig, null, 4)};

module.exports = companyInfo;`;

    // 写入配置文件
    await fs.writeFile(companyConfigPath, configContent, 'utf8');

    // 清除require缓存，使新配置生效
    delete require.cache[require.resolve('../config/company')];

    res.json({
      success: true,
      message: '公司信息更新成功',
      data: updatedConfig,
    });
  } catch (error) {
    console.error('更新公司信息失败:', error);
    res.status(500).json({
      success: false,
      message: '更新失败：' + error.message,
    });
  }
};

/**
 * 获取公司信息
 */
const getCompanyInfo = async (req, res) => {
  try {
    // 清除缓存确保获取最新信息
    delete require.cache[require.resolve('../config/company')];
    const companyInfo = require('../config/company');

    res.json({
      success: true,
      data: companyInfo,
    });
  } catch (error) {
    console.error('获取公司信息失败:', error);
    res.status(500).json({
      success: false,
      message: '获取失败：' + error.message,
    });
  }
};

/**
 * 深度合并对象
 */
function deepMerge(target, source) {
  const result = { ...target };

  for (const key in source) {
    if (Object.prototype.hasOwnProperty.call(source, key)) {
      if (typeof source[key] === 'object' && source[key] !== null && !Array.isArray(source[key])) {
        result[key] = deepMerge(target[key] || {}, source[key]);
      } else {
        result[key] = source[key];
      }
    }
  }

  return result;
}

module.exports = {
  renderDashboard,
  renderUserManagement,
  renderSystemMonitor,
  renderLogManagement,
  renderSystemSettings,
  renderBackupManagement,
  renderCompanyManagement,
  getSystemStatus,
  manageUser,
  updateSystemSettings,
  clearLogs,
  performBackup,
  performRestore,
  getBackupHistory,
  deleteBackup,
  downloadBackup,
  updateCompanyInfo,
  getCompanyInfo,
};
