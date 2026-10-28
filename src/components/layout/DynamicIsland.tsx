import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { daysUntilExam } from '../../utils/date';
import {
  Flame,
  CheckCircle2,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  ChevronDown,
  X
} from 'lucide-react';
import { FlatTopicWithSubject } from '../../utils/revision';

export const DynamicIsland: React.FC = () => {
  const {
    streakStats,
    settings,
    todayTasksCount,
    islandNotification,
    clearIslandNotification,
    flatTopics,
    completeRevision,
    subjects
  } = useApp();

  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveIslandTab] = useState<'timer' | 'nextUp' | 'streak'>('timer');

  // Study Session Stopwatch (clean live session)
  const [sessionSeconds, setSessionSeconds] = useState(0);
  const [isStudying, setIsStudying] = useState(false);

  // Default to Operating Systems as shown in reference UI
  const activeSubject = subjects.find(s => s.code === 'OS') || subjects[1];

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    if (isStudying) {
      interval = setInterval(() => {
        setSessionSeconds(prev => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isStudying]);

  const toggleStudyTimer = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsStudying(prev => !prev);
  };

  const formatTimerHMS = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const daysLeft = daysUntilExam(settings.examDate);

  // Next up topic for revision
  const nextUpTopic = flatTopics.find(
    (t: FlatTopicWithSubject) => t.topic.nextRevisionAt !== null && t.topic.status === 'completed'
  );

  const isNotificationMode = Boolean(islandNotification);

  return (
    <div
      className="fixed top-2.5 left-1/2 -translate-x-1/2 z-50 transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)]"
      style={{ perspective: 1000 }}
    >
      {/* 1. NOTIFICATION MORPH STATE */}
      {isNotificationMode && islandNotification ? (
        <div
          onClick={() => clearIslandNotification()}
          className="bg-black/95 text-white border border-white/15 shadow-[0_16px_40px_rgba(0,0,0,0.4)] rounded-full px-5 py-2.5 flex items-center gap-3.5 cursor-pointer animate-island-pop backdrop-blur-2xl"
        >
          <div className="w-6 h-6 rounded-full bg-[#486B2C]/20 text-[#5EA32B] border border-[#486B2C]/30 flex items-center justify-center shrink-0">
            {islandNotification.type === 'milestone' ? (
              <Sparkles className="w-3.5 h-3.5 text-[#C68A2C]" />
            ) : islandNotification.type === 'revision' ? (
              <RotateCcw className="w-3.5 h-3.5 text-[#C68A2C]" />
            ) : (
              <CheckCircle2 className="w-3.5 h-3.5 text-[#5EA32B]" />
            )}
          </div>
          <div className="text-left pr-2">
            <div className="text-xs font-bold tracking-tight text-white flex items-center gap-1.5">
              <span>{islandNotification.title}</span>
              <span className="text-[10px] font-normal text-stone-400">now</span>
            </div>
            {islandNotification.subtitle && (
              <div className="text-[11px] text-stone-300 truncate max-w-xs">
                {islandNotification.subtitle}
              </div>
            )}
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              clearIslandNotification();
            }}
            className="text-stone-400 hover:text-white p-0.5 rounded-full"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : isExpanded ? (
        /* 2. EXPANDED DYNAMIC ISLAND DRAWER */
        <div className="bg-black/95 text-white border border-white/15 shadow-[0_24px_60px_rgba(0,0,0,0.5)] rounded-[32px] p-5 w-[92vw] max-w-[460px] animate-island-pop backdrop-blur-2xl space-y-4">
          {/* Island Header Row */}
          <div className="flex items-center justify-between border-b border-stone-800/80 pb-3">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#5EA32B] shadow-[0_0_8px_#5EA32B] animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-wider text-stone-300">
                Studying {activeSubject?.name || 'GATE Computer Science'}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setIsExpanded(false)}
                className="p-1 rounded-full text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
                title="Collapse Island"
              >
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Island Tabs Switcher */}
          <div className="flex items-center justify-around bg-stone-900/80 p-1 rounded-full text-xs font-semibold border border-stone-800">
            <button
              onClick={() => setActiveIslandTab('timer')}
              className={`flex-1 py-1 rounded-full transition-all ${
                activeTab === 'timer'
                  ? 'bg-stone-800 text-white shadow-sm'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              Session Focus
            </button>
            <button
              onClick={() => setActiveIslandTab('nextUp')}
              className={`flex-1 py-1 rounded-full transition-all ${
                activeTab === 'nextUp'
                  ? 'bg-stone-800 text-white shadow-sm'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              Next Up
            </button>
            <button
              onClick={() => setActiveIslandTab('streak')}
              className={`flex-1 py-1 rounded-full transition-all ${
                activeTab === 'streak'
                  ? 'bg-stone-800 text-white shadow-sm'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              Goal & Streak
            </button>
          </div>

          {/* TAB 1: Focus Stopwatch Timer */}
          {activeTab === 'timer' && (
            <div className="space-y-3 py-1 text-center">
              <div className="text-4xl font-extrabold tracking-tight font-mono text-white">
                {formatTimerHMS(sessionSeconds)}
              </div>
              <p className="text-[11px] text-stone-400">
                Active study duration • {activeSubject?.name || 'Operating Systems'}
              </p>
              <div className="flex items-center justify-center gap-3 pt-1">
                <button
                  onClick={toggleStudyTimer}
                  className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                    isStudying
                      ? 'bg-[#C68A2C] hover:bg-[#BA7E26] text-white'
                      : 'bg-[#486B2C] hover:bg-[#385522] text-white shadow-lg shadow-[#486B2C]/20'
                  }`}
                >
                  {isStudying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-white" />}
                  <span>{isStudying ? 'Pause Focus' : 'Resume Focus'}</span>
                </button>
                <button
                  onClick={() => setSessionSeconds(0)}
                  className="px-3 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-semibold transition-colors flex items-center gap-1"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: Next Up Card */}
          {activeTab === 'nextUp' && (
            <div className="space-y-3 py-1">
              {nextUpTopic ? (
                <div className="p-3.5 rounded-2xl bg-stone-900 border border-stone-800 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono text-[#5EA32B] font-bold">
                      {nextUpTopic.subjectCode}
                    </span>
                    <span className="text-[10px] text-stone-400">
                      Rev #{nextUpTopic.topic.revisionCount + 1}
                    </span>
                  </div>
                  <div className="font-bold text-sm text-white">
                    {nextUpTopic.topic.name}
                  </div>
                  <div className="text-[11px] text-stone-400">
                    {nextUpTopic.chapterName}
                  </div>
                  <button
                    onClick={() => {
                      completeRevision(
                        nextUpTopic.subjectId,
                        nextUpTopic.chapterId,
                        nextUpTopic.topic.id,
                        nextUpTopic.topic.confidence
                      );
                      setIsExpanded(false);
                    }}
                    className="w-full mt-2 py-1.5 rounded-xl bg-[#486B2C] hover:bg-[#385522] text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Mark Revised (+40 XP)</span>
                  </button>
                </div>
              ) : (
                <div className="py-4 text-center text-xs text-stone-400">
                  🎉 All scheduled revisions for today are complete!
                </div>
              )}
            </div>
          )}

          {/* TAB 3: Goal & Streak */}
          {activeTab === 'streak' && (
            <div className="space-y-3 py-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-stone-300 font-medium">Daily Target</span>
                <span className="font-bold text-[#5EA32B]">
                  {todayTasksCount} / {settings.dailyGoal} Tasks
                </span>
              </div>
              <div className="w-full h-2 bg-stone-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#C68A2C] to-[#486B2C] rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, Math.round((todayTasksCount / settings.dailyGoal) * 100))}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-xs text-stone-400 pt-1">
                <span className="flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5 text-[#C68A2C] fill-[#C68A2C]" />
                  Streak: <strong className="text-white">{streakStats.currentStreak}d</strong>
                </span>
                <span>
                  Exam: <strong className="text-white">{daysLeft}d left</strong>
                </span>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* 3. COMPACT PILL STATE — EXACT REPLICA OF THE IMAGE */
        <div
          onClick={() => setIsExpanded(true)}
          className="group bg-[#0E140B] text-white border border-[#2B3B20]/40 shadow-[0_12px_36px_rgba(15,22,11,0.35)] rounded-full px-3.5 py-1.5 flex items-center gap-4 cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 select-none"
          title="Click to expand Focus Activity"
        >
          {/* Glowing Sap Green Activity Dot */}
          <div className="flex items-center justify-center pl-0.5">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#5EA32B] opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#5EA32B] shadow-[0_0_8px_#5EA32B]" />
            </span>
          </div>

          {/* Current Activity Label */}
          <div className="flex flex-col text-left leading-tight pr-1">
            <span className="text-[10px] text-stone-400 font-medium tracking-wide">
              Studying
            </span>
            <span className="text-xs font-bold text-white tracking-tight">
              {activeSubject?.name || 'Operating Systems'}
            </span>
          </div>

          {/* Live Digital Timer */}
          <div className="font-mono text-xs font-medium text-white/95 tracking-wider px-1">
            {formatTimerHMS(sessionSeconds)}
          </div>

          {/* Pause / Play Action Button in Sap Green Tone */}
          <button
            onClick={toggleStudyTimer}
            className="w-7 h-7 rounded-full bg-[#1F2C17] hover:bg-[#2C3E20] text-white flex items-center justify-center transition-transform active:scale-90"
            title={isStudying ? 'Pause Study Session' : 'Resume Study Session'}
          >
            {isStudying ? (
              <Pause className="w-3.5 h-3.5 fill-white text-white" />
            ) : (
              <Play className="w-3.5 h-3.5 fill-white text-white ml-0.5" />
            )}
          </button>
        </div>
      )}
    </div>
  );
};
