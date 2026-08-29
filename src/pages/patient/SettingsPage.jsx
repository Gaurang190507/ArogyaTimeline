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
  Check 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useHealth } from '../../context/HealthContext';
import { useLanguage } from '../../context/LanguageContext';
import { LanguageSelector } from '../../components/common/LanguageSelector';

export const SettingsPage = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
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
    downloadAnchor.setAttribute("download", `aarogya_health_memory_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast("Health memory JSON exported successfully");
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
          <Settings className="w-4 h-4" />
          <span>App Preferences</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
          Settings & Privacy
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Manage language, voice interactions, notification frequencies, and health data export.
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
        
        {/* 1. Language & Regional Settings */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-soft space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-health-600" />
              <h3 className="text-sm font-bold text-slate-900">Language & Region (10 Indian Languages)</h3>
            </div>
            <LanguageSelector />
          </div>
          <p className="text-xs text-slate-500">
            Select your preferred regional language for the interface, voice input, and clinical case taking.
          </p>
        </div>

        {/* 2. Notification Preferences */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-soft space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Bell className="w-4 h-4 text-amber-600" />
            <h3 className="text-sm font-bold text-slate-900">Notification Alerts</h3>
          </div>

          <div className="space-y-3 text-xs">
            <label className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 cursor-pointer transition-colors">
              <div>
                <span className="font-bold text-slate-800 block">Medication Reminders</span>
                <span className="text-slate-500">Push notifications before scheduled daily doses</span>
              </div>
              <input
                type="checkbox"
                checked={medAlerts}
                onChange={(e) => setMedAlerts(e.target.checked)}
                className="w-5 h-5 accent-health-600 rounded-md cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 cursor-pointer transition-colors">
              <div>
                <span className="font-bold text-slate-800 block">Doctor Appointment Alerts</span>
                <span className="text-slate-500">Alerts 24 hours and 2 hours prior to scheduled clinic visit</span>
              </div>
              <input
                type="checkbox"
                checked={aptAlerts}
                onChange={(e) => setAptAlerts(e.target.checked)}
                className="w-5 h-5 accent-health-600 rounded-md cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 cursor-pointer transition-colors">
              <div>
                <span className="font-bold text-slate-800 block">Daily Vitals Logging Prompts</span>
                <span className="text-slate-500">Morning and evening gentle prompt to record BP / Weight</span>
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

        {/* 3. Voice Settings */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-soft space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Mic className="w-4 h-4 text-teal-600" />
            <h3 className="text-sm font-bold text-slate-900">Voice UI & Speech Simulation</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-600 font-semibold mb-1">Speech Recognition Sensitivity</label>
              <select className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium">
                <option>High (Sensitive to quiet speech)</option>
                <option>Standard / Balanced</option>
                <option>Low (Noisy environments)</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-600 font-semibold mb-1">Speech Playback Speed</label>
              <select
                value={speechRate}
                onChange={(e) => setSpeechRate(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
              >
                <option value="Slow">Slow (Elderly friendly)</option>
                <option value="Normal">Normal Speed</option>
                <option value="Fast">Fast</option>
              </select>
            </div>
          </div>
        </div>

        {/* 4. Data Export & Backup */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-soft space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Download className="w-4 h-4 text-health-600" />
              <h3 className="text-sm font-bold text-slate-900">Data Portability & Export</h3>
            </div>
            <button
              type="button"
              onClick={handleExportData}
              className="flex items-center gap-1.5 px-4 py-2 bg-health-600 hover:bg-health-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Health JSON</span>
            </button>
          </div>
          <p className="text-xs text-slate-500">
            Download your complete chronological health memory records for backup or porting to Hospital Information Systems (HIS).
          </p>
        </div>

        {/* 5. Account & Session */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-soft flex items-center justify-between">
          <div>
            <h4 className="text-sm font-bold text-slate-900">Sign Out of Health Memory</h4>
            <p className="text-xs text-slate-400">Current session: demo@example.com (Rahul Sharma)</p>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-5 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs rounded-2xl border border-rose-200 transition-all"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>

      </div>
    </div>
  );
};
