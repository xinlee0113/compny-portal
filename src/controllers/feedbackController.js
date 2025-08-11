const rateLimit = require('express-rate-limit');
const nodemailer = require('nodemailer');

/**
 * 用户反馈控制器
 */

// 存储反馈数据（实际应该使用数据库）
const feedbacks = new Map();
const feedbackStats = {
  totalFeedbacks: 0,
  averageRating: 0,
  responseRate: 85,
  categories: {
    bug: 0,
    feature: 0,
    improvement: 0,
    general: 0,
  },
};

let feedbackIdCounter = 1;

// 反馈提交频率限制
const feedbackRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 3, // 最多3次反馈
  message: {
    success: false,
    message: '反馈提交过于频繁，请15分钟后再试',
  },
});

// 反馈页面
exports.index = (req, res) => {
  const pageData = {
    title: '用户反馈',
    description: '您的意见对我们很重要！请告诉我们如何改进我们的产品和服务',
    categories: [
      { value: 'bug', label: '错误报告', icon: 'fas fa-bug', color: '#dc3545' },
      { value: 'feature', label: '功能建议', icon: 'fas fa-lightbulb', color: '#ffc107' },
      { value: 'improvement', label: '改进建议', icon: 'fas fa-arrow-up', color: '#28a745' },
      { value: 'general', label: '一般反馈', icon: 'fas fa-comment', color: '#6f42c1' },
    ],
    stats: feedbackStats,
    recentFeedbacks: getRecentPublicFeedbacks(),
  };

  res.render('feedback/index', { pageData });
};

// 提交反馈
exports.submit = [
  feedbackRateLimit,
  async (req, res) => {
    try {
      const {
        name,
        email,
        category,
        subject,
        message,
        rating,
        page,
        browser,
        isPublic = false,
      } = req.body;

      // 基本验证
      if (!name || !email || !category || !subject || !message) {
        return res.status(400).json({
          success: false,
          message: '请填写所有必填字段',
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

      // 创建反馈记录
      const feedbackId = feedbackIdCounter++;
      const feedback = {
        id: feedbackId,
        name: name,
        email: email,
        category: category,
        subject: subject,
        message: message,
        rating: parseInt(rating) || null,
        page: page || req.get('Referer') || '/',
        browser: browser || req.get('User-Agent') || 'Unknown',
        isPublic: Boolean(isPublic),
        submittedAt: new Date(),
        status: 'new',
        adminReply: null,
        repliedAt: null,
        likes: 0,
        dislikes: 0,
        ip: req.ip || req.connection.remoteAddress,
      };

      feedbacks.set(feedbackId, feedback);

      // 更新统计
      feedbackStats.totalFeedbacks++;
      feedbackStats.categories[category]++;

      if (rating) {
        updateAverageRating();
      }

      // 发送确认邮件给用户
      await sendFeedbackConfirmationEmail(feedback);

      // 发送通知邮件给管理员
      await sendFeedbackNotificationEmail(feedback);

      res.json({
        success: true,
        message: '感谢您的反馈！我们会认真处理您的意见和建议。',
        feedbackId: feedbackId,
      });
    } catch (error) {
      console.error('Feedback submission error:', error);
      res.status(500).json({
        success: false,
        message: '提交反馈时出错，请稍后重试',
      });
    }
  },
];

// 反馈评价
exports.rate = async (req, res) => {
  try {
    const feedbackId = parseInt(req.params.id);
    const { type } = req.body; // 'like' or 'dislike'

    const feedback = feedbacks.get(feedbackId);
    if (!feedback || !feedback.isPublic) {
      return res.status(404).json({
        success: false,
        message: '反馈不存在或不可评价',
      });
    }

    if (type === 'like') {
      feedback.likes++;
    } else if (type === 'dislike') {
      feedback.dislikes++;
    } else {
      return res.status(400).json({
        success: false,
        message: '无效的评价类型',
      });
    }

    res.json({
      success: true,
      message: '评价已提交',
      likes: feedback.likes,
      dislikes: feedback.dislikes,
    });
  } catch (error) {
    console.error('Feedback rating error:', error);
    res.status(500).json({
      success: false,
      message: '评价失败',
    });
  }
};

// 获取反馈统计
exports.getStats = (req, res) => {
  try {
    const categoryStats = Object.entries(feedbackStats.categories).map(([category, count]) => ({
      category,
      count,
      percentage:
        feedbackStats.totalFeedbacks > 0
          ? Math.round((count / feedbackStats.totalFeedbacks) * 100)
          : 0,
    }));

    const recentTrends = getRecentTrends();

    res.json({
      success: true,
      data: {
        ...feedbackStats,
        categoryStats,
        recentTrends,
      },
    });
  } catch (error) {
    console.error('Feedback stats error:', error);
    res.status(500).json({
      success: false,
      message: '获取统计数据失败',
    });
  }
};

// 获取反馈列表
exports.getList = (req, res) => {
  try {
    const { category, status, page = 1, limit = 10 } = req.query;

    let filteredFeedbacks = Array.from(feedbacks.values()).filter((feedback) => feedback.isPublic); // 只返回公开的反馈

    if (category && category !== 'all') {
      filteredFeedbacks = filteredFeedbacks.filter((f) => f.category === category);
    }

    if (status && status !== 'all') {
      filteredFeedbacks = filteredFeedbacks.filter((f) => f.status === status);
    }

    // 排序（最新的在前）
    filteredFeedbacks.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));

    // 分页
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedFeedbacks = filteredFeedbacks.slice(startIndex, endIndex);

    // 脱敏处理
    const safeFeedbacks = paginatedFeedbacks.map((feedback) => ({
      id: feedback.id,
      name: feedback.name,
      category: feedback.category,
      subject: feedback.subject,
      message: feedback.message,
      rating: feedback.rating,
      submittedAt: feedback.submittedAt,
      status: feedback.status,
      adminReply: feedback.adminReply,
      repliedAt: feedback.repliedAt,
      likes: feedback.likes,
      dislikes: feedback.dislikes,
    }));

    res.json({
      success: true,
      data: {
        feedbacks: safeFeedbacks,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(filteredFeedbacks.length / limit),
          totalItems: filteredFeedbacks.length,
          hasNext: endIndex < filteredFeedbacks.length,
          hasPrev: page > 1,
        },
      },
    });
  } catch (error) {
    console.error('Feedback list error:', error);
    res.status(500).json({
      success: false,
      message: '获取反馈列表失败',
    });
  }
};

// 获取最近的公开反馈
function getRecentPublicFeedbacks() {
  return Array.from(feedbacks.values())
    .filter((feedback) => feedback.isPublic && feedback.status !== 'spam')
    .sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt))
    .slice(0, 5)
    .map((feedback) => ({
      id: feedback.id,
      name: feedback.name,
      category: feedback.category,
      subject: feedback.subject,
      message:
        feedback.message.length > 100
          ? feedback.message.substring(0, 100) + '...'
          : feedback.message,
      rating: feedback.rating,
      submittedAt: feedback.submittedAt,
      likes: feedback.likes,
      dislikes: feedback.dislikes,
    }));
}

// 获取最近趋势
function getRecentTrends() {
  const last7Days = Array.from(feedbacks.values()).filter((feedback) => {
    const daysDiff = (new Date() - new Date(feedback.submittedAt)) / (1000 * 60 * 60 * 24);
    return daysDiff <= 7;
  });

  const last30Days = Array.from(feedbacks.values()).filter((feedback) => {
    const daysDiff = (new Date() - new Date(feedback.submittedAt)) / (1000 * 60 * 60 * 24);
    return daysDiff <= 30;
  });

  return {
    last7Days: last7Days.length,
    last30Days: last30Days.length,
    growthRate:
      last30Days.length > 0
        ? Math.round(((last7Days.length * 4.3) / last30Days.length - 1) * 100)
        : 0,
  };
}

// 更新平均评分
function updateAverageRating() {
  const ratedFeedbacks = Array.from(feedbacks.values()).filter(
    (feedback) => feedback.rating && feedback.rating > 0
  );

  if (ratedFeedbacks.length > 0) {
    const totalRating = ratedFeedbacks.reduce((sum, feedback) => sum + feedback.rating, 0);
    feedbackStats.averageRating = Math.round((totalRating / ratedFeedbacks.length) * 10) / 10;
  }
}

// 发送确认邮件给用户
async function sendFeedbackConfirmationEmail(feedback) {
  const transporter = nodemailer.createTransporter({
    host: process.env.SMTP_HOST || 'smtp.163.com',
    port: process.env.SMTP_PORT || 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER || 'zhiyun_tech@163.com',
      pass: process.env.SMTP_PASS || 'your_password',
    },
  });

  const categoryLabels = {
    bug: '错误报告',
    feature: '功能建议',
    improvement: '改进建议',
    general: '一般反馈',
  };

  const mailOptions = {
    from: process.env.SMTP_USER || 'zhiyun_tech@163.com',
    to: feedback.email,
    subject: '感谢您的反馈 - 智云科技',
    html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center;">
                    <h1 style="margin: 0;">感谢您的反馈！</h1>
                    <p style="margin: 10px 0 0; opacity: 0.9;">智云科技用户反馈</p>
                </div>
                
                <div style="padding: 30px; background: white;">
                    <h2 style="color: #333;">尊敬的 ${feedback.name}，</h2>
                    
                    <p style="line-height: 1.6; color: #555;">
                        感谢您抽出宝贵时间为我们提供反馈！您的意见对我们改进产品和服务非常重要。
                    </p>
                    
                    <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea;">
                        <h3 style="margin-top: 0; color: #667eea;">您的反馈信息</h3>
                        <p><strong>反馈ID：</strong>#${feedback.id}</p>
                        <p><strong>类型：</strong>${categoryLabels[feedback.category]}</p>
                        <p><strong>主题：</strong>${feedback.subject}</p>
                        <p><strong>提交时间：</strong>${feedback.submittedAt.toLocaleString('zh-CN')}</p>
                        ${feedback.rating ? `<p><strong>评分：</strong>${'⭐'.repeat(feedback.rating)} (${feedback.rating}/5)</p>` : ''}
                    </div>
                    
                    <div style="background: #e7f3ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <h3 style="margin-top: 0; color: #0066cc;">接下来会发生什么？</h3>
                        <ul style="color: #333; line-height: 1.6;">
                            <li>我们的团队将在48小时内审阅您的反馈</li>
                            <li>如需更多信息，我们会通过邮件与您联系</li>
                            <li>重要的问题和建议会被优先处理</li>
                            <li>处理结果会通过邮件通知您</li>
                        </ul>
                    </div>
                    
                    <p style="color: #666; font-size: 0.9rem;">
                        您可以随时通过回复此邮件或访问我们的网站提供更多反馈。<br>
                        再次感谢您对智云科技的支持！
                    </p>
                </div>
                
                <div style="background: #f8f9fa; padding: 20px; text-align: center; color: #6c757d;">
                    <p style="margin: 0;">北京智云科技有限公司</p>
                    <p style="margin: 5px 0;">网站：www.zhiyun-tech.com | 邮箱：feedback@zhiyun-tech.com</p>
                </div>
            </div>
        `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Feedback confirmation email sent successfully');
  } catch (error) {
    console.error('Failed to send feedback confirmation email:', error);
  }
}

// 发送通知邮件给管理员
async function sendFeedbackNotificationEmail(feedback) {
  const transporter = nodemailer.createTransporter({
    host: process.env.SMTP_HOST || 'smtp.163.com',
    port: process.env.SMTP_PORT || 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER || 'zhiyun_tech@163.com',
      pass: process.env.SMTP_PASS || 'your_password',
    },
  });

  const categoryLabels = {
    bug: '错误报告',
    feature: '功能建议',
    improvement: '改进建议',
    general: '一般反馈',
  };

  const urgencyColor =
    feedback.category === 'bug'
      ? '#dc3545'
      : feedback.category === 'feature'
        ? '#ffc107'
        : '#28a745';

  const mailOptions = {
    from: process.env.SMTP_USER || 'zhiyun_tech@163.com',
    to: 'feedback@zhiyun-tech.com',
    subject: `新用户反馈 - ${categoryLabels[feedback.category]} [#${feedback.id}]`,
    html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: ${urgencyColor}; color: white; padding: 20px;">
                    <h2 style="margin: 0;">新用户反馈 #${feedback.id}</h2>
                    <p style="margin: 5px 0 0; opacity: 0.9;">${categoryLabels[feedback.category]}</p>
                </div>
                
                <div style="padding: 20px; background: white;">
                    <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                        <h3 style="margin-top: 0; color: #333;">用户信息</h3>
                        <p><strong>姓名：</strong>${feedback.name}</p>
                        <p><strong>邮箱：</strong>${feedback.email}</p>
                        <p><strong>IP地址：</strong>${feedback.ip}</p>
                        <p><strong>页面：</strong>${feedback.page}</p>
                        <p><strong>浏览器：</strong>${feedback.browser}</p>
                        <p><strong>提交时间：</strong>${feedback.submittedAt.toLocaleString('zh-CN')}</p>
                        ${feedback.rating ? `<p><strong>评分：</strong>${feedback.rating}/5 星</p>` : ''}
                    </div>
                    
                    <div style="border: 1px solid #dee2e6; padding: 20px; border-radius: 8px;">
                        <h3 style="margin-top: 0; color: #333;">反馈内容</h3>
                        <h4 style="color: #667eea;">${feedback.subject}</h4>
                        <p style="line-height: 1.6; white-space: pre-wrap;">${feedback.message}</p>
                    </div>
                    
                    <div style="margin-top: 20px; text-align: center;">
                        <a href="${process.env.BASE_URL || 'http://localhost:3000'}/admin/feedback/${feedback.id}" 
                           style="background: #667eea; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px;">
                            处理此反馈
                        </a>
                    </div>
                </div>
            </div>
        `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Feedback notification email sent successfully');
  } catch (error) {
    console.error('Failed to send feedback notification email:', error);
  }
}
