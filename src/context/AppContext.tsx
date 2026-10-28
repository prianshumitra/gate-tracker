import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import { Subject, ActivityLogEntry, AppSettings, ActiveTab, TopicStatus, ConfidenceLevel, Topic, IslandNotification } from '../types';
import { INITIAL_SUBJECTS } from '../data/initialSubjects';
import { generateDemoData } from '../data/demoData';
import { getLocalDateString, addDays } from '../utils/date';
import { calculateStreakStats, StreakStats } from '../utils/streak';
import { calculateNextRevisionDate, flattenAllTopics, FlatTopicWithSubject } from '../utils/revision';
import { playCheckSound, playRevisionSound, playFanfareSound, playUndoSound } from '../utils/sound';
import { calculateXp, fireConfetti, getTodayTasksCount } from '../utils/gamification';

interface UndoState {
  message: string;
  undo: () => void;
}

interface AppContextType {
  subjects: Subject[];
  activityLogs: ActivityLogEntry[];
  settings: AppSettings;
  activeTab: ActiveTab;
  selectedSubjectId: string;
  searchQuery: string;
  streakStats: StreakStats;
  flatTopics: FlatTopicWithSubject[];
  xp: number;
  todayTasksCount: number;
  undoState: UndoState | null;
  islandNotification: IslandNotification | null;

  // Actions
  setActiveTab: (tab: ActiveTab, subjectId?: string) => void;
  setSelectedSubjectId: (id: string) => void;
  setSearchQuery: (query: string) => void;
  toggleTopicStatus: (subjectId: string, chapterId: string, topicId: string, targetStatus?: TopicStatus) => void;
  updateTopicDetails: (subjectId: string, chapterId: string, topicId: string, updates: Partial<Topic>) => void;
  completeRevision: (subjectId: string, chapterId: string, topicId: string, newConfidence?: ConfidenceLevel, notes?: string) => void;
  postponeRevision: (subjectId: string, chapterId: string, topicId: string, daysToAdd: number) => void;
  bulkMarkChapter: (subjectId: string, chapterId: string, status: TopicStatus) => void;
  resetChapter: (subjectId: string, chapterId: string) => void;
  reorderSubjects: (subjects: Subject[]) => void;
  updateSubject: (subjectId: string, updates: Partial<Subject>) => void;
  addSubject: (newSubject: Subject) => void;
  deleteSubject: (subjectId: string) => void;
  updateSettings: (newSettings: Partial<AppSettings>) => void;
  loadDemoDataAction: () => void;
  resetAllDataAction: () => void;
  exportDataJson: () => string;
  importDataJson: (json: string) => boolean;
  dismissUndo: () => void;
  executeUndo: () => void;
  triggerIslandNotification: (notif: Omit<IslandNotification, 'id' | 'timestamp'>) => void;
  clearIslandNotification: () => void;
}

const STORAGE_KEY_SUBJECTS = 'gate_tracker_subjects_v2';
const STORAGE_KEY_LOGS = 'gate_tracker_logs_v2';
const STORAGE_KEY_SETTINGS = 'gate_tracker_settings_v2';

const DEFAULT_SETTINGS: AppSettings = {
  examDate: '2027-02-06', // Next typical GATE CS exam date
  revisionIntervals: [1, 3, 7, 14, 30],
  dailyGoal: 3,
  soundEnabled: true,
  theme: 'light' // Default to Minimalist Cream UI
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Initialize state with clean syllabus data (all topics unchecked)
  const [subjects, setSubjects] = useState<Subject[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SUBJECTS);
      if (saved) return JSON.parse(saved);
    } catch {
      // Fallback
    }
    // Default to clean syllabus where all topics are not_started
    return INITIAL_SUBJECTS;
  });

  const [activityLogs, setActivityLogs] = useState<ActivityLogEntry[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_LOGS);
      if (saved) return JSON.parse(saved);
    } catch {
      // Fallback
    }
    return [];
  });

  const [settings, setSettings] = useState<AppSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SETTINGS);
      if (saved) return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
    } catch {
      // Fallback
    }
    return DEFAULT_SETTINGS;
  });

  const [activeTab, setActiveTabState] = useState<ActiveTab>('dashboard');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('dsa');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [undoState, setUndoState] = useState<UndoState | null>(null);
  const [islandNotification, setIslandNotification] = useState<IslandNotification | null>(null);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_SUBJECTS, JSON.stringify(subjects));
    } catch (e) {
      console.error('Failed to save subjects', e);
    }
  }, [subjects]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_LOGS, JSON.stringify(activityLogs));
    } catch (e) {
      console.error('Failed to save activity logs', e);
    }
  }, [activityLogs]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings));
    } catch (e) {
      console.error('Failed to save settings', e);
    }
    if (settings.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings]);

  // Auto-dismiss undo after 6 seconds
  useEffect(() => {
    if (!undoState) return;
    const timer = setTimeout(() => {
      setUndoState(null);
    }, 6000);
    return () => clearTimeout(timer);
  }, [undoState]);

  // Auto-dismiss Island notification after 3.8 seconds
  useEffect(() => {
    if (!islandNotification) return;
    const timer = setTimeout(() => {
      setIslandNotification(null);
    }, 3800);
    return () => clearTimeout(timer);
  }, [islandNotification]);

  const triggerIslandNotification = (notif: Omit<IslandNotification, 'id' | 'timestamp'>) => {
    setIslandNotification({
      ...notif,
      id: `island-${Date.now()}`,
      timestamp: Date.now()
    });
  };

  const clearIslandNotification = () => setIslandNotification(null);


  // Derived statistics
  const todayStr = getLocalDateString();
  const streakStats = useMemo(() => calculateStreakStats(activityLogs, todayStr), [activityLogs, todayStr]);
  const flatTopics = useMemo(() => flattenAllTopics(subjects), [subjects]);
  const xp = useMemo(() => calculateXp(activityLogs), [activityLogs]);
  const todayTasksCount = useMemo(() => getTodayTasksCount(activityLogs, todayStr), [activityLogs, todayStr]);

  const setActiveTab = (tab: ActiveTab, subjectId?: string) => {
    setActiveTabState(tab);
    if (subjectId) {
      setSelectedSubjectId(subjectId);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  /**
   * One-click toggle topic status with auto-scheduling and activity recording
   */
  const toggleTopicStatus = (
    subjectId: string,
    chapterId: string,
    topicId: string,
    targetStatus?: TopicStatus
  ) => {
    const previousSubjects = JSON.parse(JSON.stringify(subjects));
    const previousLogs = [...activityLogs];
    const nowIso = new Date().toISOString();
    const today = getLocalDateString();

    let topicName = '';
    let subjectName = '';
    let becameCompleted = false;

    setSubjects(prev =>
      prev.map(subj => {
        if (subj.id !== subjectId) return subj;
        subjectName = subj.name;

        return {
          ...subj,
          chapters: subj.chapters.map(chap => {
            if (chap.id !== chapterId) return chap;

            return {
              ...chap,
              topics: chap.topics.map(top => {
                if (top.id !== topicId) return top;
                topicName = top.name;

                let nextStatus: TopicStatus;
                if (targetStatus) {
                  nextStatus = targetStatus;
                } else {
                  if (top.status === 'not_started') nextStatus = 'completed';
                  else if (top.status === 'in_progress') nextStatus = 'completed';
                  else nextStatus = 'not_started';
                }

                if (nextStatus === 'completed') {
                  becameCompleted = true;
                  const nextRev = calculateNextRevisionDate(0, settings.revisionIntervals, today);
                  return {
                    ...top,
                    status: 'completed',
                    completedAt: nowIso,
                    nextRevisionAt: nextRev,
                    history: [
                      ...top.history,
                      { type: 'completed', timestamp: nowIso }
                    ]
                  };
                } else if (nextStatus === 'in_progress') {
                  return {
                    ...top,
                    status: 'in_progress',
                    history: [
                      ...top.history,
                      { type: 'status_change', timestamp: nowIso, note: 'Marked in progress' }
                    ]
                  };
                } else {
                  // Reset to not started
                  return {
                    ...top,
                    status: 'not_started',
                    completedAt: null,
                    nextRevisionAt: null,
                    revisionCount: 0,
                    history: [
                      ...top.history,
                      { type: 'reset', timestamp: nowIso }
                    ]
                  };
                }
              })
            };
          })
        };
      })
    );

    // If completed, record activity log & play sound
    if (becameCompleted) {
      const newLog: ActivityLogEntry = {
        id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        date: today,
        topicId,
        topicName,
        subjectId,
        subjectName,
        type: 'topic_completed',
        timestamp: nowIso
      };
      setActivityLogs(prev => [newLog, ...prev]);
      playCheckSound(settings.soundEnabled);

      triggerIslandNotification({
        title: 'Topic Completed',
        subtitle: `${topicName} (+50 XP)`,
        type: 'success'
      });

      // Check if daily goal reached
      if (todayTasksCount + 1 === settings.dailyGoal) {
        fireConfetti();
        playFanfareSound(settings.soundEnabled);
        triggerIslandNotification({
          title: 'Daily Goal Smashed! 🎉',
          subtitle: `${todayTasksCount + 1}/${settings.dailyGoal} tasks done today`,
          type: 'milestone'
        });
      }
    } else {
      playUndoSound(settings.soundEnabled);
    }

    // Set undo action
    setUndoState({
      message: becameCompleted
        ? `Marked "${topicName}" as completed`
        : `Reset "${topicName}" status`,
      undo: () => {
        setSubjects(previousSubjects);
        setActivityLogs(previousLogs);
        playUndoSound(settings.soundEnabled);
      }
    });
  };

  /**
   * Update arbitrary details of a topic (confidence, priority, notes, next revision)
   */
  const updateTopicDetails = (
    subjectId: string,
    chapterId: string,
    topicId: string,
    updates: Partial<Topic>
  ) => {
    setSubjects(prev =>
      prev.map(subj => {
        if (subj.id !== subjectId) return subj;
        return {
          ...subj,
          chapters: subj.chapters.map(chap => {
            if (chap.id !== chapterId) return chap;
            return {
              ...chap,
              topics: chap.topics.map(top => {
                if (top.id !== topicId) return top;
                return { ...top, ...updates };
              })
            };
          })
        };
      })
    );
  };

  /**
   * Complete a scheduled revision
   */
  const completeRevision = (
    subjectId: string,
    chapterId: string,
    topicId: string,
    newConfidence?: ConfidenceLevel,
    notes?: string
  ) => {
    const previousSubjects = JSON.parse(JSON.stringify(subjects));
    const previousLogs = [...activityLogs];
    const nowIso = new Date().toISOString();
    const today = getLocalDateString();

    let topicName = '';
    let subjectName = '';
    let newRevCount = 1;

    setSubjects(prev =>
      prev.map(subj => {
        if (subj.id !== subjectId) return subj;
        subjectName = subj.name;

        return {
          ...subj,
          chapters: subj.chapters.map(chap => {
            if (chap.id !== chapterId) return chap;

            return {
              ...chap,
              topics: chap.topics.map(top => {
                if (top.id !== topicId) return top;
                topicName = top.name;

                newRevCount = top.revisionCount + 1;
                const nextRevDate = calculateNextRevisionDate(newRevCount, settings.revisionIntervals, today);

                return {
                  ...top,
                  lastRevisedAt: nowIso,
                  nextRevisionAt: nextRevDate,
                  revisionCount: newRevCount,
                  confidence: newConfidence || top.confidence,
                  notes: notes !== undefined ? notes : top.notes,
                  history: [
                    ...top.history,
                    {
                      type: 'revised',
                      timestamp: nowIso,
                      previousConfidence: top.confidence,
                      newConfidence: newConfidence || top.confidence,
                      note: notes
                    }
                  ]
                };
              })
            };
          })
        };
      })
    );

    // Record activity log
    const newLog: ActivityLogEntry = {
      id: `log-rev-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      date: today,
      topicId,
      topicName,
      subjectId,
      subjectName,
      type: 'revision_completed',
      timestamp: nowIso,
      confidence: newConfidence
    };
    setActivityLogs(prev => [newLog, ...prev]);
    playRevisionSound(settings.soundEnabled);

    triggerIslandNotification({
      title: 'Revision Completed',
      subtitle: `${topicName} (Rev #${newRevCount})`,
      type: 'revision'
    });

    // Check if daily goal reached
    if (todayTasksCount + 1 === settings.dailyGoal) {
      fireConfetti();
      playFanfareSound(settings.soundEnabled);
      triggerIslandNotification({
        title: 'Daily Goal Smashed! 🎉',
        subtitle: `${todayTasksCount + 1}/${settings.dailyGoal} tasks done today`,
        type: 'milestone'
      });
    }

    setUndoState({
      message: `Completed revision for "${topicName}"`,
      undo: () => {
        setSubjects(previousSubjects);
        setActivityLogs(previousLogs);
        playUndoSound(settings.soundEnabled);
      }
    });
  };

  /**
   * Postpone revision by N days
   */
  const postponeRevision = (
    subjectId: string,
    chapterId: string,
    topicId: string,
    daysToAdd: number
  ) => {
    const today = getLocalDateString();
    setSubjects(prev =>
      prev.map(subj => {
        if (subj.id !== subjectId) return subj;
        return {
          ...subj,
          chapters: subj.chapters.map(chap => {
            if (chap.id !== chapterId) return chap;
            return {
              ...chap,
              topics: chap.topics.map(top => {
                if (top.id !== topicId) return top;
                const baseDate = top.nextRevisionAt && top.nextRevisionAt > today ? top.nextRevisionAt : today;
                const newNextDate = addDays(baseDate, daysToAdd);
                return {
                  ...top,
                  nextRevisionAt: newNextDate
                };
              })
            };
          })
        };
      })
    );
  };

  /**
   * Bulk mark all topics in a chapter
   */
  const bulkMarkChapter = (subjectId: string, chapterId: string, status: TopicStatus) => {
    const previousSubjects = JSON.parse(JSON.stringify(subjects));
    const nowIso = new Date().toISOString();
    const today = getLocalDateString();

    setSubjects(prev =>
      prev.map(subj => {
        if (subj.id !== subjectId) return subj;
        return {
          ...subj,
          chapters: subj.chapters.map(chap => {
            if (chap.id !== chapterId) return chap;
            return {
              ...chap,
              topics: chap.topics.map(top => {
                if (status === 'completed') {
                  const nextRev = calculateNextRevisionDate(0, settings.revisionIntervals, today);
                  return {
                    ...top,
                    status: 'completed',
                    completedAt: nowIso,
                    nextRevisionAt: nextRev
                  };
                }
                return {
                  ...top,
                  status,
                  completedAt: null,
                  nextRevisionAt: null,
                  revisionCount: 0
                };
              })
            };
          })
        };
      })
    );

    setUndoState({
      message: `Updated all topics in chapter`,
      undo: () => {
        setSubjects(previousSubjects);
        playUndoSound(settings.soundEnabled);
      }
    });
  };

  /**
   * Reset all topics in a chapter
   */
  const resetChapter = (subjectId: string, chapterId: string) => {
    bulkMarkChapter(subjectId, chapterId, 'not_started');
  };

  /**
   * Reorder subjects list
   */
  const reorderSubjects = (newSubjects: Subject[]) => {
    setSubjects(newSubjects.map((s, idx) => ({ ...s, order: idx + 1 })));
  };

  /**
   * Update subject metadata (name, priority, weightage)
   */
  const updateSubject = (subjectId: string, updates: Partial<Subject>) => {
    setSubjects(prev =>
      prev.map(s => (s.id === subjectId ? { ...s, ...updates } : s))
    );
  };

  /**
   * Add a new custom subject
   */
  const addSubject = (newSubject: Subject) => {
    setSubjects(prev => [...prev, newSubject]);
  };

  /**
   * Delete a subject
   */
  const deleteSubject = (subjectId: string) => {
    setSubjects(prev => prev.filter(s => s.id !== subjectId));
  };

  /**
   * Update settings
   */
  const updateSettings = (newSettings: Partial<AppSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  /**
   * Reset / Reload demo data
   */
  const loadDemoDataAction = () => {
    const demo = generateDemoData();
    setSubjects(demo.subjects);
    setActivityLogs(demo.activityLogs);
    fireConfetti();
  };

  /**
   * Clear all progress for a fresh start
   */
  const resetAllDataAction = () => {
    setSubjects(INITIAL_SUBJECTS);
    setActivityLogs([]);
  };

  /**
   * Export all data as JSON
   */
  const exportDataJson = (): string => {
    return JSON.stringify({ subjects, activityLogs, settings, exportedAt: new Date().toISOString() }, null, 2);
  };

  /**
   * Import data from JSON
   */
  const importDataJson = (json: string): boolean => {
    try {
      const data = JSON.parse(json);
      if (Array.isArray(data.subjects) && Array.isArray(data.activityLogs)) {
        setSubjects(data.subjects);
        setActivityLogs(data.activityLogs);
        if (data.settings) setSettings(data.settings);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const dismissUndo = () => setUndoState(null);

  const executeUndo = () => {
    if (undoState) {
      undoState.undo();
      setUndoState(null);
    }
  };

  return (
    <AppContext.Provider
      value={{
        subjects,
        activityLogs,
        settings,
        activeTab,
        selectedSubjectId,
        searchQuery,
        streakStats,
        flatTopics,
        xp,
        todayTasksCount,
        undoState,
        islandNotification,
        setActiveTab,
        setSelectedSubjectId,
        setSearchQuery,
        toggleTopicStatus,
        updateTopicDetails,
        completeRevision,
        postponeRevision,
        bulkMarkChapter,
        resetChapter,
        reorderSubjects,
        updateSubject,
        addSubject,
        deleteSubject,
        updateSettings,
        loadDemoDataAction,
        resetAllDataAction,
        exportDataJson,
        importDataJson,
        dismissUndo,
        executeUndo,
        triggerIslandNotification,
        clearIslandNotification
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
