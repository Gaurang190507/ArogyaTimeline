import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Settings, 
  Globe, 
  Moon, 
  Sun, 
  Bell, 
  Mic, 
  ShieldCheck, 
  Download, 
  LogOut, 
  Lock, 
  Sparkles, 
  Check,
  Stethoscope,
  User,
  CheckCircle2,
  Palette
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useHealth } from '../../context/HealthContext';
import { useLanguage } from '../../context/LanguageContext';
import { LanguageSelector } from '../../components/common/LanguageSelector';
import { ThemeToggle } from '../../components/common/ThemeToggle';

export const SettingsPage = () => {
  const navigate = useNavigate();
  const { user, role, isDoctor, switchRole, logout } = useAuth();
  const { records, showToast } = useHealth();
  const { t } = useLanguage();

  const [medAlerts, setMedAlerts] = useState(true);
  const [aptAlerts, setAptAlerts] = useState(true);
  const [measurementAlerts, setMeasurementAlerts] = useState(true);
  const [speechRate, setSpeechRate] = useState('Normal');

  const handleExportData = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(records, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `medipulse_health_memory_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast("Health memory JSON exported successfully");
  };

  const handleRoleChange = (newRole) => {
    if (newRole === role) return;
    switchRole(newRole);
    showToast(`Switched account mode to ${newRole === 'doctor' ? 'Doctor / Caregiver' : 'Patient'}`, 'success');
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
          <Settings className="w-4 h-4" />
          <span>App Preferences</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight mt-1">
          Settings & Preferences
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Manage appearance (Dark Mode), clinical role, voice interactions, and health data export.
        </p>
      </div>

      {/* Privacy Guarantee Card */}
      <div className="p-5 bg-gradient-to-r from-health-900 via-teal-900 to-slate-900 rounded-3xl text-white shadow-soft flex items-start gap-4">
        <div className="w-12 h-12 rounded-2xl bg-white/10 text-teal-300 flex items-center justify-center shrink-0">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <div>
          <h4 className="text-sm font-bold text-white">Your Health Privacy Is Guaranteed</h4>
          <p className="text-xs text-slate-300 mt-1 leading-relaxed">
            Your health information is strictly personal. AI features run locally on your indexed memory and your data is never sold or shared without your explicit clinical consent.
          </p>
        </div>
      </div>

      {/* Settings Sections */}
      <div className="space-y-6">

        {/* 1. Appearance / Dark Mode Card */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-100 dark:border-slate-800 shadow-soft space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <Palette className="w-4 h-4 text-health-600 dark:text-health-400" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Appearance & Theme</h3>
            </div>
            <ThemeToggle />
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Switch between Light mode, Dark mode, or follow your system preferences. Dark mode reduces eye strain and conserves battery life.
          </p>
        </div>

        {/* 2. Clinical Role Switcher (Doctor vs Patient) */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-100 dark:border-slate-800 shadow-soft space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <Stethoscope className="w-4 h-4 text-teal-600 dark:text-teal-400" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">User Role & Clinical Mode</h3>
            </div>
            <span className={`px-2.5 py-1 rounded-xl text-xs font-bold ${
              isDoctor
                ? 'bg-teal-100 dark:bg-teal-950/80 text-teal-800 dark:text-teal-300 border border-teal-300 dark:border-teal-800'
                : 'bg-health-100 dark:bg-health-950/80 text-health-800 dark:text-health-300 border border-health-300 dark:border-health-800'
            }`}>
              {isDoctor ? 'Doctor Active' : 'Patient Active'}
            </span>
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400">
            Select your account mode. <strong className="text-slate-700 dark:text-slate-200">Doctor Mode</strong> unlocks the consultation timer, session controls, and clinical summary generation in the AI Assistant.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            {/* Patient Option */}
            <button
              type="button"
              onClick={() => handleRoleChange('patient')}
              className={`flex items-start gap-3 p-4 rounded-2xl border text-left transition-all ${
                !isDoctor
                  ? 'bg-health-50 dark:bg-slate-800/80 border-health-500 ring-2 ring-health-500/20 shadow-xs'
                  : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                !isDoctor ? 'bg-health-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
              }`}>
                <User className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs sm:text-sm text-slate-900 dark:text-slate-100">Patient Mode</span>
                  {!isDoctor && <Check className="w-4 h-4 text-health-600 dark:text-health-400" />}
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-normal">
                  Standard patient experience for tracking personal health memory, vitals, prescriptions, and lifestyle queries.
                </p>
              </div>
            </button>

            {/* Doctor Option */}
            <button
              type="button"
              onClick={() => handleRoleChange('doctor')}
              className={`flex items-start gap-3 p-4 rounded-2xl border text-left transition-all ${
                isDoctor
                  ? 'bg-teal-50 dark:bg-slate-800/80 border-teal-500 ring-2 ring-teal-500/20 shadow-xs'
                  : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                isDoctor ? 'bg-teal-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
              }`}>
                <Stethoscope className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs sm:text-sm text-slate-900 dark:text-slate-100">Doctor / Clinician Mode</span>
                  {isDoctor && <Check className="w-4 h-4 text-teal-600 dark:text-teal-400" />}
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-normal">
                  Enables live consultation session timer, continuous transcription, and clinical summary generation for patient visits.
                </p>
              </div>
            </button>
          </div>
        </div>
        
        {/* 3. Language & Regional Settings */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-100 dark:border-slate-800 shadow-soft space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-health-600 dark:text-health-400" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Language & Region (10 Indian Languages)</h3>
            </div>
            <LanguageSelector />
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Select your preferred regional language for the interface, voice input, and clinical case taking.
          </p>
        </div>

        {/* 4. Notification Preferences */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-100 dark:border-slate-800 shadow-soft space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
            <Bell className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Notification Alerts</h3>
          </div>

          <div className="space-y-3 text-xs">
            <label className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors">
              <div>
                <span className="font-bold text-slate-800 dark:text-slate-200 block">Medication Reminders</span>
                <span className="text-slate-500 dark:text-slate-400">Push notifications before scheduled daily doses</span>
              </div>
              <input
                type="checkbox"
                checked={medAlerts}
                onChange={(e) => setMedAlerts(e.target.checked)}
                className="w-5 h-5 accent-health-600 rounded-md cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors">
              <div>
                <span className="font-bold text-slate-800 dark:text-slate-200 block">Doctor Appointment Alerts</span>
                <span className="text-slate-500 dark:text-slate-400">Alerts 24 hours and 2 hours prior to scheduled clinic visit</span>
              </div>
              <input
                type="checkbox"
                checked={aptAlerts}
                onChange={(e) => setAptAlerts(e.target.checked)}
                className="w-5 h-5 accent-health-600 rounded-md cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors">
              <div>
                <span className="font-bold text-slate-800 dark:text-slate-200 block">Daily Vitals Logging Prompts</span>
                <span className="text-slate-500 dark:text-slate-400">Morning and evening gentle prompt to record BP / Weight</span>
              </div>
              <input
                type="checkbox"
                checked={measurementAlerts}
                onChange={(e) => setMeasurementAlerts(e.target.checked)}
                className="w-5 h-5 accent-health-600 rounded-md cursor-pointer"
              />
            </label>
          </div>
        </div>

        {/* 5. Voice Settings */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-100 dark:border-slate-800 shadow-soft space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
            <Mic className="w-4 h-4 text-teal-600 dark:text-teal-400" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Voice UI & Speech Simulation</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">Speech Recognition Sensitivity</label>
              <select className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-xl text-xs font-medium">
                <option>High (Sensitive to quiet speech)</option>
                <option>Standard / Balanced</option>
                <option>Low (Noisy environments)</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">Speech Playback Speed</label>
              <select
                value={speechRate}
                onChange={(e) => setSpeechRate(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-xl text-xs font-medium"
              >
                <option value="Slow">Slow (Elderly friendly)</option>
                <option value="Normal">Normal Speed</option>
                <option value="Fast">Fast</option>
              </select>
            </div>
          </div>
        </div>

        {/* 6. Data Export & Backup */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-100 dark:border-slate-800 shadow-soft space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <Download className="w-4 h-4 text-health-600 dark:text-health-400" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Data Portability & Export</h3>
            </div>
            <button
              type="button"
              onClick={handleExportData}
              className="flex items-center gap-1.5 px-4 py-2 bg-health-600 hover:bg-health-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all active:scale-95"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Health JSON</span>
            </button>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Download your complete chronological health memory records for backup or porting to Hospital Information Systems (HIS).
          </p>
        </div>

        {/* 7. Account & Session */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-100 dark:border-slate-800 shadow-soft flex items-center justify-between">
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">Sign Out of Health Memory</h4>
            <p className="text-xs text-slate-400 dark:text-slate-500">
              Current session: {user?.email || 'demo@example.com'} ({user?.name || 'Rahul Sharma'})
            </p>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-5 py-2.5 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/50 text-rose-700 dark:text-rose-300 font-bold text-xs rounded-2xl border border-rose-200 dark:border-rose-800 transition-all active:scale-95"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>

      </div>
    </div>
  );
};
