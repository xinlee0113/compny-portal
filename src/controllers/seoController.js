/**
 * SEO控制器
 */

// 生成XML站点地图
exports.sitemap = (req, res) => {
  const baseUrl = `${req.protocol}://${req.get('host')}`;
  const currentDate = new Date().toISOString();

  // 定义所有页面URL
  const urls = [
    { loc: '', changefreq: 'daily', priority: '1.0', lastmod: currentDate },
    { loc: '/about', changefreq: 'monthly', priority: '0.8', lastmod: currentDate },
    { loc: '/products', changefreq: 'weekly', priority: '0.9', lastmod: currentDate },
    { loc: '/news', changefreq: 'daily', priority: '0.7', lastmod: currentDate },
    { loc: '/contact', changefreq: 'monthly', priority: '0.8', lastmod: currentDate },

    // 服务页面
    {
      loc: '/services/automotive-development',
      changefreq: 'monthly',
      priority: '0.9',
      lastmod: currentDate,
    },
    {
      loc: '/services/system-integration',
      changefreq: 'monthly',
      priority: '0.9',
      lastmod: currentDate,
    },
    {
      loc: '/services/testing-validation',
      changefreq: 'monthly',
      priority: '0.9',
      lastmod: currentDate,
    },

    // 工具页面
    {
      loc: '/tools/development-framework',
      changefreq: 'monthly',
      priority: '0.8',
      lastmod: currentDate,
    },

    // 案例研究
    { loc: '/case-studies', changefreq: 'weekly', priority: '0.8', lastmod: currentDate },
    {
      loc: '/case-studies/carnav-pro',
      changefreq: 'monthly',
      priority: '0.7',
      lastmod: currentDate,
    },

    // 博客
    { loc: '/blog', changefreq: 'daily', priority: '0.8', lastmod: currentDate },
    {
      loc: '/blog/article/android-automotive-development-guide',
      changefreq: 'monthly',
      priority: '0.7',
      lastmod: '2024-07-15',
    },
    {
      loc: '/blog/article/can-bus-integration-best-practices',
      changefreq: 'monthly',
      priority: '0.7',
      lastmod: '2024-07-20',
    },
    {
      loc: '/blog/article/automotive-performance-optimization',
      changefreq: 'monthly',
      priority: '0.7',
      lastmod: '2024-07-25',
    },
    {
      loc: '/blog/article/smart-navigation-case-study',
      changefreq: 'monthly',
      priority: '0.7',
      lastmod: '2024-07-30',
    },

    // 下载中心
    { loc: '/downloads', changefreq: 'weekly', priority: '0.8', lastmod: currentDate },
    { loc: '/downloads/resource/1', changefreq: 'monthly', priority: '0.6', lastmod: currentDate },
    { loc: '/downloads/resource/2', changefreq: 'monthly', priority: '0.6', lastmod: currentDate },
    { loc: '/downloads/resource/3', changefreq: 'monthly', priority: '0.6', lastmod: currentDate },

    // 公司页面
    { loc: '/company/team', changefreq: 'monthly', priority: '0.7', lastmod: currentDate },
    { loc: '/company/pricing', changefreq: 'monthly', priority: '0.8', lastmod: currentDate },

    // 搜索页面
    { loc: '/search', changefreq: 'weekly', priority: '0.5', lastmod: currentDate },
  ];

  let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

  urls.forEach((url) => {
    sitemap += `
    <url>
        <loc>${baseUrl}${url.loc}</loc>
        <lastmod>${url.lastmod}</lastmod>
        <changefreq>${url.changefreq}</changefreq>
        <priority>${url.priority}</priority>
    </url>`;
  });

  sitemap += `
</urlset>`;

  res.set('Content-Type', 'application/xml');
  res.send(sitemap);
};

// 生成robots.txt
exports.robots = (req, res) => {
  const baseUrl = `${req.protocol}://${req.get('host')}`;

  const robots = `User-agent: *
Allow: /

# 禁止抓取管理员页面
Disallow: /admin/
Disallow: /api/admin/

# 禁止抓取私有API
Disallow: /api/private/

# 禁止抓取测试页面
Disallow: /test/
Disallow: /debug/

# 允许抓取公开API文档
Allow: /api/docs
Allow: /api/health

# 站点地图位置
Sitemap: ${baseUrl}/sitemap.xml

# 爬虫延迟
Crawl-delay: 1`;

  res.set('Content-Type', 'text/plain');
  res.send(robots);
};

// SEO分析API
exports.seoAnalysis = (req, res) => {
  const analysis = {
    success: true,
    data: {
      pages: {
        total: 25,
        indexed: 23,
        errors: 2,
      },
      performance: {
        averageLoadTime: 2.3,
        mobileOptimized: true,
        httpsEnabled: true,
        gzipCompression: true,
      },
      seo: {
        metaDescriptions: 23,
        titleTags: 25,
        headingStructure: 'Good',
        imageAltTexts: 18,
        internalLinks: 156,
        externalLinks: 12,
      },
      social: {
        ogTags: 20,
        twitterCards: 15,
        structuredData: true,
      },
      issues: [
        { type: 'warning', message: '2个页面缺少meta description' },
        { type: 'info', message: '7个图片缺少alt属性' },
      ],
      recommendations: [
        '优化移动端加载速度',
        '增加更多内部链接',
        '完善结构化数据标记',
        '添加面包屑导航',
      ],
    },
  };

  res.json(analysis);
};
