import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'

const previewBoard = [
  ['br', '', '', '', 'bk', '', '', 'br'],
  ['', '', '', 'bp', '', 'bp', '', ''],
  ['', 'bn', '', '', '', '', '', ''],
  ['', '', '', 'wq', '', '', '', ''],
  ['', '', '', '', 'wp', '', '', ''],
  ['', '', 'wn', '', '', '', '', ''],
  ['wp', 'wp', '', '', '', 'wp', 'wp', 'wp'],
  ['wr', '', '', '', 'wk', '', '', 'wr'],
]

const pieceGlyph: Record<string, string> = {
  wk: '♔',
  wq: '♕',
  wr: '♖',
  wn: '♘',
  wp: '♙',
  bk: '♚',
  br: '♜',
  bn: '♞',
  bp: '♟',
}

const features = [
  {
    title: 'Proper rules',
    body: 'Legal moves, promotion, castling, en passant, checks, mates, and draw detection are all handled through a real chess engine.',
  },
  {
    title: 'PvP and AI',
    body: 'Jump between local two-player matches and engine-backed sessions without leaving the core play surface.',
  },
  {
    title: 'Animated UX',
    body: 'Page transitions, live board highlights, move feedback, and result modals keep the app feeling responsive and intentional.',
  },
]

export function HomePage() {
  return (
    <div className="page home-page">
      <section className="hero-section">
        <div className="hero-copy">
          <span className="eyebrow">Modern chess, shipped cleanly</span>
          <h1>Play polished chess across a real multi-page experience.</h1>
          <p className="hero-text">
            Royal Endgame pairs dependable move logic with a cinematic board, quick-start local matches,
            AI battles, and a product-quality site that feels built to be published.
          </p>
          <div className="hero-actions">
            <Link className="button button-primary" to="/play">
              Play Now
            </Link>
            <Link className="button button-secondary" to="/how-to-play">
              Learn The Rules
            </Link>
          </div>
          <div className="hero-stats">
            <div>
              <strong>2</strong>
              <span>launch modes</span>
            </div>
            <div>
              <strong>4</strong>
              <span>production pages</span>
            </div>
            <div>
              <strong>100%</strong>
              <span>client-side deployable</span>
            </div>
          </div>
        </div>

        <motion.div
          className="hero-board-card"
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.45, ease: 'easeOut' }}
        >
          <div className="hero-board-header">
            <span>Featured line</span>
            <strong>Queen takes initiative</strong>
          </div>
          <div className="mini-board" aria-label="Decorative chess position preview">
            {previewBoard.flatMap((row, rowIndex) =>
              row.map((piece, columnIndex) => {
                const isDark = (rowIndex + columnIndex) % 2 === 1
                return (
                  <div
                    key={`${rowIndex}-${columnIndex}`}
                    className={isDark ? 'mini-square dark' : 'mini-square light'}
                  >
                    {piece ? <span>{pieceGlyph[piece]}</span> : null}
                  </div>
                )
              }),
            )}
          </div>
          <div className="hero-board-footer">
            <p>Local PvP, AI pressure, responsive board design, and route-driven presentation.</p>
          </div>
        </motion.div>
      </section>

      <section className="content-grid">
        {features.map((feature, index) => (
          <motion.article
            key={feature.title}
            className="feature-card"
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ delay: index * 0.08, duration: 0.32 }}
          >
            <span className="feature-index">0{index + 1}</span>
            <h2>{feature.title}</h2>
            <p>{feature.body}</p>
          </motion.article>
        ))}
      </section>

      <section className="split-callout">
        <div>
          <h2>Built to feel complete on day one</h2>
          <p>
            The play surface handles tactical gameplay, while the surrounding routes give the project a real
            public-facing home for GitHub Pages publishing.
          </p>
        </div>
        <div className="callout-panel">
          <div>
            <span>What ships first</span>
            <strong>Home, Play, How To Play, About</strong>
          </div>
          <div>
            <span>Core gameplay</span>
            <strong>Rules engine, clocks, history, AI, rematch flow</strong>
          </div>
        </div>
      </section>
    </div>
  )
}
