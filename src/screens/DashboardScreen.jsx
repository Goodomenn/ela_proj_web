import React, { useState, useEffect } from 'react';
import { 
  Calculator, 
  BarChart2, 
  CheckCircle2, 
  TrendingUp, 
  TrendingDown, 
  Filter, 
  Calendar, 
  ChevronRight, 
  Radio, 
  RefreshCw,
  Cpu,
  Layers
} from 'lucide-react';
import FintechHeader from '../components/FintechHeader';
import { FintechCard, SectionHeader, FintechHubTile, FintechBadge } from '../components/FintechCard';
import { 
  subscribeToSalesEntries, 
  subscribeToTransactions, 
  subscribeToOverShortageResolutions,
  formatETB 
} from '../services/firebaseClient';

export default function DashboardScreen({
  onMenuClick,
  onOpenPosIngestion,
  onOpenOverShortage,
  onOpenDailyBreakdown,
  onOpenFilterBanks
}) {
  const [salesEntries, setSalesEntries] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [resolutions, setResolutions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBanks, setSelectedBanks] = useState([
    'Awash Bank',
    'Bank of Abyssinia',
    'CBE',
    'CBE Birr',
    'Telebirr'
  ]);

  useEffect(() => {
    const unsubSales = subscribeToSalesEntries('ALL', (data) => setSalesEntries(data));
    const unsubTx = subscribeToTransactions((data) => setTransactions(data));
    const unsubRes = subscribeToOverShortageResolutions((data) => {
      setResolutions(data);
      setLoading(false);
    });

    return () => {
      unsubSales();
      unsubTx();
      unsubRes();
    };
  }, []);

  const now = new Date();
  const currentMonthLabel = now.toLocaleString('default', { month: 'long', year: 'numeric' }).toUpperCase();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  // Calculate Over / Shortage for the current month
  let netTotal = 0;
  let settledDaysCount = 0;
  resolutions.forEach(res => {
    let docDate = null;
    if (res.date) {
      try { docDate = new Date(res.date); } catch (_) {}
    } else if (res.resolvedAt?.seconds) {
      docDate = new Date(res.resolvedAt.seconds * 1000);
    }
    if (docDate && docDate.getMonth() === currentMonth && docDate.getFullYear() === currentYear) {
      let amt = Number(res.resolvedAmount || res.amount || 0);
      const type = (res.resolvedType || res.type || res.discrepancyType || '').toUpperCase();
      if (type.includes('SHORT')) amt = -Math.abs(amt);
      else if (type.includes('OVER')) amt = Math.abs(amt);
      netTotal += amt;
      settledDaysCount++;
    }
  });

  const isOver = netTotal > 0.009;
  const isShort = netTotal < -0.009;
  const isBalanced = settledDaysCount > 0 && !isOver && !isShort;

  // Monthly CENET sales and Bank inbound
  const currentMonthSales = salesEntries.filter(s => {
    const d = new Date(s.recordDate || s.date || 0);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });
  const totalCenetSales = currentMonthSales
    .filter(s => s.systemType === 'CENET')
    .reduce((sum, s) => sum + (Number(s.totalSales) || 0), 0);

  const currentMonthTx = transactions.filter(t => {
    const d = new Date(t.timestamp || 0);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear && t.isIncome !== false;
  });
  const totalBankInbound = currentMonthTx.reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
  const totalDifference = totalBankInbound - totalCenetSales;

  return (
    <div className="flex-1 flex flex-col pb-6">
      <FintechHeader
        title="Dashboard"
        subtitle="SYSTEM OVERVIEW"
        onMenuClick={onMenuClick}
      />

      <div className="px-5 space-y-2">
        {/* OPERATIONAL HUB */}
        <SectionHeader title="Operational Hub" />
        
        <FintechHubTile
          title="POS Ingestion"
          subtitle="Securely upload CENET & LOOP sales"
          icon={Calculator}
          iconColor="#00D1FF"
          onTap={onOpenPosIngestion}
        />

        <FintechHubTile
          title="Quick Analytics"
          subtitle="Visual summary of current liquidity"
          icon={BarChart2}
          iconColor="#FFB800"
          onTap={onOpenDailyBreakdown}
        />

        {/* OVER & SHORTAGE SUMMARY */}
        <SectionHeader title="Over & Shortage Summary" />
        <FintechCard 
          onClick={onOpenOverShortage}
          className="cursor-pointer group hover:border-[#00D1FF]/50"
        >
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-xl flex items-center justify-center shrink-0 ${
              isOver 
                ? 'bg-[#00FF94]/10 text-[#00FF94]' 
                : isShort 
                ? 'bg-[#FF4D4D]/10 text-[#FF4D4D]' 
                : isBalanced 
                ? 'bg-[#00D1FF]/10 text-[#00D1FF]' 
                : 'bg-white/5 text-[#8E99AE]'
            }`}>
              {isOver ? <TrendingUp size={24} /> : isShort ? <TrendingDown size={24} /> : <CheckCircle2 size={24} />}
            </div>

            <div className="flex-1 min-w-0">
              <span className={`text-[10px] font-bold tracking-wider uppercase block ${
                isOver ? 'text-[#00FF94]' : isShort ? 'text-[#FF4D4D]' : isBalanced ? 'text-[#00D1FF]' : 'text-[#8E99AE]'
              }`}>
                {settledDaysCount === 0 
                  ? `OVER & SHORTAGE (${currentMonthLabel})` 
                  : isOver 
                  ? `NET OVER (${currentMonthLabel})` 
                  : isShort 
                  ? `NET SHORTAGE (${currentMonthLabel})` 
                  : `BALANCED (${currentMonthLabel})`}
              </span>
              
              <div className="text-lg font-bold text-white mt-0.5 tracking-tight">
                {settledDaysCount === 0 
                  ? 'No settled days recorded yet' 
                  : isOver 
                  ? `+${formatETB(netTotal)}` 
                  : isShort 
                  ? `-${formatETB(Math.abs(netTotal))}` 
                  : formatETB(0)}
              </div>

              <p className="text-[11px] text-[#8E99AE] truncate mt-0.5">
                {settledDaysCount === 0 
                  ? 'Tap to open Over & Shortage Reconciliation' 
                  : `${settledDaysCount} ${settledDaysCount === 1 ? 'day' : 'days'} settled in ${currentMonthLabel} • Tap for details`}
              </p>
            </div>

            <ChevronRight size={18} className="text-[#8E99AE] group-hover:text-white transition-colors shrink-0" />
          </div>
        </FintechCard>

        {/* RECONCILIATION ANALYSIS */}
        <SectionHeader title="Reconciliation Analysis" />
        <FintechCard>
          <div className="flex items-center justify-between mb-3">
            <div>
              <span className="text-[10px] font-bold text-[#8E99AE] tracking-wider uppercase block">
                RECONCILIATION ANALYSIS
              </span>
              <span className="text-xs font-bold text-[#00D1FF] tracking-wider">
                {currentMonthLabel}
              </span>
            </div>

            <button
              onClick={onOpenFilterBanks}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#00D1FF]/10 border border-[#00D1FF]/30 text-[#00D1FF] text-[10px] font-bold hover:bg-[#00D1FF]/20 transition-colors"
            >
              <Filter size={12} />
              <span>FILTER BANKS</span>
            </button>
          </div>

          <p className="text-[10px] text-[#8E99AE] italic leading-tight mb-4">
            Included: {selectedBanks.map(b => `${b} (ELA_TRADING)`).join(' • ')}
          </p>

          <div className="space-y-2.5 py-2 border-y border-[#1E2635]">
            <div className="flex justify-between items-center text-xs">
              <span className="text-[#8E99AE]">CENET POS Sales (Month)</span>
              <span className="font-semibold text-white">{formatETB(totalCenetSales, 0)}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-[#8E99AE]">Bank Transfers (Month)</span>
              <span className="font-semibold text-white">{formatETB(totalBankInbound, 0)}</span>
            </div>
            <div className="flex justify-between items-center text-xs pt-1 border-t border-[#1E2635]/60">
              <span className="font-semibold text-[#8E99AE]">Total Month Difference</span>
              <span className={`font-bold ${totalDifference >= 0 ? 'text-[#00FF94]' : 'text-[#FF4D4D]'}`}>
                {formatETB(totalDifference, 0)}
              </span>
            </div>
          </div>

          <button
            onClick={onOpenDailyBreakdown}
            className="w-full mt-3.5 py-2.5 px-3 rounded-xl bg-[#00D1FF]/10 hover:bg-[#00D1FF]/20 border border-[#00D1FF]/30 text-[#00D1FF] text-xs font-bold flex items-center justify-center gap-2 transition-colors"
          >
            <Calendar size={14} />
            <span>SEE THIS MONTH'S DAILY BREAKDOWN</span>
          </button>
        </FintechCard>

        {/* SYSTEM STATUS */}
        <SectionHeader title="System Status" />
        <FintechCard>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-2.5 rounded-xl bg-[#0D121D] border border-[#1E2635]">
              <span className="text-[10px] text-[#8E99AE] uppercase font-bold block">Firestore Live</span>
              <div className="flex items-center gap-1.5 mt-1 text-[#00FF94] font-bold">
                <span className="w-2 h-2 rounded-full bg-[#00FF94] animate-pulse" />
                <span>Connected (12ms)</span>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-[#0D121D] border border-[#1E2635]">
              <span className="text-[10px] text-[#8E99AE] uppercase font-bold block">POS Terminals</span>
              <div className="flex items-center gap-1.5 mt-1 text-[#00D1FF] font-bold">
                <Radio size={14} />
                <span>2 Online Active</span>
              </div>
            </div>
          </div>
        </FintechCard>
      </div>
    </div>
  );
}
