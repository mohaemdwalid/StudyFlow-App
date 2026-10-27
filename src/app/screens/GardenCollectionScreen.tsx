import React, { useState, useMemo } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, FlatList, Dimensions,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../theme';
import { useAppStore } from '../state';
import type { PlantSession } from '../../types';
import { ScreenWrapper } from '../components';

const { width: SCREEN_W } = Dimensions.get('window');
const CARD_GAP = 8;
const CARD_PAD = 20;
const NUM_COLS = 3;
const CARD_SIZE = (SCREEN_W - CARD_PAD * 2 - CARD_GAP * (NUM_COLS - 1)) / NUM_COLS;

type FilterType = 'All' | 'Grown' | 'Withered';
const FILTERS: FilterType[] = ['All', 'Grown', 'Withered'];

export default function GardenCollectionScreen({ navigation }: any) {
  const theme = useTheme();
  const { plantSessions, subjects, focusSessions } = useAppStore();
  const [filter, setFilter] = useState<FilterType>('All');

  // ── Filtered plants ──
  const filtered = useMemo(() => {
    return plantSessions.filter((p) => {
      if (filter === 'All') return true;
      if (filter === 'Grown') return p.status === 'grown';
      if (filter === 'Withered') return p.status === 'withered';
      return true;
    });
  }, [plantSessions, filter]);

  // ── Stats ──
  const totalPlants = plantSessions.length;
  const grownCount = plantSessions.filter((p) => p.status === 'grown').length;
  const totalFocusMinutes = plantSessions
    .filter((p) => p.status === 'grown')
    .reduce((sum, p) => sum + p.duration, 0);

  // Compute streak: consecutive days with at least one grown plant
  const currentStreak = useMemo(() => {
    const dates = new Set(
      plantSessions
        .filter((p) => p.status === 'grown')
        .map((p) => p.startedAt.split('T')[0]),
    );

    let streak = 0;
    const today = new Date();
    for (let i = 0; i < 365; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      if (dates.has(dateStr)) {
        streak++;
      } else {
        break;
      }
    }
    return streak;
  }, [plantSessions]);

  const getSubject = (subjectId?: string) => subjects.find((s) => s.id === subjectId);

  const formatDate = (iso: string): string => {
    const d = new Date(iso);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const renderPlantCard = ({ item, index }: { item: PlantSession; index: number }) => {
    const subj = getSubject(item.subjectId);
    const isWithered = item.status === 'withered';

    return (
      <Animated.View entering={FadeInDown.delay(index * 60).duration(400)}>
        <TouchableOpacity
          style={[styles.plantCard, {
            width: CARD_SIZE,
            height: CARD_SIZE,
            backgroundColor: isWithered
              ? theme.colors.background
              : theme.colors.elevated,
          }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
            navigation.navigate('PlantDetail', { plant: item });
          }}
          activeOpacity={0.7}
        >
          {/* Wilted badge */}
          {isWithered && (
            <View style={[styles.wiltedBadge, { backgroundColor: theme.colors.card }]}>
              <Text style={styles.wiltedBadgeEmoji}>🥀</Text>
            </View>
          )}

          {/* Plant emoji */}
          <Text style={[styles.plantEmoji, isWithered && { opacity: 0.35 }]}>
            {item.plantEmoji}
          </Text>

          {/* Bottom info */}
          <View style={styles.plantBottom}>
            <View style={styles.plantBottomLeft}>
              {subj && (
                <View style={[styles.subjectDot, { backgroundColor: subj.color }]} />
              )}
              <Text style={[styles.plantDuration, { color: theme.colors.textSecondary }]}>
                {item.duration}m
              </Text>
            </View>
            <Text style={[styles.plantDate, { color: theme.colors.textSecondary }]}>
              {formatDate(item.startedAt)}
            </Text>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <ScreenWrapper>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back" size={24} color={theme.colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.colors.textPrimary }]}>My Garden 🌿</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Stats row */}
      <Animated.View entering={FadeInDown.duration(400)} style={styles.statsRow}>
        <View style={[styles.statCard, { backgroundColor: theme.colors.card }]}>
          <Text style={[styles.statValue, { color: theme.garden.moss }]}>{grownCount}</Text>
          <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Plants</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: theme.colors.card }]}>
          <Text style={[styles.statValue, { color: theme.accent.violet }]}>{totalFocusMinutes}</Text>
          <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Minutes</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: theme.colors.card }]}>
          <Text style={[styles.statValue, { color: theme.accent.amber }]}>{currentStreak}</Text>
          <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Streak 🔥</Text>
        </View>
      </Animated.View>

      {/* Filter chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterScroll}
        contentContainerStyle={{ paddingHorizontal: CARD_PAD }}
      >
        {FILTERS.map((f) => (
          <TouchableOpacity
            key={f}
            style={[
              styles.filterChip,
              { backgroundColor: theme.colors.elevated },
              filter === f && { backgroundColor: theme.accent.violet },
            ]}
            onPress={() => {
              setFilter(f);
              Haptics.selectionAsync().catch(() => {});
            }}
          >
            <Text style={[
              styles.filterText,
              { color: theme.colors.textSecondary },
              filter === f && { color: '#FFF' },
            ]}>
              {f}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Plant grid */}
      {filtered.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyEmoji}>🌱</Text>
          <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
            No plants here yet. Start a focus session to grow your garden!
          </Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          renderItem={renderPlantCard}
          keyExtractor={(item) => item.id}
          numColumns={NUM_COLS}
          contentContainerStyle={styles.gridContent}
          columnWrapperStyle={styles.gridRow}
          showsVerticalScrollIndicator={false}
        />
      )}
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: CARD_PAD,
    paddingTop: 8,
    paddingBottom: 12,
  },
  title: { fontSize: 22, fontWeight: '700' },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: CARD_PAD,
    gap: 8,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  statValue: { fontSize: 22, fontWeight: '700', marginBottom: 2 },
  statLabel: { fontSize: 11, fontWeight: '500' },
  filterScroll: { marginBottom: 12, maxHeight: 44 },
  filterChip: {
    borderRadius: 9999,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
  },
  filterText: { fontSize: 13, fontWeight: '500' },
  gridContent: { paddingHorizontal: CARD_PAD, paddingBottom: 120 },
  gridRow: { gap: CARD_GAP, marginBottom: CARD_GAP },
  plantCard: {
    borderRadius: 12,
    padding: 8,
    justifyContent: 'space-between',
    position: 'relative',
    overflow: 'hidden',
  },
  wiltedBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    borderRadius: 9999,
    padding: 2,
    zIndex: 1,
  },
  wiltedBadgeEmoji: { fontSize: 10 },
  plantEmoji: { fontSize: 32, textAlign: 'center', marginTop: 4 },
  plantBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  plantBottomLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  subjectDot: { width: 6, height: 6, borderRadius: 3 },
  plantDuration: { fontSize: 10, fontWeight: '500' },
  plantDate: { fontSize: 9 },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 48,
  },
  emptyEmoji: { fontSize: 48, marginBottom: 12 },
  emptyText: { fontSize: 15, textAlign: 'center', lineHeight: 22 },
});
