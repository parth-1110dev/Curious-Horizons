import gsap from "gsap";
import Splitting from "splitting";
import { DURATION, EASE } from "./motion.js";
import { isReducedMotion } from "./utils.js";
import { getToken, isLite, isBalanced } from "../performance/performanceManager.js";

/**
 * Curious Horizons — Page Transitions & Hero Entrance
 * Sprint 6: Profile-adaptive hero animation scaling
 *
 * Performance adaptations:
 *  High     — Full Splitting.js word stagger, rotationX 3D, original Y offset
 *  Balanced — Word stagger preserved (brand signature), no rotationX, reduced Y offset
 *  Lite     — Opacity fade only, no Y movement, no 3D, no per-word stagger
 */

/**
 * Initializes the lightweight page transition listener.
 * Fades out current page, then navigates. On load, fades in.
 */
export function initPageTransitions() {
  if (isReducedMotion()) return;

  // Fade IN on load
  gsap.fromTo(document.body,
    { opacity: 0 },
    { opacity: 1, duration: DURATION.MEDIUM, ease: "none", clearProps: "opacity" }
  );

  // Fade OUT on internal link clicks
  document.addEventListener("click", (e) => {
    const link = e.target.closest("a");
    if (!link) return;

    const href = link.getAttribute("href");
    if (!href) return;

    const isInternal   = link.host === window.location.host;
    const isHash       = href.startsWith("#");
    const isTargetBlank = link.getAttribute("target") === "_blank";
    const hasDataAction = link.hasAttribute("data-modal-target");

    if (isInternal && !isHash && !isTargetBlank && !hasDataAction) {
      e.preventDefault();

      gsap.to(document.body, {
        opacity: 0,
        duration: DURATION.FAST,
        ease: "none",
        onComplete: () => {
          window.location.href = href;
        }
      });
    }
  });
}

/**
 * Initializes the main hero entrance animation.
 * Scaling is driven by performance tokens from PerformanceManager.
 *
 * High:     Splitting.js word-level stagger + rotationX 3D
 * Balanced: Splitting.js word-level stagger, no 3D, reduced Y
 * Lite:     Single opacity fade — no per-word work, no Y movement
 */
export function initHeroAnimation() {
  const titleEl = document.querySelector(".title");
  if (!titleEl) return;

  // Reduced motion — reveal everything immediately
  if (isReducedMotion()) {
    gsap.set([".title", ".subtext", ".learn-form", ".hero-feature", ".topics"], {
      opacity: 1,
      y: 0,
    });
    return;
  }

  // Read profile tokens
  const wordY      = getToken('heroWordY');       // 18 | 10 | 0
  const stagger    = getToken('heroWordStagger');  // 0.055 | 0.035 | 0
  const use3D      = getToken('heroWord3D');       // true | false
  const subY       = getToken('heroSubY');         // 14 | 8 | 0

  // ── Lite: Simple opacity fade — no Splitting, no per-word work ────────────
  if (isLite()) {
    gsap.set([".title", ".subtext", ".learn-form", ".hero-feature", ".topics"], {
      opacity: 0
    });
    gsap.to([".title", ".subtext", ".topics", ".learn-form", ".hero-feature"], {
      opacity: 1,
      duration: DURATION.MEDIUM,
      ease: EASE.smooth,
      stagger: 0.08,
      clearProps: "opacity",
    });
    return;
  }

  // ── High / Balanced: Splitting.js word-level stagger ─────────────────────
  const [result] = Splitting({ target: titleEl, by: "words" });
  const words    = result.words;

  // Set initial hidden states
  gsap.set(words, {
    opacity: 0,
    y: wordY,
    ...(use3D ? { rotationX: -8 } : {}),
  });
  gsap.set([".subtext", ".learn-form", ".topics"], { opacity: 0, y: subY });
  gsap.set(".hero-feature", { opacity: 0, y: subY * 0.7 });

  // Master timeline
  const tl = gsap.timeline({ delay: 0.15 });

  // 1. Title words stagger in
  tl.to(words, {
    opacity: 1,
    y: 0,
    ...(use3D ? { rotationX: 0, transformPerspective: 600 } : {}),
    duration: DURATION.SLOW,
    ease: EASE.emphasized,
    stagger: stagger,
    clearProps: "transform",
  });

  // 2. Subtext follows
  tl.to(
    ".subtext",
    { opacity: 1, y: 0, duration: DURATION.SLOW, ease: EASE.emphasized },
    `-=${DURATION.SLOW * 0.45}`
  );

  // 3. Topic pills
  tl.to(
    ".topics",
    { opacity: 1, y: 0, duration: DURATION.MEDIUM, ease: EASE.smooth },
    `-=${DURATION.SLOW * 0.5}`
  );

  // 4. Form
  tl.to(
    ".learn-form",
    { opacity: 1, y: 0, duration: DURATION.MEDIUM, ease: EASE.smooth },
    "-=0.35"
  );

  // 5. Hero feature pills stagger in last
  tl.to(
    ".hero-feature",
    { opacity: 1, y: 0, duration: DURATION.MEDIUM, ease: EASE.smooth, stagger: 0.07 },
    "-=0.2"
  );
}
