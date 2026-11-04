import { test, expect } from '@playwright/test';

test('navigation preserves the document and exposes the active route', async ({
  page,
  isMobile,
}) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await page.evaluate(() => {
    document.documentElement.dataset.navigationTest = 'same-document';
  });
  if (isMobile) await page.getByRole('button', { name: 'Toggle navigation' }).click();
  await page
    .getByRole('navigation', { name: 'Main navigation' })
    .getByRole('link', { name: /ABOUT/ })
    .click();
  await expect(page).toHaveURL(/\/about$/);
  await expect(page.getByRole('heading', { level: 1 })).toContainText('The person behind');
  await expect(page.locator('html')).toHaveAttribute('data-navigation-test', 'same-document');
  await expect(page.locator('.main-nav a[aria-current="page"]')).toContainText('ABOUT');
  await expect(page.locator('.nav-pending[data-pending="true"]')).toHaveCount(0);
  expect(errors).toEqual([]);
});

test('reduced motion keeps all public content visible without animation', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await page.locator('.site-footer').scrollIntoViewIfNeeded();
  await expect(page.locator('.site-footer')).toBeVisible();
  const running = await page.evaluate(
    () => document.getAnimations().filter((animation) => animation.playState === 'running').length,
  );
  expect(running).toBe(0);
  expect(
    await page.locator('body').evaluate((element) => element.scrollWidth <= innerWidth + 1),
  ).toBeTruthy();
});
