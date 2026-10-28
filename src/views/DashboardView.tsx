import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { getLocalDateString } from '../utils/date';
import {
  BookOpen,
  Flame,
  Clock,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  AlertTriangle,
  Target,
  ArrowUpRight,
  Plus,
  Share2,
  Terminal,
  Database,
  Cpu,
  Cog,
  Code,
  FileCode,
  User
} from 'lucide-react';

interface RevisionTaskItem {
  id: string;
  name: string;
  subject: string;
  time: string;
  completed: boolean;
}

export const DashboardView: React.FC = () => {
  const {
    subjects,
    flatTopics,
    streakStats,
    activityLogs,
    setActiveTab,
    setSelectedSubjectId
  } = useApp();

  const [subjectSort, setSubjectSort] = useState<'Priority' | 'Completion' | 'Urgency'>('Priority');

  // Real syllabus topic calculations
  const totalTopics = flatTopics.length;
  const completedTopics = flatTopics.filter(t => t.topic.status === 'completed').length;
  const completionRate = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;

  const todayStr = getLocalDateString();
  const dueTopics = flatTopics.filter(
    t => t.topic.status === 'completed' && t.topic.nextRevisionAt && t.topic.nextRevisionAt <= todayStr
  );
  const overdueTopics = flatTopics.filter(
    t => t.topic.status === 'completed' && t.topic.nextRevisionAt && t.topic.nextRevisionAt < todayStr
  );
  const criticalPendingCount = flatTopics.filter(
    t => t.topic.status !== 'completed' && (t.topic.priority === 'critical' || t.topic.priority === 'high')
  ).length;

  // Interactive revision tasks from the screenshot — ALL UNCHECKED by default
  const [tasks, setTasks] = useState<RevisionTaskItem[]>([
    { id: 't1', name: 'Process Scheduling', subject: 'Operating Systems', time: '09:00 AM', completed: false },
    { id: 't2', name: 'Normalization', subject: 'DBMS', time: '10:30 AM', completed: false },
    { id: 't3', name: 'Graph Algorithms', subject: 'DSA', time: '01:00 PM', completed: false },
    { id: 't4', name: 'Deadlocks', subject: 'Operating Systems', time: '03:00 PM', completed: false },
    { id: 't5', name: 'Finite Automata', subject: 'Theory of Computation', time: '05:00 PM', completed: false },
    { id: 't6', name: 'SQL Queries', subject: 'DBMS', time: '07:00 PM', completed: false },
  ]);

  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);
  const [newTaskName, setNewTaskName] = useState('');
  const [newTaskSubject, setNewTaskSubject] = useState('Operating Systems');
  const [newTaskTime, setNewTaskTime] = useState('08:00 PM');

  const toggleTask = (id: string) => {
    setTasks(prev =>
      prev.map(t => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  };

  const handleAddNewTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskName.trim()) return;
    setTasks(prev => [
      ...prev,
      {
        id: `t-${Date.now()}`,
        name: newTaskName.trim(),
        subject: newTaskSubject,
        time: newTaskTime,
        completed: false
      }
    ]);
    setNewTaskName('');
    setIsAddTaskModalOpen(false);
  };

  // 11 Subjects dynamically mapped from syllabus with real topics & completion
  const subjectsData = subjects.map(s => {
    const sTopics = s.chapters.flatMap(c => c.topics);
    const total = sTopics.length;
    const done = sTopics.filter(t => t.status === 'completed').length;
    const completion = total > 0 ? Math.round((done / total) * 100) : 0;

    let iconType = 'book';
    let bgType = 'ochre';

    switch (s.id) {
      case 'dsa':
        iconType = 'chip';
        bgType = 'ochre';
        break;
      case 'os':
        iconType = 'terminal';
        bgType = 'sapgreen';
        break;
      case 'cn':
        iconType = 'network';
        bgType = 'sapgreen';
        break;
      case 'dbms':
        iconType = 'db';
        bgType = 'ochre';
        break;
      case 'coa':
        iconType = 'cpu';
        bgType = 'ochre';
        break;
      case 'toc':
        iconType = 'cog';
        bgType = 'sapgreen';
        break;
      case 'cd':
        iconType = 'code';
        bgType = 'ochre';
        break;
      case 'dl':
        iconType = 'gate';
        bgType = 'sapgreen';
        break;
      case 'dm':
        iconType = 'sigma';
        bgType = 'ochre';
        break;
      case 'em':
        iconType = 'fx';
        bgType = 'ochre';
        break;
      case 'ga':
        iconType = 'user';
        bgType = 'sapgreen';
        break;
    }

    const priorityFormatted = s.priority.charAt(0).toUpperCase() + s.priority.slice(1);

    return {
      id: s.id,
      name: s.name,
      code: s.code,
      completion,
      topicsDone: done,
      topicsTotal: total,
      priority: priorityFormatted,
      iconType,
      bgType
    };
  });

  // Sort subjects based on dropdown
  const sortedSubjects = [...subjectsData].sort((a, b) => {
    if (subjectSort === 'Completion') return b.completion - a.completion;
    if (subjectSort === 'Urgency') return a.completion - b.completion;
    const pRank: Record<string, number> = { Critical: 4, High: 3, Medium: 2, Low: 1 };
    return (pRank[b.priority] || 0) - (pRank[a.priority] || 0);
  });

  const renderSubjectIcon = (iconType: string, bgType: string) => {
    const bgClass =
      bgType === 'sapgreen'
        ? 'bg-[#EAF2E4] text-[#486B2C]' // Sap Green
        : 'bg-[#FBF3DC] text-[#C68A2C]'; // Crème Ochre

    switch (iconType) {
      case 'chip':
        return (
          <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${bgClass}`}>
            <Cpu className="w-3.5 h-3.5" />
          </div>
        );
      case 'terminal':
        return (
          <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${bgClass}`}>
            <Terminal className="w-3.5 h-3.5" />
          </div>
        );
      case 'network':
        return (
          <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${bgClass}`}>
            <Share2 className="w-3.5 h-3.5" />
          </div>
        );
      case 'db':
        return (
          <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${bgClass}`}>
            <Database className="w-3.5 h-3.5" />
          </div>
        );
      case 'cpu':
        return (
          <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${bgClass}`}>
            <Cpu className="w-3.5 h-3.5" />
          </div>
        );
      case 'cog':
        return (
          <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${bgClass}`}>
            <Cog className="w-3.5 h-3.5" />
          </div>
        );
      case 'code':
        return (
          <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${bgClass}`}>
            <Code className="w-3.5 h-3.5" />
          </div>
        );
      case 'gate':
        return (
          <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${bgClass}`}>
            <FileCode className="w-3.5 h-3.5" />
          </div>
        );
      case 'sigma':
        return (
          <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 font-serif font-bold text-xs ${bgClass}`}>
            Σ
          </div>
        );
      case 'fx':
        return (
          <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 font-serif italic text-xs font-semibold ${bgClass}`}>
            fx
          </div>
        );
      case 'user':
        return (
          <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${bgClass}`}>
            <User className="w-3.5 h-3.5" />
          </div>
        );
      default:
        return (
          <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${bgClass}`}>
            <BookOpen className="w-3.5 h-3.5" />
          </div>
        );
    }
  };

  const renderPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'Critical':
        return (
          <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-[#FBF0D3] text-[#8E5B13] border border-[#EED7A2]">
            Critical
          </span>
        );
      case 'High':
        return (
          <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-[#EAF2E4] text-[#3A5B20] border border-[#CFE1C5]">
            High
          </span>
        );
      case 'Medium':
        return (
          <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-[#FAF4E4] text-[#A6731B] border border-[#EFE0BC]">
            Medium
          </span>
        );
      case 'Low':
      default:
        return (
          <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-[#F1F6EE] text-[#55783E] border border-[#DCE8D5]">
            Low
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Greeting Header */}
      <div>
        <span className="text-xs text-stone-500 font-medium block">
          Tue, 23 Sep 2025
        </span>
        <h2 className="text-2xl lg:text-3xl font-extrabold text-stone-900 tracking-tight flex items-center gap-2 mt-0.5">
          <span>Good Evening, Prianshu</span>
          <span className="text-xl">🍃</span>
        </h2>
        <p className="text-xs text-stone-500 font-normal mt-0.5">
          Consistency today, a stronger rank tomorrow.
        </p>
      </div>

      {/* Main Content Layout: Central Dashboard + Right Sidebar Widgets */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* Left 8 Columns on XL: Metric Cards + Subject Progress & Today's Revision */}
        <div className="xl:col-span-8 space-y-6">
          {/* Row of 3 Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* 1. Syllabus Completion */}
            <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#EDE4D0] shadow-[0_2px_12px_rgba(60,50,30,0.02)] flex items-center justify-between">
              <div>
                <div className="w-9 h-9 rounded-xl bg-[#FDF6E5] text-[#BA7E26] flex items-center justify-center">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div className="text-xs text-stone-500 font-medium mt-3">
                  Syllabus Completion
                </div>
                <div className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight mt-0.5">
                  {completionRate}%
                </div>
                <div className="text-[11px] text-stone-400 mt-0.5">
                  {completedTopics} / {totalTopics} topics
                </div>
              </div>

              {/* Donut ring chart SVG in Sap Green */}
              <div className="relative w-14 h-14 shrink-0 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-[#ECE4D2]"
                    strokeWidth="4"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className="text-[#486B2C] transition-all duration-700"
                    strokeDasharray={`${completionRate}, 100`}
                    strokeWidth="4"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
              </div>
            </div>

            {/* 2. Current Streak in Crème Ochre */}
            <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#EDE4D0] shadow-[0_2px_12px_rgba(60,50,30,0.02)] flex items-center justify-between">
              <div>
                <div className="w-9 h-9 rounded-xl bg-[#FDF6E5] text-[#C68A2C] flex items-center justify-center">
                  <Flame className="w-4 h-4 fill-[#C68A2C]" />
                </div>
                <div className="text-xs text-stone-500 font-medium mt-3">
                  Current Streak
                </div>
                <div className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight mt-0.5">
                  {streakStats.currentStreak} {streakStats.currentStreak === 1 ? 'day' : 'days'}
                </div>
                <div className="text-[11px] text-stone-400 mt-0.5">
                  Best: <strong className="text-[#BA7E26] font-bold">{streakStats.longestStreak} days</strong>
                </div>
              </div>

              {/* Ascending mini bars graphic in Crème Ochre */}
              <div className="flex items-end gap-1 h-9 shrink-0 pr-1">
                {[10, 14, 12, 18, 22, 26, 30, 36].map((h, i) => {
                  const hasActivity = streakStats.currentStreak > 0 && i < streakStats.currentStreak;
                  return (
                    <div
                      key={i}
                      className={`w-1.5 rounded-full transition-all duration-300 ${
                        hasActivity ? 'bg-[#C68A2C]' : 'bg-[#ECE4D2]'
                      }`}
                      style={{ height: `${hasActivity ? h : 6}px` }}
                    />
                  );
                })}
              </div>
            </div>

            {/* 3. Revision Due in Sap Green */}
            <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#EDE4D0] shadow-[0_2px_12px_rgba(60,50,30,0.02)] flex items-center justify-between">
              <div>
                <div className="w-9 h-9 rounded-xl bg-[#EAF2E4] text-[#486B2C] flex items-center justify-center">
                  <Clock className="w-4 h-4" />
                </div>
                <div className="text-xs text-stone-500 font-medium mt-3">
                  Revision Due
                </div>
                <div className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight mt-0.5">
                  {dueTopics.length} {dueTopics.length === 1 ? 'topic' : 'topics'}
                </div>
                <div className="text-[11px] text-stone-400 mt-0.5">
                  {overdueTopics.length} overdue
                </div>
              </div>

              {/* Horizontal Progress Meter in Sap Green */}
              <div className="w-20 sm:w-24 h-2.5 bg-[#ECE4D2] rounded-full overflow-hidden shrink-0">
                <div
                  className="h-full bg-[#486B2C] rounded-full transition-all duration-500"
                  style={{
                    width: `${completedTopics > 0 ? Math.min(100, Math.round((dueTopics.length / completedTopics) * 100)) : 0}%`
                  }}
                />
              </div>
            </div>
          </div>

          {/* Split Row: Subject Progress & Today's Revision */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            {/* Left Card: Subject Progress Table */}
            <div className="lg:col-span-7 p-5 rounded-2xl bg-white border border-[#EDE4D0] shadow-[0_2px_12px_rgba(60,50,30,0.02)] space-y-4">
              <div className="flex items-center justify-between pb-1">
                <h3 className="font-bold text-sm text-stone-900">
                  Subject Progress
                </h3>

                {/* Sort dropdown */}
                <div className="relative">
                  <select
                    value={subjectSort}
                    onChange={e => setSubjectSort(e.target.value as any)}
                    className="text-xs text-stone-600 bg-white border border-[#E2D8C2] rounded-lg px-2.5 py-1 pr-6 appearance-none outline-none cursor-pointer hover:bg-[#F8F5EB] font-medium"
                  >
                    <option value="Priority">Sort by: Priority</option>
                    <option value="Completion">Sort by: Completion</option>
                    <option value="Urgency">Sort by: Urgency</option>
                  </select>
                  <span className="absolute right-2 top-1.5 pointer-events-none text-stone-400 text-[10px]">
                    ▼
                  </span>
                </div>
              </div>

              {/* Table Column Headers */}
              <div className="grid grid-cols-12 gap-1 text-[10px] font-semibold text-stone-400 uppercase tracking-wider px-2">
                <div className="col-span-5">Subject</div>
                <div className="col-span-3 text-center">Completion</div>
                <div className="col-span-2 text-center">Topics</div>
                <div className="col-span-2 text-right">Priority</div>
              </div>

              {/* Subject Rows */}
              <div className="divide-y divide-[#EDE4D0]/60">
                {sortedSubjects.map(sub => {
                  const isHighCompletion = sub.completion >= 50;

                  return (
                    <div
                      key={sub.id}
                      onClick={() => {
                        setSelectedSubjectId(sub.id);
                        setActiveTab('subjects');
                      }}
                      className="grid grid-cols-12 gap-1 items-center py-2 px-2 hover:bg-[#F6F0E0] rounded-xl cursor-pointer transition-colors group"
                    >
                      {/* Column 1: Icon + Subject Name */}
                      <div className="col-span-5 flex items-center gap-2 min-w-0">
                        {renderSubjectIcon(sub.iconType, sub.bgType)}
                        <span className="text-[11.5px] font-semibold text-stone-900 truncate group-hover:text-[#486B2C] transition-colors">
                          {sub.name}
                        </span>
                      </div>

                      {/* Column 2: Progress bar + Percentage */}
                      <div className="col-span-3 flex items-center gap-1.5 px-0.5">
                        <div className="flex-1 h-1.5 bg-[#ECE4D2] rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              isHighCompletion ? 'bg-[#486B2C]' : 'bg-[#C68A2C]'
                            }`}
                            style={{ width: `${sub.completion}%` }}
                          />
                        </div>
                        <span className="text-[11px] font-bold text-stone-700 w-7 text-right">
                          {sub.completion}%
                        </span>
                      </div>

                      {/* Column 3: Topics count */}
                      <div className="col-span-2 text-center text-[10.5px] text-stone-500 font-medium">
                        {sub.topicsDone}/{sub.topicsTotal}
                      </div>

                      {/* Column 4: Priority Badge + Chevron */}
                      <div className="col-span-2 flex items-center justify-end gap-1">
                        {renderPriorityBadge(sub.priority)}
                        <ChevronRight className="w-3 h-3 text-[#A29A88] group-hover:text-[#486B2C] transition-colors shrink-0" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right Card: Today's Revision in Crème Ochre */}
            <div className="lg:col-span-5 p-5 rounded-2xl bg-white border border-[#EDE4D0] shadow-[0_2px_12px_rgba(60,50,30,0.02)] flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between pb-1">
                  <h3 className="font-bold text-sm text-stone-900">
                    Today&apos;s Revision
                  </h3>
                  <button
                    onClick={() => setActiveTab('revision')}
                    className="text-xs text-[#BA7E26] font-semibold hover:text-[#8E5B13] hover:underline"
                  >
                    View All
                  </button>
                </div>

                {/* Revision tasks list */}
                <div className="divide-y divide-[#EDE4D0]/60 mt-2">
                  {tasks.map(item => (
                    <div
                      key={item.id}
                      onClick={() => toggleTask(item.id)}
                      className="py-3 flex items-center justify-between gap-3 cursor-pointer group hover:bg-[#F6F0E0] px-2 rounded-xl transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {/* Checkbox button */}
                        <div
                          className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                            item.completed
                              ? 'bg-[#486B2C] text-white'
                              : 'border-2 border-[#D6CDBC] group-hover:border-[#968A72]'
                          }`}
                        >
                          {item.completed && <CheckCircle2 className="w-4 h-4 fill-white text-[#486B2C]" />}
                        </div>

                        <div className="min-w-0">
                          <h4
                            className={`text-xs font-semibold truncate ${
                              item.completed
                                ? 'line-through text-[#968F7E]'
                                : 'text-stone-900'
                            }`}
                          >
                            {item.name}
                          </h4>
                          <span className="text-[11px] text-stone-400 block truncate">
                            {item.subject}
                          </span>
                        </div>
                      </div>

                      <span className="text-[11px] text-stone-500 font-medium shrink-0">
                        {item.time}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Add Task Button in Crème Ochre */}
              <button
                onClick={() => setIsAddTaskModalOpen(true)}
                className="w-full py-2.5 rounded-xl bg-[#C68A2C] hover:bg-[#B37920] text-white font-semibold text-xs transition-colors shadow-xs flex items-center justify-center gap-1.5 cursor-pointer active:scale-[0.99]"
              >
                <Plus className="w-4 h-4" />
                <span>Add Task</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right 4 Columns on XL: Study Calendar, Study Consistency, Quick Insights */}
        <div className="xl:col-span-4 space-y-5">
          {/* 1. Study Calendar Card */}
          <div className="p-5 rounded-2xl bg-white border border-[#EFEBE3] shadow-[0_2px_12px_rgba(60,50,30,0.02)] space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-stone-900">
                Study Calendar
              </h3>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveTab('calendar')}
                  className="p-1 text-stone-400 hover:text-stone-700"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setActiveTab('calendar')}
                  className="p-1 text-stone-400 hover:text-stone-700"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setActiveTab('calendar')}
                  className="flex items-center gap-1 text-xs text-stone-600 font-medium hover:text-stone-900"
                >
                  <span>Sep 2025</span>
                  <ChevronRight className="w-3 h-3 text-stone-400" />
                </button>
              </div>
            </div>

            {/* Days of Week Row */}
            <div className="grid grid-cols-7 text-center text-[10px] font-semibold text-stone-400 uppercase tracking-wider">
              <span>Mon</span>
              <span>Tue</span>
              <span>Wed</span>
              <span>Thu</span>
              <span>Fri</span>
              <span>Sat</span>
              <span>Sun</span>
            </div>

            {/* Calendar Numbers (Sep 1 to 30) */}
            <div className="grid grid-cols-7 gap-y-2 text-center text-xs">
              {[
                { day: 1, isNextMonth: false },
                { day: 2, isNextMonth: false },
                { day: 3, isNextMonth: false },
                { day: 4, isNextMonth: false },
                { day: 5, isNextMonth: false },
                { day: 6, isNextMonth: false },
                { day: 7, isNextMonth: false },

                // Week 2
                { day: 8, isNextMonth: false },
                { day: 9, isNextMonth: false },
                { day: 10, isNextMonth: false },
                { day: 11, isNextMonth: false },
                { day: 12, isNextMonth: false },
                { day: 13, isNextMonth: false },
                { day: 14, isNextMonth: false },

                // Week 3
                { day: 15, isNextMonth: false },
                { day: 16, isNextMonth: false },
                { day: 17, isNextMonth: false },
                { day: 18, isNextMonth: false },
                { day: 19, isNextMonth: false },
                { day: 20, isNextMonth: false },
                { day: 21, isNextMonth: false },

                // Week 4
                { day: 22, isNextMonth: false },
                { day: 23, isNextMonth: false, isToday: true }, // Today: active dark olive circle
                { day: 24, isNextMonth: false },
                { day: 25, isNextMonth: false },
                { day: 26, isNextMonth: false },
                { day: 27, isNextMonth: false },
                { day: 28, isNextMonth: false },

                // Week 5
                { day: 29, isNextMonth: false },
                { day: 30, isNextMonth: false },
                { day: 1, isNextMonth: true },
                { day: 2, isNextMonth: true },
                { day: 3, isNextMonth: true },
                { day: 4, isNextMonth: true },
                { day: 5, isNextMonth: true },
              ].map((item, idx) => {
                const isToday = item.isToday;
                const isNextMonth = item.isNextMonth;

                // Derive activity dots from real activityLogs
                const dateKey = `2025-09-${String(item.day).padStart(2, '0')}`;
                const dayLogs = !isNextMonth ? activityLogs.filter(l => l.date === dateKey) : [];
                const hasCompleted = dayLogs.some(l => l.type === 'topic_completed');
                const hasPartial = dayLogs.some(l => l.type === 'revision_completed');

                return (
                  <div
                    key={idx}
                    onClick={() => setActiveTab('calendar')}
                    className="flex flex-col items-center justify-center cursor-pointer group"
                  >
                    <div
                      className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-semibold ${
                        isToday
                          ? 'bg-[#3E5C38] text-white shadow-xs'
                          : isNextMonth
                          ? 'text-stone-300'
                          : 'text-stone-700 group-hover:bg-stone-100'
                      }`}
                    >
                      {item.day}
                    </div>

                    {/* Indicator Dot (dynamic from real logs only) */}
                    <div className="h-1.5 flex items-center justify-center">
                      {!isToday && !isNextMonth && hasCompleted && (
                        <span className="w-1 h-1 rounded-full bg-[#3E5C38]" />
                      )}
                      {!isToday && !isNextMonth && !hasCompleted && hasPartial && (
                        <span className="w-1 h-1 rounded-full bg-[#D49A32]" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Calendar Legend */}
            <div className="flex items-center justify-center gap-4 pt-2 border-t border-[#F2EDE4]/60 text-[10px] text-stone-500 font-medium">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#3E5C38]" />
                Completed
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#D49A32]" />
                Partial
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-stone-300" />
                No activity
              </span>
            </div>
          </div>

          {/* 2. Study Consistency Heatmap Card */}
          <div className="p-5 rounded-2xl bg-white border border-[#EFEBE3] shadow-[0_2px_12px_rgba(60,50,30,0.02)] space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-stone-900">
                Study Consistency
              </h3>
              <span className="text-xs text-stone-500 font-medium">
                Last 6 months ▾
              </span>
            </div>

            {/* Heatmap Grid */}
            <div className="space-y-1.5">
              {/* Month Labels */}
              <div className="flex justify-between pl-7 text-[10px] text-stone-400 font-medium pr-1">
                <span>Apr</span>
                <span>May</span>
                <span>Jun</span>
                <span>Jul</span>
                <span>Aug</span>
                <span>Sep</span>
              </div>

              {/* Heatmap Rows (Mon to Sun) */}
              <div className="flex gap-2 text-[10px] text-stone-400">
                <div className="flex flex-col justify-between py-0.5 text-right w-5 font-medium leading-none">
                  <span>Mon</span>
                  <span>Tue</span>
                  <span>Wed</span>
                  <span>Thu</span>
                  <span>Fri</span>
                  <span>Sat</span>
                  <span>Sun</span>
                </div>

                {/* 20 Columns of Week Cells */}
                <div className="flex-1 grid grid-cols-20 gap-1">
                  {Array.from({ length: 20 * 7 }).map((_, cIdx) => {
                    // Start clean in cream #EAE5DC, color if real logs exist
                    let bg = '#EAE5DC';
                    if (activityLogs.length > 0) {
                      const logCount = activityLogs.length;
                      if (cIdx === 20 * 7 - 1) {
                        bg = logCount > 3 ? '#3E5C38' : '#8EA685';
                      }
                    }

                    return (
                      <div
                        key={cIdx}
                        className="w-2.5 h-2.5 rounded-xs transition-colors"
                        style={{ backgroundColor: bg }}
                      />
                    );
                  })}
                </div>
              </div>

              {/* Less / More Legend */}
              <div className="flex items-center justify-end gap-1.5 text-[10px] text-stone-400 pt-1 pr-1 font-medium">
                <span>Less</span>
                <span className="w-2 h-2 rounded-xs bg-[#EAE5DC]" />
                <span className="w-2 h-2 rounded-xs bg-[#C4D4BF]" />
                <span className="w-2 h-2 rounded-xs bg-[#8EA685]" />
                <span className="w-2 h-2 rounded-xs bg-[#52744B]" />
                <span className="w-2 h-2 rounded-xs bg-[#3E5C38]" />
                <span>More</span>
              </div>
            </div>
          </div>

          {/* 3. Quick Insights Card */}
          <div className="p-5 rounded-2xl bg-white border border-[#EFEBE3] shadow-[0_2px_12px_rgba(60,50,30,0.02)] space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-stone-900 flex items-center gap-1.5">
                <span className="text-[#C48D2E]">✦</span>
                <span>Quick Insights</span>
              </h3>
              <button
                onClick={() => setActiveTab('analytics')}
                className="text-xs text-[#B88022] font-semibold hover:underline"
              >
                View All
              </button>
            </div>

            {/* 3 Insight items */}
            <div className="space-y-3">
              {/* Insight 1: Syllabus completion summary */}
              <div
                onClick={() => setActiveTab('analytics')}
                className="p-3 rounded-xl hover:bg-[#F9F7F3] flex items-center justify-between gap-3 cursor-pointer transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#E8EFE5] text-[#3E6135] flex items-center justify-center shrink-0">
                    <ArrowUpRight className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-stone-900">
                      {completedTopics > 0 ? `+${completedTopics} topics` : '0 topics completed'}
                    </h4>
                    <p className="text-[11px] text-stone-400">
                      {completedTopics > 0 ? `${totalTopics - completedTopics} topics remaining` : 'Check off your first topic to begin'}
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-stone-400 group-hover:text-stone-700 transition-colors" />
              </div>

              {/* Insight 2: Overdue or recommended subject */}
              <div
                onClick={() => {
                  setSelectedSubjectId(overdueTopics.length > 0 ? overdueTopics[0].subjectId : 'os');
                  setActiveTab('subjects');
                }}
                className="p-3 rounded-xl hover:bg-[#F9F7F3] flex items-center justify-between gap-3 cursor-pointer transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#FAF0D9] text-[#9C6E15] flex items-center justify-center shrink-0">
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-stone-900">
                      {overdueTopics.length > 0
                        ? `${overdueTopics[0].subjectName}`
                        : 'Operating Systems & DSA'}
                    </h4>
                    <p className="text-[11px] text-stone-400">
                      {overdueTopics.length > 0
                        ? `${overdueTopics.length} overdue topics to revise`
                        : 'Highest exam weightage subjects'}
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-stone-400 group-hover:text-stone-700 transition-colors" />
              </div>

              {/* Insight 3: Core high-priority count */}
              <div
                onClick={() => setActiveTab('revision')}
                className="p-3 rounded-xl hover:bg-[#F9F7F3] flex items-center justify-between gap-3 cursor-pointer transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#F7EBD2] text-[#B88022] flex items-center justify-center shrink-0">
                    <Target className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-stone-900">
                      {criticalPendingCount} high-priority topics
                    </h4>
                    <p className="text-[11px] text-stone-400">
                      Focus on DSA, OS and CN first
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-stone-400 group-hover:text-stone-700 transition-colors" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Task Modal */}
      {isAddTaskModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in">
          <form
            onSubmit={handleAddNewTask}
            className="w-full max-w-md bg-white border border-[#EFEBE3] rounded-2xl p-6 shadow-2xl space-y-4"
          >
            <h3 className="font-bold text-base text-stone-900">
              Add Today&apos;s Revision Task
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-stone-600 block mb-1 font-medium">Task / Topic Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Virtual Memory & Paging"
                  value={newTaskName}
                  onChange={e => setNewTaskName(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F7F4EE] border border-[#EFEBE3] rounded-xl text-stone-900 text-xs outline-none focus:border-[#C59134]"
                />
              </div>

              <div>
                <label className="text-stone-600 block mb-1 font-medium">GATE Subject</label>
                <select
                  value={newTaskSubject}
                  onChange={e => setNewTaskSubject(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F7F4EE] border border-[#EFEBE3] rounded-xl text-stone-900 text-xs outline-none focus:border-[#C59134]"
                >
                  {subjectsData.map(s => (
                    <option key={s.id} value={s.name}>
                      {s.name} ({s.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-stone-600 block mb-1 font-medium">Scheduled Time</label>
                <input
                  type="text"
                  value={newTaskTime}
                  onChange={e => setNewTaskTime(e.target.value)}
                  placeholder="e.g. 08:00 PM"
                  className="w-full px-3 py-2 bg-[#F7F4EE] border border-[#EFEBE3] rounded-xl text-stone-900 text-xs outline-none focus:border-[#C59134]"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-[#EFEBE3]">
              <button
                type="button"
                onClick={() => setIsAddTaskModalOpen(false)}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold text-stone-600 hover:bg-stone-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-xl bg-[#C59134] hover:bg-[#B68128] text-white text-xs font-semibold shadow-xs"
              >
                Add to Schedule
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
