import { useEffect, useRef, useState } from 'react';
import { BookOpen, Check, ChevronRight, Sparkles, X } from 'lucide-react';
import { LEVELS } from '../chess.js';
import { pieceImage } from './ChessBoard.jsx';

function Modal({ title, eyebrow, onClose, children, className = '' }) {
  const dialogRef = useRef(null);
  const titleId = `${className || 'dialog'}-title`;
  useEffect(() => {
    const dialog = dialogRef.current;
    dialog.showModal();
    return () => { if (dialog.open) dialog.close(); };
  }, []);
  return (
    <dialog ref={dialogRef} className={`modal ${className}`} aria-labelledby={titleId} onCancel={(event) => { event.preventDefault(); onClose(); }}>
      <div className="modal__header">
        <div>
          <span className="eyebrow">{eyebrow}</span>
          <h2 id={titleId}>{title}</h2>
        </div>
        <button className="icon-button modal__close" type="button" aria-label="Close dialog" onClick={onClose}><X size={19} /></button>
      </div>
      {children}
    </dialog>
  );
}

export function NewGameDialog({ currentSettings, hasMoves, onClose, onStart }) {
  const [color, setColor] = useState(currentSettings.playerColor);
  const [level, setLevel] = useState(currentSettings.level);
  return (
    <Modal title="Set up your game" eyebrow="A FRESH START" onClose={onClose} className="new-game-modal">
      <p className="modal__intro">Make yourself comfortable. How would you like to play?</p>
      {hasMoves && <p className="modal__notice">Starting a new game will replace your current one.</p>}
      <fieldset className="option-group">
        <legend>Choose your side</legend>
        <div className="side-options">
          {[
            { value: 'w', name: 'White', detail: 'Move first' },
            { value: 'b', name: 'Black', detail: 'Move second' },
          ].map((option) => (
            <label className={`side-option${color === option.value ? ' is-checked' : ''}`} key={option.value}>
              <input type="radio" name="color" value={option.value} checked={color === option.value} onChange={() => setColor(option.value)} />
              <img src={pieceImage({ color: option.value, type: 'k' })} alt="" />
              <span><strong>{option.name}</strong><small>{option.detail}</small></span>
              {color === option.value && <Check size={16} className="option-check" />}
            </label>
          ))}
        </div>
      </fieldset>
      <fieldset className="option-group">
        <legend>Choose your level</legend>
        <div className="level-options">
          {Object.entries(LEVELS).map(([value, option]) => (
            <label className={`level-option${level === value ? ' is-checked' : ''}`} key={value}>
              <input type="radio" name="level" value={value} checked={level === value} onChange={() => setLevel(value)} />
              <span><strong>{option.name}</strong><small>{option.description}</small></span>
              {level === value && <Check size={16} className="option-check" />}
            </label>
          ))}
        </div>
      </fieldset>
      <button className="button button--primary modal__submit" type="button" onClick={() => onStart({ playerColor: color, level })}>
        Start playing <ChevronRight size={17} />
      </button>
    </Modal>
  );
}

const guidePieces = [
  ['p', 'Pawn', 'Moves forward one square, but captures diagonally. On its first move it may move two squares.'],
  ['n', 'Knight', 'Moves in an L-shape: two squares one way, then one to the side. It can jump over pieces.'],
  ['b', 'Bishop', 'Moves any number of open squares diagonally.'],
  ['r', 'Rook', 'Moves any number of open squares horizontally or vertically.'],
  ['q', 'Queen', 'Moves any number of open squares in any direction.'],
  ['k', 'King', 'Moves one square in any direction. Keep your king safe from check.'],
];

export function GuideDialog({ onClose }) {
  return (
    <Modal title="The basics of chess" eyebrow="A LITTLE HELP" onClose={onClose} className="guide-modal">
      <p className="modal__intro">The goal is to checkmate your opponent’s king: put it under attack with no safe move left.</p>
      <div className="guide-tip"><Sparkles size={18} /><span>Select a piece to see where it can go. You can also drag pieces or use your keyboard.</span></div>
      <div className="piece-guide">
        {guidePieces.map(([piece, name, description]) => (
          <div className="piece-guide__item" key={piece}>
            <span className="piece-guide__icon"><img src={pieceImage({ color: 'w', type: piece })} alt="" /></span>
            <span><strong>{name}</strong><small>{description}</small></span>
          </div>
        ))}
      </div>
      <p className="guide-footer"><BookOpen size={16} /> Castling, en passant, promotion, and draws are all supported.</p>
      <button className="button button--primary modal__submit" type="button" onClick={onClose}>Back to the board <ChevronRight size={17} /></button>
    </Modal>
  );
}

export function PromotionDialog({ color, onChoose, onClose }) {
  return (
    <Modal title="Choose a piece" eyebrow="PAWN PROMOTION" onClose={onClose} className="promotion-modal">
      <p className="modal__intro">Your pawn made it to the other side. What would you like it to become?</p>
      <div className="promotion-options">
        {['q', 'r', 'b', 'n'].map((piece) => {
          const name = { q: 'Queen', r: 'Rook', b: 'Bishop', n: 'Knight' }[piece];
          return <button type="button" key={piece} onClick={() => onChoose(piece)}><img src={pieceImage({ color, type: piece })} alt="" /><span>{name}</span></button>;
        })}
      </div>
    </Modal>
  );
}
