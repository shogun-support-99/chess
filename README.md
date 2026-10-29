# The Chess Club

A quiet little chess game you can play in your browser. Play as either color against Milo, a computer opponent with three difficulty levels. Your current game is saved locally on your device.

## Get started

Requirements: Node.js 20.19+ or 22.12+.

```sh
npm install
npm run dev
```

Open the local URL printed by Vite. To make a production build, run `npm run build`; run the game-logic tests with `npm test`.

## Playing

- Select a piece and then a highlighted destination, or drag a piece to its destination. On a keyboard, tab to the board, use the arrow keys to navigate, and press Enter or Space to select a square.
- **New game** lets you choose your color and Milo's difficulty. The game has no clock.
- **Take back** undoes your previous move and the computer's reply, if it has already moved. **Flip board** changes the view without changing sides.
- Castling, en passant, promotion, checkmate, stalemate, repetition, and other draw rules are handled by [chess.js](https://github.com/jhlywa/chess.js). Milo is a lightweight local opponent rather than a tournament-strength chess engine.
- The game and settings are stored in browser local storage; clearing browser data clears the saved game. No account or server is required.

## Design skill

The [UI/UX Pro Max](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill) skill is installed at `.agents/skills/ui-ux-pro-max` (upstream revision `28b3b8dee8c976df4fa3e94aed4e092ad43fcb03`). Its chess/gaming design-system, typography, interaction, and accessibility searches informed the interface. To query it again:

```sh
python3 .agents/skills/ui-ux-pro-max/scripts/search.py "chess gaming strategy" --design-system -p "The Chess Club"
```

The skill is distributed under its own MIT license, included in its directory.

## Credits

- Chess piece SVGs are the Cburnett set, obtained from [Lichess](https://github.com/lichess-org/lila/tree/master/public/piece/cburnett); the original pieces are by [Cburnett](https://commons.wikimedia.org/wiki/User:Cburnett), available under [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/). The SVGs are unmodified from the Lichess distribution.
- The knight illustration was generated for this project.
- Typefaces are Inter and Playfair Display, distributed through Fontsource under the SIL Open Font License.
