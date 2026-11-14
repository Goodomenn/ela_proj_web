import React, { useState } from 'react';
import { 
  Radio, 
  Printer, 
  RefreshCw, 
  Plus, 
  Mail, 
  ShieldAlert, 
  UserCheck, 
  Building2, 
  Zap, 
  Trash2, 
  LogOut,
  ChevronRight,
  AlertTriangle,
  Check,
  Cpu,
  Layers,
  Key
} from 'lucide-react';
import FintechHeader from '../components/FintechHeader';
import { FintechCard, SectionHeader, FintechBadge } from '../components/FintechCard';
import { useAuth } from '../context/AuthContext';

export default function SettingsScreen({
  onMenuClick,
  onOpenPosDevices,
  onOpenRawMessages,
  onOpenRbac,
  onOpenApprovals,
  onOpenManageBanks,
  onOpenReprocess,
  onOpenClearData
}) {
  const { user, logout } = useAuth();
  const [forwardingEnabled, setForwardingEnabled] = useState(true);
  const [senderIds, setSenderIds] = useState(['CBE', '127', 'AWASH', 'TELEBIRR']);
  const [newSenderId, setNewSenderId] = useState('');
  const [showAddId, setShowAddId] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefreshTelemetry = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 800);
  };

  const handleAddSenderId = () => {
    if (!newSenderId.trim()) return;
    const clean = newSenderId.trim().toUpperCase();
    if (!senderIds.includes(clean)) {
      setSenderIds([...senderIds, clean]);
    }
    setNewSenderId('');
    setShowAddId(false);
  };

  const handleRemoveSenderId = (idToRemove) => {
    setSenderIds(senderIds.filter(id => id !== idToRemove));
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <FintechHeader
        title="Settings & System Configuration"
        subtitle="ENTERPRISE ADMIN & TELEMETRY"
        category="Habesha Enterprise"
        onMenuClick={onMenuClick}
      />

      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* 2-Column Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* LEFT COLUMN: Hardware, Telemetry & SMS Forwarding (5 Cols) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Live Telemetry Card */}
            <div className="bg-[#161C28] border border-[#1E2635] rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#1E2635]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#00D1FF]/10 border border-[#00D1FF]/30 flex items-center justify-center text-[#00D1FF]">
                    <Radio size={20} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">Firestore Live Telemetry</h3>
                    <p className="text-xs text-[#8E99AE]">CENET & LOOP telemetry connected</p>
                  </div>
                </div>

                <button
                  onClick={handleRefreshTelemetry}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#00D1FF]/10 border border-[#00D1FF]/30 text-xs text-[#00D1FF] font-semibold hover:bg-[#00D1FF]/20 transition-colors"
                >
                  <RefreshCw size={12} className={isRefreshing ? 'animate-spin' : ''} />
                  <span>Refresh</span>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-[#0D121D] border border-[#1E2635]">
                  <span className="text-[10px] text-[#8E99AE] uppercase font-bold block">Latency</span>
                  <span className="text-sm font-bold text-[#00FF94] mt-0.5 block">12ms • Real-time</span>
                </div>
                <div className="p-3 rounded-xl bg-[#0D121D] border border-[#1E2635]">
                  <span className="text-[10px] text-[#8E99AE] uppercase font-bold block">Status</span>
                  <span className="text-sm font-bold text-[#00D1FF] mt-0.5 block">Synchronized</span>
                </div>
              </div>
            </div>

            {/* Hardware Configuration */}
            <div className="bg-[#161C28] border border-[#1E2635] rounded-2xl p-5 space-y-3">
              <div className="flex items-center justify-between pb-3 border-b border-[#1E2635]">
                <div className="flex items-center gap-2">
                  <Printer size={16} className="text-[#00D1FF]" />
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">Hardware Configuration</h3>
                </div>
                <span className="text-[10px] font-bold text-[#00FF94] bg-[#00FF94]/10 px-2 py-0.5 rounded border border-[#00FF94]/30">
                  2 POS LINKED
                </span>
              </div>

              <div
                onClick={onOpenPosDevices}
                className="p-3.5 rounded-xl bg-[#0D121D] hover:bg-[#1A2232] border border-[#1E2635] hover:border-[#00D1FF]/40 cursor-pointer transition-colors flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-[#161C28] text-[#00D1FF] flex items-center justify-center shrink-0">
                    <Printer size={18} />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white group-hover:text-[#00D1FF] transition-colors block">
                      POS Terminals & Printers
                    </span>
                    <span className="text-[11px] text-[#8E99AE]">Configure CENET & LOOP counters</span>
                  </div>
                </div>
                <ChevronRight size={15} className="text-[#8E99AE] group-hover:text-white" />
              </div>
            </div>

            {/* Device SMS Configuration */}
            <div className="bg-[#161C28] border border-[#1E2635] rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#1E2635]">
                <div className="flex items-center gap-2">
                  <Mail size={16} className="text-[#00D1FF]" />
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">Device SMS Forwarding</h3>
                </div>
                <span className="text-[10px] font-bold text-[#00D1FF] bg-[#00D1FF]/10 px-2 py-0.5 rounded border border-[#00D1FF]/30">
                  DAEMON
                </span>
              </div>

              {/* Forwarding Toggle */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-[#0D121D] border border-[#1E2635]">
                <div>
                  <span className="text-xs font-bold text-white block">Forwarding Service</span>
                  <span className="text-[11px] text-[#8E99AE]">Listen for incoming bank messages on this device</span>
                </div>

                <button
                  onClick={() => setForwardingEnabled(!forwardingEnabled)}
                  className={`w-12 h-6 rounded-full transition-colors relative flex items-center px-0.5 ${
                    forwardingEnabled ? 'bg-[#00D1FF]' : 'bg-[#1E2635]'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white transition-transform ${
                      forwardingEnabled ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Monitored Sender IDs */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold text-[#8E99AE] tracking-widest uppercase">
                    MONITOR SENDER IDs
                  </span>
                  <button
                    onClick={() => setShowAddId(true)}
                    className="flex items-center gap-1 px-2 py-1 rounded-lg bg-[#00D1FF]/10 border border-[#00D1FF]/30 text-[#00D1FF] text-[10px] font-bold hover:bg-[#00D1FF]/20 transition-colors"
                  >
                    <Plus size={11} />
                    <span>Add ID</span>
                  </button>
                </div>

                {showAddId && (
                  <div className="flex items-center gap-2 mb-3">
                    <input
                      type="text"
                      value={newSenderId}
                      onChange={(e) => setNewSenderId(e.target.value)}
                      placeholder="e.g. CBE, AWASH..."
                      className="flex-1 px-3 py-1.5 rounded-lg bg-[#0D121D] border border-[#1E2635] text-xs text-white uppercase focus:outline-none focus:border-[#00D1FF]"
                    />
                    <button
                      onClick={handleAddSenderId}
                      className="px-3 py-1.5 rounded-lg bg-[#00D1FF] text-[#0D121D] font-bold text-xs"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setShowAddId(false)}
                      className="px-2 py-1.5 text-xs text-[#8E99AE]"
                    >
                      Cancel
                    </button>
                  </div>
                )}

                <div className="flex flex-wrap gap-1.5">
                  {senderIds.map((id) => (
                    <span
                      key={id}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#0D121D] border border-[#1E2635] text-xs font-semibold text-white"
                    >
                      <span>{id}</span>
                      <button
                        onClick={() => handleRemoveSenderId(id)}
                        className="text-[#8E99AE] hover:text-[#FF4D4D]"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Raw Message Feed Shortcut */}
              <button
                onClick={onOpenRawMessages}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-[#0D121D] hover:bg-[#1A2232] border border-[#1E2635] text-left transition-colors group"
              >
                <div className="flex items-center gap-2.5">
                  <Mail size={16} className="text-[#00D1FF]" />
                  <div>
                    <span className="text-xs font-bold text-white group-hover:text-[#00D1FF] transition-colors block">
                      Forwarded Bank Messages Feed
                    </span>
                    <span className="text-[10px] text-[#8E99AE]">Live stream of raw incoming and forwarded SMS</span>
                  </div>
                </div>
                <ChevronRight size={15} className="text-[#8E99AE] group-hover:text-white" />
              </button>
            </div>
          </div>

          {/* RIGHT COLUMN: Administration, Security & Danger Zone (7 Cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Enterprise Administration Grid */}
            <div className="bg-[#161C28] border border-[#1E2635] rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#1E2635]">
                <div className="flex items-center gap-2">
                  <ShieldAlert size={16} className="text-[#00D1FF]" />
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">Enterprise Administration</h3>
                </div>
                <span className="text-[10px] font-bold text-[#8E99AE] uppercase tracking-wider">
                  SECURITY & RBAC
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div
                  onClick={onOpenRbac}
                  className="p-4 rounded-xl bg-[#0D121D] hover:bg-[#1A2232] border border-[#1E2635] hover:border-[#00D1FF]/40 cursor-pointer transition-colors group"
                >
                  <div className="w-9 h-9 rounded-lg bg-[#00D1FF]/10 text-[#00D1FF] flex items-center justify-center mb-2.5">
                    <ShieldAlert size={18} />
                  </div>
                  <h4 className="text-xs font-bold text-white group-hover:text-[#00D1FF] transition-colors">
                    Access Control (RBAC)
                  </h4>
                  <p className="text-[11px] text-[#8E99AE] mt-1">
                    Manage roles, granular PIN permissions & credentials
                  </p>
                </div>

                <div
                  onClick={onOpenApprovals}
                  className="p-4 rounded-xl bg-[#0D121D] hover:bg-[#1A2232] border border-[#1E2635] hover:border-[#339AF0]/40 cursor-pointer transition-colors group"
                >
                  <div className="w-9 h-9 rounded-lg bg-[#339AF0]/10 text-[#339AF0] flex items-center justify-center mb-2.5">
                    <UserCheck size={18} />
                  </div>
                  <h4 className="text-xs font-bold text-white group-hover:text-[#339AF0] transition-colors">
                    User Registration Approvals
                  </h4>
                  <p className="text-[11px] text-[#8E99AE] mt-1">
                    Approve or reject pending access requests
                  </p>
                </div>

                <div
                  onClick={onOpenManageBanks}
                  className="p-4 rounded-xl bg-[#0D121D] hover:bg-[#1A2232] border border-[#1E2635] hover:border-[#00D1FF]/40 cursor-pointer transition-colors group"
                >
                  <div className="flex items-center justify-between mb-2.5">
                    <div className="w-9 h-9 rounded-lg bg-[#00D1FF]/10 text-[#00D1FF] flex items-center justify-center">
                      <Building2 size={18} />
                    </div>
                    <FintechBadge label="4 Active" color="#00D1FF" />
                  </div>
                  <h4 className="text-xs font-bold text-white group-hover:text-[#00D1FF] transition-colors">
                    Manage Transfer Banks
                  </h4>
                  <p className="text-[11px] text-[#8E99AE] mt-1">
                    Configure CBE & Telebirr deposit accounts
                  </p>
                </div>

                <div
                  onClick={onOpenReprocess}
                  className="p-4 rounded-xl bg-[#0D121D] hover:bg-[#1A2232] border border-[#1E2635] hover:border-[#FFB800]/40 cursor-pointer transition-colors group"
                >
                  <div className="flex items-center justify-between mb-2.5">
                    <div className="w-9 h-9 rounded-lg bg-[#FFB800]/10 text-[#FFB800] flex items-center justify-center">
                      <Zap size={18} />
                    </div>
                    <FintechBadge label="Audit" color="#FFB800" />
                  </div>
                  <h4 className="text-xs font-bold text-white group-hover:text-[#FFB800] transition-colors">
                    Bank Data Reprocessing
                  </h4>
                  <p className="text-[11px] text-[#8E99AE] mt-1">
                    Fix historical reconciliation & merge duplicates
                  </p>
                </div>
              </div>
            </div>

            {/* Restricted Data Management */}
            <div className="bg-[#161C28] border border-[#FF4D4D]/30 rounded-2xl p-5 space-y-3">
              <div className="flex items-center justify-between pb-3 border-b border-[#1E2635]">
                <div className="flex items-center gap-2">
                  <AlertTriangle size={16} className="text-[#FF4D4D]" />
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">Data Management</h3>
                </div>
                <span className="text-[10px] font-bold text-[#FF4D4D] bg-[#FF4D4D]/10 px-2 py-0.5 rounded border border-[#FF4D4D]/30">
                  RESTRICTED
                </span>
              </div>

              <div
                onClick={onOpenClearData}
                className="p-4 rounded-xl bg-[#0D121D] hover:bg-[#FF4D4D]/5 border border-[#FF4D4D]/20 hover:border-[#FF4D4D]/50 cursor-pointer transition-colors flex items-center justify-between group"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-[#FF4D4D]/10 text-[#FF4D4D] flex items-center justify-center shrink-0">
                    <Trash2 size={20} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white group-hover:text-[#FF4D4D] transition-colors">
                        Clear All Sales Data
                      </span>
                      <FintechBadge label="Irreversible" color="#FF4D4D" />
                    </div>
                    <p className="text-[11px] text-[#8E99AE] mt-0.5">
                      Wipe all uploaded records from Firestore cloud store & purge local cache
                    </p>
                  </div>
                </div>
                <AlertTriangle size={18} className="text-[#FF4D4D] shrink-0" />
              </div>
            </div>

            {/* Account & Session Card */}
            <div className="bg-[#161C28] border border-[#1E2635] rounded-2xl p-5 flex items-center justify-between">
              <div className="flex items-center gap-3.5">
                <div className="relative">
                  <div className="w-12 h-12 rounded-xl bg-[#00D1FF]/10 border border-[#00D1FF]/30 flex items-center justify-center text-[#00D1FF] font-black text-sm uppercase">
                    {user?.username?.substring(0, 2) || 'DA'}
                  </div>
                  <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-[#00FF94] border-2 border-[#161C28]" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">
                    {user?.displayName || `${user?.username || 'dani'} (Manager)`}
                  </h4>
                  <span className="text-xs text-[#8E99AE]">
                    Active Enterprise Session • Role: {(user?.role || 'MANAGER').toUpperCase()}
                  </span>
                </div>
              </div>

              <button
                onClick={logout}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#FF4D4D]/10 hover:bg-[#FF4D4D]/20 border border-[#FF4D4D]/30 text-[#FF4D4D] text-xs font-bold transition-colors"
              >
                <LogOut size={14} />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
