# StudyFlow — Future Improvements

## Phase 1: Core Functionality
- [ ] Real authentication (Firebase Auth / Supabase)
- [ ] AsyncStorage persistence for Zustand store
- [ ] Real-time sync with cloud backend
- [ ] Push notifications for task reminders, class alerts, exam countdowns
- [ ] Calendar integration (Google Calendar, Apple Calendar)

## Phase 2: Focus Garden
- [ ] Plant growth animations (seed → sprout → leaves → bloom → full plant)
- [ ] Strict Mode with app backgrounding detection
- [ ] Withered plant state on session failure
- [ ] Garden collection grid with plant illustrations
- [ ] Plant detail screen with growth timeline
- [ ] Lottie animations for confetti celebrations

## Phase 3: AI Features
- [ ] Real AI plan generation (OpenAI / Gemini API)
- [ ] Chat with AI Coach (conversation UI)
- [ ] Catch-up Mode — intelligent rescheduling for overdue items
- [ ] Smart study suggestions based on exam proximity
- [ ] Topic difficulty estimation from grade patterns

## Phase 4: Analytics & Reports
- [ ] Analytics dashboard with charts (Victory Native or react-native-chart-kit)
- [ ] Weekly report generation with shareable images
- [ ] Focus time bar charts (daily/weekly)
- [ ] Subject breakdown visualization
- [ ] Grade trend multi-line chart
- [ ] Streak tracking with calendar heatmap

## Phase 5: Advanced Planner
- [ ] Drag-and-drop plan block reordering
- [ ] Swipe-to-complete and swipe-to-reschedule on task rows
- [ ] Week and day agenda views for calendar
- [ ] Plan history and version comparison (diff view)
- [ ] Study block detail bottom sheet
- [ ] Long-press to create events on timetable

## Phase 6: Settings & Personalization
- [ ] Full settings screen (appearance, notifications, presets)
- [ ] Custom Pomodoro presets with sound selection
- [ ] GPA scale configuration (4.0, 5.0, percentage, custom)
- [ ] Theme customization (accent color picker)
- [ ] Profile editing and avatar upload

## Phase 7: Gradebook Enhancements
- [ ] Grade weight override per item
- [ ] Live grade recalculation as items are added
- [ ] "What-if" grade calculator
- [ ] Grade import from LMS (Canvas, Blackboard)
- [ ] Category management (add, rename, weight adjustment)

## Phase 8: Premium & Monetization
- [ ] Paywall screen with subscription options
- [ ] IAP integration (RevenueCat or expo-in-app-purchases)
- [ ] Premium feature gating (AI generation, advanced analytics, Garden)
- [ ] Free trial system (7-day)

## Phase 9: Polish & Performance
- [ ] Skeleton loaders with shimmer animation on all async content
- [ ] Empty state illustrations for every screen
- [ ] Haptic feedback on interactions (expo-haptics)
- [ ] Reduce re-renders with React.memo and useMemo
- [ ] Optimize FlatList with getItemLayout and windowSize tuning
- [ ] Add unit tests (Jest + React Native Testing Library)
- [ ] E2E tests (Detox or Maestro)

## Phase 10: Platform & Distribution
- [ ] OTA updates (expo-updates)
- [ ] App Store submission (iOS)
- [ ] Google Play submission (Android)
- [ ] Deep linking support
- [ ] Widget support (iOS 14+ / Android 12+)
- [ ] Apple Watch companion app

## Technical Debt
- [ ] Replace `navigation: any` with proper typed navigation
- [ ] Add screen transition shared element animations
- [ ] Move inline styles to StyleSheet
- [ ] Add error boundaries
- [ ] Implement proper form validation (react-hook-form + zod)
- [ ] Add i18n/localization support
