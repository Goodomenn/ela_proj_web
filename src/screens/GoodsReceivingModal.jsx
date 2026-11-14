import React, { useState, useEffect } from 'react';
import { X, PackageCheck, Check, Ban } from 'lucide-react';
import { db, doc, setDoc, subscribeToPurchases, formatETB } from '../services/firebaseClient';
import { useAuth } from '../context/AuthContext';

export default function GoodsReceivingModal({ isOpen, onClose }) {
  const { user } = useAuth();
  const [purchases, setPurchases] = useState([]);
  const [savingId, setSavingId] = useState(null);

  useEffect(() => {
    if (!isOpen) return;
    const unsub = subscribeToPurchases(setPurchases);
    return () => unsub();
  }, [isOpen]);

  if (!isOpen) return null;

  // Flatten pending items
  const pendingItems = [];
  purchases.forEach(p => {
    if (Array.isArray(p.items)) {
      p.items.forEach(it => {
        if (!it.receivingStatus || it.receivingStatus === 'PENDING') {
          pendingItems.push({ ...it, purchaseId: p.id, wholePurchase: p });
        }
      });
    }
  });

  const handleUpdateStatus = async (item, status, reason = '') => {
    setSavingId(item.id);
    try {
      if (db) {
        const p = item.wholePurchase;
        const updatedItems = p.items.map(it => {
          if (it.id === item.id) {
            return {
              ...it,
              receivingStatus: status,
              receivedBy: user?.username || 'dani',
              receivedAt: new Date().toISOString(),
              deniedReason: reason || null
            };
          }
          return it;
        });

        await setDoc(doc(db, 'purchases', p.id), {
          ...p,
          items: updatedItems,
          updatedAt: new Date().toISOString()
        }, { merge: true });
      }
    } catch (err) {
      alert('Error updating item: ' + err.message);
    } finally {
      setSavingId(null);
    }
  };

  const handleDenyPrompt = (item) => {
    const reason = window.prompt(`Reason for denying ${item.productName}:`, 'Damaged on delivery');
    if (reason) {
      handleUpdateStatus(item, 'DENIED', reason);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-[#161C28] border border-[#1E2635] rounded-2xl p-5 space-y-4 max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-[#1E2635]">
          <div className="flex items-center gap-2 text-[#00E5FF]">
            <PackageCheck size={18} />
            <h3 className="text-sm font-bold text-white">Goods Receiving Verification</h3>
          </div>
          <button onClick={onClose} className="text-[#8E99AE] hover:text-white">
            <X size={18} />
          </button>
        </div>

        {pendingItems.length === 0 ? (
          <div className="p-8 text-center bg-[#0D121D] border border-[#1E2635] rounded-2xl">
            <p className="text-xs text-[#8E99AE]">No pending goods awaiting intake verification.</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {pendingItems.map((item) => (
              <div key={item.id} className="p-3 rounded-xl bg-[#0D121D] border border-[#1E2635] flex items-center justify-between gap-3 text-xs">
                <div>
                  <h4 className="font-bold text-white text-xs">{item.productName}</h4>
                  <div className="text-[11px] text-[#8E99AE] mt-0.5 space-x-2">
                    <span>Qty: <strong className="text-white">{item.quantity}</strong></span>
                    <span>Cost: <strong className="text-white">{formatETB(item.costPerItem)}</strong></span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    disabled={savingId === item.id}
                    onClick={() => handleUpdateStatus(item, 'CONFIRMED')}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#00FF94]/15 border border-[#00FF94]/40 text-[#00FF94] hover:bg-[#00FF94]/25 text-xs font-bold transition-colors"
                  >
                    <Check size={13} />
                    <span>Confirm</span>
                  </button>

                  <button
                    disabled={savingId === item.id}
                    onClick={() => handleDenyPrompt(item)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#FF4D4D]/15 border border-[#FF4D4D]/40 text-[#FF4D4D] hover:bg-[#FF4D4D]/25 text-xs font-bold transition-colors"
                  >
                    <Ban size={13} />
                    <span>Deny</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

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
