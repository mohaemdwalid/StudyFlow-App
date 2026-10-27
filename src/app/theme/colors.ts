/**
 * StudyFlow Design System Color Tokens
 *
 * All color values from the StudyFlow design system.
 * No hardcoded colors should be used outside this file.
 */

export const Colors = {
  // ── Dark Mode Surfaces ──
  dark: {
    background: '#0D0F18',       // Abyss Black
    card: '#161924',             // Midnight Slate  
    elevated: '#1F2235',         // Elevated Charcoal
    divider: '#2A2D3E',          // Subtle Divider Smoke
    textPrimary: '#EAEAF5',      // Moonbeam White
    textSecondary: '#8B8FA8',    // Steel Whisper
  },

  // ── Light Mode Surfaces ──
  light: {
    background: '#F5F6FB',       // Ghost White Canvas
    card: '#FFFFFF',             // Pure Cloud
    elevated: '#ECEEF7',         // Powder Mist
    divider: '#DDE0EE',          // Silk Divider
    textPrimary: '#1A1A2E',      // Deep Ink
    textSecondary: '#8B8FA8',    // Steel Whisper
  },

  // ── Accent Colors (both modes) ──
  accent: {
    violet: '#6C63FF',           // Electric Violet
    indigo: '#4F46E5',           // Cosmic Indigo
    coral: '#FF6B6B',            // Coral Ember
    mint: '#4ADEAA',             // Mint Pulse
    amber: '#F59E0B',            // Amber Alert
    sky: '#38BDF8',              // Sky Breeze
  },

  // ── Garden Feature Colors ──
  garden: {
    moss: '#3D7A5E',             // Living Moss
    sprout: '#6DBF8A',           // Tender Sprout
    wilted: '#7A7A82',           // Wilted Ash
    soil: '#4A3728',             // Soil Brown
    petal: '#F4A7B9',            // Petal Blush
  },

  // ── Semantic ──
  semantic: {
    success: '#4ADEAA',
    error: '#FF6B6B',
    warning: '#F59E0B',
    info: '#38BDF8',
  },
} as const;

export type ThemeMode = 'dark' | 'light';

export interface ThemeColors {
  background: string;
  card: string;
  elevated: string;
  divider: string;
  textPrimary: string;
  textSecondary: string;
}

export const getThemeColors = (mode: ThemeMode): ThemeColors => Colors[mode];
