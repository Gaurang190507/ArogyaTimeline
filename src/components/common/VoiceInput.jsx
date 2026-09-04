import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, Loader2, CheckCircle2, Sparkles, AlertCircle } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { LANG_NAMES } from '../../services/translationService';

const VOICE_STATES = {
  IDLE: 'IDLE',
  RECORDING: 'RECORDING',
  PROCESSING: 'PROCESSING',
  RESULT: 'RESULT',
  ERROR: 'ERROR',
};

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

export const VoiceInput = ({
  onResult,
  placeholder = 'Speak naturally in your preferred language...',
  compact = false,
  className = '',
  // Spoken language overrides UI language if provided
  spokenLanguage,
}) => {
  const { t, currentLang } = useLanguage();
  const [state, setState] = useState(VOICE_STATES.IDLE);
  const [transcript, setTranscript] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [audioLevel, setAudioLevel] = useState([20, 45, 70, 30, 85, 50, 25]);

  const recognitionRef = useRef(null);
  const streamRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const animFrameRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const accumulatedTextRef = useRef('');

  const activeLangCode = BCP47_MAP[spokenLanguage || currentLang] || 'en-IN';

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanupAudio();
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch (_) {}
      }
    };
  }, []);

  const cleanupAudio = () => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
  };

  const setupVisualizer = (stream) => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const audioCtx = new AudioCtx();
      audioContextRef.current = audioCtx;
      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 64;
      source.connect(analyser);
      analyserRef.current = analyser;

      const dataArray = new Uint8Array(analyser.frequencyBinCount);

      const renderAudioBars = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArray);

        const bars = [];
        const step = Math.floor(dataArray.length / 7) || 1;
        for (let i = 0; i < 7; i++) {
          const val = dataArray[i * step] || 20;
          bars.push(Math.max(15, Math.min(100, Math.floor(val * 0.7))));
        }
        setAudioLevel(bars);
        animFrameRef.current = requestAnimationFrame(renderAudioBars);
      };

      renderAudioBars();
    } catch (e) {
      console.warn('[VoiceInput] Could not initialize audio visualizer:', e);
    }
  };

  // ── Start Recording via Web Speech API or Fallback ──
  const startRecording = async () => {
    setErrorMessage('');
    accumulatedTextRef.current = '';
    setTranscript('');

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    // Optional audio visualizer stream
    let micStream = null;
    try {
      if (navigator.mediaDevices?.getUserMedia) {
        micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        streamRef.current = micStream;
        setupVisualizer(micStream);
      }
    } catch (err) {
      console.warn('[VoiceInput] Mic visualizer permission denied or unavailable:', err);
    }

    if (SpeechRecognition) {
      // ── Primary Engine: Native Web Speech API ──
      try {
        const recognition = new SpeechRecognition();
        recognition.lang = activeLangCode;
        recognition.continuous = true;
        recognition.interimResults = true;

        recognition.onstart = () => {
          setState(VOICE_STATES.RECORDING);
        };

        recognition.onresult = (event) => {
          let currentFinal = '';
          let currentInterim = '';

          for (let i = 0; i < event.results.length; i++) {
            const res = event.results[i];
            if (res.isFinal) {
              currentFinal += res[0].transcript + ' ';
            } else {
              currentInterim += res[0].transcript;
            }
          }

          const combined = (currentFinal + currentInterim).trim();
          accumulatedTextRef.current = currentFinal.trim() || combined;
          setTranscript(combined);
        };

        recognition.onerror = (event) => {
          console.warn('[VoiceInput] Recognition error:', event.error);
          if (event.error === 'no-speech') {
            // User did not speak; not a hard error
            return;
          }
          if (event.error === 'not-allowed') {
            setErrorMessage('Microphone access denied. Please allow microphone permissions.');
            setState(VOICE_STATES.ERROR);
            cleanupAudio();
            return;
          }
          setErrorMessage(`Speech recognition error (${event.error})`);
        };

        recognition.onend = () => {
          cleanupAudio();
          const finalText = accumulatedTextRef.current.trim();
          if (finalText) {
            setState(VOICE_STATES.RESULT);
            if (onResult) onResult(finalText);
            setTimeout(() => {
              setState(VOICE_STATES.IDLE);
              setTranscript('');
            }, 3000);
          } else {
            setState(VOICE_STATES.IDLE);
          }
        };

        recognitionRef.current = recognition;
        recognition.start();
        setState(VOICE_STATES.RECORDING);
      } catch (err) {
        console.error('[VoiceInput] Failed to start SpeechRecognition:', err);
        cleanupAudio();
        setErrorMessage('Unable to start speech recognition.');
        setState(VOICE_STATES.ERROR);
      }
    } else {
      // ── Fallback if Web Speech API is absent in this browser ──
      fallbackWhisperRecording(micStream);
    }
  };

  // ── Fallback Whisper recording for browsers without SpeechRecognition ──
  const fallbackWhisperRecording = async (micStream) => {
    const groqKey =
      localStorage.getItem('ai_api_key') ||
      import.meta.env.VITE_GROQ_API_KEY;

    if (!groqKey || groqKey === 'your-groq-api-key-here') {
      cleanupAudio();
      setErrorMessage(
        'Speech recognition is not supported in this browser. Please use Chrome, Edge, or configure an API key.'
      );
      setState(VOICE_STATES.ERROR);
      return;
    }

    try {
      const stream = micStream || (await navigator.mediaDevices.getUserMedia({ audio: true }));
      streamRef.current = stream;
      setupVisualizer(stream);

      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : 'audio/webm';
      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        cleanupAudio();
        setState(VOICE_STATES.PROCESSING);
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        audioChunksRef.current = [];

        try {
          const formData = new FormData();
          formData.append('file', audioBlob, 'speech.webm');
          formData.append('model', 'whisper-large-v3');
          formData.append('language', activeLangCode.split('-')[0]);

          const res = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
            method: 'POST',
            headers: { Authorization: `Bearer ${groqKey}` },
            body: formData,
          });

          if (!res.ok) throw new Error(`Whisper API error: ${res.status}`);
          const data = await res.json();
          const recognizedText = (data.text || '').trim();

          if (recognizedText) {
            setTranscript(recognizedText);
            setState(VOICE_STATES.RESULT);
            if (onResult) onResult(recognizedText);
            setTimeout(() => {
              setState(VOICE_STATES.IDLE);
              setTranscript('');
            }, 3000);
          } else {
            setState(VOICE_STATES.IDLE);
          }
        } catch (err) {
          console.error('[VoiceInput] Whisper fallback error:', err);
          setErrorMessage('Transcription failed: ' + err.message);
          setState(VOICE_STATES.ERROR);
        }
      };

      mediaRecorder.start(200);
      mediaRecorderRef.current = mediaRecorder;
      setState(VOICE_STATES.RECORDING);
    } catch (err) {
      cleanupAudio();
      setErrorMessage('Could not access microphone: ' + err.message);
      setState(VOICE_STATES.ERROR);
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (_) {}
      recognitionRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      try {
        mediaRecorderRef.current.stop();
      } catch (_) {}
      mediaRecorderRef.current = null;
    }
    cleanupAudio();

    const finalText = accumulatedTextRef.current.trim();
    if (finalText) {
      setState(VOICE_STATES.RESULT);
      if (onResult) onResult(finalText);
      setTimeout(() => {
        setState(VOICE_STATES.IDLE);
        setTranscript('');
      }, 3000);
    } else {
      setState(VOICE_STATES.IDLE);
    }
  };

  const toggleListening = () => {
    if (state === VOICE_STATES.RECORDING) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  // ── Compact Button Variant (For chat bars, forms, text inputs) ──
  if (compact) {
    return (
      <div className="relative inline-flex items-center">
        <button
          type="button"
          onClick={toggleListening}
          title={state === VOICE_STATES.RECORDING ? 'Click to Stop' : t.common?.tapToSpeak || 'Tap to Speak'}
          className={`p-2.5 rounded-xl transition-all flex items-center justify-center ${
            state === VOICE_STATES.RECORDING
              ? 'bg-rose-500 text-white animate-pulse shadow-md shadow-rose-300 ring-2 ring-rose-400'
              : state === VOICE_STATES.PROCESSING
              ? 'bg-amber-500 text-white'
              : state === VOICE_STATES.RESULT
              ? 'bg-emerald-600 text-white'
              : 'bg-health-50 dark:bg-slate-700 text-health-700 dark:text-health-300 hover:bg-health-100 dark:hover:bg-slate-600 border border-health-200 dark:border-slate-600'
          } ${className}`}
        >
          {state === VOICE_STATES.RECORDING ? (
            <Square className="w-4 h-4 fill-white" />
          ) : state === VOICE_STATES.PROCESSING ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : state === VOICE_STATES.RESULT ? (
            <CheckCircle2 className="w-4 h-4" />
          ) : (
            <Mic className="w-4 h-4" />
          )}
        </button>

        {errorMessage && (
          <div className="absolute bottom-full right-0 mb-2 w-56 p-2.5 bg-rose-50 dark:bg-rose-950/80 border border-rose-200 dark:border-rose-800 rounded-xl shadow-lg text-[11px] text-rose-700 dark:text-rose-300 z-50 flex items-start gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}
      </div>
    );
  }

  // ── Full VoiceInput Component (For Dashboard, Modals) ──
  return (
    <div
      className={`rounded-2xl border transition-all duration-300 ${
        state === VOICE_STATES.RECORDING
          ? 'bg-rose-50/90 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800/80 p-6 shadow-glow ring-2 ring-rose-200 dark:ring-rose-900/40'
          : state === VOICE_STATES.RESULT
          ? 'bg-emerald-50/90 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800/80 p-6'
          : state === VOICE_STATES.ERROR
          ? 'bg-rose-50/70 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800/60 p-5'
          : 'bg-gradient-to-r from-health-50/70 via-slate-50 to-teal-50/50 dark:from-slate-800/80 dark:via-slate-800/60 dark:to-slate-900 border-health-200/80 dark:border-slate-700/80 p-5'
      } ${className}`}
    >
      <div className="flex flex-col sm:flex-row items-center gap-4">
        {/* Voice Trigger Button */}
        <button
          type="button"
          onClick={toggleListening}
          className={`relative group w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 shadow-md ${
            state === VOICE_STATES.RECORDING
              ? 'bg-rose-500 text-white scale-110 shadow-rose-500/40 animate-pulse'
              : state === VOICE_STATES.RESULT
              ? 'bg-emerald-600 text-white'
              : 'bg-gradient-to-tr from-health-600 to-teal-500 text-white hover:scale-105 hover:shadow-lg hover:shadow-health-500/25'
          }`}
        >
          {state === VOICE_STATES.RECORDING ? (
            <Square className="w-6 h-6 fill-white" />
          ) : state === VOICE_STATES.PROCESSING ? (
            <Loader2 className="w-6 h-6 animate-spin" />
          ) : state === VOICE_STATES.RESULT ? (
            <CheckCircle2 className="w-6 h-6 text-white" />
          ) : (
            <Mic className="w-6 h-6 transition-transform group-hover:scale-110" />
          )}

          {state === VOICE_STATES.RECORDING && (
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
            </span>
          )}
        </button>

        {/* Text & Status Display */}
        <div className="flex-1 text-center sm:text-left min-w-0">
          {state === VOICE_STATES.IDLE && (
            <div>
              <div className="flex items-center justify-center sm:justify-start gap-1.5 font-semibold text-slate-800 dark:text-slate-100 text-base">
                <Sparkles className="w-4 h-4 text-health-600 dark:text-health-400" />
                <span>{t.home?.voicePrompt || 'Speak your health update'}</span>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                {placeholder}
              </p>
            </div>
          )}

          {state === VOICE_STATES.RECORDING && (
            <div>
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <span className="font-semibold text-rose-600 dark:text-rose-400 text-base">
                  {t.common?.listening || 'Listening…'}
                </span>
                <div className="flex items-end gap-1 h-5">
                  {audioLevel.map((height, i) => (
                    <div
                      key={i}
                      className="w-1.5 bg-rose-500 rounded-full transition-all duration-100"
                      style={{ height: `${Math.max(6, Math.min(24, height * 0.28))}px` }}
                    />
                  ))}
                </div>
              </div>
              <p className="text-xs text-rose-700/90 dark:text-rose-300 mt-1 font-medium">
                {transcript ? (
                  <span className="bg-white/80 dark:bg-slate-800 px-2 py-0.5 rounded border border-rose-200 dark:border-rose-800 text-slate-900 dark:text-slate-100">
                    "{transcript}"
                  </span>
                ) : (
                  `Listening in ${LANG_NAMES[spokenLanguage || currentLang] || 'English'} — speak clearly into your mic`
                )}
              </p>
            </div>
          )}

          {state === VOICE_STATES.PROCESSING && (
            <div>
              <p className="font-semibold text-teal-700 dark:text-teal-300 text-base">
                {t.common?.processing || 'Processing speech…'}
              </p>
              <p className="text-xs text-teal-600 dark:text-teal-400">Converting spoken words to text…</p>
            </div>
          )}

          {state === VOICE_STATES.RESULT && (
            <div className="animate-fade-in">
              <div className="text-xs font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-300 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Voice Recognized</span>
              </div>
              <p className="text-sm font-medium text-slate-800 dark:text-slate-100 mt-1 bg-white dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-emerald-200 dark:border-emerald-800 shadow-xs">
                "{transcript}"
              </p>
            </div>
          )}

          {state === VOICE_STATES.ERROR && (
            <div>
              <p className="text-xs font-bold text-rose-700 dark:text-rose-400 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>Microphone Notice</span>
              </p>
              <p className="text-xs text-rose-600 dark:text-rose-300 mt-0.5">{errorMessage}</p>
            </div>
          )}
        </div>

        {/* Action button */}
        {state === VOICE_STATES.IDLE ? (
          <button
            type="button"
            onClick={toggleListening}
            className="hidden md:inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-health-700 bg-white hover:bg-health-50 border border-health-200 rounded-xl transition-all shadow-xs"
          >
            <Mic className="w-3.5 h-3.5" />
            <span>{t.common?.tapToSpeak || 'Tap to Speak'}</span>
          </button>
        ) : state === VOICE_STATES.RECORDING ? (
          <button
            type="button"
            onClick={toggleListening}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-all shadow-sm"
          >
            <Square className="w-3.5 h-3.5 fill-white" />
            <span>Done Speaking</span>
          </button>
        ) : null}
      </div>
    </div>
  );
};