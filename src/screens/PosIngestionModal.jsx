import React, { useState } from 'react';
import { 
  X, 
  UploadCloud, 
  Calculator, 
  CheckCircle2, 
  AlertCircle,
  FileText
} from 'lucide-react';
import { db, doc, setDoc, serverTimestamp, formatETB } from '../services/firebaseClient';
import { useAuth } from '../context/AuthContext';

export default function PosIngestionModal({ isOpen, onClose }) {
  const { user } = useAuth();
  const [systemType, setSystemType] = useState('CENET'); // 'CENET' or 'LOOP'
  const [deviceName, setDeviceName] = useState('Primary Counter');
  const [recordDate, setRecordDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [totalSales, setTotalSales] = useState('');
  const [totalCash, setTotalCash] = useState('');
  const [totalCbe, setTotalCbe] = useState('');
  const [totalTelebirr, setTotalTelebirr] = useState('');
  const [isLate, setIsLate] = useState(false);
  const [lateReason, setLateReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState(null);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!totalSales) return;

    setIsSubmitting(true);
    setMessage(null);

    try {
      const salesVal = parseFloat(totalSales) || 0;
      const cashVal = parseFloat(totalCash) || 0;
      const cbeVal = parseFloat(totalCbe) || 0;
      const teleVal = parseFloat(totalTelebirr) || 0;

      const dateClean = recordDate.replaceAll('-', '');
      const deviceClean = deviceName.replace(/[^a-zA-Z0-9]/g, '_');
      const docId = `${systemType}_${dateClean}_${deviceClean}`;

      const entry = {
        id: docId,
        systemType,
        deviceName,
        recordDate,
        date: recordDate,
        totalSales: salesVal,
        totalItemsSold: 1,
        totalCash: cashVal,
        totalCbe: cbeVal,
        totalTelebirr: teleVal,
        cbeTransactions: cbeVal > 0 ? 1 : 0,
        telebirrTransactions: teleVal > 0 ? 1 : 0,
        isLateSubmission: isLate,
        lateReason: isLate ? lateReason : '',
        uploadedBy: user?.username || 'dani',
        createdAt: new Date().toISOString(),
        items: [
          {
            code: 'AUTO_INGEST',
            name: `${systemType} Register Daily Intake`,
            category: 'Sales',
            quantity: 1,
            unitPrice: salesVal,
            totalAmount: salesVal,
            date: recordDate
          }
        ]
      };

      if (db) {
        await setDoc(doc(db, 'sales_entries', docId), entry, { merge: true });
      }

      setMessage({ type: 'success', text: `Sales ingested successfully into Firestore as ${docId}!` });
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-[#161C28] border border-[#1E2635] rounded-2xl p-5 space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-[#1E2635]">
          <div className="flex items-center gap-2">
            <Calculator size={18} className="text-[#00D1FF]" />
            <h3 className="text-sm font-bold text-white">POS Ingestion</h3>
          </div>
          <button onClick={onClose} className="text-[#8E99AE] hover:text-white">
            <X size={18} />
          </button>
        </div>

        {message && (
          <div className={`p-3 rounded-xl border flex items-center gap-2 text-xs ${
            message.type === 'success' 
              ? 'bg-[#00FF94]/10 border-[#00FF94]/30 text-[#00FF94]' 
              : 'bg-[#FF4D4D]/10 border-[#FF4D4D]/30 text-[#FF4D4D]'
          }`}>
            {message.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
            <span>{message.text}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          {/* Channel Selector */}
          <div>
            <label className="text-[10px] font-bold text-[#8E99AE] uppercase block mb-1">POS Channel</label>
            <div className="grid grid-cols-2 gap-2">
              {['CENET', 'LOOP'].map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setSystemType(c)}
                  className={`py-2 text-xs font-bold rounded-xl border transition-colors ${
                    systemType === c 
                      ? 'bg-[#00D1FF]/15 border-[#00D1FF] text-[#00D1FF]' 
                      : 'bg-[#0D121D] border-[#1E2635] text-[#8E99AE]'
                  }`}
                >
                  {c} System
                </button>
              ))}
            </div>
          </div>

          {/* Device & Date */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] font-bold text-[#8E99AE] uppercase block mb-1">Terminal Device</label>
              <input
                type="text"
                value={deviceName}
                onChange={(e) => setDeviceName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#0D121D] border border-[#1E2635] text-white focus:outline-none focus:border-[#00D1FF]"
                required
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-[#8E99AE] uppercase block mb-1">Date</label>
              <input
                type="date"
                value={recordDate}
                onChange={(e) => setRecordDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#0D121D] border border-[#1E2635] text-white focus:outline-none focus:border-[#00D1FF]"
                required
              />
            </div>
          </div>

          {/* Sales Amounts */}
          <div>
            <label className="text-[10px] font-bold text-[#8E99AE] uppercase block mb-1">Total Sales (ETB)</label>
            <input
              type="number"
              step="any"
              value={totalSales}
              onChange={(e) => setTotalSales(e.target.value)}
              placeholder="e.g. 50000"
              className="w-full px-3 py-2 rounded-xl bg-[#0D121D] border border-[#1E2635] text-white text-sm font-semibold focus:outline-none focus:border-[#00D1FF]"
              required
            />
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="text-[10px] font-bold text-[#8E99AE] uppercase block mb-1">Cash (ETB)</label>
              <input
                type="number"
                step="any"
                value={totalCash}
                onChange={(e) => setTotalCash(e.target.value)}
                placeholder="0"
                className="w-full px-3 py-2 rounded-xl bg-[#0D121D] border border-[#1E2635] text-white focus:outline-none focus:border-[#00D1FF]"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-[#8E99AE] uppercase block mb-1">CBE (ETB)</label>
              <input
                type="number"
                step="any"
                value={totalCbe}
                onChange={(e) => setTotalCbe(e.target.value)}
                placeholder="0"
                className="w-full px-3 py-2 rounded-xl bg-[#0D121D] border border-[#1E2635] text-white focus:outline-none focus:border-[#00D1FF]"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-[#8E99AE] uppercase block mb-1">Telebirr (ETB)</label>
              <input
                type="number"
                step="any"
                value={totalTelebirr}
                onChange={(e) => setTotalTelebirr(e.target.value)}
                placeholder="0"
                className="w-full px-3 py-2 rounded-xl bg-[#0D121D] border border-[#1E2635] text-white focus:outline-none focus:border-[#00D1FF]"
              />
            </div>
          </div>

          {/* Late flag */}
          <div className="pt-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isLate}
                onChange={(e) => setIsLate(e.target.checked)}
                className="rounded border-[#1E2635] text-[#00D1FF] focus:ring-0"
              />
              <span className="text-[#8E99AE]">Mark as Late Submission</span>
            </label>
            {isLate && (
              <input
                type="text"
                value={lateReason}
                onChange={(e) => setLateReason(e.target.value)}
                placeholder="Reason for late submission..."
                className="w-full mt-2 px-3 py-1.5 rounded-lg bg-[#0D121D] border border-[#1E2635] text-white focus:outline-none focus:border-[#FF4D4D]"
              />
            )}
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-[#1E2635]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-[#8E99AE] hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl bg-[#00D1FF] text-[#0D121D] text-xs font-bold hover:bg-[#00D1FF]/90 transition-colors"
            >
              {isSubmitting ? 'Ingesting...' : 'Ingest Sales Record'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
