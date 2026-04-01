/**
 * Formats a string as a US phone number (XXX) XXX-XXXX.
 * @param {string} input - The raw input string.
 * @returns {string} The formatted phone number.
 */
export function formatPhoneNumber(input) {
  if (!input) return '';

  // Strip all non-digits
  const digits = input.replace(/\D/g, '');

  // If the input contains letters and doesn't look like a phone number,
  // return raw input (per specification requirements).
  if (digits.length === 0 && /[a-zA-Z]/.test(input)) {
    return input;
  }

  // Truncate to 10 digits
  const cleaned = digits.slice(0, 10);

  if (cleaned.length === 0) {
    // If we only had non-digits but no letters, return empty or raw?
    // Given the requirement "ensure the user can still display their data",
    // if it's all symbols but no digits, return raw.
    return input;
  }

  // Apply masking
  let formatted = '(';
  if (cleaned.length > 0) {
    formatted += cleaned.slice(0, 3);
  }
  if (cleaned.length > 3) {
    formatted += ') ' + cleaned.slice(3, 6);
  }
  if (cleaned.length > 6) {
    formatted += '-' + cleaned.slice(6, 10);
  }

  return formatted;
}
