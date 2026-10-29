import { Chess } from 'chess.js';

export const PIECE_NAMES = {
  p: 'pawn',
  n: 'knight',
  b: 'bishop',
  r: 'rook',
  q: 'queen',
  k: 'king',
};

export const LEVELS = {
  easy: { name: 'Easy', description: 'A relaxed game', depth: 1 },
  medium: { name: 'Medium', description: 'A little more thoughtful', depth: 2 },
  hard: { name: 'Hard', description: 'A proper challenge', depth: 3 },
};

const PIECE_VALUES = { p: 100, n: 320, b: 335, r: 500, q: 900, k: 0 };
const SEARCH_LIMIT = Symbol('search limit');

/** Make a copy without throwing away the move history (needed for repetition). */
export function copyGame(game) {
  const copy = new Chess();
  for (const move of game.history({ verbose: true })) {
    copy.move({ from: move.from, to: move.to, promotion: move.promotion });
  }
  return copy;
}

export function movesForStorage(game) {
  return game.history({ verbose: true }).map(({ from, to, promotion }) => ({
    from,
    to,
    ...(promotion ? { promotion } : {}),
  }));
}

/** Ignore malformed saves rather than leaving the application unusable. */
export function gameFromMoves(moves) {
  const game = new Chess();
  if (!Array.isArray(moves)) return game;
  try {
    for (const move of moves) {
      // chess.js accepts null moves and SAN strings, but neither can be produced
      // by this app. Restoring one would create a phantom turn that cannot be
      // replayed by copyGame or the computer worker.
      if (!move || typeof move !== 'object' || Array.isArray(move)
        || typeof move.from !== 'string' || !/^[a-h][1-8]$/.test(move.from)
        || typeof move.to !== 'string' || !/^[a-h][1-8]$/.test(move.to)
        || (move.promotion !== undefined && !['q', 'r', 'b', 'n'].includes(move.promotion))
        || game.isGameOver()) {
        throw new Error('Invalid saved move');
      }
      const played = game.move({ from: move.from, to: move.to, ...(move.promotion !== undefined ? { promotion: move.promotion } : {}) });
      if (move.promotion !== undefined && played.promotion !== move.promotion) throw new Error('Invalid saved promotion');
    }
    return game;
  } catch {
    return new Chess();
  }
}

export function capturedPieces(game) {
  const captured = { w: [], b: [] };
  for (const move of game.history({ verbose: true })) {
    if (move.captured) {
      captured[move.color].push({ type: move.captured, color: move.color === 'w' ? 'b' : 'w' });
    }
  }
  const order = { q: 0, r: 1, b: 2, n: 3, p: 4 };
  captured.w.sort((a, b) => order[a.type] - order[b.type]);
  captured.b.sort((a, b) => order[a.type] - order[b.type]);
  return captured;
}

export function gameStatus(game, playerColor, mode = 'computer') {
  if (game.isCheckmate()) {
    if (mode === 'local') return { title: 'Checkmate', detail: `${game.turn() === 'w' ? 'Black' : 'White'} wins the game. Well played!`, finished: true };
    return game.turn() === playerColor
      ? { title: 'Checkmate', detail: 'Milo wins this one.', finished: true }
      : { title: 'Checkmate', detail: 'You won the game. Well played!', finished: true };
  }
  if (game.isStalemate()) return { title: 'A draw', detail: 'The game ended in stalemate.', finished: true };
  if (game.isThreefoldRepetition()) return { title: 'A draw', detail: 'The position was repeated three times.', finished: true };
  if (game.isInsufficientMaterial()) return { title: 'A draw', detail: 'There is not enough material to checkmate.', finished: true };
  if (game.isDrawByFiftyMoves()) return { title: 'A draw', detail: 'The fifty-move rule applies.', finished: true };
  if (game.isDraw()) return { title: 'A draw', detail: 'The game has ended in a draw.', finished: true };
  if (mode === 'local') {
    const side = game.turn() === 'w' ? 'White' : 'Black';
    if (game.isCheck()) return { title: 'Check!', detail: `${side}’s king is in check.`, finished: false };
    return { title: `${side} to move`, detail: `Player ${game.turn() === 'w' ? '1' : '2'}, it’s your turn.`, finished: false };
  }
  const playerTurn = game.turn() === playerColor;
  if (game.isCheck()) {
    return { title: 'Check!', detail: playerTurn ? 'Your king is in check.' : 'Milo’s king is in check.', finished: false };
  }
  return playerTurn
    ? { title: 'Your turn', detail: 'Make your next move.', finished: false }
    : { title: 'Milo is thinking', detail: 'Considering the next move…', finished: false };
}

function positionValue(game, computerColor) {
  // Checkmate takes priority; all draws are worth zero, even at the search horizon.
  if (game.isCheck() && game.isCheckmate()) return game.turn() === computerColor ? -100000 : 100000;
  if (game.isDrawByFiftyMoves() || game.isThreefoldRepetition() || game.isInsufficientMaterial() || game.isStalemate()) return 0;

  let total = 0;
  const board = game.board();
  for (let row = 0; row < 8; row += 1) {
    for (let col = 0; col < 8; col += 1) {
      const piece = board[row][col];
      if (!piece) continue;
      const center = 7 - (Math.abs(3.5 - col) + Math.abs(3.5 - row));
      const advance = piece.color === 'w' ? 6 - row : row - 1;
      let bonus = 0;
      if (piece.type === 'p') bonus = advance * 7 + center * 3;
      if (piece.type === 'n') bonus = center * 10;
      if (piece.type === 'b') bonus = center * 5;
      if (piece.type === 'q') bonus = center * 2;
      const value = PIECE_VALUES[piece.type] + bonus;
      total += piece.color === computerColor ? value : -value;
    }
  }
  return total;
}

function movePriority(move) {
  // Search captures and promotions first for better alpha-beta pruning.
  return (move.captured ? PIECE_VALUES[move.captured] * 10 - PIECE_VALUES[move.piece] : 0)
    + (move.promotion ? PIECE_VALUES[move.promotion] : 0)
    + (move.san.includes('+') ? 30 : 0);
}

function orderedMoves(game) {
  return game.moves({ verbose: true }).sort((a, b) => movePriority(b) - movePriority(a));
}

function minimax(game, depth, alpha, beta, computerColor, budget) {
  if (budget.nodes <= 0) throw SEARCH_LIMIT;
  budget.nodes -= 1;
  if (depth === 0) return positionValue(game, computerColor);
  const moves = orderedMoves(game);
  if (moves.length === 0) {
    if (game.isCheck()) return game.turn() === computerColor ? -100000 - depth : 100000 + depth;
    return 0;
  }
  if (game.isInsufficientMaterial() || game.isDrawByFiftyMoves() || game.isThreefoldRepetition()) return 0;

  const maximizing = game.turn() === computerColor;
  let best = maximizing ? -Infinity : Infinity;
  for (const move of moves) {
    game.move(move);
    let score;
    try {
      score = minimax(game, depth - 1, alpha, beta, computerColor, budget);
    } finally {
      game.undo();
    }
    if (maximizing) {
      best = Math.max(best, score);
      alpha = Math.max(alpha, best);
    } else {
      best = Math.min(best, score);
      beta = Math.min(beta, best);
    }
    if (beta <= alpha) break;
  }
  return best;
}

/** Choose a legal move. The caller can run this in a worker to keep the UI responsive. */
export function chooseComputerMove(game, level = 'medium', random = Math.random, options = {}) {
  const moves = orderedMoves(game);
  if (!moves.length || game.isGameOver()) return null;
  const computerColor = game.turn();
  const depth = LEVELS[level]?.depth ?? LEVELS.medium.depth;
  const defaultLimit = level === 'hard' ? 12000 : 5000;
  const requestedLimit = Number.isSafeInteger(options?.maxNodes) && options.maxNodes > 0 ? options.maxNodes : defaultLimit;
  // Always complete the first iteration, even if a smaller testing budget is requested.
  const budget = { nodes: Math.max(moves.length, requestedLimit) };
  let scored = [];

  // Never compare a partially searched move against fully searched moves. If the
  // budget runs out, keep the most recent iteration that evaluated every move.
  for (let currentDepth = 1; currentDepth <= depth; currentDepth += 1) {
    const iteration = [];
    try {
      for (const move of moves) {
        game.move(move);
        let score;
        try {
          score = minimax(game, currentDepth - 1, -Infinity, Infinity, computerColor, budget);
        } finally {
          game.undo();
        }
        iteration.push({ move, score });
      }
    } catch (error) {
      if (error !== SEARCH_LIMIT) throw error;
      break;
    }
    scored = iteration;
  }

  scored.sort((a, b) => b.score - a.score);
  // Easy occasionally chooses another reasonable move, without ignoring a forced mate.
  const tolerance = level === 'easy' && scored[0].score < 90000 ? 45 : 8;
  const candidates = scored.filter(({ score }) => score >= scored[0].score - tolerance).slice(0, level === 'easy' ? 5 : 3);
  const selected = candidates[Math.min(candidates.length - 1, Math.floor(random() * candidates.length))].move;
  return { from: selected.from, to: selected.to, ...(selected.promotion ? { promotion: selected.promotion } : {}) };
}
