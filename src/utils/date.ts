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
