const { test, expect } = require('@playwright/test');

test('Homepage loads correctly', async ({ page }) => {
  await page.goto('https://lockedin-ai-ten.vercel.app');

  await expect(page).toHaveTitle(/Curious Horizons/i);

  await expect(
    page.locator('text=Start Session')
  ).toBeVisible();
});

test('Guest user can reach time selection', async ({ page }) => {
  await page.goto('https://lockedin-ai-ten.vercel.app');

  await page.fill('textarea', 'The AI Bubble in Silicon Valley');

  await page.click('text=Next');

  await expect(page.url()).toContain('time');
});