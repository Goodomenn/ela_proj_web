import React, { useState, useEffect } from 'react';
import { 
  ChevronLeft, 
  Search, 
  AlertCircle, 
  Calendar, 
  ShoppingBag, 
  Clock, 
  ChevronRight,
  Filter,
  CheckCircle2
} from 'lucide-react';
import FintechHeader from '../components/FintechHeader';
import { FintechCard, FintechBadge } from '../components/FintechCard';
import { subscribeToSalesEntries, formatETB } from '../services/firebaseClient';

export default function LogReportScreen({ onBack }) {
  const [mainTab, setMainTab] = useState(0); // 0: Summarized Log, 1: Sold Items
  const [posTab, setPosTab] = useState('CENET'); // 'CENET' or 'LOOP'
  const [filter, setFilter] = useState('ALL'); // 'ALL', 'LATE', 'CENET', 'LOOP'
  const [searchQuery, setSearchQuery] = useState('');
  const [salesEntries, setSalesEntries] = useState([]);
  const [selectedEntry, setSelectedEntry] = useState(null);

  useEffect(() => {
    const unsub = subscribeToSalesEntries('ALL', (entries) => {
      setSalesEntries(entries);
    });
    return () => unsub();
  }, []);

  const filteredEntries = salesEntries.filter(entry => {
    // POS Tab filter for Sold Items
    if (mainTab === 1 && entry.systemType !== posTab) return false;

    // Filter pill
    if (filter === 'LATE' && !entry.isLateSubmission) return false;
    if (filter === 'CENET' && entry.systemType !== 'CENET') return false;
    if (filter === 'LOOP' && entry.systemType !== 'LOOP') return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const dev = (entry.deviceName || '').toLowerCase();
      const sys = (entry.systemType || '').toLowerCase();
      const date = (entry.recordDate || '').toLowerCase();
      return dev.includes(q) || sys.includes(q) || date.includes(q);
    }
    return true;
  });

  return (
    <div className="flex-1 flex flex-col pb-6">
      <FintechHeader
        title="Admin Audit Log"
        subtitle="HABESHA ENTERPRISE • ALL DATA"
        showBackButton={true}
        showMenu={false}
        onBack={onBack}
        actions={
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#00BFA5]/15 text-[#00BFA5] border border-[#00BFA5]/30">
            ALL CHANNELS
          </span>
        }
      />

      {/* Main Tabs: Summarized Log vs Sold Items */}
      <div className="px-5 pt-3 pb-2 flex gap-2">
        <button
          onClick={() => setMainTab(0)}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
            mainTab === 0
              ? 'bg-[#00BFA5] text-[#0D121D]'
              : 'bg-[#161C28] text-[#8E99AE] hover:text-white border border-[#1E2635]'
          }`}
        >
          Summarized Log
        </button>

        <button
          onClick={() => setMainTab(1)}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
            mainTab === 1
              ? 'bg-[#00BFA5] text-[#0D121D]'
              : 'bg-[#161C28] text-[#8E99AE] hover:text-white border border-[#1E2635]'
          }`}
        >
          Sold Items
        </button>
      </div>

      {/* If Sold Items: Toggle CENET / LOOP */}
      {mainTab === 1 && (
        <div className="px-5 pb-2 flex gap-2">
          {['CENET', 'LOOP'].map(pos => (
            <button
              key={pos}
              onClick={() => setPosTab(pos)}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                posTab === pos
                  ? 'bg-[#00D1FF] text-[#0D121D]'
                  : 'bg-[#0D121D] text-[#8E99AE] border border-[#1E2635]'
              }`}
            >
              {pos} Channel
            </button>
          ))}
        </div>
      )}

      {/* Filter Chips & Search Bar */}
      <div className="px-5 pt-2 pb-3 space-y-2">
        <div className="flex gap-1.5 overflow-x-auto no-scrollbar py-0.5">
          {['ALL', 'LATE', 'CENET', 'LOOP'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold tracking-wider uppercase transition-colors shrink-0 ${
                filter === f
                  ? 'bg-[#00D1FF]/20 text-[#00D1FF] border border-[#00D1FF]/50'
                  : 'bg-[#161C28] text-[#8E99AE] border border-[#1E2635] hover:text-white'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        <div className="relative">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8E99AE]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by device, system, date..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#161C28] border border-[#1E2635] text-white placeholder-[#8E99AE] text-xs focus:outline-none focus:border-[#00BFA5]"
          />
        </div>
      </div>

      {/* Entries List */}
      <div className="px-5 space-y-3">
        {filteredEntries.length === 0 ? (
          <div className="p-8 text-center bg-[#161C28]/50 border border-[#1E2635] rounded-2xl">
            <p className="text-xs text-[#8E99AE]">No sales entries found in Firestore matching this filter.</p>
          </div>
        ) : (
          filteredEntries.map(entry => {
            const isLate = !!entry.isLateSubmission;
            const items = entry.items || [];
            const dateStr = entry.recordDate || entry.date || 'Unknown Date';

            return (
              <div
                key={entry.id}
                onClick={() => setSelectedEntry(selectedEntry?.id === entry.id ? null : entry)}
                className="p-4 bg-[#161C28] border border-[#1E2635] rounded-2xl cursor-pointer hover:border-[#00BFA5]/50 transition-all duration-150"
              >
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wider ${
                      entry.systemType === 'CENET' 
                        ? 'bg-purple-500/15 text-purple-400 border border-purple-500/30' 
                        : 'bg-teal-500/15 text-teal-400 border border-teal-500/30'
                    }`}>
                      {entry.systemType}
                    </span>
                    <span className="text-xs font-bold text-white">
                      {entry.deviceName || 'Primary Counter'}
                    </span>
                  </div>

                  <span className="text-sm font-bold text-[#00FF94]">
                    {formatETB(entry.totalSales)}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs text-[#8E99AE] pt-1">
                  <div className="flex items-center gap-1.5">
                    <Calendar size={13} />
                    <span>{dateStr}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <ShoppingBag size={13} />
                    <span>{entry.totalItemsSold || items.length} items</span>
                  </div>
                </div>

                {/* Bank / Cash mini breakdown */}
                <div className="mt-2.5 pt-2 border-t border-[#1E2635] grid grid-cols-3 gap-2 text-[11px]">
                  <div>
                    <span className="text-[#8E99AE] block text-[9px] uppercase font-bold">Cash</span>
                    <span className="text-white font-medium">{formatETB(entry.totalCash || 0, 0)}</span>
                  </div>
                  <div>
                    <span className="text-[#8E99AE] block text-[9px] uppercase font-bold">CBE</span>
                    <span className="text-white font-medium">{formatETB(entry.totalCbe || 0, 0)}</span>
                  </div>
                  <div>
                    <span className="text-[#8E99AE] block text-[9px] uppercase font-bold">Telebirr</span>
                    <span className="text-white font-medium">{formatETB(entry.totalTelebirr || 0, 0)}</span>
                  </div>
                </div>

                {isLate && (
                  <div className="mt-2.5 p-2 rounded-lg bg-[#FF4D4D]/10 border border-[#FF4D4D]/30 flex items-center gap-2 text-xs text-[#FF4D4D]">
                    <AlertCircle size={14} className="shrink-0" />
                    <span className="truncate">Late: {entry.lateReason || 'Submitted after deadline'}</span>
                  </div>
                )}

                {/* Expanded Item Breakdown */}
                {selectedEntry?.id === entry.id && items.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-[#1E2635] space-y-1.5">
                    <span className="text-[10px] font-bold text-[#8E99AE] tracking-wider uppercase block mb-1">
                      Detailed Sold Items ({items.length})
                    </span>
                    <div className="max-h-48 overflow-y-auto space-y-1 pr-1">
                      {items.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center p-1.5 rounded bg-[#0D121D] border border-[#1E2635] text-[11px]">
                          <span className="text-white font-medium truncate max-w-[200px]">{item.name || item.code}</span>
                          <div className="flex items-center gap-3 shrink-0">
                            <span className="text-[#8E99AE]">{item.quantity}x</span>
                            <span className="text-[#00FF94] font-semibold">{formatETB(item.totalAmount)}</span>
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
  );
}
