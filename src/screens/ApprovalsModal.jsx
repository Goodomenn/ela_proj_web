import React, { useState } from 'react';
import { X, UserCheck, Check, Ban } from 'lucide-react';

export default function ApprovalsModal({ isOpen, onClose }) {
  const [users, setUsers] = useState([
    { id: 'u1', username: 'filly', role: 'Staff', status: 'approved' },
    { id: 'u2', username: 'dann', role: 'Cashier', status: 'approved' },
    { id: 'u3', username: 'solomon', role: 'Purchaser', status: 'pending' },
    { id: 'u4', username: 'hanna', role: 'Inventory', status: 'pending' }
  ]);

  if (!isOpen) return null;

  const handleApprove = (id) => {
    setUsers(users.map(u => u.id === id ? { ...u, status: 'approved' } : u));
  };

  const handleReject = (id) => {
    setUsers(users.filter(u => u.id !== id));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-md bg-[#161C28] border border-[#1E2635] rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#1E2635]">
          <div className="flex items-center gap-2 text-[#339AF0]">
            <UserCheck size={18} />
            <h3 className="text-sm font-bold text-white">User Registration Approvals</h3>
          </div>
          <button onClick={onClose} className="text-[#8E99AE] hover:text-white">
            <X size={18} />
          </button>
        </div>

        <div className="space-y-2 max-h-64 overflow-y-auto pr-1 text-xs">
          {users.map(u => (
            <div key={u.id} className="p-3 rounded-xl bg-[#0D121D] border border-[#1E2635] flex items-center justify-between">
              <div>
                <span className="font-bold text-white block">{u.username}</span>
                <span className="text-[10px] text-[#8E99AE]">Role: {u.role}</span>
              </div>

              {u.status === 'pending' ? (
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleApprove(u.id)}
                    className="p-1.5 rounded-lg bg-[#00FF94]/15 border border-[#00FF94]/40 text-[#00FF94] hover:bg-[#00FF94]/25"
                    title="Approve"
                  >
                    <Check size={14} />
                  </button>
                  <button
                    onClick={() => handleReject(u.id)}
                    className="p-1.5 rounded-lg bg-[#FF4D4D]/15 border border-[#FF4D4D]/40 text-[#FF4D4D] hover:bg-[#FF4D4D]/25"
                    title="Reject"
                  >
                    <Ban size={14} />
                  </button>
                </div>
              ) : (
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#00FF94]/15 text-[#00FF94] border border-[#00FF94]/30">
                  APPROVED
                </span>
              )}
            </div>
          ))}
        </div>

        <div className="flex justify-end pt-2 border-t border-[#1E2635]">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-[#1E2635] text-white text-xs font-bold hover:bg-[#2D3748]"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
