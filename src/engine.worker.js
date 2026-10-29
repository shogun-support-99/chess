import { chooseComputerMove, gameFromMoves } from './chess.js';

self.onmessage = ({ data }) => {
  const game = gameFromMoves(data.moves);
  const move = chooseComputerMove(game, data.level);
  self.postMessage({ move });
};
