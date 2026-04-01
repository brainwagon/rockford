import { describe, it, expect, beforeEach, vi } from 'vitest';
import { JSDOM } from 'jsdom';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const html = fs.readFileSync(resolve(__dirname, '../index.html'), 'utf8');
import { initApp } from '../js/app.js';

describe('State Restoration', () => {
  let dom;
  let document;

  const mockState = {
    name: 'Restored Name',
    title: 'Restored Title',
    email: 'restored@example.com',
    phone: '123-456-7890',
    website: 'restored.com',
    template: 'modern',
    orientation: 'portrait',
    qrEnabled: true
  };

  beforeEach(() => {
    dom = new JSDOM(html, { runScripts: "dangerously", resources: "usable" });
    document = dom.window.document;
    
    global.document = document;
    global.window = dom.window;
    
    // Mock localStorage with predefined data
    const localStorageMock = (() => {
      let store = {
        'bmaker_state': JSON.stringify(mockState)
      };
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
  });

  it('should restore text fields from localStorage on init', () => {
    initApp();
    
    expect(document.getElementById('input-name').value).toBe(mockState.name);
    expect(document.getElementById('input-title').value).toBe(mockState.title);
    expect(document.getElementById('card-name-display').textContent).toBe(mockState.name);
  });

  it('should restore UI state (template/orientation) on init', () => {
    initApp();
    
    expect(document.getElementById('template-select').value).toBe(mockState.template);
    expect(document.getElementById('business-card').classList.contains('modern')).toBe(true);
    expect(document.getElementById('business-card').classList.contains('portrait')).toBe(true);
  });
});
