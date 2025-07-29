/**
 * @jest-environment node
 */

const { validateContactForm } = require('../../src/middleware/validation');

// 模拟响应对象
const createMockRes = () => {
  return {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  };
};

// 模拟下一个中间件函数
const next = jest.fn();

describe('验证中间件测试', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('应该通过有效的联系表单数据', () => {
    const req = {
      body: {
        name: '张三',
        email: 'zhangsan@example.com',
        phone: '13800138000',
        message: '这是一条测试消息',
      },
    };

    const res = createMockRes();

    validateContactForm(req, res, next);

    // 验证是否调用了next函数
    expect(next).toHaveBeenCalled();
    // 验证没有返回错误响应
    expect(res.status).not.toHaveBeenCalled();
  });

  test('应该拒绝空姓名', () => {
    const req = {
      body: {
        name: '',
        email: 'zhangsan@example.com',
        message: '这是一条测试消息',
      },
    };

    const res = createMockRes();

    validateContactForm(req, res, next);

    // 验证返回了400状态码
    expect(res.status).toHaveBeenCalledWith(400);
    // 验证返回了错误信息
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      errors: ['姓名不能为空'],
    });
    // 验证没有调用next函数
    expect(next).not.toHaveBeenCalled();
  });

  test('应该拒绝无效邮箱格式', () => {
    const req = {
      body: {
        name: '张三',
        email: 'invalid-email',
        message: '这是一条测试消息',
      },
    };

    const res = createMockRes();

    validateContactForm(req, res, next);

    // 验证返回了400状态码
    expect(res.status).toHaveBeenCalledWith(400);
    // 验证返回了错误信息
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      errors: ['邮箱格式不正确'],
    });
    // 验证没有调用next函数
    expect(next).not.toHaveBeenCalled();
  });

  test('应该拒绝空消息', () => {
    const req = {
      body: {
        name: '张三',
        email: 'zhangsan@example.com',
        message: '',
      },
    };

    const res = createMockRes();

    validateContactForm(req, res, next);

    // 验证返回了400状态码
    expect(res.status).toHaveBeenCalledWith(400);
    // 验证返回了错误信息
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      errors: ['消息内容不能为空'],
    });
    // 验证没有调用next函数
    expect(next).not.toHaveBeenCalled();
  });

  test('应该拒绝过长的姓名', () => {
    const req = {
      body: {
        name: 'a'.repeat(51), // 51个字符，超过限制
        email: 'test@example.com',
        message: '测试消息',
      },
    };
    const res = createMockRes();
    const next = jest.fn();

    validateContactForm(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      errors: ['姓名长度不能超过50个字符'],
    });
    expect(next).not.toHaveBeenCalled();
  });

  test('应该拒绝空邮箱', () => {
    const req = {
      body: {
        name: '张三',
        email: '',
        message: '测试消息',
      },
    };
    const res = createMockRes();
    const next = jest.fn();

    validateContactForm(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      errors: ['邮箱不能为空'],
    });
    expect(next).not.toHaveBeenCalled();
  });

  test('应该拒绝无效的电话号码格式', () => {
    const req = {
      body: {
        name: '张三',
        email: 'zhangsan@example.com',
        phone: 'invalid-phone-123abc',
        message: '测试消息',
      },
    };
    const res = createMockRes();
    const next = jest.fn();

    validateContactForm(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      errors: ['电话号码格式不正确'],
    });
    expect(next).not.toHaveBeenCalled();
  });

  test('应该拒绝过长的消息', () => {
    const req = {
      body: {
        name: '张三',
        email: 'zhangsan@example.com',
        message: 'a'.repeat(1001), // 1001个字符，超过限制
      },
    };
    const res = createMockRes();
    const next = jest.fn();

    validateContactForm(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      errors: ['消息内容长度不能超过1000个字符'],
    });
    expect(next).not.toHaveBeenCalled();
  });

  test('应该接受有效的电话号码格式', () => {
    const req = {
      body: {
        name: '张三',
        email: 'zhangsan@example.com',
        phone: '+86 138-0013-8000',
        message: '测试消息',
      },
    };
    const res = createMockRes();
    const next = jest.fn();

    validateContactForm(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });
});
