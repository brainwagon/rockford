# Implementation Plan: Sophisticated Layout Engine

## Phase 1: Geometry & Collision Detection Core [checkpoint: 9ad4eb7]
- [x] Task: Implement Bounding Box Utility (8c35d22)
    - [x] Write tests for calculating absolute bounding boxes of DOM elements
    - [x] Implement utility to get reliable coordinates for Card, Logo, QR, and Text elements
- [x] Task: Implement Collision Detection Logic (8729d1e)
    - [x] Write tests for detecting intersection between two rectangles
    - [x] Implement `isOverlapping(el1, el2)` and `isOverflowing(child, parent)` functions
- [x] Task: Conductor - User Manual Verification 'Phase 1: Geometry & Collision Detection Core' (Protocol in workflow.md)

## Phase 2: Auto-Scaling Engine [checkpoint: 4380dbf]
- [x] Task: Implement Iterative Reduction Algorithm (685219a)
    - [x] Write tests for font-size reduction logic until fit is achieved
    - [x] Implement the core scaling loop with min-size threshold (8px)
- [x] Task: Orientation and Template Awareness (0f52cdd)
    - [x] Write tests for scaling behavior in both Landscape and Portrait modes
    - [x] Ensure scaling resets correctly when templates or orientations switch
- [x] Task: Conductor - User Manual Verification 'Phase 2: Auto-Scaling Engine' (Protocol in workflow.md)

## Phase 3: Integration & Performance [checkpoint: 6d5518b]
- [x] Task: Hook Engine into Live Preview (72d0a3d)
    - [x] Write integration tests for input-triggered scaling
    - [x] Refactor `js/app.js` to run the layout engine on every relevant DOM update
- [x] Task: Performance Optimization & Polish (2bb8625)
    - [x] Write tests for execution speed and visual stability (no flickering)
    - [x] Implement debouncing or requestAnimationFrame optimization if needed
- [x] Task: Conductor - User Manual Verification 'Phase 3: Integration & Performance' (Protocol in workflow.md)
