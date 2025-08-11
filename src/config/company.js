/**
 * 公司信息统一配置
 * 所有硬编码的公司信息都从这里获取
 */

const companyInfo = {
  // 基本信息
  name: '楚起科技',
  fullName: '湖北省武汉市上庄楚起科技有限公司',
  englishName: 'ChuQi Technology Co., Ltd.',
  slogan: '智能车载应用开发专家',
  englishSlogan: 'Expert in Intelligent Automotive Application Development',

  // 联系信息
  contact: {
    phone: '17771816787',
    email: 'xinlee0113@icloud.com',
    supportEmail: 'support@chuqi-tech.com',
    salesEmail: 'sales@chuqi-tech.com',
    techEmail: 'tech@chuqi-tech.com',
    apiEmail: 'api@chuqi-tech.com',
    opsEmail: 'ops@chuqi-tech.com',
    adminEmail: 'admin@chuqi-tech.com',
  },

  // 网站信息
  website: {
    domain: 'www.chuqi-tech.com',
    url: 'https://www.chuqi-tech.com',
    apiUrl: 'https://api.chuqi-tech.com',
  },

  // 地址信息
  address: {
    headquarters: {
      name: '总部',
      country: '中国',
      province: '湖北省',
      city: '武汉市',
      district: '东湖新技术开发区',
      street: '光谷中心城',
      building: '',
      floor: '',
      zipCode: '430074',
      fullAddress: '湖北省武汉市东湖新技术开发区光谷中心城',
    },
    branches: [
      {
        name: '北京分公司',
        country: '中国',
        province: '北京市',
        city: '北京市',
        district: '海淀区',
        street: '中关村大街27号',
        building: '中关村大厦',
        floor: '12层',
        zipCode: '100080',
        fullAddress: '北京市海淀区中关村大街27号中关村大厦12层',
      },
      {
        name: '上海分公司',
        country: '中国',
        province: '上海市',
        city: '上海市',
        district: '浦东新区',
        street: '张江高科技园区',
        building: '创新大厦',
        floor: '8层',
        zipCode: '201203',
        fullAddress: '上海市浦东新区张江高科技园区创新大厦8层',
      },
    ],
  },

  // 社交媒体
  social: {
    wechat: 'chuqi_tech',
    weibo: 'https://weibo.com/chuqitech',
    linkedin: 'https://linkedin.com/company/chuqi-technology',
    github: 'https://github.com/chuqi-tech',
    twitter: 'https://twitter.com/chuqitech',
  },

  // 业务信息
  business: {
    establishedYear: 2018,
    registrationNumber: '91440300MA5F8K9X2H',
    businessScope: [
      'Android Automotive OS应用开发',
      'QNX车载系统开发',
      'Linux嵌入式系统开发',
      'CAN总线应用集成',
      'ADAS智能驾驶辅助系统',
      '车联网T-Box开发',
      '车载信息娱乐系统',
      '智能仪表盘系统',
    ],
    industries: ['汽车电子', '车载系统', '智能网联汽车', '嵌入式系统'],
    certifications: [
      'ISO 9001质量管理体系认证',
      'ISO 26262功能安全认证',
      'ASPICE汽车软件过程改进认证',
      'CMMI软件能力成熟度认证',
    ],
  },

  // 技术信息
  technology: {
    platforms: [
      'Android Automotive OS',
      'QNX Neutrino RTOS',
      'Linux Embedded',
      'FreeRTOS',
      'AUTOSAR',
    ],
    languages: ['Kotlin', 'Java', 'C++', 'C', 'Python', 'JavaScript', 'Go', 'Rust'],
    frameworks: ['Qt/QML', 'React Native', 'Flutter', 'OpenGL ES', 'OpenCV', 'TensorFlow'],
    protocols: ['CAN', 'CAN FD', 'LIN', 'FlexRay', 'Ethernet', 'MQTT', 'OTA'],
  },

  // 工作时间
  workingHours: {
    weekdays: '周一至周五 9:00-18:00',
    support: '7×24小时技术支持',
    timezone: 'Asia/Shanghai (UTC+8)',
  },

  // 版权信息
  copyright: {
    year: new Date().getFullYear(),
    text: `© ${new Date().getFullYear()} 楚起科技有限公司 版权所有`,
    englishText: `© ${new Date().getFullYear()} ChuQi Technology Co., Ltd. All rights reserved.`,
    icp: '粤ICP备18123456号-1',
  },
};

module.exports = companyInfo;
