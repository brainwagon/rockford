import { describe, it, expect, beforeEach, vi } from 'vitest';
import { JSDOM } from 'jsdom';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const html = fs.readFileSync(resolve(__dirname, '../index.html'), 'utf8');
import { initApp } from '../js/app.js';

describe('Bounding Box Utility', () => {
  let dom;
  let document;

  beforeEach(() => {
    dom = new JSDOM(html, { runScripts: "dangerously", resources: "usable" });
    document = dom.window.document;
    global.document = document;
    global.window = dom.window;
    
    // Mock localStorage
    const localStorageMock = (() => {
      let store = {};
      return {
        getItem: vi.fn(key => store[key] || null),
        setItem: vi.fn((key, value) => { store[key] = value.toString(); }),
        clear: vi.fn(() => { store = {}; })
      };
    })();
    global.localStorage = localStorageMock;

    // Mock getBoundingClientRect
    // JSDOM doesn't implement layout, so we must mock this for each element
    dom.window.Element.prototype.getBoundingClientRect = vi.fn(function() {
        return {
            width: parseFloat(this.style.width) || 0,
            height: parseFloat(this.style.height) || 0,
            top: parseFloat(this.style.top) || 0,
            left: parseFloat(this.style.left) || 0,
            bottom: (parseFloat(this.style.top) || 0) + (parseFloat(this.style.height) || 0),
            right: (parseFloat(this.style.left) || 0) + (parseFloat(this.style.width) || 0),
            x: parseFloat(this.style.left) || 0,
            y: parseFloat(this.style.top) || 0
        };
    });

    initApp();
  });

  it('should return correct absolute coordinates for an element', async () => {
    // We'll implement this utility in js/layout.js
    const { getAbsoluteBoundingRect } = await import('../js/layout.js');
    
    const element = document.createElement('div');
    element.style.width = '100px';
    element.style.height = '50px';
    element.style.left = '10px';
    element.style.top = '20px';
    
    const rect = getAbsoluteBoundingRect(element);
    
    expect(rect.width).toBe(100);
    expect(rect.height).toBe(50);
    expect(rect.left).toBe(10);
    expect(rect.top).toBe(20);
  });
});
