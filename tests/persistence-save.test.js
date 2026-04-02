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
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(JSON.parse(manifestJson)),
      });
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

describe('Data Serialization & Storage', () => {
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

  it('should save data to localStorage when an input changes', async () => {
    const inputName = document.getElementById('input-name');
    inputName.value = 'John Persistence';
    inputName.dispatchEvent(new dom.window.Event('input'));

    await new Promise((resolve) => setTimeout(resolve, 600));

    expect(global.localStorage.setItem).toHaveBeenCalled();
    const savedData = JSON.parse(global.localStorage.setItem.mock.calls[0][1]);
    expect(savedData.name).toBe('John Persistence');
  });

  it('should save formatFile and orientation', async () => {
    const btnPortrait = document.getElementById('btn-portrait');
    btnPortrait.dispatchEvent(new dom.window.MouseEvent('click', {bubbles: true}));

    await new Promise((resolve) => setTimeout(resolve, 600));

    const savedData = JSON.parse(global.localStorage.setItem.mock.calls[0][1]);
    expect(savedData.formatFile).toBeDefined();
    expect(savedData.orientation).toBe('portrait');
  });

  it('should save the current fontPairId', async () => {
    const fontSelect = document.getElementById('font-select');
    fontSelect.value = 'montserrat_merriweather';
    fontSelect.dispatchEvent(new dom.window.Event('change'));

    await new Promise((resolve) => setTimeout(resolve, 600));

    const setItemCalls = global.localStorage.setItem.mock.calls;
    const fontCall = setItemCalls.find((call) => {
      const data = JSON.parse(call[1]);
      return data.fontPairId === 'montserrat_merriweather';
    });
    expect(fontCall).toBeDefined();
  });
});
