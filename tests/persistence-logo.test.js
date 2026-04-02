import { describe, it, expect, beforeEach, vi } from 'vitest';
import { JSDOM } from 'jsdom';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const html = fs.readFileSync(resolve(__dirname, '../index.html'), 'utf8');
import { initApp } from '../js/app.js';

describe('Logo Persistence', () => {
  let dom;
  let document;

  const mockLogoData = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';

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

    // Mock FileReader unconditionally for JSDOM
    dom.window.FileReader = class {
        readAsDataURL(file) {
            setTimeout(() => {
                if (this.onload) {
                    this.onload({ target: { result: mockLogoData } });
                }
            }, 0);
        }
    };

    global.FileReader = dom.window.FileReader;
  });

  it('should save the logo base64 to localStorage when uploaded', async () => {
    initApp();
    const inputLogo = document.getElementById('input-logo');
    const mockFile = new dom.window.File([''], 'test.png', { type: 'image/png' });
    
    // Manual trigger of the change logic if event dispatch is flaky
    // But let's try standard dispatch first with proper properties
    Object.defineProperty(inputLogo, 'files', {
        value: [mockFile],
        writable: false
    });
    inputLogo.dispatchEvent(new dom.window.Event('change', { bubbles: true }));

    // Wait for FileReader and Debounce
    await new Promise(resolve => setTimeout(resolve, 800));

    expect(global.localStorage.setItem).toHaveBeenCalled();
    const savedData = JSON.parse(global.localStorage.getItem('rockford_state'));
    expect(savedData.logo).toBe(mockLogoData);
  });

  it('should restore the logo from localStorage on init', () => {
    global.localStorage.setItem('rockford_state', JSON.stringify({ logo: mockLogoData }));
    
    initApp();
    
    const img = document.getElementById('card-logo-display').querySelector('img');
    expect(img).not.toBeNull();
    expect(img.src).toBe(mockLogoData);
  });
});
