import React, { useState } from 'react';
import {
    View, Text, ScrollView, TouchableOpacity, StyleSheet, Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../theme';
import { ScreenWrapper } from '../components';

const { width: SW } = Dimensions.get('window');

const FEATURES = [
    'AI Plan Generation',
    'Catch-up Mode',
    'Advanced Analytics & Reports',
    'GPA Tracking Tools',
];

export default function PaywallScreen({ navigation }: any) {
    const theme = useTheme();
    const [annual, setAnnual] = useState(true);
    const s = styles(theme);

    return (
        <View style={s.root}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.content}>
                {/* Dismiss */}
                <ScreenWrapper>
                    <TouchableOpacity style={s.dismiss} onPress={() => navigation.goBack()}>
                        <Text style={s.dismissText}>✕ Maybe Later</Text>
                    </TouchableOpacity>
                </ScreenWrapper>

                {/* Hero */}
                <LinearGradient colors={['#4F46E5', '#6C63FF']} style={s.hero}>
                    <Text style={s.crownEmoji}>👑</Text>
                    <Text style={s.proLabel}>StudyFlow Pro</Text>
                </LinearGradient>

                <View style={s.body}>
                    <Text style={s.headline}>Unlock Your Full Potential</Text>
                    <Text style={s.subheadline}>Everything you need to ace this semester</Text>

                    {/* Features */}
                    {FEATURES.map(f => (
                        <View key={f} style={s.featureRow}>
                            <MaterialIcons name="check-circle" size={20} color={theme.accent.violet} />
                            <Text style={s.featureText}>{f}</Text>
                        </View>
                    ))}

                    {/* Pricing Toggle */}
                    <View style={s.pricingContainer}>
                        <TouchableOpacity
                            style={[s.pricingPill, !annual && s.pricingPillActive]}
                            onPress={() => setAnnual(false)}
                        >
                            <Text style={[s.pricingText, !annual && s.pricingTextActive]}>Monthly — $9.99</Text>
                        </TouchableOpacity>
                        <View style={s.annualWrapper}>
                            <TouchableOpacity
                                style={[s.pricingPill, annual && s.pricingPillActive]}
                                onPress={() => setAnnual(true)}
                            >
                                <Text style={[s.pricingText, annual && s.pricingTextActive]}>Annual — $59.99</Text>
                            </TouchableOpacity>
                            {annual && (
                                <View style={s.saveBadge}>
                                    <Text style={s.saveBadgeText}>Save 50% 🎉</Text>
                                </View>
                            )}
                        </View>
                    </View>

                    {/* CTA */}
                    <TouchableOpacity style={s.ctaBtn} onPress={() => navigation.goBack()}>
                        <LinearGradient colors={['#6C63FF', '#4F46E5']} style={s.ctaGrad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                            <Text style={s.ctaText}>Start 7-Day Free Trial</Text>
                        </LinearGradient>
                    </TouchableOpacity>

                    <TouchableOpacity style={s.restoreBtn}>
                        <Text style={s.restoreText}>Restore Purchase</Text>
                    </TouchableOpacity>
                    <Text style={s.finePrint}>Cancel anytime. Billed annually.</Text>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = (theme: any) => StyleSheet.create({
    root: { flex: 1, backgroundColor: theme.colors.background },
    content: { paddingBottom: 48 },
    dismiss: { position: 'absolute', right: 20, top: 16, zIndex: 10 },
    dismissText: { fontSize: 14, color: theme.colors.textSecondary },
    hero: {
        width: SW, height: SW * 0.48,
        justifyContent: 'center', alignItems: 'center',
    },
    crownEmoji: { fontSize: 56, marginBottom: 8 },
    proLabel: { fontSize: 22, fontWeight: '700', color: '#FFF' },
    body: { paddingHorizontal: 24, paddingTop: 24 },
    headline: {
        fontSize: 26, fontWeight: '700', color: theme.colors.textPrimary,
        textAlign: 'center', marginBottom: 8,
    },
    subheadline: {
        fontSize: 15, color: theme.colors.textSecondary,
        textAlign: 'center', marginBottom: 28,
    },
    featureRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 14 },
    featureText: { fontSize: 15, color: theme.colors.textPrimary },
    pricingContainer: {
        flexDirection: 'row',
        backgroundColor: theme.colors.elevated,
        borderRadius: 9999, padding: 4,
        marginTop: 24, marginBottom: 28, gap: 4,
    },
    annualWrapper: { flex: 1, position: 'relative' },
    pricingPill: {
        flex: 1, paddingVertical: 10, paddingHorizontal: 12,
        borderRadius: 9999, alignItems: 'center',
    },
    pricingPillActive: { backgroundColor: theme.accent.violet },
    pricingText: { fontSize: 13, color: theme.colors.textSecondary, fontWeight: '500' },
    pricingTextActive: { color: '#FFF' },
    saveBadge: {
        position: 'absolute', top: -14, right: 4,
        backgroundColor: theme.accent.mint,
        paddingHorizontal: 8, paddingVertical: 2,
        borderRadius: 9999,
    },
    saveBadgeText: { fontSize: 10, color: '#000', fontWeight: '700' },
    ctaBtn: { borderRadius: 9999, overflow: 'hidden', marginBottom: 16 },
    ctaGrad: { paddingVertical: 16, alignItems: 'center' },
    ctaText: { fontSize: 17, fontWeight: '600', color: '#FFF' },
    restoreBtn: { alignItems: 'center', marginBottom: 8 },
    restoreText: { fontSize: 13, color: theme.colors.textSecondary },
    finePrint: { fontSize: 12, color: theme.colors.textSecondary, textAlign: 'center' },
});
