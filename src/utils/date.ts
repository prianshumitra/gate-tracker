/**
 * Formats a date object to YYYY-MM-DD in local time
 */
export function getLocalDateString(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Parses YYYY-MM-DD to a local Date object at 00:00:00
 */
export function parseLocalDate(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day, 0, 0, 0, 0);
}

/**
 * Returns difference in days between two YYYY-MM-DD date strings (b - a)
 */
export function diffInDays(a: string, b: string): number {
  const dateA = parseLocalDate(a);
  const dateB = parseLocalDate(b);
  const diffTime = dateB.getTime() - dateA.getTime();
  return Math.round(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Adds N days to a YYYY-MM-DD date string
 */
export function addDays(dateStr: string, days: number): string {
  const date = parseLocalDate(dateStr);
  date.setDate(date.getDate() + days);
  return getLocalDateString(date);
}

/**
 * Checks if a date string is today
 */
export function isToday(dateStr: string): boolean {
  return dateStr === getLocalDateString();
}

/**
 * Checks if a date string is yesterday
 */
export function isYesterday(dateStr: string): boolean {
  const today = getLocalDateString();
  return diffInDays(dateStr, today) === 1;
}

/**
 * Returns formatted human-readable date e.g. "Oct 27, 2026"
 */
export function formatHumanDate(dateStr: string): string {
  if (!dateStr) return 'N/A';
  const date = parseLocalDate(dateStr);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

/**
 * Returns relative date string e.g. "Today", "Yesterday", "In 3 days", "2 days overdue"
 */
export function formatRelativeDate(dateStr: string): string {
  if (!dateStr) return 'Not scheduled';
  const today = getLocalDateString();
  const diff = diffInDays(today, dateStr);

  if (diff === 0) return 'Today';
  if (diff === 1) return 'Tomorrow';
  if (diff === -1) return 'Yesterday';
  if (diff < -1) return `${Math.abs(diff)} days overdue`;
  return `In ${diff} days`;
}

/**
 * Computes remaining days to GATE exam
 */
export function daysUntilExam(examDateStr: string): number {
  const today = getLocalDateString();
  return Math.max(0, diffInDays(today, examDateStr));
}

export interface TimeGreeting {
  greeting: string;
  emoji: string;
  period: 'morning' | 'afternoon' | 'evening' | 'night';
  motivationalQuote: string;
}

/**
 * Returns dynamic greeting based on current local time
 */
export function getTimeGreeting(date: Date = new Date()): TimeGreeting {
  const hour = date.getHours();

  if (hour >= 5 && hour < 12) {
    return {
      greeting: 'Good Morning',
      emoji: '🌅',
      period: 'morning',
      motivationalQuote: 'Start early, stay focused. A stronger rank tomorrow.'
    };
  } else if (hour >= 12 && hour < 17) {
    return {
      greeting: 'Good Afternoon',
      emoji: '☀️',
      period: 'afternoon',
      motivationalQuote: 'Keep the momentum going. Consistency is key.'
    };
  } else if (hour >= 17 && hour < 22) {
    return {
      greeting: 'Good Evening',
      emoji: '🌆',
      period: 'evening',
      motivationalQuote: 'Review today’s learnings and lock in your revisions.'
    };
  } else {
    return {
      greeting: 'Good Night',
      emoji: '🌙',
      period: 'night',
      motivationalQuote: 'Quiet hours, deep focus. Every revision counts.'
    };
  }
}

/**
 * Returns formatted date string for dashboard header e.g. "Tue, 3 Nov 2026"
 */
export function formatDashboardDate(date: Date = new Date()): string {
  const weekday = date.toLocaleDateString('en-US', { weekday: 'short' });
  const day = date.getDate();
  const month = date.toLocaleDateString('en-US', { month: 'short' });
  const year = date.getFullYear();
  return `${weekday}, ${day} ${month} ${year}`;
}
