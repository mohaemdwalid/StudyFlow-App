import React, { useState } from 'react';
import {
    View, Text, TouchableOpacity, TextInput, StyleSheet, Pressable, Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../theme';
import { useAppStore } from '../state';

const CATEGORIES = ['Homework', 'Quiz', 'Exam', 'Custom'];

export default function AddGradeScreen({ navigation, route }: any) {
    const theme = useTheme();
    const s = styles(theme);
    const { subjects, addGradeItem } = useAppStore();

    // Allow pre-selecting a subject from navigation params
    const initialSubjectId = route?.params?.subjectId ?? subjects[0]?.id ?? '';

    const [category, setCategory] = useState('Quiz');
    const [label, setLabel] = useState('');
    const [score, setScore] = useState('');
    const [total, setTotal] = useState('100');
    const [subjectId, setSubjectId] = useState(initialSubjectId);
    const [weightOverride, setWeightOverride] = useState(false);

    const scoreNum = parseFloat(score) || 0;
    const totalNum = parseFloat(total) || 100;
    const pct = totalNum > 0 ? (scoreNum / totalNum * 100).toFixed(1) : '0.0';
    const improving = scoreNum / totalNum >= 0.87;

    const handleSave = async () => {
        if (!label.trim()) {
            Alert.alert('Missing label', 'Please enter a name for this grade.');
            return;
        }
        if (scoreNum <= 0) {
            Alert.alert('Invalid score', 'Score must be greater than 0.');
            return;
        }
        const id = 'g' + Date.now();
        await addGradeItem({
            id,
            subjectId,
            category: category.toLowerCase() as 'homework' | 'quiz' | 'exam' | 'custom',
            label: label.trim(),
            score: scoreNum,
            total: totalNum,
            date: new Date().toISOString().split('T')[0],
        });
        navigation.goBack();
    };

    return (
        <View style={s.overlay}>
            <Pressable style={s.dimmer} onPress={() => navigation.goBack()} />
            <View style={s.sheet}>
                <View style={s.handle} />
                <View style={s.titleRow}>
                    <Text style={s.sheetTitle}>Add Grade</Text>
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <Text style={s.cancel}>Cancel</Text>
                    </TouchableOpacity>
                </View>

                {/* Subject picker */}
                {subjects.length > 0 && (
                    <View style={s.categoryRow}>
                        {subjects.map(sub => (
                            <TouchableOpacity
                                key={sub.id}
                                style={[s.catChip, subjectId === sub.id && { backgroundColor: sub.color }]}
                                onPress={() => setSubjectId(sub.id)}
                            >
                                <Text style={[s.catText, subjectId === sub.id && { color: '#FFF' }]}>{sub.name}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                )}

                {/* Category chips */}
                <View style={s.categoryRow}>
                    {CATEGORIES.map(c => (
                        <TouchableOpacity
                            key={c}
                            style={[s.catChip, category === c && s.catChipActive]}
                            onPress={() => setCategory(c)}
                        >
                            <Text style={[s.catText, category === c && { color: '#FFF' }]}>{c}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Label */}
                <View style={s.inputRow}>
                    <TextInput
                        style={s.input}
                        placeholder="Item name (e.g. Quiz 3)"
                        placeholderTextColor={theme.colors.textSecondary}
                        value={label}
                        onChangeText={setLabel}
                    />
                </View>

                {/* Score Inputs */}
                <View style={s.scoreRow}>
                    <TextInput
                        style={s.scoreBox}
                        value={score}
                        onChangeText={setScore}
                        keyboardType="numeric"
                        textAlign="center"
                        placeholder="0"
                        placeholderTextColor={theme.colors.textSecondary}
                    />
                    <Text style={s.scoreDivider}>/</Text>
                    <TextInput
                        style={s.scoreBox}
                        value={total}
                        onChangeText={setTotal}
                        keyboardType="numeric"
                        textAlign="center"
                    />
                </View>

                {/* Weight Override */}
                <View style={s.toggleRow}>
                    <Text style={s.toggleLabel}>Weight Override</Text>
                    <TouchableOpacity
                        style={[s.toggleTrack, weightOverride && s.toggleTrackActive]}
                        onPress={() => setWeightOverride(!weightOverride)}
                    >
                        <View style={[s.toggleThumb, weightOverride && s.toggleThumbActive]} />
                    </TouchableOpacity>
                </View>

                {/* Live recalculation preview */}
                {scoreNum > 0 && (
                    <View style={[s.previewCard, { borderColor: improving ? theme.accent.mint : theme.accent.coral }]}>
                        <Text style={s.previewText}>
                            Category avg: {pct}% → Subject grade:{' '}
                            <Text style={{ color: improving ? theme.accent.mint : theme.accent.coral, fontWeight: '600' }}>
                                {parseFloat(pct) >= 90 ? 'A' : parseFloat(pct) >= 80 ? 'B+' : parseFloat(pct) >= 70 ? 'B' : 'C'}
                            </Text>
                        </Text>
                        <Text style={{ color: improving ? theme.accent.mint : theme.accent.coral, fontSize: 18 }}>
                            {improving ? '↑' : '↓'}
                        </Text>
                    </View>
                )}

                {/* Validation */}
                {score !== '' && scoreNum <= 0 && (
                    <View style={s.errorRow}>
                        <MaterialIcons name="error-outline" size={14} color={theme.accent.coral} />
                        <Text style={s.errorText}>Score must be greater than 0</Text>
                    </View>
                )}

                <TouchableOpacity style={s.cta} onPress={handleSave}>
                    <LinearGradient colors={['#6C63FF', '#4F46E5']} style={s.ctaGrad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                        <Text style={s.ctaText}>Add Grade</Text>
                    </LinearGradient>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = (theme: any) => StyleSheet.create({
    overlay: { flex: 1, justifyContent: 'flex-end' },
    dimmer: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.6)' },
    sheet: {
        backgroundColor: theme.colors.elevated,
        borderTopLeftRadius: 24, borderTopRightRadius: 24,
        padding: 20, paddingBottom: 48,
    },
    handle: {
        width: 32, height: 4, borderRadius: 99,
        backgroundColor: theme.colors.textSecondary,
        alignSelf: 'center', marginBottom: 20, opacity: 0.5,
    },
    titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    sheetTitle: { fontSize: 18, fontWeight: '600', color: theme.colors.textPrimary },
    cancel: { fontSize: 15, color: theme.accent.violet },
    categoryRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
    catChip: {
        backgroundColor: theme.colors.elevated, borderRadius: 9999,
        paddingHorizontal: 14, paddingVertical: 8,
    },
    catChipActive: { backgroundColor: theme.accent.violet },
    catText: { fontSize: 13, color: theme.colors.textSecondary, fontWeight: '500' },
    inputRow: {
        backgroundColor: theme.colors.card, borderRadius: 12,
        paddingHorizontal: 16, paddingVertical: 14, marginBottom: 16,
    },
    input: { fontSize: 15, color: theme.colors.textPrimary },
    scoreRow: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        gap: 16, marginBottom: 20,
    },
    scoreBox: {
        width: 90, height: 64, borderRadius: 12,
        backgroundColor: theme.colors.card,
        fontSize: 28, fontWeight: '700', color: theme.colors.textPrimary,
        borderWidth: 1, borderColor: theme.colors.divider,
    },
    scoreDivider: { fontSize: 28, color: theme.colors.textSecondary, fontWeight: '300' },
    dateRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16 },
    dateChip: {
        backgroundColor: theme.colors.elevated, borderRadius: 9999,
        paddingHorizontal: 14, paddingVertical: 6,
    },
    dateText: { fontSize: 13, color: theme.colors.textSecondary },
    toggleRow: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16,
    },
    toggleLabel: { fontSize: 15, color: theme.colors.textPrimary },
    toggleTrack: {
        width: 46, height: 26, borderRadius: 13,
        backgroundColor: theme.colors.divider, padding: 2,
    },
    toggleTrackActive: { backgroundColor: theme.accent.violet },
    toggleThumb: { width: 22, height: 22, borderRadius: 11, backgroundColor: '#FFF' },
    toggleThumbActive: { alignSelf: 'flex-end' },
    previewCard: {
        backgroundColor: theme.colors.card,
        borderRadius: 12, padding: 14, marginBottom: 12,
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        borderWidth: 1,
    },
    previewText: { fontSize: 13, color: theme.colors.textPrimary, flex: 1 },
    errorRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12 },
    errorText: { fontSize: 12, color: theme.accent.coral },
    cta: { borderRadius: 9999, overflow: 'hidden' },
    ctaGrad: { paddingVertical: 16, alignItems: 'center' },
    ctaText: { fontSize: 16, fontWeight: '600', color: '#FFF' },
});
