import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../theme';
import { useAppStore } from '../state';
import {
  ScreenWrapper, Card, SectionHeader, StatusPill } from '../components';

interface CategoryData {
  name: string;
  displayName: string;
  weight: number;
  items: { label: string; score: number; total: number; contribution: number }[];
  average: number;
}

const CATEGORY_WEIGHTS: Record<string, number> = {
  homework: 30,
  quiz: 20,
  exam: 50,
};

export default function ChemistryGradebookScreen({ navigation, route }: { navigation: any; route: any }) {
  const theme = useTheme();
  const { subjects, gradeItems } = useAppStore();

  const subjectId = route?.params?.subjectId ?? 's1';
  const subject = subjects.find((s) => s.id === subjectId) ?? subjects[0];
  const items = gradeItems.filter((g) => g.subjectId === subject.id);

  // Compute categories
  const categories: CategoryData[] = useMemo(() => {
    const cats: Record<string, typeof items> = {};
    items.forEach((item) => {
      if (!cats[item.category]) cats[item.category] = [];
      cats[item.category].push(item);
    });

    return Object.entries(cats).map(([key, catItems]) => {
      const weight = CATEGORY_WEIGHTS[key] ?? 0;
      const totalScore = catItems.reduce((a, g) => a + g.score, 0);
      const totalPossible = catItems.reduce((a, g) => a + g.total, 0);
      const average = totalPossible > 0 ? (totalScore / totalPossible) * 100 : 0;

      return {
        name: key,
        displayName: key === 'quiz' ? 'Quizzes' : key === 'exam' ? 'Exams' : 'Homework',
        weight,
        average,
        items: catItems.map((g) => ({
          label: g.label,
          score: g.score,
          total: g.total,
          contribution: totalPossible > 0 ? ((g.score / g.total) * weight) / catItems.length : 0,
        })),
      };
    });
  }, [items]);

  const overallPct = useMemo(() => {
    if (items.length === 0) return 0;
    const totalScore = items.reduce((a, g) => a + g.score, 0);
    const totalPossible = items.reduce((a, g) => a + g.total, 0);
    return totalPossible > 0 ? (totalScore / totalPossible) * 100 : 0;
  }, [items]);

  const getLetterGrade = (pct: number) => {
    if (pct >= 93) return 'A';
    if (pct >= 90) return 'A-';
    if (pct >= 87) return 'B+';
    if (pct >= 83) return 'B';
    if (pct >= 80) return 'B-';
    if (pct >= 77) return 'C+';
    if (pct >= 73) return 'C';
    return 'C-';
  };

  return (
    <ScreenWrapper>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: theme.colors.divider }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
          <MaterialIcons name="arrow-back" size={24} color={theme.colors.textPrimary} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <View style={[styles.headerDot, { backgroundColor: subject.color }]} />
          <Text style={[theme.typography.h2, { color: theme.colors.textPrimary }]} numberOfLines={1}>
            {subject.name}
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.gradeBadge, { backgroundColor: subject.color + '22' }]}
          onPress={() => navigation.navigate('EditSubject', { subject })}
        >
          <Text style={[theme.typography.h3, { color: subject.color }]}>
            {getLetterGrade(overallPct)} ({overallPct.toFixed(0)}%)
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Category Cards */}
        {categories.map((cat) => (
          <View key={cat.name}>
            <Card style={styles.categoryCard}>
              {/* Category Header */}
              <View style={styles.categoryHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={[theme.typography.h3, { color: theme.colors.textPrimary }]}>
                    {cat.displayName}
                  </Text>
                  <Text style={[theme.typography.caption, { color: theme.colors.textSecondary }]}>
                    Weight: {cat.weight}%
                  </Text>
                </View>
                <View style={[styles.avgBadge, { backgroundColor: theme.colors.elevated }]}>
                  <Text style={[theme.typography.h3, { color: theme.colors.textPrimary }]}>
                    {cat.average.toFixed(0)}%
                  </Text>
                </View>
              </View>

              {/* Grade Items */}
              {cat.items.map((item, idx) => (
                <View
                  key={idx}
                  style={[
                    styles.gradeItemRow,
                    idx < cat.items.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: theme.colors.divider },
                  ]}
                >
                  <Text style={[theme.typography.body, { color: theme.colors.textPrimary, flex: 1 }]} numberOfLines={1}>
                    {item.label}
                  </Text>
                  <Text style={[theme.typography.body, { color: theme.colors.textPrimary, flexShrink: 0, marginRight: 16 }]}>
                    {item.score}/{item.total}
                  </Text>
                  <Text style={[theme.typography.caption, { color: theme.colors.textSecondary, flexShrink: 0, minWidth: 40, textAlign: 'right' }]}>
                    {item.contribution.toFixed(1)}%
                  </Text>
                </View>
              ))}
            </Card>
          </View>
        ))}

        {/* How Calculated Link */}
        <TouchableOpacity style={styles.howLink}>
          <MaterialIcons name="help-outline" size={16} color={theme.accent.violet} />
          <Text style={[theme.typography.label, { color: theme.accent.violet, marginLeft: 6 }]}>
            How is my grade calculated?
          </Text>
        </TouchableOpacity>

        <View style={{ height: 80 }} />
      </ScrollView>

      {/* FAB - Add Grade */}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: theme.accent.violet }, theme.shadows.glow]}
        onPress={() => navigation.navigate('AddGrade', { subjectId: subject.id })}
        activeOpacity={0.85}
      >
        <MaterialIcons name="add" size={28} color="#EAEAF5" />
      </TouchableOpacity>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  headerCenter: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 12,
    gap: 8,
  },
  headerDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    flexShrink: 0,
  },
  gradeBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 9999,
    flexShrink: 0,
  },
  scrollContent: { paddingHorizontal: 16, paddingTop: 16 },
  categoryCard: {
    marginBottom: 16,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avgBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    flexShrink: 0,
  },
  gradeItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  howLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    padding: 12,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
