/**
 * AI Difficulty Prediction / Risk Analysis
 * Analyses study patterns and grades to predict subject difficulty.
 */
import React, { useMemo } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useTheme } from '../../app/theme';
import { useAppStore } from '../../app/state';
import { DifficultyInsight } from '../../types';

const RISK_CONFIG = {
  high: { icon: 'warning' as const, label: 'High Risk' },
  medium: { icon: 'info' as const, label: 'Medium' },
  low: { icon: 'check-circle' as const, label: 'Low Risk' },
};

export default function DifficultyPredictionScreen({ navigation }: { navigation: any }) {
  const theme = useTheme();
  const { subjects, gradeItems, focusSessions, tasks } = useAppStore();

  // ── Generate DifficultyInsight[] from store data ──
  const insights = useMemo<DifficultyInsight[]>(() => {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 86400000);

    return subjects.map((subject) => {
      const reasons: string[] = [];

      // Average grade
      const grades = gradeItems.filter((g) => g.subjectId === subject.id);
      let avgGrade: number | null = null;
      if (grades.length > 0) {
        const totalScore = grades.reduce((a, g) => a + g.score, 0);
        const totalPossible = grades.reduce((a, g) => a + g.total, 0);
        avgGrade = totalPossible > 0 ? (totalScore / totalPossible) * 100 : null;
        if (avgGrade != null) {
          reasons.push(`Average grade: ${Math.round(avgGrade)}%`);
        }
      } else {
        reasons.push('No grades recorded yet');
      }

      // Overdue tasks
      const overdueTasks = tasks.filter(
        (t) => t.subjectId === subject.id && t.status === 'overdue',
      );
      if (overdueTasks.length > 0) {
        reasons.push(`${overdueTasks.length} overdue task${overdueTasks.length !== 1 ? 's' : ''}`);
      }

      // Recent focus time
      const recentFocus = focusSessions.filter(
        (f) => f.subjectId === subject.id && new Date(f.date) >= weekAgo,
      );
      const recentMins = recentFocus.reduce((a, f) => a + f.duration, 0);
      if (recentMins === 0) {
        reasons.push('No study sessions this week');
      } else {
        reasons.push(`${Math.round(recentMins)} min studied this week`);
      }

      // Determine risk level
      let riskLevel: 'high' | 'medium' | 'low' = 'low';
      if ((avgGrade != null && avgGrade < 60) || overdueTasks.length > 2) {
        riskLevel = 'high';
      } else if ((avgGrade != null && avgGrade < 75) || overdueTasks.length > 0 || recentMins === 0) {
        riskLevel = 'medium';
      }

      // Suggestion
      let suggestion = 'Keep up the great work! Your study habits are solid.';
      if (riskLevel === 'high') {
        suggestion = 'Schedule 2–3 extra study sessions this week and review overdue tasks immediately.';
      } else if (riskLevel === 'medium') {
        suggestion = 'Consider adding one more weekly study session and completing pending tasks.';
      }

      return {
        subjectId: subject.id,
        subjectName: subject.name,
        color: subject.color,
        riskLevel,
        reasons,
        suggestion,
      };
    });
  }, [subjects, gradeItems, focusSessions, tasks]);

  // ── Summary counts ──
  const summary = useMemo(() => ({
    high: insights.filter((i) => i.riskLevel === 'high').length,
    medium: insights.filter((i) => i.riskLevel === 'medium').length,
    low: insights.filter((i) => i.riskLevel === 'low').length,
  }), [insights]);

  const riskColor = (level: 'high' | 'medium' | 'low') => {
    if (level === 'high') return theme.accent.coral;
    if (level === 'medium') return theme.accent.amber;
    return theme.accent.mint;
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.colors.background }]} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <Animated.View entering={FadeInDown.duration(300)} style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
            <MaterialIcons name="arrow-back" size={24} color={theme.colors.textPrimary} />
          </TouchableOpacity>
          <Text style={[theme.typography.h1, { color: theme.colors.textPrimary, flex: 1, marginLeft: 12 }]}>
            Difficulty Insights ✨
          </Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(50).duration(300)}>
          <Text style={[theme.typography.body, { color: theme.colors.textSecondary, marginBottom: 20 }]}>
            AI-powered analysis of your study patterns and grades
          </Text>
        </Animated.View>

        {/* Summary Stats */}
        <Animated.View entering={FadeInDown.delay(100).duration(400)} style={styles.summaryRow}>
          {([
            { level: 'high' as const, count: summary.high, icon: 'warning' as const },
            { level: 'medium' as const, count: summary.medium, icon: 'info' as const },
            { level: 'low' as const, count: summary.low, icon: 'check-circle' as const },
          ]).map((item) => (
            <View
              key={item.level}
              style={[styles.summaryCard, { backgroundColor: riskColor(item.level) + '15' }]}
            >
              <MaterialIcons name={item.icon} size={22} color={riskColor(item.level)} />
              <Text style={[styles.summaryCount, { color: riskColor(item.level) }]}>
                {item.count}
              </Text>
              <Text style={[styles.summaryLabel, { color: theme.colors.textSecondary }]}>
                {RISK_CONFIG[item.level].label}
              </Text>
            </View>
          ))}
        </Animated.View>

        {/* Risk Cards */}
        {insights.map((insight, i) => {
          const color = riskColor(insight.riskLevel);
          const config = RISK_CONFIG[insight.riskLevel];
          return (
            <Animated.View
              key={insight.subjectId}
              entering={FadeInDown.delay(200 + i * 80).duration(400)}
              style={[styles.riskCard, { backgroundColor: theme.colors.card }]}
            >
              {/* Card Header */}
              <View style={styles.riskCardHeader}>
                <View style={[styles.subjectDot, { backgroundColor: insight.color }]} />
                <Text style={[styles.riskSubjectName, { color: theme.colors.textPrimary }]}>
                  {insight.subjectName}
                </Text>
                <View style={[styles.riskBadge, { backgroundColor: color + '20' }]}>
                  <MaterialIcons name={config.icon} size={14} color={color} />
                  <Text style={[styles.riskBadgeText, { color }]}>{config.label}</Text>
                </View>
              </View>

              {/* Reasons */}
              <View style={styles.reasonsList}>
                {insight.reasons.map((reason, ri) => (
                  <View key={ri} style={styles.reasonRow}>
                    <View style={[styles.bullet, { backgroundColor: theme.colors.textSecondary }]} />
                    <Text style={[styles.reasonText, { color: theme.colors.textSecondary }]}>
                      {reason}
                    </Text>
                  </View>
                ))}
              </View>

              {/* Suggestion */}
              <View style={[styles.suggestionCard, { backgroundColor: color + '10', borderLeftColor: color }]}>
                <MaterialIcons name="lightbulb" size={16} color={color} />
                <Text style={[styles.suggestionText, { color: theme.colors.textPrimary }]}>
                  {insight.suggestion}
                </Text>
              </View>
            </Animated.View>
          );
        })}

        {insights.length === 0 && (
          <Animated.View entering={FadeInDown.delay(200).duration(400)} style={[styles.emptyState, { backgroundColor: theme.colors.card }]}>
            <MaterialIcons name="school" size={48} color={theme.colors.textSecondary} />
            <Text style={[theme.typography.h3, { color: theme.colors.textPrimary, marginTop: 12 }]}>
              No subjects to analyse
            </Text>
            <Text style={[theme.typography.body, { color: theme.colors.textSecondary, marginTop: 4, textAlign: 'center' }]}>
              Add subjects and study data to see AI-powered insights
            </Text>
          </Animated.View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: { paddingHorizontal: 20, paddingTop: 8 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  // Summary
  summaryRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  summaryCard: {
    flex: 1, borderRadius: 14, padding: 14, alignItems: 'center', gap: 4,
  },
  summaryCount: { fontSize: 24, fontWeight: '800' },
  summaryLabel: { fontSize: 10, fontWeight: '600', letterSpacing: 0.5 },
  // Risk cards
  riskCard: { borderRadius: 16, padding: 18, marginBottom: 14 },
  riskCardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  subjectDot: { width: 12, height: 12, borderRadius: 6, marginRight: 10 },
  riskSubjectName: { fontSize: 16, fontWeight: '700', flex: 1 },
  riskBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 10, paddingVertical: 5, borderRadius: 9999,
  },
  riskBadgeText: { fontSize: 11, fontWeight: '700' },
  // Reasons
  reasonsList: { marginBottom: 12 },
  reasonRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  bullet: { width: 5, height: 5, borderRadius: 2.5, marginRight: 8 },
  reasonText: { fontSize: 13, fontWeight: '500', flex: 1 },
  // Suggestion
  suggestionCard: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 10,
    borderRadius: 12, borderLeftWidth: 3, padding: 14,
  },
  suggestionText: { fontSize: 13, fontWeight: '500', flex: 1, lineHeight: 19 },
  // Empty
  emptyState: { borderRadius: 20, padding: 48, alignItems: 'center', marginTop: 40 },
});
