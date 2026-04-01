# Implementation Plan: Sophisticated Layout Engine

## Phase 1: Geometry & Collision Detection Core [checkpoint: 9ad4eb7]
- [x] Task: Implement Bounding Box Utility (8c35d22)
    - [x] Write tests for calculating absolute bounding boxes of DOM elements
    - [x] Implement utility to get reliable coordinates for Card, Logo, QR, and Text elements
- [x] Task: Implement Collision Detection Logic (8729d1e)
    - [x] Write tests for detecting intersection between two rectangles
    - [x] Implement `isOverlapping(el1, el2)` and `isOverflowing(child, parent)` functions
- [x] Task: Conductor - User Manual Verification 'Phase 1: Geometry & Collision Detection Core' (Protocol in workflow.md)

## Phase 2: Auto-Scaling Engine
- [x] Task: Implement Iterative Reduction Algorithm (685219a)
    - [x] Write tests for font-size reduction logic until fit is achieved
    - [x] Implement the core scaling loop with min-size threshold (8px)
- [~] Task: Orientation and Template Awareness
    - [ ] Write tests for scaling behavior in both Landscape and Portrait modes
    - [ ] Ensure scaling resets correctly when templates or orientations switch
- [ ] Task: Conductor - User Manual Verification 'Phase 2: Auto-Scaling Engine' (Protocol in workflow.md)

## Phase 3: Integration & Performance
- [ ] Task: Hook Engine into Live Preview
    - [ ] Write integration tests for input-triggered scaling
    - [ ] Refactor `js/app.js` to run the layout engine on every relevant DOM update
- [ ] Task: Performance Optimization & Polish
    - [ ] Write tests for execution speed and visual stability (no flickering)
    - [ ] Implement debouncing or requestAnimationFrame optimization if needed
- [ ] Task: Conductor - User Manual Verification 'Phase 3: Integration & Performance' (Protocol in workflow.md)
