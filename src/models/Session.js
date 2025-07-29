/**
 * 会话模型
 * 用户会话管理和安全控制
 */

module.exports = (sequelize, DataTypes) => {
  const Session = sequelize.define(
    'Session',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        comment: '会话唯一标识',
      },

      // 会话标识
      session_token: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,
        comment: '会话令牌',
      },

      // 用户关联
      user_id: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id',
        },
        comment: '用户ID（可为空，支持匿名会话）',
      },

      // 会话信息
      ip_address: {
        type: DataTypes.INET,
        allowNull: true,
        comment: 'IP地址',
      },

      user_agent: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: '用户代理',
      },

      device_type: {
        type: DataTypes.ENUM('desktop', 'mobile', 'tablet', 'unknown'),
        defaultValue: 'unknown',
        comment: '设备类型',
      },

      browser: {
        type: DataTypes.STRING(100),
        allowNull: true,
        comment: '浏览器',
      },

      os: {
        type: DataTypes.STRING(100),
        allowNull: true,
        comment: '操作系统',
      },

      // 会话状态
      status: {
        type: DataTypes.ENUM('active', 'expired', 'revoked'),
        defaultValue: 'active',
        comment: '会话状态',
      },

      // 时间控制
      expires_at: {
        type: DataTypes.DATE,
        allowNull: false,
        comment: '过期时间',
      },

      last_activity: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        comment: '最后活动时间',
      },

      // 安全信息
      csrf_token: {
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: 'CSRF令牌',
      },

      login_attempts: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        comment: '登录尝试次数',
      },

      // 会话数据
      data: {
        type: DataTypes.JSONB,
        defaultValue: {},
        comment: '会话数据',
      },

      // 地理位置信息
      country: {
        type: DataTypes.STRING(2),
        allowNull: true,
        comment: '国家代码',
      },

      city: {
        type: DataTypes.STRING(100),
        allowNull: true,
        comment: '城市',
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
    },
    {
      tableName: 'sessions',
      timestamps: true,
      underscored: true,

      // 索引
      indexes: [
        {
          unique: true,
          fields: ['session_token'],
        },
        {
          fields: ['user_id'],
        },
        {
          fields: ['status'],
        },
        {
          fields: ['expires_at'],
        },
        {
          fields: ['last_activity'],
        },
        {
          fields: ['ip_address'],
        },
        {
          fields: ['created_at'],
        },
      ],

      // 钩子函数
      hooks: {
        beforeCreate: async session => {
          // 设置默认过期时间（7天）
          if (!session.expires_at) {
            session.expires_at = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
          }

          // 解析用户代理信息
          if (session.user_agent) {
            session.parseUserAgent();
          }
        },

        beforeUpdate: async session => {
          // 活动时更新最后活动时间
          if (session.changed('data') || session.changed('last_activity')) {
            session.last_activity = new Date();
          }
        },
      },

      // 作用域
      scopes: {
        active: {
          where: {
            status: 'active',
            expires_at: {
              [sequelize.Sequelize.Op.gt]: new Date(),
            },
          },
        },

        expired: {
          where: {
            [sequelize.Sequelize.Op.or]: [
              { status: 'expired' },
              { expires_at: { [sequelize.Sequelize.Op.lt]: new Date() } },
            ],
          },
        },

        recent: {
          order: [['last_activity', 'DESC']],
        },
      },
    }
  );

  // 实例方法
  Session.prototype.isValid = function () {
    return this.status === 'active' && this.expires_at > new Date();
  };

  Session.prototype.isExpired = function () {
    return this.expires_at <= new Date();
  };

  Session.prototype.extend = async function (days = 7) {
    this.expires_at = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
    this.last_activity = new Date();
    await this.save();
  };

  Session.prototype.revoke = async function () {
    this.status = 'revoked';
    await this.save();
  };

  Session.prototype.updateActivity = async function () {
    this.last_activity = new Date();
    await this.save({ fields: ['last_activity'] });
  };

  Session.prototype.setData = async function (key, value) {
    this.data = { ...this.data, [key]: value };
    await this.save({ fields: ['data'] });
  };

  Session.prototype.getData = function (key) {
    return this.data[key];
  };

  Session.prototype.removeData = async function (key) {
    const newData = { ...this.data };
    delete newData[key];
    this.data = newData;
    await this.save({ fields: ['data'] });
  };

  Session.prototype.parseUserAgent = function () {
    if (!this.user_agent) return;

    const ua = this.user_agent.toLowerCase();

    // 检测设备类型
    if (/mobile|android|iphone|ipad/.test(ua)) {
      if (/ipad|tablet/.test(ua)) {
        this.device_type = 'tablet';
      } else {
        this.device_type = 'mobile';
      }
    } else {
      this.device_type = 'desktop';
    }

    // 检测浏览器
    if (/chrome/.test(ua)) {
      this.browser = 'Chrome';
    } else if (/firefox/.test(ua)) {
      this.browser = 'Firefox';
    } else if (/safari/.test(ua)) {
      this.browser = 'Safari';
    } else if (/edge/.test(ua)) {
      this.browser = 'Edge';
    } else {
      this.browser = 'Unknown';
    }

    // 检测操作系统
    if (/windows/.test(ua)) {
      this.os = 'Windows';
    } else if (/mac/.test(ua)) {
      this.os = 'macOS';
    } else if (/linux/.test(ua)) {
      this.os = 'Linux';
    } else if (/android/.test(ua)) {
      this.os = 'Android';
    } else if (/ios/.test(ua)) {
      this.os = 'iOS';
    } else {
      this.os = 'Unknown';
    }
  };

  // 类方法
  Session.findByToken = function (token) {
    return this.scope('active').findOne({
      where: { session_token: token },
      include: [
        {
          model: sequelize.models.User,
          as: 'user',
          attributes: ['id', 'username', 'email', 'role', 'status'],
          required: false,
        },
      ],
    });
  };

  Session.createSession = async function (userData = {}) {
    const crypto = require('crypto');
    const sessionToken = crypto.randomBytes(32).toString('hex');

    const session = await this.create({
      session_token: sessionToken,
      ...userData,
    });

    return session;
  };

  Session.cleanup = async function () {
    // 删除过期的会话
    const deleted = await this.destroy({
      where: {
        [sequelize.Sequelize.Op.or]: [
          { status: 'expired' },
          { expires_at: { [sequelize.Sequelize.Op.lt]: new Date() } },
        ],
      },
      force: true,
    });

    console.log(`🧹 清理了 ${deleted} 个过期会话`);
    return deleted;
  };

  Session.getUserSessions = function (userId) {
    return this.scope('active').findAll({
      where: { user_id: userId },
      order: [['last_activity', 'DESC']],
    });
  };

  Session.revokeUserSessions = async function (
    userId,
    excludeSessionId = null
  ) {
    const where = { user_id: userId };

    if (excludeSessionId) {
      where.id = { [sequelize.Sequelize.Op.ne]: excludeSessionId };
    }

    const updated = await this.update({ status: 'revoked' }, { where });

    return updated[0];
  };

  Session.getStats = async function () {
    const [total, active, byDeviceType, byBrowser] = await Promise.all([
      this.count(),
      this.scope('active').count(),
      this.findAll({
        attributes: [
          'device_type',
          [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
        ],
        group: ['device_type'],
        raw: true,
      }),
      this.findAll({
        attributes: [
          'browser',
          [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
        ],
        group: ['browser'],
        raw: true,
      }),
    ]);

    return {
      total,
      active,
      byDeviceType: byDeviceType.reduce((acc, item) => {
        acc[item.device_type] = parseInt(item.count);
        return acc;
      }, {}),
      byBrowser: byBrowser.reduce((acc, item) => {
        acc[item.browser] = parseInt(item.count);
        return acc;
      }, {}),
    };
  };

  // 关联关系
  Session.associate = function (models) {
    // 会话属于用户
    Session.belongsTo(models.User, {
      foreignKey: 'user_id',
      as: 'user',
    });
  };

  return Session;
};
