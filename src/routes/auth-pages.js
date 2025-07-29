/**
 * 认证页面路由
 * 处理登录、注册等页面的渲染
 */

const express = require('express');
const router = express.Router();

/**
 * GET /auth/login
 * 显示登录页面
 */
router.get('/login', (req, res) => {
  try {
    res.render('auth/login', {
      title: '用户登录',
      layout: false, // 不使用布局文件
    });
  } catch (error) {
    console.error('渲染登录页面失败:', error);
    res.status(500).render('500', {
      title: '服务器错误',
    });
  }
});

/**
 * GET /auth/register
 * 显示注册页面
 */
router.get('/register', (req, res) => {
  try {
    res.render('auth/register', {
      title: '用户注册',
      layout: false, // 不使用布局文件
    });
  } catch (error) {
    console.error('渲染注册页面失败:', error);
    res.status(500).render('500', {
      title: '服务器错误',
    });
  }
});

/**
 * GET /auth/profile
 * 显示个人中心页面
 */
router.get('/profile', (req, res) => {
  try {
    res.render('auth/profile', {
      title: '个人中心',
      layout: false, // 不使用布局文件
    });
  } catch (error) {
    console.error('渲染个人中心页面失败:', error);
    res.status(500).render('500', {
      title: '服务器错误',
    });
  }
});

/**
 * GET /auth/forgot-password
 * 显示忘记密码页面（占位符）
 */
router.get('/forgot-password', (req, res) => {
  try {
    res.render('auth/forgot-password', {
      title: '找回密码',
      layout: false,
    });
  } catch (error) {
    // 如果模板不存在，显示简单的信息页面
    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>找回密码</title>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { 
            font-family: Arial, sans-serif; 
            text-align: center; 
            padding: 50px; 
            background: #f5f5f5;
          }
          .container {
            background: white;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            max-width: 500px;
            margin: 0 auto;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>找回密码</h1>
          <p>此功能正在开发中，请联系管理员重置密码。</p>
          <a href="/auth/login">返回登录</a>
        </div>
      </body>
      </html>
    `);
  }
});

module.exports = router;
