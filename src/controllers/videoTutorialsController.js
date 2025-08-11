/**
 * 视频教程控制器
 * 处理视频教程页面的展示和管理
 */

const companyInfo = require('../config/company');

class VideoTutorialsController {
  /**
   * 渲染视频教程主页
   */
  static async renderVideoTutorials(req, res) {
    try {
      const pageData = {
        title: '视频教程',
        description: `${companyInfo.name}车载应用开发视频教程，涵盖Android Automotive、QNX、Linux等平台开发技术`,
        keywords: '车载开发,视频教程,Android Automotive,QNX,Linux嵌入式,汽车电子',
        currentPage: 'video-tutorials',
      };

      // 模拟视频教程数据
      const videoCategories = [
        {
          id: 'android',
          name: 'Android Automotive',
          description: 'Android车载系统开发',
          color: '#4CAF50',
          icon: 'fab fa-android',
        },
        {
          id: 'qnx',
          name: 'QNX系统',
          description: 'QNX实时操作系统',
          color: '#9C27B0',
          icon: 'fas fa-microchip',
        },
        {
          id: 'linux',
          name: 'Linux嵌入式',
          description: '嵌入式Linux开发',
          color: '#2196F3',
          icon: 'fab fa-linux',
        },
        {
          id: 'tools',
          name: '开发工具',
          description: '专业开发工具使用',
          color: '#FF9800',
          icon: 'fas fa-tools',
        },
      ];

      const featuredVideos = [
        {
          id: '1',
          title: 'Android Automotive开发入门',
          description: '学习Android Automotive OS的基础架构和开发环境搭建',
          category: 'android',
          duration: '45分钟',
          difficulty: 'beginner',
          thumbnail: '/images/thumbnails/android-intro.jpg',
          views: 1200,
          likes: 89,
          publishDate: '2025-01-15',
        },
        {
          id: '2',
          title: 'QNX实时系统基础',
          description: '了解QNX实时操作系统的核心概念和开发环境',
          category: 'qnx',
          duration: '38分钟',
          difficulty: 'beginner',
          thumbnail: '/images/thumbnails/qnx-basics.jpg',
          views: 724,
          likes: 45,
          publishDate: '2025-01-12',
        },
        {
          id: '3',
          title: '嵌入式Linux开发',
          description: '构建车载嵌入式Linux系统和应用程序开发',
          category: 'linux',
          duration: '41分钟',
          difficulty: 'advanced',
          thumbnail: '/images/thumbnails/linux-embedded.jpg',
          views: 623,
          likes: 52,
          publishDate: '2025-01-10',
        },
        {
          id: '4',
          title: 'CAN总线调试工具',
          description: '学习使用专业工具进行CAN总线通信调试和分析',
          category: 'tools',
          duration: '29分钟',
          difficulty: 'intermediate',
          thumbnail: '/images/thumbnails/can-tools.jpg',
          views: 445,
          likes: 31,
          publishDate: '2025-01-08',
        },
        {
          id: '5',
          title: '车载应用UI设计',
          description: '掌握车载场景下的用户界面设计原则和最佳实践',
          category: 'android',
          duration: '52分钟',
          difficulty: 'intermediate',
          thumbnail: '/images/thumbnails/ui-design.jpg',
          views: 856,
          likes: 67,
          publishDate: '2025-01-05',
        },
        {
          id: '6',
          title: '车载导航应用开发',
          description: '实战开发一个完整的车载导航应用，包含地图集成',
          category: 'android',
          duration: '63分钟',
          difficulty: 'advanced',
          thumbnail: '/images/thumbnails/navigation-app.jpg',
          views: 1500,
          likes: 125,
          publishDate: '2025-01-01',
        },
      ];

      const stats = {
        totalVideos: featuredVideos.length + 44, // 50+ 总视频
        totalProjects: 20,
        totalStudents: 1000,
        totalHours: 100,
      };

      const learningPaths = [
        {
          id: 'android-path',
          name: 'Android Automotive 学习路径',
          description: '从基础到高级，全面掌握Android车载开发',
          steps: [
            {
              step: 1,
              title: '环境搭建与基础概念',
              description: '学习Android Automotive OS架构，搭建开发环境',
              estimatedTime: '2-3小时',
              difficulty: 'beginner',
            },
            {
              step: 2,
              title: '车载应用UI/UX设计',
              description: '掌握车载场景下的界面设计原则和用户体验',
              estimatedTime: '4-5小时',
              difficulty: 'intermediate',
            },
            {
              step: 3,
              title: '系统服务与权限管理',
              description: '学习车载系统服务调用和权限管理机制',
              estimatedTime: '3-4小时',
              difficulty: 'intermediate',
            },
            {
              step: 4,
              title: '实战项目开发',
              description: '完成一个完整的车载应用项目，综合运用所学知识',
              estimatedTime: '8-10小时',
              difficulty: 'advanced',
            },
          ],
        },
      ];

      res.render('video-tutorials', {
        pageData,
        company: companyInfo,
        videoCategories,
        featuredVideos,
        stats,
        learningPaths,
        page: 'video-tutorials', // 添加页面标识
        texts: require('../config/i18n').texts.zh, // 添加国际化文本
        layout: false, // 使用独立布局
      });
    } catch (error) {
      console.error('渲染视频教程页面失败:', error);
      res.status(500).render('500', {
        title: '服务器错误',
        company: companyInfo,
        layout: false,
      });
    }
  }

  /**
   * 获取视频分类列表 API
   */
  static async getVideoCategories(req, res) {
    try {
      const categories = [
        { id: 'android', name: 'Android Automotive', count: 25 },
        { id: 'qnx', name: 'QNX系统', count: 12 },
        { id: 'linux', name: 'Linux嵌入式', count: 8 },
        { id: 'tools', name: '开发工具', count: 5 },
      ];

      res.json({
        success: true,
        data: categories,
      });
    } catch (error) {
      console.error('获取视频分类失败:', error);
      res.status(500).json({
        success: false,
        message: '获取视频分类失败',
      });
    }
  }

  /**
   * 获取视频列表 API
   */
  static async getVideoList(req, res) {
    try {
      const { category, page = 1, limit = 12, difficulty, search } = req.query;

      // 模拟分页视频数据
      const videos = [
        {
          id: '1',
          title: 'Android Automotive开发入门',
          description: '学习Android Automotive OS的基础架构和开发环境搭建',
          category: 'android',
          duration: '45分钟',
          difficulty: 'beginner',
          views: 1200,
          likes: 89,
        },
        // ... 更多视频数据
      ];

      // 应用过滤器
      let filteredVideos = videos;
      if (category && category !== 'all') {
        filteredVideos = filteredVideos.filter((video) => video.category === category);
      }
      if (difficulty) {
        filteredVideos = filteredVideos.filter((video) => video.difficulty === difficulty);
      }
      if (search) {
        filteredVideos = filteredVideos.filter(
          (video) =>
            video.title.toLowerCase().includes(search.toLowerCase()) ||
            video.description.toLowerCase().includes(search.toLowerCase())
        );
      }

      // 模拟分页
      const total = filteredVideos.length;
      const offset = (page - 1) * limit;
      const paginatedVideos = filteredVideos.slice(offset, offset + parseInt(limit));

      res.json({
        success: true,
        data: {
          videos: paginatedVideos,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: Math.ceil(total / limit),
          },
        },
      });
    } catch (error) {
      console.error('获取视频列表失败:', error);
      res.status(500).json({
        success: false,
        message: '获取视频列表失败',
      });
    }
  }

  /**
   * 获取视频详情 API
   */
  static async getVideoDetail(req, res) {
    try {
      const { id } = req.params;

      // 模拟视频详情数据
      const video = {
        id,
        title: 'Android Automotive开发入门',
        description: '学习Android Automotive OS的基础架构和开发环境搭建',
        longDescription: '在这个视频中，我们将从零开始学习Android Automotive OS的基础架构...',
        category: 'android',
        duration: '45分钟',
        difficulty: 'beginner',
        views: 1200,
        likes: 89,
        publishDate: '2025-01-15',
        instructor: '张工程师',
        tags: ['Android Automotive', '入门', '开发环境'],
        chapters: [
          { title: '课程介绍', start: '00:00', duration: '3分钟' },
          { title: 'Android Automotive OS概述', start: '03:00', duration: '15分钟' },
          { title: '开发环境搭建', start: '18:00', duration: '20分钟' },
          { title: '第一个Hello World应用', start: '38:00', duration: '7分钟' },
        ],
        prerequisites: ['Android基础开发经验', 'Java/Kotlin编程基础'],
        learningObjectives: [
          '理解Android Automotive OS架构',
          '掌握开发环境搭建方法',
          '能够创建基础车载应用',
        ],
      };

      res.json({
        success: true,
        data: video,
      });
    } catch (error) {
      console.error('获取视频详情失败:', error);
      res.status(500).json({
        success: false,
        message: '获取视频详情失败',
      });
    }
  }
}

module.exports = VideoTutorialsController;
