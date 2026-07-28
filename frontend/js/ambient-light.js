import { gsap } from "gsap";
import { isReducedMotion } from "./animations/utils.js";
import { getToken, isLite, isBalanced, registerTimeline } from "./performance/performanceManager.js";

/**
 * Curious Horizons — Ambient Lighting System
 * Sprint 6: Adaptive performance scaling via PerformanceManager
 *
 * Three operational modes driven by the active performance profile:
 *
 *  High     — Full three-layer animated organic drift (original behavior)
 *  Balanced — Same three layers, 50% blur, reduced drift range, slower duration
 *  Lite     — Static positioned layers, no GSAP drift loops, near-zero GPU cost
 *
 * All drift timelines are registered with PerformanceManager for
 * automatic pause/resume on page visibility changes.
 *
 * @param {Object} config Positioning configuration per page
 */
export function initAmbientLighting(config = {}) {
  // If reduced motion is preferred, inject only the static container.
  // The CSS fallback in .ambient-light-container handles the static background.
  if (isReducedMotion()) {
    injectStaticContainer();
    return;
  }

  // Lite profile: static layers only — no continuous animation loops
  if (isLite()) {
    const container = injectAnimatedContainer();
    const layer1 = container.querySelector(".ambient-layer-1");
    const layer2 = container.querySelector(".ambient-layer-2");
    const layer3 = container.querySelector(".ambient-layer-3");
    applyConfig(layer1, layer2, layer3, config);
    // Apply static lite positions — set once, no loops
    applyLiteStaticState(layer1, layer2, layer3);
    return;
  }

  // High / Balanced: animated drift
  const container = injectAnimatedContainer();
  const layer1 = container.querySelector(".ambient-layer-1");
  const layer2 = container.querySelector(".ambient-layer-2");
  const layer3 = container.querySelector(".ambient-layer-3");

  applyConfig(layer1, layer2, layer3, config);

  // Start organic drift — passes profile-aware tokens to each layer
  startOrganicDrift(layer1, 1);
  startOrganicDrift(layer2, 2);
  startOrganicDrift(layer3, 3);
}

// ─── DOM Injection ────────────────────────────────────────────────────────────

function injectStaticContainer() {
  if (document.getElementById("ambientLight")) return;
  const container = document.createElement("div");
  container.id = "ambientLight";
  container.className = "ambient-light-container";
  document.body.insertBefore(container, document.body.firstChild);
}

function injectAnimatedContainer() {
  let container = document.getElementById("ambientLight");
  if (!container) {
    container = document.createElement("div");
    container.id = "ambientLight";
    container.className = "ambient-light-container";
    container.innerHTML = `
      <div class="ambient-layer ambient-layer-1"></div>
      <div class="ambient-layer ambient-layer-2"></div>
      <div class="ambient-layer ambient-layer-3"></div>
    `;
    document.body.insertBefore(container, document.body.firstChild);
  }
  return container;
}

// ─── Config & Positioning ────────────────────────────────────────────────────

function applyConfig(layer1, layer2, layer3, config) {
  // Default positions (centered, slightly spread)
  gsap.set(layer1, { xPercent: -20, yPercent: -10 });
  gsap.set(layer2, { xPercent: 25,  yPercent: -15 });
  gsap.set(layer3, { xPercent: 0,   yPercent: 25  });

  // Page-specific positioning overrides
  if (config.page === "home") {
    gsap.set(layer2, { xPercent: 15,  yPercent: -25, scale: 1.2, opacity: 0.75 });
    gsap.set(layer1, { xPercent: -15, yPercent: -10, opacity: 0.85 });
  } else if (config.page === "knowledge-pack") {
    gsap.set(layer3, { xPercent: 0,   yPercent: 0,  scale: 1.4, opacity: 0.8  });
    gsap.set(layer2, { xPercent: -30, yPercent: 20, opacity: 0.4 });
  } else if (config.page === "pricing") {
    gsap.set(layer2, { xPercent: 0,  yPercent: 10, scale: 1.3, opacity: 0.85 });
    gsap.set(layer1, { opacity: 0.5 });
  } else if (config.page === "session") {
    gsap.set([layer1, layer2, layer3], { opacity: 0.3 });
    gsap.set(layer3, { scale: 1.5, opacity: 0.5 });
  }

  // Apply profile-adaptive blur to each layer
  _applyAdaptiveBlur(layer1, layer2, layer3);
}

/**
 * Apply adaptive blur intensity based on the active performance profile.
 * Lite: blur removed entirely (handled via CSS with zero px)
 */
function _applyAdaptiveBlur(layer1, layer2, layer3) {
  const blurs = getToken('ambientBlur'); // [layer1, layer2, layer3]

  [layer1, layer2, layer3].forEach((layer, i) => {
    if (!layer) return;
    const blurPx = blurs[i];
    // Apply via inline style — overrides the CSS default
    layer.style.filter = blurPx > 0 ? `blur(${blurPx}px)` : 'none';
    // Only hint will-change during active animation (not on lite/static)
    layer.style.willChange = !isLite() ? 'transform, opacity' : 'auto';
  });
}

// ─── Lite Profile: Static State ───────────────────────────────────────────────

/**
 * Set Lite profile ambient layers to static final positions.
 * No loops, no continuous GPU updates.
 */
function applyLiteStaticState(layer1, layer2, layer3) {
  // Apply profile opacity tokens
  const opacities = getToken('ambientOpacity');
  gsap.set(layer1, { opacity: opacities[0] });
  gsap.set(layer2, { opacity: opacities[1] });
  gsap.set(layer3, { opacity: opacities[2] });
}

// ─── Organic Drift Animation ──────────────────────────────────────────────────

/**
 * Creates an endless, non-repeating organic drift using GSAP.
 * Respects performance profile for drift range and duration.
 *
 * @param {HTMLElement} element The layer to animate
 * @param {number} seed A unique seed to vary timing per layer (1–3)
 */
function startOrganicDrift(element, seed) {
  if (!element) return;

  // Read profile-adaptive tokens
  const driftRange     = getToken('ambientDriftRange');        // 0.5 or 1.0
  const durationMult   = getToken('ambientDriftDurationMult'); // 1.0 or 1.6
  const opacities      = getToken('ambientOpacity');

  // Scale random range by profile drift multiplier
  const maxDrift = 15 * driftRange; // baseline ±15vw/vh scaled by profile
  const randomX = () => gsap.utils.random(-maxDrift, maxDrift);
  const randomY = () => gsap.utils.random(-maxDrift, maxDrift);
  const randomScale = () => gsap.utils.random(0.9, 1.15);

  // Longer duration on balanced = fewer position updates per second = less GPU
  const baseDurMin = 15 * durationMult;
  const baseDurMax = 25 * durationMult;
  const randomDuration = () => gsap.utils.random(baseDurMin, baseDurMax);

  function animate() {
    const tl = gsap.to(element, {
      x: () => `${randomX()}vw`,
      y: () => `${randomY()}vh`,
      scale: randomScale,
      duration: randomDuration(),
      ease: "sine.inOut",
      onComplete: animate, // Recurse with new random values — not a repeat:-1
    });
    // Register for pause/resume management (we register the active tween)
    registerTimeline(tl);
  }

  // Stagger initial start to desync layers and avoid synchronized reflows
  setTimeout(animate, seed * 800);
}
