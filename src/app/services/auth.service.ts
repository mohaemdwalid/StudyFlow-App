/**
 * Auth Service — sign up, sign in, sign out, session
 */
import { supabase } from './supabase';

export const authService = {

    /** Sign up with email + password */
    signUp: async (email: string, password: string, displayName?: string) => {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: { data: { full_name: displayName ?? email.split('@')[0] } },
        });
        if (error) throw error;
        return data;
    },

    /** Sign in with email + password */
    signIn: async (email: string, password: string) => {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        return data;
    },

    /** Sign in with magic link */
    signInWithMagicLink: async (email: string) => {
        const { error } = await supabase.auth.signInWithOtp({ email });
        if (error) throw error;
    },

    /** Send password reset email */
    resetPassword: async (email: string) => {
        const { error } = await supabase.auth.resetPasswordForEmail(email);
        if (error) throw error;
    },

    /** Sign out */
    signOut: async () => {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
    },

    /** Get the current session (null if not signed in) */
    getSession: async () => {
        const { data } = await supabase.auth.getSession();
        return data.session;
    },

    /** Get the current user */
    getUser: async () => {
        const { data } = await supabase.auth.getUser();
        return data.user;
    },

    /** Subscribe to auth state changes */
    onAuthStateChange: (callback: (event: string, session: any) => void) => {
        return supabase.auth.onAuthStateChange(callback);
    },
};
