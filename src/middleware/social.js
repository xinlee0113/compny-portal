/**
 * 社交媒体集成中间件
 */

// 社交媒体分享功能
const generateShareData = (req, res, next) => {
  const currentUrl = `${req.protocol}://${req.get('host')}${req.originalUrl}`;
  const baseTitle = '楚起科技 - 专业车载应用开发';
  const baseDescription = '专注于Android Automotive、QNX、Linux车载应用开发';

  // 根据页面类型生成不同的分享数据
  let shareData = {
    url: currentUrl,
    title: baseTitle,
    description: baseDescription,
    image: `${req.protocol}://${req.get('host')}/images/logo-share.png`,
  };

  // 根据路径自定义分享内容
  if (req.path.includes('/blog/')) {
    shareData.title = '技术博客 - ' + baseTitle;
    shareData.description = '最新的车载技术文章和行业动态';
  } else if (req.path.includes('/case-studies/')) {
    shareData.title = '项目案例 - ' + baseTitle;
    shareData.description = '真实的车载应用开发项目案例';
  } else if (req.path.includes('/services/')) {
    shareData.title = '专业服务 - ' + baseTitle;
    shareData.description = '提供全方位的车载应用开发解决方案';
  }

  // 生成各平台分享链接
  const socialLinks = {
    wechat: 'javascript:void(0)', // 微信需要特殊处理
    weibo: `https://service.weibo.com/share/share.php?url=${encodeURIComponent(shareData.url)}&title=${encodeURIComponent(shareData.title)}&pic=${encodeURIComponent(shareData.image)}`,
    qq: `https://connect.qq.com/widget/shareqq/index.html?url=${encodeURIComponent(shareData.url)}&title=${encodeURIComponent(shareData.title)}&summary=${encodeURIComponent(shareData.description)}`,
    qzone: `https://sns.qzone.qq.com/cgi-bin/qzshare/cgi_qzshare_onekey?url=${encodeURIComponent(shareData.url)}&title=${encodeURIComponent(shareData.title)}&summary=${encodeURIComponent(shareData.description)}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareData.url)}`,
    twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareData.url)}&text=${encodeURIComponent(shareData.title)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareData.url)}`,
  };

  res.locals.shareData = shareData;
  res.locals.socialLinks = socialLinks;
  next();
};

// 社交媒体元数据
const socialMetaTags = (req, res, next) => {
  const shareData = res.locals.shareData || {};

  res.locals.metaTags = {
    // Open Graph (Facebook)
    'og:title': shareData.title || '楚起科技',
    'og:description': shareData.description || '专业车载应用开发',
    'og:image': shareData.image || '/images/logo-share.png',
    'og:url': shareData.url || req.url,
    'og:type': 'website',
    'og:site_name': '楚起科技',

    // Twitter Card
    'twitter:card': 'summary_large_image',
    'twitter:title': shareData.title || '楚起科技',
    'twitter:description': shareData.description || '专业车载应用开发',
    'twitter:image': shareData.image || '/images/logo-share.png',

    // 微信分享
    'wechat:title': shareData.title || '楚起科技',
    'wechat:desc': shareData.description || '专业车载应用开发',
    'wechat:link': shareData.url || req.url,
    'wechat:imgUrl': shareData.image || '/images/logo-share.png',
  };

  next();
};

module.exports = {
  generateShareData,
  socialMetaTags,
};
