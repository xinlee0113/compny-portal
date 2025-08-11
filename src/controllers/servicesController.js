const { getTexts } = require('../config/i18n');

/**
 * 车载应用开发服务控制器
 */
class ServicesController {
  /**
   * 渲染车载应用开发页面
   */
  static renderAutomotiveDevelopment(req, res) {
    const texts = getTexts(req.language || 'zh');

    // 车载应用开发服务数据
    const serviceData = {
      hero: {
        title: '智能车载应用开发专家',
        subtitle:
          '专注Android Automotive OS、QNX、Linux车载系统开发，为全球汽车制造商提供完整解决方案',
        features: ['ISO 26262认证', 'ASPICE L3', '200+项目经验', '7x24技术支持'],
      },

      capabilities: [
        {
          id: 'cockpit',
          icon: 'fas fa-car-side',
          title: '智能座舱系统',
          description: '集成导航、娱乐、通信的一体化智能座舱解决方案，支持多屏互动和语音控制',
          technologies: [
            'Android Automotive OS',
            'Car App Library',
            'Google Assistant',
            'Material Design',
          ],
          features: [
            '多屏协同显示',
            '语音交互控制',
            '个性化用户界面',
            '车载App生态集成',
            '云端数据同步',
          ],
        },
        {
          id: 'adas',
          icon: 'fas fa-eye',
          title: 'ADAS智能驾驶',
          description: '高级驾驶辅助系统开发，包含自适应巡航、车道保持、自动泊车等功能',
          technologies: ['QNX Neutrino', 'AUTOSAR', 'Camera SDK', 'Radar/Lidar API'],
          features: [
            '自适应巡航控制(ACC)',
            '车道保持辅助(LKA)',
            '自动紧急制动(AEB)',
            '盲点监测(BSM)',
            '自动泊车辅助(APA)',
          ],
        },
        {
          id: 'tbox',
          icon: 'fas fa-wifi',
          title: '车联网T-Box',
          description: '车载通信终端开发，实现远程监控、OTA升级、紧急救援等车联网服务',
          technologies: ['4G/5G Module', 'MQTT Protocol', 'OTA Framework', 'Security Engine'],
          features: [
            '远程车辆监控',
            '空中软件升级(OTA)',
            '紧急救援服务(eCall)',
            '车队管理系统',
            '数据安全传输',
          ],
        },
        {
          icon: 'fas fa-network-wired',
          title: 'CAN总线开发',
          description: '车载网络通信协议开发，支持CAN、CAN-FD、LIN等多种协议',
          technologies: ['CAN 2.0B', 'CAN-FD', 'LIN', 'FlexRay', 'Ethernet AVB'],
          features: [
            'ECU通信协议栈',
            '网络管理和诊断',
            '总线负载优化',
            'UDS诊断服务',
            '网络安全防护',
          ],
        },
        {
          icon: 'fas fa-cogs',
          title: 'QNX实时系统',
          description: '基于QNX的安全关键系统开发，满足功能安全ISO 26262要求',
          technologies: ['QNX Neutrino', 'QNX CAR Platform', 'Qt/QML', 'HMI Framework'],
          features: [
            '硬实时系统保证',
            'ASIL-D功能安全',
            '微内核架构',
            '多核处理器支持',
            '低延迟响应(<1ms)',
          ],
        },
        {
          icon: 'fab fa-linux',
          title: 'Linux嵌入式开发',
          description: '基于嵌入式Linux的车载应用开发，支持Yocto、Buildroot等构建系统',
          technologies: ['Yocto Project', 'Wayland/Weston', 'GStreamer', 'D-Bus', 'SystemD'],
          features: [
            '定制化Linux发行版',
            '图形显示优化',
            '多媒体框架集成',
            '容器化部署',
            '快速启动优化',
          ],
        },
      ],

      developmentProcess: [
        {
          step: 1,
          title: '需求分析',
          description: '深入了解客户需求，制定技术方案',
          deliverables: ['需求规格说明', '技术架构设计', '开发计划'],
        },
        {
          step: 2,
          title: '原型设计',
          description: '快速原型开发，验证设计方案',
          deliverables: ['交互原型', 'UI/UX设计', '技术验证'],
        },
        {
          step: 3,
          title: '开发实现',
          description: '敏捷开发模式，迭代交付',
          deliverables: ['功能模块', '集成测试', '文档交付'],
        },
        {
          step: 4,
          title: '测试验证',
          description: '全面测试验证，确保质量',
          deliverables: ['测试报告', '性能优化', '安全验证'],
        },
        {
          step: 5,
          title: '部署维护',
          description: '生产部署和持续维护支持',
          deliverables: ['部署方案', '运维文档', '技术支持'],
        },
      ],

      caseStudies: [
        {
          title: '智能导航应用开发',
          client: '某知名车企',
          platform: 'Android Automotive',
          description: '为某知名车企开发的车载导航应用，集成高德地图API，支持语音控制和实时路况',
          achievements: ['用户体验评分4.8分', '导航准确率99.5%', '响应时间<200ms', '月活用户80万+'],
          technologies: [
            'Android Automotive',
            '高德地图API',
            'Google Assistant',
            'Material Design',
          ],
        },
        {
          title: '车载娱乐系统',
          client: '新能源车厂商',
          platform: 'QNX + Linux',
          description: '多媒体娱乐系统开发，支持音乐、视频、游戏等多种内容',
          achievements: ['支持4K视频播放', '音频延迟<10ms', '支持30+音频格式', '游戏帧率稳定60fps'],
          technologies: ['QNX CAR', 'GStreamer', 'OpenGL ES', 'WebRTC'],
        },
      ],

      pricing: {
        basic: {
          name: '基础版',
          price: '30万起',
          duration: '3-6个月',
          features: [
            '单平台应用开发',
            '基础功能实现',
            '标准UI设计',
            '基础测试验证',
            '3个月技术支持',
          ],
        },
        professional: {
          name: '专业版',
          price: '80万起',
          duration: '6-12个月',
          features: [
            '多平台应用开发',
            '复杂功能实现',
            '定制UI/UX设计',
            '全面测试验证',
            '12个月技术支持',
            '性能优化服务',
          ],
        },
        enterprise: {
          name: '企业版',
          price: '面议',
          duration: '12个月以上',
          features: [
            '全栈解决方案',
            '车云一体化开发',
            '专属团队支持',
            '持续集成/部署',
            '长期技术支持',
            '定制化培训',
          ],
        },
      },
    };

    const pageTitle =
      (texts &&
        texts.services &&
        texts.services.automotiveDevelopment &&
        texts.services.automotiveDevelopment.title) ||
      '车载应用开发';
    res.render('services/automotive-development', {
      title: pageTitle,
      texts,
      serviceData,
      currentPage: 'services',
      currentPath: req.path,
    });
  }

  /**
   * 渲染系统集成服务页面
   */
  static renderSystemIntegration(req, res) {
    const texts = getTexts(req.language || 'zh');

    const serviceData = {
      hero: {
        title: '车载系统集成服务',
        subtitle: '专业的CAN总线、车载网关、云端服务集成解决方案',
        features: ['多系统集成', '协议适配', '安全通信', '云端同步'],
      },

      integrationServices: [
        {
          icon: 'fas fa-network-wired',
          title: 'CAN总线集成',
          description: '车载CAN总线通信集成，支持多种协议和网络拓扑',
          protocols: ['CAN 2.0', 'CAN-FD', 'LIN', 'FlexRay'],
          capabilities: ['多网络协议支持', '实时数据传输', '错误检测和恢复', '网络诊断功能'],
        },
        {
          icon: 'fas fa-server',
          title: '车载网关开发',
          description: '智能车载网关解决方案，连接车内外网络',
          features: ['ECU数据聚合', '协议转换', '安全网关', 'OTA升级支持'],
        },
        {
          icon: 'fas fa-cloud',
          title: '车云一体化',
          description: '车载终端与云端服务深度集成',
          services: ['远程诊断', '数据同步', '远程控制', '实时监控'],
        },
      ],
    };

    res.render('services/system-integration', {
      title: texts.services.systemIntegration.title,
      texts,
      serviceData,
      currentPage: 'services',
      currentPath: req.path,
    });
  }

  /**
   * 渲染测试验证服务页面
   */
  static renderTestingValidation(req, res) {
    const texts = getTexts(req.language || 'zh');

    const serviceData = {
      hero: {
        title: '车载应用测试验证',
        subtitle: '全面的功能测试、性能测试、安全测试和合规验证',
        features: ['自动化测试', '性能验证', '安全评估', '合规认证'],
      },

      testingServices: [
        {
          icon: 'fas fa-vial',
          title: '功能测试',
          description: '全面的功能验证和用户体验测试',
          methods: ['单元测试', '集成测试', '系统测试', '用户验收测试'],
        },
        {
          icon: 'fas fa-tachometer-alt',
          title: '性能测试',
          description: '应用性能和系统资源使用验证',
          metrics: ['响应时间', '内存使用', 'CPU占用', '网络延迟'],
        },
        {
          icon: 'fas fa-shield-alt',
          title: '安全测试',
          description: '信息安全和功能安全验证',
          standards: ['ISO 26262', 'ISO/SAE 21434', 'ASPICE', 'CC认证'],
        },
      ],
    };

    res.render('services/testing-validation', {
      title: texts.services.testingValidation.title,
      texts,
      serviceData,
      currentPage: 'services',
      currentPath: req.path,
    });
  }
}

module.exports = ServicesController;
