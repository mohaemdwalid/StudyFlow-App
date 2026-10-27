import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../theme';
import { useAppStore } from '../state';
import {
  ScreenWrapper,
  PrimaryButton,
  Card,
  SubjectChip,
  StatusPill,
  SectionHeader,
  SegmentedControl,
} from '../components';

const PRIORITIES = ['Low', 'Medium', 'High'];

export default function TaskDetailScreen({ navigation, route }: { navigation: any; route: any }) {
  const theme = useTheme();
  const { tasks, subjects, focusSessions, toggleTaskStatus } = useAppStore();

  const taskId = route?.params?.taskId ?? 't1';
  const task = tasks.find((t) => t.id === taskId) ?? tasks[0];
  const subject = subjects.find((s) => s.id === task.subjectId);

  const relatedSessions = focusSessions.filter((f) => f.taskId === task.id);

  const priorityIndex = PRIORITIES.findIndex((p) => p.toLowerCase() === task.priority);
  const [selectedPriority, setSelectedPriority] = useState(priorityIndex >= 0 ? priorityIndex : 1);
  const [showSessions, setShowSessions] = useState(false);
  const [duration, setDuration] = useState(task.estimatedMinutes);

  const statusVariant = task.status === 'completed' ? 'success'
    : task.status === 'overdue' ? 'error' : 'info';

  return (
    <ScreenWrapper>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: theme.colors.divider }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
          <MaterialIcons name="arrow-back" size={24} color={theme.colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[theme.typography.h2, { color: theme.colors.textPrimary, flex: 1, marginHorizontal: 12 }]} numberOfLines={1}>
          {task.title}
        </Text>
        <TouchableOpacity
          style={[styles.editChip, { backgroundColor: theme.colors.elevated }]}
          onPress={() => navigation.navigate('EditTask', { task })}
        >
          <Text style={[theme.typography.label, { color: theme.accent.violet }]}>Edit</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Subject */}
        <View style={styles.metaRow}>
          <Text style={[theme.typography.label, styles.metaLabel, { color: theme.colors.textSecondary }]}>Subject</Text>
          {subject && <SubjectChip name={subject.name} color={subject.color} style={{ flexShrink: 0 }} />}
        </View>

        {/* Status */}
        <View style={styles.metaRow}>
          <Text style={[theme.typography.label, styles.metaLabel, { color: theme.colors.textSecondary }]}>Status</Text>
          <StatusPill
            label={task.status.charAt(0).toUpperCase() + task.status.slice(1)}
            variant={statusVariant}
            style={{ flexShrink: 0 }}
          />
        </View>

        {/* Priority */}
        <View style={styles.metaRow}>
          <Text style={[theme.typography.label, styles.metaLabel, { color: theme.colors.textSecondary }]}>Priority</Text>
          <View style={{ flex: 1 }}>
            <SegmentedControl
              segments={PRIORITIES}
              selected={selectedPriority}
              onSelect={setSelectedPriority}
            />
          </View>
        </View>

        {/* Due Date */}
        <View style={styles.metaRow}>
          <Text style={[theme.typography.label, styles.metaLabel, { color: theme.colors.textSecondary }]}>Due</Text>
          <View style={[styles.dateBadge, { backgroundColor: theme.colors.elevated }]}>
            <MaterialIcons name="event" size={16} color={theme.colors.textSecondary} />
            <Text style={[theme.typography.body, { color: theme.colors.textPrimary, marginLeft: 6 }]}>
              {new Date(task.dueDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
              {task.dueTime ? ` at ${task.dueTime}` : ''}
            </Text>
          </View>
        </View>

        {/* Duration Stepper */}
        <View style={styles.metaRow}>
          <Text style={[theme.typography.label, styles.metaLabel, { color: theme.colors.textSecondary }]}>Duration</Text>
          <View style={styles.stepperRow}>
            <TouchableOpacity
              onPress={() => setDuration((d) => Math.max(5, d - 5))}
              style={[styles.stepperBtn, { backgroundColor: theme.colors.elevated }]}
            >
              <MaterialIcons name="remove" size={18} color={theme.colors.textPrimary} />
            </TouchableOpacity>
            <Text style={[theme.typography.h3, { color: theme.colors.textPrimary, marginHorizontal: 16 }]}>
              {duration} min
            </Text>
            <TouchableOpacity
              onPress={() => setDuration((d) => d + 5)}
              style={[styles.stepperBtn, { backgroundColor: theme.colors.elevated }]}
            >
              <MaterialIcons name="add" size={18} color={theme.colors.textPrimary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Divider */}
        <View style={[styles.divider, { backgroundColor: theme.colors.divider }]} />

        {/* Notes */}
        <Text style={[theme.typography.h3, { color: theme.colors.textPrimary, marginBottom: 8 }]}>Notes</Text>
        <Card variant="secondary" style={{ minHeight: 100 }}>
          <Text style={[theme.typography.body, { color: task.notes ? theme.colors.textPrimary : theme.colors.textSecondary }]}>
            {task.notes || 'No notes added yet. Tap to add some.'}
          </Text>
        </Card>

        {/* Related Focus Sessions */}
        <TouchableOpacity
          style={styles.accordionHeader}
          onPress={() => setShowSessions(!showSessions)}
          activeOpacity={0.7}
        >
          <Text style={[theme.typography.h3, { color: theme.colors.textPrimary, flex: 1 }]}>
            Related Focus Sessions
          </Text>
          <View style={styles.sessionBadge}>
            <Text style={[theme.typography.caption, { color: theme.accent.violet }]}>
              {relatedSessions.length}
            </Text>
          </View>
          <MaterialIcons
            name={showSessions ? 'expand-less' : 'expand-more'}
            size={24}
            color={theme.colors.textSecondary}
          />
        </TouchableOpacity>

        {showSessions && (
          <View style={{ gap: 8 }}>
            {relatedSessions.length > 0 ? (
              relatedSessions.map((session) => (
                <Card key={session.id} variant="secondary" style={styles.sessionRow}>
                  <MaterialIcons name="timer" size={16} color={theme.accent.violet} />
                  <Text style={[theme.typography.body, { color: theme.colors.textPrimary, flex: 1, marginLeft: 8 }]}>
                    {session.duration} min
                  </Text>
                  <Text style={[theme.typography.caption, { color: theme.colors.textSecondary, flexShrink: 0 }]}>
                    {new Date(session.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </Text>
                  {session.quality && (
                    <View style={styles.qualityStars}>
                      {Array.from({ length: 5 }, (_, i) => (
                        <MaterialIcons
                          key={i}
                          name={i < session.quality! ? 'star' : 'star-outline'}
                          size={12}
                          color={theme.accent.amber}
                        />
                      ))}
                    </View>
                  )}
                </Card>
              ))
            ) : (
              <Text style={[theme.typography.body, { color: theme.colors.textSecondary, paddingLeft: 4 }]}>
                No focus sessions yet for this task.
              </Text>
            )}
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Sticky CTA */}
      <View style={[styles.stickyFooter, { backgroundColor: theme.colors.background, borderTopColor: theme.colors.divider }]}>
        <PrimaryButton
          title="Start Focus →"
          onPress={() => navigation.navigate('FocusTimer')}
          icon="play-arrow"
        />
      </View>
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
  editChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 9999,
    flexShrink: 0,
  },
  scrollContent: { paddingHorizontal: 16, paddingTop: 16 },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    minHeight: 44,
  },
  metaLabel: {
    width: 80,
    flexShrink: 0,
  },
  dateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepperBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  divider: {
    height: 1,
    marginVertical: 20,
  },
  accordionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 12,
    paddingVertical: 8,
  },
  sessionBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginRight: 4,
  },
  sessionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  qualityStars: {
    flexDirection: 'row',
    marginLeft: 8,
    flexShrink: 0,
  },
  stickyFooter: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
  },
});
