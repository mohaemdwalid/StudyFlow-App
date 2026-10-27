import React, { useEffect, useMemo } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import Animated, {
  useSharedValue, useAnimatedStyle, withSpring, withDelay,
  withSequence, withTiming, withRepeat, Easing, FadeInDown,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../theme';
import { useAppStore } from '../state';
import { ScreenWrapper } from '../components';

const { width: SCREEN_W } = Dimensions.get('window');
const CONFETTI_COUNT = 12;

interface RouteParams {
  sessionId: string;
  status: 'grown' | 'withered';
  plant: string;
  plantName: string;
  duration: number;
}

export default function GardenResultScreen({ navigation, route }: any) {
  const theme = useTheme();
  const params = (route?.params ?? {}) as RouteParams;
  const status = params.status ?? 'grown';
  const plantEmoji = params.plant ?? '🌻';
  const plantName = params.plantName ?? 'Focus';
  const duration = params.duration ?? 50;
  const isGrown = status === 'grown';

  const { subjects, plantSessions } = useAppStore();
  const session = plantSessions.find((s) => s.id === params.sessionId);
  const subject = subjects.find((s) => s.id === session?.subjectId);

  // ── Plant bounce animation ──
  const plantScale = useSharedValue(0);
  useEffect(() => {
    plantScale.value = withSequence(
      withSpring(1.25, { stiffness: 280, damping: 10 }),
      withSpring(1.0, { stiffness: 400, damping: 15 }),
    );
    if (isGrown) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
    }
  }, []);

  const plantAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: plantScale.value }],
  }));

  // ── Confetti dots (for grown state) ──
  const confettiDots = useMemo(() => {
    return Array.from({ length: CONFETTI_COUNT }).map((_, i) => {
      const angle = (i / CONFETTI_COUNT) * 2 * Math.PI;
      const radius = 80 + Math.random() * 40;
      return {
        x: Math.cos(angle) * radius,
        y: Math.sin(angle) * radius,
        color: [
          theme.garden.moss, theme.garden.sprout, theme.garden.petal,
          theme.accent.amber, theme.accent.mint, theme.accent.violet,
        ][i % 6],
        size: 6 + Math.random() * 6,
        delay: i * 80,
      };
    });
  }, []);

  const confettiAnims = confettiDots.map((_, i) => {
    const opacity = useSharedValue(0);
    const scale = useSharedValue(0);

    useEffect(() => {
      if (!isGrown) return;
      opacity.value = withDelay(
        confettiDots[i].delay,
        withSequence(
          withTiming(1, { duration: 300 }),
          withDelay(1500, withTiming(0, { duration: 600 })),
        ),
      );
      scale.value = withDelay(
        confettiDots[i].delay,
        withSpring(1, { stiffness: 200, damping: 8 }),
      );
    }, []);

    return useAnimatedStyle(() => ({
      opacity: opacity.value,
      transform: [{ scale: scale.value }],
    }));
  });

  // ── Glow pulse for grown ──
  const glowScale = useSharedValue(0.8);
  useEffect(() => {
    if (!isGrown) return;
    glowScale.value = withRepeat(
      withSequence(
        withTiming(1.1, { duration: 1500, easing: Easing.inOut(Easing.sin) }),
        withTiming(0.9, { duration: 1500, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      true,
    );
  }, []);

  const glowStyle = useAnimatedStyle(() => ({
    transform: [{ scale: glowScale.value }],
    opacity: 0.2,
  }));

  return (
    <ScreenWrapper>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* Title */}
        <Animated.View entering={FadeInDown.duration(500)} style={styles.titleContainer}>
          <Text style={[styles.title, {
            color: isGrown ? theme.garden.moss : theme.colors.textSecondary,
          }]}>
            {isGrown ? 'Planted! 🎉' : 'Withered... 🥀'}
          </Text>
          <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
            {isGrown
              ? 'Your plant grew to full bloom!'
              : 'Your plant didn\'t make it this time.'}
          </Text>
        </Animated.View>

        {/* Plant hero area */}
        <View style={styles.heroContainer}>
          {/* Glow circle */}
          {isGrown && (
            <Animated.View style={[styles.glowCircle, {
              backgroundColor: theme.garden.moss,
            }, glowStyle]} />
          )}

          {/* Confetti dots */}
          {isGrown && confettiDots.map((dot, i) => (
            <Animated.View
              key={i}
              style={[
                styles.confettiDot,
                {
                  width: dot.size,
                  height: dot.size,
                  borderRadius: dot.size / 2,
                  backgroundColor: dot.color,
                  left: SCREEN_W / 2 - 24 + dot.x,
                  top: 100 + dot.y,
                },
                confettiAnims[i],
              ]}
            />
          ))}

          {/* Plant emoji */}
          <Animated.Text
            style={[
              styles.heroEmoji,
              plantAnimStyle,
              !isGrown && { opacity: 0.5 },
            ]}
          >
            {isGrown ? plantEmoji : '🥀'}
          </Animated.Text>
        </View>

        {/* Info card */}
        <Animated.View
          entering={FadeInDown.delay(200).duration(500)}
          style={[styles.infoCard, { backgroundColor: theme.colors.card }]}
        >
          <View style={styles.infoRow}>
            <MaterialIcons name="schedule" size={18} color={theme.colors.textSecondary} />
            <Text style={[styles.infoLabel, { color: theme.colors.textSecondary }]}>Duration</Text>
            <Text style={[styles.infoValue, { color: theme.accent.violet }]}>
              {duration} min
            </Text>
          </View>

          <View style={[styles.divider, { backgroundColor: theme.colors.divider }]} />

          <View style={styles.infoRow}>
            <MaterialIcons name="book" size={18} color={theme.colors.textSecondary} />
            <Text style={[styles.infoLabel, { color: theme.colors.textSecondary }]}>Subject</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              {subject && (
                <View style={[styles.subjectDot, { backgroundColor: subject.color }]} />
              )}
              <Text style={[styles.infoValue, { color: theme.colors.textPrimary }]}>
                {subject?.name ?? plantName}
              </Text>
            </View>
          </View>

          <View style={[styles.divider, { backgroundColor: theme.colors.divider }]} />

          <View style={styles.infoRow}>
            <MaterialIcons
              name={isGrown ? 'eco' : 'warning'}
              size={18}
              color={isGrown ? theme.garden.moss : theme.accent.coral}
            />
            <Text style={[styles.infoLabel, { color: theme.colors.textSecondary }]}>Status</Text>
            <View style={[styles.statusPill, {
              backgroundColor: isGrown ? theme.garden.moss + '22' : theme.accent.coral + '22',
            }]}>
              <Text style={[styles.statusText, {
                color: isGrown ? theme.garden.moss : theme.accent.coral,
              }]}>
                {isGrown ? '🌿 Healthy' : '🥀 Wilted'}
              </Text>
            </View>
          </View>

          {session?.strictMode && (
            <>
              <View style={[styles.divider, { backgroundColor: theme.colors.divider }]} />
              <View style={styles.infoRow}>
                <MaterialIcons name="lock" size={18} color={theme.accent.coral} />
                <Text style={[styles.infoLabel, { color: theme.colors.textSecondary }]}>Mode</Text>
                <View style={[styles.strictChip, { backgroundColor: theme.accent.coral + '22' }]}>
                  <Text style={[styles.strictChipText, { color: theme.accent.coral }]}>
                    Strict Mode
                  </Text>
                </View>
              </View>
            </>
          )}
        </Animated.View>

        {/* Saved badge */}
        {isGrown && (
          <Animated.View
            entering={FadeInDown.delay(400).duration(400)}
            style={[styles.savedBadge, { backgroundColor: theme.garden.moss + '18' }]}
          >
            <Text style={[styles.savedText, { color: theme.garden.moss }]}>
              🌿 Saved to your Garden
            </Text>
          </Animated.View>
        )}

        {/* Actions */}
        <Animated.View entering={FadeInDown.delay(500).duration(400)} style={styles.actions}>
          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
              navigation.navigate('GardenPlanting');
            }}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={[theme.garden.moss, theme.accent.violet]}
              style={styles.primaryGrad}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.primaryText}>
                {isGrown ? 'Plant Again 🌱' : 'Try Again 🌱'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.ghostBtn, { borderColor: theme.colors.divider }]}
            onPress={() => navigation.navigate('FocusTab')}
            activeOpacity={0.7}
          >
            <Text style={[styles.ghostText, { color: theme.colors.textPrimary }]}>
              Back to Focus
            </Text>
          </TouchableOpacity>

          {isGrown && (
            <TouchableOpacity
              style={[styles.gardenLink]}
              onPress={() => navigation.navigate('GardenCollection')}
              activeOpacity={0.7}
            >
              <Text style={[styles.gardenLinkText, { color: theme.accent.violet }]}>
                View My Garden →
              </Text>
            </TouchableOpacity>
          )}
        </Animated.View>

        <View style={{ height: 48 }} />
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: { paddingHorizontal: 24, paddingTop: 24, alignItems: 'center' },
  titleContainer: { alignItems: 'center', marginBottom: 8 },
  title: { fontSize: 28, fontWeight: '700', marginBottom: 6 },
  subtitle: { fontSize: 15, textAlign: 'center' },
  heroContainer: {
    width: '100%',
    height: 220,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    position: 'relative',
  },
  glowCircle: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
  },
  confettiDot: {
    position: 'absolute',
  },
  heroEmoji: { fontSize: 100 },
  infoCard: {
    width: '100%',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 10,
  },
  infoLabel: { fontSize: 14, flex: 1 },
  infoValue: { fontSize: 16, fontWeight: '600' },
  divider: { height: 1, marginHorizontal: 16 },
  subjectDot: { width: 10, height: 10, borderRadius: 5 },
  statusPill: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 9999,
  },
  statusText: { fontSize: 13, fontWeight: '600' },
  strictChip: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 9999,
  },
  strictChipText: { fontSize: 12, fontWeight: '600' },
  savedBadge: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    marginBottom: 24,
  },
  savedText: { fontSize: 14, fontWeight: '500' },
  actions: { width: '100%' },
  primaryBtn: { borderRadius: 9999, overflow: 'hidden', marginBottom: 12 },
  primaryGrad: { paddingVertical: 16, alignItems: 'center' },
  primaryText: { fontSize: 16, fontWeight: '600', color: '#FFF' },
  ghostBtn: {
    borderWidth: 1,
    borderRadius: 9999,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 16,
  },
  ghostText: { fontSize: 15, fontWeight: '500' },
  gardenLink: { alignItems: 'center', paddingVertical: 8 },
  gardenLinkText: { fontSize: 15, fontWeight: '600' },
});
