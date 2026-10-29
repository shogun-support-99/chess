<div align="center">
  <img src="public/pieces/bN.svg" width="68" alt="" />
  <h1>The Chess Club</h1>
  <p><strong>A little time well played.</strong></p>
  <p>A thoughtful game of chess, ready whenever you are.</p>
  <p>
    <a href="https://shogun-support-99.github.io/chess/"><strong>▶ Play chess in your browser</strong></a>
    &nbsp; · &nbsp;
    <a href="#getting-started">Run it locally</a>
    &nbsp; · &nbsp;
    <a href="#how-to-play">How to play</a>
  </p>
  <p>
    <a href="https://github.com/shogun-support-99/chess/actions/workflows/deploy.yml"><img src="https://github.com/shogun-support-99/chess/actions/workflows/deploy.yml/badge.svg" alt="GitHub Pages deployment status" /></a>
  </p>
</div>

<a href="https://shogun-support-99.github.io/chess/"><img src="docs/chess-club-preview.webp" alt="The Chess Club game board and move history" /></a>

## Your board, your pace

Sign in with a **device-only profile** or continue as a guest, then choose a relaxed game against **Milo**, the computer, or a pass-and-play game with a friend on the same device. There’s no download or clock—just the board and your next move.

**[Open the chess game →](https://shogun-support-99.github.io/chess/)**

| Made for a good game | Made for your screen |
| --- | --- |
| Easy, Medium, and Hard computer opponents | Responsive desktop and mobile layout |
| Local two-player pass-and-play | Click, tap, drag, or use the keyboard |
| Play as white or black; legal moves and special rules | Undo, flip the board, and review moves |
| Checkmate and draw detection | Separate locally saved games for each profile |

Milo is a lightweight local opponent, not a tournament-strength chess engine. Chess rules are powered by [chess.js](https://github.com/jhlywa/chess.js).

### About profiles and privacy

Profiles, password hashes, and saved games are kept **only in this browser**. Passwords are salted and hashed, but these profiles **are not secure authentication**: anyone with access to the browser can inspect or change its storage and view saved games. Do not reuse a password from another service. There is no server, cloud sync, or password recovery; clearing browser data removes the profiles and games. A signed-in session lasts in the current browser tab until you sign out or close it, and guest games share a guest save. A game saved by an older version of the app is available by choosing **Continue as a guest**.

Two-player mode means taking turns on **one device**; it is not online multiplayer.

## How to play

1. **Sign in or create a local profile**, or choose **Continue as a guest**. A local profile can only be used in the browser where it was created.
2. **Set up your game.** Choose the computer and an Easy, Medium, or Hard difficulty, or choose to play with a friend. Pick your side or board orientation, then start. If there is a saved game, you can resume it instead.
3. **Make a move.** Select a piece to see its legal destinations, then select a highlighted square, or drag the piece there. White moves first.
4. **Take your time.** In two-player mode, pass the device to the next player. **Take back** undoes one move in two-player mode, or your move and the computer’s reply against Milo. **Flip board** changes your view. Choose **New game** to return to setup.

Castling, en passant, promotion, checkmate, stalemate, repetition, and other draw rules are supported.

Using a keyboard? Tab to the board, navigate with the arrow keys, and press **Enter** or **Space** to select a square. The in-game guide explains how each piece moves.

## Getting started

You'll need Node.js **20.19+** or **22.12+**.

```bash
npm ci
npm run dev
```

Open the local URL printed by Vite. Local profile creation requires HTTPS or localhost for the Web Crypto API. Other useful commands:

```bash
npm test                         # Run account, storage, and chess-logic tests
npm run build -- --base=/chess/  # Build with the GitHub Pages base path
npx playwright install chromium  # Install Chromium once for browser tests
npm run test:e2e                 # Exercise the built app at /chess/
npm run preview -- --base=/chess/ # Preview the production build locally
```

### Project map

```text
src/App.jsx              Screen flow and game interaction state
src/auth.js              Device-only profile and tab-session handling
src/gameStorage.js       Per-profile game saves and legacy guest migration
src/components/          Login, game setup, board, and accessible dialogs
src/chess.js             Rules helpers and computer opponent
src/engine.worker.js     Background computer-move calculation
public/                  Chess pieces and artwork
tests/                   Account, storage, and chess-logic regression tests
e2e/                     Browser, responsive, and accessibility tests
.github/workflows/       Tests and GitHub Pages deployment
```

The playable app starts at `src/main.jsx`. An earlier TypeScript site prototype and its plan are also preserved in the repository; they are not part of the current game build.

## Deployment

The [GitHub Pages workflow](.github/workflows/deploy.yml) installs dependencies, runs the unit and browser tests against the production `/chess/` base path, and publishes the site when changes are merged to `main`. It can also be run manually from the Actions tab.

The live game is at **[shogun-support-99.github.io/chess](https://shogun-support-99.github.io/chess/)**. All profiles and saved games stay in the browser on that device; clearing browser data removes them.

## Design & credits

- The interface was designed with [UI/UX Pro Max](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill), installed at `.agents/skills/ui-ux-pro-max` from upstream revision `28b3b8dee8c976df4fa3e94aed4e092ad43fcb03`. The skill's MIT license is included in that directory.
- Chess pieces are the Cburnett set from [Lichess](https://github.com/lichess-org/lila/tree/master/public/piece/cburnett), originally by [Cburnett](https://commons.wikimedia.org/wiki/User:Cburnett) under [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/). The SVGs are unmodified from the Lichess distribution.
- The knight illustration was generated for this project. Inter and Playfair Display are distributed through Fontsource under the SIL Open Font License.
