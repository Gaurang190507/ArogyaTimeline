import React from 'react';
import { Sparkles } from 'lucide-react';

export const AISuggestion = ({ query, onClick }) => {
  return (
    <button
      type="button"
      onClick={() => onClick(query)}
      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs font-semibold text-slate-700 bg-white hover:bg-health-50 hover:text-health-800 border border-slate-200 hover:border-health-300 shadow-sm transition-all text-left"
    >
      <Sparkles className="w-3.5 h-3.5 text-health-600 shrink-0" />
      <span className="truncate">{query}</span>
    </button>
  );
};
