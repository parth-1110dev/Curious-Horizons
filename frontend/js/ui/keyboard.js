/**
 * Curious Horizons - Universal Keyboard Shortcuts
 * Part of the Frictionless UX system.
 */

import { gsap } from "gsap";
import { showToast } from "./toast.js"; // We'll build this next

export function initKeyboardShortcuts() {
  document.addEventListener('keydown', handleGlobalKeydown);
}

function handleGlobalKeydown(e) {
  // Don't trigger shortcuts if user is typing in an input or textarea
  if (
    e.target.tagName === 'INPUT' ||
    e.target.tagName === 'TEXTAREA' ||
    e.target.isContentEditable
  ) {
    return;
  }

  // Esc -> Close dialogs/modals
  if (e.key === 'Escape') {
    closeAnyOpenModal();
    return;
  }

  // ? -> Open keyboard shortcuts help
  if (e.key === '?') {
    // Prevent default (like searching in page if some browsers do that)
    showShortcutsHelp();
    return;
  }

  // Ctrl/Cmd + K -> Global search / quick actions
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
    e.preventDefault();
    openQuickSearch();
    return;
  }

  // Ctrl/Cmd + Enter -> Confirm important actions
  if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
    e.preventDefault();
    triggerPrimaryAction();
    return;
  }
}

function closeAnyOpenModal() {
  // Check for loading overlay (shouldn't close it usually, but we check if it's there)
  // Check for KP Upgrade Modal in session
  const kpModal = document.getElementById("kpUpgradeModal");
  if (kpModal && kpModal.style.display !== "none" && kpModal.getAttribute("aria-hidden") !== "true") {
    kpModal.setAttribute("aria-hidden", "true");
    kpModal.style.display = "none";
    return;
  }

  // Check for Razorpay checkout backdrop
  const checkoutBackdrop = document.getElementById("checkoutBackdrop");
  if (checkoutBackdrop && !checkoutBackdrop.hidden) {
    // The user should dismiss razorpay natively, but we can't control the iframe easily.
    // So this is a no-op, Razorpay handles Esc internally.
  }
}

function showShortcutsHelp() {
  // Prevent spamming
  if (document.querySelector(".ch-shortcuts-modal")) return;

  const modal = document.createElement("div");
  modal.className = "ch-shortcuts-modal";
  modal.innerHTML = `
    <div class="shortcuts-card">
      <h3>Keyboard Shortcuts</h3>
      <ul class="shortcuts-list">
        <li><span>⌘ K</span><span>Quick Search</span></li>
        <li><span>⌘ ↵</span><span>Confirm Action</span></li>
        <li><span>Esc</span><span>Close Modal</span></li>
        <li><span>?</span><span>Show Shortcuts</span></li>
      </ul>
      <p class="shortcuts-note">Press any key to close</p>
    </div>
  `;
  document.body.appendChild(modal);

  gsap.fromTo(modal, 
    { opacity: 0, scale: 0.95 },
    { opacity: 1, scale: 1, duration: 0.2, ease: "power2.out" }
  );

  const closeFn = (e) => {
    // If they hit ?, don't immediately reopen
    if (e && e.key === '?') {
      setTimeout(() => { document.removeEventListener("keydown", closeFn); }, 100);
    } else {
      document.removeEventListener("keydown", closeFn);
      document.removeEventListener("click", closeFn);
    }
    
    gsap.to(modal, {
      opacity: 0,
      scale: 0.95,
      duration: 0.15,
      ease: "power2.in",
      onComplete: () => modal.remove()
    });
  };

  // Wait a tick so the '?' keydown doesn't instantly trigger the closeFn
  setTimeout(() => {
    document.addEventListener("keydown", closeFn);
    document.addEventListener("click", closeFn);
  }, 10);
}

function openQuickSearch() {
  // Placeholder for future search functionality
  showToast("Quick search coming soon", "info");
}

function triggerPrimaryAction() {
  // In Session: Generate Archive
  const generateBtn = document.getElementById("generateNotesBtn");
  if (generateBtn && !generateBtn.disabled && window.getComputedStyle(generateBtn).display !== 'none') {
    generateBtn.click();
    return;
  }

  // In Knowledge Pack: Archive Knowledge Pack
  const downloadBtn = document.getElementById("downloadNotesBtn");
  if (downloadBtn && !downloadBtn.disabled) {
    downloadBtn.click();
    return;
  }
}
