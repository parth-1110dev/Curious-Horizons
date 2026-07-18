import gsap from "gsap";

export function initHeroAnimation() {
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
