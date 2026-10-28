import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Subject, Topic, TopicStatus, ConfidenceLevel, SubjectPriority, TopicPriority, Chapter } from '../types';
import { getLocalDateString, formatHumanDate, formatRelativeDate } from '../utils/date';
import {
  CheckCircle2,
  Circle,
  Clock,
  ChevronDown,
  ChevronRight,
  Filter,
  Plus,
  Trash2,
  Edit2,
  AlertTriangle,
  FileText,
  Search,
  ArrowUp,
  ArrowDown
} from 'lucide-react';

export const SubjectsView: React.FC = () => {
  const {
    subjects,
    selectedSubjectId,
    setSelectedSubjectId,
    toggleTopicStatus,
    updateTopicDetails,
    bulkMarkChapter,
    resetChapter,
    reorderSubjects,
    updateSubject,
    addSubject,
    deleteSubject
  } = useApp();

  const [searchFilter, setSearchFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | TopicStatus | 'weak' | 'overdue'>('all');
  const [expandedChapters, setExpandedChapters] = useState<Record<string, boolean>>({});
  const [activeTopicForNotes, setActiveTopicForNotes] = useState<{
    subjectId: string;
    chapterId: string;
    topic: Topic;
  } | null>(null);

  // Subject management state
  const [isEditingSubject, setIsEditingSubject] = useState<Subject | null>(null);
  const [isAddingSubject, setIsAddingSubject] = useState(false);
  const [newSubjectName, setNewSubjectName] = useState('');
  const [newSubjectCode, setNewSubjectCode] = useState('');
  const [newSubjectPriority, setNewSubjectPriority] = useState<SubjectPriority>('high');
  const [newSubjectWeightage, setNewSubjectWeightage] = useState(8);

  const currentSubject = subjects.find((s: Subject) => s.id === selectedSubjectId) || subjects[0];
  const todayStr = getLocalDateString();

  // Helper to toggle chapter collapse
  const toggleChapter = (chapterId: string) => {
    setExpandedChapters(prev => ({
      ...prev,
      [chapterId]: prev[chapterId] === false ? true : false
    }));
  };

  const expandAll = () => {
    const allExpanded: Record<string, boolean> = {};
    currentSubject?.chapters.forEach((c: Chapter) => (allExpanded[c.id] = true));
    setExpandedChapters(allExpanded);
  };

  const collapseAll = () => {
    const allCollapsed: Record<string, boolean> = {};
    currentSubject?.chapters.forEach((c: Chapter) => (allCollapsed[c.id] = false));
    setExpandedChapters(allCollapsed);
  };

  // Reordering subjects
  const moveSubject = (index: number, direction: 'up' | 'down') => {
    const newSubjects = [...subjects];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newSubjects.length) return;

    const temp = newSubjects[index];
    newSubjects[index] = newSubjects[targetIndex];
    newSubjects[targetIndex] = temp;
    reorderSubjects(newSubjects);
  };

  // Save new subject
  const handleAddSubjectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubjectName.trim()) return;

    const id = newSubjectName.toLowerCase().replace(/[^a-z0-9]/g, '-');
    const newSubj: Subject = {
      id,
      name: newSubjectName.trim(),
      code: newSubjectCode.trim() || newSubjectName.substring(0, 3).toUpperCase(),
      order: subjects.length + 1,
      priority: newSubjectPriority,
      weightage: newSubjectWeightage,
      icon: 'BookOpen',
      chapters: [
        {
          id: `${id}-c1`,
          name: 'Core Concepts',
          topics: [
            {
              id: `${id}-t1`,
              name: 'Fundamental Theory',
              status: 'not_started',
              confidence: 'average',
              priority: 'high',
              revisionCount: 0,
              nextRevisionAt: null,
              lastRevisedAt: null,
              completedAt: null,
              notes: '',
              history: []
            }
          ]
        }
      ]
    };

    addSubject(newSubj);
    setSelectedSubjectId(newSubj.id);
    setIsAddingSubject(false);
    setNewSubjectName('');
    setNewSubjectCode('');
  };

  // Filter topics within the selected subject
  const filterTopics = (topics: Topic[]) => {
    return topics.filter(t => {
      // Search text
      if (searchFilter.trim() && !t.name.toLowerCase().includes(searchFilter.toLowerCase())) {
        return false;
      }
      // Status / Confidence / Overdue filter
      if (statusFilter === 'all') return true;
      if (statusFilter === 'weak') return t.confidence === 'weak';
      if (statusFilter === 'overdue') {
        return Boolean(t.nextRevisionAt && t.nextRevisionAt < todayStr);
      }
      return t.status === statusFilter;
    });
  };

  const getPriorityBadge = (priority: SubjectPriority) => {
    switch (priority) {
      case 'critical':
        return (
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#FBF0D3] text-[#8E5B13] border border-[#EED7A2]">
            Critical
          </span>
        );
      case 'high':
        return (
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#EAF2E4] text-[#3A5B20] border border-[#CFE1C5]">
            High
          </span>
        );
      case 'medium':
        return (
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#FAF4E4] text-[#A6731B] border border-[#EFE0BC]">
            Medium
          </span>
        );
      case 'low':
      default:
        return (
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#F1F6EE] text-[#55783E] border border-[#DCE8D5]">
            Low
          </span>
        );
    }
  };

  // Compute stats for current subject
  let currentSubjectTotal = 0;
  let currentSubjectCompleted = 0;
  if (currentSubject) {
    currentSubject.chapters.forEach((c: Chapter) => {
      c.topics.forEach((t: Topic) => {
        currentSubjectTotal++;
        if (t.status === 'completed') currentSubjectCompleted++;
      });
    });
  }
  const currentSubjectPct = currentSubjectTotal > 0 ? Math.round((currentSubjectCompleted / currentSubjectTotal) * 100) : 0;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Header Matching Dashboard View */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs text-stone-500 font-medium block">
            GATE CSE 2026 SYLLABUS
          </span>
          <h2 className="text-2xl lg:text-3xl font-extrabold text-stone-900 tracking-tight flex items-center gap-2 mt-0.5">
            <span>Syllabus & Topic Tracking</span>
            <span className="text-xl">📚</span>
          </h2>
          <p className="text-xs text-stone-500 font-normal mt-0.5">
            Structured hierarchy: Subject → Chapter → Topic → Active Spaced Repetition
          </p>
        </div>

        <button
          onClick={() => setIsAddingSubject(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#486B2C] hover:bg-[#385522] text-white font-bold text-xs transition-all shadow-xs active:scale-95 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Custom Subject</span>
        </button>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Subjects Navigator (4 cols) */}
        <div className="lg:col-span-4 space-y-3">
          <div className="flex items-center justify-between text-xs font-semibold text-stone-500 px-1">
            <span>Subjects Library ({subjects.length})</span>
            <span>Historical Weight</span>
          </div>

          <div className="space-y-2 max-h-[calc(100vh-230px)] overflow-y-auto pr-1">
            {subjects.map((subj: Subject, index: number) => {
              const isSelected = subj.id === selectedSubjectId;

              // Calculate subject progress
              let total = 0;
              let done = 0;
              subj.chapters.forEach((c: Chapter) => c.topics.forEach((t: Topic) => {
                total++;
                if (t.status === 'completed') done++;
              }));
              const pct = total > 0 ? Math.round((done / total) * 100) : 0;

              return (
                <div
                  key={subj.id}
                  onClick={() => setSelectedSubjectId(subj.id)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer group ${
                    isSelected
                      ? 'bg-[#F6E3B4] border-[#E5CA8F] text-[#221C11] shadow-xs ring-1 ring-[#C68A2C]/20'
                      : 'bg-white border-[#EDE4D0] hover:border-[#DDD2BA] hover:bg-[#FAF7F0] text-stone-700 shadow-[0_2px_8px_rgba(60,50,30,0.02)]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className={`text-xs font-mono font-bold shrink-0 px-2 py-0.5 rounded-md border ${
                        isSelected
                          ? 'bg-[#221C11] text-[#F8F5EB] border-[#221C11]'
                          : 'bg-[#F8F5EB] text-stone-900 border-[#EDE4D0]'
                      }`}>
                        {subj.code}
                      </span>
                      <h4 className="font-bold text-sm truncate">
                        {subj.name}
                      </h4>
                    </div>

                    {/* Reordering and Edit buttons */}
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
                      <button
                        onClick={() => moveSubject(index, 'up')}
                        disabled={index === 0}
                        className="p-1 hover:text-stone-950 disabled:opacity-30"
                        title="Move Up"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => moveSubject(index, 'down')}
                        disabled={index === subjects.length - 1}
                        className="p-1 hover:text-stone-950 disabled:opacity-30"
                        title="Move Down"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setIsEditingSubject(subj)}
                        className="p-1 hover:text-stone-900"
                        title="Edit Subject"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-stone-500 mb-2">
                    <div className="flex items-center gap-2">
                      {getPriorityBadge(subj.priority)}
                      <span className={isSelected ? 'text-[#5A461E] font-medium' : 'text-stone-500'}>
                        ~{subj.weightage} Marks
                      </span>
                    </div>
                    <span className="font-black text-stone-900">{pct}%</span>
                  </div>

                  {/* Progress bar */}
                  <div className={`w-full h-1.5 rounded-full overflow-hidden ${isSelected ? 'bg-[#E5D7B7]' : 'bg-[#ECE4D2]'}`}>
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        pct === 100 ? 'bg-[#486B2C]' : 'bg-[#486B2C]'
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Selected Subject Checklist (8 cols) */}
        {currentSubject && (
          <div className="lg:col-span-8 space-y-5">
            {/* Subject Detail Header Card */}
            <div className="p-5 sm:p-6 rounded-2xl bg-white border border-[#EDE4D0] shadow-[0_2px_12px_rgba(60,50,30,0.02)] space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2.5 mb-1.5">
                    <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-[#FDF6E5] text-[#8E5B13] border border-[#EEDDB8]">
                      {currentSubject.code}
                    </span>
                    <h3 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight font-serif">
                      {currentSubject.name}
                    </h3>
                  </div>
                  <div className="flex flex-wrap items-center gap-2.5 text-xs text-stone-500">
                    <div className="flex items-center gap-1.5">
                      <span>Priority:</span>
                      {getPriorityBadge(currentSubject.priority)}
                    </div>
                    <span>•</span>
                    <span>Historical GATE Weightage: <strong className="text-stone-900 font-bold">~{currentSubject.weightage} Marks</strong></span>
                  </div>
                </div>

                <div className="text-left sm:text-right">
                  <div className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">{currentSubjectPct}%</div>
                  <div className="text-xs text-stone-500 font-medium">
                    {currentSubjectCompleted} / {currentSubjectTotal} topics completed
                  </div>
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full h-2 bg-[#ECE4D2] rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-[#486B2C] transition-all duration-500"
                  style={{ width: `${currentSubjectPct}%` }}
                />
              </div>

              {/* Controls bar: Search, Filter, Expand/Collapse */}
              <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-xs">
                {/* Search within subject */}
                <div className="relative flex-1">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-stone-400" />
                  <input
                    type="text"
                    value={searchFilter}
                    onChange={e => setSearchFilter(e.target.value)}
                    placeholder={`Search within ${currentSubject.name}...`}
                    className="w-full pl-8 pr-3 py-2 rounded-xl bg-white border border-[#EDE4D0] text-stone-900 placeholder-stone-400 outline-none focus:border-[#486B2C] focus:ring-1 focus:ring-[#486B2C]/20 text-xs transition-all shadow-2xs"
                  />
                </div>

                {/* Status Filter */}
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5">
                    <Filter className="w-3.5 h-3.5 text-stone-500" />
                    <select
                      value={statusFilter}
                      onChange={e => setStatusFilter(e.target.value as any)}
                      className="bg-white border border-[#EDE4D0] text-stone-700 rounded-xl px-3 py-2 outline-none focus:border-[#486B2C] text-xs shadow-2xs"
                    >
                      <option value="all">All Topics</option>
                      <option value="completed">Completed</option>
                      <option value="in_progress">In Progress</option>
                      <option value="not_started">Not Started</option>
                      <option value="weak">Weak Confidence</option>
                      <option value="overdue">Overdue Revision</option>
                    </select>
                  </div>

                  {/* Expand / Collapse All */}
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={expandAll}
                      className="px-3 py-2 rounded-xl bg-[#FAF7F0] hover:bg-[#F2EBDA] text-stone-700 border border-[#EDE4D0] transition-colors font-medium shadow-2xs"
                    >
                      Expand
                    </button>
                    <button
                      onClick={collapseAll}
                      className="px-3 py-2 rounded-xl bg-[#FAF7F0] hover:bg-[#F2EBDA] text-stone-700 border border-[#EDE4D0] transition-colors font-medium shadow-2xs"
                    >
                      Collapse
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Chapters and Topics Accordion */}
            <div className="space-y-4">
              {currentSubject.chapters.map((chapter: Chapter) => {
                const isExpanded = expandedChapters[chapter.id] !== false;
                const chapterFilteredTopics = filterTopics(chapter.topics);

                const chapTotal = chapter.topics.length;
                const chapCompleted = chapter.topics.filter((t: Topic) => t.status === 'completed').length;
                const chapPct = chapTotal > 0 ? Math.round((chapCompleted / chapTotal) * 100) : 0;

                return (
                  <div
                    key={chapter.id}
                    className="rounded-2xl bg-white border border-[#EDE4D0] shadow-[0_2px_12px_rgba(60,50,30,0.02)] overflow-hidden"
                  >
                    {/* Chapter Header */}
                    <div
                      onClick={() => toggleChapter(chapter.id)}
                      className="p-4 bg-[#FAF7F0] hover:bg-[#F2EBDA]/60 cursor-pointer flex items-center justify-between transition-colors border-b border-[#EDE4D0]"
                    >
                      <div className="flex items-center gap-3">
                        <button className="text-stone-500 hover:text-stone-900">
                          {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                        </button>
                        <div>
                          <h4 className="font-bold text-sm text-stone-900">
                            {chapter.name}
                          </h4>
                          <span className="text-xs text-stone-500 font-medium">
                            {chapCompleted} of {chapTotal} topics completed ({chapPct}%)
                          </span>
                        </div>
                      </div>

                      {/* Bulk actions menu */}
                      <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                        <button
                          onClick={() => bulkMarkChapter(currentSubject.id, chapter.id, 'completed')}
                          className="px-3 py-1 rounded-lg bg-[#EAF2E4] hover:bg-[#D3E3C9] text-[#385522] border border-[#D3E3C9] text-xs font-semibold transition-colors"
                          title="Mark all topics in chapter completed"
                        >
                          Complete All
                        </button>
                        <button
                          onClick={() => resetChapter(currentSubject.id, chapter.id)}
                          className="px-2.5 py-1 rounded-lg bg-white hover:bg-[#F2EBDA] text-stone-600 text-xs border border-[#EDE4D0] transition-colors font-medium"
                          title="Reset all topics to Not Started"
                        >
                          Reset
                        </button>
                      </div>
                    </div>

                    {/* Topics List */}
                    {isExpanded && (
                      <div className="divide-y divide-[#EDE4D0]/60 p-2">
                        {chapterFilteredTopics.length === 0 ? (
                          <div className="py-6 text-center text-xs text-stone-400">
                            No topics matching the current filter.
                          </div>
                        ) : (
                          chapterFilteredTopics.map(topic => {
                            const isDone = topic.status === 'completed';
                            const isInProgress = topic.status === 'in_progress';
                            const isOverdue = Boolean(topic.nextRevisionAt && topic.nextRevisionAt < todayStr);

                            return (
                              <div
                                key={topic.id}
                                className={`p-3 rounded-xl transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                                  isDone
                                    ? 'bg-[#FAF7F0]/40 text-stone-400'
                                    : 'hover:bg-[#FAF7F0] text-stone-800'
                                }`}
                              >
                                {/* Left: Checkbox + Topic Name */}
                                <div className="flex items-start sm:items-center gap-3 flex-1 min-w-0">
                                  {/* 1-Click Checkbox */}
                                  <button
                                    onClick={() =>
                                      toggleTopicStatus(currentSubject.id, chapter.id, topic.id)
                                    }
                                    className="mt-0.5 sm:mt-0 text-stone-400 hover:text-[#486B2C] transition-transform active:scale-90"
                                    title={isDone ? 'Mark as Not Started' : 'Mark as Completed (1-click)'}
                                  >
                                    {isDone ? (
                                      <CheckCircle2 className="w-5 h-5 text-[#486B2C] fill-[#EAF2E4]" />
                                    ) : isInProgress ? (
                                      <Circle className="w-5 h-5 text-[#C68A2C] fill-[#FBF3DC]" />
                                    ) : (
                                      <div className="w-5 h-5 rounded-full border-2 border-[#DDD2BA] hover:border-[#486B2C] transition-colors" />
                                    )}
                                  </button>

                                  <div className="min-w-0 flex-1">
                                    <div className="flex flex-wrap items-center gap-2">
                                      <span
                                        className={`text-sm font-semibold ${
                                          isDone ? 'line-through text-stone-400' : 'text-stone-900'
                                        }`}
                                      >
                                        {topic.name}
                                      </span>

                                      {/* Confidence Selector */}
                                      <select
                                        value={topic.confidence}
                                        onChange={e =>
                                          updateTopicDetails(currentSubject.id, chapter.id, topic.id, {
                                            confidence: e.target.value as ConfidenceLevel
                                          })
                                        }
                                        className="text-[10px] font-semibold rounded-md px-1.5 py-0.5 bg-white border border-[#EDE4D0] text-stone-700 outline-none focus:border-[#486B2C]"
                                        title="Confidence Level"
                                      >
                                        <option value="weak">Weak ⚠️</option>
                                        <option value="average">Average ⚖️</option>
                                        <option value="good">Good 👍</option>
                                        <option value="strong">Strong 🚀</option>
                                      </select>

                                      {/* Personal Priority */}
                                      <select
                                        value={topic.priority}
                                        onChange={e =>
                                          updateTopicDetails(currentSubject.id, chapter.id, topic.id, {
                                            priority: e.target.value as TopicPriority
                                          })
                                        }
                                        className="text-[10px] font-medium rounded-md px-1.5 py-0.5 bg-white border border-[#EDE4D0] text-stone-500 outline-none focus:border-[#486B2C]"
                                        title="Topic Priority"
                                      >
                                        <option value="critical">Critical</option>
                                        <option value="high">High</option>
                                        <option value="medium">Medium</option>
                                        <option value="low">Low</option>
                                      </select>

                                      {isOverdue && (
                                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FBF0D3] text-[#8E5B13] border border-[#EED7A2] flex items-center gap-1">
                                          <AlertTriangle className="w-3 h-3" />
                                          Overdue
                                        </span>
                                      )}
                                    </div>

                                    {/* Revision & completion metadata */}
                                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-stone-500 mt-1">
                                      {topic.completedAt && (
                                        <span>Done: {formatHumanDate(topic.completedAt.slice(0, 10))}</span>
                                      )}
                                      {topic.nextRevisionAt && (
                                        <span className="flex items-center gap-1">
                                          <Clock className="w-3.5 h-3.5 text-stone-400" />
                                          Next rev: <strong className={isOverdue ? 'text-[#8E5B13] font-bold' : 'text-stone-800'}>
                                            {formatRelativeDate(topic.nextRevisionAt)}
                                          </strong>
                                        </span>
                                      )}
                                      {topic.revisionCount > 0 && (
                                        <span className="font-medium text-[#486B2C]">({topic.revisionCount} revisions)</span>
                                      )}
                                      {topic.notes && (
                                        <span className="text-stone-600 italic truncate max-w-[200px]">
                                          📝 {topic.notes}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>

                                {/* Right: Notes button & Quick actions */}
                                <div className="flex items-center gap-2 self-end sm:self-auto">
                                  <button
                                    onClick={() =>
                                      setActiveTopicForNotes({
                                        subjectId: currentSubject.id,
                                        chapterId: chapter.id,
                                        topic
                                      })
                                    }
                                    className={`p-1.5 rounded-lg border text-xs flex items-center gap-1 transition-colors ${
                                      topic.notes
                                        ? 'bg-[#FDF6E5] border-[#EEDDB8] text-[#8E5B13]'
                                        : 'bg-white border-[#EDE4D0] text-stone-500 hover:text-stone-900 hover:bg-[#FAF7F0]'
                                    }`}
                                    title="Add or edit revision notes"
                                  >
                                    <FileText className="w-3.5 h-3.5" />
                                    <span className="text-[11px] font-medium">{topic.notes ? 'Notes' : '+ Note'}</span>
                                  </button>
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Revision Notes Modal */}
      {activeTopicForNotes && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/40 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-lg bg-white border border-[#EDE4D0] rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#EDE4D0]">
              <h3 className="font-bold text-base text-stone-900 font-serif">
                Revision Notes: {activeTopicForNotes.topic.name}
              </h3>
              <button
                onClick={() => setActiveTopicForNotes(null)}
                className="text-stone-400 hover:text-stone-700"
              >
                ✕
              </button>
            </div>

            <div>
              <label className="text-xs font-semibold text-stone-700 block mb-1.5">
                Key formulas, edge cases or revision mnemonics:
              </label>
              <textarea
                defaultValue={activeTopicForNotes.topic.notes}
                rows={4}
                id="topic-notes-textarea"
                placeholder="e.g., Remember Belady's anomaly occurs only in FIFO, not in LRU or OPT. Page fault rate increases with frame allocation..."
                className="w-full p-3 rounded-xl bg-[#FAF7F0] border border-[#EDE4D0] text-stone-900 text-xs outline-none focus:border-[#486B2C] focus:ring-1 focus:ring-[#486B2C]/20 transition-all"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setActiveTopicForNotes(null)}
                className="px-4 py-2 rounded-xl bg-[#FAF7F0] text-stone-700 text-xs font-medium hover:bg-[#F2EBDA] border border-[#EDE4D0] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const val = (document.getElementById('topic-notes-textarea') as HTMLTextAreaElement)?.value || '';
                  updateTopicDetails(
                    activeTopicForNotes.subjectId,
                    activeTopicForNotes.chapterId,
                    activeTopicForNotes.topic.id,
                    { notes: val }
                  );
                  setActiveTopicForNotes(null);
                }}
                className="px-4 py-2 rounded-xl bg-[#486B2C] hover:bg-[#385522] text-white text-xs font-bold shadow-xs transition-colors"
              >
                Save Notes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Subject Modal */}
      {isEditingSubject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/40 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md bg-white border border-[#EDE4D0] rounded-2xl p-6 shadow-2xl space-y-4">
            <h3 className="font-bold text-base text-stone-900 font-serif">Edit Subject Details</h3>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-stone-600 block mb-1">Subject Name</label>
                <input
                  type="text"
                  value={isEditingSubject.name}
                  onChange={e => setIsEditingSubject({ ...isEditingSubject, name: e.target.value })}
                  className="w-full px-3 py-2 bg-[#FAF7F0] border border-[#EDE4D0] rounded-xl text-stone-900 text-xs outline-none focus:border-[#486B2C]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-stone-600 block mb-1">Priority</label>
                <select
                  value={isEditingSubject.priority}
                  onChange={e => setIsEditingSubject({ ...isEditingSubject, priority: e.target.value as any })}
                  className="w-full px-3 py-2 bg-[#FAF7F0] border border-[#EDE4D0] rounded-xl text-stone-900 text-xs outline-none focus:border-[#486B2C]"
                >
                  <option value="critical">Critical</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-stone-600 block mb-1">Historical GATE Weightage (Marks)</label>
                <input
                  type="number"
                  value={isEditingSubject.weightage}
                  onChange={e => setIsEditingSubject({ ...isEditingSubject, weightage: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-[#FAF7F0] border border-[#EDE4D0] rounded-xl text-stone-900 text-xs outline-none focus:border-[#486B2C]"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-[#EDE4D0]">
              <button
                onClick={() => {
                  if (confirm(`Are you sure you want to delete ${isEditingSubject.name}?`)) {
                    deleteSubject(isEditingSubject.id);
                    setIsEditingSubject(null);
                  }
                }}
                className="text-xs text-[#8E5B13] hover:text-[#70470D] flex items-center gap-1 font-semibold"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Delete Subject
              </button>

              <div className="flex gap-2">
                <button
                  onClick={() => setIsEditingSubject(null)}
                  className="px-3.5 py-1.5 bg-[#FAF7F0] hover:bg-[#F2EBDA] text-stone-700 border border-[#EDE4D0] rounded-xl text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    updateSubject(isEditingSubject.id, isEditingSubject);
                    setIsEditingSubject(null);
                  }}
                  className="px-4 py-1.5 bg-[#486B2C] hover:bg-[#385522] text-white rounded-xl text-xs font-bold shadow-xs"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Custom Subject Modal */}
      {isAddingSubject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/40 backdrop-blur-xs animate-in fade-in">
          <form onSubmit={handleAddSubjectSubmit} className="w-full max-w-md bg-white border border-[#EDE4D0] rounded-2xl p-6 shadow-2xl space-y-4">
            <h3 className="font-bold text-base text-stone-900 font-serif">Add Custom Subject</h3>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-stone-600 block mb-1">Subject Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Artificial Intelligence"
                  value={newSubjectName}
                  onChange={e => setNewSubjectName(e.target.value)}
                  className="w-full px-3 py-2 bg-[#FAF7F0] border border-[#EDE4D0] rounded-xl text-stone-900 text-xs outline-none focus:border-[#486B2C]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-stone-600 block mb-1">Short Code</label>
                <input
                  type="text"
                  placeholder="e.g. AI"
                  value={newSubjectCode}
                  onChange={e => setNewSubjectCode(e.target.value)}
                  className="w-full px-3 py-2 bg-[#FAF7F0] border border-[#EDE4D0] rounded-xl text-stone-900 text-xs outline-none focus:border-[#486B2C]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-stone-600 block mb-1">Priority</label>
                <select
                  value={newSubjectPriority}
                  onChange={e => setNewSubjectPriority(e.target.value as any)}
                  className="w-full px-3 py-2 bg-[#FAF7F0] border border-[#EDE4D0] rounded-xl text-stone-900 text-xs outline-none focus:border-[#486B2C]"
                >
                  <option value="critical">Critical</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-stone-600 block mb-1">Estimated Marks Weightage</label>
                <input
                  type="number"
                  value={newSubjectWeightage}
                  onChange={e => setNewSubjectWeightage(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-[#FAF7F0] border border-[#EDE4D0] rounded-xl text-stone-900 text-xs outline-none focus:border-[#486B2C]"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-[#EDE4D0]">
              <button
                type="button"
                onClick={() => setIsAddingSubject(false)}
                className="px-3.5 py-1.5 bg-[#FAF7F0] hover:bg-[#F2EBDA] text-stone-700 border border-[#EDE4D0] rounded-xl text-xs font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-[#486B2C] hover:bg-[#385522] text-white rounded-xl text-xs font-bold shadow-xs"
              >
                Create Subject
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
