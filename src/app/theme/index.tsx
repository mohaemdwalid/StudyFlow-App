/**
 * StudyFlow Theme Provider & useTheme Hook
 */
import React, { createContext, useContext, useMemo } from 'react';
import { useColorScheme } from 'react-native';
import { Colors, ThemeMode, ThemeColors, getThemeColors } from './colors';
import { Typography } from './typography';
import { Spacing, BorderRadius, Layout, Shadows } from './spacing';
import { AnimationConfig } from './animations';

export interface Theme {
  mode: ThemeMode;
  colors: ThemeColors;
  accent: typeof Colors.accent;
  garden: typeof Colors.garden;
  semantic: typeof Colors.semantic;
  typography: typeof Typography;
  spacing: typeof Spacing;
  borderRadius: typeof BorderRadius;
  layout: typeof Layout;
  shadows: {
    card: typeof Shadows.cardLight | typeof Shadows.none;
    glow: typeof Shadows.violetGlow;
  };
  animation: typeof AnimationConfig;
}

const ThemeContext = createContext<Theme | null>(null);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const colorScheme = useColorScheme();
  const mode: ThemeMode = colorScheme === 'light' ? 'light' : 'dark';

  const theme = useMemo<Theme>(
    () => ({
      mode,
      colors: getThemeColors(mode),
      accent: Colors.accent,
      garden: Colors.garden,
      semantic: Colors.semantic,
      typography: Typography,
      spacing: Spacing,
      borderRadius: BorderRadius,
      layout: Layout,
      shadows: {
        card: mode === 'light' ? Shadows.cardLight : Shadows.none,
        glow: Shadows.violetGlow,
      },
      animation: AnimationConfig,
    }),
    [mode],
  );

  return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>;
};

export const useTheme = (): Theme => {
  const theme = useContext(ThemeContext);
  if (!theme) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return theme;
};

export { Colors, Typography, Spacing, BorderRadius, Layout, Shadows, AnimationConfig };
