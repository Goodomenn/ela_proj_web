import React from 'react';
import { 
  LayoutDashboard, 
  ArrowLeftRight, 
  CheckCheck, 
  UtensilsCrossed, 
  Settings, 
  Calculator, 
  Banknote, 
  ShieldCheck, 
  Receipt,
  UserCheck, 
  LogOut,
  Radio,
  ChevronRight,
  ExternalLink
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const MAIN_NAV_ITEMS = [
  { id: 'home', label: 'Dashboard', subtitle: 'System Overview & KPI', icon: LayoutDashboard },
  { id: 'transactions', label: 'Transactions', subtitle: 'SMS & Bank Ledger', icon: ArrowLeftRight },
  { id: 'audit', label: 'Audit & Log Hub', subtitle: 'Central Intelligence', icon: CheckCheck },
  { id: 'fb', label: 'F&B Operations', subtitle: 'Purchasing & Expenses', icon: UtensilsCrossed },
  { id: 'settings', label: 'Settings', subtitle: 'Hardware & System Admin', icon: Settings },
];

export default function FintechSidebar({
  activeTab,
  onChangeTab,
  onOpenPosIngestion,
  onOpenRecordCash,
  onOpenVerification,
  onOpenExpenseEntry,
  onOpenSmsForwarding
}) {
  const { user, logout } = useAuth();
  const username = user?.username || 'dani';
  const roleLabel = (user?.roleLabel || user?.role || 'MANAGER').toUpperCase();

  return (
    <aside className="hidden md:flex flex-col w-64 lg:w-72 bg-[#0B0F19] border-r border-[#1E2635] shrink-0 h-screen sticky top-0 z-40 select-none">
      {/* Brand Header */}
      <div className="p-5 border-b border-[#1E2635]/80 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#00D1FF]/10 border border-[#00D1FF]/30 flex items-center justify-center text-[#00D1FF] shadow-[0_0_15px_rgba(0,209,255,0.15)]">
            <Radio size={20} className="animate-pulse" />
          </div>
          <div>
            <h1 className="text-sm font-black tracking-wider text-white uppercase">
              ELA <span className="text-[#00D1FF]">FINTECH</span>
            </h1>
            <p className="text-[10px] font-semibold text-[#8E99AE] tracking-wider uppercase">
              HABESHA ENTERPRISE
            </p>
          </div>
        </div>

        {/* Telemetry status dot */}
        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#00FF94]/10 border border-[#00FF94]/30" title="Firestore Real-time Sync Live">
          <span className="w-2 h-2 rounded-full bg-[#00FF94] animate-ping" />
          <span className="text-[9px] font-bold text-[#00FF94] tracking-wider uppercase">LIVE</span>
        </div>
      </div>

      {/* Main Navigation */}
      <div className="flex-1 overflow-y-auto px-3.5 py-4 space-y-6">
        <div>
          <div className="px-3 mb-2 flex items-center justify-between">
            <span className="text-[10px] font-bold text-[#8E99AE] uppercase tracking-wider">
              Navigation Hubs
            </span>
          </div>

          <nav className="space-y-1">
            {MAIN_NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => onChangeTab(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-xs transition-all duration-150 group text-left ${
                    isActive
                      ? 'bg-[#00D1FF]/15 text-white border border-[#00D1FF]/40 shadow-[0_0_15px_rgba(0,209,255,0.08)]'
                      : 'text-[#8E99AE] hover:text-white hover:bg-[#161C28] border border-transparent'
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                      isActive
                        ? 'bg-[#00D1FF] text-[#0B0F19]'
                        : 'bg-[#161C28] text-[#8E99AE] group-hover:text-[#00D1FF]'
                    }`}
                  >
                    <Icon size={16} strokeWidth={isActive ? 2.5 : 2} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="font-bold tracking-tight truncate">
                      {item.label}
                    </div>
                    <div className={`text-[10px] truncate ${isActive ? 'text-[#00D1FF]/80' : 'text-[#8E99AE]/70'}`}>
                      {item.subtitle}
                    </div>
                  </div>

                  {isActive && (
                    <ChevronRight size={14} className="text-[#00D1FF] shrink-0" />
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Quick Workflows / Actions */}
        <div>
          <div className="px-3 mb-2 flex items-center justify-between">
            <span className="text-[10px] font-bold text-[#8E99AE] uppercase tracking-wider">
              Quick Operations
            </span>
          </div>

          <div className="space-y-1.5">
            <button
              onClick={onOpenPosIngestion}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-[#161C28]/60 hover:bg-[#161C28] border border-[#1E2635] text-left text-xs text-white group transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <Calculator size={14} className="text-[#00D1FF]" />
                <span className="font-medium text-[11px]">POS Ingestion</span>
              </div>
              <span className="text-[9px] font-bold text-[#00D1FF] bg-[#00D1FF]/10 px-1.5 py-0.5 rounded border border-[#00D1FF]/30">
                UPLOAD
              </span>
            </button>

            <button
              onClick={onOpenRecordCash}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-[#161C28]/60 hover:bg-[#161C28] border border-[#1E2635] text-left text-xs text-white group transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <Banknote size={14} className="text-[#00FF94]" />
                <span className="font-medium text-[11px]">Record Cash Income</span>
              </div>
              <span className="text-[9px] font-bold text-[#00FF94] bg-[#00FF94]/10 px-1.5 py-0.5 rounded border border-[#00FF94]/30">
                + CASH
              </span>
            </button>

            <button
              onClick={onOpenExpenseEntry}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-[#161C28]/60 hover:bg-[#161C28] border border-[#1E2635] text-left text-xs text-white group transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <Receipt size={14} className="text-[#7C4DFF]" />
                <span className="font-medium text-[11px]">Log Daily Expense</span>
              </div>
              <span className="text-[9px] font-bold text-[#7C4DFF] bg-[#7C4DFF]/10 px-1.5 py-0.5 rounded border border-[#7C4DFF]/30">
                EXPENSE
              </span>
            </button>

            <button
              onClick={onOpenVerification}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-[#161C28]/60 hover:bg-[#161C28] border border-[#1E2635] text-left text-xs text-white group transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <ShieldCheck size={14} className="text-[#FFB800]" />
                <span className="font-medium text-[11px]">Verify & Audit</span>
              </div>
              <span className="text-[9px] font-bold text-[#FFB800] bg-[#FFB800]/10 px-1.5 py-0.5 rounded border border-[#FFB800]/30">
                AUDIT
              </span>
            </button>
          </div>
        </div>

        {/* Telemetry info card */}
        <div className="p-3 rounded-xl bg-[#161C28]/40 border border-[#1E2635] space-y-1.5 text-[11px]">
          <div className="flex items-center justify-between">
            <span className="text-[#8E99AE]">Firestore DB</span>
            <span className="text-[#00FF94] font-bold">Connected</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[#8E99AE]">POS Terminals</span>
            <span className="text-[#00D1FF] font-bold">2 Online</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[#8E99AE]">SMS Daemon</span>
            <span className="text-[#FFB800] font-bold">Monitoring</span>
          </div>
        </div>
      </div>

      {/* User Session Footer */}
      <div className="p-4 border-t border-[#1E2635] bg-[#090D15] flex items-center justify-between">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-[#00D1FF]/10 border border-[#00D1FF]/30 flex items-center justify-center text-[#00D1FF] shrink-0 font-bold text-xs uppercase">
            {username.slice(0, 2)}
          </div>
          <div className="min-w-0">
            <div className="text-xs font-bold text-white truncate">
              {username}
            </div>
            <div className="text-[10px] font-semibold text-[#00D1FF] uppercase tracking-wider truncate">
              {roleLabel}
            </div>
          </div>
        </div>

        <button
          onClick={logout}
          title="Sign Out"
          className="p-2 rounded-xl text-[#8E99AE] hover:text-[#FF4D4D] hover:bg-[#FF4D4D]/10 transition-colors"
        >
          <LogOut size={16} />
        </button>
      </div>
    </aside>
  );
}
