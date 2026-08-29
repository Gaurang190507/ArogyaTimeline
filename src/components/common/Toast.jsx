import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { useHealth } from '../../context/HealthContext';

export const Toast = () => {
  const { toast, closeToast } = useHealth();

  if (!toast) return null;

  const isSuccess = toast.type === 'success';
  const isInfo = toast.type === 'info';
  const isError = toast.type === 'error';

  return (
    <div className="fixed bottom-20 md:bottom-8 right-4 md:right-8 z-50 animate-slide-up max-w-md">
      <div className={`flex items-center gap-3 px-4 py-3 rounded-2xl shadow-xl border backdrop-blur-md transition-all ${
        isSuccess
          ? 'bg-emerald-900/95 text-white border-emerald-700 shadow-emerald-950/20'
          : isError
          ? 'bg-rose-900/95 text-white border-rose-700 shadow-rose-950/20'
          : 'bg-slate-900/95 text-white border-slate-700 shadow-slate-950/20'
      }`}>
        {isSuccess && <CheckCircle2 className="w-5 h-5 text-emerald-300 shrink-0" />}
        {isError && <AlertCircle className="w-5 h-5 text-rose-300 shrink-0" />}
        {isInfo && <Info className="w-5 h-5 text-teal-300 shrink-0" />}

        <p className="text-sm font-medium pr-2 leading-snug">{toast.message}</p>

        <button
          onClick={closeToast}
          className="p-1 text-slate-300 hover:text-white rounded-lg transition-colors ml-auto"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
