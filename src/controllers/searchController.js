/**
 * 全站搜索控制器
 */

// 引入其他控制器的数据
const blogController = require('./blogController');
const caseStudiesController = require('./caseStudiesController');
const downloadsController = require('./downloadsController');

// 搜索权重配置
const SEARCH_WEIGHTS = {
  title: 3,
  excerpt: 2,
  content: 1,
  tags: 2,
  category: 1.5,
};

// 热门搜索关键词
const popularSearches = [
  'Android Automotive',
  'CAN总线',
  '性能优化',
  'QNX开发',
  'SDK下载',
  '车载开发',
  'Kotlin',
  '案例研究',
];

// 主搜索功能
exports.search = async (req, res) => {
  const query = req.query.q || '';
  const type = req.query.type || 'all'; // all, blog, cases, downloads
  const page = parseInt(req.query.page) || 1;
  const limit = 10;
  const offset = (page - 1) * limit;

  if (!query.trim()) {
    return res.render('search/index', {
      pageData: {
        title: '搜索',
        description: '在智云科技网站中搜索技术文章、案例研究和资源',
        query: '',
        results: [],
        popularSearches: popularSearches,
        searchTypes: getSearchTypes(),
        stats: {
          totalResults: 0,
          searchTime: 0,
        },
      },
    });
  }

  const startTime = Date.now();

  try {
    // 获取所有内容数据
    const allResults = await getAllSearchableContent();

    // 执行搜索
    let searchResults = performSearch(allResults, query, type);

    // 计算搜索时间
    const searchTime = Date.now() - startTime;

    // 分页
    const totalResults = searchResults.length;
    const totalPages = Math.ceil(totalResults / limit);
    const paginatedResults = searchResults.slice(offset, offset + limit);

    const pageData = {
      title: `搜索"${query}"`,
      description: `搜索结果：${totalResults}个结果`,
      query: query,
      type: type,
      results: paginatedResults,
      popularSearches: popularSearches,
      searchTypes: getSearchTypes(),
      pagination: {
        currentPage: page,
        totalPages: totalPages,
        totalResults: totalResults,
        hasNext: page < totalPages,
        hasPrev: page > 1,
        nextPage: page + 1,
        prevPage: page - 1,
      },
      stats: {
        totalResults: totalResults,
        searchTime: searchTime,
      },
    };

    res.render('search/results', { pageData });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).render('search/error', {
      pageData: {
        title: '搜索错误',
        error: '搜索时发生错误，请稍后重试',
      },
    });
  }
};

// 搜索建议API
exports.suggestions = async (req, res) => {
  const query = req.query.q || '';
  const limit = parseInt(req.query.limit) || 10;

  if (!query.trim()) {
    return res.json({
      success: true,
      suggestions: popularSearches.slice(0, limit),
    });
  }

  try {
    const allContent = await getAllSearchableContent();
    const suggestions = generateSuggestions(allContent, query, limit);

    res.json({
      success: true,
      suggestions: suggestions,
    });
  } catch (error) {
    console.error('Suggestions error:', error);
    res.json({
      success: false,
      suggestions: [],
    });
  }
};

// 高级搜索页面
exports.advanced = (req, res) => {
  const pageData = {
    title: '高级搜索',
    description: '使用高级搜索功能精确查找内容',
    searchTypes: getSearchTypes(),
    popularSearches: popularSearches,
  };

  res.render('search/advanced', { pageData });
};

// 搜索统计API
exports.stats = async (req, res) => {
  try {
    const allContent = await getAllSearchableContent();

    const stats = {
      totalContent: allContent.length,
      contentByType: {
        blog: allContent.filter((item) => item.type === 'blog').length,
        cases: allContent.filter((item) => item.type === 'case').length,
        downloads: allContent.filter((item) => item.type === 'download').length,
      },
      popularSearches: popularSearches,
      recentSearches: [], // 这里可以从数据库获取最近的搜索记录
    };

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error('Search stats error:', error);
    res.status(500).json({
      success: false,
      message: '获取搜索统计失败',
    });
  }
};

// 获取所有可搜索内容
async function getAllSearchableContent() {
  const content = [];

  // 获取博客文章数据 (模拟数据)
  const blogArticles = [
    {
      type: 'blog',
      id: 1,
      title: 'Android Automotive 开发完整指南',
      excerpt: '深入了解Android Automotive OS开发的核心技术和最佳实践',
      content: '详细的Android Automotive开发内容...',
      url: '/blog/article/android-automotive-development-guide',
      category: 'Android开发',
      tags: ['Android Automotive', '车载开发', '移动开发', 'Kotlin'],
      author: '智云科技技术团队',
      publishDate: '2024-07-15',
    },
    {
      type: 'blog',
      id: 2,
      title: 'CAN总线应用集成最佳实践案例',
      excerpt: '通过真实案例学习CAN总线在车载应用中的集成方法',
      content: 'CAN总线集成的详细技术内容...',
      url: '/blog/article/can-bus-integration-best-practices',
      category: '车载通信',
      tags: ['CAN总线', '车载通信', '汽车电子', '系统集成'],
      author: '智云科技车载技术团队',
      publishDate: '2024-07-20',
    },
  ];

  // 获取案例研究数据 (模拟数据)
  const caseStudies = [
    {
      type: 'case',
      id: 1,
      title: 'CarNav Pro - 智能导航应用',
      excerpt: '为某知名车企开发的专业车载导航应用',
      content: '完整的导航应用开发案例...',
      url: '/case-studies/carnav-pro',
      category: '项目案例',
      tags: ['智能导航', '项目管理', 'Android Automotive', '案例研究'],
      client: '某知名车企',
      platform: 'Android Automotive OS',
    },
  ];

  // 获取下载资源数据 (模拟数据)
  const downloadResources = [
    {
      type: 'download',
      id: 1,
      title: 'AutomotiveSDK v2.1.0',
      excerpt: '智云科技车载应用开发SDK，支持Android Automotive、QNX和Linux平台',
      content: 'SDK包含完整的开发工具和文档...',
      url: '/downloads/resource/1',
      category: 'SDK',
      tags: ['Android Automotive', 'CAN总线', 'SDK', '开发工具'],
      version: '2.1.0',
      size: '45.2 MB',
    },
  ];

  content.push(...blogArticles, ...caseStudies, ...downloadResources);
  return content;
}

// 执行搜索
function performSearch(content, query, type) {
  const queryLower = query.toLowerCase();
  const results = [];

  for (const item of content) {
    // 类型过滤
    if (type !== 'all' && item.type !== type) {
      continue;
    }

    let score = 0;

    // 标题匹配
    if (item.title && item.title.toLowerCase().includes(queryLower)) {
      score += SEARCH_WEIGHTS.title;
    }

    // 摘要匹配
    if (item.excerpt && item.excerpt.toLowerCase().includes(queryLower)) {
      score += SEARCH_WEIGHTS.excerpt;
    }

    // 内容匹配
    if (item.content && item.content.toLowerCase().includes(queryLower)) {
      score += SEARCH_WEIGHTS.content;
    }

    // 标签匹配
    if (item.tags) {
      for (const tag of item.tags) {
        if (tag.toLowerCase().includes(queryLower)) {
          score += SEARCH_WEIGHTS.tags;
        }
      }
    }

    // 分类匹配
    if (item.category && item.category.toLowerCase().includes(queryLower)) {
      score += SEARCH_WEIGHTS.category;
    }

    // 如果有匹配，添加到结果中
    if (score > 0) {
      results.push({
        ...item,
        score: score,
        highlight: generateHighlight(item, queryLower),
      });
    }
  }

  // 按分数排序
  return results.sort((a, b) => b.score - a.score);
}

// 生成搜索建议
function generateSuggestions(content, query, limit) {
  const queryLower = query.toLowerCase();
  const suggestions = new Set();

  // 从标题中提取建议
  for (const item of content) {
    if (item.title && item.title.toLowerCase().includes(queryLower)) {
      suggestions.add(item.title);
    }

    // 从标签中提取建议
    if (item.tags) {
      for (const tag of item.tags) {
        if (tag.toLowerCase().includes(queryLower)) {
          suggestions.add(tag);
        }
      }
    }

    // 从分类中提取建议
    if (item.category && item.category.toLowerCase().includes(queryLower)) {
      suggestions.add(item.category);
    }
  }

  // 添加热门搜索中的相关项
  for (const popular of popularSearches) {
    if (popular.toLowerCase().includes(queryLower)) {
      suggestions.add(popular);
    }
  }

  return Array.from(suggestions).slice(0, limit);
}

// 生成搜索结果高亮
function generateHighlight(item, query) {
  const text = item.excerpt || item.title || '';
  const index = text.toLowerCase().indexOf(query);

  if (index === -1) {
    return text.substring(0, 150) + (text.length > 150 ? '...' : '');
  }

  const start = Math.max(0, index - 50);
  const end = Math.min(text.length, index + query.length + 50);
  let highlight = text.substring(start, end);

  // 添加高亮标记
  const regex = new RegExp(`(${query})`, 'gi');
  highlight = highlight.replace(regex, '<mark>$1</mark>');

  return (start > 0 ? '...' : '') + highlight + (end < text.length ? '...' : '');
}

// 获取搜索类型配置
function getSearchTypes() {
  return [
    { value: 'all', label: '全部', icon: 'fas fa-search' },
    { value: 'blog', label: '技术博客', icon: 'fas fa-blog' },
    { value: 'case', label: '案例研究', icon: 'fas fa-briefcase' },
    { value: 'download', label: '资源下载', icon: 'fas fa-download' },
  ];
}
