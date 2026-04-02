import {describe, it, expect, beforeEach, vi} from 'vitest';
import {JSDOM} from 'jsdom';
import fs from 'fs';
import {fileURLToPath} from 'url';
import {dirname, resolve} from 'path';
import * as fonts from '../js/fonts.js';

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

describe('Phone Number Persistence', () => {
  let dom;
  let document;

  const mockState = {
    name: 'Restored Name',
    title: 'Restored Title',
    email: 'restored@example.com',
    phone: '5551234567', // Raw digits in storage
    website: 'restored.com',
    template: 'modern',
    orientation: 'portrait',
    qrEnabled: true,
    fontPairId: 'montserrat_merriweather',
  };

  beforeEach(() => {
    dom = new JSDOM(html, {runScripts: 'dangerously', resources: 'usable'});
    document = dom.window.document;

    global.document = document;
    global.window = dom.window;

    // Mock localStorage with predefined data
    const localStorageMock = (() => {
      let store = {
        'rockford_state': JSON.stringify(mockState),
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
  });

  it('should format the phone number restored from localStorage', async () => {
    initApp();
    // Wait for async loadFromLocalStorage
    await new Promise((res) => setTimeout(res, 50));

    const input = document.getElementById('input-phone');
    const display = document.getElementById('card-phone-display');

    expect(input.value).toBe('(555) 123-4567');
    expect(display.textContent).toBe('(555) 123-4567');
  });
});
