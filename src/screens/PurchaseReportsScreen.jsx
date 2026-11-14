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
    <div className="flex-1 flex flex-col min-h-screen">
      <FintechHeader
        title="Procurement & Purchase Reports"
        subtitle="RAW PROCUREMENT ORDERS & ITEM COSTS"
        category="Procurement Audit"
        showBackButton={true}
        showMenu={false}
        onBack={onBack}
        actions={
          <button
            onClick={onOpenPurchaseEntry}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#448AFF] hover:bg-[#448AFF]/90 text-white text-xs font-bold transition-colors shadow-lg shadow-[#448AFF]/20"
          >
            <Plus size={14} />
            <span className="hidden sm:inline">Create Purchase</span>
          </button>
        }
      />

      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Header Summary */}
        <div className="p-6 rounded-2xl bg-[#161C28] border border-[#1E2635] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <ShoppingCart size={16} className="text-[#448AFF]" />
              <span className="text-[10px] font-bold text-[#448AFF] tracking-wider uppercase">
                Requisitions & Cost History
              </span>
            </div>
            <h2 className="text-xl font-black text-white">Purchase Orders & Itemized Procurement</h2>
            <p className="text-xs text-[#8E99AE] mt-0.5">
              Verified procurement history, supplier costs, and item quantities across all kitchen and butchery departments.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1.5 rounded-xl bg-[#0D121D] border border-[#1E2635] text-xs font-bold text-[#448AFF]">
              {purchases.length} Purchase Orders
            </span>
          </div>
        </div>

        {/* Web Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {purchases.length === 0 ? (
            <div className="col-span-full p-12 text-center bg-[#161C28]/50 border border-[#1E2635] rounded-2xl">
              <p className="text-sm text-[#8E99AE]">No procurement orders on record in Firestore.</p>
            </div>
          ) : (
            purchases.map((p) => {
              const items = p.items || [];
              return (
                <div key={p.id} className="p-5 bg-[#161C28] border border-[#1E2635] rounded-2xl space-y-4 hover:border-[#448AFF]/40 transition-colors flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between pb-3 border-b border-[#1E2635]">
                      <div className="flex items-center gap-2">
                        <User size={15} className="text-[#448AFF]" />
                        <span className="text-xs font-bold text-white">{p.purchaseUserName || 'Purchaser'}</span>
                      </div>

                      <FintechBadge 
                        label={p.status || 'ORDERED'} 
                        color="#448AFF" 
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3 py-3 border-b border-[#1E2635] text-xs">
                      <div className="p-2.5 rounded-xl bg-[#0D121D] border border-[#1E2635]">
                        <span className="text-[10px] text-[#8E99AE] uppercase font-bold block">Procurement Cost</span>
                        <span className="text-sm font-black text-[#00FF94] mt-0.5 block">{formatETB(p.totalCost || 0)}</span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-[#0D121D] border border-[#1E2635]">
                        <span className="text-[10px] text-[#8E99AE] uppercase font-bold block">Total Items</span>
                        <span className="text-sm font-black text-white mt-0.5 block">{p.totalItems || items.length}</span>
                      </div>
                    </div>

                    {items.length > 0 && (
                      <div className="mt-3 space-y-1.5">
                        <span className="text-[10px] font-bold text-[#8E99AE] uppercase block mb-1">Items ({items.length})</span>
                        <div className="max-h-36 overflow-y-auto space-y-1 pr-1">
                          {items.map((it, idx) => (
                            <div key={idx} className="flex justify-between items-center p-2 rounded-lg bg-[#0D121D] border border-[#1E2635] text-xs">
                              <span className="text-white font-medium truncate max-w-[150px]">{it.productName}</span>
                              <div className="flex items-center gap-2">
                                <span className="text-[#8E99AE]">{it.quantity}x</span>
                                <span className="text-white font-semibold">{formatETB(it.totalCost || (it.quantity * it.costPerItem))}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="pt-3 border-t border-[#1E2635] flex items-center justify-between text-xs text-[#8E99AE]">
                    <div className="flex items-center gap-1.5">
                      <Calendar size={12} className="text-[#00D1FF]" />
                      <span>{p.purchaseDate ? new Date(p.purchaseDate).toLocaleDateString() : 'Recent'}</span>
                    </div>
                    <span className="font-mono text-[10px]">ID: {p.id.slice(0, 8)}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
