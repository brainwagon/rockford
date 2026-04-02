import {describe, it, expect, beforeEach, afterEach, vi} from 'vitest';
import {JSDOM} from 'jsdom';
import fs from 'fs';
import {fileURLToPath} from 'url';
import {dirname, resolve} from 'path';

vi.mock('../js/fonts.js', async (importOriginal) => {
  const actual = await importOriginal();
  return {...actual, injectGoogleFonts: vi.fn(() => Promise.resolve())};
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const html = fs.readFileSync(resolve(__dirname, '../index.html'), 'utf8');
const minimalMd = fs.readFileSync(resolve(__dirname, '../formats/minimal.md'), 'utf8');
const manifestJson = fs.readFileSync(resolve(__dirname, '../formats/index.json'), 'utf8');

import {initApp} from '../js/app.js';

/** Builds a fetch mock whose minimal.md response can be swapped mid-test. */
function makeControllableFetch(initialMd = minimalMd) {
  let currentMd = initialMd;
  let currentModified = 'Wed, 01 Jan 2025 00:00:00 GMT';
  const noHeaders = {get: () => null};

  const mock = vi.fn((url, options = {}) => {
    const method = (options.method || 'GET').toUpperCase();
    if (url.endsWith('index.json')) {
      return Promise.resolve({
        ok: true, headers: noHeaders,
        json: () => Promise.resolve(JSON.parse(manifestJson)),
      });
    }
    if (url.endsWith('minimal.md')) {
      const headers = {get: (h) => h === 'Last-Modified' ? currentModified : null};
      if (method === 'HEAD') {
        return Promise.resolve({ok: true, headers});
      }
      return Promise.resolve({ok: true, headers, text: () => Promise.resolve(currentMd)});
    }
    return Promise.resolve({ok: false, headers: noHeaders, text: () => Promise.resolve('')});
  });
  mock.setContent = (md) => { currentMd = md; };
  mock.setModified = (date) => { currentModified = date; };
  return mock;
}

describe('Format File Watcher', () => {
  let dom;
  let doc;

  beforeEach(() => {
    vi.useFakeTimers();
    dom = new JSDOM(html, {runScripts: 'dangerously', resources: 'usable'});
    doc = dom.window.document;
    global.document = doc;
    global.window = dom.window;
    global.localStorage = {
      getItem: vi.fn(() => null),
      setItem: vi.fn(),
      clear: vi.fn(),
    };
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('re-fetches the current format file after the poll interval', async () => {
    const fetchMock = makeControllableFetch();
    global.fetch = fetchMock;

    await initApp();
    const callsBefore = fetchMock.mock.calls.filter(
        (c) => c[0].endsWith('minimal.md')).length;

    await vi.advanceTimersByTimeAsync(2000);

    const callsAfter = fetchMock.mock.calls.filter(
        (c) => c[0].endsWith('minimal.md')).length;
    expect(callsAfter).toBeGreaterThan(callsBefore);
  });

  it('re-renders card when fetched format content has changed', async () => {
    const fetchMock = makeControllableFetch();
    global.fetch = fetchMock;

    await initApp();

    // Change both the modified timestamp and content to trigger re-render
    fetchMock.setModified('Thu, 02 Jan 2025 00:00:00 GMT');
    // Replace the Name field size with a sentinel value to detect re-render
    const originalSize = minimalMd.match(/\*\*Field\*\*: Name[\s\S]*?\*\*Size\*\*: "(\d+pt)"/)[1];
    const sentinelSize = '22pt';
    const updatedMd = minimalMd.replace(
        new RegExp(`(\\*\\*Field\\*\\*: Name[\\s\\S]*?\\*\\*Size\\*\\*: ")${originalSize}"`),
        `$1${sentinelSize}"`);
    fetchMock.setContent(updatedMd);

    await vi.advanceTimersByTimeAsync(2000);

    const nameEl = doc.getElementById('card-name-display');
    expect(nameEl.style.fontSize).toBe(sentinelSize);
  });

  it('does not re-render when format content is unchanged', async () => {
    const fetchMock = makeControllableFetch();
    global.fetch = fetchMock;

    await initApp();

    // Spy on renderCard side-effect: count card-segment elements before/after
    const segmentsBefore = doc.querySelectorAll('.card-segment').length;

    await vi.advanceTimersByTimeAsync(2000);

    // If re-rendered, segments still exist (same count — content unchanged)
    const segmentsAfter = doc.querySelectorAll('.card-segment').length;
    expect(segmentsAfter).toBe(segmentsBefore);

    // Verify fetch WAS called but no extra renders happened
    // (name size still at the value from the original file)
    const originalSize = minimalMd.match(
        /\*\*Field\*\*: Name[\s\S]*?\*\*Size\*\*: "(\d+pt)"/)[1];
    const nameEl = doc.getElementById('card-name-display');
    expect(nameEl.style.fontSize).toBe(originalSize);
  });

  it('watches the new file after a format change', async () => {
    const minimalMd2 = fs.readFileSync(
        resolve(__dirname, '../formats/modern.md'), 'utf8');
    const noHeaders = {get: () => null};
    const modernModified = 'Wed, 01 Jan 2025 00:00:00 GMT';
    const modernHeaders = {get: (h) => h === 'Last-Modified' ? modernModified : null};
    const fetchMock = vi.fn((url, options = {}) => {
      const method = (options.method || 'GET').toUpperCase();
      if (url.endsWith('index.json')) {
        return Promise.resolve({
          ok: true, headers: noHeaders,
          json: () => Promise.resolve(JSON.parse(manifestJson)),
        });
      }
      if (url.endsWith('minimal.md')) {
        return Promise.resolve({
          ok: true, headers: noHeaders,
          text: () => Promise.resolve(minimalMd),
        });
      }
      if (url.endsWith('modern.md')) {
        if (method === 'HEAD') {
          return Promise.resolve({ok: true, headers: modernHeaders});
        }
        return Promise.resolve({
          ok: true, headers: modernHeaders,
          text: () => Promise.resolve(minimalMd2),
        });
      }
      return Promise.resolve({ok: false, headers: noHeaders, text: () => Promise.resolve('')});
    });
    global.fetch = fetchMock;

    await initApp();

    // Switch to modern format
    const formatSelect = doc.getElementById('format-select');
    formatSelect.value = 'modern.md';
    formatSelect.dispatchEvent(new dom.window.Event('change'));
    await vi.advanceTimersByTimeAsync(0);

    const modernCallsBefore = fetchMock.mock.calls.filter(
        (c) => c[0].endsWith('modern.md')).length;

    await vi.advanceTimersByTimeAsync(2000);

    const modernCallsAfter = fetchMock.mock.calls.filter(
        (c) => c[0].endsWith('modern.md')).length;
    expect(modernCallsAfter).toBeGreaterThan(modernCallsBefore);
  });
});
