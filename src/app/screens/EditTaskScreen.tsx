import React, { useState } from 'react';
import {
    View, Text, ScrollView, TouchableOpacity, TextInput, StyleSheet, Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../theme';
import { ScreenWrapper } from '../components';
import { useAppStore } from '../state';

const TASK_TYPES = [
    { label: '📚 Homework', key: 'homework' },
    { label: '📁 Project', key: 'project' },
    { label: '📖 Study', key: 'study' },
    { label: '⭐ Personal', key: 'personal' },
];

export default function EditTaskScreen({ navigation, route }: any) {
    const theme = useTheme();
    const s = styles(theme);
    const { subjects, addTask, updateTask, removeTask } = useAppStore();
    const existingTask = route?.params?.task;
    const isEdit = !!existingTask;

    const [taskType, setTaskType] = useState(existingTask?.type ?? 'homework');
    const [title, setTitle] = useState(existingTask?.title ?? '');
    const [subjectId, setSubjectId] = useState(existingTask?.subjectId ?? subjects[0]?.id ?? '');
    const [priority, setPriority] = useState<'low' | 'medium' | 'high'>(existingTask?.priority ?? 'high');
    const [duration, setDuration] = useState(existingTask?.estimatedMinutes ?? 45);
    const [notes, setNotes] = useState(existingTask?.notes ?? '');

    const PRIORITIES: Array<{ key: 'low' | 'medium' | 'high'; label: string; color: string }> = [
        { key: 'low', label: 'Low', color: theme.colors.textSecondary },
        { key: 'medium', label: 'Medium', color: theme.accent.amber },
        { key: 'high', label: 'High', color: theme.accent.coral },
    ];

    const handleSave = async () => {
        if (!title.trim()) {
            Alert.alert('Missing title', 'Please enter a task title.');
            return;
        }
        if (isEdit) {
            await updateTask(existingTask.id, {
                title: title.trim(),
                type: taskType as any,
                subjectId,
                priority,
                estimatedMinutes: duration,
                notes: notes.trim() || undefined,
            });
        } else {
            const id = 't' + Date.now();
            await addTask({
                id,
                title: title.trim(),
                type: taskType as any,
                subjectId,
                status: 'pending',
                priority,
                dueDate: new Date().toISOString().split('T')[0],
                estimatedMinutes: duration,
                notes: notes.trim() || undefined,
                subtasks: [],
            });
        }
        navigation.goBack();
    };

    const handleDelete = () => {
        Alert.alert('Delete Task', 'Are you sure?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Delete', style: 'destructive',
                onPress: async () => { await removeTask(existingTask.id); navigation.goBack(); },
            },
        ]);
    };

    // Subjects list + "None" option
    const subjectOptions = [...subjects, { id: '', name: 'None', color: '#8B8FA8' }];

    return (
        <ScreenWrapper>
            {/* Nav Bar */}
            <View style={s.navBar}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Text style={s.navBack}>← Back</Text>
                </TouchableOpacity>
                <Text style={s.navTitle}>{isEdit ? 'Edit Task' : 'Add Task'}</Text>
                <TouchableOpacity onPress={handleSave}>
                    <Text style={s.navSave}>Save</Text>
                </TouchableOpacity>
            </View>

            <ScrollView style={s.scroll} contentContainerStyle={s.content} keyboardShouldPersistTaps="handled">
                {/* Task Type */}
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 20 }}>
                    {TASK_TYPES.map(t => (
                        <TouchableOpacity
                            key={t.key}
                            style={[s.typeChip, taskType === t.key && s.typeChipActive]}
                            onPress={() => setTaskType(t.key)}
                        >
                            <Text style={[s.typeText, taskType === t.key && { color: '#FFF' }]}>{t.label}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                {/* Title Input */}
                <TextInput
                    style={s.titleInput}
                    placeholder="Task title..."
                    placeholderTextColor={theme.colors.textSecondary}
                    value={title}
                    onChangeText={setTitle}
                    multiline
                />

                {/* Metadata Card */}
                <View style={s.metaCard}>
                    {/* Subject */}
                    <View style={s.metaRow}>
                        <MaterialIcons name="book" size={18} color={theme.colors.textSecondary} style={s.metaIcon} />
                        <Text style={s.metaLabel}>Subject</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flex: 1 }}>
                            {subjectOptions.map(sub => (
                                <TouchableOpacity
                                    key={sub.id}
                                    style={[s.subjectChip, subjectId === sub.id && { borderColor: sub.color, borderWidth: 2 }]}
                                    onPress={() => setSubjectId(sub.id)}
                                >
                                    <Text style={[s.subjectText, subjectId === sub.id && { color: sub.color }]}>{sub.name}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                    <View style={s.divider} />

                    {/* Duration */}
                    <View style={s.metaRow}>
                        <MaterialIcons name="schedule" size={18} color={theme.colors.textSecondary} style={s.metaIcon} />
                        <Text style={s.metaLabel}>Duration</Text>
                        <View style={s.stepper}>
                            <TouchableOpacity onPress={() => setDuration(Math.max(5, duration - 5))} style={s.stepBtn}>
                                <Text style={s.stepText}>−</Text>
                            </TouchableOpacity>
                            <Text style={s.stepValue}>{duration} min</Text>
                            <TouchableOpacity onPress={() => setDuration(duration + 5)} style={s.stepBtn}>
                                <Text style={s.stepText}>+</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                    <View style={s.divider} />

                    {/* Priority */}
                    <View style={s.metaRow}>
                        <MaterialIcons name="flag" size={18} color={theme.colors.textSecondary} style={s.metaIcon} />
                        <Text style={s.metaLabel}>Priority</Text>
                        <View style={s.prioritySegmented}>
                            {PRIORITIES.map(p => (
                                <TouchableOpacity
                                    key={p.key}
                                    style={[s.prioritySeg, priority === p.key && { backgroundColor: p.color }]}
                                    onPress={() => setPriority(p.key)}
                                >
                                    <Text style={[s.priorityText, priority === p.key && { color: '#FFF' }]}>{p.label}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                </View>

                {/* Notes */}
                <View style={s.notesCard}>
                    <TextInput
                        style={s.notesInput}
                        placeholder="Add notes, links, resources..."
                        placeholderTextColor={theme.colors.textSecondary}
                        value={notes}
                        onChangeText={setNotes}
                        multiline
                        numberOfLines={4}
                    />
                </View>

                {/* Premium feature */}
                <TouchableOpacity style={s.premiumRow}>
                    <MaterialIcons name="auto-awesome" size={18} color={theme.accent.violet} />
                    <Text style={[s.premiumText, { color: theme.accent.violet }]}>Split into Subtasks</Text>
                    <MaterialIcons name="lock" size={14} color={theme.accent.violet} />
                </TouchableOpacity>

                {isEdit && (
                    <TouchableOpacity style={s.deleteBtn} onPress={handleDelete}>
                        <Text style={s.deleteText}>Delete Task</Text>
                    </TouchableOpacity>
                )}

                <View style={{ height: 120 }} />
            </ScrollView>
        </ScreenWrapper>
    );
}

const styles = (theme: any) => StyleSheet.create({
    safe: { flex: 1, backgroundColor: theme.colors.background },
    navBar: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        paddingHorizontal: 20, paddingVertical: 14,
    },
    navBack: { fontSize: 15, color: theme.colors.textSecondary },
    navTitle: { fontSize: 18, fontWeight: '600', color: theme.colors.textPrimary },
    navSave: { fontSize: 15, color: theme.accent.violet, fontWeight: '600' },
    scroll: { flex: 1 },
    content: { paddingHorizontal: 20 },
    typeChip: {
        backgroundColor: theme.colors.elevated, borderRadius: 9999,
        paddingHorizontal: 16, paddingVertical: 9, marginRight: 8,
    },
    typeChipActive: { backgroundColor: theme.accent.violet },
    typeText: { fontSize: 14, color: theme.colors.textSecondary, fontWeight: '500' },
    titleInput: {
        fontSize: 22, fontWeight: '700', color: theme.colors.textPrimary,
        paddingVertical: 8, marginBottom: 20,
    },
    metaCard: {
        backgroundColor: theme.colors.card, borderRadius: 16, marginBottom: 16, overflow: 'hidden',
    },
    metaRow: {
        flexDirection: 'row', alignItems: 'center',
        paddingHorizontal: 16, paddingVertical: 14, gap: 8,
    },
    metaIcon: {},
    metaLabel: { fontSize: 14, color: theme.colors.textSecondary, width: 60 },
    metaValue: { fontSize: 14, color: theme.colors.textPrimary, flex: 1 },
    removeChip: {
        backgroundColor: theme.colors.elevated, borderRadius: 9999,
        paddingHorizontal: 8, paddingVertical: 3,
    },
    removeText: { fontSize: 11, color: theme.colors.textSecondary },
    divider: { height: 1, backgroundColor: theme.colors.divider, marginHorizontal: 16 },
    subjectChip: {
        backgroundColor: theme.colors.elevated, borderRadius: 9999,
        paddingHorizontal: 10, paddingVertical: 5, marginRight: 6,
    },
    subjectText: { fontSize: 12, color: theme.colors.textSecondary, fontWeight: '500' },
    stepper: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    stepBtn: {
        width: 30, height: 30, borderRadius: 15,
        backgroundColor: theme.colors.elevated, justifyContent: 'center', alignItems: 'center',
    },
    stepText: { fontSize: 18, color: theme.colors.textPrimary, fontWeight: '300' },
    stepValue: { fontSize: 14, color: theme.colors.textPrimary, minWidth: 60, textAlign: 'center' },
    prioritySegmented: {
        flexDirection: 'row',
        backgroundColor: theme.colors.elevated, borderRadius: 9999, overflow: 'hidden',
    },
    prioritySeg: { paddingHorizontal: 14, paddingVertical: 6 },
    priorityText: { fontSize: 12, color: theme.colors.textSecondary, fontWeight: '500' },
    notesCard: {
        backgroundColor: theme.colors.elevated, borderRadius: 16, padding: 16, marginBottom: 16,
    },
    notesInput: { fontSize: 15, color: theme.colors.textPrimary, minHeight: 80 },
    premiumRow: {
        flexDirection: 'row', alignItems: 'center', gap: 8,
        borderWidth: 1, borderColor: theme.accent.violet + '55', borderRadius: 9999,
        paddingHorizontal: 16, paddingVertical: 10, alignSelf: 'center', marginBottom: 20,
    },
    premiumText: { fontSize: 14, fontWeight: '500' },
    deleteBtn: { alignItems: 'center', marginBottom: 16 },
    deleteText: { fontSize: 14, color: theme.accent.coral },
});
