/**
 * Global Quick Add Modal
 * Natural language task input with simple parsing.
 */
import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity, Modal,
  KeyboardAvoidingView, Platform, Keyboard,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import Animated, {
  useSharedValue, useAnimatedStyle, withSpring, withTiming,
  FadeIn, FadeOut, SlideInDown, SlideOutDown,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../app/theme';
import { useAppStore } from '../../app/state';
import { Task } from '../../types';

interface QuickAddModalProps {
  visible: boolean;
  onClose: () => void;
}

// Simple natural language parser
function parseTaskInput(input: string, subjects: { id: string; name: string }[]): Partial<Task> {
  const lower = input.toLowerCase();
  const result: Partial<Task> = {
    title: input,
    type: 'homework',
    priority: 'medium',
    estimatedMinutes: 30,
  };

  // Match subject
  for (const sub of subjects) {
    if (lower.includes(sub.name.toLowerCase())) {
      result.subjectId = sub.id;
      break;
    }
  }

  // Match priority
  if (lower.includes('urgent') || lower.includes('important') || lower.includes('asap')) {
    result.priority = 'high';
  } else if (lower.includes('low priority') || lower.includes('optional')) {
    result.priority = 'low';
  }

  // Match duration
  const durMatch = lower.match(/(\d+)\s*(?:min(?:ute)?s?|hrs?|hours?)/);
  if (durMatch) {
    let mins = parseInt(durMatch[1], 10);
    if (lower.includes('hour') || lower.includes('hr')) mins *= 60;
    result.estimatedMinutes = mins;
  }

  // Match due date
  const today = new Date(2026, 2, 5); // March 5, 2026
  if (lower.includes('today')) {
    result.dueDate = formatDate(today);
  } else if (lower.includes('tomorrow')) {
    const tmr = new Date(today);
    tmr.setDate(tmr.getDate() + 1);
    result.dueDate = formatDate(tmr);
  } else if (lower.includes('next week')) {
    const nw = new Date(today);
    nw.setDate(nw.getDate() + 7);
    result.dueDate = formatDate(nw);
  } else {
    // Default to tomorrow
    const tmr = new Date(today);
    tmr.setDate(tmr.getDate() + 1);
    result.dueDate = formatDate(tmr);
  }

  // Match time
  const timeMatch = lower.match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)/);
  if (timeMatch) {
    let hour = parseInt(timeMatch[1], 10);
    const min = timeMatch[2] ? parseInt(timeMatch[2], 10) : 0;
    if (timeMatch[3] === 'pm' && hour < 12) hour += 12;
    if (timeMatch[3] === 'am' && hour === 12) hour = 0;
    result.dueTime = `${String(hour).padStart(2, '0')}:${String(min).padStart(2, '0')}`;
  }

  // Match type
  if (lower.includes('study') || lower.includes('review') || lower.includes('read')) {
    result.type = 'study';
  } else if (lower.includes('project') || lower.includes('essay')) {
    result.type = 'project';
  }

  return result;
}

function formatDate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export default function QuickAddModal({ visible, onClose }: QuickAddModalProps) {
  const theme = useTheme();
  const { subjects, addTask } = useAppStore();
  const [text, setText] = useState('');
  const [preview, setPreview] = useState<Partial<Task> | null>(null);
  const [success, setSuccess] = useState(false);
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    if (visible) {
      setTimeout(() => inputRef.current?.focus(), 300);
    } else {
      setText('');
      setPreview(null);
      setSuccess(false);
    }
  }, [visible]);

  useEffect(() => {
    if (text.length > 3) {
      setPreview(parseTaskInput(text, subjects));
    } else {
      setPreview(null);
    }
  }, [text, subjects]);

  const handleAdd = () => {
    if (!text.trim()) return;
    const parsed = parseTaskInput(text, subjects);
    const newTask: Task = {
      id: `t_qa_${Date.now()}`,
      title: parsed.title || text,
      subjectId: parsed.subjectId || subjects[0]?.id || '',
      type: parsed.type || 'homework',
      status: 'pending',
      priority: parsed.priority || 'medium',
      dueDate: parsed.dueDate || formatDate(new Date(2026, 2, 6)),
      dueTime: parsed.dueTime,
      estimatedMinutes: parsed.estimatedMinutes || 30,
    };
    addTask(newTask);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    setSuccess(true);
    setTimeout(() => {
      onClose();
    }, 1200);
  };

  const matchedSubject = preview?.subjectId ? subjects.find((s) => s.id === preview.subjectId) : null;

  const priorityColors: Record<string, string> = {
    high: theme.accent.coral,
    medium: theme.accent.amber,
    low: theme.accent.mint,
  };

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <Animated.View entering={FadeIn.duration(200)} exiting={FadeOut.duration(200)} style={styles.overlay}>
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.kav}
        >
          <Animated.View
            entering={SlideInDown.springify().damping(20).stiffness(200)}
            exiting={SlideOutDown.duration(200)}
            style={[styles.sheet, { backgroundColor: theme.colors.card }]}
          >
            {success ? (
              /* Success State */
              <Animated.View entering={FadeIn} style={styles.successWrap}>
                <View style={[styles.successIcon, { backgroundColor: theme.accent.mint + '22' }]}>
                  <MaterialIcons name="check-circle" size={48} color={theme.accent.mint} />
                </View>
                <Text style={[theme.typography.h2, { color: theme.colors.textPrimary, marginTop: 12 }]}>
                  Task Added!
                </Text>
                <Text style={[theme.typography.caption, { color: theme.colors.textSecondary }]}>
                  "{text.substring(0, 40)}{text.length > 40 ? '...' : ''}"
                </Text>
              </Animated.View>
            ) : (
              <>
                {/* Handle */}
                <View style={[styles.handle, { backgroundColor: theme.colors.divider }]} />

                {/* Title */}
                <View style={styles.titleRow}>
                  <MaterialIcons name="flash-on" size={22} color={theme.accent.violet} />
                  <Text style={[theme.typography.h2, { color: theme.colors.textPrimary, marginLeft: 8 }]}>
                    Quick Add
                  </Text>
                </View>

                {/* Input */}
                <View style={[styles.inputWrap, { backgroundColor: theme.colors.elevated }]}>
                  <TextInput
                    ref={inputRef}
                    style={[styles.input, { color: theme.colors.textPrimary }]}
                    value={text}
                    onChangeText={setText}
                    placeholder="e.g. Chemistry homework tomorrow 5pm"
                    placeholderTextColor={theme.colors.textSecondary + '88'}
                    multiline
                    maxLength={200}
                    returnKeyType="done"
                    onSubmitEditing={handleAdd}
                    blurOnSubmit
                  />
                </View>

                {/* Preview */}
                {preview && (
                  <Animated.View entering={FadeIn.duration(200)} style={styles.previewWrap}>
                    <Text style={[theme.typography.label, { color: theme.colors.textSecondary, marginBottom: 8 }]}>
                      DETECTED
                    </Text>
                    <View style={styles.previewChips}>
                      {matchedSubject && (
                        <View style={[styles.previewChip, { backgroundColor: matchedSubject.color + '22' }]}>
                          <View style={[styles.chipDot, { backgroundColor: matchedSubject.color }]} />
                          <Text style={[styles.chipText, { color: matchedSubject.color }]}>
                            {matchedSubject.name}
                          </Text>
                        </View>
                      )}
                      {preview.dueDate && (
                        <View style={[styles.previewChip, { backgroundColor: theme.accent.sky + '22' }]}>
                          <MaterialIcons name="event" size={12} color={theme.accent.sky} />
                          <Text style={[styles.chipText, { color: theme.accent.sky }]}>
                            {preview.dueDate === formatDate(new Date(2026, 2, 5)) ? 'Today' :
                             preview.dueDate === formatDate(new Date(2026, 2, 6)) ? 'Tomorrow' :
                             preview.dueDate}
                          </Text>
                        </View>
                      )}
                      {preview.dueTime && (
                        <View style={[styles.previewChip, { backgroundColor: theme.accent.amber + '22' }]}>
                          <MaterialIcons name="schedule" size={12} color={theme.accent.amber} />
                          <Text style={[styles.chipText, { color: theme.accent.amber }]}>
                            {preview.dueTime}
                          </Text>
                        </View>
                      )}
                      {preview.estimatedMinutes && preview.estimatedMinutes !== 30 && (
                        <View style={[styles.previewChip, { backgroundColor: theme.accent.mint + '22' }]}>
                          <MaterialIcons name="timer" size={12} color={theme.accent.mint} />
                          <Text style={[styles.chipText, { color: theme.accent.mint }]}>
                            {preview.estimatedMinutes} min
                          </Text>
                        </View>
                      )}
                      <View style={[styles.previewChip, { backgroundColor: priorityColors[preview.priority || 'medium'] + '22' }]}>
                        <Text style={[styles.chipText, { color: priorityColors[preview.priority || 'medium'] }]}>
                          {preview.priority}
                        </Text>
                      </View>
                    </View>
                  </Animated.View>
                )}

                {/* Add Button */}
                <TouchableOpacity
                  style={[
                    styles.addBtn,
                    { backgroundColor: text.trim() ? theme.accent.violet : theme.colors.elevated },
                  ]}
                  onPress={handleAdd}
                  disabled={!text.trim()}
                  activeOpacity={0.8}
                >
                  <MaterialIcons name="add" size={22} color={text.trim() ? '#FFF' : theme.colors.textSecondary} />
                  <Text style={{
                    fontSize: 16, fontWeight: '700', marginLeft: 8,
                    color: text.trim() ? '#FFF' : theme.colors.textSecondary,
                  }}>
                    Add Task
                  </Text>
                </TouchableOpacity>

                {/* Examples */}
                <View style={styles.examplesWrap}>
                  <Text style={[theme.typography.caption, { color: theme.colors.textSecondary, marginBottom: 6 }]}>
                    TRY SAYING
                  </Text>
                  {['Chemistry homework tomorrow 5pm', 'Study math 30 minutes tonight', 'Biology project next week urgent'].map((ex) => (
                    <TouchableOpacity key={ex} onPress={() => setText(ex)} style={styles.exampleRow}>
                      <MaterialIcons name="format-quote" size={14} color={theme.colors.textSecondary + '55'} />
                      <Text style={[theme.typography.caption, { color: theme.colors.textSecondary, marginLeft: 6, fontStyle: 'italic' }]}>
                        {ex}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </>
            )}
          </Animated.View>
        </KeyboardAvoidingView>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1 },
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' },
  kav: { justifyContent: 'flex-end' },
  sheet: {
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    paddingHorizontal: 20, paddingBottom: 40, paddingTop: 12,
  },
  handle: { width: 36, height: 4, borderRadius: 2, alignSelf: 'center', marginBottom: 16 },
  titleRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  inputWrap: { borderRadius: 16, paddingHorizontal: 16, paddingVertical: 14, minHeight: 52 },
  input: { fontSize: 16, lineHeight: 22, padding: 0 },
  previewWrap: { marginTop: 16 },
  previewChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  previewChip: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 10, paddingVertical: 5, borderRadius: 9999,
  },
  chipDot: { width: 6, height: 6, borderRadius: 3 },
  chipText: { fontSize: 12, fontWeight: '600' },
  addBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: 16, borderRadius: 9999, marginTop: 20,
  },
  examplesWrap: { marginTop: 20 },
  exampleRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 4 },
  successWrap: { alignItems: 'center', paddingVertical: 32 },
  successIcon: { width: 80, height: 80, borderRadius: 40, alignItems: 'center', justifyContent: 'center' },
});
