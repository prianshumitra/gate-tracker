import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { RevisionFilterType, filterRevisionTopics, getRevisionCounts, FlatTopicWithSubject } from '../utils/revision';
import { getLocalDateString, formatHumanDate, formatRelativeDate } from '../utils/date';
import { ConfidenceLevel } from '../types';
import {
  CheckCircle2,
  Clock,
  BookOpen
} from 'lucide-react';

export const RevisionQueueView: React.FC = () => {
  const {
    flatTopics,
    completeRevision,
    postponeRevision,
    setSelectedSubjectId,
    setActiveTab,
    settings
  } = useApp();

  const [activeFilter, setActiveFilter] = useState<RevisionFilterType>('due_today');
  const [selectedConfidence, setSelectedConfidence] = useState<Record<string, ConfidenceLevel>>({});

  const todayStr = getLocalDateString();
  const counts = getRevisionCounts(flatTopics, todayStr);
  const filteredTopics = filterRevisionTopics(flatTopics, activeFilter, todayStr);

  const filterTabs: { id: RevisionFilterType; label: string; count: number; color?: string }[] = [
    { id: 'due_today', label: 'Due Today', count: counts.dueToday },
    { id: 'overdue', label: 'Overdue Backlog', count: counts.overdue },
    { id: 'due_this_week', label: 'Next 7 Days', count: counts.dueThisWeek },
    { id: 'never_revised', label: 'Never Revised', count: counts.neverRevised },
    { id: 'weak', label: 'Weak Topics', count: counts.weakTopics },
    { id: 'all', label: 'All Active', count: counts.totalActive }
  ];

  const handleMarkRevisionDone = (item: FlatTopicWithSubject) => {
    const conf = selectedConfidence[item.topic.id] || item.topic.confidence;
    completeRevision(item.subjectId, item.chapterId, item.topic.id, conf);
  };

  const handlePostpone = (item: FlatTopicWithSubject, days: number) => {
    postponeRevision(item.subjectId, item.chapterId, item.topic.id, days);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Header Matching Dashboard View */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs text-stone-500 font-medium block">
            SPACED REPETITION QUEUE
          </span>
          <h2 className="text-2xl lg:text-3xl font-extrabold text-stone-900 tracking-tight flex items-center gap-2 mt-0.5">
            <span>Revision Queue</span>
            <span className="text-xl">🔄</span>
          </h2>
          <p className="text-xs text-stone-500 font-normal mt-0.5">
            Scientific spaced repetition intervals: {settings.revisionIntervals.join('d → ')}d
          </p>
        </div>

        {counts.dueToday + counts.overdue > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold px-3.5 py-1.5 rounded-full bg-[#FDF6E5] text-[#8E5B13] border border-[#EEDDB8] shadow-2xs">
              {counts.dueToday + counts.overdue} topics pending action
            </span>
          </div>
        )}
      </div>

      {/* Filter Tabs Navigation */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {filterTabs.map(tab => {
          const isActive = activeFilter === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
                isActive
                  ? 'bg-[#486B2C] border-[#486B2C] text-white shadow-xs'
                  : 'bg-white border-[#EDE4D0] text-stone-600 hover:text-stone-900 hover:bg-[#FAF7F0] shadow-2xs'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                  isActive ? 'bg-[#385522] text-white' : 'bg-[#FAF7F0] border border-[#EDE4D0] text-stone-700'
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Content List */}
      <div className="space-y-4">
        {filteredTopics.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-white border border-[#EDE4D0] shadow-[0_2px_12px_rgba(60,50,30,0.02)] space-y-3">
            <div className="w-12 h-12 rounded-full bg-[#EAF2E4] text-[#486B2C] flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-stone-900 text-base font-serif">Nothing in this filter!</h3>
            <p className="text-xs text-stone-500 max-w-md mx-auto">
              {activeFilter === 'overdue'
                ? 'Excellent work! No overdue revisions in your backlog.'
                : activeFilter === 'due_today'
                ? 'All scheduled revisions for today are complete. Keep up the consistency!'
                : 'No topics match the selected filter criterion.'}
            </p>
          </div>
        ) : (
          filteredTopics.map((item: FlatTopicWithSubject) => {
            const isOverdue = Boolean(item.topic.nextRevisionAt && item.topic.nextRevisionAt < todayStr);
            const currentConf = selectedConfidence[item.topic.id] || item.topic.confidence;

            return (
              <div
                key={item.topic.id}
                className={`p-5 sm:p-6 rounded-2xl border transition-all shadow-[0_2px_12px_rgba(60,50,30,0.02)] ${
                  isOverdue
                    ? 'bg-[#FAF7F0] border-[#EEDDB8]'
                    : 'bg-white border-[#EDE4D0]'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Topic Metadata & Breadcrumb */}
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-md bg-[#FDF6E5] text-[#8E5B13] border border-[#EEDDB8]">
                        {item.subjectCode}
                      </span>
                      <span className="text-xs text-stone-500 font-medium">
                        {item.subjectName}
                      </span>
                      <span className="text-stone-300">•</span>
                      <span className="text-xs text-stone-500">
                        {item.chapterName}
                      </span>
                    </div>

                    <h3 className="font-bold text-base text-stone-900 flex items-center gap-2 font-serif">
                      {item.topic.name}
                      {isOverdue && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FBF0D3] text-[#8E5B13] border border-[#EED7A2]">
                          {formatRelativeDate(item.topic.nextRevisionAt || '')}
                        </span>
                      )}
                    </h3>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-stone-500 pt-1">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-stone-400" />
                        Revisions Completed:{' '}
                        <strong className="text-stone-900">{item.topic.revisionCount}</strong>
                      </span>
                      {item.topic.lastRevisedAt && (
                        <span>
                          Last Revised: {formatHumanDate(item.topic.lastRevisedAt.slice(0, 10))}
                        </span>
                      )}
                      {item.topic.nextRevisionAt && (
                        <span>
                          Next Scheduled: <strong className="text-stone-900">{item.topic.nextRevisionAt}</strong>
                        </span>
                      )}
                      {item.topic.notes && (
                        <span className="text-stone-600 italic truncate max-w-sm">
                          Notes: {item.topic.notes}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions & Confidence selector */}
                  <div className="flex flex-wrap items-center gap-2.5 pt-3 lg:pt-0 border-t lg:border-t-0 border-[#EDE4D0]">
                    {/* Rate Confidence */}
                    <div className="flex items-center gap-1 bg-[#FAF7F0] p-1 rounded-xl border border-[#EDE4D0] text-xs">
                      <span className="text-[11px] text-stone-500 px-1.5 font-medium">Confidence:</span>
                      {(['weak', 'average', 'good', 'strong'] as ConfidenceLevel[]).map(lvl => (
                        <button
                          key={lvl}
                          onClick={() =>
                            setSelectedConfidence(prev => ({
                              ...prev,
                              [item.topic.id]: lvl
                            }))
                          }
                          className={`px-2 py-1 rounded-lg capitalize transition-colors text-[11px] font-bold ${
                            currentConf === lvl
                              ? lvl === 'strong'
                                ? 'bg-[#486B2C] text-white shadow-xs'
                                : lvl === 'good'
                                ? 'bg-[#385522] text-white shadow-xs'
                                : lvl === 'average'
                                ? 'bg-[#C68A2C] text-white shadow-xs'
                                : 'bg-[#8E5B13] text-white shadow-xs'
                              : 'text-stone-600 hover:text-stone-900 hover:bg-[#F2EBDA]'
                          }`}
                        >
                          {lvl}
                        </button>
                      ))}
                    </div>

                    {/* Postpone Dropdown */}
                    <div className="flex items-center gap-1 bg-[#FAF7F0] p-1 rounded-xl border border-[#EDE4D0] text-xs">
                      <span className="text-[11px] text-stone-500 px-1 font-medium">Delay:</span>
                      <button
                        onClick={() => handlePostpone(item, 1)}
                        className="px-2 py-1 rounded-lg text-stone-700 hover:bg-[#F2EBDA] text-[11px] font-semibold transition-colors"
                        title="Postpone 1 day"
                      >
                        +1d
                      </button>
                      <button
                        onClick={() => handlePostpone(item, 3)}
                        className="px-2 py-1 rounded-lg text-stone-700 hover:bg-[#F2EBDA] text-[11px] font-semibold transition-colors"
                        title="Postpone 3 days"
                      >
                        +3d
                      </button>
                      <button
                        onClick={() => handlePostpone(item, 7)}
                        className="px-2 py-1 rounded-lg text-stone-700 hover:bg-[#F2EBDA] text-[11px] font-semibold transition-colors"
                        title="Postpone 7 days"
                      >
                        +7d
                      </button>
                    </div>

                    {/* Mark Revised Button */}
                    <button
                      onClick={() => handleMarkRevisionDone(item)}
                      className="px-4 py-2 rounded-xl bg-[#486B2C] hover:bg-[#385522] text-white font-bold text-xs flex items-center gap-1.5 shadow-xs active:scale-95 transition-all"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Complete Revision</span>
                    </button>

                    {/* Jump to subject */}
                    <button
                      onClick={() => {
                        setSelectedSubjectId(item.subjectId);
                        setActiveTab('subjects', item.subjectId);
                      }}
                      className="p-2 rounded-xl bg-[#FAF7F0] hover:bg-[#F2EBDA] text-stone-700 border border-[#EDE4D0] text-xs transition-colors"
                      title="Open Subject Checklist"
                    >
                      <BookOpen className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
