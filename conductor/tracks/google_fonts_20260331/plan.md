# Implementation Plan: Google Font Pairs Integration

## Phase 1: UI & Data Mapping [checkpoint: 6bcc071]
- [x] Task: Map Font Pairs Data (cf9353e)
    - [x] Create `js/fonts.js` containing the 10 font pair configurations (URLs and families).
    - [x] Write unit tests to verify data structure integrity.
- [x] Task: Font Selection Dropdown (b2c952b)
    - [x] Write tests for the existence and population of the font dropdown.
    - [x] Add the `<select>` element to `index.html` within the editor section.
- [x] Task: Conductor - User Manual Verification 'Phase 1: UI & Data Mapping' (Protocol in workflow.md) (6bcc071)

## Phase 2: Dynamic Loader Implementation
- [x] Task: Implement Font Injection Utility (db133de)
    - [x] Write tests for the dynamic `<link>` tag generation and injection.
    - [x] Implement `injectGoogleFonts(pairId)` in `js/fonts.js`.
- [x] Task: Apply Fonts to Preview (6d7c752)
    - [x] Write tests ensuring CSS variables or styles are updated correctly on selection.
    - [x] Implement the application logic to update Name/Title (Heading) and Contact Info (Body).
- [~] Task: Conductor - User Manual Verification 'Phase 2: Dynamic Loader Implementation' (Protocol in workflow.md)

## Phase 3: State Management & Persistence
- [ ] Task: Update Persistence Logic
    - [ ] Write tests for saving/loading `fontPairId` from `localStorage`.
    - [ ] Update `saveToLocalStorage` and `loadFromLocalStorage` in `js/app.js`.
- [ ] Task: Initial Load Handling
    - [ ] Write tests for default font application when no state exists.
    - [ ] Ensure `initApp` triggers the font injection on startup.
- [ ] Task: Conductor - User Manual Verification 'Phase 3: State Management & Persistence' (Protocol in workflow.md)

## Phase 4: Integration & Layout Refinement
- [ ] Task: Sync with Layout Engine
    - [ ] Write tests to ensure `runLayoutEngine` is called *after* fonts are loaded.
    - [ ] Implement a listener or promise-based wait for font loading before triggering layout recalculation.
- [ ] Task: Visual Polish & Error Handling
    - [ ] Add loading indicators or graceful fallbacks for CDN failures.
- [ ] Task: Conductor - User Manual Verification 'Phase 4: Integration & Layout Refinement' (Protocol in workflow.md)
