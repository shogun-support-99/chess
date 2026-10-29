import { useEffect, useRef } from 'react';
import { BookOpen, ChevronRight, Sparkles, X } from 'lucide-react';
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

export function ConfirmNewGameDialog({ onClose, onConfirm }) {
  return (
    <Modal title="Start a new game?" eyebrow="A FRESH START" onClose={onClose} className="confirm-modal">
      <p className="modal__intro">Your saved game will be replaced. You can resume it instead if you’re not quite finished.</p>
      <div className="confirm-actions">
        <button className="confirm-cancel" type="button" onClick={onClose}>Keep my game</button>
        <button className="button button--primary" type="button" onClick={onConfirm}>Replace and play <ChevronRight size={17} /></button>
      </div>
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
