import { describe, it, expect, beforeEach, vi } from 'vitest';
import { JSDOM } from 'jsdom';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const html = fs.readFileSync(resolve(__dirname, '../index.html'), 'utf8');
import { initApp } from '../js/app.js';

describe('Company Name Layout Scaling', () => {
  let dom;
  let document;

  beforeEach(() => {
    dom = new JSDOM(html, { runScripts: "dangerously", resources: "usable" });
    document = dom.window.document;
    global.document = document;
    global.window = dom.window;

    // Polyfill localStorage
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

    // Mock getBoundingClientRect to trigger overflow
    dom.window.Element.prototype.getBoundingClientRect = vi.fn(function() {
        const id = this.id;
        const fontSize = parseFloat(this.style.fontSize) || 16;
        
        // If it's the company display, make it "overflow" if fontSize is high
        if (id === 'card-company-display' && fontSize > 10) {
            return { width: 500, height: 50, top: 0, left: 0, right: 500, bottom: 50, x: 0, y: 0 };
        }
        
        // Default small rect
        return { width: 50, height: 20, top: 0, left: 0, right: 50, bottom: 20, x: 0, y: 0 };
    });

    // Mock getComputedStyle
    dom.window.getComputedStyle = vi.fn((el) => ({
        fontSize: el.style.fontSize || '16px'
    }));

    initApp();
  });

  it('should scale down the company name if it overflows', async () => {
    const input = document.getElementById('input-company');
    const display = document.getElementById('card-company-display');
    
    // Trigger update and layout
    input.value = 'Very Very Long Company Name That Definitely Overflows';
    input.dispatchEvent(new dom.window.Event('input'));
    
    // Layout engine might be async or delayed, but initApp calls it with immediate=true in some cases
    // or we can manually trigger it if we export it, but it's internal to initApp.
    // However, the input listener calls runLayoutEngine() which is debounced.
    
    // Let's wait for debounce
    await new Promise(res => setTimeout(res, 100));
    
    const finalFontSize = parseFloat(display.style.fontSize);
    // Since we mocked company display to overflow if fontSize > 10, 
    // it should be scaled down to 10 or less.
    expect(finalFontSize).toBeLessThan(16);
    expect(finalFontSize).toBeGreaterThanOrEqual(8);
  });
});
