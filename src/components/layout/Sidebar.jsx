import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Heart, 
  Home, 
  Calendar, 
  Clock, 
  PlusCircle, 
  FolderOpen, 
  TrendingUp, 
  BookOpen, 
  Sparkles, 
  Stethoscope, 
  CalendarCheck, 
  Bell, 
  User, 
  Settings
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useHealth } from '../../context/HealthContext';

export const Sidebar = () => {
  const { t } = useLanguage();
  const { openAddRecord } = useHealth();

  const mainNavLinks = [
    { to: '/app/home', label: t.nav.home, icon: Home },
    { to: '/app/calendar', label: t.nav.calendar, icon: Calendar },
    { to: '/app/timeline', label: t.nav.timeline, icon: Clock },
    { to: '/app/records', label: t.nav.records, icon: FolderOpen },
    { to: '/app/trends', label: t.nav.trends, icon: TrendingUp },
    { to: '/app/story', label: t.nav.story, icon: BookOpen },
    { to: '/app/ai', label: t.nav.aiAssistant, icon: Sparkles, badge: "AI" },
  ];

  const secondaryNavLinks = [
    { to: '/app/doctors', label: t.nav.doctors, icon: Stethoscope },
    { to: '/app/appointments', label: t.nav.appointments, icon: CalendarCheck },
    { to: '/app/reminders', label: t.nav.reminders, icon: Bell },
  ];

  const bottomNavLinks = [
    { to: '/app/profile', label: t.nav.profile, icon: User },
    { to: '/app/settings', label: t.nav.settings, icon: Settings },
  ];

  return (
    <aside className="hidden lg:flex flex-col w-64 bg-white dark:bg-slate-900 border-r border-slate-200/80 dark:border-slate-800 min-h-screen p-4 sticky top-0 h-screen z-30 transition-colors duration-150">
      {/* Brand Header */}
      <div className="flex items-center gap-3 px-3 py-2 mb-4">
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-health-600 to-teal-500 text-white flex items-center justify-center shadow-md shadow-health-600/25">
          <Heart className="w-6 h-6 fill-white/20" />
        </div>
        <div>
          <h2 className="font-bold text-slate-900 dark:text-white text-base tracking-tight leading-tight">
            {t.brand.name}
          </h2>
          <p className="text-[11px] text-slate-400 font-medium truncate max-w-[140px]">
            {t.brand.tagline}
          </p>
        </div>
      </div>

      {/* Primary Action Button */}
      <button
        type="button"
        onClick={() => openAddRecord('blood_pressure')}
        className="w-full flex items-center justify-center gap-2 py-3 px-4 mb-4 rounded-2xl bg-health-600 hover:bg-health-700 text-white font-bold text-sm shadow-md shadow-health-600/25 hover:shadow-lg transition-all active:scale-[0.98]"
      >
        <PlusCircle className="w-4 h-4" />
        <span>{t.nav.addRecord}</span>
      </button>

      {/* Nav Link Groups */}
      <div className="flex-1 overflow-y-auto space-y-6 pr-1">
        {/* Main Section */}
        <div>
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-2">
            Health Memory
          </p>
          <nav className="space-y-1">
            {mainNavLinks.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-sm font-semibold transition-all ${
                      isActive
                        ? 'bg-health-50 dark:bg-health-950/60 text-health-800 dark:text-health-300 font-bold border border-health-200/80 dark:border-health-800/80 shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100'
                    }`
                  }
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded-md bg-health-100 dark:bg-health-900 text-health-800 dark:text-health-200 border border-health-300 dark:border-health-700">
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Care & Clinical Section */}
        <div>
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-2">
            Care & Visits
          </p>
          <nav className="space-y-1">
            {secondaryNavLinks.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-sm font-semibold transition-all ${
                      isActive
                        ? 'bg-health-50 dark:bg-health-950/60 text-health-800 dark:text-health-300 font-bold border border-health-200/80 dark:border-health-800/80'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100'
                    }`
                  }
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Bottom Profile & Settings */}
      <div className="pt-3 mt-auto border-t border-slate-100 dark:border-slate-800 space-y-1">
        {bottomNavLinks.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2 rounded-2xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-semibold'
                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-slate-200'
                }`
              }
            >
              <Icon className="w-4 h-4" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </div>
    </aside>
  );
};
