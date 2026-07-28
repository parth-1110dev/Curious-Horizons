import { initButtonInteractions } from "./buttons.js";
import { initHoverAnimations } from "./cards.js";
import { initHeroAnimation, initPageTransitions } from "./pageTransitions.js";
import { initScrollChoreography } from "./scroll.js";
import { initModalInteractions } from "./modals.js";
import { initAmbientLighting } from "../ambient-light.js";
import { initIconMotion, initCuriosityPulse } from "./effects.js";
import { initKeyboardShortcuts } from "../ui/keyboard.js";
import { initTooltips } from "../ui/tooltips.js";
import { isReducedMotion } from "./utils.js";
import { initPerformanceManager, isLite, isBalanced, getToken } from "../performance/performanceManager.js";

/**
 * Curious Horizons — Global Interaction Orchestrator
 * Sprint 6: Performance Manager integration + lazy initialization strategy
 *
 * Initialization order:
 *  1. PerformanceManager (sync, must be first — all modules depend on it)
 *  2. Critical path: page transitions, hero animation (immediate, above-fold)
 *  3. Deferred: ambient lighting, scroll choreography, secondary effects
 *  4. Idle-time: tooltips, keyboard shortcuts, curiosity pulse
 *
 * Deferred initialization improves:
 *  - Time to interactive (TTI) — critical path stays lean
 *  - LCP — no expensive systems blocking the first frame
 *  - Battery — ambient lighting not running during JS parse/exec
 */
export function initInteractions() {
  // ── Step 1: Initialize Performance Manager (MUST be first) ──────────────
  initPerformanceManager();

  // ── Step 2: Determine page config for ambient lighting ──────────────────
  const path = window.location.pathname;
  let pageConfig = "home";

  if (path.includes("knowledge-pack.html")) pageConfig = "knowledge-pack";
  else if (path.includes("pricing.html"))   pageConfig = "pricing";
  else if (path.includes("session.html"))   pageConfig = "session";
  else if (path.includes("auth.html"))      pageConfig = "auth";

  // ── Step 3: Critical path (immediate, blocks nothing) ───────────────────
  // Page transitions must run before any navigation to avoid unstyled flash
  initPageTransitions();

  // Hero animation is above-fold and essential for perceived performance
  initHeroAnimation();

  // Core interactions — users can interact immediately
  initHoverAnimations();
  initButtonInteractions();
  initModalInteractions();

  // Icon motion — lightweight, affects visible elements
  initIconMotion();

  // ── Step 4: Deferred — ambient lighting ─────────────────────────────────
  // Strategy: defer expensive GPU system to after first user interaction
  // or a 1.5s grace period (whichever first).
  // This improves LCP and reduces GPU pressure during initial render.
  _deferredInit(() => {
    initAmbientLighting({ page: pageConfig });
  }, 1500);

  // ── Step 5: Deferred — scroll choreography ──────────────────────────────
  // ScrollTrigger sets up IntersectionObservers — defer behind rIC
  _idleInit(() => {
    initScrollChoreography();
  });

  // ── Step 6: Idle-time — secondary effects ───────────────────────────────
  // Curiosity pulse — low priority, only on non-lite profiles
  if (!isLite()) {
    _idleInit(() => {
      initCuriosityPulse(
        document.querySelectorAll(".btn-usp, .btn-primary, .knowledge-pack-btn")
      );
    });
  }

  // Tooltips and keyboard shortcuts — lowest priority
  _idleInit(() => {
    initKeyboardShortcuts();
    initTooltips();
  });
}

// ─── Deferred Initialization Helpers ────────────────────────────────────────

/**
 * Run a function after the first user interaction OR a timeout, whichever first.
 * Ideal for ambient lighting and other GPU systems that don't need to run
 * during the initial render.
 *
 * @param {Function} fn - Function to call
 * @param {number} timeout - Maximum delay in ms before forcing execution
 */
function _deferredInit(fn, timeout = 1000) {
  let called = false;

  const run = () => {
    if (called) return;
    called = true;
    cleanup();
    fn();
  };

  const cleanup = () => {
    document.removeEventListener('touchstart', run, { passive: true });
    document.removeEventListener('mousemove', run, { passive: true });
    document.removeEventListener('keydown', run);
    document.removeEventListener('scroll', run, { passive: true });
    clearTimeout(timer);
  };

  // Force execution after timeout regardless of interaction
  const timer = setTimeout(run, timeout);

  // Execute immediately on first user interaction
  document.addEventListener('touchstart', run, { passive: true, once: true });
  document.addEventListener('mousemove', run, { passive: true, once: true });
  document.addEventListener('keydown', run, { once: true });
  document.addEventListener('scroll', run, { passive: true, once: true });
}

/**
 * Run a function during browser idle time using requestIdleCallback.
 * Falls back to setTimeout(fn, 200) in browsers without rIC support.
 *
 * @param {Function} fn - Function to call
 */
function _idleInit(fn) {
  if ('requestIdleCallback' in window) {
    requestIdleCallback(fn, { timeout: 2000 });
  } else {
    setTimeout(fn, 200);
  }
}
