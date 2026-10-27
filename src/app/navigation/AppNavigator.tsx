/**
 * StudyFlow Navigation
 *
 * Auth Stack → Setup Wizard Stack → Main Tabs (with detail stacks)
 */
import React from 'react';
import { View, Platform, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../theme';
import { useAppStore } from '../state';

import {
  SignInScreen,
  WelcomeScreen,
  SubjectSetupScreen,
  ClassScheduleScreen,
  ExamsAvailabilityScreen,
  HomeDashboardScreen,
  PlannerTimetableScreen,
  PlannerTasksScreen,
  TaskDetailScreen,
  ExamDetailScreen,
  FocusTimerScreen,
  GradesOverviewScreen,
  ChemistryGradebookScreen,
  AICoachHomeScreen,
  AIPlanReviewScreen,
  // New screens
  AnalyticsDashboardScreen,
  SettingsScreen,
  PaywallScreen,
  EditSubjectScreen,
  EditClassScreen,
  EditExamScreen,
  EditTaskScreen,
  AddGradeScreen,
  GardenPlantingScreen,
  GardenActiveScreen,
  GardenResultScreen,
  GardenCollectionScreen,
  PlantDetailScreen,
  AIChatScreen,
  OnboardingScreen,
} from '../screens';

// Feature screens
import GradePredictorScreen from '../../features/grades/GradePredictorScreen';
import PomodoroAnalyticsScreen from '../../features/analytics/PomodoroAnalyticsScreen';
import DragDropPlannerScreen from '../../features/planner/DragDropPlannerScreen';
import DifficultyPredictionScreen from '../../features/aiInsights/DifficultyPredictionScreen';
import QuickAddModal from '../../features/quickAdd/QuickAddModal';

// Wrap QuickAddModal as a navigation screen
function QuickAddModalScreen({ navigation }: any) {
  return <QuickAddModal visible={true} onClose={() => navigation.goBack()} />;
}

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const TAB_ICONS: Record<string, keyof typeof MaterialIcons.glyphMap> = {
  HomeTab: 'home',
  PlannerTab: 'calendar-today',
  FocusTab: 'timer',
  GradesTab: 'bar-chart',
  AICoachTab: 'auto-awesome',
};

const TAB_LABELS: Record<string, string> = {
  HomeTab: 'Home',
  PlannerTab: 'Planner',
  FocusTab: 'Focus',
  GradesTab: 'Grades',
  AICoachTab: 'AI Coach',
};

// ─── Custom Tab Bar ───────────────────────────────────────────────────────────
// Fully custom — bypasses native iOS UITabBar so the pill never appears
function CustomTabBar({ state, navigation }: any) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const bg = theme.mode === 'dark' ? 'rgba(22,25,36,0.97)' : 'rgba(255,255,255,0.97)';

  return (
    <View style={[
      tabStyles.bar,
      {
        backgroundColor: bg,
        paddingBottom: insets.bottom || 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 8,
      },
    ]}>
      {state.routes.map((route: any, index: number) => {
        const focused = state.index === index;
        const icon = TAB_ICONS[route.name] || 'circle';
        const label = TAB_LABELS[route.name] || route.name;
        const color = focused ? theme.accent.violet : theme.colors.textSecondary;

        return (
          <TouchableOpacity
            key={route.key}
            onPress={() => navigation.navigate(route.name)}
            activeOpacity={0.7}
            style={tabStyles.item}
          >
            <MaterialIcons name={icon} size={24} color={color} />
            <Text style={[tabStyles.label, { color }]}>{label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const tabStyles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    paddingTop: 10,
    borderTopWidth: 0,
  },
  item: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    gap: 3,
  },
  label: {
    fontSize: 11,
    fontWeight: '500',
  },
});

// ─── Home Stack ───
function HomeStack() {
  return (
    <Stack.Navigator screenOptions={{
      headerShown: false,
      animation: 'slide_from_right',
      animationDuration: 280,
      gestureEnabled: true,
      gestureDirection: 'horizontal',
    }}>
      <Stack.Screen name="HomeDashboard" component={HomeDashboardScreen} />
      <Stack.Screen name="TaskDetail" component={TaskDetailScreen} />
      <Stack.Screen name="ExamDetail" component={ExamDetailScreen} />
      <Stack.Screen
        name="Analytics"
        component={AnalyticsDashboardScreen}
        options={{ animation: 'fade_from_bottom', animationDuration: 320 }}
      />
      <Stack.Screen
        name="PomodoroAnalytics"
        component={PomodoroAnalyticsScreen}
        options={{ animation: 'fade_from_bottom', animationDuration: 320 }}
      />
      <Stack.Screen
        name="EditTask"
        component={EditTaskScreen}
        options={{ presentation: 'modal', animation: 'slide_from_bottom', animationDuration: 350 }}
      />
      <Stack.Screen
        name="EditExam"
        component={EditExamScreen}
        options={{ presentation: 'transparentModal', animation: 'slide_from_bottom', animationDuration: 350 }}
      />
    </Stack.Navigator>
  );
}

// ─── Planner Stack ───
function PlannerStack() {
  return (
    <Stack.Navigator screenOptions={{
      headerShown: false,
      animation: 'slide_from_right',
      animationDuration: 280,
      gestureEnabled: true,
    }}>
      <Stack.Screen name="PlannerTimetable" component={PlannerTimetableScreen} />
      <Stack.Screen name="PlannerTasks" component={PlannerTasksScreen} />
      <Stack.Screen name="TaskDetail" component={TaskDetailScreen} />
      <Stack.Screen name="ExamDetail" component={ExamDetailScreen} />
      <Stack.Screen name="DragDropPlanner" component={DragDropPlannerScreen} />
      <Stack.Screen
        name="EditTask"
        component={EditTaskScreen}
        options={{ presentation: 'modal', animation: 'slide_from_bottom', animationDuration: 350 }}
      />
      <Stack.Screen
        name="EditClass"
        component={EditClassScreen}
        options={{ presentation: 'transparentModal', animation: 'slide_from_bottom', animationDuration: 350 }}
      />
      <Stack.Screen
        name="EditExam"
        component={EditExamScreen}
        options={{ presentation: 'transparentModal', animation: 'slide_from_bottom', animationDuration: 350 }}
      />
    </Stack.Navigator>
  );
}

// ─── Focus Stack ───
function FocusStack() {
  return (
    <Stack.Navigator screenOptions={{
      headerShown: false,
      animation: 'slide_from_right',
      animationDuration: 280,
      gestureEnabled: true,
    }}>
      <Stack.Screen name="FocusTimer" component={FocusTimerScreen} />
      <Stack.Screen name="GardenPlanting" component={GardenPlantingScreen} />
      <Stack.Screen
        name="GardenActive"
        component={GardenActiveScreen}
        options={{ presentation: 'fullScreenModal', animation: 'fade', animationDuration: 400, gestureEnabled: false }}
      />
      <Stack.Screen name="GardenResult" component={GardenResultScreen} options={{ animation: 'fade', animationDuration: 400 }} />
      <Stack.Screen name="GardenCollection" component={GardenCollectionScreen} />
      <Stack.Screen name="PlantDetail" component={PlantDetailScreen} />
    </Stack.Navigator>
  );
}

// ─── Grades Stack ───
function GradesStack() {
  return (
    <Stack.Navigator screenOptions={{
      headerShown: false,
      animation: 'slide_from_right',
      animationDuration: 280,
      gestureEnabled: true,
    }}>
      <Stack.Screen name="GradesOverview" component={GradesOverviewScreen} />
      <Stack.Screen name="ChemistryGradebook" component={ChemistryGradebookScreen} />
      <Stack.Screen name="GradePredictor" component={GradePredictorScreen} />
      <Stack.Screen
        name="AddGrade"
        component={AddGradeScreen}
        options={{ presentation: 'transparentModal', animation: 'slide_from_bottom', animationDuration: 350 }}
      />
      <Stack.Screen
        name="EditSubject"
        component={EditSubjectScreen}
        options={{ presentation: 'transparentModal', animation: 'slide_from_bottom', animationDuration: 350 }}
      />
    </Stack.Navigator>
  );
}

// ─── AI Coach Stack ───
function AICoachStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="AICoachHome" component={AICoachHomeScreen} />
      <Stack.Screen name="AIPlanReview" component={AIPlanReviewScreen} />
      <Stack.Screen name="AIChat" component={AIChatScreen} />
      <Stack.Screen name="DifficultyPrediction" component={DifficultyPredictionScreen} />
    </Stack.Navigator>
  );
}

// ─── Main Tab Navigator ───
function MainTabs() {
  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen name="HomeTab" component={HomeStack} options={{ title: 'Home' }} />
      <Tab.Screen name="PlannerTab" component={PlannerStack} options={{ title: 'Planner' }} />
      <Tab.Screen name="FocusTab" component={FocusStack} options={{ title: 'Focus' }} />
      <Tab.Screen name="GradesTab" component={GradesStack} options={{ title: 'Grades' }} />
      <Tab.Screen name="AICoachTab" component={AICoachStack} options={{ title: 'AI Coach' }} />
    </Tab.Navigator>
  );
}

// ─── Setup Wizard Stack ───
function SetupWizard() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <Stack.Screen name="SubjectSetup" component={SubjectSetupScreen} />
      <Stack.Screen name="ClassSchedule" component={ClassScheduleScreen} />
      <Stack.Screen name="ExamsAvailability" component={ExamsAvailabilityScreen} />
    </Stack.Navigator>
  );
}

// ─── Root Navigator ───
export default function AppNavigator() {
  const theme = useTheme();
  const isOnboarded = useAppStore((s) => s.isOnboarded);

  const navigationTheme = {
    ...(theme.mode === 'dark' ? DarkTheme : DefaultTheme),
    colors: {
      ...(theme.mode === 'dark' ? DarkTheme.colors : DefaultTheme.colors),
      background: theme.colors.background,
      card: theme.colors.card,
      text: theme.colors.textPrimary,
      border: theme.colors.divider,
      primary: theme.accent.violet,
    },
  };

  return (
    <NavigationContainer theme={navigationTheme}>
      <Stack.Navigator screenOptions={{ headerShown: false, animation: 'fade' }}>
        {!isOnboarded ? (
          <>
            <Stack.Screen name="Onboarding" component={OnboardingScreen} />
            <Stack.Screen name="Welcome" component={WelcomeScreen} />
            <Stack.Screen name="SignIn" component={SignInScreen} options={{ animation: 'slide_from_right' }} />
            <Stack.Screen name="SetupWizard" component={SetupWizard} />
          </>
        ) : (
          <>
            <Stack.Screen name="MainTabs" component={MainTabs} />
            <Stack.Screen
              name="Settings"
              component={SettingsScreen}
              options={{ animation: 'slide_from_right' }}
            />
            <Stack.Screen
              name="Paywall"
              component={PaywallScreen}
              options={{ presentation: 'modal' }}
            />
            <Stack.Screen
              name="QuickAdd"
              component={QuickAddModalScreen}
              options={{ presentation: 'transparentModal', animation: 'fade', animationDuration: 200 }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
