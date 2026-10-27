/**
 * StudyFlow Zustand Store — Supabase integrated
 *
 * Strategy:
 *  - loadAll() fetches all user data from Supabase on sign-in
 *  - All mutations optimistically update local state first, then persist to DB
 *  - Falls back to mock data when user is not signed in (guest mode)
 */
import { create } from 'zustand';
import {
  Subject, Task, Exam, ClassSession, GradeItem,
  FocusSession, PlanBlock, PlantSession, StudyDay,
} from '../../types';
import {
  SUBJECTS, TASKS, EXAMS, CLASS_SESSIONS,
  GRADE_ITEMS, FOCUS_SESSIONS, PLAN_BLOCKS, PLANT_SESSIONS, STUDY_DAYS,
} from './mockData';
import {
  subjectsService, tasksService, examsService,
  gradesService, focusService, authService,
} from '../services';

interface AppState {
  // Data
  subjects: Subject[];
  tasks: Task[];
  exams: Exam[];
  classSessions: ClassSession[];
  gradeItems: GradeItem[];
  focusSessions: FocusSession[];
  planBlocks: PlanBlock[];
  plantSessions: PlantSession[];
  studyDays: StudyDay[];

  // Auth / App state
  userId: string | null;
  isOnboarded: boolean;
  isLoading: boolean;
  currentTimerMinutes: number;

  // ── Actions ───────────────────────────────────────────────────────────────

  /** Load all data from Supabase for the signed-in user */
  loadAll: (userId: string) => Promise<void>;

  /** Clear everything (on sign-out) */
  reset: () => void;

  setUserId: (id: string | null) => void;
  setOnboarded: (val: boolean) => void;
  setTimerMinutes: (mins: number) => void;

  // Subjects
  addSubject: (subject: Subject) => Promise<void>;
  removeSubject: (id: string) => Promise<void>;

  // Tasks
  addTask: (task: Task) => Promise<void>;
  toggleTaskStatus: (id: string) => Promise<void>;
  removeTask: (id: string) => Promise<void>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>;

  // Exams
  addExam: (exam: Exam) => Promise<void>;
  removeExam: (id: string) => Promise<void>;
  toggleExamTopic: (examId: string, topicId: string) => Promise<void>;

  // Grades
  addGradeItem: (item: GradeItem) => Promise<void>;
  removeGradeItem: (id: string) => Promise<void>;

  // Class Sessions
  addClassSession: (session: ClassSession) => Promise<void>;

  // Focus / Garden
  addFocusSession: (session: FocusSession) => Promise<void>;
  addPlantSession: (session: PlantSession) => Promise<void>;
  updatePlantSession: (id: string, updates: Partial<PlantSession>) => Promise<void>;

  // Plan
  reorderPlanBlocks: (blocks: PlanBlock[]) => void;

  // Auth
  signOut: () => Promise<void>;
}

const initialMock = {
  subjects: SUBJECTS,
  tasks: TASKS,
  exams: EXAMS,
  classSessions: CLASS_SESSIONS,
  gradeItems: GRADE_ITEMS,
  focusSessions: FOCUS_SESSIONS,
  planBlocks: PLAN_BLOCKS,
  plantSessions: PLANT_SESSIONS,
  studyDays: STUDY_DAYS,
};

export const useAppStore = create<AppState>((set, get) => ({
  ...initialMock,
  userId: null,
  isOnboarded: false,
  isLoading: false,
  currentTimerMinutes: 25,

  // ── Auth ─────────────────────────────────────────────────────────────────────

  setUserId: (id) => set({ userId: id }),
  setOnboarded: (val) => set({ isOnboarded: val }),
  setTimerMinutes: (mins) => set({ currentTimerMinutes: mins }),

  reset: () => set({ ...initialMock, userId: null, isOnboarded: false }),

  // ── Load All ─────────────────────────────────────────────────────────────────

  loadAll: async (userId) => {
    set({ isLoading: true, userId });
    try {
      const [subjects, tasks, exams, classSessions, gradeItems, focusSessions, plantSessions] =
        await Promise.all([
          subjectsService.listSubjects(),
          tasksService.listAll(),
          examsService.listAll(),
          subjectsService.listClassSessions(),
          gradesService.listAll(),
          focusService.listFocusSessions(),
          focusService.listPlantSessions(),
        ]);
      set({
        subjects, tasks, exams, classSessions,
        gradeItems, focusSessions, plantSessions,
        isOnboarded: true, // user is signed in → always show main app
        isLoading: false,
      });

      // Auto-seed CS subjects for new users with no subjects
      if (subjects.length === 0) {
        const csSubjects = [
          { name: 'Data Structures & Algorithms', color: '#6C63FF', teacher: undefined },
          { name: 'Object-Oriented Programming', color: '#38BDF8', teacher: undefined },
          { name: 'Database Systems', color: '#F59E0B', teacher: undefined },
          { name: 'Operating Systems', color: '#4ADEAA', teacher: undefined },
          { name: 'Computer Networks', color: '#F43F5E', teacher: undefined },
          { name: 'Software Engineering', color: '#A78BFA', teacher: undefined },
        ];
        try {
          const created = await Promise.all(
            csSubjects.map((s) => subjectsService.addSubject(s))
          );
          set({ subjects: created });
        } catch (e) {
          console.warn('[Store] Failed to seed CS subjects', e);
        }
      }
    } catch (e) {
      console.warn('[Store] loadAll failed, using mock data', e);
      set({ isLoading: false });
    }
  },

  // ── Subjects ──────────────────────────────────────────────────────────────────

  addSubject: async (subject) => {
    set((s) => ({ subjects: [...s.subjects, subject] })); // optimistic
    if (!get().userId) return;
    try {
      const saved = await subjectsService.addSubject(subject);
      set((s) => ({ subjects: s.subjects.map((x) => x.id === subject.id ? saved : x) }));
    } catch { set((s) => ({ subjects: s.subjects.filter((x) => x.id !== subject.id) })); }
  },

  removeSubject: async (id) => {
    const prev = get().subjects;
    set((s) => ({ subjects: s.subjects.filter((x) => x.id !== id) }));
    if (!get().userId) return;
    try { await subjectsService.removeSubject(id); }
    catch { set({ subjects: prev }); }
  },

  // ── Tasks ─────────────────────────────────────────────────────────────────────

  addTask: async (task) => {
    set((s) => ({ tasks: [task, ...s.tasks] }));
    if (!get().userId) return;
    try {
      const saved = await tasksService.add(task);
      set((s) => ({ tasks: s.tasks.map((x) => x.id === task.id ? saved : x) }));
    } catch { set((s) => ({ tasks: s.tasks.filter((x) => x.id !== task.id) })); }
  },

  toggleTaskStatus: async (id) => {
    const task = get().tasks.find((t) => t.id === id);
    if (!task) return;
    const newStatus = task.status === 'completed' ? 'pending' : 'completed';
    set((s) => ({
      tasks: s.tasks.map((t) => t.id === id ? { ...t, status: newStatus } : t),
    }));
    if (!get().userId) return;
    try { await tasksService.toggleStatus(id, task.status); }
    catch { set((s) => ({ tasks: s.tasks.map((t) => t.id === id ? { ...t, status: task.status } : t) })); }
  },

  removeTask: async (id) => {
    const prev = get().tasks;
    set((s) => ({ tasks: s.tasks.filter((t) => t.id !== id) }));
    if (!get().userId) return;
    try { await tasksService.remove(id); }
    catch { set({ tasks: prev }); }
  },

  updateTask: async (id, updates) => {
    const prev = get().tasks;
    set((s) => ({ tasks: s.tasks.map((t) => t.id === id ? { ...t, ...updates } : t) }));
    if (!get().userId) return;
    try { await tasksService.update(id, updates); }
    catch { set({ tasks: prev }); }
  },

  // ── Exams ─────────────────────────────────────────────────────────────────────

  addExam: async (exam) => {
    set((s) => ({ exams: [...s.exams, exam] }));
    if (!get().userId) return;
    try {
      const saved = await examsService.add(exam);
      set((s) => ({ exams: s.exams.map((x) => x.id === exam.id ? saved : x) }));
    } catch { set((s) => ({ exams: s.exams.filter((x) => x.id !== exam.id) })); }
  },

  removeExam: async (id) => {
    const prev = get().exams;
    set((s) => ({ exams: s.exams.filter((e) => e.id !== id) }));
    if (!get().userId) return;
    try { await examsService.remove(id); }
    catch { set({ exams: prev }); }
  },

  toggleExamTopic: async (examId, topicId) => {
    const exam = get().exams.find((e) => e.id === examId);
    const topic = exam?.topics.find((t) => t.id === topicId);
    set((s) => ({
      exams: s.exams.map((e) =>
        e.id === examId
          ? { ...e, topics: e.topics.map((t) => t.id === topicId ? { ...t, completed: !t.completed } : t) }
          : e,
      ),
    }));
    if (!get().userId || !topic) return;
    try { await examsService.toggleTopic(examId, topicId, topic.completed); }
    catch {
      set((s) => ({
        exams: s.exams.map((e) =>
          e.id === examId
            ? { ...e, topics: e.topics.map((t) => t.id === topicId ? { ...t, completed: topic.completed } : t) }
            : e,
        ),
      }));
    }
  },

  // ── Grades ────────────────────────────────────────────────────────────────────

  addGradeItem: async (item) => {
    set((s) => ({ gradeItems: [item, ...s.gradeItems] }));
    if (!get().userId) return;
    try {
      const saved = await gradesService.add(item);
      set((s) => ({ gradeItems: s.gradeItems.map((x) => x.id === item.id ? saved : x) }));
    } catch { set((s) => ({ gradeItems: s.gradeItems.filter((x) => x.id !== item.id) })); }
  },

  removeGradeItem: async (id) => {
    const prev = get().gradeItems;
    set((s) => ({ gradeItems: s.gradeItems.filter((g) => g.id !== id) }));
    if (!get().userId) return;
    try { await gradesService.remove(id); }
    catch { set({ gradeItems: prev }); }
  },

  // ── Class Sessions ────────────────────────────────────────────────────────────

  addClassSession: async (session) => {
    set((s) => ({ classSessions: [...s.classSessions, session] }));
    if (!get().userId) return;
    try {
      const saved = await subjectsService.addClassSession(session);
      set((s) => ({ classSessions: s.classSessions.map((x) => x.id === session.id ? saved : x) }));
    } catch { set((s) => ({ classSessions: s.classSessions.filter((x) => x.id !== session.id) })); }
  },

  // ── Focus / Garden ────────────────────────────────────────────────────────────

  addFocusSession: async (session) => {
    set((s) => ({ focusSessions: [session, ...s.focusSessions] }));
    if (!get().userId) return;
    try { await focusService.addFocusSession(session); }
    catch { set((s) => ({ focusSessions: s.focusSessions.filter((f) => f.id !== session.id) })); }
  },

  addPlantSession: async (session) => {
    set((s) => ({ plantSessions: [session, ...s.plantSessions] }));
    if (!get().userId) return;
    try { await focusService.addPlantSession(session); }
    catch { set((s) => ({ plantSessions: s.plantSessions.filter((p) => p.id !== session.id) })); }
  },

  updatePlantSession: async (id, updates) => {
    set((s) => ({
      plantSessions: s.plantSessions.map((p) => p.id === id ? { ...p, ...updates } : p),
    }));
    if (!get().userId) return;
    try { await focusService.updatePlantSession(id, updates); }
    catch { /* leave optimistic update */ }
  },

  // ── Plan ──────────────────────────────────────────────────────────────────────

  reorderPlanBlocks: (blocks) => set({ planBlocks: blocks }),

  // ── Auth ──────────────────────────────────────────────────────────────────────

  signOut: async () => {
    try {
      await authService.signOut();
    } catch (e) {
      console.warn('[Store] signOut error', e);
    }
    set({ ...initialMock, userId: null, isOnboarded: false });
  },
}));
