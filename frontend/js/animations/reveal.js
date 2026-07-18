import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export function initRevealAnimation() {
  gsap.registerPlugin(ScrollTrigger);

  gsap.utils.toArray(".section").forEach((section) => {
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
