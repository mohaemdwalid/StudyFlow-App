import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../theme';
import { ScreenWrapper, Card, SectionHeader, StatusPill } from '../components';

export default function AICoachHomeScreen({ navigation }: { navigation: any }) {
  const theme = useTheme();

  return (
    <ScreenWrapper>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={{ fontSize: 28 }}>✨</Text>
          <Text style={[theme.typography.h1, { color: theme.colors.textPrimary, marginLeft: 10 }]}>
            AI Coach
          </Text>
        </View>
        <Text style={[theme.typography.body, { color: theme.colors.textSecondary, marginBottom: 16 }]}>
          Let AI help you plan smarter and stay on track.
        </Text>

        {/* Pro Banner */}
        <TouchableOpacity
          style={[styles.proBanner, { backgroundColor: theme.accent.violet + '22', borderColor: theme.accent.violet + '55' }]}
          onPress={() => navigation.navigate('Paywall')}
          activeOpacity={0.8}
        >
          <Text style={{ fontSize: 16 }}>👑</Text>
          <Text style={[theme.typography.body, { color: theme.accent.violet, flex: 1, marginLeft: 8, fontWeight: '600' }]}>
            Unlock AI Coach — Go Pro
          </Text>
          <MaterialIcons name="arrow-forward-ios" size={14} color={theme.accent.violet} />
        </TouchableOpacity>

        {/* Action Card 1 — Generate Weekly Plan (Gradient) */}
        <TouchableOpacity activeOpacity={0.85} onPress={() => navigation.navigate('AIPlanReview')}>
          <LinearGradient
            colors={[theme.accent.violet, theme.accent.indigo]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.actionCard}
          >
            <View style={styles.actionCardIcon}>
              <MaterialIcons name="auto-awesome" size={28} color="#EAEAF5" />
            </View>
            <Text style={[theme.typography.h2, { color: '#EAEAF5', marginTop: 12 }]}>
              Generate Weekly Plan ✨
            </Text>
            <Text style={[theme.typography.body, { color: '#EAEAF5' + 'BB', marginTop: 6 }]}>
              AI builds an optimised weekly plan based on your classes, exams, and priorities.
            </Text>
            <View style={styles.actionCardArrow}>
              <MaterialIcons name="arrow-forward" size={20} color="#EAEAF5" />
            </View>
          </LinearGradient>
        </TouchableOpacity>

        {/* Action Card 2 — Generate Today Plan (Dark) */}
        <TouchableOpacity activeOpacity={0.85} onPress={() => navigation.navigate('AIPlanReview')}>
          <Card style={styles.actionCardDark}>
            <View style={[styles.actionCardIcon, { backgroundColor: theme.accent.amber + '22' }]}>
              <Text style={{ fontSize: 24 }}>⚡</Text>
            </View>
            <Text style={[theme.typography.h2, { color: theme.colors.textPrimary, marginTop: 12 }]}>
              Generate Today Plan ⚡
            </Text>
            <Text style={[theme.typography.body, { color: theme.colors.textSecondary, marginTop: 6 }]}>
              Quickly plan your day. AI picks the most impactful tasks for today.
            </Text>
            <View style={styles.actionCardArrow}>
              <MaterialIcons name="arrow-forward" size={20} color={theme.colors.textSecondary} />
            </View>
          </Card>
        </TouchableOpacity>

        {/* Action Card 3 — Catch-up Mode (Coral tint) */}
        <TouchableOpacity activeOpacity={0.85} onPress={() => navigation.navigate('Paywall')}>
          <Card style={[styles.actionCardDark, { borderWidth: 1, borderColor: theme.accent.coral + '44' }]}>
            <View style={[styles.actionCardIcon, { backgroundColor: theme.accent.coral + '22' }]}>
              <Text style={{ fontSize: 24 }}>🚨</Text>
            </View>
            <Text style={[theme.typography.h2, { color: theme.colors.textPrimary, marginTop: 12 }]}>
              Catch-up Mode 🚨
            </Text>
            <Text style={[theme.typography.body, { color: theme.colors.textSecondary, marginTop: 6 }]}>
              Falling behind? AI will prioritize overdue tasks and build a rescue plan.
            </Text>
            <StatusPill label="1 overdue task" variant="error" style={{ marginTop: 10, alignSelf: 'flex-start', flexShrink: 0 }} />
            <View style={styles.actionCardArrow}>
              <MaterialIcons name="arrow-forward" size={20} color={theme.colors.textSecondary} />
            </View>
          </Card>
        </TouchableOpacity>

        {/* Chat Bar */}
        <TouchableOpacity
          style={[styles.chatBar, { backgroundColor: theme.colors.card }]}
          activeOpacity={0.8}
          onPress={() => navigation.navigate('AIChat')}
        >
          <View style={styles.chatBarLeft}>
            <MaterialIcons name="chat-bubble-outline" size={20} color={theme.accent.violet} />
            <Text style={[theme.typography.body, { color: theme.colors.textPrimary, marginLeft: 10, flex: 1 }]}>
              Chat with AI Coach
            </Text>
          </View>
          <MaterialIcons name="arrow-forward-ios" size={14} color={theme.accent.violet} />
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingTop: 8 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  actionCard: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 14,
    position: 'relative',
  },
  actionCardDark: {
    marginBottom: 14,
    position: 'relative',
  },
  actionCardIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionCardArrow: {
    position: 'absolute',
    top: 20,
    right: 20,
  },
  chatBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 16,
    marginTop: 8,
  },
  chatBarLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  proBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 20,
  },
});
