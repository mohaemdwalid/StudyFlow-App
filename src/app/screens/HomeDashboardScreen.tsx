import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
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

export default function HomeDashboardScreen({ navigation }: { navigation: any }) {
  const theme = useTheme();
  const { subjects, tasks, classSessions, toggleTaskStatus } = useAppStore();

  // Fetch real user name
  const [userName, setUserName] = useState('');
  useEffect(() => {
    (async () => {
      try {
        const { authService } = require('../services');
        const user = await authService.getUser();
        const name = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Student';
        setUserName(name);
      } catch { setUserName('Student'); }
    })();
  }, []);

  // Dynamic greeting based on time of day
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  // Today's real date
  const today = new Date();
  const dateStr = today.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  const todayISO = today.toISOString().slice(0, 10);
  const todayDayIndex = today.getDay(); // 0=Sun, 1=Mon, ..., 6=Sat

  const getSubject = (id: string) => subjects.find((s) => s.id === id);

  // Today's tasks (sorted by due time / priority)
  const todayTasks = tasks.filter((t) => t.dueDate === todayISO || t.status === 'overdue');
  const pendingTasks = tasks.filter((t) => t.status === 'pending');

  const todayClasses = classSessions
    .filter((c) => c.day === todayDayIndex)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  const nextClass = todayClasses[0];
  const nextClassSubject = nextClass ? getSubject(nextClass.subjectId) : null;

  // Next due task
  const nextDue = pendingTasks.sort((a, b) => a.dueDate.localeCompare(b.dueDate))[0];
  const nextDueSubject = nextDue ? getSubject(nextDue.subjectId) : null;

  const isEmpty = tasks.length === 0;

  return (
    <ScreenWrapper>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <Text style={[theme.typography.h1, { color: theme.colors.textPrimary }]}>
              {greeting}, {userName} 👋
            </Text>
            <Text style={[theme.typography.caption, { color: theme.colors.textSecondary, marginTop: 4 }]}>
              {dateStr}
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.avatar, { backgroundColor: theme.accent.violet }]}
            onPress={() => navigation.navigate('Settings')}
          >
            <Text style={[theme.typography.label, { color: '#EAEAF5', fontSize: 16 }]}>{(userName || 'S')[0].toUpperCase()}</Text>
          </TouchableOpacity>
        </View>

        {isEmpty ? (
          /* Empty State */
          <View style={styles.emptyState}>
            <MaterialIcons name="wb-sunny" size={64} color={theme.colors.divider} />
            <Text style={[theme.typography.h2, { color: theme.colors.textPrimary, marginTop: 16 }]}>
              Nothing planned yet
            </Text>
            <Text style={[theme.typography.body, { color: theme.colors.textSecondary, textAlign: 'center', marginTop: 8 }]}>
              Add subjects, classes, and tasks to see your daily plan here.
            </Text>
            <PrimaryButton title="Get Started" onPress={() => { }} style={{ marginTop: 24 }} fullWidth={false} />
          </View>
        ) : (
          <>
            {/* Today Plan */}
            <SectionHeader title="Today's Plan" action={{ label: '📊 Analytics', onPress: () => navigation.navigate('Analytics') }} />

            {todayTasks.length > 0 ? (
              todayTasks.map((task) => {
                const subject = getSubject(task.subjectId);
                const isOverdue = task.status === 'overdue';
                const isCompleted = task.status === 'completed';

                return (
                  <TouchableOpacity
                    key={task.id}
                    activeOpacity={0.7}
                    onPress={() => navigation.navigate('TaskDetail', { taskId: task.id })}
                  >
                    <Card
                      style={[
                        styles.taskRow,
                        isOverdue ? { borderLeftWidth: 3, borderLeftColor: theme.accent.coral } : undefined,
                      ]}
                    >
                      <AnimatedCheckbox
                        checked={isCompleted}
                        onToggle={() => toggleTaskStatus(task.id)}
                      />
                      <View style={styles.taskContent}>
                        <Text
                          style={[
                            theme.typography.body,
                            {
                              color: isCompleted ? theme.colors.textSecondary : theme.colors.textPrimary,
                              textDecorationLine: isCompleted ? 'line-through' : 'none',
                            },
                          ]}
                          numberOfLines={1}
                        >
                          {task.title}
                        </Text>
                        <View style={styles.taskMeta}>
                          {subject && <SubjectChip name={subject.name} color={subject.color} small />}
                          {task.dueTime && (
                            <Text style={[theme.typography.caption, { color: theme.colors.textSecondary, marginLeft: 8 }]}>
                              {task.dueTime}
                            </Text>
                          )}
                        </View>
                      </View>
                      {isOverdue && (
                        <StatusPill label="Overdue" variant="error" style={{ flexShrink: 0 }} />
                      )}
                    </Card>
                  </TouchableOpacity>
                );
              })
            ) : (
              <Card style={{ alignItems: 'center', paddingVertical: 24 }}>
                <MaterialIcons name="check-circle" size={32} color={theme.accent.mint} />
                <Text style={[theme.typography.body, { color: theme.colors.textSecondary, marginTop: 8 }]}>
                  All caught up for today!
                </Text>
              </Card>
            )}

            {/* Quick Cards */}
            <View style={styles.quickCardsRow}>
              {/* Next Class */}
              <Card style={[styles.quickCard, { borderLeftWidth: 3, borderLeftColor: theme.accent.sky }]}>
                <Text style={[theme.typography.caption, { color: theme.accent.sky, fontWeight: '600' }]}>
                  NEXT CLASS
                </Text>
                {nextClass ? (
                  <>
                    <Text style={[theme.typography.h3, { color: theme.colors.textPrimary, marginTop: 4 }]} numberOfLines={1}>
                      {nextClassSubject?.name}
                    </Text>
                    <Text style={[theme.typography.caption, { color: theme.colors.textSecondary, marginTop: 2 }]}>
                      {nextClass.startTime} – {nextClass.endTime}
                    </Text>
                    {nextClass.location && (
                      <Text style={[theme.typography.caption, { color: theme.colors.textSecondary }]}>
                        {nextClass.location}
                      </Text>
                    )}
                  </>
                ) : (
                  <Text style={[theme.typography.body, { color: theme.colors.textSecondary, marginTop: 4 }]}>
                    No more classes today
                  </Text>
                )}
              </Card>

              {/* Next Due */}
              <Card style={[styles.quickCard, { borderLeftWidth: 3, borderLeftColor: theme.accent.amber }]}>
                <Text style={[theme.typography.caption, { color: theme.accent.amber, fontWeight: '600' }]}>
                  NEXT DUE
                </Text>
                {nextDue ? (
                  <>
                    <Text style={[theme.typography.h3, { color: theme.colors.textPrimary, marginTop: 4 }]} numberOfLines={1}>
                      {nextDue.title}
                    </Text>
                    <Text style={[theme.typography.caption, { color: theme.colors.textSecondary, marginTop: 2 }]}>
                      {new Date(nextDue.dueDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                    </Text>
                  </>
                ) : (
                  <Text style={[theme.typography.body, { color: theme.colors.textSecondary, marginTop: 4 }]}>
                    Nothing upcoming
                  </Text>
                )}
              </Card>
            </View>

            {/* Upcoming tasks preview */}
            <SectionHeader title="Upcoming" action={{ label: 'View all', onPress: () => navigation.navigate('PlannerTasks') }} />
            {pendingTasks.slice(0, 3).map((task) => {
              const subject = getSubject(task.subjectId);
              return (
                <Card key={task.id} style={styles.upcomingRow}>
                  <View style={[styles.priorityDot, {
                    backgroundColor: task.priority === 'high'
                      ? theme.accent.coral
                      : task.priority === 'medium'
                        ? theme.accent.amber
                        : theme.accent.mint,
                  }]} />
                  <View style={{ flex: 1 }}>
                    <Text style={[theme.typography.body, { color: theme.colors.textPrimary }]} numberOfLines={1}>
                      {task.title}
                    </Text>
                    <Text style={[theme.typography.caption, { color: theme.colors.textSecondary }]}>
                      Due {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </Text>
                  </View>
                  {subject && <SubjectChip name={subject.name} color={subject.color} small style={{ flexShrink: 0 }} />}
                </Card>
              );
            })}
          </>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: theme.accent.violet }, theme.shadows.glow]}
        onPress={() => navigation.navigate('EditTask')}
        activeOpacity={0.85}
      >
        <MaterialIcons name="add" size={28} color="#EAEAF5" />
      </TouchableOpacity>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingHorizontal: 16 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 8,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
    flexShrink: 0,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  taskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 12,
  },
  taskContent: {
    flex: 1,
    gap: 4,
  },
  taskMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quickCardsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  quickCard: {
    flex: 1,
  },
  upcomingRow: {
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
