import { pieceImage } from './ChessBoard.jsx';

export default function ClubBrand() {
  return (
    <div className="brand welcome-brand" aria-label="The Chess Club">
      <span className="brand__mark"><img src={pieceImage({ color: 'b', type: 'n' })} alt="" /></span>
      <span className="brand__wordmark">THE CHESS <strong>CLUB<span>.</span></strong></span>
    </div>
  );
}
