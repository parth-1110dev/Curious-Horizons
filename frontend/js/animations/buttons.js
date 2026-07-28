import gsap from "gsap";
import { DURATION, EASE, MOTION_PROPS } from "./motion.js";
import { isReducedMotion } from "./utils.js";
import { getToken, isLite, isHigh, registerTimeline, isTouch } from "../performance/performanceManager.js";

/**
 * Curious Horizons — Button Interactions
 * Sprint 6: Profile-adaptive idle animations + touch feedback
 *
 * Three button tiers, all scaled to the active performance profile:
 *  Level 1 (.btn-outline)    — Subtle hover/active states
 *  Level 2 (.btn-primary)    — Elevation and shadow expansion
 *  Level 3 (.btn-usp)        — Signature idle breathing (profile-gated)
 *
 * Touch devices receive active-state feedback via touchstart/touchend.
 * Hover-only behaviors are suppressed on touch.
 */
export function initButtonInteractions() {
  const reduced  = isReducedMotion();
  const touchDev = isTouch();

  initLevel1Buttons(reduced, touchDev);
  initLevel2Buttons(reduced, touchDev);

  const uspMode = getToken('uspIdleAnimation'); // 'full' | 'reduced' | 'none'
  if (!reduced && uspMode !== 'none') {
    initLevel3Buttons(uspMode);
  } else if (touchDev || uspMode === 'none') {
    // Touch/Lite: CSS-only hover fallback on USP buttons (active state handled by touch.css)
    _initUSPBasicHover();
  } else if (reduced) {
    _initUSPBasicHover();
  }
}

// ─── Level 1: Outline Buttons ─────────────────────────────────────────────────

function initLevel1Buttons(reduced, touchDev) {
  const outlineButtons = document.querySelectorAll(".btn-outline");
  outlineButtons.forEach(btn => {
    // Hover — only on pointer devices
    if (!touchDev) {
      btn.addEventListener("mouseenter", () => {
        gsap.to(btn, {
          backgroundColor: "rgba(255, 255, 255, 0.08)",
          borderColor: "rgba(255, 255, 255, 0.15)",
          duration: DURATION.MEDIUM,
          ease: EASE.snappy,
          overwrite: "auto"
        });
      });
      btn.addEventListener("mouseleave", () => {
        gsap.to(btn, {
          backgroundColor: "transparent",
          borderColor: "rgba(255, 255, 255, 0.08)",
          duration: DURATION.MEDIUM,
          ease: EASE.snappy,
          overwrite: "auto"
        });
      });
    }

    // Press state — both pointer and touch
    if (!reduced) {
      _attachPressState(btn);
    }
  });
}

// ─── Level 2: Primary Buttons ─────────────────────────────────────────────────

function initLevel2Buttons(reduced, touchDev) {
  const primaryButtons = document.querySelectorAll(".btn-primary:not(.btn-usp)");
  const buttonLift = reduced ? 0 : MOTION_PROPS.buttonLift;

  primaryButtons.forEach(btn => {
    // Hover elevation — only on pointer devices
    if (!touchDev) {
      btn.addEventListener("mouseenter", () => {
        gsap.to(btn, {
          y: buttonLift,
          boxShadow: "0 12px 32px rgba(220, 180, 78, 0.22), 0 2px 8px rgba(0,0,0,0.3)",
          duration: DURATION.MEDIUM,
          ease: EASE.snappy,
          overwrite: "auto"
        });
      });
      btn.addEventListener("mouseleave", () => {
        gsap.to(btn, {
          y: 0,
          boxShadow: "0 8px 24px rgba(220, 180, 78, 0.15), 0 2px 4px rgba(0,0,0,0.2)",
          duration: DURATION.MEDIUM,
          ease: EASE.smooth,
          overwrite: "auto"
        });
      });
    }

    // Press state — both pointer and touch
    if (!reduced) {
      _attachPressState(btn);
    }
  });
}

// ─── Level 3: USP Signature Buttons ──────────────────────────────────────────

/**
 * Full or reduced USP button initialization.
 * @param {'full' | 'reduced'} mode
 */
function initLevel3Buttons(mode) {
  const uspButtons = document.querySelectorAll(".btn-usp");

  uspButtons.forEach(btn => {
    // Inject DOM elements for glow and shimmer
    const glowBlob = document.createElement("span");
    glowBlob.classList.add("btn-usp-glow");
    const shimmer = document.createElement("span");
    shimmer.classList.add("btn-usp-shimmer");

    if (!btn.querySelector(".btn-usp-glow")) {
      btn.insertBefore(glowBlob, btn.firstChild);
    }
    if (!btn.querySelector(".btn-usp-shimmer")) {
      btn.appendChild(shimmer);
    }

    const currentGlow    = btn.querySelector(".btn-usp-glow");
    const currentShimmer = btn.querySelector(".btn-usp-shimmer");
    const icon           = btn.querySelector(".btn-usp-icon");

    // ── Idle Glow Timeline ───────────────────────────────────────────────────
    const idleGlowTl = gsap.timeline({ repeat: -1, yoyo: true });
    const delay = Math.random() * 2;

    if (mode === 'full') {
      // Full: complete breathing glow with wide opacity range
      idleGlowTl.fromTo(btn,
        { boxShadow: "0 8px 36px rgba(220, 180, 78, 0.28), 0 2px 8px rgba(0,0,0,0.3)" },
        { boxShadow: "0 8px 48px rgba(220, 180, 78, 0.50), 0 2px 12px rgba(0,0,0,0.3), 0 0 40px rgba(220, 180, 78, 0.26)", duration: 2, ease: "power1.inOut" },
        0
      );
      if (currentGlow) {
        idleGlowTl.fromTo(currentGlow,
          { opacity: 0.5, scale: 1 },
          { opacity: 0.8, scale: 1.06, duration: 2, ease: "power1.inOut" },
          0
        );
      }
    } else {
      // Reduced (balanced profile): simplified single-range breathing, 60% opacity
      idleGlowTl.fromTo(btn,
        { boxShadow: "0 8px 36px rgba(220, 180, 78, 0.22), 0 2px 8px rgba(0,0,0,0.3)" },
        { boxShadow: "0 8px 40px rgba(220, 180, 78, 0.38), 0 2px 10px rgba(0,0,0,0.3)", duration: 2.5, ease: "power1.inOut" },
        0
      );
      if (currentGlow) {
        idleGlowTl.fromTo(currentGlow,
          { opacity: 0.4, scale: 1 },
          { opacity: 0.65, scale: 1.04, duration: 2.5, ease: "power1.inOut" },
          0
        );
      }
    }

    // Register idle glow for pause/resume
    registerTimeline(idleGlowTl);

    // ── Idle Shimmer Timeline (full mode only) ───────────────────────────────
    let idleShimmerTl = null;
    if (mode === 'full' && currentShimmer) {
      idleShimmerTl = gsap.timeline({ repeat: -1, repeatDelay: 6.5, delay: delay + 1 });
      idleShimmerTl.fromTo(currentShimmer,
        { backgroundPosition: "-200% center", opacity: 0 },
        {
          backgroundPosition: "200% center", opacity: 1, duration: 1.5, ease: "power2.inOut",
          keyframes: {
            "0%":   { opacity: 0 },
            "15%":  { opacity: 1 },
            "85%":  { opacity: 1 },
            "100%": { opacity: 0 }
          }
        }
      );
      registerTimeline(idleShimmerTl);
    }

    // ── Hover Interactions (pointer only) ────────────────────────────────────
    if (!isTouch()) {
      btn.addEventListener("mouseenter", () => {
        idleGlowTl.pause();
        if (idleShimmerTl) idleShimmerTl.pause();

        gsap.to(btn, {
          y: MOTION_PROPS.buttonLift,
          boxShadow: "0 12px 44px rgba(220, 180, 78, 0.52), 0 2px 12px rgba(0, 0, 0, 0.3), 0 0 44px rgba(220, 180, 78, 0.28)",
          duration: DURATION.MEDIUM,
          ease: EASE.snappy,
          overwrite: "auto"
        });

        if (currentGlow) {
          gsap.to(currentGlow, {
            opacity: 1,
            scale: 1.12,
            duration: DURATION.MEDIUM,
            ease: EASE.snappy,
            overwrite: "auto"
          });
        }

        if (mode === 'full' && currentShimmer) {
          gsap.fromTo(currentShimmer,
            { backgroundPosition: "-200% center", opacity: 0 },
            {
              backgroundPosition: "200% center", opacity: 1, duration: 1.2, ease: EASE.snappy,
              keyframes: {
                "0%":   { opacity: 0 },
                "15%":  { opacity: 1 },
                "85%":  { opacity: 1 },
                "100%": { opacity: 0 }
              }
            }
          );
        }

        if (icon) {
          gsap.to(icon, {
            rotate: 20,
            scale: 1.15,
            opacity: 1,
            duration: DURATION.MEDIUM,
            ease: EASE.rebound,
            overwrite: "auto"
          });
        }
      });

      btn.addEventListener("mouseleave", () => {
        gsap.to(btn, {
          y: 0,
          duration: DURATION.MEDIUM,
          ease: EASE.smooth,
          overwrite: "auto",
          onComplete: () => idleGlowTl.play()
        });

        if (currentGlow) {
          gsap.to(currentGlow, {
            duration: DURATION.MEDIUM,
            ease: EASE.smooth,
            overwrite: "auto"
          });
        }

        if (icon) {
          gsap.to(icon, {
            rotate: 0,
            scale: 1,
            opacity: 0.8,
            duration: DURATION.MEDIUM,
            ease: EASE.smooth,
            overwrite: "auto"
          });
        }

        if (idleShimmerTl) idleShimmerTl.restart(true);
      });
    }

    // ── Press / Touch Feedback ───────────────────────────────────────────────
    _attachPressState(btn, currentGlow);
  });
}

// ─── Fallback: Basic USP Hover (Lite / touch / reduced) ──────────────────────

function _initUSPBasicHover() {
  const uspButtons = document.querySelectorAll(".btn-usp");
  uspButtons.forEach(btn => {
    // Only add hover on non-touch devices
    if (!isTouch()) {
      btn.addEventListener("mouseenter", () => {
        gsap.to(btn, { y: -1, duration: DURATION.FAST, ease: EASE.snappy });
      });
      btn.addEventListener("mouseleave", () => {
        gsap.to(btn, { y: 0, duration: DURATION.FAST, ease: EASE.snappy });
      });
    }
  });
}

// ─── Shared Press State ───────────────────────────────────────────────────────

/**
 * Attaches scale-down press feedback to a button.
 * Handles both mousedown/mouseup AND touchstart/touchend for touch devices.
 * Guards against double-firing on touch devices that also fire mouse events.
 */
function _attachPressState(btn, glowEl) {
  let isTouchInteraction = false;

  const pressDown = () => {
    gsap.to(btn, { scale: MOTION_PROPS.buttonScaleDown, duration: DURATION.FAST, ease: EASE.compress });
    if (glowEl) {
      gsap.to(glowEl, { scale: 0.9, opacity: 1, duration: DURATION.FAST, ease: EASE.compress });
    }
  };

  const pressUp = () => {
    gsap.to(btn, { scale: 1, duration: DURATION.MEDIUM, ease: EASE.rebound });
    if (glowEl) {
      gsap.fromTo(glowEl,
        { scale: 1.2, opacity: 1 },
        { scale: 1.12, opacity: 0.9, duration: DURATION.SLOW, ease: EASE.smooth }
      );
    }
  };

  const pressCancel = () => {
    gsap.to(btn, { scale: 1, duration: DURATION.MEDIUM, ease: EASE.smooth });
  };

  // Touch events (primary for touch devices)
  btn.addEventListener("touchstart", (e) => {
    isTouchInteraction = true;
    pressDown();
  }, { passive: true });

  btn.addEventListener("touchend", () => {
    pressUp();
    // Reset flag after mouse events would fire
    setTimeout(() => { isTouchInteraction = false; }, 500);
  }, { passive: true });

  btn.addEventListener("touchcancel", () => {
    pressCancel();
    setTimeout(() => { isTouchInteraction = false; }, 500);
  }, { passive: true });

  // Mouse events (pointer devices only — guard against double-fire on touch)
  btn.addEventListener("mousedown", () => {
    if (!isTouchInteraction) pressDown();
  });
  btn.addEventListener("mouseup", () => {
    if (!isTouchInteraction) pressUp();
  });
  btn.addEventListener("mouseleave", () => {
    if (!isTouchInteraction) pressCancel();
  });
}
