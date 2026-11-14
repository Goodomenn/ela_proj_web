import React, { useState } from 'react';
import { X, Banknote, CheckCircle2 } from 'lucide-react';
import { db, collection, addDoc, formatETB } from '../services/firebaseClient';
import { useAuth } from '../context/AuthContext';

export default function RecordCashIncomeModal({ isOpen, onClose }) {
  const { user } = useAuth();
  const [amount, setAmount] = useState('');
  const [sender, setSender] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!amount) return;
    setSaving(true);

    try {
      if (db) {
        await addDoc(collection(db, 'transactions'), {
          bankName: 'Cash',
          amount: parseFloat(amount) || 0,
          isIncome: true,
          sender: sender || 'Cashier Counter',
          receiver: 'Drawer Vault',
          referenceCode: `CASH_${Date.now()}`,
          timestamp: new Date().toISOString(),
          forwarderUsername: user?.username || 'dani',
          isReconciled: true,
          notes: notes
        });
      }
      onClose();
    } catch (err) {
      alert('Error recording cash income: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-md bg-[#161C28] border border-[#1E2635] rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#1E2635]">
          <div className="flex items-center gap-2 text-[#00FF94]">
            <Banknote size={18} />
            <h3 className="text-sm font-bold text-white">Record Cash Income</h3>
          </div>
          <button onClick={onClose} className="text-[#8E99AE] hover:text-white">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div>
            <label className="text-[10px] font-bold text-[#8E99AE] uppercase block mb-1">Cash Amount (ETB)</label>
            <input
              type="number"
              step="any"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="e.g. 1500"
              className="w-full px-3 py-2 rounded-xl bg-[#0D121D] border border-[#1E2635] text-white text-base font-bold focus:outline-none focus:border-[#00FF94]"
              required
            />
          </div>

          <div>
            <label className="text-[10px] font-bold text-[#8E99AE] uppercase block mb-1">Source / Payer Name</label>
            <input
              type="text"
              value={sender}
              onChange={(e) => setSender(e.target.value)}
              placeholder="e.g. Counter Cashier, Direct Guest"
              className="w-full px-3 py-2 rounded-xl bg-[#0D121D] border border-[#1E2635] text-white focus:outline-none focus:border-[#00D1FF]"
            />
          </div>

          <div>
            <label className="text-[10px] font-bold text-[#8E99AE] uppercase block mb-1">Notes / Reason</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Additional receipt or drawer note..."
              rows={2}
              className="w-full px-3 py-2 rounded-xl bg-[#0D121D] border border-[#1E2635] text-white focus:outline-none focus:border-[#00D1FF]"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-[#1E2635]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-[#8E99AE] hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 rounded-xl bg-[#00FF94] text-[#0D121D] text-xs font-bold hover:bg-[#00FF94]/90"
            >
              {saving ? 'Recording...' : 'Record Cash'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
