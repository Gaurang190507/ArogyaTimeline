import React, { useState } from 'react';
import { 
  FileText, 
  Copy, 
  Check, 
  Download, 
  BookmarkPlus, 
  Sparkles, 
  Clock, 
  Activity, 
  ListChecks, 
  AlertCircle, 
  ChevronRight, 
  X,
  Calendar
} from 'lucide-react';

/**
 * ConversationSummaryCard
 * Displays structured clinical summary at the end of a chat session.
 * Features:
 * - Overview, topics discussed, vitals, insights, action items
 * - Copy to clipboard
 * - Download clinical report (.txt)
 * - Save directly to health timeline
 * - Dismiss / Start new session
 */
export const ConversationSummaryCard = ({
  summary,
  sessionDuration = null,
  onSaveToTimeline,
  onClose,
  isSaved = false,
}) => {
  const [copied, setCopied] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(isSaved);

  if (!summary) return null;

  const {
    title = 'Health Consultation Summary',
    overview = '',
    topics = [],
    vitals = [],
    insights = [],
    actionItems = [],
    generatedAt = new Date().toISOString(),
  } = summary;

  const formattedDate = new Date(generatedAt).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  // Prepare clean text representation for copy/download
  const getPlainTextSummary = () => {
    let out = `=======================================================\n`;
    out += `         AAROGYA HEALTH MEMORY - CLINICAL SUMMARY      \n`;
    out += `=======================================================\n\n`;
    out += `Title: ${title}\n`;
    out += `Date: ${formattedDate}\n`;
    if (sessionDuration) {
      const mins = Math.floor(sessionDuration / 60);
      const secs = sessionDuration % 60;
      out += `Duration: ${mins}m ${secs}s\n`;
    }
    out += `\nOVERVIEW:\n${overview}\n\n`;

    if (topics && topics.length > 0) {
      out += `TOPICS DISCUSSED:\n`;
      topics.forEach((t) => (out += ` - ${t}\n`));
      out += `\n`;
    }

    if (vitals && vitals.length > 0) {
      out += `VITALS & MEASUREMENTS RECORDED / REVIEWED:\n`;
      vitals.forEach((v) => (out += ` - ${v}\n`));
      out += `\n`;
    }

    if (insights && insights.length > 0) {
      out += `CLINICAL INSIGHTS & OBSERVATIONS:\n`;
      insights.forEach((ins) => (out += ` - ${ins}\n`));
      out += `\n`;
    }

    if (actionItems && actionItems.length > 0) {
      out += `RECOMMENDED NEXT STEPS & ACTION ITEMS:\n`;
      actionItems.forEach((act, i) => (out += ` ${i + 1}. ${act}\n`));
      out += `\n`;
    }

    out += `\nDISCLAIMER:\nThis summary is generated for personal health tracking and clinical continuity.\nIt does not replace an official prescription or in-person medical diagnosis.\n`;
    return out;
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(getPlainTextSummary());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy summary:', err);
    }
  };

  const handleDownload = () => {
    const element = document.createElement('a');
    const file = new Blob([getPlainTextSummary()], { type: 'text/plain;charset=utf-8' });
    element.href = URL.createObjectURL(file);
    element.download = `Aarogya_Consultation_Summary_${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleSave = async () => {
    if (savedSuccess || saving || !onSaveToTimeline) return;
    setSaving(true);
    try {
      await onSaveToTimeline(summary, sessionDuration);
      setSavedSuccess(true);
    } catch (err) {
      console.error('Error saving summary to timeline:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 border-2 border-health-300 dark:border-health-700/80 rounded-3xl p-5 sm:p-6 shadow-xl space-y-5 animate-scale-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-health-600 to-teal-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-health-600/20">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-health-100 dark:bg-health-950/80 border border-health-300 dark:border-health-800 text-[10px] font-bold text-health-800 dark:text-health-300 uppercase tracking-wider">
                <Sparkles className="w-3 h-3 text-health-600 dark:text-health-400" />
                Session Complete
              </span>
              {sessionDuration !== null && sessionDuration > 0 && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[11px] font-mono font-semibold text-slate-600 dark:text-slate-300">
                  <Clock className="w-3 h-3 text-slate-400" />
                  {Math.floor(sessionDuration / 60)}m {sessionDuration % 60}s
                </span>
              )}
            </div>
            <h3 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-slate-100 mt-0.5">
              {title}
            </h3>
            <p className="text-[11px] text-slate-400 dark:text-slate-500">
              Generated {formattedDate}
            </p>
          </div>
        </div>

        {/* Top Actions: Copy & Close */}
        <div className="flex items-center gap-1.5 self-end sm:self-auto">
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-all active:scale-95"
            title="Copy summary text to clipboard"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span className="text-emerald-700 dark:text-emerald-400">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleDownload}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-all active:scale-95"
            title="Download report (.txt)"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download</span>
          </button>

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Close summary"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Overview Card */}
      {overview && (
        <div className="p-4 rounded-2xl bg-health-50/80 dark:bg-slate-800/80 border border-health-100 dark:border-slate-700/80">
          <h4 className="text-xs font-bold text-health-900 dark:text-health-300 uppercase tracking-wider mb-1.5">
            Clinical Overview
          </h4>
          <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-200 leading-relaxed font-medium">
            {overview}
          </p>
        </div>
      )}

      {/* Grid: Topics & Vitals */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Topics Discussed */}
        {topics && topics.length > 0 && (
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 space-y-2">
            <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-health-600 dark:text-health-400" />
              Topics & Inquiries Discussed
            </h4>
            <ul className="space-y-1.5">
              {topics.map((t, idx) => (
                <li
                  key={idx}
                  className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-300 font-medium"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-health-500 dark:bg-health-400 shrink-0 mt-1.5" />
                  <span>{t}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Vitals Mentioned */}
        {vitals && vitals.length > 0 && (
          <div className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/50 space-y-2">
            <h4 className="text-xs font-bold text-emerald-900 dark:text-emerald-300 flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              Vitals & Measurements Recorded
            </h4>
            <ul className="space-y-1.5">
              {vitals.map((v, idx) => (
                <li
                  key={idx}
                  className="flex items-start gap-2 text-xs text-emerald-800 dark:text-emerald-200 font-semibold"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400 shrink-0 mt-1.5" />
                  <span>{v}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Clinical Insights */}
      {insights && insights.length > 0 && (
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 space-y-2">
          <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
            Key Clinical Insights
          </h4>
          <div className="space-y-2">
            {insights.map((ins, idx) => (
              <div
                key={idx}
                className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 p-2.5 rounded-xl border border-slate-200/70 dark:border-slate-700/70 shadow-2xs font-medium"
              >
                <ChevronRight className="w-3.5 h-3.5 text-health-600 dark:text-health-400 shrink-0 mt-0.5" />
                <span>{ins}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommended Actions */}
      {actionItems && actionItems.length > 0 && (
        <div className="p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200/70 dark:border-amber-900/50 space-y-2">
          <h4 className="text-xs font-bold text-amber-900 dark:text-amber-300 flex items-center gap-1.5">
            <ListChecks className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            Recommended Next Steps & Action Items
          </h4>
          <div className="space-y-1.5">
            {actionItems.map((act, idx) => (
              <div
                key={idx}
                className="flex items-start gap-2.5 text-xs text-amber-900 dark:text-amber-200 font-medium"
              >
                <span className="w-4 h-4 rounded-full bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-200 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                  {idx + 1}
                </span>
                <span>{act}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Footer Actions: Save to Health Timeline */}
      <div className="flex flex-col sm:flex-row items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800 gap-3">
        <div className="flex items-center gap-1.5 text-[11px] text-slate-400 dark:text-slate-500">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>This summary can be permanently attached to your chronological medical timeline.</span>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {onSaveToTimeline && (
            <button
              type="button"
              onClick={handleSave}
              disabled={savedSuccess || saving}
              className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-bold transition-all shadow-md active:scale-95 ${
                savedSuccess
                  ? 'bg-emerald-600 text-white cursor-default'
                  : 'bg-health-600 hover:bg-health-700 text-white shadow-health-600/20'
              }`}
            >
              {savedSuccess ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Saved to Health Timeline</span>
                </>
              ) : saving ? (
                <span>Saving Record...</span>
              ) : (
                <>
                  <BookmarkPlus className="w-4 h-4" />
                  <span>Save to Health Timeline</span>
                </>
              )}
            </button>
          )}

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-4 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl transition-colors"
            >
              Close
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
