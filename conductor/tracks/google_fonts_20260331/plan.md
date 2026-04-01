# Implementation Plan: Google Font Pairs Integration

## Phase 1: UI & Data Mapping [checkpoint: 6bcc071]
- [x] Task: Map Font Pairs Data (cf9353e)
    - [x] Create `js/fonts.js` containing the 10 font pair configurations (URLs and families).
    - [x] Write unit tests to verify data structure integrity.
- [x] Task: Font Selection Dropdown (b2c952b)
    - [x] Write tests for the existence and population of the font dropdown.
    - [x] Add the `<select>` element to `index.html` within the editor section.
- [x] Task: Conductor - User Manual Verification 'Phase 1: UI & Data Mapping' (Protocol in workflow.md) (6bcc071)

## Phase 2: Dynamic Loader Implementation [checkpoint: 9e60230]
- [x] Task: Implement Font Injection Utility (db133de)
    - [x] Write tests for the dynamic `<link>` tag generation and injection.
    - [x] Implement `injectGoogleFonts(pairId)` in `js/fonts.js`.
- [x] Task: Apply Fonts to Preview (6d7c752)
    - [x] Write tests ensuring CSS variables or styles are updated correctly on selection.
    - [x] Implement the application logic to update Name/Title (Heading) and Contact Info (Body).
- [x] Task: Conductor - User Manual Verification 'Phase 2: Dynamic Loader Implementation' (Protocol in workflow.md) (9e60230)

## Phase 3: State Management & Persistence [checkpoint: 6d8a189]
- [x] Task: Update Persistence Logic (2480eb4)
    - [x] Write tests for saving/loading `fontPairId` from `localStorage`.
    - [x] Update `saveToLocalStorage` and `loadFromLocalStorage` in `js/app.js`.
- [x] Task: Initial Load Handling (6cb6843)
    - [x] Write tests for default font application when no state exists.
    - [x] Ensure `initApp` triggers the font injection on startup.
- [x] Task: Conductor - User Manual Verification 'Phase 3: State Management & Persistence' (Protocol in workflow.md) (6d8a189)

## Phase 4: Integration & Layout Refinement
- [x] Task: Sync with Layout Engine (f99df10)
    - [x] Write tests to ensure `runLayoutEngine` is called *after* fonts are loaded.
    - [x] Implement a listener or promise-based wait for font loading before triggering layout recalculation.
- [x] Task: Visual Polish & Error Handling (f327032)
    - [x] Add loading indicators or graceful fallbacks for CDN failures.
- [~] Task: Conductor - User Manual Verification 'Phase 4: Integration & Layout Refinement' (Protocol in workflow.md)
