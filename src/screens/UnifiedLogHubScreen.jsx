import React from 'react';
import { 
  BarChart3, 
  Receipt, 
  FileText, 
  ArrowLeftRight, 
  Package, 
  ShoppingCart,
  ShieldCheck,
  ChevronRight,
  Database,
  Search,
  ExternalLink,
  Layers,
  Sparkles
} from 'lucide-react';
import FintechHeader from '../components/FintechHeader';
import { FintechCard, FintechBadge } from '../components/FintechCard';

export default function UnifiedLogHubScreen({
  onMenuClick,
  onOpenSalesAudit,
  onOpenExpenseHistory,
  onOpenCashierLogs,
  onOpenOverShortage,
  onOpenReceivingHistory,
  onOpenPurchaseReports,
  onOpenPermissionDebugger
}) {
  const AUDIT_MODULES = [
    {
      id: 'sales_audit',
      title: 'Sales Audit Log',
      category: 'REVENUE AUDIT',
      description: 'Review shift revenue, register device breakdown, and dual-POS verification for CENET and LOOP.',
      icon: BarChart3,
      color: '#00BFA5',
      badge: 'CENET & LOOP',
      onClick: onOpenSalesAudit
    },
    {
      id: 'expense_history',
      title: 'Expense History',
      category: 'SPENDING AUDIT',
      description: 'Historical itemized spending, fund allocations, proof of payment, and digital receipt ledger.',
      icon: Receipt,
      color: '#7C4DFF',
      badge: 'FINANCIAL',
      onClick: onOpenExpenseHistory
    },
    {
      id: 'cashier_logs',
      title: 'Cashier Daily Logs',
      category: 'DRAWER RECONCILIATION',
      description: 'Manual sales entries, shift end cash drawer handovers, verified cashier totals, and discrepancy tracking.',
      icon: FileText,
      color: '#009688',
      badge: 'REGISTER',
      onClick: onOpenCashierLogs
    },
    {
      id: 'over_shortage',
      title: 'Over & Shortage Reconciliation',
      category: 'VARIANCE AUDIT',
      description: 'Dual-source cashier audit vs POS income variance calculation. Monthly settled balance and deficit records.',
      icon: ArrowLeftRight,
      color: '#FFB800',
      badge: 'DISCREPANCIES',
      onClick: onOpenOverShortage
    },
    {
      id: 'receiving_history',
      title: 'Receiving History',
      category: 'INVENTORY AUDIT',
      description: 'Confirmed & denied goods entry logs, incoming vendor deliveries, damaged goods rejections, and weighbridge slips.',
      icon: Package,
      color: '#FFA000',
      badge: 'LOGISTICS',
      onClick: onOpenReceivingHistory
    },
    {
      id: 'purchase_reports',
      title: 'Purchase Reports',
      category: 'PROCUREMENT AUDIT',
      description: 'Raw procurement records, purchase requests, cost history, food & beverage bulk acquisition invoices.',
      icon: ShoppingCart,
      color: '#448AFF',
      badge: 'PROCUREMENT',
      onClick: onOpenPurchaseReports
    },
  ];

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <FintechHeader
        title="Audit & Central Intelligence Hub"
        subtitle="CENTRAL INTELLIGENCE & RECONCILIATION"
        category="Habesha Enterprise"
        onMenuClick={onMenuClick}
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={onOpenPermissionDebugger}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#161C28] hover:bg-[#1A2232] border border-[#1E2635] text-[#00D1FF] text-xs font-bold transition-colors"
            >
              <ShieldCheck size={14} />
              <span className="hidden sm:inline">RBAC Audit</span>
            </button>
          </div>
        }
      />

      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Hub Overview Banner */}
        <div className="p-6 rounded-2xl bg-[#161C28] border border-[#1E2635] relative overflow-hidden">
          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2 h-2 rounded-full bg-[#00D1FF] animate-pulse" />
                <span className="text-[10px] font-bold text-[#00D1FF] tracking-wider uppercase">
                  Centralized Financial Intelligence
                </span>
              </div>
              <h2 className="text-xl font-black text-white tracking-tight">
                Audit Logs & Verification Registry
              </h2>
              <p className="text-xs text-[#8E99AE] mt-1 max-w-2xl leading-relaxed">
                Immutable cross-verification between POS register transactions, cashier physical handovers, inventory receiving slips, and procurement invoices.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="px-3.5 py-2 rounded-xl bg-[#0D121D] border border-[#1E2635] text-center">
                <span className="text-lg font-black text-[#00D1FF] block leading-none">6</span>
                <span className="text-[9px] font-bold text-[#8E99AE] uppercase tracking-wider">Active Channels</span>
              </div>
              <div className="px-3.5 py-2 rounded-xl bg-[#0D121D] border border-[#1E2635] text-center">
                <span className="text-lg font-black text-[#00FF94] block leading-none">100%</span>
                <span className="text-[9px] font-bold text-[#8E99AE] uppercase tracking-wider">Sync Integrity</span>
              </div>
            </div>
          </div>
        </div>

        {/* Audit Modules Grid (6 cards in 3 columns) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {AUDIT_MODULES.map((mod) => {
            const Icon = mod.icon;

            return (
              <div
                key={mod.id}
                onClick={mod.onClick}
                className="bg-[#161C28] hover:bg-[#1A2232] border border-[#1E2635] hover:border-[#00D1FF]/50 rounded-2xl p-5 cursor-pointer transition-all duration-200 flex flex-col justify-between group shadow-lg"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div 
                      style={{ 
                        backgroundColor: `${mod.color}15`, 
                        borderColor: `${mod.color}35`,
                        color: mod.color 
                      }}
                      className="w-12 h-12 rounded-2xl border flex items-center justify-center transition-transform group-hover:scale-105"
                    >
                      <Icon size={24} />
                    </div>

                    <span 
                      style={{
                        backgroundColor: `${mod.color}10`,
                        borderColor: `${mod.color}30`,
                        color: mod.color
                      }}
                      className="px-2 py-0.5 rounded text-[10px] font-bold border uppercase tracking-wider"
                    >
                      {mod.badge}
                    </span>
                  </div>

                  <span className="text-[10px] font-bold text-[#8E99AE] uppercase tracking-wider block mb-1">
                    {mod.category}
                  </span>

                  <h3 className="text-base font-bold text-white group-hover:text-[#00D1FF] transition-colors">
                    {mod.title}
                  </h3>

                  <p className="text-xs text-[#8E99AE] mt-2 leading-relaxed">
                    {mod.description}
                  </p>
                </div>

                <div className="mt-5 pt-3.5 border-t border-[#1E2635] flex items-center justify-between text-xs text-[#00D1FF] font-semibold">
                  <span>Open Audit Stream</span>
                  <ChevronRight size={15} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>

        {/* Administration & Security Banner */}
        <div className="p-4 rounded-2xl bg-[#0D121D] border border-[#1E2635] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#00D1FF]/10 text-[#00D1FF] flex items-center justify-center shrink-0">
              <ShieldCheck size={18} />
            </div>
            <div>
              <span className="text-xs font-bold text-white block">Enterprise Access Control & Auditor Roles</span>
              <p className="text-[11px] text-[#8E99AE]">Fine-grained PIN authentication and role-based permissions enforce audit data immutability.</p>
            </div>
          </div>

          <button
            onClick={onOpenPermissionDebugger}
            className="self-start sm:self-auto px-3.5 py-1.5 rounded-xl bg-[#161C28] hover:bg-[#1A2232] border border-[#1E2635] text-xs font-bold text-white transition-colors"
          >
            Manage Permissions
          </button>
        </div>
      </div>
    </div>
  );
}
