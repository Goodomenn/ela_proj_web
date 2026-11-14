import React, { useState, useEffect } from 'react';
import { 
  ChevronLeft, 
  Info, 
  CheckCircle2, 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown, 
  Calendar,
  X,
  FileCheck,
  Scale
} from 'lucide-react';
import FintechHeader from '../components/FintechHeader';
import { FintechCard, FintechBadge } from '../components/FintechCard';
import { 
  subscribeToCashierReports, 
  subscribeToSalesEntries, 
  subscribeToOverShortageResolutions,
  formatETB,
  db,
  doc,
  setDoc,
  serverTimestamp
} from '../services/firebaseClient';
import { useAuth } from '../context/AuthContext';

export default function OverShortageScreen({ onBack }) {
  const { user } = useAuth();
  const [cashierReports, setCashierReports] = useState([]);
  const [salesEntries, setSalesEntries] = useState([]);
  const [resolutions, setResolutions] = useState([]);
  const [showRules, setShowRules] = useState(false);
  const [resolvingDate, setResolvingDate] = useState(null);
  const [resolveType, setResolveType] = useState('BALANCED');
  const [resolveAmount, setResolveAmount] = useState('0');
  const [resolveNotes, setResolveNotes] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const unsubC = subscribeToCashierReports(setCashierReports);
    const unsubS = subscribeToSalesEntries('ALL', setSalesEntries);
    const unsubR = subscribeToOverShortageResolutions(setResolutions);
    return () => {
      unsubC();
      unsubS();
      unsubR();
    };
  }, []);

  // Aggregate dates from both salesEntries and cashierReports
  const datesMap = {};

  salesEntries.forEach(s => {
    const dStr = (s.recordDate || s.date || '').split('T')[0];
    if (dStr) {
      if (!datesMap[dStr]) datesMap[dStr] = { date: dStr, posSales: 0, cashierSales: 0 };
      datesMap[dStr].posSales += Number(s.totalSales || 0);
    }
  });

  cashierReports.forEach(c => {
    const dStr = (c.reportDate || c.date || '').split('T')[0];
    if (dStr) {
      if (!datesMap[dStr]) datesMap[dStr] = { date: dStr, posSales: 0, cashierSales: 0 };
      datesMap[dStr].cashierSales += Number(c.totalMoneyReceived || 0);
    }
  });

  // Also include dates already resolved
  resolutions.forEach(r => {
    const dStr = (r.date || r.id || '').split('T')[0];
    if (dStr && !datesMap[dStr]) {
      datesMap[dStr] = { date: dStr, posSales: 0, cashierSales: 0 };
    }
  });

  const sortedDates = Object.values(datesMap).sort((a, b) => new Date(b.date) - new Date(a.date));

  const handleOpenResolve = (item, diff) => {
    setResolvingDate(item.date);
    setResolveAmount(Math.abs(diff).toString());
    setResolveType(diff > 0.01 ? 'OVER' : diff < -0.01 ? 'SHORT' : 'BALANCED');
    setResolveNotes('');
  };

  const handleSaveResolution = async () => {
    if (!resolvingDate) return;
    setSaving(true);
    try {
      if (db) {
        const docRef = doc(db, 'over_shortage_resolutions', resolvingDate);
        await setDoc(docRef, {
          date: resolvingDate,
          resolvedAmount: parseFloat(resolveAmount) || 0,
          resolvedType: resolveType,
          status: 'RESOLVED',
          resolvedBy: user?.username || 'dani',
          notes: resolveNotes,
          resolvedAt: serverTimestamp()
        }, { merge: true });
      }
      setResolvingDate(null);
    } catch (err) {
      alert('Error saving settlement: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <FintechHeader
        title="Over & Shortage Dual-Source Reconciliation"
        subtitle="CASHIER DRAWER TOTALS VS POS INCOME VARIANCE"
        category="Reconciliation Engine"
        showBackButton={true}
        showMenu={false}
        onBack={onBack}
        actions={
          <button
            onClick={() => setShowRules(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#161C28] border border-[#1E2635] text-[#00D1FF] hover:border-[#00D1FF]/50 text-xs font-bold transition-colors"
          >
            <Info size={14} />
            <span className="hidden sm:inline">Calculation Logic</span>
          </button>
        }
      />

      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Banner Card */}
        <div className="p-6 bg-[#161C28] border border-[#1E2635] rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Scale size={16} className="text-[#00D1FF]" />
              <span className="text-[10px] font-bold text-[#00D1FF] tracking-wider uppercase">
                Variance Ledger
              </span>
            </div>
            <h2 className="text-xl font-black text-white">Daily POS vs Cashier Reconciliations</h2>
            <p className="text-xs text-[#8E99AE] mt-0.5 max-w-xl">
              Cross-references daily POS machine sales with actual money received and counted by cashiers.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1.5 rounded-xl bg-[#0D121D] border border-[#1E2635] text-xs font-bold text-[#00FF94]">
              {sortedDates.length} Operating Dates
            </span>
          </div>
        </div>

        {/* Reconciliations Web Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {sortedDates.length === 0 ? (
            <div className="col-span-full p-12 text-center bg-[#161C28]/50 border border-[#1E2635] rounded-2xl">
              <CheckCircle2 size={36} className="mx-auto text-[#00D1FF] mb-3" />
              <h4 className="text-sm font-bold text-white">No Reconciliation Records</h4>
              <p className="text-xs text-[#8E99AE] mt-1">Upload POS sales or log cashier reports to trigger dual-source reconciliation.</p>
            </div>
          ) : (
            sortedDates.map((item) => {
              const resolution = resolutions.find(r => (r.date || r.id) === item.date);
              const isResolved = !!resolution;
              const diff = item.cashierSales - item.posSales;
              const isOver = diff > 0.01;
              const isShort = diff < -0.01;
              const isBalanced = !isOver && !isShort;

              return (
                <div key={item.date} className="p-5 bg-[#161C28] border border-[#1E2635] rounded-2xl space-y-4 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between pb-3 border-b border-[#1E2635]">
                      <div className="flex items-center gap-2">
                        <Calendar size={15} className="text-[#00D1FF]" />
                        <span className="text-xs font-bold text-white">{item.date}</span>
                      </div>

                      <FintechBadge 
                        label={isResolved ? `SETTLED (${resolution.resolvedType || 'RESOLVED'})` : isBalanced ? 'BALANCED' : isOver ? 'OVER' : 'SHORTAGE'}
                        color={isResolved ? '#00FF94' : isBalanced ? '#00D1FF' : isOver ? '#FFB800' : '#FF4D4D'}
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-2 py-3 border-b border-[#1E2635] text-xs">
                      <div className="p-2 rounded-lg bg-[#0D121D] border border-[#1E2635]">
                        <span className="text-[10px] text-[#8E99AE] uppercase font-bold block">POS Total</span>
                        <span className="text-white font-bold mt-0.5 block">{formatETB(item.posSales, 0)}</span>
                      </div>
                      <div className="p-2 rounded-lg bg-[#0D121D] border border-[#1E2635]">
                        <span className="text-[10px] text-[#8E99AE] uppercase font-bold block">Cashier Total</span>
                        <span className="text-white font-bold mt-0.5 block">{formatETB(item.cashierSales, 0)}</span>
                      </div>
                      <div className="p-2 rounded-lg bg-[#0D121D] border border-[#1E2635]">
                        <span className="text-[10px] text-[#8E99AE] uppercase font-bold block">Variance</span>
                        <span className={`font-bold mt-0.5 block ${isOver ? 'text-[#00FF94]' : isShort ? 'text-[#FF4D4D]' : 'text-white'}`}>
                          {diff > 0 ? `+${formatETB(diff, 0)}` : formatETB(diff, 0)}
                        </span>
                      </div>
                    </div>

                    <div className="mt-3 text-xs text-[#8E99AE]">
                      {isResolved ? (
                        <span>Settled by <strong className="text-white">{resolution.resolvedBy || 'Admin'}</strong></span>
                      ) : (
                        <span className="text-[#FFB800]">Pending auditor settlement</span>
                      )}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-[#1E2635]">
                    <button
                      onClick={() => handleOpenResolve(item, diff)}
                      className="w-full py-2.5 px-3 rounded-xl bg-[#00D1FF]/10 hover:bg-[#00D1FF]/20 border border-[#00D1FF]/40 text-[#00D1FF] text-xs font-bold transition-colors"
                    >
                      {isResolved ? 'Edit Settlement' : 'Settle Discrepancy'}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Settlement Modal */}
      {resolvingDate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-[#161C28] border border-[#1E2635] rounded-2xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#1E2635]">
              <h3 className="text-sm font-bold text-white">Settle Day: {resolvingDate}</h3>
              <button onClick={() => setResolvingDate(null)} className="text-[#8E99AE] hover:text-white">
                <X size={18} />
              </button>
            </div>

            <div>
              <label className="text-[10px] font-bold text-[#8E99AE] uppercase block mb-1.5">Settlement Type</label>
              <div className="grid grid-cols-3 gap-2">
                {['BALANCED', 'OVER', 'SHORT'].map(t => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setResolveType(t)}
                    className={`py-2.5 text-xs font-bold rounded-xl border transition-colors ${
                      resolveType === t 
                        ? 'bg-[#00D1FF]/15 border-[#00D1FF] text-[#00D1FF]' 
                        : 'bg-[#0D121D] border-[#1E2635] text-[#8E99AE]'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold text-[#8E99AE] uppercase block mb-1">Settlement Amount (ETB)</label>
              <input
                type="number"
                step="any"
                value={resolveAmount}
                onChange={(e) => setResolveAmount(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#0D121D] border border-[#1E2635] text-white text-xs font-bold focus:outline-none focus:border-[#00D1FF]"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-[#8E99AE] uppercase block mb-1">Audit Notes</label>
              <textarea
                value={resolveNotes}
                onChange={(e) => setResolveNotes(e.target.value)}
                placeholder="Reason for discrepancy adjustment..."
                rows={3}
                className="w-full px-3.5 py-2 rounded-xl bg-[#0D121D] border border-[#1E2635] text-white text-xs focus:outline-none focus:border-[#00D1FF]"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-[#1E2635]">
              <button
                type="button"
                onClick={() => setResolvingDate(null)}
                className="px-4 py-2 rounded-xl bg-[#0D121D] text-[#8E99AE] text-xs font-bold"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={saving}
                onClick={handleSaveResolution}
                className="px-5 py-2 rounded-xl bg-[#00D1FF] text-[#0D121D] text-xs font-bold shadow-lg shadow-[#00D1FF]/20"
              >
                {saving ? 'Saving...' : 'Save Settlement'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rules Modal */}
      {showRules && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#161C28] border border-[#1E2635] rounded-2xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#1E2635]">
              <h3 className="text-sm font-bold text-white">Reconciliation Logic</h3>
              <button onClick={() => setShowRules(false)} className="text-[#8E99AE] hover:text-white">
                <X size={18} />
              </button>
            </div>
            <div className="space-y-3 text-xs text-[#8E99AE] leading-relaxed">
              <p>
                <strong className="text-white block mb-0.5">Dual-Source Math:</strong>
                Variance = (Cashier Total Received) - (POS Register Total Sales).
              </p>
              <p>
                <strong className="text-white block mb-0.5">Over (+):</strong>
                Cashier physically collected more cash/transfers than POS rang up.
              </p>
              <p>
                <strong className="text-white block mb-0.5">Shortage (-):</strong>
                Cash drawer or bank deposits are lower than registered POS totals.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
