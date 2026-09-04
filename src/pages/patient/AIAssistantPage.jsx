import React, { useState, useRef, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  Sparkles, 
  Send, 
  Mic, 
  Bot, 
  User, 
  RefreshCw, 
  ShieldAlert, 
  HelpCircle,
  Loader2,
  Volume2,
  VolumeX,
  Settings,
  Key,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  X,
  Globe,
  ChevronDown,
  Check,
  FileText,
  Radio,
  Clock,
  MessageSquare,
  Plus,
  Trash2,
  Database
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useHealth } from '../../context/HealthContext';
import { useLanguage } from '../../context/LanguageContext';
import { languages } from '../../locales';
import { aiService } from '../../services/aiService';
import { chatSessionService } from '../../services/chatSessionService';
import { AIMessage } from '../../components/ai/AIMessage';
import { AISuggestion } from '../../components/ai/AISuggestion';
import { VoiceInput } from '../../components/common/VoiceInput';
import { DoctorSessionTimer } from '../../components/ai/DoctorSessionTimer';
import { ConversationSummaryCard } from '../../components/ai/ConversationSummaryCard';
import { MachineRecordingPanel } from '../../components/ai/MachineRecordingPanel';
import { defaultAiGreetings } from '../../data/mockAiResponses';

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

export const AIAssistantPage = () => {
  const [searchParams] = useSearchParams();
  const { user, role, isDoctor } = useAuth();
  const { records, addRecord, showToast } = useHealth();
  const { t, currentLang } = useLanguage();

  const [inputQuery, setInputQuery] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: "msg_init_1",
      sender: "ai",
      text: defaultAiGreetings[0],
    },
    {
      id: "msg_init_2",
      sender: "ai",
      text: defaultAiGreetings[1],
      followUp: {
        question: "Here are some quick topics you can ask me about:",
        options: [
          "How has my blood pressure changed this month?",
          "Prepare me for my next doctor visit.",
          "What medicines have I recorded?",
          "Why has my blood sugar been fluctuating recently?"
        ]
      }
    }
  ]);

  // Chat Sessions (Multi-turn scoped history)
  const [sessions, setSessions] = useState([]);
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [isSessionsDropdownOpen, setIsSessionsDropdownOpen] = useState(false);
  const sessionsDropdownRef = useRef(null);

  // Voice Language Switcher state
  const [voiceLang, setVoiceLang] = useState(() => {
    return localStorage.getItem('ai_voice_lang') || currentLang || 'en';
  });
  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);
  const langDropdownRef = useRef(null);

  // Voice output (TTS) states
  const [autoSpeak, setAutoSpeak] = useState(() => {
    return localStorage.getItem('ai_auto_speak') === 'true';
  });
  const [speakingMsgId, setSpeakingMsgId] = useState(null);

  // Voice mode toggle (voice-first experience)
  const [isVoiceMode, setIsVoiceMode] = useState(false);

  // Machine recording panel visibility
  const [showMachineRecording, setShowMachineRecording] = useState(false);

  // End-of-session Summary states
  const [activeSummary, setActiveSummary] = useState(null);
  const [summaryDuration, setSummaryDuration] = useState(null);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);

  // AI Configuration modal state
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [aiConfig, setAiConfig] = useState(() => aiService.getAiConfig());
  const [apiKeyInput, setApiKeyInput] = useState(() => aiConfig.apiKey);
  const [providerSelect, setProviderSelect] = useState(() => aiConfig.provider || 'auto');
  const [configSaveStatus, setConfigSaveStatus] = useState('');

  const messagesEndRef = useRef(null);

  const activeVoiceLanguage = languages.find((l) => l.code === voiceLang) || languages[0];
  const activeSession = sessions.find((s) => s.id === currentSessionId) || sessions[0];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, activeSummary]);

  // Load chat sessions from Supabase on mount
  useEffect(() => {
    const loadSessions = async () => {
      try {
        const list = await chatSessionService.listSessions();
        setSessions(list);
        if (list.length > 0) {
          const firstSession = list[0];
          setCurrentSessionId(firstSession.id);
          const history = await chatSessionService.getSessionMessages(firstSession.id);
          if (history && history.length > 0) {
            setMessages(
              history.map((m) => ({
                id: m.id,
                sender: m.role === 'user' ? 'user' : 'ai',
                text: m.content,
                toolCalls: m.metadata?.toolCalls,
                isRefusal: m.metadata?.isRefusal,
              }))
            );
          }
        } else {
          const newS = await chatSessionService.createSession('Health Consultation');
          setSessions([newS]);
          setCurrentSessionId(newS.id);
        }
      } catch (e) {
        console.warn('Could not load chat sessions:', e);
      }
    };
    loadSessions();
  }, []);

  // Cleanup speech on unmount
  useEffect(() => {
    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (langDropdownRef.current && !langDropdownRef.current.contains(e.target)) {
        setIsLangDropdownOpen(false);
      }
      if (sessionsDropdownRef.current && !sessionsDropdownRef.current.contains(e.target)) {
        setIsSessionsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const hasHandledQueryRef = useRef(null);

  // ── Session handlers ──
  const handleCreateNewSession = async () => {
    try {
      const title = `Consultation (${new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric' })})`;
      const newSession = await chatSessionService.createSession(title);
      setSessions((prev) => [newSession, ...prev]);
      setCurrentSessionId(newSession.id);
      setIsSessionsDropdownOpen(false);
      setMessages([
        { id: `msg_${Date.now()}_1`, sender: 'ai', text: defaultAiGreetings[0] },
        {
          id: `msg_${Date.now()}_2`,
          sender: 'ai',
          text: defaultAiGreetings[1],
          followUp: {
            question: 'Here are some quick topics you can ask me about:',
            options: [
              'How has my blood pressure changed this month?',
              'Prepare me for my next doctor visit.',
              'What medicines have I recorded?',
            ],
          },
        },
      ]);
      setActiveSummary(null);
      showToast('New consultation session started', 'success');
    } catch (e) {
      showToast('Failed to start new session', 'error');
    }
  };

  const handleSelectSession = async (sessionItem) => {
    setCurrentSessionId(sessionItem.id);
    setIsSessionsDropdownOpen(false);
    try {
      const history = await chatSessionService.getSessionMessages(sessionItem.id);
      if (history && history.length > 0) {
        setMessages(
          history.map((m) => ({
            id: m.id,
            sender: m.role === 'user' ? 'user' : 'ai',
            text: m.content,
            toolCalls: m.metadata?.toolCalls,
            isRefusal: m.metadata?.isRefusal,
          }))
        );
      } else {
        setMessages([
          { id: `msg_init_1`, sender: 'ai', text: defaultAiGreetings[0] },
          { id: `msg_init_2`, sender: 'ai', text: defaultAiGreetings[1] },
        ]);
      }
      setActiveSummary(null);
    } catch (e) {
      console.warn('Failed to load session messages:', e);
    }
  };

  // ── Language switcher selection ──
  const handleSelectVoiceLang = (code) => {
    setVoiceLang(code);
    localStorage.setItem('ai_voice_lang', code);
    setIsLangDropdownOpen(false);
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setSpeakingMsgId(null);
    }
  };

  // ── Speech Synthesis (Assistant voice output) ──
  const handleSpeak = (text, msgId, langCode) => {
    if (!window.speechSynthesis) return;

    if (speakingMsgId === msgId) {
      window.speechSynthesis.cancel();
      setSpeakingMsgId(null);
      return;
    }

    window.speechSynthesis.cancel();

    // Strip markdown formatting for natural speech
    const cleanText = text
      .replace(/[#*_`~\[\]]/g, '')
      .replace(/\(.*?\)/g, '')
      .replace(/\n+/g, '. ')
      .trim();

    const targetCode = langCode || voiceLang || 'en';
    const utter = new SpeechSynthesisUtterance(cleanText);
    const bcpCode = BCP47_MAP[targetCode] || 'en-IN';
    utter.lang = bcpCode;
    utter.rate = 0.95;

    // Search for best matching voice in browser
    const voices = window.speechSynthesis.getVoices();
    const matchedVoice = voices.find(
      (v) =>
        v.lang === bcpCode ||
        v.lang.replace('_', '-').startsWith(targetCode) ||
        v.lang.toLowerCase().includes(targetCode)
    );
    if (matchedVoice) {
      utter.voice = matchedVoice;
    }

    utter.onend = () => setSpeakingMsgId(null);
    utter.onerror = () => setSpeakingMsgId(null);

    setSpeakingMsgId(msgId);
    window.speechSynthesis.speak(utter);
  };

  const handleToggleAutoSpeak = () => {
    setAutoSpeak((prev) => {
      const next = !prev;
      localStorage.setItem('ai_auto_speak', String(next));
      if (!next && window.speechSynthesis) {
        window.speechSynthesis.cancel();
        setSpeakingMsgId(null);
      }
      return next;
    });
  };

  // ── Send Message & Receive Multi-turn Response ──
  const handleSend = async (queryText) => {
    const query = (queryText || inputQuery).trim();
    if (!query) return;

    // Append user message
    const userMsg = {
      id: `user_${Date.now()}`,
      sender: 'user',
      text: query,
      lang: voiceLang
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');
    setIsTyping(true);

    try {
      // Passes query, records, profile, language, currentSessionId, and historical messages
      const response = await aiService.askAssistant(
        query,
        records,
        user,
        voiceLang,
        currentSessionId,
        messages
      );
      
      const aiMsg = {
        id: response.id || `ai_${Date.now()}`,
        sender: 'ai',
        text: response.aiResponse,
        lang: response.lang || voiceLang,
        disclaimer: response.disclaimer,
        followUp: response.followUp,
        toolCalls: response.toolCalls || [],
        isRefusal: response.isRefusal || false,
      };

      setMessages((prev) => [...prev, aiMsg]);

      // Auto-speak response if enabled or in Voice Mode
      if (autoSpeak || isVoiceMode) {
        setTimeout(() => {
          handleSpeak(response.aiResponse, aiMsg.id, response.lang || voiceLang);
        }, 150);
      }
    } catch (err) {
      console.error('[AIAssistant] Error querying assistant:', err);
      setMessages((prev) => [
        ...prev,
        {
          id: `err_${Date.now()}`,
          sender: 'ai',
          text: `⚠️ **AI Query Notice**\n\n${err.message}\n\nYou can configure your API key by clicking the **AI Settings** button in the top right.`,
          disclaimer: "Informational assistant only."
        }
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  // ── Generate End of Session Clinical Summary ──
  const handleGenerateSummary = async (sessionSecs = 0) => {
    if (messages.length <= 2 && !inputQuery) {
      showToast('Please have a brief conversation before generating a session summary.', 'info');
      return;
    }

    setIsGeneratingSummary(true);
    setSummaryDuration(sessionSecs);

    try {
      showToast('Generating clinical consultation summary...', 'info');
      const summary = await aiService.summarizeConversation(
        messages,
        user,
        voiceLang,
        { duration: sessionSecs, doctorMode: isDoctor }
      );
      setActiveSummary(summary);
      showToast('Consultation summary generated successfully!', 'success');
    } catch (err) {
      console.error('[AIAssistant] Summary error:', err);
      showToast('Failed to generate summary: ' + err.message, 'error');
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  // ── Save Summary Directly to Health Timeline ──
  const handleSaveSummaryToTimeline = async (summary, duration) => {
    try {
      const newRecord = {
        id: `rec_summary_${Date.now()}`,
        date: new Date().toISOString(),
        type: 'consultation',
        title: summary.title || 'Clinical Consultation Summary',
        provider: isDoctor ? `Dr. ${user?.name || 'Practitioner'}` : 'Aarogya Clinical Assistant',
        facility: 'Telehealth & AI Consultation Session',
        notes: `${summary.overview}\n\nKey Insights:\n${(summary.insights || []).join('\n')}\n\nAction Items:\n${(summary.actionItems || []).join('\n')}`,
        vitals: summary.vitals && summary.vitals.length > 0 ? { notes: summary.vitals.join(', ') } : undefined,
        tags: [
          'Clinical Summary',
          isDoctor ? 'Doctor Session' : 'Patient Self-Check',
          ...(summary.topics || [])
        ],
        metadata: {
          duration,
          doctorMode: isDoctor,
          summary,
        }
      };

      if (addRecord) {
        await addRecord(newRecord);
      }
      showToast('Consultation summary permanently saved to your Health Timeline!', 'success');
    } catch (err) {
      console.error('Failed to save summary to timeline:', err);
      showToast('Error saving to health timeline', 'error');
      throw err;
    }
  };

  // Handle incoming query from other pages (e.g. HomePage voice card)
  useEffect(() => {
    const initialQ = searchParams.get('q');
    if (initialQ && initialQ.trim() && hasHandledQueryRef.current !== initialQ) {
      hasHandledQueryRef.current = initialQ;
      handleSend(initialQ.trim());
    }
  }, [searchParams]);

  const handleOptionSelect = (optionText) => {
    handleSend(optionText);
  };

  const handleClearChat = () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setSpeakingMsgId(null);
    }
    setActiveSummary(null);
    setSummaryDuration(null);
    setMessages([
      {
        id: `msg_${Date.now()}`,
        sender: "ai",
        text: "Health Memory Assistant reset. How can I help you explore your recorded health timeline?",
        followUp: {
          question: "Suggested queries:",
          options: [
            "How has my blood pressure changed this month?",
            "Prepare me for my next doctor visit.",
            "What medicines have I recorded?"
          ]
        }
      }
    ]);
  };

  // ── Save AI Key Modal Handlers ──
  const handleSaveConfig = () => {
    aiService.setAiConfig(apiKeyInput, providerSelect);
    const updated = aiService.getAiConfig();
    setAiConfig(updated);
    setConfigSaveStatus('Configuration saved successfully!');
    setTimeout(() => {
      setConfigSaveStatus('');
      setShowConfigModal(false);
    }, 1200);
  };

  const handleClearKey = () => {
    aiService.setAiConfig('', 'auto');
    setApiKeyInput('');
    setProviderSelect('auto');
    setAiConfig(aiService.getAiConfig());
    setConfigSaveStatus('Key removed. Reverted to Local Engine.');
    setTimeout(() => setConfigSaveStatus(''), 1500);
  };

  return (
    <div className="max-w-4xl mx-auto flex flex-col h-[calc(100vh-140px)] min-h-[560px]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-200/80 dark:border-slate-800 gap-3 shrink-0">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-health-700 dark:text-health-400 uppercase tracking-wider">
            <Sparkles className="w-4 h-4" />
            <span>Health Memory Intelligence</span>
            {isDoctor && (
              <span className="px-2 py-0.5 rounded-full bg-teal-100 dark:bg-teal-950/80 border border-teal-300 dark:border-teal-800 text-[10px] font-extrabold text-teal-800 dark:text-teal-300">
                Doctor Mode
              </span>
            )}
          </div>

          {/* Session Switcher Dropdown */}
          <div className="flex items-center gap-2 mt-1">
            <div className="relative" ref={sessionsDropdownRef}>
              <button
                type="button"
                onClick={() => setIsSessionsDropdownOpen(!isSessionsDropdownOpen)}
                className="flex items-center gap-1.5 font-extrabold text-slate-900 dark:text-slate-100 hover:text-health-600 dark:hover:text-health-400 transition-colors text-base sm:text-xl tracking-tight"
                title="Switch or manage consultation sessions"
              >
                <MessageSquare className="w-4 h-4 text-health-600 dark:text-health-400 shrink-0" />
                <span className="truncate max-w-[220px] sm:max-w-xs">{activeSession?.title || 'Health Consultation'}</span>
                <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isSessionsDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {isSessionsDropdownOpen && (
                <div className="absolute left-0 mt-2 w-72 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 py-2 z-50 animate-slide-up">
                  <div className="flex items-center justify-between px-3.5 py-1.5 border-b border-slate-100 dark:border-slate-700">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                      Consultation Sessions ({sessions.length})
                    </span>
                    <button
                      type="button"
                      onClick={handleCreateNewSession}
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-health-600 hover:underline"
                    >
                      <Plus className="w-3 h-3" />
                      <span>New</span>
                    </button>
                  </div>

                  <div className="max-h-60 overflow-y-auto py-1">
                    {sessions.map((s) => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => handleSelectSession(s)}
                        className={`w-full flex items-center justify-between px-3.5 py-2 text-xs text-left transition-colors ${
                          currentSessionId === s.id
                            ? 'bg-health-50 dark:bg-slate-700/80 text-health-800 dark:text-health-300 font-bold'
                            : 'text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700'
                        }`}
                      >
                        <span className="truncate flex-1 pr-2">{s.title}</span>
                        {currentSessionId === s.id && <Check className="w-3.5 h-3.5 text-health-600 dark:text-health-400 shrink-0" />}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Controls: Doctor Timer, Voice Language Switcher, Machine Recording, Auto-Speak, Summary */}
        <div className="flex items-center flex-wrap gap-2">
          {/* ── DOCTOR-ONLY SESSION TIMER ── */}
          {isDoctor && (
            <DoctorSessionTimer
              onEndSession={handleGenerateSummary}
              isGeneratingSummary={isGeneratingSummary}
            />
          )}

          {/* Machine Recording Toggle */}
          <button
            type="button"
            onClick={() => setShowMachineRecording(!showMachineRecording)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
              showMachineRecording
                ? 'bg-rose-50 dark:bg-rose-950/50 border-rose-300 dark:border-rose-800 text-rose-700 dark:text-rose-300 shadow-xs'
                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700'
            }`}
            title="Toggle Automatic Consultation Recording & Live Transcription"
          >
            <Radio className={`w-3.5 h-3.5 ${showMachineRecording ? 'text-rose-600 dark:text-rose-400 animate-pulse' : 'text-slate-400'}`} />
            <span className="hidden sm:inline">Auto Record</span>
          </button>

          {/* End Consultation & Summarize Button */}
          <button
            type="button"
            onClick={() => handleGenerateSummary(0)}
            disabled={isGeneratingSummary}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 shadow-xs transition-all disabled:opacity-50"
            title="Generate structured summary of current conversation"
          >
            {isGeneratingSummary ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin text-health-600 dark:text-health-400" />
                <span>Summarizing...</span>
              </>
            ) : (
              <>
                <FileText className="w-3.5 h-3.5 text-health-600 dark:text-health-400" />
                <span className="hidden sm:inline">Summary</span>
              </>
            )}
          </button>

          {/* ── Voice Assistant Language Switcher ── */}
          <div className="relative" ref={langDropdownRef}>
            <button
              type="button"
              onClick={() => setIsLangDropdownOpen(!isLangDropdownOpen)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 hover:border-health-400 shadow-xs transition-all"
              title="Change Voice & Response Language"
            >
              <Globe className="w-3.5 h-3.5 text-health-600 dark:text-health-400" />
              <span>{activeVoiceLanguage.native}</span>
              <span className="text-slate-400 text-[10px] hidden md:inline">({activeVoiceLanguage.name})</span>
              <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${isLangDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {isLangDropdownOpen && (
              <div className="absolute right-0 mt-2 w-52 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 py-2 z-50 animate-slide-up max-h-72 overflow-y-auto">
                <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Voice & Response Language
                </div>
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    type="button"
                    onClick={() => handleSelectVoiceLang(lang.code)}
                    className={`w-full flex items-center justify-between px-3.5 py-2 text-xs text-left transition-colors ${
                      voiceLang === lang.code
                        ? 'bg-health-50 dark:bg-slate-700/70 text-health-800 dark:text-health-300 font-bold'
                        : 'text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700'
                    }`}
                  >
                    <span>
                      {lang.native} <span className="text-slate-400 font-normal text-[11px]">({lang.name})</span>
                    </span>
                    {voiceLang === lang.code && <Check className="w-3.5 h-3.5 text-health-600 dark:text-health-400" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* AI Settings / Provider Badge */}
          <button
            type="button"
            onClick={() => setShowConfigModal(true)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
              aiConfig.isConfigured
                ? 'bg-health-50 dark:bg-health-950/40 border-health-200 dark:border-health-800 text-health-800 dark:text-health-300 hover:bg-health-100'
                : 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 hover:bg-amber-100'
            }`}
            title="Configure AI API Key (Gemini / Groq)"
          >
            <Key className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">
              {aiConfig.isConfigured
                ? aiConfig.provider === 'gemini' ? 'Gemini AI' : 'Groq AI'
                : 'AI Settings'}
            </span>
          </button>

          {/* Auto-speak Toggle Button */}
          <button
            type="button"
            onClick={handleToggleAutoSpeak}
            className={`p-2 rounded-xl transition-all border ${
              autoSpeak
                ? 'bg-teal-50 dark:bg-teal-950/50 border-teal-200 dark:border-teal-800 text-teal-700 dark:text-teal-300 hover:bg-teal-100 shadow-xs'
                : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
            title={autoSpeak ? 'Auto-speak is ON (Click to turn OFF)' : 'Auto-speak is OFF (Click to turn ON)'}
          >
            {autoSpeak ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Reset Conversation */}
          <button
            type="button"
            onClick={handleClearChat}
            className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all border border-slate-200 dark:border-slate-700"
            title="Reset Conversation"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ── MACHINE RECORDING / CONTINUOUS TRANSCRIPTION PANEL ── */}
      {showMachineRecording && (
        <div className="py-2 shrink-0 animate-slide-up">
          <MachineRecordingPanel
            spokenLanguage={voiceLang}
            onSendTranscriptToChat={(transcript) => handleSend(transcript)}
          />
        </div>
      )}

      {/* Suggested Questions Carousel / Chips */}
      <div className="py-2.5 shrink-0 flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {(t.ai?.suggestedQueries || [
          "How has my blood pressure changed this month?",
          "Prepare me for my next doctor visit.",
          "What medicines have I recorded?"
        ]).map((query, idx) => (
          <AISuggestion
            key={idx}
            query={query}
            onClick={(q) => handleSend(q)}
          />
        ))}
      </div>

      {/* Message Stream */}
      <div className="flex-1 overflow-y-auto space-y-4 py-3 pr-2">
        {messages.map((msg) => (
          <AIMessage
            key={msg.id}
            message={msg}
            onOptionSelect={handleOptionSelect}
            onSpeak={handleSpeak}
            isSpeaking={speakingMsgId === msg.id}
          />
        ))}

        {/* Typing indicator */}
        {isTyping && (
          <div className="flex items-center gap-3 animate-pulse">
            <div className="w-10 h-10 rounded-2xl bg-health-50 dark:bg-health-950/60 text-health-600 dark:text-health-400 flex items-center justify-center border border-health-200 dark:border-health-800">
              <Sparkles className="w-5 h-5 animate-spin" />
            </div>
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 py-3 rounded-2xl text-xs text-slate-600 dark:text-slate-300 font-medium">
              Consulting health records in {activeVoiceLanguage.native}...
            </div>
          </div>
        )}

        {/* Active Consultation Summary Card */}
        {activeSummary && (
          <div className="my-4 animate-slide-up">
            <ConversationSummaryCard
              summary={activeSummary}
              sessionDuration={summaryDuration}
              onSaveToTimeline={handleSaveSummaryToTimeline}
              onClose={() => setActiveSummary(null)}
            />
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* ── Input Area with Voice / Text Chat Toggle & Clear Microphone Button ── */}
      <div className="pt-3 border-t border-slate-200 dark:border-slate-800 shrink-0 space-y-2">
        {/* Voice Mode Active Banner */}
        {isVoiceMode && (
          <div className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 text-xs text-teal-800 dark:text-teal-300 animate-fade-in">
            <div className="flex items-center gap-2">
              <Mic className="w-4 h-4 text-teal-600 dark:text-teal-400 animate-pulse" />
              <span className="font-semibold">Voice Chat Mode Active:</span>
              <span className="text-teal-600 dark:text-teal-400">Speak using the mic button, responses will automatically be read aloud.</span>
            </div>
            <button
              type="button"
              onClick={() => setIsVoiceMode(false)}
              className="text-[11px] font-bold text-teal-700 dark:text-teal-400 hover:underline"
            >
              Switch to Text
            </button>
          </div>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          {/* Mode Switch Button (Voice / Text) */}
          <button
            type="button"
            onClick={() => setIsVoiceMode(!isVoiceMode)}
            className={`px-3 py-3 rounded-2xl border text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 shadow-2xs ${
              isVoiceMode
                ? 'bg-teal-600 text-white border-teal-600 shadow-teal-600/20'
                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
            }`}
            title={isVoiceMode ? 'Voice Mode Active (Click for Text mode)' : 'Switch to Voice Mode'}
          >
            {isVoiceMode ? <Mic className="w-4 h-4" /> : <MessageSquare className="w-4 h-4" />}
            <span className="hidden md:inline">{isVoiceMode ? 'Voice Mode' : 'Text Mode'}</span>
          </button>

          {/* Text Input with embedded clear Microphone button */}
          <div className="relative flex-1">
            <input
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              placeholder={`Ask about your health records in ${activeVoiceLanguage.native} (${activeVoiceLanguage.name})...`}
              className="w-full pl-4 pr-12 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs sm:text-sm font-medium text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-health-500 focus:outline-none shadow-xs"
            />
            <div className="absolute right-2.5 top-1/2 -translate-y-1/2">
              <VoiceInput
                compact={true}
                spokenLanguage={voiceLang}
                onResult={(speech) => {
                  setInputQuery(speech);
                  handleSend(speech);
                }}
              />
            </div>
          </div>

          {/* Send Button */}
          <button
            type="submit"
            disabled={!inputQuery.trim() || isTyping}
            className="w-12 h-12 rounded-2xl bg-health-600 hover:bg-health-700 disabled:opacity-40 text-white flex items-center justify-center shadow-md shadow-health-600/20 transition-all shrink-0 active:scale-95"
            title="Send Query"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>

        <div className="flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500 px-2">
          <span>{t.ai?.disclaimer || 'Aarogya AI is scoped to personal health tracking and does not replace medical consultation.'}</span>
          <span className="hidden sm:inline font-mono">Session: {activeSession?.title || 'Active'}</span>
        </div>
      </div>

      {/* ── AI Settings Modal ── */}
      {showConfigModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 dark:border-slate-800 animate-scale-up space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-health-50 dark:bg-health-950/60 text-health-600 dark:text-health-400 flex items-center justify-center">
                  <Key className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">AI Assistant Configuration</h3>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500">Connect a real LLM for live responses</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowConfigModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Provider Select */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                AI Provider
              </label>
              <select
                value={providerSelect}
                onChange={(e) => setProviderSelect(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-xl text-xs font-medium focus:ring-2 focus:ring-health-500"
              >
                <option value="gemini">Google Gemini (Recommended - Supports Function Calling)</option>
                <option value="groq">Groq Cloud (Llama 3.1 - Ultra Fast)</option>
                <option value="auto">Auto-Detect</option>
              </select>
            </div>

            {/* API Key Input */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                API Key
              </label>
              <input
                type="password"
                value={apiKeyInput}
                onChange={(e) => setApiKeyInput(e.target.value)}
                placeholder="Paste your key (AIza... or gsk_...)"
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-xl text-xs font-mono focus:ring-2 focus:ring-health-500"
              />
              <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
                Your key is stored securely in your browser session and never sent to third-party servers.
              </p>
            </div>

            {/* Free Key Instructions */}
            <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 rounded-2xl p-3.5 text-xs space-y-2">
              <span className="font-semibold text-slate-700 dark:text-slate-300">Where to get free keys (takes 30 seconds):</span>
              <div className="space-y-1 text-slate-600 dark:text-slate-300">
                <a
                  href="https://aistudio.google.com/app/apikey"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-health-400 text-health-700 dark:text-health-400 transition-all font-medium"
                >
                  <span>1. Google AI Studio (Free Gemini API key)</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
                <a
                  href="https://console.groq.com/keys"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-health-400 text-health-700 dark:text-health-400 transition-all font-medium"
                >
                  <span>2. Groq Console (Free, fast)</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            {/* Save Status Message */}
            {configSaveStatus && (
              <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-xs font-semibold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>{configSaveStatus}</span>
              </div>
            )}

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-2">
              {aiConfig.isConfigured && (
                <button
                  type="button"
                  onClick={handleClearKey}
                  className="text-xs font-semibold text-rose-600 dark:text-rose-400 hover:underline"
                >
                  Remove Key
                </button>
              )}
              <div className="flex items-center gap-2 ml-auto">
                <button
                  type="button"
                  onClick={() => setShowConfigModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveConfig}
                  className="px-5 py-2 text-xs font-bold text-white bg-health-600 hover:bg-health-700 rounded-xl shadow-md shadow-health-600/20"
                >
                  Save & Apply
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
