import React from 'react';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';

export const MetricCard = ({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  trend, // 'up' | 'down' | 'neutral'
  trendLabel, 
  color = 'health', 
  onClick,
  className = '' 
}) => {
  const colorMap = {
    health: { bg: 'bg-teal-50 text-teal-700 border-teal-100', iconBg: 'bg-teal-100 text-teal-700' },
    rose: { bg: 'bg-rose-50 text-rose-700 border-rose-100', iconBg: 'bg-rose-100 text-rose-700' },
    amber: { bg: 'bg-amber-50 text-amber-800 border-amber-100', iconBg: 'bg-amber-100 text-amber-800' },
    blue: { bg: 'bg-blue-50 text-blue-700 border-blue-100', iconBg: 'bg-blue-100 text-blue-700' },
    purple: { bg: 'bg-purple-50 text-purple-700 border-purple-100', iconBg: 'bg-purple-100 text-purple-700' }
  };

  const scheme = colorMap[color] || colorMap.health;

  return (
    <div 
      onClick={onClick}
      className={`bg-white rounded-3xl p-5 border border-slate-100 shadow-soft hover:shadow-soft-lg transition-all duration-200 ${
        onClick ? 'cursor-pointer hover:border-health-300 group' : ''
      } ${className}`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0 pr-2">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider truncate">{title}</p>
          <div className="flex items-baseline gap-2 mt-1.5">
            <h4 className="text-2xl font-bold text-slate-800 tracking-tight">{value}</h4>
          </div>
          {subtitle && (
            <p className="text-xs text-slate-500 mt-1 truncate">{subtitle}</p>
          )}
        </div>

        {Icon && (
          <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${scheme.iconBg} group-hover:scale-105 transition-transform`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      {trendLabel && (
        <div className="mt-3 pt-3 border-t border-slate-50 flex items-center gap-1.5 text-xs text-slate-500">
          {trend === 'up' && <ArrowUpRight className="w-3.5 h-3.5 text-rose-500 shrink-0" />}
          {trend === 'down' && <ArrowDownRight className="w-3.5 h-3.5 text-emerald-500 shrink-0" />}
          {trend === 'neutral' && <Minus className="w-3.5 h-3.5 text-slate-400 shrink-0" />}
          <span className="truncate">{trendLabel}</span>
        </div>
      )}
    </div>
  );
};
