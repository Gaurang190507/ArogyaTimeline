import React from 'react';
import { Link } from 'react-router-dom';
import { Search, Plus, Bell, Heart, User, Sparkles, ArrowLeftToLine, Building2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useHealth } from '../../context/HealthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useFamily } from '../../context/FamilyContext';
import { LanguageSelector } from '../common/LanguageSelector';
import { AttendantToggle } from '../common/AttendantToggle';
import { ThemeToggle } from '../common/ThemeToggle';

export const TopBar = ({ onSearchChange, searchQuery = '' }) => {
  const { user } = useAuth();
  const { openAddRecord } = useHealth();
  const { t } = useLanguage();
  const { displayName, displayRelation, isAttendantView, returnToSelf } = useFamily();

  return (
    <header className="sticky top-0 z-20 bg-slate-50/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200/60 dark:border-slate-800 px-4 sm:px-8 py-3.5 flex items-center justify-between gap-4 transition-colors duration-150">
      {/* Mobile Brand Logo */}
      <div className="flex items-center gap-2.5 lg:hidden">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-health-600 to-teal-500 text-white flex items-center justify-center shadow-sm">
          <Heart className="w-5 h-5 fill-white/20" />
        </div>
        <span className="font-bold text-slate-900 dark:text-white text-sm">{t.brand.name}</span>
      </div>

      {/* Global Search Bar */}
      <div className="flex-1 max-w-md hidden sm:block">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
            placeholder={t.common.search}
            className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-medium text-slate-700 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-health-500 focus:border-transparent transition-all shadow-xs"
          />
        </div>
      </div>

      {/* Action Controls & Profile Badge */}
      <div className="flex items-center gap-2 sm:gap-2.5">
        {/* Hospital OPD Portal Quick Button */}
        <Link
          to="/hospital/opd"
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-950 bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 rounded-xl shadow-sm transition-all active:scale-95"
          title="Switch to Hospital OPD Desk"
        >
          <Building2 className="w-3.5 h-3.5 text-slate-900" />
          <span className="hidden md:inline">Hospital OPD Desk</span>
          <span className="md:hidden">OPD</span>
        </Link>

        {/* Dark / Light Theme Toggle */}
        <ThemeToggle compact={true} />

        {/* Language Selector */}
        <LanguageSelector compact={true} />

        {/* Desktop Quick Add Button */}
        <button
          type="button"
          onClick={() => openAddRecord('blood_pressure')}
          className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-health-600 hover:bg-health-700 rounded-xl shadow-sm transition-all"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>{t.nav.addRecord}</span>
        </button>

        {/* Attendant Toggle (family member switcher) */}
        <div className="hidden sm:block">
          <AttendantToggle />
        </div>

        {/* Return to Self pill — shown while viewing a family member */}
        {!isAttendantView && displayRelation && (
          <button
            type="button"
            onClick={() => returnToSelf()}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-xl transition-all"
            title="Return to your own records"
          >
            <ArrowLeftToLine className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden lg:inline">Return to Self</span>
          </button>
        )}

        {/* User Profile Capsule */}
        <Link
          to="/app/profile"
          className="flex items-center gap-2.5 pl-1.5 pr-2.5 py-1 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-750 rounded-2xl border border-slate-200/80 dark:border-slate-700 transition-all shadow-xs"
        >
          <div className="w-7 h-7 rounded-xl bg-health-100 dark:bg-health-950 text-health-800 dark:text-health-300 flex items-center justify-center font-bold text-xs">
            {displayName.charAt(0) || user?.name?.charAt(0) || 'R'}
          </div>
          <div className="text-left hidden md:block">
            <p className="text-xs font-bold text-slate-800 dark:text-slate-100 leading-none">
              {displayName || user?.name || 'Rahul Sharma'}
            </p>
            <p className="text-[10px] text-slate-400 font-medium mt-0.5">
              {displayRelation ? `${displayRelation} • viewing profile` : 'B+ • 32 yrs'}
            </p>
          </div>
        </Link>
      </div>
    </header>
  );
};
