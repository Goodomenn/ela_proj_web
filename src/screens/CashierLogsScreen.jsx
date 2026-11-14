import React, { useState, useEffect } from 'react';
import { 
  ChevronLeft, 
  FileText, 
  Calendar, 
  User, 
  DollarSign, 
  CheckCircle,
  Clock,
  Plus,
  Calculator
} from 'lucide-react';
import FintechHeader from '../components/FintechHeader';
import { FintechCard, FintechBadge } from '../components/FintechCard';
import { subscribeToCashierReports, formatETB } from '../services/firebaseClient';

export default function CashierLogsScreen({ onBack, onOpenAddCashierSale }) {
  const [reports, setReports] = useState([]);
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    const unsub = subscribeToCashierReports(setReports);
    return () => unsub();
  }, []);

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <FintechHeader
        title="Cashier Daily Logs & Shift Closures"
        subtitle="MANUAL SALES, DRAWER TOTALS & SHORTAGES"
        category="Register Audit"
        showBackButton={true}
        showMenu={false}
        onBack={onBack}
        actions={
          <button
            onClick={onOpenAddCashierSale}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#00D1FF] hover:bg-[#00D1FF]/90 text-[#0D121D] text-xs font-bold transition-colors shadow-lg shadow-[#00D1FF]/20"
          >
            <Plus size={14} />
            <span className="hidden sm:inline">Manual Cashier Entry</span>
          </button>
        }
      />

      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Header Summary */}
        <div className="p-6 rounded-2xl bg-[#161C28] border border-[#1E2635] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Calculator size={16} className="text-[#00D1FF]" />
              <span className="text-[10px] font-bold text-[#00D1FF] tracking-wider uppercase">
                Drawer Audits
              </span>
            </div>
            <h2 className="text-xl font-black text-white">Daily Cashier Drawer Reports</h2>
            <p className="text-xs text-[#8E99AE] mt-0.5">
              Verified daily shift closure records, physical drawer cash counts, and register shortages.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1.5 rounded-xl bg-[#0D121D] border border-[#1E2635] text-xs font-bold text-[#00D1FF]">
              {reports.length} Cashier Reports
            </span>
          </div>
        </div>

        {/* Web Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {reports.length === 0 ? (
            <div className="col-span-full p-12 text-center bg-[#161C28]/50 border border-[#1E2635] rounded-2xl">
              <p className="text-sm text-[#8E99AE]">No cashier reports logged yet in Firestore.</p>
            </div>
          ) : (
            reports.map(rep => {
              const isExpanded = expandedId === rep.id;
              const shortage = Number(rep.dailyShortage || 0);

              return (
                <div key={rep.id} className="p-5 bg-[#161C28] border border-[#1E2635] rounded-2xl space-y-4 hover:border-[#00D1FF]/40 transition-colors flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between pb-3 border-b border-[#1E2635]">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-[#00D1FF]/10 text-[#00D1FF] flex items-center justify-center font-bold text-xs uppercase">
                          {(rep.cashierName || rep.cashierId || 'C').slice(0, 2)}
                        </div>
                        <div>
                          <span className="text-xs font-bold text-white block">
                            {rep.cashierName || rep.cashierId || 'Cashier'}
                          </span>
                          <span className="text-[10px] text-[#8E99AE]">
                            {rep.reportDate ? String(rep.reportDate).split('T')[0] : 'Today'}
                          </span>
                        </div>
                      </div>

                      <FintechBadge 
                        label={rep.status || 'SUBMITTED'} 
                        color={rep.status === 'APPROVED' ? '#00FF94' : '#FFB800'} 
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3 py-3 border-b border-[#1E2635] text-xs">
                      <div className="p-2.5 rounded-xl bg-[#0D121D] border border-[#1E2635]">
                        <span className="text-[10px] text-[#8E99AE] uppercase font-bold block">Money Received</span>
                        <span className="text-sm font-black text-[#00FF94] mt-0.5 block">{formatETB(rep.totalMoneyReceived)}</span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-[#0D121D] border border-[#1E2635]">
                        <span className="text-[10px] text-[#8E99AE] uppercase font-bold block">Drawer Shortage</span>
                        <span className={`text-sm font-black mt-0.5 block ${shortage > 0 ? 'text-[#FF4D4D]' : 'text-white'}`}>
                          {shortage > 0 ? `-${formatETB(shortage)}` : formatETB(0)}
                        </span>
                      </div>
                    </div>

                    <div className="flex justify-between items-center text-xs text-[#8E99AE] pt-2">
                      <span>{rep.totalItemsSold || (rep.sales?.length || 0)} items sold</span>
                      <button
                        onClick={() => setExpandedId(isExpanded ? null : rep.id)}
                        className="text-[#00D1FF] hover:underline font-semibold"
                      >
                        {isExpanded ? 'Hide Details' : 'View Breakdown'}
                      </button>
                    </div>
                  </div>

                  {isExpanded && rep.sales && rep.sales.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-[#1E2635] space-y-1.5">
                      <span className="text-[10px] font-bold text-[#8E99AE] uppercase block mb-1">Itemized Sales Breakdown</span>
                      <div className="max-h-40 overflow-y-auto space-y-1 pr-1">
                        {rep.sales.map((sale, idx) => (
                          <div key={idx} className="flex justify-between items-center p-2 rounded-lg bg-[#0D121D] border border-[#1E2635] text-xs">
                            <span className="text-white font-medium truncate max-w-[150px]">{sale.itemName}</span>
                            <div className="flex items-center gap-2">
                              <span className="text-[#8E99AE]">{sale.quantity}x</span>
                              <span className="text-[#00FF94] font-bold">{formatETB(sale.totalPrice)}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
