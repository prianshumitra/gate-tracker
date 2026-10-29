import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { daysUntilExam } from '../../utils/date';
import {
  Clock,
  Timer,
  Play,
  Pause,
  RotateCcw,
  Flag,
  ChevronDown,
  X,
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import { playFanfareSound, playCheckSound } from '../../utils/sound';

export const DynamicIsland: React.FC = () => {
  const {
    streakStats,
    settings,
    islandNotification,
    clearIslandNotification,
    subjects,
    triggerIslandNotification
  } = useApp();

  const islandRef = useRef<HTMLDivElement>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeMenuTab, setActiveMenuTab] = useState<'clock' | 'timer' | 'stopwatch'>('clock');

  // --- 1. LIVE DIGITAL CLOCK (24-Hour) ---
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [colonVisible, setColonVisible] = useState(true);

  useEffect(() => {
    const clockInterval = setInterval(() => {
      const now = new Date();
      setCurrentTime(now);
      setColonVisible(now.getSeconds() % 2 === 0);
    }, 500);

    return () => clearInterval(clockInterval);
  }, []);

  const hours24 = String(currentTime.getHours()).padStart(2, '0');
  const minutes = String(currentTime.getMinutes()).padStart(2, '0');
  const seconds = String(currentTime.getSeconds()).padStart(2, '0');

  const formattedDate = currentTime.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  });

  // --- COLLAPSE ON CLICK OUTSIDE ---
  useEffect(() => {
    if (!isExpanded) return;

    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (islandRef.current && !islandRef.current.contains(event.target as Node)) {
        setIsExpanded(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsExpanded(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isExpanded]);

  // --- 2. COUNTDOWN TIMER (Pomodoro / Focus) ---
  const [timerInitialSeconds, setTimerInitialSeconds] = useState(25 * 60); // default 25m
  const [timerRemainingSeconds, setTimerRemainingSeconds] = useState(25 * 60);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const timerAudioPlayedRef = useRef(false);

  useEffect(() => {
    let timerInterval: ReturnType<typeof setInterval> | null = null;
    if (isTimerRunning) {
      timerInterval = setInterval(() => {
        setTimerRemainingSeconds(prev => {
          if (prev <= 1) {
            setIsTimerRunning(false);
            if (!timerAudioPlayedRef.current) {
              timerAudioPlayedRef.current = true;
              playFanfareSound(settings.soundEnabled);
              triggerIslandNotification({
                title: 'Timer Completed! ⏰',
                subtitle: 'Great study session! Take a well-deserved break.',
                type: 'milestone'
              });
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerInterval) clearInterval(timerInterval);
    };
  }, [isTimerRunning, settings.soundEnabled, triggerIslandNotification]);

  const setTimerPreset = (mins: number) => {
    const totalSecs = mins * 60;
    setTimerInitialSeconds(totalSecs);
    setTimerRemainingSeconds(totalSecs);
    setIsTimerRunning(false);
    timerAudioPlayedRef.current = false;
    playCheckSound(settings.soundEnabled);
  };

  const toggleTimer = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (timerRemainingSeconds === 0) {
      setTimerRemainingSeconds(timerInitialSeconds);
      timerAudioPlayedRef.current = false;
    }
    setIsTimerRunning(prev => !prev);
    playCheckSound(settings.soundEnabled);
  };

  const resetTimer = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setIsTimerRunning(false);
    setTimerRemainingSeconds(timerInitialSeconds);
    timerAudioPlayedRef.current = false;
    playCheckSound(settings.soundEnabled);
  };

  // --- 3. COUNT-UP STOPWATCH (Live Session) ---
  const [stopwatchSeconds, setStopwatchSeconds] = useState(0);
  const [isStopwatchRunning, setIsStopwatchRunning] = useState(false);
  const [stopwatchLaps, setStopwatchLaps] = useState<number[]>([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('os');

  useEffect(() => {
    let swInterval: ReturnType<typeof setInterval> | null = null;
    if (isStopwatchRunning) {
      swInterval = setInterval(() => {
        setStopwatchSeconds(prev => prev + 1);
      }, 1000);
    }
    return () => {
      if (swInterval) clearInterval(swInterval);
    };
  }, [isStopwatchRunning]);

  const toggleStopwatch = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setIsStopwatchRunning(prev => !prev);
    playCheckSound(settings.soundEnabled);
  };

  const resetStopwatch = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setIsStopwatchRunning(false);
    setStopwatchSeconds(0);
    setStopwatchLaps([]);
    playCheckSound(settings.soundEnabled);
  };

  const addStopwatchLap = () => {
    if (!isStopwatchRunning) return;
    setStopwatchLaps(prev => [stopwatchSeconds, ...prev]);
    playCheckSound(settings.soundEnabled);
  };

  // Helper formatting for MM:SS and HH:MM:SS
  const formatTimeMS = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const formatTimeHMS = (totalSecs: number) => {
    const hrs = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;
    return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const daysLeft = daysUntilExam(settings.examDate);
  const selectedSubject = subjects.find(s => s.id === selectedSubjectId) || subjects[1];
  const timerProgress = timerInitialSeconds > 0 ? (timerRemainingSeconds / timerInitialSeconds) * 100 : 0;

  const isNotificationMode = Boolean(islandNotification);

  return (
    <>
      {/* Click-outside backdrop overlay for expanded view */}
      {isExpanded && !isNotificationMode && (
        <div
          onClick={() => setIsExpanded(false)}
          className="fixed inset-0 z-40 bg-black/25 backdrop-blur-[2px] transition-opacity animate-in fade-in duration-200 cursor-pointer"
          aria-label="Close dynamic island menu"
        />
      )}

      <div
        ref={islandRef}
        className="fixed top-2.5 left-1/2 -translate-x-1/2 z-50 transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] select-none"
        style={{ perspective: 1000 }}
      >
        {/* 1. NOTIFICATION MORPH STATE */}
        {isNotificationMode && islandNotification ? (
          <div
            onClick={() => clearIslandNotification()}
            className="bg-black/95 text-white border border-white/15 shadow-[0_16px_40px_rgba(0,0,0,0.4)] rounded-full px-6 py-3 flex items-center gap-4 cursor-pointer animate-island-pop backdrop-blur-2xl min-w-[280px]"
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
            <div className="text-left pr-2 flex-1 min-w-0">
              <div className="text-xs font-bold tracking-tight text-white flex items-center gap-1.5">
                <span>{islandNotification.title}</span>
                <span className="text-[10px] font-normal text-stone-400">now</span>
              </div>
              {islandNotification.subtitle && (
                <div className="text-[11px] text-stone-300 truncate">
                  {islandNotification.subtitle}
                </div>
              )}
            </div>
            <button
              onClick={e => {
                e.stopPropagation();
                clearIslandNotification();
              }}
              className="text-stone-400 hover:text-white p-1 rounded-full hover:bg-white/10"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : isExpanded ? (
          /* 2. EXPANDED MENU: CLOCK, TIMER & STOPWATCH (INCREASED WIDTH) */
          <div className="bg-[#0A0F0D]/95 text-white border border-white/15 shadow-[0_28px_70px_rgba(0,0,0,0.6)] rounded-[32px] sm:rounded-[36px] p-6 sm:p-7 w-[94vw] max-w-[620px] sm:max-w-[640px] animate-island-pop backdrop-blur-3xl space-y-5">
          {/* Top Header Row with Close Button */}
          <div className="flex items-center justify-between border-b border-stone-800/80 pb-3.5">
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#5EA32B] shadow-[0_0_10px_#5EA32B] animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-wider text-stone-300 font-mono">
                {activeMenuTab === 'clock'
                  ? 'Digital Clock & Schedule'
                  : activeMenuTab === 'timer'
                  ? 'Countdown Focus Timer'
                  : 'Session Stopwatch'}
              </span>
            </div>
            <button
              onClick={() => setIsExpanded(false)}
              className="p-1.5 rounded-full text-stone-400 hover:text-white hover:bg-stone-800 transition-colors cursor-pointer"
              title="Collapse to 24h Clock"
            >
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>

          {/* Expanded Menu Tab Switcher (Clock | Timer | Stopwatch) */}
          <div className="flex items-center justify-around bg-stone-900/90 p-1.5 rounded-2xl text-xs font-semibold border border-stone-800">
            <button
              onClick={() => setActiveMenuTab('clock')}
              className={`flex-1 py-2 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer ${
                activeMenuTab === 'clock'
                  ? 'bg-stone-800 text-white shadow-sm font-bold'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              <Clock className="w-4 h-4 text-[#5EA32B]" />
              <span>Clock</span>
            </button>
            <button
              onClick={() => setActiveMenuTab('timer')}
              className={`flex-1 py-2 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer ${
                activeMenuTab === 'timer'
                  ? 'bg-stone-800 text-white shadow-sm font-bold'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              <Timer className="w-4 h-4 text-[#C68A2C]" />
              <span>Timer</span>
              {isTimerRunning && (
                <span className="w-2 h-2 rounded-full bg-[#C68A2C] animate-pulse" />
              )}
            </button>
            <button
              onClick={() => setActiveMenuTab('stopwatch')}
              className={`flex-1 py-2 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer ${
                activeMenuTab === 'stopwatch'
                  ? 'bg-stone-800 text-white shadow-sm font-bold'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              <RotateCcw className="w-4 h-4 text-[#5EA32B]" />
              <span>Stopwatch</span>
              {isStopwatchRunning && (
                <span className="w-2 h-2 rounded-full bg-[#5EA32B] animate-pulse" />
              )}
            </button>
          </div>

          {/* TAB 1: 24-HOUR DIGITAL CLOCK MENU */}
          {activeMenuTab === 'clock' && (
            <div className="space-y-4 py-2 text-center">
              {/* Big 24h Digital Time */}
              <div className="py-3 px-4 rounded-2xl bg-stone-900/40 border border-stone-800/60">
                <div className="text-6xl sm:text-7xl font-black tracking-widest font-mono text-white flex items-center justify-center">
                  <span>{hours24}</span>
                  <span
                    className={`transition-opacity duration-200 mx-1.5 ${
                      colonVisible ? 'opacity-100 text-[#5EA32B]' : 'opacity-15 text-stone-600'
                    }`}
                  >
                    :
                  </span>
                  <span>{minutes}</span>
                  <span
                    className={`transition-opacity duration-200 mx-1.5 ${
                      colonVisible ? 'opacity-100 text-[#5EA32B]' : 'opacity-15 text-stone-600'
                    }`}
                  >
                    :
                  </span>
                  <span className="text-4xl sm:text-5xl text-stone-400 font-semibold">{seconds}</span>
                </div>
                <p className="text-xs text-stone-400 font-medium mt-2">
                  {formattedDate} • 24-Hour Digital Clock
                </p>
              </div>

              {/* Quick Status Pill Bar */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-2xl bg-stone-900/70 border border-stone-800 flex items-center justify-between">
                  <span className="text-stone-400">GATE Target</span>
                  <span className="font-bold text-[#C68A2C] font-mono text-sm">{daysLeft}d left</span>
                </div>
                <div className="p-3 rounded-2xl bg-stone-900/70 border border-stone-800 flex items-center justify-between">
                  <span className="text-stone-400">Study Streak</span>
                  <span className="font-bold text-[#5EA32B] font-mono text-sm">
                    {streakStats.currentStreak} Days 🔥
                  </span>
                </div>
              </div>

              {/* Quick Launch Buttons into Timer or Stopwatch */}
              <div className="flex items-center gap-2.5 pt-1">
                <button
                  onClick={() => setActiveMenuTab('timer')}
                  className="flex-1 py-2.5 px-3 rounded-xl bg-stone-900 hover:bg-stone-800 border border-stone-800 text-xs font-semibold text-stone-300 transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Timer className="w-4 h-4 text-[#C68A2C]" />
                  <span>Start 25m Focus</span>
                </button>
                <button
                  onClick={() => setActiveMenuTab('stopwatch')}
                  className="flex-1 py-2.5 px-3 rounded-xl bg-stone-900 hover:bg-stone-800 border border-stone-800 text-xs font-semibold text-stone-300 transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Play className="w-4 h-4 text-[#5EA32B]" />
                  <span>Open Stopwatch</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: TIMER MENU (Countdown) */}
          {activeMenuTab === 'timer' && (
            <div className="space-y-5 py-1 text-center">
              {/* Preset Buttons */}
              <div className="flex items-center justify-center gap-2 flex-wrap">
                {[
                  { label: '15m', mins: 15 },
                  { label: '25m Focus', mins: 25 },
                  { label: '45m Deep Work', mins: 45 },
                  { label: '60m Mock Test', mins: 60 },
                  { label: '5m Quick Rest', mins: 5 }
                ].map(p => (
                  <button
                    key={p.label}
                    onClick={() => setTimerPreset(p.mins)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                      timerInitialSeconds === p.mins * 60
                        ? 'bg-[#C68A2C] border-[#C68A2C] text-white shadow-xs'
                        : 'bg-stone-900/80 border-stone-800 text-stone-400 hover:text-white hover:bg-stone-800'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>

              {/* Countdown Display */}
              <div className="py-2">
                <div className="text-6xl font-black font-mono tracking-widest text-white">
                  {formatTimeMS(timerRemainingSeconds)}
                </div>
                <div className="w-full h-2 bg-stone-800 rounded-full overflow-hidden mt-3 max-w-sm mx-auto">
                  <div
                    className="h-full bg-gradient-to-r from-[#486B2C] to-[#C68A2C] transition-all duration-500 rounded-full"
                    style={{ width: `${timerProgress}%` }}
                  />
                </div>
                <p className="text-xs text-stone-400 mt-2">
                  {isTimerRunning ? 'Countdown in progress...' : 'Ready to start focus session'}
                </p>
              </div>

              {/* Timer Controls */}
              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={toggleTimer}
                  className={`px-7 py-3 rounded-2xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-lg ${
                    isTimerRunning
                      ? 'bg-[#C68A2C] hover:bg-[#BA7E26] text-white'
                      : 'bg-[#486B2C] hover:bg-[#385522] text-white shadow-[#486B2C]/20'
                  }`}
                >
                  {isTimerRunning ? (
                    <Pause className="w-4 h-4 fill-white" />
                  ) : (
                    <Play className="w-4 h-4 fill-white" />
                  )}
                  <span>{isTimerRunning ? 'Pause Session' : 'Start Focus Timer'}</span>
                </button>
                <button
                  onClick={resetTimer}
                  className="px-5 py-3 rounded-2xl bg-stone-900 hover:bg-stone-800 border border-stone-800 text-stone-300 text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Reset</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: STOPWATCH MENU (Count-up & Laps) */}
          {activeMenuTab === 'stopwatch' && (
            <div className="space-y-4 py-1 text-center">
              {/* Subject Tag Selector */}
              <div className="flex items-center justify-between text-xs px-2 py-1.5 rounded-xl bg-stone-900/60 border border-stone-800">
                <span className="text-stone-400 font-medium">Tag Study Subject:</span>
                <select
                  value={selectedSubjectId}
                  onChange={e => setSelectedSubjectId(e.target.value)}
                  className="bg-stone-800 text-stone-200 border border-stone-700 rounded-lg px-2.5 py-1 text-xs outline-none cursor-pointer"
                >
                  {subjects.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.code})
                    </option>
                  ))}
                </select>
              </div>

              {/* Stopwatch Time Display */}
              <div className="py-2">
                <div className="text-6xl font-black font-mono tracking-widest text-white">
                  {formatTimeHMS(stopwatchSeconds)}
                </div>
                <p className="text-xs text-stone-400 mt-2">
                  Active study session • <strong className="text-stone-200">{selectedSubject.name}</strong>
                </p>
              </div>

              {/* Stopwatch Action Controls */}
              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={toggleStopwatch}
                  className={`px-6 py-3 rounded-2xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-lg ${
                    isStopwatchRunning
                      ? 'bg-[#C68A2C] hover:bg-[#BA7E26] text-white'
                      : 'bg-[#486B2C] hover:bg-[#385522] text-white shadow-[#486B2C]/20'
                  }`}
                >
                  {isStopwatchRunning ? (
                    <Pause className="w-4 h-4 fill-white" />
                  ) : (
                    <Play className="w-4 h-4 fill-white" />
                  )}
                  <span>{isStopwatchRunning ? 'Pause' : 'Start Stopwatch'}</span>
                </button>

                <button
                  onClick={addStopwatchLap}
                  disabled={!isStopwatchRunning}
                  className="px-4 py-3 rounded-2xl bg-stone-900 disabled:opacity-40 hover:bg-stone-800 border border-stone-800 text-stone-300 text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Flag className="w-4 h-4" />
                  <span>Lap</span>
                </button>

                <button
                  onClick={resetStopwatch}
                  className="px-4 py-3 rounded-2xl bg-stone-900 hover:bg-stone-800 border border-stone-800 text-stone-300 text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Reset</span>
                </button>
              </div>

              {/* Laps List */}
              {stopwatchLaps.length > 0 && (
                <div className="max-h-28 overflow-y-auto space-y-1.5 pt-2 pr-1 border-t border-stone-800">
                  {stopwatchLaps.map((lapSecs, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between text-xs px-3 py-1.5 rounded-xl bg-stone-900/80 border border-stone-800/80 font-mono"
                    >
                      <span className="text-stone-400">Lap {stopwatchLaps.length - idx}</span>
                      <span className="text-white font-bold">{formatTimeHMS(lapSecs)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        /* 3. COMPACT PILL STATE: GENEROUS & BALANCED WIDTH */
        <div
          onClick={() => setIsExpanded(true)}
          className="group bg-[#0A0F0D]/95 hover:bg-[#111A15] text-white border border-[#2B3B20]/70 shadow-[0_16px_40px_rgba(0,0,0,0.55)] rounded-full min-w-[320px] sm:min-w-[380px] md:min-w-[420px] px-7 py-2.5 sm:py-3 flex items-center justify-between cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
          title="Click to open Clock, Countdown Timer & Stopwatch Menu"
        >
          {/* Left: Glowing Status Indicator + Subtle Mode Tag */}
          <div className="flex items-center gap-2.5">
            {isTimerRunning || isStopwatchRunning ? (
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#5EA32B] opacity-80" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#5EA32B] shadow-[0_0_10px_#5EA32B]" />
              </span>
            ) : (
              <span className="w-2.5 h-2.5 rounded-full bg-[#486B2C] shadow-[0_0_8px_#486B2C]" />
            )}
            <span className="text-[10px] sm:text-[11px] font-mono font-semibold tracking-wider text-stone-400 group-hover:text-stone-300 transition-colors uppercase">
              {isTimerRunning ? 'TIMER' : isStopwatchRunning ? 'STOPWATCH' : 'GATE 24H'}
            </span>
          </div>

          {/* Center: 24-HOUR DIGITAL CLOCK WITH 1-SECOND BLINKING COLON (e.g. 18 : 24) */}
          <div className="flex items-center justify-center font-mono text-base sm:text-lg font-bold tracking-[0.25em] text-white leading-none pl-1">
            <span>{hours24}</span>
            <span
              className={`inline-block mx-1.5 transition-opacity duration-150 ${
                colonVisible ? 'opacity-100 text-[#5EA32B]' : 'opacity-10 text-stone-600'
              }`}
            >
              :
            </span>
            <span>{minutes}</span>
          </div>

          {/* Right: Active Timer/Stopwatch badge or Day hint & animated chevron */}
          <div className="flex items-center justify-end">
            {isTimerRunning ? (
              <div className="flex items-center gap-1.5 text-xs font-mono text-[#C68A2C] font-semibold bg-[#C68A2C]/15 px-2.5 py-0.5 rounded-full border border-[#C68A2C]/30">
                <Timer className="w-3.5 h-3.5 animate-pulse" />
                <span>{formatTimeMS(timerRemainingSeconds)}</span>
              </div>
            ) : isStopwatchRunning ? (
              <div className="flex items-center gap-1.5 text-xs font-mono text-[#5EA32B] font-semibold bg-[#5EA32B]/15 px-2.5 py-0.5 rounded-full border border-[#5EA32B]/30">
                <RotateCcw className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '3s' }} />
                <span>{formatTimeHMS(stopwatchSeconds)}</span>
              </div>
            ) : (
              <div className="text-[10px] sm:text-xs text-stone-400 group-hover:text-white transition-colors flex items-center gap-1.5 font-mono">
                <span>{formattedDate.split(',')[0]}</span>
                <ChevronDown className="w-3.5 h-3.5 text-stone-500 group-hover:text-[#5EA32B] transition-transform group-hover:translate-y-0.5" />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  </>
);
};
