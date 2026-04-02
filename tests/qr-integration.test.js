import { describe, it, expect, beforeEach, vi } from 'vitest';
import { JSDOM } from 'jsdom';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const html = fs.readFileSync(resolve(__dirname, '../index.html'), 'utf8');
import { initApp } from '../js/app.js';

describe('QR Code Integration', () => {
  let dom;
  let document;

  beforeEach(async () => {
    dom = new JSDOM(html, { runScripts: "dangerously", resources: "usable" });
    document = dom.window.document;

    global.document = document;
    global.window = dom.window;

    const localStorageMock = (() => {
      let store = {};
      return {
        getItem: vi.fn(key => store[key] || null),
        setItem: vi.fn((key, value) => { store[key] = value.toString(); }),
        clear: vi.fn(() => { store = {}; }),
      };
    })();
    global.localStorage = localStorageMock;

    // Mock qrcode-generator for JSDOM
    global.qrcode = () => ({
      addData: vi.fn(),
      make: vi.fn(),
      createImgTag: vi.fn(() => '<img src="mock-qr">'),
    });

    await initApp();

    // Switch to modern format which includes a QRCode item
    const formatSelect = document.getElementById('format-select');
    formatSelect.value = 'modern.md';
    formatSelect.dispatchEvent(new dom.window.Event('change'));
    await new Promise(resolve => setTimeout(resolve, 100));
  });

  it('should have a QR code display element on the card when format includes one', () => {
    expect(document.getElementById('card-qr-display')).not.toBeNull();
  });

  it('should show the QR element when Website URL is provided', () => {
    const websiteInput = document.getElementById('input-website');
    websiteInput.value = 'https://example.com';
    websiteInput.dispatchEvent(new dom.window.Event('input'));

    const qrEl = document.getElementById('card-qr-display');
    expect(qrEl.style.display).not.toBe('none');
  });

  it('should hide the QR element when Website URL is empty', () => {
    const websiteInput = document.getElementById('input-website');
    websiteInput.value = '';
    websiteInput.dispatchEvent(new dom.window.Event('input'));

    const qrEl = document.getElementById('card-qr-display');
    expect(qrEl.style.display).toBe('none');
  });
});
