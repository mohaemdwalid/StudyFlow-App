import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import Animated, {
  useSharedValue, useAnimatedStyle, withSpring, FadeInDown,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../theme';
import { useAppStore } from '../state';
import type { PlantType } from '../../types';
import { ScreenWrapper } from '../components';

const { width: SCREEN_W } = Dimensions.get('window');

interface PlantOption {
  name: string;
  emoji: string;
  type: PlantType;
}

const PLANT_TYPES: PlantOption[] = [
  { name: 'Sunflower', emoji: '🌻', type: 'sunflower' },
  { name: 'Cherry Blossom', emoji: '🌸', type: 'cherry' },
  { name: 'Herb', emoji: '🌿', type: 'herb' },
  { name: 'Bamboo', emoji: '🎋', type: 'bamboo' },
  { name: 'Rose', emoji: '🌹', type: 'rose' },
];

interface DurationOption {
  label: string;
  minutes: number;
}

const DURATIONS: DurationOption[] = [
  { label: '25 min', minutes: 25 },
  { label: '50 min', minutes: 50 },
  { label: '90 min', minutes: 90 },
];

export default function GardenPlantingScreen({ navigation }: any) {
  const theme = useTheme();
  const { subjects } = useAppStore();

  const [selectedPlant, setSelectedPlant] = useState<PlantOption>(PLANT_TYPES[0]);
  const [selectedDuration, setSelectedDuration] = useState<DurationOption>(DURATIONS[1]);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | undefined>(
    subjects.length > 0 ? subjects[0].id : undefined,
  );
  const [strictMode, setStrictMode] = useState(true);

  // ── Plant selection animation ──
  const plantBounce = useSharedValue(1);
  const plantAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: plantBounce.value }],
  }));

  const handlePlantSelect = (p: PlantOption) => {
    setSelectedPlant(p);
    plantBounce.value = withSpring(1.15, { stiffness: 400, damping: 8 }, () => {
      plantBounce.value = withSpring(1, { stiffness: 300, damping: 12 });
    });
    Haptics.selectionAsync().catch(() => {});
  };

  const selectedSubject = subjects.find((s) => s.id === selectedSubjectId);

  const handleStartSession = () => {
    const sessionId = `ps_${Date.now()}`;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    navigation.navigate('GardenActive', {
      plant: selectedPlant.emoji,
      plantName: selectedSubject?.name ?? 'Focus',
      duration: selectedDuration.minutes,
      subjectId: selectedSubjectId,
      strictMode,
      sessionId,
    });
  };

  return (
    <ScreenWrapper>
      {/* Header toggle */}
      <Animated.View entering={FadeInDown.duration(400)} style={[styles.toggle, { backgroundColor: theme.colors.elevated }]}>
        <TouchableOpacity style={styles.toggleBtn} onPress={() => navigation.goBack()}>
          <Text style={[styles.toggleBtnText, { color: theme.colors.textSecondary }]}>
            ⏱ Timer
          </Text>
        </TouchableOpacity>
        <View style={styles.toggleBtnActive}>
          <Text style={[styles.toggleBtnActiveText, { color: theme.accent.violet }]}>
            🌱 Garden
          </Text>
          <View style={[styles.toggleUnderline, { backgroundColor: theme.accent.violet }]} />
        </View>
      </Animated.View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* Section: Choose your plant */}
        <Animated.View entering={FadeInDown.delay(100).duration(400)}>
          <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>
            Choose your plant
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.plantScroll}
          >
            {PLANT_TYPES.map((p) => (
              <TouchableOpacity
                key={p.type}
                style={[
                  styles.plantCard,
                  { backgroundColor: theme.colors.elevated },
                  selectedPlant.type === p.type && {
                    borderWidth: 2,
                    borderColor: theme.accent.violet,
                    opacity: 1,
                  },
                ]}
                onPress={() => handlePlantSelect(p)}
                activeOpacity={0.7}
              >
                <Text style={styles.plantCardEmoji}>{p.emoji}</Text>
                <Text style={[styles.plantCardName, { color: theme.colors.textSecondary }]}>
                  {p.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </Animated.View>

        {/* Pot preview */}
        <Animated.View entering={FadeInDown.delay(200).duration(400)} style={styles.potContainer}>
          <View style={[styles.orbitRing, { borderColor: theme.accent.violet + '44' }]} />
          <View style={[styles.potOuter, { shadowColor: theme.accent.violet }]}>
            <Animated.Text style={[styles.potEmoji, plantAnimStyle]}>
              {selectedPlant.emoji}
            </Animated.Text>
            <View style={[styles.potSoil, { backgroundColor: theme.garden.soil }]}>
              <View style={[styles.seed, { backgroundColor: theme.accent.violet }]} />
            </View>
          </View>
          <Text style={styles.sparkle}>✨</Text>
        </Animated.View>

        {/* Subject Picker */}
        <Animated.View entering={FadeInDown.delay(300).duration(400)}>
          <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>
            Subject
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.subjectScroll}
          >
            {subjects.map((s) => (
              <TouchableOpacity
                key={s.id}
                style={[
                  styles.subjectChip,
                  { backgroundColor: theme.colors.elevated },
                  selectedSubjectId === s.id && {
                    backgroundColor: s.color + '33',
                    borderWidth: 1,
                    borderColor: s.color + '66',
                  },
                ]}
                onPress={() => {
                  setSelectedSubjectId(s.id);
                  Haptics.selectionAsync().catch(() => {});
                }}
              >
                <View style={[styles.subjectDot, { backgroundColor: s.color }]} />
                <Text style={[
                  styles.subjectChipText,
                  { color: selectedSubjectId === s.id ? s.color : theme.colors.textSecondary },
                ]}>
                  {s.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </Animated.View>

        {/* Duration Picker */}
        <Animated.View entering={FadeInDown.delay(400).duration(400)}>
          <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>
            Duration
          </Text>
          <View style={styles.durationRow}>
            {DURATIONS.map((d) => (
              <TouchableOpacity
                key={d.minutes}
                style={[
                  styles.durChip,
                  { backgroundColor: theme.colors.elevated },
                  selectedDuration.minutes === d.minutes && {
                    backgroundColor: theme.accent.violet,
                  },
                ]}
                onPress={() => {
                  setSelectedDuration(d);
                  Haptics.selectionAsync().catch(() => {});
                }}
              >
                <Text style={[
                  styles.durText,
                  { color: theme.colors.textSecondary },
                  selectedDuration.minutes === d.minutes && { color: '#FFF' },
                ]}>
                  {d.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>

        {/* Strict Mode */}
        <Animated.View
          entering={FadeInDown.delay(500).duration(400)}
          style={[styles.strictCard, { backgroundColor: theme.colors.card }]}
        >
          <View style={styles.strictTop}>
            <View style={styles.strictLeft}>
              <MaterialIcons
                name="lock"
                size={18}
                color={strictMode ? theme.accent.coral : theme.colors.textSecondary}
              />
              <Text style={[styles.strictLabel, { color: theme.colors.textPrimary }]}>
                Strict Mode
              </Text>
            </View>
            <TouchableOpacity
              style={[
                styles.toggleTrack,
                { backgroundColor: theme.colors.divider },
                strictMode && { backgroundColor: theme.accent.violet },
              ]}
              onPress={() => {
                setStrictMode(!strictMode);
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
              }}
              activeOpacity={0.8}
            >
              <View style={[
                styles.toggleThumb,
                strictMode && styles.toggleThumbActive,
              ]} />
            </TouchableOpacity>
          </View>
          {strictMode && (
            <Text style={[styles.strictWarn, { color: theme.accent.coral }]}>
              ⚠️ Your plant withers if you leave the app
            </Text>
          )}
        </Animated.View>

        {/* CTA Button */}
        <Animated.View entering={FadeInDown.delay(600).duration(400)}>
          <TouchableOpacity
            style={styles.ctaBtn}
            onPress={handleStartSession}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={[theme.garden.moss, theme.accent.violet]}
              style={styles.ctaGrad}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.ctaText}>Plant & Focus 🌱</Text>
            </LinearGradient>
          </TouchableOpacity>
          <Text style={[styles.caption, { color: theme.colors.textSecondary }]}>
            Your plant grows while you stay focused.
          </Text>
        </Animated.View>

        <View style={{ height: 48 }} />
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  toggle: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginHorizontal: 24,
    borderRadius: 9999,
    marginTop: 8,
  },
  toggleBtn: { paddingHorizontal: 20, paddingVertical: 8 },
  toggleBtnText: { fontSize: 14 },
  toggleBtnActive: { paddingHorizontal: 20, paddingVertical: 8, alignItems: 'center' },
  toggleBtnActiveText: { fontSize: 14, fontWeight: '600' },
  toggleUnderline: { height: 2, width: 20, borderRadius: 99, marginTop: 2 },
  content: { paddingHorizontal: 20, paddingTop: 24 },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  plantScroll: { marginBottom: 24 },
  plantCard: {
    width: 82,
    height: 82,
    borderRadius: 14,
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0.6,
  },
  plantCardEmoji: { fontSize: 30 },
  plantCardName: { fontSize: 10, marginTop: 4, textAlign: 'center' },
  potContainer: {
    alignItems: 'center',
    marginBottom: 28,
    height: 180,
    justifyContent: 'center',
    position: 'relative',
  },
  orbitRing: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 1,
    borderStyle: 'dashed',
  },
  potOuter: {
    width: 100,
    height: 100,
    backgroundColor: '#4A3728',
    borderRadius: 16,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 8,
    overflow: 'hidden',
    shadowOpacity: 0.4,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 0 },
    elevation: 8,
  },
  potEmoji: {
    fontSize: 36,
    position: 'absolute',
    top: 10,
  },
  potSoil: {
    width: '100%',
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  seed: { width: 8, height: 8, borderRadius: 4 },
  sparkle: { position: 'absolute', bottom: 60, fontSize: 12 },
  subjectScroll: { marginBottom: 24 },
  subjectChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 9999,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginRight: 8,
  },
  subjectDot: { width: 8, height: 8, borderRadius: 4 },
  subjectChipText: { fontSize: 13, fontWeight: '500' },
  durationRow: { flexDirection: 'row', gap: 8, marginBottom: 24 },
  durChip: {
    flex: 1,
    borderRadius: 9999,
    paddingVertical: 12,
    alignItems: 'center',
  },
  durText: { fontSize: 14, fontWeight: '500' },
  strictCard: {
    borderRadius: 14,
    padding: 16,
    marginBottom: 28,
  },
  strictTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  strictLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  strictLabel: { fontSize: 15, fontWeight: '500' },
  toggleTrack: {
    width: 48,
    height: 28,
    borderRadius: 14,
    padding: 2,
    justifyContent: 'center',
  },
  toggleThumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FFF',
  },
  toggleThumbActive: { alignSelf: 'flex-end' },
  strictWarn: {
    fontSize: 12,
    marginTop: 10,
    fontWeight: '500',
  },
  ctaBtn: { borderRadius: 9999, overflow: 'hidden', marginBottom: 12 },
  ctaGrad: { paddingVertical: 16, alignItems: 'center' },
  ctaText: { fontSize: 16, fontWeight: '600', color: '#FFF' },
  caption: { fontSize: 12, textAlign: 'center' },
});
