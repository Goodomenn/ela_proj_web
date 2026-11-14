import React from 'react';
import { 
  Receipt, 
  FileSpreadsheet, 
  ShoppingCart, 
  PackageCheck, 
  CheckSquare, 
  Calculator, 
  FileText 
} from 'lucide-react';
import FintechHeader from '../components/FintechHeader';
import { SectionHeader, FintechHubTile } from '../components/FintechCard';

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
  return (
    <div className="flex-1 flex flex-col pb-6">
      <FintechHeader
        title="F&B Purchase"
        subtitle="OPERATIONAL WORKFLOWS"
        onMenuClick={onMenuClick}
      />

      <div className="px-5 space-y-2">
        {/* EXPENSES */}
        <SectionHeader title="Expenses" />
        <FintechHubTile
          title="Expense Entry"
          subtitle="Log daily spending and attach receipts"
          icon={Receipt}
          iconColor="#7C4DFF"
          onTap={onOpenExpenseEntry}
        />
        <FintechHubTile
          title="Daily Expense Report"
          subtitle="View and submit today's spending summary"
          icon={FileSpreadsheet}
          iconColor="#536DFE"
          onTap={onOpenDailyExpenseReport}
        />

        {/* PROCUREMENT */}
        <SectionHeader title="Procurement" />
        <FintechHubTile
          title="Purchase Entry"
          subtitle="Create new purchase requests and orders"
          icon={ShoppingCart}
          iconColor="#448AFF"
          onTap={onOpenPurchaseEntry}
        />

        {/* INVENTORY RECEIVING */}
        <SectionHeader title="Inventory Receiving" />
        <FintechHubTile
          title="Goods Receiving"
          subtitle="Verify and confirm incoming inventory"
          icon={PackageCheck}
          iconColor="#00E5FF"
          onTap={onOpenGoodsReceiving}
        />
        <FintechHubTile
          title="Daily Receiving Report"
          subtitle="Today's confirmed and denied entries"
          icon={CheckSquare}
          iconColor="#00BFA5"
          onTap={onOpenDailyReceivingReport}
        />

        {/* CASHIER SALES */}
        <SectionHeader title="Cashier Sales" />
        <FintechHubTile
          title="Manual Sales Entry"
          subtitle="Log non-POS sales and itemized revenue"
          icon={Calculator}
          iconColor="#FFAB40"
          onTap={onOpenManualSalesEntry}
        />
        <FintechHubTile
          title="Daily Cashier Report"
          subtitle="Verify drawer totals and shortages"
          icon={FileText}
          iconColor="#FF9100"
          onTap={onOpenDailyCashierReport}
        />
      </div>
    </div>
  );
}
