import React from 'react';
import { Sparkles } from 'lucide-react';

export const AISuggestion = ({ query, onClick }) => {
  return (
    <button
      type="button"
      onClick={() => onClick(query)}
      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-health-50 dark:hover:bg-slate-700 hover:text-health-800 dark:hover:text-health-300 border border-slate-200 dark:border-slate-700 hover:border-health-300 dark:hover:border-health-600 shadow-2xs transition-all text-left shrink-0 active:scale-95"
    >
      <Sparkles className="w-3.5 h-3.5 text-health-600 dark:text-health-400 shrink-0" />
      <span className="truncate">{query}</span>
    </button>
  );
};
