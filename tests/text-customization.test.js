import { describe, it, expect, beforeEach } from 'vitest';
import { JSDOM } from 'jsdom';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const html = fs.readFileSync(resolve(__dirname, '../index.html'), 'utf8');
const js = fs.readFileSync(resolve(__dirname, '../js/app.js'), 'utf8');

describe('Text Customization System', () => {
  let dom;
  let document;

  beforeEach(() => {
    dom = new JSDOM(html, { runScripts: "dangerously", resources: "usable" });
    document = dom.window.document;
    
    const scriptEl = document.createElement('script');
    scriptEl.textContent = js;
    document.body.appendChild(scriptEl);
    
    const event = new dom.window.Event('DOMContentLoaded');
    document.dispatchEvent(event);
  });

  it('should have input fields for Name, Title, Email, Phone, and Website', () => {
    expect(document.getElementById('input-name')).not.toBeNull();
    expect(document.getElementById('input-title')).not.toBeNull();
    expect(document.getElementById('input-email')).not.toBeNull();
    expect(document.getElementById('input-phone')).not.toBeNull();
    expect(document.getElementById('input-website')).not.toBeNull();
  });

  it('should update the preview name when name input changes', () => {
    const input = document.getElementById('input-name');
    const display = document.getElementById('card-name-display');
    
    input.value = 'Jane Smith';
    input.dispatchEvent(new dom.window.Event('input'));
    
    expect(display.textContent).toBe('Jane Smith');
  });

  it('should update the preview title when title input changes', () => {
    const input = document.getElementById('input-title');
    const display = document.getElementById('card-title-display');
    
    input.value = 'Senior Architect';
    input.dispatchEvent(new dom.window.Event('input'));
    
    expect(display.textContent).toBe('Senior Architect');
  });
});
