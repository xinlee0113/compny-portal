// 国际化文本配置
const texts = {
  zh: {
    // 网站基础信息
    site: {
      name: '公司门户网站',
      title: '公司首页',
      welcome: '欢迎访问公司门户网站',
      subtitle: '我们致力于提供最优质的产品和服务',
      copyright: '© 2025 公司名称. 保留所有权利.',
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
    },

    // 首页内容
    home: {
      aboutCard: {
        title: '公司介绍',
        content: '了解我们的发展历程、企业文化和核心团队。',
        button: '查看详情',
      },
      productsCard: {
        title: '产品展示',
        content: '展示我们的核心产品和解决方案。',
        button: '查看详情',
      },
      newsCard: {
        title: '新闻动态',
        content: '获取公司最新资讯和行业动态。',
        button: '查看详情',
      },
      whyChooseUs: '为什么选择我们？',
      whyContent:
        '我们是一家专注于提供高质量产品和服务的公司，在行业内拥有丰富的经验和良好的声誉。',
      advantages: [
        '行业领先的技术实力',
        '专业的服务团队',
        '完善的售后服务体系',
        '持续的创新能力',
      ],
    },

    // 关于页面
    about: {
      title: '公司介绍',
      overview: {
        title: '公司概况',
        content:
          '我们是一家专注于提供高质量产品和服务的创新型企业，在行业内拥有丰富的经验和良好的声誉。公司致力于为客户提供最优质的解决方案，推动行业发展。',
      },
      history: {
        title: '发展历程',
        items: [
          { year: '2020年', content: '公司成立，专注于核心业务领域' },
          { year: '2021年', content: '推出首款核心产品，获得市场认可' },
          { year: '2022年', content: '扩大团队规模，建立研发中心' },
          { year: '2023年', content: '获得行业重要奖项，业务拓展至全国' },
          { year: '2024年', content: '启动国际化战略，产品出口海外' },
          { year: '2025年', content: '成为行业领先企业，持续创新发展' },
        ],
      },
      culture: {
        title: '企业文化',
        mission: {
          title: '使命',
          content: '为客户创造价值，为员工提供发展平台，为社会贡献力量。',
        },
        vision: {
          title: '愿景',
          content: '成为行业领先的创新驱动型企业。',
        },
        values: {
          title: '价值观',
          items: [
            { name: '创新', desc: '持续创新，追求卓越' },
            { name: '诚信', desc: '诚实守信，言行一致' },
            { name: '合作', desc: '团队协作，共赢发展' },
            { name: '责任', desc: '承担责任，追求结果' },
          ],
        },
      },
      team: {
        title: '团队介绍',
        content:
          '我们拥有一支经验丰富、技术精湛的专业团队，团队成员来自国内外知名院校和企业，在各自领域都有深厚的技术积累和丰富的实践经验。',
        training:
          '团队注重人才培养和技术创新，定期组织技术分享和培训，不断提升团队整体实力。',
      },
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
          excerpt:
            '今天，我们正式发布了最新的AI解决方案，该产品将为各行业带来革命性的变化...',
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

    // 联系页面
    contact: {
      title: '联系我们',
      info: {
        title: '联系信息',
        address: '公司地址：北京市朝阳区科技园123号',
        phone: '联系电话：+86 123 4567 8900',
        email: '邮箱：info@company.com',
      },
      hours: {
        title: '营业时间',
        weekdays: '工作日：9:00 - 18:00',
        weekend: '周末：10:00 - 16:00',
        holiday: '节假日休息',
      },
      form: {
        title: '联系我们',
        name: '姓名',
        email: '邮箱',
        subject: '主题',
        message: '留言',
        submit: '发送消息',
        required: '* 必填项',
        success: '消息发送成功！',
        error: '发送失败：',
        networkError: '网络错误，请稍后重试',
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
  i18nMiddleware,
};
