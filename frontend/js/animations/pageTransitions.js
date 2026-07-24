import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/**
 * Initializes the main hero entrance animation.
 */
export function initHeroAnimation() {
  // Check if elements exist to prevent errors on non-index pages
  const title = document.querySelector(".title");
  if (!title) return;

  gsap.set([".title", ".subtext", ".learn-form"], {
    opacity: 0,
    y: 40
  });

  gsap.timeline()
    .to(".title", {
      opacity: 1,
      y: 0,
      duration: 1.8,
      ease: "power4.out"
    })
    .to(".subtext", {
      opacity: 1,
      y: 0,
      duration: 1.4,
      ease: "power4.out"
    }, "-=1.0")
    .to(".learn-form", {
      opacity: 1,
      y: 0,
      duration: 1.4,
      ease: "power4.out"
    }, "-=0.9");
}

/**
 * Initializes scroll-triggered reveal animations for sections.
 */
export function initRevealAnimation() {
  const sections = gsap.utils.toArray(".section");
  if (sections.length === 0) return;

  gsap.registerPlugin(ScrollTrigger);

  sections.forEach((section) => {
    gsap.from(section, {
      opacity: 0,
      y: 80,
      duration: 1.2,
      ease: "power4.out",
      scrollTrigger: {
        trigger: section,
        start: "top 85%",
        toggleActions: "play none none none",
      },
    });
  });
}
