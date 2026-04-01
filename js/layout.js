/**
 * Bounding Box Utility for the Business Card Layout Engine
 */

/**
 * Calculates the absolute bounding rectangle of an element relative to the document.
 * @param {HTMLElement} el 
 * @returns {Object}
 */
export function getAbsoluteBoundingRect(el) {
    if (!el) return { left: 0, top: 0, width: 0, height: 0, right: 0, bottom: 0, x: 0, y: 0 };
    const rect = el.getBoundingClientRect();
    const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    
    return {
        left: rect.left + scrollLeft,
        top: rect.top + scrollTop,
        width: rect.width,
        height: rect.height,
        right: rect.right + scrollLeft,
        bottom: rect.bottom + scrollTop,
        x: rect.x + scrollLeft,
        y: rect.y + scrollTop
    };
}

/**
 * Detects if two rectangles overlap.
 * @param {Object} rect1 
 * @param {Object} rect2 
 * @returns {boolean}
 */
export function isOverlapping(rect1, rect2) {
    return !(rect1.right < rect2.left || 
             rect1.left > rect2.right || 
             rect1.bottom < rect2.top || 
             rect1.top > rect2.bottom);
}

/**
 * Detects if a child rectangle overflows its parent.
 * @param {Object} child 
 * @param {Object} parent 
 * @returns {boolean}
 */
export function isOverflowing(child, parent) {
    return child.left < parent.left || 
           child.right > parent.right || 
           child.top < parent.top || 
           child.bottom > parent.bottom;
}

/**
 * Detects if a child rectangle overflows its parent horizontally.
 */
export function isHorizontallyOverflowing(child, parent) {
    return child.left < parent.left || child.right > parent.right;
}

/**
 * Iteratively reduces the font size of an element until it fits.
 * @param {HTMLElement} el The element to scale
 * @param {Object} containerRect Bounding rect of the parent container
 * @param {Array<Object>} avoidRects Array of bounding rects to avoid overlapping
 * @param {boolean} checkVertical Whether to also check for vertical overflow
 * @param {number} minFontSize Minimum allowed font size
 */
export function autoScaleElement(el, containerRect, avoidRects = [], checkVertical = true, minFontSize = 8) {
    let currentFontSize = parseFloat(window.getComputedStyle(el).fontSize);
    
    const checkConstraints = () => {
        const rect = getAbsoluteBoundingRect(el);
        
        // Horizontal overflow check
        if (isHorizontallyOverflowing(rect, containerRect)) return true;
        
        // Vertical overflow check (optional)
        if (checkVertical && (rect.bottom > containerRect.bottom || rect.top < containerRect.top)) return true;
        
        // Specific collision checks (Logo, QR, etc.)
        for (const avoid of avoidRects) {
            if (isOverlapping(rect, avoid)) return true;
        }
        return false;
    };

    while (checkConstraints() && currentFontSize > minFontSize) {
        currentFontSize -= 0.5; // Finer grain for better fit
        el.style.fontSize = `${currentFontSize}px`;
    }
}

/**
 * Scales an array of elements collectively until their total container fits vertically.
 */
export function scaleToFitHeight(elements, containerRect, minFontSize = 8) {
    // This is more complex, usually handled by scaling all elements by a ratio
    // For now, we'll implement a simpler iterative loop for the whole group if needed
}

/**
 * Resets the font size of an element to its original template state.
 * @param {HTMLElement} el 
 */
export function resetElementScaling(el) {
    if (el) el.style.fontSize = '';
}
