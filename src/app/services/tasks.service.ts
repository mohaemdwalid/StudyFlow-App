/**
 * Tasks Service
 */
import { supabase } from './supabase';
import type { Task } from '../../types';

interface TaskRow {
    id: string; user_id: string; subject_id: string | null; title: string;
    type: string; status: string; priority: string;
    due_date: string | null; due_time: string | null;
    estimated_minutes: number | null; notes: string | null; created_at: string;
}
interface SubtaskRow { id: string; task_id: string; title: string; completed: boolean; }

const toTask = (r: TaskRow, subtasks: SubtaskRow[] = []): Task => ({
    id: r.id,
    subjectId: r.subject_id ?? '',
    title: r.title,
    type: r.type as Task['type'],
    status: r.status as Task['status'],
    priority: r.priority as Task['priority'],
    dueDate: r.due_date ?? '',
    dueTime: r.due_time ?? undefined,
    estimatedMinutes: r.estimated_minutes ?? 0,
    notes: r.notes ?? undefined,
    subtasks: subtasks.map((s) => ({ id: s.id, title: s.title, completed: s.completed })),
});

export const tasksService = {

    listAll: async (): Promise<Task[]> => {
        const { data: tasks, error } = await supabase
            .from('tasks').select('*, subtasks(*)').order('created_at', { ascending: false });
        if (error) throw error;
        return (tasks as any[]).map((r) => toTask(r, r.subtasks ?? []));
    },

    add: async (task: Omit<Task, 'id'>): Promise<Task> => {
        const { data: { user } } = await supabase.auth.getUser();
        const { data, error } = await supabase.from('tasks')
            .insert({
                user_id: user!.id,
                subject_id: task.subjectId || null,
                title: task.title, type: task.type,
                status: task.status, priority: task.priority,
                due_date: task.dueDate, due_time: task.dueTime,
                estimated_minutes: task.estimatedMinutes, notes: task.notes,
            })
            .select().single();
        if (error) throw error;

        // Insert subtasks if any
        if (task.subtasks && task.subtasks.length > 0) {
            await supabase.from('subtasks').insert(
                task.subtasks.map((st) => ({ task_id: data.id, title: st.title, completed: st.completed }))
            );
        }
        return toTask(data as TaskRow, task.subtasks?.map((st, i) => ({ id: `temp-${i}`, task_id: data.id, title: st.title, completed: st.completed })) ?? []);
    },

    toggleStatus: async (id: string, currentStatus: string): Promise<string> => {
        const newStatus = currentStatus === 'completed' ? 'pending' : 'completed';
        const { error } = await supabase.from('tasks').update({ status: newStatus }).eq('id', id);
        if (error) throw error;
        return newStatus;
    },

    update: async (id: string, updates: Partial<Task>) => {
        const { error } = await supabase.from('tasks').update({
            title: updates.title, status: updates.status, priority: updates.priority,
            due_date: updates.dueDate, notes: updates.notes,
        }).eq('id', id);
        if (error) throw error;
    },

    remove: async (id: string) => {
        const { error } = await supabase.from('tasks').delete().eq('id', id);
        if (error) throw error;
    },
};
