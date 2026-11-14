import React, { useState } from 'react';
import { X, Receipt, UploadCloud } from 'lucide-react';
import { db, collection, addDoc, formatETB } from '../services/firebaseClient';
import { useAuth } from '../context/AuthContext';

export default function ExpenseEntryModal({ isOpen, onClose }) {
  const { user } = useAuth();
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Supplies');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [receiptUrl, setReceiptUrl] = useState('');
  const [saving, setSaving] = useState(false);

  if (!isOpen) return null;

  const categories = ['Supplies', 'F&B Raw', 'Logistics', 'Utilities', 'Maintenance', 'Other'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!amount || !description) return;
    setSaving(true);

    try {
      if (db) {
        await addDoc(collection(db, 'expense_entries'), {
          userId: user?.uid || 'user_dani',
          username: user?.username || 'dani',
          description: description.trim(),
          amount: parseFloat(amount) || 0,
          category,
          date,
          receiptUrl: receiptUrl.trim() || null,
          createdAt: new Date().toISOString()
        });
      }
      onClose();
    } catch (err) {
      alert('Error saving expense: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-md bg-[#161C28] border border-[#1E2635] rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#1E2635]">
          <div className="flex items-center gap-2 text-[#7C4DFF]">
            <Receipt size={18} />
            <h3 className="text-sm font-bold text-white">Expense Entry</h3>
          </div>
          <button onClick={onClose} className="text-[#8E99AE] hover:text-white">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div>
            <label className="text-[10px] font-bold text-[#8E99AE] uppercase block mb-1">Expense Description</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Fresh Meat purchase, Cleaning detergents"
              className="w-full px-3 py-2 rounded-xl bg-[#0D121D] border border-[#1E2635] text-white focus:outline-none focus:border-[#7C4DFF]"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] font-bold text-[#8E99AE] uppercase block mb-1">Amount (ETB)</label>
              <input
                type="number"
                step="any"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full px-3 py-2 rounded-xl bg-[#0D121D] border border-[#1E2635] text-white font-bold focus:outline-none focus:border-[#7C4DFF]"
                required
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-[#8E99AE] uppercase block mb-1">Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#0D121D] border border-[#1E2635] text-white focus:outline-none focus:border-[#7C4DFF]"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-bold text-[#8E99AE] uppercase block mb-1">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-[#0D121D] border border-[#1E2635] text-white focus:outline-none focus:border-[#7C4DFF]"
            >
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div>
            <label className="text-[10px] font-bold text-[#8E99AE] uppercase block mb-1">Receipt Image URL (Optional)</label>
            <input
              type="url"
              value={receiptUrl}
              onChange={(e) => setReceiptUrl(e.target.value)}
              placeholder="https://..."
              className="w-full px-3 py-2 rounded-xl bg-[#0D121D] border border-[#1E2635] text-white focus:outline-none focus:border-[#7C4DFF]"
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
              className="px-5 py-2 rounded-xl bg-[#7C4DFF] text-white text-xs font-bold hover:bg-[#7C4DFF]/90"
            >
              {saving ? 'Logging...' : 'Log Expense'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
