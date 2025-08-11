/**
 * 在线客服聊天中间件
 */

// 聊天会话存储（实际应该使用数据库和WebSocket）
const chatSessions = new Map();
const supportAgents = new Map();

// 初始化支持代理
const initializeSupportAgents = () => {
  supportAgents.set('agent1', {
    id: 'agent1',
    name: '小云',
    avatar: '/images/support/agent1.jpg',
    status: 'online',
    specialty: ['技术咨询', '产品介绍'],
    currentSessions: 0,
    maxSessions: 5,
    lastActive: new Date(),
  });

  supportAgents.set('agent2', {
    id: 'agent2',
    name: '小智',
    avatar: '/images/support/agent2.jpg',
    status: 'online',
    specialty: ['项目咨询', '商务洽谈'],
    currentSessions: 0,
    maxSessions: 3,
    lastActive: new Date(),
  });

  supportAgents.set('bot1', {
    id: 'bot1',
    name: '智能助手',
    avatar: '/images/support/bot.jpg',
    status: 'online',
    specialty: ['常见问题', '自动回复'],
    currentSessions: 0,
    maxSessions: 100,
    lastActive: new Date(),
    isBot: true,
  });
};

// 自动回复规则
const autoReplyRules = [
  {
    keywords: ['价格', '费用', '多少钱', '报价'],
    response:
      '感谢您的咨询！我们的服务费用根据项目复杂度和需求而定。基础开发服务起价30万元，具体报价需要了解您的详细需求。请问您的项目主要涉及哪个平台？（Android Automotive / QNX / Linux）',
  },
  {
    keywords: ['周期', '时间', '多久', '什么时候'],
    response:
      '项目开发周期通常为2-6个月，具体时间取决于：\n1. 功能复杂度\n2. 平台数量\n3. 集成要求\n4. 测试标准\n\n我们会在需求分析后提供详细的项目计划。您希望了解哪类项目的开发周期？',
  },
  {
    keywords: ['Android Automotive', 'AAOS', '安卓车载'],
    response:
      '我们在Android Automotive开发方面经验丰富！主要服务包括：\n• 车载应用开发\n• 系统定制优化\n• CAN总线集成\n• 第三方服务对接\n• 测试验证\n\n已完成20+项目，涵盖信息娱乐、导航、车控等领域。您的项目主要需求是什么？',
  },
  {
    keywords: ['QNX', 'qnx'],
    response:
      'QNX是我们的专业领域之一！我们提供：\n• QNX应用开发\n• 实时系统优化\n• 硬件适配\n• 性能调优\n• 安全认证支持\n\n团队有5年+QNX开发经验，服务过多家主机厂。您的QNX项目有什么特殊要求吗？',
  },
  {
    keywords: ['你好', 'hello', 'hi', '在吗'],
    response:
      '您好！欢迎咨询楚起科技车载应用开发服务 😊\n\n我们专注于：\n🚗 Android Automotive开发\n🔧 QNX/Linux车载系统\n🛠️ 系统集成与优化\n🧪 测试验证服务\n\n请问您需要了解哪方面的信息？我会尽快为您解答！',
  },
  {
    keywords: ['联系', '电话', '微信', '邮箱'],
    response:
      '您可以通过以下方式联系我们：\n\n📞 电话：+86-10-8888-8888\n📧 邮箱：info@chuqi-tech.com\n💬 微信：ChuQiTech2024\n🏢 地址：北京市海淀区中关村软件园\n\n工作时间：周一至周五 9:00-18:00\n我们的技术专家会在24小时内回复您的咨询！',
  },
];

// 初始化聊天配置
const initializeChatConfig = (req, res, next) => {
  if (!supportAgents.size) {
    initializeSupportAgents();
  }

  const chatConfig = {
    enabled: true,
    position: 'bottom-right',
    theme: 'blue',
    welcomeMessage: '您好！我是楚起科技的客服助手，有什么可以帮助您的吗？',
    offlineMessage: '当前客服不在线，请留言或发送邮件至 info@chuqi-tech.com',
    autoReply: true,
    showTyping: true,
    maxMessageLength: 500,
    supportedFiles: ['jpg', 'png', 'pdf', 'doc', 'docx'],
    agentInfo: {
      name: '智云客服',
      avatar: '/images/support/default.jpg',
      department: '技术支持部',
    },
  };

  res.locals.chatConfig = chatConfig;
  res.locals.chatEnabled = true;

  next();
};

// 创建聊天会话
const createChatSession = (userId, userAgent, ip) => {
  const sessionId = generateSessionId();
  const availableAgent = findAvailableAgent();

  const session = {
    id: sessionId,
    userId: userId,
    agentId: availableAgent ? availableAgent.id : 'bot1',
    startTime: new Date(),
    lastActivity: new Date(),
    status: 'active',
    messages: [
      {
        id: 1,
        sender: 'agent',
        senderName: availableAgent ? availableAgent.name : '智能助手',
        content: '您好！我是楚起科技的客服助手。请问有什么可以帮助您的吗？',
        timestamp: new Date(),
        type: 'text',
      },
    ],
    userInfo: {
      userAgent: userAgent,
      ip: ip,
      joinTime: new Date(),
    },
    tags: [],
    rating: null,
    resolved: false,
  };

  chatSessions.set(sessionId, session);

  if (availableAgent && !availableAgent.isBot) {
    availableAgent.currentSessions++;
  }

  return session;
};

// 查找可用客服
const findAvailableAgent = () => {
  const onlineAgents = Array.from(supportAgents.values())
    .filter((agent) => agent.status === 'online' && agent.currentSessions < agent.maxSessions)
    .sort((a, b) => a.currentSessions - b.currentSessions);

  return onlineAgents.length > 0 ? onlineAgents[0] : null;
};

// 处理聊天消息
const processChatMessage = (sessionId, message, sender = 'user') => {
  const session = chatSessions.get(sessionId);
  if (!session) {
    return { success: false, error: 'Session not found' };
  }

  // 添加用户消息
  const messageId = session.messages.length + 1;
  const userMessage = {
    id: messageId,
    sender: sender,
    senderName: sender === 'user' ? '您' : 'AI助手',
    content: message,
    timestamp: new Date(),
    type: 'text',
  };

  session.messages.push(userMessage);
  session.lastActivity = new Date();

  // 自动回复逻辑
  let autoReply = null;
  if (sender === 'user') {
    const agent = supportAgents.get(session.agentId);
    if (agent && agent.isBot) {
      autoReply = generateAutoReply(message);
      if (autoReply) {
        const replyMessage = {
          id: messageId + 1,
          sender: 'agent',
          senderName: agent.name,
          content: autoReply,
          timestamp: new Date(),
          type: 'text',
          isAutoReply: true,
        };
        session.messages.push(replyMessage);
      }
    }
  }

  return {
    success: true,
    message: userMessage,
    autoReply: autoReply,
    session: session,
  };
};

// 生成自动回复
const generateAutoReply = (message) => {
  const messageText = message.toLowerCase();

  for (const rule of autoReplyRules) {
    const matchedKeyword = rule.keywords.find((keyword) =>
      messageText.includes(keyword.toLowerCase())
    );
    if (matchedKeyword) {
      return rule.response;
    }
  }

  // 默认回复
  return '感谢您的咨询！我已经收到您的消息。如需更详细的技术支持，请稍等，我们的技术专家会尽快为您解答。您也可以查看我们的技术博客或下载相关资料。';
};

// 生成会话ID
const generateSessionId = () => {
  return 'chat_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
};

// 获取聊天历史
const getChatHistory = (sessionId) => {
  const session = chatSessions.get(sessionId);
  return session ? session.messages : [];
};

// 结束聊天会话
const endChatSession = (sessionId, rating = null, feedback = null) => {
  const session = chatSessions.get(sessionId);
  if (!session) {
    return { success: false, error: 'Session not found' };
  }

  session.status = 'ended';
  session.endTime = new Date();
  session.rating = rating;
  session.feedback = feedback;

  const agent = supportAgents.get(session.agentId);
  if (agent && !agent.isBot) {
    agent.currentSessions = Math.max(0, agent.currentSessions - 1);
  }

  return { success: true, session: session };
};

// 获取客服状态
const getSupportStatus = () => {
  const agents = Array.from(supportAgents.values());
  const onlineAgents = agents.filter((a) => a.status === 'online');
  const availableAgents = onlineAgents.filter((a) => a.currentSessions < a.maxSessions);

  return {
    totalAgents: agents.length,
    onlineAgents: onlineAgents.length,
    availableAgents: availableAgents.length,
    activeSessions: Array.from(chatSessions.values()).filter((s) => s.status === 'active').length,
    isServiceAvailable: availableAgents.length > 0,
  };
};

module.exports = {
  initializeChatConfig,
  createChatSession,
  processChatMessage,
  getChatHistory,
  endChatSession,
  getSupportStatus,
  findAvailableAgent,
};
