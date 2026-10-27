import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Switch,
  StyleSheet,
  Alert,
  Platform,
  Linking,
  Share,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  FadeInDown,
  FadeIn,
  SlideInRight,
  Layout as ReanimatedLayout,
} from 'react-native-reanimated';
import { useTheme } from '../theme';
import { ScreenWrapper } from '../components';
import { useAppStore } from '../state';
import { authService } from '../services';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

// ─── Animated Setting Row ───
function SettingRow({
  icon,
  iconColor,
  label,
  subtitle,
  right,
  onPress,
  isLast,
  theme,
  entering,
}: {
  icon: string;
  iconColor?: string;
  label: string;
  subtitle?: string;
  right?: React.ReactNode;
  onPress?: () => void;
  isLast?: boolean;
  theme: any;
  entering?: any;
}) {
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const Wrapper = onPress ? AnimatedTouchable : Animated.View;

  return (
    <>
      <Wrapper
        {...(onPress ? {
          onPress,
          activeOpacity: 0.7,
          onPressIn: () => { scale.value = withSpring(0.98, { stiffness: 400, damping: 20 }); },
          onPressOut: () => { scale.value = withSpring(1, { stiffness: 400, damping: 20 }); },
        } : {})}
        style={[s.settingRow, animStyle]}
        entering={entering}
      >
        <View style={[s.iconContainer, { backgroundColor: (iconColor || theme.accent.violet) + '18' }]}>
          <MaterialIcons
            name={icon as any}
            size={18}
            color={iconColor || theme.accent.violet}
          />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[s.rowLabel, { color: theme.colors.textPrimary }]}>{label}</Text>
          {subtitle && (
            <Text style={[s.rowSubtitle, { color: theme.colors.textSecondary }]}>{subtitle}</Text>
          )}
        </View>
        {right}
        {onPress && !right && (
          <MaterialIcons name="chevron-right" size={20} color={theme.colors.textSecondary} style={{ opacity: 0.5 }} />
        )}
      </Wrapper>
      {!isLast && <View style={[s.divider, { backgroundColor: theme.colors.divider }]} />}
    </>
  );
}

// ─── Section Header ───
function SectionLabel({ label, theme }: { label: string; theme: any }) {
  return (
    <Animated.Text
      entering={FadeIn.delay(100)}
      style={[s.sectionHeader, { color: theme.colors.textSecondary }]}
    >
      {label}
    </Animated.Text>
  );
}

// ─── Main Component ───
export default function SettingsScreen({ navigation }: any) {
  const theme = useTheme();

  const [notifClass, setNotifClass] = useState(true);
  const [notifTask, setNotifTask] = useState(true);
  const [notifFocus, setNotifFocus] = useState(true);
  const [notifOverdue, setNotifOverdue] = useState(false);
  const [haptics, setHaptics] = useState(true);
  const [themeMode, setThemeMode] = useState<'System' | 'Light' | 'Dark'>('Dark');
  const [gpaScale, setGpaScale] = useState<'4.0' | '5.0' | '%'>('4.0');
  const [activePreset, setActivePreset] = useState<'Classic' | 'Deep'>('Classic');

  const { signOut, userId, subjects, tasks, exams, gradeItems, focusSessions, classSessions } = useAppStore();
  const [userEmail, setUserEmail] = useState('');

  const handleLogout = useCallback(() => {
    Alert.alert('Log Out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log Out', style: 'destructive', onPress: () => signOut() },
    ]);
  }, [signOut]);

  useEffect(() => {
    authService.getUser().then(user => {
      if (user?.email) setUserEmail(user.email);
    }).catch(() => { });
  }, [userId]);

  const handleExportData = useCallback(async () => {
    try {
      const data = JSON.stringify({
        subjects, tasks, exams, gradeItems, focusSessions, classSessions,
        exportedAt: new Date().toISOString(),
      }, null, 2);
      await Share.share({
        message: data,
        title: 'StudyFlow Data Export',
      });
    } catch (e: any) {
      Alert.alert('Export failed', e.message ?? 'Could not export data.');
    }
  }, [subjects, tasks, exams, gradeItems, focusSessions, classSessions]);

  const handleClearCache = useCallback(() => {
    Alert.alert('Clear Cache', 'This will clear all cached data.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Clear', style: 'destructive', onPress: () => {
          Alert.alert('Done', 'Cache cleared successfully.');
        }
      },
    ]);
  }, []);

  const handleDeleteAccount = useCallback(() => {
    Alert.alert(
      'Delete Account',
      'This will permanently delete your account and all data. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => { } },
      ],
    );
  }, []);

  const switchTrack = { false: theme.colors.elevated, true: theme.accent.violet };

  return (
    <ScreenWrapper>
      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.content}
        showsVerticalScrollIndicator={false}
      >
        {/* ─── Header ─── */}
        <Animated.View entering={FadeInDown.duration(350)} style={s.header}>
          <TouchableOpacity
            onPress={() => { if (navigation.canGoBack()) navigation.goBack(); }}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            style={[s.backButton, { backgroundColor: theme.colors.card }]}
          >
            <MaterialIcons name="arrow-back" size={20} color={theme.colors.textPrimary} />
          </TouchableOpacity>
          <Text style={[s.title, { color: theme.colors.textPrimary }]}>Settings</Text>
          <View style={{ width: 36 }} />
        </Animated.View>

        {/* ─── Profile Card ─── */}
        <Animated.View entering={FadeInDown.delay(80).duration(400)}>
          <TouchableOpacity activeOpacity={0.85} style={[s.profileCard, { backgroundColor: theme.colors.card }]}>
            <LinearGradient
              colors={[theme.accent.violet, theme.accent.indigo]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={s.avatar}
            >
              <Text style={s.avatarText}>{userEmail ? userEmail[0].toUpperCase() : 'S'}</Text>
            </LinearGradient>
            <View style={s.profileInfo}>
              <Text style={[s.profileName, { color: theme.colors.textPrimary }]}>{userEmail ? userEmail.split('@')[0] : 'StudyFlow User'}</Text>
              <Text style={[s.profileEmail, { color: theme.colors.textSecondary }]}>{userEmail || 'Not signed in'}</Text>
              <View style={[s.profileBadge, { backgroundColor: theme.accent.violet + '20' }]}>
                <MaterialIcons name="workspace-premium" size={12} color={theme.accent.violet} />
                <Text style={[s.profileBadgeText, { color: theme.accent.violet }]}>Free Plan</Text>
              </View>
            </View>
            <MaterialIcons name="chevron-right" size={22} color={theme.colors.textSecondary} style={{ opacity: 0.4 }} />
          </TouchableOpacity>
        </Animated.View>

        {/* ─── Pro Upgrade Banner ─── */}
        <Animated.View entering={FadeInDown.delay(150).duration(400)}>
          <TouchableOpacity activeOpacity={0.9} onPress={() => navigation.navigate('Paywall')}>
            <LinearGradient
              colors={[theme.accent.violet, theme.accent.indigo, '#3730A3']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={s.proBanner}
            >
              <View style={s.proBannerContent}>
                <View style={s.proIconWrap}>
                  <MaterialIcons name="bolt" size={24} color="#FFC107" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.proBannerTitle}>Upgrade to StudyFlow Pro</Text>
                  <Text style={s.proBannerSub}>AI coach, analytics, unlimited presets & more</Text>
                </View>
                <View style={s.proBannerArrow}>
                  <MaterialIcons name="arrow-forward" size={18} color="#FFF" />
                </View>
              </View>
              {/* Decorative circles */}
              <View style={[s.proCircle, s.proCircle1]} />
              <View style={[s.proCircle, s.proCircle2]} />
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>

        {/* ─── Appearance ─── */}
        <SectionLabel label="APPEARANCE" theme={theme} />
        <Animated.View entering={FadeInDown.delay(200).duration(400)} style={[s.card, { backgroundColor: theme.colors.card }]}>
          <SettingRow
            icon="brightness-6"
            iconColor={theme.accent.amber}
            label="Theme"
            theme={theme}
            isLast
            right={
              <View style={[s.segmented, { backgroundColor: theme.colors.elevated }]}>
                {(['System', 'Light', 'Dark'] as const).map((m) => {
                  const isActive = themeMode === m;
                  const icons: Record<string, string> = { System: 'settings-brightness', Light: 'light-mode', Dark: 'dark-mode' };
                  return (
                    <TouchableOpacity
                      key={m}
                      style={[s.segment, isActive && [s.segmentActive, { backgroundColor: theme.accent.violet }]]}
                      onPress={() => setThemeMode(m)}
                    >
                      <MaterialIcons
                        name={icons[m] as any}
                        size={14}
                        color={isActive ? '#FFF' : theme.colors.textSecondary}
                        style={{ marginRight: 4 }}
                      />
                      <Text style={[s.segmentText, { color: isActive ? '#FFF' : theme.colors.textSecondary }]}>
                        {m}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            }
          />
        </Animated.View>

        {/* ─── Notifications ─── */}
        <SectionLabel label="NOTIFICATIONS" theme={theme} />
        <Animated.View entering={FadeInDown.delay(250).duration(400)} style={[s.card, { backgroundColor: theme.colors.card }]}>
          <SettingRow
            icon="notifications-active"
            iconColor={theme.accent.sky}
            label="Class Reminders"
            subtitle="15 min before class starts"
            theme={theme}
            right={
              <Switch
                value={notifClass}
                onValueChange={setNotifClass}
                trackColor={switchTrack}
                thumbColor="#FFF"
              />
            }
          />
          <SettingRow
            icon="assignment-turned-in"
            iconColor={theme.accent.mint}
            label="Task Due"
            subtitle="1 hour before deadline"
            theme={theme}
            right={
              <Switch
                value={notifTask}
                onValueChange={setNotifTask}
                trackColor={switchTrack}
                thumbColor="#FFF"
              />
            }
          />
          <SettingRow
            icon="timer"
            iconColor={theme.accent.violet}
            label="Focus Session End"
            theme={theme}
            right={
              <Switch
                value={notifFocus}
                onValueChange={setNotifFocus}
                trackColor={switchTrack}
                thumbColor="#FFF"
              />
            }
          />
          <SettingRow
            icon="error-outline"
            iconColor={theme.accent.coral}
            label="Overdue Alerts"
            subtitle="Daily digest of overdue tasks"
            theme={theme}
            isLast
            right={
              <Switch
                value={notifOverdue}
                onValueChange={setNotifOverdue}
                trackColor={switchTrack}
                thumbColor="#FFF"
              />
            }
          />
        </Animated.View>

        {/* ─── Focus Presets ─── */}
        <SectionLabel label="FOCUS PRESETS" theme={theme} />
        <Animated.View entering={FadeInDown.delay(300).duration(400)} style={[s.card, { backgroundColor: theme.colors.card }]}>
          {[
            { key: 'Classic', label: 'Classic Pomodoro', sub: '25 min work · 5 min break', icon: 'play-circle-outline' },
            { key: 'Deep', label: 'Deep Work', sub: '50 min work · 10 min break', icon: 'self-improvement' },
          ].map((p, i) => (
            <SettingRow
              key={p.key}
              icon={p.icon}
              iconColor={activePreset === p.key ? theme.accent.violet : theme.colors.textSecondary}
              label={p.label}
              subtitle={p.sub}
              theme={theme}
              onPress={() => setActivePreset(p.key as any)}
              right={
                activePreset === p.key ? (
                  <View style={[s.checkBadge, { backgroundColor: theme.accent.violet + '20' }]}>
                    <MaterialIcons name="check" size={16} color={theme.accent.violet} />
                  </View>
                ) : (
                  <MaterialIcons name="radio-button-unchecked" size={20} color={theme.colors.divider} />
                )
              }
            />
          ))}
          <SettingRow
            icon="add-circle-outline"
            iconColor={theme.accent.violet}
            label="Create Custom Preset"
            theme={theme}
            onPress={() => { }}
            isLast
          />
        </Animated.View>

        {/* ─── Grades ─── */}
        <SectionLabel label="GRADES" theme={theme} />
        <Animated.View entering={FadeInDown.delay(350).duration(400)} style={[s.card, { backgroundColor: theme.colors.card }]}>
          <View style={s.settingRow}>
            <View style={[s.iconContainer, { backgroundColor: theme.accent.amber + '18' }]}>
              <MaterialIcons name="school" size={18} color={theme.accent.amber} />
            </View>
            <Text style={[s.rowLabel, { color: theme.colors.textPrimary, flex: 1 }]}>GPA Scale</Text>
            <View style={[s.segmented, { backgroundColor: theme.colors.elevated }]}>
              {(['4.0', '5.0', '%'] as const).map((sc) => {
                const isActive = gpaScale === sc;
                return (
                  <TouchableOpacity
                    key={sc}
                    style={[s.segment, isActive && [s.segmentActive, { backgroundColor: theme.accent.violet }]]}
                    onPress={() => setGpaScale(sc)}
                  >
                    <Text style={[s.segmentText, { color: isActive ? '#FFF' : theme.colors.textSecondary }]}>
                      {sc}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </Animated.View>

        {/* ─── General ─── */}
        <SectionLabel label="GENERAL" theme={theme} />
        <Animated.View entering={FadeInDown.delay(400).duration(400)} style={[s.card, { backgroundColor: theme.colors.card }]}>
          <SettingRow
            icon="vibration"
            iconColor={theme.accent.mint}
            label="Haptic Feedback"
            theme={theme}
            right={
              <Switch
                value={haptics}
                onValueChange={setHaptics}
                trackColor={switchTrack}
                thumbColor="#FFF"
              />
            }
          />
          <SettingRow
            icon="language"
            iconColor={theme.accent.sky}
            label="Language"
            subtitle="English"
            theme={theme}
            onPress={() => { }}
          />
          <SettingRow
            icon="calendar-today"
            iconColor={theme.accent.violet}
            label="Week Starts On"
            subtitle="Monday"
            theme={theme}
            onPress={() => { }}
            isLast
          />
        </Animated.View>

        {/* ─── Data ─── */}
        <SectionLabel label="DATA" theme={theme} />
        <Animated.View entering={FadeInDown.delay(450).duration(400)} style={[s.card, { backgroundColor: theme.colors.card }]}>
          <SettingRow
            icon="cloud-upload"
            iconColor={theme.accent.sky}
            label="Backup to Cloud"
            subtitle="Last backup: Today, 2:15 PM"
            theme={theme}
            onPress={() => { }}
          />
          <SettingRow
            icon="file-download"
            iconColor={theme.accent.mint}
            label="Export Data"
            subtitle="JSON format"
            theme={theme}
            onPress={handleExportData}
          />
          <SettingRow
            icon="cached"
            iconColor={theme.accent.amber}
            label="Clear Cache"
            theme={theme}
            onPress={handleClearCache}
            isLast
          />
        </Animated.View>

        {/* ─── About & Legal ─── */}
        <SectionLabel label="ABOUT" theme={theme} />
        <Animated.View entering={FadeInDown.delay(500).duration(400)} style={[s.card, { backgroundColor: theme.colors.card }]}>
          <SettingRow
            icon="star-outline"
            iconColor={theme.accent.amber}
            label="Rate StudyFlow"
            subtitle="Help us improve with your feedback"
            theme={theme}
            onPress={() => { }}
          />
          <SettingRow
            icon="share"
            iconColor={theme.accent.violet}
            label="Share with Friends"
            theme={theme}
            onPress={() => { }}
          />
          <SettingRow
            icon="description"
            iconColor={theme.colors.textSecondary}
            label="Terms of Service"
            theme={theme}
            onPress={() => { }}
          />
          <SettingRow
            icon="security"
            iconColor={theme.colors.textSecondary}
            label="Privacy Policy"
            theme={theme}
            onPress={() => { }}
            isLast
          />
        </Animated.View>

        {/* ─── Account Actions ─── */}
        <SectionLabel label="ACCOUNT" theme={theme} />
        <Animated.View entering={FadeInDown.delay(550).duration(400)} style={[s.card, { backgroundColor: theme.colors.card }]}>
          <SettingRow
            icon="logout"
            iconColor={theme.accent.coral}
            label="Log Out"
            theme={theme}
            onPress={handleLogout}
          />
          <SettingRow
            icon="delete-forever"
            iconColor={theme.accent.coral}
            label="Delete Account"
            subtitle="Permanently remove all data"
            theme={theme}
            onPress={handleDeleteAccount}
            isLast
          />
        </Animated.View>

        {/* ─── Footer ─── */}
        <Animated.View entering={FadeIn.delay(600)} style={s.footer}>
          <Text style={[s.footerText, { color: theme.colors.textSecondary }]}>StudyFlow v1.0.0</Text>
          <Text style={[s.footerTextSmall, { color: theme.colors.textSecondary }]}>
            Made with 💜 for students everywhere
          </Text>
        </Animated.View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </ScreenWrapper>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { flex: 1 },
  content: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 32 },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: 0.3,
  },

  // Profile
  profileCard: {
    borderRadius: 20,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFF',
  },
  profileInfo: {
    flex: 1,
    marginLeft: 14,
  },
  profileName: {
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 2,
  },
  profileEmail: {
    fontSize: 13,
    marginBottom: 6,
  },
  profileBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    gap: 4,
  },
  profileBadgeText: {
    fontSize: 11,
    fontWeight: '600',
  },

  // Pro Banner
  proBanner: {
    borderRadius: 20,
    padding: 18,
    marginBottom: 24,
    overflow: 'hidden',
  },
  proBannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  proIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  proBannerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFF',
    marginBottom: 2,
  },
  proBannerSub: {
    fontSize: 12,
    fontWeight: '400',
    color: 'rgba(255,255,255,0.75)',
  },
  proBannerArrow: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  proCircle: {
    position: 'absolute',
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  proCircle1: {
    width: 120,
    height: 120,
    top: -40,
    right: -20,
  },
  proCircle2: {
    width: 80,
    height: 80,
    bottom: -30,
    left: -10,
  },

  // Sections
  sectionHeader: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
    marginBottom: 8,
    marginTop: 8,
    marginLeft: 4,
  },
  card: {
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 8,
      },
      android: { elevation: 1 },
    }),
  },

  // Setting Rows
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    minHeight: 52,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  rowLabel: {
    fontSize: 15,
    fontWeight: '500',
  },
  rowSubtitle: {
    fontSize: 12,
    marginTop: 1,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginLeft: 60,
  },

  // Segmented Control
  segmented: {
    flexDirection: 'row',
    borderRadius: 10,
    padding: 3,
  },
  segment: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  segmentActive: {},
  segmentText: {
    fontSize: 12,
    fontWeight: '600',
  },

  // Check Badge
  checkBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Footer
  footer: {
    alignItems: 'center',
    paddingTop: 24,
    paddingBottom: 8,
  },
  footerText: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 4,
  },
  footerTextSmall: {
    fontSize: 11,
    opacity: 0.6,
  },
});
