import React, { useState } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Calendar as CalendarIcon, 
  Clock, 
  Activity, 
  Pill, 
  AlertCircle, 
  FileText, 
  Stethoscope, 
  StickyNote, 
  Bell,
  Sparkles
} from 'lucide-react';
import { useHealth } from '../../context/HealthContext';
import { useLanguage } from '../../context/LanguageContext';
import { RecordCard } from '../../components/records/RecordCard';
import { EmptyState } from '../../components/common/EmptyState';

export const CalendarPage = () => {
  const { records, openAddRecord } = useHealth();
  const { t } = useLanguage();

  // Calendar view state — default to August 2026 (matching demo dataset)
  const [currentYear, setCurrentYear] = useState(2026);
  const [currentMonth, setCurrentMonth] = useState(7); // 0-indexed: 7 is August
  const [selectedDate, setSelectedDate] = useState('2026-08-28');

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  // Generate calendar grid dates
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(currentYear, currentMonth, 1).getDay(); // 0 is Sunday

  // Group records by date
  const recordsByDate = records.reduce((acc, record) => {
    if (!acc[record.date]) acc[record.date] = [];
    acc[record.date].push(record);
    return acc;
  }, {});

  // Selected date records
  const selectedDateRecords = recordsByDate[selectedDate] || [];

  // Helper for type indicator dots
  const getEventDotsForDate = (dateStr) => {
    const dayRecords = recordsByDate[dateStr] || [];
    if (dayRecords.length === 0) return null;

    const types = Array.from(new Set(dayRecords.map(r => r.type)));

    return (
      <div className="flex items-center justify-center gap-1 mt-1 flex-wrap max-w-[40px] mx-auto">
        {types.slice(0, 4).map((type, idx) => {
          let dotColor = 'bg-slate-400';
          if (type === 'blood_pressure') dotColor = 'bg-rose-500';
          if (type === 'blood_sugar') dotColor = 'bg-amber-500';
          if (type === 'weight') dotColor = 'bg-blue-500';
          if (type === 'medicine') dotColor = 'bg-purple-500';
          if (type === 'symptom') dotColor = 'bg-orange-500';
          if (type === 'doctor_visit') dotColor = 'bg-cyan-500';
          if (type === 'document') dotColor = 'bg-emerald-500';
          if (type === 'note') dotColor = 'bg-slate-400';

          return <div key={idx} className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />;
        })}
        {types.length > 4 && <div className="w-1 h-1 rounded-full bg-slate-300" />}
      </div>
    );
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-health-700 uppercase tracking-wider">
            <CalendarIcon className="w-4 h-4" />
            <span>Health Memory Calendar</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
            My Health Calendar
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Days with recorded health events, vitals, medicines, or doctor visits.
          </p>
        </div>

        {/* Month Selector Controls */}
        <div className="flex items-center gap-3 bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm">
          <button
            type="button"
            onClick={handlePrevMonth}
            className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-sm font-bold text-slate-800 min-w-[130px] text-center">
            {monthNames[currentMonth]} {currentYear}
          </span>
          <button
            type="button"
            onClick={handleNextMonth}
            className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Grid: Calendar on Left (2 cols), Selected Day View on Right (1 col) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Calendar View (2 Cols) */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-100 shadow-soft">
          {/* Weekday Headers */}
          <div className="grid grid-cols-7 gap-2 text-center text-xs font-bold text-slate-400 uppercase tracking-wider pb-4 mb-2 border-b border-slate-100">
            <span>Sun</span>
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
          </div>

          {/* Calendar Day Cells */}
          <div className="grid grid-cols-7 gap-2">
            {/* Blank leading days */}
            {Array.from({ length: firstDayOfWeek }).map((_, index) => (
              <div key={`blank-${index}`} className="h-16 sm:h-20 rounded-2xl p-1 opacity-30 pointer-events-none" />
            ))}

            {/* Actual Month Days */}
            {Array.from({ length: daysInMonth }).map((_, index) => {
              const day = index + 1;
              const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              const isSelected = selectedDate === dateStr;
              const dayRecords = recordsByDate[dateStr] || [];
              const hasRecords = dayRecords.length > 0;

              return (
                <button
                  key={dateStr}
                  type="button"
                  onClick={() => setSelectedDate(dateStr)}
                  className={`h-16 sm:h-20 rounded-2xl p-2 flex flex-col items-center justify-between transition-all relative border text-left ${
                    isSelected
                      ? 'bg-health-600 text-white border-health-600 shadow-md shadow-health-600/30 scale-105 z-10'
                      : hasRecords
                      ? 'bg-health-50/60 hover:bg-health-100/60 text-slate-900 border-health-200/80 font-bold'
                      : 'bg-slate-50/50 hover:bg-slate-100/70 text-slate-600 border-slate-100 font-medium'
                  }`}
                >
                  <span className={`text-xs font-bold ${isSelected ? 'text-white' : 'text-slate-700'}`}>
                    {day}
                  </span>

                  {/* Activity Indicator Dots */}
                  {!isSelected && getEventDotsForDate(dateStr)}

                  {isSelected && (
                    <span className="text-[10px] font-bold text-health-100 bg-health-700/60 px-1.5 py-0.5 rounded-md truncate max-w-[50px]">
                      {dayRecords.length} events
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Legend */}
          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-center gap-4 flex-wrap text-xs text-slate-500 font-medium">
            <span className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-rose-500" />
              <span>Vitals (BP/Sugar/Weight)</span>
            </span>
            <span className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-purple-500" />
              <span>Medicine</span>
            </span>
            <span className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-orange-500" />
              <span>Symptom</span>
            </span>
            <span className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-cyan-500" />
              <span>Doctor Visit</span>
            </span>
            <span className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Document</span>
            </span>
          </div>
        </div>

        {/* Selected Date Drawer / Details Column (1 Col) */}
        <div className="space-y-4">
          <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-soft space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Day Details</p>
                <h3 className="text-base font-bold text-slate-900 tracking-tight">
                  {new Date(selectedDate).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}
                </h3>
              </div>

              <button
                type="button"
                onClick={() => openAddRecord('blood_pressure', selectedDate)}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-health-800 bg-health-50 hover:bg-health-100 border border-health-200 rounded-xl transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Record</span>
              </button>
            </div>

            {/* List of events on this selected date */}
            {selectedDateRecords.length === 0 ? (
              <EmptyState
                title="No events on this date"
                description={`You have not logged any health events for ${selectedDate}.`}
                actionLabel="+ Add Record for this date"
                onAction={() => openAddRecord('blood_pressure', selectedDate)}
                className="py-8"
              />
            ) : (
              <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
                {selectedDateRecords.map((record) => (
                  <RecordCard key={record.id} record={record} />
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
