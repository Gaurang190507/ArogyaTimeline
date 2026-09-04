import React, { useState, useMemo } from 'react';
import { 
  Clock, 
  Search, 
  Filter, 
  Plus, 
  Activity, 
  AlertCircle, 
  Pill, 
  Stethoscope, 
  FileText, 
  StickyNote, 
  Calendar as CalendarIcon 
} from 'lucide-react';
import { useHealth } from '../../context/HealthContext';
import { useLanguage } from '../../context/LanguageContext';
import { RecordCard } from '../../components/records/RecordCard';
import { EmptyState } from '../../components/common/EmptyState';

export const TimelinePage = () => {
  const { records, openAddRecord } = useHealth();
  const { t } = useLanguage();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all'); // all | vitals | symptom | medicine | doctor_visit | document | note
  const [dateRange, setDateRange] = useState('all'); // 7d | 30d | 3m | 6m | 1y | all

  const filterTabs = [
    { key: 'all', label: 'All Events', icon: null },
    { key: 'vitals', label: 'Vitals (BP/Sugar/Weight)', icon: Activity },
    { key: 'symptom', label: 'Symptoms', icon: AlertCircle },
    { key: 'medicine', label: 'Medicines', icon: Pill },
    { key: 'doctor_visit', label: 'Doctor Visits', icon: Stethoscope },
    { key: 'document', label: 'Documents', icon: FileText },
    { key: 'note', label: 'Notes', icon: StickyNote },
  ];

  // Filtering & Grouping logic
  const filteredRecords = useMemo(() => {
    const now = new Date();
    let cutoff = null;
    if (dateRange === '7d') cutoff = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    else if (dateRange === '30d') cutoff = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    else if (dateRange === '3m') cutoff = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
    else if (dateRange === '6m') cutoff = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000);
    else if (dateRange === '1y') cutoff = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);

    return records.filter((r) => {
      // 1. Date range filter
      if (cutoff && r.date) {
        const rDate = new Date(r.date);
        if (rDate < cutoff) return false;
      }

      // 2. Category filter
      if (selectedFilter === 'vitals') {
        if (!['blood_pressure', 'blood_sugar', 'weight', 'temperature'].includes(r.type)) return false;
      } else if (selectedFilter !== 'all' && r.type !== selectedFilter) {
        return false;
      }

      // 3. Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = r.title?.toLowerCase().includes(q);
        const matchDesc = r.description?.toLowerCase().includes(q);
        const matchDoctor = r.metadata?.doctorName?.toLowerCase().includes(q);
        const matchSymptom = r.metadata?.symptomName?.toLowerCase().includes(q);
        if (!matchTitle && !matchDesc && !matchDoctor && !matchSymptom) return false;
      }

      return true;
    });
  }, [records, selectedFilter, searchQuery, dateRange]);

  // Group records by Month Year (e.g. "August 2026", "July 2026")
  const groupedByMonth = useMemo(() => {
    const groups = {};
    filteredRecords.forEach((record) => {
      const dateObj = new Date(record.date);
      const monthYear = dateObj.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      if (!groups[monthYear]) {
        groups[monthYear] = [];
      }
      groups[monthYear].push(record);
    });
    return groups;
  }, [filteredRecords]);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-health-700 uppercase tracking-wider">
            <Clock className="w-4 h-4" />
            <span>Living Health Timeline</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
            Chronological Health History
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Every measurement, consultation, and symptom recorded in time sequence.
          </p>
        </div>

        <button
          type="button"
          onClick={() => openAddRecord('blood_pressure')}
          className="flex items-center gap-2 px-5 py-2.5 bg-health-600 hover:bg-health-700 text-white font-bold text-xs rounded-2xl shadow-md shadow-health-600/20 hover:shadow-lg transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>{t.nav.addRecord}</span>
        </button>
      </div>

      {/* Controls: Search, Filter Tabs & Date Range */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-100 shadow-soft space-y-4">
        {/* Search & Date Range Selector */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search symptoms, doctor visits, medications, readings..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium focus:ring-2 focus:ring-health-500 focus:bg-white"
            />
          </div>

          <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
            {[
              { id: '7d', label: '7 Days' },
              { id: '30d', label: '30 Days' },
              { id: '3m', label: '3 Months' },
              { id: '6m', label: '6 Months' },
              { id: '1y', label: '1 Year' },
              { id: 'all', label: 'All Time' }
            ].map((rng) => (
              <button
                key={rng.id}
                type="button"
                onClick={() => setDateRange(rng.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  dateRange === rng.id
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}
              >
                {rng.label}
              </button>
            ))}
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none pt-1 border-t border-slate-100">
          {filterTabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setSelectedFilter(tab.key)}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
                  selectedFilter === tab.key
                    ? 'bg-health-50 text-health-800 border-health-300 shadow-xs'
                    : 'bg-white text-slate-600 hover:bg-slate-50 border-slate-200'
                }`}
              >
                {Icon && <Icon className="w-3.5 h-3.5" />}
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Timeline Stream */}
      {Object.keys(groupedByMonth).length === 0 ? (
        <EmptyState
          title="No timeline events found"
          description="Try changing your search keywords or category filters."
          actionLabel="+ Add New Record"
          onAction={() => openAddRecord('blood_pressure')}
        />
      ) : (
        <div className="space-y-8">
          {Object.entries(groupedByMonth).map(([monthYear, monthRecords]) => (
            <div key={monthYear} className="space-y-4">
              {/* Month Group Header Badge */}
              <div className="sticky top-16 z-10 flex items-center gap-3 bg-slate-50/95 backdrop-blur-md py-2">
                <span className="text-xs font-extrabold uppercase tracking-widest text-slate-700 bg-white px-3.5 py-1.5 rounded-2xl border border-slate-200 shadow-xs">
                  {monthYear}
                </span>
                <div className="flex-1 h-px bg-slate-200" />
                <span className="text-xs font-bold text-slate-400">
                  {monthRecords.length} records
                </span>
              </div>

              {/* Records in this month */}
              <div className="space-y-3 pl-2 sm:pl-4 border-l-2 border-slate-200 ml-3">
                {monthRecords.map((record) => (
                  <RecordCard key={record.id} record={record} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
