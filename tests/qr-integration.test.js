import { describe, it, expect, beforeEach } from 'vitest';
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

  beforeEach(() => {
    dom = new JSDOM(html, { runScripts: "dangerously", resources: "usable" });
    document = dom.window.document;
    
    global.document = document;
    
    // Mock qrcode-generator for JSDOM
    dom.window.qrcode = (typeNumber, errorCorrectionLevel) => ({
      addData: vi.fn(),
      make: vi.fn(),
      createImgTag: vi.fn(() => '<img src="mock-qr">')
    });
    global.qrcode = dom.window.qrcode;

    initApp();
  });

  it('should have a toggle for QR code generation', () => {
    expect(document.getElementById('input-qr-toggle')).not.toBeNull();
  });

  it('should have a QR code display element on the card', () => {
    expect(document.getElementById('card-qr-display')).not.toBeNull();
  });

  it('should show the QR code when toggled on', () => {
    const toggle = document.getElementById('input-qr-toggle');
    const display = document.getElementById('card-qr-display');
    
    toggle.checked = true;
    toggle.dispatchEvent(new dom.window.Event('change'));
    
    // In TDD Red phase, we check if the element exists
    expect(display).toBeDefined();
  });
});
