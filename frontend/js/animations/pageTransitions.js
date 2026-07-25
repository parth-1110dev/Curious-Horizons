import gsap from "gsap";
import Splitting from "splitting";
import { DURATION, EASE } from "./motion.js";
import { isReducedMotion } from "./utils.js";

/**
 * Initializes the lightweight page transition listener.
 * Fades out current page, then navigates.
 * On load, fades in.
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

    // Check if internal and not anchor/hash on same page
    const isInternal = link.host === window.location.host;
    const isHash = href.startsWith("#");
    const isTargetBlank = link.getAttribute("target") === "_blank";
    
    // Some links might be meant to trigger modals or shouldn't navigate away
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
 *
 * - Title: Splitting.js word-level stagger using GSAP
 * - Subtext: fades up after title
 * - Learn form: fades up after subtext
 * - Hero features: stagger in last
 *
 * Reduced motion: all elements are instantly visible.
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

  // ── Splitting.js: split .title into individual words ──────────────────────
  // We split at word level so the nested <span class="gold"> is preserved as
  // its own word-group. Splitting wraps each word in a <span class="word">.
  const [result] = Splitting({ target: titleEl, by: "words" });
  const words = result.words;

  // ── Set initial hidden states ──────────────────────────────────────────────
  gsap.set(words, { opacity: 0, y: 18, rotationX: -8 });
  gsap.set([".subtext", ".learn-form", ".topics"], { opacity: 0, y: 14 });
  gsap.set(".hero-feature", { opacity: 0, y: 10 });

  // ── Master timeline ────────────────────────────────────────────────────────
  const tl = gsap.timeline({ delay: 0.15 }); // brief pause after page fade-in

  // 1. Title words stagger in
  tl.to(words, {
    opacity: 1,
    y: 0,
    rotationX: 0,
    duration: DURATION.SLOW,
    ease: EASE.emphasized,
    stagger: 0.055,
    transformPerspective: 600,
    clearProps: "transform",
  });

  // 2. Subtext follows with overlap
  tl.to(
    ".subtext",
    {
      opacity: 1,
      y: 0,
      duration: DURATION.SLOW,
      ease: EASE.emphasized,
    },
    `-=${DURATION.SLOW * 0.45}` // overlap with tail of title
  );

  // 3. Topic pills
  tl.to(
    ".topics",
    {
      opacity: 1,
      y: 0,
      duration: DURATION.MEDIUM,
      ease: EASE.smooth,
    },
    `-=${DURATION.SLOW * 0.5}`
  );

  // 4. Form
  tl.to(
    ".learn-form",
    {
      opacity: 1,
      y: 0,
      duration: DURATION.MEDIUM,
      ease: EASE.smooth,
    },
    "-=0.35"
  );

  // 5. Hero feature pills stagger in last
  tl.to(
    ".hero-feature",
    {
      opacity: 1,
      y: 0,
      duration: DURATION.MEDIUM,
      ease: EASE.smooth,
      stagger: 0.07,
    },
    "-=0.2"
  );
}
