import React, { useState, useEffect } from 'react';
import { 
  ChevronLeft, 
  FileText, 
  Calendar, 
  User, 
  DollarSign, 
  CheckCircle,
  Clock,
  Plus
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
    <div className="flex-1 flex flex-col pb-6">
      <FintechHeader
        title="Cashier Daily Logs"
        subtitle="MANUAL SALES, DRAWER & SHORTAGES"
        showBackButton={true}
        showMenu={false}
        onBack={onBack}
        actions={
          <button
            onClick={onOpenAddCashierSale}
            className="p-2 rounded-xl bg-[#161C28] border border-[#1E2635] text-[#00D1FF] hover:border-[#00D1FF]/50"
            title="Manual Cashier Entry"
          >
            <Plus size={17} />
          </button>
        }
      />

      <div className="px-5 pt-3 space-y-3">
        {reports.length === 0 ? (
          <div className="p-8 text-center bg-[#161C28]/50 border border-[#1E2635] rounded-2xl">
            <p className="text-xs text-[#8E99AE]">No cashier reports logged yet.</p>
          </div>
        ) : (
          reports.map(rep => {
            const isExpanded = expandedId === rep.id;
            const shortage = Number(rep.dailyShortage || 0);

            return (
              <FintechCard key={rep.id} className="space-y-2">
                <div 
                  onClick={() => setExpandedId(isExpanded ? null : rep.id)}
                  className="cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <User size={15} className="text-[#00D1FF]" />
                      <span className="text-xs font-bold text-white">{rep.cashierName || rep.cashierId || 'Cashier'}</span>
                    </div>

                    <FintechBadge 
                      label={rep.status || 'SUBMITTED'} 
                      color={rep.status === 'APPROVED' ? '#00FF94' : '#FFB800'} 
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2 mt-3 pt-2 border-t border-[#1E2635] text-xs">
                    <div>
                      <span className="text-[10px] text-[#8E99AE] uppercase font-bold block">Money Received</span>
                      <span className="text-sm font-bold text-[#00FF94]">{formatETB(rep.totalMoneyReceived)}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-[#8E99AE] uppercase font-bold block">Drawer Shortage</span>
                      <span className={`text-sm font-bold ${shortage > 0 ? 'text-[#FF4D4D]' : 'text-white'}`}>
                        {shortage > 0 ? `-${formatETB(shortage)}` : formatETB(0)}
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-[11px] text-[#8E99AE] pt-2">
                    <div className="flex items-center gap-1.5">
                      <Calendar size={12} />
                      <span>{rep.reportDate ? String(rep.reportDate).split('T')[0] : 'Today'}</span>
                    </div>
                    <span>{rep.totalItemsSold || (rep.sales?.length || 0)} items sold</span>
                  </div>
                </div>

                {isExpanded && rep.sales && rep.sales.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-[#1E2635] space-y-1">
                    <span className="text-[10px] font-bold text-[#8E99AE] uppercase block mb-1">Itemized Sales</span>
                    {rep.sales.map((sale, idx) => (
                      <div key={idx} className="flex justify-between items-center p-2 rounded bg-[#0D121D] border border-[#1E2635] text-xs">
                        <span className="text-white font-medium">{sale.itemName}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-[#8E99AE]">{sale.quantity}x</span>
                          <span className="text-[#00FF94] font-semibold">{formatETB(sale.moneyReceived)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </FintechCard>
            );
          })
        )}
      </div>
    </div>
  );
}
