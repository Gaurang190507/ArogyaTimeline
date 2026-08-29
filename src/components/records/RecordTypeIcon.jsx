import React from 'react';
import { 
  Activity, 
  Droplet, 
  Scale, 
  Thermometer, 
  Pill, 
  AlertCircle, 
  Stethoscope, 
  FileText, 
  Camera, 
  StickyNote, 
  Clock, 
  Mic, 
  Heart 
} from 'lucide-react';

export const recordTypeConfig = {
  blood_pressure: {
    label: "Blood Pressure",
    icon: Activity,
    color: "bg-rose-50 text-rose-600 border-rose-200",
    badgeColor: "danger",
    emoji: "🩸"
  },
  blood_sugar: {
    label: "Blood Sugar",
    icon: Droplet,
    color: "bg-amber-50 text-amber-600 border-amber-200",
    badgeColor: "warning",
    emoji: "🍬"
  },
  weight: {
    label: "Weight",
    icon: Scale,
    color: "bg-blue-50 text-blue-600 border-blue-200",
    badgeColor: "info",
    emoji: "⚖️"
  },
  temperature: {
    label: "Temperature",
    icon: Thermometer,
    color: "bg-pink-50 text-pink-600 border-pink-200",
    badgeColor: "danger",
    emoji: "🌡️"
  },
  medicine: {
    label: "Medicine",
    icon: Pill,
    color: "bg-purple-50 text-purple-600 border-purple-200",
    badgeColor: "purple",
    emoji: "💊"
  },
  symptom: {
    label: "Symptom",
    icon: AlertCircle,
    color: "bg-orange-50 text-orange-600 border-orange-200",
    badgeColor: "warning",
    emoji: "🤒"
  },
  doctor_visit: {
    label: "Doctor Visit",
    icon: Stethoscope,
    color: "bg-cyan-50 text-cyan-600 border-cyan-200",
    badgeColor: "info",
    emoji: "👨‍⚕️"
  },
  document: {
    label: "Document",
    icon: FileText,
    color: "bg-emerald-50 text-emerald-600 border-emerald-200",
    badgeColor: "success",
    emoji: "📄"
  },
  photo: {
    label: "Photo Record",
    icon: Camera,
    color: "bg-indigo-50 text-indigo-600 border-indigo-200",
    badgeColor: "primary",
    emoji: "📷"
  },
  note: {
    label: "Personal Note",
    icon: StickyNote,
    color: "bg-slate-100 text-slate-600 border-slate-200",
    badgeColor: "default",
    emoji: "📝"
  },
  reminder: {
    label: "Reminder",
    icon: Clock,
    color: "bg-yellow-50 text-yellow-700 border-yellow-200",
    badgeColor: "warning",
    emoji: "⏰"
  },
  voice: {
    label: "Voice Record",
    icon: Mic,
    color: "bg-teal-50 text-teal-700 border-teal-200",
    badgeColor: "primary",
    emoji: "🎙️"
  },
  other: {
    label: "Other Event",
    icon: Heart,
    color: "bg-slate-100 text-slate-700 border-slate-200",
    badgeColor: "default",
    emoji: "❤️"
  }
};

/**
 * Canonical list of record types (derived from recordTypeConfig)
 * so the "Add Record" modal and icon component never drift.
 * Excludes `voice` and `other` which are not user-addable types.
 */
export const recordTypesList = Object.entries(recordTypeConfig)
  .filter(([key]) => !['voice', 'other'].includes(key))
  .map(([type, config]) => ({
    type,
    label: config.label,
    emoji: config.emoji,
  }));

export const RecordTypeIcon = ({ type, size = "md", className = "" }) => {
  const config = recordTypeConfig[type] || recordTypeConfig.other;
  const Icon = config.icon;

  const sizeClasses = {
    sm: "w-8 h-8 rounded-xl p-1.5",
    md: "w-10 h-10 rounded-2xl p-2",
    lg: "w-12 h-12 rounded-2xl p-2.5"
  };

  const iconSizes = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6"
  };

  return (
    <div className={`flex items-center justify-center shrink-0 border ${config.color} ${sizeClasses[size]} ${className}`}>
      <Icon className={iconSizes[size]} />
    </div>
  );
};
