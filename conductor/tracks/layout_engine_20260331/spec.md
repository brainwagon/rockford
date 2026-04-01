# Specification: Sophisticated Layout Engine

## Overview
This track implements a sophisticated layout engine for the Business Card Generator. The primary goal is to prevent overlapping of text with UI elements (Logo and QR Code) and ensure all content fits vertically within the card's physical dimensions, regardless of string length.

## Scope
- **Collision Detection:** Monitoring the bounding boxes of text elements (Name, Title, Contact Info) against non-text elements (Logo, QR Code).
- **Auto-Scaling Logic:** Implementing an automated "Iterative Reduction" algorithm that adjusts font sizes dynamically.
- **Vertical Constraint Management:** Ensuring the combined height of all card content does not exceed the card's height.

## Functional Requirements
- **Automated Scaling:** On any text input or layout change, the engine will check for overflows or overlaps.
- **Iterative Reduction Algorithm:**
  1. Start with the base font size defined in the template.
  2. Check if the element overlaps with the Logo or QR Code, or if it causes a vertical overflow of the card.
  3. If an issue is detected, reduce the font size by 1px.
  4. Repeat until the content fits without collisions or reaches a minimum font size threshold (e.g., 8px).
- **Real-time Performance:** The layout engine must execute fast enough to maintain the "live preview" feel.
- **Orientation Awareness:** The engine must correctly handle both Landscape and Portrait layouts.

## Non-Functional Requirements
- **Visual Stability:** The scaling should be smooth and not cause flickering.
- **Maintainability:** The layout logic should be abstracted into a dedicated function or class.

## Acceptance Criteria
- Long names (e.g., "Mark VandeWettering") automatically shrink to avoid colliding with the top-right Logo.
- Long contact details do not overlap with the bottom-right QR code.
- Excessive text content is scaled down to stay within the vertical bounds of the card.
- The process is fully automated and requires no user intervention.
