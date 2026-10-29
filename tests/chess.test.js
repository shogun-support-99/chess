import test from 'node:test';
import assert from 'node:assert/strict';
import { Chess } from 'chess.js';
import { capturedPieces, chooseComputerMove, copyGame, gameFromMoves, gameStatus, movesForStorage } from '../src/chess.js';

test('a save can be restored with its move history', () => {
  const game = new Chess();
  for (const move of ['e4', 'd5', 'exd5', 'Qxd5']) game.move(move);
  const restored = gameFromMoves(movesForStorage(game));
  assert.equal(restored.fen(), game.fen());
  assert.deepEqual(restored.history(), game.history());
  assert.deepEqual(capturedPieces(restored), {
    w: [{ type: 'p', color: 'b' }],
    b: [{ type: 'p', color: 'w' }],
  });
  assert.equal(copyGame(game).fen(), game.fen());
});

test('a bad saved game resets safely', () => {
  assert.equal(gameFromMoves([{ from: 'e2', to: 'e5' }]).fen(), new Chess().fen());
});

test('computer chooses a legal move without mutating the game', () => {
  const game = new Chess();
  game.move('e4');
  const before = game.fen();
  for (const level of ['easy', 'medium', 'hard']) {
    const move = chooseComputerMove(game, level, () => 0);
    assert.ok(game.moves({ verbose: true }).some((candidate) => candidate.from === move.from && candidate.to === move.to));
    assert.equal(game.fen(), before);
  }
});

test('computer takes a mate in one', () => {
  const game = new Chess();
  for (const move of ['f3', 'e5', 'g4']) game.move(move);
  const move = chooseComputerMove(game, 'easy', () => 0);
  game.move(move);
  assert.equal(game.isCheckmate(), true);
  assert.equal(gameStatus(game, 'w').title, 'Checkmate');
});

test('move history survives copying for repetition detection', () => {
  const game = new Chess();
  for (const move of ['Nf3', 'Nf6', 'Ng1', 'Ng8', 'Nf3', 'Nf6', 'Ng1', 'Ng8']) game.move(move);
  assert.equal(copyGame(game).isThreefoldRepetition(), true);
  assert.equal(gameStatus(copyGame(game), 'w').title, 'A draw');
});

test('special moves survive saving and copying', () => {
  const games = [
    ['e4', 'e5', 'Nf3', 'Nc6', 'Bc4', 'Nf6', 'O-O'],
    ['e4', 'a6', 'e5', 'd5', 'exd6'],
    ['a4', 'h5', 'a5', 'h4', 'a6', 'h3', 'axb7', 'hxg2', 'bxa8=N'],
  ];
  for (const moves of games) {
    const game = new Chess();
    for (const move of moves) game.move(move);
    assert.equal(gameFromMoves(movesForStorage(game)).fen(), game.fen());
    assert.equal(copyGame(game).fen(), game.fen());
    assert.deepEqual(copyGame(game).history(), game.history());
  }
});

test('the computer avoids stalemate when it has a winning alternative', () => {
  const game = new Chess('k7/8/2K5/8/3Q4/8/8/8 w - - 0 1');
  const move = chooseComputerMove(game, 'easy', () => 0);
  game.move(move);
  assert.equal(game.isStalemate(), false);
});

test('the computer recognizes a repetition draw while evaluating moves', () => {
  const game = new Chess();
  for (const move of ['Nf3', 'd5', 'e4', 'Nf6', 'exd5', 'Ng8', 'Ng1', 'Nf6', 'Nf3', 'Ng8', 'Ng1', 'Nf6']) game.move(move);
  assert.equal(game.isGameOver(), false);
  const before = game.fen();
  const move = chooseComputerMove(game, 'easy', () => 0.4);
  assert.equal(game.fen(), before);
  game.move('Nf3');
  assert.equal(game.isThreefoldRepetition(), true, 'search must preserve repetition counts');
  game.undo();
  game.move(move);
  assert.equal(game.isThreefoldRepetition(), false);
});

test('an interrupted deeper search falls back to a completed search without changing the game', () => {
  const game = new Chess();
  game.move('e4');
  const fen = game.fen();
  const history = game.history();
  const mediumMove = chooseComputerMove(game, 'medium', () => 0);
  const interruptedHardMove = chooseComputerMove(game, 'hard', () => 0, { maxNodes: 1000 });
  assert.deepEqual(interruptedHardMove, mediumMove);
  assert.equal(game.fen(), fen);
  assert.deepEqual(game.history(), history);
});

test('malformed saves cannot restore a null move or a phantom turn', () => {
  for (const moves of [[null], ['--'], [{ from: 'e2', to: 'e4' }, null], [{ from: 'e2', to: 'e4', promotion: 'king' }], [{ from: 'e2', to: 'e4', promotion: 'q' }]]) {
    const game = gameFromMoves(moves);
    assert.equal(game.fen(), new Chess().fen());
    assert.deepEqual(game.history(), []);
    assert.doesNotThrow(() => copyGame(game));
  }
});

test('saved games cannot continue after a drawn position', () => {
  const game = new Chess();
  for (const move of ['Nf3', 'Nf6', 'Ng1', 'Ng8', 'Nf3', 'Nf6', 'Ng1', 'Ng8']) game.move(move);
  assert.equal(game.isThreefoldRepetition(), true);
  const finishedMoves = movesForStorage(game);
  assert.equal(gameFromMoves(finishedMoves).isThreefoldRepetition(), true);
  game.move('e4'); // chess.js permits continuing, but this app ends on repetition.
  assert.equal(gameFromMoves(movesForStorage(game)).fen(), new Chess().fen());
});
