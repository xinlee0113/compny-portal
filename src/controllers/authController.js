/**
 * 认证控制器
 * 处理用户注册、登录、登出、令牌刷新等认证相关操作
 */

const bcrypt = require('bcryptjs');
const { generateTokens, blacklistToken } = require('../middleware/auth');
const { cache } = require('../config/database');

/**
 * 用户注册
 */
const register = async (req, res) => {
  try {
    const {
      username,
      email,
      password,
      confirmPassword,
      firstName,
      lastName,
      phone,
    } = req.body;

    // 输入验证
    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: '用户名、邮箱和密码不能为空',
        code: 'MISSING_REQUIRED_FIELDS',
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: '两次输入的密码不一致',
        code: 'PASSWORD_MISMATCH',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: '密码至少需要6个字符',
        code: 'PASSWORD_TOO_SHORT',
      });
    }

    // 邮箱格式验证
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: '邮箱格式不正确',
        code: 'INVALID_EMAIL_FORMAT',
      });
    }

    try {
      // 尝试使用数据库模型
      const models = require('../models');
      if (!models || !models.User) {
        throw new Error('用户模型不可用');
      }

      // 检查用户名和邮箱是否已存在
      const existingUserByUsername = await models.User.findByUsername(username);
      if (existingUserByUsername) {
        return res.status(409).json({
          success: false,
          message: '用户名已被注册',
          code: 'USERNAME_ALREADY_EXISTS',
        });
      }

      const existingUserByEmail = await models.User.findByEmail(email);
      if (existingUserByEmail) {
        return res.status(409).json({
          success: false,
          message: '邮箱已被注册',
          code: 'EMAIL_ALREADY_EXISTS',
        });
      }

      // 创建新用户
      const userData = {
        username,
        email: email.toLowerCase(),
        password_hash: password, // 将在模型的hook中加密
        first_name: firstName,
        last_name: lastName,
        phone,
        role: 'user',
        status: 'active', // 简化版本，直接激活
        email_verified: false,
      };

      const user = await models.User.createUser(userData);

      // 生成令牌
      const tokens = generateTokens(user);

      // 设置cookies
      const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7天
      };

      res.cookie('accessToken', tokens.accessToken, cookieOptions);
      res.cookie('refreshToken', tokens.refreshToken, {
        ...cookieOptions,
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30天
      });

      res.status(201).json({
        success: true,
        message: '注册成功',
        data: {
          user: {
            id: user.id,
            username: user.username,
            email: user.email,
            firstName: user.first_name,
            lastName: user.last_name,
            role: user.role,
            status: user.status,
          },
          tokens,
        },
      });
    } catch (dbError) {
      console.error('数据库操作失败:', dbError.message);

      // 数据库不可用时的备用逻辑
      return res.status(503).json({
        success: false,
        message: '用户注册服务暂时不可用，请稍后再试',
        code: 'SERVICE_UNAVAILABLE',
      });
    }
  } catch (error) {
    console.error('注册控制器错误:', error);
    return res.status(500).json({
      success: false,
      message: '注册服务内部错误',
      code: 'REGISTRATION_SERVICE_ERROR',
    });
  }
};

/**
 * 用户登录
 */
const login = async (req, res) => {
  try {
    const { login, password, rememberMe = false } = req.body;

    // 输入验证
    if (!login || !password) {
      return res.status(400).json({
        success: false,
        message: '用户名/邮箱和密码不能为空',
        code: 'MISSING_CREDENTIALS',
      });
    }

    try {
      // 尝试使用数据库模型
      const models = require('../models');
      if (!models || !models.User) {
        throw new Error('用户模型不可用');
      }

      // 根据用户名或邮箱查找用户
      let user = null;
      if (login.includes('@')) {
        user = await models.User.findOne({
          where: { email: login },
        });
      } else {
        user = await models.User.findOne({
          where: { username: login },
        });
      }

      if (!user) {
        return res.status(401).json({
          success: false,
          message: '用户名/邮箱或密码错误',
          code: 'INVALID_CREDENTIALS',
        });
      }

      // 检查账户状态
      if (user.status === 'suspended') {
        return res.status(403).json({
          success: false,
          message: '账户已被暂停，请联系管理员',
          code: 'ACCOUNT_SUSPENDED',
        });
      }

      if (user.status === 'inactive') {
        return res.status(403).json({
          success: false,
          message: '账户未激活，请先激活账户',
          code: 'ACCOUNT_INACTIVE',
        });
      }

      // 检查账户锁定
      if (user.isAccountLocked()) {
        return res.status(423).json({
          success: false,
          message: '账户已被锁定，请稍后再试',
          code: 'ACCOUNT_LOCKED',
        });
      }

      // 验证密码
      const isPasswordValid = await user.checkPassword(password);
      if (!isPasswordValid) {
        // 增加登录失败次数
        await user.incrementLoginAttempts();

        return res.status(401).json({
          success: false,
          message: '用户名/邮箱或密码错误',
          code: 'INVALID_CREDENTIALS',
        });
      }

      // 重置登录失败次数
      await user.resetLoginAttempts();

      // 生成令牌
      const tokens = generateTokens(user);

      // 设置cookies
      const accessTokenMaxAge = rememberMe
        ? 30 * 24 * 60 * 60 * 1000
        : 24 * 60 * 60 * 1000;
      const refreshTokenMaxAge = rememberMe
        ? 90 * 24 * 60 * 60 * 1000
        : 7 * 24 * 60 * 60 * 1000;

      const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
      };

      res.cookie('accessToken', tokens.accessToken, {
        ...cookieOptions,
        maxAge: accessTokenMaxAge,
      });

      res.cookie('refreshToken', tokens.refreshToken, {
        ...cookieOptions,
        maxAge: refreshTokenMaxAge,
      });

      // 创建会话记录（如果Session模型可用）
      try {
        const sessionData = {
          user_id: user.id,
          ip_address: req.ip,
          user_agent: req.get('User-Agent'),
          expires_at: new Date(Date.now() + accessTokenMaxAge),
        };

        if (models.Session) {
          await models.Session.createSession(sessionData);
        }
      } catch (sessionError) {
        console.warn('创建会话记录失败:', sessionError.message);
      }

      res.json({
        success: true,
        message: '登录成功',
        data: {
          user: {
            id: user.id,
            username: user.username,
            email: user.email,
            firstName: user.first_name,
            lastName: user.last_name,
            role: user.role,
            status: user.status,
            lastLogin: user.last_login,
          },
          tokens,
        },
      });
    } catch (dbError) {
      console.error('数据库操作失败:', dbError.message);

      return res.status(503).json({
        success: false,
        message: '登录服务暂时不可用，请稍后再试',
        code: 'SERVICE_UNAVAILABLE',
      });
    }
  } catch (error) {
    console.error('登录控制器错误:', error);
    return res.status(500).json({
      success: false,
      message: '登录服务内部错误',
      code: 'LOGIN_SERVICE_ERROR',
    });
  }
};

/**
 * 用户登出
 */
const logout = async (req, res) => {
  try {
    // 令牌黑名单处理在logout中间件中完成
    res.json({
      success: true,
      message: '登出成功',
      data: null,
    });
  } catch (error) {
    console.error('登出控制器错误:', error);
    return res.status(500).json({
      success: false,
      message: '登出服务内部错误',
      code: 'LOGOUT_SERVICE_ERROR',
    });
  }
};

/**
 * 刷新访问令牌
 */
const refresh = async (req, res) => {
  try {
    // 用户信息在refreshToken中间件中已验证
    const user = req.user;

    // 生成新的令牌
    const tokens = generateTokens(user);

    // 更新cookies
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    };

    res.cookie('accessToken', tokens.accessToken, cookieOptions);

    res.json({
      success: true,
      message: '令牌刷新成功',
      data: {
        accessToken: tokens.accessToken,
        expiresIn: tokens.expiresIn,
        tokenType: tokens.tokenType,
      },
    });
  } catch (error) {
    console.error('令牌刷新控制器错误:', error);
    return res.status(500).json({
      success: false,
      message: '令牌刷新服务内部错误',
      code: 'REFRESH_SERVICE_ERROR',
    });
  }
};

/**
 * 获取用户资料
 */
const getProfile = async (req, res) => {
  try {
    const user = req.user;

    res.json({
      success: true,
      message: '获取用户资料成功',
      data: {
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name,
          phone: user.phone,
          role: user.role,
          status: user.status,
          emailVerified: user.email_verified,
          lastLogin: user.last_login,
          createdAt: user.created_at,
          updatedAt: user.updated_at,
        },
      },
    });
  } catch (error) {
    console.error('获取用户资料错误:', error);
    return res.status(500).json({
      success: false,
      message: '获取用户资料失败',
      code: 'PROFILE_SERVICE_ERROR',
    });
  }
};

/**
 * 更新用户资料
 */
const updateProfile = async (req, res) => {
  try {
    const { firstName, lastName, phone } = req.body;
    const user = req.user;

    try {
      const models = require('../models');
      if (!models || !models.User) {
        throw new Error('用户模型不可用');
      }

      // 更新用户信息
      const updateData = {};
      if (firstName !== undefined) updateData.first_name = firstName;
      if (lastName !== undefined) updateData.last_name = lastName;
      if (phone !== undefined) updateData.phone = phone;

      if (Object.keys(updateData).length === 0) {
        return res.status(400).json({
          success: false,
          message: '没有要更新的数据',
          code: 'NO_UPDATE_DATA',
        });
      }

      await models.User.update(updateData, {
        where: { id: user.id },
      });

      // 获取更新后的用户信息
      const updatedUser = await models.User.findByPk(user.id, {
        attributes: { exclude: ['password_hash'] },
      });

      res.json({
        success: true,
        message: '用户资料更新成功',
        data: {
          user: {
            id: updatedUser.id,
            username: updatedUser.username,
            email: updatedUser.email,
            firstName: updatedUser.first_name,
            lastName: updatedUser.last_name,
            phone: updatedUser.phone,
            role: updatedUser.role,
            status: updatedUser.status,
          },
        },
      });
    } catch (dbError) {
      console.error('数据库操作失败:', dbError.message);

      return res.status(503).json({
        success: false,
        message: '用户资料更新服务暂时不可用',
        code: 'SERVICE_UNAVAILABLE',
      });
    }
  } catch (error) {
    console.error('更新用户资料错误:', error);
    return res.status(500).json({
      success: false,
      message: '更新用户资料失败',
      code: 'UPDATE_PROFILE_SERVICE_ERROR',
    });
  }
};

/**
 * 修改密码
 */
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmNewPassword } = req.body;
    const user = req.user;

    // 输入验证
    if (!currentPassword || !newPassword || !confirmNewPassword) {
      return res.status(400).json({
        success: false,
        message: '所有密码字段都不能为空',
        code: 'MISSING_PASSWORD_FIELDS',
      });
    }

    if (newPassword !== confirmNewPassword) {
      return res.status(400).json({
        success: false,
        message: '新密码确认不匹配',
        code: 'PASSWORD_MISMATCH',
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: '新密码至少需要6个字符',
        code: 'PASSWORD_TOO_SHORT',
      });
    }

    try {
      const models = require('../models');
      if (!models || !models.User) {
        throw new Error('用户模型不可用');
      }

      // 获取完整的用户信息（包括密码hash）
      const fullUser = await models.User.findByPk(user.id);

      if (!fullUser) {
        return res.status(404).json({
          success: false,
          message: '用户不存在',
          code: 'USER_NOT_FOUND',
        });
      }

      // 验证当前密码
      const isCurrentPasswordValid =
        await fullUser.checkPassword(currentPassword);
      if (!isCurrentPasswordValid) {
        return res.status(401).json({
          success: false,
          message: '当前密码错误',
          code: 'INVALID_CURRENT_PASSWORD',
        });
      }

      // 更新密码
      fullUser.password_hash = newPassword; // 将在模型hook中加密
      await fullUser.save();

      res.json({
        success: true,
        message: '密码修改成功',
        data: null,
      });
    } catch (dbError) {
      console.error('数据库操作失败:', dbError.message);

      return res.status(503).json({
        success: false,
        message: '密码修改服务暂时不可用',
        code: 'SERVICE_UNAVAILABLE',
      });
    }
  } catch (error) {
    console.error('修改密码错误:', error);
    return res.status(500).json({
      success: false,
      message: '密码修改服务内部错误',
      code: 'CHANGE_PASSWORD_SERVICE_ERROR',
    });
  }
};

/**
 * 验证令牌状态
 */
const verifyToken = async (req, res) => {
  try {
    const user = req.user;
    const tokenPayload = req.tokenPayload;

    res.json({
      success: true,
      message: '令牌有效',
      data: {
        valid: true,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
          status: user.status,
        },
        token: {
          issuer: tokenPayload.iss,
          audience: tokenPayload.aud,
          issuedAt: new Date(tokenPayload.iat * 1000),
          expiresAt: new Date(tokenPayload.exp * 1000),
        },
      },
    });
  } catch (error) {
    console.error('令牌验证错误:', error);
    return res.status(500).json({
      success: false,
      message: '令牌验证服务内部错误',
      code: 'VERIFY_TOKEN_SERVICE_ERROR',
    });
  }
};

module.exports = {
  register,
  login,
  logout,
  refresh,
  getProfile,
  updateProfile,
  changePassword,
  verifyToken,
};
