const { getTexts } = require('../config/i18n');

/**
 * 案例研究控制器
 */
class CaseStudiesController {
  /**
   * 渲染案例研究主页
   */
  static renderIndex(req, res) {
    const texts = getTexts(req.language || 'zh');

    const caseStudiesData = {
      hero: {
        title: '车载应用开发成功案例',
        subtitle: '真实的客户项目，展示我们在车载应用开发领域的专业实力',
        stats: [
          { number: '50+', label: '成功项目' },
          { number: '20+', label: '合作客户' },
          { number: '98%', label: '客户满意度' },
          { number: '3年', label: '平均合作周期' },
        ],
      },

      featuredCases: [
        {
          id: 'smart-navigation',
          title: '智能导航应用开发',
          category: '导航应用',
          client: '某知名车企A',
          platform: 'Android Automotive',
          image: '/images/cases/navigation-app.jpg',
          description:
            '为某知名车企开发的车载智能导航应用，集成高德地图API，支持语音控制、实时路况、POI搜索等功能',
          technologies: [
            'Android Automotive',
            '高德地图API',
            'Google Assistant',
            'Material Design',
          ],
          achievements: ['用户体验评分4.8分', '导航准确率99.5%', '响应时间<200ms', '月活用户80万+'],
          projectScope: [
            '需求分析与架构设计',
            'UI/UX设计与开发',
            '地图SDK集成',
            '语音控制实现',
            '性能优化',
            '测试验证',
          ],
          duration: '8个月',
          teamSize: '12人',
          highlights: [
            '国内首批符合Google车载应用标准的导航应用',
            '创新的多模态交互设计',
            '深度优化的地图渲染性能',
            '完善的离线导航能力',
          ],
        },
        {
          id: 'entertainment-system',
          title: '车载娱乐系统',
          category: '娱乐系统',
          client: '新能源车厂商B',
          platform: 'QNX + Linux',
          image: '/images/cases/entertainment-system.jpg',
          description:
            '多媒体娱乐系统开发，支持音乐、视频、游戏等多种内容，为用户提供丰富的车内娱乐体验',
          technologies: ['QNX CAR', 'GStreamer', 'OpenGL ES', 'WebRTC'],
          achievements: ['支持4K视频播放', '音频延迟<10ms', '支持30+音频格式', '游戏帧率稳定60fps'],
          projectScope: [
            '多媒体架构设计',
            '音视频解码优化',
            '游戏引擎集成',
            '内容分发网络',
            'DRM版权保护',
            '用户界面开发',
          ],
          duration: '12个月',
          teamSize: '15人',
          highlights: [
            '业界领先的4K视频播放能力',
            '超低延迟的音频处理技术',
            '丰富的第三方内容生态',
            '完善的家长控制功能',
          ],
        },
        {
          id: 'voice-assistant',
          title: '智能语音助手',
          category: '语音交互',
          client: '豪华品牌车企C',
          platform: 'Android Automotive',
          image: '/images/cases/voice-assistant.jpg',
          description: '车载智能语音助手系统，支持自然语言理解、多轮对话、车辆控制等功能',
          technologies: ['Android Automotive', 'TensorFlow Lite', 'ASR/TTS', 'NLU Engine'],
          achievements: ['语音识别准确率96%', '响应时间<1秒', '支持10种方言', '离线语音处理'],
          projectScope: [
            'ASR/TTS引擎集成',
            '自然语言理解',
            '对话管理系统',
            '车辆控制接口',
            '个性化学习',
            '隐私保护机制',
          ],
          duration: '10个月',
          teamSize: '18人',
          highlights: [
            '领先的离线语音处理能力',
            '智能的上下文理解',
            '丰富的车辆控制指令',
            '严格的隐私保护标准',
          ],
        },
        {
          id: 'vehicle-control',
          title: '车辆控制应用',
          category: '车控系统',
          client: '智能电动车企D',
          platform: 'Linux + QNX',
          image: '/images/cases/vehicle-control.jpg',
          description: '车辆控制中心应用，实现空调、座椅、灯光、车窗等车辆功能的集中控制',
          technologies: ['CAN-FD', 'LIN', 'Qt Framework', 'Real-time OS'],
          achievements: [
            'CAN通信延迟<5ms',
            '支持100+控制指令',
            '99.9%系统可靠性',
            'ISO 26262 ASIL-C认证',
          ],
          projectScope: [
            'CAN总线通信',
            '实时控制算法',
            '安全机制设计',
            '用户界面开发',
            '系统集成测试',
            '功能安全认证',
          ],
          duration: '14个月',
          teamSize: '20人',
          highlights: [
            '高可靠性的实时控制系统',
            '完善的功能安全设计',
            '直观的用户操作界面',
            '全面的故障诊断能力',
          ],
        },
      ],

      categories: [
        { name: '全部', value: 'all', count: 50 },
        { name: '导航应用', value: 'navigation', count: 12 },
        { name: '娱乐系统', value: 'entertainment', count: 15 },
        { name: '语音交互', value: 'voice', count: 8 },
        { name: '车控系统', value: 'control', count: 10 },
        { name: '安全应用', value: 'security', count: 5 },
      ],

      technicalStacks: [
        'Android Automotive',
        'QNX Neutrino',
        'Linux Embedded',
        'CAN/CAN-FD',
        'Qt Framework',
        'OpenGL ES',
        'GStreamer',
        'TensorFlow Lite',
      ],
    };

    res.render('case-studies/index', {
      title: '成功案例',
      texts,
      caseStudiesData,
      currentPage: 'case-studies',
      currentPath: req.path,
    });
  }

  /**
   * 渲染单个案例详情页
   */
  static renderCaseDetail(req, res) {
    const caseId = req.params.id;
    const texts = getTexts(req.language || 'zh');

    // 这里应该从数据库获取案例详情，现在先用模拟数据
    const caseDetail = {
      id: caseId,
      title: '智能导航应用开发',
      // ... 其他详细信息
    };

    if (!caseDetail) {
      return res.status(404).render('404', {
        title: '案例未找到',
        texts,
        currentPath: req.path,
      });
    }

    res.render('case-studies/detail', {
      title: caseDetail.title,
      texts,
      caseDetail,
      currentPath: req.path,
    });
  }
}

module.exports = CaseStudiesController;
