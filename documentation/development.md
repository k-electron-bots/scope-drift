# Development reference

## Commands
```sh
npm run typecheck
npm test
npm run build
python3 -m http.server --directory docs 8000
```

`build` runs TypeScript using `tsconfig.json`; `test` builds then runs `tests/*.test.mjs`. Use a TypeScript-capable toolchain; no runtime dependencies are listed. The local static server serves the game from `docs/index.html`.

## Source map
- `src/ballistics.ts`: shot/movement calculations.
- `src/game.ts`: canvas game and interactions.
- `tests/ballistics.test.mjs`: calculation tests.
- `docs/index.html`, `docs/style.css`: GitHub Pages entry and styling.

Canvas rendering is high-DPI and movement is time-based. Unit checks do not establish mobile ergonomics, accessibility or every browser's behavior; inspect gameplay visually when changing it. Guides and screenshots belong in `documentation/`, not the deployed `docs/` tree.
