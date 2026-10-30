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
    <div className="space-y-8 macos-fade-in max-w-7xl mx-auto pb-8">
      {/* Executive Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#E8EFE3]">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#FAF4E4] text-[#8E5B13] border border-[#EEDDB8]">
              <Sparkles className="w-3.5 h-3.5 text-[#C68A2C]" />
              GATE 2027 Intelligence Deck
            </span>
            <span className="text-xs text-[#8B9883]">•</span>
            <span className="text-xs text-[#52604A] font-medium">
              {daysLeftExam} Days Remaining to Exam
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-[#13200F] tracking-tight font-serif flex items-center gap-2.5">
            <BarChart3 className="w-6 h-6 text-[#486B2C]" />
            Preparation Analytics
          </h2>
          <p className="text-xs sm:text-sm text-[#485341] mt-1 max-w-2xl font-medium">
            Real-time diagnostics on syllabus coverage, spaced repetition retention rates, and subject preparedness matrices.
          </p>
        </div>

        {/* Toolbar: Time Range Selector in Frosted Glass Pill Dock */}
        <div className="flex items-center gap-1.5 self-start md:self-auto bg-white/70 backdrop-blur-xl p-1.5 rounded-2xl border border-white/80 shadow-xs text-xs font-semibold">
          {(['7d', '30d', '90d', 'all'] as const).map(range => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-3.5 py-1.5 rounded-xl transition-all duration-200 cursor-pointer ${
                timeRange === range
                  ? 'bg-[#F6E3A1] text-[#1D2417] shadow-xs font-bold'
                  : 'text-[#4A5543] hover:text-[#13200F] hover:bg-white/50'
              }`}
            >
              {range === '7d' ? '7 Days' : range === '30d' ? '30 Days' : range === '90d' ? '90 Days' : 'All Time'}
            </button>
          ))}
        </div>
      </div>

      {/* Top 4 KPI Executive Metric Cards in macOS Frosted Glass */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Overall Syllabus Completion */}
        <div className="p-5 sm:p-6 rounded-[24px] bg-white/75 backdrop-blur-2xl border border-white/80 shadow-[0_20px_45px_rgba(20,35,15,0.05),0_1px_3px_rgba(0,0,0,0.04)] flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-[#52604A] font-bold uppercase tracking-wider mb-2">
            <span>Syllabus Coverage</span>
            <div className="p-1.5 rounded-xl bg-[#EAF2E4] text-[#486B2C]">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-[#13200F] font-serif">
                {syllabusPct}%
              </span>
              <span className="text-xs font-semibold text-[#63725B]">
                ({completedTopics}/{totalTopics} topics)
              </span>
            </div>
            <div className="mt-3 w-full h-2.5 bg-[#C5BEAF] border border-[#B5ACA0]/40 rounded-full overflow-hidden p-0.5">
              <div
                className="h-full bg-[#385820] rounded-full transition-all duration-700 shadow-xs"
                style={{ width: `${syllabusPct}%` }}
              />
            </div>
          </div>
          <div className="mt-4 pt-2.5 border-t border-[#E8EFE3] text-[11px] text-[#52604A] flex items-center justify-between">
            <span>Remaining: <strong className="text-[#13200F]">{remainingTopics} topics</strong></span>
            <span className="text-[#385522] font-semibold bg-[#EAF2E4] px-2 py-0.5 rounded-full border border-[#CFE1C5]">GATE CS Core</span>
          </div>
        </div>

        {/* KPI 2: Study Consistency Index */}
        <div className="p-5 sm:p-6 rounded-[24px] bg-white/75 backdrop-blur-2xl border border-white/80 shadow-[0_20px_45px_rgba(20,35,15,0.05),0_1px_3px_rgba(0,0,0,0.04)] flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-[#52604A] font-bold uppercase tracking-wider mb-2">
            <span>Study Consistency</span>
            <div className="p-1.5 rounded-xl bg-[#EAF2E4] text-[#486B2C]">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-[#385522] font-serif">
                {consistencyPct}%
              </span>
              <span className="text-xs font-semibold text-[#63725B]">
                Active Habit Score
              </span>
            </div>
            <div className="mt-3 w-full h-2.5 bg-[#C5BEAF] border border-[#B5ACA0]/40 rounded-full overflow-hidden p-0.5">
              <div
                className="h-full bg-[#385820] rounded-full transition-all duration-700 shadow-xs"
                style={{ width: `${consistencyPct}%` }}
              />
            </div>
          </div>
          <div className="mt-4 pt-2.5 border-t border-[#E8EFE3] text-[11px] text-[#52604A] flex items-center justify-between">
            <span>Active: <strong className="text-[#13200F]">{uniqueActiveDates.length} of {elapsedDays}d</strong></span>
            <span className="text-[#8E5B13] font-bold bg-[#FAF4E4] px-2 py-0.5 rounded-full border border-[#EEDDB8]">Streak: {streakStats.currentStreak}d 🔥</span>
          </div>
        </div>

        {/* KPI 3: Retention & Spaced Repetition Rate */}
        <div className="p-5 sm:p-6 rounded-[24px] bg-white/75 backdrop-blur-2xl border border-white/80 shadow-[0_20px_45px_rgba(20,35,15,0.05),0_1px_3px_rgba(0,0,0,0.04)] flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-[#52604A] font-bold uppercase tracking-wider mb-2">
            <span>Retention Reinforcement</span>
            <div className="p-1.5 rounded-xl bg-[#FBF3DC] text-[#C68A2C]">
              <RotateCcw className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-[#966418] font-serif">
                {retentionScore}%
              </span>
              <span className="text-xs font-semibold text-[#63725B]">
                Reinforced (2+ Rev)
              </span>
            </div>
            <div className="mt-3 w-full h-2.5 bg-[#C5BEAF] border border-[#B5ACA0]/40 rounded-full overflow-hidden p-0.5">
              <div
                className="h-full bg-[#C68A2C] rounded-full transition-all duration-700 shadow-xs"
                style={{ width: `${retentionScore}%` }}
              />
            </div>
          </div>
          <div className="mt-4 pt-2.5 border-t border-[#E8EFE3] text-[11px] text-[#52604A] flex items-center justify-between">
            <span>Reinforced: <strong className="text-[#13200F]">{reinforcedTopics} topics</strong></span>
            <span className="text-[#63725B] font-medium">1st Rev: {firstRevisionTopics}</span>
          </div>
        </div>

        {/* KPI 4: Attention & Weak Concepts */}
        <div className="p-5 sm:p-6 rounded-[24px] bg-white/75 backdrop-blur-2xl border border-white/80 shadow-[0_20px_45px_rgba(20,35,15,0.05),0_1px_3px_rgba(0,0,0,0.04)] flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-[#52604A] font-bold uppercase tracking-wider mb-2">
            <span>At-Risk / Attention</span>
            <div className="p-1.5 rounded-xl bg-[#FBF0D3] text-[#8E5B13]">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-[#8E5B13] font-serif">
                {weakTopics.length + neglectedTopics.length}
              </span>
              <span className="text-xs font-semibold text-[#63725B]">
                Action Items
              </span>
            </div>
            <div className="mt-3 flex items-center gap-2 text-[11px]">
              <span className="px-2.5 py-0.5 rounded-full bg-[#FBF0D3] text-[#8E5B13] font-bold border border-[#EED7A2]">
                {weakTopics.length} Weak
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-white text-[#52604A] font-semibold border border-[#D5E2CD]">
                {neglectedTopics.length} Neglected
              </span>
            </div>
          </div>
          <div className="mt-4 pt-2.5 border-t border-[#E8EFE3] text-[11px] text-[#52604A] flex items-center justify-between">
            <span>Target Revision Buffer</span>
            <span className="text-[#8E5B13] font-semibold">Priority Review</span>
          </div>
        </div>
      </div>

      {/* Automated Grounded AI Insights Banner */}
      {insights.length > 0 && (
        <div className="p-6 sm:p-7 rounded-[28px] bg-white/75 backdrop-blur-2xl border border-white/80 shadow-[0_20px_50px_rgba(20,35,15,0.06),0_1px_3px_rgba(0,0,0,0.04)] space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-2xl bg-[#FAF4E4] text-[#8E5B13] border border-[#EEDDB8] shadow-xs">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-[#13200F] uppercase tracking-wider font-serif">
                  Automated Study Coach & Strategy Notes
                </h3>
                <p className="text-xs text-[#52604A]">
                  Synthesized recommendations based on your recent activity logs and syllabus completion pace
                </p>
              </div>
            </div>
            <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-[#EAF2E4] text-[#385522] border border-[#CFE1C5]">
              Live Diagnostics
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-1">
            {insights.map((insight, idx) => (
              <div
                key={idx}
                className={`p-4 rounded-2xl border flex flex-col justify-between text-xs transition-all ${
                  insight.type === 'warning'
                    ? 'bg-[#FBF3DC]/75 border-[#EEDDB8] text-[#3E3018]'
                    : insight.type === 'strategy'
                    ? 'bg-white/80 border-[#D5E2CD] text-[#222E1A]'
                    : 'bg-[#EAF2E4]/75 border-[#CFE1C5] text-[#1D3212]'
                }`}
              >
                <div className="flex items-start gap-3 mb-2.5">
                  <div
                    className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                      insight.type === 'warning'
                        ? 'bg-[#C68A2C]'
                        : insight.type === 'strategy'
                        ? 'bg-[#486B2C]'
                        : 'bg-[#385522]'
                    }`}
                  />
                  <span className="leading-relaxed font-semibold">{insight.text}</span>
                </div>

                {insight.actionText && insight.actionTab && (
                  <button
                    onClick={() => setActiveTab(insight.actionTab as any)}
                    className="self-end text-[11px] font-bold text-[#385522] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>{insight.actionText}</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Navigation Sub-Tabs in macOS Frosted Pill Dock */}
      <div className="p-1.5 rounded-2xl bg-white/65 backdrop-blur-xl border border-white/80 shadow-xs flex items-center gap-1.5">
        <button
          onClick={() => setActiveSection('overview')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
            activeSection === 'overview'
              ? 'bg-[#F6E3A1] text-[#1D2417] shadow-xs'
              : 'text-[#4A5543] hover:text-[#13200F] hover:bg-white/50'
          }`}
        >
          Subject Preparedness Matrix
        </button>
        <button
          onClick={() => setActiveSection('memory')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
            activeSection === 'memory'
              ? 'bg-[#F6E3A1] text-[#1D2417] shadow-xs'
              : 'text-[#4A5543] hover:text-[#13200F] hover:bg-white/50'
          }`}
        >
          Memory Retention Radar & Rhythm
        </button>
      </div>

      {activeSection === 'overview' ? (
        /* Section 1: Subject Preparedness Matrix */
        <div className="p-6 sm:p-8 rounded-[28px] bg-white/75 backdrop-blur-2xl border border-white/80 shadow-[0_20px_50px_rgba(20,35,15,0.06),0_1px_3px_rgba(0,0,0,0.04)] space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#E8EFE3]">
            <div>
              <h3 className="font-extrabold text-lg text-[#13200F] font-serif">
                GATE Subject Preparedness Matrix
              </h3>
              <p className="text-xs text-[#52604A]">
                11 CS Syllabus Subjects ranked by marks weightage, completion status, and revision health
              </p>
            </div>

            {/* Sort Toolbar */}
            <div className="flex items-center gap-2 text-xs">
              <span className="text-[#63725B] font-semibold">Sort by:</span>
              <div className="flex items-center gap-1 bg-white/80 p-1 rounded-xl border border-[#D5E2CD] shadow-xs">
                <button
                  onClick={() => setMatrixSortBy('weightage')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    matrixSortBy === 'weightage'
                      ? 'bg-[#486B2C] text-white font-bold shadow-xs'
                      : 'text-[#4A5543] hover:text-[#13200F]'
                  }`}
                >
                  Weightage
                </button>
                <button
                  onClick={() => setMatrixSortBy('syllabus')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    matrixSortBy === 'syllabus'
                      ? 'bg-[#486B2C] text-white font-bold shadow-xs'
                      : 'text-[#4A5543] hover:text-[#13200F]'
                  }`}
                >
                  Coverage %
                </button>
                <button
                  onClick={() => setMatrixSortBy('overdue')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    matrixSortBy === 'overdue'
                      ? 'bg-[#C68A2C] text-white font-bold shadow-xs'
                      : 'text-[#4A5543] hover:text-[#13200F]'
                  }`}
                >
                  Overdue
                </button>
                <button
                  onClick={() => setMatrixSortBy('weak')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    matrixSortBy === 'weak'
                      ? 'bg-[#8E5B13] text-white font-bold shadow-xs'
                      : 'text-[#4A5543] hover:text-[#13200F]'
                  }`}
                >
                  Weak
                </button>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#E8EFE3] text-[#63725B] font-bold uppercase tracking-wider text-[11px]">
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
              <tbody className="divide-y divide-[#E8EFE3]/80">
                {subjectComparison.map(s => (
                  <tr
                    key={s.id}
                    className="hover:bg-white/60 transition-colors group"
                  >
                    {/* Subject info */}
                    <td className="py-3.5 px-3">
                      <div className="flex items-center gap-2.5">
                        <span className="font-mono font-bold text-[#13200F] px-2.5 py-1 rounded-lg bg-white border border-[#D5E2CD] shadow-xs">
                          {s.code}
                        </span>
                        <div>
                          <div className="font-bold text-[#13200F] text-xs">{s.name}</div>
                          <div className="text-[10px] text-[#707E68]">{s.total} Topics Total</div>
                        </div>
                      </div>
                    </td>

                    {/* Weightage */}
                    <td className="py-3.5 px-3 font-semibold text-[#2A3722]">
                      <span className="px-2.5 py-0.5 rounded-full bg-[#FAF4E4] text-[#8E5B13] border border-[#EEDDB8] font-bold text-[11px]">
                        ~{s.weightage} Marks
                      </span>
                    </td>

                    {/* Priority */}
                    <td className="py-3.5 px-3 capitalize">
                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                          s.priority === 'critical'
                            ? 'bg-[#FEE2E2] text-[#991B1B] border border-[#FCA5A5]'
                            : s.priority === 'high'
                            ? 'bg-[#EAF2E4] text-[#385522] border border-[#CFE1C5]'
                            : 'bg-[#FAF4E4] text-[#8E5B13] border border-[#EEDDB8]'
                        }`}
                      >
                        {s.priority}
                      </span>
                    </td>

                    {/* Multi-segment progress bar */}
                    <td className="py-3.5 px-3">
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-extrabold text-[#13200F]">
                            {s.syllabusPercent}%
                          </span>
                          <span className="text-[#63725B] font-medium">
                            {s.completed} of {s.total}
                          </span>
                        </div>
                        <div className="w-full h-2.5 bg-[#C5BEAF] border border-[#B5ACA0]/40 rounded-full overflow-hidden flex p-0.5">
                          {/* Reinforced portion */}
                          <div
                            className="h-full bg-[#385820] rounded-full"
                            style={{
                              width: `${s.total > 0 ? (s.reinforced / s.total) * 100 : 0}%`
                            }}
                            title={`Reinforced (2+ reviews): ${s.reinforced}`}
                          />
                          {/* Completed only once */}
                          <div
                            className="h-full bg-[#C68A2C] rounded-full"
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
                    <td className="py-3.5 px-3 font-semibold">
                      <span className="font-bold text-[#13200F]">{s.revisionPercent}%</span>
                      <span className="text-[10px] text-[#707E68] block">({s.reinforced}/{s.completed || 0})</span>
                    </td>

                    {/* Overdue */}
                    <td className="py-3.5 px-3">
                      {s.overdue > 0 ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#FEE2E2] text-[#991B1B] border border-[#FCA5A5]">
                          <AlertTriangle className="w-3 h-3" />
                          {s.overdue} Overdue
                        </span>
                      ) : (
                        <span className="text-[#8B9883]">—</span>
                      )}
                    </td>

                    {/* Weak */}
                    <td className="py-3.5 px-3">
                      {s.weak > 0 ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#FBF3DC] text-[#8E5B13] border border-[#EEDDB8]">
                          {s.weak} Needs Review
                        </span>
                      ) : (
                        <span className="text-[#8B9883]">—</span>
                      )}
                    </td>

                    {/* Action */}
                    <td className="py-3.5 px-3 text-right">
                      <button
                        onClick={() => {
                          setSelectedSubjectId(s.id);
                          setActiveTab('subjects', s.id);
                        }}
                        className="px-3 py-1.5 rounded-xl text-[11px] font-bold bg-white border border-[#D5E2CD] text-[#385522] hover:bg-[#EAF2E4] transition-colors shadow-xs cursor-pointer"
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
          <div className="lg:col-span-6 p-6 sm:p-7 rounded-[28px] bg-white/75 backdrop-blur-2xl border border-white/80 shadow-[0_20px_50px_rgba(20,35,15,0.06),0_1px_3px_rgba(0,0,0,0.04)] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E8EFE3]">
              <div>
                <h3 className="font-extrabold text-base text-[#13200F] font-serif">
                  Day-of-Week Study Rhythm
                </h3>
                <p className="text-xs text-[#52604A]">Distribution of learning events across days of the week</p>
              </div>
              <span className="text-[11px] font-bold px-3 py-0.5 rounded-full bg-[#FAF4E4] text-[#8E5B13] border border-[#EEDDB8]">
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
                    <span className={`text-[11px] font-bold ${isPeak ? 'text-[#385522]' : 'text-[#63725B]'}`}>
                      {count}
                    </span>
                    <div className="w-full bg-[#C5BEAF]/40 rounded-t-xl h-36 flex items-end justify-center p-1 border border-b-0 border-[#B5ACA0]">
                      <div
                        className={`w-full rounded-t-lg transition-all duration-500 ${
                          isPeak ? 'bg-[#385820] shadow-sm' : 'bg-[#5FA049] hover:bg-[#487E37]'
                        }`}
                        style={{ height: `${heightPct}%` }}
                      />
                    </div>
                    <span className={`text-xs font-semibold ${isPeak ? 'text-[#385522] font-bold' : 'text-[#63725B]'}`}>
                      {label}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="pt-3 border-t border-[#E8EFE3] flex items-center justify-between text-xs text-[#52604A]">
              <span>Weekday vs Weekend Rhythm</span>
              <span className="font-bold text-[#13200F]">
                {dayOfWeekCounts[1] + dayOfWeekCounts[2] + dayOfWeekCounts[3] + dayOfWeekCounts[4] + dayOfWeekCounts[5]} Weekday • {dayOfWeekCounts[0] + dayOfWeekCounts[6]} Weekend
              </span>
            </div>
          </div>

          {/* 4-Tier Memory Stage Progression (6 cols) */}
          <div className="lg:col-span-6 p-6 sm:p-7 rounded-[28px] bg-white/75 backdrop-blur-2xl border border-white/80 shadow-[0_20px_50px_rgba(20,35,15,0.06),0_1px_3px_rgba(0,0,0,0.04)] space-y-4">
            <div className="pb-3 border-b border-[#E8EFE3]">
              <h3 className="font-extrabold text-base text-[#13200F] font-serif">
                Spaced Repetition Memory Pipeline
              </h3>
              <p className="text-xs text-[#52604A]">
                Cognitive consolidation stage of all {completedTopics} completed topics
              </p>
            </div>

            <div className="space-y-3 text-xs">
              {/* Tier 4: Mastered */}
              <div className="p-4 rounded-2xl bg-[#EAF2E4] border border-[#CFE1C5] flex items-center justify-between shadow-xs">
                <div>
                  <div className="font-bold text-[#2E491A] flex items-center gap-2">
                    <Award className="w-4 h-4 text-[#486B2C]" />
                    Stage 4: Permanent Memory (3+ Revisions)
                  </div>
                  <div className="text-[11px] text-[#52604A] mt-0.5">
                    Highest cognitive retention; ready for mock tests
                  </div>
                </div>
                <span className="text-lg font-black text-[#385522]">
                  {flatTopics.filter(t => t.topic.revisionCount >= 3).length}
                </span>
              </div>

              {/* Tier 3: Reinforced */}
              <div className="p-4 rounded-2xl bg-white border border-[#D5E2CD] flex items-center justify-between shadow-xs">
                <div>
                  <div className="font-bold text-[#13200F]">
                    Stage 3: Consolidated (2 Revisions)
                  </div>
                  <div className="text-[11px] text-[#63725B] mt-0.5">
                    Passed critical 7-day interval
                  </div>
                </div>
                <span className="text-lg font-black text-[#8E5B13]">
                  {reinforcedTopics - flatTopics.filter(t => t.topic.revisionCount >= 3).length}
                </span>
              </div>

              {/* Tier 2: 1 Revision */}
              <div className="p-4 rounded-2xl bg-white/80 border border-[#D5E2CD] flex items-center justify-between shadow-xs">
                <div>
                  <div className="font-bold text-[#13200F]">
                    Stage 2: Working Memory (1 Revision)
                  </div>
                  <div className="text-[11px] text-[#63725B] mt-0.5">
                    Initial spaced reinforcement completed
                  </div>
                </div>
                <span className="text-lg font-black text-[#52604A]">
                  {firstRevisionTopics}
                </span>
              </div>

              {/* Tier 1: Freshly Completed (0 revisions) */}
              <div className="p-4 rounded-2xl bg-[#FBF0D3]/50 border border-[#EEDDB8] flex items-center justify-between shadow-xs">
                <div>
                  <div className="font-bold text-[#8E5B13] flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    Stage 1: Fresh Intake (0 Revisions)
                  </div>
                  <div className="text-[11px] text-[#63725B] mt-0.5">
                    Vulnerable to forgetting curve; schedule review soon
                  </div>
                </div>
                <span className="text-lg font-black text-[#8E5B13]">
                  {zeroRevisionCompleted}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Neglected & Weak Recovery Shelf */}
      {neglectedTopics.length > 0 && (
        <div className="p-6 sm:p-7 rounded-[28px] bg-white/75 backdrop-blur-2xl border border-white/80 shadow-[0_20px_50px_rgba(20,35,15,0.06),0_1px_3px_rgba(0,0,0,0.04)] space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#E8EFE3]">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-2xl bg-[#FEE2E2] text-[#991B1B] border border-[#FCA5A5] shadow-xs">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-[#13200F] font-serif">
                  Neglected Topics Recovery Queue ({neglectedTopics.length})
                </h3>
                <p className="text-xs text-[#52604A]">
                  Completed over 14 days ago without a single review. Quick revise here to restore memory traces.
                </p>
              </div>
            </div>
            <button
              onClick={() => setActiveTab('revision')}
              className="text-xs font-bold text-[#385522] hover:underline cursor-pointer"
            >
              Go to Full Queue →
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 pt-1">
            {neglectedTopics.slice(0, 6).map(item => (
              <div
                key={item.topic.id}
                className="p-4 rounded-2xl bg-white border border-[#D5E2CD] flex flex-col justify-between gap-3 shadow-xs hover:border-[#486B2C] transition-colors"
              >
                <div>
                  <div className="flex items-center justify-between gap-1 mb-1.5">
                    <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-lg bg-[#EAF2E4] text-[#385522] border border-[#CFE1C5]">
                      {item.subjectCode}
                    </span>
                    <span className="text-[10px] text-[#707E68] font-semibold capitalize">{item.topic.priority}</span>
                  </div>
                  <div className="font-bold text-xs text-[#13200F]">
                    {item.topic.name}
                  </div>
                  <div className="text-[11px] text-[#63725B] truncate mt-0.5">
                    {item.chapterName}
                  </div>
                </div>

                <div className="pt-2.5 border-t border-[#E8EFE3] flex items-center justify-between text-xs">
                  <span className="text-[10px] text-[#8E5B13] font-bold bg-[#FAF4E4] px-2 py-0.5 rounded-full border border-[#EEDDB8]">
                    0 Spaced Reviews
                  </span>
                  <button
                    onClick={() => handleQuickRevise(item)}
                    className="px-3 py-1.5 rounded-xl text-[11px] font-bold bg-[#486B2C] hover:bg-[#385522] text-white shadow-xs cursor-pointer transition-colors"
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

export default AnalyticsView;
