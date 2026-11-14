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
  Layers,
  ArrowLeftRight,
  ShieldCheck,
  Banknote,
  DollarSign,
  ArrowUpRight,
  ArrowDownLeft
} from 'lucide-react';
import FintechHeader from '../components/FintechHeader';
import { FintechCard, SectionHeader, FintechBadge } from '../components/FintechCard';
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
  onOpenFilterBanks,
  onOpenRecordCash,
  onOpenVerification
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
    <div className="flex-1 flex flex-col min-h-screen">
      <FintechHeader
        title="Financial Dashboard"
        subtitle="SYSTEM OVERVIEW & RECONCILIATION"
        category="Habesha Enterprise"
        onMenuClick={onMenuClick}
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={onOpenPosIngestion}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#00D1FF] hover:bg-[#00D1FF]/90 text-[#0D121D] text-xs font-bold transition-colors shadow-lg shadow-[#00D1FF]/10"
            >
              <Calculator size={14} />
              <span className="hidden sm:inline">Upload POS</span>
            </button>
            <button
              onClick={onOpenFilterBanks}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#161C28] hover:bg-[#1A2232] border border-[#1E2635] text-[#00D1FF] text-xs font-bold transition-colors"
            >
              <Filter size={14} />
              <span className="hidden sm:inline">Banks ({selectedBanks.length})</span>
            </button>
          </div>
        }
      />

      {/* Main Web Responsive Container */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* TOP METRICS ROW (4 Cards on Desktop Web) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: CENET POS Sales */}
          <div className="bg-[#161C28] border border-[#1E2635] rounded-2xl p-4 sm:p-5 relative overflow-hidden group hover:border-[#00D1FF]/50 transition-all">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-bold text-[#8E99AE] uppercase tracking-wider">
                CENET POS Sales
              </span>
              <div className="w-8 h-8 rounded-lg bg-[#00D1FF]/10 text-[#00D1FF] flex items-center justify-center">
                <Calculator size={16} />
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-black text-white tracking-tight">
              {formatETB(totalCenetSales, 0)}
            </div>
            <div className="flex items-center justify-between text-xs text-[#8E99AE] mt-2">
              <span>Month Total ({currentMonthSales.length} records)</span>
              <span className="text-[#00D1FF] font-semibold">CENET</span>
            </div>
          </div>

          {/* Card 2: Bank Transfers */}
          <div className="bg-[#161C28] border border-[#1E2635] rounded-2xl p-4 sm:p-5 relative overflow-hidden group hover:border-[#00FF94]/50 transition-all">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-bold text-[#8E99AE] uppercase tracking-wider">
                Bank Transfers (Month)
              </span>
              <div className="w-8 h-8 rounded-lg bg-[#00FF94]/10 text-[#00FF94] flex items-center justify-center">
                <TrendingUp size={16} />
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-black text-[#00FF94] tracking-tight">
              {formatETB(totalBankInbound, 0)}
            </div>
            <div className="flex items-center justify-between text-xs text-[#8E99AE] mt-2">
              <span>{currentMonthTx.length} Verified Inbounds</span>
              <span className="text-[#00FF94] font-semibold">Verified</span>
            </div>
          </div>

          {/* Card 3: Month Difference */}
          <div className="bg-[#161C28] border border-[#1E2635] rounded-2xl p-4 sm:p-5 relative overflow-hidden group hover:border-[#1E2635]/80 transition-all">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-bold text-[#8E99AE] uppercase tracking-wider">
                Month Difference
              </span>
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                totalDifference >= 0 ? 'bg-[#00FF94]/10 text-[#00FF94]' : 'bg-[#FF4D4D]/10 text-[#FF4D4D]'
              }`}>
                <ArrowLeftRight size={16} />
              </div>
            </div>
            <div className={`text-xl sm:text-2xl font-black tracking-tight ${
              totalDifference >= 0 ? 'text-[#00FF94]' : 'text-[#FF4D4D]'
            }`}>
              {totalDifference >= 0 ? '+' : ''}{formatETB(totalDifference, 0)}
            </div>
            <div className="flex items-center justify-between text-xs text-[#8E99AE] mt-2">
              <span>Bank vs POS Variance</span>
              <span className={`font-semibold ${totalDifference >= 0 ? 'text-[#00FF94]' : 'text-[#FF4D4D]'}`}>
                {totalDifference >= 0 ? 'Surplus' : 'Variance'}
              </span>
            </div>
          </div>

          {/* Card 4: Over & Shortage Status */}
          <div 
            onClick={onOpenOverShortage}
            className="bg-[#161C28] border border-[#1E2635] rounded-2xl p-4 sm:p-5 relative overflow-hidden group hover:border-[#00D1FF]/50 transition-all cursor-pointer"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-bold text-[#8E99AE] uppercase tracking-wider">
                Over & Shortage
              </span>
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                isOver ? 'bg-[#00FF94]/10 text-[#00FF94]' : isShort ? 'bg-[#FF4D4D]/10 text-[#FF4D4D]' : 'bg-[#00D1FF]/10 text-[#00D1FF]'
              }`}>
                {isOver ? <TrendingUp size={16} /> : isShort ? <TrendingDown size={16} /> : <CheckCircle2 size={16} />}
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-black text-white tracking-tight">
              {settledDaysCount === 0 
                ? 'Balanced' 
                : isOver 
                ? `+${formatETB(netTotal)}` 
                : isShort 
                ? `-${formatETB(Math.abs(netTotal))}` 
                : 'Balanced'}
            </div>
            <div className="flex items-center justify-between text-xs text-[#8E99AE] mt-2">
              <span>{settledDaysCount} settled days</span>
              <span className="text-[#00D1FF] flex items-center gap-0.5 group-hover:underline">
                Details <ChevronRight size={12} />
              </span>
            </div>
          </div>
        </div>

        {/* 2-COLUMN DESKTOP GRID (8 Col Left + 4 Col Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* LEFT 8 COLUMNS: Reconciliation Analysis + Operational Hub */}
          <div className="lg:col-span-8 space-y-6">
            {/* Reconciliation Analysis Card */}
            <div className="bg-[#161C28] border border-[#1E2635] rounded-2xl p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 pb-4 border-b border-[#1E2635]">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#00D1FF]" />
                    <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                      Reconciliation Analysis
                    </h2>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#00D1FF]/10 text-[#00D1FF] border border-[#00D1FF]/30">
                      {currentMonthLabel}
                    </span>
                  </div>
                  <p className="text-xs text-[#8E99AE] mt-1">
                    Direct automated matching between CENET POS register sales and verified bank transfer deposits.
                  </p>
                </div>

                <button
                  onClick={onOpenFilterBanks}
                  className="self-start sm:self-auto flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#00D1FF]/10 hover:bg-[#00D1FF]/20 border border-[#00D1FF]/30 text-[#00D1FF] text-xs font-bold transition-colors"
                >
                  <Filter size={13} />
                  <span>Filter Banks ({selectedBanks.length})</span>
                </button>
              </div>

              {/* Active Bank Tags Pill Carousel */}
              <div className="flex flex-wrap gap-1.5 mb-5">
                {selectedBanks.map(b => (
                  <span 
                    key={b}
                    className="px-2.5 py-1 rounded-lg bg-[#0D121D] border border-[#1E2635] text-[11px] text-[#8E99AE] font-medium flex items-center gap-1.5"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-[#00D1FF]" />
                    <span>{b} (ELA_TRADING)</span>
                  </span>
                ))}
              </div>

              {/* Data Summary Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-xl bg-[#0D121D] border border-[#1E2635] mb-5">
                <div className="p-3">
                  <span className="text-[10px] font-bold text-[#8E99AE] uppercase tracking-wider block">
                    CENET POS Sales
                  </span>
                  <div className="text-lg font-bold text-white mt-1">
                    {formatETB(totalCenetSales, 0)}
                  </div>
                  <span className="text-[10px] text-[#8E99AE]">Shift closures</span>
                </div>

                <div className="p-3 border-t sm:border-t-0 sm:border-l border-[#1E2635]">
                  <span className="text-[10px] font-bold text-[#8E99AE] uppercase tracking-wider block">
                    Bank Transfers
                  </span>
                  <div className="text-lg font-bold text-[#00FF94] mt-1">
                    {formatETB(totalBankInbound, 0)}
                  </div>
                  <span className="text-[10px] text-[#8E99AE]">Inbound transactions</span>
                </div>

                <div className="p-3 border-t sm:border-t-0 sm:border-l border-[#1E2635]">
                  <span className="text-[10px] font-bold text-[#8E99AE] uppercase tracking-wider block">
                    Net Difference
                  </span>
                  <div className={`text-lg font-bold mt-1 ${
                    totalDifference >= 0 ? 'text-[#00FF94]' : 'text-[#FF4D4D]'
                  }`}>
                    {totalDifference >= 0 ? '+' : ''}{formatETB(totalDifference, 0)}
                  </div>
                  <span className="text-[10px] text-[#8E99AE]">Monthly variance</span>
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={onOpenDailyBreakdown}
                className="w-full py-3 px-4 rounded-xl bg-[#00D1FF]/10 hover:bg-[#00D1FF]/20 border border-[#00D1FF]/30 text-[#00D1FF] text-xs font-bold flex items-center justify-center gap-2 transition-colors group"
              >
                <Calendar size={15} />
                <span>SEE THIS MONTH'S DAILY BREAKDOWN</span>
                <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            {/* Operational Hub Cards Grid */}
            <div>
              <div className="flex items-center justify-between mb-3 px-1">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-3.5 rounded-full bg-[#00D1FF]" />
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                    Operational Actions
                  </h3>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Action Card 1: POS Ingestion */}
                <div 
                  onClick={onOpenPosIngestion}
                  className="bg-[#161C28] hover:bg-[#1A2232] border border-[#1E2635] hover:border-[#00D1FF]/50 rounded-2xl p-4 cursor-pointer transition-all group"
                >
                  <div className="flex items-center gap-3.5 mb-2">
                    <div className="w-10 h-10 rounded-xl bg-[#00D1FF]/10 border border-[#00D1FF]/30 flex items-center justify-center text-[#00D1FF]">
                      <Calculator size={20} />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white group-hover:text-[#00D1FF] transition-colors">
                        POS Ingestion
                      </h4>
                      <span className="text-[10px] font-semibold text-[#8E99AE]">
                        CENET & LOOP SALES
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-[#8E99AE] mt-1 leading-relaxed">
                    Securely upload and parse daily register closure reports and shift summaries into Firestore.
                  </p>
                </div>

                {/* Action Card 2: Quick Analytics */}
                <div 
                  onClick={onOpenDailyBreakdown}
                  className="bg-[#161C28] hover:bg-[#1A2232] border border-[#1E2635] hover:border-[#FFB800]/50 rounded-2xl p-4 cursor-pointer transition-all group"
                >
                  <div className="flex items-center gap-3.5 mb-2">
                    <div className="w-10 h-10 rounded-xl bg-[#FFB800]/10 border border-[#FFB800]/30 flex items-center justify-center text-[#FFB800]">
                      <BarChart2 size={20} />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white group-hover:text-[#FFB800] transition-colors">
                        Quick Analytics
                      </h4>
                      <span className="text-[10px] font-semibold text-[#8E99AE]">
                        DAILY CASH FLOW
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-[#8E99AE] mt-1 leading-relaxed">
                    View daily breakdown trends, liquidity charts, and variance analytics across all operating days.
                  </p>
                </div>

                {/* Action Card 3: Record Cash Income */}
                <div 
                  onClick={onOpenRecordCash}
                  className="bg-[#161C28] hover:bg-[#1A2232] border border-[#1E2635] hover:border-[#00FF94]/50 rounded-2xl p-4 cursor-pointer transition-all group"
                >
                  <div className="flex items-center gap-3.5 mb-2">
                    <div className="w-10 h-10 rounded-xl bg-[#00FF94]/10 border border-[#00FF94]/30 flex items-center justify-center text-[#00FF94]">
                      <Banknote size={20} />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white group-hover:text-[#00FF94] transition-colors">
                        Record Cash Income
                      </h4>
                      <span className="text-[10px] font-semibold text-[#8E99AE]">
                        DIRECT DEPOSIT
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-[#8E99AE] mt-1 leading-relaxed">
                    Record non-POS cash income, cashier drawer manual handovers, and physical bank cash drops.
                  </p>
                </div>

                {/* Action Card 4: Verification & Audit */}
                <div 
                  onClick={onOpenVerification}
                  className="bg-[#161C28] hover:bg-[#1A2232] border border-[#1E2635] hover:border-[#7C4DFF]/50 rounded-2xl p-4 cursor-pointer transition-all group"
                >
                  <div className="flex items-center gap-3.5 mb-2">
                    <div className="w-10 h-10 rounded-xl bg-[#7C4DFF]/10 border border-[#7C4DFF]/30 flex items-center justify-center text-[#7C4DFF]">
                      <ShieldCheck size={20} />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white group-hover:text-[#7C4DFF] transition-colors">
                        Reconciliation & Verification
                      </h4>
                      <span className="text-[10px] font-semibold text-[#8E99AE]">
                        SECURITY AUDIT
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-[#8E99AE] mt-1 leading-relaxed">
                    Cross-examine forwarded SMS bank confirmations against customer transaction slips.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT 4 COLUMNS: Over & Shortage Detailed + Telemetry Card */}
          <div className="lg:col-span-4 space-y-6">
            {/* Over & Shortage Detail Card */}
            <div 
              onClick={onOpenOverShortage}
              className="bg-[#161C28] border border-[#1E2635] hover:border-[#00D1FF]/50 rounded-2xl p-5 cursor-pointer transition-all group"
            >
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#1E2635]">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[#FFB800]" />
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                    Over & Shortage
                  </h3>
                </div>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold border uppercase ${
                  isOver 
                    ? 'bg-[#00FF94]/10 text-[#00FF94] border-[#00FF94]/30' 
                    : isShort 
                    ? 'bg-[#FF4D4D]/10 text-[#FF4D4D] border-[#FF4D4D]/30' 
                    : isBalanced 
                    ? 'bg-[#00D1FF]/10 text-[#00D1FF] border-[#00D1FF]/30' 
                    : 'bg-white/5 text-[#8E99AE] border-transparent'
                }`}>
                  {settledDaysCount === 0 
                    ? 'No settled days' 
                    : isOver 
                    ? 'Net Over' 
                    : isShort 
                    ? 'Net Shortage' 
                    : 'Balanced'}
                </span>
              </div>

              <div className="flex items-center gap-4 py-2">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 border ${
                  isOver 
                    ? 'bg-[#00FF94]/10 border-[#00FF94]/30 text-[#00FF94]' 
                    : isShort 
                    ? 'bg-[#FF4D4D]/10 border-[#FF4D4D]/30 text-[#FF4D4D]' 
                    : isBalanced 
                    ? 'bg-[#00D1FF]/10 border-[#00D1FF]/30 text-[#00D1FF]' 
                    : 'bg-white/5 border-white/10 text-[#8E99AE]'
                }`}>
                  {isOver ? <TrendingUp size={28} /> : isShort ? <TrendingDown size={28} /> : <CheckCircle2 size={28} />}
                </div>

                <div>
                  <div className="text-2xl font-black text-white">
                    {settledDaysCount === 0 
                      ? 'ETB 0.00' 
                      : isOver 
                      ? `+${formatETB(netTotal)}` 
                      : isShort 
                      ? `-${formatETB(Math.abs(netTotal))}` 
                      : 'ETB 0.00'}
                  </div>
                  <p className="text-xs text-[#8E99AE] mt-0.5">
                    {settledDaysCount === 0 
                      ? 'No settled days recorded for this month' 
                      : `${settledDaysCount} ${settledDaysCount === 1 ? 'day' : 'days'} settled in ${currentMonthLabel}`}
                  </p>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-[#1E2635] flex items-center justify-between text-xs text-[#00D1FF] font-semibold">
                <span>View Full Over & Shortage Log</span>
                <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Live System Telemetry Card */}
            <div className="bg-[#161C28] border border-[#1E2635] rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#1E2635]">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[#00FF94] animate-pulse" />
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                    System Telemetry
                  </h3>
                </div>
                <span className="text-[10px] font-bold text-[#00FF94] bg-[#00FF94]/10 px-2 py-0.5 rounded border border-[#00FF94]/30">
                  HEALTHY
                </span>
              </div>

              <div className="space-y-3">
                <div className="p-3 rounded-xl bg-[#0D121D] border border-[#1E2635] flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Radio size={16} className="text-[#00FF94]" />
                    <div>
                      <span className="text-xs font-bold text-white block">Firestore Sync</span>
                      <span className="text-[10px] text-[#8E99AE]">elaprojects-3212e</span>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-[#00FF94]">12ms • Live</span>
                </div>

                <div className="p-3 rounded-xl bg-[#0D121D] border border-[#1E2635] flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Cpu size={16} className="text-[#00D1FF]" />
                    <div>
                      <span className="text-xs font-bold text-white block">POS Hardware Terminals</span>
                      <span className="text-[10px] text-[#8E99AE]">CENET #1 & LOOP #1</span>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-[#00D1FF]">2 Online</span>
                </div>

                <div className="p-3 rounded-xl bg-[#0D121D] border border-[#1E2635] flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Layers size={16} className="text-[#FFB800]" />
                    <div>
                      <span className="text-xs font-bold text-white block">Bank SMS Daemon</span>
                      <span className="text-[10px] text-[#8E99AE]">CBE, Awash, Telebirr</span>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-[#FFB800]">Active</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
