# Implementation Plan: Optional Company Name

## Phase 1: UI Structure & Basic Logic [checkpoint: 2eebc17]
- [x] Task: Add Company Name Input & Display (3669bb1)
    - [x] Write tests for the existence of the company name input and card elements.
    - [x] Add the "Company Name" input field (`#input-company`) to `index.html` in the contact section.
    - [x] Add the company name display element (`#card-company-display`) to `index.html` within the card structure.
    - [x] Define basic CSS for the company name element in `css/style.css`.
- [x] Task: Integrate Input with Card Preview (a0eace0)
    - [x] Write integration tests verifying that typing in the input updates the card preview.
    - [x] Update the `initApp` function in `js/app.js` to include the company name input in the reactive text update loop.
- [x] Task: Conductor - User Manual Verification 'Phase 1: UI Structure & Basic Logic' (Protocol in workflow.md) (2eebc17)

## Phase 2: Layout & Persistence
- [ ] Task: Integrate with Layout Engine
    - [ ] Write tests ensuring the company name scales down iteratively alongside the name and title.
    - [ ] Update the `runLayoutEngine` function in `js/app.js` to include `#card-company-display` in the reset scaling and iterative reduction phases.
- [ ] Task: Implement Persistence
    - [ ] Write tests for saving and loading the company name from `localStorage`.
    - [ ] Update `saveToLocalStorage` and `loadFromLocalStorage` in `js/app.js` to include the `company` field.
- [ ] Task: Conductor - User Manual Verification 'Phase 2: Layout & Persistence' (Protocol in workflow.md)
