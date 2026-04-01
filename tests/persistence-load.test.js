import {describe, it, expect, beforeEach, vi} from 'vitest';
import {JSDOM} from 'jsdom';
import fs from 'fs';
import {fileURLToPath} from 'url';
import {dirname, resolve} from 'path';

// Mock fonts to avoid hangs in JSDOM
vi.mock('../js/fonts.js', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    injectGoogleFonts: vi.fn(() => Promise.resolve()),
  };
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const html = fs.readFileSync(resolve(__dirname, '../index.html'), 'utf8');
import {initApp} from '../js/app.js';

describe('State Restoration', () => {
  let dom;
  let document;

  // Uses legacy 'template' key to exercise backward-compat mapping
  const mockState = {
    name: 'Restored Name',
    title: 'Restored Title',
    email: 'restored@example.com',
    phone: '123-456-7890',
    website: 'restored.com',
    template: 'modern',
    orientation: 'portrait',
    qrEnabled: true,
    fontPairId: 'montserrat_merriweather',
  };

  beforeEach(async () => {
    dom = new JSDOM(html, {runScripts: 'dangerously', resources: 'usable'});
    document = dom.window.document;

    global.document = document;
    global.window = dom.window;

    const localStorageMock = (() => {
      let store = {
        'bmaker_state': JSON.stringify(mockState),
      };
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

  it('should restore text fields from localStorage on init', () => {
    expect(document.getElementById('input-name').value).toBe(mockState.name);
    expect(document.getElementById('input-title').value).toBe(mockState.title);
    expect(document.getElementById('card-name-display').textContent).toBe(
        mockState.name);
  });

  it('should restore UI state (format/orientation) on init', () => {
    // Legacy 'template: modern' maps to modern.md → Theme class "modern"
    expect(document.getElementById('business-card').classList.contains(
        'modern')).toBe(true);
    expect(document.getElementById('business-card').classList.contains(
        'portrait')).toBe(true);
  });

  it('should restore the font selection on init', () => {
    expect(document.getElementById('font-select').value).toBe(
        mockState.fontPairId);
    const headingFont = document.getElementById('business-card').style
        .getPropertyValue('--heading-font');
    expect(headingFont).toContain('Montserrat');
  });
});
