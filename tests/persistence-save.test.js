import { describe, it, expect, beforeEach, vi } from 'vitest';
import { JSDOM } from 'jsdom';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const html = fs.readFileSync(resolve(__dirname, '../index.html'), 'utf8');
import { initApp } from '../js/app.js';

describe('Data Serialization & Storage', () => {
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
        setItem: vi.fn((key, value) => {
          store[key] = value.toString();
        }),
        clear: vi.fn(() => {
          store = {};
        })
      };
    })();
    global.localStorage = localStorageMock;
    
    initApp();
  });

  it('should save data to localStorage when an input changes', async () => {
    const inputName = document.getElementById('input-name');
    inputName.value = 'John Persistence';
    inputName.dispatchEvent(new dom.window.Event('input'));

    // Wait for debounce (assuming 500ms)
    await new Promise(resolve => setTimeout(resolve, 600));

    expect(global.localStorage.setItem).toHaveBeenCalled();
    const savedData = JSON.parse(global.localStorage.setItem.mock.calls[0][1]);
    expect(savedData.name).toBe('John Persistence');
  });

  it('should save the current template and orientation', async () => {
    const templateSelect = document.getElementById('template-select');
    templateSelect.value = 'modern';
    templateSelect.dispatchEvent(new dom.window.Event('change'));

    const btnPortrait = document.getElementById('btn-portrait');
    btnPortrait.dispatchEvent(new dom.window.MouseEvent('click', { bubbles: true }));

    // Wait for debounce
    await new Promise(resolve => setTimeout(resolve, 600));

    const savedData = JSON.parse(global.localStorage.setItem.mock.calls[0][1]);
    expect(savedData.template).toBe('modern');
    expect(savedData.orientation).toBe('portrait');
  });
});
