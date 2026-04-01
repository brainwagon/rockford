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
