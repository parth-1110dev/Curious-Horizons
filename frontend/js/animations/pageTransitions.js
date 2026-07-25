import gsap from "gsap";
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
    
    // Some links might be meant to trigger modals or shouldn't navigate away, check data attributes
    const hasDataAction = link.hasAttribute("data-modal-target");

    if (isInternal && !isHash && !isTargetBlank && !hasDataAction) {
      e.preventDefault(); // intercept navigation
      
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
 * Sequential fading in of hero elements.
 */
export function initHeroAnimation() {
  const title = document.querySelector(".title");
  if (!title) return;

  if (isReducedMotion()) {
    gsap.set([".title", ".subtext", ".learn-form"], { opacity: 1, y: 0 });
    return;
  }

  gsap.set([".title", ".subtext", ".learn-form"], {
    opacity: 0,
    y: 20 // Reduce from 40 to 20 for more subtle physical feel
  });

  const tl = gsap.timeline({ delay: 0.1 }); // slight delay after page fade in

  tl.to(".title", {
    opacity: 1,
    y: 0,
    duration: DURATION.SLOW,
    ease: EASE.emphasized
  })
  .to(".subtext", {
    opacity: 1,
    y: 0,
    duration: DURATION.SLOW,
    ease: EASE.emphasized
  }, "-=" + (DURATION.SLOW * 0.7)) // overlap
  .to(".learn-form", {
    opacity: 1,
    y: 0,
    duration: DURATION.SLOW,
    ease: EASE.emphasized
  }, "-=" + (DURATION.SLOW * 0.7));
}
