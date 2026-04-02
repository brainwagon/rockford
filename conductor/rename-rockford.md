# Implementation Plan: Rename Application to "Rockford"

## Objective
Change the name of the application from "Business Card Generator" (and its internal codename "bmaker") to "Rockford", inspired by the TV show "The Rockford Files".

## Key Files & Context
- `index.html`: Update `<title>` and `<h1>` elements.
- `README.md`: Update title.
- `js/app.js`: Update initialization comments and change the localStorage key from `bmaker_state` to `rockford_state`.
- `tests/structure.test.js`: Update the test expecting "Business Card Generator" in the header.
- `tests/persistence-load.test.js`, `tests/persistence-logo.test.js`, `tests/phone-persistence.test.js`: Update mock localStorage key tests.
- `package.json` / `package-lock.json`: Update the package name from "bmaker" to "rockford".
- `conductor/` documentation: Update mentions of the old name in `product.md`, `product-guidelines.md`, and `tech-stack.md`.

## Implementation Steps
1. Replace "Business Card Generator" with "Rockford" in:
   - `index.html` (lines 6, 14)
   - `README.md` (line 1)
   - `js/app.js` (line 66)
   - `tests/structure.test.js` (line 31)
   - `conductor/product.md`, `conductor/product-guidelines.md`, `conductor/tech-stack.md`
2. Replace the localStorage key `bmaker_state` with `rockford_state` in:
   - `js/app.js`
   - `tests/phone-persistence.test.js`
   - `tests/persistence-load.test.js`
   - `tests/persistence-logo.test.js`
3. Update package name `bmaker` to `rockford` in:
   - `package.json`
4. Run `npm install` to update `package-lock.json` with the new package name.
5. Run tests `npm test` to verify everything works and tests pass.

## Verification & Testing
- Start the application and check that "Rockford" is displayed in the browser tab and the main header.
- Verify that changes in the form correctly save to local storage under the new key `rockford_state` and are reloaded upon refresh.
- Ensure all automated tests pass (`vitest run`).