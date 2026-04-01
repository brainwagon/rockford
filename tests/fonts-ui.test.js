/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { FONT_PAIRS, applyFontPair } from '../js/fonts.js';

describe('applyFontPair', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <div id="business-card">
        <h1 id="card-name-display">John Doe</h1>
        <p id="card-title-display">Professional Title</p>
        <div class="card-contact">
          <p id="card-email-display">john@example.com</p>
        </div>
      </div>
    `;
  });

  it('should apply fonts for a valid font pair ID using CSS variables', () => {
    const pairId = 'montserrat_merriweather';
    const pair = FONT_PAIRS[pairId];
    const card = document.getElementById('business-card');
    
    applyFontPair(pairId);
    
    expect(card.style.getPropertyValue('--heading-font')).toBe(pair.headingFont);
    expect(card.style.getPropertyValue('--body-font')).toBe(pair.bodyFont);
  });

  it('should reset to default fonts when "default" is passed', () => {
    const card = document.getElementById('business-card');
    card.style.setProperty('--heading-font', 'some-font');
    card.style.setProperty('--body-font', 'other-font');
    
    applyFontPair('default');
    
    expect(card.style.getPropertyValue('--heading-font')).toBe('');
    expect(card.style.getPropertyValue('--body-font')).toBe('');
  });

  it('should do nothing if business-card element is missing', () => {
    document.getElementById('business-card').remove();
    // Should not throw
    applyFontPair('montserrat_merriweather');
  });
});
