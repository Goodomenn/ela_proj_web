import React from 'react';
import { 
  Receipt, 
  FileSpreadsheet, 
  ShoppingCart, 
  PackageCheck, 
  CheckSquare, 
  Calculator, 
  FileText,
  Plus,
  ArrowRight,
  TrendingDown,
  ShoppingBag,
  Truck,
  DollarSign
} from 'lucide-react';
import FintechHeader from '../components/FintechHeader';
import { FintechCard, FintechBadge } from '../components/FintechCard';

export default function FbHubScreen({
  onMenuClick,
  onOpenExpenseEntry,
  onOpenDailyExpenseReport,
  onOpenPurchaseEntry,
  onOpenGoodsReceiving,
  onOpenDailyReceivingReport,
  onOpenManualSalesEntry,
  onOpenDailyCashierReport
}) {
  const WORKFLOW_GROUPS = [
    {
      title: 'Expenses & Financial Outflows',
      subtitle: 'DAILY SPENDING & PETTY CASH',
      icon: Receipt,
      color: '#7C4DFF',
      description: 'Manage restaurant & butchery daily operational expenditures, attach receipts, and submit ledger audits.',
      items: [
        {
          name: 'Expense Entry',
          desc: 'Log new operational expenses, select category, attach receipts',
          badge: 'ADD RECORD',
          icon: Receipt,
          action: onOpenExpenseEntry,
          isPrimary: true
        },
        {
          name: 'Daily Expense Report',
          desc: 'View & audit today’s aggregated spending summary',
          badge: 'VIEW REPORT',
          icon: FileSpreadsheet,
          action: onOpenDailyExpenseReport
        }
      ]
    },
    {
      title: 'Procurement & Purchasing',
      subtitle: 'VENDOR ORDERS & RAW INGREDIENTS',
      icon: ShoppingCart,
      color: '#448AFF',
      description: 'Create purchase orders for meats, beverages, produce, dry goods, and track vendor cost history.',
      items: [
        {
          name: 'Purchase Entry',
          desc: 'Create new purchase requests, item quantities, and cost quotes',
          badge: 'NEW ORDER',
          icon: ShoppingCart,
          action: onOpenPurchaseEntry,
          isPrimary: true
        },
        {
          name: 'Purchase Cost Audit',
          desc: 'Review historical supplier quotes and pricing fluctuations',
          badge: 'REPORTS',
          icon: FileText,
          action: onOpenDailyReceivingReport
        }
      ]
    },
    {
      title: 'Inventory & Goods Receiving',
      subtitle: 'DOCK RECEPTION & REJECTION LOG',
      icon: PackageCheck,
      color: '#00E5FF',
      description: 'Verify physical stock arrival, match against purchase orders, and document damaged or denied deliveries.',
      items: [
        {
          name: 'Goods Receiving',
          desc: 'Inspect delivered items, verify weights, confirm or reject',
          badge: 'INCOMING DOCK',
          icon: PackageCheck,
          action: onOpenGoodsReceiving,
          isPrimary: true
        },
        {
          name: 'Daily Receiving Report',
          desc: 'Log of confirmed and denied inventory entries for today',
          badge: 'DOCK LOG',
          icon: CheckSquare,
          action: onOpenDailyReceivingReport
        }
      ]
    },
    {
      title: 'Cashier Sales & Drawer Handovers',
      subtitle: 'REGISTER REVENUE & DRAWER BALANCING',
      icon: Calculator,
      color: '#FFAB40',
      description: 'Record non-automated cash sales, track shift closures, and balance register drawers against POS telemetry.',
      items: [
        {
          name: 'Manual Sales Entry',
          desc: 'Log non-POS customer sales, buffet entries, itemized revenue',
          badge: 'MANUAL ENTRY',
          icon: Calculator,
          action: onOpenManualSalesEntry,
          isPrimary: true
        },
        {
          name: 'Daily Cashier Report',
          desc: 'Verify drawer closing totals, physical cash counts & shortages',
          badge: 'SHIFT CLOSE',
          icon: FileText,
          action: onOpenDailyCashierReport
        }
      ]
    }
  ];

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <FintechHeader
        title="Food & Beverage Operations Hub"
        subtitle="OPERATIONAL WORKFLOWS & LOGISTICS"
        category="Habesha Enterprise"
        onMenuClick={onMenuClick}
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={onOpenExpenseEntry}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#7C4DFF] hover:bg-[#7C4DFF]/90 text-white text-xs font-bold transition-colors shadow-lg shadow-[#7C4DFF]/20"
            >
              <Plus size={14} />
              <span className="hidden sm:inline">Add Expense</span>
            </button>
            <button
              onClick={onOpenGoodsReceiving}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#00D1FF] hover:bg-[#00D1FF]/90 text-[#0D121D] text-xs font-bold transition-colors shadow-lg shadow-[#00D1FF]/20"
            >
              <PackageCheck size={14} />
              <span className="hidden sm:inline">Receive Goods</span>
            </button>
          </div>
        }
      />

      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Hub Header Card */}
        <div className="p-6 rounded-2xl bg-[#161C28] border border-[#1E2635] flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-[#00D1FF]" />
              <span className="text-[10px] font-bold text-[#00D1FF] uppercase tracking-wider">
                F&B Operational Lifecycle
              </span>
            </div>
            <h2 className="text-xl font-black text-white tracking-tight">
              Procurement, Expenses, Goods Receiving & Cashier Closures
            </h2>
            <p className="text-xs text-[#8E99AE] mt-1 max-w-2xl leading-relaxed">
              End-to-end management for restaurant kitchen, butchery stock, bar replenishment, and daily operational cash flow.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1.5 rounded-xl bg-[#0D121D] border border-[#1E2635] text-xs text-[#00D1FF] font-bold">
              4 Operational Pillars
            </span>
          </div>
        </div>

        {/* 2x2 Operational Workflows Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {WORKFLOW_GROUPS.map((group, idx) => {
            const GroupIcon = group.icon;

            return (
              <div 
                key={idx}
                className="bg-[#161C28] border border-[#1E2635] rounded-2xl p-6 flex flex-col justify-between space-y-5"
              >
                <div>
                  <div className="flex items-center justify-between pb-4 border-b border-[#1E2635]">
                    <div className="flex items-center gap-3">
                      <div 
                        style={{
                          backgroundColor: `${group.color}15`,
                          borderColor: `${group.color}35`,
                          color: group.color
                        }}
                        className="w-10 h-10 rounded-xl border flex items-center justify-center shrink-0"
                      >
                        <GroupIcon size={20} />
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-white tracking-tight">
                          {group.title}
                        </h3>
                        <span className="text-[10px] font-bold text-[#8E99AE] uppercase tracking-wider">
                          {group.subtitle}
                        </span>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-[#8E99AE] mt-3 leading-relaxed">
                    {group.description}
                  </p>

                  <div className="mt-4 space-y-2.5">
                    {group.items.map((item, itemIdx) => {
                      const ItemIcon = item.icon;

                      return (
                        <div
                          key={itemIdx}
                          onClick={item.action}
                          className="p-3.5 rounded-xl bg-[#0D121D] hover:bg-[#1A2232] border border-[#1E2635] hover:border-[#00D1FF]/40 cursor-pointer transition-all duration-150 flex items-center justify-between group"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-8 h-8 rounded-lg bg-[#161C28] text-[#8E99AE] group-hover:text-[#00D1FF] flex items-center justify-center shrink-0 transition-colors">
                              <ItemIcon size={16} />
                            </div>
                            <div className="min-w-0">
                              <h4 className="text-xs font-bold text-white group-hover:text-[#00D1FF] transition-colors truncate">
                                {item.name}
                              </h4>
                              <p className="text-[11px] text-[#8E99AE] truncate">
                                {item.desc}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0 ml-3">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#161C28] text-[#00D1FF] border border-[#1E2635] uppercase">
                              {item.badge}
                            </span>
                            <ArrowRight size={14} className="text-[#8E99AE] group-hover:text-[#00D1FF] group-hover:translate-x-0.5 transition-all" />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
