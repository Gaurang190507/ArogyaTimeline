import React, { useState, useRef, useEffect } from "react";
import { Mic, MicOff, AlertCircle } from "lucide-react";

/**
 * DictationButton — a compact microphone button for live voice dictation.
 * Uses Web Speech API (SpeechRecognition / webkitSpeechRecognition).
 *
 * Props:
 *   onTranscript(text)   — called with final transcript text
 *   onPartial(text)      — called with interim (partial) transcript
 *   spokenLanguage       — BCP-47 language code (e.g. 'en-IN', 'hi-IN')
 *   className            — extra Tailwind classes
 *   size                 — 'sm' | 'md' (default 'sm')
 *   disabled             — disable the button
 */
export const DictationButton = ({
  onTranscript,
  onPartial,
  spokenLanguage = "en-IN",
  className = "",
  size = "sm",
  disabled = false,
}) => {
  const [state, setState] = useState("IDLE"); // IDLE | RECORDING | ERROR
  const [error, setError] = useState("");
  const recognitionRef = useRef(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch { /* ignore */ }
        recognitionRef.current = null;
      }
    };
  }, []);

  const langCode = spokenLanguage || "en-IN";

  const startDictation = () => {
    setError("");
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setError("Speech recognition not supported in this browser. Try Chrome.");
      setState("ERROR");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = langCode;
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onstart = () => {
      setState("RECORDING");
    };

    recognition.onresult = (event) => {
      let finalText = "";
      let partialText = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalText += transcript;
        } else {
          partialText += transcript;
        }
      }
      if (finalText && onTranscript) onTranscript(finalText);
      if (partialText && onPartial) onPartial(partialText);
    };

    recognition.onerror = (event) => {
      if (event.error === "no-speech") {
        // Not an error — user just didn't speak
        setState("IDLE");
        return;
      }
      setError(`Speech error: ${event.error}`);
      setState("ERROR");
      recognitionRef.current = null;
    };

    recognition.onend = () => {
      setState("IDLE");
      recognitionRef.current = null;
    };

    recognitionRef.current = recognition;
    try {
      recognition.start();
    } catch {
      setError("Could not start speech recognition.");
      setState("ERROR");
      recognitionRef.current = null;
    }
  };

  const stopDictation = () => {
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch { /* ignore */ }
      recognitionRef.current = null;
    }
    setState("IDLE");
  };

  const isRecording = state === "RECORDING";
  const sizeClasses = size === "sm" ? "w-7 h-7" : "w-9 h-9";
  const iconSize = size === "sm" ? "w-3.5 h-3.5" : "w-4 h-4";

  return (
    <div className={`relative inline-flex items-center ${className}`}>
      <button
        type="button"
        onClick={isRecording ? stopDictation : startDictation}
        disabled={disabled}
        title={isRecording ? "Stop dictation" : "Start dictation (voice input)"}
        className={`${sizeClasses} flex items-center justify-center rounded-lg transition-all ${
          isRecording
            ? "bg-red-500 text-white shadow-lg shadow-red-500/30 animate-pulse"
            : "bg-slate-100 text-slate-500 hover:bg-health-100 hover:text-health-700"
        } disabled:opacity-40 disabled:cursor-not-allowed`}
      >
        {isRecording ? (
          <MicOff className={iconSize} />
        ) : (
          <Mic className={iconSize} />
        )}
      </button>

      {/* Error tooltip */}
      {state === "ERROR" && error && (
        <div className="absolute bottom-full left-0 mb-1.5 w-48 p-2 bg-red-50 border border-red-200 rounded-lg shadow-lg z-50">
          <p className="text-[10px] text-red-600 flex items-start gap-1">
            <AlertCircle className="w-3 h-3 shrink-0 mt-0.5" />
            {error}
          </p>
        </div>
      )}

      {/* Recording indicator dot */}
      {isRecording && (
        <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-red-500 rounded-full animate-ping" />
      )}
    </div>
  );
};
