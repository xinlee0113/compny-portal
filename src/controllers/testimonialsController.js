const rateLimit = require('express-rate-limit');

/**
 * 客户推荐控制器
 */

// 客户推荐数据
const testimonials = [
  {
    id: 1,
    name: '李明',
    position: '技术总监',
    company: '某知名汽车制造商',
    avatar: '/images/testimonials/avatar1.jpg',
    rating: 5,
    content:
      '智云科技团队在Android Automotive开发方面表现出色。他们不仅技术实力强，而且对项目的理解很到位，交付的产品完全符合我们的预期。特别是在CAN总线集成方面，解决了我们一直困扰的技术难题。',
    project: 'Android Automotive车载信息娱乐系统',
    date: '2024-06-15',
    featured: true,
    verified: true,
    likes: 45,
    helpful: 92,
    tags: ['Android Automotive', 'CAN总线', '系统集成'],
  },
  {
    id: 2,
    name: '王芳',
    position: '产品经理',
    company: '智能驾驶科技公司',
    avatar: '/images/testimonials/avatar2.jpg',
    rating: 5,
    content:
      '与智云科技的合作非常愉快。他们的QNX平台开发经验丰富，帮助我们快速实现了车载导航系统的开发。项目按时交付，质量超出预期。团队沟通效率高，响应及时。',
    project: 'QNX车载导航系统开发',
    date: '2024-05-20',
    featured: true,
    verified: true,
    likes: 38,
    helpful: 89,
    tags: ['QNX', '导航系统', '项目管理'],
  },
  {
    id: 3,
    name: '张强',
    position: '研发工程师',
    company: '新能源汽车公司',
    avatar: '/images/testimonials/avatar3.jpg',
    rating: 4,
    content:
      '智云科技在Linux车载平台开发方面很专业。他们提供的技术方案解决了我们在性能优化方面的问题。虽然项目中遇到了一些挑战，但团队的技术实力和解决问题的能力让我们很满意。',
    project: 'Linux车载娱乐系统优化',
    date: '2024-04-10',
    featured: false,
    verified: true,
    likes: 28,
    helpful: 85,
    tags: ['Linux', '性能优化', '车载娱乐'],
  },
  {
    id: 4,
    name: '陈丽',
    position: '项目总监',
    company: '车联网技术公司',
    avatar: '/images/testimonials/avatar4.jpg',
    rating: 5,
    content:
      '选择智云科技是正确的决定。他们的团队不仅技术过硬，而且服务态度很好。在项目执行过程中，遇到问题都能及时解决。最终交付的产品质量很高，用户反馈良好。强烈推荐！',
    project: '车联网应用开发平台',
    date: '2024-03-25',
    featured: true,
    verified: true,
    likes: 52,
    helpful: 96,
    tags: ['车联网', '应用平台', '用户体验'],
  },
  {
    id: 5,
    name: '刘伟',
    position: 'CTO',
    company: '智慧交通解决方案公司',
    avatar: '/images/testimonials/avatar5.jpg',
    rating: 4,
    content:
      '智云科技在车载应用测试验证方面做得很好。他们的测试流程规范，发现了很多我们内部测试遗漏的问题。虽然测试周期比预期长了一些，但最终产品的稳定性大大提升。',
    project: '车载应用测试验证服务',
    date: '2024-02-18',
    featured: false,
    verified: true,
    likes: 31,
    helpful: 88,
    tags: ['测试验证', '质量保证', '稳定性'],
  },
];

// 提交频率限制
const submitRateLimit = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 24小时
  max: 1, // 每天最多1次
  message: {
    success: false,
    message: '每天只能提交一次推荐',
  },
});

// 客户推荐主页
exports.index = (req, res) => {
  const pageData = {
    title: '客户推荐',
    description: '听听我们的客户怎么说 - 真实的项目体验和专业评价',
    featuredTestimonials: testimonials.filter((t) => t.featured),
    allTestimonials: testimonials.sort((a, b) => new Date(b.date) - new Date(a.date)),
    stats: {
      totalTestimonials: testimonials.length,
      averageRating: calculateAverageRating(),
      verifiedCount: testimonials.filter((t) => t.verified).length,
      satisfactionRate: Math.round(
        (testimonials.filter((t) => t.rating >= 4).length / testimonials.length) * 100
      ),
    },
    ratingDistribution: getRatingDistribution(),
    companyLogos: [
      { name: '某知名汽车制造商', logo: '/images/clients/auto-manufacturer.png' },
      { name: '智能驾驶科技公司', logo: '/images/clients/smart-driving.png' },
      { name: '新能源汽车公司', logo: '/images/clients/ev-company.png' },
      { name: '车联网技术公司', logo: '/images/clients/iot-tech.png' },
      { name: '智慧交通解决方案公司', logo: '/images/clients/smart-traffic.png' },
    ],
  };

  res.render('testimonials/index', { pageData });
};

// 提交客户推荐
exports.submit = [
  submitRateLimit,
  async (req, res) => {
    try {
      const {
        name,
        position,
        company,
        email,
        phone,
        project,
        rating,
        content,
        allowPublish = false,
      } = req.body;

      // 基本验证
      if (!name || !company || !project || !rating || !content || !email) {
        return res.status(400).json({
          success: false,
          message: '请填写所有必填字段',
        });
      }

      // 评分验证
      const ratingNum = parseInt(rating);
      if (ratingNum < 1 || ratingNum > 5) {
        return res.status(400).json({
          success: false,
          message: '评分必须在1-5之间',
        });
      }

      // 邮箱验证
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({
          success: false,
          message: '请输入有效的邮箱地址',
        });
      }

      // 创建推荐记录
      const testimonialId = testimonials.length + 1;
      const newTestimonial = {
        id: testimonialId,
        name: name,
        position: position || '',
        company: company,
        email: email,
        phone: phone || '',
        avatar: '/images/testimonials/default-avatar.jpg',
        rating: ratingNum,
        content: content,
        project: project,
        date: new Date().toISOString().split('T')[0],
        featured: false,
        verified: false, // 需要管理员审核
        likes: 0,
        helpful: 0,
        tags: [],
        allowPublish: Boolean(allowPublish),
        status: 'pending', // 待审核
      };

      // 如果允许发布，则添加到列表（实际应该存入数据库）
      if (allowPublish) {
        testimonials.push(newTestimonial);
      }

      res.json({
        success: true,
        message: '感谢您的推荐！我们会在审核后发布您的评价。',
        testimonialId: testimonialId,
      });
    } catch (error) {
      console.error('Testimonial submission error:', error);
      res.status(500).json({
        success: false,
        message: '提交失败，请稍后重试',
      });
    }
  },
];

// 推荐评价
exports.rate = async (req, res) => {
  try {
    const testimonialId = parseInt(req.params.id);
    const { type } = req.body; // 'helpful' or 'like'

    const testimonial = testimonials.find((t) => t.id === testimonialId);
    if (!testimonial) {
      return res.status(404).json({
        success: false,
        message: '推荐不存在',
      });
    }

    if (type === 'like') {
      testimonial.likes++;
    } else if (type === 'helpful') {
      testimonial.helpful++;
    } else {
      return res.status(400).json({
        success: false,
        message: '无效的评价类型',
      });
    }

    res.json({
      success: true,
      message: '评价已提交',
      likes: testimonial.likes,
      helpful: testimonial.helpful,
    });
  } catch (error) {
    console.error('Testimonial rating error:', error);
    res.status(500).json({
      success: false,
      message: '评价失败',
    });
  }
};

// 获取推荐统计
exports.getStats = (req, res) => {
  try {
    const stats = {
      totalTestimonials: testimonials.length,
      averageRating: calculateAverageRating(),
      ratingDistribution: getRatingDistribution(),
      topTestimonials: testimonials
        .sort((a, b) => b.helpful - a.helpful)
        .slice(0, 5)
        .map((t) => ({
          id: t.id,
          name: t.name,
          company: t.company,
          rating: t.rating,
          helpful: t.helpful,
          project: t.project,
        })),
      recentTestimonials: testimonials
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 3),
    };

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error('Testimonials stats error:', error);
    res.status(500).json({
      success: false,
      message: '获取统计数据失败',
    });
  }
};

// 计算平均评分
function calculateAverageRating() {
  if (testimonials.length === 0) return 0;
  const totalRating = testimonials.reduce((sum, t) => sum + t.rating, 0);
  return Math.round((totalRating / testimonials.length) * 10) / 10;
}

// 获取评分分布
function getRatingDistribution() {
  const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  testimonials.forEach((t) => {
    distribution[t.rating]++;
  });

  return Object.entries(distribution)
    .map(([rating, count]) => ({
      rating: parseInt(rating),
      count: count,
      percentage: testimonials.length > 0 ? Math.round((count / testimonials.length) * 100) : 0,
    }))
    .reverse();
}
