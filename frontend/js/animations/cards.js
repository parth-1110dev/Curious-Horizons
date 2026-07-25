import { gsap } from "gsap";
import { DURATION, EASE, MOTION_PROPS } from "./motion.js";
import { isReducedMotion } from "./utils.js";

/**
 * Shared hover parameters — single source of truth for all card types.
 * Changing these values propagates to every card on the site.
 */
const CARD_HOVER_IN = {
  y:                 MOTION_PROPS.cardLift,       // -8px
  scale:             MOTION_PROPS.cardScale,       // 1.02
  rotationX:         2,
  rotationY:         -1,
  borderColor:       "rgba(220, 180, 78, 0.25)",
  boxShadow:         "0 20px 70px rgba(0, 0, 0, 0.2), 0 0 0 1px rgba(220, 180, 78, 0.08)",
  duration:          DURATION.MEDIUM,
  ease:              EASE.smooth,
  overwrite:         "auto",
  transformPerspective: 1000,
};

const CARD_HOVER_OUT = {
  y:           0,
  scale:       1,
  rotationX:   0,
  rotationY:   0,
  borderColor: "rgba(255, 255, 255, 0.08)",
  duration:    DURATION.SLOW,
  ease:        EASE.smooth,
  overwrite:   "auto",
};

const ICON_HOVER_IN = {
  scale:    1.08,
  duration: DURATION.MEDIUM,
  ease:     EASE.rebound,
  overwrite: "auto",
};

const ICON_HOVER_OUT = {
  scale:     1,
  duration:  DURATION.SLOW,
  ease:      EASE.smooth,
  overwrite: "auto",
};

/**
 * Applies hover interactions to a single card element.
 * Shared by all card types: .feature-card, .step-card, .hero-feature
 * Returns the default box-shadow so the out-animation can restore it.
 */
function attachCardHover(card, defaultBoxShadow) {
  const icon = card.querySelector('[class*="icon"], [class*="number"]') || card.querySelector("svg");

  card.addEventListener("mouseenter", () => {
    gsap.to(card, CARD_HOVER_IN);
    if (icon) gsap.to(icon, ICON_HOVER_IN);
  });

  card.addEventListener("mouseleave", () => {
    gsap.to(card, {
      ...CARD_HOVER_OUT,
      boxShadow: defaultBoxShadow,
      onComplete: () => gsap.set(card, { clearProps: "transform,borderColor,boxShadow" }),
    });
    if (icon) {
      gsap.to(icon, {
        ...ICON_HOVER_OUT,
        onComplete: () => gsap.set(icon, { clearProps: "transform" }),
      });
    }
  });
}

/**
 * Initializes hover animations for all card types across the application.
 * Gracefully no-ops on touch devices or when reduced motion is preferred.
 */
export function initHoverAnimations() {
  if (!window.matchMedia("(hover: hover)").matches || isReducedMotion()) return;

  // Feature cards — "Your Intellectual Toolkit" section
  document.querySelectorAll(".feature-card").forEach((card) => {
    attachCardHover(
      card,
      "0 12px 48px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.04)"
    );
  });

  // Step cards — "How It Works" section
  document.querySelectorAll(".step-card").forEach((card) => {
    attachCardHover(
      card,
      "0 8px 32px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.04)"
    );
  });

  // Hero feature pills — hero section mini cards
  document.querySelectorAll(".hero-feature").forEach((card) => {
    attachCardHover(
      card,
      "0 8px 32px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.04)"
    );
  });
}
