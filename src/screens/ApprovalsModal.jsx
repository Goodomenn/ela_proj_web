import React, { useState, useEffect } from 'react';
import { X, UserCheck, Check, Ban, Clock, AlertCircle, Shield } from 'lucide-react';
import { subscribeToPendingUsers, approveUser, rejectUser } from '../services/rbacService';

export default function ApprovalsModal({ isOpen, onClose }) {
  const [pendingUsers, setPendingUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionInProgress, setActionInProgress] = useState(null);
  const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    if (!isOpen) return;
    setLoading(true);
    const unsub = subscribeToPendingUsers((list) => {
      setPendingUsers(list);
      setLoading(false);
    });
    return () => unsub();
  }, [isOpen]);

  if (!isOpen) return null;

  const showFeedback = (msg, type = 'success') => {
    setFeedback({ msg, type });
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleApprove = async (user) => {
    setActionInProgress(user.id || user.uid);
    try {
      await approveUser(user.id || user.uid);
      showFeedback(`User "${user.username}" approved successfully.`, 'success');
    } catch (err) {
      showFeedback(`Failed to approve: ${err.message}`, 'error');
    } finally {
      setActionInProgress(null);
    }
  };

  const handleReject = async (user) => {
    if (!window.confirm(`Are you sure you want to reject and delete registration for "${user.username}"?`)) {
      return;
    }
    setActionInProgress(user.id || user.uid);
    try {
      await rejectUser(user.id || user.uid);
      showFeedback(`User "${user.username}" rejected and removed.`, 'info');
    } catch (err) {
      showFeedback(`Failed to reject: ${err.message}`, 'error');
    } finally {
      setActionInProgress(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-xl bg-[#161C28] border border-[#1E2635] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Modal Header */}
        <div className="p-5 border-b border-[#1E2635] flex items-center justify-between bg-[#121722]/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#339AF0]/10 border border-[#339AF0]/20 flex items-center justify-center text-[#339AF0]">
              <UserCheck size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white tracking-wide">User Registration Approvals</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#FFB020]/15 text-[#FFB020] border border-[#FFB020]/30">
                  {pendingUsers.length} PENDING
                </span>
              </div>
              <p className="text-xs text-[#8E99AE] mt-0.5">
                Review and approve staff account access requests to the live system
              </p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 rounded-xl text-[#8E99AE] hover:text-white hover:bg-[#1E2635] transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Feedback Alert */}
        {feedback && (
          <div className={`px-5 py-2.5 text-xs font-semibold flex items-center gap-2 border-b transition-all ${
            feedback.type === 'success' 
              ? 'bg-[#00FF94]/10 text-[#00FF94] border-[#00FF94]/20'
              : feedback.type === 'error'
              ? 'bg-[#FF4D4D]/10 text-[#FF4D4D] border-[#FF4D4D]/20'
              : 'bg-[#339AF0]/10 text-[#339AF0] border-[#339AF0]/20'
          }`}>
            <AlertCircle size={14} />
            <span>{feedback.msg}</span>
          </div>
        )}

        {/* User List Body */}
        <div className="p-5 flex-1 overflow-y-auto space-y-3">
          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center gap-3 text-[#8E99AE]">
              <div className="w-6 h-6 border-2 border-[#00D1FF] border-t-transparent rounded-full animate-spin" />
              <span className="text-xs font-medium">Checking Firestore for pending users...</span>
            </div>
          ) : pendingUsers.length === 0 ? (
            <div className="py-12 flex flex-col items-center justify-center gap-3 text-center">
              <div className="w-12 h-12 rounded-2xl bg-[#00FF94]/10 border border-[#00FF94]/20 flex items-center justify-center text-[#00FF94]">
                <Check size={24} />
              </div>
              <div>
                <p className="text-sm font-bold text-white">All caught up!</p>
                <p className="text-xs text-[#8E99AE] mt-1 max-w-xs">
                  There are currently no new employee accounts awaiting registration approval.
                </p>
              </div>
            </div>
          ) : (
            pendingUsers.map(u => {
              const uid = u.id || u.uid;
              const isWorking = actionInProgress === uid;
              return (
                <div 
                  key={uid} 
                  className="p-4 rounded-xl bg-[#0D121D] border border-[#1E2635] hover:border-[#2D3748] flex items-center justify-between gap-4 transition-all"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-[#1E2635] border border-[#2D3748] flex items-center justify-center text-white font-bold text-sm uppercase shrink-0">
                      {(u.username || '?')[0]}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-white truncate">{u.username}</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#FFB020]/15 text-[#FFB020] border border-[#FFB020]/30 shrink-0">
                          PENDING
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-[#8E99AE] mt-0.5 truncate">
                        <span className="flex items-center gap-1">
                          <Shield size={12} className="text-[#339AF0]" />
                          Role: <span className="text-white capitalize">{u.role || 'Staff'}</span>
                        </span>
                        <span>•</span>
                        <span className="font-mono text-[10px] text-[#8E99AE]">UID: {uid.substring(0, 8)}...</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleApprove(u)}
                      disabled={isWorking}
                      className="px-3 py-2 rounded-xl bg-[#00FF94]/15 border border-[#00FF94]/40 text-[#00FF94] hover:bg-[#00FF94]/25 transition-all flex items-center gap-1.5 text-xs font-bold disabled:opacity-50"
                      title="Approve User Registration"
                    >
                      <Check size={14} />
                      <span>Approve</span>
                    </button>
                    <button
                      onClick={() => handleReject(u)}
                      disabled={isWorking}
                      className="px-3 py-2 rounded-xl bg-[#FF4D4D]/15 border border-[#FF4D4D]/40 text-[#FF4D4D] hover:bg-[#FF4D4D]/25 transition-all flex items-center gap-1.5 text-xs font-bold disabled:opacity-50"
                      title="Reject and Delete User"
                    >
                      <Ban size={14} />
                      <span>Reject</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-[#121722]/80 border-t border-[#1E2635] flex items-center justify-between text-xs text-[#8E99AE]">
          <span>Changes take effect immediately across all connected web & mobile devices.</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-[#1E2635] text-white font-bold hover:bg-[#2D3748] transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
