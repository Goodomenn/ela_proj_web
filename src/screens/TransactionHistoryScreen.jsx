import React, { useState, useEffect } from 'react';
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
  Plus
} from 'lucide-react';
import FintechHeader from '../components/FintechHeader';
import { FintechCard, FintechBadge } from '../components/FintechCard';
import { subscribeToTransactions, formatETB } from '../services/firebaseClient';

const PROFILES = [
  { id: 'filly', name: 'filly', banks: ['Awash Bank'], count: 1, active: true },
  { id: 'dann', name: 'dann', banks: ['CBE'], count: 1, active: true },
  { id: 'dani', name: 'dani', banks: [], count: 0, active: false },
  { id: 'ela_trading', name: 'ela_trading', banks: ['Awash Bank', 'Bank of Abyssinia', 'CBE', 'CBE Birr', 'Telebirr'], count: 5, active: true },
  { id: 'danni', name: 'danni', banks: ['CBE', 'Telebirr'], count: 2, active: true },
];

export default function TransactionHistoryScreen({
  onMenuClick,
  onOpenRecordCash,
  onOpenVerification
}) {
  const [activeTab, setActiveTab] = useState(0); // 0: Transactions Feed, 1: By Profile / Bank
  const [transactions, setTransactions] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const [selectedProfile, setSelectedProfile] = useState(null);

  useEffect(() => {
    const unsub = subscribeToTransactions((list) => {
      setTransactions(list);
    });
    return () => unsub();
  }, []);

  const handleSyncSms = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
    }, 1200);
  };

  const filteredTransactions = transactions.filter(t => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const bank = (t.bankName || '').toLowerCase();
    const sender = (t.sender || '').toLowerCase();
    const ref = (t.referenceCode || '').toLowerCase();
    const forwarder = (t.forwarderUsername || '').toLowerCase();
    return bank.includes(q) || sender.includes(q) || ref.includes(q) || forwarder.includes(q);
  });

  return (
    <div className="flex-1 flex flex-col pb-6">
      <FintechHeader
        title="Transactions"
        subtitle="FORWARDED SMS & BANK LEDGER"
        onMenuClick={onMenuClick}
        actions={
          <>
            <button
              onClick={handleSyncSms}
              title="Sync SMS Inbox"
              disabled={isSyncing}
              className="p-2 rounded-xl bg-[#161C28] border border-[#1E2635] text-[#00D1FF] hover:border-[#00D1FF]/50 transition-colors"
            >
              <RefreshCw size={17} className={isSyncing ? 'animate-spin' : ''} />
            </button>
            <button
              onClick={onOpenRecordCash}
              title="Record Cash Income"
              className="p-2 rounded-xl bg-[#161C28] border border-[#1E2635] text-[#00FF94] hover:border-[#00FF94]/50 transition-colors"
            >
              <Banknote size={17} />
            </button>
            <button
              onClick={onOpenVerification}
              title="Reconciliation & Verification"
              className="p-2 rounded-xl bg-[#161C28] border border-[#1E2635] text-white hover:border-[#00D1FF]/50 transition-colors"
            >
              <ShieldCheck size={17} />
            </button>
          </>
        }
      />

      {/* Sub Tabs */}
      <div className="flex bg-[#161C28] border-b border-[#1E2635] px-4">
        <button
          onClick={() => { setActiveTab(0); setSelectedProfile(null); }}
          className={`flex-1 py-3 text-xs font-bold tracking-wider flex items-center justify-center gap-2 border-b-2 transition-colors ${
            activeTab === 0
              ? 'border-[#00D1FF] text-[#00D1FF]'
              : 'border-transparent text-[#8E99AE] hover:text-white'
          }`}
        >
          <Building2 size={15} />
          <span>Transactions Feed</span>
        </button>

        <button
          onClick={() => setActiveTab(1)}
          className={`flex-1 py-3 text-xs font-bold tracking-wider flex items-center justify-center gap-2 border-b-2 transition-colors ${
            activeTab === 1
              ? 'border-[#00D1FF] text-[#00D1FF]'
              : 'border-transparent text-[#8E99AE] hover:text-white'
          }`}
        >
          <User size={15} />
          <span>By Profile / Bank</span>
        </button>
      </div>

      {/* Tab 1: Transactions Feed */}
      {activeTab === 0 && (
        <div className="px-5 pt-4 space-y-3">
          {/* Search Bar */}
          <div className="relative">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8E99AE]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search reference, bank, sender, forwarder..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#161C28] border border-[#1E2635] text-white placeholder-[#8E99AE] text-xs focus:outline-none focus:border-[#00D1FF] transition-colors"
            />
          </div>

          {/* Transactions List */}
          {filteredTransactions.length === 0 ? (
            <div className="p-8 text-center bg-[#161C28]/40 border border-[#1E2635] rounded-2xl">
              <p className="text-xs text-[#8E99AE]">No bank transactions found matching filter.</p>
            </div>
          ) : (
            filteredTransactions.map((tx) => {
              const isIncome = tx.isIncome !== false;
              const isExpanded = expandedId === tx.id;
              const dateStr = tx.timestamp 
                ? new Date(tx.timestamp).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })
                : 'Just now';

              return (
                <div
                  key={tx.id}
                  className="bg-[#161C28] border border-[#1E2635] rounded-2xl overflow-hidden transition-all duration-200"
                >
                  <div
                    onClick={() => setExpandedId(isExpanded ? null : tx.id)}
                    className="p-3.5 flex items-center gap-3 cursor-pointer hover:bg-[#1A2232]"
                  >
                    {/* Amount Direction Icon */}
                    <div className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 ${
                      isIncome 
                        ? 'bg-[#00FF94]/10 border-[#00FF94]/30 text-[#00FF94]' 
                        : 'bg-[#FF4D4D]/10 border-[#FF4D4D]/30 text-[#FF4D4D]'
                    }`}>
                      {isIncome ? <ArrowDownLeft size={20} /> : <ArrowUpRight size={20} />}
                    </div>

                    {/* Main Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[13px] font-bold text-white truncate">
                          {tx.bankName || 'Bank Transfer'}
                        </span>
                        <span className={`text-[13px] font-bold tracking-tight shrink-0 ${
                          isIncome ? 'text-[#00FF94]' : 'text-[#FF4D4D]'
                        }`}>
                          {isIncome ? `+ ${formatETB(tx.amount)}` : `- ${formatETB(tx.amount)}`}
                        </span>
                      </div>

                      <div className="flex items-center justify-between gap-2 mt-1">
                        <span className="text-[11px] text-[#8E99AE] truncate">
                          {tx.sender ? `From: ${tx.sender}` : `Ref: ${tx.referenceCode || 'N/A'}`}
                        </span>
                        <span className="text-[10px] text-[#8E99AE] shrink-0">
                          {dateStr}
                        </span>
                      </div>
                    </div>

                    <ChevronDown size={16} className={`text-[#8E99AE] transition-transform shrink-0 ${isExpanded ? 'rotate-180' : ''}`} />
                  </div>

                  {/* Expanded Accordion Details */}
                  {isExpanded && (
                    <div className="px-4 py-3 bg-[#0D121D]/70 border-t border-[#1E2635] space-y-2 text-xs">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <span className="text-[10px] text-[#8E99AE] uppercase font-bold block">Reference Code</span>
                          <span className="font-mono text-white text-[11px]">{tx.referenceCode || 'N/A'}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-[#8E99AE] uppercase font-bold block">Forwarder</span>
                          <span className="text-white text-[11px]">{tx.forwarderUsername || 'System'}</span>
                        </div>
                      </div>

                      {tx.rawMessage && (
                        <div>
                          <span className="text-[10px] text-[#8E99AE] uppercase font-bold block">Raw Bank SMS</span>
                          <p className="mt-1 p-2 rounded-lg bg-[#161C28] border border-[#1E2635] text-[11px] font-mono text-[#8E99AE] leading-relaxed break-words">
                            {tx.rawMessage}
                          </p>
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-1">
                        <FintechBadge 
                          label={tx.isReconciled ? 'RECONCILED' : 'UNMATCHED'} 
                          color={tx.isReconciled ? '#00FF94' : '#FFB800'} 
                        />
                        <span className="text-[10px] text-[#8E99AE]">
                          ID: {tx.id.substring(0, 16)}...
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Tab 2: By Profile / Bank */}
      {activeTab === 1 && (
        <div className="px-5 pt-4 space-y-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-[#8E99AE] tracking-widest uppercase">
              CONFIGURED PROFILES & BANKS
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#00D1FF]/10 text-[#00D1FF] border border-[#00D1FF]/30">
              {PROFILES.length} Profiles
            </span>
          </div>

          {PROFILES.map((profile) => (
            <div
              key={profile.id}
              onClick={() => setSelectedProfile(selectedProfile?.id === profile.id ? null : profile)}
              className="p-4 bg-[#161C28] border border-[#1E2635] rounded-2xl flex items-center justify-between cursor-pointer hover:border-[#00D1FF]/40 transition-colors"
            >
              <div className="flex items-center gap-3.5">
                <div className="relative">
                  <div className="w-11 h-11 rounded-xl bg-[#339AF0]/10 border border-[#339AF0]/30 flex items-center justify-center text-[#00D1FF]">
                    <User size={20} />
                  </div>
                  <span className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border border-[#161C28] ${
                    profile.active ? 'bg-[#00FF94]' : 'bg-[#FF4D4D]'
                  }`} />
                </div>

                <div>
                  <h4 className="text-sm font-bold text-white tracking-wide">
                    {profile.name}
                  </h4>
                  <p className="text-xs text-[#8E99AE] mt-0.5">
                    <span className={`inline-block w-1.5 h-1.5 rounded-full mr-1.5 ${
                      profile.count > 0 ? 'bg-[#00FF94]' : 'bg-[#FF4D4D]'
                    }`} />
                    {profile.count} Banks configured
                  </p>
                </div>
              </div>

              <ChevronRight size={18} className="text-[#8E99AE]" />
            </div>
          ))}

          {/* Profile Details Modal / View */}
          {selectedProfile && (
            <div className="mt-4 p-4 rounded-2xl bg-[#0D121D] border border-[#00D1FF]/40 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-[#00D1FF] uppercase tracking-wider">
                  Linked Banks for {selectedProfile.name}
                </h4>
                <button 
                  onClick={() => setSelectedProfile(null)}
                  className="text-xs text-[#8E99AE] hover:text-white"
                >
                  Close
                </button>
              </div>

              {selectedProfile.banks.length === 0 ? (
                <p className="text-xs text-[#8E99AE]">No banks currently linked to this user profile.</p>
              ) : (
                <div className="space-y-1.5">
                  {selectedProfile.banks.map((b, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-[#161C28] border border-[#1E2635] text-xs">
                      <span className="font-semibold text-white">{b}</span>
                      <FintechBadge label="ONLINE" color="#00FF94" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
