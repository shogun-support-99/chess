import { useState } from 'react';
import { ArrowRight, Check, Clock3, Laptop, LogOut, RotateCcw, Sparkles, UsersRound } from 'lucide-react';
import { LEVELS } from '../chess.js';
import { DEFAULT_SETTINGS } from '../gameStorage.js';
import { pieceImage } from './ChessBoard.jsx';
import ClubBrand from './ClubBrand.jsx';
import { ConfirmNewGameDialog } from './Dialogs.jsx';

const CLUB_IMAGE = `${import.meta.env.BASE_URL}images/knight-club.webp`;
const modes = [
  { value: 'computer', title: 'Play the computer', description: 'A game against Milo, our friendly bot.', Icon: Laptop },
  { value: 'local', title: 'Play with a friend', description: 'Two players, taking turns on this device.', Icon: UsersRound },
];

export default function SetupScreen({ profile, savedGame, onStart, onResume, onSignOut }) {
  const [settings, setSettings] = useState(savedGame?.settings || DEFAULT_SETTINGS);
  const [confirming, setConfirming] = useState(false);
  const isComputer = settings.mode === 'computer';
  const moveCount = savedGame?.game.history().length || 0;
  const setOption = (name, value) => setSettings((previous) => ({ ...previous, [name]: value }));

  function startGame() {
    if (savedGame && moveCount > 0) setConfirming(true);
    else onStart(settings);
  }

  return (
    <div className="setup-page">
      <header className="setup-header">
        <ClubBrand />
        <div className="setup-account">
          <span className="setup-account__greeting"><span className="status-dot" /> {profile.displayName}</span>
          <button type="button" className="setup-signout" onClick={onSignOut}><LogOut size={16} /> Sign out</button>
        </div>
      </header>
      <main className="setup-container">
        <div className="setup-heading">
          <div>
            <span className="setup-kicker"><span /> THE PLAYING ROOM <span className="setup-kicker__slash">/</span> GAME SETUP</span>
            <h1 tabIndex={-1}>Make it your game<span>.</span></h1>
            <p>Good to have you here, {profile.displayName}. Settle in and choose how you’d like to play.</p>
          </div>
          <span className="setup-step">02 <span>/</span> 02</span>
        </div>

        {savedGame && (
          <section className="resume-banner" aria-label="Saved game">
            <div className="resume-banner__icon"><RotateCcw size={18} /></div>
            <div className="resume-banner__copy"><strong>Pick up where you left off</strong><span>{savedGame.settings.mode === 'local' ? 'Two players' : `${LEVELS[savedGame.settings.level].name} computer`} · {moveCount} {moveCount === 1 ? 'move' : 'moves'} saved on this device</span></div>
            <button type="button" onClick={onResume}>Resume game <ArrowRight size={16} /></button>
          </section>
        )}

        <div className="setup-layout">
          <div className="setup-choices">
            <fieldset className="setup-fieldset">
              <legend><span className="setup-number">01</span> Choose your opponent</legend>
              <p className="setup-hint">A little friendly competition, your way.</p>
              <div className="opponent-options">
                {modes.map(({ value, title, description, Icon }) => (
                  <label key={value} className={`opponent-option${settings.mode === value ? ' is-selected' : ''}`}>
                    <input type="radio" name="mode" value={value} checked={settings.mode === value} onChange={() => setOption('mode', value)} />
                    <span className="opponent-option__icon"><Icon size={23} strokeWidth={1.6} /></span>
                    <span className="opponent-option__copy"><strong>{title}</strong><small>{description}</small></span>
                    <span className="selection-indicator" aria-hidden="true">{settings.mode === value && <Check size={12} strokeWidth={3} />}</span>
                  </label>
                ))}
              </div>
            </fieldset>

            {isComputer ? (
              <fieldset className="setup-fieldset">
                <legend><span className="setup-number">02</span> Choose your difficulty</legend>
                <p className="setup-hint">Find a comfortable challenge. You can always change it next game.</p>
                <div className="difficulty-options">
                  {Object.entries(LEVELS).map(([value, option], index) => (
                    <label key={value} className={`difficulty-option${settings.level === value ? ' is-selected' : ''}`}>
                      <input type="radio" name="difficulty" value={value} checked={settings.level === value} onChange={() => setOption('level', value)} />
                      <span className="difficulty-bars" aria-hidden="true">{[0, 1, 2].map((bar) => <span key={bar} className={bar <= index ? 'is-filled' : ''} />)}</span>
                      <strong>{option.name}</strong><small>{option.description}</small>
                      <span className="selection-indicator" aria-hidden="true">{settings.level === value && <Check size={12} strokeWidth={3} />}</span>
                    </label>
                  ))}
                </div>
              </fieldset>
            ) : (
              <div className="local-play-note"><UsersRound size={19} /><span><strong>Two players, one board.</strong> Sit together and take turns moving the white and black pieces. This is not online multiplayer.</span></div>
            )}

            <fieldset className="setup-fieldset setup-fieldset--side">
              <legend><span className="setup-number">{isComputer ? '03' : '02'}</span> {isComputer ? 'Choose your side' : 'Choose your view'}</legend>
              <p className="setup-hint">{isComputer ? 'White moves first. The choice is yours.' : 'Choose which side starts at the bottom; you can flip it anytime.'}</p>
              <div className="setup-side-options">
                {['w', 'b'].map((color) => (
                  <label key={color} className={`setup-side${settings.playerColor === color ? ' is-selected' : ''}`}>
                    <input type="radio" name="side" value={color} checked={settings.playerColor === color} onChange={() => setOption('playerColor', color)} />
                    <img src={pieceImage({ color, type: 'k' })} alt="" />
                    <span><strong>{color === 'w' ? 'White' : 'Black'}</strong><small>{isComputer ? (color === 'w' ? 'Move first' : 'Move second') : 'At the bottom'}</small></span>
                    <span className="selection-indicator" aria-hidden="true">{settings.playerColor === color && <Check size={12} strokeWidth={3} />}</span>
                  </label>
                ))}
              </div>
            </fieldset>
            <button className="button setup-start" type="button" onClick={startGame}>{savedGame ? 'Start a new game' : 'Start playing'} <ArrowRight size={18} /></button>
            <p className="setup-start-note"><Clock3 size={14} /> No clock, no pressure. Just a good game.</p>
          </div>

          <aside className="match-card" aria-label="Your match summary">
            <div className="match-card__art">
              <img src={CLUB_IMAGE} alt="" />
              <div className="match-card__art-copy"><span>YOUR TABLE IS READY</span><p>A good game<br /><em>starts here.</em></p></div>
            </div>
            <div className="match-card__body">
              <div className="match-card__title"><span className="eyebrow">THE MATCH</span><Sparkles size={16} /></div>
              <h2>Your game, your pace<span>.</span></h2>
              <p>A little time set aside for the best kind of thinking.</p>
              <dl className="match-details">
                <div><dt>OPPONENT</dt><dd>{isComputer ? 'Milo the bot' : 'A friend, locally'}</dd></div>
                <div><dt>{isComputer ? 'DIFFICULTY' : 'PLAY STYLE'}</dt><dd>{isComputer ? LEVELS[settings.level].name : 'Pass & play'}</dd></div>
                <div><dt>{isComputer ? 'YOUR SIDE' : 'BOARD VIEW'}</dt><dd>{settings.playerColor === 'w' ? 'White' : 'Black'}{!isComputer && ' at bottom'}</dd></div>
              </dl>
              <div className="match-card__footer"><span /> WHITE ALWAYS MOVES FIRST</div>
            </div>
          </aside>
        </div>
        <footer className="setup-footer">THE CHESS CLUB <span>✳</span> A LITTLE TIME WELL PLAYED</footer>
      </main>
      {confirming && <ConfirmNewGameDialog onClose={() => setConfirming(false)} onConfirm={() => onStart(settings)} />}
    </div>
  );
}
