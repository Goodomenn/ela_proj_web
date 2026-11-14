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
  Check
} from 'lucide-react';
import FintechHeader from '../components/FintechHeader';
import { FintechCard, SectionHeader, FintechHubTile, FintechBadge } from '../components/FintechCard';
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
    <div className="flex-1 flex flex-col pb-6">
      <FintechHeader
        title="Settings"
        subtitle="ENTERPRISE ADMIN"
        onMenuClick={onMenuClick}
      />

      <div className="px-5 space-y-4">
        {/* FIRESTORE TELEMETRY LIVE CARD */}
        <FintechCard className="flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-[#00D1FF]/10 border border-[#00D1FF]/30 flex items-center justify-center text-[#00D1FF]">
              <Radio size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-white tracking-wide">
                  Firestore Sync Live
                </span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#00FF94]/15 text-[#00FF94] border border-[#00FF94]/30">
                  12ms
                </span>
              </div>
              <p className="text-xs text-[#8E99AE] mt-0.5">
                CENET & LOOP telemetry connected
              </p>
            </div>
          </div>

          <button
            onClick={handleRefreshTelemetry}
            className="flex items-center gap-1.5 text-xs text-[#00D1FF] font-semibold hover:underline"
          >
            <RefreshCw size={13} className={isRefreshing ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>
        </FintechCard>

        {/* HARDWARE CONFIGURATION */}
        <div>
          <SectionHeader 
            title="Hardware Configuration" 
            action={
              <span className="text-[10px] font-bold text-[#8E99AE] tracking-widest uppercase">
                2 POS LINKED
              </span>
            } 
          />
          <FintechHubTile
            title="POS Devices"
            subtitle="Configure CENET and LOOP counters & thermal receipt devices"
            icon={Printer}
            iconColor="#00D1FF"
            badge={<FintechBadge label="2 Online" color="#00FF94" />}
            onTap={onOpenPosDevices}
          />
        </div>

        {/* DEVICE SMS CONFIGURATION */}
        <div>
          <SectionHeader title="Device SMS Configuration" />
          <FintechCard className="space-y-4">
            {/* Forwarding Switch */}
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm font-bold text-white block">Forwarding Service</span>
                <p className="text-xs text-[#8E99AE] mt-0.5">
                  Listen for incoming bank messages on this device.
                </p>
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

            {/* Sender IDs */}
            <div className="pt-2 border-t border-[#1E2635]">
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

            {/* Quick Actions */}
            <div className="pt-2 border-t border-[#1E2635] space-y-2">
              <button
                onClick={onOpenRawMessages}
                className="w-full flex items-center justify-between p-2.5 rounded-xl bg-[#0D121D] hover:bg-[#161C28] border border-[#1E2635] text-left transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <Mail size={16} className="text-[#00D1FF]" />
                  <div>
                    <span className="text-xs font-bold text-white block">Forwarded Bank Messages Feed</span>
                    <span className="text-[10px] text-[#8E99AE]">Live stream of raw incoming and forwarded SMS</span>
                  </div>
                </div>
                <ChevronRight size={15} className="text-[#8E99AE]" />
              </button>
            </div>
          </FintechCard>
        </div>

        {/* ADMINISTRATION */}
        <div>
          <SectionHeader title="Administration" />
          <FintechHubTile
            title="Access Control (RBAC)"
            subtitle="Manage user roles, pin permissions & credentials"
            icon={ShieldAlert}
            iconColor="#00D1FF"
            onTap={onOpenRbac}
          />
          <FintechHubTile
            title="User Registration Approvals"
            subtitle="Approve or reject new access requests"
            icon={UserCheck}
            iconColor="#339AF0"
            onTap={onOpenApprovals}
          />
          <FintechHubTile
            title="Manage Transfer Banks"
            subtitle="Add banks & CBE/telebirr accounts for deposit selection"
            icon={Building2}
            iconColor="#00D1FF"
            badge={<FintechBadge label="4 Active" color="#00D1FF" />}
            onTap={onOpenManageBanks}
          />
          <FintechHubTile
            title="Bank Data Reprocessing"
            subtitle="Fix historical reconciliation errors & merge duplicates"
            icon={Zap}
            iconColor="#FFB800"
            badge={<FintechBadge label="Audit" color="#FFB800" />}
            onTap={onOpenReprocess}
          />
        </div>

        {/* DATA MANAGEMENT */}
        <div>
          <SectionHeader 
            title="Data Management" 
            action={
              <span className="text-[10px] font-bold text-[#FF4D4D] tracking-widest uppercase">
                RESTRICTED
              </span>
            } 
          />
          <div
            onClick={onOpenClearData}
            className="flex items-center gap-3.5 p-3.5 bg-[#161C28] border border-[#FF4D4D]/30 rounded-2xl cursor-pointer hover:border-[#FF4D4D] transition-colors group"
          >
            <div className="w-11 h-11 rounded-xl bg-[#FF4D4D]/10 border border-[#FF4D4D]/30 flex items-center justify-center text-[#FF4D4D] shrink-0">
              <Trash2 size={20} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[13px] font-bold text-white">Clear All Sales Data</span>
                <FintechBadge label="Irreversible" color="#FF4D4D" />
              </div>
              <p className="text-[11px] text-[#8E99AE] mt-0.5 truncate">
                Wipe all uploaded records from Firestore cloud store & purge local storage cache
              </p>
            </div>
            <AlertTriangle size={18} className="text-[#FF4D4D] shrink-0" />
          </div>
        </div>

        {/* ACCOUNT & SESSION */}
        <div>
          <SectionHeader title="Account & Session" />
          <FintechCard className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-xl bg-[#00D1FF]/10 border border-[#00D1FF]/30 flex items-center justify-center text-[#00D1FF] font-bold text-xs uppercase">
                  {user?.username?.substring(0, 2) || 'DA'}
                </div>
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-[#00FF94] border border-[#161C28]" />
              </div>
              <div>
                <span className="text-xs font-bold text-white block">
                  {user?.displayName || 'dani (Manager)'}
                </span>
                <span className="text-[10px] text-[#8E99AE]">Enterprise Session Active</span>
              </div>
            </div>

            <button
              onClick={logout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FF4D4D]/10 border border-[#FF4D4D]/30 text-[#FF4D4D] text-xs font-bold hover:bg-[#FF4D4D]/20 transition-colors"
            >
              <LogOut size={13} />
              <span>Logout</span>
            </button>
          </FintechCard>
        </div>
      </div>
    </div>
  );
}
