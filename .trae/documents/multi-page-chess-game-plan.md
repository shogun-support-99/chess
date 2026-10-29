# Multi-Page Chess Game Plan

## Summary

Build a polished multi-page chess web app in the existing `/workspace` repo using React + Vite + TypeScript, with full legal move logic powered by `chess.js`, launch support for both local PvP and AI play, rich motion/animation, and a GitHub-hosted live deployment. The execution path will use the relevant skills as follows:

- `trae-remote-official:build-web-apps:frontend-app-builder` for concepting the visual direction, extracting a UI system, and implementing the routed frontend.
- `trae-remote-official:build-web-apps:react-best-practices` for React architecture, state boundaries, and performance-minded component design.
- `trae-remote-official:build-web-apps:frontend-testing-debugging` for browser-based QA, interaction validation, responsive checks, and rendered regression checks.
- `gh-cli` for repository inspection, optional auth fallback guidance, and GitHub Pages publication workflow support.

## Current State Analysis

- The repo root at `/workspace` is effectively blank.
- Tracked content currently consists of only `chess.MD`, whose contents are just `chess`.
- A git repository already exists at `/workspace/.git`.
- The current branch is `main`.
- The remote `origin` is already configured to `https://github.com/shogun-support-99/chess`.
- The GitHub repository is publicly reachable and currently contains only the single placeholder file.
- GitHub CLI is not authenticated in the sandbox right now, so `gh`-based repo mutation is not immediately available.
- The user wants the existing repo reused, wants both local PvP and AI at launch, wants a fuller multi-page product/site experience rather than a single-screen app, wants `chess.js` for rules, and wants the best practical publish approach rather than a minimal code-only handoff.
- The user prefers that execution first try the existing git remote auth path and only fall back to explicit auth setup if push fails.

## Assumptions And Decisions

- Framework decision: use React + Vite + TypeScript because the repo is greenfield, the app is primarily a client-rendered game, and GitHub Pages deployment is straightforward for a static build.
- Routing decision: use client-side routing for a true multi-page experience with distinct screens rather than one overloaded page with hidden panels.
- Styling decision: implement a custom visual system optimized for a premium, game-forward interface with tasteful motion, rather than a generic template or card-heavy dashboard look.
- Rules decision: use `chess.js` as the source of truth for legal move generation, check/checkmate/stalemate detection, castling, en passant, promotion, PGN/FEN state handling where useful, and move history support.
- AI decision: support two AI modes at launch:
  - primary AI path using browser-compatible Stockfish integration for stronger play and selectable difficulty.
  - fallback simpler heuristic mode only if Stockfish integration becomes a concrete blocker in the target Pages build.
- Deployment decision: target GitHub Pages with a GitHub Actions deployment workflow, because that gives the most repeatable "proper published link in GitHub" outcome for this static React app.
- Auth decision: during execution, first test whether the existing git remote can push from the sandbox as-is; if not, switch to a documented `GH_TOKEN` / auth-assisted path before push and Pages enablement.
- Scope guard: no backend, no online real-time multiplayer, and no account system in v1.

## Proposed Changes

### Repo Bootstrap

Create a clean Vite React TypeScript app in `/workspace` and replace the placeholder structure with a production-ready frontend project.

Files and areas to add or replace:

- `/workspace/package.json`
  - Define app scripts for development, build, preview, lint, and deployment-related tasks.
  - Add dependencies for React, routing, chess rules, animation, and AI integration.
- `/workspace/tsconfig*.json`
  - Configure strict TypeScript suitable for a game UI with reusable typed models.
- `/workspace/vite.config.ts`
  - Set the correct `base` path for GitHub Pages publishing from `shogun-support-99/chess`.
- `/workspace/index.html`
  - Provide the app mount point and page metadata.
- `/workspace/.gitignore`
  - Ignore dependencies, build output, local env files, and caches.

### App Structure

Create a routed app shell that supports a proper multi-page experience.

Files and areas to add:

- `/workspace/src/main.tsx`
  - Mount the app and router cleanly.
- `/workspace/src/App.tsx`
  - Compose the route tree and shared shell providers.
- `/workspace/src/routes/*`
  - Add page-level routes for:
    - Home
    - Play
    - How To Play
    - About / Features
    - Not Found
- `/workspace/src/layouts/*`
  - Shared site chrome, navigation, footer, and page transition wrapper.

Why:

- This meets the "fully multi page" requirement without burying everything inside one monolithic screen.
- It creates separation between brand/storytelling pages and the actual play experience.

### Visual System And Motion

Create a coherent chess-themed design system and animation strategy before deep feature work.

Files and areas to add:

- `/workspace/src/styles/*`
  - Global CSS, tokens, typography, motion timing, surface styles, and responsive utilities.
- `/workspace/src/components/ui/*`
  - Reusable buttons, panels, badges, stat rows, toggles, dialogs, and transition helpers.
- `/workspace/src/assets/*`
  - Piece assets and brand visuals as needed.

How:

- Use `frontend-app-builder` during execution to define the visual direction first and keep the implemented pages faithful to the approved design.
- Use restrained but noticeable motion for:
  - page transitions
  - board hover/selection states
  - piece movement
  - check/checkmate emphasis
  - modal/result reveals
  - reduced-motion fallbacks

### Chess Domain Model

Separate game rules from rendering so the UI stays maintainable.

Files and areas to add:

- `/workspace/src/features/chess/engine/*`
  - Wrap `chess.js` in app-specific utilities for move execution, game status, promotion handling, and board serialization.
- `/workspace/src/features/chess/types/*`
  - Shared game types for players, move records, timers, AI mode, and UI state.
- `/workspace/src/features/chess/state/*`
  - Centralized state logic for game mode, current turn, selected square, legal move highlights, timers, captured pieces, and game result.
- `/workspace/src/features/chess/utils/*`
  - Helpers for notation display, captured-piece grouping, square coordinates, theme mapping, and animation-friendly move metadata.

Why:

- `chess.js` handles legality, but the app still needs a clean domain layer for UI state, clocks, mode switching, and history rendering.

### Core Play Surface

Implement the primary gameplay screen as the product centerpiece.

Files and areas to add:

- `/workspace/src/features/chess/components/Board.tsx`
  - Render the 8x8 board, selectable squares, legal move hints, piece placement, and movement animation hooks.
- `/workspace/src/features/chess/components/Piece.tsx`
  - Render chess pieces with animation and accessible state labels.
- `/workspace/src/features/chess/components/GameSidebar.tsx`
  - Show move list, captured pieces, current turn, status, and controls.
- `/workspace/src/features/chess/components/ClockPanel.tsx`
  - Display clocks for both sides and countdown state.
- `/workspace/src/features/chess/components/PromotionDialog.tsx`
  - Handle promotion choices cleanly.
- `/workspace/src/features/chess/components/GameResultModal.tsx`
  - Show win/draw state and replay/rematch actions.
- `/workspace/src/routes/PlayPage.tsx`
  - Assemble the complete play experience.

Launch behavior to support:

- local PvP mode
- AI mode selection
- legal move highlighting
- move execution
- check, checkmate, stalemate, insufficient material, and draw state display where exposed by `chess.js`
- castling, en passant, and promotion
- move history
- captured pieces
- reset/new game/rematch
- responsive layout for desktop and mobile

### AI Integration

Add AI support in a way that works within a static frontend deployment.

Files and areas to add:

- `/workspace/src/features/ai/*`
  - Engine adapter, worker integration, difficulty mapping, and move request orchestration.
- `/workspace/public/*` or `/workspace/src/workers/*`
  - Stockfish-compatible worker asset path if required by the chosen integration approach.

How:

- Prefer a browser-worker-based Stockfish package or compatible worker-backed integration that can run fully client-side on GitHub Pages.
- Expose a small set of difficulty levels mapped to engine depth / think time.
- Keep AI turns asynchronous with loading/thinking feedback so the UI remains responsive.
- If Pages bundling reveals a concrete Stockfish packaging blocker, fall back to a simpler heuristic AI only as a documented contingency, not as the planned primary outcome.

### Multi-Page Content

Build non-game routes that make the project feel like a finished product, not just a board widget.

Files and areas to add:

- `/workspace/src/routes/HomePage.tsx`
  - Hero, game preview, feature highlights, and call-to-action into play.
- `/workspace/src/routes/HowToPlayPage.tsx`
  - Explain piece movement, special moves, and basic win conditions.
- `/workspace/src/routes/AboutPage.tsx`
  - Explain the app, game modes, animation/polish goals, and project positioning.

Why:

- This satisfies the request for a fully multi-page chess game.
- These pages also create a better GitHub Pages presentation for the published link.

### Navigation And UX Polish

Add the product-level UX needed to make the app feel complete.

Files and areas to add:

- `/workspace/src/components/navigation/*`
  - Header, mobile nav, footer, and active-route state.
- `/workspace/src/components/feedback/*`
  - Toasts, banners, or inline notices for mode changes and invalid actions if needed.

Key UX decisions:

- Preserve state clarity when switching between local PvP and AI.
- Keep "new game" and "rematch" flows obvious.
- Make the board responsive without sacrificing readability.
- Respect keyboard and screen-reader basics for primary controls.

### Testing And Verification

Add focused automated coverage and plan a real rendered QA loop.

Files and areas to add:

- `/workspace/src/features/chess/**/*.test.ts` or `/workspace/src/features/chess/**/*.test.tsx`
  - Focus on high-value rules-wrapper tests and state transitions rather than noisy UI snapshot tests.
- `/workspace/vitest.config.ts` and related test setup files if Vitest is chosen.

Verification approach:

- Unit-test the app-specific chess wrapper behavior around move execution, promotion flow, result detection, and mode transitions.
- Build and verify the static output for GitHub Pages compatibility.
- Use `frontend-testing-debugging` with Browser-first QA to validate:
  - initial load
  - route navigation
  - game interaction
  - AI move loop
  - promotion flow
  - responsive layout
  - absence of console/runtime errors

### GitHub Publication

Prepare the repo for a proper GitHub-based live link.

Files and areas to add:

- `/workspace/.github/workflows/deploy.yml`
  - Build and deploy the Vite site to GitHub Pages on push to `main`.
- `/workspace/README.md`
  - Document setup, scripts, architecture summary, and the final live URL once known.

Execution steps to perform later:

- Confirm or configure the repo’s Pages source / Actions deployment path.
- Build locally in the sandbox.
- Commit the implementation.
- Try pushing with the existing git remote auth first.
- If push fails, switch to the documented GitHub auth path.
- After the workflow or Pages publish completes, confirm the public URL and include it in the final handoff.

Expected published URL shape:

- `https://shogun-support-99.github.io/chess/`

## Implementation Order

1. Replace the placeholder repo contents with a Vite React TypeScript foundation and GitHub Pages-aware config.
2. Establish routing, shell layout, visual tokens, and page skeletons.
3. Implement the chess domain layer on top of `chess.js`.
4. Build the playable board UI and local PvP flow.
5. Add AI integration with Stockfish-first strategy and UI feedback.
6. Add supporting pages and shared navigation.
7. Polish animation, responsiveness, and accessibility basics.
8. Add focused tests for critical chess state transitions.
9. Validate in-browser behavior and fix visual/interaction issues.
10. Commit, push, publish through GitHub Pages, and verify the final live link.

## Risks And Mitigations

- Stockfish packaging risk on GitHub Pages:
  - Mitigate by choosing a browser-worker-friendly package early and proving it in the first playable AI pass.
- Git push/auth risk from the sandbox:
  - Mitigate by testing existing remote push first, then falling back to token/auth guidance if needed.
- Motion over-complexity risk:
  - Mitigate by keeping animation purposeful and tied to state changes, with reduced-motion support.
- Scope creep risk from "fully multi page":
  - Mitigate by locking v1 page set to Home, Play, How To Play, About, and Not Found.

## Verification Steps

- Confirm the app installs and builds successfully with the selected package manager.
- Confirm all routes render without blank states or framework errors.
- Confirm local PvP supports legal moves, special moves, promotion, and end-state handling.
- Confirm AI mode can make moves and respects selected difficulty behavior.
- Confirm move history, captured pieces, clocks, and result modal update correctly.
- Confirm desktop and mobile layouts are usable and visually polished.
- Run targeted tests for chess wrapper and critical state transitions.
- Run browser QA using the frontend testing skill, including console checks and screenshot evidence.
- Confirm the GitHub Actions Pages workflow succeeds.
- Confirm the live site loads at the final public GitHub Pages URL.
