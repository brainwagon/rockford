/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { initApp } from '../js/app.js';
import * as fonts from '../js/fonts.js';

describe('Font Selection Integration', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <main id="app">
        <select id="font-select">
          <option value="default">Default</option>
          <option value="montserrat_merriweather">Montserrat + Merriweather</option>
        </select>
        <div id="business-card">
          <h1 id="card-name-display"></h1>
          <p id="card-title-display"></p>
        </div>
        <!-- Other required elements for initApp -->
        <button id="btn-landscape"></button>
        <button id="btn-portrait"></button>
        <select id="template-select"></select>
        <input type="checkbox" id="input-qr-toggle">
        <div id="card-qr-display"></div>
        <input type="url" id="input-website">
        <input type="file" id="input-logo">
        <div id="card-logo-display"></div>
        <input type="text" id="input-name">
        <input type="text" id="input-title">
        <input type="email" id="input-email">
        <input type="tel" id="input-phone">
      </main>
    `;
    
    // Mock fonts functions
    vi.spyOn(fonts, 'injectGoogleFonts');
    vi.spyOn(fonts, 'applyFontPair');
    
    initApp();
  });

  it('should call injectGoogleFonts and applyFontPair when selection changes', () => {
    const fontSelect = document.getElementById('font-select');
    fontSelect.value = 'montserrat_merriweather';
    fontSelect.dispatchEvent(new Event('change'));
    
    expect(fonts.injectGoogleFonts).toHaveBeenCalledWith('montserrat_merriweather');
    expect(fonts.applyFontPair).toHaveBeenCalledWith('montserrat_merriweather');
  });
});
