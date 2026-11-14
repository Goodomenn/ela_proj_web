import React, { useState, useEffect, useRef } from 'react';
import { 
  RefreshCw, 
  Banknote, 
  ShieldCheck, 
  Search, 
  ArrowUpRight, 
  ArrowDownLeft, 
  ChevronDown, 
  ChevronRight, 
  Building2, 
  User, 
  CheckCircle,
  Clock,
  Plus,
  Filter,
  Copy,
  Check,
  Calendar,
  Layers,
  Loader2
} from 'lucide-react';
import FintechHeader from '../components/FintechHeader';
import { FintechBadge } from '../components/FintechCard';
import { 
  fetchInitialTransactions, 
  fetchMoreTransactions, 
  formatETB 
} from '../services/firebaseClient';

const PROFILES = [
  { id: 'filly', name: 'filly', banks: ['Awash Bank', 'CBE'], count: 2, active: true },
  { id: 'dann', name: 'dann', banks: ['CBE'], count: 1, active: true },
  { id: 'dani', name: 'dani', banks: ['CBE', 'Awash Bank'], count: 2, active: true },
  { id: 'ela_trading', name: 'ela_trading', banks: ['Awash Bank', 'Bank of Abyssinia', 'CBE', 'CBE Birr', 'Telebirr'], count: 5, active: true },
  { id: 'danni', name: 'danni', banks: ['CBE', 'Telebirr'], count: 2, active: true },
];

const BANK_FILTERS = ['ALL', 'Awash Bank', 'CBE', 'Telebirr', 'Bank of Abyssinia', 'CBE Birr'];

export default function TransactionHistoryScreen({
  onMenuClick,
  onOpenRecordCash,
  onOpenVerification
}) {
  const [activeTab, setActiveTab] = useState(0); // 0: Transactions Feed, 1: By Profile / Bank
  const [transactions, setTransactions] = useState([]);
  const [lastDoc, setLastDoc] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingInitial, setIsLoadingInitial] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isTodayOnly, setIsTodayOnly] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBankFilter, setSelectedBankFilter] = useState('ALL');
  const [selectedDirection, setSelectedDirection] = useState('ALL'); // 'ALL', 'IN', 'OUT'
  const [isSyncing, setIsSyncing] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [copiedRef, setCopiedRef] = useState(null);

  const sentinelRef = useRef(null);

  // Initial Data Load (Current Date's transactions, or latest 20 fallback)
  const loadInitialData = async () => {
    setIsLoadingInitial(true);
    try {
      const res = await fetchInitialTransactions();
      setTransactions(res.transactions);
      setLastDoc(res.lastDoc);
      setHasMore(res.hasMore);
      setIsTodayOnly(res.isTodayOnly);
    } catch (err) {
      console.error('Failed to load initial transactions:', err);
    } finally {
      setIsLoadingInitial(false);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  // Pagination Handler: loads next 20 items
  const handleLoadMore = async () => {
    if (!lastDoc || isLoadingMore || !hasMore) return;
    setIsLoadingMore(true);
    try {
      const res = await fetchMoreTransactions(lastDoc, 20);
      if (res.transactions.length > 0) {
        setTransactions(prev => {
          const existingIds = new Set(prev.map(t => t.id));
          const uniqueNew = res.transactions.filter(t => !existingIds.has(t.id));
          return [...prev, ...uniqueNew];
        });
        setLastDoc(res.lastDoc);
        setHasMore(res.hasMore);
      } else {
        setHasMore(false);
      }
    } catch (err) {
      console.error('Failed to load more transactions:', err);
    } finally {
      setIsLoadingMore(false);
    }
  };

  // Scroll Trigger via IntersectionObserver
  useEffect(() => {
    if (!sentinelRef.current || !hasMore || isLoadingMore || isLoadingInitial) return;

    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        handleLoadMore();
      }
    }, {
      rootMargin: '200px'
    });

    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [sentinelRef.current, hasMore, isLoadingMore, isLoadingInitial, lastDoc]);

  const handleSyncSms = async () => {
    setIsSyncing(true);
    await loadInitialData();
    setIsSyncing(false);
  };

  const handleCopy = (ref) => {
    if (!ref) return;
    navigator.clipboard?.writeText(ref);
    setCopiedRef(ref);
    setTimeout(() => setCopiedRef(null), 2000);
  };

  const filteredTransactions = transactions.filter(t => {
    // Bank filter
    if (selectedBankFilter !== 'ALL' && (t.bankName || '').toUpperCase() !== selectedBankFilter.toUpperCase()) {
      return false;
    }

    // Direction filter
    const isIncome = t.isIncome !== false;
    if (selectedDirection === 'IN' && !isIncome) return false;
    if (selectedDirection === 'OUT' && isIncome) return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const bank = (t.bankName || '').toLowerCase();
      const sender = (t.sender || '').toLowerCase();
      const ref = (t.referenceCode || '').toLowerCase();
      const forwarder = (t.forwardedBy || '').toLowerCase();
      return bank.includes(q) || sender.includes(q) || ref.includes(q) || forwarder.includes(q);
    }
    return true;
  });

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <FintechHeader
        title="Transaction History & Ledger"
        subtitle="FORWARDED SMS & BANK LEDGER"
        category="Habesha Enterprise"
        onMenuClick={onMenuClick}
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={handleSyncSms}
              title="Refresh and sync transactions"
              disabled={isSyncing}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#161C28] hover:bg-[#1A2232] border border-[#1E2635] text-[#00D1FF] text-xs font-bold transition-colors"
            >
              <RefreshCw size={14} className={isSyncing ? 'animate-spin' : ''} />
              <span className="hidden sm:inline">Refresh Data</span>
            </button>
            <button
              onClick={onOpenRecordCash}
              title="Record Cash Income"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#00FF94]/15 hover:bg-[#00FF94]/25 border border-[#00FF94]/40 text-[#00FF94] text-xs font-bold transition-colors"
            >
              <Banknote size={14} />
              <span className="hidden sm:inline">Record Cash</span>
            </button>
            <button
              onClick={onOpenVerification}
              title="Reconciliation & Verification"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#161C28] hover:bg-[#1A2232] border border-[#1E2635] text-white text-xs font-bold transition-colors"
            >
              <ShieldCheck size={14} className="text-[#FFB800]" />
              <span className="hidden sm:inline">Audit</span>
            </button>
          </div>
        }
      />

      {/* Main Container */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Navigation Tabs Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-2 bg-[#161C28] border border-[#1E2635] rounded-2xl">
          <div className="flex items-center gap-2">
            <button
              onClick={() => { setActiveTab(0); setSelectedProfile(null); }}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
                activeTab === 0
                  ? 'bg-[#00D1FF] text-[#0D121D] shadow-md shadow-[#00D1FF]/20'
                  : 'text-[#8E99AE] hover:text-white hover:bg-[#1E2635]'
              }`}
            >
              <Building2 size={15} />
              <span>
                Transactions Ledger ({transactions.length} loaded)
              </span>
            </button>

            <button
              onClick={() => setActiveTab(1)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
                activeTab === 1
                  ? 'bg-[#00D1FF] text-[#0D121D] shadow-md shadow-[#00D1FF]/20'
                  : 'text-[#8E99AE] hover:text-white hover:bg-[#1E2635]'
              }`}
            >
              <User size={15} />
              <span>Profiles & Bank Accounts ({PROFILES.length})</span>
            </button>
          </div>

          {/* Quick Search */}
          <div className="relative min-w-[280px]">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8E99AE]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search reference, bank, sender, forwarder..."
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#0D121D] border border-[#1E2635] text-white placeholder-[#8E99AE] text-xs focus:outline-none focus:border-[#00D1FF] transition-colors"
            />
          </div>
        </div>

        {/* Tab 0: Transactions Table View */}
        {activeTab === 0 && (
          <div className="space-y-4">
            {/* Filter Pills Bar & Sync Notice */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-[#161C28]/40 p-3 rounded-2xl border border-[#1E2635]">
              {/* Bank Filter Chips */}
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[10px] font-bold text-[#8E99AE] uppercase mr-1">Bank:</span>
                {BANK_FILTERS.map((b) => (
                  <button
                    key={b}
                    onClick={() => setSelectedBankFilter(b)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                      selectedBankFilter === b
                        ? 'bg-[#00D1FF]/20 border border-[#00D1FF]/50 text-[#00D1FF]'
                        : 'bg-[#0D121D] border border-[#1E2635] text-[#8E99AE] hover:text-white'
                    }`}
                  >
                    {b}
                  </button>
                ))}
              </div>

              {/* Direction Filter & Fast Loading Indicator */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-bold text-[#8E99AE] uppercase mr-1">Type:</span>
                  {[
                    { id: 'ALL', label: 'All' },
                    { id: 'IN', label: '+ Inbound' },
                    { id: 'OUT', label: '- Outbound' },
                  ].map((d) => (
                    <button
                      key={d.id}
                      onClick={() => setSelectedDirection(d.id)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                        selectedDirection === d.id
                          ? 'bg-[#00FF94]/20 border border-[#00FF94]/50 text-[#00FF94]'
                          : 'bg-[#0D121D] border border-[#1E2635] text-[#8E99AE] hover:text-white'
                      }`}
                    >
                      {d.label}
                    </button>
                  ))}
                </div>

                <span className="px-2.5 py-1 rounded-lg bg-[#00D1FF]/10 border border-[#00D1FF]/30 text-[#00D1FF] text-[10px] font-bold uppercase tracking-wider hidden md:inline-flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00D1FF] animate-pulse" />
                  {isTodayOnly ? "Today's Ledger Active" : "Fast Paginated Stream"}
                </span>
              </div>
            </div>

            {/* Desktop Web Data Table */}
            <div className="bg-[#161C28] border border-[#1E2635] rounded-2xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-[#0D121D] border-b border-[#1E2635] text-[#8E99AE] uppercase text-[10px] font-bold tracking-wider">
                      <th className="py-3.5 px-4">Direction</th>
                      <th className="py-3.5 px-4">Bank / Channel</th>
                      <th className="py-3.5 px-4">Reference Code</th>
                      <th className="py-3.5 px-4">Sender / Counterparty</th>
                      <th className="py-3.5 px-4">Forwarded By</th>
                      <th className="py-3.5 px-4">Date & Time</th>
                      <th className="py-3.5 px-4 text-right">Amount (ETB)</th>
                      <th className="py-3.5 px-4 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1E2635]/60">
                    {isLoadingInitial ? (
                      <tr>
                        <td colSpan={8} className="py-16 text-center text-[#8E99AE]">
                          <div className="flex flex-col items-center justify-center gap-2">
                            <Loader2 size={24} className="animate-spin text-[#00D1FF]" />
                            <span className="text-xs">Loading current date transactions...</span>
                          </div>
                        </td>
                      </tr>
                    ) : filteredTransactions.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="py-12 text-center text-[#8E99AE]">
                          No bank transactions found matching filter criteria.
                        </td>
                      </tr>
                    ) : (
                      filteredTransactions.map((tx) => {
                        const isIncome = tx.isIncome !== false;
                        const isExpanded = expandedId === tx.id;
                        const dateFormatted = tx.dateObj 
                          ? tx.dateObj.toLocaleString('en-US', { 
                              month: 'short', 
                              day: 'numeric', 
                              year: 'numeric', 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })
                          : (tx.timestamp ? new Date(tx.timestamp).toLocaleString() : 'Recent');

                        return (
                          <React.Fragment key={tx.id}>
                            <tr 
                              onClick={() => setExpandedId(isExpanded ? null : tx.id)}
                              className="hover:bg-[#1A2232] cursor-pointer transition-colors group"
                            >
                              {/* Direction */}
                              <td className="py-3.5 px-4">
                                <div className="flex items-center gap-2">
                                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                                    isIncome 
                                      ? 'bg-[#00FF94]/10 text-[#00FF94]' 
                                      : 'bg-[#FF4D4D]/10 text-[#FF4D4D]'
                                  }`}>
                                    {isIncome ? <ArrowDownLeft size={16} /> : <ArrowUpRight size={16} />}
                                  </div>
                                  <span className={`font-bold text-[11px] ${
                                    isIncome ? 'text-[#00FF94]' : 'text-[#FF4D4D]'
                                  }`}>
                                    {isIncome ? 'IN' : 'OUT'}
                                  </span>
                                </div>
                              </td>

                              {/* Bank Name */}
                              <td className="py-3.5 px-4 font-bold text-white">
                                <span className="px-2.5 py-1 rounded bg-[#0D121D] border border-[#1E2635] text-[11px]">
                                  {tx.bankName || 'Bank Transfer'}
                                </span>
                              </td>

                              {/* Reference Code */}
                              <td className="py-3.5 px-4 font-mono text-[#00D1FF]">
                                <div className="flex items-center gap-1.5">
                                  <span>{tx.referenceCode || 'N/A'}</span>
                                  {tx.referenceCode && tx.referenceCode !== 'N/A' && (
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleCopy(tx.referenceCode);
                                      }}
                                      className="text-[#8E99AE] hover:text-white"
                                      title="Copy reference code"
                                    >
                                      {copiedRef === tx.referenceCode ? (
                                        <Check size={12} className="text-[#00FF94]" />
                                      ) : (
                                        <Copy size={12} />
                                      )}
                                    </button>
                                  )}
                                </div>
                              </td>

                              {/* Sender */}
                              <td className="py-3.5 px-4 text-[#8E99AE] max-w-[220px] truncate font-medium text-white/90">
                                {tx.sender || 'Direct Deposit'}
                              </td>

                              {/* Forwarder Profile */}
                              <td className="py-3.5 px-4 text-[#8E99AE]">
                                <span className="px-2 py-0.5 rounded bg-[#0D121D] border border-[#1E2635] text-[10px] font-semibold text-[#00D1FF]">
                                  {tx.forwardedBy || 'system'}
                                </span>
                              </td>

                              {/* Date & Time */}
                              <td className="py-3.5 px-4 text-[#8E99AE] text-[11px] whitespace-nowrap">
                                {dateFormatted}
                              </td>

                              {/* Amount */}
                              <td className={`py-3.5 px-4 text-right font-black text-sm tracking-tight whitespace-nowrap ${
                                isIncome ? 'text-[#00FF94]' : 'text-[#FF4D4D]'
                              }`}>
                                {isIncome ? `+ ${formatETB(tx.amount)}` : `- ${formatETB(tx.amount)}`}
                              </td>

                              {/* Status Badge */}
                              <td className="py-3.5 px-4 text-center">
                                <FintechBadge
                                  label={tx.isReconciled ? 'RECONCILED' : 'VERIFIED'}
                                  color={tx.isReconciled ? '#00FF94' : '#00D1FF'}
                                />
                              </td>
                            </tr>

                            {/* Expandable Raw Message Sub-row */}
                            {isExpanded && (
                              <tr className="bg-[#0D121D]">
                                <td colSpan={8} className="py-4 px-6 border-y border-[#1E2635]">
                                  <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                      <span className="text-[10px] font-bold text-[#00D1FF] uppercase tracking-wider">
                                        Raw SMS Telemetry Payload
                                      </span>
                                      <span className="text-[10px] text-[#8E99AE] font-mono">
                                        Doc ID: {tx.id}
                                      </span>
                                    </div>
                                    <div className="p-3 rounded-xl bg-[#161C28] border border-[#1E2635] font-mono text-[11px] text-[#8E99AE] leading-relaxed break-words">
                                      {tx.rawMessage || 'No raw SMS text recorded for this entry.'}
                                    </div>
                                    <div className="flex items-center gap-4 text-xs text-[#8E99AE] pt-1">
                                      <span>Balance after tx: <strong className="text-white">{formatETB(tx.currentBalance)}</strong></span>
                                      <span>Type: <strong className="text-white">{tx.transactionType}</strong></span>
                                    </div>
                                  </div>
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* Infinite Scroll Sentinel & Load More Footer */}
              <div 
                ref={sentinelRef} 
                className="p-4 border-t border-[#1E2635] flex items-center justify-center bg-[#0D121D]"
              >
                {isLoadingMore ? (
                  <div className="flex items-center gap-2 text-xs text-[#00D1FF] font-semibold py-2">
                    <Loader2 size={16} className="animate-spin" />
                    <span>Loading 20 more historical transactions...</span>
                  </div>
                ) : hasMore ? (
                  <button
                    onClick={handleLoadMore}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#161C28] hover:bg-[#1A2232] border border-[#1E2635] text-xs font-bold text-[#00D1FF] transition-colors"
                  >
                    <span>Load Next 20 Older Transactions</span>
                    <ChevronDown size={14} />
                  </button>
                ) : transactions.length > 0 ? (
                  <span className="text-xs text-[#8E99AE] py-2">
                    All historical transactions loaded ({transactions.length} total records).
                  </span>
                ) : null}
              </div>
            </div>
          </div>
        )}

        {/* Tab 1: By Profile / Bank Cards Grid */}
        {activeTab === 1 && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {PROFILES.map((profile) => (
                <div
                  key={profile.id}
                  onClick={() => setSelectedProfile(selectedProfile?.id === profile.id ? null : profile)}
                  className={`p-5 bg-[#161C28] border rounded-2xl cursor-pointer transition-all ${
                    selectedProfile?.id === profile.id
                      ? 'border-[#00D1FF] shadow-[0_0_20px_rgba(0,209,255,0.15)]'
                      : 'border-[#1E2635] hover:border-[#00D1FF]/40'
                  }`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="w-12 h-12 rounded-xl bg-[#00D1FF]/10 border border-[#00D1FF]/30 flex items-center justify-center text-[#00D1FF]">
                          <User size={24} />
                        </div>
                        <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-[#161C28] ${
                          profile.active ? 'bg-[#00FF94]' : 'bg-[#FF4D4D]'
                        }`} />
                      </div>

                      <div>
                        <h4 className="text-base font-bold text-white">
                          {profile.name}
                        </h4>
                        <span className="text-xs text-[#8E99AE]">
                          {profile.count} Linked {profile.count === 1 ? 'Bank' : 'Banks'}
                        </span>
                      </div>
                    </div>

                    <FintechBadge 
                      label={profile.active ? 'ACTIVE' : 'OFFLINE'} 
                      color={profile.active ? '#00FF94' : '#FF4D4D'} 
                    />
                  </div>

                  <div className="space-y-1.5 pt-3 border-t border-[#1E2635]">
                    {profile.banks.length === 0 ? (
                      <p className="text-xs text-[#8E99AE] italic">No bank accounts assigned.</p>
                    ) : (
                      profile.banks.map((b, idx) => (
                        <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-[#0D121D] border border-[#1E2635] text-xs">
                          <span className="font-semibold text-white">{b}</span>
                          <span className="text-[10px] font-bold text-[#00FF94] bg-[#00FF94]/10 px-1.5 py-0.5 rounded border border-[#00FF94]/30">
                            TELEMETRY ON
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Profile Detailed Inspector */}
            {selectedProfile && (
              <div className="p-6 rounded-2xl bg-[#161C28] border border-[#00D1FF]/40 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#00D1FF]" />
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                      Assigned Bank Accounts & Telemetry for {selectedProfile.name}
                    </h3>
                  </div>
                  <button 
                    onClick={() => setSelectedProfile(null)}
                    className="text-xs text-[#8E99AE] hover:text-white px-3 py-1 rounded-lg bg-[#0D121D] border border-[#1E2635]"
                  >
                    Close Inspector
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {selectedProfile.banks.map((b, idx) => (
                    <div key={idx} className="p-4 rounded-xl bg-[#0D121D] border border-[#1E2635] space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white text-sm">{b}</span>
                        <FintechBadge label="ONLINE" color="#00FF94" />
                      </div>
                      <p className="text-[11px] text-[#8E99AE]">
                        Incoming SMS parsing enabled. Forwarded to unified ledger.
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
