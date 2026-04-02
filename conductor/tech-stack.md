# Tech Stack: Rockford

## Frontend Core
- **Language:** **Vanilla JavaScript (ES6+).** Leveraging modern JavaScript features for a clean, expressive, and browser-native codebase.
- **UI Strategy:** **Direct DOM Manipulation.** No heavy frameworks. Using native browser APIs to build the business card editor and preview system for maximum performance and simplicity.
- **Templating:** Template strings and dynamic element creation to generate business card layouts and live previews.
- **Layout Engine:** Custom geometric collision detection and iterative font-reduction system implemented in vanilla JavaScript to maintain visual integrity across different content lengths.
- **Data Utilities:** Custom functional utilities for real-time data formatting and masking (e.g., US phone number formatting).

## Styling
- **CSS Strategy:** **Vanilla CSS.** Standard CSS files for all UI and business card styling.
- **Layout:** Modern CSS features like Flexbox and CSS Grid to handle card layouts and overall UI structure.
- **Fonts:** System fonts for the UI, with specific Google Fonts or local font loads for the business card templates.

## Assets & Icons
- **Icons:** SVG icons (inline or linked) for the UI.
- **Images:** Browser-native image processing for logo uploads and QR code generation.

## Development & Build
- **Environment:** **No Build Step.** The project is structured as a set of static files (`index.html`, `js/`, `css/`) that can be served directly by any web server or opened in a browser.
- **External Libraries (if needed):** Any essential utilities (e.g., QR code generator, PDF export) should be included as standalone, CDN-linkable scripts or minimal external files.
