/**
 * Curious Horizons — Signature Effects
 * Sprint 6: Profile-adaptive particle counts + 3D removal on mobile
 *
 * Nine exclusive interaction patterns that reinforce the feeling of
 * Discovery, Curiosity, Exploration, and Knowledge unfolding.
 *
 * All effects:
 *  - are GPU-accelerated (transform + opacity only)
 *  - respect prefers-reduced-motion
 *  - respect the active performance profile via PerformanceManager
 *  - self-clean their DOM injections
 *  - are non-blocking and non-intrusive
 */

import { gsap } from "gsap";
import { isReducedMotion } from "./utils.js";
import { getToken, isLite, isTouch, registerTimeline } from "../performance/performanceManager.js";

// ─── DESIGN TOKENS ──────────────────────────────────────────────────────────

const GOLD   = "rgba(220, 180, 78, ";
const BLUE   = "rgba(80, 120, 240, ";
const VIOLET = "rgba(130, 90, 220, ";


// ─── PART 2: KNOWLEDGE FORMATION ─────────────────────────────────────────────
/**
 * Animates content "forming" from scattered particles into visible content.
 * Particle count is scaled by the active performance profile.
 *
 * @param {HTMLElement} container The element that will reveal
 * @param {Function} [onComplete] Called when particles have condensed
 */
export function animateKnowledgeFormation(container, onComplete) {
  if (isReducedMotion() || isLite()) {
    if (onComplete) onComplete();
    return;
  }

  if (!container) { if (onComplete) onComplete(); return; }

  const NUM = getToken('formationParticleCount'); // 14 (high) | 8 (balanced) | 0 (lite)
  if (NUM === 0) { if (onComplete) onComplete(); return; }

  const rect = container.getBoundingClientRect();
  const cx   = rect.left + rect.width  / 2;
  const cy   = rect.top  + rect.height / 2;

  const particles = [];
  const wrapper   = document.createElement("div");
  wrapper.className = "ch-formation-overlay";
  wrapper.style.cssText = `position:fixed;inset:0;pointer-events:none;z-index:200;`;
  document.body.appendChild(wrapper);

  for (let i = 0; i < NUM; i++) {
    const p = document.createElement("div");
    p.className = "ch-particle ch-particle--star";
    p.style.cssText = `width:${Math.random()*3+2}px;height:${Math.random()*3+2}px;left:${cx}px;top:${cy}px;`;
    wrapper.appendChild(p);
    particles.push(p);
  }

  const tl = gsap.timeline({
    onComplete: () => {
      gsap.to(wrapper, { opacity: 0, duration: 0.2, onComplete: () => wrapper.remove() });
      if (onComplete) onComplete();
    }
  });

  // Phase 1: Scatter outward — reduced range on balanced
  const scatterRange = getToken('successRadiusMult') >= 1 ? 280 : 180;
  tl.set(particles, {
    x: (i) => (Math.random() - 0.5) * scatterRange,
    y: (i) => (Math.random() - 0.5) * (scatterRange * 0.65),
    opacity: 0,
    scale: 0,
  });

  // Phase 2: Appear scattered
  tl.to(particles, {
    opacity: 1,
    scale: 1,
    stagger: 0.04,
    duration: 0.3,
    ease: "power2.out",
  });

  // Phase 3: Gather to center
  tl.to(particles, {
    x: 0, y: 0,
    scale: 0,
    opacity: 0,
    stagger: { each: 0.025, from: "random" },
    duration: 0.4,
    ease: "power3.in",
  }, "+=0.1");
}


// ─── PART 3: DISCOVERY RIPPLE ────────────────────────────────────────────────
/**
 * Creates an ambient knowledge ripple behind an element when something is revealed.
 * Skipped on Lite profile.
 *
 * @param {HTMLElement} element The element to ripple behind
 */
export function triggerDiscoveryRipple(element) {
  if (!element || isReducedMotion() || isLite()) return;

  const pos = getComputedStyle(element).position;
  if (pos === "static") element.style.position = "relative";

  const ripple = document.createElement("div");
  ripple.className = "ch-discovery-ripple";
  element.insertBefore(ripple, element.firstChild);

  gsap.fromTo(ripple,
    { scale: 0.3, opacity: 0 },
    {
      scale: 2.2,
      opacity: 0.22,
      duration: 0.4,
      ease: "power2.out",
      onComplete: () => {
        gsap.to(ripple, {
          opacity: 0,
          scale: 2.8,
          duration: 0.5,
          ease: "power1.in",
          onComplete: () => ripple.remove()
        });
      }
    }
  );
}


// ─── PART 4: INTELLIGENT ICON MOTION ─────────────────────────────────────────
/**
 * Initializes alive icon interactions across the app.
 * On touch devices, rotation is replaced with scale-only (no hover).
 */
export function initIconMotion() {
  if (isReducedMotion()) return;

  const touchDev = isTouch();

  // Archive / USP icons — rotation + gold glow on hover (pointer only)
  if (!touchDev) {
    document.querySelectorAll(".btn-usp-icon").forEach((icon) => {
      const btn = icon.closest("button");
      if (!btn) return;

      btn.addEventListener("mouseenter", () => {
        gsap.to(icon, {
          rotation: 8,
          scale: 1.15,
          duration: 0.25,
          ease: "power2.out",
          textShadow: "0 0 12px rgba(220, 180, 78, 0.7)",
        });
      });

      btn.addEventListener("mouseleave", () => {
        gsap.to(icon, {
          rotation: 0,
          scale: 1,
          duration: 0.35,
          ease: "power3.out",
          textShadow: "0 0 0px rgba(220, 180, 78, 0)",
        });
      });
    });
  }

  // Clipboard / copy button — confirmation pulse on click (works on all devices)
  const copyBtn = document.getElementById("copyNotesBtn");
  if (copyBtn) {
    const icon = copyBtn.querySelector(".btn-usp-icon");
    copyBtn.addEventListener("click", () => {
      if (!icon) return;
      const tl = gsap.timeline();
      tl.to(icon, { scale: 0.85, duration: 0.1, ease: "power1.in" })
        .to(icon, { scale: 1.25, duration: 0.18, ease: "back.out(2.5)" })
        .to(icon, { scale: 1,    duration: 0.25, ease: "power2.out" });
    });
  }

  // Star rating buttons — pop on selection (works on all devices)
  document.querySelectorAll(".star-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const tl = gsap.timeline();
      tl.to(btn, { scale: 1.4, duration: 0.1, ease: "power2.out" })
        .to(btn, { scale: 0.9, duration: 0.08, ease: "power1.in"  })
        .to(btn, { scale: 1.0, duration: 0.18, ease: "back.out(2)"});
    });
  });
}


// ─── PART 5: KNOWLEDGE PACK REVEAL ───────────────────────────────────────────
/**
 * Staggered progressive reveal of the Knowledge Pack content sections.
 */
export function initKnowledgePackReveal() {
  if (isReducedMotion()) return;

  const targets = [
    ".kp-header",
    ".kp-subtitle",
    ".kp-section:first-of-type",
    ".format-options",
    ".kp-section:nth-of-type(2)",
    ".preview-box .preview-item",
    ".kp-actions",
  ];

  const elements = [];
  targets.forEach((sel) => {
    const nodes = document.querySelectorAll(sel);
    nodes.forEach((n) => elements.push(n));
  });

  if (!elements.length) return;

  // Lite: opacity only, no Y movement
  const yOffset = isLite() ? 0 : 14;

  gsap.from(elements, {
    opacity: 0,
    y: yOffset,
    duration: 0.45,
    ease: "power2.out",
    stagger: 0.07,
    clearProps: "all",
  });
}


// ─── PART 6: ARCHIVE COMPLETION MOMENT ───────────────────────────────────────
/**
 * Flagship animation for Archive completion.
 * Button compresses → gold particles emerge → icon glows → success → return.
 * Particle count scaled by performance profile.
 *
 * @param {HTMLElement} button The archive/download button
 */
export function triggerArchiveCompletion(button) {
  if (!button || isReducedMotion()) return;

  const icon = button.querySelector(".btn-usp-icon");
  const NUM  = getToken('archiveParticleCount'); // 8 (high) | 5 (balanced) | 0 (lite)

  if (NUM === 0) {
    // Lite: simple scale feedback only
    gsap.timeline()
      .to(button, { scaleX: 0.96, scaleY: 0.94, duration: 0.1, ease: "power1.in" })
      .to(button, { scale: 1, duration: 0.25, ease: "back.out(1.6)" });
    return;
  }

  const rect   = button.getBoundingClientRect();
  const cx     = rect.left + rect.width  / 2;
  const cy     = rect.top  + rect.height / 2;
  const radius = getToken('successRadiusMult'); // 1.0 or 0.7

  const particles = [];
  for (let i = 0; i < NUM; i++) {
    const p = document.createElement("div");
    p.className = "ch-particle ch-particle--gold";
    p.style.cssText = `position:fixed;left:${cx}px;top:${cy}px;z-index:9000;`;
    document.body.appendChild(p);
    particles.push(p);
  }

  const tl = gsap.timeline({
    onComplete: () => particles.forEach((p) => p.remove())
  });

  // 1. Button compress
  tl.to(button, { scaleX: 0.96, scaleY: 0.94, duration: 0.1, ease: "power1.in" });

  // 2. Particles burst — radius scaled by profile
  const burstR = 40 * radius;
  const burstRand = 30 * radius;
  tl.to(particles, {
    x: (i) => Math.cos((i / NUM) * Math.PI * 2) * (burstR + Math.random() * burstRand),
    y: (i) => Math.sin((i / NUM) * Math.PI * 2) * ((burstR * 0.75) + Math.random() * (burstRand * 0.67)) - 10,
    scale: () => Math.random() * 1.2 + 0.6,
    opacity: 1,
    duration: 0.28,
    ease: "power2.out",
    stagger: 0.02,
  }, "<0.06");

  // 3. Icon glow
  if (icon) {
    tl.to(icon, { scale: 1.3, duration: 0.2, ease: "back.out(2)" }, "<");
  }

  // 4. Particles fade
  tl.to(particles, {
    y: "-=20",
    opacity: 0,
    scale: 0,
    duration: 0.35,
    ease: "power2.in",
    stagger: 0.03,
  }, "+=0.05");

  // 5. Icon + button return
  tl.to([button, icon].filter(Boolean), {
    scale: 1,
    duration: 0.25,
    ease: "back.out(1.6)",
  }, "<0.1");
}


// ─── PART 7: SIGNATURE CURIOSITY PULSE ───────────────────────────────────────
/**
 * The Curious Horizons signature: an almost imperceptible gold-blue light sweep.
 * On Lite profile, skipped entirely.
 * On Balanced profile, limited to a max number of concurrent elements.
 *
 * @param {NodeList|HTMLElement[]} elements Elements to pulse
 */
export function initCuriosityPulse(elements) {
  if (isReducedMotion() || !elements || !elements.length) return;
  if (!getToken('curiosityPulseEnabled')) return;

  const maxEls = getToken('curiosityPulseMaxElements');
  let arr = Array.from(elements);

  // Limit concurrent elements on Balanced profile
  if (maxEls < arr.length) {
    arr = arr.slice(0, maxEls);
  }

  arr.forEach((el) => {
    el.classList.add("ch-pulse-host");

    const delay = Math.random() * 4000 + 1000;

    function runPulse() {
      let pulseEl = el.querySelector(":scope > .ch-pulse-layer");
      if (!pulseEl) {
        pulseEl = document.createElement("span");
        pulseEl.className = "ch-pulse-layer";
        pulseEl.setAttribute("aria-hidden", "true");
        pulseEl.style.cssText = `
          position:absolute;inset:0;pointer-events:none;border-radius:inherit;overflow:hidden;
          background:linear-gradient(105deg,transparent 30%,rgba(220,180,78,0.09) 48%,rgba(130,90,220,0.07) 52%,transparent 70%);
          transform:translateX(-120%) translateZ(0);
        `;
        el.style.position = el.style.position || "relative";
        el.style.overflow = el.style.overflow || "hidden";
        el.appendChild(pulseEl);
      }

      const tl = gsap.fromTo(pulseEl,
        { x: "-120%" },
        {
          x: "120%",
          duration: 1.6,
          ease: "power1.inOut",
          onComplete: () => {
            setTimeout(runPulse, Math.random() * 4000 + 4000);
          }
        }
      );
      // Register for pause/resume — each pulse tween is short-lived but
      // the scheduling chain continues in background without this guard
    }

    setTimeout(runPulse, delay);
  });
}


// ─── PART 9: SIGNATURE SUCCESS ANIMATION ─────────────────────────────────────
/**
 * "Knowledge has crystallized" — a ring of gold dots from the anchor.
 * Particle count and radius scaled by performance profile.
 *
 * @param {HTMLElement} anchor Element to radiate from
 * @param {Object} [opts]
 * @param {string} [opts.label] Optional text to flash
 */
export function triggerSuccessAnimation(anchor, opts = {}) {
  if (!anchor || isReducedMotion()) return;

  const NUM    = getToken('successParticleCount');  // 10 | 6 | 0
  const radius = getToken('successRadiusMult');     // 1.0 | 0.7 | 0

  if (NUM === 0) return;

  const rect = anchor.getBoundingClientRect();
  const cx   = rect.left + rect.width  / 2;
  const cy   = rect.top  + rect.height / 2;

  const particles = [];
  for (let i = 0; i < NUM; i++) {
    const p = document.createElement("div");
    p.className = "ch-particle ch-success-dot";
    p.style.cssText = `position:fixed;left:${cx}px;top:${cy}px;z-index:8500;`;
    document.body.appendChild(p);
    particles.push(p);
  }

  const tl = gsap.timeline({
    onComplete: () => {
      particles.forEach((p) => p.remove());
      if (label) label.remove();
    }
  });

  // Ring burst — radius scaled by profile
  const burstR = 50 * radius;
  const burstRand = 20 * radius;

  tl.from(particles, { scale: 0, opacity: 0, duration: 0.01 })
    .to(particles, {
      x: (i) => Math.cos((i / NUM) * Math.PI * 2) * (burstR + Math.random() * burstRand),
      y: (i) => Math.sin((i / NUM) * Math.PI * 2) * ((burstR * 0.8) + Math.random() * (burstRand * 0.8)) - 5,
      scale: () => Math.random() * 0.8 + 0.5,
      opacity: 0.9,
      duration: 0.35,
      ease: "power3.out",
      stagger: 0.018,
    });

  // Fade out ring
  tl.to(particles, {
    opacity: 0,
    y: "-=12",
    scale: 0,
    duration: 0.4,
    ease: "power2.in",
    stagger: { each: 0.025, from: "random" },
  }, "+=0.05");

  // Optional label flash
  let label = null;
  if (opts.label) {
    label = document.createElement("div");
    label.style.cssText = `
      position:fixed;left:${cx}px;top:${cy - 40}px;z-index:8500;
      transform:translate(-50%,-50%);pointer-events:none;
      font-size:12px;font-weight:700;letter-spacing:0.08em;
      color:rgba(220,180,78,0.95);white-space:nowrap;
    `;
    label.textContent = opts.label || "✦ Done";
    document.body.appendChild(label);

    gsap.fromTo(label,
      { opacity: 0, y: 6 },
      { opacity: 1, y: 0, duration: 0.2, ease: "power2.out", delay: 0.15 }
    );
    tl.to(label, { opacity: 0, y: -8, duration: 0.3, ease: "power1.in" }, "-=0.2");
  }
}


// ─── PART 8: EMPTY STATE STORYTELLING ────────────────────────────────────────
/**
 * Replaces a generic empty state container with a curiosity-first message.
 */
export function renderEmptyState(container, opts = {}) {
  if (!container) return;

  const {
    icon  = "✦",
    title = "Every great explorer starts with a single discovery.",
    sub   = "Begin your first session to unlock this.",
  } = opts;

  container.innerHTML = `
    <div class="ch-empty-state">
      <span class="ch-empty-state-icon" aria-hidden="true">${icon}</span>
      <p class="ch-empty-state-title">${title}</p>
      <p class="ch-empty-state-sub">${sub}</p>
    </div>
  `;
}

// ─── PART 9: SESSION COMPLETE REVEAL ─────────────────────────────────────────

export function animateSessionCompleteReveal(completeScreen) {
  if (!completeScreen) return;

  const title      = completeScreen.querySelector(".complete-title");
  const subtitle   = completeScreen.querySelector(".complete-subtitle");
  const summary    = completeScreen.querySelector("#upgradeConversionSection");
  const actions    = completeScreen.querySelector(".complete-actions");
  const archive    = completeScreen.querySelector(".knowledge-pack-section");
  const reflection = completeScreen.querySelector("#reflectionSection");

  const elements = [title, subtitle, summary, actions, archive, reflection].filter(Boolean);

  if (isReducedMotion()) {
    gsap.set(elements, { opacity: 1, y: 0 });
    return;
  }

  // Profile-adaptive Y offset for reveal
  const yOffset = isLite() ? 0 : (getToken('heroSubY') ?? 16);

  gsap.set(elements, { opacity: 0, y: yOffset });
  if (reflection) gsap.set(reflection, { opacity: 0, y: yOffset * 0.5 });

  const tl = gsap.timeline({ delay: 0.1 });

  const mainElements = elements.filter(e => e !== reflection);
  if (mainElements.length > 0) {
    tl.to(mainElements, {
      opacity: 1,
      y: 0,
      duration: 0.6,
      ease: "power2.out",
      stagger: 0.1,
      clearProps: "transform"
    });
  }

  if (reflection) {
    tl.to(reflection, {
      opacity: 1,
      y: 0,
      duration: 0.8,
      ease: "power2.out",
      clearProps: "transform"
    }, "-=0.2");
  }
}
