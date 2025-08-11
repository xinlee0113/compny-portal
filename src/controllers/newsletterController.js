const nodemailer = require('nodemailer');
const crypto = require('crypto');
const rateLimit = require('express-rate-limit');

/**
 * Newsletter控制器
 */

// 存储订阅用户数据（实际应该使用数据库）
const subscribers = new Map();
const subscriptionStats = {
  totalSubscribers: 0,
  activeSubscribers: 0,
  monthlyGrowth: 0,
  lastNewsletterSent: null,
};

// 订阅频率限制
const subscribeRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 3, // 最多3次订阅尝试
  message: {
    success: false,
    message: '订阅过于频繁，请15分钟后再试',
  },
});

// Newsletter主页
exports.index = (req, res) => {
  const pageData = {
    title: 'Newsletter订阅',
    description: '订阅智云科技Newsletter，获取最新的车载技术资讯和行业动态',
    features: [
      {
        icon: 'fas fa-newspaper',
        title: '技术资讯',
        description: '每周精选的车载技术文章和行业动态',
      },
      {
        icon: 'fas fa-rocket',
        title: '产品更新',
        description: '第一时间了解我们的新产品和工具发布',
      },
      {
        icon: 'fas fa-lightbulb',
        title: '最佳实践',
        description: '来自专家团队的开发经验和技术建议',
      },
      {
        icon: 'fas fa-users',
        title: '社区活动',
        description: '技术讲座、研讨会和开发者活动信息',
      },
    ],
    stats: subscriptionStats,
    recentIssues: [
      {
        title: 'Android Automotive 最新发展趋势',
        date: '2024-07-30',
        excerpt: '深入解析Google最新发布的AAOS功能和开发工具更新...',
        url: '/newsletter/archive/2024-07-30',
      },
      {
        title: 'CAN总线安全最佳实践',
        date: '2024-07-23',
        excerpt: '车载网络安全成为关注焦点，了解如何保护CAN总线通信...',
        url: '/newsletter/archive/2024-07-23',
      },
      {
        title: '车载应用性能优化技巧',
        date: '2024-07-16',
        excerpt: '提升车载应用启动速度和运行效率的实用方法...',
        url: '/newsletter/archive/2024-07-16',
      },
    ],
  };

  res.render('newsletter/index', { pageData });
};

// 处理订阅请求
exports.subscribe = [
  subscribeRateLimit,
  async (req, res) => {
    try {
      const { email, name = '', preferences = [] } = req.body;

      // 邮箱验证
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!email || !emailRegex.test(email)) {
        return res.status(400).json({
          success: false,
          message: '请输入有效的邮箱地址',
        });
      }

      // 检查是否已订阅
      if (subscribers.has(email)) {
        const existingSubscriber = subscribers.get(email);
        if (existingSubscriber.status === 'active') {
          return res.status(400).json({
            success: false,
            message: '该邮箱已订阅Newsletter',
          });
        }
      }

      // 生成确认令牌
      const confirmToken = crypto.randomBytes(32).toString('hex');

      // 保存订阅信息
      const subscriber = {
        email: email,
        name: name,
        preferences: preferences,
        status: 'pending',
        confirmToken: confirmToken,
        subscribedAt: new Date(),
        confirmedAt: null,
        lastEmailSent: null,
        source: 'website',
      };

      subscribers.set(email, subscriber);

      // 发送确认邮件
      await sendConfirmationEmail(subscriber);

      res.json({
        success: true,
        message: '感谢订阅！请检查您的邮箱并点击确认链接完成订阅。',
      });
    } catch (error) {
      console.error('Newsletter subscription error:', error);
      res.status(500).json({
        success: false,
        message: '订阅失败，请稍后重试',
      });
    }
  },
];

// 确认订阅
exports.confirm = async (req, res) => {
  try {
    const token = req.params.token;

    // 查找对应的订阅者
    let subscriber = null;
    for (const [email, sub] of subscribers.entries()) {
      if (sub.confirmToken === token && sub.status === 'pending') {
        subscriber = sub;
        subscriber.email = email;
        break;
      }
    }

    if (!subscriber) {
      return res.status(404).render('newsletter/error', {
        pageData: {
          title: '确认失败',
          message: '无效的确认链接或链接已过期',
        },
      });
    }

    // 激活订阅
    subscriber.status = 'active';
    subscriber.confirmedAt = new Date();
    subscriber.confirmToken = null;

    // 更新统计
    subscriptionStats.totalSubscribers++;
    subscriptionStats.activeSubscribers++;

    // 发送欢迎邮件
    await sendWelcomeEmail(subscriber);

    res.render('newsletter/confirmed', {
      pageData: {
        title: '订阅确认成功',
        message: '感谢您订阅智云科技Newsletter！您将收到最新的技术资讯和产品更新。',
        subscriber: subscriber,
      },
    });
  } catch (error) {
    console.error('Newsletter confirmation error:', error);
    res.status(500).render('newsletter/error', {
      pageData: {
        title: '确认失败',
        message: '处理确认请求时出错，请稍后重试',
      },
    });
  }
};

// 取消订阅
exports.unsubscribe = async (req, res) => {
  try {
    const token = req.params.token;

    // 查找订阅者
    let subscriber = null;
    let email = null;
    for (const [subscriberEmail, sub] of subscribers.entries()) {
      if (sub.confirmToken === token || generateUnsubscribeToken(subscriberEmail) === token) {
        subscriber = sub;
        email = subscriberEmail;
        break;
      }
    }

    if (!subscriber) {
      return res.status(404).render('newsletter/error', {
        pageData: {
          title: '取消订阅失败',
          message: '无效的取消订阅链接',
        },
      });
    }

    // 删除订阅
    subscribers.delete(email);

    // 更新统计
    if (subscriber.status === 'active') {
      subscriptionStats.activeSubscribers--;
    }

    res.render('newsletter/unsubscribed', {
      pageData: {
        title: '取消订阅成功',
        message: '您已成功取消Newsletter订阅。如有任何问题，请联系我们的客服团队。',
      },
    });
  } catch (error) {
    console.error('Newsletter unsubscribe error:', error);
    res.status(500).render('newsletter/error', {
      pageData: {
        title: '取消订阅失败',
        message: '处理取消订阅请求时出错，请稍后重试',
      },
    });
  }
};

// 获取Newsletter统计数据
exports.getStats = (req, res) => {
  try {
    const stats = {
      ...subscriptionStats,
      recentSubscribers: Array.from(subscribers.values())
        .filter((sub) => sub.status === 'active')
        .sort((a, b) => new Date(b.subscribedAt) - new Date(a.subscribedAt))
        .slice(0, 10)
        .map((sub) => ({
          name: sub.name,
          email: sub.email.replace(/(.{2}).*(@.*)/, '$1***$2'), // 脱敏
          subscribedAt: sub.subscribedAt,
        })),
    };

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error('Newsletter stats error:', error);
    res.status(500).json({
      success: false,
      message: '获取统计数据失败',
    });
  }
};

// 发送确认邮件
async function sendConfirmationEmail(subscriber) {
  const transporter = nodemailer.createTransporter({
    host: process.env.SMTP_HOST || 'smtp.163.com',
    port: process.env.SMTP_PORT || 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER || 'zhiyun_tech@163.com',
      pass: process.env.SMTP_PASS || 'your_password',
    },
  });

  const confirmUrl = `${process.env.BASE_URL || 'http://localhost:3000'}/newsletter/confirm/${subscriber.confirmToken}`;

  const mailOptions = {
    from: process.env.SMTP_USER || 'zhiyun_tech@163.com',
    to: subscriber.email,
    subject: '确认您的Newsletter订阅 - 智云科技',
    html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center;">
                    <h1 style="margin: 0;">智云科技</h1>
                    <p style="margin: 10px 0 0; opacity: 0.9;">车载技术Newsletter</p>
                </div>
                
                <div style="padding: 30px; background: white;">
                    <h2 style="color: #333;">感谢您订阅Newsletter！</h2>
                    
                    <p style="line-height: 1.6; color: #555;">
                        ${subscriber.name ? `尊敬的 ${subscriber.name}，` : '您好！'}<br><br>
                        感谢您对智云科技的关注！为了确保邮件能正确送达，请点击下面的按钮确认您的订阅：
                    </p>
                    
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${confirmUrl}" 
                           style="background: linear-gradient(45deg, #667eea, #764ba2); 
                                  color: white; 
                                  padding: 15px 30px; 
                                  text-decoration: none; 
                                  border-radius: 25px; 
                                  font-weight: bold; 
                                  display: inline-block;">
                            确认订阅
                        </a>
                    </div>
                    
                    <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <h3 style="margin-top: 0; color: #667eea;">您将收到什么？</h3>
                        <ul style="color: #333; line-height: 1.6;">
                            <li>每周精选的车载技术文章和行业动态</li>
                            <li>新产品和工具的第一手发布信息</li>
                            <li>专家团队的开发经验和技术建议</li>
                            <li>技术讲座和开发者活动邀请</li>
                        </ul>
                    </div>
                    
                    <p style="color: #666; font-size: 0.9rem;">
                        如果您没有订阅我们的Newsletter，请忽略此邮件。<br>
                        此确认链接将在24小时后失效。
                    </p>
                </div>
                
                <div style="background: #f8f9fa; padding: 20px; text-align: center; color: #6c757d;">
                    <p style="margin: 0;">北京智云科技有限公司</p>
                    <p style="margin: 5px 0;">网站：www.zhiyun-tech.com | 邮箱：newsletter@zhiyun-tech.com</p>
                </div>
            </div>
        `,
  };

  await transporter.sendMail(mailOptions);
}

// 发送欢迎邮件
async function sendWelcomeEmail(subscriber) {
  const transporter = nodemailer.createTransporter({
    host: process.env.SMTP_HOST || 'smtp.163.com',
    port: process.env.SMTP_PORT || 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER || 'zhiyun_tech@163.com',
      pass: process.env.SMTP_PASS || 'your_password',
    },
  });

  const unsubscribeToken = generateUnsubscribeToken(subscriber.email);
  const unsubscribeUrl = `${process.env.BASE_URL || 'http://localhost:3000'}/newsletter/unsubscribe/${unsubscribeToken}`;

  const mailOptions = {
    from: process.env.SMTP_USER || 'zhiyun_tech@163.com',
    to: subscriber.email,
    subject: '欢迎加入智云科技Newsletter！',
    html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center;">
                    <h1 style="margin: 0;">🎉 欢迎加入我们！</h1>
                    <p style="margin: 10px 0 0; opacity: 0.9;">智云科技Newsletter社区</p>
                </div>
                
                <div style="padding: 30px; background: white;">
                    <h2 style="color: #333;">${subscriber.name ? `${subscriber.name}，` : ''}欢迎加入智云科技Newsletter！</h2>
                    
                    <p style="line-height: 1.6; color: #555;">
                        感谢您的订阅！您现在已成为我们Newsletter社区的一员。我们将定期为您推送：
                    </p>
                    
                    <div style="background: #e7f3ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <ul style="color: #0066cc; line-height: 1.8; margin: 0;">
                            <li><strong>技术深度文章</strong> - Android Automotive、QNX、CAN总线等前沿技术</li>
                            <li><strong>项目案例分享</strong> - 真实的开发经验和最佳实践</li>
                            <li><strong>工具资源推荐</strong> - 最新的开发工具和SDK更新</li>
                            <li><strong>行业动态</strong> - 车载技术发展趋势和市场洞察</li>
                        </ul>
                    </div>
                    
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${process.env.BASE_URL || 'http://localhost:3000'}/blog" 
                           style="background: linear-gradient(45deg, #667eea, #764ba2); 
                                  color: white; 
                                  padding: 12px 25px; 
                                  text-decoration: none; 
                                  border-radius: 20px; 
                                  margin: 0 10px;
                                  display: inline-block;">
                            浏览技术博客
                        </a>
                        <a href="${process.env.BASE_URL || 'http://localhost:3000'}/downloads" 
                           style="background: transparent; 
                                  color: #667eea; 
                                  border: 2px solid #667eea;
                                  padding: 10px 23px; 
                                  text-decoration: none; 
                                  border-radius: 20px; 
                                  margin: 0 10px;
                                  display: inline-block;">
                            下载资源
                        </a>
                    </div>
                    
                    <p style="color: #666; font-size: 0.9rem; text-align: center;">
                        如需取消订阅，请<a href="${unsubscribeUrl}" style="color: #667eea;">点击这里</a>
                    </p>
                </div>
                
                <div style="background: #f8f9fa; padding: 20px; text-align: center; color: #6c757d;">
                    <p style="margin: 0;">北京智云科技有限公司</p>
                    <p style="margin: 5px 0;">网站：www.zhiyun-tech.com</p>
                </div>
            </div>
        `,
  };

  await transporter.sendMail(mailOptions);
}

// 生成取消订阅令牌
function generateUnsubscribeToken(email) {
  return crypto
    .createHash('sha256')
    .update(email + process.env.SECRET_KEY || 'default_secret')
    .digest('hex');
}
