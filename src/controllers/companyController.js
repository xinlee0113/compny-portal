/**
 * 公司相关页面控制器
 */

// 团队介绍页面
exports.team = (req, res) => {
  const pageData = {
    title: '我们的团队',
    description: '智云科技拥有一支专业的车载应用开发团队，致力于提供卓越的技术解决方案',
    teamStats: {
      totalMembers: 45,
      averageExperience: 8,
      projectsCompleted: 150,
      clientSatisfaction: 98,
    },
    leadership: [
      {
        name: '张志强',
        position: '创始人 & CEO',
        experience: '15年车载行业经验',
        bio: '前某知名车企技术总监，专注于车载应用开发和系统架构设计，拥有多项技术专利',
        avatar: '/images/team/ceo.jpg',
        social: {
          linkedin: 'https://linkedin.com/in/zhangzhiqiang',
          email: 'zhangzq@zhiyun-tech.com',
        },
        achievements: ['IEEE高级会员', '车载技术专家', '技术创新奖获得者'],
      },
      {
        name: '李晓婷',
        position: 'CTO & 技术总监',
        experience: '12年软件开发经验',
        bio: '前Google Android团队成员，Android Automotive领域资深专家，主导了多个大型车载项目',
        avatar: '/images/team/cto.jpg',
        social: {
          linkedin: 'https://linkedin.com/in/lixiaoting',
          email: 'lixt@zhiyun-tech.com',
        },
        achievements: ['Google开发者专家', 'Android认证工程师', '开源贡献者'],
      },
    ],
    departments: [
      {
        name: 'Android开发团队',
        memberCount: 12,
        description: '专注于Android Automotive应用开发和系统优化',
        skills: ['Kotlin', 'Java', 'Android SDK', 'AAOS', 'Jetpack Compose'],
        projects: ['CarNav Pro', 'SmartDash', 'VoiceCommand'],
        icon: 'fab fa-android',
        color: '#4CAF50',
      },
      {
        name: '车载系统团队',
        memberCount: 8,
        description: '负责QNX、Linux等车载操作系统的应用开发',
        skills: ['QNX', 'Linux', 'C++', 'Real-time Systems', 'CAN Protocol'],
        projects: ['QNX仪表系统', 'Linux车载平台', 'CAN总线工具'],
        icon: 'fas fa-microchip',
        color: '#2196F3',
      },
      {
        name: '测试质量团队',
        memberCount: 10,
        description: '确保产品质量和性能，提供全面的测试解决方案',
        skills: ['自动化测试', '性能测试', '安全测试', 'CI/CD', 'DevOps'],
        projects: ['测试框架', '性能监控', '质量管控'],
        icon: 'fas fa-shield-alt',
        color: '#FF9800',
      },
      {
        name: '产品设计团队',
        memberCount: 6,
        description: '专注于用户体验设计和产品创新',
        skills: ['UI/UX设计', '交互设计', '用户研究', 'Figma', 'Sketch'],
        projects: ['设计系统', '用户界面', '交互原型'],
        icon: 'fas fa-palette',
        color: '#E91E63',
      },
    ],
    culture: {
      values: [
        {
          title: '技术创新',
          description: '持续学习新技术，推动行业发展',
          icon: 'fas fa-lightbulb',
        },
        {
          title: '协作共赢',
          description: '团队合作，共同成长，成就彼此',
          icon: 'fas fa-handshake',
        },
        {
          title: '客户第一',
          description: '以客户需求为导向，提供最佳解决方案',
          icon: 'fas fa-users',
        },
        { title: '追求卓越', description: '精益求精，不断超越自我和期望', icon: 'fas fa-trophy' },
      ],
      benefits: [
        '有竞争力的薪酬待遇',
        '完善的技术培训体系',
        '灵活的工作时间安排',
        '丰富的团建活动',
        '广阔的职业发展空间',
        '良好的工作环境',
      ],
    },
  };

  res.render('company/team', { pageData });
};

// 服务定价页面
exports.pricing = (req, res) => {
  const pageData = {
    title: '服务定价',
    description: '智云科技提供灵活的车载应用开发服务定价方案，满足不同规模企业的需求',
    pricingPlans: [
      {
        name: '基础版',
        subtitle: '适合初创企业',
        price: '¥50,000',
        period: '起',
        description: '提供基础的车载应用开发服务，快速验证产品概念',
        features: [
          '单一平台应用开发（Android Automotive或QNX）',
          '基础UI/UX设计',
          '核心功能实现',
          '基础测试服务',
          '3个月技术支持',
          '源代码交付',
        ],
        recommended: false,
        color: 'primary',
        icon: 'fas fa-rocket',
      },
      {
        name: '专业版',
        subtitle: '适合成长型企业',
        price: '¥150,000',
        period: '起',
        description: '全面的车载应用开发解决方案，包含多平台支持和高级功能',
        features: [
          '多平台应用开发（Android + QNX/Linux）',
          '专业UI/UX设计',
          '高级功能实现',
          'CAN总线集成',
          '全面测试服务',
          '性能优化',
          '6个月技术支持',
          '文档和培训',
        ],
        recommended: true,
        color: 'success',
        icon: 'fas fa-star',
      },
      {
        name: '企业版',
        subtitle: '适合大型企业',
        price: '¥500,000',
        period: '起',
        description: '定制化的企业级车载应用开发服务，提供完整的技术解决方案',
        features: [
          '完全定制化开发',
          '多车型适配',
          '企业级架构设计',
          '高级安全功能',
          '云端集成服务',
          '大数据分析',
          '24/7技术支持',
          '现场驻场服务',
          '长期合作伙伴关系',
        ],
        recommended: false,
        color: 'warning',
        icon: 'fas fa-crown',
      },
    ],
    additionalServices: [
      {
        name: '技术咨询',
        price: '¥2,000/小时',
        description: '专家级技术咨询服务，帮助解决开发中的技术难题',
      },
      {
        name: '代码审核',
        price: '¥10,000起',
        description: '专业的代码质量审核和优化建议',
      },
      {
        name: '性能优化',
        price: '¥30,000起',
        description: '应用性能分析和优化服务',
      },
      {
        name: '安全审计',
        price: '¥25,000起',
        description: '全面的安全漏洞检测和修复方案',
      },
    ],
    faqs: [
      {
        question: '开发周期一般需要多长时间？',
        answer:
          '根据项目复杂度，基础版项目通常需要2-3个月，专业版需要4-6个月，企业版可能需要6-12个月。我们会在项目开始前提供详细的时间规划。',
      },
      {
        question: '是否提供后期维护服务？',
        answer:
          '是的，我们提供不同级别的维护服务包，包括bug修复、功能更新、性能监控等。维护费用根据服务级别而定。',
      },
      {
        question: '可以分期付款吗？',
        answer: '支持分期付款，通常按项目里程碑分3-4期支付。具体付款方式可以根据项目情况协商确定。',
      },
      {
        question: '源代码归属权如何确定？',
        answer: '项目完成后，源代码完全归客户所有。我们承诺不会在其他项目中使用客户的专有代码。',
      },
    ],
  };

  res.render('company/pricing', { pageData });
};

// 公司文化页面
exports.culture = (req, res) => {
  const pageData = {
    title: '公司文化',
    description: '智云科技致力于创造开放、创新、协作的工作环境',
  };

  res.render('company/culture', { pageData });
};

// 职业发展页面
exports.careers = (req, res) => {
  const pageData = {
    title: '加入我们',
    description: '在智云科技开启您的车载技术职业生涯',
  };

  res.render('company/careers', { pageData });
};
