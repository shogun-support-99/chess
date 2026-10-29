import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { openApp } from './helpers.js';

test('login, registration, setup, and board have no automated accessibility violations', async ({ page }) => {
  await page.goto('./');
  for (const advance of [
    async () => {},
    async () => page.getByRole('button', { name: 'Create account', exact: true }).click(),
    async () => page.getByRole('button', { name: 'Continue as a guest' }).click(),
    async () => page.getByRole('button', { name: 'Start playing' }).click(),
  ]) {
    await advance();
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations).toEqual([]);
  }
});

for (const width of [320, 390, 768, 1440]) {
  test(`the login, setup, and board fit a ${width}px viewport and assets load from the Pages base path`, async ({ page }) => {
    await page.setViewportSize({ width, height: 850 });
    await openApp(page);
    const assertFits = async () => {
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
      const images = await page.locator('img').evaluateAll((items) => items.map((image) => ({ src: image.getAttribute('src'), loaded: image.complete && image.naturalWidth > 0 })));
      expect(images.every(({ src, loaded }) => src.startsWith('/chess/') && loaded)).toBe(true);
    };
    await assertFits();
    await page.getByRole('button', { name: 'Continue as a guest' }).click();
    await assertFits();
    await page.getByRole('button', { name: 'Start playing' }).click();
    await assertFits();
  });
}

test('a long profile name fits the smallest supported screen', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 720 });
  await openApp(page);
  await page.getByRole('button', { name: 'Create account', exact: true }).click();
  await page.getByLabel('Player name').fill('AReallyLongPlayerName123');
  await page.getByLabel('Password', { exact: true }).fill('unique device password');
  await page.getByLabel('Confirm password').fill('unique device password');
  await page.getByRole('button', { name: 'Create local account' }).click();
  await expect(page.getByRole('heading', { name: 'Make it your game.' })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(320);
  await page.getByRole('button', { name: 'Start playing' }).click();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(320);
});
