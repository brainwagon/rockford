import { describe, it, expect, beforeEach } from 'vitest';
import { JSDOM } from 'jsdom';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const html = fs.readFileSync(resolve(__dirname, '../index.html'), 'utf8');

const js = fs.readFileSync(resolve(__dirname, '../js/app.js'), 'utf8');

describe('Template Selection Component', () => {
  let dom;
  let document;

  beforeEach(() => {
    dom = new JSDOM(html, { runScripts: "dangerously", resources: "usable" });
    document = dom.window.document;
    
    // Inject the script
    const scriptEl = document.createElement('script');
    scriptEl.textContent = js;
    document.body.appendChild(scriptEl);
    
    // Manually trigger DOMContentLoaded if needed or wait
    const event = new dom.window.Event('DOMContentLoaded');
    document.dispatchEvent(event);
  });

  it('should have orientation selection buttons', () => {
    const landscapeBtn = document.getElementById('btn-landscape');
    const portraitBtn = document.getElementById('btn-portrait');
    expect(landscapeBtn).not.toBeNull();
    expect(portraitBtn).not.toBeNull();
  });

  it('should have a template selection dropdown or list', () => {
    const templateSelect = document.getElementById('template-select');
    expect(templateSelect).not.toBeNull();
  });

  it('should default to landscape orientation', () => {
    const card = document.getElementById('business-card');
    expect(card.classList.contains('landscape')).toBe(true);
  });

  it('should switch to portrait orientation when portrait button is clicked', () => {
    const portraitBtn = document.getElementById('btn-portrait');
    const landscapeBtn = document.getElementById('btn-landscape');
    const card = document.getElementById('business-card');
    
    // Simulate click
    portraitBtn.dispatchEvent(new dom.window.MouseEvent('click', { bubbles: true }));
    
    expect(card.classList.contains('portrait')).toBe(true);
    expect(card.classList.contains('landscape')).toBe(false);
    expect(portraitBtn.classList.contains('active')).toBe(true);
    expect(landscapeBtn.classList.contains('active')).toBe(false);
  });

  it('should change template class when select value changes', () => {
    const templateSelect = document.getElementById('template-select');
    const card = document.getElementById('business-card');
    
    templateSelect.value = 'modern';
    templateSelect.dispatchEvent(new dom.window.Event('change'));
    
    expect(card.classList.contains('modern')).toBe(true);
    expect(card.classList.contains('minimal')).toBe(false);
  });
});
