# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm install          # Install dev dependencies (vitest, jsdom)
npm test             # Run all tests once
CI=true npm test     # Non-interactive mode — always use this in automated contexts
```

To run the app: open `index.html` directly in a browser. No build step or dev server needed.

## Architecture

Vanilla JS SPA with no framework and no build pipeline. All JS uses ES6 modules.

**Core modules:**
- `js/app.js` — app initialization, event listeners, localStorage persistence, PNG/PDF/print export
- `js/layout.js` — layout engine: bounding-rect collision detection, font auto-scaling to fit card bounds
- `js/fonts.js` — 10 Google Font pairs config; dynamically injects fonts and applies them to the card
- `js/phone-utils.js` — US phone number formatting (`+1 (555) 000-0000`)
- `css/style.css` — all styles (two-column editor + preview layout)

**CDN dependencies** (loaded in `index.html`, not npm):
- `qrcode-generator` 1.4.4 — QR code generation
- `html2canvas` 1.4.1 — renders card DOM to canvas for PNG export
- `jspdf` 2.5.1 — PDF export

**Data flow:** User input → event listeners in `app.js` → update card DOM → layout engine (collision/scaling) → save to localStorage.

**Tests:** `tests/` directory, Vitest 4.1.2 + jsdom. 28 test files covering layout geometry, persistence, fonts, phone formatting, export, and UI integration.

## Conductor Workflow

All development follows the TDD cycle defined in `conductor/workflow.md`. Key rules:

1. **Plan is source of truth** — tasks live in `plan.md` with statuses `[ ]` / `[~]` / `[x]` + commit SHA.
2. **Red → Green → Refactor** — write failing tests first, then implement the minimum code to pass.
3. **Git notes** — after each task commit, attach a summary via `git notes add -m "<summary>" <sha>`.
4. **Phase checkpoints** — completing the last task in a phase triggers a verification + checkpoint commit protocol (see `conductor/workflow.md`).
5. **Tech stack changes** — update `conductor/tech-stack.md` *before* deviating from the current stack.

## Code Style

Follows Google JS and HTML/CSS style guides (`conductor/code_styleguides/`):
- 2-space indentation, 80-character line limit
- Named ES6 exports
- JSDoc on all public functions
