import { test, expect } from '@playwright/test';

test.describe('产品页交互与视觉要素', () => {
  test('搜索与分类筛选显示统计信息', async ({ page }) => {
    await page.goto('/products');
    await expect(page.getByRole('heading', { name: '产品展示' })).toBeVisible();

    const stats = page.locator('#searchStats');
    await expect(stats).toBeVisible();

    // 分类下拉变化
    const category = page.locator('#categoryFilter');
    if (await category.count()) {
      const options = await category.locator('option').allTextContents();
      const labels = options.map(o => o.trim()).filter(Boolean);
      if (labels.length > 1) {
        await category.selectOption({ label: labels[1] }).catch(async () => {
          // 回退：按值或索引选择
          const values = await category.locator('option').evaluateAll(nodes => nodes.map(n => n.getAttribute('value')));
          if (values && values[1]) {
            await category.selectOption(values[1]);
          } else {
            await category.selectOption({ index: 1 });
          }
        });
      }
      await expect(stats).toContainText(/找到|显示全部/);
    }

    // 搜索
    const search = page.locator('#searchInput');
    await search.fill('车载');
    await page.locator('button.btn.btn-light:has-text("搜索")').first().click({ force: true });
    await expect(stats).toContainText(/找到|显示全部/);
  });
});


