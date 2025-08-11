/**
 * 知识库控制器
 */

// 知识库文章数据
const knowledgeBaseArticles = [
  {
    id: 1,
    title: 'Android Automotive 开发环境搭建',
    category: 'getting-started',
    tags: ['Android Automotive', '环境搭建', '新手指南'],
    content: `
# Android Automotive 开发环境搭建

## 系统要求
- Windows 10/11 或 macOS 10.14+ 或 Ubuntu 18.04+
- 8GB+ RAM (推荐16GB)
- 100GB+ 可用磁盘空间
- Java 11 或更高版本

## 安装步骤

### 1. 安装 Android Studio
1. 访问 [Android Studio官网](https://developer.android.com/studio)
2. 下载最新版本的Android Studio
3. 按照安装向导完成安装

### 2. 配置SDK
1. 打开Android Studio
2. 进入Settings > Appearance & Behavior > System Settings > Android SDK
3. 安装Android 11 (API 30) 或更高版本
4. 在SDK Tools标签页安装必要工具

### 3. 创建AAOS项目
\`\`\`kotlin
// 在build.gradle中添加车载应用依赖
dependencies {
    implementation 'androidx.car.app:app:1.2.0'
    implementation 'androidx.car.app:app-projected:1.2.0'
}
\`\`\`

## 常见问题
- **问题**: SDK下载失败
- **解决**: 检查网络连接，使用代理或镜像源

- **问题**: 模拟器启动失败  
- **解决**: 启用虚拟化，分配足够内存
        `,
    difficulty: 'beginner',
    readTime: '15分钟',
    views: 1250,
    likes: 89,
    dislikes: 5,
    lastUpdated: '2024-07-15',
    author: '智云科技技术团队',
    helpful: 95,
  },
  {
    id: 2,
    title: 'CAN总线通信故障排查指南',
    category: 'troubleshooting',
    tags: ['CAN总线', '故障排查', '调试'],
    content: `
# CAN总线通信故障排查指南

## 常见问题类型

### 1. 通信丢失
**症状**: 设备间无法通信
**原因**: 
- 总线断线
- 终端电阻问题
- 波特率不匹配

**排查步骤**:
1. 检查物理连接
2. 测量总线电压
3. 验证终端电阻值(120Ω)
4. 确认波特率设置

### 2. 数据错误
**症状**: 接收到错误数据
**原因**:
- 电磁干扰
- 信号质量差
- 时序问题

**解决方法**:
- 改善屏蔽和接地
- 检查信号完整性
- 调整采样点设置

## 调试工具推荐
1. **CAN分析仪**: Vector VN1630, PEAK PCAN-USB
2. **软件工具**: CANoe, BusMaster, SavvyCAN
3. **示波器**: 查看信号波形
        `,
    difficulty: 'intermediate',
    readTime: '20分钟',
    views: 980,
    likes: 76,
    dislikes: 3,
    lastUpdated: '2024-07-20',
    author: '智云科技车载技术团队',
    helpful: 92,
  },
  {
    id: 3,
    title: '车载应用性能优化最佳实践',
    category: 'best-practices',
    tags: ['性能优化', '最佳实践', 'Android'],
    content: `
# 车载应用性能优化最佳实践

## 启动优化

### 1. 减少启动时间
\`\`\`kotlin
class MyApplication : Application() {
    override fun onCreate() {
        super.onCreate()
        
        // 延迟初始化非关键组件
        Handler(Looper.getMainLooper()).post {
            initializeSecondaryComponents()
        }
    }
}
\`\`\`

### 2. 预加载关键资源
- 缓存常用数据
- 预先创建对象池
- 使用lazy初始化

## 内存优化

### 避免内存泄漏
- 正确管理生命周期
- 及时取消异步任务
- 使用WeakReference

### 减少内存占用
- 优化图片资源
- 使用对象池
- 及时回收资源

## 渲染优化
- 减少过度绘制
- 优化布局层次
- 使用硬件加速
        `,
    difficulty: 'advanced',
    readTime: '25分钟',
    views: 1150,
    likes: 92,
    dislikes: 2,
    lastUpdated: '2024-07-25',
    author: '智云科技性能优化团队',
    helpful: 96,
  },
];

// FAQ数据
const faqData = [
  {
    id: 1,
    category: 'general',
    question: '智云科技主要提供什么服务？',
    answer:
      '我们专注于车载应用开发，提供Android Automotive、QNX、Linux等平台的应用开发服务，包括系统集成、测试验证、技术咨询等全方位解决方案。',
    tags: ['服务介绍', '公司业务'],
    views: 2350,
    helpful: 89,
  },
  {
    id: 2,
    category: 'technical',
    question: 'Android Automotive与Android Auto有什么区别？',
    answer:
      'Android Automotive是直接运行在车载硬件上的操作系统，而Android Auto是通过手机投屏到车载屏幕的解决方案。AAOS提供更深度的车辆集成能力，支持直接访问车载传感器和CAN总线数据。',
    tags: ['Android Automotive', 'Android Auto', '技术区别'],
    views: 1890,
    helpful: 95,
  },
  {
    id: 3,
    category: 'development',
    question: '开发车载应用需要什么特殊的技能？',
    answer:
      '除了常规的Android开发技能外，还需要了解：1) 车载系统架构 2) CAN总线协议 3) 车载UI/UX设计原则 4) 车载安全标准 5) 实时系统特性。我们提供相关的培训和技术支持。',
    tags: ['技能要求', '开发指南'],
    views: 1650,
    helpful: 92,
  },
  {
    id: 4,
    category: 'pricing',
    question: '项目开发周期和费用如何计算？',
    answer:
      '开发周期根据项目复杂度而定，通常2-6个月。费用根据功能需求、平台数量、团队规模等因素确定。我们提供详细的项目评估和报价，支持分期付款。',
    tags: ['项目周期', '费用计算'],
    views: 2100,
    helpful: 87,
  },
  {
    id: 5,
    category: 'support',
    question: '项目完成后是否提供技术支持？',
    answer:
      '是的，我们提供不同级别的后期技术支持：1) 基础支持：bug修复和小问题解答 2) 标准支持：功能更新和性能优化 3) 高级支持：7x24小时响应和现场支持。',
    tags: ['技术支持', '售后服务'],
    views: 1750,
    helpful: 94,
  },
];

// 分类信息
const categories = [
  {
    name: 'getting-started',
    label: '新手入门',
    description: '面向初学者的基础教程和环境搭建指南',
    icon: 'fas fa-play-circle',
    color: '#28a745',
    articleCount: 1,
  },
  {
    name: 'troubleshooting',
    label: '故障排查',
    description: '常见问题的诊断和解决方案',
    icon: 'fas fa-tools',
    color: '#dc3545',
    articleCount: 1,
  },
  {
    name: 'best-practices',
    label: '最佳实践',
    description: '经验总结和优化建议',
    icon: 'fas fa-lightbulb',
    color: '#ffc107',
    articleCount: 1,
  },
  {
    name: 'api-reference',
    label: 'API参考',
    description: '详细的API文档和使用示例',
    icon: 'fas fa-code',
    color: '#6f42c1',
    articleCount: 0,
  },
];

// FAQ分类
const faqCategories = [
  { name: 'general', label: '常规问题', count: 1 },
  { name: 'technical', label: '技术问题', count: 1 },
  { name: 'development', label: '开发相关', count: 1 },
  { name: 'pricing', label: '定价费用', count: 1 },
  { name: 'support', label: '技术支持', count: 1 },
];

// 知识库主页
exports.index = (req, res) => {
  const pageData = {
    title: '技术知识库',
    description: '智云科技技术知识库，提供车载应用开发的完整文档、教程和最佳实践',
    categories: categories,
    popularArticles: knowledgeBaseArticles.sort((a, b) => b.views - a.views).slice(0, 6),
    recentArticles: knowledgeBaseArticles
      .sort((a, b) => new Date(b.lastUpdated) - new Date(a.lastUpdated))
      .slice(0, 4),
    stats: {
      totalArticles: knowledgeBaseArticles.length,
      totalViews: knowledgeBaseArticles.reduce((sum, article) => sum + article.views, 0),
      avgHelpfulness: Math.round(
        knowledgeBaseArticles.reduce((sum, article) => sum + article.helpful, 0) /
          knowledgeBaseArticles.length
      ),
    },
  };

  res.render('kb/index', { pageData });
};

// FAQ页面
exports.faq = (req, res) => {
  const pageData = {
    title: '常见问题 (FAQ)',
    description: '车载应用开发相关的常见问题和解答',
    faqCategories: faqCategories,
    faqs: faqData,
    stats: {
      totalFaqs: faqData.length,
      avgHelpfulness: Math.round(
        faqData.reduce((sum, faq) => sum + faq.helpful, 0) / faqData.length
      ),
    },
  };

  res.render('kb/faq', { pageData });
};

// 知识库分类页面
exports.category = (req, res) => {
  const categoryName = req.params.category;
  const category = categories.find((cat) => cat.name === categoryName);

  if (!category) {
    return res.status(404).render('404');
  }

  const categoryArticles = knowledgeBaseArticles.filter(
    (article) => article.category === categoryName
  );

  const pageData = {
    title: `${category.label} - 技术知识库`,
    description: category.description,
    category: category,
    articles: categoryArticles.sort((a, b) => b.views - a.views),
    categories: categories,
  };

  res.render('kb/category', { pageData });
};

// 知识库文章详情
exports.article = (req, res) => {
  const articleId = parseInt(req.params.id);
  const article = knowledgeBaseArticles.find((a) => a.id === articleId);

  if (!article) {
    return res.status(404).render('404');
  }

  // 增加浏览量
  article.views++;

  // 获取相关文章
  const relatedArticles = knowledgeBaseArticles
    .filter(
      (a) =>
        a.id !== articleId &&
        (a.category === article.category || a.tags.some((tag) => article.tags.includes(tag)))
    )
    .slice(0, 3);

  const pageData = {
    title: `${article.title} - 技术知识库`,
    description: `${article.title} - ${article.content.substring(0, 150)}...`,
    article: article,
    relatedArticles: relatedArticles,
    categories: categories,
  };

  res.render('kb/article', { pageData });
};

// 搜索知识库
exports.search = (req, res) => {
  const query = req.query.q || '';
  const category = req.query.category || 'all';

  let searchResults = [];

  if (query) {
    searchResults = knowledgeBaseArticles.filter((article) => {
      const matchesQuery =
        article.title.toLowerCase().includes(query.toLowerCase()) ||
        article.content.toLowerCase().includes(query.toLowerCase()) ||
        article.tags.some((tag) => tag.toLowerCase().includes(query.toLowerCase()));

      const matchesCategory = category === 'all' || article.category === category;

      return matchesQuery && matchesCategory;
    });
  }

  const pageData = {
    title: query ? `搜索"${query}" - 技术知识库` : '搜索 - 技术知识库',
    description: '搜索技术知识库文章',
    query: query,
    category: category,
    results: searchResults,
    categories: categories,
    resultCount: searchResults.length,
  };

  res.render('kb/search', { pageData });
};

// 文章评价
exports.rateArticle = (req, res) => {
  try {
    const articleId = parseInt(req.params.id);
    const { type } = req.body; // 'helpful' or 'not-helpful'

    const article = knowledgeBaseArticles.find((a) => a.id === articleId);
    if (!article) {
      return res.status(404).json({
        success: false,
        message: '文章不存在',
      });
    }

    if (type === 'helpful') {
      article.likes++;
    } else if (type === 'not-helpful') {
      article.dislikes++;
    } else {
      return res.status(400).json({
        success: false,
        message: '无效的评价类型',
      });
    }

    // 重新计算有用度
    const totalRatings = article.likes + article.dislikes;
    if (totalRatings > 0) {
      article.helpful = Math.round((article.likes / totalRatings) * 100);
    }

    res.json({
      success: true,
      message: '评价已提交',
      helpful: article.helpful,
      likes: article.likes,
      dislikes: article.dislikes,
    });
  } catch (error) {
    console.error('Article rating error:', error);
    res.status(500).json({
      success: false,
      message: '评价失败',
    });
  }
};

// 获取知识库统计
exports.getStats = (req, res) => {
  try {
    const stats = {
      totalArticles: knowledgeBaseArticles.length,
      totalViews: knowledgeBaseArticles.reduce((sum, article) => sum + article.views, 0),
      avgHelpfulness: Math.round(
        knowledgeBaseArticles.reduce((sum, article) => sum + article.helpful, 0) /
          knowledgeBaseArticles.length
      ),
      categoryStats: categories.map((category) => ({
        name: category.name,
        label: category.label,
        count: knowledgeBaseArticles.filter((a) => a.category === category.name).length,
        views: knowledgeBaseArticles
          .filter((a) => a.category === category.name)
          .reduce((sum, a) => sum + a.views, 0),
      })),
      popularArticles: knowledgeBaseArticles
        .sort((a, b) => b.views - a.views)
        .slice(0, 5)
        .map((article) => ({
          id: article.id,
          title: article.title,
          views: article.views,
          helpful: article.helpful,
        })),
    };

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error('Knowledge base stats error:', error);
    res.status(500).json({
      success: false,
      message: '获取统计数据失败',
    });
  }
};
