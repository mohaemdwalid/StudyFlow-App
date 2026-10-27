import React, { useState } from 'react';
import {
    View, Text, ScrollView, TouchableOpacity, TextInput, StyleSheet, Pressable, Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../theme';
import { useAppStore } from '../state';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const REPEATS = ['none', 'weekly', 'biweekly', 'custom'] as const;
const REPEAT_LABELS: Record<string, string> = { none: 'None', weekly: 'Weekly', biweekly: 'Every 2 Weeks', custom: 'Custom' };

export default function EditClassScreen({ navigation }: any) {
    const theme = useTheme();
    const s = styles(theme);
    const { subjects, addClassSession } = useAppStore();

    const [subjectId, setSubjectId] = useState(subjects[0]?.id ?? '');
    const [days, setDays] = useState<number[]>([1, 3]); // Mon=1, Wed=3
    const [startTime, setStartTime] = useState('09:00');
    const [endTime, setEndTime] = useState('10:00');
    const [repeat, setRepeat] = useState<typeof REPEATS[number]>('weekly');
    const [location, setLocation] = useState('');

    const toggleDay = (dayIndex: number) =>
        setDays(prev => prev.includes(dayIndex) ? prev.filter(x => x !== dayIndex) : [...prev, dayIndex]);

    const handleSave = async () => {
        if (days.length === 0) {
            Alert.alert('No days selected', 'Please select at least one day.');
            return;
        }
        // Create one class session per selected day
        for (const day of days) {
            const id = 'cs' + Date.now() + day;
            await addClassSession({
                id,
                subjectId,
                day,
                startTime,
                endTime,
                location: location.trim() || undefined,
                repeat,
            });
        }
        navigation.goBack();
    };

    return (
        <View style={s.overlay}>
            <Pressable style={s.dimmer} onPress={() => navigation.goBack()} />
            <View style={s.sheet}>
                <View style={s.handle} />

                <View style={s.titleRow}>
                    <Text style={s.sheetTitle}>Add Class</Text>
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <Text style={s.cancel}>Cancel</Text>
                    </TouchableOpacity>
                </View>

                <ScrollView showsVerticalScrollIndicator={false}>
                    {/* Subject picker */}
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
                        {subjects.map(sub => (
                            <TouchableOpacity
                                key={sub.id}
                                style={[s.subjectChip, subjectId === sub.id && { borderColor: theme.accent.violet, borderWidth: 2 }]}
                                onPress={() => setSubjectId(sub.id)}
                            >
                                <View style={[s.subjectDot, { backgroundColor: sub.color }]} />
                                <Text style={[s.subjectLabel, { color: sub.id === subjectId ? theme.colors.textPrimary : theme.colors.textSecondary }]}>
                                    {sub.name}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>

                    {/* Day selector */}
                    <View style={s.dayRow}>
                        {DAYS.map((d, i) => (
                            <TouchableOpacity
                                key={d}
                                style={[s.dayChip, days.includes(i + 1) && s.dayChipActive]}
                                onPress={() => toggleDay(i + 1)}
                            >
                                <Text style={[s.dayText, days.includes(i + 1) && s.dayTextActive]}>{d}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* Time pickers */}
                    <View style={s.timeRow}>
                        <View style={s.timeField}>
                            <MaterialIcons name="schedule" size={16} color={theme.colors.textSecondary} />
                            <TextInput
                                style={s.timeText}
                                value={startTime}
                                onChangeText={setStartTime}
                                placeholder="09:00"
                                placeholderTextColor={theme.colors.textSecondary}
                            />
                        </View>
                        <View style={s.timeField}>
                            <MaterialIcons name="schedule" size={16} color={theme.accent.coral} />
                            <TextInput
                                style={[s.timeText, { color: theme.accent.coral }]}
                                value={endTime}
                                onChangeText={setEndTime}
                                placeholder="10:00"
                                placeholderTextColor={theme.colors.textSecondary}
                            />
                        </View>
                    </View>

                    {/* Repeat */}
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginVertical: 12 }}>
                        {REPEATS.map(r => (
                            <TouchableOpacity
                                key={r}
                                style={[s.repeatChip, repeat === r && s.repeatChipActive]}
                                onPress={() => setRepeat(r)}
                            >
                                <Text style={[s.repeatText, repeat === r && { color: '#FFF' }]}>{REPEAT_LABELS[r]}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>

                    {/* Location */}
                    <View style={s.inputRow}>
                        <MaterialIcons name="place" size={18} color={theme.colors.textSecondary} />
                        <TextInput
                            style={s.input}
                            value={location}
                            onChangeText={setLocation}
                            placeholder="Location (optional)"
                            placeholderTextColor={theme.colors.textSecondary}
                        />
                    </View>

                    <View style={{ height: 20 }} />
                    <TouchableOpacity style={s.cta} onPress={handleSave}>
                        <LinearGradient colors={['#6C63FF', '#4F46E5']} style={s.ctaGrad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                            <Text style={s.ctaText}>Save Class</Text>
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
        padding: 20, maxHeight: '90%',
    },
    handle: {
        width: 32, height: 4, borderRadius: 99,
        backgroundColor: theme.colors.textSecondary,
        alignSelf: 'center', marginBottom: 20, opacity: 0.5,
    },
    titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    sheetTitle: { fontSize: 18, fontWeight: '600', color: theme.colors.textPrimary },
    cancel: { fontSize: 15, color: theme.accent.violet },
    subjectChip: {
        flexDirection: 'row', alignItems: 'center', gap: 6,
        backgroundColor: theme.colors.card, borderRadius: 9999,
        paddingHorizontal: 14, paddingVertical: 8, marginRight: 8,
        borderWidth: 0,
    },
    subjectDot: { width: 10, height: 10, borderRadius: 5 },
    subjectLabel: { fontSize: 13, fontWeight: '500' },
    dayRow: { flexDirection: 'row', gap: 6, marginBottom: 16 },
    dayChip: {
        flex: 1, paddingVertical: 8, borderRadius: 9999,
        backgroundColor: theme.colors.elevated, alignItems: 'center',
    },
    dayChipActive: { backgroundColor: theme.accent.violet },
    dayText: { fontSize: 11, color: theme.colors.textSecondary, fontWeight: '500' },
    dayTextActive: { color: '#FFF' },
    timeRow: { flexDirection: 'row', gap: 12, marginBottom: 4 },
    timeField: {
        flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8,
        backgroundColor: theme.colors.card, borderRadius: 12,
        paddingHorizontal: 14, paddingVertical: 14,
    },
    timeText: { fontSize: 15, color: theme.colors.textPrimary },
    errorText: { fontSize: 12, color: theme.accent.coral, marginBottom: 8 },
    repeatChip: {
        backgroundColor: theme.colors.elevated, borderRadius: 9999,
        paddingHorizontal: 14, paddingVertical: 8, marginRight: 8,
    },
    repeatChipActive: { backgroundColor: theme.accent.violet },
    repeatText: { fontSize: 13, color: theme.colors.textSecondary, fontWeight: '500' },
    inputRow: {
        flexDirection: 'row', alignItems: 'center', gap: 10,
        backgroundColor: theme.colors.card, borderRadius: 12,
        paddingHorizontal: 14, paddingVertical: 14, marginBottom: 16,
    },
    input: { flex: 1, fontSize: 15, color: theme.colors.textPrimary },
    copyRow: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10,
    },
    copyLabel: { fontSize: 15, color: theme.colors.textPrimary },
    toggleTrack: {
        width: 46, height: 26, borderRadius: 13,
        backgroundColor: theme.colors.divider, padding: 2,
    },
    toggleTrackActive: { backgroundColor: theme.accent.violet },
    toggleThumb: {
        width: 22, height: 22, borderRadius: 11, backgroundColor: '#FFF',
    },
    toggleThumbActive: { alignSelf: 'flex-end' },
    copyDaysRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
    copyDayChip: {
        backgroundColor: theme.colors.elevated, borderRadius: 9999,
        paddingHorizontal: 14, paddingVertical: 6,
    },
    copyDayText: { fontSize: 13, color: theme.colors.textSecondary },
    cta: { borderRadius: 9999, overflow: 'hidden' },
    ctaGrad: { paddingVertical: 16, alignItems: 'center' },
    ctaText: { fontSize: 16, fontWeight: '600', color: '#FFF' },
});
