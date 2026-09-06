import React, { useState } from 'react';
import { RecordTypeIcon, recordTypeConfig } from './RecordTypeIcon';
import { Badge } from '../common/Badge';
import { Clock, Calendar, MoreVertical, Trash2, Edit3, Eye, FileText, Stethoscope, Pill, AlertCircle, ShieldCheck } from 'lucide-react';
import { useHealth } from '../../context/HealthContext';
import { ConfirmationDialog } from '../common/ConfirmationDialog';

export const RecordCard = ({ record, onEdit, compact = false, className = '' }) => {
  const { deleteRecord } = useHealth();
  const [showMenu, setShowMenu] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const config = recordTypeConfig[record.type] || recordTypeConfig.other;
  const meta = record.metadata || {};

  // Formatted metadata snippets based on type
  const renderMetadataSnippet = () => {
    switch (record.type) {
      case 'blood_pressure':
        return (
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-xl font-bold text-slate-900 tracking-tight">
              {meta.systolic} / {meta.diastolic} <span className="text-xs font-normal text-slate-500">{meta.unit || 'mmHg'}</span>
            </span>
            {meta.pulse && (
              <span className="text-xs text-slate-500 font-medium">Pulse: {meta.pulse} bpm</span>
            )}
            {meta.category && (
              <Badge variant={meta.systolic > 140 ? 'danger' : 'success'} size="sm">
                {meta.category}
              </Badge>
            )}
          </div>
        );
      case 'blood_sugar':
        return (
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-xl font-bold text-slate-900 tracking-tight">
              {meta.value} <span className="text-xs font-normal text-slate-500">{meta.unit || 'mg/dL'}</span>
            </span>
            {meta.context && (
              <Badge variant="warning" size="sm">{meta.context}</Badge>
            )}
          </div>
        );
      case 'weight':
        return (
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-xl font-bold text-slate-900 tracking-tight">
              {meta.value} <span className="text-xs font-normal text-slate-500">{meta.unit || 'kg'}</span>
            </span>
            {meta.bmi && (
              <span className="text-xs text-slate-500">BMI: {meta.bmi} ({meta.bmiCategory || 'Normal'})</span>
            )}
          </div>
        );
      case 'temperature':
        return (
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-xl font-bold text-slate-900 tracking-tight">
              {meta.value} <span className="text-xs font-normal text-slate-500">{meta.unit || '°F'}</span>
            </span>
            {meta.category && <Badge variant="danger" size="sm">{meta.category}</Badge>}
          </div>
        );
      case 'symptom':
        return (
          <div className="mt-1 space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-800 text-sm">{meta.symptomName || record.title}</span>
              {meta.severity && (
                <Badge variant={meta.severity >= 7 ? 'danger' : meta.severity >= 4 ? 'warning' : 'info'} size="sm">
                  Severity: {meta.severity}/10
                </Badge>
              )}
            </div>
            {meta.location && <p className="text-xs text-slate-500">Location: {meta.location}</p>}
          </div>
        );
      case 'medicine':
        return (
          <div className="mt-1 flex items-center gap-2">
            <span className="font-semibold text-slate-800 text-sm">{meta.medicineName || record.title}</span>
            {meta.dosage && <span className="text-xs text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">{meta.dosage}</span>}
            {meta.status && <Badge variant="purple" size="sm">{meta.status}</Badge>}
          </div>
        );
      case 'doctor_visit':
        return (
          <div className="mt-1 space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-cyan-800 text-sm">{meta.doctorName || "Consultation"}</span>
              {meta.specialization && <span className="text-xs text-slate-500">({meta.specialization})</span>}
            </div>
            {meta.hospital && <p className="text-xs text-slate-500">{meta.hospital}</p>}
            {meta.diagnosis && (
              <p className="text-xs font-medium text-slate-700 bg-cyan-50/70 p-2 rounded-xl border border-cyan-100 mt-1.5">
                <span className="font-semibold text-cyan-900">Diagnosis: </span>{meta.diagnosis}
              </p>
            )}
          </div>
        );
      case 'document':
        return (
          <div className="mt-1 space-y-1">
            <p className="text-xs text-slate-600 line-clamp-2">{meta.extractedSummary || record.description}</p>
            {meta.facility && <p className="text-[11px] text-slate-400">Issued by {meta.facility}</p>}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <div className={`group relative bg-white rounded-3xl p-5 border border-slate-100 shadow-soft hover:shadow-soft-lg hover:border-slate-200 transition-all ${className}`}>
        <div className="flex items-start gap-3.5">
          <RecordTypeIcon type={record.type} size="md" />

          <div className="flex-1 min-w-0">
            {/* Header info */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  {config.label}
                </span>
                <span className="text-slate-300">•</span>
                <span className="flex items-center gap-1 text-xs text-slate-500">
                  <Calendar className="w-3 h-3 text-slate-400" />
                  {record.date}
                </span>
                {record.time && (
                  <span className="flex items-center gap-1 text-xs text-slate-400">
                    <Clock className="w-3 h-3 text-slate-400" />
                    {record.time}
                  </span>
                )}
              </div>

              {/* Action Dropdown Menu */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowMenu(!showMenu)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-all"
                >
                  <MoreVertical className="w-4 h-4" />
                </button>

                {showMenu && (
                  <div className="absolute right-0 mt-1 w-32 bg-white rounded-2xl shadow-xl border border-slate-100 py-1.5 z-20 animate-slide-up">
                    <button
                      type="button"
                      onClick={() => {
                        setShowMenu(false);
                        setShowDeleteConfirm(true);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-rose-600 hover:bg-rose-50 font-medium"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Delete
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Title & specific metadata */}
            <h4 className="text-base font-bold text-slate-800 mt-1 leading-snug tracking-tight">
              {record.title}
            </h4>

            {renderMetadataSnippet()}

            {/* Clinical Provenance & Authenticity Seal */}
            {meta.provenance === 'hospital_verified' || meta.doctorName || meta.hospital || meta.prescribedBy ? (
              <div className="mt-2.5 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-emerald-50 border border-emerald-200/80 text-emerald-900 text-[11px] font-bold">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Clinically Verified • {meta.hospital || meta.doctorName || 'Hospital OPD'}</span>
                {meta.registrationNumber && (
                  <span className="font-mono text-[10px] text-emerald-700">({meta.registrationNumber})</span>
                )}
              </div>
            ) : (
              <div className="mt-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-slate-100 text-slate-500 text-[10px] font-medium">
                <AlertCircle className="w-3 h-3 text-slate-400 shrink-0" />
                <span>Auxiliary Patient Log (Unverified)</span>
              </div>
            )}

            {/* Description / Personal Notes */}
            {record.description && record.type !== 'document' && (
              <p className="text-xs text-slate-500 mt-2 leading-relaxed bg-slate-50/60 p-2.5 rounded-xl border border-slate-100">
                {record.description}
              </p>
            )}
          </div>
        </div>
      </div>

      <ConfirmationDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={() => deleteRecord(record.id)}
        title="Delete Health Record"
        message={`Are you sure you want to remove "${record.title}" from your personal health timeline?`}
        confirmLabel="Delete Record"
        isDanger={true}
      />
    </>
  );
};
