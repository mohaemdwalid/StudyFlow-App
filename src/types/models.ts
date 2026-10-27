/**
 * StudyFlow Type Definitions
 */

export interface Subject {
  id: string;
  name: string;
  color: string;
  teacher?: string;
  semester?: string;
}

export interface Task {
  id: string;
  title: string;
  subjectId: string;
  type: 'homework' | 'project' | 'study' | 'personal';
  status: 'pending' | 'completed' | 'overdue';
  priority: 'low' | 'medium' | 'high';
  dueDate: string;
  dueTime?: string;
  estimatedMinutes: number;
  notes?: string;
  tags?: string[];
  subtasks?: Subtask[];
}

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Exam {
  id: string;
  subjectId: string;
  title: string;
  date: string;
  time?: string;
  location?: string;
  weight?: number;
  topics: ExamTopic[];
}

export interface ExamTopic {
  id: string;
  label: string;
  completed: boolean;
}

export interface ClassSession {
  id: string;
  subjectId: string;
  day: number; // 0=Mon, 6=Sun
  startTime: string; // "HH:mm"
  endTime: string;
  location?: string;
  repeat: 'none' | 'weekly' | 'biweekly' | 'custom';
}

export interface GradeItem {
  id: string;
  subjectId: string;
  category: 'homework' | 'quiz' | 'exam' | 'custom';
  label: string;
  score: number;
  total: number;
  date: string;
  weight?: number;
}

export interface FocusSession {
  id: string;
  subjectId?: string;
  taskId?: string;
  duration: number; // minutes
  date: string;
  quality?: number; // 1-5
  note?: string;
  completed: boolean;
}

export interface PlanBlock {
  id: string;
  subjectId: string;
  taskId?: string;
  startTime: string;
  duration: number; // minutes
  locked: boolean;
  type: 'study' | 'focus' | 'task';
  label: string;
}

export interface SubjectGrade {
  subjectId: string;
  subjectName: string;
  color: string;
  percentage: number;
  letterGrade: string;
  categories: GradeCategory[];
  weightsComplete: boolean;
}

export interface GradeCategory {
  name: string;
  weight: number;
  items: GradeItem[];
  average: number;
}

// ─── Focus Garden ─────────────────────────────────────────────────────────────
export type PlantStage = 'seed' | 'sprout' | 'leaf' | 'flower';
export type PlantStatus = 'growing' | 'grown' | 'withered';
export type PlantType = 'sunflower' | 'cherry' | 'herb' | 'bamboo' | 'rose';

export interface PlantSession {
  id: string;
  plantType: PlantType;
  plantEmoji: string;
  duration: number; // minutes
  subjectId?: string;
  status: PlantStatus;
  stage: PlantStage;
  startedAt: string; // ISO
  endedAt?: string;
  strictMode: boolean;
}

// ─── Study Streak ─────────────────────────────────────────────────────────────
export interface StudyDay {
  date: string; // YYYY-MM-DD
  minutesStudied: number;
  tasksCompleted: number;
  focusSessions: number;
}

// ─── Difficulty Prediction ────────────────────────────────────────────────────
export interface DifficultyInsight {
  subjectId: string;
  subjectName: string;
  color: string;
  riskLevel: 'high' | 'medium' | 'low';
  reasons: string[];
  suggestion: string;
}
