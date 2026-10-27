/**
 * StudyFlow Animation Constants
 *
 * Spring-driven animations for premium feel.
 */

export const AnimationConfig = {
  /** Primary spring – stiffness 280, damping 28 */
  spring: {
    stiffness: 280,
    damping: 28,
    mass: 1,
  },

  /** Duration scales */
  duration: {
    /** Micro – state changes */
    micro: 150,
    /** Standard – screen transitions */
    standard: 350,
    /** Expressive – celebrations */
    expressive: 500,
  },

  /** Skeleton shimmer loop */
  skeleton: {
    duration: 1500,
  },

  /** Checkbox complete animation */
  checkbox: {
    fillDuration: 200,
    bounceDuration: 250,
    bounceScale: 1.2,
  },

  /** Tab switch */
  tabSwitch: {
    contentDuration: 200,
    indicatorSpring: 250,
  },

  /** Bottom sheet */
  bottomSheet: {
    openSpring: 350,
    closeDuration: 250,
  },

  /** Button press */
  buttonPress: {
    scale: 0.97,
    duration: 120,
  },

  /** FAB */
  fab: {
    scaleIn: 200,
    scaleOut: 150,
  },
} as const;
