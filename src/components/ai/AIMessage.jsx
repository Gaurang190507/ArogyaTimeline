import React from 'react';
import { Sparkles, User, AlertCircle } from 'lucide-react';

export const AIMessage = ({ message, onOptionSelect }) => {
  const isUser = message.sender === 'user';

  return (
    <div className={`flex gap-3.5 ${isUser ? 'justify-end' : 'justify-start'} animate-fade-in`}>
      {!isUser && (
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-health-600 to-teal-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-health-600/20">
          <Sparkles className="w-5 h-5" />
        </div>
      )}

      <div className={`max-w-[85%] sm:max-w-[75%] space-y-2.5`}>
        <div className={`rounded-3xl p-5 shadow-soft ${
          isUser
            ? 'bg-slate-900 text-white rounded-tr-sm'
            : 'bg-white text-slate-800 border border-slate-100 rounded-tl-sm'
        }`}>
          <div className="text-sm font-medium whitespace-pre-line leading-relaxed">
            {message.text}
          </div>

          {/* AI Disclaimer if present */}
          {message.disclaimer && (
            <div className="mt-3 pt-3 border-t border-slate-100 flex items-start gap-1.5 text-[11px] text-slate-400 italic">
              <AlertCircle className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
              <span>{message.disclaimer}</span>
            </div>
          )}
        </div>

        {/* Interactive Follow-up Choices */}
        {!isUser && message.followUp && message.followUp.options && (
          <div className="bg-health-50/70 border border-health-200/80 rounded-2xl p-3.5 space-y-2 animate-slide-up">
            <p className="text-xs font-semibold text-health-900">
              {message.followUp.question}
            </p>
            <div className="flex flex-wrap gap-2">
              {message.followUp.options.map((opt, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => onOptionSelect && onOptionSelect(opt)}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-white hover:bg-health-600 hover:text-white text-health-800 border border-health-300 shadow-sm transition-all text-left"
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {isUser && (
        <div className="w-10 h-10 rounded-2xl bg-slate-200 text-slate-700 flex items-center justify-center shrink-0 font-bold text-sm">
          <User className="w-5 h-5" />
        </div>
      )}
    </div>
  );
};
