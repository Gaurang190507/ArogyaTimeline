import React from 'react';
import { Modal } from './Modal';
import { AlertTriangle } from 'lucide-react';

export const ConfirmationDialog = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = "Are you sure?", 
  message = "This action cannot be undone.",
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  isDanger = false 
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="max-w-md">
      <div className="flex items-start gap-4">
        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
          isDanger ? 'bg-rose-100 text-rose-600' : 'bg-amber-100 text-amber-600'
        }`}>
          <AlertTriangle className="w-5 h-5" />
        </div>
        <div className="flex-1">
          <p className="text-sm text-slate-600 leading-relaxed">{message}</p>
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-slate-100">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
        >
          {cancelLabel}
        </button>
        <button
          type="button"
          onClick={async () => {
            try {
              await onConfirm();
              onClose();
            } catch (err) {
              // Silently swallow — parent is responsible for surfacing errors
              // via its own error/state handling. We just keep the dialog open
              // so the user can retry or cancel.
              console.error('[ConfirmationDialog] onConfirm failed:', err);
            }
          }}
          className={`px-5 py-2 text-sm font-semibold text-white rounded-xl shadow-sm transition-all ${
            isDanger
              ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/20'
              : 'bg-health-600 hover:bg-health-700 shadow-health-600/20'
          }`}
        >
          {confirmLabel}
        </button>
      </div>
    </Modal>
  );
};
