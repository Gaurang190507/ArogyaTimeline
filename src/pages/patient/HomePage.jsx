import React from 'react';
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
  Plus
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useHealth } from '../../context/HealthContext';
import { useLanguage } from '../../context/LanguageContext';
import { VoiceInput } from '../../components/common/VoiceInput';
import { RecordCard } from '../../components/records/RecordCard';
import { AnupanaCard } from '../../components/common/AnupanaCard';
import { MetricCard } from '../../components/common/MetricCard';
import { EmptyState } from '../../components/common/EmptyState';

export const HomePage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { records, reminders, appointments, stats, openAddRecord, loading } = useHealth();
  const { t } = useLanguage();

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
            // Pre-fill notes in global modal and open
            openAddRecord('note');
          }}
        />
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
