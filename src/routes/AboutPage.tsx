const pillars = [
  {
    title: 'Frontend architecture',
    body: 'React + Vite powers a fast static build with route-based navigation and a game-first component model.',
  },
  {
    title: 'Gameplay logic',
    body: 'The board state runs on top of chess.js so move legality and endgame states stay dependable.',
  },
  {
    title: 'Publication path',
    body: 'The repo is prepared for GitHub Pages so the same app can be pushed, built, and shared with a clean public link.',
  },
]

export function AboutPage() {
  return (
    <div className="page info-page">
      <section className="section-intro">
        <span className="eyebrow">About the project</span>
        <h1>A polished chess app designed to look good in the browser and on GitHub.</h1>
        <p>
          Royal Endgame is a static-first frontend build with production-ready routing, clear game state, and a
          visual system tuned around premium chess UI rather than starter-template aesthetics.
        </p>
      </section>

      <section className="content-grid">
        {pillars.map((pillar, index) => (
          <article className="feature-card" key={pillar.title}>
            <span className="feature-index">0{index + 1}</span>
            <h2>{pillar.title}</h2>
            <p>{pillar.body}</p>
          </article>
        ))}
      </section>

      <section className="split-callout">
        <div>
          <h2>What makes this build feel complete</h2>
          <p>
            The app is not just a single chess board dropped on a blank page. It includes onboarding pages,
            gameplay controls, route transitions, AI support, responsive structure, and a static deployment path.
          </p>
        </div>
        <div className="callout-panel">
          <div>
            <span>Release focus</span>
            <strong>Core polished</strong>
          </div>
          <div>
            <span>Delivery target</span>
            <strong>Existing GitHub repo with a published Pages link</strong>
          </div>
        </div>
      </section>
    </div>
  )
}
