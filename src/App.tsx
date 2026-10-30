import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { DynamicIsland } from './components/layout/DynamicIsland';
import { UndoToast } from './components/common/UndoToast';
import { CommandPalette } from './components/common/CommandPalette';
import { DashboardView } from './views/DashboardView';
import { SubjectsView } from './views/SubjectsView';
import { RevisionQueueView } from './views/RevisionQueueView';
import { CalendarView } from './views/CalendarView';
import { AnalyticsView } from './views/AnalyticsView';
import { SettingsView } from './views/SettingsView';
import {
  LayoutDashboard,
  BookOpen,
  RotateCcw,
  Calendar,
  BarChart3
} from 'lucide-react';
import { ActiveTab } from './types';

const MainLayout: React.FC = () => {
  const { activeTab, setActiveTab } = useApp();
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

  const renderActiveView = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardView />;
      case 'subjects':
        return <SubjectsView />;
      case 'revision':
        return <RevisionQueueView />;
      case 'calendar':
        return <CalendarView />;
      case 'analytics':
        return <AnalyticsView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <DashboardView />;
    }
  };

  const mobileNavItems: { id: ActiveTab; label: string; icon: React.ElementType }[] = [
    { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
    { id: 'subjects', label: 'Subjects', icon: BookOpen },
    { id: 'revision', label: 'Revise', icon: RotateCcw },
    { id: 'calendar', label: 'Calendar', icon: Calendar },
    { id: 'analytics', label: 'Stats', icon: BarChart3 }
  ];

  return (
    <div className="min-h-screen bg-[#F8F5EB] text-[#1D2417] flex flex-col md:flex-row antialiased relative selection:bg-[#F6E3B4] selection:text-[#523A10] overflow-x-hidden">
      {/* Scenic Misty Mountain Sunrise Wallpaper Background */}
      <div
        className="fixed inset-0 pointer-events-none z-0 bg-cover bg-center bg-no-repeat opacity-80"
        style={{ backgroundImage: `url('/bg-mountains.jpg')` }}
      />
      {/* Soft warm daylight overlay for perfect text contrast */}
      <div className="fixed inset-0 pointer-events-none z-0 bg-[#F8F5EB]/45 backdrop-blur-[1.5px]" />

      {/* Floating iPhone Dynamic Island */}
      <DynamicIsland />

      {/* Floating Dynamic macOS Sidebar (Compresses when not clicked, expands when clicked) */}
      <Sidebar
        isExpanded={isSidebarExpanded}
        setIsExpanded={setIsSidebarExpanded}
        isMobileOpen={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
      />

      {/* Main Content Area - Clearly differentiated and separated with dynamic gutter */}
      <div
        className={`flex-1 flex flex-col min-h-screen pb-16 md:pb-6 z-10 transition-[padding] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          isSidebarExpanded ? 'md:pl-[272px]' : 'md:pl-[96px]'
        }`}
      >
        {/* Top Header */}
        <Header
          onOpenSearch={() => setIsCommandPaletteOpen(true)}
          onToggleMobileMenu={() => setIsMobileMenuOpen(prev => !prev)}
        />

        {/* View Content Canvas */}
        <main className="flex-1 px-3 sm:px-6 lg:px-8 py-2 w-full max-w-[1400px]">
          {renderActiveView()}
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="fixed bottom-0 inset-x-0 z-40 bg-[#FAF7F0]/90 backdrop-blur-xl border-t border-white/60 md:hidden flex items-center justify-around h-14 px-2 shadow-lg">
        {mobileNavItems.map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors ${
                isActive ? 'text-[#1D2417] font-bold' : 'text-[#7A8072] hover:text-[#1D2417]'
              }`}
            >
              <Icon className="w-4 h-4 mb-0.5" />
              <span className="text-[10px] font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Global Command Palette */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
      />

      {/* Global Undo Toast */}
      <UndoToast />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
};

export default App;
