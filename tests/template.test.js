import {describe, it, expect, beforeEach, vi} from 'vitest';
import {JSDOM} from 'jsdom';
import fs from 'fs';
import {fileURLToPath} from 'url';
import {dirname, resolve} from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const html = fs.readFileSync(resolve(__dirname, '../index.html'), 'utf8');

// Mock fonts to avoid network calls
vi.mock('../js/fonts.js', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    injectGoogleFonts: vi.fn(() => Promise.resolve()),
  };
});

import {initApp} from '../js/app.js';

/** Returns a fetch mock that serves the formats manifest and format files. */
function makeFetchMock() {
  const minimalMd = fs.readFileSync(
      resolve(__dirname, '../formats/minimal.md'), 'utf8');
  const modernMd = fs.readFileSync(
      resolve(__dirname, '../formats/modern.md'), 'utf8');
  const manifestJson = fs.readFileSync(
      resolve(__dirname, '../formats/index.json'), 'utf8');

  return vi.fn((url) => {
    if (url.endsWith('index.json')) {
      return Promise.resolve({ok: true, json: () => Promise.resolve(JSON.parse(manifestJson))});
    }
    if (url.endsWith('minimal.md')) {
      return Promise.resolve({ok: true, text: () => Promise.resolve(minimalMd)});
    }
    if (url.endsWith('modern.md')) {
      return Promise.resolve({ok: true, text: () => Promise.resolve(modernMd)});
    }
    return Promise.resolve({ok: false, text: () => Promise.resolve('')});
  });
}

describe('Layout Selection Component', () => {
  let dom;
  let document;

  beforeEach(async () => {
    dom = new JSDOM(html, {runScripts: 'dangerously', resources: 'usable'});
    document = dom.window.document;

    global.document = document;
    global.window = dom.window;
    global.fetch = makeFetchMock();

    const localStorageMock = (() => {
      let store = {};
      return {
        getItem: vi.fn((key) => store[key] || null),
        setItem: vi.fn((key, value) => {
          store[key] = value.toString();
        }),
        clear: vi.fn(() => {
          store = {};
        }),
      };
    })();
    global.localStorage = localStorageMock;

    await initApp();
  });

  it('should have orientation selection buttons', () => {
    const landscapeBtn = document.getElementById('btn-landscape');
    const portraitBtn = document.getElementById('btn-portrait');
    expect(landscapeBtn).not.toBeNull();
    expect(portraitBtn).not.toBeNull();
  });

  it('should have a layout selection dropdown', () => {
    const formatSelect = document.getElementById('format-select');
    expect(formatSelect).not.toBeNull();
  });

  it('layout dropdown should be populated with format options', () => {
    const formatSelect = document.getElementById('format-select');
    expect(formatSelect.options.length).toBeGreaterThan(0);
  });

  it('should default to landscape orientation', () => {
    const card = document.getElementById('business-card');
    expect(card.classList.contains('landscape')).toBe(true);
  });

  it('should switch to portrait orientation when portrait button is clicked', () => {
    const portraitBtn = document.getElementById('btn-portrait');
    const landscapeBtn = document.getElementById('btn-landscape');
    const card = document.getElementById('business-card');

    portraitBtn.dispatchEvent(new dom.window.MouseEvent('click', {bubbles: true}));

    expect(card.classList.contains('portrait')).toBe(true);
    expect(card.classList.contains('landscape')).toBe(false);
    expect(portraitBtn.classList.contains('active')).toBe(true);
    expect(landscapeBtn.classList.contains('active')).toBe(false);
  });

  it('should apply theme class from loaded format', () => {
    const card = document.getElementById('business-card');
    // minimal.md specifies Theme "minimal"
    expect(card.classList.contains('minimal')).toBe(true);
  });

  it('should render card-segment elements after format loads', () => {
    const card = document.getElementById('business-card');
    const segments = card.querySelectorAll('.card-segment');
    expect(segments.length).toBeGreaterThan(0);
  });
});
