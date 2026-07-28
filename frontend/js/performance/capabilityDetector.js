/**
 * Curious Horizons — Capability Detector
 * Sprint 6: Mobile Performance & Device Compatibility Framework
 *
 * Determines the device's performance profile using available browser signals.
 * Never uses User-Agent sniffing. Signal-based, future-proof, privacy-safe.
 *
 * Profiles:
 *  - "high"     : Modern hardware. Full premium experience.
 *  - "balanced" : Average hardware. Reduced intensity, preserved identity.
 *  - "lite"     : Constrained hardware. Simplified but never broken.
 */

/**
 * @typedef {'high' | 'balanced' | 'lite'} PerformanceProfile
 */

/**
 * Detect all available hardware and preference signals.
 * @returns {Object} Raw signal object
 */
function collectSignals() {
  const mql = (q) => {
    try { return window.matchMedia(q).matches; } catch { return false; }
  };

  // CPU cores (logical) — available on most browsers
  const cores = navigator.hardwareConcurrency ?? 4;

  // Device memory in GB — Chrome/Android/Edge only; undefined elsewhere
  const memoryGB = navigator.deviceMemory ?? null;

  // Device pixel ratio — higher DPR = more GPU fill-rate needed
  const dpr = window.devicePixelRatio ?? 1;

  // Platform preferences
  const prefersReducedMotion = mql('(prefers-reduced-motion: reduce)');
  const prefersReducedData   = mql('(prefers-reduced-data: reduce)');
  const isTouch              = mql('(hover: none) and (pointer: coarse)');
  const isFinePointer        = mql('(pointer: fine)');

  // Save-Data header hint (network-level signal)
  const saveData = navigator.connection?.saveData ?? false;

  // Screen resolution — rough proxy for device class
  const screenWidth  = window.screen?.width  ?? 1920;
  const screenHeight = window.screen?.height ?? 1080;
  const totalPixels  = screenWidth * screenHeight * dpr * dpr;

  return {
    cores,
    memoryGB,
    dpr,
    prefersReducedMotion,
    prefersReducedData,
    isTouch,
    isFinePointer,
    saveData,
    screenWidth,
    screenHeight,
    totalPixels,
  };
}

/**
 * Score the collected signals into a numeric capability score.
 * Higher = more capable.
 * @param {Object} signals
 * @returns {number} score (roughly 0–100)
 */
function scoreSignals(signals) {
  let score = 50; // baseline

  // CPU scoring
  if (signals.cores >= 8)      score += 25;
  else if (signals.cores >= 4) score += 10;
  else if (signals.cores <= 2) score -= 20;
  else                         score -= 5;  // 3 cores

  // Memory scoring (if available)
  if (signals.memoryGB !== null) {
    if (signals.memoryGB >= 8)      score += 20;
    else if (signals.memoryGB >= 4) score += 10;
    else if (signals.memoryGB <= 1) score -= 25;
    else                            score -= 10; // 2GB
  }

  // DPR penalty — high DPR on small screens means more GPU fill-rate cost
  if (signals.dpr > 3)       score -= 10;
  else if (signals.dpr > 2)  score -= 4;

  // Preference penalties — always respected
  if (signals.prefersReducedMotion) score -= 60; // Hard downgrade
  if (signals.prefersReducedData)   score -= 30;
  if (signals.saveData)             score -= 30;

  // Touch device slight penalty (generally lower-end GPUs without discrete chip)
  if (signals.isTouch && !signals.isFinePointer) score -= 5;

  return score;
}

/**
 * Map a numeric score to a performance profile.
 * @param {number} score
 * @returns {PerformanceProfile}
 */
function scoreToProfile(score) {
  if (score >= 60) return 'high';
  if (score >= 25) return 'balanced';
  return 'lite';
}

/**
 * Detect the performance profile for the current device.
 * @returns {{ profile: PerformanceProfile, signals: Object, score: number }}
 */
export function detectCapability() {
  const signals = collectSignals();
  const score   = scoreSignals(signals);
  const profile = scoreToProfile(score);

  return { profile, signals, score };
}
