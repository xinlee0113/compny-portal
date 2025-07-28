/**
 * @jest-environment node
 */

const homeController = require('../../src/controllers/homeController');

// 模拟Express的req和res对象
const mockRequest = () => {
  return {};
};

const mockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.render = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('homeController', () => {
  test('getIndex应该渲染主页', () => {
    const req = mockRequest();
    const res = mockResponse();
    
    homeController.getIndex(req, res);
    
    expect(res.render).toHaveBeenCalledWith('home/index', {
      title: '公司首页',
      page: 'home'
    });
  });

  test('getAbout应该渲染公司介绍页面', () => {
    const req = mockRequest();
    const res = mockResponse();
    
    homeController.getAbout(req, res);
    
    expect(res.render).toHaveBeenCalledWith('home/about', {
      title: '公司介绍',
      page: 'about'
    });
  });

  // 注意：产品展示功能已迁移到 productController.test.js

  test('getNews应该渲染新闻动态页面', () => {
    const req = mockRequest();
    const res = mockResponse();
    
    homeController.getNews(req, res);
    
    expect(res.render).toHaveBeenCalledWith('home/news', {
      title: '新闻动态',
      page: 'news'
    });
  });

  test('getContact应该渲染联系我们页面', () => {
    const req = mockRequest();
    const res = mockResponse();
    
    homeController.getContact(req, res);
    
    expect(res.render).toHaveBeenCalledWith('home/contact', {
      title: '联系我们',
      page: 'contact'
    });
  });

  test('postContact应该处理联系表单提交', () => {
    const req = mockRequest();
    req.body = {
      name: '张三',
      email: 'zhangsan@example.com',
      phone: '13800138000',
      message: '这是一条测试消息'
    };
    const res = mockResponse();
    
    // 模拟console.log
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    
    homeController.postContact(req, res);
    
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: '您的消息已成功发送，我们会尽快与您联系。'
    });
    
    expect(consoleSpy).toHaveBeenCalledWith('收到联系表单:', {
      name: '张三',
      email: 'zhangsan@example.com',
      phone: '13800138000',
      message: '这是一条测试消息'
    });
    
    consoleSpy.mockRestore();
  });

  test('get404应该渲染404错误页面', () => {
    const req = mockRequest();
    const res = mockResponse();
    
    homeController.get404(req, res);
    
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.render).toHaveBeenCalledWith('404', {
      title: '页面未找到',
      page: '404'
    });
  });

  test('get500应该渲染500错误页面', () => {
    const req = mockRequest();
    const res = mockResponse();
    
    homeController.get500(req, res);
    
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.render).toHaveBeenCalledWith('500', {
      title: '服务器内部错误',
      page: '500'
    });
  });
});