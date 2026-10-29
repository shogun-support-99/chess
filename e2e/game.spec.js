import { test, expect } from '@playwright/test';
import { move, playAsGuest, seedLocalGame, square } from './helpers.js';

test('two people alternate on one device, take back one move, flip and resume', async ({ page }) => {
  await playAsGuest(page);
  await page.getByText('Play with a friend', { exact: true }).click();
  await expect(page.getByText('This is not online multiplayer.', { exact: false })).toBeVisible();
  await page.getByRole('button', { name: 'Start playing' }).click();
  await expect(page.getByText('Player 1', { exact: true }).first()).toBeVisible();
  await expect(page.getByText('Player 2', { exact: true }).first()).toBeVisible();
  await expect(square(page, 'e7')).toHaveAttribute('draggable', 'false');
  await move(page, 'e2', 'e4');
  await expect(page.getByRole('status')).toContainText('Black to move');
  await expect(square(page, 'e7')).toHaveAttribute('draggable', 'true');
  await page.waitForTimeout(1000);
  await expect(page.locator('.history-heading')).toContainText('1 move');
  await square(page, 'e7').dragTo(square(page, 'e5'));
  await expect(page.getByRole('status')).toContainText('White to move');
  await expect(page.locator('.move-list')).toContainText('e5');
  await page.locator('.game-actions').getByRole('button', { name: 'Take back' }).click();
  await expect(square(page, 'e7')).toHaveAttribute('aria-label', /black pawn/);
  await expect(page.getByRole('status')).toContainText('Black to move');
  await page.locator('.game-actions').getByRole('button', { name: 'Flip board' }).click();
  await expect(page.getByRole('gridcell').first()).toHaveAttribute('aria-label', /^h1,/);
  await page.reload();
  await page.getByRole('button', { name: 'Resume game' }).click();
  await expect(square(page, 'e4')).toHaveAttribute('aria-label', /white pawn/);
  await expect(page.getByRole('gridcell').first()).toHaveAttribute('aria-label', /^h1,/);
  await expect(page.getByRole('status')).toContainText('Black to move');
});

test('two-player checkmate names the winner and can be undone', async ({ page }) => {
  await playAsGuest(page);
  await page.getByText('Play with a friend', { exact: true }).click();
  await page.getByRole('button', { name: 'Start playing' }).click();
  for (const [from, to] of [['f2', 'f3'], ['e7', 'e5'], ['g2', 'g4'], ['d8', 'h4']]) await move(page, from, to);
  await expect(page.getByRole('status')).toContainText('Black wins the game');
  await expect(page.getByText('FINISHED', { exact: true })).toBeVisible();
  await page.locator('.game-actions').getByRole('button', { name: 'Take back' }).click();
  await expect(page.getByRole('status')).toContainText('Black to move');
  await expect(square(page, 'd8')).toHaveAttribute('aria-label', /black queen/);
});

test('white and black pawns promote to the chosen piece in local play', async ({ page }) => {
  await seedLocalGame(page, ['a4', 'h5', 'a5', 'h4', 'a6', 'h3', 'axb7', 'hxg2']);
  await move(page, 'b7', 'a8');
  let dialog = page.getByRole('dialog', { name: 'Choose a piece' });
  await expect(dialog.locator('img').first()).toHaveAttribute('src', /\/wQ\.svg$/);
  await dialog.getByRole('button', { name: 'Knight' }).click();
  await expect(square(page, 'a8')).toHaveAttribute('aria-label', /white knight/);
  await seedLocalGame(page, ['h4', 'a5', 'h5', 'a4', 'h6', 'a3', 'hxg7', 'axb2', 'Nf3']);
  await move(page, 'b2', 'a1');
  dialog = page.getByRole('dialog', { name: 'Choose a piece' });
  await expect(dialog.locator('img').first()).toHaveAttribute('src', /\/bQ\.svg$/);
  await dialog.getByRole('button', { name: 'Knight' }).click();
  await expect(square(page, 'a1')).toHaveAttribute('aria-label', /black knight/);
});

for (const level of ['Easy', 'Medium', 'Hard']) {
  test(`the ${level.toLowerCase()} computer plays a reply`, async ({ page }) => {
    await playAsGuest(page);
    await page.getByText(level, { exact: true }).first().click();
    await page.getByRole('button', { name: 'Start playing' }).click();
    await expect(page.getByText(`${level} · Computer`)).toBeVisible();
    await move(page, 'e2', 'e4');
    await expect(page.locator('.history-heading')).toContainText('2 moves', { timeout: 35_000 });
    await expect(page.getByRole('status')).toContainText('Your turn');
    await page.locator('.game-actions').getByRole('button', { name: 'Take back' }).click();
    await expect(square(page, 'e2')).toHaveAttribute('aria-label', /white pawn/);
    await expect(page.locator('.history-heading')).toContainText('0 moves');
  });
}

test('playing black waits for the computer opening and keeps it when undoing', async ({ page }) => {
  await playAsGuest(page);
  await page.locator('label.setup-side').filter({ hasText: 'Black' }).click();
  await page.getByRole('button', { name: 'Start playing' }).click();
  await expect(page.locator('.history-heading')).toContainText('1 move', { timeout: 20_000 });
  await expect(page.getByRole('status')).toContainText('Your turn');
  await expect(page.locator('.game-actions').getByRole('button', { name: 'Take back' })).toBeDisabled();
  await move(page, 'e7', 'e5');
  await expect(page.locator('.history-heading')).toContainText('3 moves', { timeout: 20_000 });
  await page.locator('.game-actions').getByRole('button', { name: 'Take back' }).click();
  await expect(page.locator('.history-heading')).toContainText('1 move');
  await expect(square(page, 'e7')).toHaveAttribute('aria-label', /black pawn/);
});

test('starting a new game asks before replacing a saved game', async ({ page }) => {
  await playAsGuest(page);
  await page.getByText('Play with a friend', { exact: true }).click();
  await page.getByRole('button', { name: 'Start playing' }).click();
  await move(page, 'e2', 'e4');
  await page.getByRole('button', { name: 'New game', exact: true }).last().click();
  await page.getByRole('button', { name: 'Start a new game' }).click();
  const dialog = page.getByRole('dialog', { name: 'Start a new game?' });
  await expect(dialog).toBeVisible();
  await dialog.getByRole('button', { name: 'Keep my game' }).click();
  await page.getByRole('button', { name: 'Resume game' }).click();
  await expect(square(page, 'e4')).toHaveAttribute('aria-label', /white pawn/);
  await page.getByRole('button', { name: 'New game', exact: true }).last().click();
  await page.getByRole('button', { name: 'Start a new game' }).click();
  await page.getByRole('dialog', { name: 'Start a new game?' }).getByRole('button', { name: 'Replace and play' }).click();
  await expect(square(page, 'e2')).toHaveAttribute('aria-label', /white pawn/);
  await expect(page.locator('.history-heading')).toContainText('0 moves');
});

test('the board can be played with a keyboard', async ({ page }) => {
  await playAsGuest(page);
  await page.getByText('Play with a friend', { exact: true }).click();
  await page.getByRole('button', { name: 'Start playing' }).click();
  await square(page, 'e2').focus();
  await page.keyboard.press('Enter');
  await page.keyboard.press('ArrowUp');
  await page.keyboard.press('ArrowUp');
  await page.keyboard.press('Enter');
  await expect(square(page, 'e4')).toHaveAttribute('aria-label', /white pawn/);
  await expect(page.getByRole('status')).toContainText('Black to move');
});

test('browser back and forward return between setup and the saved game', async ({ page }) => {
  await playAsGuest(page);
  await page.getByText('Play with a friend', { exact: true }).click();
  await page.getByRole('button', { name: 'Start playing' }).click();
  await move(page, 'e2', 'e4');
  await page.goBack();
  await expect(page.getByRole('button', { name: 'Resume game' })).toBeVisible();
  await page.goForward();
  await expect(square(page, 'e4')).toHaveAttribute('aria-label', /white pawn/);
  await page.goBack();
  await page.getByRole('button', { name: 'Sign out' }).click();
  await page.goForward();
  await expect(page.getByRole('heading', { name: 'Welcome back.' })).toBeVisible();
});


test('taking back while the computer is thinking cancels its pending move', async ({ page }) => {
  await playAsGuest(page);
  await page.getByRole('button', { name: 'Start playing' }).click();
  await move(page, 'e2', 'e4');
  await page.locator('.game-actions').getByRole('button', { name: 'Take back' }).click();
  await page.waitForTimeout(1200);
  await expect(page.locator('.history-heading')).toContainText('0 moves');
  await expect(square(page, 'e2')).toHaveAttribute('aria-label', /white pawn/);
});

test('guest play warns when browser storage cannot save a game', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, 'localStorage', { get() { throw new Error('Storage disabled'); } });
  });
  await playAsGuest(page);
  await page.getByRole('button', { name: 'Start playing' }).click();
  await expect(page.getByRole('alert')).toContainText('isn’t allowing saves');
  await move(page, 'e2', 'e4');
  await expect(square(page, 'e4')).toHaveAttribute('aria-label', /white pawn/);
});
