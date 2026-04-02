# Rockford

A simple, elegant, and efficient way for individual professionals to generate high-quality custom business cards.

## Features

- **Interactive Editor:** Real-time preview of your business card as you customize text and images.
- **Template Selection:** Choose from pre-defined, professional layouts (Minimalist, Modern, Elegant).
- **Standardized Formatting:** Automatic real-time formatting for phone numbers (US format).
- **Logo/Image Upload:** Add your own brand logo or personalized background.
- **QR Code Generator:** Built-in tool to generate and place QR codes for your website or profile.
- **Typography:** Professional Google Font pairs selection.
- **Sophisticated Layout Engine:** Automated iterative font-scaling to prevent collisions and ensure perfect fit.
- **Session Persistence:** State is automatically saved to local storage.
- **Export Options:** 
  - PDF Export (Print-ready)
  - PNG Image Export
  - Direct Browser Print (10 cards per sheet)

## Tech Stack

- **Language:** Vanilla JavaScript (ES6+)
- **UI:** Direct DOM Manipulation (No heavy frameworks)
- **Styling:** Vanilla CSS (Flexbox and CSS Grid)
- **Dependencies:** 
  - `qrcode-generator` (CDN)
  - `html2canvas` (CDN)
  - `jspdf` (CDN)

## Development

The project is structured as a set of static files. You can simply open `index.html` in any modern browser to use the application.

### Testing

The project uses `vitest` and `jsdom` for automated testing.

```bash
npm install
npm test
```

## License

ISC
