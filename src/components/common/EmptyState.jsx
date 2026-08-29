import React from 'react';
import { Plus, Sparkles, FolderOpen, HeartHandshake } from 'lucide-react';

export const EmptyState = ({ 
  icon: Icon = FolderOpen, 
  title = "No health history yet", 
  description = "Start building your personal health memory.", 
  actionLabel = "+ Add your first record", 
  onAction,
  className = "" 
}) => {
  return (
    <div className={`flex flex-col items-center justify-center p-8 sm:p-12 text-center bg-white rounded-3xl border border-dashed border-slate-200 ${className}`}>
      <div className="w-16 h-16 rounded-2xl bg-health-50 text-health-600 flex items-center justify-center mb-4 shadow-sm">
        <Icon className="w-8 h-8" />
      </div>
      <h4 className="text-base font-bold text-slate-800 tracking-tight">{title}</h4>
      <p className="text-sm text-slate-500 max-w-sm mt-1 mb-6 leading-relaxed">{description}</p>
      
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-health-600 hover:bg-health-700 text-white font-medium text-sm rounded-xl transition-all shadow-md shadow-health-600/20 hover:shadow-lg"
        >
          <Plus className="w-4 h-4" />
          <span>{actionLabel}</span>
        </button>
      )}
    </div>
  );
};
