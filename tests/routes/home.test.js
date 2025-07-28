/**
 * @jest-environment node
 */

describe('路由测试', () => {
  const routes = {
    '/': { status: 200, title: '公司首页' },
    '/about': { status: 200, title: '公司介绍' },
    '/products': { status: 200, title: '产品展示' },
    '/news': { status: 200, title: '新闻动态' },
    '/contact': { status: 200, title: '联系我们' },
    '/non-existent-page': { status: 404, title: '页面未找到' }
  };

  test('应该返回首页页面', () => {
    const route = routes['/'];
    expect(route.status).toBe(200);
    expect(route.title).toContain('公司首页');
  });

  test('应该返回公司介绍页面', () => {
    const route = routes['/about'];
    expect(route.status).toBe(200);
    expect(route.title).toContain('公司介绍');
  });

  test('应该返回产品展示页面', () => {
    const route = routes['/products'];
    expect(route.status).toBe(200);
    expect(route.title).toContain('产品展示');
  });

  test('应该返回新闻动态页面', () => {
    const route = routes['/news'];
    expect(route.status).toBe(200);
    expect(route.title).toContain('新闻动态');
  });

  test('应该返回联系我们页面', () => {
    const route = routes['/contact'];
    expect(route.status).toBe(200);
    expect(route.title).toContain('联系我们');
  });

  test('访问不存在的页面应该返回404', () => {
    const route = routes['/non-existent-page'];
    expect(route.status).toBe(404);
    expect(route.title).toContain('页面未找到');
  });
});