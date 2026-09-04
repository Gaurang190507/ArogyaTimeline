import React from 'react';
import { Sparkles, User, AlertCircle, Volume2, Square, Languages, Database, Shield } from 'lucide-react';
import { LANG_NAMES } from '../../services/translationService';
import { FormattedAIResponse } from './FormattedAIResponse';

export const AIMessage = ({
  message,
  onOptionSelect,
  onSpeak,
  isSpeaking = false,
}) => {
  const isUser = message.sender === 'user';
  const langLabel = message.lang && message.lang !== 'en' ? LANG_NAMES[message.lang] || message.lang : null;

  return (
    <div className={`flex gap-3.5 ${isUser ? 'justify-end' : 'justify-start'} animate-fade-in`}>
      {!isUser && (
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-health-600 to-teal-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-health-600/20">
          <Sparkles className="w-5 h-5" />
        </div>
      )}

      <div className="max-w-[85%] sm:max-w-[75%] space-y-2.5">
        <div className={`rounded-3xl p-5 shadow-soft relative group ${
          isUser
            ? 'bg-slate-900 dark:bg-health-700 text-white rounded-tr-sm'
            : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-100 dark:border-slate-700 rounded-tl-sm'
        }`}>
          {/* Top badges: Language, Scope, and Tool Call indicators */}
          {!isUser && (
            <div className="flex flex-wrap items-center gap-1.5 mb-2.5">
              {langLabel && (
                <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-health-50 dark:bg-health-950/60 border border-health-200 dark:border-health-800 text-[10px] font-semibold text-health-800 dark:text-health-300">
                  <Languages className="w-3 h-3 text-health-600 dark:text-health-400" />
                  <span>{langLabel}</span>
                </div>
              )}

              {message.isRefusal && (
                <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-[10px] font-bold text-amber-800 dark:text-amber-300">
                  <Shield className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                  <span>Personal Health Scope</span>
                </div>
              )}

              {message.toolCalls && message.toolCalls.map((tc, idx) => (
                <div
                  key={idx}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 text-[10px] font-mono font-bold text-teal-800 dark:text-teal-300"
                  title={`Retrieved health context via function: ${tc.tool}`}
                >
                  <Database className="w-3 h-3 text-teal-600 dark:text-teal-400" />
                  <span>DB Tool: {tc.tool}</span>
                </div>
              ))}
            </div>
          )}

          <FormattedAIResponse content={message.text} isUser={isUser} />

          {/* Speaker Button on AI response */}
          {!isUser && onSpeak && (
            <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between">
              <button
                type="button"
                onClick={() => onSpeak(message.text, message.id, message.lang)}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                  isSpeaking
                    ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 animate-pulse'
                    : 'text-slate-500 hover:text-health-700 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-health-300 dark:hover:bg-slate-700'
                }`}
                title={isSpeaking ? 'Stop speaking' : `Listen in ${langLabel || 'English'}`}
              >
                {isSpeaking ? (
                  <>
                    <Square className="w-3.5 h-3.5 fill-rose-700 dark:fill-rose-300" />
                    <span>Stop Voice</span>
                  </>
                ) : (
                  <>
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>Listen</span>
                  </>
                )}
              </button>

              {message.disclaimer && (
                <span className="text-[10px] text-slate-400 dark:text-slate-500 italic truncate max-w-[60%]">
                  {message.disclaimer}
                </span>
              )}
            </div>
          )}

          {/* User message or disclaimer fallback */}
          {!isUser && !onSpeak && message.disclaimer && (
            <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-700 flex items-start gap-1.5 text-[11px] text-slate-400 dark:text-slate-500 italic">
              <AlertCircle className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 shrink-0 mt-0.5" />
              <span>{message.disclaimer}</span>
            </div>
          )}
        </div>

        {/* Interactive Follow-up Choices */}
        {!isUser && message.followUp && message.followUp.options && (
          <div className="bg-health-50/70 dark:bg-slate-800/90 border border-health-200/80 dark:border-health-900/60 rounded-2xl p-3.5 space-y-2 animate-slide-up">
            <p className="text-xs font-semibold text-health-900 dark:text-health-300">
              {message.followUp.question}
            </p>
            <div className="flex flex-wrap gap-2">
              {message.followUp.options.map((opt, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => onOptionSelect && onOptionSelect(opt)}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-white dark:bg-slate-700 hover:bg-health-600 dark:hover:bg-health-600 hover:text-white text-health-800 dark:text-health-200 border border-health-300 dark:border-slate-600 shadow-sm transition-all text-left"
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {isUser && (
        <div className="w-10 h-10 rounded-2xl bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center shrink-0 font-bold text-sm">
          <User className="w-5 h-5" />
        </div>
      )}
    </div>
  );
};
