import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Chess } from 'chess.js';
import {
  ArrowLeftRight, ArrowRight, BookOpen, CircleHelp, Clock3,
  CornerDownLeft, Grid2X2, Lightbulb, MousePointer2, Plus, RotateCcw, Sparkles,
  UserRound, Volume2, VolumeX,
} from 'lucide-react';
import { capturedPieces, chooseComputerMove, copyGame, gameFromMoves, gameStatus, LEVELS, movesForStorage, PIECE_NAMES } from './chess.js';
import ChessBoard, { pieceImage } from './components/ChessBoard.jsx';
import { GuideDialog, NewGameDialog, PromotionDialog } from './components/Dialogs.jsx';

const STORAGE_KEY = 'the-chess-club-game-v1';
const DEFAULT_SETTINGS = { playerColor: 'w', level: 'medium' };

function loadSavedGame() {
  try {
    const saved = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || 'null');
    if (!saved || typeof saved !== 'object') throw new Error('No saved game');
    const playerColor = saved.settings?.playerColor === 'b' ? 'b' : 'w';
    const level = Object.hasOwn(LEVELS, saved.settings?.level) ? saved.settings.level : 'medium';
    return {
      game: gameFromMoves(saved.moves),
      settings: { playerColor, level },
      flipped: typeof saved.flipped === 'boolean' ? saved.flipped : playerColor === 'b',
      sound: saved.sound === true,
    };
  } catch {
    return { game: new Chess(), settings: DEFAULT_SETTINGS, flipped: false, sound: false };
  }
}

function Sidebar({ onNewGame, onFlip, onUndo, canUndo, onGuide }) {
  return (
    <aside className="sidebar" aria-label="Main navigation">
      <a className="brand" href="#game" aria-label="The Chess Club, go to game">
        <span className="brand__mark"><img src="/pieces/bN.svg" alt="" /></span>
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
          <img src="/images/knight-club.webp" alt="" />
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

function PlayerRow({ computer, color, level, active, captured, finished }) {
  return (
    <div className={`player-row${active && !finished ? ' player-row--active' : ''}`}>
      <div className={`player-avatar${computer ? ' player-avatar--computer' : ' player-avatar--you'}`}>
        {computer ? <img src="/images/knight-club.webp" alt="" /> : <UserRound size={20} strokeWidth={1.8} />}
      </div>
      <div className="player-row__identity">
        <div className="player-row__name">{computer ? 'Milo' : 'You'} {computer && <span className="bot-badge">BOT</span>}</div>
        <div className="player-row__sub">{computer ? `${LEVELS[level].name} · Computer` : `${color === 'w' ? 'White' : 'Black'} pieces`}</div>
      </div>
      {captured.length > 0 && (
        <div className="captured-pieces" aria-label={`${computer ? 'Milo' : 'You'} captured ${captured.map((piece) => `${piece.color === 'w' ? 'white' : 'black'} ${PIECE_NAMES[piece.type]}`).join(', ')}`}>
          {captured.map((piece, index) => <img key={`${piece.type}-${index}`} src={pieceImage(piece)} alt="" />)}
        </div>
      )}
      <div className="player-row__turn">
        {active && !finished ? <><span className="status-dot" /> {computer ? 'THINKING' : 'YOUR TURN'}</> : <span>{computer ? 'YOUR OPPONENT' : 'PLAYER'}</span>}
      </div>
    </div>
  );
}

function GamePanel({ game, settings, status, onUndo, canUndo, onFlip, onGuide }) {
  const history = game.history();
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
          <div className="opponent-strip__icon"><img src="/images/knight-club.webp" alt="" /></div>
          <div><span className="opponent-strip__label">PLAYING AGAINST</span><strong>Milo <span>the bot</span></strong></div>
          <span className="opponent-strip__level">{LEVELS[settings.level].name}</span>
        </div>
        <dl className="game-meta">
          <div><dt>YOUR PIECES</dt><dd>{settings.playerColor === 'w' ? 'White' : 'Black'}</dd></div>
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

export default function App() {
  const [initial] = useState(loadSavedGame);
  const [game, setGame] = useState(initial.game);
  const [settings, setSettings] = useState(initial.settings);
  const [flipped, setFlipped] = useState(initial.flipped);
  const [sound, setSound] = useState(initial.sound);
  const [selected, setSelected] = useState(null);
  const [dialog, setDialog] = useState(null);
  const [promotion, setPromotion] = useState(null);
  const soundRef = useRef(sound);
  const audioRef = useRef(null);
  soundRef.current = sound;

  const history = useMemo(() => game.history({ verbose: true }), [game]);
  const captured = useMemo(() => capturedPieces(game), [game]);
  const status = useMemo(() => gameStatus(game, settings.playerColor), [game, settings.playerColor]);
  const computerColor = settings.playerColor === 'w' ? 'b' : 'w';
  const canPlay = !status.finished && game.turn() === settings.playerColor;
  const canUndo = history.some((move) => move.color === settings.playerColor);
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
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ moves: movesForStorage(game), settings, flipped, sound }));
    } catch {
      // Storage may be unavailable in private browsing.
    }
  }, [game, settings, flipped, sound]);

  useEffect(() => {
    if (game.turn() === settings.playerColor || game.isGameOver() || dialog || promotion) return undefined;
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
  }, [game, settings.playerColor, settings.level, dialog, promotion, playMoveSound]);

  function attemptMove(from, to, promotionPiece) {
    if (!canPlay) return;
    const candidates = game.moves({ square: from, verbose: true }).filter((move) => move.to === to);
    if (!candidates.length) {
      const piece = game.get(to);
      setSelected(piece?.color === settings.playerColor ? to : null);
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
    setSelected(piece?.color === settings.playerColor ? square : null);
  }

  function undo() {
    if (!canUndo) return;
    const next = copyGame(game);
    let undone;
    do { undone = next.undo(); } while (undone && undone.color !== settings.playerColor);
    setSelected(null);
    setPromotion(null);
    setGame(next);
  }

  function startNewGame(nextSettings) {
    setGame(new Chess());
    setSettings(nextSettings);
    setFlipped(nextSettings.playerColor === 'b');
    setSelected(null);
    setPromotion(null);
    setDialog(null);
  }

  const flip = () => setFlipped((value) => !value);
  const openNewGame = () => setDialog('new');
  const openGuide = () => setDialog('guide');

  return (
    <div className="app-shell">
      <Sidebar onNewGame={openNewGame} onFlip={flip} onUndo={undo} canUndo={canUndo} onGuide={openGuide} />
      <main className="main-content" id="game">
        <header className="page-header">
          <div className="page-header__top">
            <div className="breadcrumbs"><span className="breadcrumbs__dot" /> THE PLAYING ROOM <span className="breadcrumbs__slash">/</span> <span>CASUAL GAME</span></div>
            <div className="header-actions">
              <button className="icon-button sound-button" type="button" aria-label={sound ? 'Mute game sounds' : 'Turn on game sounds'} aria-pressed={sound} title={sound ? 'Mute game sounds' : 'Turn on game sounds'} onClick={() => setSound((value) => !value)}>
                {sound ? <Volume2 size={18} /> : <VolumeX size={18} />}
              </button>
              <button className="button button--header" type="button" onClick={openNewGame}><Plus size={17} /> New game</button>
            </div>
          </div>
          <div className="page-heading">
            <div><span className="page-heading__kicker">A LITTLE TIME WELL PLAYED <span>✳</span></span><h1>Make your move<span>.</span></h1><p>Settle in, take your time, and enjoy the game.</p></div>
            <div className="heading-emblem" aria-hidden="true"><span>THE</span><strong>CHESS<br />CLUB</strong><span>✳ &nbsp; EST. TODAY</span></div>
          </div>
        </header>
        <div className="game-layout">
          <section className="game-area" aria-label="Your chess game">
            <div className="game-area__topline"><span>THE BOARD <span className="topline-slash">/</span> <strong>FRIENDLY GAME</strong></span><span><span className="tiny-dot" /> NO CLOCK, NO PRESSURE</span></div>
            <div className="board-wrap">
              <PlayerRow computer={(flipped ? 'w' : 'b') === computerColor} color={flipped ? 'w' : 'b'} level={settings.level} active={game.turn() === (flipped ? 'w' : 'b')} captured={captured[flipped ? 'w' : 'b']} finished={status.finished} />
              <ChessBoard game={game} selected={selected} legalMoves={legalMoves} lastMove={lastMove} flipped={flipped} playerColor={settings.playerColor} interactive={canPlay} onSquare={handleSquare} onAttemptMove={attemptMove} onSelect={setSelected} />
              <PlayerRow computer={(flipped ? 'b' : 'w') === computerColor} color={flipped ? 'b' : 'w'} level={settings.level} active={game.turn() === (flipped ? 'b' : 'w')} captured={captured[flipped ? 'b' : 'w']} finished={status.finished} />
              <div className="board-caption" id="board-instructions"><span><MousePointer2 size={14} /> Select a piece to see where it can move</span><button type="button" onClick={openGuide}><CircleHelp size={15} /> Need a hand?</button></div>
            </div>
            <div className={`game-status${status.finished || game.isCheck() ? ' game-status--notice' : ''}`} role="status" aria-live="polite"><span className="status-dot" /><strong>{status.title}</strong><span>{status.detail}</span></div>
          </section>
          <GamePanel game={game} settings={settings} status={status} onUndo={undo} canUndo={canUndo} onFlip={flip} onGuide={openGuide} />
        </div>
        <footer className="mobile-footer">THE CHESS CLUB <span>✳</span> A LITTLE TIME WELL PLAYED</footer>
      </main>
      {dialog === 'new' && <NewGameDialog currentSettings={settings} hasMoves={history.length > 0} onClose={() => setDialog(null)} onStart={startNewGame} />}
      {dialog === 'guide' && <GuideDialog onClose={() => setDialog(null)} />}
      {promotion && <PromotionDialog color={settings.playerColor} onClose={() => setPromotion(null)} onChoose={(piece) => attemptMove(promotion.from, promotion.to, piece)} />}
    </div>
  );
}
