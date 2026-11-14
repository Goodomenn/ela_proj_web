import React, { useState } from 'react';
import { useAuth } from './context/AuthContext';
import FintechSidebar from './components/FintechSidebar';
import FintechBottomNav from './components/FintechBottomNav';
import FintechDrawer from './components/FintechDrawer';
import DashboardScreen from './screens/DashboardScreen';
import TransactionHistoryScreen from './screens/TransactionHistoryScreen';
import UnifiedLogHubScreen from './screens/UnifiedLogHubScreen';
import FbHubScreen from './screens/FbHubScreen';
import SettingsScreen from './screens/SettingsScreen';
import LoginScreen from './screens/LoginScreen';

// Sub-Screens
import LogReportScreen from './screens/LogReportScreen';
import OverShortageScreen from './screens/OverShortageScreen';
import ExpenseHistoryScreen from './screens/ExpenseHistoryScreen';
import CashierLogsScreen from './screens/CashierLogsScreen';
import ReceivingHistoryScreen from './screens/ReceivingHistoryScreen';
import PurchaseReportsScreen from './screens/PurchaseReportsScreen';
import SalesVsBankDetailsScreen from './screens/SalesVsBankDetailsScreen';

// Modals
import PosIngestionModal from './screens/PosIngestionModal';
import RecordCashIncomeModal from './screens/RecordCashIncomeModal';
import ExpenseEntryModal from './screens/ExpenseEntryModal';
import CashierEntryModal from './screens/CashierEntryModal';
import PurchaseEntryModal from './screens/PurchaseEntryModal';
import GoodsReceivingModal from './screens/GoodsReceivingModal';
import FilterBanksModal, { ALL_BANKS } from './screens/FilterBanksModal';
import ClearDataModal from './screens/ClearDataModal';
import ChangePasswordModal from './screens/ChangePasswordModal';
import SmsForwardingModal from './screens/SmsForwardingModal';
import ReprocessModal from './screens/ReprocessModal';
import BankMessagesModal from './screens/BankMessagesModal';
import ManageBanksModal from './screens/ManageBanksModal';
import PosDevicesModal from './screens/PosDevicesModal';
import RbacManagementModal from './screens/RbacManagementModal';
import ApprovalsModal from './screens/ApprovalsModal';
import VerificationModal from './screens/VerificationModal';
import { AuthProvider } from './context/AuthContext';

function AppContent() {
  const { user } = useAuth();

  // Navigation State
  const [activeTab, setActiveTab] = useState('home');
  const [activeSubScreen, setActiveSubScreen] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Modals State
  const [modalOpen, setModalOpen] = useState(null); // 'pos_ingestion', 'record_cash', etc.

  // Bank Filter State
  const [selectedBanks, setSelectedBanks] = useState(ALL_BANKS);

  const toggleBank = (bank) => {
    setSelectedBanks(prev => 
      prev.includes(bank) ? prev.filter(b => b !== bank) : [...prev, bank]
    );
  };

  if (!user) {
    return <LoginScreen />;
  }

  // Handle Tab Switch (clears sub-screens)
  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setActiveSubScreen(null);
  };

  // Render Sub-Screen if active
  const renderSubScreen = () => {
    switch (activeSubScreen) {
      case 'sales_audit':
        return <LogReportScreen onBack={() => setActiveSubScreen(null)} />;
      case 'over_shortage':
        return <OverShortageScreen onBack={() => setActiveSubScreen(null)} />;
      case 'expense_history':
        return (
          <ExpenseHistoryScreen 
            onBack={() => setActiveSubScreen(null)} 
            onOpenAddExpense={() => setModalOpen('expense_entry')} 
          />
        );
      case 'cashier_logs':
        return (
          <CashierLogsScreen 
            onBack={() => setActiveSubScreen(null)} 
            onOpenAddCashierSale={() => setModalOpen('cashier_entry')} 
          />
        );
      case 'receiving_history':
        return (
          <ReceivingHistoryScreen 
            onBack={() => setActiveSubScreen(null)} 
            onOpenGoodsReceiving={() => setModalOpen('goods_receiving')} 
          />
        );
      case 'purchase_reports':
        return (
          <PurchaseReportsScreen 
            onBack={() => setActiveSubScreen(null)} 
            onOpenPurchaseEntry={() => setModalOpen('purchase_entry')} 
          />
        );
      case 'daily_breakdown':
        return <SalesVsBankDetailsScreen onBack={() => setActiveSubScreen(null)} />;
      default:
        return null;
    }
  };

  // Render Tab Screen
  const renderTabScreen = () => {
    switch (activeTab) {
      case 'home':
        return (
          <DashboardScreen
            onMenuClick={() => setIsDrawerOpen(true)}
            onOpenPosIngestion={() => setModalOpen('pos_ingestion')}
            onOpenOverShortage={() => setActiveSubScreen('over_shortage')}
            onOpenDailyBreakdown={() => setActiveSubScreen('daily_breakdown')}
            onOpenFilterBanks={() => setModalOpen('filter_banks')}
            onOpenRecordCash={() => setModalOpen('record_cash')}
            onOpenVerification={() => setModalOpen('verification')}
          />
        );
      case 'transactions':
        return (
          <TransactionHistoryScreen
            onMenuClick={() => setIsDrawerOpen(true)}
            onOpenRecordCash={() => setModalOpen('record_cash')}
            onOpenVerification={() => setModalOpen('verification')}
          />
        );
      case 'audit':
        return (
          <UnifiedLogHubScreen
            onMenuClick={() => setIsDrawerOpen(true)}
            onOpenSalesAudit={() => setActiveSubScreen('sales_audit')}
            onOpenExpenseHistory={() => setActiveSubScreen('expense_history')}
            onOpenCashierLogs={() => setActiveSubScreen('cashier_logs')}
            onOpenOverShortage={() => setActiveSubScreen('over_shortage')}
            onOpenReceivingHistory={() => setActiveSubScreen('receiving_history')}
            onOpenPurchaseReports={() => setActiveSubScreen('purchase_reports')}
            onOpenPermissionDebugger={() => setModalOpen('rbac')}
          />
        );
      case 'fb':
        return (
          <FbHubScreen
            onMenuClick={() => setIsDrawerOpen(true)}
            onOpenExpenseEntry={() => setModalOpen('expense_entry')}
            onOpenDailyExpenseReport={() => setActiveSubScreen('expense_history')}
            onOpenPurchaseEntry={() => setModalOpen('purchase_entry')}
            onOpenGoodsReceiving={() => setModalOpen('goods_receiving')}
            onOpenDailyReceivingReport={() => setActiveSubScreen('receiving_history')}
            onOpenManualSalesEntry={() => setModalOpen('cashier_entry')}
            onOpenDailyCashierReport={() => setActiveSubScreen('cashier_logs')}
          />
        );
      case 'settings':
        return (
          <SettingsScreen
            onMenuClick={() => setIsDrawerOpen(true)}
            onOpenPosDevices={() => setModalOpen('pos_devices')}
            onOpenRawMessages={() => setModalOpen('bank_messages')}
            onOpenRbac={() => setModalOpen('rbac')}
            onOpenApprovals={() => setModalOpen('approvals')}
            onOpenManageBanks={() => setModalOpen('manage_banks')}
            onOpenReprocess={() => setModalOpen('reprocess')}
            onOpenClearData={() => setModalOpen('clear_data')}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#070A10] flex font-sans antialiased text-white selection:bg-[#00D1FF]/30 selection:text-white">
      {/* Persistent Desktop Sidebar (Hidden on mobile) */}
      <FintechSidebar
        activeTab={activeTab}
        onChangeTab={handleTabChange}
        onOpenPosIngestion={() => setModalOpen('pos_ingestion')}
        onOpenRecordCash={() => setModalOpen('record_cash')}
        onOpenVerification={() => setModalOpen('verification')}
        onOpenExpenseEntry={() => setModalOpen('expense_entry')}
        onOpenSmsForwarding={() => setModalOpen('sms_forwarding')}
      />

      {/* Main Web Content Canvas */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#0D121D] min-h-screen">
        <main className="flex-1 flex flex-col">
          {activeSubScreen ? renderSubScreen() : renderTabScreen()}
        </main>

        {/* Mobile Bottom Navigation (Shown only on small screens) */}
        {!activeSubScreen && (
          <FintechBottomNav
            activeTab={activeTab}
            onChangeTab={handleTabChange}
          />
        )}
      </div>

      {/* Global Slide-out Drawer (for mobile / tablet screens) */}
      <FintechDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onNavigate={handleTabChange}
        onOpenSmsForwarding={() => setModalOpen('sms_forwarding')}
        onOpenChangePassword={() => setModalOpen('change_password')}
        onOpenReprocess={() => setModalOpen('reprocess')}
        onOpenRawMessages={() => setModalOpen('bank_messages')}
      />

      {/* Modals & Dialogs */}
      <PosIngestionModal
        isOpen={modalOpen === 'pos_ingestion'}
        onClose={() => setModalOpen(null)}
      />
      <RecordCashIncomeModal
        isOpen={modalOpen === 'record_cash'}
        onClose={() => setModalOpen(null)}
      />
      <ExpenseEntryModal
        isOpen={modalOpen === 'expense_entry'}
        onClose={() => setModalOpen(null)}
      />
      <CashierEntryModal
        isOpen={modalOpen === 'cashier_entry'}
        onClose={() => setModalOpen(null)}
      />
      <PurchaseEntryModal
        isOpen={modalOpen === 'purchase_entry'}
        onClose={() => setModalOpen(null)}
      />
      <GoodsReceivingModal
        isOpen={modalOpen === 'goods_receiving'}
        onClose={() => setModalOpen(null)}
      />
      <FilterBanksModal
        isOpen={modalOpen === 'filter_banks'}
        onClose={() => setModalOpen(null)}
        selectedBanks={selectedBanks}
        onToggleBank={toggleBank}
      />
      <ClearDataModal
        isOpen={modalOpen === 'clear_data'}
        onClose={() => setModalOpen(null)}
      />
      <ChangePasswordModal
        isOpen={modalOpen === 'change_password'}
        onClose={() => setModalOpen(null)}
      />
      <SmsForwardingModal
        isOpen={modalOpen === 'sms_forwarding'}
        onClose={() => setModalOpen(null)}
      />
      <ReprocessModal
        isOpen={modalOpen === 'reprocess'}
        onClose={() => setModalOpen(null)}
      />
      <BankMessagesModal
        isOpen={modalOpen === 'bank_messages'}
        onClose={() => setModalOpen(null)}
      />
      <ManageBanksModal
        isOpen={modalOpen === 'manage_banks'}
        onClose={() => setModalOpen(null)}
      />
      <PosDevicesModal
        isOpen={modalOpen === 'pos_devices'}
        onClose={() => setModalOpen(null)}
      />
      <RbacManagementModal
        isOpen={modalOpen === 'rbac'}
        onClose={() => setModalOpen(null)}
      />
      <ApprovalsModal
        isOpen={modalOpen === 'approvals'}
        onClose={() => setModalOpen(null)}
      />
      <VerificationModal
        isOpen={modalOpen === 'verification'}
        onClose={() => setModalOpen(null)}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
