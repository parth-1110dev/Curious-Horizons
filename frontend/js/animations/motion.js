/**
 * Curious Horizons Motion Tokens
 * Standardized durations, easings, and constants to ensure a unified, physical feel.
 */
import { gsap } from "gsap";

// Optional: Register CustomEase if you import it, but we can stick to GSAP core standard physical easings for now.

export const DURATION = {
  // Used for: hover, icon transitions
  FAST: 0.15,
  
  // Used for: cards, buttons, dropdowns
  MEDIUM: 0.3,
  
  // Used for: page transitions, loading, onboarding
  SLOW: 0.6
};

export const EASE = {
  // For satisfying tactile snaps (like buttons) without bouncing
  snappy: "power2.out",
  
  // For physical, smooth return (cards)
  smooth: "power3.out",
  
  // For soft compressions
  compress: "power1.inOut",
  
  // For rebounds (click release)
  rebound: "back.out(1.5)",
  
  // For page transitions and large moves
  emphasized: "power4.out"
};

export const MOTION_PROPS = {
  buttonLift: -2,
  cardLift: -8,
  cardScale: 1.02,
  buttonScaleDown: 0.96, // soft compression
};
