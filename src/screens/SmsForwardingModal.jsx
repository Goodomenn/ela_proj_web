import React, { useState } from 'react';
import { X, Radio, Check, Smartphone } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function SmsForwardingModal({ isOpen, onClose }) {
  const { user } = useAuth();
  const [forwarderName, setForwarderName] = useState(user?.username || 'dani');
  const [enabled, setEnabled] = useState(true);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-sm bg-[#161C28] border border-[#1E2635] rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#1E2635]">
          <div className="flex items-center gap-2 text-[#00D1FF]">
            <Radio size={18} />
            <h3 className="text-sm font-bold text-white">SMS Forwarding Gateway</h3>
          </div>
          <button onClick={onClose} className="text-[#8E99AE] hover:text-white">
            <X size={18} />
          </button>
        </div>

        <div className="space-y-3 text-xs">
          <div className="flex items-center justify-between p-3 rounded-xl bg-[#0D121D] border border-[#1E2635]">
            <div>
              <span className="font-bold text-white block">Forwarding Listener</span>
              <span className="text-[10px] text-[#8E99AE]">Relay bank incoming transactions</span>
            </div>
            <button
              onClick={() => setEnabled(!enabled)}
              className={`w-11 h-6 rounded-full transition-colors relative flex items-center px-0.5 ${
                enabled ? 'bg-[#00D1FF]' : 'bg-[#1E2635]'
              }`}
            >
              <div className={`w-5 h-5 rounded-full bg-white transition-transform ${enabled ? 'translate-x-5' : 'translate-x-0'}`} />
            </button>
          </div>

          <div>
            <label className="text-[10px] font-bold text-[#8E99AE] uppercase block mb-1">Forwarder Username Tag</label>
            <input
              type="text"
              value={forwarderName}
              onChange={(e) => setForwarderName(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-[#0D121D] border border-[#1E2635] text-white focus:outline-none focus:border-[#00D1FF]"
            />
          </div>

          <div className="p-3 rounded-xl bg-[#00D1FF]/10 border border-[#00D1FF]/20 text-[#8E99AE] space-y-1">
            <span className="font-bold text-white text-[11px] block">Web Receiver Ready</span>
            <p className="text-[10px] leading-relaxed">
              When Android or physical gateway receives SMS from CBE, Telebirr, or Awash Bank, it posts directly to Firestore. The web terminal synchronizes in real time.
            </p>
          </div>
        </div>

        <div className="flex justify-end pt-2 border-t border-[#1E2635]">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-[#00D1FF] text-[#0D121D] text-xs font-bold hover:bg-[#00D1FF]/90"
          >
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
}
