import { useState } from 'react';
import { ArrowRight, Eye, EyeOff, ShieldAlert, Sparkles } from 'lucide-react';
import { createAccount, signIn } from '../auth.js';
import ClubBrand from './ClubBrand.jsx';

const CLUB_IMAGE = `${import.meta.env.BASE_URL}images/knight-club.webp`;

export default function AuthScreen({ storage, onAuthenticated }) {
  const [registering, setRegistering] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(event) {
    event.preventDefault();
    if (busy) return;
    setError('');
    if (registering && password !== confirmation) {
      setError('The passwords don’t match. Please try again.');
      return;
    }
    setBusy(true);
    try {
      const profile = registering
        ? await createAccount(storage, username, password)
        : await signIn(storage, username, password);
      setPassword('');
      setConfirmation('');
      onAuthenticated(profile);
    } catch (problem) {
      setError(problem instanceof Error ? problem.message : 'Something went wrong. Please try again.');
    } finally {
      setBusy(false);
    }
  }

  function switchMode(next) {
    setRegistering(next);
    setError('');
    setPassword('');
    setConfirmation('');
    setShowPassword(false);
  }

  return (
    <div className="welcome-layout">
      <aside className="welcome-story" aria-label="Welcome to The Chess Club">
        <img className="welcome-story__image" src={CLUB_IMAGE} alt="" />
        <div className="welcome-story__shade" />
        <div className="welcome-story__content">
          <ClubBrand />
          <div className="welcome-story__message">
            <span className="welcome-story__kicker"><span /> A PLACE TO SLOW DOWN</span>
            <p className="welcome-story__headline">A little time,<br /><em>well played.</em></p>
            <p>Good games, thoughtful moves, and a little room to breathe. There’s always a seat for you here.</p>
          </div>
          <div className="welcome-story__footer"><span>THE CHESS CLUB</span><Sparkles size={14} /><span>OPEN FOR PLAY</span></div>
        </div>
      </aside>
      <main className="welcome-main">
        <div className="welcome-mobile-brand"><ClubBrand /></div>
        <div className="auth-card">
          <div className="auth-eyebrow"><span /> THE PLAYING ROOM <span className="auth-eyebrow__right">01 / 02</span></div>
          <h1 tabIndex={-1}>{registering ? 'Join the club' : 'Welcome back'}<span>.</span></h1>
          <p className="auth-intro">{registering ? 'Make a local profile and settle in for a game.' : 'Sign in and make yourself at home.'}</p>

          <div className="auth-switch" role="group" aria-label="Account action">
            <button type="button" className={!registering ? 'is-active' : ''} aria-pressed={!registering} disabled={busy} onClick={() => switchMode(false)}>Sign in</button>
            <button type="button" className={registering ? 'is-active' : ''} aria-pressed={registering} disabled={busy} onClick={() => switchMode(true)}>Create account</button>
          </div>

          <form className="auth-form" onSubmit={submit}>
            <div className="field">
              <label htmlFor="player-name">Player name</label>
              <input id="player-name" type="text" autoComplete="username" autoCapitalize="none" spellCheck="false" maxLength={24} value={username} onChange={(event) => setUsername(event.target.value)} placeholder="Your player name" required />
              {registering && <small>3–24 letters, numbers, _ or -; start with a letter or number.</small>}
            </div>
            <div className="field">
              <label htmlFor="player-password">Password</label>
              <div className="password-field">
                <input id="player-password" type={showPassword ? 'text' : 'password'} autoComplete={registering ? 'new-password' : 'current-password'} maxLength={128} value={password} onChange={(event) => setPassword(event.target.value)} placeholder={registering ? 'At least 8 characters' : 'Enter your password'} required />
                <button type="button" aria-label={showPassword ? 'Hide password' : 'Show password'} aria-pressed={showPassword} onClick={() => setShowPassword((value) => !value)}>{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button>
              </div>
            </div>
            {registering && (
              <div className="field">
                <label htmlFor="confirm-password">Confirm password</label>
                <input id="confirm-password" type={showPassword ? 'text' : 'password'} autoComplete="new-password" maxLength={128} value={confirmation} onChange={(event) => setConfirmation(event.target.value)} placeholder="Enter it once more" required />
              </div>
            )}
            {error && <p className="auth-error" role="alert">{error}</p>}
            <button className="button auth-submit" type="submit" disabled={busy}>
              {busy ? (registering ? 'Creating profile…' : 'Signing in…') : (registering ? 'Create local account' : 'Sign in')}
              <ArrowRight size={17} aria-hidden="true" />
            </button>
          </form>
          <div className="auth-divider"><span /> or <span /></div>
          <button className="auth-guest" type="button" disabled={busy} onClick={() => onAuthenticated({ kind: 'guest', id: 'guest', displayName: 'Guest' })}>Continue as a guest <ArrowRight size={16} /></button>
          <div className="auth-notice">
            <ShieldAlert size={17} aria-hidden="true" />
            <p><strong>Device-only profiles, not secure authentication.</strong> Anyone with access to this browser can change profiles and view saves. Use a unique password. Clearing browser data removes profiles and games.</p>
          </div>
        </div>
        <p className="welcome-main__footer">A LITTLE TIME WELL PLAYED <span>✳</span> THE CHESS CLUB</p>
      </main>
    </div>
  );
}
