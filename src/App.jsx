import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Chess } from 'chess.js';
import {
  ArrowLeftRight, ArrowRight, BookOpen, CircleHelp, Clock3,
  CornerDownLeft, Grid2X2, Lightbulb, MousePointer2, Plus, RotateCcw, Sparkles,
  LogOut, UserRound, UsersRound, Volume2, VolumeX,
} from 'lucide-react';
import { capturedPieces, chooseComputerMove, copyGame, gameStatus, LEVELS, movesForStorage, PIECE_NAMES } from './chess.js';
import ChessBoard, { pieceImage } from './components/ChessBoard.jsx';
import { GuideDialog, PromotionDialog } from './components/Dialogs.jsx';
import AuthScreen from './components/AuthScreen.jsx';
import SetupScreen from './components/SetupScreen.jsx';
import { clearSession, restoreSession, saveSession } from './auth.js';
import { loadSavedGame, normalizeSettings, saveGame } from './gameStorage.js';

const CLUB_IMAGE = `${import.meta.env.BASE_URL}images/knight-club.webp`;

function Sidebar({ onNewGame, onFlip, onUndo, canUndo, onGuide }) {
  return (
    <aside className="sidebar" aria-label="Main navigation">
      <a className="brand" href="#game" aria-label="The Chess Club, go to game">
        <span className="brand__mark"><img src={pieceImage({ color: 'b', type: 'n' })} alt="" /></span>
        <span className="brand__wordmark">THE CHESS <strong>CLUB<span>.</span></strong></span>
      </a>
      <div className="sidebar__rule" />
      <nav className="sidebar__nav" aria-label="The chess club">
        <div className="sidebar__group">
          <span className="sidebar__label">THE CLUB</span>
          <a href="#game" className="nav-item nav-item--active" aria-current="page" aria-label="Play a game" title="Play a game">
            <Grid2X2 size={18} strokeWidth={1.8} /><span>Play a game</span><span className="nav-item__dot" />
          </a>
          <button type="button" className="nav-item" onClick={onGuide} aria-label="How to play" title="How to play">
            <BookOpen size={18} strokeWidth={1.8} /><span>How to play</span>
          </button>
        </div>
        <div className="sidebar__group sidebar__game-actions">
          <span className="sidebar__label">QUICK ACTIONS</span>
          <button type="button" className="nav-item" onClick={onNewGame} title="New game"><Plus size={18} strokeWidth={1.8} /><span>New game</span></button>
          <button type="button" className="nav-item" onClick={onFlip} title="Flip board"><ArrowLeftRight size={18} strokeWidth={1.8} /><span>Flip board</span></button>
          <button type="button" className="nav-item" onClick={onUndo} disabled={!canUndo} title="Take back your last move"><RotateCcw size={18} strokeWidth={1.8} /><span>Take back</span></button>
        </div>
      </nav>
      <div className="sidebar__bottom">
        <div className="club-card">
          <img src={CLUB_IMAGE} alt="" />
          <div className="club-card__content">
            <span>THE CHESS CLUB</span>
            <p>For the love<br /><em>of the game.</em></p>
          </div>
        </div>
        <p className="sidebar__footnote"><span /> A little time well played.</p>
      </div>
    </aside>
  );
}

function PlayerRow({ computer, color, level, mode, active, captured, finished }) {
  const local = mode === 'local';
  const name = local ? `Player ${color === 'w' ? '1' : '2'}` : (computer ? 'Milo' : 'You');
  const sub = computer && !local ? `${LEVELS[level].name} · Computer` : `${color === 'w' ? 'White' : 'Black'} pieces`;
  return (
    <div className={`player-row${active && !finished ? ' player-row--active' : ''}`}>
      <div className={`player-avatar${computer ? ' player-avatar--computer' : ' player-avatar--you'}`}>
        {computer ? <img src={CLUB_IMAGE} alt="" /> : <UserRound size={20} strokeWidth={1.8} />}
      </div>
      <div className="player-row__identity">
        <div className="player-row__name">{name} {computer && <span className="bot-badge">BOT</span>}</div>
        <div className="player-row__sub">{sub}</div>
      </div>
      {captured.length > 0 && (
        <div className="captured-pieces" aria-label={`${name} captured ${captured.map((piece) => `${piece.color === 'w' ? 'white' : 'black'} ${PIECE_NAMES[piece.type]}`).join(', ')}`}>
          {captured.map((piece, index) => <img key={`${piece.type}-${index}`} src={pieceImage(piece)} alt="" />)}
        </div>
      )}
      <div className="player-row__turn">
        {active && !finished ? <><span className="status-dot" /> {local ? 'TO MOVE' : (computer ? 'THINKING' : 'YOUR TURN')}</> : <span>{local ? (color === 'w' ? 'WHITE' : 'BLACK') : (computer ? 'YOUR OPPONENT' : 'PLAYER')}</span>}
      </div>
    </div>
  );
}

function GamePanel({ game, settings, status, onUndo, canUndo, onFlip, onGuide }) {
  const history = game.history();
  const local = settings.mode === 'local';
  const historyRef = useRef(null);
  const pairs = [];
  for (let i = 0; i < history.length; i += 2) pairs.push({ number: i / 2 + 1, white: history[i], black: history[i + 1] });
  useEffect(() => {
    if (historyRef.current) historyRef.current.scrollTop = historyRef.current.scrollHeight;
  }, [history.length]);

  return (
    <aside className="details-column" aria-label="Game details">
      <section className="details-card">
        <div className="details-card__top">
          <div><span className="eyebrow">AT A GLANCE</span><h2>Game details</h2></div>
          <span className={`live-badge${status.finished ? ' live-badge--finished' : ''}`}><span /> {status.finished ? 'FINISHED' : 'IN PROGRESS'}</span>
        </div>
        <div className="opponent-strip">
          <div className="opponent-strip__icon">{local ? <UsersRound size={22} aria-hidden="true" /> : <img src={CLUB_IMAGE} alt="" />}</div>
          <div><span className="opponent-strip__label">{local ? 'PLAYING TOGETHER' : 'PLAYING AGAINST'}</span><strong>{local ? 'Two players' : <>Milo <span>the bot</span></>}</strong></div>
          <span className="opponent-strip__level">{local ? 'LOCAL' : LEVELS[settings.level].name}</span>
        </div>
        <dl className="game-meta">
          <div><dt>{local ? 'WHITE PIECES' : 'YOUR PIECES'}</dt><dd>{local ? 'Player 1' : (settings.playerColor === 'w' ? 'White' : 'Black')}</dd></div>
          <div><dt>TIME CONTROL</dt><dd><Clock3 size={14} /> No clock</dd></div>
        </dl>
        <div className="history-heading"><div><span className="eyebrow">THE STORY SO FAR</span><h3>Move history</h3></div><span>{history.length} {history.length === 1 ? 'move' : 'moves'}</span></div>
        <div className={`history-box${history.length === 0 ? ' history-box--empty' : ''}`} ref={historyRef}>
          {history.length === 0 ? (
            <div className="history-empty">
              <span className="history-empty__icon"><CornerDownLeft size={19} strokeWidth={1.6} /></span>
              <strong>No moves just yet</strong>
              <p>Your opening move is waiting.</p>
            </div>
          ) : (
            <div className="move-list" aria-label="Move history">
              <div className="move-list__header"><span>#</span><span>WHITE</span><span>BLACK</span></div>
              {pairs.map((pair) => <div className="move-list__row" key={pair.number}><span>{String(pair.number).padStart(2, '0')}</span><strong>{pair.white}</strong><strong>{pair.black || '—'}</strong></div>)}
            </div>
          )}
        </div>
        <div className="game-actions">
          <button type="button" onClick={onUndo} disabled={!canUndo}><RotateCcw size={16} /> Take back</button>
          <button type="button" onClick={onFlip}><ArrowLeftRight size={16} /> Flip board</button>
        </div>
      </section>
      <section className="tip-card">
        <div className="tip-card__icon"><Lightbulb size={19} strokeWidth={1.7} /></div>
        <div className="tip-card__content">
          <span className="eyebrow">A LITTLE TIP</span>
          <h3>{history.length < 4 ? 'A good place to start.' : 'Take your time.'}</h3>
          <p>{history.length < 4 ? 'The center of the board is a lovely place to make your opening moves.' : 'Look at what your opponent is threatening before planning your next move.'}</p>
          <button type="button" onClick={onGuide}>Learn the basics <ArrowRight size={14} /></button>
        </div>
      </section>
      <p className="details-column__note"><Sparkles size={13} /> Made for the love of the game.</p>
    </aside>
  );
}

function GameRoom({ profile, entry, storage, onSetup, onSignOut }) {
  const [initial] = useState(() => {
    if (entry.saved) return entry.saved;
    const settings = normalizeSettings(entry.settings);
    return { game: new Chess(), settings, flipped: settings.playerColor === 'b', sound: entry.sound === true };
  });
  const [game, setGame] = useState(initial.game);
  const [settings] = useState(initial.settings);
  const [flipped, setFlipped] = useState(initial.flipped);
  const [sound, setSound] = useState(initial.sound);
  const [selected, setSelected] = useState(null);
  const [dialog, setDialog] = useState(null);
  const [promotion, setPromotion] = useState(null);
  const [storageAvailable, setStorageAvailable] = useState(true);
  const soundRef = useRef(sound);
  const audioRef = useRef(null);
  soundRef.current = sound;
  useEffect(() => () => {
    if (audioRef.current) audioRef.current.close().catch(() => {});
  }, []);

  const history = useMemo(() => game.history({ verbose: true }), [game]);
  const captured = useMemo(() => capturedPieces(game), [game]);
  const status = useMemo(() => gameStatus(game, settings.playerColor, settings.mode), [game, settings.playerColor, settings.mode]);
  const computerColor = settings.playerColor === 'w' ? 'b' : 'w';
  const local = settings.mode === 'local';
  const canPlay = !status.finished && (local || game.turn() === settings.playerColor);
  const canUndo = local ? history.length > 0 : history.some((move) => move.color === settings.playerColor);
  const legalMoves = useMemo(() => selected && canPlay ? game.moves({ square: selected, verbose: true }) : [], [game, selected, canPlay]);
  const lastMove = history.at(-1);

  const playMoveSound = useCallback((capture = false) => {
    if (!soundRef.current) return;
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      const context = audioRef.current || new AudioContext();
      audioRef.current = context;
      if (context.state === 'suspended') context.resume();
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(capture ? 390 : 520, context.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(capture ? 220 : 350, context.currentTime + 0.09);
      gain.gain.setValueAtTime(0.0001, context.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.075, context.currentTime + 0.008);
      gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.13);
      oscillator.connect(gain);
      gain.connect(context.destination);
      oscillator.start();
      oscillator.stop(context.currentTime + 0.14);
    } catch {
      // Sound is optional; the game remains playable when audio is unavailable.
    }
  }, []);

  useEffect(() => {
    setStorageAvailable(saveGame(storage, profile, game, settings, flipped, sound));
  }, [storage, profile, game, settings, flipped, sound]);

  useEffect(() => {
    if (local || game.turn() === settings.playerColor || game.isGameOver() || dialog || promotion) return undefined;
    let cancelled = false;
    let worker;
    function finish(move) {
      if (cancelled || !move) return;
      const next = copyGame(game);
      try {
        const played = next.move(move);
        if (!played) return;
        setSelected(null);
        setGame(next);
        playMoveSound(Boolean(played.captured));
      } catch {
        // A cancelled or invalid response is safely ignored.
      }
    }
    const timer = window.setTimeout(() => {
      try {
        worker = new Worker(new URL('./engine.worker.js', import.meta.url), { type: 'module' });
        worker.onmessage = (event) => finish(event.data.move);
        worker.onerror = () => {
          worker?.terminate();
          if (!cancelled) finish(chooseComputerMove(copyGame(game), settings.level));
        };
        worker.postMessage({ moves: movesForStorage(game), level: settings.level });
      } catch {
        finish(chooseComputerMove(copyGame(game), settings.level));
      }
    }, 400);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
      worker?.terminate();
    };
  }, [game, settings.playerColor, settings.level, local, dialog, promotion, playMoveSound]);

  function attemptMove(from, to, promotionPiece) {
    if (!canPlay) return;
    const candidates = game.moves({ square: from, verbose: true }).filter((move) => move.to === to);
    if (!candidates.length) {
      const piece = game.get(to);
      setSelected(piece?.color === game.turn() ? to : null);
      return;
    }
    if (!promotionPiece && candidates.some((move) => move.promotion)) {
      setPromotion({ from, to });
      return;
    }
    const next = copyGame(game);
    try {
      const played = next.move({ from, to, ...(promotionPiece ? { promotion: promotionPiece } : {}) });
      if (played) {
        setPromotion(null);
        setSelected(null);
        setGame(next);
        playMoveSound(Boolean(played.captured));
      }
    } catch {
      setSelected(null);
    }
  }

  function handleSquare(square) {
    if (!canPlay) return;
    if (selected === square) {
      setSelected(null);
      return;
    }
    if (selected && legalMoves.some((move) => move.to === square)) {
      attemptMove(selected, square);
      return;
    }
    const piece = game.get(square);
    setSelected(piece?.color === game.turn() ? square : null);
  }

  function undo() {
    if (!canUndo) return;
    const next = copyGame(game);
    if (local) next.undo();
    else {
      let undone;
      do { undone = next.undo(); } while (undone && undone.color !== settings.playerColor);
    }
    setSelected(null);
    setPromotion(null);
    setGame(next);
  }

  const flip = () => setFlipped((value) => !value);
  const openNewGame = () => onSetup();
  const openGuide = () => setDialog('guide');

  return (
    <div className="app-shell">
      <Sidebar onNewGame={openNewGame} onFlip={flip} onUndo={undo} canUndo={canUndo} onGuide={openGuide} />
      <main className="main-content" id="game">
        <header className="page-header">
          <div className="page-header__top">
            <div className="breadcrumbs"><span className="breadcrumbs__dot" /> THE PLAYING ROOM <span className="breadcrumbs__slash">/</span> <span>CASUAL GAME</span></div>
            <div className="header-actions">
              <button className="icon-button account-signout" type="button" aria-label="Sign out" title={`Sign out ${profile.displayName}`} onClick={onSignOut}><LogOut size={17} /></button>
              <button className="icon-button sound-button" type="button" aria-label={sound ? 'Mute game sounds' : 'Turn on game sounds'} aria-pressed={sound} title={sound ? 'Mute game sounds' : 'Turn on game sounds'} onClick={() => setSound((value) => !value)}>
                {sound ? <Volume2 size={18} /> : <VolumeX size={18} />}
              </button>
              <button className="button button--header" type="button" onClick={openNewGame}><Plus size={17} /> New game</button>
            </div>
          </div>
          <div className="page-heading">
            <div><span className="page-heading__kicker">A LITTLE TIME WELL PLAYED <span>✳</span></span><h1 tabIndex={-1}>Make your move<span>.</span></h1><p>Settle in, take your time, and enjoy the game.</p></div>
            <div className="heading-emblem" aria-hidden="true"><span>THE</span><strong>CHESS<br />CLUB</strong><span>✳ &nbsp; EST. TODAY</span></div>
          </div>
        </header>
        {!storageAvailable && <p className="storage-warning" role="alert">This browser isn’t allowing saves. You can play, but your game will be lost when you leave this screen.</p>}
        <div className="game-layout">
          <section className="game-area" aria-label="Your chess game">
            <div className="game-area__topline"><span>THE BOARD <span className="topline-slash">/</span> <strong>FRIENDLY GAME</strong></span><span><span className="tiny-dot" /> NO CLOCK, NO PRESSURE</span></div>
            <div className="board-wrap">
              <PlayerRow computer={!local && (flipped ? 'w' : 'b') === computerColor} color={flipped ? 'w' : 'b'} level={settings.level} mode={settings.mode} active={game.turn() === (flipped ? 'w' : 'b')} captured={captured[flipped ? 'w' : 'b']} finished={status.finished} />
              <ChessBoard game={game} selected={selected} legalMoves={legalMoves} lastMove={lastMove} flipped={flipped} playerColor={settings.playerColor} movableColor={local ? game.turn() : settings.playerColor} interactive={canPlay} onSquare={handleSquare} onAttemptMove={attemptMove} onSelect={setSelected} />
              <PlayerRow computer={!local && (flipped ? 'b' : 'w') === computerColor} color={flipped ? 'b' : 'w'} level={settings.level} mode={settings.mode} active={game.turn() === (flipped ? 'b' : 'w')} captured={captured[flipped ? 'b' : 'w']} finished={status.finished} />
              <div className="board-caption" id="board-instructions"><span><MousePointer2 size={14} /> Select a piece to see where it can move</span><button type="button" onClick={openGuide}><CircleHelp size={15} /> Need a hand?</button></div>
            </div>
            <div className={`game-status${status.finished || game.isCheck() ? ' game-status--notice' : ''}`} role="status" aria-live="polite"><span className="status-dot" /><strong>{status.title}</strong><span>{status.detail}</span></div>
          </section>
          <GamePanel game={game} settings={settings} status={status} onUndo={undo} canUndo={canUndo} onFlip={flip} onGuide={openGuide} />
        </div>
        <footer className="mobile-footer">THE CHESS CLUB <span>✳</span> A LITTLE TIME WELL PLAYED</footer>
      </main>
      {dialog === 'guide' && <GuideDialog onClose={() => setDialog(null)} />}
      {promotion && <PromotionDialog color={game.turn()} onClose={() => setPromotion(null)} onChoose={(piece) => attemptMove(promotion.from, promotion.to, piece)} />}
    </div>
  );
}


// Web storage is optional (for example, it may be blocked in private mode).
// Keeping a stable object lets guest play work even if a browser denies access.
const unavailableStorage = {
  getItem() { throw new Error('Storage unavailable'); },
  setItem() { throw new Error('Storage unavailable'); },
  removeItem() { throw new Error('Storage unavailable'); },
};
function browserStorage(name) {
  try { return window[name] || unavailableStorage; } catch { return unavailableStorage; }
}

export default function App() {
  const [storage] = useState(() => browserStorage('localStorage'));
  const [sessionStorage] = useState(() => browserStorage('sessionStorage'));
  const [initialProfile] = useState(() => restoreSession(storage, sessionStorage));
  const [profile, setProfile] = useState(initialProfile);
  const [screen, setScreen] = useState(initialProfile ? 'setup' : 'login');
  const [savedGame, setSavedGame] = useState(() => initialProfile ? loadSavedGame(storage, initialProfile) : null);
  const [entry, setEntry] = useState(null);
  const profileRef = useRef(profile);
  profileRef.current = profile;

  // Give the browser back/forward buttons meaningful setup and board states.
  useEffect(() => {
    window.history.replaceState({ ...window.history.state, chessScreen: initialProfile ? 'setup' : 'login' }, '');
    function onPopState(event) {
      const target = event.state?.chessScreen;
      if (!['login', 'setup', 'game'].includes(target)) return;
      const currentProfile = profileRef.current;
      if (!currentProfile) {
        setEntry(null);
        setSavedGame(null);
        setScreen('login');
        return;
      }
      const saved = loadSavedGame(storage, currentProfile);
      if (target === 'game' && saved) {
        setEntry({ saved });
        setScreen('game');
      } else {
        setSavedGame(saved);
        setEntry(null);
        setScreen('setup');
      }
    }
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, [initialProfile, storage]);

  useEffect(() => {
    document.title = `${screen === 'login' ? 'Sign in' : screen === 'setup' ? 'Game setup' : 'Playing room'} — The Chess Club`;
    window.scrollTo({ top: 0, behavior: 'instant' });
    document.querySelector('main h1')?.focus({ preventScroll: true });
  }, [screen]);

  function authenticate(nextProfile) {
    saveSession(sessionStorage, nextProfile);
    setProfile(nextProfile);
    setSavedGame(loadSavedGame(storage, nextProfile));
    window.history.replaceState({ ...window.history.state, chessScreen: 'setup' }, '');
    setScreen('setup');
  }
  function signOut() {
    clearSession(sessionStorage);
    setEntry(null);
    setProfile(null);
    setSavedGame(null);
    window.history.replaceState({ ...window.history.state, chessScreen: 'login' }, '');
    setScreen('login');
  }
  function goToSetup() {
    setSavedGame(loadSavedGame(storage, profile));
    setEntry(null);
    window.history.pushState({ ...window.history.state, chessScreen: 'setup' }, '');
    setScreen('setup');
  }
  function startGame(settings) {
    setEntry({ settings, sound: savedGame?.sound });
    window.history.pushState({ ...window.history.state, chessScreen: 'game' }, '');
    setScreen('game');
  }
  function resumeGame() {
    if (!savedGame) return;
    setEntry({ saved: savedGame });
    window.history.pushState({ ...window.history.state, chessScreen: 'game' }, '');
    setScreen('game');
  }

  if (!profile || screen === 'login') return <AuthScreen storage={storage} onAuthenticated={authenticate} />;
  if (screen === 'setup') return <SetupScreen profile={profile} savedGame={savedGame} onStart={startGame} onResume={resumeGame} onSignOut={signOut} />;
  return <GameRoom profile={profile} entry={entry} storage={storage} onSetup={goToSetup} onSignOut={signOut} />;
}
