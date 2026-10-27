/**
 * Drag-and-Drop Study Planner
 * Reorderable time blocks with gesture-based drag-and-drop.
 */
import React, { useCallback, useMemo } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { GestureDetector, Gesture, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue, useAnimatedStyle, withSpring, withTiming, runOnJS,
  FadeInDown,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../app/theme';
import { useAppStore } from '../../app/state';
import { PlanBlock } from '../../types';

const BLOCK_HEIGHT = 80;
const BLOCK_GAP = 10;

function formatTimeRange(startTime: string, duration: number): string {
  const [h, m] = startTime.split(':').map(Number);
  const startDate = new Date(2000, 0, 1, h, m);
  const endDate = new Date(startDate.getTime() + duration * 60000);
  const fmt = (d: Date) => {
    const hh = d.getHours();
    const mm = d.getMinutes();
    const ampm = hh >= 12 ? 'PM' : 'AM';
    const h12 = hh % 12 || 12;
    return `${h12}:${mm.toString().padStart(2, '0')} ${ampm}`;
  };
  return `${fmt(startDate)} – ${fmt(endDate)}`;
}

function DraggableBlock({
  block,
  index,
  totalCount,
  subjectColor,
  subjectName,
  theme,
  onReorder,
}: {
  block: PlanBlock;
  index: number;
  totalCount: number;
  subjectColor: string;
  subjectName: string;
  theme: any;
  onReorder: (from: number, to: number) => void;
}) {
  const translateY = useSharedValue(0);
  const scale = useSharedValue(1);
  const zIndex = useSharedValue(0);
  const opacity = useSharedValue(1);
  const isActive = useSharedValue(false);

  const triggerHaptic = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
  }, []);

  const handleReorder = useCallback((from: number, direction: number) => {
    const to = from + direction;
    if (to >= 0 && to < totalCount) {
      onReorder(from, to);
    }
  }, [totalCount, onReorder]);

  const longPress = Gesture.LongPress()
    .minDuration(300)
    .onStart(() => {
      isActive.value = true;
      scale.value = withSpring(1.05);
      zIndex.value = 100;
      opacity.value = 0.92;
      runOnJS(triggerHaptic)();
    });

  const pan = Gesture.Pan()
    .manualActivation(false)
    .onUpdate((e) => {
      if (isActive.value) {
        translateY.value = e.translationY;
      }
    })
    .onEnd(() => {
      if (isActive.value) {
        const movedSlots = Math.round(translateY.value / (BLOCK_HEIGHT + BLOCK_GAP));
        if (movedSlots !== 0) {
          runOnJS(handleReorder)(index, movedSlots);
        }
      }
      translateY.value = withSpring(0);
      scale.value = withSpring(1);
      zIndex.value = 0;
      opacity.value = withTiming(1);
      isActive.value = false;
    })
    .onFinalize(() => {
      translateY.value = withSpring(0);
      scale.value = withSpring(1);
      zIndex.value = 0;
      opacity.value = withTiming(1);
      isActive.value = false;
    });

  const composed = Gesture.Simultaneous(longPress, pan);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateY.value },
      { scale: scale.value },
    ],
    zIndex: zIndex.value,
    opacity: opacity.value,
    shadowOpacity: isActive.value ? 0.3 : 0,
    shadowRadius: isActive.value ? 12 : 0,
    shadowOffset: { width: 0, height: isActive.value ? 8 : 0 },
    shadowColor: '#000',
    elevation: isActive.value ? 12 : 0,
  }));

  const durationLabel = block.duration >= 60
    ? `${Math.floor(block.duration / 60)}h${block.duration % 60 > 0 ? ` ${block.duration % 60}m` : ''}`
    : `${block.duration}m`;

  return (
    <GestureDetector gesture={composed}>
      <Animated.View
        entering={FadeInDown.delay(index * 60).duration(350)}
        style={[animatedStyle]}
      >
        <View style={[styles.blockCard, { backgroundColor: theme.colors.card }]}>
          {/* Color pip */}
          <View style={[styles.blockPip, { backgroundColor: subjectColor }]} />

          {/* Content */}
          <View style={{ flex: 1, marginLeft: 14 }}>
            <Text style={[styles.blockLabel, { color: theme.colors.textPrimary }]} numberOfLines={1}>
              {block.label}
            </Text>
            <Text style={[styles.blockSubject, { color: subjectColor }]}>
              {subjectName}
            </Text>
            <Text style={[styles.blockTime, { color: theme.colors.textSecondary }]}>
              {formatTimeRange(block.startTime, block.duration)}
            </Text>
          </View>

          {/* Duration badge */}
          <View style={[styles.durationBadge, { backgroundColor: subjectColor + '20' }]}>
            <Text style={[styles.durationText, { color: subjectColor }]}>{durationLabel}</Text>
          </View>

          {/* Drag handle */}
          <MaterialIcons name="drag-indicator" size={22} color={theme.colors.textSecondary} style={{ marginLeft: 8 }} />
        </View>
      </Animated.View>
    </GestureDetector>
  );
}

export default function DragDropPlannerScreen({ navigation }: { navigation: any }) {
  const theme = useTheme();
  const { planBlocks, subjects, reorderPlanBlocks } = useAppStore();

  const sortedBlocks = useMemo(
    () => [...planBlocks].sort((a, b) => a.startTime.localeCompare(b.startTime)),
    [planBlocks],
  );

  const handleReorder = useCallback((from: number, to: number) => {
    const newBlocks = [...sortedBlocks];
    const [moved] = newBlocks.splice(from, 1);
    newBlocks.splice(to, 0, moved);
    reorderPlanBlocks(newBlocks);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
  }, [sortedBlocks, reorderPlanBlocks]);

  const handleAddBlock = () => {
    Alert.alert('Add Block', 'Navigate to block creation flow.', [{ text: 'OK' }]);
  };

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  const subjectMap = useMemo(() => {
    const map: Record<string, { name: string; color: string }> = {};
    subjects.forEach((s) => { map[s.id] = { name: s.name, color: s.color }; });
    return map;
  }, [subjects]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={[styles.safe, { backgroundColor: theme.colors.background }]} edges={['top']}>
        {/* Header */}
        <Animated.View entering={FadeInDown.duration(300)} style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
            <MaterialIcons name="arrow-back" size={24} color={theme.colors.textPrimary} />
          </TouchableOpacity>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={[theme.typography.h1, { color: theme.colors.textPrimary }]}>
              Study Planner
            </Text>
            <Text style={[styles.dateSubtitle, { color: theme.colors.textSecondary }]}>
              {today}
            </Text>
          </View>
          <MaterialIcons name="calendar-today" size={24} color={theme.accent.indigo} />
        </Animated.View>

        {/* Block list */}
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {sortedBlocks.length > 0 ? (
            sortedBlocks.map((block, i) => {
              const subj = subjectMap[block.subjectId] ?? { name: 'General', color: theme.accent.violet };
              return (
                <DraggableBlock
                  key={block.id}
                  block={block}
                  index={i}
                  totalCount={sortedBlocks.length}
                  subjectColor={subj.color}
                  subjectName={subj.name}
                  theme={theme}
                  onReorder={handleReorder}
                />
              );
            })
          ) : (
            <Animated.View entering={FadeInDown.duration(400)} style={[styles.emptyState, { backgroundColor: theme.colors.card }]}>
              <MaterialIcons name="event-note" size={48} color={theme.colors.textSecondary} />
              <Text style={[theme.typography.h3, { color: theme.colors.textPrimary, marginTop: 12 }]}>
                No study blocks yet
              </Text>
              <Text style={[theme.typography.body, { color: theme.colors.textSecondary, marginTop: 4, textAlign: 'center' }]}>
                Tap the + button to plan your study sessions
              </Text>
            </Animated.View>
          )}

          {/* Summary */}
          {sortedBlocks.length > 0 && (
            <Animated.View entering={FadeInDown.delay(sortedBlocks.length * 60 + 100).duration(300)} style={[styles.summaryCard, { backgroundColor: theme.colors.card }]}>
              <MaterialIcons name="schedule" size={18} color={theme.accent.sky} />
              <Text style={[styles.summaryText, { color: theme.colors.textSecondary }]}>
                {sortedBlocks.length} block{sortedBlocks.length !== 1 ? 's' : ''} · {Math.round(sortedBlocks.reduce((a, b) => a + b.duration, 0) / 60 * 10) / 10}h total
              </Text>
            </Animated.View>
          )}

          <View style={{ height: 120 }} />
        </ScrollView>

        {/* FAB */}
        <TouchableOpacity
          onPress={handleAddBlock}
          activeOpacity={0.8}
          style={[styles.fab, { backgroundColor: theme.accent.violet }]}
        >
          <MaterialIcons name="add" size={28} color="#FFF" />
        </TouchableOpacity>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: 8, paddingBottom: 12 },
  dateSubtitle: { fontSize: 13, fontWeight: '500', marginTop: 2 },
  content: { paddingHorizontal: 20, paddingTop: 8 },
  // Block card
  blockCard: {
    flexDirection: 'row', alignItems: 'center',
    borderRadius: 16, padding: 16, marginBottom: BLOCK_GAP,
    minHeight: BLOCK_HEIGHT,
  },
  blockPip: { width: 5, height: 44, borderRadius: 3 },
  blockLabel: { fontSize: 15, fontWeight: '700' },
  blockSubject: { fontSize: 12, fontWeight: '600', marginTop: 2 },
  blockTime: { fontSize: 11, fontWeight: '500', marginTop: 2 },
  durationBadge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
  durationText: { fontSize: 12, fontWeight: '700' },
  // Empty
  emptyState: { borderRadius: 20, padding: 48, alignItems: 'center', marginTop: 40 },
  // Summary
  summaryCard: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    borderRadius: 12, padding: 14, marginTop: 8,
  },
  summaryText: { fontSize: 13, fontWeight: '500' },
  // FAB
  fab: {
    position: 'absolute', bottom: 36, right: 24,
    width: 56, height: 56, borderRadius: 28,
    justifyContent: 'center', alignItems: 'center',
    shadowColor: '#6C63FF', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35, shadowRadius: 12, elevation: 8,
  },
});
