import 'react-native-reanimated';
import 'react-native-gesture-handler';
import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SplashScreen from 'expo-splash-screen';
import { ThemeProvider } from './src/app/theme';
import { AppNavigator } from './src/app/navigation';
import AppSplashScreen from './src/app/components/AppSplashScreen';
import { authService } from './src/app/services';
import { useAppStore } from './src/app/state';

// Keep the native splash screen visible until we explicitly hide it
SplashScreen.preventAutoHideAsync();

const ONBOARDING_KEY = '@studyflow_onboarding_done';

function AppRoot() {
  const { loadAll, reset, setUserId, setOnboarded } = useAppStore();
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    let mounted = true;

    const bootstrap = async () => {
      try {
        // 1. Check if user already completed onboarding
        const onboardingDone = await AsyncStorage.getItem(ONBOARDING_KEY);

        // 2. Check for existing session
        const session = await authService.getSession();

        if (session?.user) {
          setUserId(session.user.id);
          await loadAll(session.user.id);
        } else if (onboardingDone) {
          // User completed onboarding before but signed out — skip onboarding
          setOnboarded(true);
        }
      } catch (e) {
        console.warn('[App] Bootstrap error:', e);
      } finally {
        if (mounted) setAuthChecked(true);
      }
    };

    bootstrap();

    // Listen for auth state changes (sign-in / sign-out)
    const { data: listener } = authService.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        setUserId(session.user.id);
        loadAll(session.user.id);
        AsyncStorage.setItem(ONBOARDING_KEY, 'true');
      } else if (event === 'SIGNED_OUT') {
        reset();
      }
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  // Don't render navigator until auth check completes — splash screen covers this
  if (!authChecked) return null;

  return <AppNavigator />;
}

export default function App() {
  const [splashDone, setSplashDone] = useState(false);

  const handleSplashDone = async () => {
    setSplashDone(true);
  };

  // Hide the native Expo splash as soon as our custom animated splash mounts
  const handleSplashReady = async () => {
    await SplashScreen.hideAsync();
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider>
          <AppRoot />
          <StatusBar style="light" />
          {!splashDone && (
            <AppSplashScreen
              onDone={handleSplashDone}
              onReady={handleSplashReady}
            />
          )}
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
