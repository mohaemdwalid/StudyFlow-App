import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../theme';
import { useAppStore } from '../state';
import { ScreenWrapper, Card, SectionHeader, SegmentedControl, StatusPill } from '../components';

const SCALE_OPTIONS = ['4.0', '100%'];

export default function GradesOverviewScreen({ navigation }: { navigation: any }) {
  const theme = useTheme();
  const { subjects, gradeItems } = useAppStore();
  const [scaleIndex, setScaleIndex] = useState(0);

  // Calculate grade per subject
  const subjectGrades = useMemo(() => {
    return subjects.map((subject) => {
      const items = gradeItems.filter((g) => g.subjectId === subject.id);
      if (items.length === 0) {
        return { subject, percentage: 0, items: [], hasData: false };
      }
      const totalScore = items.reduce((acc, g) => acc + g.score, 0);
      const totalPossible = items.reduce((acc, g) => acc + g.total, 0);
      const percentage = totalPossible > 0 ? (totalScore / totalPossible) * 100 : 0;
      return { subject, percentage, items, hasData: true };
    });
  }, [subjects, gradeItems]);

  // Simple GPA calculation (A = 4.0, B = 3.0, etc.)
  const gpa = useMemo(() => {
    const graded = subjectGrades.filter((sg) => sg.hasData);
    if (graded.length === 0) return 0;
    const totalGP = graded.reduce((acc, sg) => {
      if (sg.percentage >= 90) return acc + 4.0;
      if (sg.percentage >= 80) return acc + 3.0;
      if (sg.percentage >= 70) return acc + 2.0;
      if (sg.percentage >= 60) return acc + 1.0;
      return acc;
    }, 0);
    return totalGP / graded.length;
  }, [subjectGrades]);

  const getLetterGrade = (pct: number) => {
    if (pct >= 93) return 'A';
    if (pct >= 90) return 'A-';
    if (pct >= 87) return 'B+';
    if (pct >= 83) return 'B';
    if (pct >= 80) return 'B-';
    if (pct >= 77) return 'C+';
    if (pct >= 73) return 'C';
    if (pct >= 70) return 'C-';
    if (pct >= 60) return 'D';
    return 'F';
  };

  // Default category weights for all subjects (30% HW + 20% Quiz + 50% Exam = 100%)
  const DEFAULT_WEIGHTS = { homework: 30, quiz: 20, exam: 50 };

  return (
    <ScreenWrapper>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Page header */}
        <View style={styles.pageHeader}>
          <Text style={[theme.typography.h1, { color: theme.colors.textPrimary }]}>Grades</Text>
          <TouchableOpacity
            style={styles.editSubjectBtn}
            onPress={() => navigation.navigate('EditSubject')}
          >
            <MaterialIcons name="edit" size={18} color={theme.accent.violet} />
            <Text style={{ fontSize: 13, color: theme.accent.violet, marginLeft: 4, fontWeight: '500' }}>Subjects</Text>
          </TouchableOpacity>
        </View>
        {/* GPA Hero Card */}
        <Card variant="hero" style={styles.gpaCard}>
          <Text style={[theme.typography.caption, { color: '#EAEAF5' + 'AA', letterSpacing: 2 }]}>
            CUMULATIVE GPA
          </Text>
          <Text style={[theme.typography.hero, { color: '#EAEAF5', marginTop: 4 }]}>
            {scaleIndex === 0 ? gpa.toFixed(1) : `${((gpa / 4) * 100).toFixed(0)}%`}
          </Text>
          <View style={styles.scaleToggle}>
            <SegmentedControl
              segments={SCALE_OPTIONS}
              selected={scaleIndex}
              onSelect={setScaleIndex}
            />
          </View>
        </Card>

        {/* Subject List */}
        <SectionHeader title="Subjects" />
        {subjectGrades.map(({ subject, percentage, hasData }) => {
          const weights = DEFAULT_WEIGHTS;
          const totalWeight = weights.homework + weights.quiz + weights.exam;
          const incomplete = totalWeight < 100;

          return (
            <TouchableOpacity
              key={subject.id}
              activeOpacity={0.7}
              onPress={() => navigation.navigate('ChemistryGradebook', { subjectId: subject.id })}
            >
              <Card style={styles.subjectRow}>
                <View style={styles.subjectLeft}>
                  <View style={[styles.colorCircle, { backgroundColor: subject.color }]} />
                  <View style={{ flex: 1 }}>
                    <Text style={[theme.typography.body, { color: theme.colors.textPrimary }]} numberOfLines={1}>
                      {subject.name}
                    </Text>
                    {incomplete && hasData && (
                      <View style={styles.warningChip}>
                        <MaterialIcons name="warning" size={12} color={theme.accent.amber} />
                        <Text style={[theme.typography.caption, { color: theme.accent.amber, marginLeft: 4 }]}>
                          Weights incomplete
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
                <View style={styles.subjectRight}>
                  {hasData ? (
                    <>
                      <Text style={[theme.typography.h3, { color: theme.colors.textPrimary }]}>
                        {scaleIndex === 0
                          ? getLetterGrade(percentage)
                          : `${percentage.toFixed(0)}%`}
                      </Text>
                      <View style={[styles.progressBar, { backgroundColor: theme.colors.elevated }]}>
                        <View
                          style={[
                            styles.progressFill,
                            {
                              backgroundColor: subject.color,
                              width: `${Math.min(percentage, 100)}%` as any,
                            },
                          ]}
                        />
                      </View>
                    </>
                  ) : (
                    <Text style={[theme.typography.caption, { color: theme.colors.textSecondary }]}>
                      No grades
                    </Text>
                  )}
                </View>
              </Card>
            </TouchableOpacity>
          );
        })}

        <View style={{ height: 40 }} />
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingHorizontal: 16 },
  pageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
    marginBottom: 4,
  },
  editSubjectBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6C63FF22',
    borderRadius: 9999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  gpaCard: {
    alignItems: 'center',
    paddingVertical: 28,
    marginTop: 8,
  },
  scaleToggle: {
    marginTop: 16,
    width: 160,
  },
  subjectRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  subjectLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  colorCircle: {
    width: 14,
    height: 14,
    borderRadius: 7,
    flexShrink: 0,
  },
  subjectRight: {
    alignItems: 'flex-end',
    flexShrink: 0,
    marginLeft: 12,
    minWidth: 60,
  },
  progressBar: {
    height: 4,
    borderRadius: 2,
    width: 60,
    marginTop: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  warningChip: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
});
