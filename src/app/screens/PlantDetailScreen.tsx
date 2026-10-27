import React, { useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import Animated, {
  useSharedValue, useAnimatedStyle, withRepeat, withSequence,
  withTiming, withSpring, Easing, FadeInDown,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../theme';
import { useAppStore } from '../state';
import type { PlantSession } from '../../types';
import { ScreenWrapper } from '../components';

const STAGE_EMOJIS: Record<string, string> = {
  seed: '🌱',
  sprout: '🌿',
  leaf: '🍃',
  flower: '🌸',
};

export default function PlantDetailScreen({ navigation, route }: any) {
  const theme = useTheme();
  const plantParam: PlantSession | undefined = route?.params?.plant;
  const { plantSessions, subjects, updatePlantSession } = useAppStore();

  // Get the latest version from store
  const plant = plantSessions.find((p) => p.id === plantParam?.id) ?? plantParam;
  const isWithered = plant?.status === 'withered';
  const isGrown = plant?.status === 'grown';
  const plantEmoji = plant?.plantEmoji ?? '🌻';
  const subject = subjects.find((s) => s.id === plant?.subjectId);

  // ── Glow pulse ──
  const glowScale = useSharedValue(0.9);
  useEffect(() => {
    if (!isGrown) return;
    glowScale.value = withRepeat(
      withSequence(
        withTiming(1.15, { duration: 2000, easing: Easing.inOut(Easing.sin) }),
        withTiming(0.9, { duration: 2000, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      true,
    );
  }, [isGrown]);

  const glowStyle = useAnimatedStyle(() => ({
    transform: [{ scale: glowScale.value }],
    opacity: isGrown ? 0.2 : 0.08,
  }));

  // ── Plant entrance animation ──
  const plantScale = useSharedValue(0);
  useEffect(() => {
    plantScale.value = withSequence(
      withSpring(1.1, { stiffness: 250, damping: 10 }),
      withSpring(1.0, { stiffness: 400, damping: 15 }),
    );
  }, []);

  const plantAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: plantScale.value }],
  }));

  const formatDateTime = (iso?: string): string => {
    if (!iso) return 'Unknown';
    const d = new Date(iso);
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const formatDate = (iso?: string): string => {
    if (!iso) return '';
    const d = new Date(iso);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Plant',
      'Are you sure you want to remove this plant from your garden?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
            // We don't have a delete action — mark as withered or just go back
            navigation.goBack();
          },
        },
      ],
    );
  };

  if (!plant) {
    return (
      <ScreenWrapper>
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
            Plant not found
          </Text>
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
            <MaterialIcons name="arrow-back" size={24} color={theme.colors.textPrimary} />
          </TouchableOpacity>
          <Text style={[styles.titleText, { color: theme.colors.textPrimary }]}>
            {plant.plantType.charAt(0).toUpperCase() + plant.plantType.slice(1)}
          </Text>
          <TouchableOpacity onPress={handleDelete} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
            <MaterialIcons name="delete-outline" size={22} color={theme.accent.coral} />
          </TouchableOpacity>
        </View>

        <Text style={[styles.dateSubtitle, { color: theme.colors.textSecondary }]}>
          {formatDate(plant.startedAt)}
        </Text>

        {/* Plant hero */}
        <Animated.View entering={FadeInDown.duration(500)} style={styles.heroContainer}>
          <Animated.View
            style={[styles.glowCircle, {
              backgroundColor: isWithered ? theme.garden.wilted : theme.garden.moss,
            }, glowStyle]}
          />
          <Animated.Text
            style={[
              styles.heroEmoji,
              plantAnimStyle,
              isWithered && { opacity: 0.4 },
            ]}
          >
            {plantEmoji}
          </Animated.Text>
        </Animated.View>

        {/* Status badge */}
        <Animated.View entering={FadeInDown.delay(100).duration(400)} style={styles.statusRow}>
          <View style={[styles.statusBadge, {
            backgroundColor: isWithered
              ? theme.garden.wilted + '22'
              : isGrown
                ? theme.garden.moss + '22'
                : theme.accent.amber + '22',
            borderColor: isWithered
              ? theme.garden.wilted + '44'
              : isGrown
                ? theme.garden.moss + '44'
                : theme.accent.amber + '44',
          }]}>
            <Text style={[styles.statusText, {
              color: isWithered
                ? theme.garden.wilted
                : isGrown
                  ? theme.garden.moss
                  : theme.accent.amber,
            }]}>
              {isWithered ? '🥀 Wilted' : isGrown ? '🌿 Healthy' : '🌱 Growing'}
            </Text>
          </View>
        </Animated.View>

        {/* Session info card */}
        <Animated.View
          entering={FadeInDown.delay(200).duration(400)}
          style={[styles.infoCard, { backgroundColor: theme.colors.elevated }]}
        >
          {/* Subject */}
          <View style={styles.infoRow}>
            <MaterialIcons name="book" size={18} color={theme.colors.textSecondary} />
            <Text style={[styles.infoLabel, { color: theme.colors.textSecondary }]}>Subject</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              {subject && (
                <View style={[styles.subjectDot, { backgroundColor: subject.color }]} />
              )}
              <Text style={[styles.infoValue, { color: theme.colors.textPrimary }]}>
                {subject?.name ?? 'General'}
              </Text>
            </View>
          </View>

          <View style={[styles.divider, { backgroundColor: theme.colors.divider }]} />

          {/* Duration */}
          <View style={styles.infoRow}>
            <MaterialIcons name="schedule" size={18} color={theme.colors.textSecondary} />
            <Text style={[styles.infoLabel, { color: theme.colors.textSecondary }]}>Duration</Text>
            <Text style={[styles.infoValue, { color: theme.accent.violet, fontWeight: '700' }]}>
              {plant.duration} min
            </Text>
          </View>

          <View style={[styles.divider, { backgroundColor: theme.colors.divider }]} />

          {/* Date & Time */}
          <View style={styles.infoRow}>
            <MaterialIcons name="event" size={18} color={theme.colors.textSecondary} />
            <Text style={[styles.infoLabel, { color: theme.colors.textSecondary }]}>Date</Text>
            <Text style={[styles.infoValue, { color: theme.colors.textPrimary }]}>
              {formatDateTime(plant.startedAt)}
            </Text>
          </View>

          <View style={[styles.divider, { backgroundColor: theme.colors.divider }]} />

          {/* Final Stage */}
          <View style={styles.infoRow}>
            <Text style={{ fontSize: 16 }}>{STAGE_EMOJIS[plant.stage] ?? '🌱'}</Text>
            <Text style={[styles.infoLabel, { color: theme.colors.textSecondary }]}>Stage</Text>
            <Text style={[styles.infoValue, { color: theme.colors.textPrimary }]}>
              {plant.stage.charAt(0).toUpperCase() + plant.stage.slice(1)}
            </Text>
          </View>

          {/* Strict mode badge */}
          {plant.strictMode && (
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

        {/* Growth milestones */}
        <Animated.View
          entering={FadeInDown.delay(300).duration(400)}
          style={[styles.milestonesCard, { backgroundColor: theme.colors.elevated }]}
        >
          <Text style={[styles.milestonesTitle, { color: theme.colors.textSecondary }]}>
            Growth Milestones
          </Text>
          <View style={styles.milestonesRow}>
            {(['seed', 'sprout', 'leaf', 'flower'] as const).map((stage, i) => {
              const stageOrder = ['seed', 'sprout', 'leaf', 'flower'];
              const currentIdx = stageOrder.indexOf(plant.stage);
              const reached = i <= currentIdx && !isWithered;

              return (
                <React.Fragment key={stage}>
                  <View style={styles.milestone}>
                    <Text style={[styles.milestoneEmoji, !reached && { opacity: 0.3 }]}>
                      {STAGE_EMOJIS[stage]}
                    </Text>
                    <Text style={[styles.milestoneLabel, { color: theme.colors.textSecondary }]}>
                      {stage.charAt(0).toUpperCase() + stage.slice(1)}
                    </Text>
                  </View>
                  {i < 3 && (
                    <View style={[styles.milestoneLine, {
                      backgroundColor: reached && i < currentIdx
                        ? theme.garden.moss
                        : theme.colors.divider,
                    }]} />
                  )}
                </React.Fragment>
              );
            })}
          </View>
        </Animated.View>

        {/* Delete button */}
        <Animated.View entering={FadeInDown.delay(400).duration(400)}>
          <TouchableOpacity
            style={[styles.deleteBtn, { borderColor: theme.accent.coral + '44' }]}
            onPress={handleDelete}
            activeOpacity={0.7}
          >
            <MaterialIcons name="delete-outline" size={18} color={theme.accent.coral} />
            <Text style={[styles.deleteBtnText, { color: theme.accent.coral }]}>
              Delete Plant
            </Text>
          </TouchableOpacity>
        </Animated.View>

        <View style={{ height: 120 }} />
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: { paddingHorizontal: 20, paddingTop: 8 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  titleText: { fontSize: 20, fontWeight: '600' },
  dateSubtitle: { fontSize: 13, textAlign: 'center', marginBottom: 8 },
  heroContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 200,
    position: 'relative',
    marginBottom: 16,
  },
  glowCircle: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
  },
  heroEmoji: { fontSize: 100 },
  statusRow: { alignItems: 'center', marginBottom: 20 },
  statusBadge: {
    borderRadius: 9999,
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderWidth: 1,
  },
  statusText: { fontSize: 14, fontWeight: '600' },
  infoCard: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  infoLabel: { fontSize: 14, flex: 1 },
  infoValue: { fontSize: 15, fontWeight: '500' },
  subjectDot: { width: 10, height: 10, borderRadius: 5 },
  divider: { height: 1, marginHorizontal: 16 },
  strictChip: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 9999,
  },
  strictChipText: { fontSize: 12, fontWeight: '600' },
  milestonesCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
  },
  milestonesTitle: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 16,
  },
  milestonesRow: { flexDirection: 'row', alignItems: 'center' },
  milestone: { alignItems: 'center', flex: 1 },
  milestoneEmoji: { fontSize: 22, marginBottom: 4 },
  milestoneLabel: { fontSize: 10, fontWeight: '500' },
  milestoneLine: { height: 2, flex: 1, borderRadius: 1 },
  deleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderRadius: 9999,
    paddingVertical: 14,
  },
  deleteBtnText: { fontSize: 15, fontWeight: '500' },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: { fontSize: 16 },
});
