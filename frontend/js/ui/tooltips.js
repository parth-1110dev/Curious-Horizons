/**
 * Curious Horizons - Intelligent Tooltips
 * Contextual tooltips that fade in/out cleanly.
 */

import { gsap } from "gsap";

let activeTooltip = null;
let tooltipHideTimeout = null;

export function initTooltips() {
  const elements = document.querySelectorAll('[data-tooltip]');

  elements.forEach((el) => {
    // Only attach once
    if (el.dataset.tooltipInitialized) return;
    el.dataset.tooltipInitialized = 'true';

    el.addEventListener('mouseenter', handleMouseEnter);
    el.addEventListener('mouseleave', handleMouseLeave);
    el.addEventListener('focus', handleMouseEnter);
    el.addEventListener('blur', handleMouseLeave);
  });
}

function handleMouseEnter(e) {
  const target = e.currentTarget;
  const tooltipText = target.getAttribute('data-tooltip');
  if (!tooltipText) return;

  // Clear any hiding timeouts
  if (tooltipHideTimeout) {
    clearTimeout(tooltipHideTimeout);
    tooltipHideTimeout = null;
  }

  // Remove existing if any
  if (activeTooltip) {
    activeTooltip.remove();
    activeTooltip = null;
  }

  // Create new tooltip
  const tooltip = document.createElement('div');
  tooltip.className = 'ch-tooltip';
  tooltip.textContent = tooltipText;
  tooltip.setAttribute('role', 'tooltip');
  document.body.appendChild(tooltip);

  activeTooltip = tooltip;

  // Position it above the target
  const rect = target.getBoundingClientRect();
  const scrollY = window.scrollY || window.pageYOffset;
  const scrollX = window.scrollX || window.pageXOffset;

  // Center horizontally relative to target
  const top = rect.top + scrollY;
  const left = rect.left + scrollX + (rect.width / 2);

  tooltip.style.top = `${top}px`;
  tooltip.style.left = `${left}px`;

  // Animate in
  gsap.to(tooltip, {
    opacity: 1,
    y: -4,
    scale: 1,
    duration: 0.2,
    ease: "power2.out",
    delay: 0.3 // Don't show immediately (prevents annoying flashes when moving mouse fast)
  });
}

function handleMouseLeave() {
  if (!activeTooltip) return;

  const currentTooltip = activeTooltip;
  
  // Clear any existing animation and animate out
  gsap.killTweensOf(currentTooltip);
  
  gsap.to(currentTooltip, {
    opacity: 0,
    y: 0,
    scale: 0.95,
    duration: 0.15,
    ease: "power2.in",
    onComplete: () => {
      if (currentTooltip.parentNode) {
        currentTooltip.remove();
      }
      if (activeTooltip === currentTooltip) {
        activeTooltip = null;
      }
    }
  });
}
