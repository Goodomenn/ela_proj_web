import React, { useState } from 'react';
import { X, ShoppingCart, Plus } from 'lucide-react';
import { db, doc, setDoc, getDoc, formatETB } from '../services/firebaseClient';
import { useAuth } from '../context/AuthContext';

export default function PurchaseEntryModal({ isOpen, onClose }) {
  const { user } = useAuth();
  const [productName, setProductName] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [costPerItem, setCostPerItem] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [saving, setSaving] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!productName || !costPerItem) return;
    setSaving(true);

    try {
      const dateClean = date.replaceAll('-', '');
      const reportId = `daily_purchase_${dateClean}`;
      const qty = parseInt(quantity, 10) || 1;
      const cost = parseFloat(costPerItem) || 0;
      const total = qty * cost;

      if (db) {
        const purchaseRef = doc(db, 'purchases', reportId);
        const existingSnap = await getDoc(purchaseRef);
        let existingItems = [];
        let totalCost = total;
        let totalItems = qty;

        if (existingSnap.exists()) {
          const data = existingSnap.data();
          existingItems = Array.isArray(data.items) ? data.items : [];
          totalCost = (Number(data.totalCost) || 0) + total;
          totalItems = (Number(data.totalItems) || 0) + qty;
        }

        const newItem = {
          id: `item_${Date.now()}`,
          purchaseId: reportId,
          productId: `prod_${Date.now()}`,
          productName: productName.trim(),
          quantity: qty,
          costPerItem: cost,
          totalCost: total,
          receivingStatus: 'PENDING',
          hasReceipt: true,
          createdAt: new Date().toISOString()
        };

        await setDoc(purchaseRef, {
          id: reportId,
          purchaseUserId: user?.uid || 'user_dani',
          purchaseUserName: user?.username || 'dani',
          purchaseDate: date,
          totalItems,
          totalCost,
          status: 'ORDERED',
          updatedAt: new Date().toISOString(),
          items: [...existingItems, newItem]
        }, { merge: true });
      }

      onClose();
    } catch (err) {
      alert('Error creating purchase order: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-md bg-[#161C28] border border-[#1E2635] rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#1E2635]">
          <div className="flex items-center gap-2 text-[#448AFF]">
            <ShoppingCart size={18} />
            <h3 className="text-sm font-bold text-white">Purchase Entry</h3>
          </div>
          <button onClick={onClose} className="text-[#8E99AE] hover:text-white">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div>
            <label className="text-[10px] font-bold text-[#8E99AE] uppercase block mb-1">Product / Item Name</label>
            <input
              type="text"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              placeholder="e.g. Tomatoes, Cooking Oil, Napkins"
              className="w-full px-3 py-2 rounded-xl bg-[#0D121D] border border-[#1E2635] text-white focus:outline-none focus:border-[#448AFF]"
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
                className="w-full px-3 py-2 rounded-xl bg-[#0D121D] border border-[#1E2635] text-white focus:outline-none focus:border-[#448AFF]"
                required
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-[#8E99AE] uppercase block mb-1">Unit Cost (ETB)</label>
              <input
                type="number"
                step="any"
                value={costPerItem}
                onChange={(e) => setCostPerItem(e.target.value)}
                placeholder="0.00"
                className="w-full px-3 py-2 rounded-xl bg-[#0D121D] border border-[#1E2635] text-white font-bold focus:outline-none focus:border-[#448AFF]"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-bold text-[#8E99AE] uppercase block mb-1">Purchase Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-[#0D121D] border border-[#1E2635] text-white focus:outline-none focus:border-[#448AFF]"
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
              className="px-5 py-2 rounded-xl bg-[#448AFF] text-white text-xs font-bold hover:bg-[#448AFF]/90"
            >
              {saving ? 'Creating...' : 'Create Purchase Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
