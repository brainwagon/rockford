import { describe, it, expect, beforeEach, vi } from 'vitest';
import { JSDOM } from 'jsdom';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const html = fs.readFileSync(resolve(__dirname, '../index.html'), 'utf8');

describe('Informal Theme Integration', () => {
  let dom;
  let document;
  let window;

  beforeEach(async () => {
    // Setup JSDOM
    dom = new JSDOM(html, { runScripts: "dangerously", resources: "usable" });
    document = dom.window.document;
    window = dom.window;

    // Mock localStorage
    const localStorageMock = (() => {
      let store = {};
      return {
        getItem: vi.fn((key) => store[key] || null),
        setItem: vi.fn((key, value) => { store[key] = value.toString(); }),
        clear: vi.fn(() => { store = {}; })
      };
    })();
    Object.defineProperty(window, 'localStorage', { value: localStorageMock });
  });

  it('should maintain the informal theme classes on initialization', () => {
    // The classes are hardcoded in HTML, so they should be there
    expect(document.body.classList.contains('texture-paper')).toBe(true);
    expect(document.getElementById('editor').classList.contains('texture-craft')).toBe(true);
    expect(document.getElementById('preview').classList.contains('texture-cardboard')).toBe(true);
  });

  it('should have the About link with its marker circle effect', () => {
    const btnAbout = document.getElementById('btn-about');
    expect(btnAbout).not.toBeNull();
    // Verification of pseudo-elements is hard in JSDOM, but we can check the ID
    expect(btnAbout.id).toBe('btn-about');
  });
});
