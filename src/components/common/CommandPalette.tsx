import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { Search, X, BookOpen, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { ConfidenceLevel } from '../../types';
import { FlatTopicWithSubject } from '../../utils/revision';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose }) => {
  const { flatTopics, setActiveTab, setSelectedSubjectId, toggleTopicStatus } = useApp();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Global shortcut Ctrl+K / Cmd+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else setQuery('');
      } else if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const filtered = flatTopics.filter((item: FlatTopicWithSubject) => {
    if (!query.trim()) return false;
    const q = query.toLowerCase();
    return (
      item.topic.name.toLowerCase().includes(q) ||
      item.subjectName.toLowerCase().includes(q) ||
      item.chapterName.toLowerCase().includes(q) ||
      item.subjectCode.toLowerCase().includes(q)
    );
  }).slice(0, 15);

  const handleSelect = (item: FlatTopicWithSubject) => {
    setSelectedSubjectId(item.subjectId);
    setActiveTab('subjects', item.subjectId);
    onClose();
  };

  const getConfidenceBadge = (confidence: ConfidenceLevel) => {
    switch (confidence) {
      case 'strong': return <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#EAF2E4] text-[#486B2C] border border-[#D3E3C9]">Strong</span>;
      case 'good': return <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#EAF2E4] text-[#385522] border border-[#D3E3C9]">Good</span>;
      case 'average': return <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FBF3DC] text-[#C68A2C] border border-[#EEDDB8]">Average</span>;
      case 'weak': return <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FBF0D3] text-[#8E5B13] border border-[#EDE4D0]">Weak</span>;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-stone-900/40 backdrop-blur-md animate-in fade-in duration-150">
      <div 
        className="w-full max-w-2xl bg-white dark:bg-stone-900 border border-[#EDE4D0] dark:border-stone-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center px-4 py-3.5 border-b border-[#EDE4D0] dark:border-stone-800 gap-3">
          <Search className="w-4 h-4 text-stone-400" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Search GATE topics, chapters, or subjects (e.g., Paging, Dijkstra, Normalization)..."
            className="flex-1 bg-transparent border-none outline-none text-stone-900 dark:text-stone-100 placeholder-stone-400 text-xs sm:text-sm"
          />
          <button
            onClick={onClose}
            className="p-1 rounded-full text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="max-h-96 overflow-y-auto p-2 divide-y divide-[#EDE4D0]/40 dark:divide-stone-800/40">
          {query.trim() === '' ? (
            <div className="py-12 text-center text-stone-400 text-xs">
              <BookOpen className="w-7 h-7 mx-auto mb-2 text-[#C68A2C]" />
              <p className="font-medium text-stone-600 dark:text-stone-300">Search across all 11 GATE CS subjects</p>
              <p className="text-[11px] text-stone-400 mt-1">Press <kbd className="px-1.5 py-0.5 rounded bg-[#FBF3DC] text-[#8E5B13] border border-[#EDE4D0]">Esc</kbd> to exit</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-10 text-center text-stone-400 text-xs">
              <AlertCircle className="w-7 h-7 mx-auto mb-2 text-[#C68A2C]" />
              <p>No matching GATE topics found for &ldquo;{query}&rdquo;</p>
            </div>
          ) : (
            filtered.map((item: FlatTopicWithSubject, index: number) => {
              const isSelected = index === selectedIndex;
              const isDone = item.topic.status === 'completed';

              return (
                <div
                  key={item.topic.id}
                  onClick={() => handleSelect(item)}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`flex items-center justify-between p-3 rounded-2xl cursor-pointer transition-colors ${
                    isSelected ? 'bg-[#F2EBDA] dark:bg-stone-800' : 'hover:bg-[#F8F5EB] dark:hover:bg-stone-800/50'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0 pr-3">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleTopicStatus(item.subjectId, item.chapterId, item.topic.id);
                      }}
                      className="text-stone-400 hover:text-[#486B2C] transition-colors"
                    >
                      {isDone ? (
                        <CheckCircle2 className="w-4 h-4 text-[#486B2C]" />
                      ) : (
                        <div className="w-4 h-4 rounded-full border border-[#EDE4D0] dark:border-stone-600 hover:border-[#486B2C]" />
                      )}
                    </button>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-semibold truncate ${isDone ? 'line-through text-stone-400' : 'text-stone-900 dark:text-stone-100'}`}>
                          {item.topic.name}
                        </span>
                        {getConfidenceBadge(item.topic.confidence)}
                      </div>
                      <div className="text-[11px] text-stone-500 flex items-center gap-1.5 mt-0.5">
                        <span className="font-bold text-stone-700 dark:text-stone-300">{item.subjectCode}</span>
                        <span>•</span>
                        <span className="truncate">{item.chapterName}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-stone-400 shrink-0">
                    {item.topic.revisionCount > 0 && (
                      <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#EFE8DE] dark:bg-stone-800 text-stone-700 dark:text-stone-300 text-[10px] font-medium">
                        <Clock className="w-3 h-3" />
                        {item.topic.revisionCount} rev
                      </span>
                    )}
                    <span className="text-[10px] font-semibold text-stone-400">
                      Jump →
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="px-4 py-2.5 bg-[#FAF7F2] dark:bg-stone-950/60 border-t border-[#E7DFD5] dark:border-stone-800 text-[11px] text-stone-500 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <span><kbd className="px-1.5 py-0.2 bg-white dark:bg-stone-800 rounded border border-[#E7DFD5] dark:border-stone-700">↵</kbd> select</span>
            <span><kbd className="px-1.5 py-0.2 bg-white dark:bg-stone-800 rounded border border-[#E7DFD5] dark:border-stone-700">↑↓</kbd> navigate</span>
          </div>
          <span>Minimalist GATE CS Tracker</span>
        </div>
      </div>
    </div>
  );
};
