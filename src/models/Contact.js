/**
 * 联系表单模型
 * 存储联系表单提交和状态跟踪
 */

module.exports = (sequelize, DataTypes) => {
  const Contact = sequelize.define(
    'Contact',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        comment: '联系记录唯一标识',
      },

      // 联系人信息
      name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: {
          len: [1, 100],
        },
        comment: '联系人姓名',
      },

      email: {
        type: DataTypes.STRING(255),
        allowNull: false,
        validate: {
          isEmail: true,
        },
        comment: '邮箱地址',
      },

      phone: {
        type: DataTypes.STRING(20),
        allowNull: true,
        validate: {
          // 可选的国际电话格式（E.164简单校验）
          is: /^\+?[1-9]\d{0,15}$/,
        },
        comment: '电话号码',
      },

      company: {
        type: DataTypes.STRING(100),
        allowNull: true,
        comment: '公司名称',
      },

      // 消息内容
      subject: {
        type: DataTypes.STRING(255),
        allowNull: false,
        validate: {
          len: [1, 255],
        },
        comment: '主题',
      },

      message: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: {
          len: [1, 5000],
        },
        comment: '消息内容',
      },

      // 分类和状态
      category: {
        type: DataTypes.ENUM('general', 'sales', 'support', 'technical', 'partnership'),
        defaultValue: 'general',
        comment: '咨询类别',
      },

      status: {
        type: DataTypes.ENUM('new', 'in_progress', 'resolved', 'closed'),
        defaultValue: 'new',
        comment: '处理状态',
      },

      priority: {
        type: DataTypes.ENUM('low', 'normal', 'high', 'urgent'),
        defaultValue: 'normal',
        comment: '优先级',
      },

      // 来源信息
      source: {
        type: DataTypes.STRING(50),
        defaultValue: 'website',
        comment: '来源渠道',
      },

      user_agent: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: '用户代理',
      },

      ip_address: {
        type: DataTypes.INET,
        allowNull: true,
        comment: 'IP地址',
      },

      referrer: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: '来源页面',
      },

      // 处理信息
      assigned_to: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id',
        },
        comment: '分配给用户ID',
      },

      response: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: '回复内容',
      },

      response_at: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: '回复时间',
      },

      resolved_at: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: '解决时间',
      },

      // 扩展信息
      metadata: {
        type: DataTypes.JSONB,
        defaultValue: {},
        comment: '扩展元数据',
      },

      tags: {
        type: DataTypes.JSONB,
        defaultValue: [],
        comment: '标签',
      },

      // 时间戳
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        comment: '创建时间',
      },

      updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        comment: '更新时间',
      },

      deleted_at: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: '软删除时间',
      },
    },
    {
      tableName: 'contacts',
      timestamps: true,
      paranoid: true,
      underscored: true,

      // 索引
      indexes: [
        {
          fields: ['email'],
        },
        {
          fields: ['status'],
        },
        {
          fields: ['category'],
        },
        {
          fields: ['priority'],
        },
        {
          fields: ['assigned_to'],
        },
        {
          fields: ['created_at'],
        },
        {
          fields: ['ip_address'],
        },
        {
          type: 'GIN',
          fields: ['tags'],
        },
      ],

      // 钩子函数
      hooks: {
        beforeUpdate: async (contact) => {
          // 状态变更时自动设置时间戳
          if (contact.changed('status')) {
            if (contact.status === 'resolved' && !contact.resolved_at) {
              contact.resolved_at = new Date();
            }
          }

          // 设置回复时间
          if (contact.changed('response') && contact.response && !contact.response_at) {
            contact.response_at = new Date();
          }
        },
      },

      // 作用域
      scopes: {
        active: {
          where: {
            status: ['new', 'in_progress'],
          },
        },

        pending: {
          where: {
            status: 'new',
          },
        },

        resolved: {
          where: {
            status: ['resolved', 'closed'],
          },
        },

        highPriority: {
          where: {
            priority: ['high', 'urgent'],
          },
        },

        recent: {
          order: [['created_at', 'DESC']],
        },
      },
    }
  );

  // 实例方法
  Contact.prototype.markAsResolved = async function (response = null) {
    this.status = 'resolved';
    this.resolved_at = new Date();

    if (response) {
      this.response = response;
      this.response_at = new Date();
    }

    await this.save();
  };

  Contact.prototype.assignTo = async function (userId) {
    this.assigned_to = userId;
    this.status = 'in_progress';
    await this.save();
  };

  Contact.prototype.addTag = async function (tag) {
    if (!this.tags.includes(tag)) {
      this.tags = [...this.tags, tag];
      await this.save();
    }
  };

  Contact.prototype.removeTag = async function (tag) {
    this.tags = this.tags.filter((t) => t !== tag);
    await this.save();
  };

  Contact.prototype.getResponseTime = function () {
    if (!this.response_at) return null;
    return this.response_at - this.created_at;
  };

  Contact.prototype.getResolutionTime = function () {
    if (!this.resolved_at) return null;
    return this.resolved_at - this.created_at;
  };

  // 类方法
  Contact.getStats = async function (startDate, endDate) {
    const where = {};

    if (startDate && endDate) {
      where.created_at = {
        [sequelize.Sequelize.Op.between]: [startDate, endDate],
      };
    }

    const [total, byStatus, byCategory, byPriority] = await Promise.all([
      this.count({ where }),
      this.findAll({
        where,
        attributes: ['status', [sequelize.fn('COUNT', sequelize.col('id')), 'count']],
        group: ['status'],
        raw: true,
      }),
      this.findAll({
        where,
        attributes: ['category', [sequelize.fn('COUNT', sequelize.col('id')), 'count']],
        group: ['category'],
        raw: true,
      }),
      this.findAll({
        where,
        attributes: ['priority', [sequelize.fn('COUNT', sequelize.col('id')), 'count']],
        group: ['priority'],
        raw: true,
      }),
    ]);

    return {
      total,
      byStatus: byStatus.reduce((acc, item) => {
        acc[item.status] = parseInt(item.count);
        return acc;
      }, {}),
      byCategory: byCategory.reduce((acc, item) => {
        acc[item.category] = parseInt(item.count);
        return acc;
      }, {}),
      byPriority: byPriority.reduce((acc, item) => {
        acc[item.priority] = parseInt(item.count);
        return acc;
      }, {}),
    };
  };

  Contact.getRecentContacts = function (limit = 10) {
    return this.scope('recent').findAll({
      limit,
      include: [
        {
          model: sequelize.models.User,
          as: 'assignedUser',
          attributes: ['id', 'username', 'first_name', 'last_name'],
          required: false,
        },
      ],
    });
  };

  // 关联关系
  Contact.associate = function (models) {
    // 联系记录可以分配给用户
    Contact.belongsTo(models.User, {
      foreignKey: 'assigned_to',
      as: 'assignedUser',
    });
  };

  return Contact;
};
