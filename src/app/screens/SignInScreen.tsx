/**
 * SignInScreen — Email / Password Auth
 * Supports both sign-in and sign-up in a single screen with a toggle.
 */
import React, { useState } from 'react';
import {
    View, Text, TextInput, TouchableOpacity,
    StyleSheet, KeyboardAvoidingView, Platform,
    ActivityIndicator, Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../theme';
import { ScreenWrapper } from '../components';
import { authService } from '../services';

export default function SignInScreen({ navigation }: { navigation: any }) {
    const theme = useTheme();
    const [mode, setMode] = useState<'signin' | 'signup'>('signin');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPwd, setShowPwd] = useState(false);

    const submit = async () => {
        if (!email || !password) {
            Alert.alert('Missing fields', 'Please enter your email and password.');
            return;
        }
        if (mode === 'signup' && password.length < 6) {
            Alert.alert('Weak password', 'Password must be at least 6 characters.');
            return;
        }
        setLoading(true);
        try {
            if (mode === 'signin') {
                await authService.signIn(email.trim(), password);
                // Auth state listener in App.tsx will call loadAll() and navigate
            } else {
                await authService.signUp(email.trim(), password, name.trim() || undefined);
                Alert.alert(
                    'Check your email ✉️',
                    'We sent you a confirmation link. Click it to activate your account.',
                    [{ text: 'OK', onPress: () => setMode('signin') }],
                );
            }
        } catch (err: any) {
            Alert.alert('Error', err.message ?? 'Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <LinearGradient
            colors={['#0D0720', '#1E1050', '#1A0A3E']}
            style={styles.gradient}
        >
            <ScreenWrapper backgroundColor="transparent">
                <KeyboardAvoidingView
                    style={styles.inner}
                    behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                    keyboardVerticalOffset={20}
                >
                    {/* Back button */}
                    <TouchableOpacity style={styles.back} onPress={() => {
                        if (navigation.canGoBack()) navigation.goBack();
                    }}>
                        <MaterialIcons name="arrow-back" size={24} color="#EAEAF5" />
                    </TouchableOpacity>

                    {/* Header */}
                    <View style={styles.header}>
                        <LinearGradient
                            colors={['#9D8DF7', '#5B46F0']}
                            style={styles.logoCircle}
                        >
                            <MaterialIcons name="psychology" size={36} color="#fff" />
                        </LinearGradient>
                        <Text style={styles.heading}>
                            {mode === 'signin' ? 'Welcome back' : 'Create account'}
                        </Text>
                        <Text style={styles.subheading}>
                            {mode === 'signin'
                                ? 'Sign in to sync your study data'
                                : 'Start your AI-powered study journey'}
                        </Text>
                    </View>

                    {/* Form */}
                    <View style={styles.form}>
                        {mode === 'signup' && (
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Full Name</Text>
                                <View style={styles.inputRow}>
                                    <MaterialIcons name="person-outline" size={20} color="#A78BFA" style={styles.inputIcon} />
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Ahmed Mohamed"
                                        placeholderTextColor="#ffffff40"
                                        value={name}
                                        onChangeText={setName}
                                        autoCapitalize="words"
                                        returnKeyType="next"
                                    />
                                </View>
                            </View>
                        )}

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Email</Text>
                            <View style={styles.inputRow}>
                                <MaterialIcons name="email" size={20} color="#A78BFA" style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="you@email.com"
                                    placeholderTextColor="#ffffff40"
                                    value={email}
                                    onChangeText={setEmail}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    autoCorrect={false}
                                    returnKeyType="next"
                                />
                            </View>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Password</Text>
                            <View style={styles.inputRow}>
                                <MaterialIcons name="lock-outline" size={20} color="#A78BFA" style={styles.inputIcon} />
                                <TextInput
                                    style={[styles.input, { flex: 1 }]}
                                    placeholder={mode === 'signup' ? 'Min. 6 characters' : '••••••••'}
                                    placeholderTextColor="#ffffff40"
                                    value={password}
                                    onChangeText={setPassword}
                                    secureTextEntry={!showPwd}
                                    returnKeyType="done"
                                    onSubmitEditing={submit}
                                />
                                <TouchableOpacity onPress={() => setShowPwd((v) => !v)} style={styles.eyeBtn}>
                                    <MaterialIcons name={showPwd ? 'visibility-off' : 'visibility'} size={20} color="#ffffff50" />
                                </TouchableOpacity>
                            </View>
                        </View>

                        {mode === 'signin' && (
                            <TouchableOpacity style={styles.forgotBtn} onPress={() => {
                                if (!email.trim()) {
                                    Alert.alert('Enter email', 'Type your email address above, then tap Forgot password.');
                                    return;
                                }
                                authService.resetPassword(email.trim())
                                    .then(() => Alert.alert('Check your email ✉️', 'We sent you a password reset link.'))
                                    .catch((err: any) => Alert.alert('Error', err.message ?? 'Could not send reset email.'));
                            }}>
                                <Text style={styles.forgotText}>Forgot password?</Text>
                            </TouchableOpacity>
                        )}
                    </View>

                    {/* Submit */}
                    <TouchableOpacity onPress={submit} activeOpacity={0.85} disabled={loading}>
                        <LinearGradient
                            colors={['#7C6FF7', '#4F46E5']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.submitBtn}
                        >
                            {loading
                                ? <ActivityIndicator color="#fff" />
                                : <>
                                    <MaterialIcons name={mode === 'signin' ? 'login' : 'person-add'} size={20} color="#fff" />
                                    <Text style={styles.submitText}>
                                        {mode === 'signin' ? 'Sign In' : 'Create Account'}
                                    </Text>
                                </>
                            }
                        </LinearGradient>
                    </TouchableOpacity>

                    {/* Toggle mode */}
                    <View style={styles.toggle}>
                        <Text style={styles.toggleLabel}>
                            {mode === 'signin' ? "Don't have an account?" : 'Already have an account?'}
                        </Text>
                        <TouchableOpacity onPress={() => setMode(mode === 'signin' ? 'signup' : 'signin')}>
                            <Text style={styles.toggleLink}>
                                {mode === 'signin' ? 'Sign Up' : 'Sign In'}
                            </Text>
                        </TouchableOpacity>
                    </View>

                </KeyboardAvoidingView>
            </ScreenWrapper>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    gradient: { flex: 1 },
    inner: { flex: 1, paddingHorizontal: 24, justifyContent: 'center', gap: 24 },

    back: {
        position: 'absolute',
        top: 8,
        left: 0,
        padding: 8,
    },

    header: { alignItems: 'center', gap: 12 },
    logoCircle: {
        width: 64, height: 64, borderRadius: 32,
        alignItems: 'center', justifyContent: 'center',
        marginBottom: 8,
    },
    heading: {
        fontSize: 28, fontWeight: '800', color: '#fff', letterSpacing: -0.5,
    },
    subheading: {
        fontSize: 15, color: '#C4B5FD', textAlign: 'center',
    },

    form: { gap: 16 },
    inputGroup: { gap: 6 },
    label: { fontSize: 13, color: '#A78BFA', fontWeight: '600', letterSpacing: 0.3 },

    inputRow: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: '#ffffff12',
        borderWidth: 1, borderColor: '#ffffff20',
        borderRadius: 14, height: 52,
        paddingHorizontal: 14,
    },
    inputIcon: { marginRight: 10 },
    input: { flex: 1, color: '#fff', fontSize: 15 },
    eyeBtn: { padding: 4 },

    forgotBtn: { alignSelf: 'flex-end' },
    forgotText: { color: '#A78BFA', fontSize: 13, fontWeight: '600' },

    submitBtn: {
        height: 56, borderRadius: 16,
        flexDirection: 'row', alignItems: 'center',
        justifyContent: 'center', gap: 10,
    },
    submitText: { color: '#fff', fontSize: 17, fontWeight: '700' },

    toggle: { flexDirection: 'row', justifyContent: 'center', gap: 6 },
    toggleLabel: { color: '#ffffff60', fontSize: 14 },
    toggleLink: { color: '#A78BFA', fontSize: 14, fontWeight: '700' },
});
