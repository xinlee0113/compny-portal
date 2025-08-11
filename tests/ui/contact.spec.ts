import { test, expect } from '@playwright/test';

test.describe('联系表单与错误页', () => {
  test('联系表单可填写并提交成功消息', async ({ page }) => {
    await page.goto('/contact');
    await page.getByLabel('姓名', { exact: false }).fill('测试用户');
    await page.getByLabel('邮箱', { exact: false }).fill('tester@example.com');
    await page.getByLabel('主题', { exact: false }).fill('合作咨询');
    await page.getByLabel('留言', { exact: false }).fill('我们希望了解车载应用方案');
    await page.getByRole('button', { name: '发送消息' }).click();
    await expect(page.locator('#formMessage')).toBeVisible();
    await expect(page.locator('#formMessage')).toContainText('消息发送成功');
  });

  test('访问不存在页面显示404兜底', async ({ page }) => {
    const resp = await page.goto('/non-exist-page-' + Date.now());
    expect(resp?.status()).toBe(404);
    await expect(page.getByText(/未找到|404/)).toBeVisible();
  });

  test('移动端视口下导航可展开', async ({ page, browserName }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/');
    const toggler = page.locator('.navbar-toggler');
    if (await toggler.isVisible()) {
      await toggler.click();
      await expect(page.locator('#navbarNav')).toBeVisible();
      await page.getByRole('link', { name: '联系我们' }).click();
      await expect(page).toHaveURL(/\/contact$/);
    }
  });
});


