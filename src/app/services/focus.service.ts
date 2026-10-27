/**
 * Focus & Garden Service
 */
import { supabase } from './supabase';
import type { FocusSession, PlantSession } from '../../types';

// ── Mappers ────────────────────────────────────────────────────────────────────
const toFocus = (r: any): FocusSession => ({
    id: r.id, subjectId: r.subject_id, taskId: r.task_id ?? undefined,
    duration: r.duration, date: r.date,
    quality: r.quality ?? undefined, completed: r.completed,
    note: r.note ?? undefined,
});

const toPlant = (r: any): PlantSession => ({
    id: r.id, subjectId: r.subject_id,
    plantType: r.plant_type, plantEmoji: r.plant_emoji,
    duration: r.duration,
    status: r.status as PlantSession['status'],
    stage: r.stage as PlantSession['stage'],
    startedAt: r.started_at, endedAt: r.ended_at ?? undefined,
    strictMode: r.strict_mode,
});

export const focusService = {

    // ── Focus Sessions ──────────────────────────────────────────────────────────

    listFocusSessions: async (): Promise<FocusSession[]> => {
        const { data, error } = await supabase
            .from('focus_sessions').select('*').order('created_at', { ascending: false }).limit(100);
        if (error) throw error;
        return data.map(toFocus);
    },

    addFocusSession: async (session: Omit<FocusSession, 'id'>): Promise<FocusSession> => {
        const { data: { user } } = await supabase.auth.getUser();
        const { data, error } = await supabase.from('focus_sessions')
            .insert({
                user_id: user!.id,
                subject_id: session.subjectId || null,
                task_id: session.taskId || null,
                duration: session.duration, date: session.date,
                quality: session.quality, completed: session.completed, note: session.note,
            })
            .select().single();
        if (error) throw error;
        return toFocus(data);
    },

    // ── Plant Sessions (Garden) ─────────────────────────────────────────────────

    listPlantSessions: async (): Promise<PlantSession[]> => {
        const { data, error } = await supabase
            .from('plant_sessions').select('*').order('started_at', { ascending: false }).limit(100);
        if (error) throw error;
        return data.map(toPlant);
    },

    addPlantSession: async (session: Omit<PlantSession, 'id'>): Promise<PlantSession> => {
        const { data: { user } } = await supabase.auth.getUser();
        const { data, error } = await supabase.from('plant_sessions')
            .insert({
                user_id: user!.id,
                subject_id: session.subjectId || null,
                plant_type: session.plantType, plant_emoji: session.plantEmoji,
                duration: session.duration, status: session.status, stage: session.stage,
                started_at: session.startedAt, ended_at: session.endedAt ?? null,
                strict_mode: session.strictMode,
            })
            .select().single();
        if (error) throw error;
        return toPlant(data);
    },

    updatePlantSession: async (id: string, updates: Partial<PlantSession>): Promise<void> => {
        const { error } = await supabase.from('plant_sessions')
            .update({
                status: updates.status, stage: updates.stage,
                ended_at: updates.endedAt ?? null,
            })
            .eq('id', id);
        if (error) throw error;
    },
};
