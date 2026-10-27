/**
 * AppSplashScreen — Premium cinematic loading animation
 *
 * Sequence:
 *   0ms    → Deep space gradient fades in
 *   100ms  → Particle field appears
 *   300ms  → Logo scales in with elastic spring + glow pulse
 *   700ms  → "StudyFlow" text reveals with slide-up
 *   1000ms → Tagline fades in
 *   1200ms → Progress bar animates across
 *   2400ms → Everything scales up slightly and fades out → onDone()
 */
import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    withSpring,
    withDelay,
    withSequence,
    Easing,
    runOnJS,
    interpolate,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');

interface Props {
    onDone: () => void;
    onReady?: () => void;
}

export default function AppSplashScreen({ onDone, onReady }: Props) {
    const insets = useSafeAreaInsets();

    // Animation shared values
    const bgOpacity = useSharedValue(0);
    const logoScale = useSharedValue(0.2);
    const logoOpacity = useSharedValue(0);
    const logoRotate = useSharedValue(-15);
    const glowScale = useSharedValue(0.8);
    const glowOpacity = useSharedValue(0);
    const ring1Scale = useSharedValue(0.5);
    const ring1Opacity = useSharedValue(0);
    const ring2Scale = useSharedValue(0.3);
    const ring2Opacity = useSharedValue(0);
    const titleOpacity = useSharedValue(0);
    const titleY = useSharedValue(30);
    const taglineOpacity = useSharedValue(0);
    const taglineY = useSharedValue(15);
    const progressWidth = useSharedValue(0);
    const progressOpacity = useSharedValue(0);
    const screenOpacity = useSharedValue(1);
    const screenScale = useSharedValue(1);
    // Floating particles
    const p1Y = useSharedValue(0);
    const p2Y = useSharedValue(0);
    const p3Y = useSharedValue(0);
    const p4Y = useSharedValue(0);
    const particleOpacity = useSharedValue(0);

    useEffect(() => {
        // Hide native Expo splash as soon as our animated one mounts
        onReady?.();
        // 0ms: BG fades in
        bgOpacity.value = withTiming(1, { duration: 500, easing: Easing.out(Easing.cubic) });

        // 100ms: Particles appear + float
        particleOpacity.value = withDelay(100, withTiming(1, { duration: 600 }));
        p1Y.value = withDelay(100, withTiming(-80, { duration: 4000, easing: Easing.linear }));
        p2Y.value = withDelay(300, withTiming(-60, { duration: 3500, easing: Easing.linear }));
        p3Y.value = withDelay(500, withTiming(-100, { duration: 5000, easing: Easing.linear }));
        p4Y.value = withDelay(200, withTiming(-70, { duration: 3800, easing: Easing.linear }));

        // 300ms: Logo springs in with rotation
        logoOpacity.value = withDelay(300, withTiming(1, { duration: 250 }));
        logoScale.value = withDelay(300, withSpring(1, { damping: 10, stiffness: 160, mass: 0.7 }));
        logoRotate.value = withDelay(300, withSpring(0, { damping: 12, stiffness: 130 }));

        // 400ms: Expanding rings
        ring1Opacity.value = withDelay(400, withSequence(
            withTiming(0.4, { duration: 400 }),
            withTiming(0, { duration: 600 }),
        ));
        ring1Scale.value = withDelay(400, withTiming(2.5, { duration: 1000, easing: Easing.out(Easing.cubic) }));
        ring2Opacity.value = withDelay(600, withSequence(
            withTiming(0.3, { duration: 400 }),
            withTiming(0, { duration: 600 }),
        ));
        ring2Scale.value = withDelay(600, withTiming(3, { duration: 1000, easing: Easing.out(Easing.cubic) }));

        // 500ms: Glow pulse
        glowOpacity.value = withDelay(500, withSequence(
            withTiming(0.6, { duration: 400, easing: Easing.out(Easing.cubic) }),
            withTiming(0.15, { duration: 800, easing: Easing.inOut(Easing.cubic) }),
        ));
        glowScale.value = withDelay(500, withSequence(
            withTiming(1.6, { duration: 500, easing: Easing.out(Easing.cubic) }),
            withTiming(1.3, { duration: 700, easing: Easing.inOut(Easing.cubic) }),
        ));

        // 700ms: Title slides up
        titleOpacity.value = withDelay(700, withTiming(1, { duration: 400, easing: Easing.out(Easing.cubic) }));
        titleY.value = withDelay(700, withSpring(0, { damping: 14, stiffness: 140 }));

        // 1000ms: Tagline fades in
        taglineOpacity.value = withDelay(1000, withTiming(1, { duration: 350, easing: Easing.out(Easing.cubic) }));
        taglineY.value = withDelay(1000, withSpring(0, { damping: 14, stiffness: 120 }));

        // 1200ms: Progress bar
        progressOpacity.value = withDelay(1200, withTiming(1, { duration: 300 }));
        progressWidth.value = withDelay(1300, withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.cubic) }));

        // 2400ms: Exit — scale up slightly + fade out
        screenScale.value = withDelay(2400, withTiming(1.05, { duration: 500, easing: Easing.in(Easing.cubic) }));
        screenOpacity.value = withDelay(2400, withTiming(0, { duration: 500, easing: Easing.in(Easing.cubic) }, (finished) => {
            if (finished) runOnJS(onDone)();
        }));
    }, []);

    // Animated styles
    const bgStyle = useAnimatedStyle(() => ({ opacity: bgOpacity.value }));
    const logoStyle = useAnimatedStyle(() => ({
        transform: [{ scale: logoScale.value }, { rotate: `${logoRotate.value}deg` }],
        opacity: logoOpacity.value,
    }));
    const glowStyle = useAnimatedStyle(() => ({
        transform: [{ scale: glowScale.value }],
        opacity: glowOpacity.value,
    }));
    const ring1Style = useAnimatedStyle(() => ({
        transform: [{ scale: ring1Scale.value }],
        opacity: ring1Opacity.value,
    }));
    const ring2Style = useAnimatedStyle(() => ({
        transform: [{ scale: ring2Scale.value }],
        opacity: ring2Opacity.value,
    }));
    const titleStyle = useAnimatedStyle(() => ({
        opacity: titleOpacity.value,
        transform: [{ translateY: titleY.value }],
    }));
    const taglineStyle = useAnimatedStyle(() => ({
        opacity: taglineOpacity.value,
        transform: [{ translateY: taglineY.value }],
    }));
    const progressBarStyle = useAnimatedStyle(() => ({
        width: `${progressWidth.value * 100}%` as any,
        opacity: progressOpacity.value,
    }));
    const progressTrackStyle = useAnimatedStyle(() => ({
        opacity: progressOpacity.value,
    }));
    const screenStyle = useAnimatedStyle(() => ({
        opacity: screenOpacity.value,
        transform: [{ scale: screenScale.value }],
    }));
    const pOpStyle = useAnimatedStyle(() => ({ opacity: particleOpacity.value }));
    const p1Style = useAnimatedStyle(() => ({ transform: [{ translateY: p1Y.value }] }));
    const p2Style = useAnimatedStyle(() => ({ transform: [{ translateY: p2Y.value }] }));
    const p3Style = useAnimatedStyle(() => ({ transform: [{ translateY: p3Y.value }] }));
    const p4Style = useAnimatedStyle(() => ({ transform: [{ translateY: p4Y.value }] }));

    return (
        <Animated.View style={[StyleSheet.absoluteFillObject, screenStyle, { zIndex: 999 }]}>
            <Animated.View style={[StyleSheet.absoluteFillObject, bgStyle]}>
                <LinearGradient
                    colors={['#0B0618', '#1A0F3C', '#12082E', '#080414']}
                    locations={[0, 0.35, 0.65, 1]}
                    style={StyleSheet.absoluteFillObject}
                />
            </Animated.View>

            {/* Floating particles */}
            <Animated.View style={[StyleSheet.absoluteFillObject, pOpStyle]}>
                <Animated.View style={[st.particle, { left: '20%', top: '60%' }, p1Style]} />
                <Animated.View style={[st.particle, { left: '70%', top: '70%', width: 5, height: 5 }, p2Style]} />
                <Animated.View style={[st.particle, { left: '45%', top: '75%', width: 3, height: 3 }, p3Style]} />
                <Animated.View style={[st.particle, { left: '85%', top: '55%', width: 6, height: 6 }, p4Style]} />
            </Animated.View>

            {/* Center content */}
            <View style={[st.center, { paddingTop: insets.top }]}>
                {/* Logo area */}
                <View style={st.logoWrapper}>
                    {/* Expanding rings */}
                    <Animated.View style={[st.ring, ring1Style]} />
                    <Animated.View style={[st.ring, ring2Style]} />

                    {/* Glow */}
                    <Animated.View style={[st.glow, glowStyle]} />

                    {/* Logo */}
                    <Animated.View style={logoStyle}>
                        <View style={st.logoOuter}>
                            <LinearGradient
                                colors={['#8B7CF7', '#6C63FF', '#4F46E5']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                                style={st.logoGradient}
                            >
                                <MaterialIcons name="psychology" size={44} color="#FFF" />
                            </LinearGradient>
                        </View>
                    </Animated.View>
                </View>

                {/* Title */}
                <Animated.Text style={[st.title, titleStyle]}>
                    Study<Text style={st.titleAccent}>Flow</Text>
                </Animated.Text>

                {/* Tagline */}
                <Animated.Text style={[st.tagline, taglineStyle]}>
                    Your AI-powered study companion
                </Animated.Text>
            </View>

            {/* Progress bar at bottom */}
            <View style={[st.progressArea, { paddingBottom: insets.bottom + 40 }]}>
                <Animated.View style={[st.progressTrack, progressTrackStyle]}>
                    <Animated.View style={[st.progressBar, progressBarStyle]}>
                        <LinearGradient
                            colors={['#6C63FF', '#A78BFA']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={StyleSheet.absoluteFillObject}
                        />
                    </Animated.View>
                </Animated.View>
            </View>
        </Animated.View>
    );
}

const st = StyleSheet.create({
    center: {
        flex: 1, alignItems: 'center', justifyContent: 'center', gap: 14,
    },
    logoWrapper: {
        alignItems: 'center', justifyContent: 'center',
        width: 140, height: 140, marginBottom: 12,
    },
    ring: {
        position: 'absolute', width: 100, height: 100, borderRadius: 50,
        borderWidth: 1.5, borderColor: '#7C6FF7',
    },
    glow: {
        position: 'absolute', width: 100, height: 100, borderRadius: 50,
        backgroundColor: '#7C6FF7',
    },
    logoOuter: {
        padding: 5, borderRadius: 24, backgroundColor: '#ffffff10',
        shadowColor: '#6C63FF', shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8, shadowRadius: 30, elevation: 16,
    },
    logoGradient: {
        width: 80, height: 80, borderRadius: 22,
        alignItems: 'center', justifyContent: 'center',
    },
    title: {
        fontSize: 42, fontWeight: '800', letterSpacing: -1,
        color: '#EAEAF5',
    },
    titleAccent: { color: '#A78BFA' },
    tagline: {
        fontSize: 15, color: '#EAEAF580', letterSpacing: 0.3, fontWeight: '500',
    },
    // Particles
    particle: {
        position: 'absolute', width: 4, height: 4, borderRadius: 4,
        backgroundColor: '#A78BFA', opacity: 0.3,
    },
    // Progress
    progressArea: { alignItems: 'center' },
    progressTrack: {
        width: 120, height: 3, borderRadius: 2,
        backgroundColor: '#ffffff10', overflow: 'hidden',
    },
    progressBar: {
        height: '100%', borderRadius: 2, overflow: 'hidden',
    },
});
