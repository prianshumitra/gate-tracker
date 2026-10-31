import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { buildContributionHeatmap, HeatmapDay } from '../utils/streak';
import { getLocalDateString, formatHumanDate, formatRelativeDate, addDays } from '../utils/date';
import {
  Flame,
  Calendar as CalendarIcon,
  Award,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Clock,
  Check,
  CalendarDays,
  Trophy,
  Activity,
  Zap,
  Target
} from 'lucide-react';
import { ActivityLogEntry, StreakMilestone } from '../types';
import { FlatTopicWithSubject } from '../utils/revision';
import { playRevisionSound, playCheckSound, playFanfareSound } from '../utils/sound';
import { fireConfetti } from '../utils/gamification';

export const CalendarView: React.FC = () => {
  const {
    activityLogs,
    streakStats,
    flatTopics,
    settings,
    completeRevision,
    postponeRevision,
    triggerIslandNotification,
    loadDemoDataAction
  } = useApp();

  const todayStr = getLocalDateString();
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [currentCalendarDate, setCurrentCalendarDate] = useState<Date>(new Date());
  const [hoveredDay, setHoveredDay] = useState<HeatmapDay | null>(null);
  const [calendarFilter, setCalendarFilter] = useState<'all' | 'due' | 'completed' | 'revisions'>('all');
  const [viewMode, setViewMode] = useState<'month' | 'heatmap' | 'agenda'>('month');

  // Collect all activities from activityLogs as well as completed topics from flatTopics
  // so the heatmap is guaranteed to reflect real progress
  const allActivities = useMemo(() => {
    const logs = [...activityLogs];
    const loggedKeys = new Set(
      logs.map(l => `${l.topicId}-${(l.date || l.timestamp || '').slice(0, 10)}-${l.type}`)
    );

    flatTopics.forEach(item => {
      if (item.topic.status === 'completed') {
        const d = (item.topic.completedAt || item.topic.lastRevisedAt || todayStr).slice(0, 10);
        const key = `${item.topic.id}-${d}-topic_completed`;
        if (!loggedKeys.has(key)) {
          loggedKeys.add(key);
          logs.push({
            id: `synced-comp-${item.topic.id}`,
            date: d,
            topicId: item.topic.id,
            topicName: item.topic.name,
            subjectId: item.subjectId,
            subjectName: item.subjectCode,
            type: 'topic_completed',
            timestamp: item.topic.completedAt || new Date().toISOString()
          });
        }
      }

      if (item.topic.lastRevisedAt) {
        const d = item.topic.lastRevisedAt.slice(0, 10);
        const key = `${item.topic.id}-${d}-revision_completed`;
        if (!loggedKeys.has(key)) {
          loggedKeys.add(key);
          logs.push({
            id: `synced-rev-${item.topic.id}`,
            date: d,
            topicId: item.topic.id,
            topicName: item.topic.name,
            subjectId: item.subjectId,
            subjectName: item.subjectCode,
            type: 'revision_completed',
            timestamp: item.topic.lastRevisedAt
          });
        }
      }

      if (item.topic.history && item.topic.history.length > 0) {
        item.topic.history.forEach((h, idx) => {
          if (h.type === 'completed' || h.type === 'revised') {
            const d = (h.timestamp || '').slice(0, 10);
            const type = h.type === 'completed' ? 'topic_completed' : 'revision_completed';
            const key = `${item.topic.id}-${d}-${type}`;
            if (d && !loggedKeys.has(key)) {
              loggedKeys.add(key);
              logs.push({
                id: `synced-hist-${item.topic.id}-${idx}`,
                date: d,
                topicId: item.topic.id,
                topicName: item.topic.name,
                subjectId: item.subjectId,
                subjectName: item.subjectCode,
                type,
                timestamp: h.timestamp
              });
            }
          }
        });
      }
    });

    return logs;
  }, [activityLogs, flatTopics]);

  // Heatmap data: 52 weeks with monthLabels
  const { weeks, totalActivities, monthLabels } = useMemo(
    () => buildContributionHeatmap(allActivities, todayStr),
    [allActivities, todayStr]
  );

  // Month Calendar Grid calculation
  const year = currentCalendarDate.getFullYear();
  const month = currentCalendarDate.getMonth(); // 0 to 11

  const firstDayOfMonth = new Date(year, month, 1);
  const startingDayOfWeek = firstDayOfMonth.getDay(); // 0 is Sunday
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Mapping logs by date for fast lookup
  const logsByDate = useMemo(() => {
    const map = new Map<string, ActivityLogEntry[]>();
    allActivities.forEach((log: ActivityLogEntry) => {
      const d = (log.date || log.timestamp || '').slice(0, 10);
      if (d) {
        const arr = map.get(d) || [];
        arr.push(log);
        map.set(d, arr);
      }
    });
    return map;
  }, [allActivities]);

  // Scheduled revisions lookup
  const scheduledByDate = useMemo(() => {
    const map = new Map<string, FlatTopicWithSubject[]>();
    flatTopics.forEach((item: FlatTopicWithSubject) => {
      if (item.topic.nextRevisionAt) {
        const arr = map.get(item.topic.nextRevisionAt) || [];
        arr.push(item);
        map.set(item.topic.nextRevisionAt, arr);
      }
    });
    return map;
  }, [flatTopics]);

  // Selected date logs and scheduled
  const selectedDateLogs = logsByDate.get(selectedDate) || [];
  const selectedDateScheduled = scheduledByDate.get(selectedDate) || [];

  // Month navigation
  const prevMonth = () => {
    setCurrentCalendarDate(new Date(year, month - 1, 1));
  };
  const nextMonth = () => {
    setCurrentCalendarDate(new Date(year, month + 1, 1));
  };
  const jumpToToday = () => {
    setCurrentCalendarDate(new Date());
    setSelectedDate(todayStr);
  };

  // Synchronize calendar and day inspector when clicking any heatmap cell
  const handleSelectHeatmapDate = (dateStr: string) => {
    setSelectedDate(dateStr);
    const parts = dateStr.split('-');
    if (parts.length >= 2) {
      const y = parseInt(parts[0], 10);
      const m = parseInt(parts[1], 10);
      if (!isNaN(y) && !isNaN(m)) {
        setCurrentCalendarDate(new Date(y, m - 1, 1));
      }
    }
  };

  // Quick revision completion directly from calendar day inspector
  const handleCompleteRevisionFromCalendar = (item: FlatTopicWithSubject) => {
    completeRevision(item.subjectId, item.chapterId, item.topic.id, item.topic.confidence);
    playRevisionSound(settings.soundEnabled);
    triggerIslandNotification({
      title: 'Revision Completed! ↻',
      subtitle: `${item.topic.name} (${item.subjectCode})`,
      type: 'revision'
    });
    if ((item.topic.revisionCount + 1) % 3 === 0) {
      fireConfetti();
      playFanfareSound(settings.soundEnabled);
    }
  };

  // Postpone revision shortcut
  const handlePostpone = (item: FlatTopicWithSubject, days: number) => {
    postponeRevision(item.subjectId, item.chapterId, item.topic.id, days);
    playCheckSound(settings.soundEnabled);
    triggerIslandNotification({
      title: `Postponed +${days}d`,
      subtitle: `${item.topic.name}`,
      type: 'info'
    });
  };

  // Heatmap intensity color styling
  const getIntensityColor = (level: number, isSelected: boolean) => {
    let base = '';
    switch (level) {
      case 0:
        base = 'bg-[#C8C2B3] dark:bg-stone-800 border border-[#B5AEA0] dark:border-stone-700 hover:border-[#8E5B13]';
        break;
      case 1:
        base = 'bg-[#96BE88] dark:bg-[#3E682E] border border-[#7EA86F] dark:border-[#4E823A] shadow-2xs';
        break;
      case 2:
        base = 'bg-[#5FA049] dark:bg-[#4E823A] border border-[#488534] dark:border-[#63A34B] text-white shadow-2xs';
        break;
      case 3:
        base = 'bg-[#3E7628] dark:bg-[#63A34B] border border-[#2D5A1C] dark:border-[#7CBF5F] text-white shadow-2xs';
        break;
      case 4:
        base = 'bg-[#225014] dark:bg-[#7CBF5F] border border-[#14360A] dark:border-[#96D678] text-white font-bold shadow-2xs';
        break;
      default:
        base = 'bg-[#C8C2B3] dark:bg-stone-800 border border-[#B5AEA0] dark:border-stone-700';
        break;
    }

    if (isSelected) {
      return `${base} ring-2 ring-[#C68A2C] scale-125 z-10 shadow-md border-[#C68A2C]`;
    }
    return base;
  };

  // Calculate monthly stats
  const currentMonthPrefix = `${year}-${String(month + 1).padStart(2, '0')}`;
  const monthlyLogs = allActivities.filter(l => (l.date || l.timestamp || '').startsWith(currentMonthPrefix));
  const monthlyCompleted = monthlyLogs.filter(l => l.type === 'topic_completed').length;
  const monthlyRevised = monthlyLogs.filter(l => l.type === 'revision_completed').length;
  const monthlyActiveDays = new Set(monthlyLogs.map(l => (l.date || l.timestamp || '').slice(0, 10))).size;

  // Next Milestone progress
  const nextMilestone = streakStats.milestones.find(m => m.unlockedAt === null);
  const prevMilestoneDays = streakStats.milestones
    .filter(m => m.unlockedAt !== null)
    .slice(-1)[0]?.days || 0;
  const milestoneTargetDays = nextMilestone ? nextMilestone.days : streakStats.longestStreak;
  const milestoneProgressPct = nextMilestone
    ? Math.min(
        100,
        Math.round(
          ((streakStats.currentStreak - prevMilestoneDays) /
            Math.max(1, milestoneTargetDays - prevMilestoneDays)) *
            100
        )
      )
    : 100;

  // Agenda view items (next 14 days)
  const agendaDates = useMemo(() => {
    const list: string[] = [];
    for (let i = 0; i < 14; i++) {
      list.push(addDays(todayStr, i));
    }
    return list;
  }, [todayStr]);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Executive Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#C5BEAF]/60 dark:border-stone-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-[#EAF2E4] dark:bg-[#486B2C]/20 text-[#2E481B] dark:text-[#EAF2E4] border border-[#C5D9BA] dark:border-[#486B2C]/40 shadow-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-[#385820] animate-pulse" />
              Real-time Spaced Repetition Engine
            </span>
            <span className="text-xs text-stone-400">•</span>
            <span className="text-xs text-stone-600 dark:text-stone-400 font-semibold">GATE Exam Prep Calendar</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1D2417] dark:text-stone-100 tracking-tight font-serif flex items-center gap-2.5">
            <CalendarIcon className="w-6 h-6 text-[#385820]" />
            Study Activity & Schedule
          </h2>
          <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 mt-1 max-w-2xl font-medium">
            Track daily revision retention, schedule upcoming spaced review cycles, and monitor your 52-week habit heatmap.
          </p>
        </div>

        {/* View Switcher Tabs - macOS Frosted Dock */}
        <div className="flex items-center gap-1.5 p-1 bg-[#DFDBD1]/80 dark:bg-stone-900/80 backdrop-blur-md rounded-2xl border border-[#C5BEAF] dark:border-[#384830] text-xs font-semibold self-start md:self-auto shadow-xs">
          <button
            onClick={() => setViewMode('month')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all ${
              viewMode === 'month'
                ? 'bg-[#F6E3A1] text-[#1D2417] border border-[#d9c788] shadow-xs font-bold'
                : 'text-[#4A5543] dark:text-stone-400 hover:text-[#13200F] dark:hover:text-stone-100 hover:bg-white/40 dark:hover:bg-white/10'
            }`}
          >
            <CalendarDays className="w-3.5 h-3.5" />
            <span>Monthly Grid</span>
          </button>
          <button
            onClick={() => setViewMode('heatmap')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all ${
              viewMode === 'heatmap'
                ? 'bg-[#F6E3A1] text-[#1D2417] border border-[#d9c788] shadow-xs font-bold'
                : 'text-[#4A5543] dark:text-stone-400 hover:text-[#13200F] dark:hover:text-stone-100 hover:bg-white/40 dark:hover:bg-white/10'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>52-Week Matrix</span>
          </button>
          <button
            onClick={() => setViewMode('agenda')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all ${
              viewMode === 'agenda'
                ? 'bg-[#F6E3A1] text-[#1D2417] border border-[#d9c788] shadow-xs font-bold'
                : 'text-[#4A5543] dark:text-stone-400 hover:text-[#13200F] dark:hover:text-stone-100 hover:bg-white/40 dark:hover:bg-white/10'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>14-Day Agenda</span>
          </button>
        </div>
      </div>

      {/* 4 Top KPI Habit & Momentum Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Streak Card */}
        <div className="p-4 rounded-2xl bg-[#EBE8E1]/92 backdrop-blur-xl border border-[#C5BEAF] shadow-[0_12px_32px_-4px_rgba(20,30,15,0.12),0_4px_14px_-2px_rgba(20,30,15,0.06)] flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-stone-600 dark:text-stone-400 uppercase tracking-wider">Current Streak</span>
            <div className="p-1.5 rounded-xl bg-[#FBF3DC] dark:bg-[#C68A2C]/20 border border-[#d9c788] dark:border-[#C68A2C]/30 text-[#8E5B13] dark:text-[#EEDDB8] shadow-2xs">
              <Flame className="w-4 h-4 fill-[#C68A2C] text-[#C68A2C] animate-pulse" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-[#1D2417] dark:text-stone-100 font-serif">
              {streakStats.currentStreak}
            </span>
            <span className="text-xs font-semibold text-stone-600 dark:text-stone-400">Consecutive Days</span>
          </div>
          <div className="mt-3 pt-2.5 border-t border-[#C5BEAF]/60 dark:border-stone-800 flex items-center justify-between text-[11px]">
            <span className="text-stone-600 dark:text-stone-400">Record: <strong className="text-stone-800 dark:text-stone-200">{streakStats.longestStreak} days</strong></span>
            <span className={`font-bold px-2 py-0.5 rounded-md text-[11px] ${
              streakStats.isActiveToday
                ? 'bg-[#EAF2E4] text-[#2E481B] border border-[#C5D9BA]'
                : 'bg-[#FBF3DC] text-[#8E5B13] border border-[#d9c788]'
            }`}>
              {streakStats.isActiveToday ? '✓ Active Today' : '⏳ Pending Today'}
            </span>
          </div>
        </div>

        {/* Milestone Tracker Card */}
        <div className="p-4 rounded-2xl bg-[#EBE8E1]/92 backdrop-blur-xl border border-[#C5BEAF] shadow-[0_12px_32px_-4px_rgba(20,30,15,0.12),0_4px_14px_-2px_rgba(20,30,15,0.06)] flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-stone-600 dark:text-stone-400 uppercase tracking-wider">Next Milestone</span>
            <div className="p-1.5 rounded-xl bg-[#EAF2E4] dark:bg-[#486B2C]/20 border border-[#C5D9BA] dark:border-[#486B2C]/30 text-[#385820] shadow-2xs">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5 font-bold text-base text-[#1D2417] dark:text-stone-100 truncate">
              <span>{nextMilestone?.badge || '🏆'}</span>
              <span>{nextMilestone?.title || 'All Milestones Achieved!'}</span>
            </div>
            <div className="text-xs text-stone-600 dark:text-stone-400 mt-0.5">
              {nextMilestone
                ? `${Math.max(0, nextMilestone.days - streakStats.currentStreak)} days remaining to reach ${nextMilestone.days}d`
                : 'Peak habit consistency unlocked!'}
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-[#C5BEAF]/60 dark:border-stone-800">
            <div className="w-full h-2 bg-[#C8C2B3] dark:bg-stone-800 rounded-full overflow-hidden p-0.5 border border-[#B5AEA0]/40">
              <div
                className="h-full bg-[#385820] rounded-full transition-all duration-700 shadow-2xs"
                style={{ width: `${milestoneProgressPct}%` }}
              />
            </div>
          </div>
        </div>

        {/* Monthly Activity Card */}
        <div className="p-4 rounded-2xl bg-[#EBE8E1]/92 backdrop-blur-xl border border-[#C5BEAF] shadow-[0_12px_32px_-4px_rgba(20,30,15,0.12),0_4px_14px_-2px_rgba(20,30,15,0.06)] flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-stone-600 dark:text-stone-400 uppercase tracking-wider">
              {currentCalendarDate.toLocaleDateString('en-US', { month: 'short' })} Activity
            </span>
            <div className="p-1.5 rounded-xl bg-[#DFDBD1]/80 dark:bg-stone-800 border border-[#C5BEAF] dark:border-stone-700 text-[#385820] shadow-2xs">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-[#1D2417] dark:text-stone-100 font-serif">
              {monthlyLogs.length}
            </span>
            <span className="text-xs font-semibold text-stone-600 dark:text-stone-400">Actions Logged</span>
          </div>
          <div className="mt-3 pt-2.5 border-t border-[#C5BEAF]/60 dark:border-stone-800 flex items-center justify-between text-[11px] text-stone-600 dark:text-stone-400">
            <span>{monthlyCompleted} Completed</span>
            <span>•</span>
            <span>{monthlyRevised} Revisions</span>
            <span>•</span>
            <span className="font-bold text-stone-800 dark:text-stone-200">{monthlyActiveDays} Active Days</span>
          </div>
        </div>

        {/* Consistency Score Card */}
        <div className="p-4 rounded-2xl bg-[#EBE8E1]/92 backdrop-blur-xl border border-[#C5BEAF] shadow-[0_12px_32px_-4px_rgba(20,30,15,0.12),0_4px_14px_-2px_rgba(20,30,15,0.06)] flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-stone-600 dark:text-stone-400 uppercase tracking-wider">Weekly Consistency</span>
            <div className="p-1.5 rounded-xl bg-[#FBF3DC] dark:bg-stone-800 border border-[#d9c788] dark:border-stone-700 text-[#8E5B13] shadow-2xs">
              <Target className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-[#385820] font-serif">
              {streakStats.weeklyConsistencyPct}%
            </span>
            <span className="text-xs font-semibold text-stone-600 dark:text-stone-400">Pace Health</span>
          </div>
          <div className="mt-3 pt-2.5 border-t border-[#C5BEAF]/60 dark:border-stone-800 flex items-center justify-between text-[11px]">
            <span className="text-stone-600 dark:text-stone-400">
              {streakStats.activeDaysThisWeek} of 7 days active
            </span>
            <span className="font-bold text-[#385820]">
              {streakStats.weeklyConsistencyPct >= 80 ? '🔥 On Track' : '⚡ Keep Going'}
            </span>
          </div>
        </div>
      </div>

      {/* 52-Week Contribution Matrix (Always expandable or default when in heatmap mode) */}
      <div className={`p-6 rounded-2xl bg-[#EBE8E1]/92 backdrop-blur-xl border border-[#C5BEAF] shadow-[0_12px_32px_-4px_rgba(20,30,15,0.12),0_4px_14px_-2px_rgba(20,30,15,0.06)] space-y-4 ${
        viewMode === 'heatmap' ? 'ring-2 ring-[#385820]' : ''
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-base text-[#1D2417] dark:text-stone-100 font-serif">
                52-Week Study Contribution Matrix
              </h3>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#EAF2E4] text-[#2E481B] border border-[#C5D9BA] shadow-2xs">
                {totalActivities} Total Actions
              </span>
              {totalActivities === 0 && (
                <button
                  onClick={loadDemoDataAction}
                  className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-[#F6E3A1] hover:bg-[#ebd68a] text-[#1D2417] border border-[#d9c788] shadow-xs transition-colors"
                  title="Populate demo study activity to test heatmap colors and streaks"
                >
                  ⚡ Populate Sample Activity
                </button>
              )}
            </div>
            <p className="text-xs text-stone-600 dark:text-stone-400 mt-0.5 font-medium">
              Visual record of all topic completions and spaced repetition reviews across the last 365 days.
            </p>
          </div>

          {/* Scale Legend */}
          <div className="flex items-center gap-2 text-xs text-stone-600 dark:text-stone-400 font-semibold">
            <span>Less</span>
            <div className="flex items-center gap-1.5">
              <div className="w-3.5 h-3.5 rounded-xs bg-[#C8C2B3] border border-[#B5AEA0]" title="0 activities" />
              <div className="w-3.5 h-3.5 rounded-xs bg-[#96BE88] border border-[#7EA86F]" title="1 activity" />
              <div className="w-3.5 h-3.5 rounded-xs bg-[#5FA049] border border-[#488534]" title="2-3 activities" />
              <div className="w-3.5 h-3.5 rounded-xs bg-[#3E7628] border border-[#2D5A1C]" title="4-5 activities" />
              <div className="w-3.5 h-3.5 rounded-xs bg-[#225014] border border-[#14360A]" title="6+ activities" />
            </div>
            <span>More</span>
          </div>
        </div>

        {/* Heatmap Grid Container with Month Header Labels */}
        <div className="overflow-x-auto pb-3 pt-1">
          <div className="inline-flex flex-col gap-1.5 min-w-[980px]">
            {/* Month labels row */}
            <div className="relative h-4 text-[10px] font-bold text-stone-600 dark:text-stone-400 select-none ml-7">
              {monthLabels.map((m, idx) => (
                <span
                  key={`${m.label}-${idx}`}
                  className="absolute whitespace-nowrap"
                  style={{ left: `${m.weekIndex * 18}px` }}
                >
                  {m.label}
                </span>
              ))}
            </div>

            <div className="inline-flex gap-1.5">
              {/* Days of week labels column */}
              <div className="flex flex-col gap-1 pr-1.5 w-7 text-[9px] font-bold text-stone-500 select-none shrink-0">
                <div className="h-3.5 flex items-center">Sun</div>
                <div className="h-3.5 flex items-center">Mon</div>
                <div className="h-3.5 flex items-center">Tue</div>
                <div className="h-3.5 flex items-center">Wed</div>
                <div className="h-3.5 flex items-center">Thu</div>
                <div className="h-3.5 flex items-center">Fri</div>
                <div className="h-3.5 flex items-center">Sat</div>
              </div>

              {/* 52 Weeks Columns */}
              {weeks.map((week: HeatmapDay[], wIdx: number) => (
                <div key={wIdx} className="flex flex-col gap-1">
                  {week.map((day: HeatmapDay) => {
                    const isSelected = day.date === selectedDate;
                    const isTodayDate = day.isToday;

                    return (
                      <button
                        key={day.date}
                        onClick={() => handleSelectHeatmapDate(day.date)}
                        onMouseEnter={() => setHoveredDay(day)}
                        onMouseLeave={() => setHoveredDay(null)}
                        className={`w-3.5 h-3.5 rounded-xs transition-all cursor-pointer relative ${
                          isTodayDate ? 'ring-2 ring-[#C68A2C] font-bold' : ''
                        } ${getIntensityColor(day.level, isSelected)}`}
                        title={`${formatHumanDate(day.date)}: ${day.count} activities (${day.completedCount} completed, ${day.revisionCount} revisions)`}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Heatmap Info Footer Bar */}
        <div className="pt-3 border-t border-[#C5BEAF]/60 dark:border-stone-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-stone-600 dark:text-stone-400">
          <div>
            {hoveredDay ? (
              <span className="text-[#1D2417] dark:text-stone-200 font-semibold flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#385820]" />
                <strong>{formatHumanDate(hoveredDay.date)}:</strong>{' '}
                {hoveredDay.count > 0
                  ? `${hoveredDay.completedCount} topics completed, ${hoveredDay.revisionCount} revisions`
                  : 'Rest day / No activity logged'}
              </span>
            ) : (
              <span className="text-stone-500 font-medium">
                Hover over any cell for breakdown or click to inspect that day's scheduled tasks below.
              </span>
            )}
          </div>

          <div className="text-[11px] text-stone-600 dark:text-stone-400">
            Selected: <strong className="text-[#1D2417] dark:text-stone-100 font-serif">{formatHumanDate(selectedDate)}</strong>
          </div>
        </div>
      </div>

      {/* Main Content Area: Monthly Calendar Grid + Day Inspector Panel */}
      {viewMode === 'agenda' ? (
        /* Agenda View: Next 14 Days */
        <div className="p-6 rounded-2xl bg-[#EBE8E1]/92 backdrop-blur-xl border border-[#C5BEAF] shadow-[0_12px_32px_-4px_rgba(20,30,15,0.12),0_4px_14px_-2px_rgba(20,30,15,0.06)] space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-[#C5BEAF]/60 dark:border-stone-800">
            <div>
              <h3 className="font-extrabold text-lg text-[#1D2417] dark:text-stone-100 font-serif">
                14-Day Forward Revision Radar
              </h3>
              <p className="text-xs text-stone-600 dark:text-stone-400 font-medium">
                Upcoming spaced repetition workload and topic schedules
              </p>
            </div>
            <button
              onClick={() => setViewMode('month')}
              className="text-xs font-bold text-[#385820] hover:underline flex items-center gap-1"
            >
              Back to Month Grid →
            </button>
          </div>

          <div className="space-y-4">
            {agendaDates.map(dateStr => {
              const scheduled = scheduledByDate.get(dateStr) || [];
              const logs = logsByDate.get(dateStr) || [];
              const isTodayDate = dateStr === todayStr;

              return (
                <div
                  key={dateStr}
                  className={`p-4 rounded-xl border transition-all shadow-xs ${
                    isTodayDate
                      ? 'bg-[#FBF3DC] dark:bg-[#C68A2C]/10 border-2 border-[#C68A2C]'
                      : 'bg-[#DFDBD1]/60 dark:bg-stone-950/60 border border-[#C5BEAF] dark:border-stone-800'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2.5">
                      <span className="font-serif font-extrabold text-sm text-[#1D2417] dark:text-stone-100">
                        {formatHumanDate(dateStr)}
                      </span>
                      {isTodayDate && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#C68A2C] text-white shadow-2xs">
                          TODAY
                        </span>
                      )}
                      <span className="text-xs text-stone-600 dark:text-stone-400 font-medium">
                        ({formatRelativeDate(dateStr)})
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-stone-600 dark:text-stone-400 font-medium">
                        {scheduled.length} Due • {logs.length} Logged
                      </span>
                      <button
                        onClick={() => {
                          setSelectedDate(dateStr);
                          setViewMode('month');
                        }}
                        className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-[#EBE8E1] hover:bg-[#DFDBD1] border border-[#C5BEAF] text-[#1D2417] dark:text-stone-200 transition-colors shadow-2xs"
                      >
                        Inspect
                      </button>
                    </div>
                  </div>

                  {scheduled.length === 0 ? (
                    <div className="text-xs text-stone-500 italic">No scheduled revisions for this date.</div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                      {scheduled.map(item => (
                        <div
                          key={item.topic.id}
                          className="p-3 rounded-xl bg-[#EBE8E1]/90 dark:bg-stone-900 border border-[#C5BEAF] dark:border-stone-800 flex items-center justify-between text-xs shadow-2xs"
                        >
                          <div className="min-w-0 pr-2">
                            <div className="font-bold text-stone-900 dark:text-stone-100 truncate">
                              {item.topic.name}
                            </div>
                            <div className="text-[11px] text-stone-600 dark:text-stone-400 truncate">
                              {item.subjectCode} • {item.chapterName} • Rev #{item.topic.revisionCount + 1}
                            </div>
                          </div>
                          <button
                            onClick={() => handleCompleteRevisionFromCalendar(item)}
                            className="shrink-0 px-2.5 py-1 rounded-md text-[11px] font-bold bg-[#385820] hover:bg-[#2A4218] text-white shadow-xs transition-colors"
                          >
                            Revise
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Standard Month Grid + Day Inspector (2 columns) */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Calendar View (7 cols) */}
          <div className="lg:col-span-7 p-6 rounded-2xl bg-[#EBE8E1]/92 backdrop-blur-xl border border-[#C5BEAF] shadow-[0_12px_32px_-4px_rgba(20,30,15,0.12),0_4px_14px_-2px_rgba(20,30,15,0.06)] space-y-4">
            {/* Calendar Month Header Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#C5BEAF]/60 dark:border-stone-800">
              <div className="flex items-center gap-3">
                <h3 className="font-extrabold text-xl text-[#1D2417] dark:text-stone-100 font-serif">
                  {currentCalendarDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </h3>
                <button
                  onClick={jumpToToday}
                  className="px-3 py-1 text-xs font-bold rounded-lg bg-[#F6E3A1] hover:bg-[#ebd68a] text-[#1D2417] border border-[#d9c788] shadow-xs transition-colors"
                >
                  Today
                </button>
              </div>

              {/* Month Navigation & Filter */}
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 bg-[#DFDBD1]/80 dark:bg-stone-800/80 p-0.5 rounded-xl border border-[#C5BEAF] dark:border-stone-700">
                  <button
                    onClick={() => setCalendarFilter('all')}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                      calendarFilter === 'all'
                        ? 'bg-[#385820] text-white shadow-xs font-bold'
                        : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
                    }`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setCalendarFilter('due')}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                      calendarFilter === 'due'
                        ? 'bg-[#C68A2C] text-white shadow-xs font-bold'
                        : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
                    }`}
                  >
                    Due
                  </button>
                  <button
                    onClick={() => setCalendarFilter('completed')}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                      calendarFilter === 'completed'
                        ? 'bg-[#385820] text-white shadow-xs font-bold'
                        : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
                    }`}
                  >
                    Done
                  </button>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={prevMonth}
                    className="p-1.5 rounded-lg bg-[#DFDBD1]/80 dark:bg-stone-800 text-[#1D2417] dark:text-stone-300 hover:bg-[#C8C2B3] border border-[#C5BEAF] dark:border-stone-700 transition-colors shadow-2xs"
                    title="Previous Month"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={nextMonth}
                    className="p-1.5 rounded-lg bg-[#DFDBD1]/80 dark:bg-stone-800 text-[#1D2417] dark:text-stone-300 hover:bg-[#C8C2B3] border border-[#C5BEAF] dark:border-stone-700 transition-colors shadow-2xs"
                    title="Next Month"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Calendar Grid Days of Week */}
            <div className="grid grid-cols-7 gap-1 text-center text-xs font-bold text-stone-600 dark:text-stone-400 uppercase tracking-wider py-1 select-none">
              <span className="text-[#8E5B13]">Sun</span>
              <span>Mon</span>
              <span>Tue</span>
              <span>Wed</span>
              <span>Thu</span>
              <span>Fri</span>
              <span className="text-[#8E5B13]">Sat</span>
            </div>

            {/* Month Days Grid */}
            <div className="grid grid-cols-7 gap-1.5">
              {/* Blank leading slots */}
              {Array.from({ length: startingDayOfWeek }).map((_, i) => (
                <div
                  key={`blank-${i}`}
                  className="h-20 rounded-xl bg-[#DFDBD1]/30 dark:bg-stone-950/20 border border-dashed border-[#C5BEAF]/40"
                />
              ))}

              {/* Days in Month */}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const dayNum = i + 1;
                const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
                const isSelected = dateStr === selectedDate;
                const isTodayDate = dateStr === todayStr;

                const logs = logsByDate.get(dateStr) || [];
                const scheduled = scheduledByDate.get(dateStr) || [];

                const hasCompletions = logs.some((l: ActivityLogEntry) => l.type === 'topic_completed');
                const hasRevisions = logs.some((l: ActivityLogEntry) => l.type === 'revision_completed');
                const hasScheduled = scheduled.length > 0;
                const isOverdueDay = dateStr < todayStr && hasScheduled;

                // Filter check
                if (calendarFilter === 'due' && !hasScheduled) return null;
                if (calendarFilter === 'completed' && !hasCompletions) return null;

                return (
                  <div
                    key={dateStr}
                    onClick={() => setSelectedDate(dateStr)}
                    className={`h-20 p-1.5 rounded-xl border text-xs cursor-pointer flex flex-col justify-between transition-all select-none relative group shadow-2xs ${
                      isSelected
                        ? 'bg-[#385820] text-white border-2 border-[#263D15] shadow-md ring-2 ring-[#385820]/30'
                        : isTodayDate
                        ? 'bg-[#FBF3DC] dark:bg-[#C68A2C]/20 border-2 border-[#C68A2C] text-[#8E5B13] dark:text-[#EEDDB8] font-bold ring-1 ring-[#C68A2C]/40'
                        : 'bg-[#DFDBD1]/50 dark:bg-stone-950/60 border border-[#C5BEAF] dark:border-stone-800/80 hover:bg-[#DFDBD1]/90 hover:border-[#8E8676] text-stone-800 dark:text-stone-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-xs font-bold ${
                          isSelected
                            ? 'text-white font-extrabold'
                            : isTodayDate
                            ? 'text-[#8E5B13] dark:text-[#EEDDB8] font-black'
                            : ''
                        }`}
                      >
                        {dayNum}
                      </span>

                      {/* Small activity dot */}
                      {logs.length > 0 && (
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            isSelected ? 'bg-white' : 'bg-[#385820]'
                          }`}
                        />
                      )}
                    </div>

                    {/* Micro Indicators */}
                    <div className="flex flex-col gap-0.5 overflow-hidden">
                      {hasCompletions && (
                        <div
                          className={`text-[9px] truncate px-1 py-0.2 rounded font-medium ${
                            isSelected
                              ? 'bg-white/20 text-white'
                              : 'bg-[#EAF2E4] text-[#2E481B] border border-[#C5D9BA]'
                          }`}
                        >
                          ✓ {logs.filter(l => l.type === 'topic_completed').length} Done
                        </div>
                      )}
                      {hasRevisions && (
                        <div
                          className={`text-[9px] truncate px-1 py-0.2 rounded font-medium ${
                            isSelected
                              ? 'bg-white/20 text-white'
                              : 'bg-[#FBF3DC] text-[#8E5B13] border border-[#d9c788]'
                          }`}
                        >
                          ↻ {logs.filter(l => l.type === 'revision_completed').length} Rev
                        </div>
                      )}
                      {hasScheduled && (
                        <div
                          className={`text-[9px] truncate px-1 py-0.2 rounded font-medium ${
                            isSelected
                              ? 'bg-white/20 text-white'
                              : isOverdueDay
                              ? 'bg-[#FEE2E2] text-[#991B1B] border border-[#FCA5A5]'
                              : 'bg-[#F6E3A1] text-[#1D2417] border border-[#d9c788]'
                          }`}
                        >
                          {isOverdueDay ? `⚠️ ${scheduled.length} Late` : `⏰ ${scheduled.length} Due`}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Quick Helper Legend */}
            <div className="pt-2 flex flex-wrap items-center justify-between gap-2 text-[11px] text-stone-600 dark:text-stone-400 font-medium">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#385820]" /> Done
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#C68A2C]" /> Revision
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-red-500" /> Overdue
                </span>
              </div>
              <span>Click any date to inspect details</span>
            </div>
          </div>

          {/* Right Column: Day Inspector Panel (5 cols) */}
          <div className="lg:col-span-5 p-6 rounded-2xl bg-[#EBE8E1]/92 backdrop-blur-xl border border-[#C5BEAF] shadow-[0_12px_32px_-4px_rgba(20,30,15,0.12),0_4px_14px_-2px_rgba(20,30,15,0.06)] space-y-6">
            {/* Inspector Header */}
            <div className="pb-3 border-b border-[#C5BEAF]/60 dark:border-stone-800 flex items-center justify-between">
              <div>
                <span className="text-[11px] uppercase font-bold tracking-wider text-stone-500 dark:text-stone-400">
                  Day Inspector
                </span>
                <h3 className="text-xl font-extrabold text-[#1D2417] dark:text-stone-100 font-serif mt-0.5">
                  {formatHumanDate(selectedDate)}
                </h3>
                <div className="text-xs text-stone-600 dark:text-stone-400 mt-0.5 font-medium">
                  {formatRelativeDate(selectedDate)}
                </div>
              </div>

              {selectedDate === todayStr ? (
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#FBF3DC] text-[#8E5B13] border border-[#d9c788] shadow-2xs">
                  Today
                </span>
              ) : selectedDate < todayStr ? (
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#DFDBD1]/80 text-stone-700 border border-[#C5BEAF]">
                  Past Date
                </span>
              ) : (
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#EAF2E4] text-[#2E481B] border border-[#C5D9BA]">
                  Upcoming
                </span>
              )}
            </div>

            {/* Scheduled Revisions for this date */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-stone-800 dark:text-stone-200 uppercase tracking-wider flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-[#C68A2C]" />
                  Revisions Scheduled ({selectedDateScheduled.length})
                </h4>
                {selectedDateScheduled.length > 0 && (
                  <span className="text-[10px] font-semibold text-stone-500">
                    Spaced Repetition Due
                  </span>
                )}
              </div>

              {selectedDateScheduled.length === 0 ? (
                <div className="p-4 rounded-xl bg-[#DFDBD1]/50 dark:bg-stone-950/40 border border-[#C5BEAF] dark:border-stone-800/80 text-center text-xs text-stone-600 dark:text-stone-400 font-medium">
                  No spaced revisions scheduled on this date.
                </div>
              ) : (
                <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                  {selectedDateScheduled.map((item: FlatTopicWithSubject) => (
                    <div
                      key={item.topic.id}
                      className="p-3 rounded-xl bg-[#DFDBD1]/70 dark:bg-stone-950/60 border border-[#C5BEAF] dark:border-stone-800 flex flex-col gap-2 transition-all hover:border-[#8E8676] shadow-2xs"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="font-bold text-xs text-stone-900 dark:text-stone-100">
                            {item.topic.name}
                          </div>
                          <div className="text-[11px] text-stone-600 dark:text-stone-400">
                            {item.subjectCode} • {item.chapterName}
                          </div>
                        </div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FBF3DC] text-[#8E5B13] border border-[#d9c788] shrink-0">
                          Rev #{item.topic.revisionCount + 1}
                        </span>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center justify-between pt-1 border-t border-[#C5BEAF]/50 dark:border-stone-800/60 text-xs">
                        <span className="text-[10px] text-stone-600 dark:text-stone-400">
                          Priority: <strong className="capitalize text-stone-800 dark:text-stone-200">{item.topic.priority}</strong>
                        </span>
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handlePostpone(item, 1)}
                            className="px-2 py-1 rounded-md text-[10px] font-semibold bg-[#EBE8E1] dark:bg-stone-800 border border-[#C5BEAF] text-stone-700 dark:text-stone-300 hover:bg-[#DFDBD1] shadow-2xs"
                            title="Postpone by 1 day"
                          >
                            +1d
                          </button>
                          <button
                            onClick={() => handleCompleteRevisionFromCalendar(item)}
                            className="flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold bg-[#385820] hover:bg-[#2A4218] text-white shadow-xs transition-colors"
                          >
                            <Check className="w-3 h-3" />
                            <span>Mark Revised</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Completed Activities on this date */}
            <div className="space-y-3 pt-3 border-t border-[#C5BEAF]/60 dark:border-stone-800">
              <h4 className="text-xs font-bold text-stone-800 dark:text-stone-200 uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#385820]" />
                Completed on this Day ({selectedDateLogs.length})
              </h4>

              {selectedDateLogs.length === 0 ? (
                <div className="p-4 rounded-xl bg-[#DFDBD1]/50 dark:bg-stone-950/40 border border-[#C5BEAF] dark:border-stone-800/80 text-center text-xs text-stone-600 dark:text-stone-400 font-medium">
                  No activity recorded on this day yet.
                </div>
              ) : (
                <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                  {selectedDateLogs.map((log: ActivityLogEntry) => (
                    <div
                      key={log.id}
                      className="p-2.5 rounded-xl bg-[#DFDBD1]/70 dark:bg-stone-950/60 border border-[#C5BEAF] dark:border-stone-800 flex items-center justify-between text-xs shadow-2xs"
                    >
                      <div className="min-w-0 pr-2">
                        <div className="font-semibold text-stone-900 dark:text-stone-100 truncate">
                          {log.topicName}
                        </div>
                        <div className="text-[11px] text-stone-600 dark:text-stone-400 truncate">
                          {log.subjectName}
                        </div>
                      </div>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                          log.type === 'topic_completed'
                            ? 'bg-[#EAF2E4] text-[#2E481B] border border-[#C5D9BA]'
                            : 'bg-[#FBF3DC] text-[#8E5B13] border border-[#d9c788]'
                        }`}
                      >
                        {log.type === 'topic_completed' ? '✓ Completed' : '↻ Revised'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Streak Milestones Badges Grid */}
            <div className="space-y-3 pt-3 border-t border-[#C5BEAF]/60 dark:border-stone-800">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-stone-800 dark:text-stone-200 uppercase tracking-wider flex items-center gap-1.5">
                  <Trophy className="w-4 h-4 text-[#C68A2C]" />
                  Streak Milestones
                </h4>
                <span className="text-[11px] font-semibold text-stone-600 dark:text-stone-400">
                  {streakStats.milestones.filter(m => m.unlockedAt !== null).length} / {streakStats.milestones.length} Unlocked
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {streakStats.milestones.map((m: StreakMilestone) => {
                  const isUnlocked = m.unlockedAt !== null;
                  return (
                    <div
                      key={m.days}
                      className={`p-2.5 rounded-xl border text-center transition-all ${
                        isUnlocked
                          ? 'bg-[#FBF3DC] dark:bg-[#C68A2C]/15 border border-[#d9c788] dark:border-[#C68A2C]/30 text-[#8E5B13] dark:text-[#EEDDB8] shadow-xs'
                          : 'bg-[#DFDBD1]/40 dark:bg-stone-950/40 border border-[#C5BEAF]/60 dark:border-stone-800 text-stone-400 opacity-70'
                      }`}
                    >
                      <div className="text-xl mb-1">{m.badge}</div>
                      <div className="font-extrabold text-xs truncate">{m.days} Days</div>
                      <div className="text-[10px] text-stone-600 dark:text-stone-400 truncate">
                        {m.title}
                      </div>
                      {isUnlocked && (
                        <div className="mt-1 text-[9px] font-bold text-[#385820]">✓ Unlocked</div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
