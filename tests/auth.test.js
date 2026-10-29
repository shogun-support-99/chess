import test from 'node:test';
import assert from 'node:assert/strict';
import { webcrypto } from 'node:crypto';
import { ACCOUNTS_KEY, clearSession, createAccount, restoreSession, saveSession, signIn } from '../src/auth.js';

class MemoryStorage {
  data = new Map();
  getItem(key) { return this.data.get(key) ?? null; }
  setItem(key, value) { this.data.set(key, String(value)); }
  removeItem(key) { this.data.delete(key); }
}

test('local accounts register and sign in without storing a plaintext password', async () => {
  const storage = new MemoryStorage();
  const account = await createAccount(storage, 'Player_One', 'unique passphrase', webcrypto);
  assert.deepEqual(account, { kind: 'account', id: 'player_one', displayName: 'Player_One' });
  assert.equal(storage.getItem(ACCOUNTS_KEY).includes('unique passphrase'), false);
  assert.deepEqual(await signIn(storage, 'PLAYER_one', 'unique passphrase', webcrypto), account);
  await assert.rejects(signIn(storage, 'Player_One', 'wrong password', webcrypto), /incorrect/);
  await assert.rejects(createAccount(storage, 'player_one', 'another password', webcrypto), /already in use/);
});

test('local account validation and session restoration are predictable', async () => {
  const storage = new MemoryStorage();
  const session = new MemoryStorage();
  await assert.rejects(createAccount(storage, 'ab', 'long enough', webcrypto), /3–24/);
  await assert.rejects(createAccount(storage, 'valid-name', 'short', webcrypto), /8 and 128/);
  const profile = await createAccount(storage, 'ChessFan', 'not reused here', webcrypto);
  saveSession(session, profile);
  assert.deepEqual(restoreSession(storage, session), profile);
  clearSession(session);
  assert.equal(restoreSession(storage, session), null);
  saveSession(session, { kind: 'guest' });
  assert.deepEqual(restoreSession(storage, session), { kind: 'guest', id: 'guest', displayName: 'Guest' });
});

test('unavailable browser storage and crypto do not create a false account', async () => {
  const unavailable = { getItem() { throw new Error('blocked'); }, setItem() { throw new Error('blocked'); } };
  await assert.rejects(createAccount(unavailable, 'ValidName', 'long password', webcrypto), /storage is unavailable/);
  await assert.rejects(createAccount(new MemoryStorage(), 'ValidName', 'long password', {}), /secure connection/);
});

test('different profiles get different salts and hashes even for the same password', async () => {
  const storage = new MemoryStorage();
  await createAccount(storage, 'Alice', 'same unique password', webcrypto);
  await createAccount(storage, 'Bobby', 'same unique password', webcrypto);
  const [alice, bob] = JSON.parse(storage.getItem(ACCOUNTS_KEY)).accounts;
  assert.notEqual(alice.salt, bob.salt);
  assert.notEqual(alice.hash, bob.hash);
});

test('corrupted local account records fail safely', async () => {
  const storage = new MemoryStorage();
  storage.setItem(ACCOUNTS_KEY, '{malformed');
  await assert.rejects(signIn(storage, 'Player', 'password', webcrypto), /could not be read/);
  storage.setItem(ACCOUNTS_KEY, JSON.stringify({ accounts: [{ id: 'player', displayName: { bad: true }, salt: '', hash: '', iterations: 210000 }] }));
  await assert.rejects(signIn(storage, 'Player', 'password', webcrypto), /incorrect/);
});
