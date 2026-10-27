import React, { useRef, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ViewStyle, StyleProp, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import Animated, {
  useAnimatedStyle, useSharedValue, withSpring, withTiming,
  withSequence, withDelay, Easing,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../theme';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

// ─── Screen Wrapper ───────────────────────────────────────────────────────────
// Drop-in SafeAreaView replacement — fades + slides up on every screen mount
interface ScreenWrapperProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  edges?: ('top' | 'bottom' | 'left' | 'right')[];
  backgroundColor?: string;  // pass 'transparent' for gradient screens
}

export const ScreenWrapper: React.FC<ScreenWrapperProps> = ({
  children, style, edges = ['top'], backgroundColor,
}) => {
  const theme = useTheme();
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(14);

  useEffect(() => {
    opacity.value = withTiming(1, { duration: 260, easing: Easing.out(Easing.cubic) });
    translateY.value = withTiming(0, { duration: 280, easing: Easing.out(Easing.cubic) });
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    flex: 1,
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  const bg = backgroundColor !== undefined ? backgroundColor : theme.colors.background;

  return (
    <SafeAreaView
      edges={edges}
      style={[{ flex: 1, backgroundColor: bg }, style]}
    >
      <Animated.View style={animStyle}>
        {children}
      </Animated.View>
    </SafeAreaView>
  );
};


// ─── Primary Button ───────────────────────────────────────────────────────────
interface PrimaryButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  icon?: keyof typeof MaterialIcons.glyphMap;
  style?: ViewStyle;
  fullWidth?: boolean;
  color?: 'violet' | 'mint' | 'moss';
}

export const PrimaryButton: React.FC<PrimaryButtonProps> = ({
  title, onPress, disabled, loading, icon, style, fullWidth = true, color = 'violet',
}) => {
  const theme = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  const gradientColors = {
    violet: [theme.accent.violet, theme.accent.indigo] as [string, string],
    mint: [theme.accent.mint, '#3BAF8E'] as [string, string],
    moss: [theme.garden.moss, theme.accent.violet] as [string, string],
  };

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => { });
    onPress();
  };

  return (
    <AnimatedTouchable
      onPress={handlePress}
      disabled={disabled || loading}
      onPressIn={() => { scale.value = withSpring(0.96, { stiffness: 500, damping: 15 }); }}
      onPressOut={() => { scale.value = withSpring(1, { stiffness: 400, damping: 12 }); }}
      activeOpacity={1}
      style={[animatedStyle, fullWidth && { width: '100%' as any }, { opacity: disabled ? 0.4 : 1 }, style]}
    >
      <LinearGradient
        colors={gradientColors[color]}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
        style={styles.primaryButton}
      >
        {loading ? (
          <ActivityIndicator color="#EAEAF5" />
        ) : (
          <View style={styles.buttonContent}>
            {icon && <MaterialIcons name={icon} size={20} color="#EAEAF5" style={{ marginRight: 8 }} />}
            <Text style={[theme.typography.button, { color: '#EAEAF5' }]}>{title}</Text>
          </View>
        )}
      </LinearGradient>
    </AnimatedTouchable>
  );
};

// ─── Ghost Button ─────────────────────────────────────────────────────────────
interface GhostButtonProps {
  title: string;
  onPress: () => void;
  color?: string;
  icon?: keyof typeof MaterialIcons.glyphMap;
  style?: ViewStyle;
}

export const GhostButton: React.FC<GhostButtonProps> = ({ title, onPress, color, icon, style }) => {
  const theme = useTheme();
  const btnColor = color || theme.accent.violet;
  const scale = useSharedValue(1);
  const aStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <AnimatedTouchable
      onPress={onPress}
      onPressIn={() => { scale.value = withSpring(0.96, { stiffness: 500, damping: 15 }); }}
      onPressOut={() => { scale.value = withSpring(1, { stiffness: 400, damping: 12 }); }}
      style={[aStyle, styles.ghostButton, { borderColor: btnColor }, style]}
      activeOpacity={1}
    >
      {icon && <MaterialIcons name={icon} size={18} color={btnColor} style={{ marginRight: 6 }} />}
      <Text style={[theme.typography.button, { color: btnColor }]}>{title}</Text>
    </AnimatedTouchable>
  );
};

// ─── Flat Text Button ─────────────────────────────────────────────────────────
interface FlatButtonProps { title: string; onPress: () => void; color?: string; style?: ViewStyle; }

export const FlatButton: React.FC<FlatButtonProps> = ({ title, onPress, color, style }) => {
  const theme = useTheme();
  return (
    <TouchableOpacity onPress={onPress} style={[{ padding: 8, alignSelf: 'center' }, style]} activeOpacity={0.6}>
      <Text style={[theme.typography.body, { color: color || theme.colors.textSecondary }]}>{title}</Text>
    </TouchableOpacity>
  );
};

// ─── Subject Chip ─────────────────────────────────────────────────────────────
interface SubjectChipProps { name: string; color: string; style?: ViewStyle; small?: boolean; }

export const SubjectChip: React.FC<SubjectChipProps> = ({ name, color, style, small }) => {
  const theme = useTheme();
  return (
    <View style={[styles.chip, { backgroundColor: color + '33', paddingVertical: small ? 2 : 4, paddingHorizontal: small ? 8 : 12 }, style]}>
      <View style={[styles.chipDot, { backgroundColor: color }]} />
      <Text style={[small ? theme.typography.caption : theme.typography.label, { color, flexShrink: 0 }]}>
        {name}
      </Text>
    </View>
  );
};

// ─── Status Pill ──────────────────────────────────────────────────────────────
interface StatusPillProps { label: string; variant: 'success' | 'error' | 'warning' | 'info' | 'neutral'; style?: ViewStyle; }

export const StatusPill: React.FC<StatusPillProps> = ({ label, variant, style }) => {
  const theme = useTheme();
  const colorMap = {
    success: theme.accent.mint, error: theme.accent.coral, warning: theme.accent.amber,
    info: theme.accent.sky, neutral: theme.colors.textSecondary,
  };
  const c = colorMap[variant];
  return (
    <View style={[styles.statusPill, { backgroundColor: c + '22' }, style]}>
      <Text style={[theme.typography.label, { color: c, fontSize: 11 }]}>{label}</Text>
    </View>
  );
};

// ─── Card ─────────────────────────────────────────────────────────────────────
interface CardProps { children: React.ReactNode; style?: StyleProp<ViewStyle>; variant?: 'primary' | 'secondary' | 'hero'; }

export const Card: React.FC<CardProps> = ({ children, style, variant = 'primary' }) => {
  const theme = useTheme();
  if (variant === 'hero') {
    return (
      <LinearGradient
        colors={[theme.accent.indigo, theme.accent.violet]}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
        style={[styles.heroCard, style]}
      >
        {children}
      </LinearGradient>
    );
  }
  return (
    <View style={[variant === 'primary' ? styles.primaryCard : styles.secondaryCard,
    { backgroundColor: variant === 'secondary' ? theme.colors.elevated : theme.colors.card },
    theme.mode === 'light' && theme.shadows.card, style]}>
      {children}
    </View>
  );
};

// ─── Section Header ───────────────────────────────────────────────────────────
interface SectionHeaderProps { title: string; action?: { label: string; onPress: () => void }; }

export const SectionHeader: React.FC<SectionHeaderProps> = ({ title, action }) => {
  const theme = useTheme();
  return (
    <View style={styles.sectionHeader}>
      <Text style={[theme.typography.h2, { color: theme.colors.textPrimary }]}>{title}</Text>
      {action && (
        <TouchableOpacity onPress={action.onPress}>
          <Text style={[theme.typography.label, { color: theme.accent.violet }]}>{action.label}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

// ─── Animated Checkbox ────────────────────────────────────────────────────────
// Spring bounce + haptic on check
interface CheckboxProps { checked: boolean; onToggle: () => void; size?: number; }

export const AnimatedCheckbox: React.FC<CheckboxProps> = ({ checked, onToggle, size = 24 }) => {
  const theme = useTheme();
  const checkScale = useSharedValue(checked ? 1 : 0);
  const outerScale = useSharedValue(1);
  const prev = useRef(checked);

  useEffect(() => {
    checkScale.value = withSpring(checked ? 1 : 0, { stiffness: 400, damping: 15 });
  }, [checked]);

  const handleToggle = () => {
    if (!prev.current) {
      // Checking: scale bounce + haptic
      outerScale.value = withSequence(
        withTiming(1.25, { duration: 90, easing: Easing.out(Easing.quad) }),
        withSpring(1, { stiffness: 500, damping: 12 }),
      );
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => { });
    }
    prev.current = !prev.current;
    onToggle();
  };

  const innerStyle = useAnimatedStyle(() => ({ transform: [{ scale: checkScale.value }], opacity: checkScale.value }));
  const outerStyle = useAnimatedStyle(() => ({ transform: [{ scale: outerScale.value }] }));

  return (
    <Animated.View style={outerStyle}>
      <TouchableOpacity
        onPress={handleToggle}
        style={[styles.checkbox, {
          width: size, height: size, borderRadius: size / 2,
          borderColor: checked ? theme.accent.mint : theme.colors.divider,
          backgroundColor: checked ? theme.accent.mint : 'transparent',
        }]}
        activeOpacity={0.7}
      >
        <Animated.View style={innerStyle}>
          <MaterialIcons name="check" size={size - 8} color="#fff" />
        </Animated.View>
      </TouchableOpacity>
    </Animated.View>
  );
};

// ─── Skeleton Loader ──────────────────────────────────────────────────────────
// Shimmer using Reanimated
export const SkeletonLine: React.FC<{ width?: number | string; height?: number; style?: ViewStyle }> = ({
  width = '100%', height = 16, style,
}) => {
  const theme = useTheme();
  const opacity = useSharedValue(0.4);

  useEffect(() => {
    opacity.value = withSequence(
      withTiming(1, { duration: 700, easing: Easing.inOut(Easing.sin) }),
      withTiming(0.4, { duration: 700, easing: Easing.inOut(Easing.sin) }),
    );
    // repeat
    const id = setInterval(() => {
      opacity.value = withSequence(
        withTiming(1, { duration: 700, easing: Easing.inOut(Easing.sin) }),
        withTiming(0.4, { duration: 700, easing: Easing.inOut(Easing.sin) }),
      );
    }, 1400);
    return () => clearInterval(id);
  }, []);

  const aStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.View style={[{ width: width as any, height, backgroundColor: theme.colors.elevated, borderRadius: 8 }, style, aStyle]} />
  );
};

// ─── Filter Chip Row ──────────────────────────────────────────────────────────
// Animated chip selection with spring scale
interface FilterChipRowProps { options: string[]; selected: string; onSelect: (option: string) => void; }

export const FilterChipRow: React.FC<FilterChipRowProps> = ({ options, selected, onSelect }) => {
  const theme = useTheme();
  return (
    <View style={styles.filterRow}>
      {options.map((opt) => {
        const isSelected = selected === opt;
        return (
          <AnimatedFilterChip
            key={opt}
            label={opt}
            isSelected={isSelected}
            onPress={() => onSelect(opt)}
          />
        );
      })}
    </View>
  );
};

// Individual animated filter chip
const AnimatedFilterChip: React.FC<{ label: string; isSelected: boolean; onPress: () => void }> = ({
  label, isSelected, onPress,
}) => {
  const theme = useTheme();
  const scale = useSharedValue(1);
  const aStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  const handlePress = () => {
    scale.value = withSequence(
      withTiming(0.92, { duration: 80 }),
      withSpring(1, { stiffness: 500, damping: 12 }),
    );
    onPress();
  };

  return (
    <AnimatedTouchable
      onPress={handlePress}
      style={[aStyle, styles.filterChip, { backgroundColor: isSelected ? theme.accent.violet : theme.colors.elevated }]}
      activeOpacity={1}
    >
      <Text style={[theme.typography.label, { color: isSelected ? '#EAEAF5' : theme.colors.textSecondary }]}>
        {label}
      </Text>
    </AnimatedTouchable>
  );
};

// ─── Segmented Control ────────────────────────────────────────────────────────
// Animated sliding indicator
interface SegmentedControlProps { segments: string[]; selected: number; onSelect: (index: number) => void; }

export const SegmentedControl: React.FC<SegmentedControlProps> = ({ segments, selected, onSelect }) => {
  const theme = useTheme();

  const handleSelect = (i: number) => {
    Haptics.selectionAsync().catch(() => { });
    onSelect(i);
  };

  return (
    <View style={[styles.segmentedContainer, { backgroundColor: theme.colors.elevated }]}>
      {segments.map((seg, i) => {
        const isSelected = selected === i;
        return (
          <TouchableOpacity
            key={seg}
            onPress={() => handleSelect(i)}
            style={[styles.segment, isSelected && { backgroundColor: theme.accent.violet }]}
            activeOpacity={0.75}
          >
            <Text style={[theme.typography.label, { color: isSelected ? '#EAEAF5' : theme.colors.textSecondary }]}>
              {seg}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

// ─── Animated Progress Bar ────────────────────────────────────────────────────
// Used in Exam Detail, Grades
interface AnimatedProgressBarProps { progress: number; color: string; delay?: number; }

export const AnimatedProgressBar: React.FC<AnimatedProgressBarProps> = ({ progress, color, delay = 0 }) => {
  const width = useSharedValue(0);

  useEffect(() => {
    width.value = withDelay(delay,
      withTiming(Math.min(progress * 100, 100), { duration: 900, easing: Easing.out(Easing.cubic) })
    );
  }, [progress]);

  const aStyle = useAnimatedStyle(() => ({ width: `${width.value}%` as any }));

  return (
    <Animated.View style={[{ height: '100%', borderRadius: 4, backgroundColor: color }, aStyle]} />
  );
};

const styles = StyleSheet.create({
  primaryButton: { height: 52, borderRadius: 9999, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 },
  buttonContent: { flexDirection: 'row', alignItems: 'center' },
  ghostButton: { height: 48, borderRadius: 9999, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', paddingHorizontal: 20 },
  chip: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', borderRadius: 9999, gap: 6, flexShrink: 0 },
  chipDot: { width: 8, height: 8, borderRadius: 4 },
  statusPill: { paddingVertical: 3, paddingHorizontal: 10, borderRadius: 9999, alignSelf: 'flex-start' },
  primaryCard: { borderRadius: 16, padding: 16 },
  secondaryCard: { borderRadius: 12, padding: 16 },
  heroCard: { borderRadius: 20, padding: 20 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 24, marginBottom: 12 },
  checkbox: { borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  filterRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  filterChip: { paddingVertical: 6, paddingHorizontal: 16, borderRadius: 9999 },
  segmentedContainer: { flexDirection: 'row', borderRadius: 12, padding: 3 },
  segment: { flex: 1, paddingVertical: 8, borderRadius: 10, alignItems: 'center' },
});
