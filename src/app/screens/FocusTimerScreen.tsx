import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import Svg, { Circle } from 'react-native-svg';
import { useTheme } from '../theme';
import { useAppStore } from '../state';
import {
  ScreenWrapper, SegmentedControl, Card, SubjectChip, SectionHeader } from '../components';

const SCREEN_WIDTH = Dimensions.get('window').width;
const RING_SIZE = SCREEN_WIDTH * 0.6;
const STROKE_WIDTH = 10;
const RADIUS = (RING_SIZE - STROKE_WIDTH) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const PRESETS = [
  { label: '25 / 5', work: 25, rest: 5 },
  { label: '50 / 10', work: 50, rest: 10 },
  { label: 'Custom', work: 0, rest: 0 },
];

const PLANTS = ['🌱', '🌻', '🌸', '🌿', '🎋'];
const PLANT_NAMES = ['Sprout', 'Sunflower', 'Cherry Blossom', 'Herb', 'Bamboo'];
const DURATIONS = [25, 50, 90];

export default function FocusTimerScreen({ navigation }: { navigation: any }) {
  const theme = useTheme();
  const { subjects, tasks, focusSessions, currentTimerMinutes, setTimerMinutes } = useAppStore();

  // Shared
  const [tabIndex, setTabIndex] = useState(0); // 0 = Timer, 1 = Garden
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(subjects[0]?.id ?? null);

  // ── Timer state ──────────────────────────────
  const [selectedPreset, setSelectedPreset] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(currentTimerMinutes * 60);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const totalSeconds = currentTimerMinutes * 60;
  const progress = totalSeconds > 0 ? (totalSeconds - secondsLeft) / totalSeconds : 0;
  const strokeDashoffset = CIRCUMFERENCE * (1 - progress);
  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const timeDisplay = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            setIsRunning(false);
            clearInterval(intervalRef.current!);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isRunning]);

  const handlePreset = (index: number) => {
    setSelectedPreset(index);
    const preset = PRESETS[index];
    if (preset.work > 0) {
      setTimerMinutes(preset.work);
      setSecondsLeft(preset.work * 60);
      setIsRunning(false);
    }
  };

  const handleReset = () => { setIsRunning(false); setSecondsLeft(currentTimerMinutes * 60); };
  const handleStop = () => { setIsRunning(false); setSecondsLeft(currentTimerMinutes * 60); };

  // ── Garden state ─────────────────────────────
  const [selectedPlant, setSelectedPlant] = useState(0);
  const [selectedDuration, setSelectedDuration] = useState(1);
  const [strictMode, setStrictMode] = useState(false);

  return (
    <ScreenWrapper>
      {/* ── Tab Toggle ── */}
      <View style={styles.tabWrapper}>
        <SegmentedControl
          segments={['Timer', 'Garden 🌱']}
          selected={tabIndex}
          onSelect={setTabIndex}
        />
      </View>

      {tabIndex === 0 ? (
        /* ════════════════════════════
           TIMER TAB
        ════════════════════════════ */
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Timer Ring */}
          <View style={styles.timerContainer}>
            <Svg width={RING_SIZE} height={RING_SIZE} style={styles.svgRing}>
              <Circle
                cx={RING_SIZE / 2} cy={RING_SIZE / 2} r={RADIUS}
                stroke={theme.colors.elevated} strokeWidth={STROKE_WIDTH} fill="none"
              />
              <Circle
                cx={RING_SIZE / 2} cy={RING_SIZE / 2} r={RADIUS}
                stroke={theme.accent.violet} strokeWidth={STROKE_WIDTH} fill="none"
                strokeLinecap="round"
                strokeDasharray={CIRCUMFERENCE}
                strokeDashoffset={strokeDashoffset}
                rotation="-90"
                origin={`${RING_SIZE / 2}, ${RING_SIZE / 2}`}
              />
            </Svg>
            <View style={styles.timerTextOverlay}>
              <Text style={[theme.typography.hero, { color: theme.colors.textPrimary, fontSize: 52 }]}>
                {timeDisplay}
              </Text>
              <Text style={[theme.typography.caption, { color: theme.colors.textSecondary }]}>
                {isRunning ? 'Focus time' : 'Ready'}
              </Text>
            </View>
          </View>

          {/* Preset Chips */}
          <View style={styles.presetRow}>
            {PRESETS.map((preset, i) => (
              <TouchableOpacity
                key={preset.label}
                onPress={() => handlePreset(i)}
                style={[styles.presetChip, {
                  backgroundColor: selectedPreset === i ? theme.accent.violet : theme.colors.elevated,
                }]}
              >
                <Text style={[theme.typography.label, {
                  color: selectedPreset === i ? '#EAEAF5' : theme.colors.textSecondary,
                }]}>
                  {preset.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Subject Picker */}
          <Card style={styles.pickerCard}>
            <Text style={[theme.typography.label, { color: theme.colors.textSecondary, marginBottom: 8 }]}>
              STUDYING
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {subjects.map((s) => (
                <TouchableOpacity key={s.id} onPress={() => setSelectedSubjectId(s.id)} style={{ marginRight: 8 }}>
                  <SubjectChip
                    name={s.name} color={s.color} small
                    style={selectedSubjectId === s.id ? { borderWidth: 1.5, borderColor: s.color } : undefined}
                  />
                </TouchableOpacity>
              ))}
            </ScrollView>
          </Card>

          {/* Controls */}
          <View style={styles.controlsRow}>
            <TouchableOpacity onPress={handleReset} style={[styles.controlBtn, { backgroundColor: theme.colors.elevated }]}>
              <MaterialIcons name="replay" size={24} color={theme.colors.textSecondary} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setIsRunning(!isRunning)}
              style={[styles.playBtn, { backgroundColor: theme.accent.violet }, theme.shadows.glow]}
            >
              <MaterialIcons name={isRunning ? 'pause' : 'play-arrow'} size={36} color="#EAEAF5" />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleStop} style={[styles.controlBtn, { backgroundColor: theme.colors.elevated }]}>
              <MaterialIcons name="stop" size={24} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Session History */}
          <SectionHeader title="Recent Sessions" />
          {focusSessions.slice(0, 5).map((session) => {
            const sub = subjects.find((s) => s.id === session.subjectId);
            return (
              <Card key={session.id} variant="secondary" style={styles.historyRow}>
                <View style={[styles.historyIcon, { backgroundColor: (sub?.color ?? theme.accent.violet) + '22' }]}>
                  <MaterialIcons name="timer" size={16} color={sub?.color ?? theme.accent.violet} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[theme.typography.body, { color: theme.colors.textPrimary }]}>
                    {session.duration} min {session.completed ? '' : '(incomplete)'}
                  </Text>
                  <Text style={[theme.typography.caption, { color: theme.colors.textSecondary }]}>
                    {new Date(session.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    {sub ? ` · ${sub.name}` : ''}
                  </Text>
                </View>
                {session.quality && (
                  <View style={styles.qualityRow}>
                    {Array.from({ length: 5 }, (_, i) => (
                      <MaterialIcons key={i} name={i < session.quality! ? 'star' : 'star-outline'} size={12} color={theme.accent.amber} />
                    ))}
                  </View>
                )}
              </Card>
            );
          })}

          <View style={{ height: 40 }} />
        </ScrollView>
      ) : (
        /* ════════════════════════════
           GARDEN TAB (inline)
        ════════════════════════════ */
        <ScrollView contentContainerStyle={[styles.scrollContent, { alignItems: 'stretch' }]} showsVerticalScrollIndicator={false}>
          {/* Plant Hero */}
          <View style={styles.gardenHero}>
            <View style={[styles.gardenGlow, { backgroundColor: '#3D7A5E' }]} />
            <Text style={styles.gardenEmoji}>{PLANTS[selectedPlant]}</Text>
          </View>

          {/* Plant Picker */}
          <Text style={[theme.typography.label, { color: theme.colors.textSecondary, textAlign: 'center', marginBottom: 10 }]}>
            CHOOSE YOUR PLANT
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.plantRow}>
            {PLANTS.map((p, i) => (
              <TouchableOpacity
                key={i}
                onPress={() => setSelectedPlant(i)}
                style={[
                  styles.plantChip,
                  { backgroundColor: i === selectedPlant ? theme.accent.violet + '33' : theme.colors.elevated },
                  i === selectedPlant && { borderWidth: 1.5, borderColor: theme.accent.violet },
                ]}
              >
                <Text style={{ fontSize: 22 }}>{p}</Text>
                <Text style={{ fontSize: 10, color: i === selectedPlant ? theme.accent.violet : theme.colors.textSecondary, marginTop: 4, fontWeight: '500' }}>
                  {PLANT_NAMES[i]}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Subject Picker */}
          <Text style={[theme.typography.label, { color: theme.colors.textSecondary, marginBottom: 8, marginTop: 20 }]}>STUDYING</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 20 }}>
            {subjects.map((s) => (
              <TouchableOpacity
                key={s.id}
                onPress={() => setSelectedSubjectId(s.id)}
                style={[
                  styles.subjectPill,
                  { backgroundColor: selectedSubjectId === s.id ? s.color + '33' : theme.colors.elevated },
                  selectedSubjectId === s.id && { borderWidth: 1.5, borderColor: s.color },
                  { marginRight: 8 },
                ]}
              >
                <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: s.color, marginRight: 6 }} />
                <Text style={{ fontSize: 13, color: selectedSubjectId === s.id ? s.color : theme.colors.textSecondary, fontWeight: '500' }}>
                  {s.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Duration */}
          <Text style={[theme.typography.label, { color: theme.colors.textSecondary, marginBottom: 8 }]}>DURATION</Text>
          <View style={styles.durationRow}>
            {DURATIONS.map((d, i) => (
              <TouchableOpacity
                key={d}
                onPress={() => setSelectedDuration(i)}
                style={[
                  styles.durationChip,
                  { backgroundColor: i === selectedDuration ? theme.accent.violet : theme.colors.elevated },
                ]}
              >
                <Text style={{ fontSize: 15, fontWeight: '600', color: i === selectedDuration ? '#EAEAF5' : theme.colors.textSecondary }}>
                  {d} min
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Strict Mode Toggle */}
          <TouchableOpacity
            style={[styles.strictRow, { backgroundColor: theme.colors.elevated }]}
            onPress={() => setStrictMode(!strictMode)}
            activeOpacity={0.8}
          >
            <Text style={{ fontSize: 18 }}>🔒</Text>
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={[theme.typography.body, { color: theme.colors.textPrimary, fontWeight: '600' }]}>Strict Mode</Text>
              <Text style={[theme.typography.caption, { color: theme.colors.textSecondary }]}>Leaving the app will wither your plant</Text>
            </View>
            <View style={[styles.toggle, { backgroundColor: strictMode ? theme.accent.violet : theme.colors.divider }]}>
              <View style={[styles.toggleThumb, { transform: [{ translateX: strictMode ? 20 : 2 }] }]} />
            </View>
          </TouchableOpacity>

          <Text style={{ fontSize: 12, color: theme.colors.textSecondary, textAlign: 'center', marginTop: 12, marginBottom: 4 }}>
            {strictMode ? '⚠️ Leaving the app will wither your plant.' : '🌿 Leaving pauses growth.'}
          </Text>

          {/* Plant & Focus CTA */}
          <TouchableOpacity
            style={[styles.plantBtn, { backgroundColor: theme.accent.violet }, theme.shadows.glow]}
            onPress={() => navigation.navigate('GardenActive', {
              plant: PLANTS[selectedPlant],
              plantName: PLANT_NAMES[selectedPlant],
              duration: DURATIONS[selectedDuration],
              subjectId: selectedSubjectId,
              strictMode,
            })}
            activeOpacity={0.85}
          >
            <Text style={{ fontSize: 18 }}>🌱</Text>
            <Text style={{ fontSize: 16, fontWeight: '700', color: '#EAEAF5', marginLeft: 8 }}>Plant & Focus</Text>
          </TouchableOpacity>

          {/* View Collection */}
          <TouchableOpacity style={styles.collectionBtn} onPress={() => navigation.navigate('GardenCollection')}>
            <Text style={{ fontSize: 14, color: theme.colors.textSecondary }}>🌿 View My Garden Collection</Text>
            <MaterialIcons name="arrow-forward-ios" size={12} color={theme.colors.textSecondary} style={{ marginLeft: 4 }} />
          </TouchableOpacity>

          <View style={{ height: 100 }} />
        </ScrollView>
      )}
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  tabWrapper: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 12 },
  scrollContent: { paddingHorizontal: 16, alignItems: 'center' },

  // ── Timer ──
  timerContainer: {
    width: RING_SIZE, height: RING_SIZE, alignItems: 'center', justifyContent: 'center', marginTop: 16,
  },
  svgRing: { position: 'absolute' },
  timerTextOverlay: { alignItems: 'center' },
  presetRow: { flexDirection: 'row', gap: 10, marginTop: 24, marginBottom: 20 },
  presetChip: { paddingVertical: 8, paddingHorizontal: 20, borderRadius: 9999 },
  pickerCard: { width: '100%', marginBottom: 24 },
  controlsRow: { flexDirection: 'row', alignItems: 'center', gap: 20, marginBottom: 32 },
  controlBtn: { width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center' },
  playBtn: { width: 72, height: 72, borderRadius: 36, alignItems: 'center', justifyContent: 'center' },
  historyRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, width: '100%', gap: 12 },
  historyIcon: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  qualityRow: { flexDirection: 'row', flexShrink: 0 },

  // ── Garden ──
  gardenHero: {
    height: 180, width: '100%', alignItems: 'center', justifyContent: 'center',
    position: 'relative', marginBottom: 8,
  },
  gardenGlow: {
    position: 'absolute', width: 160, height: 160, borderRadius: 80, opacity: 0.15,
  },
  gardenEmoji: { fontSize: 90 },
  plantRow: { paddingHorizontal: 4, gap: 10 },
  plantChip: {
    width: 80, alignItems: 'center', paddingVertical: 12, paddingHorizontal: 8,
    borderRadius: 16,
  },
  subjectPill: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 9999,
  },
  durationRow: { flexDirection: 'row', gap: 12, marginBottom: 20, width: '100%' },
  durationChip: { flex: 1, paddingVertical: 14, borderRadius: 14, alignItems: 'center' },
  strictRow: {
    flexDirection: 'row', alignItems: 'center',
    padding: 16, borderRadius: 16, marginBottom: 4, width: '100%',
  },
  toggle: { width: 44, height: 24, borderRadius: 12, justifyContent: 'center' },
  toggleThumb: { width: 20, height: 20, borderRadius: 10, backgroundColor: '#FFFFFF' },
  plantBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: 18, borderRadius: 9999, width: '100%', marginTop: 16,
  },
  collectionBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: 14, marginTop: 12,
  },
});
