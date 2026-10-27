/**
 * Subjects Service
 */
import { supabase } from './supabase';
import type { Subject, ClassSession } from '../../types';

// ── DB row types ──────────────────────────────────────────────────────────────
interface SubjectRow {
    id: string; user_id: string; name: string; color: string; teacher: string | null; created_at: string;
}
interface ClassSessionRow {
    id: string; user_id: string; subject_id: string; day: number;
    start_time: string; end_time: string; location: string | null; repeat: string;
}

// ── Mappers ───────────────────────────────────────────────────────────────────
const toSubject = (r: SubjectRow): Subject => ({ id: r.id, name: r.name, color: r.color, teacher: r.teacher ?? undefined });
const toSession = (r: ClassSessionRow): ClassSession => ({
    id: r.id, subjectId: r.subject_id, day: r.day,
    startTime: r.start_time, endTime: r.end_time,
    location: r.location ?? undefined, repeat: r.repeat as ClassSession['repeat'],
});

export const subjectsService = {

    listSubjects: async (): Promise<Subject[]> => {
        const { data, error } = await supabase.from('subjects').select('*').order('created_at');
        if (error) throw error;
        return (data as SubjectRow[]).map(toSubject);
    },

    addSubject: async (subject: Omit<Subject, 'id'>) => {
        const { data: { user } } = await supabase.auth.getUser();
        const { data, error } = await supabase.from('subjects')
            .insert({ user_id: user!.id, name: subject.name, color: subject.color, teacher: subject.teacher })
            .select().single();
        if (error) throw error;
        return toSubject(data as SubjectRow);
    },

    removeSubject: async (id: string) => {
        const { error } = await supabase.from('subjects').delete().eq('id', id);
        if (error) throw error;
    },

    // ── Class Sessions ────────────────────────────────────────────────────────

    listClassSessions: async (): Promise<ClassSession[]> => {
        const { data, error } = await supabase.from('class_sessions').select('*');
        if (error) throw error;
        return (data as ClassSessionRow[]).map(toSession);
    },

    addClassSession: async (session: Omit<ClassSession, 'id'>) => {
        const { data: { user } } = await supabase.auth.getUser();
        const { data, error } = await supabase.from('class_sessions')
            .insert({
                user_id: user!.id, subject_id: session.subjectId,
                day: session.day, start_time: session.startTime, end_time: session.endTime,
                location: session.location, repeat: session.repeat,
            })
            .select().single();
        if (error) throw error;
        return toSession(data as ClassSessionRow);
    },

    removeClassSession: async (id: string) => {
        const { error } = await supabase.from('class_sessions').delete().eq('id', id);
        if (error) throw error;
    },
};
