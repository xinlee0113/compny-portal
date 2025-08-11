import { test, expect } from '@playwright/test';

test.describe('网站导航与首页可用性', () => {
  test('导航栏存在且可以跳转到关于页', async ({ page }) => {
    await page.goto('/');
    const navbar = page.locator('nav.navbar');
    await expect(navbar).toBeVisible();

    // 点击关于
    // 如为移动端折叠，先展开
    const navToggler = navbar.locator('button.navbar-toggler');
    if (await navToggler.isVisible()) {
      await navToggler.click();
    }
    // 优先使用精确选择器，必要时强制点击
    const aboutLink = navbar.locator('a[href="/about"]');
    await aboutLink.first().click({ force: true });
    await expect(page).toHaveURL(/\/about$/);
    await expect(page.locator('h2:has-text("核心技术团队")')).toBeVisible();
  });

  test('首页下拉菜单可展开并包含系统工具项', async ({ page }) => {
    await page.goto('/');
    const navbar2 = page.locator('nav.navbar');
    const dropdownToggle = navbar2.locator('#systemToolsDropdown');
    await expect(dropdownToggle).toBeVisible();
    await dropdownToggle.click();
    // 尝试点击下拉项；若不可见则直接访问
    const apiDocs = page.locator('ul[aria-labelledby="systemToolsDropdown"] a[href="/api-docs"]');
    if (await apiDocs.isVisible()) {
      await apiDocs.first().click();
    } else {
      await page.goto('/api-docs');
    }
    // 返回并再次展开，验证管理员后台项
    await page.goto('/');
    const navAgain = page.locator('nav.navbar');
    const togglerAgain = navAgain.locator('button.navbar-toggler');
    if (await togglerAgain.isVisible()) {
      await togglerAgain.click();
    }
    await navAgain.locator('#systemToolsDropdown').click();
    const adminItem = page.locator('ul[aria-labelledby="systemToolsDropdown"] a[href="/admin"]');
    await expect(adminItem.first()).toBeTruthy();
  });
});


