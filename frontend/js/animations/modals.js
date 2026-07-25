import { gsap } from "gsap";
import { DURATION, EASE } from "./motion.js";
import { isReducedMotion } from "./utils.js";

/**
 * Initializes generic modal interactions.
 * Note: Assumes a structure like:
 * <div class="modal" id="myModal">
 *   <div class="modal-backdrop"></div>
 *   <div class="modal-content">...</div>
 * </div>
 */
export function initModalInteractions() {
  const modalTriggers = document.querySelectorAll("[data-modal-target]");
  const modalCloseBtns = document.querySelectorAll("[data-modal-close]");
  
  modalTriggers.forEach(trigger => {
    trigger.addEventListener("click", (e) => {
      e.preventDefault();
      const targetId = trigger.getAttribute("data-modal-target");
      openModal(targetId);
    });
  });

  modalCloseBtns.forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      const targetModal = btn.closest(".modal");
      if (targetModal) {
        closeModal(targetModal);
      }
    });
  });

  // Optional: close on backdrop click
  document.querySelectorAll(".modal-backdrop").forEach(backdrop => {
    backdrop.addEventListener("click", (e) => {
      const targetModal = backdrop.closest(".modal");
      if (targetModal) {
        closeModal(targetModal);
      }
    });
  });
}

export function openModal(modalId) {
  const modal = typeof modalId === "string" ? document.getElementById(modalId) : modalId;
  if (!modal) return;

  const backdrop = modal.querySelector(".modal-backdrop");
  const content = modal.querySelector(".modal-content");
  
  // Display block immediately so we can animate it
  modal.style.display = "block";
  modal.style.pointerEvents = "auto";
  
  if (isReducedMotion()) {
    if (backdrop) gsap.set(backdrop, { opacity: 1 });
    if (content) gsap.set(content, { opacity: 1, y: 0, scale: 1 });
    return;
  }

  const tl = gsap.timeline();
  
  if (backdrop) {
    tl.fromTo(backdrop, 
      { opacity: 0, backdropFilter: "blur(0px)" }, 
      { opacity: 1, backdropFilter: "blur(8px)", duration: DURATION.MEDIUM, ease: EASE.smooth }, 
      0
    );
  }

  if (content) {
    tl.fromTo(content,
      { opacity: 0, y: 20, scale: 0.97 },
      { opacity: 1, y: 0, scale: 1, duration: DURATION.MEDIUM, ease: EASE.emphasized },
      0.05 // Slight stagger for natural feel
    );
  }
}

export function closeModal(modalId) {
  const modal = typeof modalId === "string" ? document.getElementById(modalId) : modalId;
  if (!modal) return;

  const backdrop = modal.querySelector(".modal-backdrop");
  const content = modal.querySelector(".modal-content");
  
  modal.style.pointerEvents = "none";

  if (isReducedMotion()) {
    modal.style.display = "none";
    if (backdrop) gsap.set(backdrop, { opacity: 0 });
    if (content) gsap.set(content, { opacity: 0, y: 20, scale: 0.97 });
    return;
  }

  const tl = gsap.timeline({
    onComplete: () => {
      modal.style.display = "none";
    }
  });
  
  if (content) {
    tl.to(content, { 
      opacity: 0, 
      y: 10, // slight downward movement on close
      scale: 0.97, 
      duration: DURATION.FAST, 
      ease: EASE.smooth 
    }, 0);
  }

  if (backdrop) {
    tl.to(backdrop, { 
      opacity: 0, 
      backdropFilter: "blur(0px)",
      duration: DURATION.MEDIUM, 
      ease: EASE.smooth 
    }, 0);
  }
}
