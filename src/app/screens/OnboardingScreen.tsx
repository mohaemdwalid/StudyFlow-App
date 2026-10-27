/**
 * OnboardingScreen — 5-step animated intro shown once for new users
 *
 * Each slide has:
 *   - Hero icon in gradient circle
 *   - Animated title + description
 *   - Progress dots
 *   - Next / Get Started button
 */
import React, { useState, useRef, useCallback } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity, Dimensions, FlatList,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import Animated, {
    FadeInDown, FadeInUp, FadeIn,
    useSharedValue, useAnimatedStyle, withSpring, withTiming,
    interpolateColor,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');
const ONBOARDING_KEY = '@studyflow_onboarding_done';

interface Slide {
    icon: string;
    gradient: [string, string];
    title: string;
    titleAccent: string;
    description: string;
    bgAccent: string;
}

const SLIDES: Slide[] = [
    {
        icon: 'psychology',
        gradient: ['#8B7CF7', '#4F46E5'],
        title: 'Meet Your ',
        titleAccent: 'AI Coach',
        description: 'Get personalized study plans, instant answers, and smart recommendations powered by AI.',
        bgAccent: '#6C63FF',
    },
    {
        icon: 'calendar-today',
        gradient: ['#38BDF8', '#0284C7'],
        title: 'Plan ',
        titleAccent: 'Smarter',
        description: 'Organize classes, tasks, and exams in one beautiful planner. Drag, drop, and conquer your schedule.',
        bgAccent: '#38BDF8',
    },
    {
        icon: 'timer',
        gradient: ['#F59E0B', '#D97706'],
        title: 'Deep ',
        titleAccent: 'Focus Mode',
        description: 'Stay in the zone with Pomodoro timers and a virtual garden that grows while you study.',
        bgAccent: '#F59E0B',
    },
    {
        icon: 'trending-up',
        gradient: ['#4ADEAA', '#059669'],
        title: 'Track Your ',
        titleAccent: 'Progress',
        description: 'Monitor grades, analyze study patterns, and predict your GPA with beautiful analytics.',
        bgAccent: '#4ADEAA',
    },
    {
        icon: 'rocket-launch',
        gradient: ['#F43F5E', '#E11D48'],
        title: "Let's ",
        titleAccent: 'Get Started',
        description: 'Set up your subjects and classes in under 2 minutes. Your study journey begins now!',
        bgAccent: '#F43F5E',
    },
];

export default function OnboardingScreen({ navigation }: { navigation: any }) {
    const insets = useSafeAreaInsets();
    const [currentIndex, setCurrentIndex] = useState(0);
    const flatListRef = useRef<FlatList>(null);
    const scrollX = useSharedValue(0);

    const handleNext = useCallback(async () => {
        if (currentIndex < SLIDES.length - 1) {
            flatListRef.current?.scrollToIndex({ index: currentIndex + 1, animated: true });
            setCurrentIndex(currentIndex + 1);
        } else {
            // Done — mark onboarding as complete and go to Welcome (sign-in)
            await AsyncStorage.setItem(ONBOARDING_KEY, 'seen');
            navigation.replace('Welcome');
        }
    }, [currentIndex, navigation]);

    const handleSkip = useCallback(async () => {
        await AsyncStorage.setItem(ONBOARDING_KEY, 'seen');
        navigation.replace('Welcome');
    }, [navigation]);

    const renderSlide = ({ item, index }: { item: Slide; index: number }) => (
        <View style={[s.slide, { width }]}>
            {/* Ambient glow */}
            <View style={[s.ambientGlow, { backgroundColor: item.bgAccent }]} />

            {/* Hero icon */}
            <Animated.View
                entering={FadeInDown.delay(100).springify().damping(12)}
                key={`icon-${currentIndex}`}
                style={s.iconContainer}
            >
                {/* Outer ring */}
                <View style={[s.iconRing, { borderColor: item.bgAccent + '20' }]}>
                    <View style={[s.iconRing2, { borderColor: item.bgAccent + '15' }]}>
                        <LinearGradient
                            colors={item.gradient}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={s.iconCircle}
                        >
                            <MaterialIcons name={item.icon as any} size={48} color="#FFF" />
                        </LinearGradient>
                    </View>
                </View>
            </Animated.View>

            {/* Text content */}
            <View style={s.textArea}>
                <Animated.Text
                    entering={FadeInDown.delay(200).springify().damping(14)}
                    key={`title-${currentIndex}`}
                    style={s.title}
                >
                    {item.title}
                    <Text style={[s.titleAccent, { color: item.bgAccent }]}>{item.titleAccent}</Text>
                </Animated.Text>

                <Animated.Text
                    entering={FadeInDown.delay(300).duration(400)}
                    key={`desc-${currentIndex}`}
                    style={s.description}
                >
                    {item.description}
                </Animated.Text>
            </View>
        </View>
    );

    const isLast = currentIndex === SLIDES.length - 1;
    const currentSlide = SLIDES[currentIndex];

    return (
        <View style={s.container}>
            <LinearGradient
                colors={['#0B0618', '#1A0F3C', '#0F0A26', '#080414']}
                locations={[0, 0.35, 0.7, 1]}
                style={StyleSheet.absoluteFillObject}
            />

            {/* Skip button */}
            <Animated.View
                entering={FadeIn.delay(500).duration(400)}
                style={[s.skipArea, { paddingTop: insets.top + 8 }]}
            >
                {!isLast && (
                    <TouchableOpacity onPress={handleSkip} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
                        <Text style={s.skipText}>Skip</Text>
                    </TouchableOpacity>
                )}
            </Animated.View>

            {/* Slides */}
            <FlatList
                ref={flatListRef}
                data={SLIDES}
                renderItem={renderSlide}
                keyExtractor={(_, i) => String(i)}
                horizontal
                pagingEnabled
                scrollEnabled={false}
                showsHorizontalScrollIndicator={false}
                bounces={false}
                style={s.flatList}
            />

            {/* Bottom area */}
            <View style={[s.bottomArea, { paddingBottom: insets.bottom + 16 }]}>
                {/* Dots */}
                <View style={s.dots}>
                    {SLIDES.map((slide, i) => (
                        <View
                            key={i}
                            style={[
                                s.dot,
                                i === currentIndex
                                    ? { backgroundColor: currentSlide.bgAccent, width: 24 }
                                    : { backgroundColor: '#ffffff20', width: 8 },
                            ]}
                        />
                    ))}
                </View>

                {/* CTA */}
                <TouchableOpacity onPress={handleNext} activeOpacity={0.85} style={s.ctaWrap}>
                    <LinearGradient
                        colors={currentSlide.gradient}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={s.cta}
                    >
                        <Text style={s.ctaText}>
                            {isLast ? "Let's Go!" : 'Next'}
                        </Text>
                        <MaterialIcons name={isLast ? 'rocket-launch' : 'arrow-forward'} size={20} color="#FFF" />
                    </LinearGradient>
                </TouchableOpacity>

                {/* Page counter */}
                <Text style={s.pageCounter}>{currentIndex + 1} / {SLIDES.length}</Text>
            </View>
        </View>
    );
}

const s = StyleSheet.create({
    container: { flex: 1 },
    flatList: { flex: 1 },
    slide: {
        flex: 1, alignItems: 'center', justifyContent: 'center',
        paddingHorizontal: 32,
        paddingBottom: height * 0.15,
    },

    // Ambient
    ambientGlow: {
        position: 'absolute', top: height * 0.1,
        width: width * 0.8, height: width * 0.8, borderRadius: width * 0.4,
        opacity: 0.06,
    },

    // Skip
    skipArea: {
        position: 'absolute', top: 0, right: 24, zIndex: 10,
    },
    skipText: {
        color: '#ffffff60', fontSize: 16, fontWeight: '600', letterSpacing: 0.3,
    },

    // Icon
    iconContainer: { marginBottom: 40 },
    iconRing: {
        padding: 16, borderRadius: 80,
        borderWidth: 1,
    },
    iconRing2: {
        padding: 12, borderRadius: 64,
        borderWidth: 1,
    },
    iconCircle: {
        width: 100, height: 100, borderRadius: 50,
        alignItems: 'center', justifyContent: 'center',
        shadowColor: '#000', shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3, shadowRadius: 16, elevation: 12,
    },

    // Text
    textArea: { alignItems: 'center', paddingHorizontal: 8 },
    title: {
        fontSize: 32, fontWeight: '800', color: '#FFFFFF',
        textAlign: 'center', letterSpacing: -0.5, marginBottom: 12,
        lineHeight: 40,
    },
    titleAccent: { fontWeight: '800' },
    description: {
        fontSize: 16, color: '#EAEAF5', opacity: 0.6,
        textAlign: 'center', lineHeight: 24, fontWeight: '400',
    },

    // Bottom
    bottomArea: {
        paddingHorizontal: 24, gap: 16, alignItems: 'center',
    },
    dots: {
        flexDirection: 'row', alignItems: 'center', gap: 6,
    },
    dot: {
        height: 8, borderRadius: 4,
    },
    ctaWrap: { width: '100%' },
    cta: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        gap: 8, height: 56, borderRadius: 16,
        shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3, shadowRadius: 12, elevation: 8,
    },
    ctaText: {
        color: '#FFF', fontSize: 17, fontWeight: '700', letterSpacing: 0.2,
    },
    pageCounter: {
        color: '#ffffff30', fontSize: 12, fontWeight: '500',
    },
});
