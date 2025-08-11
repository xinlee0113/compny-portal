// 国际化文本配置
const companyInfo = require('./company');

const texts = {
  zh: {
    // 网站基础信息
    site: {
      name: companyInfo.name,
      title: `${companyInfo.name} - ${companyInfo.slogan}`,
      welcome: `欢迎访问${companyInfo.name}`,
      subtitle: companyInfo.slogan,
      copyright: companyInfo.copyright.text,
      description: `${companyInfo.name}专注于${companyInfo.business.businessScope.slice(0, 3).join('、')}等车载系统开发`,
      companyPortal: '公司门户网站',
    },

    // 导航菜单
    nav: {
      home: '首页',
      about: '公司介绍',
      products: '产品展示',
      news: '新闻动态',
      contact: '联系我们',
      systemTools: '系统工具',
      apiDocs: 'API 文档',
      adminPanel: '管理员后台',
      services: '服务',
      portfolio: '案例展示',
      blog: '技术博客',
      testimonials: '客户见证',
      downloads: '下载中心',
      tools: '开发工具',
      videoTutorials: '视频教程',
      devCenter: '开发中心',
      confluence: 'Confluence',
      jira: 'Jira',
      gerrit: 'Gerrit',
      jenkins: 'Jenkins',
    },

    // 首页内容
    home: {
      aboutCard: {
        title: '公司介绍',
        content: `了解${companyInfo.name}的发展历程、企业文化和核心团队。`,
        button: '查看详情',
      },
      productsCard: {
        title: '车载应用产品',
        content: '展示我们的车载应用开发产品和解决方案。',
        button: '查看详情',
      },
      newsCard: {
        title: '技术动态',
        content: '获取车载技术最新资讯和行业动态。',
        button: '查看详情',
      },
      whyChooseUs: `为什么选择${companyInfo.name}？`,
      whyContent: `${companyInfo.name}是一家专注于车载应用开发的高科技企业，在汽车电子和智能网联汽车领域拥有丰富的经验和良好的声誉。`,
      advantages: [
        '车载系统领域技术专家',
        '资深的汽车电子团队',
        '7×24小时技术支持',
        '持续的技术创新能力',
      ],
    },

    // 关于页面
    about: {
      title: `${companyInfo.name}介绍`,
      overview: {
        title: '公司概况',
        content: `${companyInfo.name}是一家专注于车载应用开发的高科技企业，在汽车电子和智能网联汽车领域拥有丰富的经验和良好的声誉。公司致力于为汽车制造商和Tier1供应商提供最优质的车载系统解决方案，推动智能网联汽车产业发展。`,
      },
      history: {
        title: '发展历程',
        items: [
          {
            year: `${companyInfo.business.establishedYear}年`,
            content: '公司成立，专注于车载应用开发领域',
          },
          { year: '2019年', content: '推出首款Android Automotive应用框架，获得主机厂认可' },
          { year: '2020年', content: '扩大技术团队，建立车载系统研发中心' },
          { year: '2021年', content: '获得ISO 26262功能安全认证，业务拓展至全国' },
          { year: '2022年', content: '启动QNX和Linux车载平台开发，产品线丰富' },
          { year: '2023年', content: '获得ASPICE认证，成为多家知名车企合作伙伴' },
          { year: '2024年', content: '发布ADAS开发平台，进军智能驾驶领域' },
          { year: '2025年', content: '成为车载应用开发领域技术领先企业' },
        ],
      },
      culture: {
        title: '企业文化',
        mission: {
          title: '使命',
          content: '让每辆汽车都拥有智能的大脑，为出行创造更安全、更智能、更便捷的体验。',
        },
        vision: {
          title: '愿景',
          content: '成为车载应用开发领域的技术领导者和创新引领者。',
        },
        values: {
          title: '价值观',
          items: [
            { name: '技术驱动', desc: '以技术创新为核心驱动力' },
            { name: '安全第一', desc: '车载安全是我们的首要考虑' },
            { name: '客户至上', desc: '为客户提供最优质的技术服务' },
            { name: '持续学习', desc: '在快速发展的汽车科技领域保持学习' },
          ],
        },
      },
      team: {
        title: '技术团队',
        content:
          '我们拥有一支专注于车载系统开发的技术团队，团队成员来自汽车电子、嵌入式系统、移动开发等领域，在Android Automotive、QNX、Linux嵌入式系统开发方面都有深厚的技术积累和丰富的项目经验。',
        training:
          '团队定期组织车载技术分享和行业培训，跟踪最新的汽车电子技术发展趋势，不断提升在智能网联汽车领域的技术实力。',
      },
    },

    // 服务页面
    services: {
      automotiveDevelopment: {
        title: '车载应用开发',
        description: '专业的车载应用开发服务，涵盖主流车载平台',
        content: '专业的车载应用开发服务，支持Android Automotive、QNX、Linux等主流车载平台',
        cta: '准备开始您的车载应用项目？',
        contact: '立即联系我们的专家团队，获取定制化解决方案',
      },
      systemIntegration: {
        title: '系统集成',
        description: '完整的车载系统集成解决方案',
        content: '提供车载系统集成、CAN总线通信、设备互联等全方位技术服务',
      },
      testingValidation: {
        title: '测试验证',
        description: '全面的车载应用测试验证服务，确保产品质量和安全',
        content: '专业的车载应用测试验证，涵盖功能测试、性能测试、兼容性测试等',
        supportContent: '支持各种车载应用测试场景和环境',
        teamContent: '我们的测试团队为您的车载应用提供全方位质量保证',
      },
    },

    // 认证相关
    auth: {
      login: {
        title: '用户登录',
        pageTitle: `用户登录 - ${companyInfo.name}`,
        welcome: `欢迎回到${companyInfo.name}服务平台`,
      },
      register: {
        title: '用户注册',
        pageTitle: `用户注册 - ${companyInfo.name}`,
        welcome: `加入${companyInfo.name}服务平台`,
      },
      profile: {
        title: '个人中心',
        pageTitle: `个人中心 - ${companyInfo.name}`,
      },
    },

    // API文档
    apiDocs: {
      title: 'API文档',
      pageTitle: `API文档 - ${companyInfo.name}`,
      description: `${companyInfo.name}车载应用开发API文档`,
      portal: '公司门户 API',
      interactive: {
        title: '交互式API文档',
        pageTitle: `交互式API文档 - ${companyInfo.name}`,
        description: `${companyInfo.name}车载应用开发API交互式文档，支持在线测试和代码生成`,
        platform: `${companyInfo.name} API 交互式测试平台`,
      },
      detailed: {
        title: '详细API文档',
        pageTitle: `详细API文档 - ${companyInfo.name}`,
        description: `${companyInfo.name}车载应用开发API详细文档，包含完整的接口说明、参数规范和示例代码`,
        subtitle: '车载应用开发平台 RESTful API 完整参考',
        content: `${companyInfo.name} API 详细文档`,
      },
      footer: '公司门户网站. API文档',
    },

    // 管理员
    admin: {
      login: {
        title: '管理员登录',
        pageTitle: `管理员登录 - ${companyInfo.name}`,
      },
      dashboard: {
        title: '管理员面板',
        pageTitle: `管理员面板 - ${companyInfo.name}`,
      },
      email: `admin@${companyInfo.contact.email.split('@')[1]}`,
    },

    // 工具页面
    tools: {
      developmentFramework: {
        title: '车载应用开发框架',
        subtitle: `专业的车载应用开发工具链和SDK框架，助力快速开发高质量的${companyInfo.technology.platforms.slice(0, 3).join('、')}车载应用`,
        solutions: '提供完整的车载应用开发解决方案',
        coverage: '覆盖车载应用开发的各个技术领域',
        quickStart: '几分钟内创建你的第一个车载应用',
        support: '我们的专家团队随时为您提供车载应用开发咨询和技术支持',
      },
    },

    // 案例展示
    portfolio: {
      title: '案例展示',
      subtitle: `展示${companyInfo.name}在车载应用开发领域的技术实力和创新成果`,
    },

    // 联系页面
    contact: {
      title: `联系${companyInfo.name}`,
      subtitle: `与${companyInfo.name}专家团队取得联系，获取专业的车载应用开发服务和技术支持`,
      info: {
        title: '联系信息',
        address: `公司地址：${companyInfo.address.headquarters.fullAddress}`,
        phone: `联系电话：${companyInfo.contact.phone}`,
        email: `邮箱：${companyInfo.contact.email}`,
      },
      hours: {
        title: '服务时间',
        weekdays: companyInfo.workingHours.weekdays,
        support: companyInfo.workingHours.support,
        timezone: `时区：${companyInfo.workingHours.timezone}`,
      },
      form: {
        title: '联系我们',
        name: '姓名',
        email: '邮箱',
        company: '公司名称',
        subject: '主题',
        message: '留言',
        submit: '发送消息',
        required: '* 必填项',
        success: '消息发送成功！',
        error: '发送失败：',
        networkError: '网络错误，请稍后重试',
      },
      companyAddress: '公司地址',
      solutions: '为您提供全方位的车载应用开发解决方案',
    },

    // 案例研究
    caseStudies: {
      title: '案例研究',
      subtitle: `${companyInfo.name}在车载应用开发领域的卓越成果，展示我们在${companyInfo.technology.platforms.slice(0, 3).join('、')}等平台上的专业实力和创新能力`,
      contact: '联系我们的专家团队，获取定制化的车载应用开发解决方案',
    },

    // 博客
    blog: {
      title: '技术博客',
      subtitle: '分享车载应用开发的最新技术、实践经验和行业洞察，助力开发者成长',
    },

    // 产品页面
    products: {
      title: '产品展示',
      search: {
        placeholder: '搜索产品...',
        button: '搜索',
        category: '选择分类',
        sort: '排序',
        results: '搜索结果',
        noResults: '没有找到相关产品',
        clear: '清除搜索',
      },
      categories: {
        core: '核心产品',
        solution: '解决方案',
        service: '技术服务',
      },
      coreProducts: [
        {
          name: '核心产品A',
          desc: '这是我们的核心产品A，具有高性能、高可靠性等特点，广泛应用于各行各业。',
          features: ['高性能处理能力', '易于集成', '安全可靠'],
          tags: ['核心产品', '前沿技术', '可靠性', '安全', '企业级'],
        },
        {
          name: '核心产品B',
          desc: '产品B是我们为特定行业设计的解决方案，具有定制化程度高、适应性强等优点。',
          features: ['高度定制化', '灵活配置', '易于维护'],
          tags: ['核心产品', '定制化', '灵活', '行业解决方案'],
        },
        {
          name: '核心产品C',
          desc: '产品C是我们最新推出的一款创新产品，采用先进技术，满足未来发展趋势。',
          features: ['创新技术', '节能环保', '智能控制'],
          tags: ['核心产品', '创新', '环保', '智能', '未来技术'],
        },
      ],
      solutions: [
        {
          name: '制造业数字化转型解决方案',
          desc: '专为制造业打造的数字化转型完整解决方案，提升生产效率和管理水平。',
          features: ['生产自动化', '数据分析', '智能调度'],
          tags: ['行业解决方案', '制造业', '数字化', '自动化', '效率'],
        },
        {
          name: '智慧城市解决方案',
          desc: '构建智慧城市的综合性解决方案，涵盖交通、安防、环境等多个领域。',
          features: ['智能交通', '安防监控', '环境监测'],
          tags: ['行业解决方案', '智慧城市', '交通', '安防', '环保'],
        },
        {
          name: '金融科技解决方案',
          desc: '为金融机构提供安全、高效的科技解决方案，支持数字化转型。',
          features: ['风险控制', '数据安全', '业务创新'],
          tags: ['行业解决方案', '金融', '安全', '创新', '风控'],
        },
      ],
      services: [
        {
          name: '系统集成服务',
          desc: '专业的系统集成服务，帮助企业各类技术系统，提升整体效率。',
          features: ['系统整合', '技术咨询', '实施部署'],
          tags: ['技术服务', '系统集成', '咨询', '部署'],
        },
        {
          name: '技术咨询与支持',
          desc: '提供专业的技术咨询和全方位的技术支持服务，保障系统稳定运行。',
          features: ['专业咨询', '24/7支持', '远程维护'],
          tags: ['技术服务', '咨询', '支持', '维护'],
        },
        {
          name: '培训与认证服务',
          desc: '为客户提供专业的技术培训和认证服务，提升团队技术能力。',
          features: ['专业培训', '技能认证', '在线学习'],
          tags: ['技术服务', '培训', '认证', '学习', '技能'],
        },
      ],
    },

    // 新闻页面
    news: {
      title: '新闻动态',
      latest: '最新动态',
      categories: ['公司新闻', '行业动态', '产品更新', '技术分享'],
      articles: [
        {
          title: '公司荣获2025年度行业创新奖',
          date: '2025年1月20日',
          excerpt:
            '我们很高兴地宣布，公司凭借在技术创新方面的突出贡献，荣获了2025年度行业创新奖...',
          category: '公司新闻',
        },
        {
          title: '新产品发布：革命性的AI解决方案',
          date: '2025年1月15日',
          excerpt: '今天，我们正式发布了最新的AI解决方案，该产品将为各行业带来革命性的变化...',
          category: '产品更新',
        },
        {
          title: '行业趋势分析：2025年技术发展展望',
          date: '2025年1月10日',
          excerpt: '随着技术的快速发展，2025年将是一个充满机遇和挑战的年份...',
          category: '行业动态',
        },
        {
          title: '技术分享：如何构建高性能的微服务架构',
          date: '2025年1月5日',
          excerpt:
            '微服务架构已经成为现代软件开发的重要模式，本文将分享构建高性能微服务的最佳实践...',
          category: '技术分享',
        },
      ],
    },

    // 错误页面
    errors: {
      403: {
        title: '访问被拒绝',
        pageTitle: `访问被拒绝 - ${companyInfo.name}`,
      },
      404: {
        title: '页面未找到',
        pageTitle: `页面未找到 - ${companyInfo.name}`,
      },
      500: {
        title: '服务器错误',
        pageTitle: `服务器错误 - ${companyInfo.name}`,
      },
      copyright: `${new Date().getFullYear()} ${companyInfo.name}. 保留所有权利.`,
    },

    // 下载中心
    downloads: {
      title: '技术资源下载中心',
      subtitle: `获取${companyInfo.name}最新的车载应用开发技术白皮书、开发指南和最佳实践文档`,
      documents: {
        androidGuide: {
          title: 'Android Automotive 开发完整指南',
          description:
            'Google Android Automotive OS (AAOS) 完整开发指南，包含环境搭建、核心组件、用户界面设计、系统集成等全方位内容。',
        },
        performanceWhitepaper: {
          title: '车载应用性能优化白皮书',
          description:
            '深入探讨车载应用性能优化技术，涵盖内存管理、CPU优化、图形渲染、网络优化等核心技术领域。',
        },
        canBusGuide: {
          title: 'CAN总线集成最佳实践',
          description:
            'CAN总线在车载系统中的应用指南，包含协议详解、硬件集成、软件开发和故障诊断等实践经验。',
        },
        navigationCase: {
          title: '智能导航应用案例研究',
          description:
            '详细分析智能导航应用的设计思路、技术架构、用户体验优化和商业模式，提供完整的产品开发参考。',
        },
      },
    },

    // 开发中心
    devCenter: {
      title: '开发中心',
      subtitle: `${companyInfo.name}开发运维服务中心 · 统一访问入口`,
      description: '集成企业开发协作工具，提供统一的访问入口和便捷的开发环境',
      tools: {
        confluence: {
          title: 'Confluence',
          description: '团队协作与文档管理',
          subtitle: '知识库和项目文档',
          icon: 'fas fa-file-alt',
        },
        jira: {
          title: 'Jira Software',
          description: '项目管理与问题跟踪',
          subtitle: '敏捷开发工作流',
          icon: 'fas fa-tasks',
        },
        gerrit: {
          title: 'Gerrit Code Review',
          description: '代码审查与版本控制系统',
          subtitle: 'Git代码仓库管理',
          icon: 'fas fa-code-branch',
        },
        jenkins: {
          title: 'Jenkins CI/CD',
          description: '持续集成与持续部署',
          subtitle: '自动化构建和发布',
          icon: 'fas fa-cogs',
        },
      },
      networkInfo: {
        internal: '内网IP地址',
        external: '公网IP地址',
        domain: '固定域名',
        autoSync: '自动IP同步',
        freeService: '完全免费',
        accessNote: '访问提示：所有服务通过统一域名访问',
        techSupport: '技术支持',
      },
    },

    // 通用文本
    common: {
      readMore: '查看详情',
      back: '返回',
      loading: '加载中...',
      error: '出错了',
      success: '成功',
      confirm: '确认',
      cancel: '取消',
      home: '返回首页',
      companyPortal: '公司门户网站',
      about: '公司介绍',
    },
  },
};

// 获取文本的辅助函数
function getText(key, lang = 'zh') {
  const keys = key.split('.');
  let result = texts[lang];

  for (const k of keys) {
    if (result && typeof result === 'object') {
      result = result[k];
    } else {
      return key; // 如果找不到，返回key本身
    }
  }

  return result || key;
}

// 获取某语言的完整文本对象
function getTexts(lang = 'zh') {
  return texts[lang] || texts.zh;
}

// 中间件函数，为所有请求添加文本
function i18nMiddleware(req, res, next) {
  // 添加获取文本的辅助函数到res.locals
  res.locals.t = getText;
  res.locals.texts = texts.zh; // 直接提供中文文本对象
  next();
}

module.exports = {
  texts,
  getText,
  getTexts,
  i18nMiddleware,
};
