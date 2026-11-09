import React from 'react';
import { format, parseISO } from 'date-fns';
import { AlertTriangle, Calendar, FileSpreadsheet, FileText, Cpu, Edit3 } from 'lucide-react';

export default function SalesCard({ entry }) {
  const isCenet = entry.systemType === 'CENET';
  const field1Label = isCenet ? 'Restaurant' : 'Butchery';
  const field2Label = isCenet ? 'Lounge' : 'Liquor';

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(val || 0);
  };

  const formatDate = (dateString) => {
    try {
      return format(parseISO(dateString), 'dd/MM/yyyy');
    } catch {
      return dateString || '';
    }
  };

  const getSourceIcon = (source) => {
    switch (source) {
      case 'API':
        return <Cpu className="w-3.5 h-3.5 text-blue-500" />;
      case 'Excel':
      case 'CSV':
        return <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-500" />;
      case 'PDF':
        return <FileText className="w-3.5 h-3.5 text-red-500" />;
      default:
        return <Edit3 className="w-3.5 h-3.5 text-slate-500" />;
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow p-5 relative overflow-hidden">
      {/* Accent left border */}
      <div className={`absolute top-0 left-0 bottom-0 w-1.5 ${isCenet ? 'bg-purple-600' : 'bg-teal-600'}`} />

      {/* Header: Date & Source Badge */}
      <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
        <div className="flex items-center gap-2 text-slate-700">
          <Calendar className="w-4 h-4 text-slate-400" />
          <span className="font-semibold text-sm">
            {formatDate(entry.recordDate)}
          </span>
        </div>

        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-50 border border-slate-200">
          {getSourceIcon(entry.importSource)}
          <span className={isCenet ? 'text-purple-700' : 'text-teal-700'}>
            {entry.importSource}
          </span>
        </div>
      </div>

      {/* Breakdown: Field 1, Field 2, Total */}
      <div className="grid grid-cols-3 gap-4 pt-4 pb-2 items-center">
        <div>
          <span className="text-xs text-slate-400 block font-medium uppercase tracking-wider">
            {field1Label}
          </span>
          <span className="text-base font-bold text-slate-800">
            {formatCurrency(entry.field1Amount)}
          </span>
        </div>

        <div>
          <span className="text-xs text-slate-400 block font-medium uppercase tracking-wider">
            {field2Label}
          </span>
          <span className="text-base font-bold text-slate-800">
            {formatCurrency(entry.field2Amount)}
          </span>
        </div>

        <div className="text-right">
          <span className="text-xs text-slate-400 block font-medium uppercase tracking-wider">
            {entry.systemType} Total
          </span>
          <span className={`text-lg font-black ${isCenet ? 'text-purple-700' : 'text-teal-700'}`}>
            {formatCurrency(entry.totalSales)}
          </span>
        </div>
      </div>

      {/* Late Submission Warning Banner */}
      {entry.isLate && (
        <div className="mt-4 p-3.5 rounded-xl bg-amber-50/80 border border-amber-200/90 text-amber-900">
          <div className="flex items-center gap-2 font-semibold text-xs text-amber-800">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Late Submission (&gt;1 day delay)</span>
          </div>
          {entry.delayReason && (
            <p className="mt-1.5 text-xs text-amber-950 font-medium italic pl-6">
              Reason: &ldquo;{entry.delayReason}&rdquo;
            </p>
          )}
        </div>
      )}
    </div>
  );
}
