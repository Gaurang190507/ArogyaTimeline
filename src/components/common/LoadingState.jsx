import React from 'react';
import { Loader2, Heart } from 'lucide-react';

export const LoadingState = ({ message = "Loading health memory...", fullScreen = false }) => {
  if (fullScreen) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
        <div className="relative flex items-center justify-center mb-4">
          <div className="w-14 h-14 rounded-2xl bg-health-600/10 flex items-center justify-center animate-pulse">
            <Heart className="w-7 h-7 text-health-600 animate-bounce" />
          </div>
        </div>
        <p className="text-sm font-medium text-slate-600 animate-pulse">{message}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center p-12 text-center">
      <Loader2 className="w-8 h-8 text-health-600 animate-spin mb-3" />
      <p className="text-sm font-medium text-slate-500">{message}</p>
    </div>
  );
};
