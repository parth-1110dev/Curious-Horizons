import { initButtonInteractions } from "./buttons.js";
import { initHoverAnimations } from "./cards.js";
import { initHeroAnimation, initPageTransitions } from "./pageTransitions.js";
import { initScrollChoreography } from "./scroll.js";
import { initModalInteractions } from "./modals.js";
import { isReducedMotion } from "./utils.js";

/**
 * Global orchestrator for all microinteractions.
 * This should be called once the DOM is ready or when new elements are injected.
 */
export function initInteractions() {
  // Always initialize page transitions (it handles reduced motion internally)
  initPageTransitions();
  
  // Hero is essential for page entry
  initHeroAnimation();
  
  // Scroll choreography for reveals
  initScrollChoreography();

  // Component interactions
  initHoverAnimations();
  initButtonInteractions();
  initModalInteractions();
}
