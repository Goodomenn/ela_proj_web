import React, { useState } from 'react';
import { X, ShieldAlert, Check, UserPlus } from 'lucide-react';
import { AppPermissions } from '../context/AuthContext';

export default function RbacManagementModal({ isOpen, onClose }) {
  const [roles, setRoles] = useState([
    { id: '1', name: 'Admin / Manager', perms: ['ALL'] },
    { id: '2', name: 'Cashier', perms: ['cashier_entry', 'cashier_reports'] },
    { id: '3', name: 'Purchase', perms: ['purchase.view', 'purchase.edit', 'purchase.enter_log'] },
    { id: '4', name: 'Goods Receiving', perms: ['goods_receiving', 'inventory'] },
    { id: '5', name: 'Message Forwarding', perms: ['messages', 'my_transactions'] }
  ]);
  const [selectedRole, setSelectedRole] = useState(roles[0]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-[#161C28] border border-[#1E2635] rounded-2xl p-5 space-y-4 max-h-[85vh] flex flex-col">
        <div className="flex items-center justify-between pb-3 border-b border-[#1E2635]">
          <div className="flex items-center gap-2 text-[#00D1FF]">
            <ShieldAlert size={18} />
            <h3 className="text-sm font-bold text-white">Access Control (RBAC)</h3>
          </div>
          <button onClick={onClose} className="text-[#8E99AE] hover:text-white">
            <X size={18} />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3 flex-1 overflow-y-auto">
          {/* Roles List */}
          <div className="space-y-1.5 border-r border-[#1E2635] pr-2">
            <span className="text-[10px] font-bold text-[#8E99AE] uppercase block mb-1">Defined Roles</span>
            {roles.map(r => (
              <button
                key={r.id}
                onClick={() => setSelectedRole(r)}
                className={`w-full text-left p-2.5 rounded-xl border text-xs font-semibold transition-colors ${
                  selectedRole.id === r.id 
                    ? 'bg-[#00D1FF]/15 border-[#00D1FF] text-white' 
                    : 'bg-[#0D121D] border-[#1E2635] text-[#8E99AE] hover:text-white'
                }`}
              >
                {r.name}
              </button>
            ))}
          </div>

          {/* Permissions for Selected Role */}
          <div className="space-y-1.5 pl-1">
            <span className="text-[10px] font-bold text-[#8E99AE] uppercase block mb-1">
              Permissions for {selectedRole.name}
            </span>
            <div className="space-y-1 text-xs max-h-56 overflow-y-auto">
              {selectedRole.perms.includes('ALL') ? (
                <div className="p-2 rounded-lg bg-[#00FF94]/10 border border-[#00FF94]/30 text-[#00FF94] text-[11px] font-semibold">
                  Full Administrative Privileges (All Permissions Granted)
                </div>
              ) : (
                selectedRole.perms.map(p => (
                  <div key={p} className="flex items-center gap-2 p-1.5 rounded bg-[#0D121D] text-[#8E99AE] text-[11px]">
                    <Check size={12} className="text-[#00D1FF]" />
                    <span className="capitalize">{p.replace('_', ' ')}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-2 border-t border-[#1E2635]">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-[#00D1FF] text-[#0D121D] text-xs font-bold hover:bg-[#00D1FF]/90"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
