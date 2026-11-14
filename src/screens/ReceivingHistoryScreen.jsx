import React, { useState, useEffect } from 'react';
import { 
  ChevronLeft, 
  Package, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Calendar,
  Plus,
  PackageCheck
} from 'lucide-react';
import FintechHeader from '../components/FintechHeader';
import { FintechCard, FintechBadge } from '../components/FintechCard';
import { subscribeToPurchases, formatETB } from '../services/firebaseClient';

export default function ReceivingHistoryScreen({ onBack, onOpenGoodsReceiving }) {
  const [purchases, setPurchases] = useState([]);
  const [filter, setFilter] = useState('ALL'); // 'ALL', 'CONFIRMED', 'DENIED', 'PENDING'

  useEffect(() => {
    const unsub = subscribeToPurchases(setPurchases);
    return () => unsub();
  }, []);

  // Collect all items across purchases
  const allItems = [];
  purchases.forEach(p => {
    if (Array.isArray(p.items)) {
      p.items.forEach(it => {
        allItems.push({ ...it, purchaseId: p.id, date: p.purchaseDate });
      });
    }
  });

  const filteredItems = allItems.filter(it => {
    if (filter === 'ALL') return true;
    return (it.receivingStatus || 'PENDING') === filter;
  });

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <FintechHeader
        title="Inventory Receiving History"
        subtitle="CONFIRMED & DENIED INCOMING GOODS"
        category="Inventory Audit"
        showBackButton={true}
        showMenu={false}
        onBack={onBack}
        actions={
          <button
            onClick={onOpenGoodsReceiving}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#00D1FF] hover:bg-[#00D1FF]/90 text-[#0D121D] text-xs font-bold transition-colors shadow-lg shadow-[#00D1FF]/20"
          >
            <Plus size={14} />
            <span className="hidden sm:inline">Receive Goods</span>
          </button>
        }
      />

      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Header Summary */}
        <div className="p-6 rounded-2xl bg-[#161C28] border border-[#1E2635] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <PackageCheck size={16} className="text-[#00D1FF]" />
              <span className="text-[10px] font-bold text-[#00D1FF] tracking-wider uppercase">
                Dock Inspections
              </span>
            </div>
            <h2 className="text-xl font-black text-white">Vendor Goods Receiving & Inspection Log</h2>
            <p className="text-xs text-[#8E99AE] mt-0.5">
              Comprehensive audit trail of supplier shipments, verified quantities, and rejection notes.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap gap-1.5 bg-[#0D121D] p-1 rounded-xl border border-[#1E2635]">
            {['ALL', 'CONFIRMED', 'DENIED', 'PENDING'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                  filter === f
                    ? 'bg-[#00D1FF] text-[#0D121D]'
                    : 'text-[#8E99AE] hover:text-white'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Web Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredItems.length === 0 ? (
            <div className="col-span-full p-12 text-center bg-[#161C28]/50 border border-[#1E2635] rounded-2xl">
              <p className="text-sm text-[#8E99AE]">No receiving history records found for filter.</p>
            </div>
          ) : (
            filteredItems.map((item, idx) => {
              const status = item.receivingStatus || 'PENDING';
              const isConfirmed = status === 'CONFIRMED';
              const isDenied = status === 'DENIED';

              return (
                <div key={idx} className="p-5 bg-[#161C28] border border-[#1E2635] rounded-2xl space-y-3 hover:border-[#00D1FF]/40 transition-colors">
                  <div className="flex items-center justify-between pb-3 border-b border-[#1E2635]">
                    <div className="flex items-center gap-2">
                      <Package size={16} className="text-[#00D1FF]" />
                      <span className="text-xs font-bold text-white truncate max-w-[170px]">
                        {item.productName || 'Inventory Item'}
                      </span>
                    </div>

                    <FintechBadge 
                      label={status} 
                      color={isConfirmed ? '#00FF94' : isDenied ? '#FF4D4D' : '#FFB800'} 
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-2 py-2 border-b border-[#1E2635] text-xs">
                    <div className="p-2 rounded-lg bg-[#0D121D] border border-[#1E2635]">
                      <span className="text-[10px] text-[#8E99AE] uppercase font-bold block">Ordered</span>
                      <span className="text-white font-bold">{item.orderedQuantity || item.quantity || 0}</span>
                    </div>
                    <div className="p-2 rounded-lg bg-[#0D121D] border border-[#1E2635]">
                      <span className="text-[10px] text-[#8E99AE] uppercase font-bold block">Received</span>
                      <span className="text-[#00FF94] font-bold">{item.receivedQuantity || 0}</span>
                    </div>
                    <div className="p-2 rounded-lg bg-[#0D121D] border border-[#1E2635]">
                      <span className="text-[10px] text-[#8E99AE] uppercase font-bold block">Total</span>
                      <span className="text-white font-bold">{formatETB(item.totalPrice || 0, 0)}</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-xs text-[#8E99AE] pt-1">
                    <div className="flex items-center gap-1.5">
                      <Calendar size={12} className="text-[#00D1FF]" />
                      <span>{item.date ? new Date(item.date).toLocaleDateString() : 'Recent'}</span>
                    </div>
                    <span>By: {item.receivedBy || 'Receiver'}</span>
                  </div>

                  {item.denialReason && (
                    <div className="p-2 rounded-lg bg-[#FF4D4D]/10 border border-[#FF4D4D]/30 text-xs text-[#FF4D4D]">
                      Reason: {item.denialReason}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
