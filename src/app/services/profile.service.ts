/**
 * Profile Service
 */
import { supabase } from './supabase';

export interface Profile {
    id: string;
    display_name: string | null;
    avatar_url: string | null;
    streak: number;
    total_focus_min: number;
    created_at: string;
}

export const profileService = {

    get: async (userId: string): Promise<Profile | null> => {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();
        if (error) throw error;
        return data;
    },

    update: async (userId: string, updates: Partial<Profile>) => {
        const { data, error } = await supabase
            .from('profiles')
            .update(updates)
            .eq('id', userId)
            .select()
            .single();
        if (error) throw error;
        return data;
    },

    incrementFocus: async (userId: string, minutes: number) => {
        const { error } = await supabase.rpc('increment_focus', {
            uid: userId,
            mins: minutes,
        });
        if (error) {
            // Fallback: manual update
            const profile = await profileService.get(userId);
            if (profile) {
                await profileService.update(userId, {
                    total_focus_min: profile.total_focus_min + minutes,
                });
            }
        }
    },
};
