import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../theme';
import { useAppStore } from '../state';
import {
  ScreenWrapper,
  PrimaryButton,
  Card,
  SectionHeader,
  SubjectChip,
  AnimatedCheckbox,
  StatusPill,
} from '../components';

export default function ExamDetailScreen({ navigation, route }: { navigation: any; route: any }) {
  const theme = useTheme();
  const { exams, subjects, tasks, toggleExamTopic } = useAppStore();

  const examId = route?.params?.examId ?? 'e1';
  const exam = exams.find((e) => e.id === examId) ?? exams[0];
  const subject = subjects.find((s) => s.id === exam.subjectId);

  const completedCount = exam.topics.filter((t) => t.completed).length;
  const totalTopics = exam.topics.length;
  const progress = totalTopics > 0 ? completedCount / totalTopics : 0;

  const daysUntil = Math.ceil(
    (new Date(exam.date).getTime() - new Date('2026-03-05').getTime()) / (1000 * 60 * 60 * 24),
  );

  // Linked prep tasks (tasks for same subject)
  const linkedTasks = tasks.filter((t) => t.subjectId === exam.subjectId && t.status !== 'completed');

  return (
    <ScreenWrapper edges={['top', 'bottom']}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: theme.colors.divider }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
          <MaterialIcons name="arrow-back" size={24} color={theme.colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[theme.typography.h2, { color: theme.colors.textPrimary, flex: 1, marginLeft: 12 }]} numberOfLines={1}>
          {exam.title}
        </Text>
        {subject && <SubjectChip name={subject.name} color={subject.color} style={{ flexShrink: 0 }} />}
        <TouchableOpacity
          style={{ marginLeft: 8 }}
          onPress={() => navigation.navigate('EditExam', { examId: exam.id })}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <MaterialIcons name="edit" size={20} color={theme.colors.textSecondary} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Countdown Hero */}
        <Card variant="hero" style={styles.heroCard}>
          <Text style={[theme.typography.caption, { color: '#EAEAF5' + 'AA', letterSpacing: 2, textTransform: 'uppercase' }]}>
            Countdown
          </Text>
          <Text style={[theme.typography.hero, { color: '#EAEAF5', fontSize: 56, lineHeight: 64 }]}>
            {daysUntil}
          </Text>
          <Text style={[theme.typography.label, { color: '#EAEAF5' + 'BB' }]}>
            DAYS REMAINING
          </Text>
          <View style={styles.heroMeta}>
            <MaterialIcons name="event" size={14} color="#EAEAF5AA" />
            <Text style={[theme.typography.caption, { color: '#EAEAF5' + 'AA', marginLeft: 4 }]}>
              {new Date(exam.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              {exam.time ? ` at ${exam.time}` : ''}
            </Text>
          </View>
          {exam.location && (
            <View style={[styles.heroMeta, { marginTop: 2 }]}>
              <MaterialIcons name="place" size={14} color="#EAEAF5AA" />
              <Text style={[theme.typography.caption, { color: '#EAEAF5' + 'AA', marginLeft: 4 }]}>
                {exam.location}
              </Text>
            </View>
          )}
        </Card>

        {/* Progress Bar */}
        <Card style={styles.progressCard}>
          <View style={styles.progressHeader}>
            <Text style={[theme.typography.h3, { color: theme.colors.textPrimary }]}>Topics Progress</Text>
            <Text style={[theme.typography.label, { color: theme.accent.violet }]}>
              {completedCount}/{totalTopics}
            </Text>
          </View>
          <View style={[styles.progressTrack, { backgroundColor: theme.colors.elevated }]}>
            <View
              style={[
                styles.progressFill,
                {
                  backgroundColor: theme.accent.violet,
                  width: `${progress * 100}%` as any,
                },
              ]}
            />
          </View>
          <Text style={[theme.typography.caption, { color: theme.colors.textSecondary, marginTop: 6 }]}>
            {Math.round(progress * 100)}% complete
          </Text>
        </Card>

        {/* Topics Checklist */}
        <SectionHeader title="Topics Checklist" />
        {exam.topics.map((topic) => (
          <TouchableOpacity
            key={topic.id}
            style={[styles.topicRow, { backgroundColor: theme.colors.card }]}
            activeOpacity={0.7}
            onPress={() => toggleExamTopic(exam.id, topic.id)}
          >
            <AnimatedCheckbox
              checked={topic.completed}
              onToggle={() => toggleExamTopic(exam.id, topic.id)}
            />
            <Text
              style={[
                theme.typography.body,
                {
                  color: topic.completed ? theme.colors.textSecondary : theme.colors.textPrimary,
                  textDecorationLine: topic.completed ? 'line-through' : 'none',
                  flex: 1,
                  marginLeft: 12,
                },
              ]}
            >
              {topic.label}
            </Text>
            {topic.completed && (
              <MaterialIcons name="check-circle" size={18} color={theme.accent.mint} style={{ flexShrink: 0 }} />
            )}
          </TouchableOpacity>
        ))}

        {/* Linked Prep Tasks */}
        <SectionHeader title="Linked Prep Tasks" />
        {linkedTasks.length > 0 ? (
          linkedTasks.map((task) => (
            <Card key={task.id} style={styles.linkedTaskRow}>
              <View style={[styles.priorityDot, {
                backgroundColor: task.priority === 'high' ? theme.accent.coral
                  : task.priority === 'medium' ? theme.accent.amber : theme.accent.mint,
              }]} />
              <View style={{ flex: 1 }}>
                <Text style={[theme.typography.body, { color: theme.colors.textPrimary }]} numberOfLines={1}>
                  {task.title}
                </Text>
                <Text style={[theme.typography.caption, { color: theme.colors.textSecondary }]}>
                  Due {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </Text>
              </View>
              <StatusPill
                label={task.status === 'overdue' ? 'Overdue' : task.priority}
                variant={task.status === 'overdue' ? 'error' : 'neutral'}
                style={{ flexShrink: 0 }}
              />
            </Card>
          ))
        ) : (
          <Card style={{ alignItems: 'center', paddingVertical: 20 }}>
            <Text style={[theme.typography.body, { color: theme.colors.textSecondary }]}>
              No linked prep tasks
            </Text>
          </Card>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Sticky CTA */}
      <View style={[styles.stickyFooter, { backgroundColor: theme.colors.background, borderTopColor: theme.colors.divider }]}>
        <PrimaryButton
          title="Build Exam Plan ✨"
          onPress={() => navigation.navigate('AIPlanReview')}
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
  scrollContent: { paddingHorizontal: 16, paddingTop: 16 },
  heroCard: {
    alignItems: 'center',
    paddingVertical: 28,
  },
  heroMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  progressCard: {
    marginTop: 16,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  progressTrack: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  topicRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    marginBottom: 6,
  },
  linkedTaskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 12,
  },
  priorityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    flexShrink: 0,
  },
  stickyFooter: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
  },
});
