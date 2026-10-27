import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../theme';
import { useAppStore } from '../state';
import {
  ScreenWrapper,
  SegmentedControl,
  FilterChipRow,
  Card,
  AnimatedCheckbox,
  SubjectChip,
  StatusPill,
} from '../components';

type Filter = 'Today' | 'Upcoming' | 'Overdue' | 'Completed';

export default function PlannerTasksScreen({ navigation }: { navigation: any }) {
  const theme = useTheme();
  const { tasks, subjects, toggleTaskStatus } = useAppStore();
  const [segmentIndex, setSegmentIndex] = useState(2); // Tasks active
  const [filter, setFilter] = useState<Filter>('Today');

  const getSubject = (id: string) => subjects.find((s) => s.id === id);

  const filteredTasks = tasks.filter((t) => {
    switch (filter) {
      case 'Today':
        return t.dueDate === '2026-03-05' && t.status !== 'completed';
      case 'Upcoming':
        return t.dueDate > '2026-03-05' && t.status !== 'completed';
      case 'Overdue':
        return t.status === 'overdue';
      case 'Completed':
        return t.status === 'completed';
      default:
        return true;
    }
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return theme.accent.coral;
      case 'medium': return theme.accent.amber;
      default: return theme.accent.mint;
    }
  };

  return (
    <ScreenWrapper>
      {/* Segmented Control */}
      <View style={styles.segmentWrapper}>
        <SegmentedControl
          segments={['Timetable', 'Calendar', 'Tasks']}
          selected={segmentIndex}
          onSelect={(i) => {
            if (i === 0) navigation.navigate('PlannerTimetable');
            else setSegmentIndex(i);
          }}
        />
      </View>

      {/* Filter Row + Sort */}
      <View style={styles.filterSection}>
        <FilterChipRow
          options={['Today', 'Upcoming', 'Overdue', 'Completed']}
          selected={filter}
          onSelect={(opt) => setFilter(opt as Filter)}
        />
        <TouchableOpacity style={styles.sortButton}>
          <MaterialIcons name="sort" size={20} color={theme.colors.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* Task List */}
      <ScrollView contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false}>
        {filteredTasks.length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialIcons
              name={filter === 'Completed' ? 'emoji-events' : 'inbox'}
              size={48}
              color={theme.colors.divider}
            />
            <Text style={[theme.typography.body, { color: theme.colors.textSecondary, marginTop: 12 }]}>
              {filter === 'Completed' ? 'No completed tasks yet' : 'No tasks here'}
            </Text>
          </View>
        ) : (
          filteredTasks.map((task) => {
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
                      <Text style={[theme.typography.caption, { color: theme.colors.textSecondary, marginLeft: 8, flexShrink: 0 }]}>
                        Due {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.rightSection}>
                    <View style={[styles.priorityDot, { backgroundColor: getPriorityColor(task.priority) }]} />
                    {isOverdue && (
                      <StatusPill label="Overdue" variant="error" style={{ marginTop: 4, flexShrink: 0 }} />
                    )}
                  </View>
                </Card>
              </TouchableOpacity>
            );
          })
        )}

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* FAB - Add Task */}
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
  segmentWrapper: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 12 },
  filterSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
    gap: 8,
  },
  sortButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  listContent: { paddingHorizontal: 16 },
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
  rightSection: {
    alignItems: 'flex-end',
    flexShrink: 0,
  },
  priorityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
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
