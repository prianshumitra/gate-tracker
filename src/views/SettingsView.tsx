import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { daysUntilExam, formatHumanDate } from '../utils/date';
import {
  Settings as SettingsIcon,
  Calendar,
  Volume2,
  Moon,
  Sun,
  Database,
  Download,
  Upload,
  RefreshCw,
  CheckCircle2,
  Sparkles,
  Sliders,
  Copy,
  Check,
  Flame,
  AlertTriangle,
  Play,
  RotateCcw,
  Zap,
  ShieldAlert,
  HelpCircle,
  Clock,
  Layers
} from 'lucide-react';
import {
  playCheckSound,
  playRevisionSound,
  playFanfareSound,
  playUndoSound
} from '../utils/sound';

export const SettingsView: React.FC = () => {
  const {
    settings,
    updateSettings,
    loadDemoDataAction,
    resetAllDataAction,
    exportDataJson,
    importDataJson,
    subjects,
    flatTopics,
    activityLogs,
    triggerIslandNotification
  } = useApp();

  const [intervalsText, setIntervalsText] = useState(settings.revisionIntervals.join(', '));
  const [importText, setImportText] = useState('');
  const [importStatus, setImportStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [copiedBackup, setCopiedBackup] = useState(false);
  const [activeTab, setActiveTab] = useState<'schedule' | 'spaced' | 'sensory' | 'data'>('schedule');
  const [showResetConfirmModal, setShowResetConfirmModal] = useState(false);

  const daysLeft = daysUntilExam(settings.examDate);
  const examYear = new Date(settings.examDate).getFullYear() || 2027;

  // Interval chips
  const parsedIntervals = useMemo(() => {
    return intervalsText
      .split(',')
      .map(s => parseInt(s.trim(), 10))
      .filter(n => !isNaN(n) && n > 0);
  }, [intervalsText]);

  // Handle Save
  const handleSaveSettings = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const finalIntervals = parsedIntervals.length > 0 ? parsedIntervals : [1, 3, 7, 14, 30];

    updateSettings({
      revisionIntervals: finalIntervals
    });
    setSaveSuccess(true);
    triggerIslandNotification({
      title: 'Preferences Saved ✓',
      subtitle: 'Schedule & interval settings updated',
      type: 'success'
    });
    playCheckSound(settings.soundEnabled);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  // Preset Intervals
  const applyIntervalPreset = (presetName: string, intervals: number[]) => {
    setIntervalsText(intervals.join(', '));
    updateSettings({ revisionIntervals: intervals });
    playCheckSound(settings.soundEnabled);
    triggerIslandNotification({
      title: `${presetName} Applied`,
      subtitle: `Intervals: ${intervals.join(', ')} days`,
      type: 'info'
    });
  };

  // Exam Presets
  const applyExamPreset = (presetDate: string, title: string) => {
    updateSettings({ examDate: presetDate });
    playCheckSound(settings.soundEnabled);
    triggerIslandNotification({
      title: `${title} Selected`,
      subtitle: `Target: ${presetDate}`,
      type: 'info'
    });
  };

  // Sound Testing Lab
  const testAudio = (type: 'check' | 'revision' | 'fanfare' | 'undo') => {
    if (type === 'check') playCheckSound(true);
    if (type === 'revision') playRevisionSound(true);
    if (type === 'fanfare') playFanfareSound(true);
    if (type === 'undo') playUndoSound(true);
  };

  // Export Download
  const handleExportDownload = () => {
    const data = exportDataJson();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `gate-revision-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    playCheckSound(settings.soundEnabled);
    triggerIslandNotification({
      title: 'Backup Downloaded',
      subtitle: `${(data.length / 1024).toFixed(1)} KB snapshot`,
      type: 'info'
    });
  };

  // Copy to Clipboard
  const handleCopyBackup = () => {
    const data = exportDataJson();
    navigator.clipboard.writeText(data).then(() => {
      setCopiedBackup(true);
      playCheckSound(settings.soundEnabled);
      setTimeout(() => setCopiedBackup(false), 2500);
    });
  };

  // Import Submit with Validation
  const handleImportSubmit = () => {
    if (!importText.trim()) return;
    try {
      const parsed = JSON.parse(importText);
      if (!parsed.subjects && !parsed.activityLogs) {
        setImportStatus({
          type: 'error',
          message: 'Invalid schema: Missing subjects or activityLogs in JSON.'
        });
        return;
      }
      const success = importDataJson(importText);
      if (success) {
        setImportStatus({
          type: 'success',
          message: 'Successfully restored all subjects, notes, and progress records!'
        });
        setImportText('');
        playFanfareSound(settings.soundEnabled);
      } else {
        setImportStatus({
          type: 'error',
          message: 'Could not restore backup. Please verify file integrity.'
        });
      }
    } catch {
      setImportStatus({
        type: 'error',
        message: 'JSON Syntax Error: Please ensure you pasted valid JSON text.'
      });
    }
  };

  return (
    <div className="max-w-5xl space-y-8 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#EDE4D0] dark:border-stone-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#EAF2E4] dark:bg-[#486B2C]/20 text-[#385522] dark:text-[#EAF2E4] border border-[#D3E3C9] dark:border-[#486B2C]/40">
              <span className="w-1.5 h-1.5 rounded-full bg-[#486B2C]" />
              Local-First Persistent Storage
            </span>
            <span className="text-xs text-stone-400">•</span>
            <span className="text-xs text-stone-500 font-medium">Preferences & Engine Config</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1D2417] dark:text-stone-100 tracking-tight font-serif flex items-center gap-2.5">
            <SettingsIcon className="w-6 h-6 text-[#486B2C]" />
            Settings & Study Configuration
          </h2>
          <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 mt-1 max-w-2xl">
            Configure target GATE dates, fine-tune spaced repetition intervals, manage sound synthesis, and export data backups.
          </p>
        </div>

        {/* Quick Database Stat Pill */}
        <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-white dark:bg-stone-900 border border-[#EDE4D0] dark:border-stone-800 shadow-xs text-xs self-start md:self-auto">
          <Database className="w-4 h-4 text-[#486B2C]" />
          <div>
            <div className="font-bold text-stone-900 dark:text-stone-100">
              {subjects.length} Subjects • {flatTopics.length} Topics
            </div>
            <div className="text-[10px] text-stone-500">
              {activityLogs.length} Logged Actions Synced
            </div>
          </div>
        </div>
      </div>

      {saveSuccess && (
        <div className="p-4 rounded-xl bg-[#EAF2E4] dark:bg-[#486B2C]/20 border border-[#D3E3C9] dark:border-[#486B2C]/40 text-[#385522] dark:text-[#EAF2E4] text-xs flex items-center gap-2.5 font-bold animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-[#486B2C] shrink-0" />
          <span>Configuration saved successfully and applied across all views!</span>
        </div>
      )}

      {/* Navigation Sub-Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-[#EDE4D0] dark:border-stone-800 pb-2">
        <button
          onClick={() => setActiveTab('schedule')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'schedule'
              ? 'bg-[#486B2C] text-white shadow-xs'
              : 'text-stone-600 dark:text-stone-400 hover:bg-[#F8F5EB] dark:hover:bg-stone-800'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>Exam Target & Daily Goal</span>
        </button>
        <button
          onClick={() => setActiveTab('spaced')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'spaced'
              ? 'bg-[#486B2C] text-white shadow-xs'
              : 'text-stone-600 dark:text-stone-400 hover:bg-[#F8F5EB] dark:hover:bg-stone-800'
          }`}
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Spaced Repetition Intervals</span>
        </button>
        <button
          onClick={() => setActiveTab('sensory')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'sensory'
              ? 'bg-[#486B2C] text-white shadow-xs'
              : 'text-stone-600 dark:text-stone-400 hover:bg-[#F8F5EB] dark:hover:bg-stone-800'
          }`}
        >
          <Volume2 className="w-3.5 h-3.5" />
          <span>Sensory & Theme</span>
        </button>
        <button
          onClick={() => setActiveTab('data')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'data'
              ? 'bg-[#486B2C] text-white shadow-xs'
              : 'text-stone-600 dark:text-stone-400 hover:bg-[#F8F5EB] dark:hover:bg-stone-800'
          }`}
        >
          <Database className="w-3.5 h-3.5" />
          <span>Data Vault & Backups</span>
        </button>
      </div>

      {/* Tab 1: Exam Target & Daily Goal */}
      {activeTab === 'schedule' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-stone-900 border border-[#EDE4D0] dark:border-stone-800 shadow-[0_2px_8px_rgba(40,30,20,0.03)] space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-[#EDE4D0] dark:border-stone-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-[#EAF2E4] dark:bg-[#486B2C]/20 text-[#486B2C]">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-[#1D2417] dark:text-stone-100 font-serif">
                    Target Examination Countdown
                  </h3>
                  <p className="text-xs text-stone-500">
                    Set your scheduled GATE examination date to align spaced repetition schedules
                  </p>
                </div>
              </div>

              {/* Countdown badge */}
              <div className="text-right">
                <span className="text-2xl font-black text-[#8E5B13] font-serif">
                  {daysLeft}
                </span>
                <span className="text-xs text-stone-500 block">Days Left</span>
              </div>
            </div>

            {/* Quick Presets */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-stone-600 dark:text-stone-400">
                Quick Exam Presets:
              </span>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => applyExamPreset('2027-02-06', 'GATE 2027')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                    settings.examDate === '2027-02-06'
                      ? 'bg-[#486B2C] text-white border-[#486B2C] shadow-xs'
                      : 'bg-[#FAF7F2] dark:bg-stone-800 text-stone-700 dark:text-stone-300 border-[#EDE4D0] hover:bg-[#F8F5EB]'
                  }`}
                >
                  GATE CS 2027 (Feb 6, 2027)
                </button>
                <button
                  type="button"
                  onClick={() => applyExamPreset('2028-02-05', 'GATE 2028')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                    settings.examDate === '2028-02-05'
                      ? 'bg-[#486B2C] text-white border-[#486B2C] shadow-xs'
                      : 'bg-[#FAF7F2] dark:bg-stone-800 text-stone-700 dark:text-stone-300 border-[#EDE4D0] hover:bg-[#F8F5EB]'
                  }`}
                >
                  GATE CS 2028 (Feb 5, 2028)
                </button>
              </div>
            </div>

            {/* Form Inputs Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
              <div>
                <label className="text-xs font-bold text-stone-700 dark:text-stone-300 block mb-1.5">
                  Exam Date (YYYY-MM-DD)
                </label>
                <input
                  type="date"
                  value={settings.examDate}
                  onChange={e => updateSettings({ examDate: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF7F2] dark:bg-stone-950 border border-[#EDE4D0] dark:border-stone-800 text-stone-900 dark:text-stone-100 text-xs outline-none focus:border-[#C68A2C] font-semibold"
                />
                <span className="text-[11px] text-stone-500 mt-1.5 block">
                  Target date formatted as: <strong>{formatHumanDate(settings.examDate)}</strong>
                </span>
              </div>

              <div>
                <label className="text-xs font-bold text-stone-700 dark:text-stone-300 block mb-1.5">
                  Daily Revision Velocity Goal ({settings.dailyGoal} tasks / day)
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min={1}
                    max={12}
                    value={settings.dailyGoal}
                    onChange={e => updateSettings({ dailyGoal: parseInt(e.target.value, 10) || 1 })}
                    className="flex-1 accent-[#486B2C] cursor-pointer"
                  />
                  <span className="w-10 text-center font-bold text-sm text-[#486B2C] px-2 py-1 bg-[#EAF2E4] rounded-lg">
                    {settings.dailyGoal}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-stone-500 mt-1.5">
                  <span>1 Casual</span>
                  <span className="font-semibold text-[#8E5B13]">
                    {settings.dailyGoal <= 2 ? '🌱 Gentle Pace' : settings.dailyGoal <= 5 ? '⚡ Recommended Pace' : '🔥 Aggressive Sprint'}
                  </span>
                  <span>12 Intensive</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-[#EDE4D0] dark:border-stone-800">
              <button
                type="button"
                onClick={() => handleSaveSettings()}
                className="px-5 py-2 rounded-xl bg-[#486B2C] hover:bg-[#385522] text-white font-bold text-xs shadow-xs transition-colors"
              >
                Save Schedule Preferences
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Spaced Repetition Intervals */}
      {activeTab === 'spaced' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-stone-900 border border-[#EDE4D0] dark:border-stone-800 shadow-[0_2px_8px_rgba(40,30,20,0.03)] space-y-6">
            <div className="flex items-center gap-2.5 pb-3 border-b border-[#EDE4D0] dark:border-stone-800">
              <div className="p-2 rounded-xl bg-[#FAF4E4] text-[#8E5B13]">
                <RotateCcw className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-[#1D2417] dark:text-stone-100 font-serif">
                  Spaced Repetition Algorithm & Intervals
                </h3>
                <p className="text-xs text-stone-500">
                  Controls how many days after completion each consecutive spaced repetition is scheduled
                </p>
              </div>
            </div>

            {/* Presets */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-stone-600 dark:text-stone-400">
                Choose a Scheduling Philosophy:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => applyIntervalPreset('Standard Leitner', [1, 3, 7, 14, 30])}
                  className={`p-3.5 rounded-xl border text-left transition-all ${
                    intervalsText === '1, 3, 7, 14, 30'
                      ? 'bg-[#EAF2E4] border-[#486B2C] text-[#385522] shadow-xs ring-1 ring-[#486B2C]'
                      : 'bg-[#FAF7F2] dark:bg-stone-800/60 border-[#EDE4D0] text-stone-700 dark:text-stone-300 hover:bg-[#F8F5EB]'
                  }`}
                >
                  <div className="font-bold text-xs flex items-center justify-between">
                    <span>Standard Leitner</span>
                    <span className="text-[10px] font-mono">1, 3, 7, 14, 30d</span>
                  </div>
                  <div className="text-[11px] text-stone-500 mt-1">
                    Balanced exponential curve. Ideal for steady year-long prep.
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => applyIntervalPreset('Aggressive Exam Crunch', [1, 2, 4, 7, 14])}
                  className={`p-3.5 rounded-xl border text-left transition-all ${
                    intervalsText === '1, 2, 4, 7, 14'
                      ? 'bg-[#FBF3DC] border-[#C68A2C] text-[#8E5B13] shadow-xs ring-1 ring-[#C68A2C]'
                      : 'bg-[#FAF7F2] dark:bg-stone-800/60 border-[#EDE4D0] text-stone-700 dark:text-stone-300 hover:bg-[#F8F5EB]'
                  }`}
                >
                  <div className="font-bold text-xs flex items-center justify-between">
                    <span>Exam Sprint</span>
                    <span className="text-[10px] font-mono">1, 2, 4, 7, 14d</span>
                  </div>
                  <div className="text-[11px] text-stone-500 mt-1">
                    Compressed frequency for rapid recall before GATE tests.
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => applyIntervalPreset('Long-Term Retention', [1, 7, 16, 35, 60])}
                  className={`p-3.5 rounded-xl border text-left transition-all ${
                    intervalsText === '1, 7, 16, 35, 60'
                      ? 'bg-[#EAF2E4] border-[#486B2C] text-[#385522] shadow-xs ring-1 ring-[#486B2C]'
                      : 'bg-[#FAF7F2] dark:bg-stone-800/60 border-[#EDE4D0] text-stone-700 dark:text-stone-300 hover:bg-[#F8F5EB]'
                  }`}
                >
                  <div className="font-bold text-xs flex items-center justify-between">
                    <span>Extended Memory</span>
                    <span className="text-[10px] font-mono">1, 7, 16, 35, 60d</span>
                  </div>
                  <div className="text-[11px] text-stone-500 mt-1">
                    Wider gaps designed to solidify concepts into permanent memory.
                  </div>
                </button>
              </div>
            </div>

            {/* Visual Timeline Chips */}
            <div className="space-y-2 pt-2">
              <span className="text-xs font-bold text-stone-600 dark:text-stone-400">
                Active Interval Progression:
              </span>
              <div className="flex flex-wrap items-center gap-2 p-3 rounded-xl bg-[#FAF7F2] dark:bg-stone-950/60 border border-[#EDE4D0] dark:border-stone-800">
                <span className="text-[11px] font-bold text-stone-500 mr-1">Completion: Day 0</span>
                {parsedIntervals.map((days, idx) => (
                  <React.Fragment key={idx}>
                    <span className="text-stone-400 font-bold">➔</span>
                    <div className="px-3 py-1 rounded-lg bg-white dark:bg-stone-800 border border-[#EDE4D0] text-xs font-bold text-[#1D2417] dark:text-stone-100 shadow-xs flex items-center gap-1.5">
                      <span className="text-[10px] text-stone-400 font-normal">Rev #{idx + 1}:</span>
                      <span className="text-[#486B2C]">+{days}d</span>
                    </div>
                  </React.Fragment>
                ))}
              </div>
            </div>

            {/* Custom Interval Input */}
            <div>
              <label className="text-xs font-bold text-stone-700 dark:text-stone-300 block mb-1">
                Custom Interval Days (Comma-separated)
              </label>
              <input
                type="text"
                value={intervalsText}
                onChange={e => setIntervalsText(e.target.value)}
                placeholder="1, 3, 7, 14, 30"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF7F2] dark:bg-stone-950 border border-[#EDE4D0] dark:border-stone-800 text-stone-900 dark:text-stone-100 text-xs font-mono outline-none focus:border-[#C68A2C]"
              />
              <span className="text-[11px] text-stone-500 mt-1 block">
                Example: <code>1, 3, 7, 14, 30</code>. Enter positive integers separated by commas.
              </span>
            </div>

            <div className="flex justify-end pt-3 border-t border-[#EDE4D0] dark:border-stone-800">
              <button
                type="button"
                onClick={() => handleSaveSettings()}
                className="px-5 py-2 rounded-xl bg-[#486B2C] hover:bg-[#385522] text-white font-bold text-xs shadow-xs transition-colors"
              >
                Apply Spaced Schedule
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Sensory & Theme */}
      {activeTab === 'sensory' && (
        <div className="space-y-6">
          {/* Audio Preferences */}
          <div className="p-6 rounded-2xl bg-white dark:bg-stone-900 border border-[#EDE4D0] dark:border-stone-800 shadow-[0_2px_8px_rgba(40,30,20,0.03)] space-y-6">
            <div className="flex items-center gap-2.5 pb-3 border-b border-[#EDE4D0] dark:border-stone-800">
              <div className="p-2 rounded-xl bg-[#EAF2E4] text-[#486B2C]">
                <Volume2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-[#1D2417] dark:text-stone-100 font-serif">
                  Sensory & Web Audio Synthesis
                </h3>
                <p className="text-xs text-stone-500">
                  Synthesized harmonic micro-audio designed to give satisfying dopamine feedback on task completion
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-[#FAF7F2] dark:bg-stone-950/60 border border-[#EDE4D0] dark:border-stone-800">
              <div>
                <div className="font-bold text-xs text-stone-900 dark:text-stone-100">
                  Interactive Sound Effects
                </div>
                <div className="text-[11px] text-stone-500 mt-0.5">
                  Plays sine and triangle tone synthesizer cues on checklist clicks and milestones
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  const newVal = !settings.soundEnabled;
                  updateSettings({ soundEnabled: newVal });
                  if (newVal) playCheckSound(true);
                }}
                className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
                  settings.soundEnabled
                    ? 'bg-[#486B2C] text-white border-[#486B2C] shadow-xs'
                    : 'bg-white dark:bg-stone-800 border-[#EDE4D0] text-stone-500'
                }`}
              >
                {settings.soundEnabled ? '✓ Enabled' : '✕ Disabled'}
              </button>
            </div>

            {/* Sound Testing Lab */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-stone-600 dark:text-stone-400">
                Audio Testing Studio (Click to Listen):
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <button
                  type="button"
                  onClick={() => testAudio('check')}
                  className="p-3 rounded-xl bg-white dark:bg-stone-800 border border-[#EDE4D0] text-left hover:border-[#486B2C] transition-all flex flex-col justify-between"
                >
                  <div className="text-xs font-bold text-stone-800 dark:text-stone-200 flex items-center justify-between">
                    <span>Tick Pop</span>
                    <Play className="w-3.5 h-3.5 text-[#486B2C]" />
                  </div>
                  <div className="text-[10px] text-stone-400 mt-1">Single task checkmark</div>
                </button>

                <button
                  type="button"
                  onClick={() => testAudio('revision')}
                  className="p-3 rounded-xl bg-white dark:bg-stone-800 border border-[#EDE4D0] text-left hover:border-[#486B2C] transition-all flex flex-col justify-between"
                >
                  <div className="text-xs font-bold text-stone-800 dark:text-stone-200 flex items-center justify-between">
                    <span>Revision Chord</span>
                    <Play className="w-3.5 h-3.5 text-[#C68A2C]" />
                  </div>
                  <div className="text-[10px] text-stone-400 mt-1">Harmonious triad (C-E-G)</div>
                </button>

                <button
                  type="button"
                  onClick={() => testAudio('fanfare')}
                  className="p-3 rounded-xl bg-white dark:bg-stone-800 border border-[#EDE4D0] text-left hover:border-[#486B2C] transition-all flex flex-col justify-between"
                >
                  <div className="text-xs font-bold text-stone-800 dark:text-stone-200 flex items-center justify-between">
                    <span>Fanfare</span>
                    <Play className="w-3.5 h-3.5 text-[#8E5B13]" />
                  </div>
                  <div className="text-[10px] text-stone-400 mt-1">Milestone unlocked!</div>
                </button>

                <button
                  type="button"
                  onClick={() => testAudio('undo')}
                  className="p-3 rounded-xl bg-white dark:bg-stone-800 border border-[#EDE4D0] text-left hover:border-[#486B2C] transition-all flex flex-col justify-between"
                >
                  <div className="text-xs font-bold text-stone-800 dark:text-stone-200 flex items-center justify-between">
                    <span>Undo Whoosh</span>
                    <Play className="w-3.5 h-3.5 text-stone-500" />
                  </div>
                  <div className="text-[10px] text-stone-400 mt-1">Action reversed</div>
                </button>
              </div>
            </div>
          </div>

          {/* Color Aesthetics */}
          <div className="p-6 rounded-2xl bg-white dark:bg-stone-900 border border-[#EDE4D0] dark:border-stone-800 shadow-[0_2px_8px_rgba(40,30,20,0.03)] space-y-4">
            <h3 className="font-extrabold text-base text-[#1D2417] dark:text-stone-100 font-serif flex items-center gap-2">
              <Sun className="w-4 h-4 text-[#486B2C]" />
              Color Aesthetic Palette
            </h3>
            <p className="text-xs text-stone-500">
              Tailored high-contrast minimalist designs to optimize focus during long study sessions
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              {/* Cream Mode */}
              <div
                onClick={() => updateSettings({ theme: 'light' })}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  settings.theme === 'light'
                    ? 'bg-[#F8F5EB] border-[#486B2C] ring-2 ring-[#486B2C]/40 shadow-xs'
                    : 'bg-[#FAF7F2] border-[#EDE4D0] opacity-70 hover:opacity-100'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="font-bold text-xs text-[#1D2417] flex items-center gap-1.5">
                    <Sun className="w-4 h-4 text-[#C68A2C]" />
                    Crème Minimalist (Default)
                  </div>
                  {settings.theme === 'light' && (
                    <span className="w-2 h-2 rounded-full bg-[#486B2C]" />
                  )}
                </div>
                <div className="text-[11px] text-[#575D4E] mb-3">
                  Warm parchment tones with Sap Green accents. Easy on the eyes for daytime study.
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded-full bg-[#F8F5EB] border border-[#DDD2BA]" />
                  <span className="w-4 h-4 rounded-full bg-[#486B2C]" />
                  <span className="w-4 h-4 rounded-full bg-[#C68A2C]" />
                  <span className="w-4 h-4 rounded-full bg-[#1D2417]" />
                </div>
              </div>

              {/* Dark Mode */}
              <div
                onClick={() => updateSettings({ theme: 'dark' })}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  settings.theme === 'dark'
                    ? 'bg-stone-900 border-stone-600 ring-2 ring-stone-500/40 shadow-xs'
                    : 'bg-stone-950 border-stone-800 opacity-70 hover:opacity-100 text-stone-300'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="font-bold text-xs text-stone-100 flex items-center gap-1.5">
                    <Moon className="w-4 h-4 text-stone-400" />
                    Obsidian Minimalist
                  </div>
                  {settings.theme === 'dark' && (
                    <span className="w-2 h-2 rounded-full bg-[#486B2C]" />
                  )}
                </div>
                <div className="text-[11px] text-stone-400 mb-3">
                  Low-light deep stone backgrounds with subtle OLED-friendly contrast.
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded-full bg-stone-900 border border-stone-700" />
                  <span className="w-4 h-4 rounded-full bg-[#5D8B39]" />
                  <span className="w-4 h-4 rounded-full bg-[#D49E45]" />
                  <span className="w-4 h-4 rounded-full bg-stone-100" />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Data Vault & Backups */}
      {activeTab === 'data' && (
        <div className="space-y-6">
          {/* Backup & Export */}
          <div className="p-6 rounded-2xl bg-white dark:bg-stone-900 border border-[#EDE4D0] dark:border-stone-800 shadow-[0_2px_8px_rgba(40,30,20,0.03)] space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-[#EDE4D0] dark:border-stone-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-[#EAF2E4] text-[#486B2C]">
                  <Database className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-[#1D2417] dark:text-stone-100 font-serif">
                    Data Vault & JSON Snapshots
                  </h3>
                  <p className="text-xs text-stone-500">
                    Your entire syllabus, personal notes, timestamps, and streaks are stored safely in local storage
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Export / Download */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-[#FAF7F2] dark:bg-stone-950/60 border border-[#EDE4D0] dark:border-stone-800 space-y-2">
                <div className="font-bold text-xs text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                  <Download className="w-4 h-4 text-[#486B2C]" />
                  Download JSON Backup
                </div>
                <p className="text-[11px] text-stone-500">
                  Save a full offline snapshot file to your hard drive. Can be restored anytime or transferred to another machine.
                </p>
                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={handleExportDownload}
                    className="flex-1 py-2 px-3 rounded-xl bg-[#486B2C] hover:bg-[#385522] text-white font-bold text-xs transition-colors shadow-xs flex items-center justify-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Download File
                  </button>
                  <button
                    onClick={handleCopyBackup}
                    className="py-2 px-3 rounded-xl bg-white dark:bg-stone-800 border border-[#EDE4D0] text-stone-700 dark:text-stone-300 font-bold text-xs hover:bg-[#F8F5EB] transition-colors flex items-center gap-1"
                    title="Copy JSON to clipboard"
                  >
                    {copiedBackup ? <Check className="w-3.5 h-3.5 text-[#486B2C]" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedBackup ? 'Copied!' : 'Copy'}</span>
                  </button>
                </div>
              </div>

              {/* Demo Data Preset */}
              <div className="p-4 rounded-xl bg-[#FAF7F2] dark:bg-stone-950/60 border border-[#EDE4D0] dark:border-stone-800 space-y-2">
                <div className="font-bold text-xs text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-[#C68A2C]" />
                  Load Realistic Demo History
                </div>
                <p className="text-[11px] text-stone-500">
                  Populates 14-day study streaks, completed topics, and scheduled reviews to explore the full analytics dashboard.
                </p>
                <div className="pt-1">
                  <button
                    onClick={() => {
                      if (confirm('Load sample preparation history? This will populate sample records.')) {
                        loadDemoDataAction();
                        playFanfareSound(settings.soundEnabled);
                      }
                    }}
                    className="w-full py-2 px-3 rounded-xl bg-[#FBF3DC] hover:bg-[#F6E3B4] dark:bg-[#C68A2C]/20 border border-[#EEDDB8] dark:border-[#C68A2C]/40 text-[#8E5B13] dark:text-[#EEDDB8] font-bold text-xs transition-colors shadow-xs"
                  >
                    Load Demo Records
                  </button>
                </div>
              </div>
            </div>

            {/* Restore from JSON */}
            <div className="space-y-3 pt-3 border-t border-[#EDE4D0] dark:border-stone-800">
              <label className="text-xs font-bold text-stone-700 dark:text-stone-300 block">
                Restore Data Snapshot (Paste JSON)
              </label>
              <textarea
                rows={3}
                value={importText}
                onChange={e => setImportText(e.target.value)}
                placeholder="Paste previously downloaded JSON data text here..."
                className="w-full p-3 rounded-xl bg-[#FAF7F2] dark:bg-stone-950 border border-[#EDE4D0] dark:border-stone-800 text-stone-900 dark:text-stone-100 text-xs font-mono outline-none focus:border-[#C68A2C]"
              />

              {importStatus && (
                <div
                  className={`p-3 rounded-xl text-xs font-bold flex items-center gap-2 ${
                    importStatus.type === 'error'
                      ? 'bg-[#FEE2E2] text-[#991B1B] border border-[#FCA5A5]'
                      : 'bg-[#EAF2E4] text-[#385522] border border-[#D3E3C9]'
                  }`}
                >
                  {importStatus.type === 'error' ? (
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                  )}
                  <span>{importStatus.message}</span>
                </div>
              )}

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleImportSubmit}
                  disabled={!importText.trim()}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#486B2C] disabled:opacity-40 hover:bg-[#385522] text-white font-bold text-xs transition-colors shadow-xs"
                >
                  <Upload className="w-3.5 h-3.5" />
                  Restore Snapshot
                </button>
              </div>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="p-6 rounded-2xl bg-[#FEF2F2] dark:bg-[#7F1D1D]/10 border border-[#FCA5A5] dark:border-[#991B1B]/30 space-y-3">
            <div className="flex items-center gap-2 text-[#991B1B] dark:text-red-400 font-bold text-sm">
              <ShieldAlert className="w-4 h-4" />
              <span>Danger Zone: Fresh Syllabus Reset</span>
            </div>
            <p className="text-xs text-stone-600 dark:text-stone-400">
              Clear all logged activity history, reset all 11 GATE CS subjects to 'Not Started', and clear all streak counters for a brand new revision cycle.
            </p>
            <div className="pt-1">
              <button
                type="button"
                onClick={() => setShowResetConfirmModal(true)}
                className="px-4 py-2 rounded-xl bg-[#DC2626] hover:bg-[#B91C1C] text-white font-bold text-xs shadow-xs transition-colors flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Reset All Progress to Zero
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Reset */}
      {showResetConfirmModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="w-full max-w-md p-6 rounded-2xl bg-white dark:bg-stone-900 border border-[#EDE4D0] dark:border-stone-800 shadow-xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-full bg-[#FEE2E2] text-[#991B1B]">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-stone-900 dark:text-stone-100 font-serif">
                  Reset All Preparation Data?
                </h3>
                <p className="text-xs text-stone-500">
                  This action cannot be undone. All topic completion marks, notes, and activity history will be erased.
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowResetConfirmModal(false)}
                className="px-4 py-2 rounded-xl bg-[#FAF7F2] dark:bg-stone-800 text-stone-700 dark:text-stone-300 font-bold text-xs hover:bg-[#EDE4D0]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  resetAllDataAction();
                  setShowResetConfirmModal(false);
                  playCheckSound(settings.soundEnabled);
                }}
                className="px-4 py-2 rounded-xl bg-[#DC2626] hover:bg-[#B91C1C] text-white font-bold text-xs shadow-xs"
              >
                Yes, Reset Everything
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
