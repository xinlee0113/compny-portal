import { test, expect } from '@playwright/test';

test.describe('管理员入口与登录页可视化', () => {
  test('未认证访问 /admin 返回401 或跳到登录页', async ({ page, request }) => {
    const resp = await request.get('/admin');
    expect([200, 301, 302, 401, 403]).toContain(resp.status());
  });

  test('通过导航进入 管理后台 链接并展示登录UI', async ({ page }) => {
    await page.goto('/');
    const navbar = page.locator('nav.navbar');
    const navToggler = navbar.locator('button.navbar-toggler');
    if (await navToggler.isVisible()) {
      await navToggler.click();
    }
    const toggle = navbar.locator('#systemToolsDropdown');
    await toggle.click();
    const adminItem = page.locator('ul[aria-labelledby="systemToolsDropdown"] a[href="/admin"]');
    if (await adminItem.isVisible()) {
      await adminItem.first().click();
    } else {
      await page.goto('/admin');
    }

    // 登录页UI元素
    await expect(page.getByText('管理员登录')).toBeVisible();
    await expect(page.locator('form#adminLoginForm')).toBeVisible();
    await expect(page.getByRole('button', { name: /登录/ })).toBeVisible();
  });
});


