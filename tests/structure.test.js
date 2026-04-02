import { describe, it, expect, beforeEach } from 'vitest';
import { JSDOM } from 'jsdom';
import fs from 'fs';
import path from 'path';

import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const html = fs.readFileSync(resolve(__dirname, '../index.html'), 'utf8');

describe('Index HTML Structure', () => {
  let dom;
  let document;

  beforeEach(() => {
    dom = new JSDOM(html);
    document = dom.window.document;
  });

  it('should have a main container with id "app"', () => {
    const app = document.getElementById('app');
    expect(app).not.toBeNull();
  });

  it('should have a header with a title', () => {
    const header = document.querySelector('header h1');
    expect(header).not.toBeNull();
    expect(header.textContent).toContain('Rockford');
  });

  it('should have a section for the editor', () => {
    const editor = document.getElementById('editor');
    expect(editor).not.toBeNull();
  });

  it('should have a section for the preview', () => {
    const preview = document.getElementById('preview');
    expect(preview).not.toBeNull();
  });

  it('should have an "About" link in the navbar', () => {
    const btnAbout = document.getElementById('btn-about');
    expect(btnAbout).not.toBeNull();
    expect(btnAbout.textContent).toBe('About...');
  });

  it('should have an "About" dialog with correct content', () => {
    const aboutDialog = document.getElementById('about-dialog');
    expect(aboutDialog).not.toBeNull();
    const content = aboutDialog.querySelector('.dialog-content');
    expect(content).not.toBeNull();
    expect(content.textContent).toContain('The Rockford Files');
    expect(content.textContent).toContain('James Rockford');
    expect(content.textContent).toContain('Mark VandeWettering');
    expect(content.textContent).toContain('Claude Code');
    expect(content.textContent).toContain('Gemini');
  });
});
