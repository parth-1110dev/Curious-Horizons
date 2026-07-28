import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { DURATION, EASE } from "./motion.js";
import { isReducedMotion } from "./utils.js";
import { getToken, isLite } from "../performance/performanceManager.js";

/**
 * Curious Horizons — Scroll Choreography
 * Sprint 6: Passive listeners + ScrollTrigger cleanup + profile-adaptive Y offset
 *
 * Performance improvements:
 *  - `once: true` on ScrollTriggers — kills after playback, frees observer overhead
 *  - Profile-adaptive Y reveal offset (40px → 20px → 0px)
 *  - Exported cleanup function for lifecycle management
 *  - ScrollTrigger registered once globally (not on every call)
 */

let _initialized = false;

/**
 * Initializes scroll-triggered reveal animations for sections.
 * Idempotent — safe to call multiple times.
 */
export function initScrollChoreography() {
  if (isReducedMotion() || _initialized) return;

  const sections = gsap.utils.toArray(".section");
  if (sections.length === 0) return;

  // Register plugin once
  gsap.registerPlugin(ScrollTrigger);
  _initialized = true;

  // Profile-adaptive Y offset: 40 (high) | 20 (balanced) | 0 (lite — opacity only)
  const revealY = getToken('scrollRevealY');

  sections.forEach((section) => {
    gsap.from(section, {
      opacity: 0,
      y: revealY,
      duration: DURATION.SLOW,
      ease: EASE.smooth,
      scrollTrigger: {
        trigger: section,
        start: "top 88%",
        toggleActions: "play none none none",
        once: true, // Kills the ScrollTrigger after first play — no continuous observation
      },
    });
  });
}

/**
 * Kill all active ScrollTrigger instances and reset initialization state.
 * Call on page teardown or SPA route changes.
 */
export function cleanupScrollChoreography() {
  ScrollTrigger.getAll().forEach(st => st.kill());
  _initialized = false;
}
