/**
 * @vitest-environment jsdom
 */
import {describe, it, expect, beforeEach, afterEach, vi} from 'vitest';
import {FONT_PAIRS, injectGoogleFonts} from '../js/fonts.js';

describe('Font Pairs Data', () => {
  it('should contain 10 font pairs', () => {
    expect(Object.keys(FONT_PAIRS).length).toBe(10);
  });

  it('should have the correct structure for each pair', () => {
    Object.values(FONT_PAIRS).forEach((pair) => {
      expect(pair).toHaveProperty('id');
      expect(pair).toHaveProperty('name');
      expect(pair).toHaveProperty('headingFont');
      expect(pair).toHaveProperty('bodyFont');
      expect(pair).toHaveProperty('googleFontsUrl');
    });
  });

  it('should have unique IDs for each pair', () => {
    const ids = Object.values(FONT_PAIRS).map((p) => p.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });
});

describe('injectGoogleFonts', () => {
  beforeEach(() => {
    // Clear head from any previously injected font links
    const links = document.querySelectorAll('link[id^="google-fonts-"]');
    links.forEach((link) => link.remove());

    // JSDOM doesn't load external resources by default, so we mock onload
    const originalAppendChild = document.head.appendChild;
    vi.spyOn(document.head, 'appendChild').mockImplementation(function(node) {
      const result = originalAppendChild.call(this, node);
      if (node.tagName === 'LINK' && node.id.startsWith('google-fonts-')) {
        setTimeout(() => {
          if (node.onload) node.onload();
        }, 0);
      }
      return result;
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should inject a link tag for a valid font pair ID and return a Promise',
      async () => {
        const pairId = 'montserrat_merriweather';
        const pair = FONT_PAIRS[pairId];

        const promise = injectGoogleFonts(pairId);
        expect(promise).toBeInstanceOf(Promise);

        await promise;

        const link = document.getElementById(`google-fonts-${pairId}`);
        expect(link).not.toBeNull();
        expect(link.getAttribute('href')).toBe(pair.googleFontsUrl);
      });

  it('should return a resolved Promise if font already exists', async () => {
    const pairId = 'montserrat_merriweather';

    await injectGoogleFonts(pairId);
    const promise = injectGoogleFonts(pairId);

    expect(promise).toBeInstanceOf(Promise);
    await promise;

    const links = document.querySelectorAll(
        `link[id="google-fonts-${pairId}"]`);
    expect(links.length).toBe(1);
  });

  it('should not inject anything for an invalid font pair ID', () => {
    injectGoogleFonts('non_existent_id');
    const links = document.querySelectorAll('link[id^="google-fonts-"]');
    expect(links.length).toBe(0);
  });

  it('should handle the "default" font pair ID by doing nothing', () => {
    injectGoogleFonts('default');
    const links = document.querySelectorAll('link[id^="google-fonts-"]');
    expect(links.length).toBe(0);
  });
});
