import { describe, it, expect, beforeEach, vi } from 'vitest';
import { JSDOM } from 'jsdom';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const html = fs.readFileSync(resolve(__dirname, '../index.html'), 'utf8');

describe('Orientation and Template Awareness', () => {
  let dom;
  let document;

  beforeEach(() => {
    dom = new JSDOM(html, { runScripts: "dangerously", resources: "usable" });
    document = dom.window.document;
    global.document = document;
    global.window = dom.window;
    
    // Polyfill for tests
    dom.window.getComputedStyle = vi.fn((el) => ({
        fontSize: el.style.fontSize || '16px'
    }));
  });

  it('should reset font sizes when switching orientation', async () => {
    const { resetElementScaling } = await import('../js/layout.js');
    
    const element = document.createElement('div');
    element.style.fontSize = '10px'; // Previously scaled down
    
    resetElementScaling(element);
    
    expect(element.style.fontSize).toBe('');
  });
});
