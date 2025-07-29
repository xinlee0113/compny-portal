/**
 * 表单验证中间件
 */

// 联系表单验证
const validateContactForm = (req, res, next) => {
  const { name, email, phone, message } = req.body;
  const errors = [];

  // 验证姓名
  if (!name || name.trim() === '') {
    errors.push('姓名不能为空');
  } else if (name.length > 50) {
    errors.push('姓名长度不能超过50个字符');
  }

  // 验证邮箱
  if (!email || email.trim() === '') {
    errors.push('邮箱不能为空');
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.push('邮箱格式不正确');
  }

  // 验证电话（可选）
  if (phone && phone.trim() !== '' && !/^[\d\-+() \s]+$/.test(phone)) {
    errors.push('电话号码格式不正确');
  }

  // 验证消息
  if (!message || message.trim() === '') {
    errors.push('消息内容不能为空');
  } else if (message.length > 1000) {
    errors.push('消息内容长度不能超过1000个字符');
  }

  // 如果有错误，返回错误信息
  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      errors: errors,
    });
  }

  // 验证通过，继续处理
  next();
};

module.exports = {
  validateContactForm,
};
