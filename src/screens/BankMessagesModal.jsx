import React, { useState, useEffect } from 'react';
import { X, Mail, Search } from 'lucide-react';
import { subscribeToTransactions } from '../services/firebaseClient';

export default function BankMessagesModal({ isOpen, onClose }) {
  const [transactions, setTransactions] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    const unsub = subscribeToTransactions(setTransactions);
    return () => unsub();
  }, [isOpen]);

  if (!isOpen) return null;

  const messages = transactions.filter(t => t.rawMessage || t.sender);

  const filtered = messages.filter(m => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (m.rawMessage || '').toLowerCase().includes(q) || (m.bankName || '').toLowerCase().includes(q);
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-[#161C28] border border-[#1E2635] rounded-2xl p-5 space-y-4 max-h-[85vh] flex flex-col">
        <div className="flex items-center justify-between pb-3 border-b border-[#1E2635]">
          <div className="flex items-center gap-2 text-[#339AF0]">
            <Mail size={18} />
            <h3 className="text-sm font-bold text-white">Forwarded Bank Messages Feed</h3>
          </div>
          <button onClick={onClose} className="text-[#8E99AE] hover:text-white">
            <X size={18} />
          </button>
        </div>

        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filter raw messages..."
          className="w-full px-3 py-2 rounded-xl bg-[#0D121D] border border-[#1E2635] text-white text-xs focus:outline-none focus:border-[#339AF0]"
        />

        <div className="flex-1 overflow-y-auto space-y-2 pr-1">
          {filtered.length === 0 ? (
            <p className="p-6 text-center text-xs text-[#8E99AE]">No raw bank messages found.</p>
          ) : (
            filtered.map((m) => (
              <div key={m.id} className="p-3 rounded-xl bg-[#0D121D] border border-[#1E2635] space-y-1.5 text-xs">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-[#00D1FF]">{m.bankName || 'Bank SMS'}</span>
                  <span className="text-[10px] text-[#8E99AE]">
                    {m.timestamp ? new Date(m.timestamp).toLocaleTimeString() : 'Recent'}
                  </span>
                </div>
                <p className="font-mono text-[11px] text-[#8E99AE] leading-relaxed break-words">
                  {m.rawMessage || `Received ETB ${m.amount} from ${m.sender || 'Unknown'} (Ref: ${m.referenceCode || 'N/A'})`}
                </p>
              </div>
            ))
          )}
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
