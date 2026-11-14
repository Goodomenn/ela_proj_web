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
  CheckCircle2,
  FileSpreadsheet,
  Download
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
    <div className="flex-1 flex flex-col min-h-screen">
      <FintechHeader
        title="Admin Audit & Sales Log"
        subtitle="HABESHA ENTERPRISE • ALL POS CHANNELS"
        category="Audit Intelligence"
        showBackButton={true}
        showMenu={false}
        onBack={onBack}
        actions={
          <span className="px-3 py-1.5 rounded-xl text-xs font-bold bg-[#00BFA5]/15 text-[#00BFA5] border border-[#00BFA5]/30">
            {filteredEntries.length} Records Found
          </span>
        }
      />

      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Navigation & Filters Toolbar */}
        <div className="p-4 bg-[#161C28] border border-[#1E2635] rounded-2xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            {/* Main Tabs: Summarized Log vs Sold Items */}
            <div className="flex gap-2 bg-[#0D121D] p-1 rounded-xl border border-[#1E2635]">
              <button
                onClick={() => setMainTab(0)}
                className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
                  mainTab === 0
                    ? 'bg-[#00BFA5] text-[#0D121D]'
                    : 'text-[#8E99AE] hover:text-white'
                }`}
              >
                Summarized Log
              </button>
              <button
                onClick={() => setMainTab(1)}
                className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
                  mainTab === 1
                    ? 'bg-[#00BFA5] text-[#0D121D]'
                    : 'text-[#8E99AE] hover:text-white'
                }`}
              >
                Sold Items Breakdown
              </button>
            </div>

            {/* If Sold Items: Toggle CENET / LOOP */}
            {mainTab === 1 && (
              <div className="flex gap-1.5 bg-[#0D121D] p-1 rounded-xl border border-[#1E2635]">
                {['CENET', 'LOOP'].map(pos => (
                  <button
                    key={pos}
                    onClick={() => setPosTab(pos)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      posTab === pos
                        ? 'bg-[#00D1FF] text-[#0D121D]'
                        : 'text-[#8E99AE] hover:text-white'
                    }`}
                  >
                    {pos} Channel
                  </button>
                ))}
              </div>
            )}

            {/* Search Input */}
            <div className="relative min-w-[260px]">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8E99AE]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search device, system, date..."
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#0D121D] border border-[#1E2635] text-white placeholder-[#8E99AE] text-xs focus:outline-none focus:border-[#00BFA5] transition-colors"
              />
            </div>
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[#1E2635]">
            <span className="text-[10px] font-bold text-[#8E99AE] uppercase mr-1">Filter By:</span>
            {['ALL', 'LATE', 'CENET', 'LOOP'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold tracking-wider transition-colors ${
                  filter === f
                    ? 'bg-[#00D1FF]/20 text-[#00D1FF] border border-[#00D1FF]/50'
                    : 'bg-[#0D121D] text-[#8E99AE] border border-[#1E2635] hover:text-white'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Entries Grid on Desktop */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredEntries.length === 0 ? (
            <div className="col-span-full p-12 text-center bg-[#161C28]/50 border border-[#1E2635] rounded-2xl">
              <p className="text-sm text-[#8E99AE]">No sales entries found in Firestore matching this filter.</p>
            </div>
          ) : (
            filteredEntries.map(entry => {
              const isLate = !!entry.isLateSubmission;
              const items = entry.items || [];
              const dateStr = entry.recordDate || entry.date || 'Unknown Date';
              const isSelected = selectedEntry?.id === entry.id;

              return (
                <div
                  key={entry.id}
                  onClick={() => setSelectedEntry(isSelected ? null : entry)}
                  className={`p-5 bg-[#161C28] border rounded-2xl cursor-pointer transition-all duration-150 flex flex-col justify-between ${
                    isSelected 
                      ? 'border-[#00BFA5] shadow-[0_0_20px_rgba(0,191,165,0.15)]' 
                      : 'border-[#1E2635] hover:border-[#00BFA5]/50'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <div className="flex items-center gap-2">
                        <span className={`px-2.5 py-1 rounded-lg text-xs font-bold tracking-wider ${
                          entry.systemType === 'CENET' 
                            ? 'bg-purple-500/15 text-purple-400 border border-purple-500/30' 
                            : 'bg-teal-500/15 text-teal-400 border border-teal-500/30'
                        }`}>
                          {entry.systemType}
                        </span>
                        <span className="text-xs font-bold text-white truncate max-w-[130px]">
                          {entry.deviceName || 'Primary Counter'}
                        </span>
                      </div>

                      <span className="text-base font-black text-[#00FF94]">
                        {formatETB(entry.totalSales)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs text-[#8E99AE] py-1.5 border-y border-[#1E2635]">
                      <div className="flex items-center gap-1.5">
                        <Calendar size={13} className="text-[#00D1FF]" />
                        <span>{dateStr}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <ShoppingBag size={13} className="text-[#FFB800]" />
                        <span>{entry.totalItemsSold || items.length} items</span>
                      </div>
                    </div>

                    {/* Channel Breakdown */}
                    <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
                      <div className="p-2 rounded-lg bg-[#0D121D] border border-[#1E2635]">
                        <span className="text-[#8E99AE] block text-[9px] uppercase font-bold">Cash</span>
                        <span className="text-white font-bold">{formatETB(entry.totalCash || 0, 0)}</span>
                      </div>
                      <div className="p-2 rounded-lg bg-[#0D121D] border border-[#1E2635]">
                        <span className="text-[#8E99AE] block text-[9px] uppercase font-bold">CBE</span>
                        <span className="text-white font-bold">{formatETB(entry.totalCbe || 0, 0)}</span>
                      </div>
                      <div className="p-2 rounded-lg bg-[#0D121D] border border-[#1E2635]">
                        <span className="text-[#8E99AE] block text-[9px] uppercase font-bold">Telebirr</span>
                        <span className="text-white font-bold">{formatETB(entry.totalTelebirr || 0, 0)}</span>
                      </div>
                    </div>

                    {isLate && (
                      <div className="mt-3 p-2 rounded-lg bg-[#FF4D4D]/10 border border-[#FF4D4D]/30 flex items-center gap-2 text-xs text-[#FF4D4D]">
                        <AlertCircle size={14} className="shrink-0" />
                        <span className="truncate">Late: {entry.lateReason || 'Submitted after deadline'}</span>
                      </div>
                    )}
                  </div>

                  {/* Expanded Item Breakdown */}
                  {isSelected && items.length > 0 && (
                    <div className="mt-4 pt-3 border-t border-[#1E2635] space-y-2">
                      <span className="text-[10px] font-bold text-[#8E99AE] tracking-wider uppercase block">
                        Detailed Sold Items ({items.length})
                      </span>
                      <div className="max-h-48 overflow-y-auto space-y-1 pr-1">
                        {items.map((item, idx) => (
                          <div key={idx} className="flex justify-between items-center p-2 rounded-lg bg-[#0D121D] border border-[#1E2635] text-xs">
                            <span className="text-white font-medium truncate max-w-[180px]">{item.name || item.code}</span>
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
    </div>
  );
}
