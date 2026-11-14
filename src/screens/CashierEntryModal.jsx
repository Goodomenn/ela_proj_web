import React, { useState } from 'react';
import { X, Calculator, Plus } from 'lucide-react';
import { db, doc, setDoc, getDoc, formatETB } from '../services/firebaseClient';
import { useAuth } from '../context/AuthContext';

export default function CashierEntryModal({ isOpen, onClose }) {
  const { user } = useAuth();
  const [itemName, setItemName] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [moneyReceived, setMoneyReceived] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [saving, setSaving] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!itemName || !moneyReceived) return;
    setSaving(true);

    try {
      const uid = user?.uid || 'cashier_dani';
      const uname = user?.username || 'dani';
      const dateClean = date.replaceAll('-', '');
      const reportId = `cashier_${uid}_${dateClean}`;

      const amt = parseFloat(moneyReceived) || 0;
      const qty = parseInt(quantity, 10) || 1;

      if (db) {
        const reportRef = doc(db, 'cashier_daily_reports', reportId);
        const existingSnap = await getDoc(reportRef);
        let existingSales = [];
        let totalMoney = amt;
        let totalItems = qty;

        if (existingSnap.exists()) {
          const data = existingSnap.data();
          existingSales = Array.isArray(data.sales) ? data.sales : [];
          totalMoney = (Number(data.totalMoneyReceived) || 0) + amt;
          totalItems = (Number(data.totalItemsSold) || 0) + qty;
        }

        const newSale = {
          id: `sale_${Date.now()}`,
          itemName: itemName.trim(),
          quantity: qty,
          moneyReceived: amt,
          createdAt: new Date().toISOString()
        };

        await setDoc(reportRef, {
          id: reportId,
          cashierId: uid,
          cashierName: uname,
          reportDate: date,
          totalItemsSold: totalItems,
          totalMoneyReceived: totalMoney,
          dailyShortage: 0,
          status: 'SUBMITTED',
          updatedAt: new Date().toISOString(),
          sales: [...existingSales, newSale]
        }, { merge: true });
      }

      onClose();
    } catch (err) {
      alert('Error saving cashier entry: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-md bg-[#161C28] border border-[#1E2635] rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#1E2635]">
          <div className="flex items-center gap-2 text-[#FFAB40]">
            <Calculator size={18} />
            <h3 className="text-sm font-bold text-white">Manual Sales Entry</h3>
          </div>
          <button onClick={onClose} className="text-[#8E99AE] hover:text-white">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div>
            <label className="text-[10px] font-bold text-[#8E99AE] uppercase block mb-1">Item / Menu Name</label>
            <input
              type="text"
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              placeholder="e.g. Special Tibs, Bottled Water"
              className="w-full px-3 py-2 rounded-xl bg-[#0D121D] border border-[#1E2635] text-white focus:outline-none focus:border-[#FFAB40]"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] font-bold text-[#8E99AE] uppercase block mb-1">Quantity</label>
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#0D121D] border border-[#1E2635] text-white focus:outline-none focus:border-[#FFAB40]"
                required
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-[#8E99AE] uppercase block mb-1">Money Received (ETB)</label>
              <input
                type="number"
                step="any"
                value={moneyReceived}
                onChange={(e) => setMoneyReceived(e.target.value)}
                placeholder="0.00"
                className="w-full px-3 py-2 rounded-xl bg-[#0D121D] border border-[#1E2635] text-white font-bold focus:outline-none focus:border-[#FFAB40]"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-bold text-[#8E99AE] uppercase block mb-1">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-[#0D121D] border border-[#1E2635] text-white focus:outline-none focus:border-[#FFAB40]"
              required
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
              className="px-5 py-2 rounded-xl bg-[#FFAB40] text-[#0D121D] text-xs font-bold hover:bg-[#FFAB40]/90"
            >
              {saving ? 'Adding...' : 'Add Sale Record'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
