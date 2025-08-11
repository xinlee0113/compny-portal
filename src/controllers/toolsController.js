/**
 * 开发工具控制器
 */
const { getTexts } = require('../config/i18n');

// 开发框架展示页面
exports.developmentFramework = (req, res) => {
  const texts = getTexts(req.language || 'zh');
  const pageData = {
    title: '车载应用开发框架',
    description: '提供完整的车载应用开发框架和工具链，助力快速开发高质量车载应用',
    frameworks: [
      {
        name: 'AutomotiveSDK',
        description: '专为车载应用开发设计的SDK框架，集成常用车载API和组件',
        features: [
          '车载UI组件库',
          'CAN总线通信框架',
          '多媒体播放组件',
          '导航服务接口',
          '语音控制SDK',
          '设备管理API',
        ],
        version: 'v2.1.0',
        platforms: ['Android Automotive', 'QNX', 'Linux'],
        icon: 'fas fa-code',
        downloadUrl: '/downloads/automotive-sdk-v2.1.0.zip',
        docs: '/docs/automotive-sdk',
      },
      {
        name: 'CarAppFramework',
        description: '基于React Native的跨平台车载应用开发框架',
        features: [
          'React Native车载适配',
          '跨平台UI组件',
          '原生模块桥接',
          '性能优化工具',
          '热更新支持',
          '调试开发工具',
        ],
        version: 'v1.8.2',
        platforms: ['Android Automotive', 'iOS CarPlay'],
        icon: 'fab fa-react',
        downloadUrl: '/downloads/carapp-framework-v1.8.2.zip',
        docs: '/docs/carapp-framework',
      },
      {
        name: 'VehicleTestSuite',
        description: '车载应用自动化测试框架，支持功能测试和性能监控',
        features: [
          'UI自动化测试',
          '性能监控工具',
          '设备兼容性测试',
          '回归测试套件',
          'CI/CD集成',
          '测试报告生成',
        ],
        version: 'v3.0.1',
        platforms: ['Android', 'QNX', 'Linux'],
        icon: 'fas fa-vial',
        downloadUrl: '/downloads/vehicle-test-suite-v3.0.1.zip',
        docs: '/docs/vehicle-test-suite',
      },
    ],
    tools: [
      {
        category: '开发工具',
        items: [
          { name: 'Android Studio车载插件', description: '专为Android Automotive开发的IDE插件' },
          { name: 'QNX Momentics IDE', description: 'QNX官方集成开发环境' },
          { name: 'Yocto Builder', description: 'Linux车载系统构建工具' },
          { name: 'CAN Simulator', description: 'CAN总线数据模拟器' },
        ],
      },
      {
        category: '调试工具',
        items: [
          { name: 'Vehicle Inspector', description: '车载应用运行时检查工具' },
          { name: 'Performance Profiler', description: '性能分析和优化工具' },
          { name: 'Log Analyzer', description: '车载日志分析工具' },
          { name: 'Network Monitor', description: '网络通信监控工具' },
        ],
      },
      {
        category: '测试工具',
        items: [
          { name: 'AutoTest Runner', description: '自动化测试执行器' },
          { name: 'Device Farm', description: '多设备云测试平台' },
          { name: 'Stress Tester', description: '压力测试工具' },
          { name: 'Compatibility Checker', description: '兼容性检查工具' },
        ],
      },
    ],
  };

  res.render('tools/development-framework', {
    pageData,
    texts,
    currentPage: 'dev-center',
  });
};

// SDK工具链页面
exports.sdkToolchain = (req, res) => {
  const pageData = {
    title: 'SDK工具链',
    description: '完整的车载应用开发SDK和工具链，涵盖开发、调试、测试全流程',
    sdks: [
      {
        name: 'Automotive Core SDK',
        description: '核心车载功能SDK，提供基础车载服务接口',
        apis: ['车辆信息API', '传感器数据API', '控制指令API', '故障诊断API'],
        language: 'Java/Kotlin',
        size: '12.5 MB',
      },
      {
        name: 'Media Player SDK',
        description: '车载多媒体播放SDK，支持音频、视频播放',
        apis: ['音频播放API', '视频播放API', '流媒体API', '音效控制API'],
        language: 'C++/Java',
        size: '18.2 MB',
      },
      {
        name: 'Navigation SDK',
        description: '导航服务SDK，集成地图和导航功能',
        apis: ['地图显示API', '路径规划API', '实时导航API', '位置服务API'],
        language: 'Kotlin',
        size: '25.8 MB',
      },
    ],
  };

  res.render('tools/sdk-toolchain', { pageData });
};

// 开发环境配置页面
exports.devEnvironment = (req, res) => {
  const pageData = {
    title: '开发环境配置',
    description: '车载应用开发环境配置指南，帮助开发者快速搭建开发环境',
    environments: [
      {
        platform: 'Android Automotive',
        requirements: [
          'Android Studio 4.2+',
          'Android SDK API 29+',
          'Android Automotive Emulator',
          'Gradle 7.0+',
        ],
        setup: ['安装Android Studio', '配置Android SDK', '创建Automotive AVD', '导入项目模板'],
      },
      {
        platform: 'QNX Neutrino',
        requirements: [
          'QNX SDP 7.1+',
          'QNX Momentics IDE',
          'QNX CAR Platform',
          'Cross-compilation toolchain',
        ],
        setup: ['安装QNX SDP', '配置开发环境', '设置目标硬件', '编译示例项目'],
      },
    ],
  };

  res.render('tools/dev-environment', { pageData });
};
