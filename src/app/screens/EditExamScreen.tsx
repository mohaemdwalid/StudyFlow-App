import React, { useState } from 'react';
import {
    View, Text, ScrollView, TouchableOpacity, TextInput, StyleSheet, Pressable, Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../theme';
import { useAppStore } from '../state';

export default function EditExamScreen({ navigation }: any) {
    const theme = useTheme();
    const s = styles(theme);
    const { subjects, addExam } = useAppStore();

    const [subjectId, setSubjectId] = useState(subjects[0]?.id ?? '');
    const [title, setTitle] = useState('');
    const [topics, setTopics] = useState<string[]>([]);
    const [newTopic, setNewTopic] = useState('');
    const [location, setLocation] = useState('');
    const [weight, setWeight] = useState('');

    const addTopic = () => {
        if (newTopic.trim()) {
            setTopics(prev => [...prev, newTopic.trim()]);
            setNewTopic('');
        }
    };

    const handleSave = async () => {
        if (!title.trim()) {
            Alert.alert('Missing title', 'Please enter an exam title.');
            return;
        }
        const id = 'e' + Date.now();
        await addExam({
            id,
            subjectId,
            title: title.trim(),
            date: new Date().toISOString().split('T')[0],
            time: '',
            location: location.trim() || undefined,
            weight: weight ? parseInt(weight) : undefined,
            topics: topics.map((t, i) => ({
                id: 'et' + Date.now() + i,
                label: t,
                completed: false,
            })),
        });
        navigation.goBack();
    };

    return (
        <View style={s.overlay}>
            <Pressable style={s.dimmer} onPress={() => navigation.goBack()} />
            <View style={s.sheet}>
                <View style={s.handle} />
                <View style={s.titleRow}>
                    <Text style={s.sheetTitle}>Add Exam</Text>
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <Text style={s.cancel}>Cancel</Text>
                    </TouchableOpacity>
                </View>

                <ScrollView showsVerticalScrollIndicator={false}>
                    {/* Subject */}
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
                        {subjects.map(sub => (
                            <TouchableOpacity
                                key={sub.id}
                                style={[s.subjectChip, subjectId === sub.id && { borderColor: theme.accent.violet, borderWidth: 2 }]}
                                onPress={() => setSubjectId(sub.id)}
                            >
                                <View style={[s.dot, { backgroundColor: sub.color }]} />
                                <Text style={[s.subjectLabel, subjectId === sub.id && { color: theme.colors.textPrimary }]}>
                                    {sub.name}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>

                    {/* Title */}
                    <View style={s.inputRow}>
                        <TextInput
                            style={s.input}
                            placeholder="Exam title..."
                            placeholderTextColor={theme.colors.textSecondary}
                            value={title}
                            onChangeText={setTitle}
                        />
                    </View>

                    {/* Location + Weight */}
                    <View style={s.inputRow}>
                        <MaterialIcons name="place" size={18} color={theme.colors.textSecondary} />
                        <TextInput
                            style={s.input}
                            placeholder="Room / Location"
                            placeholderTextColor={theme.colors.textSecondary}
                            value={location}
                            onChangeText={setLocation}
                        />
                    </View>
                    <View style={s.inputRow}>
                        <MaterialIcons name="bar-chart" size={18} color={theme.colors.textSecondary} />
                        <TextInput
                            style={s.input}
                            placeholder="Exam Weight %"
                            placeholderTextColor={theme.colors.textSecondary}
                            value={weight}
                            onChangeText={setWeight}
                            keyboardType="numeric"
                        />
                        <Text style={s.pctSuffix}>%</Text>
                    </View>

                    {/* Topics */}
                    <View style={s.topicsHeader}>
                        <Text style={s.topicsTitle}>Topics</Text>
                        <Text style={s.topicsCount}>{topics.length} added</Text>
                    </View>

                    {topics.map((t, i) => (
                        <View key={i} style={s.topicRow}>
                            <MaterialIcons name="drag-handle" size={20} color={theme.colors.textSecondary} />
                            <Text style={[s.input, { flex: 1 }]}>{t}</Text>
                            <TouchableOpacity onPress={() => setTopics(prev => prev.filter((_, idx) => idx !== i))}>
                                <MaterialIcons name="close" size={18} color={theme.colors.textSecondary} />
                            </TouchableOpacity>
                        </View>
                    ))}

                    <View style={s.addTopicRow}>
                        <TextInput
                            style={s.addTopicInput}
                            placeholder="Add a topic..."
                            placeholderTextColor={theme.colors.textSecondary}
                            value={newTopic}
                            onChangeText={setNewTopic}
                            onSubmitEditing={addTopic}
                        />
                        <TouchableOpacity onPress={addTopic}>
                            <MaterialIcons name="add" size={22} color={theme.accent.violet} />
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity style={s.aiRow}>
                        <MaterialIcons name="auto-awesome" size={18} color={theme.accent.violet} />
                        <Text style={[s.aiText, { color: theme.accent.violet }]}>Generate Topics with AI</Text>
                        <MaterialIcons name="lock" size={14} color={theme.accent.violet} />
                    </TouchableOpacity>

                    <View style={{ height: 20 }} />
                    <TouchableOpacity style={s.cta} onPress={handleSave}>
                        <LinearGradient colors={['#6C63FF', '#4F46E5']} style={s.ctaGrad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                            <Text style={s.ctaText}>Save Exam</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                    <View style={{ height: 40 }} />
                </ScrollView>
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
        padding: 20, maxHeight: '92%',
    },
    handle: {
        width: 32, height: 4, borderRadius: 99,
        backgroundColor: theme.colors.textSecondary, alignSelf: 'center', marginBottom: 20, opacity: 0.5,
    },
    titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    sheetTitle: { fontSize: 18, fontWeight: '600', color: theme.colors.textPrimary },
    cancel: { fontSize: 15, color: theme.accent.violet },
    subjectChip: {
        flexDirection: 'row', alignItems: 'center', gap: 6,
        backgroundColor: theme.colors.card, borderRadius: 9999,
        paddingHorizontal: 14, paddingVertical: 8, marginRight: 8,
    },
    dot: { width: 10, height: 10, borderRadius: 5 },
    subjectLabel: { fontSize: 13, color: theme.colors.textSecondary, fontWeight: '500' },
    timeRow: { flexDirection: 'row', gap: 12, marginBottom: 12 },
    timeField: {
        flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8,
        backgroundColor: theme.colors.card, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 14,
    },
    timeText: { fontSize: 15, color: theme.colors.textPrimary },
    countdownChip: {
        alignSelf: 'flex-start', backgroundColor: theme.accent.coral + '33',
        borderRadius: 9999, paddingHorizontal: 14, paddingVertical: 6, marginBottom: 16,
        borderWidth: 1, borderColor: theme.accent.coral,
    },
    countdownText: { fontSize: 13, color: theme.accent.coral, fontWeight: '600' },
    inputRow: {
        flexDirection: 'row', alignItems: 'center', gap: 10,
        backgroundColor: theme.colors.card, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 14, marginBottom: 10,
    },
    input: { flex: 1, fontSize: 15, color: theme.colors.textPrimary },
    pctSuffix: { fontSize: 15, color: theme.colors.textSecondary },
    topicsHeader: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8, marginBottom: 12,
    },
    topicsTitle: { fontSize: 15, fontWeight: '600', color: theme.colors.textPrimary },
    topicsCount: { fontSize: 13, color: theme.colors.textSecondary },
    topicRow: {
        flexDirection: 'row', alignItems: 'center', gap: 10,
        backgroundColor: theme.colors.card, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, marginBottom: 8,
    },
    addTopicRow: {
        flexDirection: 'row', alignItems: 'center', gap: 10,
        borderWidth: 1, borderStyle: 'dashed', borderColor: theme.accent.violet + '55',
        borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, marginBottom: 8,
    },
    addTopicInput: { flex: 1, fontSize: 15, color: theme.colors.textPrimary },
    aiRow: {
        flexDirection: 'row', alignItems: 'center', gap: 8,
        borderWidth: 1, borderColor: theme.accent.violet,
        borderRadius: 9999, paddingHorizontal: 16, paddingVertical: 10,
        alignSelf: 'center', marginBottom: 8,
    },
    aiText: { fontSize: 14, fontWeight: '500' },
    cta: { borderRadius: 9999, overflow: 'hidden' },
    ctaGrad: { paddingVertical: 16, alignItems: 'center' },
    ctaText: { fontSize: 16, fontWeight: '600', color: '#FFF' },
});
