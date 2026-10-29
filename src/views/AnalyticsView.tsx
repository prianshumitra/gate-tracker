import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { getLocalDateString, addDays, diffInDays, daysUntilExam } from '../utils/date';
import {
  BarChart3,
  TrendingUp,
  AlertTriangle,
  RotateCcw,
  Calendar,
  Sparkles,
  Clock,
  ArrowUpRight,
  Award
} from 'lucide-react';
import { Subject, Chapter, Topic, ActivityLogEntry } from '../types';
import { FlatTopicWithSubject } from '../utils/revision';
import { playRevisionSound } from '../utils/sound';

export const AnalyticsView: React.FC = () => {
  const {
    subjects,
    flatTopics,
    activityLogs,
    streakStats,
    settings,
    setActiveTab,
    setSelectedSubjectId,
    completeRevision,
    triggerIslandNotification
  } = useApp();

  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | 'all'>('30d');
  const [selectedSubjectFilter] = useState<string>('all');
  const [matrixSortBy, setMatrixSortBy] = useState<'weightage' | 'syllabus' | 'overdue' | 'weak'>('weightage');
  const [activeSection, setActiveSection] = useState<'overview' | 'memory' | 'subjects'>('overview');

  const todayStr = getLocalDateString();
  const daysLeftExam = daysUntilExam(settings.examDate);

  // Date range cutoff calculation
  const rangeDays = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : timeRange === '90d' ? 90 : 365;
  const startDateStr = addDays(todayStr, -rangeDays);

  // Filter activity logs based on selected time range
  const filteredLogs = useMemo(() => {
    return activityLogs.filter(
      (log: ActivityLogEntry) =>
        log.date >= startDateStr &&
        log.date <= todayStr &&
        (selectedSubjectFilter === 'all' || log.subjectId === selectedSubjectFilter)
    );
  }, [activityLogs, startDateStr, todayStr, selectedSubjectFilter]);

  // Total topics metrics
  const totalTopics = flatTopics.length;
  const completedTopics = flatTopics.filter((t: FlatTopicWithSubject) => t.topic.status === 'completed').length;
  const remainingTopics = totalTopics - completedTopics;
  const syllabusPct = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;

  // Active days in selected period
  const uniqueActiveDates = Array.from(new Set(filteredLogs.map((l: ActivityLogEntry) => l.date)));
  const elapsedDays = Math.min(rangeDays, Math.max(1, diffInDays(startDateStr, todayStr)));
  const consistencyPct = Math.round((uniqueActiveDates.length / elapsedDays) * 100);

  // Spaced Repetition Retention Metrics
  const reinforcedTopics = flatTopics.filter((t: FlatTopicWithSubject) => t.topic.revisionCount >= 2).length;
  const firstRevisionTopics = flatTopics.filter((t: FlatTopicWithSubject) => t.topic.revisionCount === 1).length;
  const zeroRevisionCompleted = flatTopics.filter(
    (t: FlatTopicWithSubject) => t.topic.status === 'completed' && t.topic.revisionCount === 0
  ).length;

  const retentionScore =
    completedTopics > 0 ? Math.round((reinforcedTopics / completedTopics) * 100) : 0;

  // Weak and Neglected Concepts
  const weakTopics = flatTopics.filter((t: FlatTopicWithSubject) => t.topic.confidence === 'weak');
  const neglectedTopics = flatTopics.filter((t: FlatTopicWithSubject) => {
    if (t.topic.status !== 'completed' || !t.topic.completedAt) return false;
    const daysSinceComp = diffInDays(t.topic.completedAt.slice(0, 10), todayStr);
    return daysSinceComp >= 14 && t.topic.revisionCount === 0;
  });

  // Calculate study pace & velocity
  const past7DaysLogs = activityLogs.filter((l: ActivityLogEntry) => l.date >= addDays(todayStr, -7)).length;
  const prev7DaysLogs = activityLogs.filter(
    (l: ActivityLogEntry) => l.date >= addDays(todayStr, -14) && l.date < addDays(todayStr, -7)
  ).length;

  // Day of week activity distribution (Sun=0, Mon=1, ..., Sat=6)
  const dayOfWeekCounts = [0, 0, 0, 0, 0, 0, 0];
  filteredLogs.forEach((l: ActivityLogEntry) => {
    const d = new Date(l.timestamp);
    dayOfWeekCounts[d.getDay()]++;
  });
  const maxDayCount = Math.max(1, ...dayOfWeekCounts);
  const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const peakDayIdx = dayOfWeekCounts.indexOf(Math.max(...dayOfWeekCounts));

  // Subject Comparison Matrix
  const subjectComparison = useMemo(() => {
    const data = subjects.map((subj: Subject) => {
      let total = 0;
      let completed = 0;
      let reinforced = 0;
      let overdue = 0;
      let weak = 0;

      subj.chapters.forEach((c: Chapter) => {
        c.topics.forEach((t: Topic) => {
          total++;
          if (t.status === 'completed') {
            completed++;
            if (t.revisionCount >= 2) reinforced++;
          }
          if (t.confidence === 'weak') weak++;
          if (t.nextRevisionAt && t.nextRevisionAt < todayStr) overdue++;
        });
      });

      const syllabusPercent = total > 0 ? Math.round((completed / total) * 100) : 0;
      const revisionPercent = completed > 0 ? Math.round((reinforced / completed) * 100) : 0;

      return {
        id: subj.id,
        code: subj.code,
        name: subj.name,
        priority: subj.priority,
        weightage: subj.weightage,
        total,
        completed,
        reinforced,
        syllabusPercent,
        revisionPercent,
        overdue,
        weak
      };
    });

    // Sorting
    return data.sort((a, b) => {
      if (matrixSortBy === 'weightage') return b.weightage - a.weightage;
      if (matrixSortBy === 'syllabus') return b.syllabusPercent - a.syllabusPercent;
      if (matrixSortBy === 'overdue') return b.overdue - a.overdue;
      if (matrixSortBy === 'weak') return b.weak - a.weak;
      return 0;
    });
  }, [subjects, todayStr, matrixSortBy]);

  // Largest overdue backlog subject
  const sortedByOverdue = [...subjectComparison].sort((a, b) => b.overdue - a.overdue);
  const worstBacklogSubject = sortedByOverdue[0]?.overdue > 0 ? sortedByOverdue[0] : null;

  // Grounded Smart Insights
  const insights = useMemo(() => {
    const list: { type: 'strength' | 'warning' | 'strategy'; text: string; actionText?: string; actionTab?: string }[] = [];

    // Momentum
    if (past7DaysLogs > 0) {
      const diff = past7DaysLogs - prev7DaysLogs;
      if (diff > 0) {
        list.push({
          type: 'strength',
          text: `Velocity Up: You completed ${past7DaysLogs} tasks this week, which is +${diff} more than last week!`
        });
      } else {
        list.push({
          type: 'strength',
          text: `Consistency: You logged ${past7DaysLogs} learning events in the past 7 days.`
        });
      }
    }

    // Overdue Warning
    if (worstBacklogSubject) {
      list.push({
        type: 'warning',
        text: `${worstBacklogSubject.name} (${worstBacklogSubject.code}) has the largest overdue backlog (${worstBacklogSubject.overdue} pending reviews). Prioritise this subject today.`,
        actionText: 'View Revision Queue',
        actionTab: 'revision'
      });
    }

    // Neglected Topics
    if (neglectedTopics.length > 0) {
      list.push({
        type: 'warning',
        text: `Memory Decay Risk: ${neglectedTopics.length} topics were completed >14 days ago and haven't had a single spaced review.`,
        actionText: 'Inspect Neglected Topics',
        actionTab: 'revision'
      });
    }

    // Weightage Strategy
    const highWeightagePending = subjectComparison.filter(s => s.weightage >= 8 && s.syllabusPercent < 50);
    if (highWeightagePending.length > 0) {
      list.push({
        type: 'strategy',
        text: `High-Yield Opportunity: ${highWeightagePending.map(s => s.code).join(', ')} carry high GATE marks (>8 Marks) and are below 50% coverage.`
      });
    } else {
      list.push({
        type: 'strategy',
        text: `All high-weightage core GATE subjects (DSA, OS, DBMS) are well tracked!`
      });
    }

    return list;
  }, [past7DaysLogs, prev7DaysLogs, worstBacklogSubject, neglectedTopics.length, subjectComparison]);

  const handleQuickRevise = (item: FlatTopicWithSubject) => {
    completeRevision(item.subjectId, item.chapterId, item.topic.id, 'good');
    playRevisionSound(settings.soundEnabled);
    triggerIslandNotification({
      title: 'Revision Completed! ↻',
      subtitle: `${item.topic.name}`,
      type: 'revision'
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Executive Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#EDE4D0] dark:border-stone-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#FAF4E4] text-[#8E5B13] border border-[#EEDDB8]">
              <Sparkles className="w-3.5 h-3.5 text-[#C68A2C]" />
              GATE 2027 Intelligence Deck
            </span>
            <span className="text-xs text-stone-400">•</span>
            <span className="text-xs text-stone-500 font-medium">
              {daysLeftExam} Days Remaining to Exam
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1D2417] dark:text-stone-100 tracking-tight font-serif flex items-center gap-2.5">
            <BarChart3 className="w-6 h-6 text-[#486B2C]" />
            Preparation Analytics
          </h2>
          <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 mt-1 max-w-2xl">
            Real-time diagnostics on syllabus coverage, spaced repetition retention rates, and subject preparedness matrices.
          </p>
        </div>

        {/* Toolbar: Time Range Selector */}
        <div className="flex items-center gap-1.5 self-start md:self-auto bg-[#F1EADA] dark:bg-stone-900 p-1 rounded-xl border border-[#EDE4D0] dark:border-stone-800 text-xs font-semibold shadow-xs">
          {(['7d', '30d', '90d', 'all'] as const).map(range => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                timeRange === range
                  ? 'bg-[#486B2C] text-white shadow-xs font-bold'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
              }`}
            >
              {range === '7d' ? '7 Days' : range === '30d' ? '30 Days' : range === '90d' ? '90 Days' : 'All Time'}
            </button>
          ))}
        </div>
      </div>

      {/* Top 4 KPI Executive Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Overall Syllabus Completion */}
        <div className="p-5 rounded-2xl bg-white dark:bg-stone-900 border border-[#EDE4D0] dark:border-stone-800 shadow-[0_2px_8px_rgba(40,30,20,0.03)] flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-stone-500 font-bold uppercase tracking-wider mb-2">
            <span>Syllabus Coverage</span>
            <TrendingUp className="w-4 h-4 text-[#486B2C]" />
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-[#1D2417] dark:text-stone-100 font-serif">
                {syllabusPct}%
              </span>
              <span className="text-xs font-semibold text-stone-500">
                ({completedTopics}/{totalTopics} topics)
              </span>
            </div>
            <div className="mt-2 w-full h-2 bg-[#EDE4D0] dark:bg-stone-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#486B2C] rounded-full transition-all duration-700"
                style={{ width: `${syllabusPct}%` }}
              />
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-[#EDE4D0]/60 dark:border-stone-800 text-[11px] text-stone-500 flex items-center justify-between">
            <span>Remaining: <strong>{remainingTopics} topics</strong></span>
            <span className="text-[#486B2C] font-semibold">GATE CS Core</span>
          </div>
        </div>

        {/* KPI 2: Study Consistency Index */}
        <div className="p-5 rounded-2xl bg-white dark:bg-stone-900 border border-[#EDE4D0] dark:border-stone-800 shadow-[0_2px_8px_rgba(40,30,20,0.03)] flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-stone-500 font-bold uppercase tracking-wider mb-2">
            <span>Study Consistency</span>
            <Calendar className="w-4 h-4 text-[#486B2C]" />
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-[#486B2C] font-serif">
                {consistencyPct}%
              </span>
              <span className="text-xs font-semibold text-stone-500">
                Active Habit Score
              </span>
            </div>
            <div className="mt-2 w-full h-2 bg-[#EDE4D0] dark:bg-stone-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#486B2C] rounded-full transition-all duration-700"
                style={{ width: `${consistencyPct}%` }}
              />
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-[#EDE4D0]/60 dark:border-stone-800 text-[11px] text-stone-500 flex items-center justify-between">
            <span>Active: <strong>{uniqueActiveDates.length} of {elapsedDays}d</strong></span>
            <span className="text-[#8E5B13] font-bold">Streak: {streakStats.currentStreak}d 🔥</span>
          </div>
        </div>

        {/* KPI 3: Retention & Spaced Repetition Rate */}
        <div className="p-5 rounded-2xl bg-white dark:bg-stone-900 border border-[#EDE4D0] dark:border-stone-800 shadow-[0_2px_8px_rgba(40,30,20,0.03)] flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-stone-500 font-bold uppercase tracking-wider mb-2">
            <span>Retention Reinforcement</span>
            <RotateCcw className="w-4 h-4 text-[#C68A2C]" />
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-[#8E5B13] font-serif">
                {retentionScore}%
              </span>
              <span className="text-xs font-semibold text-stone-500">
                Reinforced (2+ Rev)
              </span>
            </div>
            <div className="mt-2 w-full h-2 bg-[#EDE4D0] dark:bg-stone-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#C68A2C] rounded-full transition-all duration-700"
                style={{ width: `${retentionScore}%` }}
              />
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-[#EDE4D0]/60 dark:border-stone-800 text-[11px] text-stone-500 flex items-center justify-between">
            <span>Reinforced: <strong>{reinforcedTopics} topics</strong></span>
            <span className="text-stone-400">1st Rev: {firstRevisionTopics}</span>
          </div>
        </div>

        {/* KPI 4: Attention & Weak Concepts */}
        <div className="p-5 rounded-2xl bg-white dark:bg-stone-900 border border-[#EDE4D0] dark:border-stone-800 shadow-[0_2px_8px_rgba(40,30,20,0.03)] flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-stone-500 font-bold uppercase tracking-wider mb-2">
            <span>At-Risk / Attention</span>
            <AlertTriangle className="w-4 h-4 text-[#8E5B13]" />
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-[#8E5B13] font-serif">
                {weakTopics.length + neglectedTopics.length}
              </span>
              <span className="text-xs font-semibold text-stone-500">
                Action Items
              </span>
            </div>
            <div className="mt-2 flex items-center gap-1.5 text-[11px] text-stone-500">
              <span className="px-2 py-0.5 rounded-md bg-[#FBF0D3] text-[#8E5B13] font-bold">
                {weakTopics.length} Weak
              </span>
              <span className="px-2 py-0.5 rounded-md bg-[#FAF7F2] text-stone-600 border border-[#EDE4D0]">
                {neglectedTopics.length} Neglected
              </span>
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-[#EDE4D0]/60 dark:border-stone-800 text-[11px] text-stone-500 flex items-center justify-between">
            <span>Target Revision Buffer</span>
            <span className="text-[#8E5B13] font-semibold">Priority Review</span>
          </div>
        </div>
      </div>

      {/* Automated Grounded AI Insights Banner */}
      {insights.length > 0 && (
        <div className="p-6 rounded-2xl bg-white dark:bg-stone-900 border border-[#EDE4D0] dark:border-stone-800 shadow-[0_2px_8px_rgba(40,30,20,0.03)] space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-[#FAF4E4] text-[#8E5B13] border border-[#EEDDB8]">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-[#1D2417] dark:text-stone-100 uppercase tracking-wider font-serif">
                  Automated Study Coach & Strategy Notes
                </h3>
                <p className="text-xs text-stone-500">
                  Synthesized recommendations based on your recent activity logs and syllabus completion pace
                </p>
              </div>
            </div>
            <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-[#EAF2E4] text-[#385522] border border-[#D3E3C9]">
              Live Diagnostics
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
            {insights.map((insight, idx) => (
              <div
                key={idx}
                className={`p-3.5 rounded-xl border flex flex-col justify-between text-xs transition-all ${
                  insight.type === 'warning'
                    ? 'bg-[#FBF3DC]/60 dark:bg-[#C68A2C]/10 border-[#EEDDB8] dark:border-[#C68A2C]/30 text-stone-800 dark:text-stone-200'
                    : insight.type === 'strategy'
                    ? 'bg-[#FAF7F2] dark:bg-stone-950/60 border-[#EDE4D0] dark:border-stone-800 text-stone-800 dark:text-stone-200'
                    : 'bg-[#EAF2E4]/60 dark:bg-[#486B2C]/10 border-[#D3E3C9] dark:border-[#486B2C]/30 text-stone-800 dark:text-stone-200'
                }`}
              >
                <div className="flex items-start gap-2.5 mb-2">
                  <div
                    className={`w-2 h-2 rounded-full mt-1 shrink-0 ${
                      insight.type === 'warning'
                        ? 'bg-[#C68A2C]'
                        : insight.type === 'strategy'
                        ? 'bg-[#486B2C]'
                        : 'bg-[#385522]'
                    }`}
                  />
                  <span className="leading-relaxed font-medium">{insight.text}</span>
                </div>

                {insight.actionText && insight.actionTab && (
                  <button
                    onClick={() => setActiveTab(insight.actionTab as any)}
                    className="self-end text-[11px] font-bold text-[#486B2C] hover:underline flex items-center gap-1"
                  >
                    <span>{insight.actionText}</span>
                    <ArrowUpRight className="w-3 h-3" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-[#EDE4D0] dark:border-stone-800 pb-2">
        <button
          onClick={() => setActiveSection('overview')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeSection === 'overview'
              ? 'bg-[#486B2C] text-white shadow-xs'
              : 'text-stone-600 dark:text-stone-400 hover:bg-[#F8F5EB] dark:hover:bg-stone-800'
          }`}
        >
          Subject Preparedness Matrix
        </button>
        <button
          onClick={() => setActiveSection('memory')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeSection === 'memory'
              ? 'bg-[#486B2C] text-white shadow-xs'
              : 'text-stone-600 dark:text-stone-400 hover:bg-[#F8F5EB] dark:hover:bg-stone-800'
          }`}
        >
          Memory Retention Radar & Rhythm
        </button>
      </div>

      {activeSection === 'overview' ? (
        /* Section 1: Subject Preparedness Matrix */
        <div className="p-6 rounded-2xl bg-white dark:bg-stone-900 border border-[#EDE4D0] dark:border-stone-800 shadow-[0_2px_8px_rgba(40,30,20,0.03)] space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#EDE4D0] dark:border-stone-800">
            <div>
              <h3 className="font-extrabold text-lg text-[#1D2417] dark:text-stone-100 font-serif">
                GATE Subject Preparedness Matrix
              </h3>
              <p className="text-xs text-stone-500">
                11 CS Syllabus Subjects ranked by marks weightage, completion status, and revision health
              </p>
            </div>

            {/* Sort Toolbar */}
            <div className="flex items-center gap-2 text-xs">
              <span className="text-stone-400 font-semibold">Sort by:</span>
              <div className="flex items-center gap-1 bg-[#FAF7F2] dark:bg-stone-800 p-1 rounded-xl border border-[#EDE4D0] dark:border-stone-700">
                <button
                  onClick={() => setMatrixSortBy('weightage')}
                  className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                    matrixSortBy === 'weightage'
                      ? 'bg-[#486B2C] text-white font-bold'
                      : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
                  }`}
                >
                  Weightage
                </button>
                <button
                  onClick={() => setMatrixSortBy('syllabus')}
                  className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                    matrixSortBy === 'syllabus'
                      ? 'bg-[#486B2C] text-white font-bold'
                      : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
                  }`}
                >
                  Coverage %
                </button>
                <button
                  onClick={() => setMatrixSortBy('overdue')}
                  className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                    matrixSortBy === 'overdue'
                      ? 'bg-[#C68A2C] text-white font-bold'
                      : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
                  }`}
                >
                  Overdue Backlog
                </button>
                <button
                  onClick={() => setMatrixSortBy('weak')}
                  className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                    matrixSortBy === 'weak'
                      ? 'bg-[#8E5B13] text-white font-bold'
                      : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
                  }`}
                >
                  Weak Concepts
                </button>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#EDE4D0] dark:border-stone-800 text-stone-500 font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-3">Subject</th>
                  <th className="py-3 px-3">GATE Weightage</th>
                  <th className="py-3 px-3">Priority</th>
                  <th className="py-3 px-3 min-w-[200px]">Coverage Progress</th>
                  <th className="py-3 px-3">Reinforced %</th>
                  <th className="py-3 px-3">Overdue Backlog</th>
                  <th className="py-3 px-3">Weak Topics</th>
                  <th className="py-3 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EDE4D0]/60 dark:divide-stone-800/60">
                {subjectComparison.map(s => (
                  <tr
                    key={s.id}
                    className="hover:bg-[#FAF7F2] dark:hover:bg-stone-800/40 transition-colors group"
                  >
                    {/* Subject info */}
                    <td className="py-3.5 px-3">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-stone-900 dark:text-stone-200 px-2 py-0.5 rounded-md bg-[#F8F5EB] dark:bg-stone-800 border border-[#EDE4D0] dark:border-stone-700">
                          {s.code}
                        </span>
                        <div>
                          <div className="font-bold text-stone-900 dark:text-stone-100">{s.name}</div>
                          <div className="text-[10px] text-stone-400">{s.total} Topics Total</div>
                        </div>
                      </div>
                    </td>

                    {/* Weightage */}
                    <td className="py-3.5 px-3 font-semibold text-stone-700 dark:text-stone-300">
                      <span className="px-2 py-0.5 rounded-full bg-[#FAF4E4] text-[#8E5B13] border border-[#EEDDB8] font-bold">
                        ~{s.weightage} Marks
                      </span>
                    </td>

                    {/* Priority */}
                    <td className="py-3.5 px-3 capitalize">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          s.priority === 'critical'
                            ? 'bg-[#FEE2E2] text-[#991B1B] border border-[#FCA5A5]'
                            : s.priority === 'high'
                            ? 'bg-[#EAF2E4] text-[#385522] border border-[#D3E3C9]'
                            : 'bg-[#FAF4E4] text-[#8E5B13] border border-[#EDE4D0]'
                        }`}
                      >
                        {s.priority}
                      </span>
                    </td>

                    {/* Multi-segment progress bar */}
                    <td className="py-3.5 px-3">
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-extrabold text-stone-900 dark:text-stone-100">
                            {s.syllabusPercent}%
                          </span>
                          <span className="text-stone-500 font-medium">
                            {s.completed} of {s.total}
                          </span>
                        </div>
                        <div className="w-full h-2 bg-[#EDE4D0] dark:bg-stone-800 rounded-full overflow-hidden flex">
                          {/* Reinforced portion */}
                          <div
                            className="h-full bg-[#486B2C]"
                            style={{
                              width: `${s.total > 0 ? (s.reinforced / s.total) * 100 : 0}%`
                            }}
                            title={`Reinforced (2+ reviews): ${s.reinforced}`}
                          />
                          {/* Completed only once */}
                          <div
                            className="h-full bg-[#C68A2C]"
                            style={{
                              width: `${
                                s.total > 0 ? ((s.completed - s.reinforced) / s.total) * 100 : 0
                              }%`
                            }}
                            title={`Completed (0-1 review): ${s.completed - s.reinforced}`}
                          />
                        </div>
                      </div>
                    </td>

                    {/* Reinforced rate */}
                    <td className="py-3.5 px-3 font-semibold text-stone-700 dark:text-stone-300">
                      <span className="font-bold text-stone-800 dark:text-stone-200">{s.revisionPercent}%</span>
                      <span className="text-[10px] text-stone-400 block">({s.reinforced}/{s.completed || 0})</span>
                    </td>

                    {/* Overdue */}
                    <td className="py-3.5 px-3">
                      {s.overdue > 0 ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FEE2E2] text-[#991B1B] border border-[#FCA5A5]">
                          <AlertTriangle className="w-3 h-3" />
                          {s.overdue} Overdue
                        </span>
                      ) : (
                        <span className="text-stone-400">—</span>
                      )}
                    </td>

                    {/* Weak */}
                    <td className="py-3.5 px-3">
                      {s.weak > 0 ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FBF3DC] text-[#8E5B13] border border-[#EEDDB8]">
                          {s.weak} Needs Review
                        </span>
                      ) : (
                        <span className="text-stone-400">—</span>
                      )}
                    </td>

                    {/* Action */}
                    <td className="py-3.5 px-3 text-right">
                      <button
                        onClick={() => {
                          setSelectedSubjectId(s.id);
                          setActiveTab('subjects', s.id);
                        }}
                        className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-white dark:bg-stone-800 border border-[#EDE4D0] text-[#486B2C] hover:bg-[#EAF2E4] transition-colors shadow-xs"
                      >
                        Open Syllabus →
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Section 2: Memory Retention Radar & Study Rhythm */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Day of week study rhythm (6 cols) */}
          <div className="lg:col-span-6 p-6 rounded-2xl bg-white dark:bg-stone-900 border border-[#EDE4D0] dark:border-stone-800 shadow-[0_2px_8px_rgba(40,30,20,0.03)] space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-base text-[#1D2417] dark:text-stone-100 font-serif">
                  Day-of-Week Study Rhythm
                </h3>
                <p className="text-xs text-stone-500">Distribution of learning events across days of the week</p>
              </div>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#FAF4E4] text-[#8E5B13] border border-[#EEDDB8]">
                Peak: {dayLabels[peakDayIdx]}
              </span>
            </div>

            <div className="h-48 flex items-end justify-between gap-3 pt-6 px-2">
              {dayLabels.map((label, idx) => {
                const count = dayOfWeekCounts[idx];
                const heightPct = Math.max(10, Math.round((count / maxDayCount) * 100));
                const isPeak = idx === peakDayIdx && count > 0;

                return (
                  <div key={label} className="flex-1 flex flex-col items-center gap-2">
                    <span className={`text-[11px] font-bold ${isPeak ? 'text-[#486B2C]' : 'text-stone-600'}`}>
                      {count}
                    </span>
                    <div className="w-full bg-[#FAF7F2] dark:bg-stone-800 rounded-t-lg h-36 flex items-end justify-center p-1 border border-b-0 border-[#EDE4D0] dark:border-stone-800">
                      <div
                        className={`w-full rounded-xs transition-all duration-500 ${
                          isPeak ? 'bg-[#486B2C] ring-2 ring-[#486B2C]/40' : 'bg-[#A3CD8B] hover:bg-[#679B45]'
                        }`}
                        style={{ height: `${heightPct}%` }}
                      />
                    </div>
                    <span className={`text-xs font-semibold ${isPeak ? 'text-[#486B2C] font-bold' : 'text-stone-500'}`}>
                      {label}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="pt-2 border-t border-[#EDE4D0] dark:border-stone-800 flex items-center justify-between text-xs text-stone-500">
              <span>Weekday vs Weekend Rhythm</span>
              <span className="font-semibold text-stone-700 dark:text-stone-300">
                {dayOfWeekCounts[1] + dayOfWeekCounts[2] + dayOfWeekCounts[3] + dayOfWeekCounts[4] + dayOfWeekCounts[5]} Weekday • {dayOfWeekCounts[0] + dayOfWeekCounts[6]} Weekend
              </span>
            </div>
          </div>

          {/* 4-Tier Memory Stage Progression (6 cols) */}
          <div className="lg:col-span-6 p-6 rounded-2xl bg-white dark:bg-stone-900 border border-[#EDE4D0] dark:border-stone-800 shadow-[0_2px_8px_rgba(40,30,20,0.03)] space-y-4">
            <div>
              <h3 className="font-extrabold text-base text-[#1D2417] dark:text-stone-100 font-serif">
                Spaced Repetition Memory Pipeline
              </h3>
              <p className="text-xs text-stone-500">
                Cognitive consolidation stage of all {completedTopics} completed topics
              </p>
            </div>

            <div className="space-y-3 text-xs">
              {/* Tier 4: Mastered */}
              <div className="p-3.5 rounded-xl bg-[#EAF2E4] dark:bg-[#486B2C]/15 border border-[#D3E3C9] dark:border-[#486B2C]/30 flex items-center justify-between">
                <div>
                  <div className="font-bold text-[#385522] dark:text-[#EAF2E4] flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-[#486B2C]" />
                    Stage 4: Permanent Memory (3+ Revisions)
                  </div>
                  <div className="text-[11px] text-stone-600 dark:text-stone-400">
                    Highest cognitive retention; ready for mock tests
                  </div>
                </div>
                <span className="text-base font-extrabold text-[#486B2C]">
                  {flatTopics.filter(t => t.topic.revisionCount >= 3).length}
                </span>
              </div>

              {/* Tier 3: Reinforced */}
              <div className="p-3.5 rounded-xl bg-[#F8F5EB] dark:bg-stone-950/60 border border-[#EDE4D0] dark:border-stone-800 flex items-center justify-between">
                <div>
                  <div className="font-bold text-stone-900 dark:text-stone-100">
                    Stage 3: Consolidated (2 Revisions)
                  </div>
                  <div className="text-[11px] text-stone-500">
                    Passed critical 7-day interval
                  </div>
                </div>
                <span className="text-base font-extrabold text-[#8E5B13]">
                  {reinforcedTopics - flatTopics.filter(t => t.topic.revisionCount >= 3).length}
                </span>
              </div>

              {/* Tier 2: 1 Revision */}
              <div className="p-3.5 rounded-xl bg-[#FAF7F2] dark:bg-stone-950/40 border border-[#EDE4D0] dark:border-stone-800 flex items-center justify-between">
                <div>
                  <div className="font-bold text-stone-900 dark:text-stone-100">
                    Stage 2: Working Memory (1 Revision)
                  </div>
                  <div className="text-[11px] text-stone-500">
                    Initial spaced reinforcement completed
                  </div>
                </div>
                <span className="text-base font-extrabold text-stone-700 dark:text-stone-300">
                  {firstRevisionTopics}
                </span>
              </div>

              {/* Tier 1: Freshly Completed (0 revisions) */}
              <div className="p-3.5 rounded-xl bg-[#FBF0D3]/40 dark:bg-[#C68A2C]/10 border border-[#EEDDB8] dark:border-[#C68A2C]/20 flex items-center justify-between">
                <div>
                  <div className="font-bold text-[#8E5B13] flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    Stage 1: Fresh Intake (0 Revisions)
                  </div>
                  <div className="text-[11px] text-stone-500">
                    Vulnerable to forgetting curve; schedule review soon
                  </div>
                </div>
                <span className="text-base font-extrabold text-[#8E5B13]">
                  {zeroRevisionCompleted}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Neglected & Weak Recovery Shelf */}
      {neglectedTopics.length > 0 && (
        <div className="p-6 rounded-2xl bg-white dark:bg-stone-900 border border-[#EDE4D0] dark:border-stone-800 shadow-[0_2px_8px_rgba(40,30,20,0.03)] space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-[#FEE2E2] text-[#991B1B] border border-[#FCA5A5]">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-[#1D2417] dark:text-stone-100 font-serif">
                  Neglected Topics Recovery Queue ({neglectedTopics.length})
                </h3>
                <p className="text-xs text-stone-500">
                  Completed over 14 days ago without a single review. Quick revise here to restore memory traces.
                </p>
              </div>
            </div>
            <button
              onClick={() => setActiveTab('revision')}
              className="text-xs font-bold text-[#486B2C] hover:underline"
            >
              Go to Full Queue →
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {neglectedTopics.slice(0, 6).map(item => (
              <div
                key={item.topic.id}
                className="p-3.5 rounded-xl bg-[#FAF7F2] dark:bg-stone-950/60 border border-[#EDE4D0] dark:border-stone-800 flex flex-col justify-between gap-2"
              >
                <div>
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#F8F5EB] border border-[#EDE4D0]">
                      {item.subjectCode}
                    </span>
                    <span className="text-[10px] text-stone-400 capitalize">{item.topic.priority}</span>
                  </div>
                  <div className="font-bold text-xs text-stone-900 dark:text-stone-100">
                    {item.topic.name}
                  </div>
                  <div className="text-[11px] text-stone-500 truncate">
                    {item.chapterName}
                  </div>
                </div>

                <div className="pt-2 border-t border-[#EDE4D0]/60 dark:border-stone-800 flex items-center justify-between text-xs">
                  <span className="text-[10px] text-[#8E5B13] font-semibold">
                    0 Spaced Reviews
                  </span>
                  <button
                    onClick={() => handleQuickRevise(item)}
                    className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-[#486B2C] hover:bg-[#385522] text-white shadow-xs"
                  >
                    Revise Now
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
