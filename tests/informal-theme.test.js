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

  it('should have texture classes defined in style.css', () => {
    expect(css).toContain('.texture-paper');
    expect(css).toContain('.texture-craft');
    expect(css).toContain('.texture-cardboard');
    expect(css).toContain('.texture-felt');
  });

  it('should have 3D paper layer classes defined in style.css', () => {
    expect(css).toContain('.paper-stack');
    expect(css).toContain('.paper-layer');
    expect(css).toContain('.paper-layer::before');
  });

  it('should have texture and paper layer classes applied to elements in index.html', () => {
    const body = document.querySelector('body');
    const app = document.getElementById('app');
    const editor = document.getElementById('editor');
    const preview = document.getElementById('preview');

    expect(body.classList.contains('texture-paper')).toBe(true);
    expect(app.classList.contains('paper-stack')).toBe(true);
    expect(editor.classList.contains('texture-craft')).toBe(true);
    expect(editor.classList.contains('paper-layer')).toBe(true);
    expect(preview.classList.contains('texture-cardboard')).toBe(true);
    expect(preview.classList.contains('paper-layer')).toBe(true);
  });

  it('should have organic shapes and informal fonts for interactive elements', () => {
    expect(css).toContain('button {');
    expect(css).toContain('border-radius: 255px 15px 225px 15px/15px 225px 15px 255px;');
    expect(css).toContain('font-family: var(--font-informal-labels);');
    
    expect(css).toContain('select {');
    expect(css).toContain('border: 2px solid var(--color-marker-blue);');
    
    expect(css).toContain('.input-group input {');
    expect(css).toContain('border: 2px solid var(--color-marker-blue);');
  });

  it('should have decorative elements in index.html', () => {
    const tapes = document.querySelectorAll('.tape');
    expect(tapes.length).toBeGreaterThanOrEqual(2);
    
    const editorTape = document.querySelector('#editor .tape');
    expect(editorTape).not.toBeNull();
    
    const previewTape = document.querySelector('#preview .tape');
    expect(previewTape).not.toBeNull();
  });
});
