/**
 * Grade Predictor / What-If Calculator
 * Calculate required score on upcoming assessment to reach target grade.
 */
import React, { useState, useMemo, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import Animated, {
  useSharedValue, useAnimatedStyle, withTiming, withSpring, withDelay,
  FadeInDown, Easing,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../app/theme';
import { useAppStore } from '../../app/state';
import { Card, PrimaryButton } from '../../app/components';

const { width: SW } = Dimensions.get('window');

export default function GradePredictorScreen({ navigation }: { navigation: any }) {
  const theme = useTheme();
  const { subjects, gradeItems } = useAppStore();

  const [selectedSubjectId, setSelectedSubjectId] = useState(subjects[0]?.id ?? '');
  const [currentGrade, setCurrentGrade] = useState('83');
  const [examWeight, setExamWeight] = useState('40');
  const [targetGrade, setTargetGrade] = useState('90');
  const [calculated, setCalculated] = useState(false);

  // Calculate required score
  const result = useMemo(() => {
    const current = parseFloat(currentGrade) || 0;
    const weight = parseFloat(examWeight) || 0;
    const target = parseFloat(targetGrade) || 0;

    if (weight <= 0 || weight > 100) return null;

    const currentWeight = 100 - weight;
    const required = (target - (current * currentWeight / 100)) / (weight / 100);

    return {
      required: Math.round(required * 10) / 10,
      isPossible: required <= 100,
      isEasy: required <= current,
      current,
      target,
      weight,
    };
  }, [currentGrade, examWeight, targetGrade]);

  // Animated progress values
  const currentBarWidth = useSharedValue(0);
  const requiredBarWidth = useSharedValue(0);
  const targetBarWidth = useSharedValue(0);

  useEffect(() => {
    if (calculated && result) {
      currentBarWidth.value = withDelay(200, withTiming(Math.min(result.current, 100), { duration: 800, easing: Easing.out(Easing.cubic) }));
      requiredBarWidth.value = withDelay(400, withTiming(Math.min(Math.max(result.required, 0), 100), { duration: 800, easing: Easing.out(Easing.cubic) }));
      targetBarWidth.value = withDelay(600, withTiming(Math.min(result.target, 100), { duration: 800, easing: Easing.out(Easing.cubic) }));
    } else {
      currentBarWidth.value = 0;
      requiredBarWidth.value = 0;
      targetBarWidth.value = 0;
    }
  }, [calculated, result]);

  const currentBarStyle = useAnimatedStyle(() => ({ width: `${currentBarWidth.value}%` as any }));
  const requiredBarStyle = useAnimatedStyle(() => ({ width: `${requiredBarWidth.value}%` as any }));
  const targetBarStyle = useAnimatedStyle(() => ({ width: `${targetBarWidth.value}%` as any }));

  const handleCalculate = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    setCalculated(true);
  };

  const getLetterGrade = (pct: number) => {
    if (pct >= 93) return 'A';
    if (pct >= 90) return 'A-';
    if (pct >= 87) return 'B+';
    if (pct >= 83) return 'B';
    if (pct >= 80) return 'B-';
    if (pct >= 77) return 'C+';
    if (pct >= 73) return 'C';
    if (pct >= 70) return 'C-';
    if (pct >= 60) return 'D';
    return 'F';
  };

  const selectedSubject = subjects.find((s) => s.id === selectedSubjectId);

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.colors.background }]} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <Animated.View entering={FadeInDown.duration(300)} style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
            <MaterialIcons name="arrow-back" size={24} color={theme.colors.textPrimary} />
          </TouchableOpacity>
          <Text style={[theme.typography.h1, { color: theme.colors.textPrimary, flex: 1, marginLeft: 12 }]}>
            Grade Predictor
          </Text>
          <MaterialIcons name="calculate" size={28} color={theme.accent.violet} />
        </Animated.View>

        <Text style={[theme.typography.body, { color: theme.colors.textSecondary, marginBottom: 20 }]}>
          Find out what score you need on your next assessment.
        </Text>

        {/* Subject Picker */}
        <Animated.View entering={FadeInDown.delay(100).duration(300)}>
          <Text style={[styles.inputLabel, { color: theme.colors.textSecondary }]}>SUBJECT</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 20 }}>
            {subjects.map((s) => (
              <TouchableOpacity
                key={s.id}
                onPress={() => {
                  setSelectedSubjectId(s.id);
                  // Auto-fill current grade from real data
                  const items = gradeItems.filter((g) => g.subjectId === s.id);
                  if (items.length > 0) {
                    const totalScore = items.reduce((acc, g) => acc + g.score, 0);
                    const totalPossible = items.reduce((acc, g) => acc + g.total, 0);
                    const pct = totalPossible > 0 ? (totalScore / totalPossible) * 100 : 0;
                    setCurrentGrade(pct.toFixed(0));
                  }
                  setCalculated(false);
                }}
                style={[
                  styles.subjectChip,
                  {
                    backgroundColor: selectedSubjectId === s.id ? s.color + '33' : theme.colors.elevated,
                    borderWidth: selectedSubjectId === s.id ? 1.5 : 0,
                    borderColor: s.color,
                  },
                ]}
              >
                <View style={[styles.subjectDot, { backgroundColor: s.color }]} />
                <Text style={{ fontSize: 13, fontWeight: '500', color: selectedSubjectId === s.id ? s.color : theme.colors.textSecondary }}>
                  {s.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </Animated.View>

        {/* Input Fields */}
        <Animated.View entering={FadeInDown.delay(200).duration(300)} style={[styles.card, { backgroundColor: theme.colors.card }]}>
          {/* Current Grade */}
          <View style={styles.inputRow}>
            <View style={[styles.iconWrap, { backgroundColor: theme.accent.sky + '18' }]}>
              <MaterialIcons name="trending-up" size={18} color={theme.accent.sky} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[theme.typography.label, { color: theme.colors.textSecondary }]}>Current Grade</Text>
              <Text style={[theme.typography.caption, { color: theme.colors.textSecondary, opacity: 0.7 }]}>
                Your average so far
              </Text>
            </View>
            <View style={[styles.inputBox, { backgroundColor: theme.colors.elevated }]}>
              <TextInput
                style={[styles.input, { color: theme.colors.textPrimary }]}
                value={currentGrade}
                onChangeText={(v) => { setCurrentGrade(v); setCalculated(false); }}
                keyboardType="numeric"
                maxLength={5}
                placeholder="83"
                placeholderTextColor={theme.colors.textSecondary + '55'}
              />
              <Text style={[styles.inputSuffix, { color: theme.colors.textSecondary }]}>%</Text>
            </View>
          </View>

          <View style={[styles.divider, { backgroundColor: theme.colors.divider }]} />

          {/* Exam Weight */}
          <View style={styles.inputRow}>
            <View style={[styles.iconWrap, { backgroundColor: theme.accent.amber + '18' }]}>
              <MaterialIcons name="analytics" size={18} color={theme.accent.amber} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[theme.typography.label, { color: theme.colors.textSecondary }]}>Assessment Weight</Text>
              <Text style={[theme.typography.caption, { color: theme.colors.textSecondary, opacity: 0.7 }]}>
                How much it counts
              </Text>
            </View>
            <View style={[styles.inputBox, { backgroundColor: theme.colors.elevated }]}>
              <TextInput
                style={[styles.input, { color: theme.colors.textPrimary }]}
                value={examWeight}
                onChangeText={(v) => { setExamWeight(v); setCalculated(false); }}
                keyboardType="numeric"
                maxLength={3}
                placeholder="40"
                placeholderTextColor={theme.colors.textSecondary + '55'}
              />
              <Text style={[styles.inputSuffix, { color: theme.colors.textSecondary }]}>%</Text>
            </View>
          </View>

          <View style={[styles.divider, { backgroundColor: theme.colors.divider }]} />

          {/* Target Grade */}
          <View style={styles.inputRow}>
            <View style={[styles.iconWrap, { backgroundColor: theme.accent.mint + '18' }]}>
              <MaterialIcons name="flag" size={18} color={theme.accent.mint} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[theme.typography.label, { color: theme.colors.textSecondary }]}>Target Grade</Text>
              <Text style={[theme.typography.caption, { color: theme.colors.textSecondary, opacity: 0.7 }]}>
                What you want to achieve
              </Text>
            </View>
            <View style={[styles.inputBox, { backgroundColor: theme.colors.elevated }]}>
              <TextInput
                style={[styles.input, { color: theme.colors.textPrimary }]}
                value={targetGrade}
                onChangeText={(v) => { setTargetGrade(v); setCalculated(false); }}
                keyboardType="numeric"
                maxLength={5}
                placeholder="90"
                placeholderTextColor={theme.colors.textSecondary + '55'}
              />
              <Text style={[styles.inputSuffix, { color: theme.colors.textSecondary }]}>%</Text>
            </View>
          </View>
        </Animated.View>

        {/* Calculate Button */}
        <Animated.View entering={FadeInDown.delay(300).duration(300)} style={{ marginTop: 20 }}>
          <PrimaryButton title="Calculate Required Score" onPress={handleCalculate} icon="auto-awesome" />
        </Animated.View>

        {/* Result */}
        {calculated && result && (
          <Animated.View entering={FadeInDown.duration(400)} style={{ marginTop: 24 }}>
            {/* Hero Result */}
            <LinearGradient
              colors={result.isPossible ? [theme.accent.violet, theme.accent.indigo] : [theme.accent.coral, '#B91C1C']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.resultHero}
            >
              <Text style={styles.resultLabel}>
                {result.isPossible ? 'YOU NEED TO SCORE' : 'NOT ACHIEVABLE'}
              </Text>
              <Text style={styles.resultScore}>
                {result.isPossible ? `${result.required}%` : '> 100%'}
              </Text>
              <Text style={styles.resultSub}>
                {result.isPossible
                  ? `That's a ${getLetterGrade(result.required)} on the assessment`
                  : 'Your target grade is not reachable with this weight alone'}
              </Text>
              {result.isPossible && result.isEasy && (
                <View style={styles.easyBadge}>
                  <MaterialIcons name="check-circle" size={14} color="#FFF" />
                  <Text style={styles.easyText}>Below your current average — you got this!</Text>
                </View>
              )}
            </LinearGradient>

            {/* Comparison Bars */}
            <Card style={[styles.barsCard, { backgroundColor: theme.colors.card }]}>
              <Text style={[theme.typography.label, { color: theme.colors.textSecondary, marginBottom: 16 }]}>
                GRADE COMPARISON
              </Text>

              {/* Current */}
              <View style={styles.barRow}>
                <Text style={[styles.barLabel, { color: theme.colors.textSecondary }]}>Current</Text>
                <View style={[styles.barTrack, { backgroundColor: theme.colors.elevated }]}>
                  <Animated.View style={[styles.barFill, { backgroundColor: theme.accent.sky }, currentBarStyle]} />
                </View>
                <Text style={[styles.barValue, { color: theme.colors.textPrimary }]}>{result.current}%</Text>
              </View>

              {/* Required */}
              {result.isPossible && (
                <View style={styles.barRow}>
                  <Text style={[styles.barLabel, { color: theme.colors.textSecondary }]}>Required</Text>
                  <View style={[styles.barTrack, { backgroundColor: theme.colors.elevated }]}>
                    <Animated.View style={[styles.barFill, { backgroundColor: theme.accent.violet }, requiredBarStyle]} />
                  </View>
                  <Text style={[styles.barValue, { color: theme.colors.textPrimary }]}>{result.required}%</Text>
                </View>
              )}

              {/* Target */}
              <View style={styles.barRow}>
                <Text style={[styles.barLabel, { color: theme.colors.textSecondary }]}>Target</Text>
                <View style={[styles.barTrack, { backgroundColor: theme.colors.elevated }]}>
                  <Animated.View style={[styles.barFill, { backgroundColor: theme.accent.mint }, targetBarStyle]} />
                </View>
                <Text style={[styles.barValue, { color: theme.colors.textPrimary }]}>{result.target}%</Text>
              </View>
            </Card>

            {/* Tip Card */}
            {result.isPossible && (
              <Card style={[styles.tipCard, { backgroundColor: theme.colors.card, borderLeftWidth: 3, borderLeftColor: theme.accent.amber }]}>
                <MaterialIcons name="lightbulb" size={20} color={theme.accent.amber} />
                <Text style={[theme.typography.body, { color: theme.colors.textPrimary, flex: 1, marginLeft: 12 }]}>
                  {result.required > 90
                    ? 'Start studying early — this will need dedicated preparation.'
                    : result.required > 75
                    ? 'Very achievable with consistent study sessions.'
                    : 'You\'re in great shape — maintain your current habits.'}
                </Text>
              </Card>
            )}
          </Animated.View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: { paddingHorizontal: 20, paddingTop: 8 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  inputLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 1.2, marginBottom: 8, marginLeft: 4 },
  subjectChip: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 9999, marginRight: 8,
  },
  subjectDot: { width: 8, height: 8, borderRadius: 4, marginRight: 6 },
  card: { borderRadius: 16, overflow: 'hidden' },
  inputRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 14, gap: 12,
  },
  iconWrap: { width: 36, height: 36, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  inputBox: {
    flexDirection: 'row', alignItems: 'center',
    borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8, minWidth: 72,
  },
  input: { fontSize: 18, fontWeight: '700', textAlign: 'right', flex: 1, padding: 0 },
  inputSuffix: { fontSize: 14, fontWeight: '500', marginLeft: 2 },
  divider: { height: StyleSheet.hairlineWidth, marginLeft: 64 },
  resultHero: { borderRadius: 20, padding: 24, alignItems: 'center' },
  resultLabel: { fontSize: 11, fontWeight: '700', color: '#FFFFFF88', letterSpacing: 1.5 },
  resultScore: { fontSize: 56, fontWeight: '800', color: '#FFF', marginVertical: 4 },
  resultSub: { fontSize: 14, color: '#FFFFFFCC', textAlign: 'center' },
  easyBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 9999,
    paddingHorizontal: 12, paddingVertical: 6, marginTop: 12,
  },
  easyText: { fontSize: 12, fontWeight: '600', color: '#FFF' },
  barsCard: { marginTop: 16, padding: 20, borderRadius: 16 },
  barRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  barLabel: { width: 60, fontSize: 12, fontWeight: '500' },
  barTrack: { flex: 1, height: 8, borderRadius: 4, overflow: 'hidden', marginHorizontal: 12 },
  barFill: { height: '100%', borderRadius: 4 },
  barValue: { width: 45, fontSize: 13, fontWeight: '700', textAlign: 'right' },
  tipCard: { marginTop: 12, flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 16 },
});
