import { useEffect, useRef, useState } from 'react';
import { PIECE_NAMES } from '../chess.js';

const FILES = 'abcdefgh';

export function pieceImage(piece) {
  return `${import.meta.env.BASE_URL}pieces/${piece.color}${piece.type.toUpperCase()}.svg`;
}

export default function ChessBoard({ game, selected, legalMoves, lastMove, flipped, playerColor, movableColor = playerColor, interactive, onSquare, onAttemptMove, onSelect }) {
  const refs = useRef({});
  const [focusedSquare, setFocusedSquare] = useState(playerColor === 'w' ? 'e2' : 'e7');
  useEffect(() => setFocusedSquare(playerColor === 'w' ? 'e2' : 'e7'), [playerColor]);
  const files = flipped ? [...FILES].reverse() : [...FILES];
  const ranks = flipped ? [1, 2, 3, 4, 5, 6, 7, 8] : [8, 7, 6, 5, 4, 3, 2, 1];
  const legalSquares = new Set(legalMoves.map((move) => move.to));
  const checkingKing = game.isCheck() ? game.board().flat().find((piece) => piece?.type === 'k' && piece.color === game.turn())?.square : null;

  function handleKeyDown(event, square) {
    const row = ranks.indexOf(Number(square[1]));
    const column = files.indexOf(square[0]);
    let nextRow = row;
    let nextColumn = column;
    if (event.key === 'ArrowUp') nextRow = Math.max(0, row - 1);
    else if (event.key === 'ArrowDown') nextRow = Math.min(7, row + 1);
    else if (event.key === 'ArrowLeft') nextColumn = Math.max(0, column - 1);
    else if (event.key === 'ArrowRight') nextColumn = Math.min(7, column + 1);
    else if (event.key === 'Home') nextColumn = 0;
    else if (event.key === 'End') nextColumn = 7;
    else return;
    event.preventDefault();
    const nextSquare = `${files[nextColumn]}${ranks[nextRow]}`;
    setFocusedSquare(nextSquare);
    refs.current[nextSquare]?.focus();
  }

  return (
    <div className="board-frame">
      <div className="chessboard" role="grid" aria-label="Chessboard. Use arrow keys to navigate, and Enter or Space to select and move a piece." aria-describedby="board-instructions">
        {ranks.map((rank, rowIndex) => (
          <div className="board-row" role="row" key={rank}>
            {files.map((file, columnIndex) => {
              const square = `${file}${rank}`;
              const piece = game.get(square);
              const dark = (FILES.indexOf(file) + rank) % 2 === 1;
              const isLegal = legalSquares.has(square);
              const isSelected = selected === square;
              const isLastMove = lastMove && (lastMove.from === square || lastMove.to === square);
              const isChecked = checkingKing === square;
              const canDrag = Boolean(interactive && piece?.color === movableColor);
              const visibleCoordinates = [columnIndex === 0 ? rank : '', rowIndex === 7 ? file : ''].filter(Boolean).join('');
              const description = [
                square,
                visibleCoordinates,
                piece ? `${piece.color === 'w' ? 'white' : 'black'} ${PIECE_NAMES[piece.type]}` : 'empty',
                isSelected ? 'selected' : '',
                isLegal ? 'legal move' : '',
                isChecked ? 'in check' : '',
              ].filter(Boolean).join(', ');
              return (
                <button
                  key={square}
                  ref={(element) => { refs.current[square] = element; }}
                  className={`square ${dark ? 'square--dark' : 'square--light'}${isSelected ? ' square--selected' : ''}${isLastMove ? ' square--last' : ''}${isChecked ? ' square--check' : ''}`}
                  type="button"
                  role="gridcell"
                  aria-label={description}
                  aria-selected={isSelected}
                  tabIndex={focusedSquare === square ? 0 : -1}
                  onFocus={() => setFocusedSquare(square)}
                  onKeyDown={(event) => handleKeyDown(event, square)}
                  onClick={() => onSquare(square)}
                  draggable={canDrag}
                  onDragStart={(event) => {
                    if (!canDrag) return;
                    event.dataTransfer.effectAllowed = 'move';
                    event.dataTransfer.setData('text/plain', square);
                    onSelect(square);
                  }}
                  onDragOver={(event) => { if (interactive) event.preventDefault(); }}
                  onDrop={(event) => {
                    event.preventDefault();
                    const from = event.dataTransfer.getData('text/plain');
                    if (from && from !== square) onAttemptMove(from, square);
                  }}
                >
                  {columnIndex === 0 && <span className="coordinate coordinate--rank" aria-hidden="true">{rank}</span>}
                  {rowIndex === 7 && <span className="coordinate coordinate--file" aria-hidden="true">{file}</span>}
                  {isLegal && <span className={`legal-marker${piece ? ' legal-marker--capture' : ''}`} aria-hidden="true" />}
                  {piece && <img className="chess-piece" src={pieceImage(piece)} alt="" draggable="false" />}
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
