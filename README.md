# StudyFlow — AI Academic Planner

A premium React Native app for ambitious students, combining AI-powered academic planning with a beautiful, focused UI.

## Quick Start

```bash
# Install dependencies
cd StudyFlow
npm install

# Start Expo dev server
npx expo start

# Run on iOS Simulator
npx expo start --ios

# Run on Android Emulator
npx expo start --android
```

## Architecture

```
StudyFlow/
├── App.tsx                          # Entry point - providers & navigation
├── src/
│   ├── app/
│   │   ├── navigation/
│   │   │   └── AppNavigator.tsx     # Auth → Setup → MainTabs routing
│   │   ├── screens/                 # All 14 screens
│   │   │   ├── WelcomeScreen.tsx
│   │   │   ├── SubjectSetupScreen.tsx
│   │   │   ├── ClassScheduleScreen.tsx
│   │   │   ├── ExamsAvailabilityScreen.tsx
│   │   │   ├── HomeDashboardScreen.tsx
│   │   │   ├── PlannerTimetableScreen.tsx
│   │   │   ├── PlannerTasksScreen.tsx
│   │   │   ├── TaskDetailScreen.tsx
│   │   │   ├── ExamDetailScreen.tsx
│   │   │   ├── FocusTimerScreen.tsx
│   │   │   ├── GradesOverviewScreen.tsx
│   │   │   ├── ChemistryGradebookScreen.tsx
│   │   │   ├── AICoachHomeScreen.tsx
│   │   │   └── AIPlanReviewScreen.tsx
│   │   ├── components/
│   │   │   └── ui.tsx               # Shared design system components
│   │   ├── theme/
│   │   │   ├── colors.ts            # Color tokens (dark/light)
│   │   │   ├── typography.ts        # Font hierarchy
│   │   │   ├── spacing.ts           # 8pt grid, shadows, border radii
│   │   │   ├── animations.ts        # Spring configs
│   │   │   └── index.tsx            # ThemeProvider + useTheme hook
│   │   └── state/
│   │       ├── mockData.ts          # All mock data
│   │       └── store.ts             # Zustand global store
│   └── types/
│       └── models.ts                # TypeScript interfaces
├── stitch_raw/                      # Raw Stitch API responses (JSON)
└── assets/stitch/                   # Downloaded HTML + screenshots
```

## Design System

The app implements a comprehensive token-based design system:

- **Colors**: Dark surfaces (Abyss Black → Midnight Slate → Elevated Charcoal) and Light surfaces (Ghost White Canvas → Pure Cloud → Powder Mist)
- **Accent palette**: Electric Violet, Cosmic Indigo, Coral Ember, Mint Pulse, Amber Alert, Sky Breeze
- **Typography**: Inter font family with 7-level hierarchy (h1–hero)
- **Spacing**: 8pt grid system
- **Animations**: Spring-driven (stiffness 280, damping 28) via Reanimated

All colors are consumed via the `useTheme()` hook — no hardcoded values.

## Navigation Structure

```
Root
├── Auth Stack (pre-onboarding)
│   ├── Welcome
│   └── Setup Wizard
│       ├── Subject Setup (1/3)
│       ├── Class Schedule (2/3)
│       └── Exams & Availability (3/3)
└── Main Tabs (post-onboarding)
    ├── Home → [HomeDashboard, TaskDetail, ExamDetail]
    ├── Planner → [PlannerTimetable, PlannerTasks, TaskDetail]
    ├── Focus → [FocusTimer]
    ├── Grades → [GradesOverview, ChemistryGradebook]
    └── AI Coach → [AICoachHome, AIPlanReview]
```

Tab bar uses glassmorphism styling with Electric Violet active indicator.

## Stitch Integration

All 14 screens were designed using [Stitch](https://stitch.withgoogle.com/) and fetched via the Stitch MCP server:

- **Raw API responses**: `stitch_raw/*.json` — Full screen metadata including download URLs
- **HTML designs**: `assets/stitch/<screen>/screen.html` — Rendered HTML from Stitch
- **Screenshots**: `assets/stitch/<screen>/screenshot.png` — Design reference images
- **Project ID**: `8384022895724614304`

## Key Libraries

| Library | Purpose |
|---------|---------|
| expo | Framework & build system |
| @react-navigation | Navigation (native-stack + bottom-tabs) |
| react-native-reanimated | Spring animations & transitions |
| react-native-gesture-handler | Gestures & swipe actions |
| expo-linear-gradient | Gradient backgrounds & buttons |
| react-native-svg | Timer ring visualization |
| zustand | Lightweight state management |
| @expo/vector-icons | Material Icons |

## State Management

Uses Zustand with mock data pre-loaded. State includes:
- Subjects, Tasks, Exams, Class Sessions
- Grade Items, Focus Sessions, Plan Blocks
- App state (onboarding flag, timer settings)

Actions: toggle task status, toggle exam topics, add/remove subjects.

## Animations

Spring-driven animations via Reanimated:
- **Button press**: scale 0.97 with spring (120ms)
- **Checkbox completion**: Mint Pulse fill + bounce (1.0→1.2→1.0)
- **Tab transitions**: slide + fade (200ms)
- **Timer ring**: animated SVG stroke progress
- **Card entrance**: subtle scale + opacity fade-in
