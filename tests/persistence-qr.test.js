import { describe, it, expect, beforeEach, vi } from 'vitest';
import { JSDOM } from 'jsdom';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const html = fs.readFileSync(resolve(__dirname, '../index.html'), 'utf8');
import { initApp } from '../js/app.js';

describe('QR Persistence', () => {
  let dom;
  let document;

  beforeEach(() => {
    dom = new JSDOM(html, { runScripts: "dangerously", resources: "usable" });
    document = dom.window.document;

    global.document = document;
    global.window = dom.window;

    const localStorageMock = (() => {
      let store = {};
      return {
        getItem: vi.fn(key => store[key] || null),
        setItem: vi.fn((key, value) => {
          store[key] = value.toString();
        }),
        clear: vi.fn(() => {
          store = {};
        })
      };
    })();
    global.localStorage = localStorageMock;

    // Mock qrcode-generator
    global.qrcode = () => ({
      addData: vi.fn(),
      make: vi.fn(),
      createImgTag: vi.fn(() => '<img src="mock-qr">'),
    });
  });

  it('should show QR element when modern format is loaded and website is set', async () => {
    await initApp();
    const formatSelect = document.getElementById('format-select');
    formatSelect.value = 'modern.md';
    formatSelect.dispatchEvent(new dom.window.Event('change'));
    await new Promise(resolve => setTimeout(resolve, 100));

    document.getElementById('input-website').value = 'https://example.com';
    document.getElementById('input-website').dispatchEvent(
        new dom.window.Event('input'));

    const qrEl = document.getElementById('card-qr-display');
    expect(qrEl).not.toBeNull();
    expect(qrEl.style.display).not.toBe('none');
  });

  it('should hide QR element when website is cleared', async () => {
    await initApp();
    const formatSelect = document.getElementById('format-select');
    formatSelect.value = 'modern.md';
    formatSelect.dispatchEvent(new dom.window.Event('change'));
    await new Promise(resolve => setTimeout(resolve, 100));

    const websiteInput = document.getElementById('input-website');
    websiteInput.value = '';
    websiteInput.dispatchEvent(new dom.window.Event('input'));

    const qrEl = document.getElementById('card-qr-display');
    expect(qrEl).not.toBeNull();
    expect(qrEl.style.display).toBe('none');
  });
});
