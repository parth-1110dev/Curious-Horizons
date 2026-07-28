/**
 * Curious Horizons — Performance Manager
 * Sprint 6: Mobile Performance & Device Compatibility Framework
 *
 * Central orchestrator for adaptive performance decisions.
 * This is the single source of truth for:
 *  - Active performance profile
 *  - GSAP timeline registry (for global pause/resume)
 *  - Page visibility / background state management
 *  - Battery-aware degradation
 *  - Public API for all modules to query capability
 *
 * Usage:
 *   import { initPerformanceManager, getProfile, getToken, isHigh, isLite } from './performance/performanceManager.js';
 *   initPerformanceManager(); // call once before any other init
 */

import { detectCapability } from './capabilityDetector.js';
import { getToken as _getToken, getAllTokens } from './performanceTokens.js';

// ─── State ──────────────────────────────────────────────────────────────────

/** @type {'high' | 'balanced' | 'lite'} */
let _profile = 'high';
let _tokens  = {};
let _initialized = false;
let _backgrounded = false;
let _forcedLite = false;

/** Registry of all repeating GSAP timelines (for global pause/resume) */
const _timelineRegistry = new Set();

// ─── Initialization ──────────────────────────────────────────────────────────

/**
 * Initialize the Performance Manager.
 * Must be called once before any other animation system.
 * Dispatches a 'ch:profile-ready' event when complete.
 */
export function initPerformanceManager() {
  if (_initialized) return;
  _initialized = true;

  // 1. Detect capability
  const { profile, signals, score } = detectCapability();
  _profile = profile;
  _tokens  = getAllTokens(_profile);

  // 2. Apply CSS profile attribute for CSS-based adaptations
  document.documentElement.setAttribute('data-perf-profile', _profile);

  // 3. Log in development
  if (import.meta.env?.DEV) {
    console.groupCollapsed(`[PerformanceManager] Profile: ${_profile} (score: ${score})`);
    console.table(signals);
    console.groupEnd();
  }

  // 4. Set up Page Visibility API pause/resume
  _setupVisibilityHandler();

  // 5. Set up Battery API degradation (where available)
  _setupBatteryHandler();

  // 6. Apply CSS custom properties for CSS-level adaptive theming
  _applyCSSAdaptations();

  // 7. Dispatch ready event
  window.dispatchEvent(new CustomEvent('ch:profile-ready', {
    detail: { profile: _profile, score, signals }
  }));
}

// ─── Public API ──────────────────────────────────────────────────────────────

/**
 * Get the current active performance profile.
 * @returns {'high' | 'balanced' | 'lite'}
 */
export function getProfile() {
  return _profile;
}

/**
 * Get a specific performance token value for the current profile.
 * @param {string} key - Token key
 * @returns {*}
 */
export function getToken(key) {
  return _getToken(key, _profile);
}

/**
 * Get all token values for the current profile.
 * @returns {Object}
 */
export function getTokens() {
  return _tokens;
}

/** @returns {boolean} true if high profile */
export function isHigh()     { return _profile === 'high'; }

/** @returns {boolean} true if balanced profile */
export function isBalanced() { return _profile === 'balanced'; }

/** @returns {boolean} true if lite profile */
export function isLite()     { return _profile === 'lite'; }

/** @returns {boolean} true if touch-primary device */
export function isTouch() {
  try { return window.matchMedia('(hover: none) and (pointer: coarse)').matches; }
  catch { return false; }
}

/** @returns {boolean} true if page is currently backgrounded */
export function isBackgrounded() { return _backgrounded; }

// ─── Timeline Registry ───────────────────────────────────────────────────────

/**
 * Register a GSAP timeline for centralized pause/resume management.
 * Call this for any repeat:-1 or looping timeline.
 * @param {gsap.core.Timeline} tl - GSAP timeline instance
 * @returns {gsap.core.Timeline} The same timeline (for chaining)
 */
export function registerTimeline(tl) {
  if (tl && typeof tl.pause === 'function') {
    _timelineRegistry.add(tl);
  }
  return tl;
}

/**
 * Unregister a timeline (call when the timeline is killed/cleaned up).
 * @param {gsap.core.Timeline} tl
 */
export function unregisterTimeline(tl) {
  _timelineRegistry.delete(tl);
}

/**
 * Pause all registered looping timelines.
 * Called automatically on page hide, and available manually.
 */
export function pauseAll() {
  _backgrounded = true;
  _timelineRegistry.forEach(tl => {
    try { if (!tl.killed) tl.pause(); } catch { /* ignore stale refs */ }
  });
}

/**
 * Resume all registered looping timelines.
 * Called automatically on page show, and available manually.
 */
export function resumeAll() {
  _backgrounded = false;
  _timelineRegistry.forEach(tl => {
    try { if (!tl.killed) tl.resume(); } catch { /* ignore stale refs */ }
  });
}

/**
 * Kill and unregister all timelines (e.g. on page teardown / SPA route change).
 */
export function killAll() {
  _timelineRegistry.forEach(tl => {
    try { tl.kill(); } catch { /* ignore */ }
  });
  _timelineRegistry.clear();
}

// ─── Private: Visibility Handler ─────────────────────────────────────────────

function _setupVisibilityHandler() {
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      pauseAll();
    } else {
      // Small delay to avoid janky resume right as page comes back
      setTimeout(resumeAll, 150);
    }
  }, { passive: true });

  // Also handle window blur/focus for non-visibility-API browsers
  window.addEventListener('blur', () => {
    if (!_backgrounded) pauseAll();
  }, { passive: true });

  window.addEventListener('focus', () => {
    if (_backgrounded) setTimeout(resumeAll, 150);
  }, { passive: true });
}

// ─── Private: Battery Handler ─────────────────────────────────────────────────

function _setupBatteryHandler() {
  if (!('getBattery' in navigator)) return;

  navigator.getBattery().then(battery => {
    const check = () => {
      // Downgrade to lite if battery is critically low and discharging
      if (battery.level < 0.15 && !battery.charging && !_forcedLite) {
        _forcedLite = true;
        _applyProfileOverride('lite');
      }
      // Restore original profile if charging or battery recovers
      if ((battery.charging || battery.level > 0.25) && _forcedLite) {
        _forcedLite = false;
        _applyProfileOverride(_profile);
      }
    };

    check();
    battery.addEventListener('levelchange', check);
    battery.addEventListener('chargingchange', check);
  }).catch(() => { /* Battery API not available or denied */ });
}

// ─── Private: Profile Override ───────────────────────────────────────────────

function _applyProfileOverride(profile) {
  document.documentElement.setAttribute('data-perf-profile', profile);
  window.dispatchEvent(new CustomEvent('ch:profile-change', {
    detail: { profile }
  }));
}

// ─── Private: CSS Adaptations ────────────────────────────────────────────────

function _applyCSSAdaptations() {
  const root = document.documentElement;

  // Apply CSS custom properties for CSS-level adaptive values
  // These allow CSS to adapt without requiring JS on each element
  const navBlur   = _getToken('navBackdropBlur', _profile);
  const glassBlur = _getToken('glassBackdropBlur', _profile);

  root.style.setProperty('--adaptive-nav-blur',   `${navBlur}px`);
  root.style.setProperty('--adaptive-glass-blur', `${glassBlur}px`);

  // On lite profile: remove backdrop-filter entirely via CSS attribute selector
  // (handled in CSS via [data-perf-profile="lite"] selectors)
}
