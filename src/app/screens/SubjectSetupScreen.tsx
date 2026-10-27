import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../theme';
import { useAppStore } from '../state';
import {
  ScreenWrapper, PrimaryButton, FlatButton } from '../components';

const SWATCH_COLORS = [
  '#6C63FF', '#4F46E5', '#38BDF8', '#4ADEAA',
  '#FF6B6B', '#F59E0B', '#EC4899', '#8B5CF6',
  '#14B8A6', '#F97316',
];

export default function SubjectSetupScreen({ navigation }: { navigation: any }) {
  const theme = useTheme();
  const { subjects, addSubject, removeSubject } = useAppStore();

  const [newName, setNewName] = useState('');
  const [selectedColor, setSelectedColor] = useState(SWATCH_COLORS[0]);
  const [showInput, setShowInput] = useState(false);

  const handleAddSubject = () => {
    if (!newName.trim()) return;
    const id = 's' + Date.now();
    addSubject({ id, name: newName.trim(), color: selectedColor });
    setNewName('');
    setShowInput(false);
  };

  const stepIndex = 0;

  return (
    <ScreenWrapper>
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
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
          Step 1 of 3
        </Text>

        <Text style={[theme.typography.h1, styles.title, { color: theme.colors.textPrimary }]}>
          What are you studying?
        </Text>
        <Text style={[theme.typography.body, { color: theme.colors.textSecondary, textAlign: 'center', marginBottom: 24 }]}>
          Add your subjects to get started.
        </Text>

        {/* Subject List */}
        {subjects.map((subject) => (
          <View key={subject.id} style={[styles.subjectRow, { backgroundColor: theme.colors.card }]}>
            <View style={[styles.colorDot, { backgroundColor: subject.color }]} />
            <Text style={[theme.typography.body, { color: theme.colors.textPrimary, flex: 1 }]}>
              {subject.name}
            </Text>
            <TouchableOpacity onPress={() => removeSubject(subject.id)} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
              <MaterialIcons name="close" size={20} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          </View>
        ))}

        {/* Add Subject Row */}
        {showInput ? (
          <View style={[styles.addInputContainer, { backgroundColor: theme.colors.card, borderColor: theme.accent.violet }]}>
            <TextInput
              value={newName}
              onChangeText={setNewName}
              placeholder="Subject name"
              placeholderTextColor={theme.colors.textSecondary}
              style={[theme.typography.body, { color: theme.colors.textPrimary, flex: 1 }]}
              autoFocus
              onSubmitEditing={handleAddSubject}
              returnKeyType="done"
            />
            <TouchableOpacity onPress={handleAddSubject} style={[styles.addBtn, { backgroundColor: theme.accent.violet }]}>
              <MaterialIcons name="check" size={20} color="#EAEAF5" />
            </TouchableOpacity>
          </View>
        ) : null}

        {/* Color Picker */}
        {showInput && (
          <View style={styles.swatchRow}>
            {SWATCH_COLORS.map((c) => (
              <TouchableOpacity
                key={c}
                onPress={() => setSelectedColor(c)}
                style={[
                  styles.swatch,
                  { backgroundColor: c },
                  selectedColor === c && { borderColor: '#EAEAF5', borderWidth: 3 },
                ]}
              />
            ))}
          </View>
        )}

        {/* Add Dashed Row */}
        <TouchableOpacity
          onPress={() => setShowInput(true)}
          style={[styles.dashedRow, { borderColor: theme.colors.divider }]}
        >
          <MaterialIcons name="add" size={20} color={theme.accent.violet} />
          <Text style={[theme.typography.body, { color: theme.accent.violet, marginLeft: 8 }]}>
            Add Subject
          </Text>
        </TouchableOpacity>

        <View style={{ flex: 1 }} />
      </ScrollView>

      {/* CTAs */}
      <View style={[styles.ctaSection, { borderTopColor: theme.colors.divider }]}>
        <PrimaryButton
          title="Continue"
          onPress={() => navigation.navigate('ClassSchedule')}
          disabled={subjects.length === 0}
        />
        <FlatButton
          title="I'll add these later"
          onPress={() => navigation.navigate('ClassSchedule')}
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
  subjectRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  colorDot: { width: 12, height: 12, borderRadius: 6, marginRight: 12 },
  addInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    marginBottom: 12,
  },
  addBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  swatchRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 16,
    justifyContent: 'center',
  },
  swatch: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  dashedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    marginBottom: 16,
  },
  ctaSection: {
    paddingHorizontal: 24,
    paddingBottom: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    gap: 4,
  },
});
