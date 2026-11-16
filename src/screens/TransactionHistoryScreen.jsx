import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  RefreshCw, 
  Banknote, 
  ShieldCheck, 
  Search, 
  ArrowUpRight, 
  ArrowDownLeft, 
  ChevronDown, 
  ChevronRight, 
  ChevronLeft,
  ArrowLeft,
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
  Loader2,
  Smartphone,
  Wallet,
  Receipt,
  FileSpreadsheet
} from 'lucide-react';
import FintechHeader from '../components/FintechHeader';
import { FintechBadge } from '../components/FintechCard';
import { 
  fetchInitialTransactions, 
  fetchMoreTransactions, 
  fetchTransactionsByUserAndBank,
  getClosingBalanceBefore,
  formatETB,
  normalizeBankName
} from '../services/firebaseClient';
import { subscribeToUsers } from '../services/rbacService';

const FALLBACK_PROFILES = [
  { id: 'filly', username: 'filly', banks: ['Awash Bank', 'CBE'], active: true },
  { id: 'dann', username: 'dann', banks: ['CBE'], active: true },
  { id: 'dani', username: 'dani', banks: ['CBE', 'Awash Bank'], active: true },
  { id: 'ela_trading', username: 'ela_trading', banks: ['Awash Bank', 'Bank of Abyssinia', 'CBE', 'CBE Birr', 'Telebirr'], active: true },
  { id: 'danni', username: 'danni', banks: ['CBE', 'Telebirr'], active: true },
];

const BANK_FILTERS = ['ALL', 'Awash Bank', 'CBE', 'Telebirr', 'Bank of Abyssinia', 'CBE Birr', 'Cash'];

function getBankSubtitle(bank) {
  if (!bank) return 'Financial Institution';
  const b = bank.trim().toLowerCase();
  if (b === 'cash') return 'Physical Cash Vault & Drawer';
  if (b.includes('cbe') && !b.includes('birr')) return 'Commercial Bank of Ethiopia';
  if (b.includes('awash')) return 'Awash International Bank';
  if (b.includes('cbebirr') || b.includes('cbe birr')) return 'CBE Birr Mobile System';
  if (b === '127' || b.includes('telebirr')) return 'Telebirr Mobile Money';
  if (b.includes('abyssinia') || b === 'boa') return 'Bank of Abyssinia';
  return 'Financial Institution';
}

function getBankIcon(bank) {
  if (!bank) return <Building2 size={16} />;
  const b = bank.trim().toLowerCase();
  if (b === 'cash') return <Banknote size={16} className="text-[#00FF94]" />;
  if (b.includes('birr') || b.includes('telebirr') || b === '127') return <Smartphone size={16} className="text-[#00D1FF]" />;
  return <Building2 size={16} className="text-[#00D1FF]" />;
}

function formatFullDate(dateStr) {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  const [y, m, d] = parts.map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
}

function formatTime24h(dateObj) {
  if (!dateObj || !(dateObj instanceof Date) || isNaN(dateObj.getTime())) return '00:00:00';
  const h = String(dateObj.getHours()).padStart(2, '0');
  const m = String(dateObj.getMinutes()).padStart(2, '0');
  const s = String(dateObj.getSeconds()).padStart(2, '0');
  return `${h}:${m}:${s}`;
}

export default function TransactionHistoryScreen({
  onMenuClick,
  onOpenRecordCash,
  onOpenVerification
}) {
  const [activeTab, setActiveTab] = useState(0); // 0: Transactions Feed, 1: By Profile / Bank
  
  // Tab 0 State: Global Transactions Stream
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
  const [copiedRef, setCopiedRef] = useState(null);
  const sentinelRef = useRef(null);

  // Tab 1 State: Profile & Bank Drill-down
  const [liveUsers, setLiveUsers] = useState([]);
  const [selectedBankProfile, setSelectedBankProfile] = useState(null); // { username: string, bankName: string }
  const [selectedDate, setSelectedDate] = useState(null); // 'YYYY-MM-DD'
  const [userBankTransactions, setUserBankTransactions] = useState([]);
  const [isLoadingBankTxs, setIsLoadingBankTxs] = useState(false);
  const [dailySearchQuery, setDailySearchQuery] = useState('');
  const [expandedSpineId, setExpandedSpineId] = useState(null);

  // Load live users from Firestore
  useEffect(() => {
    const unsub = subscribeToUsers((users) => {
      if (users && users.length > 0) {
        setLiveUsers(users);
      }
    });
    return () => unsub();
  }, []);

  const profilesList = useMemo(() => {
    const base = liveUsers.length > 0 ? liveUsers : FALLBACK_PROFILES;
    return base.map(u => {
      const username = u.username || u.name || u.id || 'User';
      const rawBanks = Array.isArray(u.banks) ? u.banks : [];
      // Ensure 'Cash' is present for all profiles (matching mobile app)
      const banks = [...rawBanks];
      if (!banks.some(b => b.trim().toLowerCase() === 'cash')) {
        banks.unshift('Cash');
      }
      return {
        id: u.uid || u.id || username,
        username,
        banks,
        active: u.status !== 'SUSPENDED' && u.active !== false
      };
    });
  }, [liveUsers]);

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
    if (!sentinelRef.current || !hasMore || isLoadingMore || isLoadingInitial || activeTab !== 0) return;

    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        handleLoadMore();
      }
    }, {
      rootMargin: '200px'
    });

    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [sentinelRef.current, hasMore, isLoadingMore, isLoadingInitial, lastDoc, activeTab]);

  const handleSyncSms = async () => {
    setIsSyncing(true);
    await loadInitialData();
    if (selectedBankProfile) {
      await handleSelectBank(selectedBankProfile.username, selectedBankProfile.bankName);
    }
    setIsSyncing(false);
  };

  const handleCopy = (ref) => {
    if (!ref || ref === 'N/A') return;
    navigator.clipboard?.writeText(ref);
    setCopiedRef(ref);
    setTimeout(() => setCopiedRef(null), 2000);
  };

  // Level 1 -> Level 2: User clicks a specific bank channel in profile card
  const handleSelectBank = async (username, bankName) => {
    setSelectedBankProfile({ username, bankName });
    setSelectedDate(null);
    setDailySearchQuery('');
    setIsLoadingBankTxs(true);
    try {
      const txs = await fetchTransactionsByUserAndBank(username, bankName);
      setUserBankTransactions(txs);
    } catch (err) {
      console.error('Failed to load bank transactions:', err);
      setUserBankTransactions([]);
    } finally {
      setIsLoadingBankTxs(false);
    }
  };

  // Level 2 -> Level 3: User clicks a date card
  const handleSelectDate = (dateKey) => {
    setSelectedDate(dateKey);
    setDailySearchQuery('');
  };

  // Back actions
  const handleBackToProfiles = () => {
    setSelectedBankProfile(null);
    setSelectedDate(null);
    setUserBankTransactions([]);
  };

  const handleBackToDates = () => {
    setSelectedDate(null);
    setDailySearchQuery('');
  };

  // Group bank transactions by date for Level 2
  const groupedDates = useMemo(() => {
    const map = {};
    for (const tx of userBankTransactions) {
      if (!tx.dateObj) continue;
      const y = tx.dateObj.getFullYear();
      const m = String(tx.dateObj.getMonth() + 1).padStart(2, '0');
      const d = String(tx.dateObj.getDate()).padStart(2, '0');
      const key = `${y}-${m}-${d}`;
      if (!map[key]) {
        map[key] = [];
      }
      map[key].push(tx);
    }
    const sortedKeys = Object.keys(map).sort((a, b) => b.localeCompare(a));
    return sortedKeys.map(key => ({
      dateKey: key,
      formattedDate: formatFullDate(key),
      transactions: map[key],
      count: map[key].length,
      dailyTotal: map[key].reduce((sum, t) => sum + (Number(t.amount) || 0), 0)
    }));
  }, [userBankTransactions]);

  // Level 3: Day transactions and chronological sort
  const dayTransactions = useMemo(() => {
    if (!selectedDate) return [];
    return userBankTransactions.filter(tx => {
      if (!tx.dateObj) return false;
      const y = tx.dateObj.getFullYear();
      const m = String(tx.dateObj.getMonth() + 1).padStart(2, '0');
      const d = String(tx.dateObj.getDate()).padStart(2, '0');
      return `${y}-${m}-${d}` === selectedDate;
    });
  }, [userBankTransactions, selectedDate]);

  // Chronologically sorted (oldest to newest within the 24-hour day)
  const sortedDayTxs = useMemo(() => {
    return [...dayTransactions].sort((a, b) => (a.dateObj?.getTime() || 0) - (b.dateObj?.getTime() || 0));
  }, [dayTransactions]);

  // Filtered by daily live search bar
  const filteredDayTxs = useMemo(() => {
    if (!dailySearchQuery.trim()) return sortedDayTxs;
    const q = dailySearchQuery.toLowerCase().trim();
    return sortedDayTxs.filter(tx => {
      const amountStr = String(tx.amount || '');
      const ref = (tx.referenceCode || '').toLowerCase();
      const raw = (tx.rawMessage || '').toLowerCase();
      const sender = (tx.sender || '').toLowerCase();
      return amountStr.includes(q) || ref.includes(q) || raw.includes(q) || sender.includes(q);
    });
  }, [sortedDayTxs, dailySearchQuery]);

  // Audit calculations for Form 05 (Opening, Inflow, Outflow, Closing)
  const auditSummary = useMemo(() => {
    if (!selectedDate) return { openingBalance: 0, inflow: 0, outflow: 0, closingBalance: 0 };
    
    // 1. Opening balance: closing balance of previous day before selectedDate
    let openingBalance = getClosingBalanceBefore(userBankTransactions, selectedDate);
    
    // 2. Inflow and Outflow sums
    let inflow = 0;
    let outflow = 0;
    for (const tx of dayTransactions) {
      const txType = (tx.transactionType || '').toUpperCase();
      const isCredit = txType === 'CREDITED' || txType === 'DEPOSITED';
      const isDebit = txType === 'DEBITED' || txType === 'WITHDRAWN' || txType === 'TRANSFER' || txType === 'FEE';
      const amt = Number(tx.amount) || 0;
      
      if (isCredit || (tx.isIncome && !isDebit)) {
        inflow += amt;
      } else {
        outflow += amt;
      }
    }
    
    // 3. Closing balance
    let closingBalance = 0;
    if (sortedDayTxs.length > 0) {
      const lastTx = sortedDayTxs[sortedDayTxs.length - 1];
      if (lastTx.currentBalance > 0) {
        closingBalance = lastTx.currentBalance;
      } else {
        closingBalance = Math.max(0, openingBalance + inflow - outflow);
      }
      
      if (openingBalance === 0 && sortedDayTxs[0].currentBalance > 0) {
        const firstTx = sortedDayTxs[0];
        const firstImpact = firstTx.isIncome ? firstTx.amount : -firstTx.amount;
        openingBalance = Math.max(0, firstTx.currentBalance - firstImpact);
      }
    } else {
      closingBalance = openingBalance;
    }
    
    return { openingBalance, inflow, outflow, closingBalance };
  }, [userBankTransactions, selectedDate, dayTransactions, sortedDayTxs]);

  // Tab 0 Global table filter
  const filteredTransactions = transactions.filter(t => {
    if (selectedBankFilter !== 'ALL' && (t.bankName || '').toUpperCase() !== selectedBankFilter.toUpperCase()) {
      return false;
    }
    const isIncome = t.isIncome !== false;
    if (selectedDirection === 'IN' && !isIncome) return false;
    if (selectedDirection === 'OUT' && isIncome) return false;
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
              onClick={() => { setActiveTab(0); }}
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
              <span>By Profile / Bank ({profilesList.length})</span>
            </button>
          </div>

          {/* Quick Search */}
          {activeTab === 0 && (
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
          )}
        </div>

        {/* ========================================================================= */}
        {/* Tab 0: Unified Historical Transactions Table Stream                       */}
        {/* ========================================================================= */}
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

              {/* Direction Filter & Stream Indicator */}
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
                        const dateFormatted = tx.dateObj instanceof Date && !isNaN(tx.dateObj.getTime())
                          ? tx.dateObj.toLocaleString('en-US', { 
                              month: 'short', 
                              day: 'numeric', 
                              year: 'numeric', 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })
                          : 'Recent';

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
                                      className="text-[#8E99AE] hover:text-white p-1 rounded hover:bg-[#1E2635]"
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
                                  @{tx.forwardedBy || 'system'}
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

        {/* ========================================================================= */}
        {/* Tab 1: By Profile / Bank Hierarchical Drill-down (Levels 1, 2, 3)         */}
        {/* ========================================================================= */}
        {activeTab === 1 && (
          <div className="space-y-6">
            {/* ------------------------------------------------------------------- */}
            {/* LEVEL 1: Profiles & Configured Banks Grid                           */}
            {/* ------------------------------------------------------------------- */}
            {!selectedBankProfile && (
              <div className="space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#161C28]/60 p-4 rounded-2xl border border-[#1E2635]">
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <Layers size={16} className="text-[#00D1FF]" />
                      Configured Profiles & Bank Channels
                    </h3>
                    <p className="text-xs text-[#8E99AE] mt-0.5">
                      Click any bank channel to view daily transactions and audit reconciliation (Form 05).
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-xl bg-[#00D1FF]/10 border border-[#00D1FF]/30 text-[#00D1FF] text-xs font-bold">
                      {profilesList.length} Active Profiles
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {profilesList.map((profile) => (
                    <div
                      key={profile.id}
                      className="p-5 bg-[#161C28] border border-[#1E2635] hover:border-[#00D1FF]/40 rounded-2xl transition-all shadow-xl flex flex-col justify-between"
                    >
                      <div>
                        {/* Profile Header */}
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
                                {profile.username}
                              </h4>
                              <span className="text-xs text-[#8E99AE]">
                                {profile.banks.length} Linked Channels
                              </span>
                            </div>
                          </div>

                          <FintechBadge 
                            label={profile.active ? 'ACTIVE' : 'OFFLINE'} 
                            color={profile.active ? '#00FF94' : '#FF4D4D'} 
                          />
                        </div>

                        {/* Interactive Bank Channels List */}
                        <div className="space-y-2 pt-3 border-t border-[#1E2635]">
                          <span className="text-[10px] font-bold text-[#8E99AE] uppercase tracking-wider block mb-2">
                            Configured Channels (Click to Open)
                          </span>
                          {profile.banks.map((bank, idx) => {
                            const isCash = bank.trim().toLowerCase() === 'cash';
                            return (
                              <button
                                key={idx}
                                onClick={() => handleSelectBank(profile.username, bank)}
                                title={`Open daily transactions for ${bank}`}
                                className="w-full flex items-center justify-between p-2.5 rounded-xl bg-[#0D121D] hover:bg-[#1E2635] border border-[#1E2635] hover:border-[#00D1FF]/60 text-xs transition-all group cursor-pointer text-left shadow-sm"
                              >
                                <div className="flex items-center gap-2.5">
                                  <div className="w-7 h-7 rounded-lg bg-[#00D1FF]/10 text-[#00D1FF] group-hover:bg-[#00D1FF] group-hover:text-[#0D121D] flex items-center justify-center transition-colors shrink-0">
                                    {getBankIcon(bank)}
                                  </div>
                                  <div>
                                    <span className="font-bold text-white group-hover:text-[#00D1FF] transition-colors block text-xs">
                                      {bank}
                                    </span>
                                    <span className="text-[10px] text-[#8E99AE]">
                                      {getBankSubtitle(bank)}
                                    </span>
                                  </div>
                                </div>

                                <div className="flex items-center gap-2">
                                  {isCash ? (
                                    <span className="text-[10px] font-bold text-[#00FF94] bg-[#00FF94]/10 px-2 py-0.5 rounded-full border border-[#00FF94]/30">
                                      DEFAULT
                                    </span>
                                  ) : (
                                    <span className="text-[10px] font-bold text-[#00D1FF] bg-[#00D1FF]/10 px-2 py-0.5 rounded-full border border-[#00D1FF]/30">
                                      TELEMETRY ON
                                    </span>
                                  )}
                                  <ChevronRight size={14} className="text-[#8E99AE] group-hover:text-[#00D1FF] group-hover:translate-x-0.5 transition-all" />
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ------------------------------------------------------------------- */}
            {/* LEVEL 2: Bank Dates Screen (Daily Batches matching mobile app)       */}
            {/* ------------------------------------------------------------------- */}
            {selectedBankProfile && !selectedDate && (
              <div className="space-y-6">
                {/* Navigation Bar / Breadcrumb */}
                <div className="flex items-center justify-between bg-[#161C28] p-3.5 rounded-2xl border border-[#1E2635]">
                  <button
                    onClick={handleBackToProfiles}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#0D121D] hover:bg-[#1E2635] border border-[#1E2635] text-[#00D1FF] text-xs font-bold transition-colors"
                  >
                    <ArrowLeft size={14} />
                    <span>Back to Configured Profiles</span>
                  </button>

                  <div className="flex items-center gap-2 text-xs text-[#8E99AE]">
                    <span>Profiles</span>
                    <ChevronRight size={12} />
                    <span className="text-white font-semibold">@{selectedBankProfile.username}</span>
                    <ChevronRight size={12} />
                    <span className="text-[#00D1FF] font-bold">{selectedBankProfile.bankName}</span>
                  </div>
                </div>

                {/* Channel Telemetry Header Card */}
                <div className="p-6 rounded-2xl bg-[#161C28] border border-[#1E2635] shadow-xl">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-[#00D1FF]/10 border border-[#00D1FF]/30 flex items-center justify-center text-[#00D1FF]">
                        {getBankIcon(selectedBankProfile.bankName)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-xl font-black text-white">
                            {selectedBankProfile.bankName}
                          </h3>
                          <FintechBadge label="ACTIVE CHANNEL" color="#00FF94" />
                        </div>
                        <p className="text-xs text-[#8E99AE] mt-0.5">
                          {getBankSubtitle(selectedBankProfile.bankName)} · Forwarder: <strong className="text-white">@{selectedBankProfile.username}</strong>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 border-t md:border-t-0 md:border-l border-[#1E2635] pt-4 md:pt-0 md:pl-6">
                      <div>
                        <span className="text-[10px] font-bold text-[#8E99AE] uppercase tracking-wider block">
                          TOTAL LOGGED
                        </span>
                        <div className="flex items-baseline gap-2 mt-0.5">
                          <span className="text-2xl font-black text-white">
                            {isLoadingBankTxs ? '...' : userBankTransactions.length}
                          </span>
                          <span className="text-xs text-[#8E99AE]">Transactions</span>
                        </div>
                      </div>

                      <div className="pl-4 border-l border-[#1E2635]">
                        <span className="text-[10px] font-bold text-[#8E99AE] uppercase tracking-wider block">
                          CALENDAR DAYS
                        </span>
                        <div className="flex items-baseline gap-2 mt-0.5">
                          <span className="text-2xl font-black text-[#00D1FF]">
                            {isLoadingBankTxs ? '...' : groupedDates.length}
                          </span>
                          <span className="text-xs text-[#8E99AE]">Ledger Batches</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Daily Transaction Logs List */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between px-1">
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                      <Calendar size={14} className="text-[#00D1FF]" />
                      Daily Transaction Logs
                    </h4>
                    <span className="text-xs text-[#8E99AE]">
                      Select a date to open the 24-hour audit diary
                    </span>
                  </div>

                  {isLoadingBankTxs ? (
                    <div className="py-20 flex flex-col items-center justify-center gap-3 bg-[#161C28] rounded-2xl border border-[#1E2635]">
                      <Loader2 size={28} className="animate-spin text-[#00D1FF]" />
                      <span className="text-xs text-[#8E99AE]">
                        Loading historical transactions for {selectedBankProfile.bankName}...
                      </span>
                    </div>
                  ) : groupedDates.length === 0 ? (
                    <div className="py-16 text-center bg-[#161C28] rounded-2xl border border-[#1E2635] space-y-2">
                      <Receipt size={32} className="mx-auto text-[#8E99AE]" />
                      <p className="text-sm font-bold text-white">No transactions recorded yet</p>
                      <p className="text-xs text-[#8E99AE] max-w-sm mx-auto">
                        No transactions found for {selectedBankProfile.bankName} under user @{selectedBankProfile.username}.
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                      {groupedDates.map((group, idx) => {
                        const isLatest = idx === 0;
                        const isHighVolume = group.count > 50;
                        return (
                          <div
                            key={group.dateKey}
                            onClick={() => handleSelectDate(group.dateKey)}
                            className="p-4 bg-[#161C28] hover:bg-[#1E2635] border border-[#1E2635] hover:border-[#00D1FF]/60 rounded-2xl cursor-pointer transition-all flex items-center justify-between group shadow-lg"
                          >
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-xl bg-[#00D1FF]/10 border border-[#00D1FF]/20 flex items-center justify-center text-[#00D1FF] group-hover:scale-105 transition-transform shrink-0">
                                <Calendar size={22} />
                              </div>
                              <div>
                                <div className="flex items-center gap-2 flex-wrap">
                                  <h4 className="text-sm font-bold text-white group-hover:text-[#00D1FF] transition-colors">
                                    {group.formattedDate}
                                  </h4>
                                  {isLatest && (
                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-[#00FF94]/15 border border-[#00FF94]/40 text-[#00FF94]">
                                      LATEST
                                    </span>
                                  )}
                                  {isHighVolume && (
                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-[#00D1FF]/15 border border-[#00D1FF]/40 text-[#00D1FF]">
                                      High Volume
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center gap-2.5 mt-1 text-xs text-[#8E99AE]">
                                  <span>{group.count} Transactions</span>
                                  <span className="w-1 h-1 rounded-full bg-[#8E99AE]" />
                                  <span className="font-bold text-[#00FF94]">
                                    {formatETB(group.dailyTotal)}
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-1.5 text-[#8E99AE] group-hover:text-[#00D1FF] transition-colors">
                              <span className="text-xs font-bold hidden sm:inline">Inspect Ledger</span>
                              <ChevronRight size={16} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ------------------------------------------------------------------- */}
            {/* LEVEL 3: Daily Transactions Ledger Spine & Audit (Form 05)          */}
            {/* ------------------------------------------------------------------- */}
            {selectedBankProfile && selectedDate && (
              <div className="space-y-6">
                {/* Navigation Bar / Breadcrumb */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#161C28] p-3.5 rounded-2xl border border-[#1E2635]">
                  <button
                    onClick={handleBackToDates}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#0D121D] hover:bg-[#1E2635] border border-[#1E2635] text-[#00D1FF] text-xs font-bold transition-colors w-fit"
                  >
                    <ArrowLeft size={14} />
                    <span>Back to Dates for {selectedBankProfile.bankName}</span>
                  </button>

                  <div className="flex items-center gap-2 text-xs text-[#8E99AE] flex-wrap">
                    <span>@{selectedBankProfile.username}</span>
                    <ChevronRight size={12} />
                    <span>{selectedBankProfile.bankName}</span>
                    <ChevronRight size={12} />
                    <span className="text-[#00D1FF] font-bold">{formatFullDate(selectedDate)}</span>
                  </div>
                </div>

                {/* Day Header Banner */}
                <div className="p-5 rounded-2xl bg-[#161C28] border border-[#1E2635] shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-black text-white">
                      {formatFullDate(selectedDate)}
                    </h3>
                    <p className="text-xs text-[#8E99AE] mt-0.5">
                      Audit ledger & chronological 24-hour spine for {selectedBankProfile.bankName}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <FintechBadge label={selectedBankProfile.bankName} color="#00D1FF" />
                    <FintechBadge label={`@${selectedBankProfile.username}`} color="#8E99AE" />
                    <span className="px-2.5 py-1 rounded-xl bg-[#0D121D] border border-[#1E2635] text-white text-xs font-bold">
                      {sortedDayTxs.length} Transactions
                    </span>
                  </div>
                </div>

                {/* Live Search Bar for Daily Ledger */}
                <div className="relative">
                  <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8E99AE]" />
                  <input
                    type="text"
                    value={dailySearchQuery}
                    onChange={(e) => setDailySearchQuery(e.target.value)}
                    placeholder="Search amount, reference code, sender or message text..."
                    className="w-full pl-11 pr-4 py-3 rounded-2xl bg-[#161C28] border border-[#1E2635] text-white placeholder-[#8E99AE] text-xs focus:outline-none focus:border-[#00D1FF] transition-colors shadow-lg"
                  />
                </div>

                {/* Audit Summary Section (Form 05 - 4 KPIs) */}
                <div className="p-6 rounded-2xl bg-[#161C28] border border-[#1E2635] shadow-xl space-y-5">
                  <div className="flex items-center justify-between border-b border-[#1E2635] pb-3">
                    <div className="flex items-center gap-2">
                      <ShieldCheck size={16} className="text-[#00D1FF]" />
                      <span className="text-[10px] font-bold text-[#8E99AE] tracking-widest uppercase">
                        AUDIT ARCHIVE / FORM 05
                      </span>
                    </div>
                    <span className="text-[10px] font-bold text-[#00D1FF]">
                      CURRENCY: ETB (ISO 4217)
                    </span>
                  </div>

                  {/* Opening Balance (Base Position) */}
                  <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 p-4 rounded-xl bg-[#0D121D] border border-[#1E2635]">
                    <div>
                      <span className="text-[10px] font-bold text-[#8E99AE] uppercase tracking-wider block">
                        OPENING BALANCE (00:00 UTC+8)
                      </span>
                      <span className="text-xs font-semibold text-white/70">
                        BASE POSITION
                      </span>
                    </div>
                    <div className="text-2xl sm:text-3xl font-black text-white">
                      {formatETB(auditSummary.openingBalance)}
                    </div>
                  </div>

                  {/* 2-Column Split: Inflow (+) vs Outflow (-) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Inflow Box */}
                    <div className="p-4 rounded-xl bg-[#00FF94]/5 border border-[#00FF94]/20 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-[#00FF94] text-xs font-bold">
                          <ArrowDownLeft size={16} />
                          <span>TOTAL INFLOW (+)</span>
                        </div>
                        <span className="w-2 h-2 rounded-full bg-[#00FF94]" />
                      </div>
                      <div className="text-xl sm:text-2xl font-black text-[#00FF94]">
                        + {formatETB(auditSummary.inflow)}
                      </div>
                    </div>

                    {/* Outflow Box */}
                    <div className="p-4 rounded-xl bg-[#FF4D4D]/5 border border-[#FF4D4D]/20 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-[#FF4D4D] text-xs font-bold">
                          <ArrowUpRight size={16} />
                          <span>TOTAL OUTFLOW (-)</span>
                        </div>
                        <span className="w-2 h-2 rounded-full bg-[#FF4D4D]" />
                      </div>
                      <div className="text-xl sm:text-2xl font-black text-[#FF4D4D]">
                        - {formatETB(auditSummary.outflow)}
                      </div>
                    </div>
                  </div>

                  {/* Closing Balance Reconciliation Box */}
                  <div className="p-5 rounded-xl bg-[#00D1FF]/5 border border-[#00D1FF]/30 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Wallet size={16} className="text-[#00D1FF]" />
                        <span className="text-xs font-bold text-white uppercase tracking-wider">
                          CLOSING BALANCE (23:59 UTC+8)
                        </span>
                      </div>
                      <FintechBadge label="FINAL" color="#00D1FF" isOutline />
                    </div>
                    <div className="text-right text-2xl sm:text-3xl font-black text-[#00D1FF]">
                      {formatETB(auditSummary.closingBalance)}
                    </div>
                  </div>
                </div>

                {/* Chronological 24-Hour Spine Section */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between px-1">
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                      <Clock size={14} className="text-[#00D1FF]" />
                      Chronological Spine · 24-Hour Diary
                    </h4>
                    <span className="text-xs text-[#8E99AE]">
                      {filteredDayTxs.length} Transactions Shown
                    </span>
                  </div>

                  {filteredDayTxs.length === 0 ? (
                    <div className="py-12 text-center bg-[#161C28] rounded-2xl border border-[#1E2635] text-[#8E99AE] text-xs">
                      No transactions found matching your daily search.
                    </div>
                  ) : (
                    <div className="relative pl-6 sm:pl-8 space-y-4">
                      {/* Spine Vertical Line */}
                      <div className="absolute left-3 sm:left-4 top-3 bottom-3 w-0.5 bg-[#1E2635]" />

                      {filteredDayTxs.map((tx, index) => {
                        const isIncome = tx.isIncome !== false;
                        const timeStr = tx.dateObj instanceof Date && !isNaN(tx.dateObj.getTime())
                          ? tx.dateObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
                          : 'Recent';
                        const time24h = formatTime24h(tx.dateObj);
                        const isSpineExpanded = expandedSpineId === tx.id;

                        return (
                          <div key={tx.id} className="relative group">
                            {/* Glowing Spine Dot */}
                            <div className={`absolute -left-6 sm:-left-8 top-5 w-4 h-4 rounded-full border-2 border-[#161C28] flex items-center justify-center transition-all ${
                              isIncome ? 'bg-[#00FF94]' : 'bg-[#FF4D4D]'
                            }`}>
                              <span className="w-1.5 h-1.5 rounded-full bg-[#0D121D]" />
                            </div>

                            {/* Spine Transaction Card */}
                            <div 
                              onClick={() => setExpandedSpineId(isSpineExpanded ? null : tx.id)}
                              className="p-5 rounded-2xl bg-[#161C28] hover:bg-[#1A2232] border border-[#1E2635] hover:border-[#00D1FF]/50 transition-all shadow-md cursor-pointer space-y-3"
                            >
                              {/* Top Bar: Time Pill, Type Badge, Amount */}
                              <div className="flex items-center justify-between gap-3">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="px-2.5 py-1 rounded-lg bg-[#0D121D] border border-[#1E2635] text-xs font-bold text-white">
                                    {timeStr}
                                  </span>
                                  <FintechBadge 
                                    label={tx.transactionType || (isIncome ? 'CREDITED' : 'DEBITED')} 
                                    color={isIncome ? '#00FF94' : '#FF4D4D'} 
                                  />
                                </div>

                                <div className={`text-base sm:text-lg font-black tracking-tight ${
                                  isIncome ? 'text-[#00FF94]' : 'text-[#FF4D4D]'
                                }`}>
                                  {isIncome ? `+ ${formatETB(tx.amount)}` : `- ${formatETB(tx.amount)}`}
                                </div>
                              </div>

                              {/* Details Grid: 24h Time, Sender, Ref, Balance */}
                              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-2 text-xs border-t border-[#1E2635]/60">
                                <div>
                                  <span className="text-[10px] text-[#8E99AE] uppercase font-bold block">
                                    Time (24h)
                                  </span>
                                  <span className="font-mono text-white/90 font-medium">
                                    {time24h}
                                  </span>
                                </div>

                                <div>
                                  <span className="text-[10px] text-[#8E99AE] uppercase font-bold block">
                                    Sender / Origin
                                  </span>
                                  <span className="text-white font-medium truncate block max-w-[180px]">
                                    {tx.sender || 'Direct Deposit'}
                                  </span>
                                </div>

                                <div>
                                  <span className="text-[10px] text-[#8E99AE] uppercase font-bold block">
                                    Ref Code
                                  </span>
                                  <div className="flex items-center gap-1.5">
                                    <span className="font-mono text-[#00D1FF] font-semibold">
                                      {tx.referenceCode || 'N/A'}
                                    </span>
                                    {tx.referenceCode && tx.referenceCode !== 'N/A' && (
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleCopy(tx.referenceCode);
                                        }}
                                        className="text-[#8E99AE] hover:text-white p-0.5 rounded"
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
                                </div>

                                <div>
                                  <span className="text-[10px] text-[#8E99AE] uppercase font-bold block">
                                    Running Balance
                                  </span>
                                  <span className="font-bold text-[#00D1FF]">
                                    {formatETB(tx.currentBalance)}
                                  </span>
                                </div>
                              </div>

                              {/* Verified SMS Raw Text Section */}
                              <div className="pt-2">
                                <div className="flex items-center justify-between mb-1.5">
                                  <span className="text-[10px] font-bold text-[#8E99AE] uppercase tracking-wider">
                                    Verified SMS Telemetry
                                  </span>
                                  <span className="text-[10px] font-bold text-[#00FF94] bg-[#00FF94]/10 px-2 py-0.5 rounded border border-[#00FF94]/20">
                                    VERIFIED SMS
                                  </span>
                                </div>
                                <div className="p-3 rounded-xl bg-[#0D121D] border border-[#1E2635] font-mono text-[11px] text-[#8E99AE] leading-relaxed break-words">
                                  {tx.rawMessage || 'No raw SMS text recorded for this entry.'}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
