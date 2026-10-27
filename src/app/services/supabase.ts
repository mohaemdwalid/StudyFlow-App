/**
 * Supabase Client — singleton with AsyncStorage session persistence
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_ANON } from '../../config';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON, {
    auth: {
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
    },
});
