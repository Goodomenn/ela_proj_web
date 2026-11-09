import React, { useRef } from 'react';
import { X, Cpu, Table, FileText, Edit, UploadCloud } from 'lucide-react';

export default function ImportModal({
  isOpen,
  onClose,
  systemType,
  onSelectApi,
  onFileUpload,
  onSelectManual
}) {
  const fileInputRef = useRef(null);
  const pdfInputRef = useRef(null);

  if (!isOpen) return null;

  const isCenet = systemType === 'CENET';
  const subtitle = isCenet
    ? 'Select source format for CENET (Restaurant & Lounge)'
    : 'Select source format for LOOP (Butchery & Liquor)';

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      onFileUpload(e.target.files[0]);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-xl font-bold text-slate-900">
              Import {systemType} Sales Data
            </h3>
            <p className="text-xs text-slate-500 mt-1">{subtitle}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Options List matching Flutter modal bottom sheet */}
        <div className="space-y-3 mt-5">
          {/* Option 1: API */}
          <button
            onClick={() => {
              onClose();
              onSelectApi();
            }}
            className="w-full flex items-center gap-4 p-4 rounded-2xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 transition-all text-left group"
          >
            <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Cpu className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-slate-800 group-hover:text-blue-700">
                Fetch via API (Automated)
              </h4>
              <p className="text-xs text-slate-500">
                Direct daily sync from store POS API for today&apos;s date
              </p>
            </div>
          </button>

          {/* Option 2: Excel / CSV */}
          <button
            onClick={() => {
              onClose();
              fileInputRef.current?.click();
            }}
            className="w-full flex items-center gap-4 p-4 rounded-2xl border border-slate-200 hover:border-emerald-400 hover:bg-emerald-50/50 transition-all text-left group"
          >
            <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Table className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-slate-800 group-hover:text-emerald-700">
                Import Excel / CSV File
              </h4>
              <p className="text-xs text-slate-500">
                Upload and auto-extract totals from .xlsx or .csv files
              </p>
            </div>
          </button>

          {/* Option 3: PDF */}
          <button
            onClick={() => {
              onClose();
              pdfInputRef.current?.click();
            }}
            className="w-full flex items-center gap-4 p-4 rounded-2xl border border-slate-200 hover:border-red-400 hover:bg-red-50/50 transition-all text-left group"
          >
            <div className="w-12 h-12 rounded-xl bg-red-100 text-red-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-slate-800 group-hover:text-red-700">
                Import PDF File
              </h4>
              <p className="text-xs text-slate-500">
                Extract sales totals & dates from formal daily statement PDF
              </p>
            </div>
          </button>

          {/* Option 4: Manual Form */}
          <button
            onClick={() => {
              onClose();
              onSelectManual();
            }}
            className="w-full flex items-center gap-4 p-4 rounded-2xl border border-slate-200 hover:border-purple-400 hover:bg-purple-50/50 transition-all text-left group"
          >
            <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Edit className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-slate-800 group-hover:text-purple-700">
                Manual Sales Entry
              </h4>
              <p className="text-xs text-slate-500">
                Fill out date and amount breakdowns directly
              </p>
            </div>
          </button>
        </div>

        {/* Hidden File Inputs */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx,.xls,.csv"
          onChange={handleFileChange}
          className="hidden"
        />
        <input
          ref={pdfInputRef}
          type="file"
          accept=".pdf"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>
    </div>
  );
}
