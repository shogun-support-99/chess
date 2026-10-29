import { expect } from '@playwright/test';
import { Chess } from 'chess.js';

export async function openApp(page) {
  await page.goto('./');
  await expect(page.getByRole('heading', { name: 'Welcome back.' })).toBeVisible();
}

export async function register(page, name, password = 'a unique local password') {
  await page.getByRole('button', { name: 'Create account', exact: true }).click();
  await page.getByLabel('Player name').fill(name);
  await page.getByLabel('Password', { exact: true }).fill(password);
  await page.getByLabel('Confirm password').fill(password);
  await page.getByRole('button', { name: 'Create local account' }).click();
  await expect(page.getByRole('heading', { name: 'Make it your game.' })).toBeVisible();
}

export async function signIn(page, name, password = 'a unique local password') {
  await page.getByLabel('Player name').fill(name);
  await page.getByLabel('Password', { exact: true }).fill(password);
  await page.locator('form').getByRole('button', { name: 'Sign in' }).click();
}

export async function playAsGuest(page) {
  await openApp(page);
  await page.getByRole('button', { name: 'Continue as a guest' }).click();
}

export function square(page, id) {
  return page.getByRole('gridcell', { name: new RegExp(`^${id},`) });
}

export async function move(page, from, to) {
  await square(page, from).click();
  await square(page, to).click();
}

export async function seedLocalGame(page, sans) {
  const game = new Chess();
  for (const san of sans) game.move(san);
  const moves = game.history({ verbose: true }).map(({ from, to, promotion }) => ({ from, to, ...(promotion ? { promotion } : {}) }));
  await page.goto('./');
  await page.evaluate((savedMoves) => {
    sessionStorage.setItem('the-chess-club-local-session-v1', JSON.stringify({ kind: 'guest' }));
    localStorage.setItem('the-chess-club-game-v2-guest', JSON.stringify({ moves: savedMoves, settings: { mode: 'local', level: 'medium', playerColor: 'w' }, flipped: false, sound: false }));
  }, moves);
  await page.reload();
  await page.getByRole('button', { name: 'Resume game' }).click();
}
