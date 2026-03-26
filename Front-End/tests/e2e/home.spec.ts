import { test, expect } from '@playwright/test';
import { injectAxe, checkA11y } from 'axe-playwright';

test.describe('Home page', () => {
  test('loads and has basic elements', async ({ page }) => {
    await page.goto('http://localhost:5173');
    await expect(page.locator('text=Login')).toBeVisible({ timeout: 5000 });
  });

  test('accessibility smoke', async ({ page }) => {
    await page.goto('http://localhost:5173');
    await injectAxe(page);
    await checkA11y(page, undefined, { detailedReport: true });
  });
});
