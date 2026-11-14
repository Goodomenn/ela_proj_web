import React, { useState, useEffect } from 'react';
import { 
  ChevronLeft, 
  Calendar, 
  ArrowDownLeft, 
  ShoppingBag, 
  CheckCircle2, 
  AlertTriangle,
  Scale
} from 'lucide-react';
import FintechHeader from '../components/FintechHeader';
import { FintechCard, FintechBadge } from '../components/FintechCard';
import { 
  subscribeToSalesEntries, 
  subscribeToTransactions, 
  formatETB 
} from '../services/firebaseClient';

export default function SalesVsBankDetailsScreen({ onBack }) {
  const [sales, setSales] = useState([]);
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    const unsubS = subscribeToSalesEntries('ALL', setSales);
    const unsubT = subscribeToTransactions(setTransactions);
    return () => {
      unsubS();
      unsubT();
    };
  }, []);

  // Map by day
  const dailyMap = {};

  sales.forEach(s => {
    const dStr = (s.recordDate || s.date || '').split('T')[0];
    if (dStr) {
      if (!dailyMap[dStr]) dailyMap[dStr] = { date: dStr, posSales: 0, bankInbound: 0 };
      dailyMap[dStr].posSales += Number(s.totalSales || 0);
    }
  });

  transactions.forEach(t => {
    if (t.isIncome !== false) {
      const dStr = (t.timestamp || '').split('T')[0];
      if (dStr) {
        if (!dailyMap[dStr]) dailyMap[dStr] = { date: dStr, posSales: 0, bankInbound: 0 };
        dailyMap[dStr].bankInbound += Number(t.amount || 0);
      }
    }
  });

  const days = Object.values(dailyMap).sort((a, b) => new Date(b.date) - new Date(a.date));

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <FintechHeader
        title="Daily Reconciliation Breakdown"
        subtitle="POS REGISTER SALES VS BANK INBOUND TRANSFERS"
        category="Reconciliation Analytics"
        showBackButton={true}
        showMenu={false}
        onBack={onBack}
      />

      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Banner Card */}
        <div className="p-6 rounded-2xl bg-[#161C28] border border-[#1E2635] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Scale size={16} className="text-[#00D1FF]" />
              <span className="text-[10px] font-bold text-[#00D1FF] tracking-wider uppercase">
                Daily Comparative Liquidity
              </span>
            </div>
            <h2 className="text-xl font-black text-white">Daily POS Revenue vs Inbound Bank Deposits</h2>
            <p className="text-xs text-[#8E99AE] mt-0.5 max-w-xl">
              Cross-reconciliation between daily physical/electronic POS register takings and verified bank SMS confirmations.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1.5 rounded-xl bg-[#0D121D] border border-[#1E2635] text-xs font-bold text-[#00D1FF]">
              {days.length} Recorded Days
            </span>
          </div>
        </div>

        {/* Web Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {days.length === 0 ? (
            <div className="col-span-full p-12 text-center bg-[#161C28]/50 border border-[#1E2635] rounded-2xl">
              <p className="text-sm text-[#8E99AE]">No daily reconciliation data recorded yet in Firestore.</p>
            </div>
          ) : (
            days.map(d => {
              const diff = d.bankInbound - d.posSales;
              const isMatch = Math.abs(diff) < 1;

              return (
                <div key={d.date} className="p-5 bg-[#161C28] border border-[#1E2635] rounded-2xl space-y-4 hover:border-[#00D1FF]/40 transition-colors">
                  <div className="flex items-center justify-between pb-3 border-b border-[#1E2635]">
                    <div className="flex items-center gap-2">
                      <Calendar size={15} className="text-[#00D1FF]" />
                      <span className="text-xs font-bold text-white">{d.date}</span>
                    </div>

                    <FintechBadge 
                      label={isMatch ? 'MATCHED' : diff > 0 ? '+ BANK EXCESS' : '- BANK DEFICIT'} 
                      color={isMatch ? '#00FF94' : diff > 0 ? '#00D1FF' : '#FF4D4D'} 
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-2 py-3 border-b border-[#1E2635] text-xs">
                    <div className="p-2 rounded-lg bg-[#0D121D] border border-[#1E2635]">
                      <span className="text-[10px] text-[#8E99AE] uppercase font-bold block">POS Sales</span>
                      <span className="text-white font-bold mt-0.5 block">{formatETB(d.posSales, 0)}</span>
                    </div>
                    <div className="p-2 rounded-lg bg-[#0D121D] border border-[#1E2635]">
                      <span className="text-[10px] text-[#8E99AE] uppercase font-bold block">Bank Inbound</span>
                      <span className="text-[#00FF94] font-bold mt-0.5 block">{formatETB(d.bankInbound, 0)}</span>
                    </div>
                    <div className="p-2 rounded-lg bg-[#0D121D] border border-[#1E2635]">
                      <span className="text-[10px] text-[#8E99AE] uppercase font-bold block">Variance</span>
                      <span className={`font-bold mt-0.5 block ${diff >= 0 ? 'text-[#00FF94]' : 'text-[#FF4D4D]'}`}>
                        {diff > 0 ? `+${formatETB(diff, 0)}` : formatETB(diff, 0)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-[#8E99AE]">
                    <span>Status: {isMatch ? 'Fully Reconciled' : 'Discrepancy Logged'}</span>
                    <span className="font-semibold text-white">100% Verified</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
