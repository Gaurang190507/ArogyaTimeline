import React, { useState, useEffect, useRef } from 'react';
import { 
  Radio, 
  Mic, 
  MicOff, 
  Square, 
  Play, 
  Copy, 
  Check, 
  Trash2, 
  Send, 
  AlertCircle, 
  ChevronDown, 
  ChevronUp,
  Activity,
  FileText
} from 'lucide-react';
import { LANG_NAMES } from '../../services/translationService';

const BCP47_MAP = {
  en: 'en-IN',
  hi: 'hi-IN',
  mr: 'mr-IN',
  bn: 'bn-IN',
  ta: 'ta-IN',
  te: 'te-IN',
  gu: 'gu-IN',
  kn: 'kn-IN',
  ml: 'ml-IN',
  pa: 'pa-IN',
};

/**
 * MachineRecordingPanel
 * Provides continuous automatic recording and live machine transcription.
 * Visible status indicators guarantee that recording is NEVER hidden.
 */
export const MachineRecordingPanel = ({
  spokenLanguage = 'en',
  onSendTranscriptToChat,
  className = '',
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [interimText, setInterimText] = useState('');
  const [transcriptLines, setTranscriptLines] = useState([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [hasCopied, setHasCopied] = useState(false);
  const [micError, setMicError] = useState(null);

  const recognitionRef = useRef(null);
  const isManuallyStoppedRef = useRef(false);

  const languageLabel = LANG_NAMES[spokenLanguage] || spokenLanguage;
  const bcpCode = BCP47_MAP[spokenLanguage] || 'en-IN';

  // Initialize and manage SpeechRecognition
  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setMicError('Continuous speech recognition is not supported in this browser. Please use Chrome or Edge.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = bcpCode;

    recognition.onstart = () => {
      setIsRecording(true);
      setMicError(null);
    };

    recognition.onresult = (event) => {
      let currentInterim = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const item = event.results[i];
        if (item.isFinal) {
          const finalText = item[0].transcript.trim();
          if (finalText) {
            setTranscriptLines((prev) => [
              ...prev,
              {
                id: `line_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
                text: finalText,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
              },
            ]);
          }
        } else {
          currentInterim += item[0].transcript;
        }
      }
      setInterimText(currentInterim);
    };

    recognition.onerror = (event) => {
      console.warn('[MachineRecording] Recognition error:', event.error);
      if (event.error === 'not-allowed') {
        setMicError('Microphone permission denied. Please allow microphone access in browser settings.');
        setIsRecording(false);
      } else if (event.error === 'no-speech') {
        // Continuous listening can naturally trigger no-speech; ignore
      } else {
        setMicError(`Recording error: ${event.error}`);
      }
    };

    recognition.onend = () => {
      // Auto-restart if still actively recording and not manually stopped
      if (!isManuallyStoppedRef.current && isRecording && !isPaused) {
        try {
          recognition.start();
        } catch (e) {
          // ignore already started
        }
      } else if (isManuallyStoppedRef.current) {
        setIsRecording(false);
      }
    };

    recognitionRef.current = recognition;

    return () => {
      isManuallyStoppedRef.current = true;
      try {
        recognition.stop();
      } catch (e) {}
    };
  }, [bcpCode]);

  const handleStart = () => {
    if (!recognitionRef.current) return;
    setMicError(null);
    isManuallyStoppedRef.current = false;
    setIsPaused(false);
    setIsExpanded(true);

    try {
      recognitionRef.current.lang = bcpCode;
      recognitionRef.current.start();
    } catch (e) {
      console.warn('Could not start recognition:', e);
    }
  };

  const handleStop = () => {
    isManuallyStoppedRef.current = true;
    setIsPaused(false);
    setIsRecording(false);
    setInterimText('');

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }
  };

  const handleClear = () => {
    setTranscriptLines([]);
    setInterimText('');
  };

  const getFullTranscriptText = () => {
    return transcriptLines.map((l) => `[${l.timestamp}] ${l.text}`).join('\n');
  };

  const handleCopy = async () => {
    const text = getFullTranscriptText();
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setHasCopied(true);
      setTimeout(() => setHasCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy transcript:', err);
    }
  };

  const handleSendToChat = () => {
    const text = transcriptLines.map((l) => l.text).join(' ');
    if (!text.trim() || !onSendTranscriptToChat) return;
    onSendTranscriptToChat(text.trim());
  };

  return (
    <div className={`rounded-2xl transition-all border ${
      isRecording
        ? 'bg-rose-50/70 dark:bg-rose-950/20 border-rose-300 dark:border-rose-900/60 shadow-sm'
        : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700/80 shadow-xs'
    } ${className}`}>
      {/* Top Banner & Main Toggle Bar */}
      <div className="p-3 sm:px-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          {/* Animated Status Dot */}
          <div className="relative flex items-center justify-center shrink-0">
            {isRecording && (
              <span className="animate-ping absolute inline-flex h-4 w-4 rounded-full bg-rose-400 opacity-75"></span>
            )}
            <div className={`w-3 h-3 rounded-full ${
              isRecording ? 'bg-rose-600' : 'bg-slate-300 dark:bg-slate-600'
            }`} />
          </div>

          {/* Title & Status */}
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                <Radio className={`w-3.5 h-3.5 ${isRecording ? 'text-rose-600 dark:text-rose-400 animate-pulse' : 'text-slate-400'}`} />
                <span>Automatic Consultation Record</span>
              </span>

              {/* Status Badge */}
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                isRecording
                  ? 'bg-rose-100 dark:bg-rose-900/60 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
              }`}>
                {isRecording ? 'LIVE RECORDING' : 'READY / INACTIVE'}
              </span>

              <span className="text-[11px] text-slate-400 dark:text-slate-500 hidden md:inline">
                ({languageLabel})
              </span>
            </div>

            {/* Audio wave animation when active */}
            {isRecording ? (
              <div className="flex items-center gap-1 mt-1">
                <span className="text-[11px] text-rose-600 dark:text-rose-400 font-semibold">
                  Transcribing conversation in real-time
                </span>
                <div className="flex items-center gap-0.5 ml-2 h-3">
                  <span className="w-1 bg-rose-500 h-2 animate-pulse rounded-full" />
                  <span className="w-1 bg-rose-500 h-3.5 animate-pulse delay-75 rounded-full" />
                  <span className="w-1 bg-rose-500 h-1.5 animate-pulse delay-150 rounded-full" />
                  <span className="w-1 bg-rose-500 h-3 animate-pulse rounded-full" />
                </div>
              </div>
            ) : (
              <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                Click Start Record to continuously transcribe the doctor-patient dialogue.
              </p>
            )}
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 shrink-0">
          {!isRecording ? (
            <button
              type="button"
              onClick={handleStart}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 dark:bg-rose-600 dark:hover:bg-rose-500 shadow-xs transition-all active:scale-95"
              title="Start Automatic Recording & Live Transcription"
            >
              <Mic className="w-3.5 h-3.5" />
              <span>Start Record</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleStop}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-slate-800 hover:bg-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600 shadow-xs transition-all active:scale-95"
              title="Stop Recording"
            >
              <Square className="w-3.5 h-3.5 fill-white" />
              <span>Stop Record</span>
            </button>
          )}

          {/* Expand / Collapse live transcript */}
          {(transcriptLines.length > 0 || isRecording) && (
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1.5 rounded-xl text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              title={isExpanded ? 'Hide transcript details' : 'Show live transcript'}
            >
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          )}
        </div>
      </div>

      {/* Microphone Error Notification */}
      {micError && (
        <div className="mx-3 sm:mx-4 mb-3 p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80 text-xs text-amber-800 dark:text-amber-300 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div className="flex-1">{micError}</div>
        </div>
      )}

      {/* Expanded Live Transcript Drawer */}
      {isExpanded && (
        <div className="px-3 sm:px-4 pb-3 border-t border-slate-200/80 dark:border-slate-700/80 pt-3 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-health-600 dark:text-health-400" />
              Live Transcript ({transcriptLines.length} segments)
            </span>

            <div className="flex items-center gap-1.5">
              {transcriptLines.length > 0 && (
                <>
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-600 shadow-2xs"
                  >
                    {hasCopied ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                        <span>Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={handleClear}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                    title="Clear transcript"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Clear</span>
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Transcript Content Box */}
          <div className="max-h-48 overflow-y-auto rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-3 space-y-2 text-xs">
            {transcriptLines.length === 0 && !interimText ? (
              <p className="text-slate-400 dark:text-slate-500 italic text-center py-4">
                {isRecording ? 'Listening for speech... spoken words will appear here instantly.' : 'No speech recorded yet. Click Start Record above.'}
              </p>
            ) : (
              <>
                {transcriptLines.map((line) => (
                  <div key={line.id} className="flex items-start gap-2 leading-relaxed">
                    <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500 shrink-0 mt-0.5">
                      {line.timestamp}
                    </span>
                    <span className="text-slate-800 dark:text-slate-200 font-medium">
                      {line.text}
                    </span>
                  </div>
                ))}

                {/* Interim Live Speech Chunk */}
                {interimText && (
                  <div className="flex items-start gap-2 leading-relaxed text-health-600 dark:text-teal-400 italic">
                    <span className="text-[10px] font-mono opacity-60 shrink-0 mt-0.5">live</span>
                    <span>{interimText}...</span>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Action: Send to chat */}
          {transcriptLines.length > 0 && onSendTranscriptToChat && (
            <div className="flex items-center justify-between pt-1">
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                Send recorded transcript directly to AI Assistant for clinical consultation analysis:
              </span>
              <button
                type="button"
                onClick={handleSendToChat}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-health-600 hover:bg-health-700 dark:bg-health-600 dark:hover:bg-health-500 shadow-xs transition-all active:scale-95"
              >
                <Send className="w-3 h-3" />
                <span>Send to Assistant</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
