import React, { useState } from 'react';
import { 
  TrendingUp, 
  Activity, 
  Droplet, 
  Scale, 
  Thermometer, 
  Info, 
  ArrowUpRight, 
  ArrowDownRight, 
  Minus,
  Sparkles
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  Legend 
} from 'recharts';

export const TrendsPage = () => {
  const [timeRange, setTimeRange] = useState('3m'); // 7d | 30d | 3m | 6m | 1y

  // Mock Trend Datasets
  const bpTrendData = [
    { date: 'Jun 12', systolic: 132, diastolic: 84, pulse: 72 },
    { date: 'Jul 05', systolic: 130, diastolic: 82, pulse: 70 },
    { date: 'Jul 25', systolic: 126, diastolic: 80, pulse: 72 },
    { date: 'Aug 18', systolic: 145, diastolic: 92, pulse: 76 },
    { date: 'Aug 20', systolic: 148, diastolic: 94, pulse: 80 },
    { date: 'Aug 23', systolic: 150, diastolic: 95, pulse: 82 },
    { date: 'Aug 25', systolic: 138, diastolic: 88, pulse: 78 },
    { date: 'Aug 28', systolic: 128, diastolic: 82, pulse: 74 },
  ];

  const sugarTrendData = [
    { date: 'Jun 15', fasting: 92, postPrandial: 128 },
    { date: 'Jul 10', fasting: 96, postPrandial: 132 },
    { date: 'Jul 28', fasting: 90, postPrandial: 124 },
    { date: 'Aug 05', fasting: 98, postPrandial: 138 },
    { date: 'Aug 15', fasting: 94, postPrandial: 130 },
    { date: 'Aug 28', fasting: 93, postPrandial: 126 },
  ];

  const weightTrendData = [
    { date: 'Jun 01', weight: 73.8 },
    { date: 'Jun 15', weight: 73.4 },
    { date: 'Jul 01', weight: 73.1 },
    { date: 'Jul 15', weight: 72.8 },
    { date: 'Aug 01', weight: 72.4 },
    { date: 'Aug 15', weight: 72.2 },
    { date: 'Aug 28', weight: 72.0 },
  ];

  const tempTrendData = [
    { date: 'Aug 10', temp: 98.4 },
    { date: 'Aug 12', temp: 98.6 },
    { date: 'Aug 18', temp: 98.8 },
    { date: 'Aug 22', temp: 98.4 },
    { date: 'Aug 28', temp: 98.6 },
  ];

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-health-700 uppercase tracking-wider">
            <TrendingUp className="w-4 h-4" />
            <span>Health Analytics & Trends</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
            Vitals & Measurements Over Time
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Objective visualization of your recorded blood pressure, glucose, weight, and temperature.
          </p>
        </div>

        {/* Timeframe selector */}
        <div className="flex items-center gap-1 bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm">
          {[
            { id: '7d', label: '7 Days' },
            { id: '30d', label: '30 Days' },
            { id: '3m', label: '3 Months' },
            { id: '6m', label: '6 Months' },
            { id: '1y', label: '1 Year' }
          ].map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTimeRange(t.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                timeRange === t.id
                  ? 'bg-health-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* 1. Blood Pressure Chart */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-soft space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                  <Activity className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Blood Pressure (Systolic / Diastolic)</h3>
                  <p className="text-xs text-slate-400">Unit: mmHg</p>
                </div>
              </div>
            </div>

            <div className="text-right">
              <span className="text-lg font-bold text-slate-900">128 / 82</span>
              <div className="flex items-center gap-1 text-[11px] text-emerald-600 font-semibold justify-end">
                <ArrowDownRight className="w-3.5 h-3.5" />
                <span>Normalized from 150/95</span>
              </div>
            </div>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={bpTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="sysGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="diaGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis domain={[60, 160]} tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', color: '#fff', fontSize: '12px', border: 'none' }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Area type="monotone" dataKey="systolic" name="Systolic (mmHg)" stroke="#ef4444" strokeWidth={2.5} fillOpacity={1} fill="url(#sysGradient)" />
                <Area type="monotone" dataKey="diastolic" name="Diastolic (mmHg)" stroke="#3b82f6" strokeWidth={2.5} fillOpacity={1} fill="url(#diaGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <p className="text-xs text-slate-500 bg-slate-50 p-3 rounded-2xl border border-slate-100">
            <span className="font-semibold text-slate-700">Observation: </span>
            Recorded values decreased over the past 5 days following adherence to medication and rest.
          </p>
        </div>

        {/* 2. Blood Sugar Chart */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-soft space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <Droplet className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Blood Glucose Levels</h3>
                  <p className="text-xs text-slate-400">Unit: mg/dL</p>
                </div>
              </div>
            </div>

            <div className="text-right">
              <span className="text-lg font-bold text-slate-900">93 mg/dL</span>
              <div className="flex items-center gap-1 text-[11px] text-slate-500 font-semibold justify-end">
                <Minus className="w-3.5 h-3.5 text-slate-400" />
                <span>Stable fasting average</span>
              </div>
            </div>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={sugarTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis domain={[70, 160]} tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', color: '#fff', fontSize: '12px', border: 'none' }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Line type="monotone" dataKey="fasting" name="Fasting (mg/dL)" stroke="#f59e0b" strokeWidth={2.5} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="postPrandial" name="Post-Meal (mg/dL)" stroke="#8b5cf6" strokeWidth={2.5} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <p className="text-xs text-slate-500 bg-slate-50 p-3 rounded-2xl border border-slate-100">
            <span className="font-semibold text-slate-700">Observation: </span>
            Fasting values have remained consistent between 90 and 98 mg/dL over the past 3 months.
          </p>
        </div>

        {/* 3. Body Weight Trend */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-soft space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Scale className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Body Weight Progress</h3>
                  <p className="text-xs text-slate-400">Unit: kg (Target: 70-72 kg)</p>
                </div>
              </div>
            </div>

            <div className="text-right">
              <span className="text-lg font-bold text-slate-900">72.0 kg</span>
              <div className="flex items-center gap-1 text-[11px] text-emerald-600 font-semibold justify-end">
                <ArrowDownRight className="w-3.5 h-3.5" />
                <span>-1.8 kg since June</span>
              </div>
            </div>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weightTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis domain={[68, 76]} tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', color: '#fff', fontSize: '12px', border: 'none' }}
                />
                <Line type="monotone" dataKey="weight" name="Weight (kg)" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, fill: '#3b82f6' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <p className="text-xs text-slate-500 bg-slate-50 p-3 rounded-2xl border border-slate-100">
            <span className="font-semibold text-slate-700">Observation: </span>
            Gradual healthy reduction of 1.8 kg over 12 weeks with light jogging and diet moderation.
          </p>
        </div>

        {/* 4. Temperature Trend */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-soft space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-pink-50 text-pink-600 flex items-center justify-center">
                  <Thermometer className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Body Temperature</h3>
                  <p className="text-xs text-slate-400">Unit: °F</p>
                </div>
              </div>
            </div>

            <div className="text-right">
              <span className="text-lg font-bold text-slate-900">98.6 °F</span>
              <div className="flex items-center gap-1 text-[11px] text-emerald-600 font-semibold justify-end">
                <Minus className="w-3.5 h-3.5 text-slate-400" />
                <span>Normal baseline</span>
              </div>
            </div>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={tempTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis domain={[97, 101]} tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', color: '#fff', fontSize: '12px', border: 'none' }}
                />
                <Line type="monotone" dataKey="temp" name="Temperature (°F)" stroke="#ec4899" strokeWidth={3} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <p className="text-xs text-slate-500 bg-slate-50 p-3 rounded-2xl border border-slate-100">
            <span className="font-semibold text-slate-700">Observation: </span>
            Recorded values remained within standard baseline without febrile episodes.
          </p>
        </div>

      </div>

      {/* Medical Disclaimer Banner */}
      <div className="p-4 bg-slate-100 rounded-3xl border border-slate-200 text-xs text-slate-500 flex items-start gap-2.5">
        <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-slate-700">Disclaimer: </span>
          Trends and graphs reflect user-logged data points. These visual analytics are informational and are not automated medical diagnoses. Always share raw readings with your doctor for clinical evaluation.
        </div>
      </div>
    </div>
  );
};
