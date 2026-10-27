import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../theme';
import { useAppStore } from '../state';
import {
  ScreenWrapper, PrimaryButton, FlatButton, GhostButton } from '../components';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function ClassScheduleScreen({ navigation }: { navigation: any }) {
  const theme = useTheme();
  const { classSessions, subjects } = useAppStore();

  const getSubjectColor = (subjectId: string) =>
    subjects.find((s) => s.id === subjectId)?.color ?? theme.accent.violet;

  const getSubjectName = (subjectId: string) =>
    subjects.find((s) => s.id === subjectId)?.name ?? '';

  const parseHour = (time: string) => parseInt(time.split(':')[0], 10);

  const stepIndex = 1;

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
          Step 2 of 3
        </Text>

        <Text style={[theme.typography.h1, styles.title, { color: theme.colors.textPrimary }]}>
          When are your classes?
        </Text>
        <Text style={[theme.typography.body, { color: theme.colors.textSecondary, textAlign: 'center', marginBottom: 24 }]}>
          We'll build your weekly timetable.
        </Text>

        {/* Mini Timetable */}
        <View style={[styles.timetableCard, { backgroundColor: theme.colors.card }]}>
          {/* Day Headers */}
          <View style={styles.dayHeaderRow}>
            <View style={{ width: 36 }} />
            {DAYS.map((day) => (
              <View key={day} style={styles.dayHeaderCell}>
                <Text style={[theme.typography.caption, { color: theme.colors.textSecondary, textAlign: 'center' }]}>
                  {day}
                </Text>
              </View>
            ))}
          </View>

          {/* Time Grid - 8am to 6pm */}
          {Array.from({ length: 11 }, (_, i) => i + 8).map((hour) => (
            <View key={hour} style={[styles.gridRow, { borderBottomColor: theme.colors.divider }]}>
              <Text style={[theme.typography.caption, styles.timeLabel, { color: theme.colors.textSecondary }]}>
                {hour > 12 ? `${hour - 12}p` : `${hour}a`}
              </Text>
              {DAYS.map((_, dayIndex) => {
                const session = classSessions.find(
                  (c) => c.day === dayIndex && parseHour(c.startTime) === hour,
                );
                if (session) {
                  const color = getSubjectColor(session.subjectId);
                  return (
                    <View key={dayIndex} style={styles.dayCell}>
                      <View style={[styles.classBlock, { backgroundColor: color + '33', borderLeftColor: color }]}>
                        <Text style={[{ fontSize: 8, color, fontWeight: '600' }]} numberOfLines={1}>
                          {getSubjectName(session.subjectId).slice(0, 4)}
                        </Text>
                      </View>
                    </View>
                  );
                }
                return <View key={dayIndex} style={styles.dayCell} />;
              })}
            </View>
          ))}
        </View>

        {/* Add Class Button */}
        <GhostButton
          title="+ Add Class"
          onPress={() => {}}
          style={{ marginTop: 16, alignSelf: 'center' }}
        />

        <View style={{ flex: 1 }} />
      </ScrollView>

      {/* CTAs */}
      <View style={[styles.ctaSection, { borderTopColor: theme.colors.divider }]}>
        <PrimaryButton
          title="Continue"
          onPress={() => navigation.navigate('ExamsAvailability')}
        />
        <FlatButton
          title="Skip for now"
          onPress={() => navigation.navigate('ExamsAvailability')}
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
  timetableCard: {
    borderRadius: 16,
    padding: 8,
    overflow: 'hidden',
  },
  dayHeaderRow: {
    flexDirection: 'row',
    paddingBottom: 8,
  },
  dayHeaderCell: {
    flex: 1,
    alignItems: 'center',
  },
  gridRow: {
    flexDirection: 'row',
    height: 28,
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  timeLabel: {
    width: 36,
    fontSize: 9,
    textAlign: 'right',
    paddingRight: 4,
  },
  dayCell: {
    flex: 1,
    height: '100%',
    paddingHorizontal: 1,
    justifyContent: 'center',
  },
  classBlock: {
    borderRadius: 4,
    borderLeftWidth: 2,
    paddingHorizontal: 3,
    paddingVertical: 2,
    height: '90%',
    justifyContent: 'center',
  },
  ctaSection: {
    paddingHorizontal: 24,
    paddingBottom: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    gap: 4,
  },
});
