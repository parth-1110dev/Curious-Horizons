import gsap from 'gsap';

/**
 * Curious Horizons - Reusable Loading State System
 */

let overlayElement = null;
let titleElement = null;
let messageContainer = null;
let progressRunner = null;
let glowElement = null;

// Timelines
let masterTl = null;
let runnerTl = null;
let messageTl = null;
let glowTl = null;

// State
let isShowing = false;
let currentFocus = null;

const createDOM = () => {
  if (overlayElement) return;

  const wrapper = document.createElement('div');
  wrapper.innerHTML = `
    <div class="loading-overlay" id="ch-loading-overlay" role="dialog" aria-modal="true" aria-labelledby="ch-loading-title">
      <div class="loading-glow"></div>
      <div class="loading-card">
        <h2 id="ch-loading-title" class="loading-title"></h2>
        <div class="loading-progress-track">
          <div class="loading-progress-runner"></div>
        </div>
        <div class="loading-message-container"></div>
      </div>
    </div>
  `;

  overlayElement = wrapper.firstElementChild;
  titleElement = overlayElement.querySelector('.loading-title');
  messageContainer = overlayElement.querySelector('.loading-message-container');
  progressRunner = overlayElement.querySelector('.loading-progress-runner');
  glowElement = overlayElement.querySelector('.loading-glow');

  document.body.appendChild(overlayElement);
};

const trapFocus = (e) => {
  if (isShowing && overlayElement && !overlayElement.contains(e.target)) {
    e.stopPropagation();
    overlayElement.focus();
  }
};

const initFocusTrap = () => {
  currentFocus = document.activeElement;
  document.addEventListener('focusin', trapFocus);
  overlayElement.setAttribute('tabindex', '-1');
  overlayElement.focus();
};

const releaseFocusTrap = () => {
  document.removeEventListener('focusin', trapFocus);
  if (currentFocus) {
    currentFocus.focus();
  }
};

/**
 * Show the loading overlay
 * @param {Object} options 
 * @param {string} options.title - The title text (e.g. "Loading")
 * @param {string[]} [options.messages] - Array of messages to crossfade
 */
export const showLoading = ({ title = 'Loading...', messages = [] }) => {
  if (isShowing) return;
  isShowing = true;

  createDOM();
  initFocusTrap();

  // Populate content
  titleElement.textContent = title;
  messageContainer.innerHTML = ''; // clear previous

  // Create message elements
  const msgElements = [];
  if (messages.length > 0) {
    messages.forEach((msg, i) => {
      const el = document.createElement('div');
      el.className = 'loading-message';
      el.textContent = msg;
      // Start all messages transparent and centered
      gsap.set(el, { opacity: 0, y: 4, xPercent: -50, left: '50%' });
      messageContainer.appendChild(el);
      msgElements.push(el);
    });
  } else {
    // Default empty state to keep layout stable if no messages
    const el = document.createElement('div');
    el.className = 'loading-message';
    el.textContent = '';
    messageContainer.appendChild(el);
  }

  // Prevent background scroll
  document.body.style.overflow = 'hidden';

  // Setup initial states
  gsap.set(overlayElement, { autoAlpha: 0 }); // autoAlpha handles visibility & opacity
  gsap.set(progressRunner, { xPercent: -100, scaleX: 1 });

  // Check prefers-reduced-motion
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Master entrance animation
  masterTl = gsap.timeline();
  masterTl.to(overlayElement, {
    autoAlpha: 1,
    duration: 0.6,
    ease: 'power2.out'
  });

  // Runner infinite calm animation (translates across)
  runnerTl = gsap.timeline({ repeat: -1 });
  if (prefersReduced) {
    runnerTl.to(progressRunner, { xPercent: 0, duration: 2, ease: 'linear' })
      .to(progressRunner, { xPercent: 100, duration: 2, ease: 'linear' });
  } else {
    // Smooth, calm horizontal sweeping
    runnerTl.fromTo(progressRunner,
      { xPercent: -100, scaleX: 0.8 },
      { xPercent: 100, scaleX: 1.2, duration: 2.2, ease: 'sine.inOut' }
    ).to(progressRunner, {
      xPercent: 250, scaleX: 0.8, duration: 1.5, ease: 'sine.inOut'
    }); // move offscreen right before looping
  }

  // Breathing glow animation
  if (!prefersReduced) {
    glowTl = gsap.timeline({ repeat: -1, yoyo: true });
    glowTl.fromTo(glowElement,
      { opacity: 0.3, scale: 0.95 },
      { opacity: 0.6, scale: 1.05, duration: 3, ease: 'sine.inOut' }
    );
  }

  // Messages crossfade animation
  if (msgElements.length > 1) {
    messageTl = gsap.timeline({ repeat: -1 });
    msgElements.forEach((el, i) => {
      // Fade in and slight float up
      messageTl.to(el, {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: 'power2.out'
      })
        // Hold
        .to(el, { opacity: 1, duration: 2 })
        // Fade out
        .to(el, {
          opacity: 0,
          y: -4,
          duration: 0.8,
          ease: 'power2.in'
        });
    });
  } else if (msgElements.length === 1) {
    // Just fade in the single message
    gsap.to(msgElements[0], { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out', delay: 0.3 });
  }

  overlayElement.classList.add('active');
};

/**
 * Manually update the current step message.
 * Will stop the auto-crossfade if running.
 * @param {string} message 
 */
export const updateLoadingStep = (message) => {
  if (!isShowing || !messageContainer) return;

  // Kill existing message timeline to take manual control
  if (messageTl) {
    messageTl.kill();
    messageTl = null;
  }

  // Fade out existing messages
  const existing = Array.from(messageContainer.children);

  const outTl = gsap.timeline();
  if (existing.length > 0) {
    outTl.to(existing, {
      opacity: 0, y: -4, duration: 0.4, ease: 'power2.in', onComplete: () => {
        messageContainer.innerHTML = '';
      }
    });
  }

  // Fade in new message
  outTl.call(() => {
    const el = document.createElement('div');
    el.className = 'loading-message';
    el.textContent = message;
    gsap.set(el, { opacity: 0, y: 4, xPercent: -50, left: '50%' });
    messageContainer.appendChild(el);

    gsap.to(el, { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' });
  });
};

/**
 * Hide the loading overlay and clean up
 */
export const hideLoading = () => {
  if (!isShowing || !overlayElement) return;

  const tl = gsap.timeline({
    onComplete: () => {
      isShowing = false;
      overlayElement.classList.remove('active');
      document.body.style.overflow = '';
      releaseFocusTrap();

      // Kill timelines
      if (runnerTl) runnerTl.kill();
      if (glowTl) glowTl.kill();
      if (messageTl) messageTl.kill();

      runnerTl = null;
      glowTl = null;
      messageTl = null;

      // Reset DOM state safely
      messageContainer.innerHTML = '';
      gsap.set(progressRunner, { clearProps: 'all' });
      gsap.set(glowElement, { clearProps: 'all' });
    }
  });

  tl.to(overlayElement, {
    autoAlpha: 0,
    duration: 0.5,
    ease: 'power2.inOut'
  });
};
