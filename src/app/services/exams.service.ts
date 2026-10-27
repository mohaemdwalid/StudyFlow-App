/**
 * Exams Service
 */
import { supabase } from './supabase';
import type { Exam } from '../../types';

interface ExamRow {
    id: string; user_id: string; subject_id: string; title: string;
    date: string; time: string | null; location: string | null; weight: number; created_at: string;
}
interface TopicRow { id: string; exam_id: string; label: string; completed: boolean; }

const toExam = (r: ExamRow, topics: TopicRow[] = []): Exam => ({
    id: r.id, subjectId: r.subject_id, title: r.title,
    date: r.date, time: r.time ?? undefined, location: r.location ?? undefined,
    weight: r.weight,
    topics: topics.map((t) => ({ id: t.id, label: t.label, completed: t.completed })),
});

export const examsService = {

    listAll: async (): Promise<Exam[]> => {
        const { data, error } = await supabase
            .from('exams').select('*, exam_topics(*)').order('date');
        if (error) throw error;
        return (data as any[]).map((r) => toExam(r, r.exam_topics ?? []));
    },

    add: async (exam: Omit<Exam, 'id'>): Promise<Exam> => {
        const { data: { user } } = await supabase.auth.getUser();
        const { data, error } = await supabase.from('exams')
            .insert({
                user_id: user!.id, subject_id: exam.subjectId, title: exam.title,
                date: exam.date, time: exam.time, location: exam.location, weight: exam.weight,
            })
            .select().single();
        if (error) throw error;

        if (exam.topics && exam.topics.length > 0) {
            await supabase.from('exam_topics').insert(
                exam.topics.map((t) => ({ exam_id: data.id, label: t.label, completed: t.completed }))
            );
        }
        const topicRows = (exam.topics ?? []).map((t) => ({ id: t.id, exam_id: data.id, label: t.label, completed: t.completed }));
        return toExam(data as ExamRow, topicRows);
    },

    toggleTopic: async (examId: string, topicId: string, current: boolean) => {
        const { error } = await supabase.from('exam_topics')
            .update({ completed: !current })
            .eq('id', topicId);
        if (error) throw error;
    },

    remove: async (id: string) => {
        const { error } = await supabase.from('exams').delete().eq('id', id);
        if (error) throw error;
    },
};
