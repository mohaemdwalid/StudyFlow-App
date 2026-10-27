/**
 * Study Streak Components
 * StreakBadge + HeatmapCalendar for StudyFlow
 */
import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../app/theme';
import { useAppStore } from '../../app/state';
import { StudyDay } from '../../types';

// ─── Streak Badge ─────────────────────────────────────────────────────────────
interface StreakBadgeProps {
  size?: 'small' | 'large';
  style?: any;
}

export function StreakBadge({ size = 'small', style }: StreakBadgeProps) {
  const theme = useTheme();
  const { studyDays } = useAppStore();

  const streak = useMemo(() => {
    let count = 0;
    // Sort descending by date
    const sorted = [...studyDays].sort((a, b) => b.date.localeCompare(a.date));
    for (const day of sorted) {
      if (day.minutesStudied > 0) count++;
      else break;
    }
    return count;
  }, [studyDays]);

  const milestone = streak >= 30 ? '30-day' : streak >= 14 ? '14-day' : streak >= 7 ? '7-day' : streak >= 3 ? '3-day' : null;

  if (size === 'large') {
    return (
      <Animated.View entering={FadeInDown.duration(400)} style={[styles.streakLarge, { backgroundColor: theme.colors.card }, style]}>
        <View style={[styles.fireGlow, { backgroundColor: theme.accent.coral + '22' }]}>
          <Text style={styles.fireEmoji}>🔥</Text>
        </View>
        <View style={{ flex: 1, marginLeft: 14 }}>
          <Text style={[theme.typography.hero, { color: theme.colors.textPrimary, fontSize: 36, lineHeight: 40 }]}>
            {streak}
          </Text>
          <Text style={[theme.typography.body, { color: theme.colors.textSecondary }]}>
            day study streak
          </Text>
          {milestone && (
            <View style={[styles.milestoneBadge, { backgroundColor: theme.accent.amber + '22' }]}>
              <MaterialIcons name="emoji-events" size={14} color={theme.accent.amber} />
              <Text style={[styles.milestoneText, { color: theme.accent.amber }]}>
                {milestone} milestone!
              </Text>
            </View>
          )}
        </View>
      </Animated.View>
    );
  }

  return (
    <Animated.View entering={FadeIn} style={[styles.streakSmall, { backgroundColor: theme.accent.coral + '18' }, style]}>
      <Text style={{ fontSize: 14 }}>🔥</Text>
      <Text style={[styles.streakSmallText, { color: theme.accent.coral }]}>{streak}</Text>
    </Animated.View>
  );
}

// ─── Heatmap Calendar ─────────────────────────────────────────────────────────
interface HeatmapCalendarProps {
  days?: number;
  style?: any;
}

export function HeatmapCalendar({ days = 30, style }: HeatmapCalendarProps) {
  const theme = useTheme();
  const { studyDays } = useAppStore();

  const displayDays = useMemo(() => {
    const map = new Map(studyDays.map((d) => [d.date, d]));
    const result: (StudyDay & { dateObj: Date })[] = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(2026, 2, 5);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const existing = map.get(dateStr);
      result.push({
        date: dateStr,
        minutesStudied: existing?.minutesStudied ?? 0,
        tasksCompleted: existing?.tasksCompleted ?? 0,
        focusSessions: existing?.focusSessions ?? 0,
        dateObj: d,
      });
    }
    return result;
  }, [studyDays, days]);

  const getColor = (mins: number) => {
    if (mins === 0) return theme.colors.elevated;
    if (mins < 30) return theme.accent.violet + '33';
    if (mins < 60) return theme.accent.violet + '66';
    if (mins < 120) return theme.accent.violet + 'AA';
    return theme.accent.violet;
  };

  const totalMins = displayDays.reduce((acc, d) => acc + d.minutesStudied, 0);
  const activeDays = displayDays.filter((d) => d.minutesStudied > 0).length;

  const CELL_SIZE = 14;
  const GAP = 3;
  const WEEKS = Math.ceil(days / 7);

  // Arrange into weeks (columns)
  const weeks: typeof displayDays[] = [];
  for (let w = 0; w < WEEKS; w++) {
    weeks.push(displayDays.slice(w * 7, w * 7 + 7));
  }

  const DAY_LABELS = ['M', '', 'W', '', 'F', '', 'S'];

  return (
    <Animated.View entering={FadeInDown.delay(100).duration(400)} style={[styles.heatmapWrap, { backgroundColor: theme.colors.card }, style]}>
      <View style={styles.heatmapHeader}>
        <Text style={[theme.typography.label, { color: theme.colors.textSecondary }]}>
          STUDY ACTIVITY
        </Text>
        <Text style={[theme.typography.caption, { color: theme.colors.textSecondary }]}>
          {activeDays}/{days} active days
        </Text>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.heatmapGrid}>
          {/* Day labels */}
          <View style={styles.dayLabels}>
            {DAY_LABELS.map((label, i) => (
              <Text
                key={i}
                style={[styles.dayLabel, { color: theme.colors.textSecondary, height: CELL_SIZE, lineHeight: CELL_SIZE }]}
              >
                {label}
              </Text>
            ))}
          </View>
          {/* Weeks */}
          {weeks.map((week, wi) => (
            <View key={wi} style={[styles.weekColumn, { gap: GAP }]}>
              {week.map((day) => (
                <View
                  key={day.date}
                  style={[
                    styles.heatCell,
                    {
                      width: CELL_SIZE,
                      height: CELL_SIZE,
                      borderRadius: 3,
                      backgroundColor: getColor(day.minutesStudied),
                    },
                  ]}
                />
              ))}
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Legend */}
      <View style={styles.legendRow}>
        <Text style={[theme.typography.caption, { color: theme.colors.textSecondary }]}>Less</Text>
        {[0, 30, 60, 120, 180].map((mins) => (
          <View
            key={mins}
            style={[styles.legendCell, { backgroundColor: getColor(mins), width: 12, height: 12, borderRadius: 2 }]}
          />
        ))}
        <Text style={[theme.typography.caption, { color: theme.colors.textSecondary }]}>More</Text>
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={[theme.typography.h3, { color: theme.colors.textPrimary }]}>
            {Math.round(totalMins / 60)}h
          </Text>
          <Text style={[theme.typography.caption, { color: theme.colors.textSecondary }]}>
            Total study
          </Text>
        </View>
        <View style={[styles.statDivider, { backgroundColor: theme.colors.divider }]} />
        <View style={styles.statItem}>
          <Text style={[theme.typography.h3, { color: theme.colors.textPrimary }]}>
            {activeDays}
          </Text>
          <Text style={[theme.typography.caption, { color: theme.colors.textSecondary }]}>
            Active days
          </Text>
        </View>
        <View style={[styles.statDivider, { backgroundColor: theme.colors.divider }]} />
        <View style={styles.statItem}>
          <Text style={[theme.typography.h3, { color: theme.colors.textPrimary }]}>
            {activeDays > 0 ? Math.round(totalMins / activeDays) : 0}m
          </Text>
          <Text style={[theme.typography.caption, { color: theme.colors.textSecondary }]}>
            Avg / day
          </Text>
        </View>
      </View>
    </Animated.View>
  );
}

// ─── Streak Milestones ────────────────────────────────────────────────────────
export function StreakMilestones({ style }: { style?: any }) {
  const theme = useTheme();
  const { studyDays } = useAppStore();

  const streak = useMemo(() => {
    let count = 0;
    const sorted = [...studyDays].sort((a, b) => b.date.localeCompare(a.date));
    for (const day of sorted) {
      if (day.minutesStudied > 0) count++;
      else break;
    }
    return count;
  }, [studyDays]);

  const milestones = [
    { days: 3, label: '3 Day', emoji: '⚡', reward: 'Getting started!' },
    { days: 7, label: '1 Week', emoji: '🌟', reward: 'Consistency pays off!' },
    { days: 14, label: '2 Weeks', emoji: '💪', reward: 'Building a habit!' },
    { days: 30, label: '1 Month', emoji: '🏆', reward: 'Unstoppable!' },
  ];

  return (
    <View style={[styles.milestonesWrap, style]}>
      <Text style={[theme.typography.label, { color: theme.colors.textSecondary, marginBottom: 12 }]}>
        MILESTONES
      </Text>
      <View style={styles.milestonesRow}>
        {milestones.map((m) => {
          const reached = streak >= m.days;
          return (
            <View key={m.days} style={styles.milestoneItem}>
              <View style={[
                styles.milestoneCircle,
                {
                  backgroundColor: reached ? theme.accent.violet + '22' : theme.colors.elevated,
                  borderColor: reached ? theme.accent.violet : theme.colors.divider,
                },
              ]}>
                <Text style={{ fontSize: reached ? 20 : 16, opacity: reached ? 1 : 0.4 }}>
                  {m.emoji}
                </Text>
              </View>
              <Text style={[theme.typography.caption, {
                color: reached ? theme.colors.textPrimary : theme.colors.textSecondary,
                fontWeight: reached ? '600' : '400',
                marginTop: 4,
              }]}>
                {m.label}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // Streak Small
  streakSmall: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 10, paddingVertical: 5, borderRadius: 9999,
  },
  streakSmallText: { fontSize: 14, fontWeight: '700' },

  // Streak Large
  streakLarge: {
    flexDirection: 'row', alignItems: 'center',
    padding: 20, borderRadius: 20,
  },
  fireGlow: { width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center' },
  fireEmoji: { fontSize: 32 },
  milestoneBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 9999,
    alignSelf: 'flex-start', marginTop: 6,
  },
  milestoneText: { fontSize: 12, fontWeight: '600' },

  // Heatmap
  heatmapWrap: { borderRadius: 16, padding: 16 },
  heatmapHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  heatmapGrid: { flexDirection: 'row', gap: 3 },
  dayLabels: { gap: 3, marginRight: 4 },
  dayLabel: { fontSize: 9, fontWeight: '500', width: 12, textAlign: 'center' },
  weekColumn: { flexDirection: 'column' },
  heatCell: {},
  legendRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 12, justifyContent: 'flex-end' },
  legendCell: {},
  statsRow: { flexDirection: 'row', marginTop: 16 },
  statItem: { flex: 1, alignItems: 'center' },
  statDivider: { width: 1, height: 30, alignSelf: 'center' },

  // Milestones
  milestonesWrap: {},
  milestonesRow: { flexDirection: 'row', justifyContent: 'space-between' },
  milestoneItem: { alignItems: 'center', flex: 1 },
  milestoneCircle: {
    width: 52, height: 52, borderRadius: 26, borderWidth: 2,
    alignItems: 'center', justifyContent: 'center',
  },
});
