/**
 * Bounding Box Utility for the Business Card Layout Engine
 */

/**
 * Calculates the absolute bounding rectangle of an element relative to the document.
 * @param {HTMLElement} el 
 * @returns {DOMRect}
 */
export function getAbsoluteBoundingRect(el) {
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
 * Iteratively reduces the font size of an element until it fits within a container 
 * and does not overlap with specified target elements.
 * @param {HTMLElement} el The element to scale
 * @param {Object} containerRect Bounding rect of the parent container
 * @param {Array<Object>} avoidRects Array of bounding rects to avoid overlapping
 * @param {number} minFontSize Minimum allowed font size
 */
export function autoScaleElement(el, containerRect, avoidRects = [], minFontSize = 8) {
    let currentFontSize = parseFloat(window.getComputedStyle(el).fontSize);
    
    const checkConstraints = () => {
        const rect = getAbsoluteBoundingRect(el);
        if (isOverflowing(rect, containerRect)) return true;
        for (const avoid of avoidRects) {
            if (isOverlapping(rect, avoid)) return true;
        }
        return false;
    };

    while (checkConstraints() && currentFontSize > minFontSize) {
        currentFontSize -= 1;
        el.style.fontSize = `${currentFontSize}px`;
    }
}

/**
 * Resets the font size of an element to its original template state.
 * @param {HTMLElement} el 
 */
export function resetElementScaling(el) {
    el.style.fontSize = '';
}
