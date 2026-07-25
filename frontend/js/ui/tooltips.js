/**
 * Curious Horizons - Intelligent Tooltips
 * Contextual tooltips. Positioning powered by Floating UI.
 * Animation powered by GSAP.
 */

import { gsap } from "gsap";
import { positionFloating } from "./floating.js";
import { isReducedMotion } from "../animations/utils.js";

let activeTooltip = null;

export function initTooltips() {
  const elements = document.querySelectorAll('[data-tooltip]');

  elements.forEach((el) => {
    // Only attach once per element
    if (el.dataset.tooltipInitialized) return;
    el.dataset.tooltipInitialized = 'true';

    el.addEventListener('mouseenter', handleShow);
    el.addEventListener('mouseleave', handleHide);
    el.addEventListener('focus',      handleShow);
    el.addEventListener('blur',       handleHide);
  });
}

function handleShow(e) {
  const target = e.currentTarget;
  const tooltipText = target.getAttribute('data-tooltip');
  if (!tooltipText) return;

  // Dismiss any existing tooltip immediately
  if (activeTooltip) {
    gsap.killTweensOf(activeTooltip);
    activeTooltip.remove();
    activeTooltip = null;
  }

  // Build tooltip element
  const tooltip = document.createElement('div');
  tooltip.className = 'ch-tooltip';
  tooltip.textContent = tooltipText;
  tooltip.setAttribute('role', 'tooltip');

  // Must be in DOM before Floating UI can measure it
  // Position using fixed so Floating UI can compute correctly
  tooltip.style.position = 'fixed';
  tooltip.style.top = '0';
  tooltip.style.left = '0';
  document.body.appendChild(tooltip);

  activeTooltip = tooltip;

  // Floating UI positions it intelligently — flips to bottom if no room above
  positionFloating(target, tooltip, { placement: 'top', offsetPx: 8 });

  // Skip animation for reduced motion — just show it
  if (isReducedMotion()) {
    tooltip.style.opacity = '1';
    return;
  }

  // Animate in with a brief delay to prevent flashing during fast mouse movements
  gsap.fromTo(
    tooltip,
    { opacity: 0, y: 4, scale: 0.95 },
    { opacity: 1, y: 0, scale: 1, duration: 0.2, ease: 'power2.out', delay: 0.25 }
  );
}

function handleHide() {
  if (!activeTooltip) return;

  const current = activeTooltip;
  activeTooltip = null;

  if (isReducedMotion()) {
    current.remove();
    return;
  }

  gsap.killTweensOf(current);
  gsap.to(current, {
    opacity: 0,
    y: 2,
    scale: 0.95,
    duration: 0.15,
    ease: 'power2.in',
    onComplete: () => current.parentNode && current.remove(),
  });
}
