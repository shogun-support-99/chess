import { AnimatePresence, motion } from 'framer-motion'
import { NavLink, Outlet, useLocation } from 'react-router-dom'

const links = [
  { to: '/', label: 'Home' },
  { to: '/play', label: 'Play' },
  { to: '/how-to-play', label: 'How To Play' },
  { to: '/about', label: 'About' },
]

export function AppLayout() {
  const location = useLocation()

  return (
    <div className="app-shell">
      <header className="site-header">
        <NavLink className="brand" to="/">
          <span className="brand-mark" aria-hidden="true">
            ♞
          </span>
          <span>
            <strong>Royal Endgame</strong>
            <small>Multi-page chess for PvP and AI play</small>
          </span>
        </NavLink>

        <nav className="site-nav" aria-label="Primary">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
              end={link.to === '/'}
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <NavLink className="button button-primary header-cta" to="/play">
          Start Match
        </NavLink>
      </header>

      <AnimatePresence mode="wait">
        <motion.main
          key={location.pathname}
          className="page-shell"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -18 }}
          transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
        >
          <Outlet />
        </motion.main>
      </AnimatePresence>

      <footer className="site-footer">
        <div>
          <p>Built for quick casual matches, stronger AI sessions, and a premium GitHub Pages handoff.</p>
        </div>
        <div className="footer-links">
          <NavLink to="/play">Play</NavLink>
          <NavLink to="/how-to-play">Rules</NavLink>
          <NavLink to="/about">Project</NavLink>
        </div>
      </footer>
    </div>
  )
}
