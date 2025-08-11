/**
 * 下载中心控制器
 * 处理技术文档下载相关功能
 */

const fs = require('fs').promises;
const path = require('path');

/**
 * 渲染下载中心首页
 */
const renderDownloadsIndex = async (req, res) => {
  try {
    const pageData = {
      title: '技术资源下载',
      description: '楚起科技车载应用开发技术白皮书、开发指南免费下载',
      keywords: 'Android Automotive, 车载开发, 技术白皮书, 下载',
    };

    res.render('downloads/index', {
      title: pageData.title,
      pageData,
      page: 'downloads',
      texts: require('../config/i18n').texts.zh,
      company: require('../config/company'),
    });
  } catch (error) {
    console.error('渲染下载中心失败:', error);
    res.status(500).render('500', {
      title: '服务器错误',
    });
  }
};

/**
 * 下载文档文件
 */
const downloadDocument = async (req, res) => {
  try {
    const { filename } = req.params;

    // 文档映射
    const documentMap = {
      'android-automotive-development-guide': {
        file: 'android-automotive-development-guide.md',
        title: 'Android Automotive 开发完整指南',
        contentType: 'text/markdown',
      },
      'automotive-performance-optimization-whitepaper': {
        file: 'automotive-performance-optimization-whitepaper.md',
        title: '车载应用性能优化白皮书',
        contentType: 'text/markdown',
      },
      'can-bus-integration-best-practices': {
        file: 'can-bus-integration-best-practices.md',
        title: 'CAN总线集成最佳实践',
        contentType: 'text/markdown',
      },
      'smart-navigation-app-case-study': {
        file: 'smart-navigation-app-case-study.md',
        title: '智能导航应用案例研究',
        contentType: 'text/markdown',
      },
    };

    const doc = documentMap[filename];
    if (!doc) {
      return res.status(404).render('404', {
        title: '文档未找到',
      });
    }

    const filePath = path.join(process.cwd(), 'docs', 'content', doc.file);

    try {
      const content = await fs.readFile(filePath, 'utf8');

      // 如果请求下载
      if (req.query.download === 'true') {
        res.setHeader('Content-Disposition', `attachment; filename="${doc.title}.md"`);
        res.setHeader('Content-Type', doc.contentType);
        return res.send(content);
      }

      // 在线阅读 - 渲染为HTML页面
      res.render('downloads/document', {
        title: doc.title,
        document: {
          title: doc.title,
          content: content,
          filename: filename,
        },
        page: 'downloads',
        texts: require('../config/i18n').texts.zh,
        company: require('../config/company'),
      });
    } catch (fileError) {
      console.error('读取文档文件失败:', fileError);
      res.status(404).render('404', {
        title: '文档未找到',
      });
    }
  } catch (error) {
    console.error('下载文档失败:', error);
    res.status(500).render('500', {
      title: '服务器错误',
    });
  }
};

/**
 * 跟踪下载统计
 */
const trackDownload = async (req, res) => {
  try {
    const { filename } = req.body;

    // 这里可以记录下载统计到数据库
    console.log(`文档下载统计: ${filename}`);

    res.json({
      success: true,
      message: '统计记录成功',
    });
  } catch (error) {
    console.error('记录下载统计失败:', error);
    res.status(500).json({
      success: false,
      message: '统计记录失败',
    });
  }
};

/**
 * 获取下载统计数据
 */
const getDownloadStats = async (req, res) => {
  try {
    // 模拟统计数据
    const stats = {
      'android-automotive-development-guide': {
        downloads: 4521,
        size: '49KB',
        pages: 160,
      },
      'automotive-performance-optimization-whitepaper': {
        downloads: 3892,
        size: '66KB',
        pages: 207,
      },
      'can-bus-integration-best-practices': {
        downloads: 3156,
        size: '50KB',
        pages: 153,
      },
      'smart-navigation-app-case-study': {
        downloads: 3851,
        size: '67KB',
        pages: 207,
      },
    };

    res.json({
      success: true,
      stats,
    });
  } catch (error) {
    console.error('获取下载统计失败:', error);
    res.status(500).json({
      success: false,
      message: '获取统计失败',
    });
  }
};

module.exports = {
  renderDownloadsIndex,
  downloadDocument,
  trackDownload,
  getDownloadStats,
};
