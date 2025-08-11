/**
 * 多语言支持中间件
 */

// 支持的语言
const supportedLanguages = {
  zh: {
    name: '中文',
    code: 'zh-CN',
    flag: '🇨🇳',
    direction: 'ltr',
  },
  en: {
    name: 'English',
    code: 'en-US',
    flag: '🇺🇸',
    direction: 'ltr',
  },
};

// 语言检测中间件
const detectLanguage = (req, res, next) => {
  let language = 'zh'; // 默认中文

  // 1. 检查URL参数
  if (req.query.lang && supportedLanguages[req.query.lang]) {
    language = req.query.lang;
  }
  // 2. 检查Cookie
  else if (req.cookies.language && supportedLanguages[req.cookies.language]) {
    language = req.cookies.language;
  }
  // 3. 检查Accept-Language头
  else if (req.headers['accept-language']) {
    const acceptedLanguages = req.headers['accept-language'].split(',');
    for (const lang of acceptedLanguages) {
      const langCode = lang.split(';')[0].trim().toLowerCase();
      if (langCode.startsWith('en')) {
        language = 'en';
        break;
      }
    }
  }

  req.language = language;
  res.locals.currentLanguage = language;
  res.locals.supportedLanguages = supportedLanguages;

  // 设置语言Cookie
  res.cookie('language', language, {
    maxAge: 365 * 24 * 60 * 60 * 1000, // 1年
    httpOnly: false,
  });

  next();
};

// 文本翻译数据
const translations = {
  zh: {
    // 导航
    'nav.home': '首页',
    'nav.about': '关于我们',
    'nav.services': '服务',
    'nav.products': '产品',
    'nav.news': '新闻',
    'nav.contact': '联系我们',
    'nav.blog': '技术博客',
    'nav.downloads': '资源下载',
    'nav.case_studies': '案例研究',
    'nav.tools': '开发工具',
    'nav.knowledge_base': '知识库',
    'nav.feedback': '用户反馈',
    'nav.newsletter': 'Newsletter',

    // 公共
    'common.learn_more': '了解更多',
    'common.contact_us': '联系我们',
    'common.get_started': '立即开始',
    'common.view_details': '查看详情',
    'common.download': '下载',
    'common.read_more': '阅读更多',
    'common.submit': '提交',
    'common.cancel': '取消',
    'common.save': '保存',
    'common.edit': '编辑',
    'common.delete': '删除',
    'common.search': '搜索',
    'common.filter': '筛选',
    'common.sort': '排序',
    'common.loading': '加载中...',
    'common.error': '错误',
    'common.success': '成功',

    // 首页
    'home.hero.title': '专业车载应用开发',
    'home.hero.subtitle': '专注于Android Automotive、QNX、Linux车载应用开发，提供全方位解决方案',
    'home.hero.cta': '开始咨询',
    'home.services.title': '我们的服务',
    'home.services.automotive': 'Android Automotive开发',
    'home.services.system': '系统集成',
    'home.services.testing': '测试验证',

    // 表单
    'form.name': '姓名',
    'form.email': '邮箱',
    'form.phone': '电话',
    'form.company': '公司',
    'form.message': '留言',
    'form.subject': '主题',
    'form.required': '必填',
    'form.invalid_email': '请输入有效的邮箱地址',
    'form.submit_success': '提交成功',
    'form.submit_error': '提交失败，请重试',

    // 页脚
    'footer.company': '北京楚起科技有限公司',
    'footer.address': '北京市海淀区中关村软件园',
    'footer.phone': '电话：+86-10-8888-8888',
    'footer.email': '邮箱：info@chuqi-tech.com',
    'footer.copyright': '版权所有',
    'footer.links': '友情链接',
    'footer.follow_us': '关注我们',
  },
  en: {
    // Navigation
    'nav.home': 'Home',
    'nav.about': 'About',
    'nav.services': 'Services',
    'nav.products': 'Products',
    'nav.news': 'News',
    'nav.contact': 'Contact',
    'nav.blog': 'Blog',
    'nav.downloads': 'Downloads',
    'nav.case_studies': 'Case Studies',
    'nav.tools': 'Tools',
    'nav.knowledge_base': 'Knowledge Base',
    'nav.feedback': 'Feedback',
    'nav.newsletter': 'Newsletter',

    // Common
    'common.learn_more': 'Learn More',
    'common.contact_us': 'Contact Us',
    'common.get_started': 'Get Started',
    'common.view_details': 'View Details',
    'common.download': 'Download',
    'common.read_more': 'Read More',
    'common.submit': 'Submit',
    'common.cancel': 'Cancel',
    'common.save': 'Save',
    'common.edit': 'Edit',
    'common.delete': 'Delete',
    'common.search': 'Search',
    'common.filter': 'Filter',
    'common.sort': 'Sort',
    'common.loading': 'Loading...',
    'common.error': 'Error',
    'common.success': 'Success',

    // Homepage
    'home.hero.title': 'Professional Automotive App Development',
    'home.hero.subtitle':
      'Specialized in Android Automotive, QNX, Linux automotive application development with comprehensive solutions',
    'home.hero.cta': 'Get Consultation',
    'home.services.title': 'Our Services',
    'home.services.automotive': 'Android Automotive Development',
    'home.services.system': 'System Integration',
    'home.services.testing': 'Testing & Validation',

    // Form
    'form.name': 'Name',
    'form.email': 'Email',
    'form.phone': 'Phone',
    'form.company': 'Company',
    'form.message': 'Message',
    'form.subject': 'Subject',
    'form.required': 'Required',
    'form.invalid_email': 'Please enter a valid email address',
    'form.submit_success': 'Submitted successfully',
    'form.submit_error': 'Submission failed, please try again',

    // Footer
    'footer.company': 'Beijing ChuQi Technology Co., Ltd.',
    'footer.address': 'Zhongguancun Software Park, Haidian District, Beijing',
    'footer.phone': 'Tel: +86-10-8888-8888',
    'footer.email': 'Email: info@chuqi-tech.com',
    'footer.copyright': 'All Rights Reserved',
    'footer.links': 'Links',
    'footer.follow_us': 'Follow Us',
  },
};

// 翻译功能
const translate = (req, res, next) => {
  const language = req.language || 'zh';

  // 翻译函数
  const t = (key, params = {}) => {
    let text = translations[language][key] || translations['zh'][key] || key;

    // 参数替换
    Object.keys(params).forEach((param) => {
      text = text.replace(new RegExp(`{${param}}`, 'g'), params[param]);
    });

    return text;
  };

  res.locals.t = t;
  res.locals.translations = translations[language];

  next();
};

// 语言切换URL生成
const generateLanguageUrls = (req, res, next) => {
  const currentUrl = req.originalUrl;
  const languageUrls = {};

  Object.keys(supportedLanguages).forEach((lang) => {
    // 移除现有的lang参数
    const url = new URL(currentUrl, `${req.protocol}://${req.get('host')}`);
    url.searchParams.set('lang', lang);
    languageUrls[lang] = url.pathname + url.search;
  });

  res.locals.languageUrls = languageUrls;
  next();
};

module.exports = {
  detectLanguage,
  translate,
  generateLanguageUrls,
  supportedLanguages,
};
