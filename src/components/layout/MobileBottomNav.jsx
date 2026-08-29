import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Clock, Plus, FolderOpen, Sparkles } from 'lucide-react';
import { useHealth } from '../../context/HealthContext';
import { useLanguage } from '../../context/LanguageContext';

export const MobileBottomNav = () => {
  const { openAddRecord } = useHealth();
  const { t } = useLanguage();

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/80 px-4 py-2 safe-area-inset-bottom">
      <div className="flex items-center justify-around max-w-lg mx-auto relative">
        {/* Home */}
        <NavLink
          to="/app/home"
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 py-1 px-2 rounded-xl text-xs font-semibold transition-all ${
              isActive ? 'text-health-700' : 'text-slate-500 hover:text-slate-700'
            }`
          }
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px]">{t.nav.home}</span>
        </NavLink>

        {/* Timeline */}
        <NavLink
          to="/app/timeline"
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 py-1 px-2 rounded-xl text-xs font-semibold transition-all ${
              isActive ? 'text-health-700' : 'text-slate-500 hover:text-slate-700'
            }`
          }
        >
          <Clock className="w-5 h-5" />
          <span className="text-[10px]">{t.nav.timeline}</span>
        </NavLink>

        {/* Floating Center + Action Button */}
        <div className="relative -top-5">
          <button
            type="button"
            onClick={() => openAddRecord('blood_pressure')}
            aria-label="Add Record"
            className="w-13 h-13 w-12 h-12 rounded-full bg-gradient-to-tr from-health-600 to-teal-500 text-white flex items-center justify-center shadow-lg shadow-health-600/40 hover:scale-105 active:scale-95 transition-all ring-4 ring-slate-50"
          >
            <Plus className="w-6 h-6 stroke-[2.5]" />
          </button>
        </div>

        {/* Medical Records */}
        <NavLink
          to="/app/records"
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 py-1 px-2 rounded-xl text-xs font-semibold transition-all ${
              isActive ? 'text-health-700' : 'text-slate-500 hover:text-slate-700'
            }`
          }
        >
          <FolderOpen className="w-5 h-5" />
          <span className="text-[10px]">{t.nav.records}</span>
        </NavLink>

        {/* AI Assistant */}
        <NavLink
          to="/app/ai"
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 py-1 px-2 rounded-xl text-xs font-semibold transition-all ${
              isActive ? 'text-health-700' : 'text-slate-500 hover:text-slate-700'
            }`
          }
        >
          <Sparkles className="w-5 h-5" />
          <span className="text-[10px]">{t.nav.aiAssistant}</span>
        </NavLink>
      </div>
    </div>
  );
};
