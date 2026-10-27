/**
 * StudyFlow Spacing & Layout Tokens
 *
 * Based on 8pt grid system.
 */

export const Spacing = {
  /** 4px */
  xs: 4,
  /** 8px */
  sm: 8,
  /** 12px */
  md: 12,
  /** 16px – page margins, card padding */
  lg: 16,
  /** 20px – hero card padding */
  xl: 20,
  /** 24px – section spacing */
  xxl: 24,
  /** 32px */
  xxxl: 32,
  /** 48px */
  huge: 48,
} as const;

export const BorderRadius = {
  /** 8px – small elements */
  sm: 8,
  /** 12px – inputs, secondary cards, tertiary buttons */
  md: 12,
  /** 16px – primary cards */
  lg: 16,
  /** 20px – hero cards */
  xl: 20,
  /** 24px – bottom sheet top corners */
  xxl: 24,
  /** Pill shape */
  pill: 9999,
} as const;

export const Layout = {
  /** Minimum tap target */
  minTapTarget: 44,
  /** Standard list row height */
  listRowHeight: 60,
  /** Page horizontal padding */
  pageHorizontalPadding: Spacing.lg,
  /** Bottom tab bar height */
  tabBarHeight: 80,
  /** FAB size */
  fabSize: 56,
} as const;

export const Shadows = {
  /** Light mode card shadow */
  cardLight: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 16,
    elevation: 3,
  },
  /** Glow effect for dark mode */
  violetGlow: {
    shadowColor: '#6C63FF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 5,
  },
  /** Subtle card elevation for dark mode */
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
} as const;
