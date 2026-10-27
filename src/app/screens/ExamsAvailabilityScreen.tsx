import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../theme';
import { useAppStore } from '../state';
import {
  ScreenWrapper, PrimaryButton, SubjectChip, StatusPill, Card } from '../components';

export default function ExamsAvailabilityScreen({ navigation }: { navigation: any }) {
  const theme = useTheme();
  const { exams, subjects, setOnboarded } = useAppStore();

  const getSubject = (subjectId: string) => subjects.find((s) => s.id === subjectId);

  const getDaysUntil = (dateStr: string) => {
    const now = new Date('2026-03-05');
    const exam = new Date(dateStr);
    return Math.ceil((exam.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  };

  const stepIndex = 2;

  return (
    <ScreenWrapper>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Progress Stepper */}
        <View style={styles.stepper}>
          {[0, 1, 2].map((i) => (
            <View
              key={i}
              style={[
                styles.stepDot,
                {
                  backgroundColor: i <= stepIndex ? theme.accent.violet : theme.colors.divider,
                  width: i === stepIndex ? 24 : 8,
                },
              ]}
            />
          ))}
        </View>

        <Text style={[theme.typography.caption, { color: theme.colors.textSecondary, textAlign: 'center', marginTop: 8 }]}>
          Step 3 of 3
        </Text>

        <Text style={[theme.typography.h1, styles.title, { color: theme.colors.textPrimary }]}>
          When are your exams?
        </Text>
        <Text style={[theme.typography.body, { color: theme.colors.textSecondary, textAlign: 'center', marginBottom: 24 }]}>
          We'll create a smart study plan around them.
        </Text>

        {/* Exam Cards */}
        {exams.map((exam) => {
          const subject = getSubject(exam.subjectId);
          const daysLeft = getDaysUntil(exam.date);
          const pillVariant = daysLeft <= 7 ? 'error' : daysLeft <= 14 ? 'warning' : 'info';

          return (
            <Card key={exam.id} style={styles.examCard}>
              <View style={styles.examCardHeader}>
                {subject && (
                  <SubjectChip
                    name={subject.name}
                    color={subject.color}
                    small
                    style={{ alignSelf: 'flex-start', flexShrink: 0 }}
                  />
                )}
                <StatusPill
                  label={`${daysLeft}d left`}
                  variant={pillVariant}
                  style={{ flexShrink: 0 }}
                />
              </View>
              <Text style={[theme.typography.h3, { color: theme.colors.textPrimary, marginTop: 8 }]}>
                {exam.title}
              </Text>
              <View style={styles.examMeta}>
                <MaterialIcons name="event" size={14} color={theme.colors.textSecondary} />
                <Text style={[theme.typography.caption, { color: theme.colors.textSecondary, marginLeft: 4 }]}>
                  {new Date(exam.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                  {exam.time ? ` at ${exam.time}` : ''}
                </Text>
                {exam.location && (
                  <>
                    <MaterialIcons name="place" size={14} color={theme.colors.textSecondary} style={{ marginLeft: 12 }} />
                    <Text style={[theme.typography.caption, { color: theme.colors.textSecondary, marginLeft: 2 }]}>
                      {exam.location}
                    </Text>
                  </>
                )}
              </View>
            </Card>
          );
        })}

        {/* Add Exam Row */}
        <TouchableOpacity style={[styles.dashedRow, { borderColor: theme.colors.divider }]}>
          <MaterialIcons name="add" size={20} color={theme.accent.violet} />
          <Text style={[theme.typography.body, { color: theme.accent.violet, marginLeft: 8 }]}>
            Add Exam
          </Text>
        </TouchableOpacity>

        {/* Availability Section */}
        <View style={styles.availabilitySection}>
          <Text style={[theme.typography.h2, { color: theme.colors.textPrimary, marginBottom: 8 }]}>
            Study Availability
          </Text>
          <Text style={[theme.typography.caption, { color: theme.colors.textSecondary, marginBottom: 12 }]}>
            How many hours per day can you study?
          </Text>
          <View style={styles.availabilityRow}>
            {['1-2h', '2-4h', '4-6h', '6h+'].map((label) => (
              <TouchableOpacity
                key={label}
                style={[styles.availChip, { backgroundColor: theme.colors.elevated }]}
              >
                <Text style={[theme.typography.label, { color: theme.colors.textSecondary }]}>{label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={{ height: 24 }} />
      </ScrollView>

      {/* CTA */}
      <View style={[styles.ctaSection, { borderTopColor: theme.colors.divider }]}>
        <PrimaryButton
          title="Let's Go →"
          onPress={() => setOnboarded(true)}
        />
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingHorizontal: 24, paddingTop: 16, flexGrow: 1 },
  stepper: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8 },
  stepDot: { height: 8, borderRadius: 4 },
  title: { textAlign: 'center', marginTop: 24, marginBottom: 8 },
  examCard: { marginBottom: 12 },
  examCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  examMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  dashedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    marginBottom: 24,
  },
  availabilitySection: {
    marginTop: 8,
  },
  availabilityRow: {
    flexDirection: 'row',
    gap: 10,
  },
  availChip: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 9999,
  },
  ctaSection: {
    paddingHorizontal: 24,
    paddingBottom: 16,
    paddingTop: 12,
    borderTopWidth: 1,
  },
});
