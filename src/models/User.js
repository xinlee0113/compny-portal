/**
 * 用户模型
 * 包含认证、个人资料和安全功能
 */

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define(
    'User',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        comment: '用户唯一标识',
      },

      // 基本信息
      username: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
        validate: {
          len: [3, 50],
          isAlphanumeric: true,
        },
        comment: '用户名',
      },

      email: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,
        validate: {
          isEmail: true,
        },
        comment: '邮箱地址',
      },

      password_hash: {
        type: DataTypes.STRING(255),
        allowNull: false,
        comment: '密码哈希',
      },

      // 个人信息
      first_name: {
        type: DataTypes.STRING(50),
        allowNull: true,
        validate: {
          len: [1, 50],
        },
        comment: '名字',
      },

      last_name: {
        type: DataTypes.STRING(50),
        allowNull: true,
        validate: {
          len: [1, 50],
        },
        comment: '姓氏',
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

      avatar_url: {
        type: DataTypes.TEXT,
        allowNull: true,
        validate: {
          isUrl: true,
        },
        comment: '头像URL',
      },

      // 权限和状态
      role: {
        type: DataTypes.ENUM('user', 'admin', 'manager', 'employee'),
        defaultValue: 'user',
        allowNull: false,
        comment: '用户角色',
      },

      status: {
        type: DataTypes.ENUM('active', 'inactive', 'suspended', 'pending'),
        defaultValue: 'pending',
        allowNull: false,
        comment: '账户状态',
      },

      // 验证和安全
      email_verified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        comment: '邮箱是否已验证',
      },

      email_verification_token: {
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: '邮箱验证令牌',
      },

      password_reset_token: {
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: '密码重置令牌',
      },

      password_reset_expires: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: '密码重置令牌过期时间',
      },

      // 登录信息
      last_login: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: '最后登录时间',
      },

      login_attempts: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        comment: '登录尝试次数',
      },

      locked_until: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: '账户锁定到期时间',
      },

      // 偏好设置
      preferences: {
        type: DataTypes.JSONB,
        defaultValue: {},
        comment: '用户偏好设置',
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
      tableName: 'users',
      timestamps: true,
      paranoid: true,
      underscored: true,

      // 索引
      indexes: [
        {
          unique: true,
          fields: ['username'],
        },
        {
          unique: true,
          fields: ['email'],
        },
        {
          fields: ['role'],
        },
        {
          fields: ['status'],
        },
        {
          fields: ['email_verified'],
        },
        {
          fields: ['created_at'],
        },
      ],

      // 钩子函数
      hooks: {
        beforeCreate: async (user) => {
          if (user.password_hash) {
            user.password_hash = await bcrypt.hash(user.password_hash, 12);
          }
        },

        beforeUpdate: async (user) => {
          if (user.changed('password_hash')) {
            user.password_hash = await bcrypt.hash(user.password_hash, 12);
          }
        },
      },

      // 作用域
      scopes: {
        active: {
          where: {
            status: 'active',
          },
        },

        verified: {
          where: {
            email_verified: true,
          },
        },

        public: {
          attributes: {
            exclude: ['password_hash', 'email_verification_token', 'password_reset_token'],
          },
        },
      },
    }
  );

  // 实例方法
  User.prototype.checkPassword = async function (password) {
    return bcrypt.compare(password, this.password_hash);
  };

  User.prototype.generateJWT = function () {
    const payload = {
      userId: this.id,
      username: this.username,
      email: this.email,
      role: this.role,
    };

    return jwt.sign(payload, process.env.JWT_SECRET || 'default-secret', {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    });
  };

  User.prototype.isAccountLocked = function () {
    return this.locked_until && this.locked_until > Date.now();
  };

  User.prototype.incrementLoginAttempts = async function () {
    this.login_attempts += 1;

    // 5次失败后锁定账户1小时
    if (this.login_attempts >= 5) {
      this.locked_until = new Date(Date.now() + 60 * 60 * 1000);
    }

    await this.save();
  };

  User.prototype.resetLoginAttempts = async function () {
    this.login_attempts = 0;
    this.locked_until = null;
    this.last_login = new Date();
    await this.save();
  };

  User.prototype.getFullName = function () {
    if (this.first_name && this.last_name) {
      return `${this.first_name} ${this.last_name}`;
    }
    return this.username;
  };

  User.prototype.toJSON = function () {
    const values = { ...this.get() };

    // 移除敏感信息
    delete values.password_hash;
    delete values.email_verification_token;
    delete values.password_reset_token;
    delete values.login_attempts;
    delete values.locked_until;

    return values;
  };

  // 类方法
  User.findByEmail = function (email) {
    return this.findOne({
      where: { email: email.toLowerCase() },
    });
  };

  User.findByUsername = function (username) {
    return this.findOne({
      where: { username },
    });
  };

  User.createUser = async function (userData) {
    const user = await this.create({
      ...userData,
      email: userData.email.toLowerCase(),
    });

    return user;
  };

  // 关联关系
  User.associate = function (models) {
    // 用户可以有多个订单
    User.hasMany(models.Order, {
      foreignKey: 'user_id',
      as: 'orders',
    });

    // 用户可以有多个会话
    User.hasMany(models.Session, {
      foreignKey: 'user_id',
      as: 'sessions',
    });
  };

  return User;
};
