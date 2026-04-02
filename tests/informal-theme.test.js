import { describe, it, expect, beforeEach } from 'vitest';
import { JSDOM } from 'jsdom';
import fs from 'fs';
import path from 'path';

import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const html = fs.readFileSync(resolve(__dirname, '../index.html'), 'utf8');
const css = fs.readFileSync(resolve(__dirname, '../css/style.css'), 'utf8');

describe('Informal Theme Foundation', () => {
  let dom;
  let document;

  beforeEach(() => {
    dom = new JSDOM(html);
    document = dom.window.document;
  });

  it('should have Google Fonts link for Gloria Hallelujah, Indie Flower, and Patrick Hand', () => {
    const links = Array.from(document.querySelectorAll('link[rel="stylesheet"], link[href*="fonts.googleapis.com"]'));
    const fontLink = links.find(l => l.getAttribute('href')?.includes('Gloria+Hallelujah'));
    
    expect(fontLink).not.toBeUndefined();
    expect(fontLink.getAttribute('href')).toContain('Indie+Flower');
    expect(fontLink.getAttribute('href')).toContain('Patrick+Hand');
  });

  it('should have the correct CSS variables defined in style.css', () => {
    expect(css).toContain('--font-informal-heading: \'Gloria Hallelujah\', cursive;');
    expect(css).toContain('--font-informal-body: \'Indie Flower\', cursive;');
    expect(css).toContain('--font-informal-labels: \'Patrick Hand\', cursive;');
    
    expect(css).toContain('--color-marker-blue: #2e5cb8;');
    expect(css).toContain('--color-felt-red: #d92b2b;');
    expect(css).toContain('--color-tape-yellow: #fdfd96;');
    expect(css).toContain('--color-marker-green: #228b22;');
    expect(css).toContain('--color-craft-paper: #d2b48c;');
    expect(css).toContain('--color-cardboard: #8b5a2b;');
    expect(css).toContain('--color-pen-black: #1a1a1a;');
  });
});
