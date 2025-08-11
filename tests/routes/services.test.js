/**
 * @jest-environment node
 */

const path = require('path');
const express = require('express');
const request = require('supertest');

// 引入i18n与路由
const { i18nMiddleware } = require('../../src/config/i18n');
const servicesRouter = require('../../src/routes/services');

function createApp() {
  const app = express();
  app.set('view engine', 'ejs');
  app.set('views', path.join(__dirname, '../../src/views'));

  // 提前注册i18n，提供texts给模板
  app.use(i18nMiddleware);

  // 需要解析urlencoded以兼容中间件习惯
  app.use(express.urlencoded({ extended: true }));
  app.use(express.json());

  app.use('/services', servicesRouter);
  return app;
}

describe('服务页渲染', () => {
  let app;
  beforeAll(() => {
    app = createApp();
  });

  test('车载应用开发页应返回200且包含标题', async () => {
    const resp = await request(app).get('/services/automotive-development');
    expect(resp.status).toBe(200);
    expect(resp.text).toContain('车载应用开发');
  });

  test('系统集成与测试验证页应返回200', async () => {
    await expect(request(app).get('/services/system-integration')).resolves.toHaveProperty('status', 200);
    await expect(request(app).get('/services/testing-validation')).resolves.toHaveProperty('status', 200);
  });
});


