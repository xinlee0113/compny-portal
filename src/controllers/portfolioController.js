/**
 * 项目作品集控制器
 */

// 项目作品数据
const projects = [
  {
    id: 'automotive-infotainment-system',
    title: '智能车载信息娱乐系统',
    subtitle: 'Android Automotive OS 平台开发',
    category: 'automotive-os',
    client: '某知名汽车制造商',
    duration: '8个月',
    team: '12人',
    status: 'completed',
    featured: true,
    year: 2024,
    thumbnail: '/images/portfolio/automotive-infotainment-thumb.jpg',
    images: [
      '/images/portfolio/automotive-infotainment-1.jpg',
      '/images/portfolio/automotive-infotainment-2.jpg',
      '/images/portfolio/automotive-infotainment-3.jpg',
    ],
    technologies: [
      'Android Automotive OS',
      'Kotlin',
      'Java',
      'CAN Bus',
      'AIDL',
      'Car API',
      'Vehicle HAL',
      'Google Assistant',
    ],
    description:
      '为某知名汽车制造商开发的全功能车载信息娱乐系统，基于Android Automotive OS平台，集成了导航、音乐、通话、车辆控制等核心功能。',
    challenges: [
      '实现与车辆CAN总线的稳定通信',
      '优化系统启动时间至3秒以内',
      '确保在车载环境下的系统稳定性',
      '集成第三方应用的安全性验证',
    ],
    solutions: [
      '自研CAN总线通信框架，支持实时数据传输',
      '采用分层启动机制和预加载策略',
      '实现热插拔和故障恢复机制',
      '建立应用审核和沙盒隔离系统',
    ],
    features: [
      {
        title: '智能语音助手',
        description: '集成Google Assistant，支持自然语言交互',
        icon: 'fas fa-microphone',
      },
      {
        title: '车辆状态监控',
        description: '实时显示车辆状态，包括油耗、胎压、发动机状态',
        icon: 'fas fa-car',
      },
      {
        title: '第三方应用商店',
        description: '支持安装和管理车载专用应用',
        icon: 'fas fa-store',
      },
      {
        title: '多用户配置',
        description: '支持多用户个性化设置和数据隔离',
        icon: 'fas fa-users',
      },
    ],
    metrics: {
      performance: '系统启动时间 < 3秒',
      stability: '连续运行7天无故障',
      userSatisfaction: '用户满意度 95%',
      testCoverage: '代码覆盖率 88%',
    },
    tags: ['Android Automotive', '车载系统', '信息娱乐', '语音交互'],
  },
  {
    id: 'qnx-navigation-platform',
    title: 'QNX智能导航平台',
    subtitle: '实时导航系统开发',
    category: 'navigation',
    client: '新能源汽车公司',
    duration: '6个月',
    team: '8人',
    status: 'completed',
    featured: true,
    year: 2024,
    thumbnail: '/images/portfolio/qnx-navigation-thumb.jpg',
    images: ['/images/portfolio/qnx-navigation-1.jpg', '/images/portfolio/qnx-navigation-2.jpg'],
    technologies: [
      'QNX Neutrino',
      'C++',
      'Qt',
      'OpenGL ES',
      'GPS/GNSS',
      'MapBox SDK',
      'WebSocket',
      'JSON',
    ],
    description:
      '基于QNX实时操作系统开发的高性能导航平台，提供精确的实时导航、路径规划和交通信息服务。',
    challenges: [
      '实时系统下的地图渲染性能优化',
      '复杂路况下的精确定位',
      '多传感器数据融合',
      '离线地图数据管理',
    ],
    solutions: [
      '采用OpenGL ES硬件加速渲染',
      '融合GPS、IMU、里程计多传感器定位',
      '实现卡尔曼滤波算法提升定位精度',
      '设计分层缓存机制管理地图数据',
    ],
    features: [
      {
        title: '实时交通信息',
        description: '获取实时路况，智能规避拥堵路段',
        icon: 'fas fa-traffic-light',
      },
      {
        title: '3D地图渲染',
        description: '高精度3D地图显示，支持多种视角',
        icon: 'fas fa-cube',
      },
      {
        title: '语音导航',
        description: '支持多语言语音播报和语音控制',
        icon: 'fas fa-volume-up',
      },
      {
        title: '离线导航',
        description: '支持下载离线地图，无网络环境下导航',
        icon: 'fas fa-download',
      },
    ],
    metrics: {
      performance: '地图渲染 60FPS',
      accuracy: '定位精度 < 2米',
      response: '路径计算 < 500ms',
      coverage: '地图覆盖全国主要城市',
    },
    tags: ['QNX', '导航系统', '实时计算', '地图渲染'],
  },
  {
    id: 'linux-cluster-display',
    title: 'Linux智能仪表盘系统',
    subtitle: '车载仪表显示平台',
    category: 'display',
    client: '豪华汽车品牌',
    duration: '10个月',
    team: '15人',
    status: 'completed',
    featured: false,
    year: 2023,
    thumbnail: '/images/portfolio/linux-cluster-thumb.jpg',
    images: [
      '/images/portfolio/linux-cluster-1.jpg',
      '/images/portfolio/linux-cluster-2.jpg',
      '/images/portfolio/linux-cluster-3.jpg',
    ],
    technologies: [
      'Embedded Linux',
      'Qt/QML',
      'OpenGL',
      'Wayland',
      'D-Bus',
      'systemd',
      'Python',
      'Shell',
    ],
    description:
      '为豪华汽车品牌开发的高端智能仪表盘系统，提供丰富的车辆信息显示和个性化界面定制功能。',
    challenges: [
      '高分辨率屏幕下的流畅显示',
      '复杂动画效果的性能优化',
      '多种显示模式的快速切换',
      '与车身控制器的可靠通信',
    ],
    solutions: [
      '采用GPU硬件加速和多线程渲染',
      '实现对象池和资源预加载机制',
      '设计状态机管理显示模式',
      '建立冗余通信链路和错误恢复机制',
    ],
    features: [
      {
        title: '自适应显示',
        description: '根据驾驶模式自动调整显示内容和布局',
        icon: 'fas fa-eye',
      },
      {
        title: '个性化主题',
        description: '支持多种主题和个性化设置',
        icon: 'fas fa-palette',
      },
      {
        title: '多屏联动',
        description: '与中控屏、HUD等设备协同显示',
        icon: 'fas fa-desktop',
      },
      {
        title: '故障诊断',
        description: '实时监控和显示车辆故障信息',
        icon: 'fas fa-wrench',
      },
    ],
    metrics: {
      performance: '界面响应 < 100ms',
      resolution: '支持4K分辨率显示',
      themes: '提供15种主题模式',
      reliability: '连续运行30天无重启',
    },
    tags: ['Linux', '仪表盘', 'Qt/QML', '图形界面'],
  },
  {
    id: 'adas-control-system',
    title: 'ADAS智能驾驶辅助系统',
    subtitle: '高级驾驶辅助功能开发',
    category: 'adas',
    client: '智能驾驶技术公司',
    duration: '12个月',
    team: '20人',
    status: 'in-progress',
    featured: true,
    year: 2024,
    thumbnail: '/images/portfolio/adas-system-thumb.jpg',
    images: ['/images/portfolio/adas-system-1.jpg', '/images/portfolio/adas-system-2.jpg'],
    technologies: [
      'ROS2',
      'C++',
      'Python',
      'OpenCV',
      'TensorFlow',
      'CUDA',
      'CAN FD',
      'Autosar',
      'MISRA C',
    ],
    description:
      '开发先进的ADAS系统，包括自适应巡航控制、车道保持辅助、自动紧急制动等功能，提升驾驶安全性。',
    challenges: [
      '实时图像处理和目标识别',
      '多传感器数据融合算法',
      '毫秒级的决策响应时间',
      '严格的功能安全标准compliance',
    ],
    solutions: [
      '采用深度学习模型优化目标检测',
      '实现卡尔曼滤波和粒子滤波融合',
      '设计分布式实时计算架构',
      '遵循ISO 26262功能安全标准',
    ],
    features: [
      {
        title: '自适应巡航控制',
        description: '智能跟车，自动调节车速保持安全距离',
        icon: 'fas fa-tachometer-alt',
      },
      {
        title: '车道保持辅助',
        description: '监测车道线，辅助驾驶员保持车道',
        icon: 'fas fa-road',
      },
      {
        title: '碰撞预警系统',
        description: '检测前方障碍物，及时预警避免碰撞',
        icon: 'fas fa-exclamation-triangle',
      },
      {
        title: '盲点监测',
        description: '监测车辆盲区，提醒驾驶员注意安全',
        icon: 'fas fa-eye-slash',
      },
    ],
    metrics: {
      accuracy: '目标识别准确率 > 99.5%',
      response: '系统响应时间 < 50ms',
      range: '检测范围 200米',
      safety: '通过ISO 26262 ASIL-D认证',
    },
    tags: ['ADAS', '深度学习', '传感器融合', '功能安全'],
  },
  {
    id: 'telematics-platform',
    title: '车联网远程信息服务平台',
    subtitle: 'T-Box车载终端系统',
    category: 'telematics',
    client: '车联网服务提供商',
    duration: '9个月',
    team: '18人',
    status: 'completed',
    featured: false,
    year: 2023,
    thumbnail: '/images/portfolio/telematics-thumb.jpg',
    images: ['/images/portfolio/telematics-1.jpg', '/images/portfolio/telematics-2.jpg'],
    technologies: ['FreeRTOS', 'C', '4G/5G', 'MQTT', 'OTA', 'HSM', 'GPS', 'OBD-II', 'CAN'],
    description:
      '为车联网服务提供商开发的T-Box车载终端系统，实现车辆远程监控、诊断、OTA升级等功能。',
    challenges: [
      '低功耗设计和电源管理',
      '网络连接的稳定性保障',
      '数据传输的安全性和加密',
      'OTA升级的可靠性机制',
    ],
    solutions: [
      '实现智能电源管理和休眠唤醒',
      '设计多网络备份和自动切换',
      '采用端到端加密和数字签名',
      '建立增量升级和回滚机制',
    ],
    features: [
      {
        title: '远程诊断',
        description: '实时监控车辆状态，远程故障诊断',
        icon: 'fas fa-stethoscope',
      },
      {
        title: 'OTA升级',
        description: '支持系统和应用的无线升级',
        icon: 'fas fa-cloud-download-alt',
      },
      {
        title: '紧急救援',
        description: '事故自动检测和紧急呼叫功能',
        icon: 'fas fa-ambulance',
      },
      {
        title: '车队管理',
        description: '支持商用车队的统一管理',
        icon: 'fas fa-truck',
      },
    ],
    metrics: {
      connectivity: '网络连接率 > 99%',
      power: '待机功耗 < 5mA',
      latency: '数据传输延迟 < 200ms',
      security: '通过CC EAL4+安全认证',
    },
    tags: ['车联网', 'T-Box', 'OTA', '远程诊断'],
  },
];

// 分类数据
const categories = [
  {
    id: 'automotive-os',
    name: '车载操作系统',
    description: 'Android Automotive、QNX等车载OS开发',
    icon: 'fas fa-desktop',
    color: '#667eea',
    count: 1,
  },
  {
    id: 'navigation',
    name: '导航系统',
    description: '智能导航和地图应用开发',
    icon: 'fas fa-map-marked-alt',
    color: '#764ba2',
    count: 1,
  },
  {
    id: 'display',
    name: '显示系统',
    description: '仪表盘和HMI界面开发',
    icon: 'fas fa-tv',
    color: '#f093fb',
    count: 1,
  },
  {
    id: 'adas',
    name: 'ADAS系统',
    description: '智能驾驶辅助系统开发',
    icon: 'fas fa-robot',
    color: '#f5576c',
    count: 1,
  },
  {
    id: 'telematics',
    name: '车联网',
    description: 'T-Box和远程服务开发',
    icon: 'fas fa-wifi',
    color: '#4facfe',
    count: 1,
  },
];

// 技术栈数据
const technologies = [
  'Android Automotive OS',
  'QNX Neutrino',
  'Embedded Linux',
  'FreeRTOS',
  'Kotlin',
  'Java',
  'C++',
  'C',
  'Python',
  'JavaScript',
  'Qt/QML',
  'OpenGL ES',
  'OpenCV',
  'TensorFlow',
  'ROS2',
  'CAN Bus',
  'CAN FD',
  'AIDL',
  'D-Bus',
  'MQTT',
  'OTA',
  'HSM',
  'GPS/GNSS',
  'OBD-II',
  'Autosar',
];

// 作品集主页
exports.index = (req, res) => {
  const pageData = {
    title: '项目作品集',
    description: '智云科技车载应用开发项目作品集，展示我们在各个领域的技术实力和创新成果',
    featuredProjects: projects.filter((p) => p.featured),
    allProjects: projects.sort((a, b) => b.year - a.year),
    categories: categories,
    technologies: technologies,
    stats: {
      totalProjects: projects.length,
      completedProjects: projects.filter((p) => p.status === 'completed').length,
      inProgressProjects: projects.filter((p) => p.status === 'in-progress').length,
      clients: new Set(projects.map((p) => p.client)).size,
      teamMembers: projects.reduce((sum, p) => sum + parseInt(p.team), 0),
      totalDuration: projects.reduce((sum, p) => sum + parseInt(p.duration), 0),
    },
  };

  res.render('portfolio/index', { pageData });
};

// 项目详情页
exports.projectDetail = (req, res) => {
  const projectId = req.params.id;
  const project = projects.find((p) => p.id === projectId);

  if (!project) {
    return res.status(404).render('404', {
      pageData: {
        title: '项目未找到',
        message: '抱歉，您访问的项目不存在',
      },
    });
  }

  // 获取相关项目
  const relatedProjects = projects
    .filter(
      (p) =>
        p.id !== projectId &&
        (p.category === project.category ||
          p.technologies.some((tech) => project.technologies.includes(tech)))
    )
    .slice(0, 3);

  const pageData = {
    title: `${project.title} - 项目详情`,
    description: project.description,
    project: project,
    relatedProjects: relatedProjects,
    category: categories.find((c) => c.id === project.category),
  };

  res.render('portfolio/detail', { pageData });
};

// 按分类筛选
exports.category = (req, res) => {
  const categoryId = req.params.category;
  const category = categories.find((c) => c.id === categoryId);

  if (!category) {
    return res.status(404).render('404');
  }

  const categoryProjects = projects.filter((p) => p.category === categoryId);

  const pageData = {
    title: `${category.name} - 项目分类`,
    description: category.description,
    category: category,
    projects: categoryProjects.sort((a, b) => b.year - a.year),
    categories: categories,
  };

  res.render('portfolio/category', { pageData });
};

// 技术栈筛选
exports.technology = (req, res) => {
  const tech = decodeURIComponent(req.params.tech);
  const techProjects = projects.filter((p) =>
    p.technologies.some((t) => t.toLowerCase().includes(tech.toLowerCase()))
  );

  const pageData = {
    title: `${tech} - 技术项目`,
    description: `使用 ${tech} 技术开发的项目`,
    technology: tech,
    projects: techProjects.sort((a, b) => b.year - a.year),
    technologies: technologies,
  };

  res.render('portfolio/technology', { pageData });
};

// 项目搜索
exports.search = (req, res) => {
  const query = req.query.q || '';
  const category = req.query.category || '';
  const tech = req.query.tech || '';
  const year = req.query.year || '';

  let searchResults = projects;

  // 关键词搜索
  if (query) {
    searchResults = searchResults.filter(
      (project) =>
        project.title.toLowerCase().includes(query.toLowerCase()) ||
        project.description.toLowerCase().includes(query.toLowerCase()) ||
        project.client.toLowerCase().includes(query.toLowerCase()) ||
        project.tags.some((tag) => tag.toLowerCase().includes(query.toLowerCase()))
    );
  }

  // 分类筛选
  if (category && category !== 'all') {
    searchResults = searchResults.filter((p) => p.category === category);
  }

  // 技术栈筛选
  if (tech && tech !== 'all') {
    searchResults = searchResults.filter((p) =>
      p.technologies.some((t) => t.toLowerCase().includes(tech.toLowerCase()))
    );
  }

  // 年份筛选
  if (year && year !== 'all') {
    searchResults = searchResults.filter((p) => p.year.toString() === year);
  }

  const pageData = {
    title: query ? `搜索"${query}" - 项目作品集` : '项目搜索',
    description: '搜索智云科技的项目作品集',
    query: query,
    category: category,
    tech: tech,
    year: year,
    results: searchResults.sort((a, b) => b.year - a.year),
    categories: categories,
    technologies: technologies,
    years: [...new Set(projects.map((p) => p.year))].sort((a, b) => b - a),
    resultCount: searchResults.length,
  };

  res.render('portfolio/search', { pageData });
};

// 获取作品集统计
exports.getStats = (req, res) => {
  try {
    const stats = {
      overview: {
        totalProjects: projects.length,
        completedProjects: projects.filter((p) => p.status === 'completed').length,
        inProgressProjects: projects.filter((p) => p.status === 'in-progress').length,
        featuredProjects: projects.filter((p) => p.featured).length,
      },
      categories: categories.map((category) => ({
        id: category.id,
        name: category.name,
        count: projects.filter((p) => p.category === category.id).length,
        completionRate:
          Math.round(
            (projects.filter((p) => p.category === category.id && p.status === 'completed').length /
              projects.filter((p) => p.category === category.id).length) *
              100
          ) || 0,
      })),
      technologies: technologies.slice(0, 10).map((tech) => ({
        name: tech,
        count: projects.filter((p) => p.technologies.includes(tech)).length,
        projects: projects
          .filter((p) => p.technologies.includes(tech))
          .map((p) => ({
            id: p.id,
            title: p.title,
            year: p.year,
          })),
      })),
      timeline: [...new Set(projects.map((p) => p.year))]
        .sort((a, b) => b - a)
        .map((year) => ({
          year: year,
          count: projects.filter((p) => p.year === year).length,
          projects: projects
            .filter((p) => p.year === year)
            .map((p) => ({
              id: p.id,
              title: p.title,
              category: p.category,
              status: p.status,
            })),
        })),
      clients: [...new Set(projects.map((p) => p.client))].map((client) => ({
        name: client,
        count: projects.filter((p) => p.client === client).length,
      })),
    };

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error('Portfolio stats error:', error);
    res.status(500).json({
      success: false,
      message: '获取统计数据失败',
    });
  }
};
