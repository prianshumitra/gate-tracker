import React from 'react';
import { Search, Bell, Menu } from 'lucide-react';

interface HeaderProps {
  onOpenSearch: () => void;
  onToggleMobileMenu: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenSearch, onToggleMobileMenu }) => {
  return (
    <header className="sticky top-0 z-30 h-16 px-4 sm:px-6 lg:px-8 flex items-center justify-between">
      {/* Left controls (mobile drawer button) */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMobileMenu}
          className="p-2 rounded-xl text-[#5A6150] hover:bg-[#F2EBDA] md:hidden transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {/* Center is left open for the floating Dynamic Island (positioned fixed top-2.5) */}
      <div className="flex-1" />

      {/* Right controls matching reference image */}
      <div className="flex items-center gap-3.5">
        {/* Search input pill */}
        <button
          onClick={onOpenSearch}
          className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-white/80 hover:bg-white border border-[#EDE4D0] text-[#7A8072] hover:text-[#1D2417] transition-all text-xs shadow-xs group w-48 sm:w-64"
        >
          <Search className="w-3.5 h-3.5 text-[#8B9080] group-hover:text-[#486B2C] shrink-0 transition-colors" />
          <span className="truncate flex-1 text-left text-[#8B9080] font-normal">
            Search topics, subjects...
          </span>
          <kbd className="px-1.5 py-0.5 text-[10px] bg-[#FAF2DC] text-[#70480D] rounded border border-[#E8DCBF] font-mono shrink-0">
            ⌘ K
          </kbd>
        </button>

        {/* Notification Bell with alert dot in Crème Ochre */}
        <button
          onClick={onOpenSearch}
          className="relative p-2 rounded-full text-[#384130] hover:bg-[#F2EBDA] transition-colors"
          title="Notifications"
        >
          <Bell className="w-4 h-4 text-[#384130]" />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-[#C68A2C] ring-2 ring-[#F8F5EB]" />
        </button>

        {/* User Avatar matching screenshot image */}
        <div className="w-8 h-8 rounded-full ring-2 ring-[#EDE4D0] overflow-hidden shadow-xs shrink-0 cursor-pointer hover:opacity-90 transition-opacity">
          <img
            src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=120&q=80"
            alt="Prianshu"
            className="w-full h-full object-cover"
          />
        </div>
      </div>
    </header>
  );
};
