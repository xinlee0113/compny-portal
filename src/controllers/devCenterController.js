/**
 * 开发中心控制器
 * 处理开发工具访问和页面渲染
 */

const { texts } = require('../config/i18n');
const companyInfo = require('../config/company');

// 开发工具配置
const DEV_TOOLS = {
  confluence: {
    name: 'Confluence',
    internalUrl: 'http://192.168.1.4/confluence',
    externalUrl: 'http://chuqi-cn.duckdns.org/confluence',
    port: '8090',
    status: 'running',
    description: '团队协作和知识管理平台',
  },
  jira: {
    name: 'Jira Software',
    internalUrl: 'http://192.168.1.4/jira',
    externalUrl: 'http://chuqi-cn.duckdns.org/jira',
    port: '8080',
    status: 'running',
    description: '项目管理和任务跟踪工具',
  },
  gerrit: {
    name: 'Gerrit Code Review',
    internalUrl: 'http://192.168.1.4/gerrit',
    externalUrl: 'http://chuqi-cn.duckdns.org/gerrit',
    port: '8081',
    status: 'running',
    description: '代码审查和版本控制平台',
  },
  jenkins: {
    name: 'Jenkins CI/CD',
    internalUrl: 'http://192.168.1.4/jenkins',
    externalUrl: 'http://chuqi-cn.duckdns.org/jenkins',
    port: '8082',
    status: 'running',
    description: '持续集成和持续部署平台',
  },
};

// 网络配置
const NETWORK_CONFIG = {
  internal: {
    ip: '192.168.1.4',
    subnet: '192.168.1.0/24',
  },
  external: {
    domain: 'chuqi-cn.duckdns.org',
    currentIp: '59.174.78.52', // 当前公网IP，可动态更新
    provider: 'DuckDNS',
  },
};

/**
 * 检测用户访问来源（内网/外网）
 */
const detectNetworkSource = (req) => {
  const clientIP = req.ip || req.connection.remoteAddress || req.headers['x-forwarded-for'];

  // 检查是否为内网IP
  const isInternal =
    clientIP.includes('192.168.1.') ||
    clientIP.includes('127.0.0.1') ||
    clientIP.includes('::1') ||
    clientIP.includes('localhost');

  return {
    isInternal,
    clientIP: clientIP,
    recommendedAccess: isInternal ? 'internal' : 'external',
  };
};

/**
 * 获取工具访问URL
 */
const getToolUrl = (toolName, accessType = 'external') => {
  const tool = DEV_TOOLS[toolName];
  if (!tool) return null;

  return accessType === 'internal' ? tool.internalUrl : tool.externalUrl;
};

/**
 * 渲染开发中心首页
 */
const renderDevCenter = async (req, res) => {
  try {
    const networkInfo = detectNetworkSource(req);

    // 构建工具列表，包含动态URL
    const toolsWithUrls = Object.keys(DEV_TOOLS).map((key) => ({
      key,
      ...DEV_TOOLS[key],
      ...texts.zh.devCenter.tools[key],
      internalAccess: getToolUrl(key, 'internal'),
      externalAccess: getToolUrl(key, 'external'),
      recommendedUrl: getToolUrl(key, networkInfo.recommendedAccess),
    }));

    const pageData = {
      title: texts.zh.devCenter.title,
      description: texts.zh.devCenter.description,
      keywords: 'DevOps, 开发中心, Confluence, Jira, Gerrit, Jenkins, CI/CD',
    };

    res.render('dev-center/index', {
      title: pageData.title,
      pageData,
      page: 'dev-center',
      texts: texts.zh,
      company: companyInfo,
      tools: toolsWithUrls,
      networkInfo,
      networkConfig: NETWORK_CONFIG,
      layout: false,
    });
  } catch (error) {
    console.error('渲染开发中心失败:', error);
    res.status(500).render('500', {
      title: '服务器错误',
      texts: texts.zh,
    });
  }
};

/**
 * 重定向到具体工具
 */
const redirectToTool = async (req, res) => {
  try {
    const { toolName } = req.params;
    const { access = 'auto' } = req.query;

    if (!DEV_TOOLS[toolName]) {
      return res.status(404).render('404', {
        title: '工具未找到',
        texts: texts.zh,
      });
    }

    const networkInfo = detectNetworkSource(req);
    let targetUrl;

    if (access === 'internal') {
      targetUrl = getToolUrl(toolName, 'internal');
    } else if (access === 'external') {
      targetUrl = getToolUrl(toolName, 'external');
    } else {
      // 自动选择
      targetUrl = getToolUrl(toolName, networkInfo.recommendedAccess);
    }

    // 记录访问日志
    console.log(
      `DevCenter访问: ${toolName}, 来源: ${networkInfo.clientIP}, 推荐: ${networkInfo.recommendedAccess}, 目标: ${targetUrl}`
    );

    res.redirect(targetUrl);
  } catch (error) {
    console.error('重定向到工具失败:', error);
    res.status(500).render('500', {
      title: '服务器错误',
      texts: texts.zh,
    });
  }
};

/**
 * 获取开发中心状态API
 */
const getDevCenterStatus = async (req, res) => {
  try {
    const networkInfo = detectNetworkSource(req);

    // 模拟检查工具状态（实际应用中可以ping或调用健康检查API）
    const toolsStatus = Object.keys(DEV_TOOLS).map((key) => ({
      name: key,
      displayName: DEV_TOOLS[key].name,
      status: DEV_TOOLS[key].status,
      internalUrl: DEV_TOOLS[key].internalUrl,
      externalUrl: DEV_TOOLS[key].externalUrl,
      port: DEV_TOOLS[key].port,
      lastCheck: new Date().toISOString(),
    }));

    res.json({
      success: true,
      data: {
        tools: toolsStatus,
        network: {
          ...networkInfo,
          config: NETWORK_CONFIG,
        },
        systemTime: new Date().toISOString(),
        serverInfo: {
          uptime: process.uptime(),
          memory: process.memoryUsage(),
          platform: process.platform,
        },
      },
    });
  } catch (error) {
    console.error('获取开发中心状态失败:', error);
    res.status(500).json({
      success: false,
      message: '获取状态失败：' + error.message,
    });
  }
};

/**
 * 更新外网IP地址
 */
const updateExternalIP = async (req, res) => {
  try {
    const { ip } = req.body;

    if (!ip || !/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(ip)) {
      return res.status(400).json({
        success: false,
        message: '无效的IP地址格式',
      });
    }

    // 更新外网IP配置
    NETWORK_CONFIG.external.currentIp = ip;

    // 记录更新日志
    console.log(`外网IP已更新: ${ip}, 时间: ${new Date().toISOString()}`);

    res.json({
      success: true,
      message: '外网IP更新成功',
      data: {
        newIp: ip,
        updateTime: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('更新外网IP失败:', error);
    res.status(500).json({
      success: false,
      message: '更新失败：' + error.message,
    });
  }
};

module.exports = {
  renderDevCenter,
  redirectToTool,
  getDevCenterStatus,
  updateExternalIP,
  DEV_TOOLS,
  NETWORK_CONFIG,
};
