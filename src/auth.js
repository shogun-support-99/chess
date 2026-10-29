// These are device-only profiles for the static GitHub Pages app, not server-side
// authentication. Browser storage can be inspected or modified by its owner.
export const ACCOUNTS_KEY = 'the-chess-club-local-accounts-v1';
export const SESSION_KEY = 'the-chess-club-local-session-v1';
const ITERATIONS = 210000;
const USERNAME_PATTERN = /^[a-zA-Z0-9][a-zA-Z0-9_-]{2,23}$/;

function readAccounts(storage) {
  let value;
  try {
    value = storage.getItem(ACCOUNTS_KEY);
  } catch {
    throw new Error('Browser storage is unavailable. You can still play as a guest.');
  }
  if (!value) return [];
  try {
    const data = JSON.parse(value);
    if (!Array.isArray(data.accounts)) throw new Error('Invalid account data');
    return data.accounts;
  } catch {
    throw new Error('Your local profiles could not be read. You can still play as a guest.');
  }
}

function normalizeUsername(username) {
  return username.trim().toLowerCase();
}

function validateUsername(username) {
  if (!USERNAME_PATTERN.test(username)) {
    throw new Error('Use 3–24 letters, numbers, underscores, or hyphens, starting with a letter or number.');
  }
}

function requireCrypto(provider) {
  if (!provider?.subtle || !provider?.getRandomValues) {
    throw new Error('Local sign-in requires a secure connection (HTTPS or localhost). You can play as a guest.');
  }
}

function toBase64(bytes) {
  return btoa(String.fromCharCode(...bytes));
}

function fromBase64(value) {
  return Uint8Array.from(atob(value), (character) => character.charCodeAt(0));
}

async function passwordHash(password, salt, iterations, provider) {
  const key = await provider.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits']);
  const bits = await provider.subtle.deriveBits({ name: 'PBKDF2', salt, iterations, hash: 'SHA-256' }, key, 256);
  return new Uint8Array(bits);
}

function hashesMatch(left, right) {
  if (left.length !== right.length) return false;
  let difference = 0;
  for (let i = 0; i < left.length; i += 1) difference |= left[i] ^ right[i];
  return difference === 0;
}

/** Create a local profile. Only a salted password hash is stored, never the password. */
export async function createAccount(storage, username, password, provider = globalThis.crypto) {
  const displayName = username.trim();
  validateUsername(displayName);
  if (password.length < 8 || password.length > 128) throw new Error('Choose a password between 8 and 128 characters.');
  requireCrypto(provider);
  const id = normalizeUsername(displayName);
  if (readAccounts(storage).some((account) => account?.id === id)) throw new Error('That player name is already in use on this device.');
  const salt = provider.getRandomValues(new Uint8Array(16));
  const hash = await passwordHash(password, salt, ITERATIONS, provider);
  // Re-check after hashing in case another tab created the same profile meanwhile.
  const accounts = readAccounts(storage);
  if (accounts.some((account) => account?.id === id)) throw new Error('That player name is already in use on this device.');
  accounts.push({ id, displayName, salt: toBase64(salt), hash: toBase64(hash), iterations: ITERATIONS });
  try {
    storage.setItem(ACCOUNTS_KEY, JSON.stringify({ accounts }));
  } catch {
    throw new Error('Your profile could not be saved. Check your browser storage settings.');
  }
  return { kind: 'account', id, displayName };
}

/** Verify a local profile in this browser. */
export async function signIn(storage, username, password, provider = globalThis.crypto) {
  const id = normalizeUsername(username);
  requireCrypto(provider);
  const account = readAccounts(storage).find((item) => item?.id === id);
  if (!account || !password || typeof account.displayName !== 'string' || !USERNAME_PATTERN.test(account.displayName)
    || normalizeUsername(account.displayName) !== id) throw new Error('Player name or password is incorrect.');
  try {
    if (typeof account.salt !== 'string' || typeof account.hash !== 'string'
      || !Number.isSafeInteger(account.iterations) || account.iterations < 100000 || account.iterations > 1000000) {
      throw new Error('Invalid account data');
    }
    const expected = fromBase64(account.hash);
    const salt = fromBase64(account.salt);
    if (expected.length !== 32 || salt.length !== 16) throw new Error('Invalid account data');
    const actual = await passwordHash(password, salt, account.iterations, provider);
    if (!hashesMatch(actual, expected)) throw new Error('Incorrect password');
  } catch {
    throw new Error('Player name or password is incorrect.');
  }
  return { kind: 'account', id: account.id, displayName: account.displayName };
}

export function saveSession(sessionStorage, profile) {
  try {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(profile.kind === 'guest' ? { kind: 'guest' } : { kind: 'account', id: profile.id }));
  } catch {
    // The current tab still works when session storage is disabled.
  }
}

export function restoreSession(storage, sessionStorage) {
  try {
    const session = JSON.parse(sessionStorage.getItem(SESSION_KEY) || 'null');
    if (session?.kind === 'guest') return { kind: 'guest', id: 'guest', displayName: 'Guest' };
    if (session?.kind !== 'account' || typeof session.id !== 'string') return null;
    const account = readAccounts(storage).find((item) => item?.id === session.id);
    if (!account || typeof account.displayName !== 'string' || !USERNAME_PATTERN.test(account.displayName) || normalizeUsername(account.displayName) !== account.id) return null;
    return { kind: 'account', id: account.id, displayName: account.displayName };
  } catch {
    return null;
  }
}

export function clearSession(sessionStorage) {
  try { sessionStorage.removeItem(SESSION_KEY); } catch { /* Nothing else to clear. */ }
}
