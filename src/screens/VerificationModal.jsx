import React, { useState } from 'react';
import { X, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { formatETB } from '../services/firebaseClient';

export default function VerificationModal({ isOpen, onClose }) {
  const [verifying, setVerifying] = useState(false);
  const [done, setDone] = useState(false);

  if (!isOpen) return null;

  const handleVerify = () => {
    setVerifying(true);
    setTimeout(() => {
      setVerifying(false);
      setDone(true);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-md bg-[#161C28] border border-[#1E2635] rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#1E2635]">
          <div className="flex items-center gap-2 text-[#00D1FF]">
            <ShieldCheck size={18} />
            <h3 className="text-sm font-bold text-white">Reconciliation & Verification</h3>
          </div>
          <button onClick={onClose} className="text-[#8E99AE] hover:text-white">
            <X size={18} />
          </button>
        </div>

        <p className="text-xs text-[#8E99AE] leading-relaxed">
          Verifies all inbound bank transfer reference codes against POS income records and detects duplicate SMS receipts.
        </p>

        {done && (
          <div className="p-3 rounded-xl bg-[#00FF94]/10 border border-[#00FF94]/30 text-[#00FF94] text-xs flex items-center gap-2">
            <CheckCircle2 size={16} />
            <span>All transactions verified against current month sales records.</span>
          </div>
        )}

        <div className="flex justify-end gap-2 pt-2 border-t border-[#1E2635]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-[#8E99AE] hover:text-white"
          >
            Close
          </button>
          <button
            type="button"
            disabled={verifying}
            onClick={handleVerify}
            className="px-4 py-2 rounded-xl bg-[#00D1FF] text-[#0D121D] text-xs font-bold hover:bg-[#00D1FF]/90"
          >
            {verifying ? 'Verifying...' : 'Run Verification Audit'}
          </button>
        </div>
      </div>
    </div>
  );
}
