const fs = require('fs');
const path = require('path');

/**
 * 技术博客控制器
 */

// 模拟博客数据 - 基于我们的技术文档
const blogArticles = [
  {
    id: 1,
    slug: 'android-automotive-development-guide',
    title: 'Android Automotive 开发完整指南',
    excerpt: '深入了解Android Automotive OS开发的核心技术和最佳实践，从零开始构建专业的车载应用',
    content: '', // 从文件读取
    author: '智云科技技术团队',
    publishDate: '2024-07-15',
    category: 'Android开发',
    tags: ['Android Automotive', '车载开发', '移动开发', 'Kotlin'],
    readTime: '25分钟',
    views: 1250,
    likes: 89,
    featured: true,
    image: '/images/blog/android-automotive.jpg',
    filePath: 'docs/content/android-automotive-development-guide.md',
  },
  {
    id: 2,
    slug: 'can-bus-integration-best-practices',
    title: 'CAN总线应用集成最佳实践案例',
    excerpt: '通过真实案例学习CAN总线在车载应用中的集成方法、安全策略和性能优化技巧',
    content: '',
    author: '智云科技车载技术团队',
    publishDate: '2024-07-20',
    category: '车载通信',
    tags: ['CAN总线', '车载通信', '汽车电子', '系统集成'],
    readTime: '35分钟',
    views: 980,
    likes: 76,
    featured: true,
    image: '/images/blog/can-bus.jpg',
    filePath: 'docs/content/can-bus-integration-best-practices.md',
  },
  {
    id: 3,
    slug: 'automotive-performance-optimization',
    title: '车载应用性能优化方法论白皮书',
    excerpt: '系统性阐述车载应用性能优化的完整方法论，包含VAPOR优化策略和实战经验',
    content: '',
    author: '智云科技性能优化团队',
    publishDate: '2024-07-25',
    category: '性能优化',
    tags: ['性能优化', '车载应用', 'Android Automotive', '系统调优'],
    readTime: '30分钟',
    views: 1150,
    likes: 92,
    featured: true,
    image: '/images/blog/performance.jpg',
    filePath: 'docs/content/automotive-performance-optimization-whitepaper.md',
  },
  {
    id: 4,
    slug: 'smart-navigation-case-study',
    title: '智能导航应用开发完整案例展示',
    excerpt: 'CarNav Pro项目的完整开发过程，展示从需求分析到产品交付的全流程实践',
    content: '',
    author: '智云科技车载开发团队',
    publishDate: '2024-07-30',
    category: '项目案例',
    tags: ['智能导航', '项目管理', 'Android Automotive', '案例研究'],
    readTime: '40分钟',
    views: 890,
    likes: 67,
    featured: false,
    image: '/images/blog/navigation.jpg',
    filePath: 'docs/content/smart-navigation-app-case-study.md',
  },
  {
    id: 5,
    slug: 'qnx-real-time-development',
    title: 'QNX实时系统车载应用开发实战',
    excerpt: '基于QNX实时操作系统的车载应用开发技术详解，包含架构设计和性能调优',
    content: '详细介绍QNX实时系统在车载应用中的应用...',
    author: '智云科技系统架构师',
    publishDate: '2024-08-01',
    category: 'QNX开发',
    tags: ['QNX', '实时系统', '车载开发', 'C++'],
    readTime: '28分钟',
    views: 720,
    likes: 54,
    featured: false,
    image: '/images/blog/qnx.jpg',
    filePath: null,
  },
];

const categories = [
  { name: 'Android开发', count: 1, description: 'Android Automotive和移动开发技术' },
  { name: '车载通信', count: 1, description: 'CAN总线、LIN、FlexRay等车载通信协议' },
  { name: '性能优化', count: 1, description: '系统性能调优和最佳实践' },
  { name: '项目案例', count: 1, description: '真实项目开发案例和经验分享' },
  { name: 'QNX开发', count: 1, description: 'QNX实时系统开发技术' },
  { name: '技术架构', count: 0, description: '系统架构设计和技术选型' },
];

const popularTags = [
  { name: 'Android Automotive', count: 3 },
  { name: '车载开发', count: 4 },
  { name: '性能优化', count: 2 },
  { name: 'CAN总线', count: 1 },
  { name: 'Kotlin', count: 2 },
  { name: '系统集成', count: 2 },
  { name: '项目管理', count: 1 },
  { name: 'QNX', count: 1 },
];

// 博客首页
exports.index = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = 6;
  const offset = (page - 1) * limit;

  // 获取文章内容
  const articlesWithContent = await loadArticleContents(blogArticles);

  const totalArticles = articlesWithContent.length;
  const totalPages = Math.ceil(totalArticles / limit);

  const paginatedArticles = articlesWithContent
    .sort((a, b) => new Date(b.publishDate) - new Date(a.publishDate))
    .slice(offset, offset + limit);

  const featuredArticles = articlesWithContent.filter((article) => article.featured).slice(0, 3);

  const pageData = {
    title: '技术博客',
    description: '智云科技技术博客，分享车载应用开发的最新技术和实践经验',
    articles: paginatedArticles,
    featuredArticles: featuredArticles,
    categories: categories,
    popularTags: popularTags,
    pagination: {
      currentPage: page,
      totalPages: totalPages,
      totalArticles: totalArticles,
      hasNext: page < totalPages,
      hasPrev: page > 1,
      nextPage: page + 1,
      prevPage: page - 1,
    },
    stats: {
      totalArticles: totalArticles,
      totalViews: articlesWithContent.reduce((sum, article) => sum + article.views, 0),
      totalLikes: articlesWithContent.reduce((sum, article) => sum + article.likes, 0),
    },
  };

  res.render('blog/index', { pageData });
};

// 文章分类页面
exports.category = async (req, res) => {
  const categoryName = req.params.category;
  const page = parseInt(req.query.page) || 1;
  const limit = 6;
  const offset = (page - 1) * limit;

  const articlesWithContent = await loadArticleContents(blogArticles);
  const categoryArticles = articlesWithContent.filter(
    (article) => article.category === decodeURIComponent(categoryName)
  );

  const totalArticles = categoryArticles.length;
  const totalPages = Math.ceil(totalArticles / limit);

  const paginatedArticles = categoryArticles
    .sort((a, b) => new Date(b.publishDate) - new Date(a.publishDate))
    .slice(offset, offset + limit);

  const pageData = {
    title: `${categoryName} - 技术博客`,
    description: `智云科技${categoryName}相关技术文章`,
    articles: paginatedArticles,
    categories: categories,
    popularTags: popularTags,
    currentCategory: categoryName,
    pagination: {
      currentPage: page,
      totalPages: totalPages,
      totalArticles: totalArticles,
      hasNext: page < totalPages,
      hasPrev: page > 1,
      nextPage: page + 1,
      prevPage: page - 1,
    },
  };

  res.render('blog/category', { pageData });
};

// 文章详情页面
exports.article = async (req, res) => {
  const slug = req.params.slug;
  const articlesWithContent = await loadArticleContents(blogArticles);
  const article = articlesWithContent.find((a) => a.slug === slug);

  if (!article) {
    return res.status(404).render('404');
  }

  // 增加浏览量
  article.views += 1;

  // 获取相关文章
  const relatedArticles = articlesWithContent
    .filter(
      (a) =>
        a.id !== article.id &&
        (a.category === article.category || a.tags.some((tag) => article.tags.includes(tag)))
    )
    .slice(0, 3);

  const pageData = {
    title: `${article.title} - 技术博客`,
    description: article.excerpt,
    article: article,
    relatedArticles: relatedArticles,
    categories: categories,
    popularTags: popularTags,
  };

  res.render('blog/article', { pageData });
};

// 文章搜索
exports.search = async (req, res) => {
  const query = req.query.q || '';
  const page = parseInt(req.query.page) || 1;
  const limit = 6;
  const offset = (page - 1) * limit;

  const articlesWithContent = await loadArticleContents(blogArticles);

  let searchResults = [];
  if (query) {
    searchResults = articlesWithContent.filter(
      (article) =>
        article.title.toLowerCase().includes(query.toLowerCase()) ||
        article.excerpt.toLowerCase().includes(query.toLowerCase()) ||
        article.content.toLowerCase().includes(query.toLowerCase()) ||
        article.tags.some((tag) => tag.toLowerCase().includes(query.toLowerCase()))
    );
  }

  const totalResults = searchResults.length;
  const totalPages = Math.ceil(totalResults / limit);

  const paginatedResults = searchResults
    .sort((a, b) => new Date(b.publishDate) - new Date(a.publishDate))
    .slice(offset, offset + limit);

  const pageData = {
    title: query ? `搜索"${query}" - 技术博客` : '搜索 - 技术博客',
    description: '搜索技术博客文章',
    articles: paginatedResults,
    searchQuery: query,
    categories: categories,
    popularTags: popularTags,
    pagination: {
      currentPage: page,
      totalPages: totalPages,
      totalArticles: totalResults,
      hasNext: page < totalPages,
      hasPrev: page > 1,
      nextPage: page + 1,
      prevPage: page - 1,
    },
  };

  res.render('blog/search', { pageData });
};

// 标签页面
exports.tag = async (req, res) => {
  const tagName = req.params.tag;
  const page = parseInt(req.query.page) || 1;
  const limit = 6;
  const offset = (page - 1) * limit;

  const articlesWithContent = await loadArticleContents(blogArticles);
  const tagArticles = articlesWithContent.filter((article) =>
    article.tags.includes(decodeURIComponent(tagName))
  );

  const totalArticles = tagArticles.length;
  const totalPages = Math.ceil(totalArticles / limit);

  const paginatedArticles = tagArticles
    .sort((a, b) => new Date(b.publishDate) - new Date(a.publishDate))
    .slice(offset, offset + limit);

  const pageData = {
    title: `标签: ${tagName} - 技术博客`,
    description: `智云科技关于${tagName}的技术文章`,
    articles: paginatedArticles,
    categories: categories,
    popularTags: popularTags,
    currentTag: tagName,
    pagination: {
      currentPage: page,
      totalPages: totalPages,
      totalArticles: totalArticles,
      hasNext: page < totalPages,
      hasPrev: page > 1,
      nextPage: page + 1,
      prevPage: page - 1,
    },
  };

  res.render('blog/tag', { pageData });
};

// RSS订阅
exports.rss = async (req, res) => {
  const articlesWithContent = await loadArticleContents(blogArticles);
  const recentArticles = articlesWithContent
    .sort((a, b) => new Date(b.publishDate) - new Date(a.publishDate))
    .slice(0, 20);

  res.set('Content-Type', 'application/rss+xml');
  res.render('blog/rss', {
    articles: recentArticles,
    siteUrl: req.protocol + '://' + req.get('host'),
  });
};

// 辅助函数：加载文章内容
async function loadArticleContents(articles) {
  const articlesWithContent = [];

  for (const article of articles) {
    const articleCopy = { ...article };

    if (article.filePath) {
      try {
        const filePath = path.join(process.cwd(), article.filePath);
        if (fs.existsSync(filePath)) {
          articleCopy.content = fs.readFileSync(filePath, 'utf8');

          // 生成摘要（如果原摘要为空）
          if (!articleCopy.excerpt || articleCopy.excerpt.length < 50) {
            articleCopy.excerpt = generateExcerpt(articleCopy.content);
          }
        } else {
          console.warn(`Article file not found: ${article.filePath}`);
          articleCopy.content = '文章内容正在加载中...';
        }
      } catch (error) {
        console.error(`Error loading article content: ${article.filePath}`, error);
        articleCopy.content = '加载文章内容时出错';
      }
    }

    articlesWithContent.push(articleCopy);
  }

  return articlesWithContent;
}

// 生成文章摘要
function generateExcerpt(content) {
  // 移除markdown标记
  const plainText = content
    .replace(/#{1,6}\s+/g, '') // 移除标题标记
    .replace(/\*\*(.*?)\*\*/g, '$1') // 移除粗体
    .replace(/\*(.*?)\*/g, '$1') // 移除斜体
    .replace(/`(.*?)`/g, '$1') // 移除行内代码
    .replace(/```[\s\S]*?```/g, '') // 移除代码块
    .replace(/\[(.*?)\]\(.*?\)/g, '$1') // 移除链接，保留文本
    .replace(/>\s+/g, '') // 移除引用标记
    .replace(/\n+/g, ' ') // 替换换行为空格
    .trim();

  // 提取前200个字符作为摘要
  return plainText.length > 200 ? plainText.substring(0, 200) + '...' : plainText;
}
