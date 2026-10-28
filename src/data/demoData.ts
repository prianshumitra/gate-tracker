import { Subject, ActivityLogEntry } from '../types';
import { INITIAL_SUBJECTS } from './initialSubjects';
import { getLocalDateString, addDays } from '../utils/date';

/**
 * Generates rich demo data with historical activity, active streak, and scheduled revisions
 */
export function generateDemoData(): { subjects: Subject[]; activityLogs: ActivityLogEntry[] } {
  const todayStr = getLocalDateString();
  const subjects: Subject[] = JSON.parse(JSON.stringify(INITIAL_SUBJECTS));
  const activityLogs: ActivityLogEntry[] = [];

  // Let's create an active streak of 14 consecutive days ending today!
  // Plus historical activity spread across the last 40 days
  const topicCompletionsMap = [
    // DSA topics completed in past days
    { subjId: 'dsa', topId: 'dsa-top-1', daysAgo: 24, revisions: 3, conf: 'strong' },
    { subjId: 'dsa', topId: 'dsa-top-2', daysAgo: 22, revisions: 2, conf: 'good' },
    { subjId: 'dsa', topId: 'dsa-top-4', daysAgo: 19, revisions: 2, conf: 'good' },
    { subjId: 'dsa', topId: 'dsa-top-6', daysAgo: 16, revisions: 2, conf: 'good' },
    { subjId: 'dsa', topId: 'dsa-top-8', daysAgo: 14, revisions: 1, conf: 'average' },
    { subjId: 'dsa', topId: 'dsa-top-9', daysAgo: 12, revisions: 1, conf: 'strong' },
    { subjId: 'dsa', topId: 'dsa-top-10', daysAgo: 10, revisions: 1, conf: 'weak' },
    { subjId: 'dsa', topId: 'dsa-top-12', daysAgo: 8, revisions: 1, conf: 'good' },
    { subjId: 'dsa', topId: 'dsa-top-15', daysAgo: 6, revisions: 1, conf: 'strong' },
    { subjId: 'dsa', topId: 'dsa-top-18', daysAgo: 4, revisions: 0, conf: 'average' },
    { subjId: 'dsa', topId: 'dsa-top-19', daysAgo: 2, revisions: 0, conf: 'weak' },
    { subjId: 'dsa', topId: 'dsa-top-20', daysAgo: 0, revisions: 0, conf: 'good' }, // completed today!

    // OS topics completed
    { subjId: 'os', topId: 'os-top-1', daysAgo: 20, revisions: 3, conf: 'strong' },
    { subjId: 'os', topId: 'os-top-2', daysAgo: 18, revisions: 2, conf: 'good' },
    { subjId: 'os', topId: 'os-top-5', daysAgo: 15, revisions: 2, conf: 'strong' },
    { subjId: 'os', topId: 'os-top-6', daysAgo: 13, revisions: 1, conf: 'good' },
    { subjId: 'os', topId: 'os-top-8', daysAgo: 11, revisions: 1, conf: 'weak' },
    { subjId: 'os', topId: 'os-top-10', daysAgo: 9, revisions: 1, conf: 'weak' },
    { subjId: 'os', topId: 'os-top-12', daysAgo: 7, revisions: 1, conf: 'average' },
    { subjId: 'os', topId: 'os-top-14', daysAgo: 5, revisions: 0, conf: 'good' },
    { subjId: 'os', topId: 'os-top-17', daysAgo: 3, revisions: 0, conf: 'average' },
    { subjId: 'os', topId: 'os-top-18', daysAgo: 1, revisions: 0, conf: 'weak' }, // completed yesterday!

    // DBMS topics completed
    { subjId: 'dbms', topId: 'dbms-top-1', daysAgo: 17, revisions: 2, conf: 'good' },
    { subjId: 'dbms', topId: 'dbms-top-2', daysAgo: 14, revisions: 1, conf: 'strong' },
    { subjId: 'dbms', topId: 'dbms-top-7', daysAgo: 9, revisions: 1, conf: 'strong' },
    { subjId: 'dbms', topId: 'dbms-top-9', daysAgo: 5, revisions: 0, conf: 'average' },
    { subjId: 'dbms', topId: 'dbms-top-11', daysAgo: 0, revisions: 0, conf: 'strong' }, // completed today!

    // CN topics completed
    { subjId: 'cn', topId: 'cn-top-2', daysAgo: 13, revisions: 1, conf: 'average' },
    { subjId: 'cn', topId: 'cn-top-4', daysAgo: 8, revisions: 1, conf: 'good' },
    { subjId: 'cn', topId: 'cn-top-8', daysAgo: 3, revisions: 0, conf: 'weak' },

    // Discrete Maths
    { subjId: 'dm', topId: 'dm-top-1', daysAgo: 16, revisions: 2, conf: 'strong' },
    { subjId: 'dm', topId: 'dm-top-2', daysAgo: 11, revisions: 1, conf: 'good' },
    { subjId: 'dm', topId: 'dm-top-9', daysAgo: 7, revisions: 1, conf: 'weak' },
    { subjId: 'dm', topId: 'dm-top-14', daysAgo: 2, revisions: 0, conf: 'average' }
  ];

  for (const item of topicCompletionsMap) {
    const subj = subjects.find(s => s.id === item.subjId);
    if (!subj) continue;

    for (const chap of subj.chapters) {
      const top = chap.topics.find(t => t.id === item.topId);
      if (!top) continue;

      const completionDate = addDays(todayStr, -item.daysAgo);
      top.status = 'completed';
      top.confidence = item.conf as any;
      top.completedAt = `${completionDate}T10:30:00.000Z`;
      top.revisionCount = item.revisions;

      // Add completion log
      activityLogs.push({
        id: `demo-log-comp-${top.id}`,
        date: completionDate,
        topicId: top.id,
        topicName: top.name,
        subjectId: subj.id,
        subjectName: subj.name,
        type: 'topic_completed',
        timestamp: `${completionDate}T10:30:00.000Z`,
        confidence: item.conf as any
      });

      // If it was revised, add revisions and set nextRevisionAt
      if (item.revisions > 0) {
        // Last revision 1-3 days after completion
        const lastRevDaysAgo = Math.max(0, item.daysAgo - (item.revisions * 3));
        const lastRevDate = addDays(todayStr, -lastRevDaysAgo);
        top.lastRevisedAt = `${lastRevDate}T14:00:00.000Z`;

        activityLogs.push({
          id: `demo-log-rev-${top.id}`,
          date: lastRevDate,
          topicId: top.id,
          topicName: top.name,
          subjectId: subj.id,
          subjectName: subj.name,
          type: 'revision_completed',
          timestamp: `${lastRevDate}T14:00:00.000Z`,
          confidence: item.conf as any
        });

        // Set nextRevisionAt: some overdue, some due today, some upcoming
        if (top.id === 'dsa-top-10' || top.id === 'os-top-8') {
          // overdue by 2 days
          top.nextRevisionAt = addDays(todayStr, -2);
        } else if (top.id === 'os-top-12' || top.id === 'dsa-top-8') {
          // due today!
          top.nextRevisionAt = todayStr;
        } else {
          // upcoming in 2-5 days
          top.nextRevisionAt = addDays(todayStr, 3);
        }
      } else {
        // Newly completed: schedule 1st revision
        if (item.daysAgo > 2) {
          // overdue revision
          top.nextRevisionAt = addDays(completionDate, 1);
        } else {
          // due today or tomorrow
          top.nextRevisionAt = addDays(completionDate, 1);
        }
      }
    }
  }

  // Also fill in scattered consecutive days over the past 14 days so streak calculation gets 14+ days!
  for (let i = 0; i <= 14; i++) {
    const dateStr = addDays(todayStr, -i);
    const existingOnDate = activityLogs.some(l => l.date === dateStr);
    if (!existingOnDate) {
      activityLogs.push({
        id: `demo-fill-${i}`,
        date: dateStr,
        topicId: 'dsa-top-1',
        topicName: 'Asymptotic Notations',
        subjectId: 'dsa',
        subjectName: 'Data Structures and Algorithms',
        type: 'revision_completed',
        timestamp: `${dateStr}T18:00:00.000Z`,
        confidence: 'good'
      });
    }
  }

  return { subjects, activityLogs };
}
