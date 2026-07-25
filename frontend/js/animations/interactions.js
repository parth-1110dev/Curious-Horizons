import { initButtonInteractions } from "./buttons.js";
import { initHoverAnimations } from "./cards.js";
import { initHeroAnimation, initPageTransitions } from "./pageTransitions.js";
import { initScrollChoreography } from "./scroll.js";
import { initModalInteractions } from "./modals.js";
import { initAmbientLighting } from "../ambient-light.js";
import { isReducedMotion } from "./utils.js";

/**
 * Global orchestrator for all microinteractions.
 * This should be called once the DOM is ready or when new elements are injected.
 */
export function initInteractions() {
  // Determine page type for intelligent lighting config
  const path = window.location.pathname;
  let pageConfig = "home"; // default
  
  if (path.includes("knowledge-pack.html")) {
    pageConfig = "knowledge-pack";
  } else if (path.includes("pricing.html")) {
    pageConfig = "pricing";
  } else if (path.includes("session.html")) {
    pageConfig = "session";
  }

  // Initialize Global Lighting
  initAmbientLighting({ page: pageConfig });

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
