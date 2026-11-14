import React from 'react';
import { 
  LayoutDashboard, 
  BarChart2, 
  History, 
  Radio, 
  Lock, 
  LogOut, 
  Zap, 
  MailCheck, 
  HelpCircle, 
  Info,
  X,
  UserCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function FintechDrawer({
  isOpen,
  onClose,
  onNavigate,
  onOpenSmsForwarding,
  onOpenChangePassword,
  onOpenReprocess,
  onOpenRawMessages
}) {
  const { user, logout } = useAuth();
  const username = user?.username || 'dani';
  const roleLabel = (user?.roleLabel || user?.role || 'MANAGER').toUpperCase();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div 
        onClick={onClose} 
        className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
      />

      {/* Drawer Container */}
      <div className="relative w-72 max-w-[80vw] h-full bg-[#0D121D] border-r border-[#1E2635] flex flex-col z-10 shadow-2xl">
        {/* Header Profile Section */}
        <div className="p-6 border-b border-[#1E2635] flex flex-col items-center text-center relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-lg text-[#8E99AE] hover:text-white hover:bg-[#161C28]"
          >
            <X size={18} />
          </button>

          {/* Avatar with active indicator */}
          <div className="relative mb-3">
            <div className="w-16 h-16 rounded-2xl bg-[#339AF0]/10 border border-[#339AF0]/30 flex items-center justify-center text-[#00D1FF]">
              <UserCheck size={32} />
            </div>
            <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-[#00FF94] border-2 border-[#0D121D]" />
          </div>

          <h3 className="text-base font-bold text-white tracking-wide">
            {username}
          </h3>
          <span className="mt-1.5 px-2.5 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase bg-[#00D1FF]/10 text-[#00D1FF] border border-[#00D1FF]/40">
            {roleLabel}
          </span>
        </div>

        {/* Scrollable Navigation Options */}
        <div className="flex-1 overflow-y-auto py-3 px-3 space-y-1">
          <DrawerTile 
            icon={LayoutDashboard} 
            label="DASHBOARD" 
            onClick={() => { onClose(); onNavigate('home'); }} 
          />
          <DrawerTile 
            icon={BarChart2} 
            label="STATISTICS" 
            onClick={() => { onClose(); onNavigate('audit'); }} 
          />
          <DrawerTile 
            icon={History} 
            label="HISTORY" 
            onClick={() => { onClose(); onNavigate('transactions'); }} 
          />

          <div className="pt-3 pb-1 px-3">
            <div className="h-px bg-[#1E2635] mb-3" />
            <span className="text-[10px] font-bold text-[#8E99AE] tracking-widest uppercase">
              Account & Security
            </span>
          </div>

          <DrawerTile 
            icon={Radio} 
            label="SMS FORWARDING" 
            color="#00D1FF"
            onClick={() => { onClose(); onOpenSmsForwarding(); }} 
          />
          <DrawerTile 
            icon={Lock} 
            label="CHANGE PASSWORD" 
            color="#00D1FF"
            onClick={() => { onClose(); onOpenChangePassword(); }} 
          />
          <DrawerTile 
            icon={LogOut} 
            label="LOGOUT" 
            color="#FF4D4D"
            onClick={() => { onClose(); logout(); }} 
          />

          <div className="pt-3 pb-1 px-3">
            <div className="h-px bg-[#1E2635] mb-3" />
            <span className="text-[10px] font-bold text-[#8E99AE] tracking-widest uppercase">
              Data & Transactions
            </span>
          </div>

          <DrawerTile 
            icon={Zap} 
            label="REPROCESS BANK DATA" 
            color="#FFB800"
            onClick={() => { onClose(); onOpenReprocess(); }} 
          />
          <DrawerTile 
            icon={MailCheck} 
            label="RAW BANK MESSAGES" 
            color="#339AF0"
            onClick={() => { onClose(); onOpenRawMessages(); }} 
          />

          <div className="pt-3 pb-1 px-3">
            <div className="h-px bg-[#1E2635] mb-3" />
          </div>

          <DrawerTile 
            icon={HelpCircle} 
            label="SUPPORT" 
            onClick={onClose} 
          />
          <DrawerTile 
            icon={Info} 
            label="ABOUT" 
            onClick={onClose} 
          />
        </div>

        {/* Footer info */}
        <div className="p-4 border-t border-[#1E2635] flex flex-col items-center">
          <span className="text-[10px] font-bold text-[#8E99AE] tracking-wider uppercase">
            VERSION 1.0.4
          </span>
          <div className="w-10 h-0.5 bg-[#00D1FF]/40 rounded-full mt-2" />
        </div>
      </div>
    </div>
  );
}

function DrawerTile({ icon: Icon, label, onClick, color }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[#161C28] text-left transition-colors group"
    >
      <Icon 
        size={18} 
        style={{ color: color || '#8E99AE' }} 
        className="shrink-0 transition-transform group-hover:scale-110" 
      />
      <span 
        style={{ color: color || '#FFFFFF' }} 
        className="text-[12px] font-semibold tracking-wider"
      >
        {label}
      </span>
    </button>
  );
}
