import React, { useState } from 'react';
import { AlertTriangle, X, Check } from 'lucide-react';
import { format, parseISO } from 'date-fns';

export default function LateReasonModal({
  isOpen,
  onClose,
  parsedData,
  onConfirm
}) {
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  if (!isOpen || !parsedData) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!reason || reason.trim().length === 0) {
      setError('A valid reason for the submission delay is mandatory.');
      return;
    }
    setError('');
    onConfirm(reason.trim());
    setReason('');
  };

  const formattedDocDate = (() => {
    try {
      return format(parseISO(parsedData.recordDate), 'dd/MM/yyyy');
    } catch {
      return parsedData.recordDate;
    }
  })();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
        {/* Warning Icon & Header */}
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-slate-900">
              Late Submission Detected
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Document Date: <span className="font-semibold text-slate-700">{formattedDocDate}</span> (&gt; 1 calendar day delay).
            </p>
          </div>
        </div>

        {/* Informative Alert */}
        <div className="my-4 p-3 rounded-xl bg-amber-50 text-amber-900 border border-amber-200 text-xs">
          Per operational policy, late daily sales submissions require a mandatory explanation for compliance audit logging.
        </div>

        {/* Reason Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Reason for Delay <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={3}
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                if (error) setError('');
              }}
              placeholder="e.g., POS terminal communication error at branch; awaited supervisor reconciliation..."
              className="w-full text-sm p-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              autoFocus
            />
            {error && <p className="text-xs font-semibold text-red-600 mt-1">{error}</p>}
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-800 rounded-xl hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-md transition-all flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>Confirm & Save</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
