import { initButtonInteractions } from "./buttons.js";
import { initHoverAnimations } from "./cards.js";
import { initHeroAnimation, initRevealAnimation } from "./pageTransitions.js";

/**
 * Global orchestrator for all microinteractions.
 * This should be called once the DOM is ready or when new elements are injected.
 */
export function initInteractions() {
  // Respect reduced-motion preference globally if needed, 
  // though individual modules can handle it gracefully.
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    // Only init essential transitions if motion is reduced
    initHeroAnimation();
    initRevealAnimation();
    return;
  }

  initHeroAnimation();
  initRevealAnimation();
  initHoverAnimations();
  initButtonInteractions();
}
