import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Square, Clock, Stethoscope, AlertCircle } from 'lucide-react';

/**
 * DoctorSessionTimer
 * Visible ONLY to users with the 'doctor' role.
 * Shows elapsed time (MM:SS or HH:MM:SS), status badge, and controls:
 * - Start Session
 * - Pause / Resume Session
 * - End Session (triggers end-of-session workflow and summary generation)
 */
export const DoctorSessionTimer = ({ onEndSession, isGeneratingSummary = false }) => {
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [showConfirmEnd, setShowConfirmEnd] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    if (isActive && !isPaused) {
      timerRef.current = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }

    return () => clearInterval(timerRef.current);
  }, [isActive, isPaused]);

  const handleStart = () => {
    setIsActive(true);
    setIsPaused(false);
  };

  const handlePause = () => {
    setIsPaused(true);
  };

  const handleResume = () => {
    setIsPaused(false);
  };

  const handleEndClick = () => {
    setShowConfirmEnd(true);
  };

  const handleConfirmEnd = () => {
    setIsActive(false);
    setIsPaused(false);
    setShowConfirmEnd(false);
    const finalSeconds = seconds;
    if (onEndSession) {
      onEndSession(finalSeconds);
    }
  };

  const handleCancelEnd = () => {
    setShowConfirmEnd(false);
  };

  const formatTime = (totalSecs) => {
    const hrs = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;

    const pad = (n) => String(n).padStart(2, '0');

    if (hrs > 0) {
      return `${pad(hrs)}:${pad(mins)}:${pad(secs)}`;
    }
    return `${pad(mins)}:${pad(secs)}`;
  };

  return (
    <div className="relative inline-flex items-center">
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-white dark:bg-slate-800 border border-health-300 dark:border-health-700/80 shadow-xs">
        {/* Doctor Role Badge */}
        <div className="flex items-center gap-1 text-[11px] font-bold text-health-800 dark:text-health-300 pr-2 border-r border-slate-200 dark:border-slate-700">
          <Stethoscope className="w-3.5 h-3.5 text-health-600 dark:text-health-400" />
          <span className="hidden md:inline">Doctor Session</span>
        </div>

        {/* Live Timer Display */}
        <div className="flex items-center gap-1.5 font-mono text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100">
          <Clock className={`w-3.5 h-3.5 ${isActive && !isPaused ? 'text-health-600 dark:text-health-400 animate-pulse' : 'text-slate-400'}`} />
          <span>{formatTime(seconds)}</span>
        </div>

        {/* Status Indicator Dot */}
        {isActive && (
          <span className="flex h-2 w-2 relative" title={isPaused ? 'Session Paused' : 'Consultation in Progress'}>
            {!isPaused && (
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            )}
            <span className={`relative inline-flex rounded-full h-2 w-2 ${isPaused ? 'bg-amber-400' : 'bg-emerald-500'}`}></span>
          </span>
        )}

        {/* Controls */}
        <div className="flex items-center gap-1 pl-1">
          {!isActive ? (
            <button
              type="button"
              onClick={handleStart}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-500 shadow-xs transition-all active:scale-95"
              title="Start Consultation Timer"
            >
              <Play className="w-3 h-3 fill-white" />
              <span>Start</span>
            </button>
          ) : (
            <>
              {isPaused ? (
                <button
                  type="button"
                  onClick={handleResume}
                  className="inline-flex items-center gap-1 px-2 py-1 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 transition-all"
                  title="Resume Consultation Timer"
                >
                  <Play className="w-3 h-3 fill-current" />
                  <span className="hidden sm:inline">Resume</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handlePause}
                  className="inline-flex items-center gap-1 px-2 py-1 rounded-xl text-xs font-bold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/50 hover:bg-amber-100 dark:hover:bg-amber-900/50 border border-amber-200 dark:border-amber-800/60 transition-all"
                  title="Pause Consultation Timer"
                >
                  <Pause className="w-3 h-3 fill-current" />
                  <span className="hidden sm:inline">Pause</span>
                </button>
              )}

              <button
                type="button"
                onClick={handleEndClick}
                disabled={isGeneratingSummary}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 dark:bg-rose-600 dark:hover:bg-rose-500 shadow-xs transition-all active:scale-95 disabled:opacity-50"
                title="End Consultation & Generate Summary"
              >
                <Square className="w-3 h-3 fill-white" />
                <span>End</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Confirm End Modal / Dropdown */}
      {showConfirmEnd && (
        <div className="absolute top-full right-0 mt-2 z-50 w-72 p-4 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 animate-slide-up space-y-3">
          <div className="flex items-start gap-2 text-xs">
            <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-slate-900 dark:text-slate-100">End Doctor Session?</p>
              <p className="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5">
                Session duration: <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{formatTime(seconds)}</span>. Ending will generate an automated clinical summary.
              </p>
            </div>
          </div>
          <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-100 dark:border-slate-700">
            <button
              type="button"
              onClick={handleCancelEnd}
              className="px-3 py-1 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
            >
              Continue
            </button>
            <button
              type="button"
              onClick={handleConfirmEnd}
              className="px-3 py-1 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 dark:bg-rose-600 dark:hover:bg-rose-500 shadow-xs"
            >
              End & Summarize
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
