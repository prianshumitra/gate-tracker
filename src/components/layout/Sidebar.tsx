import React, { useRef, useEffect, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ActiveTab } from '../../types';
import {
  Home,
  BookOpen,
  CheckSquare,
  Calendar,
  BarChart2,
  Settings,
  X,
  Pin,
  ChevronLeft
} from 'lucide-react';
import { daysUntilExam } from '../../utils/date';

interface SidebarProps {
  isExpanded: boolean;
  setIsExpanded: (expanded: boolean) => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

// Pixel-perfect 3-leaf sprout logo from reference design
const SproutLogo: React.FC<{ className?: string }> = ({ className = 'w-7 h-7' }) => (
  <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    {/* Left Sap Green Leaf */}
    <path
      d="M16 20C16 20 9 17.5 7 11C5 5 11 5 13 8C15 11 16 20 16 20Z"
      fill="#486B2C"
    />
    {/* Right Deep Forest Green Leaf */}
    <path
      d="M16 20C16 20 23 17.5 25 11C27 5 21 5 19 8C17 11 16 20 16 20Z"
      fill="#2E491A"
    />
    {/* Center Golden Ochre Leaf */}
    <path
      d="M16 20C16 20 13 12 14.2 5.5C15.2 0.8 17.8 0.8 18.8 5.5C19.5 12 16 20 16 20Z"
      fill="#C68A2C"
    />
  </svg>
);

// Target Bullseye with concentric circles matching the screenshot
const BullseyeIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.8" />
    <circle cx="12" cy="12" r="6" stroke="currentColor" strokeWidth="1.8" />
    <circle cx="12" cy="12" r="2.2" fill="currentColor" />
  </svg>
);

export const Sidebar: React.FC<SidebarProps> = ({
  isExpanded,
  setIsExpanded,
  isMobileOpen,
  onCloseMobile
}) => {
  const { activeTab, setActiveTab, flatTopics, settings } = useApp();
  const [isPinned, setIsPinned] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);

  const totalTopics = flatTopics.length;
  const completedTopics = flatTopics.filter(t => t.topic.status === 'completed').length;
  const completionPercent = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;
  const daysLeft = daysUntilExam(settings.examDate);
  const examYear = new Date(settings.examDate).getFullYear() || 2027;

  const navItems: { id: ActiveTab; label: string; icon: React.ElementType }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'subjects', label: 'Subjects', icon: BookOpen },
    { id: 'revision', label: 'Revision Queue', icon: CheckSquare },
    { id: 'calendar', label: 'Calendar', icon: Calendar },
    { id: 'analytics', label: 'Analytics', icon: BarChart2 },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  // Click outside listener: compress when clicking outside unless pinned
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (isPinned) return;
      if (isExpanded && sidebarRef.current && !sidebarRef.current.contains(e.target as Node)) {
        setIsExpanded(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isExpanded, isPinned, setIsExpanded]);

  // Handle clicking on an item
  const handleItemClick = (tabId: ActiveTab) => {
    setActiveTab(tabId);
    if (!isExpanded) {
      setIsExpanded(true);
    }
    onCloseMobile();
  };

  // Clicking anywhere on the sidebar body expands it if collapsed
  const handleContainerClick = () => {
    if (!isExpanded) {
      setIsExpanded(true);
    }
  };

  const sidebarContent = (
    <div
      ref={sidebarRef}
      onClick={handleContainerClick}
      className={`relative h-full flex flex-col justify-between overflow-hidden select-none transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
        isExpanded ? 'w-[248px] p-5' : 'w-[74px] p-3'
      } bg-gradient-to-b from-[#CCE2C5]/90 via-[#BAD4B2]/88 to-[#A6C59C]/90 backdrop-blur-2xl border border-[#91B685]/65 shadow-[18px_30px_70px_-5px_rgba(8,20,6,0.5),0_18px_40px_-5px_rgba(8,20,6,0.35),6px_4px_20px_rgba(8,20,6,0.25),inset_0_1px_2px_rgba(255,255,255,0.85)] rounded-[32px] cursor-default`}
    >
      {/* Top Section: macOS Traffic Lights + Brand */}
      <div>
        {/* macOS Traffic Lights */}
        <div
          className={`flex items-center pt-1 pb-4 transition-all duration-300 ${
            isExpanded ? 'justify-between px-1' : 'justify-center'
          }`}
        >
          {/* Traffic light dots */}
          <div className="flex items-center gap-1.5 group">
            {/* Red: Close / Compress */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded(false);
              }}
              title="Compress sidebar"
              className="w-3 h-3 rounded-full bg-[#FF5F56] border border-[#E0443E]/50 hover:brightness-95 transition-all shadow-[0_1.5px_3px_rgba(0,0,0,0.22)] flex items-center justify-center cursor-pointer"
            />
            {/* Yellow: Compress */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded(false);
              }}
              title="Minimize sidebar"
              className="w-3 h-3 rounded-full bg-[#FFBD2E] border border-[#DEA123]/50 hover:brightness-95 transition-all shadow-[0_1.5px_3px_rgba(0,0,0,0.22)] flex items-center justify-center cursor-pointer"
            />
            {/* Green: Toggle Expand/Compress */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded(!isExpanded);
              }}
              title={isExpanded ? 'Compress sidebar' : 'Expand sidebar'}
              className="w-3 h-3 rounded-full bg-[#27C93F] border border-[#1AAB29]/50 hover:brightness-95 transition-all shadow-[0_1.5px_3px_rgba(0,0,0,0.22)] flex items-center justify-center cursor-pointer"
            />
          </div>

          {/* Pin & Mobile close when expanded */}
          {isExpanded && (
            <div className="flex items-center gap-1 animate-in fade-in duration-200">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsPinned(!isPinned);
                }}
                className={`p-1 rounded-lg transition-colors text-xs ${
                  isPinned
                    ? 'text-[#3E5C25] bg-[#D8E7D1]'
                    : 'text-[#6F7867] hover:text-[#1D2417] hover:bg-[#E0EBD9]/65'
                }`}
                title={isPinned ? 'Sidebar pinned (stays open)' : 'Pin sidebar open'}
              >
                <Pin className={`w-3.5 h-3.5 ${isPinned ? 'fill-[#3E5C25]' : ''}`} />
              </button>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsExpanded(false);
                }}
                className="hidden md:flex p-1 rounded-lg text-[#6F7867] hover:text-[#1D2417] hover:bg-[#E0EBD9]/65 transition-colors"
                title="Compress"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={onCloseMobile}
                className="md:hidden p-1 rounded-lg text-[#6F7867] hover:text-[#1D2417]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Brand: Sprout Logo + Title */}
        <div
          className={`flex items-center transition-all duration-300 pb-5 ${
            isExpanded ? 'gap-3 px-1' : 'justify-center'
          }`}
        >
          <div className="w-8 h-8 shrink-0 flex items-center justify-center">
            <SproutLogo className="w-7 h-7" />
          </div>

          {isExpanded && (
            <div className="overflow-hidden whitespace-nowrap animate-in fade-in slide-in-from-left-2 duration-200">
              <h1 className="font-extrabold text-[15px] tracking-tight text-[#13200F] leading-tight">
                GATE
              </h1>
              <p className="text-[11px] text-[#24371C] font-semibold leading-tight">
                Revision Tracker
              </p>
            </div>
          )}
        </div>

        {/* Navigation Items */}
        <nav className="space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            if (isExpanded) {
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleItemClick(item.id);
                  }}
                  className={`w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-2xl text-[13px] font-bold transition-all duration-200 cursor-pointer ${
                    isActive
                      ? 'bg-[#F6E3A1] text-[#1D2417] shadow-[0_4px_12px_rgba(20,35,12,0.18),0_1px_2px_rgba(20,35,12,0.12),inset_0_1px_0.5px_rgba(255,255,255,0.7)]'
                      : 'text-[#1D2E16] hover:bg-white/45 hover:text-[#0C150A]'
                  }`}
                >
                  <Icon
                    className={`w-[18px] h-[18px] shrink-0 transition-colors ${
                      isActive ? 'text-[#1D2417] stroke-[2.4]' : 'text-[#24371C] stroke-[2]'
                    }`}
                  />
                  <span className="truncate">{item.label}</span>
                </button>
              );
            }

            // Collapsed navigation items (centered squircles)
            return (
              <button
                key={item.id}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleItemClick(item.id);
                }}
                title={item.label}
                className={`w-11 h-11 mx-auto rounded-2xl flex items-center justify-center transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'bg-[#F6E3A1] text-[#1D2417] shadow-[0_4px_12px_rgba(20,35,12,0.18),0_1px_2px_rgba(20,35,12,0.12),inset_0_1px_0.5px_rgba(255,255,255,0.7)]'
                    : 'text-[#1D2E16] hover:bg-white/45 hover:text-[#0C150A]'
                }`}
              >
                <Icon
                  className={`w-5 h-5 shrink-0 ${
                    isActive ? 'text-[#1D2417] stroke-[2.4]' : 'stroke-[2]'
                  }`}
                />
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Section: Exam Target & Progress */}
      <div className="pt-4 border-t border-[#3B5B24]/20">
        {isExpanded ? (
          <div className="space-y-3 px-1 animate-in fade-in duration-200">
            {/* Target title + days left */}
            <div className="flex items-center gap-2.5">
              <div className="text-[#203912] shrink-0 drop-shadow-[0_1px_2px_rgba(0,0,0,0.15)]">
                <BullseyeIcon className="w-5 h-5" />
              </div>
              <div className="overflow-hidden">
                <div className="font-extrabold text-xs text-[#13200F] leading-tight tracking-tight">
                  GATE {examYear}
                </div>
                <div className="text-[11px] text-[#24371C] font-semibold leading-tight">
                  Exam in {daysLeft} days
                </div>
              </div>
            </div>

            {/* Progress bar + percentage */}
            <div className="flex items-center gap-2.5">
              <div className="flex-1 h-2 bg-[#6B8E55]/35 rounded-full overflow-hidden p-0.5 shadow-[inset_0_1px_2px_rgba(0,0,0,0.18)]">
                <div
                  className="h-full bg-[#244214] rounded-full transition-all duration-500 shadow-xs"
                  style={{ width: `${Math.max(5, completionPercent)}%` }}
                />
              </div>
              <span className="text-[11px] font-black text-[#13200F] shrink-0">
                {completionPercent}%
              </span>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2.5 pb-1">
            {/* Bullseye Icon centered */}
            <div
              className="text-[#203912] cursor-pointer hover:scale-105 transition-transform drop-shadow-[0_1px_2px_rgba(0,0,0,0.15)]"
              title={`GATE ${examYear} - Exam in ${daysLeft} days (${completionPercent}% completed)`}
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded(true);
              }}
            >
              <BullseyeIcon className="w-5 h-5" />
            </div>

            {/* Mini progress bar pill centered */}
            <div
              className="w-8 h-1.5 bg-[#6B8E55]/35 rounded-full overflow-hidden cursor-pointer shadow-[inset_0_1px_2px_rgba(0,0,0,0.18)]"
              title={`${completionPercent}% syllabus completed`}
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded(true);
              }}
            >
              <div
                className="h-full bg-[#244214] rounded-full transition-all duration-500"
                style={{ width: `${Math.max(10, completionPercent)}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Floating Sidebar with atmospheric drop-shadow */}
      <aside className="hidden md:block fixed top-3.5 bottom-3.5 left-3.5 z-40 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] drop-shadow-[14px_24px_45px_rgba(8,20,6,0.35)]">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Overlay */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden bg-stone-900/30 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="fixed top-3.5 bottom-3.5 left-3.5 animate-in slide-in-from-left duration-200 drop-shadow-[14px_24px_45px_rgba(8,20,6,0.35)]">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
