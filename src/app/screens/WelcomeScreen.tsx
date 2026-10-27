import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Dimensions, ActivityIndicator, Alert, Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import Svg, { Path } from 'react-native-svg';
import { useTheme } from '../theme';
import { ScreenWrapper } from '../components';
import { signInWithGoogle, signInWithApple, isAppleSignInAvailable } from '../services';

const { width } = Dimensions.get('window');

export default function WelcomeScreen({ navigation }: { navigation: any }) {
  const theme = useTheme();
  const [loadingBtn, setLoadingBtn] = useState<'apple' | 'google' | null>(null);
  const goSignIn = () => navigation.navigate('SignIn');

  const handleGoogle = async () => {
    setLoadingBtn('google');
    try {
      await signInWithGoogle();
      // Auth state listener in App.tsx handles navigation
    } catch (err: any) {
      Alert.alert('Google Sign-In Failed', err.message ?? 'Please try again.');
    } finally {
      setLoadingBtn(null);
    }
  };

  const handleApple = async () => {
    if (Platform.OS !== 'ios') {
      Alert.alert('Not available', 'Apple Sign-In is only available on iOS.');
      return;
    }
    const available = await isAppleSignInAvailable();
    if (!available) {
      Alert.alert('Not available', 'Apple Sign-In is not available on this device.');
      return;
    }
    setLoadingBtn('apple');
    try {
      await signInWithApple();
    } catch (err: any) {
      if ((err as any).code !== 'ERR_REQUEST_CANCELED') {
        Alert.alert('Apple Sign-In Failed', err.message ?? 'Please try again.');
      }
    } finally {
      setLoadingBtn(null);
    }
  };

  return (
    <LinearGradient
      colors={['#0D0720', '#1E1050', '#2D1B7B', '#1A0A3E']}
      locations={[0, 0.3, 0.6, 1]}
      style={styles.gradient}
    >
      <ScreenWrapper backgroundColor="transparent" style={styles.wrapper}>

        {/* ─── Hero ─────────────────────────────────── */}
        <View style={styles.hero}>

          {/* Decorative background rings */}
          <View style={[styles.ring, styles.ring3, { borderColor: '#7C6FF720' }]} />
          <View style={[styles.ring, styles.ring2, { borderColor: '#7C6FF730' }]} />
          <View style={[styles.ring, styles.ring1, { borderColor: '#7C6FF740' }]} />

          {/* Logo */}
          <View style={styles.logoGlow}>
            <LinearGradient
              colors={['#9D8DF7', '#5B46F0']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.logoCircle}
            >
              <MaterialIcons name="psychology" size={48} color="#fff" />
            </LinearGradient>
          </View>

          <Text style={styles.title}>StudyFlow</Text>
          <View style={styles.taglinePill}>
            <MaterialIcons name="auto-awesome" size={13} color="#C4B5FD" />
            <Text style={styles.taglinePillText}>AI-Powered Study Companion</Text>
          </View>

          {/* 3 feature pills */}
          <View style={styles.features}>
            {[['calendar-today', 'Plan Smarter'], ['timer', 'Focus Deeper'], ['bar-chart', 'Score Higher']].map(([icon, label]) => (
              <View key={label} style={styles.featurePill}>
                <MaterialIcons name={icon as any} size={14} color="#A78BFA" />
                <Text style={styles.featureText}>{label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* ─── Auth Buttons ─────────────────────────── */}
        <View style={styles.authSection}>

          {/* Apple Button */}
          <TouchableOpacity
            style={[styles.appleBtn, loadingBtn !== null && styles.btnDisabled]}
            onPress={handleApple}
            activeOpacity={0.85}
            disabled={loadingBtn !== null}
          >
            {loadingBtn === 'apple'
              ? <ActivityIndicator color="#fff" size="small" />
              : <Ionicons name="logo-apple" size={22} color="#fff" />}
            <Text style={styles.appleBtnText}>Continue with Apple</Text>
          </TouchableOpacity>

          {/* Google Button */}
          <TouchableOpacity
            style={[styles.googleBtn, loadingBtn !== null && styles.btnDisabled]}
            onPress={handleGoogle}
            activeOpacity={0.85}
            disabled={loadingBtn !== null}
          >
            {loadingBtn === 'google'
              ? <ActivityIndicator color="#1F1F1F" size="small" />
              : (
                <Svg width={20} height={20} viewBox="0 0 48 48">
                  <Path d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z" fill="#FFC107" />
                  <Path d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z" fill="#FF3D00" />
                  <Path d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z" fill="#4CAF50" />
                  <Path d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z" fill="#1976D2" />
                </Svg>
              )}
            <Text style={styles.googleBtnText}>Continue with Google</Text>
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Email Button */}
          <TouchableOpacity onPress={goSignIn} activeOpacity={0.85}>
            <LinearGradient
              colors={['#7C6FF7', '#4F46E5']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.emailBtn}
            >
              <MaterialIcons name="email" size={20} color="#fff" />
              <Text style={styles.emailBtnText}>Sign in with Email</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* ─── Footer ───────────────────────────────── */}
        <Text style={styles.privacy}>
          By continuing, you agree to our{' '}
          <Text style={styles.privacyLink}>Terms</Text>
          {' '}and{' '}
          <Text style={styles.privacyLink}>Privacy Policy</Text>
        </Text>

      </ScreenWrapper>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  wrapper: { paddingHorizontal: 24, justifyContent: 'space-between', paddingBottom: 8 },

  // ── Hero ──
  hero: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 20,
  },

  // Decorative rings
  ring: {
    position: 'absolute',
    borderRadius: 999,
    borderWidth: 1,
  },
  ring1: { width: 180, height: 180 },
  ring2: { width: 260, height: 260 },
  ring3: { width: 340, height: 340 },

  logoGlow: {
    shadowColor: '#7C6FF7',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 32,
    elevation: 16,
    marginBottom: 24,
  },
  logoCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },

  title: {
    fontSize: 40,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -1,
    marginBottom: 12,
  },

  taglinePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#ffffff18',
    borderWidth: 1,
    borderColor: '#ffffff22',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
    marginBottom: 20,
  },
  taglinePillText: {
    fontSize: 13,
    color: '#C4B5FD',
    fontWeight: '500',
  },

  features: {
    flexDirection: 'row',
    gap: 10,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  featurePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#ffffff10',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  featureText: {
    fontSize: 12,
    color: '#DDD6FE',
    fontWeight: '500',
  },

  // ── Auth Buttons ──
  authSection: { gap: 12, paddingBottom: 4 },

  btnDisabled: { opacity: 0.6 },
  appleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: '#111',
    borderRadius: 16,
    height: 56,
    borderWidth: 1,
    borderColor: '#333',
  },
  appleBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.1,
  },

  googleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: '#fff',
    borderRadius: 16,
    height: 56,
  },
  googleBtnText: {
    color: '#1F1F1F',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.1,
  },

  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginVertical: 2,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#ffffff25',
  },
  dividerText: {
    color: '#ffffff60',
    fontSize: 13,
    fontWeight: '500',
  },

  emailBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    borderRadius: 16,
    height: 56,
  },
  emailBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.2,
  },

  // ── Footer ──
  privacy: {
    textAlign: 'center',
    fontSize: 12,
    color: '#ffffff45',
    paddingBottom: 12,
    lineHeight: 18,
  },
  privacyLink: {
    color: '#A78BFA',
    fontWeight: '600',
  },
});
