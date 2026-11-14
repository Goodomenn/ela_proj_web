import React, { useState, useEffect } from 'react';
import { 
  ChevronLeft, 
  Calendar, 
  ArrowDownLeft, 
  ShoppingBag, 
  CheckCircle2, 
  AlertTriangle 
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
    <div className="flex-1 flex flex-col pb-6">
      <FintechHeader
        title="Daily Breakdown"
        subtitle="SALES VS BANK TRANSFERS"
        showBackButton={true}
        showMenu={false}
        onBack={onBack}
      />

      <div className="px-5 pt-3 space-y-3">
        {days.length === 0 ? (
          <div className="p-8 text-center bg-[#161C28]/50 border border-[#1E2635] rounded-2xl">
            <p className="text-xs text-[#8E99AE]">No daily reconciliation data recorded yet.</p>
          </div>
        ) : (
          days.map(d => {
            const diff = d.bankInbound - d.posSales;
            const isMatch = Math.abs(diff) < 1;

            return (
              <FintechCard key={d.date} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar size={15} className="text-[#00D1FF]" />
                    <span className="text-xs font-bold text-white">{d.date}</span>
                  </div>

                  <FintechBadge 
                    label={isMatch ? 'MATCHED' : diff > 0 ? '+ BANK EXCESS' : '- BANK DEFICIT'} 
                    color={isMatch ? '#00FF94' : diff > 0 ? '#00D1FF' : '#FF4D4D'} 
                  />
                </div>

                <div className="grid grid-cols-3 gap-2 py-2 border-y border-[#1E2635] text-xs">
                  <div>
                    <span className="text-[10px] text-[#8E99AE] uppercase font-bold block">POS Sales</span>
                    <span className="text-white font-semibold">{formatETB(d.posSales, 0)}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#8E99AE] uppercase font-bold block">Bank Inbound</span>
                    <span className="text-white font-semibold">{formatETB(d.bankInbound, 0)}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#8E99AE] uppercase font-bold block">Variance</span>
                    <span className={`font-bold ${diff >= 0 ? 'text-[#00FF94]' : 'text-[#FF4D4D]'}`}>
                      {diff > 0 ? `+${formatETB(diff, 0)}` : formatETB(diff, 0)}
                    </span>
                  </div>
                </div>
              </FintechCard>
            );
          })
        )}
      </div>
    </div>
  );
}
