/**
 * StudyFlow Mock Data
 */
import { Subject, Task, Exam, ClassSession, GradeItem, FocusSession, PlanBlock, PlantSession, StudyDay } from '../../types';

export const SUBJECTS: Subject[] = [
  { id: 's1', name: 'Chemistry', color: '#38BDF8', teacher: 'Dr. Martinez' },
  { id: 's2', name: 'Mathematics', color: '#6C63FF', teacher: 'Prof. Chen' },
  { id: 's3', name: 'Biology', color: '#4ADEAA', teacher: 'Dr. Patel' },
  { id: 's4', name: 'English Literature', color: '#FF6B6B', teacher: 'Ms. Thompson' },
  { id: 's5', name: 'Physics', color: '#F59E0B', teacher: 'Dr. Kim' },
];

export const TASKS: Task[] = [
  {
    id: 't1', title: 'Organic Chemistry Lab Report', subjectId: 's1',
    type: 'homework', status: 'pending', priority: 'high',
    dueDate: '2026-03-06', dueTime: '23:59', estimatedMinutes: 90,
    notes: 'Include spectroscopy analysis and reaction mechanisms.',
  },
  {
    id: 't2', title: 'Calculus Problem Set 7', subjectId: 's2',
    type: 'homework', status: 'pending', priority: 'medium',
    dueDate: '2026-03-07', estimatedMinutes: 60,
  },
  {
    id: 't3', title: 'Read Chapter 14 – Cell Division', subjectId: 's3',
    type: 'study', status: 'completed', priority: 'low',
    dueDate: '2026-03-05', estimatedMinutes: 45,
  },
  {
    id: 't4', title: 'Essay Draft – Hamlet Act III', subjectId: 's4',
    type: 'project', status: 'overdue', priority: 'high',
    dueDate: '2026-03-04', estimatedMinutes: 120,
    notes: 'Focus on the "To be or not to be" soliloquy.',
  },
  {
    id: 't5', title: 'Physics Worksheet – Electromagnetism', subjectId: 's5',
    type: 'homework', status: 'pending', priority: 'medium',
    dueDate: '2026-03-08', estimatedMinutes: 45,
  },
  {
    id: 't6', title: 'Study for Biology Midterm', subjectId: 's3',
    type: 'study', status: 'pending', priority: 'high',
    dueDate: '2026-03-12', estimatedMinutes: 180,
    subtasks: [
      { id: 'st1', title: 'Review Chapters 10-12', completed: true },
      { id: 'st2', title: 'Review Chapters 13-14', completed: false },
      { id: 'st3', title: 'Practice problems', completed: false },
    ],
  },
];

export const EXAMS: Exam[] = [
  {
    id: 'e1', subjectId: 's3', title: 'Biology Midterm',
    date: '2026-03-19', time: '10:00', location: 'Room 204',
    weight: 30,
    topics: [
      { id: 'et1', label: 'Cell Biology', completed: true },
      { id: 'et2', label: 'Genetics', completed: true },
      { id: 'et3', label: 'Evolution', completed: false },
      { id: 'et4', label: 'Ecology', completed: false },
      { id: 'et5', label: 'Cell Division', completed: true },
      { id: 'et6', label: 'DNA Replication', completed: false },
      { id: 'et7', label: 'Protein Synthesis', completed: false },
    ],
  },
  {
    id: 'e2', subjectId: 's1', title: 'Chemistry Final',
    date: '2026-04-15', time: '14:00', location: 'Hall A',
    weight: 40,
    topics: [
      { id: 'et8', label: 'Organic Reactions', completed: false },
      { id: 'et9', label: 'Thermodynamics', completed: false },
      { id: 'et10', label: 'Kinetics', completed: false },
      { id: 'et11', label: 'Equilibrium', completed: false },
    ],
  },
  {
    id: 'e3', subjectId: 's2', title: 'Calculus II Midterm',
    date: '2026-03-25', time: '09:00',
    weight: 25,
    topics: [
      { id: 'et12', label: 'Integration Techniques', completed: true },
      { id: 'et13', label: 'Series and Sequences', completed: false },
      { id: 'et14', label: 'Differential Equations', completed: false },
    ],
  },
];

export const CLASS_SESSIONS: ClassSession[] = [
  { id: 'c1', subjectId: 's1', day: 0, startTime: '09:00', endTime: '10:30', location: 'Lab 101', repeat: 'weekly' },
  { id: 'c2', subjectId: 's1', day: 2, startTime: '09:00', endTime: '10:30', location: 'Lab 101', repeat: 'weekly' },
  { id: 'c3', subjectId: 's2', day: 1, startTime: '11:00', endTime: '12:30', location: 'Room 305', repeat: 'weekly' },
  { id: 'c4', subjectId: 's2', day: 3, startTime: '11:00', endTime: '12:30', location: 'Room 305', repeat: 'weekly' },
  { id: 'c5', subjectId: 's3', day: 0, startTime: '14:00', endTime: '15:30', location: 'Room 204', repeat: 'weekly' },
  { id: 'c6', subjectId: 's3', day: 3, startTime: '14:00', endTime: '15:30', location: 'Room 204', repeat: 'weekly' },
  { id: 'c7', subjectId: 's4', day: 1, startTime: '09:00', endTime: '10:00', location: 'Room 112', repeat: 'weekly' },
  { id: 'c8', subjectId: 's4', day: 4, startTime: '09:00', endTime: '10:00', location: 'Room 112', repeat: 'weekly' },
  { id: 'c9', subjectId: 's5', day: 2, startTime: '14:00', endTime: '15:30', location: 'Room 401', repeat: 'weekly' },
  { id: 'c10', subjectId: 's5', day: 4, startTime: '14:00', endTime: '15:30', location: 'Room 401', repeat: 'weekly' },
];

export const GRADE_ITEMS: GradeItem[] = [
  { id: 'g1', subjectId: 's1', category: 'homework', label: 'Lab Report 1', score: 87, total: 100, date: '2026-02-10' },
  { id: 'g2', subjectId: 's1', category: 'homework', label: 'Lab Report 2', score: 92, total: 100, date: '2026-02-25' },
  { id: 'g3', subjectId: 's1', category: 'quiz', label: 'Quiz 1', score: 18, total: 20, date: '2026-02-15' },
  { id: 'g4', subjectId: 's1', category: 'quiz', label: 'Quiz 2', score: 16, total: 20, date: '2026-03-01' },
  { id: 'g5', subjectId: 's1', category: 'exam', label: 'Midterm', score: 85, total: 100, date: '2026-02-20' },
  { id: 'g6', subjectId: 's2', category: 'homework', label: 'Problem Set 1-5', score: 45, total: 50, date: '2026-02-28' },
  { id: 'g7', subjectId: 's2', category: 'quiz', label: 'Quiz 1', score: 9, total: 10, date: '2026-02-12' },
  { id: 'g8', subjectId: 's2', category: 'exam', label: 'Midterm 1', score: 88, total: 100, date: '2026-02-18' },
  { id: 'g9', subjectId: 's3', category: 'homework', label: 'Worksheet 1', score: 28, total: 30, date: '2026-02-08' },
  { id: 'g10', subjectId: 's3', category: 'quiz', label: 'Pop Quiz', score: 8, total: 10, date: '2026-02-22' },
  { id: 'g11', subjectId: 's4', category: 'homework', label: 'Essay 1', score: 90, total: 100, date: '2026-02-14' },
  { id: 'g12', subjectId: 's5', category: 'quiz', label: 'Quiz 1', score: 17, total: 20, date: '2026-02-20' },
  { id: 'g13', subjectId: 's5', category: 'homework', label: 'Worksheet 1-3', score: 42, total: 50, date: '2026-02-27' },
];

export const FOCUS_SESSIONS: FocusSession[] = [
  { id: 'f1', subjectId: 's1', taskId: 't1', duration: 50, date: '2026-03-04', quality: 4, completed: true },
  { id: 'f2', subjectId: 's2', taskId: 't2', duration: 25, date: '2026-03-04', quality: 3, completed: true },
  { id: 'f3', subjectId: 's3', duration: 45, date: '2026-03-03', quality: 5, completed: true, note: 'Reviewed cell division' },
  { id: 'f4', subjectId: 's1', duration: 50, date: '2026-03-03', quality: 4, completed: true },
  { id: 'f5', subjectId: 's5', duration: 25, date: '2026-03-02', quality: 2, completed: false },
];

export const PLAN_BLOCKS: PlanBlock[] = [
  { id: 'pb1', subjectId: 's1', taskId: 't1', startTime: '10:30', duration: 50, locked: false, type: 'study', label: 'Chemistry Review' },
  { id: 'pb2', subjectId: 's2', taskId: 't2', startTime: '13:00', duration: 45, locked: true, type: 'task', label: 'Calculus Problem Set' },
  { id: 'pb3', subjectId: 's3', startTime: '15:30', duration: 30, locked: false, type: 'study', label: 'Biology Reading' },
  { id: 'pb4', subjectId: 's4', taskId: 't4', startTime: '17:00', duration: 60, locked: false, type: 'task', label: 'Hamlet Essay Draft' },
  { id: 'pb5', subjectId: 's5', taskId: 't5', startTime: '19:00', duration: 45, locked: true, type: 'focus', label: 'Physics Focus' },
];

export const PLANT_SESSIONS: PlantSession[] = [
  { id: 'ps1', plantType: 'sunflower', plantEmoji: '🌻', duration: 50, subjectId: 's1', status: 'grown', stage: 'flower', startedAt: '2026-03-04T14:00:00Z', endedAt: '2026-03-04T14:50:00Z', strictMode: false },
  { id: 'ps2', plantType: 'cherry', plantEmoji: '🌸', duration: 25, subjectId: 's2', status: 'grown', stage: 'flower', startedAt: '2026-03-04T10:00:00Z', endedAt: '2026-03-04T10:25:00Z', strictMode: true },
  { id: 'ps3', plantType: 'herb', plantEmoji: '🌿', duration: 45, subjectId: 's3', status: 'withered', stage: 'sprout', startedAt: '2026-03-03T16:00:00Z', endedAt: '2026-03-03T16:12:00Z', strictMode: true },
  { id: 'ps4', plantType: 'bamboo', plantEmoji: '🎋', duration: 50, subjectId: 's1', status: 'grown', stage: 'flower', startedAt: '2026-03-03T09:00:00Z', endedAt: '2026-03-03T09:50:00Z', strictMode: false },
  { id: 'ps5', plantType: 'rose', plantEmoji: '🌹', duration: 25, subjectId: 's5', status: 'grown', stage: 'flower', startedAt: '2026-03-02T19:00:00Z', endedAt: '2026-03-02T19:25:00Z', strictMode: false },
  { id: 'ps6', plantType: 'sunflower', plantEmoji: '🌻', duration: 90, subjectId: 's2', status: 'grown', stage: 'flower', startedAt: '2026-03-01T14:00:00Z', endedAt: '2026-03-01T15:30:00Z', strictMode: true },
];

// 30 days of study history for heatmap
const generateStudyDays = (): StudyDay[] => {
  const days: StudyDay[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date(2026, 2, 5); // March 5 2026
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const rand = Math.random();
    const mins = rand > 0.2 ? Math.floor(rand * 180) + 15 : 0;
    days.push({
      date: dateStr,
      minutesStudied: mins,
      tasksCompleted: mins > 0 ? Math.floor(Math.random() * 5) + 1 : 0,
      focusSessions: mins > 0 ? Math.floor(Math.random() * 4) + 1 : 0,
    });
  }
  return days;
};

export const STUDY_DAYS: StudyDay[] = generateStudyDays();
