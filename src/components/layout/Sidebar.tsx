import React from 'react';
import { useApp } from '../../context/AppContext';
import { ActiveTab } from '../../types';
import {
  Home,
  BookOpen,
  CheckSquare,
  Calendar,
  BarChart2,
  Settings,
  Target,
  X
} from 'lucide-react';

import { daysUntilExam } from '../../utils/date';

interface SidebarProps {
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isMobileOpen, onCloseMobile }) => {
  const { activeTab, setActiveTab, flatTopics, settings } = useApp();

  const totalTopics = flatTopics.length;
  const completedTopics = flatTopics.filter(t => t.topic.status === 'completed').length;
  const completionPercent = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;
  const daysLeft = daysUntilExam(settings.examDate);
  const examYear = new Date(settings.examDate).getFullYear() || 2026;

  const navItems: { id: ActiveTab; label: string; icon: React.ElementType }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'subjects', label: 'Subjects', icon: BookOpen },
    { id: 'revision', label: 'Revision Queue', icon: CheckSquare },
    { id: 'calendar', label: 'Calendar', icon: Calendar },
    { id: 'analytics', label: 'Analytics', icon: BarChart2 },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  const handleNavClick = (tab: ActiveTab) => {
    setActiveTab(tab);
    onCloseMobile();
  };

  const content = (
    <div className="flex flex-col h-full bg-[#F8F5EB] border-r border-[#EDE4D0] text-[#1D2417] relative overflow-hidden select-none">
      {/* Background organic waves illustration in bottom-left */}
      <div className="absolute bottom-0 left-0 w-full h-72 pointer-events-none z-0 opacity-40">
        <svg viewBox="0 0 240 300" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          <path
            d="M-40 220 C40 180 120 250 200 200 C240 175 280 190 320 180 L320 320 L-40 320 Z"
            fill="url(#wave-grad-1)"
          />
          <path
            d="M-40 250 C30 220 100 270 180 230 C230 205 270 230 320 220 L320 320 L-40 320 Z"
            fill="url(#wave-grad-2)"
          />
          <defs>
            <linearGradient id="wave-grad-1" x1="0" y1="200" x2="240" y2="300" gradientUnits="userSpaceOnUse">
              <stop stopColor="#486B2C" stopOpacity="0.3" />
              <stop stopColor="#EAF2E4" stopOpacity="0.05" />
            </linearGradient>
            <linearGradient id="wave-grad-2" x1="0" y1="220" x2="240" y2="320" gradientUnits="userSpaceOnUse">
              <stop stopColor="#C68A2C" stopOpacity="0.25" />
              <stop stopColor="#FBF3DC" stopOpacity="0.05" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Brand Header */}
      <div className="p-6 pb-5 flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          {/* Sprout Logo from image: 2 Sap Green leaves + 1 Crème Ochre leaf */}
          <div className="w-8 h-8 shrink-0 flex items-center justify-center">
            <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-7 h-7">
              {/* Left Sap Green Leaf */}
              <path
                d="M16 19C16 19 10 17 8 11C6 5 11 5 13 8C15 11 16 19 16 19Z"
                fill="#486B2C"
              />
              {/* Right Deep Sap Green Leaf */}
              <path
                d="M16 19C16 19 22 17 24 11C26 5 21 5 19 8C17 11 16 19 16 19Z"
                fill="#385522"
              />
              {/* Top Crème Ochre Leaf */}
              <path
                d="M16 19C16 19 13 12 14 6C15 1 18 1 18 6C18 11 16 19 16 19Z"
                fill="#C68A2C"
              />
            </svg>
          </div>

          <div>
            <h1 className="font-extrabold text-base tracking-tight text-[#1D2417] leading-tight">
              GATE
            </h1>
            <p className="text-[11px] text-[#7A8072] font-medium">Revision Tracker</p>
          </div>
        </div>

        {/* Mobile close button */}
        <button
          onClick={onCloseMobile}
          className="p-1 rounded-lg text-[#7A8072] hover:text-[#1D2417] md:hidden"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation items */}
      <div className="px-3.5 py-2 space-y-1 z-10">
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={`w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-[#F6E3B4] text-[#221C11] shadow-xs'
                  : 'text-[#5A6150] hover:text-[#1D2417] hover:bg-[#F2EBDA]'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-[#221C11]' : 'text-[#7A8072]'}`} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Bottom section matching the screenshot */}
      <div className="mt-auto p-5 z-10 space-y-5">
        {/* Quote in italic serif */}
        <div className="text-left">
          <p className="font-serif italic text-[13px] text-[#7A6233] leading-snug">
            &ldquo;A little progress every day adds up to big results.&rdquo;
          </p>
        </div>

        {/* Target exam widget */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-[#EAF2E4] text-[#486B2C] flex items-center justify-center shrink-0">
              <Target className="w-3.5 h-3.5" />
            </div>
            <div>
              <div className="font-bold text-xs text-[#1D2417] leading-tight">
                GATE {examYear}
              </div>
              <div className="text-[10px] text-[#7A8072]">
                Exam in {daysLeft} days
              </div>
            </div>
          </div>

          {/* Progress bar + percentage */}
          <div className="flex items-center gap-2.5">
            <div className="flex-1 h-1.5 bg-[#ECE4D2] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#486B2C] rounded-full transition-all duration-500"
                style={{ width: `${completionPercent}%` }}
              />
            </div>
            <span className="text-[11px] font-bold text-[#1D2417]">{completionPercent}%</span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden md:flex md:w-56 lg:w-60 flex-col fixed inset-y-0 z-40">
        {content}
      </aside>

      {/* Mobile Drawer Overlay */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden bg-stone-950/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-60 h-full animate-in slide-in-from-left duration-200">
            {content}
          </div>
        </div>
      )}
    </>
  );
};
