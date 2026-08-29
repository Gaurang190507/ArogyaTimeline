import React, { useState } from 'react';
import { FileText, Download, Sparkles, Trash2, Eye, Calendar, Building2, User, ChevronRight } from 'lucide-react';
import { Badge } from '../common/Badge';
import { Modal } from '../common/Modal';
import { ConfirmationDialog } from '../common/ConfirmationDialog';
import { useHealth } from '../../context/HealthContext';

export const DocumentCard = ({ document }) => {
  const { deleteDocument, showToast } = useHealth();
  const [showDetails, setShowDetails] = useState(false);
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const getTypeBadgeVariant = (type) => {
    switch (type) {
      case 'Reports': return 'info';
      case 'Prescriptions': return 'purple';
      case 'Scans': return 'warning';
      case 'Discharge Summaries': return 'danger';
      default: return 'default';
    }
  };

  const handleDownload = () => {
    showToast(`Downloading ${document.title}... (Mock File)`);
  };

  return (
    <>
      <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-soft hover:shadow-soft-lg hover:border-slate-200 transition-all group flex flex-col justify-between">
        <div>
          {/* Header Row */}
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform border border-emerald-100">
              <FileText className="w-6 h-6" />
            </div>
            <div className="flex items-center gap-1.5 flex-wrap justify-end">
              <Badge variant={getTypeBadgeVariant(document.type)} size="sm">
                {document.type}
              </Badge>
              <span className="text-[11px] font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                {document.fileFormat || 'PDF'}
              </span>
            </div>
          </div>

          {/* Title */}
          <h4 className="text-base font-bold text-slate-800 tracking-tight group-hover:text-health-700 transition-colors line-clamp-2">
            {document.title}
          </h4>

          {/* Metadata */}
          <div className="mt-3 space-y-1.5 text-xs text-slate-500">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>{document.date}</span>
              {document.fileSize && <span className="text-slate-300">• {document.fileSize}</span>}
            </div>

            {document.doctor && (
              <div className="flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="truncate">{document.doctor}</span>
              </div>
            )}

            {document.hospital && (
              <div className="flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="truncate">{document.hospital}</span>
              </div>
            )}
          </div>

          {/* Extracted preview snippet */}
          {document.summary && (
            <p className="text-xs text-slate-500 mt-3 line-clamp-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100 leading-relaxed">
              {document.summary}
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => setShowDetails(true)}
            className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>View</span>
          </button>

          <button
            type="button"
            onClick={() => setShowSummaryModal(true)}
            title="AI Summary"
            className="inline-flex items-center justify-center p-2 text-xs font-semibold text-health-700 bg-health-50 hover:bg-health-100 rounded-xl transition-colors"
          >
            <Sparkles className="w-4 h-4 text-health-600" />
          </button>

          <button
            type="button"
            onClick={handleDownload}
            title="Download Document"
            className="inline-flex items-center justify-center p-2 text-xs font-semibold text-slate-600 hover:text-slate-800 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <Download className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => setShowDeleteConfirm(true)}
            title="Delete Document"
            className="inline-flex items-center justify-center p-2 text-xs font-semibold text-rose-500 hover:bg-rose-50 rounded-xl transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* View Document Modal */}
      <Modal
        isOpen={showDetails}
        onClose={() => setShowDetails(false)}
        title={document.title}
        maxWidth="max-w-2xl"
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl text-xs text-slate-600">
            <div>
              <span className="font-semibold text-slate-800">Date: </span>{document.date}
            </div>
            <div>
              <span className="font-semibold text-slate-800">Category: </span>{document.type}
            </div>
            <div>
              <span className="font-semibold text-slate-800">Format: </span>{document.fileFormat} ({document.fileSize})
            </div>
          </div>

          {/* AI Extracted Information Section */}
          {document.extractedData && (
            <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-4 space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 uppercase tracking-wider">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <span>AI Digitized Information</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-700">
                {Object.entries(document.extractedData).map(([key, val]) => (
                  <div key={key} className="bg-white/80 p-2.5 rounded-xl border border-emerald-100">
                    <span className="font-semibold text-slate-800 capitalize block mb-0.5">
                      {key.replace(/([A-Z])/g, ' $1')}:
                    </span>
                    <span className="text-slate-600">{Array.isArray(val) ? val.join(', ') : val}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Summary */}
          {document.summary && (
            <div>
              <h5 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Clinical Overview
              </h5>
              <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100 leading-relaxed">
                {document.summary}
              </p>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              onClick={() => setShowDetails(false)}
              className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Close
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-5 py-2 text-sm font-bold text-white bg-health-600 hover:bg-health-700 rounded-xl shadow-md"
            >
              <Download className="w-4 h-4" />
              <span>Download File</span>
            </button>
          </div>
        </div>
      </Modal>

      {/* AI Summary Modal */}
      <Modal
        isOpen={showSummaryModal}
        onClose={() => setShowSummaryModal(false)}
        title="AI Document Summary"
        maxWidth="max-w-lg"
      >
        <div className="space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-health-50 text-health-600 flex items-center justify-center mx-auto">
            <Sparkles className="w-6 h-6" />
          </div>
          <h4 className="text-base font-bold text-center text-slate-800">{document.title}</h4>
          <p className="text-sm text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-100">
            {document.summary || "This document contains routine clinical and laboratory findings. All biological reference intervals have been digitized and linked to your health timeline."}
          </p>
          <p className="text-xs text-slate-400 italic text-center">
            AI-generated summaries are informational and should be verified with a qualified healthcare professional.
          </p>
          <div className="flex justify-end pt-2">
            <button
              onClick={() => setShowSummaryModal(false)}
              className="px-5 py-2 text-sm font-bold text-white bg-health-600 hover:bg-health-700 rounded-xl shadow-md"
            >
              Done
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmationDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={() => deleteDocument(document.id)}
        title="Delete Medical Document"
        message={`Are you sure you want to delete "${document.title}"? This will also remove the corresponding timeline record.`}
        confirmLabel="Delete Document"
        isDanger={true}
      />
    </>
  );
};
