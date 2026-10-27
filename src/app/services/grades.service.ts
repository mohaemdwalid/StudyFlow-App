/**
 * Grades Service
 */
import { supabase } from './supabase';
import type { GradeItem } from '../../types';

interface GradeRow {
    id: string; user_id: string; subject_id: string; category: string;
    label: string; score: number; total: number; date: string | null;
}

const toGrade = (r: GradeRow): GradeItem => ({
    id: r.id, subjectId: r.subject_id,
    category: r.category as GradeItem['category'],
    label: r.label, score: r.score, total: r.total,
    date: r.date ?? '',
});

export const gradesService = {

    listAll: async (): Promise<GradeItem[]> => {
        const { data, error } = await supabase
            .from('grade_items').select('*').order('date', { ascending: false });
        if (error) throw error;
        return (data as GradeRow[]).map(toGrade);
    },

    add: async (grade: Omit<GradeItem, 'id'>): Promise<GradeItem> => {
        const { data: { user } } = await supabase.auth.getUser();
        const { data, error } = await supabase.from('grade_items')
            .insert({
                user_id: user!.id, subject_id: grade.subjectId,
                category: grade.category, label: grade.label,
                score: grade.score, total: grade.total, date: grade.date,
            })
            .select().single();
        if (error) throw error;
        return toGrade(data as GradeRow);
    },

    remove: async (id: string) => {
        const { error } = await supabase.from('grade_items').delete().eq('id', id);
        if (error) throw error;
    },
};
