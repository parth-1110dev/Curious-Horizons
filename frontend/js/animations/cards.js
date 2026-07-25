import { gsap } from "gsap";
import { DURATION, EASE, MOTION_PROPS } from "./motion.js";
import { isReducedMotion } from "./utils.js";

export function initHoverAnimations() {
  // Gracefully ignore hover on touch devices or if reduced motion is requested
  if (!window.matchMedia("(hover: hover)").matches || isReducedMotion()) {
    return;
  }

  const cards = document.querySelectorAll(".feature-card, .step-card, .hero-feature");

  cards.forEach((card) => {
    // Auto-detect the icon element inside each card
    const icon = card.querySelector('[class*="icon"], [class*="number"]') || card.querySelector("svg");

    card.addEventListener("mouseenter", () => {
      // Animate card with slight elevation, perspective shift (tiny rotation), and shadow expansion
      gsap.to(card, {
        y: MOTION_PROPS.cardLift,
        scale: MOTION_PROPS.cardScale,
        rotationX: 2, // tiny perspective shift
        rotationY: -1,
        borderColor: "rgba(220, 180, 78, 0.25)",
        boxShadow: "0 20px 70px rgba(0, 0, 0, 0.2), 0 0 0 1px rgba(220, 180, 78, 0.08)",
        duration: DURATION.MEDIUM,
        ease: EASE.smooth, // Smooth instead of snappy for cards
        overwrite: "auto",
        transformPerspective: 1000
      });

      // Animate icon
      if (icon) {
        gsap.to(icon, {
          scale: 1.08,
          duration: DURATION.MEDIUM,
          ease: EASE.rebound,
          overwrite: "auto",
        });
      }
    });

    card.addEventListener("mouseleave", () => {
      // Return card to default state smoothly without snapping
      const defaultBoxShadow = card.classList.contains("feature-card")
        ? "0 12px 48px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.04)"
        : "0 8px 32px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.04)";

      gsap.to(card, {
        y: 0,
        scale: 1,
        rotationX: 0,
        rotationY: 0,
        borderColor: "rgba(255, 255, 255, 0.08)",
        boxShadow: defaultBoxShadow,
        duration: DURATION.SLOW, // SLOW on mouse leave for a very natural settling
        ease: EASE.smooth,
        overwrite: "auto",
        onComplete: () => {
          gsap.set(card, { clearProps: "transform,borderColor,boxShadow" });
        },
      });

      // Return icon to default state
      if (icon) {
        gsap.to(icon, {
          scale: 1,
          duration: DURATION.SLOW,
          ease: EASE.smooth,
          overwrite: "auto",
          onComplete: () => {
            gsap.set(icon, { clearProps: "transform" });
          },
        });
      }
    });
  });
}
