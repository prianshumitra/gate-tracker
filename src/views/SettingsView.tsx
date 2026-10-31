import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { daysUntilExam, formatHumanDate } from '../utils/date';
import {
  Settings as SettingsIcon,
  Calendar,
  Volume2,
  Database,
  Download,
  Upload,
  RefreshCw,
  CheckCircle2,
  Sparkles,
  Copy,
  Check,
  AlertTriangle,
  Play,
  RotateCcw,
  ShieldAlert
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
      const ok = importDataJson(importText);
      if (ok) {
        setImportStatus({ type: 'success', message: 'Data imported and synced successfully!' });
        setImportText('');
        playFanfareSound(settings.soundEnabled);
        setTimeout(() => setImportStatus(null), 4000);
      } else {
        setImportStatus({ type: 'error', message: 'Import failed: validation error.' });
      }
    } catch {
      setImportStatus({ type: 'error', message: 'Malformed JSON string. Please verify the content.' });
    }
  };

  return (
    <div className="space-y-6 macos-fade-in max-w-5xl mx-auto pb-8">
      {/* View Header with Crisp macOS Styling */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#EAF2E4] text-[#385522] border border-[#CFE1C5]">
              Local-First Persistent Storage
            </span>
            <span className="text-xs text-[#5A6650] font-medium">• Preferences & Engine Config</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-[#13200F] font-serif tracking-tight flex items-center gap-2.5">
            <SettingsIcon className="w-6 h-6 text-[#486B2C]" />
            <span>Settings & Study Configuration</span>
          </h2>
          <p className="text-xs sm:text-sm text-[#485341] mt-1 max-w-2xl font-medium">
            Configure target GATE dates, fine-tune spaced repetition intervals, manage sound synthesis, and export data backups.
          </p>
        </div>

        {/* Quick Database Stat Pill in Frosted Glass */}
        <div className="flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-white/80 backdrop-blur-md border border-white/80 shadow-[0_4px_16px_rgba(20,35,15,0.04)] text-xs self-start md:self-auto">
          <Database className="w-4 h-4 text-[#486B2C]" />
          <div>
            <div className="font-bold text-[#13200F]">
              {subjects.length} Subjects • {flatTopics.length} Topics
            </div>
            <div className="text-[10px] text-[#6A7562] font-medium">
              {activityLogs.length} Logged Actions Synced
            </div>
          </div>
        </div>
      </div>

      {saveSuccess && (
        <div className="p-4 rounded-2xl bg-[#EAF2E4] border border-[#CFE1C5] text-[#2E491A] text-xs flex items-center gap-2.5 font-bold animate-in fade-in shadow-xs">
          <CheckCircle2 className="w-5 h-5 text-[#486B2C] shrink-0" />
          <span>Configuration saved successfully and applied across all views!</span>
        </div>
      )}

      {/* Navigation Sub-Tabs in macOS Frosted Pill Dock */}
      <div className="p-1.5 rounded-2xl bg-white/65 backdrop-blur-xl border border-white/80 shadow-xs flex flex-wrap items-center gap-1.5">
        <button
          onClick={() => setActiveTab('schedule')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
            activeTab === 'schedule'
              ? 'bg-[#F6E3A1] text-[#1D2417] shadow-xs'
              : 'text-[#4A5543] hover:text-[#13200F] hover:bg-white/50'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>Exam Target & Daily Goal</span>
        </button>
        <button
          onClick={() => setActiveTab('spaced')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
            activeTab === 'spaced'
              ? 'bg-[#F6E3A1] text-[#1D2417] shadow-xs'
              : 'text-[#4A5543] hover:text-[#13200F] hover:bg-white/50'
          }`}
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Spaced Repetition Intervals</span>
        </button>
        <button
          onClick={() => setActiveTab('sensory')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
            activeTab === 'sensory'
              ? 'bg-[#F6E3A1] text-[#1D2417] shadow-xs'
              : 'text-[#4A5543] hover:text-[#13200F] hover:bg-white/50'
          }`}
        >
          <Volume2 className="w-3.5 h-3.5" />
          <span>Sensory & Theme</span>
        </button>
        <button
          onClick={() => setActiveTab('data')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
            activeTab === 'data'
              ? 'bg-[#F6E3A1] text-[#1D2417] shadow-xs'
              : 'text-[#4A5543] hover:text-[#13200F] hover:bg-white/50'
          }`}
        >
          <Database className="w-3.5 h-3.5" />
          <span>Data Vault & Backups</span>
        </button>
      </div>

      {/* Tab 1: Exam Target & Daily Goal */}
      {activeTab === 'schedule' && (
        <div className="space-y-6">
          <div className="p-6 sm:p-8 rounded-[28px] bg-white/75 backdrop-blur-2xl border border-white/80 shadow-[0_20px_50px_rgba(20,35,15,0.06),0_1px_3px_rgba(0,0,0,0.04)] space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-[#E8EFE3]">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-[#EAF2E4] text-[#486B2C] shadow-xs">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-[#13200F] font-serif">
                    Target Examination Countdown
                  </h3>
                  <p className="text-xs text-[#52604A]">
                    Set your scheduled GATE examination date to align spaced repetition schedules
                  </p>
                </div>
              </div>

              {/* Countdown badge matching golden ochre palette */}
              <div className="text-right">
                <span className="text-3xl font-black text-[#966418] font-serif leading-none">
                  {daysLeft}
                </span>
                <span className="text-xs text-[#707E68] font-semibold block mt-0.5">Days Left</span>
              </div>
            </div>

            {/* Quick Presets */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-[#2A3722]">
                Quick Exam Presets:
              </span>
              <div className="flex flex-wrap gap-2.5">
                <button
                  type="button"
                  onClick={() => applyExamPreset('2027-02-06', 'GATE 2027')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    settings.examDate === '2027-02-06'
                      ? 'bg-[#486B2C] text-white shadow-xs'
                      : 'bg-white/80 border border-[#D5E2CD] text-[#2A3722] hover:bg-white'
                  }`}
                >
                  GATE CS 2027 (Feb 6, 2027)
                </button>
                <button
                  type="button"
                  onClick={() => applyExamPreset('2028-02-05', 'GATE 2028')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    settings.examDate === '2028-02-05'
                      ? 'bg-[#486B2C] text-white shadow-xs'
                      : 'bg-white/80 border border-[#D5E2CD] text-[#2A3722] hover:bg-white'
                  }`}
                >
                  GATE CS 2028 (Feb 5, 2028)
                </button>
              </div>
            </div>

            {/* Form Inputs Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
              <div>
                <label className="text-xs font-bold text-[#2A3722] block mb-1.5">
                  Exam Date (YYYY-MM-DD)
                </label>
                <input
                  type="date"
                  value={settings.examDate}
                  onChange={e => updateSettings({ examDate: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/90 border border-[#D5E2CD] text-[#13200F] text-xs font-semibold outline-none focus:border-[#486B2C] focus:ring-2 focus:ring-[#486B2C]/15 shadow-xs"
                />
                <span className="text-[11px] text-[#63725B] mt-1.5 block">
                  Target date formatted as: <strong className="text-[#13200F]">{formatHumanDate(settings.examDate)}</strong>
                </span>
              </div>

              <div>
                <label className="text-xs font-bold text-[#2A3722] block mb-1.5">
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
                  <span className="w-10 text-center font-bold text-sm text-[#385522] px-2 py-1 bg-[#EAF2E4] rounded-xl border border-[#CFE1C5] shadow-xs">
                    {settings.dailyGoal}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-[#63725B] mt-1.5">
                  <span>1 Casual</span>
                  <span className="font-semibold text-[#8E5B13]">
                    {settings.dailyGoal <= 2 ? '🌱 Gentle Pace' : settings.dailyGoal <= 5 ? '⚡ Recommended Pace' : '🔥 Aggressive Sprint'}
                  </span>
                  <span>12 Intensive</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-[#E8EFE3]">
              <button
                type="button"
                onClick={() => handleSaveSettings()}
                className="px-6 py-2.5 rounded-xl bg-[#486B2C] hover:bg-[#385522] text-white font-bold text-xs shadow-md transition-colors cursor-pointer"
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
          <div className="p-6 sm:p-8 rounded-[28px] bg-white/75 backdrop-blur-2xl border border-white/80 shadow-[0_20px_50px_rgba(20,35,15,0.06),0_1px_3px_rgba(0,0,0,0.04)] space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-[#E8EFE3]">
              <div className="p-2.5 rounded-2xl bg-[#FBF3DC] text-[#8E5B13] shadow-xs">
                <RotateCcw className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-[#13200F] font-serif">
                  Spaced Repetition Algorithm & Intervals
                </h3>
                <p className="text-xs text-[#52604A]">
                  Controls how many days after completion each consecutive spaced repetition is scheduled
                </p>
              </div>
            </div>

            {/* Presets */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-[#2A3722]">
                Choose a Scheduling Philosophy:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => applyIntervalPreset('Standard Leitner', [1, 3, 7, 14, 30])}
                  className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                    intervalsText === '1, 3, 7, 14, 30'
                      ? 'bg-[#EAF2E4] border-[#486B2C] text-[#2E491A] shadow-xs ring-1 ring-[#486B2C]'
                      : 'bg-white/80 border-[#D5E2CD] text-[#2A3722] hover:bg-white'
                  }`}
                >
                  <div className="font-bold text-xs flex items-center justify-between">
                    <span>Standard Leitner</span>
                    <span className="text-[10px] font-mono text-[#486B2C]">1, 3, 7, 14, 30d</span>
                  </div>
                  <div className="text-[11px] text-[#63725B] mt-1.5 leading-relaxed">
                    Balanced exponential curve. Ideal for steady year-long prep.
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => applyIntervalPreset('Aggressive Exam Crunch', [1, 2, 4, 7, 14])}
                  className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                    intervalsText === '1, 2, 4, 7, 14'
                      ? 'bg-[#FBF3DC] border-[#C68A2C] text-[#8E5B13] shadow-xs ring-1 ring-[#C68A2C]'
                      : 'bg-white/80 border-[#D5E2CD] text-[#2A3722] hover:bg-white'
                  }`}
                >
                  <div className="font-bold text-xs flex items-center justify-between">
                    <span>Exam Sprint</span>
                    <span className="text-[10px] font-mono text-[#8E5B13]">1, 2, 4, 7, 14d</span>
                  </div>
                  <div className="text-[11px] text-[#63725B] mt-1.5 leading-relaxed">
                    Compressed frequency for rapid recall before GATE tests.
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => applyIntervalPreset('Long-Term Retention', [1, 7, 16, 35, 60])}
                  className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                    intervalsText === '1, 7, 16, 35, 60'
                      ? 'bg-[#EAF2E4] border-[#486B2C] text-[#2E491A] shadow-xs ring-1 ring-[#486B2C]'
                      : 'bg-white/80 border-[#D5E2CD] text-[#2A3722] hover:bg-white'
                  }`}
                >
                  <div className="font-bold text-xs flex items-center justify-between">
                    <span>Extended Memory</span>
                    <span className="text-[10px] font-mono text-[#486B2C]">1, 7, 16, 35, 60d</span>
                  </div>
                  <div className="text-[11px] text-[#63725B] mt-1.5 leading-relaxed">
                    Wider gaps designed to solidify concepts into permanent memory.
                  </div>
                </button>
              </div>
            </div>

            {/* Visual Timeline Chips */}
            <div className="space-y-2 pt-2">
              <span className="text-xs font-bold text-[#2A3722]">
                Active Interval Progression:
              </span>
              <div className="flex flex-wrap items-center gap-2 p-3.5 rounded-2xl bg-white/70 border border-[#D5E2CD]">
                <span className="text-[11px] font-bold text-[#63725B] mr-1">Completion: Day 0</span>
                {parsedIntervals.map((days, idx) => (
                  <React.Fragment key={idx}>
                    <span className="text-[#8B9883] font-bold">➔</span>
                    <div className="px-3 py-1 rounded-xl bg-white border border-[#D5E2CD] text-xs font-bold text-[#13200F] shadow-xs flex items-center gap-1.5">
                      <span className="text-[10px] text-[#707E68] font-normal">Rev #{idx + 1}:</span>
                      <span className="text-[#486B2C]">+{days}d</span>
                    </div>
                  </React.Fragment>
                ))}
              </div>
            </div>

            {/* Custom Interval Input */}
            <div>
              <label className="text-xs font-bold text-[#2A3722] block mb-1">
                Custom Interval Days (Comma-separated)
              </label>
              <input
                type="text"
                value={intervalsText}
                onChange={e => setIntervalsText(e.target.value)}
                placeholder="1, 3, 7, 14, 30"
                className="w-full px-4 py-2.5 rounded-xl bg-white/90 border border-[#D5E2CD] text-[#13200F] text-xs font-mono outline-none focus:border-[#486B2C] focus:ring-2 focus:ring-[#486B2C]/15 shadow-xs"
              />
              <span className="text-[11px] text-[#63725B] mt-1 block">
                Example: <code>1, 3, 7, 14, 30</code>. Enter positive integers separated by commas.
              </span>
            </div>

            <div className="flex justify-end pt-4 border-t border-[#E8EFE3]">
              <button
                type="button"
                onClick={() => handleSaveSettings()}
                className="px-6 py-2.5 rounded-xl bg-[#486B2C] hover:bg-[#385522] text-white font-bold text-xs shadow-md transition-colors cursor-pointer"
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
          <div className="p-6 sm:p-8 rounded-[28px] bg-white/75 backdrop-blur-2xl border border-white/80 shadow-[0_20px_50px_rgba(20,35,15,0.06),0_1px_3px_rgba(0,0,0,0.04)] space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-[#E8EFE3]">
              <div className="p-2.5 rounded-2xl bg-[#EAF2E4] text-[#486B2C] shadow-xs">
                <Volume2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-[#13200F] font-serif">
                  Sensory & Web Audio Synthesis
                </h3>
                <p className="text-xs text-[#52604A]">
                  Synthesized harmonic micro-audio designed to give satisfying dopamine feedback on task completion
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-white/80 border border-[#D5E2CD]">
              <div>
                <div className="font-bold text-xs text-[#13200F]">
                  Interactive Sound Effects
                </div>
                <div className="text-[11px] text-[#63725B] mt-0.5">
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
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  settings.soundEnabled
                    ? 'bg-[#486B2C] text-white shadow-xs'
                    : 'bg-stone-200 text-stone-600'
                }`}
              >
                {settings.soundEnabled ? '✓ Enabled' : '✕ Disabled'}
              </button>
            </div>

            {/* Sound Testing Lab */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-[#2A3722]">
                Audio Testing Studio (Click to Listen):
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <button
                  type="button"
                  onClick={() => testAudio('check')}
                  className="p-3.5 rounded-2xl bg-white border border-[#D5E2CD] text-left hover:border-[#486B2C] transition-all flex flex-col justify-between shadow-xs cursor-pointer"
                >
                  <div className="text-xs font-bold text-[#13200F] flex items-center justify-between">
                    <span>Tick Pop</span>
                    <Play className="w-3.5 h-3.5 text-[#486B2C]" />
                  </div>
                  <div className="text-[10px] text-[#707E68] mt-1">Single task checkmark</div>
                </button>

                <button
                  type="button"
                  onClick={() => testAudio('revision')}
                  className="p-3.5 rounded-2xl bg-white border border-[#D5E2CD] text-left hover:border-[#486B2C] transition-all flex flex-col justify-between shadow-xs cursor-pointer"
                >
                  <div className="text-xs font-bold text-[#13200F] flex items-center justify-between">
                    <span>Revision Chord</span>
                    <Play className="w-3.5 h-3.5 text-[#C68A2C]" />
                  </div>
                  <div className="text-[10px] text-[#707E68] mt-1">Harmonious triad (C-E-G)</div>
                </button>

                <button
                  type="button"
                  onClick={() => testAudio('fanfare')}
                  className="p-3.5 rounded-2xl bg-white border border-[#D5E2CD] text-left hover:border-[#486B2C] transition-all flex flex-col justify-between shadow-xs cursor-pointer"
                >
                  <div className="text-xs font-bold text-[#13200F] flex items-center justify-between">
                    <span>Fanfare</span>
                    <Play className="w-3.5 h-3.5 text-[#8E5B13]" />
                  </div>
                  <div className="text-[10px] text-[#707E68] mt-1">Milestone unlocked!</div>
                </button>

                <button
                  type="button"
                  onClick={() => testAudio('undo')}
                  className="p-3.5 rounded-2xl bg-white border border-[#D5E2CD] text-left hover:border-[#486B2C] transition-all flex flex-col justify-between shadow-xs cursor-pointer"
                >
                  <div className="text-xs font-bold text-[#13200F] flex items-center justify-between">
                    <span>Undo Whoosh</span>
                    <Play className="w-3.5 h-3.5 text-[#5A6650]" />
                  </div>
                  <div className="text-[10px] text-[#707E68] mt-1">Action reversed</div>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Data Vault & Backups */}
      {activeTab === 'data' && (
        <div className="space-y-6">
          {/* Backup & Export */}
          <div className="p-6 sm:p-8 rounded-[28px] bg-white/75 backdrop-blur-2xl border border-white/80 shadow-[0_20px_50px_rgba(20,35,15,0.06),0_1px_3px_rgba(0,0,0,0.04)] space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-[#E8EFE3]">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-[#EAF2E4] text-[#486B2C] shadow-xs">
                  <Database className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-[#13200F] font-serif">
                    Data Vault & JSON Snapshots
                  </h3>
                  <p className="text-xs text-[#52604A]">
                    Your entire syllabus, personal notes, timestamps, and streaks are stored safely in local storage
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Export / Download */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-5 rounded-2xl bg-white/80 border border-[#D5E2CD] space-y-3">
                <div className="font-bold text-xs text-[#13200F] flex items-center gap-2">
                  <Download className="w-4 h-4 text-[#486B2C]" />
                  Download JSON Backup
                </div>
                <p className="text-[11px] text-[#63725B] leading-relaxed">
                  Save a full offline snapshot file to your hard drive. Can be restored anytime or transferred to another machine.
                </p>
                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={handleExportDownload}
                    className="flex-1 py-2.5 px-3 rounded-xl bg-[#486B2C] hover:bg-[#385522] text-white font-bold text-xs transition-colors shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Download File
                  </button>
                  <button
                    onClick={handleCopyBackup}
                    className="py-2.5 px-3 rounded-xl bg-white border border-[#D5E2CD] text-[#2A3722] font-bold text-xs hover:bg-[#FAF7F0] transition-colors flex items-center gap-1 cursor-pointer"
                    title="Copy JSON to clipboard"
                  >
                    {copiedBackup ? <Check className="w-3.5 h-3.5 text-[#486B2C]" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedBackup ? 'Copied!' : 'Copy'}</span>
                  </button>
                </div>
              </div>

              {/* Demo Data Preset */}
              <div className="p-5 rounded-2xl bg-white/80 border border-[#D5E2CD] space-y-3">
                <div className="font-bold text-xs text-[#13200F] flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#C68A2C]" />
                  Load Realistic Demo History
                </div>
                <p className="text-[11px] text-[#63725B] leading-relaxed">
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
                    className="w-full py-2.5 px-3 rounded-xl bg-[#FBF3DC] hover:bg-[#F6E3B4] border border-[#EEDDB8] text-[#8E5B13] font-bold text-xs transition-colors shadow-xs cursor-pointer"
                  >
                    Load Demo Records
                  </button>
                </div>
              </div>
            </div>

            {/* Restore from JSON */}
            <div className="space-y-3 pt-4 border-t border-[#E8EFE3]">
              <label className="text-xs font-bold text-[#2A3722] block">
                Restore Data Snapshot (Paste JSON)
              </label>
              <textarea
                rows={3}
                value={importText}
                onChange={e => setImportText(e.target.value)}
                placeholder="Paste previously downloaded JSON data text here..."
                className="w-full p-3.5 rounded-xl bg-white/90 border border-[#D5E2CD] text-[#13200F] text-xs font-mono outline-none focus:border-[#486B2C] focus:ring-2 focus:ring-[#486B2C]/15 shadow-xs"
              />

              {importStatus && (
                <div
                  className={`p-3.5 rounded-xl text-xs font-bold flex items-center gap-2.5 ${
                    importStatus.type === 'error'
                      ? 'bg-[#FEE2E2] text-[#991B1B] border border-[#FCA5A5]'
                      : 'bg-[#EAF2E4] text-[#2E491A] border border-[#CFE1C5]'
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
                  className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#486B2C] disabled:opacity-40 hover:bg-[#385522] text-white font-bold text-xs transition-colors shadow-xs cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5" />
                  Restore Snapshot
                </button>
              </div>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="p-6 sm:p-7 rounded-[28px] bg-[#FEF2F2]/90 backdrop-blur-xl border border-[#FCA5A5]/80 space-y-3 shadow-xs">
            <div className="flex items-center gap-2 text-[#991B1B] font-bold text-sm">
              <ShieldAlert className="w-4 h-4" />
              <span>Danger Zone: Fresh Syllabus Reset</span>
            </div>
            <p className="text-xs text-[#7F1D1D] leading-relaxed">
              Clear all logged activity history, reset all 11 GATE CS subjects to 'Not Started', and clear all streak counters for a brand new revision cycle.
            </p>
            <div className="pt-1">
              <button
                type="button"
                onClick={() => setShowResetConfirmModal(true)}
                className="px-5 py-2.5 rounded-xl bg-[#DC2626] hover:bg-[#B91C1C] text-white font-bold text-xs shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Reset All Progress to Zero
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Reset with macOS Frosted Glass */}
      {showResetConfirmModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md p-7 rounded-[28px] bg-white/95 backdrop-blur-2xl border border-white/80 shadow-[0_25px_60px_rgba(0,0,0,0.2)] space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3.5">
              <div className="p-3 rounded-2xl bg-[#FEE2E2] text-[#991B1B] shadow-xs">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-[#13200F] font-serif">
                  Reset All Preparation Data?
                </h3>
                <p className="text-xs text-[#63725B] mt-0.5 leading-relaxed">
                  This action cannot be undone. All topic completion marks, notes, and activity history will be erased.
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setShowResetConfirmModal(false)}
                className="px-5 py-2.5 rounded-xl bg-white border border-[#D5E2CD] text-[#2A3722] font-bold text-xs hover:bg-[#FAF7F0] cursor-pointer transition-colors shadow-xs"
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
                className="px-5 py-2.5 rounded-xl bg-[#DC2626] hover:bg-[#B91C1C] text-white font-bold text-xs shadow-md cursor-pointer transition-colors"
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

export default SettingsView;
