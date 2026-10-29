import { test, expect } from '@playwright/test';
import { move, openApp, register, signIn, square } from './helpers.js';

test('register, validate password, restore the tab session, sign out and sign in', async ({ page }) => {
  await openApp(page);
  await page.getByRole('button', { name: 'Create account', exact: true }).click();
  await page.getByLabel('Player name').fill('ChessFan');
  await page.getByLabel('Password', { exact: true }).fill('a unique local password');
  await page.getByLabel('Confirm password').fill('does not match');
  await page.getByRole('button', { name: 'Create local account' }).click();
  await expect(page.getByRole('alert')).toContainText('passwords don’t match');
  await page.getByLabel('Confirm password').fill('a unique local password');
  await page.getByRole('button', { name: 'Create local account' }).click();
  await expect(page.getByRole('heading', { name: 'Make it your game.' })).toBeVisible();
  expect(await page.evaluate(() => localStorage.getItem('the-chess-club-local-accounts-v1'))).not.toContain('a unique local password');
  await page.reload();
  await expect(page.getByText('ChessFan', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Sign out' }).click();
  await expect(page.getByRole('heading', { name: 'Welcome back.' })).toBeVisible();
  await signIn(page, 'chessfan', 'wrong password');
  await expect(page.getByRole('alert')).toContainText('incorrect');
  await signIn(page, 'CHESSFAN');
  await expect(page.getByRole('heading', { name: 'Make it your game.' })).toBeVisible();
  await page.getByRole('button', { name: 'Sign out' }).click();
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Welcome back.' })).toBeVisible();
});

test('each local profile has its own saved game', async ({ page }) => {
  await openApp(page);
  await register(page, 'Alice');
  await page.getByText('Play with a friend', { exact: true }).click();
  await page.getByRole('button', { name: 'Start playing' }).click();
  await move(page, 'e2', 'e4');
  await page.getByRole('button', { name: 'Sign out' }).click();
  await register(page, 'Bob');
  await expect(page.getByRole('button', { name: 'Resume game' })).toHaveCount(0);
  await page.getByRole('button', { name: 'Sign out' }).click();
  await signIn(page, 'alice');
  await expect(page.getByRole('button', { name: 'Resume game' })).toBeVisible();
  await page.getByRole('button', { name: 'Resume game' }).click();
  await expect(square(page, 'e4')).toHaveAttribute('aria-label', /white pawn/);
  await expect(page.getByRole('status')).toContainText('Black to move');
});

test('a prior shared save remains available for guests', async ({ page }) => {
  await openApp(page);
  await page.evaluate(() => localStorage.setItem('the-chess-club-game-v1', JSON.stringify({ moves: [{ from: 'e2', to: 'e4' }], settings: { playerColor: 'w', level: 'easy' } })));
  await page.getByRole('button', { name: 'Continue as a guest' }).click();
  await expect(page.getByRole('button', { name: 'Resume game' })).toBeVisible();
  await page.getByRole('button', { name: 'Resume game' }).click();
  await expect(square(page, 'e4')).toHaveAttribute('aria-label', /white pawn/);
  await expect(page.getByText('Easy · Computer')).toBeVisible();
});
