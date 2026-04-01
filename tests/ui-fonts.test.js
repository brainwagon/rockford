import {describe, it, expect, beforeEach} from 'vitest';
import {JSDOM} from 'jsdom';
import fs from 'fs';
import {fileURLToPath} from 'url';
import {dirname, resolve} from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const html = fs.readFileSync(resolve(__dirname, '../index.html'), 'utf8');

describe('UI: Font Dropdown', () => {
  let dom;
  let document;

  beforeEach(() => {
    dom = new JSDOM(html);
    document = dom.window.document;
  });

  it('should have a font selection dropdown with correct ID', () => {
    const fontSelect = document.getElementById('font-select');
    expect(fontSelect).not.toBeNull();
    expect(fontSelect.tagName).toBe('SELECT');
  });

  it('should contain "Default System Fonts" as the first option', () => {
    const fontSelect = document.getElementById('font-select');
    const firstOption = fontSelect.options[0];
    expect(firstOption.value).toBe('default');
    expect(firstOption.textContent).toBe('Default System Fonts');
  });

  it('should contain 10 professional font pairs', () => {
    const fontSelect = document.getElementById('font-select');
    // total options = 1 (default) + 10 (pairs) = 11
    expect(fontSelect.options.length).toBe(11);
  });

  it('should have Montserrat + Merriweather as one of the options', () => {
    const fontSelect = document.getElementById('font-select');
    const options = Array.from(fontSelect.options);
    const hasMontserrat = options.some((opt) =>
      opt.value === 'montserrat_merriweather' &&
      opt.textContent === 'Montserrat + Merriweather',
    );
    expect(hasMontserrat).toBe(true);
  });
});
