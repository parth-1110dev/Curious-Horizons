/**
 * Curious Horizons — Floating UI Positioning Wrapper
 *
 * A thin, reusable wrapper around @floating-ui/dom's computePosition.
 * All future popovers, dropdowns, context menus, and tooltips should
 * use this module so positioning logic is never duplicated.
 *
 * Usage:
 *   import { positionFloating } from './floating.js';
 *   positionFloating(anchorEl, floatingEl, { placement: 'top' });
 */

import {
  computePosition,
  flip,
  shift,
  offset,
  autoUpdate,
} from "@floating-ui/dom";

/**
 * Compute and apply position for a floating element relative to an anchor.
 *
 * @param {HTMLElement} anchor    - The reference element to position against.
 * @param {HTMLElement} floating  - The element to position (tooltip, popover, etc.).
 * @param {Object}      [options]
 * @param {string}      [options.placement='top']  - Floating UI placement string.
 * @param {number}      [options.offsetPx=8]       - Gap between anchor and floating el (px).
 * @param {boolean}     [options.autoUpdate=false]  - Re-position on scroll/resize.
 * @returns {Function|null} If autoUpdate is true, returns the cleanup function.
 */
export function positionFloating(anchor, floating, options = {}) {
  const {
    placement = "top",
    offsetPx = 8,
    autoUpdate: shouldAutoUpdate = false,
  } = options;

  const middleware = [
    offset(offsetPx),   // Gap between anchor and floating element
    flip(),             // Flip to opposite side if no room
    shift({ padding: 8 }), // Shift along axis to stay in viewport
  ];

  async function update() {
    const { x, y } = await computePosition(anchor, floating, {
      placement,
      middleware,
    });

    Object.assign(floating.style, {
      left: `${x}px`,
      top:  `${y}px`,
    });
  }

  update();

  if (shouldAutoUpdate) {
    // autoUpdate cleans up scroll/resize listeners — caller must call the returned fn
    return autoUpdate(anchor, floating, update);
  }

  return null;
}
