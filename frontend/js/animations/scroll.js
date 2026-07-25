import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { DURATION, EASE } from "./motion.js";
import { isReducedMotion } from "./utils.js";

/**
 * Initializes scroll-triggered reveal animations for sections.
 * This handles generic scroll choreography.
 */
export function initScrollChoreography() {
  if (isReducedMotion()) return;

  const sections = gsap.utils.toArray(".section");
  if (sections.length === 0) return;

  gsap.registerPlugin(ScrollTrigger);

  sections.forEach((section) => {
    // Instead of snapping, we use a slower smooth ease for natural reveals
    gsap.from(section, {
      opacity: 0,
      y: 40, // subtle upward movement
      duration: DURATION.SLOW,
      ease: EASE.smooth,
      scrollTrigger: {
        trigger: section,
        start: "top 85%",
        toggleActions: "play none none none",
      },
    });
  });
}
