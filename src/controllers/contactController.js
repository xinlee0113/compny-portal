const { getTexts } = require('../config/i18n');

/**
 * 项目咨询控制器
 */
class ContactController {
  /**
   * 渲染联系我们页面
   */
  static renderIndex(req, res) {
    const texts = getTexts(req.language || 'zh');

    const contactData = {
      hero: {
        title: '联系我们',
        subtitle: '开始您的车载应用开发项目，获取专业的技术咨询和解决方案',
      },

      contactInfo: {
        company: '楚起科技',
        address: '北京市海淀区中关村软件园',
        phone: '400-888-1688',
        email: 'contact@chuqi-tech.com',
        businessHours: '周一至周五 9:00-18:00',
        responseTime: '24小时内回复',
      },

      consultationTypes: [
        {
          icon: 'fas fa-mobile-alt',
          title: '车载应用开发咨询',
          description: 'Android Automotive、QNX、Linux平台应用开发技术咨询',
          timeline: '1-2个工作日',
          method: '电话/视频会议',
        },
        {
          icon: 'fas fa-network-wired',
          title: '系统集成方案咨询',
          description: 'CAN总线、车载网关、云端服务集成方案设计',
          timeline: '3-5个工作日',
          method: '现场调研',
        },
        {
          icon: 'fas fa-vial',
          title: '测试验证服务咨询',
          description: '功能测试、性能测试、安全测试和合规验证咨询',
          timeline: '1-3个工作日',
          method: '在线评估',
        },
        {
          icon: 'fas fa-handshake',
          title: '项目合作咨询',
          description: '长期合作、技术外包、团队驻场等合作模式咨询',
          timeline: '当天回复',
          method: '商务洽谈',
        },
      ],

      projectSteps: [
        {
          step: 1,
          title: '需求提交',
          description: '填写项目需求表单，详细描述您的项目需求',
          icon: 'fas fa-edit',
        },
        {
          step: 2,
          title: '初步评估',
          description: '我们的技术专家将在24小时内联系您进行初步评估',
          icon: 'fas fa-search',
        },
        {
          step: 3,
          title: '方案设计',
          description: '根据需求制定详细的技术方案和项目计划',
          icon: 'fas fa-drafting-compass',
        },
        {
          step: 4,
          title: '报价确认',
          description: '提供详细的项目报价和合作协议',
          icon: 'fas fa-file-contract',
        },
        {
          step: 5,
          title: '项目启动',
          description: '签署合同后立即组建专业团队开始项目开发',
          icon: 'fas fa-rocket',
        },
      ],
    };

    res.render('contact/index', {
      title: texts.nav.contact,
      texts,
      contactData,
      currentPath: req.path,
    });
  }

  /**
   * 处理项目需求提交
   */
  static async submitProjectRequirement(req, res) {
    try {
      const {
        contactType,
        companyName,
        contactPerson,
        phone,
        email,
        projectType,
        projectDescription,
        budget,
        timeline,
        additionalInfo,
      } = req.body;

      // 验证必填字段
      if (!contactPerson || !phone || !email || !projectDescription) {
        return res.status(400).json({
          success: false,
          message: '请填写所有必填字段',
        });
      }

      // 这里应该保存到数据库，现在先模拟
      const requirement = {
        id: Date.now().toString(),
        contactType,
        companyName,
        contactPerson,
        phone,
        email,
        projectType,
        projectDescription,
        budget,
        timeline,
        additionalInfo,
        status: 'pending',
        createdAt: new Date(),
        estimatedResponseTime: '24小时内',
      };

      console.log('新的项目需求:', requirement);

      // 发送确认邮件（模拟）
      console.log(`发送确认邮件到: ${email}`);

      res.json({
        success: true,
        message: '项目需求提交成功！我们将在24小时内联系您。',
        data: {
          requirementId: requirement.id,
          estimatedResponseTime: requirement.estimatedResponseTime,
        },
      });
    } catch (error) {
      console.error('提交项目需求失败:', error);
      res.status(500).json({
        success: false,
        message: '提交失败，请稍后重试',
      });
    }
  }

  /**
   * 处理快速咨询
   */
  static async submitQuickConsultation(req, res) {
    try {
      const { name, phone, consultationType, message } = req.body;

      if (!name || !phone) {
        return res.status(400).json({
          success: false,
          message: '姓名和电话为必填项',
        });
      }

      const consultation = {
        id: Date.now().toString(),
        name,
        phone,
        consultationType,
        message,
        status: 'pending',
        createdAt: new Date(),
      };

      console.log('新的快速咨询:', consultation);

      res.json({
        success: true,
        message: '咨询提交成功！我们将在2小时内回电。',
        data: {
          consultationId: consultation.id,
        },
      });
    } catch (error) {
      console.error('提交快速咨询失败:', error);
      res.status(500).json({
        success: false,
        message: '提交失败，请稍后重试',
      });
    }
  }
}

module.exports = ContactController;
