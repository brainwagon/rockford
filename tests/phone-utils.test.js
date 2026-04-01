import {describe, it, expect} from 'vitest';
import {formatPhoneNumber} from '../js/phone-utils.js';

describe('formatPhoneNumber', () => {
  it('should format a 10-digit number correctly', () => {
    expect(formatPhoneNumber('5551234567')).toBe('(555) 123-4567');
  });

  it('should format partial inputs correctly', () => {
    expect(formatPhoneNumber('5')).toBe('(5');
    expect(formatPhoneNumber('555')).toBe('(555');
    expect(formatPhoneNumber('5551')).toBe('(555) 1');
    expect(formatPhoneNumber('555123')).toBe('(555) 123');
    expect(formatPhoneNumber('5551234')).toBe('(555) 123-4');
  });

  it('should strip non-digit characters and format', () => {
    expect(formatPhoneNumber('555-123-4567')).toBe('(555) 123-4567');
    expect(formatPhoneNumber('(555) 1234567')).toBe('(555) 123-4567');
    expect(formatPhoneNumber('555.123.4567')).toBe('(555) 123-4567');
  });

  it('should handle more than 10 digits by truncating or passthrough (truncating preferred for mask)', () => {
    // Standard US mask usually truncates at 10 for the UI
    expect(formatPhoneNumber('555123456789')).toBe('(555) 123-4567');
  });

  it('should return raw input if it contains letters and cannot be formatted as a 10-digit number', () => {
    expect(formatPhoneNumber('call-me-now')).toBe('call-me-now');
  });

  it('should handle empty input', () => {
    expect(formatPhoneNumber('')).toBe('');
  });
});
