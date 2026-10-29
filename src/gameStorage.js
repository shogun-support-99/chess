import { gameFromMoves, LEVELS, movesForStorage } from './chess.js';

export const LEGACY_GAME_KEY = 'the-chess-club-game-v1';
export const DEFAULT_SETTINGS = { mode: 'computer', playerColor: 'w', level: 'medium' };

export function normalizeSettings(settings = {}) {
  return {
    mode: settings?.mode === 'local' ? 'local' : 'computer',
    playerColor: settings?.playerColor === 'b' ? 'b' : 'w',
    level: Object.hasOwn(LEVELS, settings?.level) ? settings.level : 'medium',
  };
}

export function gameKey(profile) {
  return `the-chess-club-game-v2-${profile.kind === 'guest' ? 'guest' : `account-${profile.id}`}`;
}

export function loadSavedGame(storage, profile) {
  try {
    // Older versions used a shared save. Preserve it for guest play without
    // silently attaching somebody else's game to a newly created profile.
    const raw = storage.getItem(gameKey(profile)) || (profile.kind === 'guest' ? storage.getItem(LEGACY_GAME_KEY) : null);
    if (!raw) return null;
    const saved = JSON.parse(raw);
    if (!saved || !Array.isArray(saved.moves)) return null;
    const game = gameFromMoves(saved.moves);
    if (game.history().length !== saved.moves.length) return null;
    const settings = normalizeSettings(saved.settings);
    return {
      game,
      settings,
      flipped: typeof saved.flipped === 'boolean' ? saved.flipped : settings.playerColor === 'b',
      sound: saved.sound === true,
    };
  } catch {
    return null;
  }
}

export function saveGame(storage, profile, game, settings, flipped, sound) {
  try {
    storage.setItem(gameKey(profile), JSON.stringify({ moves: movesForStorage(game), settings: normalizeSettings(settings), flipped, sound }));
    return true;
  } catch {
    return false;
  }
}
