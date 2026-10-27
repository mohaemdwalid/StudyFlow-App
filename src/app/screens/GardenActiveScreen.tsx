import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Dimensions, AppState, AppStateStatus,
} from 'react-native';
import Animated, {
  useSharedValue, useAnimatedStyle, withRepeat, withSequence,
  withTiming, withSpring, Easing, FadeInDown,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../theme';
import { useAppStore } from '../state';
import type { PlantSession, PlantStage } from '../../types';

const { width: W } = Dimensions.get('window');
const RING_SIZE = W * 0.72;
const STROKE_W = 10;
const RADIUS = (RING_SIZE - STROKE_W) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const STAGE_THRESHOLDS: { pct: number; stage: PlantStage; label: string }[] = [
  { pct: 0, stage: 'seed', label: 'Seed planted…' },
  { pct: 0.25, stage: 'sprout', label: 'Sprouting!' },
  { pct: 0.5, stage: 'leaf', label: 'Growing strong…' },
  { pct: 0.75, stage: 'flower', label: 'Almost blooming…' },
];

interface RouteParams {
  plant: string;
  plantName: string;
  duration: number; // minutes
  subjectId?: string;
  strictMode: boolean;
  sessionId: string;
}

export default function GardenActiveScreen({ navigation, route }: any) {
  const theme = useTheme();
  const params = (route?.params ?? {}) as RouteParams;
  const totalSeconds = (params.duration ?? 50) * 60;
  const plantEmoji = params.plant ?? '🌱';
  const subjectName = params.plantName ?? 'Focus';
  const isStrict = params.strictMode ?? false;
  const sessionId = params.sessionId ?? `ps_${Date.now()}`;
  const subjectId = params.subjectId;

  const { addPlantSession, updatePlantSession, addFocusSession, subjects } = useAppStore();

  const [secondsLeft, setSecondsLeft] = useState(totalSeconds);
  const sessionCreated = useRef(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const hasEnded = useRef(false);

  // ── Create session on mount ──
  useEffect(() => {
    if (!sessionCreated.current) {
      sessionCreated.current = true;
      const session: PlantSession = {
        id: sessionId,
        plantType: 'sunflower',
        plantEmoji,
        duration: params.duration ?? 50,
        subjectId,
        status: 'growing',
        stage: 'seed',
        startedAt: new Date().toISOString(),
        strictMode: isStrict,
      };
      addPlantSession(session);
    }
  }, []);

  // ── AppState listener for strict mode ──
  useEffect(() => {
    if (!isStrict) return;

    let backgroundTimer: ReturnType<typeof setTimeout> | null = null;

    const handleAppState = (nextState: AppStateStatus) => {
      if (nextState === 'background' && !hasEnded.current) {
        // Debounce: only kill the plant if truly backgrounded (not just tab switch)
        backgroundTimer = setTimeout(() => {
          if (hasEnded.current) return;
          hasEnded.current = true;
          if (timerRef.current) clearInterval(timerRef.current);
          updatePlantSession(sessionId, {
            status: 'withered',
            endedAt: new Date().toISOString(),
          });
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => { });
          if (navigation.isFocused()) {
            navigation.replace('GardenResult', {
              sessionId,
              status: 'withered',
              plant: plantEmoji,
              plantName: subjectName,
              duration: params.duration ?? 50,
            });
          }
        }, 1500); // only after 1.5s of background
      } else if (nextState === 'active' && backgroundTimer) {
        // User came back quickly — cancel the kill
        clearTimeout(backgroundTimer);
        backgroundTimer = null;
      }
    };

    const sub = AppState.addEventListener('change', handleAppState);
    return () => {
      sub.remove();
      if (backgroundTimer) clearTimeout(backgroundTimer);
    };
  }, [isStrict]);

  // ── Animated values ──
  const plantScale = useSharedValue(1);
  const growScale = useSharedValue(0.65);
  const stageScale = useSharedValue(1);

  // Plant pulse animation
  useEffect(() => {
    plantScale.value = withRepeat(
      withSequence(
        withTiming(1.06, { duration: 2200, easing: Easing.inOut(Easing.sin) }),
        withTiming(1.0, { duration: 2200, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      false,
    );
  }, []);

  // ── Completion handler ──
  const handleComplete = useCallback(() => {
    if (hasEnded.current) return;
    hasEnded.current = true;
    if (timerRef.current) clearInterval(timerRef.current);

    updatePlantSession(sessionId, {
      status: 'grown',
      stage: 'flower',
      endedAt: new Date().toISOString(),
    });

    addFocusSession({
      id: `fs_${Date.now()}`,
      subjectId,
      duration: params.duration ?? 50,
      date: new Date().toISOString().split('T')[0],
      completed: true,
    });

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => { });
    navigation.replace('GardenResult', {
      sessionId,
      status: 'grown',
      plant: plantEmoji,
      plantName: subjectName,
      duration: params.duration ?? 50,
    });
  }, [sessionId]);

  // ── Timer countdown ──
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        const next = prev - 1;
        const pct = 1 - next / totalSeconds;

        // Update grow scale smoothly
        growScale.value = withTiming(0.65 + pct * 0.35, { duration: 900 });

        // Update stage at thresholds
        if (pct >= 0.75) {
          updatePlantSession(sessionId, { stage: 'flower' });
        } else if (pct >= 0.5) {
          updatePlantSession(sessionId, { stage: 'leaf' });
        } else if (pct >= 0.25) {
          updatePlantSession(sessionId, { stage: 'sprout' });
        }

        // Stage transition bounce
        for (const threshold of [0.25, 0.5, 0.75]) {
          const prevPct = 1 - prev / totalSeconds;
          if (prevPct < threshold && pct >= threshold) {
            stageScale.value = withSequence(
              withSpring(1.3, { stiffness: 300, damping: 8 }),
              withSpring(1.0, { stiffness: 400, damping: 12 }),
            );
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => { });
          }
        }

        if (next <= 0) {
          handleComplete();
          return 0;
        }
        return next;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [totalSeconds]);

  // ── Derived state ──
  const progress = 1 - secondsLeft / totalSeconds;
  const currentStage = STAGE_THRESHOLDS.reduce(
    (acc, s) => (progress >= s.pct ? s : acc),
    STAGE_THRESHOLDS[0],
  );
  const strokeOffset = CIRCUMFERENCE * (1 - progress);
  const minutes = Math.floor(secondsLeft / 60);
  const secs = secondsLeft % 60;
  const timeStr = `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

  const subjectObj = subjects.find((s) => s.id === subjectId);

  // ── Animated styles ──
  const plantAnimStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: plantScale.value * growScale.value * stageScale.value },
    ],
  }));

  // ── Cancel handler ──
  const handleCancel = () => {
    if (hasEnded.current) return;
    hasEnded.current = true;
    if (timerRef.current) clearInterval(timerRef.current);

    updatePlantSession(sessionId, {
      status: 'withered',
      endedAt: new Date().toISOString(),
    });

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch(() => { });
    navigation.replace('GardenResult', {
      sessionId,
      status: 'withered',
      plant: plantEmoji,
      plantName: subjectName,
      duration: params.duration ?? 50,
    });
  };

  return (
    <LinearGradient
      colors={[theme.garden.moss + '40', theme.colors.background, theme.colors.background]}
      style={styles.root}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 0.5 }}
    >
      {/* Stage badge */}
      <Animated.View
        entering={FadeInDown.duration(500)}
        style={[styles.stageBadge, { backgroundColor: theme.colors.elevated }]}
      >
        <Text style={styles.stageEmoji}>{currentStage.stage === 'seed' ? '🌱' : currentStage.stage === 'sprout' ? '🌿' : currentStage.stage === 'leaf' ? '🍃' : '🌸'}</Text>
        <Text style={[styles.stageLabel, { color: theme.colors.textSecondary }]}>
          {currentStage.label}
        </Text>
      </Animated.View>

      {/* Ring + Plant */}
      <View style={styles.center}>
        <View style={{ width: RING_SIZE, height: RING_SIZE, alignItems: 'center', justifyContent: 'center' }}>
          {/* Background track */}
          <View style={[styles.ringTrack, {
            width: RING_SIZE, height: RING_SIZE, borderRadius: RING_SIZE / 2,
            borderWidth: STROKE_W, borderColor: theme.colors.elevated,
          }]} />

          {/* Progress indicator (using a View-based approach) */}
          <View style={[StyleSheet.absoluteFill, { alignItems: 'center', justifyContent: 'center' }]}>
            <View style={{
              width: RING_SIZE - 4, height: RING_SIZE - 4, borderRadius: (RING_SIZE - 4) / 2,
              borderWidth: STROKE_W, borderColor: 'transparent',
              borderTopColor: theme.garden.moss,
              borderRightColor: progress > 0.25 ? theme.garden.moss : 'transparent',
              borderBottomColor: progress > 0.5 ? theme.garden.moss : 'transparent',
              borderLeftColor: progress > 0.75 ? theme.garden.moss : 'transparent',
              transform: [{ rotate: `${progress * 360}deg` }],
            }} />
          </View>

          {/* Plant emoji */}
          <Animated.Text style={[styles.plantEmoji, plantAnimStyle]}>
            {plantEmoji}
          </Animated.Text>
        </View>

        {/* Timer */}
        <Text style={[styles.timer, theme.typography.hero, { color: theme.colors.textPrimary }]}>
          {timeStr}
        </Text>
        <Text style={[styles.subjectLabel, { color: theme.colors.textSecondary }]}>
          {subjectObj?.name ?? subjectName}
        </Text>

        {/* Progress percentage */}
        <View style={[styles.progressChip, { backgroundColor: theme.colors.elevated }]}>
          <Text style={[styles.progressText, { color: theme.garden.moss }]}>
            {Math.round(progress * 100)}% grown
          </Text>
        </View>
      </View>

      {/* Strict mode indicator */}
      {isStrict && (
        <Animated.View
          entering={FadeInDown.delay(300).duration(400)}
          style={[styles.strictBadge, { backgroundColor: theme.accent.coral + '22' }]}
        >
          <MaterialIcons name="lock" size={14} color={theme.accent.coral} />
          <Text style={[styles.strictText, { color: theme.accent.coral }]}>
            Strict Mode — don't leave!
          </Text>
        </Animated.View>
      )}

      {/* Cancel button */}
      <TouchableOpacity
        style={[styles.cancelBtn, { borderColor: theme.accent.coral + '55' }]}
        onPress={handleCancel}
        activeOpacity={0.7}
      >
        <MaterialIcons name="close" size={18} color={theme.accent.coral} />
        <Text style={[styles.cancelText, { color: theme.accent.coral }]}>
          Give Up
        </Text>
      </TouchableOpacity>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 60,
    paddingHorizontal: 24,
  },
  stageBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 9999,
    gap: 6,
  },
  stageEmoji: { fontSize: 16 },
  stageLabel: { fontSize: 13, fontStyle: 'italic' },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringTrack: {
    position: 'absolute',
  },
  plantEmoji: {
    fontSize: 72,
    position: 'absolute',
  },
  timer: {
    fontSize: 52,
    fontWeight: '700',
    letterSpacing: 2,
    marginTop: 24,
  },
  subjectLabel: {
    fontSize: 15,
    marginTop: 6,
  },
  progressChip: {
    marginTop: 12,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 9999,
  },
  progressText: {
    fontSize: 13,
    fontWeight: '600',
  },
  strictBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 9999,
    marginBottom: 8,
  },
  strictText: {
    fontSize: 12,
    fontWeight: '600',
  },
  cancelBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderRadius: 9999,
    paddingHorizontal: 28,
    paddingVertical: 14,
  },
  cancelText: {
    fontSize: 15,
    fontWeight: '500',
  },
});
