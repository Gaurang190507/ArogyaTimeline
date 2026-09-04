import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Sparkles, 
  Activity, 
  Droplet, 
  Scale, 
  Thermometer, 
  Pill, 
  AlertCircle, 
  StickyNote, 
  ArrowRight, 
  Clock, 
  Calendar, 
  CheckCircle2, 
  FileText, 
  Stethoscope, 
  ChevronRight,
  BookOpen,
  Plus,
  Volume2,
  Square,
  MessageSquare,
  X,
  Loader2,
  Languages
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useHealth } from '../../context/HealthContext';
import { useLanguage } from '../../context/LanguageContext';
import { aiService } from '../../services/aiService';
import { LANG_NAMES } from '../../services/translationService';
import { VoiceInput } from '../../components/common/VoiceInput';
import { RecordCard } from '../../components/records/RecordCard';
import { AnupanaCard } from '../../components/common/AnupanaCard';
import { MetricCard } from '../../components/common/MetricCard';
import { EmptyState } from '../../components/common/EmptyState';
import { FormattedAIResponse } from '../../components/ai/FormattedAIResponse';

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

export const HomePage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { records, reminders, appointments, stats, openAddRecord, loading } = useHealth();
  const { t, currentLang } = useLanguage();

  // Voice assistant state for Home page
  const [voiceQuery, setVoiceQuery] = useState('');
  const [voiceResponse, setVoiceResponse] = useState(null);
  const [isVoiceThinking, setIsVoiceThinking] = useState(false);
  const [isVoiceSpeaking, setIsVoiceSpeaking] = useState(false);
  const [voiceError, setVoiceError] = useState(null);
  const responseCardRef = useRef(null);

  // Stop speech synthesis on unmount
  useEffect(() => {
    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const speakAnswer = (text, langCode) => {
    if (!window.speechSynthesis) return;

    window.speechSynthesis.cancel();

    // Strip markdown formatting for natural speech
    const cleanText = text
      .replace(/[#*_`~\[\]]/g, '')
      .replace(/\(.*?\)/g, '')
      .replace(/\n+/g, '. ')
      .trim();

    const targetCode = langCode || currentLang || 'en';
    const utter = new SpeechSynthesisUtterance(cleanText);
    const bcpCode = BCP47_MAP[targetCode] || 'en-IN';
    utter.lang = bcpCode;
    utter.rate = 0.95;

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

    utter.onstart = () => setIsVoiceSpeaking(true);
    utter.onend = () => setIsVoiceSpeaking(false);
    utter.onerror = () => setIsVoiceSpeaking(false);

    setIsVoiceSpeaking(true);
    window.speechSynthesis.speak(utter);
  };

  const handleToggleVoicePlayback = () => {
    if (!window.speechSynthesis) return;
    if (isVoiceSpeaking) {
      window.speechSynthesis.cancel();
      setIsVoiceSpeaking(false);
    } else if (voiceResponse?.aiResponse) {
      speakAnswer(voiceResponse.aiResponse, voiceResponse.lang || currentLang);
    }
  };

  const handleDismissVoiceCard = () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setIsVoiceSpeaking(false);
    setVoiceResponse(null);
    setVoiceQuery('');
    setVoiceError(null);
    setIsVoiceThinking(false);
  };

  const handleHomeVoiceInput = async (speechText) => {
    const query = (speechText || '').trim();
    if (!query) return;

    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsVoiceSpeaking(false);
    }

    setVoiceQuery(query);
    setIsVoiceThinking(true);
    setVoiceError(null);
    setVoiceResponse(null);

    setTimeout(() => {
      responseCardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 100);

    try {
      const response = await aiService.askAssistant(query, records, user, currentLang);
      setVoiceResponse(response);

      // Auto-speak response out loud
      setTimeout(() => {
        speakAnswer(response.aiResponse, response.lang || currentLang);
      }, 250);
    } catch (err) {
      console.error('[HomePage] Voice assistant error:', err);
      setVoiceError(err.message || 'Could not process query.');
    } finally {
      setIsVoiceThinking(false);
    }
  };

  // Today's records (match today's date)
  const todayStr = new Date().toISOString().split('T')[0];
  const todaysRecords = records.filter(r => r.date === todayStr);

  const quickRecordOptions = [
    { type: 'blood_pressure', label: 'Blood Pressure', emoji: '🩸', icon: Activity, color: 'bg-rose-50 text-rose-700 hover:bg-rose-100 border-rose-200' },
    { type: 'blood_sugar', label: 'Blood Sugar', emoji: '🍬', icon: Droplet, color: 'bg-amber-50 text-amber-800 hover:bg-amber-100 border-amber-200' },
    { type: 'weight', label: 'Weight', emoji: '⚖️', icon: Scale, color: 'bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200' },
    { type: 'temperature', label: 'Temperature', emoji: '🌡️', icon: Thermometer, color: 'bg-pink-50 text-pink-700 hover:bg-pink-100 border-pink-200' },
    { type: 'medicine', label: 'Medicine', emoji: '💊', icon: Pill, color: 'bg-purple-50 text-purple-700 hover:bg-purple-100 border-purple-200' },
    { type: 'symptom', label: 'Symptom', emoji: '🤒', icon: AlertCircle, color: 'bg-orange-50 text-orange-700 hover:bg-orange-100 border-orange-200' },
    { type: 'doctor_visit', label: 'Doctor Visit', emoji: '🩺', icon: Stethoscope, color: 'bg-cyan-50 text-cyan-700 hover:bg-cyan-100 border-cyan-200' },
    { type: 'note', label: 'Note', emoji: '📝', icon: StickyNote, color: 'bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-300' }
  ];

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* 1. Top Greeting & Voice Input Prompt */}
      <div className="space-y-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-health-700 uppercase tracking-wider">
            <Sparkles className="w-4 h-4" />
            <span>Personal Health Memory</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
            {t.home.greeting}, {user?.name?.split(' ')[0] || 'Rahul'} 👋
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {t.home.howAreYouFeeling}
          </p>
        </div>

        {/* Large Voice Input Card */}
        <VoiceInput
          placeholder={t.home.voicePrompt}
          onResult={(speechText) => {
            handleHomeVoiceInput(speechText);
          }}
        />

        {/* Inline Aarogya Voice Assistant Response Panel */}
        <div ref={responseCardRef}>
          {isVoiceThinking && (
            <div className="bg-gradient-to-r from-health-50 via-teal-50 to-emerald-50 border border-health-200/80 rounded-3xl p-6 shadow-sm animate-fade-in">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-health-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-health-600/30 animate-pulse">
                  <Sparkles className="w-5 h-5 animate-spin text-health-100" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-health-800">
                      MediPulse Health Assistant
                    </span>
                    <span className="flex h-2 w-2 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-health-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-health-500"></span>
                    </span>
                  </div>
                  <p className="text-sm text-slate-700 font-medium italic mt-0.5">
                    "{voiceQuery}"
                  </p>
                </div>
              </div>
              <div className="mt-4 flex items-center gap-2 text-xs font-semibold text-health-700 bg-white/80 backdrop-blur-xs py-2 px-3.5 rounded-xl border border-health-200/60 w-fit">
                <Loader2 className="w-4 h-4 animate-spin text-health-600" />
                <span>Checking your recorded vitals & health timeline...</span>
              </div>
            </div>
          )}

          {voiceError && !isVoiceThinking && (
            <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 text-rose-800 flex items-start gap-3 animate-fade-in">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-semibold">Unable to complete health analysis</p>
                <p className="text-xs text-rose-600 mt-0.5">{voiceError}</p>
                <div className="mt-3 flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleHomeVoiceInput(voiceQuery)}
                    className="px-3 py-1.5 rounded-lg bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 transition-colors"
                  >
                    Try Again
                  </button>
                  <button
                    type="button"
                    onClick={handleDismissVoiceCard}
                    className="px-3 py-1.5 rounded-lg border border-rose-300 text-rose-700 text-xs font-semibold hover:bg-rose-100 transition-colors"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
          )}

          {voiceResponse && !isVoiceThinking && (
            <div className="bg-gradient-to-br from-white via-slate-50 to-health-50/40 border-2 border-health-300/70 rounded-3xl p-5 sm:p-6 shadow-md shadow-health-600/5 space-y-4 animate-fade-in">
              {/* Header */}
              <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-health-600 to-teal-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-health-600/20">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-slate-900">
                        MediPulse Voice Answer
                      </h4>
                      {voiceResponse.lang && voiceResponse.lang !== 'en' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-health-100 text-health-800 text-[10px] font-bold border border-health-200">
                          <Languages className="w-3 h-3 text-health-700" />
                          <span>{LANG_NAMES[voiceResponse.lang] || voiceResponse.lang}</span>
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5 line-clamp-1 italic">
                      Q: "{voiceQuery}"
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={handleToggleVoicePlayback}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-xs ${
                      isVoiceSpeaking
                        ? 'bg-rose-600 text-white animate-pulse hover:bg-rose-700'
                        : 'bg-health-600 text-white hover:bg-health-700'
                    }`}
                    title={isVoiceSpeaking ? 'Stop Voice Playback' : 'Listen Voice Answer'}
                  >
                    {isVoiceSpeaking ? (
                      <>
                        <Square className="w-3.5 h-3.5 fill-white" />
                        <span>Stop Voice</span>
                      </>
                    ) : (
                      <>
                        <Volume2 className="w-3.5 h-3.5" />
                        <span>Listen Again</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={handleDismissVoiceCard}
                    className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                    title="Dismiss"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Voice Playing Indicator Wave */}
              {isVoiceSpeaking && (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-health-100/70 border border-health-200 rounded-xl text-xs font-bold text-health-800 animate-pulse">
                  <Volume2 className="w-4 h-4 text-health-600" />
                  <span>Speaking voice response in {LANG_NAMES[voiceResponse.lang || currentLang] || 'English'}...</span>
                  <div className="flex items-end gap-1 h-3 ml-auto">
                    <span className="w-1 h-3 bg-health-600 rounded-full animate-bounce"></span>
                    <span className="w-1 h-2 bg-health-500 rounded-full animate-bounce [animation-delay:0.1s]"></span>
                    <span className="w-1 h-3 bg-health-600 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                  </div>
                </div>
              )}

              {/* AI Response Text with High Readability Formatting */}
              <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-100 shadow-xs">
                <FormattedAIResponse content={voiceResponse.aiResponse} isUser={false} />
              </div>

              {/* Disclaimer */}
              {voiceResponse.disclaimer && (
                <div className="flex items-start gap-1.5 text-[11px] text-slate-400 italic">
                  <AlertCircle className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                  <span>{voiceResponse.disclaimer}</span>
                </div>
              )}

              {/* Follow-up suggestions */}
              {voiceResponse.followUp?.options && voiceResponse.followUp.options.length > 0 && (
                <div className="bg-health-50/60 border border-health-200/70 rounded-2xl p-3.5 space-y-2">
                  <p className="text-xs font-bold text-health-900">
                    {voiceResponse.followUp.question || 'Explore further:'}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {voiceResponse.followUp.options.map((opt, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleHomeVoiceInput(opt)}
                        className="px-3 py-1.5 rounded-xl text-xs font-bold bg-white hover:bg-health-600 hover:text-white text-health-800 border border-health-200 shadow-xs transition-all text-left"
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Footer Actions */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => openAddRecord('note')}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-100 border border-slate-200 transition-colors"
                >
                  <StickyNote className="w-3.5 h-3.5 text-slate-500" />
                  <span>Save Note to Timeline</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (window.speechSynthesis) window.speechSynthesis.cancel();
                    navigate(`/app/ai?q=${encodeURIComponent(voiceQuery)}`);
                  }}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-slate-900 text-white hover:bg-slate-800 transition-colors ml-auto shadow-xs"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Continue in AI Assistant Chat</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 2. Quick Record Bar */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            {t.home.quickRecord}
          </h3>
          <span className="text-xs text-slate-400">1-Tap Fast Logging</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
          {quickRecordOptions.map((opt) => (
            <button
              key={opt.type}
              type="button"
              onClick={() => openAddRecord(opt.type)}
              className={`flex items-center gap-2 p-3 rounded-2xl border transition-all text-left shadow-xs hover:shadow-sm active:scale-95 ${opt.color}`}
            >
              <span className="text-lg">{opt.emoji}</span>
              <span className="text-xs font-bold truncate">{opt.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 3. Today & Upcoming Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Today's Health Activity (2 Cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-health-600" />
              <h3 className="text-base font-bold text-slate-800 tracking-tight">
                {t.home.todayEvents}
              </h3>
            </div>
            <Link
              to="/app/timeline"
              className="text-xs font-bold text-health-700 hover:text-health-800 flex items-center gap-1"
            >
              <span>{t.home.viewTimeline}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {todaysRecords.length === 0 ? (
            <EmptyState
              title="No events logged today"
              description="Record your morning vitals, medicines, or how you feel."
              actionLabel="+ Log Today's First Event"
              onAction={() => openAddRecord('blood_pressure')}
            />
          ) : (
            <div className="space-y-3">
              {todaysRecords.map((record) => (
                <RecordCard key={record.id} record={record} />
              ))}
            </div>
          )}
        </div>

        {/* Upcoming Schedules & Reminders (1 Col) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-cyan-600" />
              <h3 className="text-base font-bold text-slate-800 tracking-tight">
                {t.home.upcomingSchedule}
              </h3>
            </div>
            <Link
              to="/app/reminders"
              className="text-xs font-bold text-cyan-700 hover:text-cyan-800"
            >
              View All
            </Link>
          </div>

          <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-soft space-y-3">
            {/* Upcoming Appointment */}
            {appointments.length > 0 && (
              <div className="p-3.5 rounded-2xl bg-cyan-50/70 border border-cyan-100 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-cyan-800 uppercase tracking-wider">
                    Doctor Appointment
                  </span>
                  <span className="text-[11px] font-bold text-cyan-700">{appointments[0].date}</span>
                </div>
                <h4 className="text-xs font-bold text-slate-900">{appointments[0].doctorName}</h4>
                <p className="text-[11px] text-slate-500">{appointments[0].hospital} • {appointments[0].time}</p>
              </div>
            )}

            {/* Upcoming Reminders */}
            <div className="space-y-2 pt-1">
              {reminders.slice(0, 3).map((rem) => (
                <div key={rem.id} className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 border border-slate-100 transition-colors">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className={`w-2 h-2 rounded-full shrink-0 ${rem.completed ? 'bg-slate-300' : 'bg-amber-500 animate-pulse'}`} />
                    <div className="min-w-0">
                      <p className={`text-xs font-semibold truncate ${rem.completed ? 'text-slate-400 line-through' : 'text-slate-800'}`}>
                        {rem.title}
                      </p>
                      <p className="text-[10px] text-slate-400">{rem.time} • {rem.category}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <Link
              to="/app/reminders"
              className="block text-center py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 rounded-xl transition-all"
            >
              + Manage Reminders
            </Link>
          </div>
        </div>

      </div>

      {/* 4. Health Snapshot Metric Cards */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            {t.home.healthSnapshot}
          </h3>
          <Link to="/app/trends" className="text-xs font-bold text-health-700 hover:underline">
            View Analytics & Trends
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
          <MetricCard
            title="Blood Pressure"
            value={stats.latestBP}
            subtitle="Latest reading"
            icon={Activity}
            color="rose"
            trend="down"
            trendLabel="Normalized to 128/82"
            onClick={() => navigate('/app/trends')}
          />
          <MetricCard
            title="Body Weight"
            value={stats.latestWeight}
            subtitle="BMI: 24.3 (Normal)"
            icon={Scale}
            color="blue"
            trend="neutral"
            trendLabel="Stable over 4 weeks"
            onClick={() => navigate('/app/trends')}
          />
          <MetricCard
            title="Fasting Sugar"
            value={stats.latestSugar}
            subtitle="Morning check"
            icon={Droplet}
            color="amber"
            trend="neutral"
            trendLabel="Normal range (<100)"
            onClick={() => navigate('/app/trends')}
          />
          <MetricCard
            title="Active Meds"
            value={`${stats.activeMedicinesCount} Rx`}
            subtitle="Daily adherence active"
            icon={Pill}
            color="purple"
            onClick={() => navigate('/app/profile')}
          />
          <MetricCard
            title="Documents"
            value={`${stats.documentsCount} Reports`}
            subtitle="Digitized with AI OCR"
            icon={FileText}
            color="health"
            onClick={() => navigate('/app/records')}
          />
        </div>
      </div>

      {/* 5. Anupana Voice Explainer Card for latest doctor visit */}
      {(() => {
        const doctorVisits = records.filter(r => r.type === 'doctor_visit');
        if (doctorVisits.length > 0) {
          return (
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Voice Prescription Assistant
              </h3>
              <AnupanaCard record={doctorVisits[0]} />
            </div>
          );
        }
        // Empty state: no doctor visits yet
        return (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Voice Prescription Assistant
              </h3>
              <button
                onClick={() => openAddRecord('doctor_visit')}
                className="text-xs font-bold text-cyan-600 hover:text-cyan-800 flex items-center gap-1"
              >
                + Log a consultation
              </button>
            </div>
            <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-soft text-center">
              <div className="flex items-center justify-center gap-2 text-slate-500 mb-2">
                <Stethoscope className="w-5 h-5 text-slate-300" />
                <span className="text-xs font-semibold">No doctor visits logged yet</span>
              </div>
              <p className="text-[11px] text-slate-400 mb-3 max-w-md mx-auto">
                Log a consultation to unlock your Anupana voice prescription explainer —
                dosage, with-food/empty-stomach timing, and dietary do's & don'ts read
                aloud in your language.
              </p>
              <button
                onClick={() => openAddRecord('doctor_visit')}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-bold rounded-xl transition-all"
              >
                <Plus className="w-3 h-3" />
                Log Doctor Visit
              </button>
            </div>
          </div>
        );
      })()}


      {/* 6. Health Story Banner */}
      <div className="bg-gradient-to-r from-health-900 via-teal-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white flex flex-col sm:flex-row items-center justify-between gap-6 shadow-soft-lg relative overflow-hidden">
        <div className="space-y-2 text-center sm:text-left z-10">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-teal-200 text-xs font-semibold backdrop-blur-sm">
            <BookOpen className="w-3.5 h-3.5" />
            {t.home.healthStoryBanner}
          </span>
          <h3 className="text-xl sm:text-2xl font-extrabold tracking-tight">
            Your Living Health Timeline (Jan – Aug 2026)
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
            {t.home.healthStoryDesc}
          </p>
        </div>

        <div className="flex items-center gap-3 z-10">
          <Link
            to="/app/story"
            className="px-6 py-3 bg-white hover:bg-slate-100 text-health-900 font-bold text-xs rounded-2xl shadow-md transition-all active:scale-95 flex items-center gap-1.5"
          >
            <BookOpen className="w-4 h-4" />
            <span>Open Health Story</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
