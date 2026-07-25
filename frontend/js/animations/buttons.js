import gsap from "gsap";
import { DURATION, EASE, MOTION_PROPS } from "./motion.js";
import { isReducedMotion } from "./utils.js";

/**
 * Initializes button interactions across the application (Levels 1-3).
 */
export function initButtonInteractions() {
  const reduced = isReducedMotion();

  initLevel1Buttons(reduced);
  initLevel2Buttons(reduced);

  if (!reduced) {
    initLevel3Buttons();
  } else {
    // Basic hover fallback for reduced motion on USP buttons
    const uspButtons = document.querySelectorAll(".btn-usp");
    uspButtons.forEach(btn => {
      btn.addEventListener("mouseenter", () => {
        gsap.to(btn, { y: -1, duration: DURATION.FAST, ease: EASE.snappy });
      });
      btn.addEventListener("mouseleave", () => {
        gsap.to(btn, { y: 0, duration: DURATION.FAST, ease: EASE.snappy });
      });
    });
  }
}

/**
 * Level 1: Standard/Utility Controls (.btn-outline)
 * Minimal hover interactions using GSAP for physical feel.
 */
function initLevel1Buttons(reduced) {
  const outlineButtons = document.querySelectorAll(".btn-outline");
  outlineButtons.forEach(btn => {
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
    
    // Press state
    btn.addEventListener("mousedown", () => {
      if (!reduced) gsap.to(btn, { scale: MOTION_PROPS.buttonScaleDown, duration: DURATION.FAST, ease: EASE.compress });
    });
    btn.addEventListener("mouseup", () => {
      if (!reduced) gsap.to(btn, { scale: 1, duration: DURATION.MEDIUM, ease: EASE.rebound });
    });
    btn.addEventListener("mouseleave", () => {
      if (!reduced) gsap.to(btn, { scale: 1, duration: DURATION.MEDIUM, ease: EASE.smooth });
    });
  });
}

/**
 * Level 2: Primary CTAs (.btn-primary without .btn-usp)
 * Hover elevation and shadow expansion.
 */
function initLevel2Buttons(reduced) {
  // Select primary buttons that are NOT USP buttons
  const primaryButtons = document.querySelectorAll(".btn-primary:not(.btn-usp)");
  
  primaryButtons.forEach(btn => {
    btn.addEventListener("mouseenter", () => {
      gsap.to(btn, {
        y: reduced ? 0 : MOTION_PROPS.buttonLift,
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

    // Press state
    btn.addEventListener("mousedown", () => {
      if (!reduced) gsap.to(btn, { scale: MOTION_PROPS.buttonScaleDown, duration: DURATION.FAST, ease: EASE.compress });
    });
    btn.addEventListener("mouseup", () => {
      if (!reduced) gsap.to(btn, { scale: 1, duration: DURATION.MEDIUM, ease: EASE.rebound });
    });
    btn.addEventListener("mouseleave", () => {
      if (!reduced) gsap.to(btn, { scale: 1, duration: DURATION.MEDIUM, ease: EASE.smooth }); 
    });
  });
}

/**
 * Level 3: Signature USP Actions (.btn-usp)
 * Premium idle breathing, shimmer sweep, and satisfying click.
 */
function initLevel3Buttons() {
  const uspButtons = document.querySelectorAll(".btn-usp");

  uspButtons.forEach(btn => {
    // 1. Inject DOM elements for glow and shimmer to animate easily with GSAP
    const glowBlob = document.createElement("span");
    glowBlob.classList.add("btn-usp-glow");
    
    const shimmer = document.createElement("span");
    shimmer.classList.add("btn-usp-shimmer");

    // Only append if they don't exist (useful for re-renders or hot reloads)
    if (!btn.querySelector(".btn-usp-glow")) {
      btn.insertBefore(glowBlob, btn.firstChild);
    }
    if (!btn.querySelector(".btn-usp-shimmer")) {
      btn.appendChild(shimmer);
    }

    const currentGlow = btn.querySelector(".btn-usp-glow");
    const currentShimmer = btn.querySelector(".btn-usp-shimmer");
    const icon = btn.querySelector(".btn-usp-icon");

    // 2. Idle Timeline: Breathing glow and box-shadow
    const idleGlowTl = gsap.timeline({ repeat: -1, yoyo: true });
    const delay = Math.random() * 2; 

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
    
    // 3. Idle Timeline: Shimmer
    const idleShimmerTl = gsap.timeline({ repeat: -1, repeatDelay: 6.5, delay: delay + 1 });
    if (currentShimmer) {
      idleShimmerTl.fromTo(currentShimmer,
        { backgroundPosition: "-200% center", opacity: 0 },
        { backgroundPosition: "200% center", opacity: 1, duration: 1.5, ease: "power2.inOut",
          keyframes: {
            "0%": { opacity: 0 },
            "15%": { opacity: 1 },
            "85%": { opacity: 1 },
            "100%": { opacity: 0 }
          }
        }
      );
    }

    // 4. Hover Interactions
    btn.addEventListener("mouseenter", () => {
      idleGlowTl.pause();
      idleShimmerTl.pause();

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

      if (currentShimmer) {
        gsap.fromTo(currentShimmer,
          { backgroundPosition: "-200% center", opacity: 0 },
          { backgroundPosition: "200% center", opacity: 1, duration: 1.2, ease: EASE.snappy,
            keyframes: {
              "0%": { opacity: 0 },
              "15%": { opacity: 1 },
              "85%": { opacity: 1 },
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
      
      idleShimmerTl.restart(true);
    });

    // 5. Click Feedback (Tasteful scale + burst)
    btn.addEventListener("mousedown", () => {
      gsap.to(btn, { scale: MOTION_PROPS.buttonScaleDown, duration: DURATION.FAST, ease: EASE.compress });
      if (currentGlow) {
        gsap.to(currentGlow, { scale: 0.9, opacity: 1, duration: DURATION.FAST, ease: EASE.compress });
      }
    });
    
    btn.addEventListener("mouseup", () => {
      gsap.to(btn, { scale: 1, duration: DURATION.MEDIUM, ease: EASE.rebound });
      
      if (currentGlow) {
        gsap.fromTo(currentGlow, 
          { scale: 1.2, opacity: 1 }, 
          { scale: 1.12, opacity: 0.9, duration: DURATION.SLOW, ease: EASE.smooth }
        );
      }
    });
    
    btn.addEventListener("mouseleave", () => {
      gsap.to(btn, { scale: 1, duration: DURATION.MEDIUM, ease: EASE.smooth }); 
    });
  });
}
