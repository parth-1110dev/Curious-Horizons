import { gsap } from "gsap";
import { DURATION, EASE } from "./motion.js";
import { isReducedMotion } from "./utils.js";
import { getToken, isLite } from "../performance/performanceManager.js";

/**
 * Curious Horizons — Card Hover Interactions
 * Sprint 6: Profile-adaptive 3D removal + reduced lift on Balanced/Lite
 *
 * Card hover values are driven by performance tokens:
 *  High     — Full 3D tilt (rotationX/Y), -8px lift, scale 1.02
 *  Balanced — No 3D tilt, -4px lift, scale 1.01
 *  Lite     — No hover animation (skip GSAP entirely)
 */

function buildHoverIn() {
  const lift    = getToken('cardLift');    // -8 | -4 | 0
  const scale   = getToken('cardScale');   // 1.02 | 1.01 | 1.0
  const use3D   = getToken('cardHover3D'); // true | false

  return {
    y:           lift,
    scale:       scale,
    rotationX:   use3D ? 2  : 0,
    rotationY:   use3D ? -1 : 0,
    borderColor: "rgba(220, 180, 78, 0.25)",
    boxShadow:   "0 20px 70px rgba(0, 0, 0, 0.2), 0 0 0 1px rgba(220, 180, 78, 0.08)",
    duration:    DURATION.MEDIUM,
    ease:        EASE.smooth,
    overwrite:   "auto",
    ...(use3D ? { transformPerspective: 1000 } : {}),
  };
}

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
 */
function attachCardHover(card, defaultBoxShadow) {
  const icon = card.querySelector('[class*="icon"], [class*="number"]') || card.querySelector("svg");
  const hoverIn = buildHoverIn();

  card.addEventListener("mouseenter", () => {
    gsap.to(card, hoverIn);
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
 * Initializes hover animations for all card types.
 * Gracefully no-ops on touch devices, reduced motion, or Lite profile.
 */
export function initHoverAnimations() {
  // Skip on touch devices (no pointer), reduced motion, or Lite profile (no GSAP idle)
  if (!window.matchMedia("(hover: hover)").matches || isReducedMotion() || isLite()) return;

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
