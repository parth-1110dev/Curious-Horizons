/**
 * Shared motion utilities.
 */

/**
 * Checks if the user prefers reduced motion.
 * @returns {boolean} True if reduced motion is preferred.
 */
export function isReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * A helper to gracefully run animations if motion is not reduced.
 * @param {Function} animFn Function containing GSAP animations
 * @param {Function} [fallbackFn] Optional fallback function
 */
export function withMotion(animFn, fallbackFn) {
  if (!isReducedMotion()) {
    animFn();
  } else if (fallbackFn) {
    fallbackFn();
  }
}
