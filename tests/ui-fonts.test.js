import { describe, it, expect, beforeEach, vi } from 'vitest';
import { JSDOM } from 'jsdom';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const html = fs.readFileSync(resolve(__dirname, '../index.html'), 'utf8');
import { FONT_PAIRS } from '../js/fonts.js';

describe('Font Selection UI', () => {
  let dom;
  let document;

  beforeEach(() => {
    dom = new JSDOM(html);
    document = dom.window.document;
  });

  it('should have a font selection dropdown with id "font-select"', () => {
    const select = document.getElementById('font-select');
    expect(select).not.toBeNull();
    expect(select.tagName).toBe('SELECT');
  });

  it('should be populated with 10 font pairs plus a default option', () => {
    const select = document.getElementById('font-select');
    // Default (1) + 10 pairs = 11 options
    // Assuming we have a "Default System Fonts" option
    expect(select.options.length).toBeGreaterThanOrEqual(10);
    
    const optionValues = Array.from(select.options).map(o => o.value);
    Object.keys(FONT_PAIRS).forEach(id => {
        expect(optionValues.includes(id)).toBe(true);
    });
  });
});
