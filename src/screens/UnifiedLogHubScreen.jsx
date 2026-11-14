import React from 'react';
import { 
  BarChart3, 
  Receipt, 
  FileText, 
  ArrowLeftRight, 
  Package, 
  ShoppingCart,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';
import FintechHeader from '../components/FintechHeader';
import { SectionHeader, FintechHubTile } from '../components/FintechCard';

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
  return (
    <div className="flex-1 flex flex-col pb-6">
      <FintechHeader
        title="Audit & Log Hub"
        subtitle="CENTRAL INTELLIGENCE"
        onMenuClick={onMenuClick}
      />

      <div className="px-5 space-y-2">
        <SectionHeader title="Available Audit Logs" />

        <FintechHubTile
          title="Sales Audit Log"
          subtitle="Shift revenue, device breakdown & POS verification"
          icon={BarChart3}
          iconColor="#00BFA5"
          onTap={onOpenSalesAudit}
        />

        <FintechHubTile
          title="Expense History"
          subtitle="Historical spending, fund usage & receipts"
          icon={Receipt}
          iconColor="#7C4DFF"
          onTap={onOpenExpenseHistory}
        />

        <FintechHubTile
          title="Cashier Daily Logs"
          subtitle="Manual sales entries, shortages & cashier summary"
          icon={FileText}
          iconColor="#009688"
          onTap={onOpenCashierLogs}
        />

        <FintechHubTile
          title="Over & Shortage Reconciliation"
          subtitle="Dual-source cashier audit vs POS income variance"
          icon={ArrowLeftRight}
          iconColor="#FFB800"
          onTap={onOpenOverShortage}
        />

        <FintechHubTile
          title="Receiving History"
          subtitle="Confirmed & denied goods entry logs"
          icon={Package}
          iconColor="#FFA000"
          onTap={onOpenReceivingHistory}
        />

        <FintechHubTile
          title="Purchase Reports"
          subtitle="Raw procurement records and cost history"
          icon={ShoppingCart}
          iconColor="#448AFF"
          onTap={onOpenPurchaseReports}
        />

        {/* ADMINISTRATION */}
        <div className="pt-4">
          <span className="text-[10px] font-bold text-[#8E99AE] tracking-widest uppercase block mb-3">
            ADMINISTRATION
          </span>

          <FintechHubTile
            title="Permission Debugger"
            subtitle="View role permissions and verify RBAC assignments"
            icon={ShieldCheck}
            iconColor="#00D1FF"
            onTap={onOpenPermissionDebugger}
          />
        </div>
      </div>
    </div>
  );
}
