/**
 * StudyFlow Typography System
 *
 * Uses Inter font with a clear hierarchy.
 * All sizes in logical pixels, line heights in multipliers.
 */
import { TextStyle, Platform } from 'react-native';

const FONT_FAMILY = Platform.select({
  ios: 'Inter',
  android: 'Inter',
  default: 'Inter',
});

export const Typography = {
  /** Screen titles – Inter Bold 700, 28px */
  h1: {
    fontFamily: FONT_FAMILY,
    fontWeight: '700' as TextStyle['fontWeight'],
    fontSize: 28,
    lineHeight: 34,
  },

  /** Section headers – Inter SemiBold 600, 18px */
  h2: {
    fontFamily: FONT_FAMILY,
    fontWeight: '600' as TextStyle['fontWeight'],
    fontSize: 18,
    lineHeight: 24,
    letterSpacing: 0.18,
  },

  /** Card / Item titles – Inter SemiBold 600, 16px */
  h3: {
    fontFamily: FONT_FAMILY,
    fontWeight: '600' as TextStyle['fontWeight'],
    fontSize: 16,
    lineHeight: 22,
  },

  /** Body / List items – Inter Regular 400, 15px */
  body: {
    fontFamily: FONT_FAMILY,
    fontWeight: '400' as TextStyle['fontWeight'],
    fontSize: 15,
    lineHeight: 24,
  },

  /** Labels / Chips / Badges – Inter Medium 500, 13px */
  label: {
    fontFamily: FONT_FAMILY,
    fontWeight: '500' as TextStyle['fontWeight'],
    fontSize: 13,
    lineHeight: 18,
  },

  /** Captions / Timestamps – Inter Regular 400, 12px */
  caption: {
    fontFamily: FONT_FAMILY,
    fontWeight: '400' as TextStyle['fontWeight'],
    fontSize: 12,
    lineHeight: 16,
  },

  /** Hero numbers (GPA, Timer) – Inter Bold 700, 48px */
  hero: {
    fontFamily: FONT_FAMILY,
    fontWeight: '700' as TextStyle['fontWeight'],
    fontSize: 48,
    lineHeight: 56,
  },

  /** Button text – Inter SemiBold 600, 16px */
  button: {
    fontFamily: FONT_FAMILY,
    fontWeight: '600' as TextStyle['fontWeight'],
    fontSize: 16,
    lineHeight: 22,
  },
} as const;

export type TypographyVariant = keyof typeof Typography;
