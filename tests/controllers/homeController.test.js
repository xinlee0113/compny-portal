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

  test('getProducts应该渲染产品展示页面', () => {
    const req = mockRequest();
    const res = mockResponse();
    
    homeController.getProducts(req, res);
    
    expect(res.render).toHaveBeenCalledWith('home/products', {
      title: '产品展示',
      page: 'products'
    });
  });

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
});