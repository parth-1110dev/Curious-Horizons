import { gsap } from "gsap";
import { isReducedMotion } from "./animations/utils.js";

/**
 * Initializes the global ambient lighting system.
 * It injects the layers into the DOM and animates them organically.
 * 
 * @param {Object} config Positioning configuration per page
 */
export function initAmbientLighting(config = {}) {
  // If reduced motion is preferred, we don't inject the animated layers.
  // The CSS fallback in .ambient-light-container handles the static atmospheric background.
  if (isReducedMotion()) {
    injectStaticContainer();
    return;
  }

  const container = injectAnimatedContainer();

  // Extract layers
  const layer1 = container.querySelector(".ambient-layer-1");
  const layer2 = container.querySelector(".ambient-layer-2");
  const layer3 = container.querySelector(".ambient-layer-3");

  // Apply intelligent positioning based on config
  applyConfig(layer1, layer2, layer3, config);

  // Start organic drift animations
  startOrganicDrift(layer1, 1);
  startOrganicDrift(layer2, 2);
  startOrganicDrift(layer3, 3);
}

function injectStaticContainer() {
  if (document.getElementById("ambientLight")) return;
  const container = document.createElement("div");
  container.id = "ambientLight";
  container.className = "ambient-light-container";
  // Insert at the very beginning of the body
  document.body.insertBefore(container, document.body.firstChild);
}

function injectAnimatedContainer() {
  let container = document.getElementById("ambientLight");
  if (!container) {
    container = document.createElement("div");
    container.id = "ambientLight";
    container.className = "ambient-light-container";
    
    // Inject the three independent layers
    container.innerHTML = `
      <div class="ambient-layer ambient-layer-1"></div>
      <div class="ambient-layer ambient-layer-2"></div>
      <div class="ambient-layer ambient-layer-3"></div>
    `;
    document.body.insertBefore(container, document.body.firstChild);
  }
  return container;
}

function applyConfig(layer1, layer2, layer3, config) {
  // Default positions (centered, slightly spread)
  gsap.set(layer1, { xPercent: -20, yPercent: -10 }); // Primary Nebula (leftish)
  gsap.set(layer2, { xPercent: 25, yPercent: -15 });  // Gold Accent (rightish)
  gsap.set(layer3, { xPercent: 0, yPercent: 25 });    // Distant Glow (bottomish)

  // Intelligent Positioning Overrides
  if (config.page === "home") {
    // Brighter hero region
    gsap.set(layer2, { xPercent: 15, yPercent: -25, scale: 1.2, opacity: 0.75 }); 
    gsap.set(layer1, { xPercent: -15, yPercent: -10, opacity: 0.85 }); 
  } else if (config.page === "knowledge-pack") {
    // Emphasize reading area (center depth)
    gsap.set(layer3, { xPercent: 0, yPercent: 0, scale: 1.4, opacity: 0.8 }); 
    gsap.set(layer2, { xPercent: -30, yPercent: 20, opacity: 0.4 }); // dim gold
  } else if (config.page === "pricing") {
    // Highlight near pricing cards (center-ish gold)
    gsap.set(layer2, { xPercent: 0, yPercent: 10, scale: 1.3, opacity: 0.85 }); 
    gsap.set(layer1, { opacity: 0.5 }); // dim blue slightly
  } else if (config.page === "session") {
    // Keep it deeply immersive and dark
    gsap.set([layer1, layer2, layer3], { opacity: 0.3 }); // lower opacity overall
    gsap.set(layer3, { scale: 1.5, opacity: 0.5 }); // violet depth dominant
  }
}

/**
 * Creates an endless, non-repeating organic drift using GSAP.
 * @param {HTMLElement} element The layer to animate
 * @param {number} seed A unique seed to vary the timing per layer
 */
function startOrganicDrift(element, seed) {
  if (!element) return;

  // Use random values to make the animation unpredictable and organic
  const randomX = () => gsap.utils.random(-15, 15);
  const randomY = () => gsap.utils.random(-15, 15);
  const randomScale = () => gsap.utils.random(0.9, 1.15);
  const randomDuration = () => gsap.utils.random(15, 25); // Extremely slow (15-25 seconds per movement)
  
  function animate() {
    gsap.to(element, {
      x: () => `${randomX()}vw`,
      y: () => `${randomY()}vh`,
      scale: randomScale,
      duration: randomDuration(),
      ease: "sine.inOut",
      onComplete: animate // Loop indefinitely but with new random values
    });
  }

  // Initial delay based on seed to desync layers
  setTimeout(animate, seed * 1000);
}
