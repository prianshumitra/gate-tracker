import React from 'react';
import { useApp } from '../../context/AppContext';
import { RotateCcw, X } from 'lucide-react';

export const UndoToast: React.FC = () => {
  const { undoState, executeUndo, dismissUndo } = useApp();

  if (!undoState) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-stone-900/95 text-white border border-stone-700/60 px-4 py-2.5 rounded-full shadow-2xl shadow-stone-900/30 animate-in fade-in slide-in-from-bottom-4 duration-200 backdrop-blur-xl">
      <div className="flex items-center gap-2 text-xs font-medium">
        <span className="w-1.5 h-1.5 rounded-full bg-[#5EA32B] animate-pulse" />
        <span className="text-stone-200">{undoState.message}</span>
      </div>
      <div className="flex items-center gap-2 border-l border-stone-800 pl-3">
        <button
          onClick={executeUndo}
          className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold rounded-full bg-stone-800 text-stone-200 hover:bg-stone-700 hover:text-white transition-colors"
        >
          <RotateCcw className="w-3 h-3" />
          Undo
        </button>
        <button
          onClick={dismissUndo}
          className="p-1 text-stone-400 hover:text-stone-200 transition-colors"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
