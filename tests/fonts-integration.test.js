/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as fonts from '../js/fonts.js';

// We need to mock the module BEFORE importing initApp if we want to spy on its exports
// since ES modules are statically bound.
vi.mock('../js/fonts.js', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    injectGoogleFonts: vi.fn(() => Promise.resolve()),
    applyFontPair: vi.fn(),
  };
});

import { initApp } from '../js/app.js';

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
    
    vi.clearAllMocks();
    initApp();
  });

  it('should call injectGoogleFonts and applyFontPair when selection changes', async () => {
    const fontSelect = document.getElementById('font-select');
    fontSelect.value = 'montserrat_merriweather';
    fontSelect.dispatchEvent(new Event('change'));
    
    // Wait for async handler
    await vi.waitFor(() => {
        expect(fonts.applyFontPair).toHaveBeenCalledWith('montserrat_merriweather');
    });
    
    expect(fonts.injectGoogleFonts).toHaveBeenCalledWith('montserrat_merriweather');
  });

  it('should wait for injectGoogleFonts before applying font pair', async () => {
    let resolveFont;
    const fontPromise = new Promise(res => { resolveFont = res; });
    vi.mocked(fonts.injectGoogleFonts).mockReturnValue(fontPromise);
    
    const fontSelect = document.getElementById('font-select');
    fontSelect.value = 'montserrat_merriweather';
    fontSelect.dispatchEvent(new Event('change'));
    
    expect(fonts.injectGoogleFonts).toHaveBeenCalled();
    // At this point, applyFontPair should NOT have been called with montserrat_merriweather yet
    // because we haven't resolved fontPromise. 
    // It might have been called with 'default' during initApp.
    expect(fonts.applyFontPair).not.toHaveBeenCalledWith('montserrat_merriweather');
    
    resolveFont();
    
    await vi.waitFor(() => {
        expect(fonts.applyFontPair).toHaveBeenCalledWith('montserrat_merriweather');
    });
  });

  it('should apply the default fonts on init when no state is present', () => {
    // initApp is already called in beforeEach
    expect(fonts.applyFontPair).toHaveBeenCalledWith('default');
  });
});
