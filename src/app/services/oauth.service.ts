/**
 * OAuth Service — Google & Apple Sign-In
 *
 * Google: uses expo-auth-session to get an ID token, then exchanges with Supabase
 * Apple:  uses expo-apple-authentication to get an identity token, then exchanges with Supabase
 */
import * as WebBrowser from 'expo-web-browser';
import * as AppleAuthentication from 'expo-apple-authentication';
import { makeRedirectUri } from 'expo-auth-session';
import { supabase } from './supabase';

// Required for expo-auth-session to properly close the browser session on return
WebBrowser.maybeCompleteAuthSession();

// ─────────────────────────────────────────────────────────────────────────────
// Google Sign-In
// Uses Supabase's OAuth flow via WebBrowser (works on Expo Go + standalone)
// ─────────────────────────────────────────────────────────────────────────────
export const signInWithGoogle = async () => {
    const redirectTo = makeRedirectUri({ scheme: 'studyflow', path: 'auth/callback' });

    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
            redirectTo,
            skipBrowserRedirect: true,
        },
    });

    if (error) throw error;

    // Open Google's OAuth consent screen in an in-app browser
    const result = await WebBrowser.openAuthSessionAsync(data?.url ?? '', redirectTo);

    if (result.type === 'success') {
        const url = result.url;
        // Extract the session tokens from the redirect URL
        const params = new URLSearchParams(url.split('#')[1] ?? url.split('?')[1] ?? '');
        const accessToken = params.get('access_token');
        const refreshToken = params.get('refresh_token');

        if (accessToken && refreshToken) {
            const { error: sessionError } = await supabase.auth.setSession({
                access_token: accessToken,
                refresh_token: refreshToken,
            });
            if (sessionError) throw sessionError;
            return true;
        }
    }
    return false;
};

// ─────────────────────────────────────────────────────────────────────────────
// Apple Sign-In  (iOS only)
// ─────────────────────────────────────────────────────────────────────────────
export const signInWithApple = async () => {
    const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
            AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
            AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
    });

    if (!credential.identityToken) throw new Error('Apple did not return an identity token.');

    const { data, error } = await supabase.auth.signInWithIdToken({
        provider: 'apple',
        token: credential.identityToken,
        nonce: credential.authorizationCode ?? undefined,
    });

    if (error) throw error;
    return data;
};

export const isAppleSignInAvailable = AppleAuthentication.isAvailableAsync;
