import { ActivityLogEntry, StreakMilestone } from '../types';
import { getLocalDateString, parseLocalDate, addDays, diffInDays } from './date';

export const MILESTONES_CONFIG: Omit<StreakMilestone, 'unlockedAt'>[] = [
  {
    days: 3,
    title: 'Spark of Habit',
    badge: '🔥',
    description: '3 consecutive days of focused GATE revision'
  },
  {
    days: 7,
    title: '1-Week Warrior',
    badge: '⚡',
    description: 'A full week without missing a single day'
  },
  {
    days: 14,
    title: 'Fortnight Master',
    badge: '🛡️',
    description: '14 consecutive days of relentless study'
  },
  {
    days: 30,
    title: 'Iron Consistency',
    badge: '👑',
    description: '1 month streak — neural retention established'
  },
  {
    days: 60,
    title: 'GATE Virtuoso',
    badge: '💎',
    description: '60 days of uninterrupted preparation'
  },
  {
    days: 100,
    title: 'Centurion (AIR Elite)',
    badge: '🏆',
    description: '100 days streak! AIR top ranks are within reach'
  }
];

export interface StreakStats {
  currentStreak: number;
  longestStreak: number;
  totalActiveDays: number;
  isActiveToday: boolean;
  wasActiveYesterday: boolean;
  activeDaysThisWeek: number;
  activeDaysThisMonth: number;
  weeklyConsistencyPct: number;
  milestones: StreakMilestone[];
  nextMilestone: StreakMilestone | null;
}

/**
 * Calculates accurate streaks and consistency metrics based on activity logs
 */
export function calculateStreakStats(
  activityLogs: ActivityLogEntry[],
  todayStr: string = getLocalDateString()
): StreakStats {
  // Extract unique sorted active dates
  const uniqueActiveDates = Array.from(new Set(activityLogs.map(l => l.date))).sort();
  const dateSet = new Set(uniqueActiveDates);

  const isActiveToday = dateSet.has(todayStr);
  const yesterdayStr = addDays(todayStr, -1);
  const wasActiveYesterday = dateSet.has(yesterdayStr);

  let currentStreak = 0;

  if (isActiveToday) {
    // Count backwards from today
    let checkDate = todayStr;
    while (dateSet.has(checkDate)) {
      currentStreak++;
      checkDate = addDays(checkDate, -1);
    }
  } else if (wasActiveYesterday) {
    // Retain streak through today until day ends!
    let checkDate = yesterdayStr;
    while (dateSet.has(checkDate)) {
      currentStreak++;
      checkDate = addDays(checkDate, -1);
    }
  } else {
    // Neither today nor yesterday had activity -> streak is 0
    currentStreak = 0;
  }

  // Calculate longest streak in entire history
  let longestStreak = 0;
  let tempStreak = 0;
  let prevDate: string | null = null;

  for (const date of uniqueActiveDates) {
    if (!prevDate) {
      tempStreak = 1;
    } else {
      const dayDiff = diffInDays(prevDate, date);
      if (dayDiff === 1) {
        tempStreak++;
      } else if (dayDiff > 1) {
        tempStreak = 1;
      }
    }
    if (tempStreak > longestStreak) {
      longestStreak = tempStreak;
    }
    prevDate = date;
  }

  // Current streak could also match or be longest
  if (currentStreak > longestStreak) {
    longestStreak = currentStreak;
  }

  // Active days this week (Monday through Sunday)
  const today = parseLocalDate(todayStr);
  const currentDayOfWeek = today.getDay(); // 0 is Sun, 1 is Mon...
  // Days elapsed from Monday (assuming Monday is start of week: Mon=1, Sun=7)
  const mondayOffset = currentDayOfWeek === 0 ? 6 : currentDayOfWeek - 1;
  const mondayDate = addDays(todayStr, -mondayOffset);
  
  let activeDaysThisWeek = 0;
  for (let i = 0; i <= mondayOffset; i++) {
    const d = addDays(mondayDate, i);
    if (dateSet.has(d)) {
      activeDaysThisWeek++;
    }
  }

  const elapsedDaysInWeek = mondayOffset + 1;
  const weeklyConsistencyPct = Math.round((activeDaysThisWeek / elapsedDaysInWeek) * 100);

  // Active days this month
  const currentMonth = todayStr.slice(0, 7); // YYYY-MM
  const activeDaysThisMonth = uniqueActiveDates.filter(d => d.startsWith(currentMonth)).length;

  // Process Milestones
  const milestones: StreakMilestone[] = MILESTONES_CONFIG.map(m => {
    const isUnlocked = longestStreak >= m.days;
    return {
      ...m,
      unlockedAt: isUnlocked ? 'Unlocked' : null
    };
  });

  const nextMilestone = milestones.find(m => m.unlockedAt === null) || null;

  return {
    currentStreak,
    longestStreak,
    totalActiveDays: uniqueActiveDates.length,
    isActiveToday,
    wasActiveYesterday,
    activeDaysThisWeek,
    activeDaysThisMonth,
    weeklyConsistencyPct,
    milestones,
    nextMilestone
  };
}

export interface HeatmapDay {
  date: string;
  count: number;
  level: 0 | 1 | 2 | 3 | 4; // Intensity
  isToday: boolean;
  completedCount: number;
  revisionCount: number;
}

/**
 * Builds a 52-week grid (approx 365-371 days) of contribution cells ending on current week Sunday
 */
export function buildContributionHeatmap(
  activityLogs: ActivityLogEntry[],
  todayStr: string = getLocalDateString()
): { weeks: HeatmapDay[][]; totalActivities: number } {
  // Aggregate counts per date
  const countsByDate = new Map<string, { completed: number; revised: number; total: number }>();
  let totalActivities = 0;

  for (const log of activityLogs) {
    totalActivities++;
    const cur = countsByDate.get(log.date) || { completed: 0, revised: 0, total: 0 };
    if (log.type === 'topic_completed') {
      cur.completed++;
    } else {
      cur.revised++;
    }
    cur.total++;
    countsByDate.set(log.date, cur);
  }

  // End date is upcoming Saturday / Sunday of current week to make full columns
  const today = parseLocalDate(todayStr);
  const dayOfWeek = today.getDay(); // 0 is Sunday, 6 is Saturday
  // End on Saturday (day 6)
  const daysUntilSaturday = 6 - dayOfWeek;
  const endDateStr = addDays(todayStr, daysUntilSaturday);

  // 52 weeks = 52 * 7 = 364 days
  const startDateStr = addDays(endDateStr, -363);

  const days: HeatmapDay[] = [];
  let curDateStr = startDateStr;

  while (curDateStr <= endDateStr) {
    const data = countsByDate.get(curDateStr) || { completed: 0, revised: 0, total: 0 };
    const count = data.total;

    let level: 0 | 1 | 2 | 3 | 4 = 0;
    if (count >= 6) level = 4;
    else if (count >= 4) level = 3;
    else if (count >= 2) level = 2;
    else if (count >= 1) level = 1;

    days.push({
      date: curDateStr,
      count,
      level,
      isToday: curDateStr === todayStr,
      completedCount: data.completed,
      revisionCount: data.revised
    });

    curDateStr = addDays(curDateStr, 1);
  }

  // Group into weeks of 7 days each
  const weeks: HeatmapDay[][] = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }

  return { weeks, totalActivities };
}
