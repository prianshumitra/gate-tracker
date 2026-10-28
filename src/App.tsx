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
    <div className="min-h-screen bg-[#F8F5EB] text-[#1D2417] flex flex-col md:flex-row antialiased relative selection:bg-[#F6E3B4] selection:text-[#523A10]">
      {/* Top right decorative warm glow arc in Crème Ochre */}
      <div className="fixed top-0 right-0 w-[420px] h-[420px] pointer-events-none rounded-bl-full bg-gradient-to-bl from-[#F5E2B3]/50 via-[#F8ECCD]/25 to-transparent z-0" />

      {/* Floating iPhone Dynamic Island */}
      <DynamicIsland />

      {/* Sidebar for Desktop & Drawer for Mobile */}
      <Sidebar
        isMobileOpen={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 md:pl-56 lg:pl-60 flex flex-col min-h-screen pb-16 md:pb-0 z-10">
        {/* Top Header */}
        <Header
          onOpenSearch={() => setIsCommandPaletteOpen(true)}
          onToggleMobileMenu={() => setIsMobileMenuOpen(prev => !prev)}
        />

        {/* View Content */}
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-4 w-full">
          {renderActiveView()}
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="fixed bottom-0 inset-x-0 z-40 bg-[#F8F5EB]/95 backdrop-blur-md border-t border-[#EDE4D0] md:hidden flex items-center justify-around h-14 px-2">
        {mobileNavItems.map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors ${
                isActive ? 'text-stone-900 font-bold' : 'text-stone-400 hover:text-stone-700'
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
