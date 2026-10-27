import React, { useState } from 'react';
import {
    View, Text, ScrollView, TouchableOpacity, StyleSheet, Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../theme';
import { ScreenWrapper } from '../components';

const { width: SW } = Dimensions.get('window');

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const FOCUS_DATA = [45, 80, 60, 105, 30, 20, 70]; // minutes
const MAX_FOCUS = 120;

const SUBJECTS = [
    { name: 'Mathematics', pct: 92, color: '#6C63FF' },
    { name: 'Chemistry', pct: 65, color: '#FF6B6B' },
    { name: 'Physics', pct: 78, color: '#38BDF8' },
];

const INSIGHTS = [
    { icon: '💡', text: 'You focus best between 9–11 AM', color: '#4ADEAA' },
    { icon: '⚠️', text: "Chemistry hasn't been studied in 5 days", color: '#F59E0B' },
    { icon: '🎯', text: '2 exams in the next 2 weeks', color: '#FF6B6B' },
];

const RANGES = ['7d', '30d', 'Custom'] as const;

export default function AnalyticsDashboardScreen({ navigation }: any) {
    const theme = useTheme();
    const [range, setRange] = useState<typeof RANGES[number]>('7d');
    const s = styles(theme);

    return (
        <ScreenWrapper>
            <ScrollView style={s.scroll} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
                {/* Header */}
                <View style={s.header}>
                    <Text style={s.title}>Analytics</Text>
                    <View style={s.rangeRow}>
                        {RANGES.map(r => (
                            <TouchableOpacity
                                key={r}
                                style={[s.rangeChip, range === r && s.rangeChipActive]}
                                onPress={() => setRange(r)}
                            >
                                <Text style={[s.rangeText, range === r && s.rangeTextActive]}>{r}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Bar Chart */}
                <View style={s.card}>
                    <Text style={s.sectionLabel}>Focus This Week</Text>
                    <View style={s.chartArea}>
                        {FOCUS_DATA.map((val, i) => {
                            const heightPct = val / MAX_FOCUS;
                            const isToday = i === 3;
                            return (
                                <View key={i} style={s.barCol}>
                                    {isToday && (
                                        <View style={s.tooltip}>
                                            <Text style={s.tooltipText}>Thu · {Math.floor(val / 60)}h {val % 60}m</Text>
                                        </View>
                                    )}
                                    <View style={s.barTrack}>
                                        {isToday ? (
                                            <LinearGradient
                                                colors={['#6C63FF', '#4F46E5']}
                                                style={[s.barFill, { height: `${heightPct * 100}%` as any }]}
                                            />
                                        ) : (
                                            <View style={[s.barFillSolid, { height: `${heightPct * 100}%` as any }]} />
                                        )}
                                    </View>
                                    <Text style={s.dayLabel}>{DAYS[i]}</Text>
                                </View>
                            );
                        })}
                    </View>
                </View>

                {/* Stats Row */}
                <View style={s.statsRow}>
                    <View style={s.statCard}>
                        <Text style={s.statValue}>8h 20m</Text>
                        <Text style={s.statLabel}>Total Focus</Text>
                    </View>
                    <View style={s.statCard}>
                        <Text style={[s.statValue, { color: theme.accent.mint }]}>74%</Text>
                        <Text style={s.statLabel}>Completion</Text>
                    </View>
                    <View style={s.statCard}>
                        <Text style={[s.statValue, { color: theme.accent.violet, fontSize: 16 }]}>Tuesday</Text>
                        <Text style={s.statLabel}>Best Day</Text>
                    </View>
                </View>

                {/* Subject Breakdown */}
                <View style={s.card}>
                    <Text style={s.sectionLabel}>Subject Breakdown</Text>
                    {SUBJECTS.map(sub => (
                        <View key={sub.name} style={s.subjectRow}>
                            <Text style={s.subjectName}>{sub.name}</Text>
                            <View style={s.barBg}>
                                <View style={[s.subjectBar, { width: `${sub.pct}%` as any, backgroundColor: sub.color }]} />
                            </View>
                            <Text style={[s.subjectPct, { color: sub.color }]}>{sub.pct}%</Text>
                        </View>
                    ))}
                </View>

                {/* Insights */}
                <Text style={s.sectionHeader}>Insights</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.insightScroll}>
                    {INSIGHTS.map((ins, i) => (
                        <View key={i} style={[s.insightCard, { borderLeftColor: ins.color }]}>
                            <Text style={s.insightIcon}>{ins.icon}</Text>
                            <Text style={s.insightText}>{ins.text}</Text>
                        </View>
                    ))}
                </ScrollView>

                <View style={{ height: 120 }} />
            </ScrollView>
        </ScreenWrapper>
    );
}

const styles = (theme: any) => StyleSheet.create({
    safe: { flex: 1, backgroundColor: theme.colors.background },
    scroll: { flex: 1 },
    content: { paddingHorizontal: 20, paddingTop: 8 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    title: { fontSize: 26, fontWeight: '700', color: theme.colors.textPrimary },
    rangeRow: { flexDirection: 'row', gap: 6 },
    rangeChip: {
        paddingHorizontal: 12, paddingVertical: 6,
        borderRadius: 9999,
        backgroundColor: theme.colors.elevated,
    },
    rangeChipActive: { backgroundColor: theme.accent.violet },
    rangeText: { fontSize: 13, color: theme.colors.textSecondary, fontWeight: '500' },
    rangeTextActive: { color: '#FFF' },
    card: {
        backgroundColor: theme.colors.card,
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
    },
    sectionLabel: { fontSize: 14, fontWeight: '600', color: theme.colors.textSecondary, marginBottom: 12 },
    chartArea: { flexDirection: 'row', alignItems: 'flex-end', height: 120, gap: 8 },
    barCol: { flex: 1, alignItems: 'center' },
    tooltip: {
        backgroundColor: theme.accent.violet,
        borderRadius: 6,
        paddingHorizontal: 6,
        paddingVertical: 3,
        marginBottom: 4,
    },
    tooltipText: { fontSize: 10, color: '#FFF', fontWeight: '600' },
    barTrack: {
        width: '100%', height: 80,
        backgroundColor: theme.colors.elevated,
        borderRadius: 4,
        overflow: 'hidden',
        justifyContent: 'flex-end',
    },
    barFill: { width: '100%', borderRadius: 4 },
    barFillSolid: { width: '100%', borderRadius: 4, backgroundColor: '#6C63FF80' },
    dayLabel: { fontSize: 10, color: theme.colors.textSecondary, marginTop: 4 },
    statsRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
    statCard: {
        flex: 1,
        backgroundColor: theme.colors.elevated,
        borderRadius: 12,
        padding: 12,
        alignItems: 'center',
    },
    statValue: { fontSize: 18, fontWeight: '700', color: theme.colors.textPrimary, marginBottom: 2 },
    statLabel: { fontSize: 11, color: theme.colors.textSecondary, textAlign: 'center' },
    sectionHeader: {
        fontSize: 16, fontWeight: '600', color: theme.colors.textPrimary,
        marginBottom: 10, marginTop: 4,
    },
    subjectRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10, gap: 8 },
    subjectName: { fontSize: 13, color: theme.colors.textPrimary, width: 90 },
    barBg: { flex: 1, height: 6, backgroundColor: theme.colors.elevated, borderRadius: 99, overflow: 'hidden' },
    subjectBar: { height: 6, borderRadius: 99 },
    subjectPct: { fontSize: 12, fontWeight: '600', width: 34, textAlign: 'right' },
    insightScroll: { marginBottom: 8 },
    insightCard: {
        backgroundColor: theme.colors.card,
        borderRadius: 12,
        padding: 14,
        marginRight: 10,
        width: 160,
        borderLeftWidth: 3,
    },
    insightIcon: { fontSize: 22, marginBottom: 6 },
    insightText: { fontSize: 12, color: theme.colors.textSecondary, lineHeight: 17 },
});
