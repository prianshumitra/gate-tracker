import confetti from 'canvas-confetti';
import { ActivityLogEntry } from '../types';
import { getLocalDateString } from './date';

export interface RankTier {
  level: number;
  title: string;
  badge: string;
  minXp: number;
  maxXp: number;
  color: string;
}

export const RANKS: RankTier[] = [
  { level: 1, title: 'GATE Aspirant', badge: '🌱', minXp: 0, maxXp: 300, color: 'text-[#486B2C]' },
  { level: 2, title: 'Consistent Scholar', badge: '📚', minXp: 300, maxXp: 800, color: 'text-[#C68A2C]' },
  { level: 3, title: 'Concept Crusher', badge: '⚡', minXp: 800, maxXp: 1800, color: 'text-[#8E5B13]' },
  { level: 4, title: 'Revision Specialist', badge: '🛡️', minXp: 1800, maxXp: 3200, color: 'text-[#486B2C]' },
  { level: 5, title: 'GATE Strategist', badge: '🎯', minXp: 3200, maxXp: 5000, color: 'text-[#C68A2C]' },
  { level: 6, title: 'AIR Top 500 Contender', badge: '🚀', minXp: 5000, maxXp: 8000, color: 'text-[#324B1E]' },
  { level: 7, title: 'AIR Top 100 Grandmaster', badge: '👑', minXp: 8000, maxXp: 999999, color: 'text-[#8E5B13]' },
];

/**
 * Calculates total XP from activity history
 */
export function calculateXp(activityLogs: ActivityLogEntry[]): number {
  let totalXp = 0;
  for (const log of activityLogs) {
    if (log.type === 'topic_completed') {
      totalXp += 50;
    } else if (log.type === 'revision_completed') {
      totalXp += 40;
    }
  }
  return totalXp;
}

/**
 * Gets rank info for given XP
 */
export function getRankForXp(xp: number): {
  currentRank: RankTier;
  nextRank: RankTier | null;
  progressPercent: number;
  xpNeededForNext: number;
} {
  let currentRank = RANKS[0];
  for (let i = RANKS.length - 1; i >= 0; i--) {
    if (xp >= RANKS[i].minXp) {
      currentRank = RANKS[i];
      break;
    }
  }

  const nextRank = RANKS.find(r => r.level === currentRank.level + 1) || null;
  if (!nextRank) {
    return {
      currentRank,
      nextRank: null,
      progressPercent: 100,
      xpNeededForNext: 0
    };
  }

  const range = currentRank.maxXp - currentRank.minXp;
  const currentInTier = xp - currentRank.minXp;
  const progressPercent = Math.min(100, Math.max(0, Math.round((currentInTier / range) * 100)));
  const xpNeededForNext = Math.max(0, nextRank.minXp - xp);

  return {
    currentRank,
    nextRank,
    progressPercent,
    xpNeededForNext
  };
}

/**
 * Triggers a vibrant celebratory confetti burst
 */
export function fireConfetti() {
  try {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.65 },
      colors: ['#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6']
    });
  } catch {
    // Graceful fallback
  }
}

/**
 * Computes today's completed tasks count
 */
export function getTodayTasksCount(activityLogs: ActivityLogEntry[], todayStr: string = getLocalDateString()): number {
  return activityLogs.filter(log => log.date === todayStr).length;
}
