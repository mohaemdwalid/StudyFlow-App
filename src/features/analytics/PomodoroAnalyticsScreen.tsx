/**
 * Pomodoro Analytics Dashboard
 * Focus session analytics with charts, stats, and session log.
 */
import React, { useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import Svg, { Polyline, Circle as SvgCircle, Line } from 'react-native-svg';
import { useTheme } from '../../app/theme';
import { useAppStore } from '../../app/state';

const { width: SW } = Dimensions.get('window');
const CHART_PADDING = 40;
const CHART_W = SW - CHART_PADDING * 2;

type Range = '7d' | '30d' | 'all';

function getDayLabel(dateStr: string) {
  const d = new Date(dateStr);
  return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d.getDay()];
}

function formatMinutes(mins: number): string {
  if (mins < 60) return `${mins}m`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

function renderStars(quality: number) {
  return Array.from({ length: 5 }, (_, i) => (
    <MaterialIcons
      key={i}
      name={i < quality ? 'star' : 'star-border'}
      size={14}
      color={i < quality ? '#F59E0B' : '#8B8FA855'}
    />
  ));
}

export default function PomodoroAnalyticsScreen({ navigation }: { navigation: any }) {
  const theme = useTheme();
  const { focusSessions, subjects } = useAppStore();
  const [range, setRange] = useState<Range>('7d');

  // ── Filtered sessions by range ──
  const filteredSessions = useMemo(() => {
    const now = new Date();
    const sorted = [...focusSessions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    if (range === 'all') return sorted;
    const days = range === '7d' ? 7 : 30;
    const cutoff = new Date(now.getTime() - days * 86400000);
    return sorted.filter((s) => new Date(s.date) >= cutoff);
  }, [focusSessions, range]);

  // ── Daily focus data (last 7 unique days) ──
  const dailyData = useMemo(() => {
    const map: Record<string, number> = {};
    filteredSessions.forEach((s) => {
      map[s.date] = (map[s.date] || 0) + s.duration;
    });
    const entries = Object.entries(map).sort(([a], [b]) => a.localeCompare(b));
    return entries.slice(-7).map(([date, mins]) => ({ date, mins }));
  }, [filteredSessions]);

  const maxMins = Math.max(...dailyData.map((d) => d.mins), 1);

  // ── Subject distribution ──
  const subjectDistribution = useMemo(() => {
    const map: Record<string, number> = {};
    let total = 0;
    filteredSessions.forEach((s) => {
      if (s.subjectId) {
        map[s.subjectId] = (map[s.subjectId] || 0) + s.duration;
        total += s.duration;
      }
    });
    return Object.entries(map)
      .map(([subjectId, mins]) => {
        const subj = subjects.find((s) => s.id === subjectId);
        return {
          subjectId,
          name: subj?.name ?? 'Unknown',
          color: subj?.color ?? theme.accent.violet,
          mins,
          pct: total > 0 ? Math.round((mins / total) * 100) : 0,
        };
      })
      .sort((a, b) => b.mins - a.mins);
  }, [filteredSessions, subjects]);

  // ── Stats ──
  const stats = useMemo(() => {
    const totalMins = filteredSessions.reduce((a, s) => a + s.duration, 0);
    const uniqueDays = new Set(filteredSessions.map((s) => s.date)).size;
    const avgPerDay = uniqueDays > 0 ? Math.round(totalMins / uniqueDays) : 0;
    const bestDay = dailyData.reduce((best, d) => (d.mins > best.mins ? d : best), { date: '-', mins: 0 });
    const completed = filteredSessions.filter((s) => s.completed).length;
    const rate = filteredSessions.length > 0 ? Math.round((completed / filteredSessions.length) * 100) : 0;
    return { totalMins, avgPerDay, bestDay, rate };
  }, [filteredSessions, dailyData]);

  // ── SVG trend line points ──
  const trendLinePoints = useMemo(() => {
    if (dailyData.length < 2) return '';
    const svgW = CHART_W - 20;
    const svgH = 80;
    const padY = 10;
    const max = Math.max(...dailyData.map((d) => d.mins), 1);
    return dailyData.map((d, i) => {
      const x = (i / (dailyData.length - 1)) * svgW + 10;
      const y = svgH - padY - ((d.mins / max) * (svgH - padY * 2));
      return `${x},${y}`;
    }).join(' ');
  }, [dailyData]);

  const subjectName = (id?: string) => subjects.find((s) => s.id === id)?.name ?? 'General';

  const rangeChips: { label: string; value: Range }[] = [
    { label: '7d', value: '7d' },
    { label: '30d', value: '30d' },
    { label: 'All', value: 'all' },
  ];

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.colors.background }]} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <Animated.View entering={FadeInDown.duration(300)} style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
            <MaterialIcons name="arrow-back" size={24} color={theme.colors.textPrimary} />
          </TouchableOpacity>
          <Text style={[theme.typography.h1, { color: theme.colors.textPrimary, flex: 1, marginLeft: 12 }]}>
            Focus Analytics
          </Text>
          <MaterialIcons name="insights" size={28} color={theme.accent.violet} />
        </Animated.View>

        {/* Range Selector */}
        <Animated.View entering={FadeInDown.delay(50).duration(300)} style={styles.chipRow}>
          {rangeChips.map((c) => (
            <TouchableOpacity
              key={c.value}
              onPress={() => setRange(c.value)}
              style={[
                styles.rangeChip,
                {
                  backgroundColor: range === c.value ? theme.accent.violet + '22' : theme.colors.elevated,
                  borderWidth: range === c.value ? 1.5 : 0,
                  borderColor: theme.accent.violet,
                },
              ]}
            >
              <Text style={{
                fontSize: 13, fontWeight: '600',
                color: range === c.value ? theme.accent.violet : theme.colors.textSecondary,
              }}>
                {c.label}
              </Text>
            </TouchableOpacity>
          ))}
        </Animated.View>

        {/* Daily Focus Bar Chart */}
        <Animated.View entering={FadeInDown.delay(100).duration(400)} style={[styles.card, { backgroundColor: theme.colors.card }]}>
          <Text style={[theme.typography.label, { color: theme.colors.textSecondary, marginBottom: 16 }]}>
            DAILY FOCUS
          </Text>
          <View style={styles.barChart}>
            {dailyData.map((d, i) => {
              const heightPct = (d.mins / maxMins) * 100;
              const isTallest = d.mins === maxMins && d.mins > 0;
              return (
                <Animated.View
                  key={d.date}
                  entering={FadeInDown.delay(150 + i * 60).duration(400)}
                  style={styles.barCol}
                >
                  {isTallest && (
                    <View style={[styles.tooltip, { backgroundColor: theme.accent.violet }]}>
                      <Text style={styles.tooltipText}>{formatMinutes(d.mins)}</Text>
                    </View>
                  )}
                  <View style={[styles.barTrack, { backgroundColor: theme.colors.elevated }]}>
                    <LinearGradient
                      colors={[theme.accent.violet, theme.accent.indigo]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 0, y: 1 }}
                      style={[styles.barFill, { height: `${heightPct}%` }]}
                    />
                  </View>
                  <Text style={[styles.barDayLabel, { color: theme.colors.textSecondary }]}>
                    {getDayLabel(d.date)}
                  </Text>
                </Animated.View>
              );
            })}
            {dailyData.length === 0 && (
              <Text style={[theme.typography.body, { color: theme.colors.textSecondary, textAlign: 'center', width: '100%' }]}>
                No sessions in this period
              </Text>
            )}
          </View>
        </Animated.View>

        {/* Subject Distribution */}
        <Animated.View entering={FadeInDown.delay(200).duration(400)} style={[styles.card, { backgroundColor: theme.colors.card }]}>
          <Text style={[theme.typography.label, { color: theme.colors.textSecondary, marginBottom: 16 }]}>
            SUBJECT DISTRIBUTION
          </Text>
          {subjectDistribution.map((s) => (
            <View key={s.subjectId} style={styles.distRow}>
              <View style={[styles.subjectDot, { backgroundColor: s.color }]} />
              <Text style={[styles.distName, { color: theme.colors.textPrimary }]} numberOfLines={1}>
                {s.name}
              </Text>
              <View style={[styles.distBarTrack, { backgroundColor: theme.colors.elevated }]}>
                <View style={[styles.distBarFill, { width: `${s.pct}%`, backgroundColor: s.color }]} />
              </View>
              <Text style={[styles.distPct, { color: theme.colors.textSecondary }]}>{s.pct}%</Text>
            </View>
          ))}
          {subjectDistribution.length === 0 && (
            <Text style={[theme.typography.body, { color: theme.colors.textSecondary }]}>No subject data</Text>
          )}
        </Animated.View>

        {/* Stats Row */}
        <Animated.View entering={FadeInDown.delay(300).duration(400)} style={styles.statsRow}>
          {[
            { label: 'Total Focus', value: formatMinutes(stats.totalMins), icon: 'timer' as const, color: theme.accent.violet },
            { label: 'Avg / Day', value: formatMinutes(stats.avgPerDay), icon: 'show-chart' as const, color: theme.accent.sky },
            { label: 'Best Day', value: formatMinutes(stats.bestDay.mins), icon: 'emoji-events' as const, color: theme.accent.amber },
            { label: 'Completion', value: `${stats.rate}%`, icon: 'check-circle' as const, color: theme.accent.mint },
          ].map((stat, i) => (
            <View key={stat.label} style={[styles.statCard, { backgroundColor: theme.colors.card }]}>
              <MaterialIcons name={stat.icon} size={20} color={stat.color} />
              <Text style={[styles.statValue, { color: theme.colors.textPrimary }]}>{stat.value}</Text>
              <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>{stat.label}</Text>
            </View>
          ))}
        </Animated.View>

        {/* Focus Trend Line (SVG) */}
        {dailyData.length >= 2 && (
          <Animated.View entering={FadeInDown.delay(400).duration(400)} style={[styles.card, { backgroundColor: theme.colors.card }]}>
            <Text style={[theme.typography.label, { color: theme.colors.textSecondary, marginBottom: 12 }]}>
              FOCUS TREND
            </Text>
            <Svg width={CHART_W} height={80}>
              {/* grid lines */}
              <Line x1={10} y1={10} x2={CHART_W - 10} y2={10} stroke={theme.colors.divider} strokeWidth={0.5} />
              <Line x1={10} y1={40} x2={CHART_W - 10} y2={40} stroke={theme.colors.divider} strokeWidth={0.5} />
              <Line x1={10} y1={70} x2={CHART_W - 10} y2={70} stroke={theme.colors.divider} strokeWidth={0.5} />
              {/* trend polyline */}
              <Polyline
                points={trendLinePoints}
                fill="none"
                stroke={theme.accent.violet}
                strokeWidth={2.5}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {/* data points */}
              {dailyData.map((d, i) => {
                const svgW = CHART_W - 20;
                const svgH = 80;
                const padY = 10;
                const max = Math.max(...dailyData.map((dd) => dd.mins), 1);
                const x = (i / (dailyData.length - 1)) * svgW + 10;
                const y = svgH - padY - ((d.mins / max) * (svgH - padY * 2));
                return <SvgCircle key={d.date} cx={x} cy={y} r={4} fill={theme.accent.violet} />;
              })}
            </Svg>
            <View style={styles.trendLabels}>
              <Text style={[styles.trendLabel, { color: theme.colors.textSecondary }]}>
                {getDayLabel(dailyData[0].date)}
              </Text>
              <Text style={[styles.trendLabel, { color: theme.colors.textSecondary }]}>
                {getDayLabel(dailyData[dailyData.length - 1].date)}
              </Text>
            </View>
          </Animated.View>
        )}

        {/* Pomodoro Log */}
        <Animated.View entering={FadeInDown.delay(500).duration(400)}>
          <Text style={[theme.typography.label, { color: theme.colors.textSecondary, marginBottom: 12, marginLeft: 4 }]}>
            RECENT SESSIONS
          </Text>
          {filteredSessions.slice(0, 15).map((session, i) => (
            <Animated.View
              key={session.id}
              entering={FadeInDown.delay(550 + i * 40).duration(300)}
              style={[styles.logCard, { backgroundColor: theme.colors.card }]}
            >
              <View style={[styles.logColorPip, { backgroundColor: subjects.find((s) => s.id === session.subjectId)?.color ?? theme.accent.violet }]} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.logSubject, { color: theme.colors.textPrimary }]}>
                  {subjectName(session.subjectId)}
                </Text>
                <Text style={[styles.logDate, { color: theme.colors.textSecondary }]}>
                  {new Date(session.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={[styles.logDuration, { color: theme.colors.textPrimary }]}>
                  {formatMinutes(session.duration)}
                </Text>
                {session.quality != null && (
                  <View style={styles.starsRow}>{renderStars(session.quality)}</View>
                )}
              </View>
            </Animated.View>
          ))}
          {filteredSessions.length === 0 && (
            <View style={[styles.emptyState, { backgroundColor: theme.colors.card }]}>
              <MaterialIcons name="hourglass-empty" size={40} color={theme.colors.textSecondary} />
              <Text style={[theme.typography.body, { color: theme.colors.textSecondary, marginTop: 8 }]}>
                No focus sessions recorded yet
              </Text>
            </View>
          )}
        </Animated.View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: { paddingHorizontal: 20, paddingTop: 8 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  chipRow: { flexDirection: 'row', gap: 8, marginBottom: 20 },
  rangeChip: {
    paddingHorizontal: 16, paddingVertical: 8, borderRadius: 9999,
  },
  card: { borderRadius: 16, padding: 20, marginBottom: 16 },
  // Bar chart
  barChart: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', height: 140 },
  barCol: { alignItems: 'center', flex: 1 },
  barTrack: {
    width: 28, height: 110, borderRadius: 8, justifyContent: 'flex-end', overflow: 'hidden',
  },
  barFill: { width: '100%', borderRadius: 8 },
  barDayLabel: { fontSize: 10, fontWeight: '600', marginTop: 6, letterSpacing: 0.5 },
  tooltip: {
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, marginBottom: 4,
  },
  tooltipText: { fontSize: 10, fontWeight: '700', color: '#FFF' },
  // Subject distribution
  distRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  subjectDot: { width: 10, height: 10, borderRadius: 5, marginRight: 8 },
  distName: { width: 80, fontSize: 13, fontWeight: '500' },
  distBarTrack: { flex: 1, height: 8, borderRadius: 4, overflow: 'hidden', marginHorizontal: 10 },
  distBarFill: { height: '100%', borderRadius: 4 },
  distPct: { width: 36, fontSize: 12, fontWeight: '700', textAlign: 'right' },
  // Stats
  statsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 16 },
  statCard: {
    width: (SW - 50) / 2 - 5, borderRadius: 14, padding: 14, gap: 4,
  },
  statValue: { fontSize: 20, fontWeight: '800' },
  statLabel: { fontSize: 11, fontWeight: '600', letterSpacing: 0.5 },
  // Trend
  trendLabels: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 },
  trendLabel: { fontSize: 10, fontWeight: '500' },
  // Log
  logCard: {
    flexDirection: 'row', alignItems: 'center', borderRadius: 14,
    padding: 14, marginBottom: 8,
  },
  logColorPip: { width: 6, height: 32, borderRadius: 3, marginRight: 12 },
  logSubject: { fontSize: 14, fontWeight: '600' },
  logDate: { fontSize: 11, marginTop: 2 },
  logDuration: { fontSize: 15, fontWeight: '700' },
  starsRow: { flexDirection: 'row', marginTop: 2 },
  // Empty
  emptyState: { borderRadius: 16, padding: 40, alignItems: 'center' },
});
