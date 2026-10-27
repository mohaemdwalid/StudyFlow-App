import React, { useState } from 'react';
import {
    View, Text, ScrollView, TouchableOpacity, TextInput, StyleSheet, Modal, Pressable, Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../theme';
import { useAppStore } from '../state';

const COLORS = [
    { id: 'violet', hex: '#6C63FF' },
    { id: 'coral', hex: '#FF6B6B' },
    { id: 'mint', hex: '#4ADEAA' },
    { id: 'amber', hex: '#F59E0B' },
    { id: 'sky', hex: '#38BDF8' },
    { id: 'rose', hex: '#F43F5E' },
    { id: 'lime', hex: '#84CC16' },
    { id: 'orange', hex: '#FB923C' },
    { id: 'indigo', hex: '#818CF8' },
    { id: 'teal', hex: '#2DD4BF' },
];

export default function EditSubjectScreen({ navigation, route }: any) {
    const theme = useTheme();
    const s = styles(theme);
    const { addSubject, removeSubject } = useAppStore();
    const existingSubject = route?.params?.subject;
    const isEdit = !!existingSubject;

    const [name, setName] = useState(existingSubject?.name ?? '');
    const [teacher, setTeacher] = useState(existingSubject?.teacher ?? '');
    const [selectedColor, setSelectedColor] = useState(existingSubject?.color ?? '#6C63FF');

    const handleSave = async () => {
        if (!name.trim()) {
            Alert.alert('Missing name', 'Please enter a subject name.');
            return;
        }
        const id = isEdit ? existingSubject.id : 's' + Date.now();
        await addSubject({
            id,
            name: name.trim(),
            color: selectedColor,
            teacher: teacher.trim() || undefined,
        });
        navigation.goBack();
    };

    const handleDelete = () => {
        Alert.alert('Delete Subject', 'This will also remove all related tasks, exams, and grades.', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Delete', style: 'destructive',
                onPress: async () => { await removeSubject(existingSubject.id); navigation.goBack(); },
            },
        ]);
    };

    return (
        <View style={s.overlay}>
            <Pressable style={s.dimmer} onPress={() => navigation.goBack()} />
            <View style={s.sheet}>
                <View style={s.handle} />

                {/* Title row */}
                <View style={s.titleRow}>
                    <Text style={s.sheetTitle}>{isEdit ? 'Edit Subject' : 'Add Subject'}</Text>
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <Text style={s.cancel}>Cancel</Text>
                    </TouchableOpacity>
                </View>

                {/* Color swatches */}
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.swatchScroll}>
                    {COLORS.map(c => (
                        <TouchableOpacity key={c.id} style={s.swatchWrap} onPress={() => setSelectedColor(c.hex)}>
                            <View style={[
                                s.swatch,
                                { backgroundColor: c.hex },
                                selectedColor === c.hex && s.swatchSelected,
                            ]} />
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                {/* Inputs */}
                <View style={s.inputGroup}>
                    <View style={s.inputRow}>
                        <MaterialIcons name="edit" size={18} color={theme.colors.textSecondary} />
                        <TextInput
                            style={s.input}
                            placeholder="Subject Name"
                            placeholderTextColor={theme.colors.textSecondary}
                            value={name}
                            onChangeText={setName}
                        />
                    </View>
                    <View style={s.divider} />
                    <View style={s.inputRow}>
                        <MaterialIcons name="person" size={18} color={theme.colors.textSecondary} />
                        <TextInput
                            style={s.input}
                            placeholder="Teacher (optional)"
                            placeholderTextColor={theme.colors.textSecondary}
                            value={teacher}
                            onChangeText={setTeacher}
                        />
                    </View>
                </View>

                {/* Danger zone */}
                {isEdit && (
                    <View style={s.dangerSection}>
                        <TouchableOpacity style={s.dangerRow} onPress={handleDelete}>
                            <MaterialIcons name="delete" size={18} color={theme.accent.coral} />
                            <Text style={[s.dangerText, { color: theme.accent.coral }]}>Delete Subject</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {/* Save CTA */}
                <TouchableOpacity style={s.cta} onPress={handleSave}>
                    <LinearGradient colors={['#6C63FF', '#4F46E5']} style={s.ctaGrad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                        <Text style={s.ctaText}>Save Subject</Text>
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
    swatchScroll: { marginBottom: 20 },
    swatchWrap: { padding: 4 },
    swatch: { width: 32, height: 32, borderRadius: 16 },
    swatchSelected: { borderWidth: 3, borderColor: '#6C63FF', transform: [{ scale: 1.15 }] },
    inputGroup: {
        backgroundColor: theme.colors.card,
        borderRadius: 12, marginBottom: 16, overflow: 'hidden',
    },
    inputRow: {
        flexDirection: 'row', alignItems: 'center',
        paddingHorizontal: 14, paddingVertical: 14, gap: 10,
    },
    input: { flex: 1, fontSize: 15, color: theme.colors.textPrimary },
    divider: { height: 1, backgroundColor: theme.colors.divider, marginHorizontal: 14 },
    dangerSection: {
        backgroundColor: theme.colors.card, borderRadius: 12, marginBottom: 16, overflow: 'hidden',
    },
    dangerRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 14, paddingVertical: 14 },
    dangerText: { fontSize: 15, fontWeight: '500' },
    cta: { borderRadius: 9999, overflow: 'hidden' },
    ctaGrad: { paddingVertical: 16, alignItems: 'center' },
    ctaText: { fontSize: 16, fontWeight: '600', color: '#FFF' },
});
