import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'

const ruleCards = [
  { piece: '♔', title: 'King', body: 'Moves one square in any direction. Protecting the king is the entire point of the game.' },
  { piece: '♕', title: 'Queen', body: 'Combines rook and bishop movement, making it the most flexible attacker.' },
  { piece: '♖', title: 'Rook', body: 'Moves along files and ranks. Also partners with the king during castling.' },
  { piece: '♗', title: 'Bishop', body: 'Slides diagonally and thrives on open lanes and long pressure.' },
  { piece: '♘', title: 'Knight', body: 'Jumps in an L shape and can leap over crowded positions.' },
  { piece: '♙', title: 'Pawn', body: 'Moves forward, captures diagonally, promotes on the last rank, and enables en passant.' },
]

const specialRules = [
  'Castling is allowed when neither the king nor rook has moved and the path is clear and safe.',
  'En passant is available immediately after an opposing pawn advances two squares beside your pawn.',
  'Promotion appears when a pawn reaches the final rank, letting you choose a stronger piece.',
  'Check, checkmate, stalemate, insufficient material, and draw states are surfaced in the play UI.',
]

export function HowToPlayPage() {
  return (
    <div className="page info-page">
      <section className="section-intro">
        <span className="eyebrow">How to play</span>
        <h1>Learn the essentials, then head straight into the board.</h1>
        <p>
          The game route uses the same chess rules you would expect from a real engine, so every legal move
          and special case shown here matches actual gameplay.
        </p>
      </section>

      <section className="piece-grid">
        {ruleCards.map((card, index) => (
          <motion.article
            key={card.title}
            className="piece-card"
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ delay: index * 0.05, duration: 0.25 }}
          >
            <span className="piece-glyph" aria-hidden="true">
              {card.piece}
            </span>
            <h2>{card.title}</h2>
            <p>{card.body}</p>
          </motion.article>
        ))}
      </section>

      <section className="rule-panel">
        <div>
          <h2>Special move handling</h2>
          <ul className="rule-list">
            {specialRules.map((rule) => (
              <li key={rule}>{rule}</li>
            ))}
          </ul>
        </div>
        <div className="callout-panel">
          <span>Quick start</span>
          <strong>Pick local mode for friendly passes or switch to AI for solo play.</strong>
          <p>The play page exposes difficulty control, clocks, move history, and rematch actions.</p>
          <Link className="button button-primary" to="/play">
            Open The Board
          </Link>
        </div>
      </section>
    </div>
  )
}
