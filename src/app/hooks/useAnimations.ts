/**
 * StudyFlow — Shared Animation Hooks
 * Uses React Native Reanimated 2
 */
import { useEffect, useRef } from 'react';
import {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    withSpring,
    withDelay,
    withSequence,
    withRepeat,
    Easing,
    interpolate,
    runOnJS,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

// ─── useFadeIn ───────────────────────────────
// Every screen fades in on mount
export function useFadeIn(delay = 0) {
    const opacity = useSharedValue(0);
    const translateY = useSharedValue(12);

    useEffect(() => {
        opacity.value = withDelay(delay, withTiming(1, { duration: 300, easing: Easing.out(Easing.cubic) }));
        translateY.value = withDelay(delay, withTiming(0, { duration: 300, easing: Easing.out(Easing.cubic) }));
    }, []);

    return useAnimatedStyle(() => ({
        opacity: opacity.value,
        transform: [{ translateY: translateY.value }],
    }));
}

// ─── useSpringPress ──────────────────────────
// Scale bounce for FABs, buttons, cards
export function useSpringPress(toScale = 0.95) {
    const scale = useSharedValue(1);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    const onPressIn = () => {
        scale.value = withSpring(toScale, { stiffness: 500, damping: 15 });
    };
    const onPressOut = () => {
        scale.value = withSpring(1, { stiffness: 400, damping: 12 });
    };

    return { animatedStyle, onPressIn, onPressOut };
}

// ─── useCountUp ──────────────────────────────
// Animate a number from 0 to target (for GPA, stats)
export function useCountUp(target: number, duration = 1000, delay = 0) {
    const progress = useSharedValue(0);

    useEffect(() => {
        progress.value = withDelay(delay, withTiming(target, {
            duration,
            easing: Easing.out(Easing.cubic),
        }));
    }, [target]);

    return useAnimatedStyle(() => ({
        // Caller reads progress.value directly for interpolation
    }));
}

// ─── useStaggeredEntry ───────────────────────
// Staggered slide-up for list items
export function useStaggeredEntry(index: number, staggerMs = 60) {
    const opacity = useSharedValue(0);
    const translateY = useSharedValue(20);

    useEffect(() => {
        const delay = index * staggerMs;
        opacity.value = withDelay(delay, withTiming(1, { duration: 280, easing: Easing.out(Easing.quad) }));
        translateY.value = withDelay(delay, withSpring(0, { stiffness: 300, damping: 24 }));
    }, [index]);

    return useAnimatedStyle(() => ({
        opacity: opacity.value,
        transform: [{ translateY: translateY.value }],
    }));
}

// ─── usePulse ────────────────────────────────
// Infinite gentle pulse (for active timer ring glow)
export function usePulse(minScale = 0.97, maxScale = 1.03, duration = 1800) {
    const scale = useSharedValue(minScale);

    useEffect(() => {
        scale.value = withRepeat(
            withSequence(
                withTiming(maxScale, { duration, easing: Easing.inOut(Easing.sin) }),
                withTiming(minScale, { duration, easing: Easing.inOut(Easing.sin) }),
            ),
            -1,
            false,
        );
    }, []);

    return useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));
}

// ─── useAnimatedBar ──────────────────────────
// Animate a progress bar from 0 to width% on mount
export function useAnimatedBar(targetPct: number, delay = 0) {
    const width = useSharedValue(0);

    useEffect(() => {
        width.value = withDelay(
            delay,
            withTiming(targetPct, { duration: 900, easing: Easing.out(Easing.cubic) }),
        );
    }, [targetPct]);

    return useAnimatedStyle(() => ({
        width: `${width.value}%` as any,
    }));
}

// ─── useCheckboxBounce ───────────────────────
// Checkbox: background fills + scale pop on check
export function useCheckboxBounce(checked: boolean) {
    const scale = useSharedValue(1);
    const prev = useRef(checked);

    useEffect(() => {
        if (checked !== prev.current) {
            prev.current = checked;
            if (checked) {
                scale.value = withSequence(
                    withTiming(1.25, { duration: 100, easing: Easing.out(Easing.quad) }),
                    withSpring(1, { stiffness: 500, damping: 12 }),
                );
                // Haptic
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => { });
            }
        }
    }, [checked]);

    return useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));
}

// ─── usePlantGrow ────────────────────────────
// Garden plant: scale + opacity reveal
export function usePlantGrow(growProgress: number) {
    const scale = useSharedValue(0.6);
    const opacity = useSharedValue(0.4);

    useEffect(() => {
        const target = 0.6 + growProgress * 0.4;
        const opTarget = 0.4 + growProgress * 0.6;
        scale.value = withTiming(target, { duration: 600, easing: Easing.out(Easing.cubic) });
        opacity.value = withTiming(opTarget, { duration: 600 });
    }, [growProgress]);

    return useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
        opacity: opacity.value,
    }));
}

// ─── useSuccessBounce ────────────────────────
// One-shot big scale bounce (garden result, session complete)
export function useSuccessBounce(triggered: boolean) {
    const scale = useSharedValue(0);

    useEffect(() => {
        if (triggered) {
            scale.value = withSequence(
                withSpring(1.15, { stiffness: 300, damping: 10 }),
                withSpring(1, { stiffness: 400, damping: 15 }),
            );
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => { });
        }
    }, [triggered]);

    return useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));
}
