import React, { useState } from 'react';
import { X, Check, Calendar, DollarSign } from 'lucide-react';

export default function ManualEntryModal({
  isOpen,
  onClose,
  systemType,
  onSubmit
}) {
  const isCenet = systemType === 'CENET';
  const field1Label = isCenet ? 'Restaurant Sales' : 'Butchery Sales';
  const field2Label = isCenet ? 'Lounge Sales' : 'Liquor Sales';

  const todayStr = new Date().toISOString().split('T')[0];
  const [recordDate, setRecordDate] = useState(todayStr);
  const [field1Amount, setField1Amount] = useState('');
  const [field2Amount, setField2Amount] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const f1 = parseFloat(field1Amount) || 0;
  const f2 = parseFloat(field2Amount) || 0;
  const total = f1 + f2;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!recordDate) {
      setError('Please select a valid record date.');
      return;
    }
    if (f1 <= 0 && f2 <= 0) {
      setError('Please enter at least one non-zero amount.');
      return;
    }
    setError('');
    onSubmit({
      recordDate: new Date(recordDate).toISOString(),
      field1Amount: f1,
      field2Amount: f2,
      totalSales: total,
      formatType: 'Manual'
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              Manual {systemType} Entry
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Enter daily revenue figures
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Record Date
            </label>
            <div className="relative">
              <input
                type="date"
                value={recordDate}
                onChange={(e) => setRecordDate(e.target.value)}
                className="w-full text-sm p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              {field1Label} ($)
            </label>
            <input
              type="number"
              step="0.01"
              value={field1Amount}
              onChange={(e) => setField1Amount(e.target.value)}
              placeholder="0.00"
              className="w-full text-sm p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              {field2Label} ($)
            </label>
            <input
              type="number"
              step="0.01"
              value={field2Amount}
              onChange={(e) => setField2Amount(e.target.value)}
              placeholder="0.00"
              className="w-full text-sm p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
            />
          </div>

          {/* Computed Total Preview */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex justify-between items-center">
            <span className="text-xs font-semibold text-slate-600 uppercase">
              Calculated Total:
            </span>
            <span className="text-lg font-bold text-slate-900">
              ${total.toFixed(2)}
            </span>
          </div>

          {error && <p className="text-xs font-semibold text-red-600">{error}</p>}

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 rounded-xl hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`px-5 py-2.5 text-xs font-bold text-white rounded-xl shadow-md transition-all flex items-center gap-1.5 ${
                isCenet ? 'bg-purple-600 hover:bg-purple-700' : 'bg-teal-600 hover:bg-teal-700'
              }`}
            >
              <Check className="w-4 h-4" />
              <span>Proceed</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
