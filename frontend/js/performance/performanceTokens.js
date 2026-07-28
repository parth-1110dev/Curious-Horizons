/**
 * Curious Horizons — Performance Tokens
 * Sprint 6: Mobile Performance & Device Compatibility Framework
 *
 * Single source of truth for all adaptive visual values per profile.
 * Changing a value here automatically propagates to every system that reads it.
 *
 * Naming convention: camelCase keys, profile-keyed objects.
 *
 * @typedef {'high' | 'balanced' | 'lite'} PerformanceProfile
 */

/**
 * All adaptive performance tokens.
 * Systems must always read from getToken(), never hardcode values.
 */
const TOKENS = {
  // ─── Ambient Lighting ───────────────────────────────────────────────────────
  /** Filter blur (px) applied to each ambient layer [layer1, layer2, layer3] */
  ambientBlur: {
    high:     [80, 60, 90],
    balanced: [40, 30, 50],
    lite:     [0,  0,  0],
  },

  /** Opacity for ambient layers [layer1, layer2, layer3] */
  ambientOpacity: {
    high:     [0.8, 0.6, 0.7],
    balanced: [0.6, 0.45, 0.55],
    lite:     [0.5, 0.35, 0.45],
  },

  /** Whether ambient layers drift/animate (false = static via gsap.set once) */
  ambientDrift: {
    high:     true,
    balanced: true,
    lite:     false,
  },

  /** Drift range multiplier — scales randomX/Y range in ambient drift */
  ambientDriftRange: {
    high:     1.0,    // ±15vw / ±15vh
    balanced: 0.5,    // ±7.5vw / ±7.5vh
    lite:     0,
  },

  /** Duration multiplier for ambient drift animation — longer = smoother on slow GPUs */
  ambientDriftDurationMult: {
    high:     1.0,    // 15–25s baseline
    balanced: 1.6,    // 24–40s (slower = less GPU updates/sec)
    lite:     0,
  },

  // ─── Particle Effects ───────────────────────────────────────────────────────
  /** Number of particles for knowledge formation animation */
  formationParticleCount: {
    high:     14,
    balanced: 8,
    lite:     0,
  },

  /** Number of particles for archive completion burst */
  archiveParticleCount: {
    high:     8,
    balanced: 5,
    lite:     0,
  },

  /** Number of particles for success animation ring */
  successParticleCount: {
    high:     10,
    balanced: 6,
    lite:     0,
  },

  /** Radius multiplier for success ring burst */
  successRadiusMult: {
    high:     1.0,   // 50px base
    balanced: 0.7,   // 35px
    lite:     0,
  },

  // ─── Button Interactions ────────────────────────────────────────────────────
  /** Enable USP button idle breathing animation (GSAP repeat:-1 timelines) */
  uspIdleAnimation: {
    high:     'full',     // Full two-timeline breathing + shimmer
    balanced: 'reduced',  // Simplified single-timeline, 60% opacity range
    lite:     'none',     // CSS hover only, no GSAP idle timelines
  },

  /** Enable curiosity pulse shimmer on interactive elements */
  curiosityPulseEnabled: {
    high:     true,
    balanced: true,
    lite:     false,
  },

  /** Maximum concurrent curiosity pulse elements */
  curiosityPulseMaxElements: {
    high:     999, // unlimited
    balanced: 3,
    lite:     0,
  },

  // ─── Card & Hero Interactions ───────────────────────────────────────────────
  /** Enable 3D rotationX/Y on card hover (expensive GPU compositing) */
  cardHover3D: {
    high:     true,
    balanced: false,
    lite:     false,
  },

  /** Card lift distance on hover (px) */
  cardLift: {
    high:     -8,
    balanced: -4,
    lite:     0,
  },

  /** Card scale on hover */
  cardScale: {
    high:     1.02,
    balanced: 1.01,
    lite:     1.0,
  },

  /** Hero animation Y offset for entrance */
  heroWordY: {
    high:     18,
    balanced: 10,
    lite:     0,
  },

  /** Hero animation stagger delay between words */
  heroWordStagger: {
    high:     0.055,
    balanced: 0.035,
    lite:     0,
  },

  /** Enable rotationX on hero title words */
  heroWord3D: {
    high:     true,
    balanced: false,
    lite:     false,
  },

  /** Hero subtext/form Y entrance offset */
  heroSubY: {
    high:     14,
    balanced: 8,
    lite:     0,
  },

  // ─── Scroll Choreography ────────────────────────────────────────────────────
  /** ScrollTrigger reveal Y offset */
  scrollRevealY: {
    high:     40,
    balanced: 20,
    lite:     0,
  },

  // ─── Loading State ──────────────────────────────────────────────────────────
  /** Enable breathing glow animation in loading overlay */
  loadingGlowEnabled: {
    high:     true,
    balanced: true,
    lite:     false,
  },

  // ─── Backdrop Filters ───────────────────────────────────────────────────────
  /** Nav backdrop blur intensity (px) */
  navBackdropBlur: {
    high:     20,
    balanced: 12,
    lite:     0,
  },

  /** Glass element backdrop blur intensity (px) */
  glassBackdropBlur: {
    high:     14,
    balanced: 8,
    lite:     0,
  },
};

/**
 * Retrieve a token value for the given profile.
 * @param {string} key - Token key from TOKENS
 * @param {PerformanceProfile} profile - 'high' | 'balanced' | 'lite'
 * @returns {*} The token value
 */
export function getToken(key, profile) {
  const token = TOKENS[key];
  if (!token) {
    console.warn(`[PerformanceTokens] Unknown token: "${key}"`);
    return undefined;
  }
  if (!(profile in token)) {
    console.warn(`[PerformanceTokens] Unknown profile: "${profile}" for token "${key}"`);
    return token.high; // fallback to high
  }
  return token[profile];
}

/**
 * Retrieve all tokens for a given profile as a flat object.
 * Useful for initialization when many values are needed at once.
 * @param {PerformanceProfile} profile
 * @returns {Object}
 */
export function getAllTokens(profile) {
  const result = {};
  for (const key of Object.keys(TOKENS)) {
    result[key] = getToken(key, profile);
  }
  return result;
}
