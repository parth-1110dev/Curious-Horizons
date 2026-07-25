/**
 * Curious Horizons - Toast Notification System
 * Reusable, glassmorphism toasts with GSAP animation.
 */

import { gsap } from "gsap";

let toastContainer = null;

function initToastContainer() {
  if (toastContainer) return;
  toastContainer = document.createElement("div");
  toastContainer.className = "ch-toast-container";
  toastContainer.setAttribute("aria-live", "polite");
  document.body.appendChild(toastContainer);
}

/**
 * Display a toast notification.
 * @param {string} message - The message to display.
 * @param {string} type - 'success', 'error', or 'info'
 * @param {number} duration - Time in ms before auto-dismiss (default 4000)
 */
export function showToast(message, type = "info", duration = 4000) {
  initToastContainer();

  const toast = document.createElement("div");
  toast.className = `ch-toast ch-toast--${type}`;
  
  let icon = "";
  if (type === "success") icon = "✦";
  if (type === "error") icon = "⚠";
  if (type === "info") icon = "ℹ";

  toast.innerHTML = `
    <span class="ch-toast-icon" aria-hidden="true">${icon}</span>
    <span class="ch-toast-message">${message}</span>
  `;

  // Manual dismiss
  toast.addEventListener("click", () => dismissToast(toast));

  toastContainer.appendChild(toast);

  // Entrance animation
  gsap.fromTo(toast,
    { opacity: 0, y: 20, scale: 0.95 },
    { opacity: 1, y: 0, scale: 1, duration: 0.4, ease: "back.out(1.5)" }
  );

  // Auto dismiss
  if (duration > 0) {
    setTimeout(() => {
      dismissToast(toast);
    }, duration);
  }
}

function dismissToast(toast) {
  if (!toast || !toast.parentNode) return;
  
  gsap.to(toast, {
    opacity: 0,
    scale: 0.9,
    y: -10,
    duration: 0.3,
    ease: "power2.in",
    onComplete: () => {
      if (toast.parentNode) {
        toast.remove();
      }
    }
  });
}
