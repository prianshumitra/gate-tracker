export type SubjectPriority = 'critical' | 'high' | 'medium' | 'low';
export type ConfidenceLevel = 'weak' | 'average' | 'good' | 'strong';
export type TopicStatus = 'not_started' | 'in_progress' | 'completed';
export type TopicPriority = 'critical' | 'high' | 'medium' | 'low';


export interface TopicHistoryEntry {
  type: 'completed' | 'revised' | 'status_change' | 'reset';
  timestamp: string; // ISO string
  note?: string;
  previousConfidence?: ConfidenceLevel;
  newConfidence?: ConfidenceLevel;
}

export interface Topic {
  id: string;
  name: string;
  status: TopicStatus;
  confidence: ConfidenceLevel;
  priority: TopicPriority;
  completedAt: string | null; // ISO timestamp
  lastRevisedAt: string | null; // ISO timestamp
  nextRevisionAt: string | null; // YYYY-MM-DD
  revisionCount: number;
  notes: string;
  history: TopicHistoryEntry[];
}

export interface Chapter {
  id: string;
  name: string;
  topics: Topic[];
}

export interface Subject {
  id: string;
  name: string;
  code: string;
  order: number;
  priority: SubjectPriority;
  weightage: number; // Historical marks or percentage
  icon: string;
  chapters: Chapter[];
}

export interface ActivityLogEntry {
  id: string;
  date: string; // YYYY-MM-DD local
  topicId: string;
  topicName: string;
  subjectId: string;
  subjectName: string;
  type: 'topic_completed' | 'revision_completed';
  timestamp: string; // ISO
  confidence?: ConfidenceLevel;
}

export interface StreakMilestone {
  days: number;
  title: string;
  badge: string;
  description: string;
  unlockedAt: string | null;
}

export interface AppSettings {
  examDate: string; // YYYY-MM-DD
  revisionIntervals: number[]; // e.g. [1, 3, 7, 14, 30]
  dailyGoal: number; // topics/revisions per day
  soundEnabled: boolean;
  theme: 'dark' | 'light';
}

export interface IslandNotification {
  id: string;
  title: string;
  subtitle?: string;
  type: 'success' | 'revision' | 'milestone' | 'info';
  timestamp: number;
}

export type ActiveTab = 'dashboard' | 'subjects' | 'revision' | 'calendar' | 'analytics' | 'settings';

