import { gsap } from "gsap";

export function initHoverAnimations() {
  // Gracefully ignore hover on touch devices
  if (!window.matchMedia("(hover: hover)").matches) {
    return;
  }

  const cards = document.querySelectorAll(".feature-card, .step-card, .hero-feature");

  cards.forEach((card) => {
    // Auto-detect the icon element inside each card
    const icon = card.querySelector('[class*="icon"], [class*="number"]') || card.querySelector("svg");

    card.addEventListener("mouseenter", () => {
      // Animate card
      gsap.to(card, {
        y: -8,
        scale: 1.02,
        borderColor: "rgba(220, 180, 78, 0.25)",
        boxShadow: "0 20px 70px rgba(0, 0, 0, 0.2), 0 0 0 1px rgba(220, 180, 78, 0.08)",
        duration: 0.4,
        ease: "power2.out",
        overwrite: "auto",
      });

      // Animate icon
      if (icon) {
        gsap.to(icon, {
          scale: 1.08,
          duration: 0.4,
          ease: "power2.out",
          overwrite: "auto",
        });
      }
    });

    card.addEventListener("mouseleave", () => {
      // Return card to default state
      const defaultBoxShadow = card.classList.contains("feature-card")
        ? "0 12px 48px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.04)"
        : "0 8px 32px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.04)";

      gsap.to(card, {
        y: 0,
        scale: 1,
        borderColor: "rgba(255, 255, 255, 0.08)",
        boxShadow: defaultBoxShadow,
        duration: 0.4,
        ease: "power2.out",
        overwrite: "auto",
        onComplete: () => {
          gsap.set(card, { clearProps: "transform,borderColor,boxShadow" });
        },
      });

      // Return icon to default state
      if (icon) {
        gsap.to(icon, {
          scale: 1,
          duration: 0.4,
          ease: "power2.out",
          overwrite: "auto",
          onComplete: () => {
            gsap.set(icon, { clearProps: "transform" });
          },
        });
      }
    });
  });
}
