# Specification: Phone Number Formatting

## Overview
This track implements standardized phone number formatting for the Business Card Generator. When a user enters a phone number, it should be formatted as `(XXX) XXX-XXXX` both in the input field and on the business card preview.

## Functional Requirements
- **Input Masking/Formatting:** As the user types in the "Phone Number" field (`#input-phone`), the text should automatically format to `(XXX) XXX-XXXX`.
- **Preview Formatting:** The phone number displayed on the business card (`#card-phone-display`) must match the formatted standard.
- **Handling Non-Digits:** The formatter should prioritize digits and handle cases where non-digit characters are entered by stripping them or applying the mask over them.
- **Partial Input:** If the user has entered fewer than 10 digits, the formatted version should still follow the pattern as far as possible (e.g., `(555) 1`).
- **Invalid Input Handling:** If the input cannot be reasonably formatted as a standard US-style 10-digit number, the raw input should be passed through to ensure the user can still display their data.

## Non-Functional Requirements
- **Real-time Updates:** The formatting and preview update should happen instantaneously as the user types.
- **No Dependencies:** Use Vanilla JavaScript for implementation as per the project's tech stack.

## Acceptance Criteria
- Typing `5551234567` results in `(555) 123-4567` in the input field.
- The business card preview displays `(555) 123-4567`.
- Deleting characters correctly updates the formatting.
- Non-numeric characters (other than the mask itself) are handled gracefully.

## Out of Scope
- International phone number validation.
- SMS verification.
