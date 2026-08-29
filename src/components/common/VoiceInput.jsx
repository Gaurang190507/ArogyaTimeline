import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, Loader2, CheckCircle2, Sparkles } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { LANG_NAMES } from '../../services/translationService';

const VOICE_STATES = {
  IDLE: 'IDLE',
  RECORDING: 'RECORDING',
  PROCESSING: 'PROCESSING',
  RESULT: 'RESULT',
};

export const VoiceInput = ({
  onResult,
  placeholder = 'Speak naturally in your preferred language...',
  samplePhrases = [
    "I've had a dull headache since yesterday morning and felt slightly dizzy.",
    'My blood pressure was 130 over 85 this morning after breakfast.',
    'I took my Pantoprazole 40mg dose at 8 AM.',
    'I have been feeling stomach burning after eating dinner.',
  ],
  compact = false,
  className = '',
  // Spoken language overrides UI language if provided
  spokenLanguage,
}) => {
  const { t, currentLang } = useLanguage();
  const [state, setState] = useState(VOICE_STATES.IDLE);
  const [transcript, setTranscript] = useState('');
  const [audioLevel, setAudioLevel] = useState([20, 45, 70, 30, 85, 50, 25]);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const animationRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);

  const GROQ_PROXY_URL = import.meta.env.VITE_GROQ_PROXY_URL;
  const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY; // fallback if no proxy
  const hasAi = Boolean(GROQ_PROXY_URL || (GROQ_API_KEY && GROQ_API_KEY !== 'your-groq-api-key-here'));
  // Use spokenLanguage if provided, otherwise default to English for transcription
  // (Whisper can auto-detect, but sending an explicit language improves accuracy)
  const whisperLang = spokenLanguage || (currentLang !== 'en' ? currentLang : 'en');

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
      if (audioContextRef.current) {
        audioContextRef.current.close().catch(() => {});
      }
      if (animationRef.current) {
        clearInterval(animationRef.current);
      }
    };
  }, []);

  // ── Audio visualizer during recording ──
  useEffect(() => {
    if (state === VOICE_STATES.RECORDING && analyserRef.current) {
      const analyser = analyserRef.current;
      const dataArray = new Uint8Array(analyser.frequencyBinCount || 256);

      const draw = () => {
        analyser.getByteFrequencyData(dataArray);
        const bars = [];
        const sliceCount = Math.min(7, dataArray.length);
        for (let i = 0; i < sliceCount; i++) {
          const start = Math.floor((i * dataArray.length) / sliceCount);
          const end = Math.floor(((i + 1) * dataArray.length) / sliceCount);
          let sum = 0;
          for (let j = start; j < end; j++) sum += dataArray[j];
          bars.push(Math.floor(sum / Math.max(1, end - start)));
        }
        // Pad to 7 bars
        while (bars.length < 7) bars.push(20);
        setAudioLevel(bars);
      };

      animationRef.current = setInterval(draw, 100);
    } else if (animationRef.current) {
      clearInterval(animationRef.current);
      animationRef.current = null;
    }

    return () => {
      if (animationRef.current) {
        clearInterval(animationRef.current);
        animationRef.current = null;
      }
    };
  }, [state]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      if (hasAi) {
        // ── Real Whisper path ──
        const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
          ? 'audio/webm;codecs=opus'
          : 'audio/webm';
        const mediaRecorder = new MediaRecorder(stream, { mimeType });

        audioChunksRef.current = [];

        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            audioChunksRef.current.push(event.data);
          }
        };

        mediaRecorder.start(200); // Emit chunks every 200ms
        mediaRecorderRef.current = mediaRecorder;
        setState(VOICE_STATES.RECORDING);

        // Setup visualizer
        if (window.AudioContext) {
          const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
          audioContextRef.current = audioCtx;
          const source = audioCtx.createMediaStreamSource(stream);
          const analyser = audioCtx.createAnalyser();
          analyser.fftSize = 256;
          source.connect(analyser);
          analyserRef.current = analyser;
        }

        // Stop tracks when recording ends
        mediaRecorder.onstop = async () => {
          stream.getTracks().forEach((t) => t.stop());
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          audioChunksRef.current = [];
          setState(VOICE_STATES.PROCESSING);
          const result = await transcribeWithWhisper(audioBlob);
          setTranscript(result);
          setState(VOICE_STATES.RESULT);
          if (onResult) onResult(result);
          setTimeout(() => {
            setState(VOICE_STATES.IDLE);
            setTranscript('');
          }, 3500);
        };
      } else {
        // ── Fallback: simulation ──
        simulateVoiceInput(stream);
      }
    } catch (err) {
      console.error('[VoiceInput] Mic error:', err);
      simulateVoiceInput(null);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    setState(VOICE_STATES.IDLE);
  };

  const transcribeWithWhisper = async (audioBlob) => {
    try {
      let json;

      if (GROQ_PROXY_URL) {
        // Convert blob → base64 for JSON transport to the Edge Function
        const arrayBuf = await audioBlob.arrayBuffer();
        const bytes = new Uint8Array(arrayBuf);
        let binary = '';
        bytes.forEach(b => (binary += String.fromCharCode(b)));
        const audioBase64 = btoa(binary);

        const res = await fetch(GROQ_PROXY_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            kind: 'transcribe',
            audioBase64,
            language: whisperLang,
            mimeType: audioBlob.type || 'audio/webm',
          }),
        });
        if (!res.ok) throw new Error(`Proxy error: ${res.status} ${res.statusText}`);
        json = await res.json();
      } else {
        // Direct call to Groq (API key in client — not recommended for prod)
        const formData = new FormData();
        formData.append('file', audioBlob, 'recording.webm');
        formData.append('model', 'whisper-large-v3');
        formData.append('language', whisperLang);
        formData.append(
          'prompt',
          'Transcribe only the spoken words. Remove filler sounds like um, ah, eh. Keep medical terms exact.'
        );
        const res = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
          method: 'POST',
          headers: { Authorization: `Bearer ${GROQ_API_KEY}` },
          body: formData,
        });
        if (!res.ok) throw new Error(`Whisper API error: ${res.status} ${res.statusText}`);
        json = await res.json();
      }

      let text = json.text || '';

      // Translate regional language speech → English for the AI assistant
      if (whisperLang !== 'en') {
        text = await translateToEnglish(text, whisperLang);
      }

      return text.trim();
    } catch (err) {
      console.error('[VoiceInput] Whisper failed:', err.message);
      return `[Transcription error: ${err.message}]`;
    }
  };

  const translateToEnglish = async (text, sourceLang) => {
    const chatPayload = {
      messages: [
        {
          role: 'system',
          content: `Translate the following ${LANG_NAMES[sourceLang] || sourceLang} text from the user's voice into English. Output ONLY the English translation, no formatting, no quotation marks, no explanations.`,
        },
        { role: 'user', content: text },
      ],
      temperature: 0.1,
    };

    const url = GROQ_PROXY_URL || 'https://api.groq.com/openai/v1/chat/completions';
    const headers = GROQ_PROXY_URL
      ? { 'Content-Type': 'application/json' }
      : { 'Authorization': `Bearer ${GROQ_API_KEY}`, 'Content-Type': 'application/json' };
    const body = GROQ_PROXY_URL
      ? JSON.stringify({ kind: 'chat', ...chatPayload })
      : JSON.stringify({ model: 'llama-3.1-8b-instant', ...chatPayload });

    const res = await fetch(url, { method: 'POST', headers, body });
    if (!res.ok) return text;
    const json = await res.json();
    return json.choices?.[0]?.message?.content || text;
  };

  // ── Simulation fallback ──
  const simulateVoiceInput = (stream) => {
    setState(VOICE_STATES.RECORDING);
    setAudioLevel([20, 45, 70, 30, 85, 50, 25]);

    setTimeout(() => {
      setState(VOICE_STATES.PROCESSING);
      setTimeout(() => {
        const phrase = samplePhrases[Math.floor(Math.random() * samplePhrases.length)];
        setTranscript(phrase);
        setState(VOICE_STATES.RESULT);
        if (onResult) onResult(phrase);
        setTimeout(() => {
          setState(VOICE_STATES.IDLE);
          setTranscript('');
        }, 3500);
      }, 1500);
    }, 2000);

    // Stop the stream if we opened it
    if (stream) stream.getTracks().forEach((t) => t.stop());
  };

  const handleStartListening = () => {
    if (state === VOICE_STATES.IDLE) {
      startRecording();
    } else if (state === VOICE_STATES.RECORDING) {
      stopRecording();
    }
  };

  // ── Compact Button Variant ──
  if (compact) {
    return (
      <button
        type="button"
        onClick={handleStartListening}
        title={state === VOICE_STATES.IDLE ? t.common.tapToSpeak : t.common.listening}
        className={`p-2.5 rounded-xl transition-all flex items-center justify-center ${
          state === VOICE_STATES.IDLE
            ? 'bg-health-50 text-health-700 hover:bg-health-100 border border-health-200'
            : 'bg-rose-500 text-white animate-pulse shadow-md shadow-rose-200'
        } ${className}`}
      >
        {state === VOICE_STATES.IDLE && <Mic className="w-5 h-5" />}
        {state === VOICE_STATES.RECORDING && <Square className="w-5 h-5" />}
        {state === VOICE_STATES.PROCESSING && <Loader2 className="w-5 h-5 animate-spin" />}
        {state === VOICE_STATES.RESULT && <CheckCircle2 className="w-5 h-5" />}
      </button>
    );
  }

  // ── Full VoiceInput Component ──
  return (
    <div
      className={`rounded-2xl border transition-all duration-300 ${
        state === VOICE_STATES.IDLE
          ? 'bg-gradient-to-r from-health-50/70 via-slate-50 to-teal-50/50 border-health-200/80 p-5'
          : state === VOICE_STATES.RECORDING
          ? 'bg-rose-50/80 border-rose-300 p-6 shadow-glow'
          : 'bg-emerald-50/80 border-emerald-300 p-6'
      } ${className}`}
    >
      <div className="flex flex-col sm:flex-row items-center gap-4">
        {/* Voice Trigger Button */}
        <button
          type="button"
          onClick={handleStartListening}
          className={`relative group w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 shadow-md ${
            state === VOICE_STATES.IDLE
              ? 'bg-gradient-to-tr from-health-600 to-teal-500 text-white hover:scale-105 hover:shadow-lg hover:shadow-health-500/25'
              : state === VOICE_STATES.RECORDING
              ? 'bg-rose-500 text-white scale-110 shadow-rose-500/40'
              : 'bg-emerald-600 text-white'
          }`}
        >
          {state === VOICE_STATES.IDLE && <Mic className="w-7 h-7 transition-transform group-hover:scale-110" />}
          {state === VOICE_STATES.RECORDING && <Square className="w-7 h-7" />}
          {state === VOICE_STATES.PROCESSING && <Loader2 className="w-7 h-7 animate-spin" />}
          {state === VOICE_STATES.RESULT && <CheckCircle2 className="w-7 h-7 text-white" />}

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
              <div className="flex items-center justify-center sm:justify-start gap-1.5 font-semibold text-slate-800 text-base">
                <Sparkles className="w-4 h-4 text-health-600" />
                <span>{t.home.voicePrompt}</span>
              </div>
              <p className="text-sm text-slate-500 mt-0.5 truncate">
                {t.home.voiceExample}
              </p>
            </div>
          )}

          {state === VOICE_STATES.RECORDING && (
            <div>
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <span className="font-semibold text-rose-600 text-base">{t.common.listening}</span>
                <div className="flex items-end gap-1 h-5">
                  {audioLevel.map((height, i) => (
                    <div
                      key={i}
                      className="w-1 bg-rose-500 rounded-full transition-all duration-150"
                      style={{ height: `${Math.max(6, Math.min(90, height * 0.35))}px` }}
                    />
                  ))}
                </div>
              </div>
              <p className="text-xs text-rose-600/80 mt-1">
                Listening in {LANG_NAMES[currentLang] || 'English'} — speak clearly
              </p>
            </div>
          )}

          {state === VOICE_STATES.PROCESSING && (
            <div>
              <p className="font-semibold text-teal-700 text-base">{t.common.processing}</p>
              <p className="text-xs text-teal-600">Converting speech to text…</p>
            </div>
          )}

          {state === VOICE_STATES.RESULT && (
            <div className="animate-fade-in">
              <div className="text-xs font-semibold uppercase tracking-wider text-emerald-700">
                Voice Recognized
              </div>
              <p className="text-sm font-medium text-slate-800 mt-0.5 bg-white/80 px-3 py-1.5 rounded-lg border border-emerald-200">
                "{transcript}"
              </p>
            </div>
          )}
        </div>

        {/* Helper button when idle */}
        {state === VOICE_STATES.IDLE && (
          <button
            type="button"
            onClick={handleStartListening}
            className="hidden md:inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-health-700 bg-white hover:bg-health-50 border border-health-200 rounded-xl transition-all shadow-sm"
          >
            <Mic className="w-3.5 h-3.5" />
            <span>{t.common.tapToSpeak}</span>
          </button>
        )}
      </div>
    </div>
  );
};