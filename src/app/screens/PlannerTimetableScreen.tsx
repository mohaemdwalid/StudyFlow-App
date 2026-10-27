import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../theme';
import { useAppStore } from '../state';
import { ScreenWrapper, SegmentedControl } from '../components';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const HOURS = Array.from({ length: 16 }, (_, i) => i + 7); // 7am - 10pm
const HOUR_HEIGHT = 64;
const TIME_LABEL_WIDTH = 44;
const DAY_WIDTH = (SCREEN_WIDTH - 32 - TIME_LABEL_WIDTH) / 7;
const TODAY_INDEX = 3; // Thursday

export default function PlannerTimetableScreen({ navigation }: { navigation: any }) {
  const theme = useTheme();
  const { classSessions, subjects } = useAppStore();
  const [segmentIndex, setSegmentIndex] = useState(0);

  const getSubject = (id: string) => subjects.find((s) => s.id === id);

  const parseTime = (time: string) => {
    const [h, m] = time.split(':').map(Number);
    return h + m / 60;
  };

  const getBlockStyle = (startTime: string, endTime: string) => {
    const start = parseTime(startTime) - 7; // offset from 7am
    const end = parseTime(endTime) - 7;
    return {
      top: start * HOUR_HEIGHT,
      height: (end - start) * HOUR_HEIGHT,
    };
  };

  return (
    <ScreenWrapper>
      {/* Segmented Control */}
      <View style={styles.segmentWrapper}>
        <SegmentedControl
          segments={['Timetable', 'Calendar', 'Tasks']}
          selected={segmentIndex}
          onSelect={(i) => {
            if (i === 2) navigation.navigate('PlannerTasks');
            else setSegmentIndex(i);
          }}
        />
      </View>

      {/* Week Strip */}
      <View style={[styles.weekStrip, { borderBottomColor: theme.colors.divider }]}>
        <View style={{ width: TIME_LABEL_WIDTH }} />
        {DAYS.map((day, i) => {
          const isToday = i === TODAY_INDEX;
          return (
            <View key={day} style={[styles.dayHeader, { width: DAY_WIDTH }]}>
              <Text style={[theme.typography.caption, { color: isToday ? theme.accent.violet : theme.colors.textSecondary }]}>
                {day}
              </Text>
              <View style={[
                styles.dayNumber,
                isToday && { backgroundColor: theme.accent.violet },
              ]}>
                <Text style={[
                  theme.typography.label,
                  { color: isToday ? '#EAEAF5' : theme.colors.textPrimary, fontSize: 14 },
                ]}>
                  {3 + i}
                </Text>
              </View>
            </View>
          );
        })}
      </View>

      {/* Time Grid */}
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.grid}>
          {/* Time labels */}
          <View style={{ width: TIME_LABEL_WIDTH }}>
            {HOURS.map((hour) => (
              <View key={hour} style={{ height: HOUR_HEIGHT, justifyContent: 'flex-start' }}>
                <Text style={[theme.typography.caption, styles.timeLabel, { color: theme.colors.textSecondary }]}>
                  {hour > 12 ? `${hour - 12} PM` : hour === 12 ? '12 PM' : `${hour} AM`}
                </Text>
              </View>
            ))}
          </View>

          {/* Day Columns */}
          {DAYS.map((_, dayIndex) => (
            <View key={dayIndex} style={[styles.dayColumn, { width: DAY_WIDTH }]}>
              {/* Hour Lines */}
              {HOURS.map((hour) => (
                <View
                  key={hour}
                  style={[styles.hourLine, { borderTopColor: theme.colors.divider, height: HOUR_HEIGHT }]}
                />
              ))}

              {/* Class Blocks */}
              {classSessions
                .filter((c) => c.day === dayIndex)
                .map((session) => {
                  const subject = getSubject(session.subjectId);
                  const pos = getBlockStyle(session.startTime, session.endTime);
                  const color = subject?.color ?? theme.accent.violet;

                  return (
                    <TouchableOpacity
                      key={session.id}
                      style={[
                        styles.classBlock,
                        {
                          top: pos.top,
                          height: pos.height,
                          backgroundColor: color + '33',
                          borderLeftColor: color,
                        },
                      ]}
                      onPress={() => navigation.navigate('EditClass', { session })}
                      activeOpacity={0.75}
                    >
                      <Text style={[{ fontSize: 10, fontWeight: '600', color }]} numberOfLines={1}>
                        {subject?.name ?? ''}
                      </Text>
                      <Text style={[{ fontSize: 8, color: color + 'AA' }]} numberOfLines={1}>
                        {session.location ?? ''}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
            </View>
          ))}
        </View>
      </ScrollView>

      {/* FAB - Add Class */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('EditClass')}
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
  weekStrip: {
    flexDirection: 'row',
    paddingBottom: 8,
    borderBottomWidth: 1,
    paddingHorizontal: 16,
  },
  dayHeader: {
    alignItems: 'center',
    gap: 4,
  },
  dayNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  grid: {
    flexDirection: 'row',
    paddingHorizontal: 16,
  },
  timeLabel: {
    fontSize: 10,
    textAlign: 'right',
    paddingRight: 6,
    marginTop: -6,
  },
  dayColumn: {
    position: 'relative',
  },
  hourLine: {
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  classBlock: {
    position: 'absolute',
    left: 2,
    right: 2,
    borderRadius: 6,
    borderLeftWidth: 3,
    paddingHorizontal: 4,
    paddingVertical: 3,
    justifyContent: 'center',
    overflow: 'hidden',
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#6C63FF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#6C63FF',
    shadowOpacity: 0.5,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
});
