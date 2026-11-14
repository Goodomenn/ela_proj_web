import React, { useState, useEffect } from 'react';
import { 
  ChevronLeft, 
  ShoppingCart, 
  Calendar, 
  User, 
  DollarSign, 
  Package,
  Plus
} from 'lucide-react';
import FintechHeader from '../components/FintechHeader';
import { FintechCard, FintechBadge } from '../components/FintechCard';
import { subscribeToPurchases, formatETB } from '../services/firebaseClient';

export default function PurchaseReportsScreen({ onBack, onOpenPurchaseEntry }) {
  const [purchases, setPurchases] = useState([]);

  useEffect(() => {
    const unsub = subscribeToPurchases(setPurchases);
    return () => unsub();
  }, []);

  return (
    <div className="flex-1 flex flex-col pb-6">
      <FintechHeader
        title="Purchase Reports"
        subtitle="RAW PROCUREMENT RECORDS & COSTS"
        showBackButton={true}
        showMenu={false}
        onBack={onBack}
        actions={
          <button
            onClick={onOpenPurchaseEntry}
            className="p-2 rounded-xl bg-[#161C28] border border-[#1E2635] text-[#00D1FF] hover:border-[#00D1FF]/50"
            title="Create Purchase"
          >
            <Plus size={17} />
          </button>
        }
      />

      <div className="px-5 pt-3 space-y-3">
        {purchases.length === 0 ? (
          <div className="p-8 text-center bg-[#161C28]/50 border border-[#1E2635] rounded-2xl">
            <p className="text-xs text-[#8E99AE]">No procurement orders on record.</p>
          </div>
        ) : (
          purchases.map((p) => {
            const items = p.items || [];
            return (
              <FintechCard key={p.id} className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <User size={15} className="text-[#448AFF]" />
                    <span className="text-xs font-bold text-white">{p.purchaseUserName || 'Purchaser'}</span>
                  </div>

                  <FintechBadge 
                    label={p.status || 'ORDERED'} 
                    color="#448AFF" 
                  />
                </div>

                <div className="grid grid-cols-2 gap-2 py-2 border-y border-[#1E2635] text-xs">
                  <div>
                    <span className="text-[10px] text-[#8E99AE] uppercase font-bold block">Total Procurement Cost</span>
                    <span className="text-sm font-bold text-[#00FF94]">{formatETB(p.totalCost || 0)}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#8E99AE] uppercase font-bold block">Total Items</span>
                    <span className="text-sm font-bold text-white">{p.totalItems || items.length}</span>
                  </div>
                </div>

                {items.length > 0 && (
                  <div className="space-y-1">
                    {items.map((it, idx) => (
                      <div key={idx} className="flex justify-between items-center p-2 rounded bg-[#0D121D] border border-[#1E2635] text-xs">
                        <span className="text-white font-medium">{it.productName}</span>
                        <div className="flex items-center gap-3">
                          <span className="text-[#8E99AE]">{it.quantity}x</span>
                          <span className="text-white font-semibold">{formatETB(it.totalCost || (it.quantity * it.costPerItem))}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </FintechCard>
            );
          })
        )}
      </div>
    </div>
  );
}
