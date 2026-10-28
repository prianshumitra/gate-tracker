import { Subject, Topic } from '../types';
import { getLocalDateString, addDays, diffInDays } from './date';

export interface FlatTopicWithSubject {
  topic: Topic;
  chapterId: string;
  chapterName: string;
  subjectId: string;
  subjectName: string;
  subjectCode: string;
  subjectPriority: string;
}

/**
 * Computes the next scheduled revision date based on current revision count and intervals array
 */
export function calculateNextRevisionDate(
  currentRevisionCount: number,
  intervals: number[] = [1, 3, 7, 14, 30],
  baseDate: string = getLocalDateString()
): string {
  if (!intervals || intervals.length === 0) {
    return addDays(baseDate, 3);
  }
  const index = Math.min(currentRevisionCount, intervals.length - 1);
  const intervalDays = intervals[index];
  return addDays(baseDate, intervalDays);
}

/**
 * Flattens all topics across subjects with their parent metadata
 */
export function flattenAllTopics(subjects: Subject[]): FlatTopicWithSubject[] {
  const result: FlatTopicWithSubject[] = [];

  for (const subject of subjects) {
    for (const chapter of subject.chapters) {
      for (const topic of chapter.topics) {
        result.push({
          topic,
          chapterId: chapter.id,
          chapterName: chapter.name,
          subjectId: subject.id,
          subjectName: subject.name,
          subjectCode: subject.code,
          subjectPriority: subject.priority
        });
      }
    }
  }

  return result;
}

export type RevisionFilterType = 'all' | 'due_today' | 'overdue' | 'due_this_week' | 'never_revised' | 'weak';

/**
 * Filters topics based on the specified revision filter
 */
export function filterRevisionTopics(
  topics: FlatTopicWithSubject[],
  filterType: RevisionFilterType,
  todayStr: string = getLocalDateString()
): FlatTopicWithSubject[] {
  return topics.filter(item => {
    const t = item.topic;

    // Revision queue only applies to topics that have been started or completed
    if (filterType !== 'all' && t.status === 'not_started') {
      return false;
    }

    if (filterType === 'all') {
      return t.status === 'completed' || t.status === 'in_progress';
    }

    if (filterType === 'overdue') {
      return Boolean(t.nextRevisionAt && diffInDays(todayStr, t.nextRevisionAt) < 0);
    }

    if (filterType === 'due_today') {
      return t.nextRevisionAt === todayStr;
    }

    if (filterType === 'due_this_week') {
      if (!t.nextRevisionAt) return false;
      const diff = diffInDays(todayStr, t.nextRevisionAt);
      return diff >= 0 && diff <= 7;
    }

    if (filterType === 'never_revised') {
      return t.status === 'completed' && t.revisionCount === 0;
    }

    if (filterType === 'weak') {
      return t.confidence === 'weak';
    }

    return true;
  });
}

/**
 * Returns summary counts for the revision queue
 */
export function getRevisionCounts(
  topics: FlatTopicWithSubject[],
  todayStr: string = getLocalDateString()
): {
  dueToday: number;
  overdue: number;
  dueThisWeek: number;
  neverRevised: number;
  weakTopics: number;
  totalActive: number;
} {
  let dueToday = 0;
  let overdue = 0;
  let dueThisWeek = 0;
  let neverRevised = 0;
  let weakTopics = 0;
  let totalActive = 0;

  for (const item of topics) {
    const t = item.topic;
    if (t.status === 'completed' || t.status === 'in_progress') {
      totalActive++;
      if (t.confidence === 'weak') {
        weakTopics++;
      }
      if (t.status === 'completed' && t.revisionCount === 0) {
        neverRevised++;
      }
      if (t.nextRevisionAt) {
        const diff = diffInDays(todayStr, t.nextRevisionAt);
        if (diff < 0) {
          overdue++;
        } else if (diff === 0) {
          dueToday++;
        }
        if (diff >= 0 && diff <= 7) {
          dueThisWeek++;
        }
      }
    }
  }

  return {
    dueToday,
    overdue,
    dueThisWeek,
    neverRevised,
    weakTopics,
    totalActive
  };
}
