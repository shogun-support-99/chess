import test from 'node:test';
import assert from 'node:assert/strict';
import { Chess } from 'chess.js';
import { gameKey, LEGACY_GAME_KEY, loadSavedGame, saveGame } from '../src/gameStorage.js';

class MemoryStorage {
  data = new Map();
  getItem(key) { return this.data.get(key) ?? null; }
  setItem(key, value) { this.data.set(key, String(value)); }
}

const alice = { kind: 'account', id: 'alice', displayName: 'Alice' };
const bob = { kind: 'account', id: 'bob', displayName: 'Bob' };
const guest = { kind: 'guest', id: 'guest', displayName: 'Guest' };

test('saves are isolated per profile and restore local two-player settings', () => {
  const storage = new MemoryStorage();
  const game = new Chess(); game.move('e4'); game.move('e5');
  assert.equal(saveGame(storage, alice, game, { mode: 'local', playerColor: 'w', level: 'hard' }, false, true), true);
  assert.equal(loadSavedGame(storage, bob), null);
  const saved = loadSavedGame(storage, alice);
  assert.equal(saved.game.fen(), game.fen());
  assert.equal(saved.settings.mode, 'local');
  assert.equal(saved.settings.level, 'hard');
  assert.equal(saved.sound, true);
});

test('legacy saves are available to guests without leaking into new profiles', () => {
  const storage = new MemoryStorage();
  storage.setItem(LEGACY_GAME_KEY, JSON.stringify({ moves: [{ from: 'e2', to: 'e4' }], settings: { playerColor: 'w', level: 'easy' } }));
  assert.equal(loadSavedGame(storage, alice), null);
  assert.deepEqual(loadSavedGame(storage, guest).game.history(), ['e4']);
  assert.equal(loadSavedGame(storage, guest).settings.mode, 'computer');
});

test('invalid saved moves are not offered as a resumable game', () => {
  const storage = new MemoryStorage();
  storage.setItem(gameKey(alice), JSON.stringify({ moves: [null], settings: {} }));
  assert.equal(loadSavedGame(storage, alice), null);
});
