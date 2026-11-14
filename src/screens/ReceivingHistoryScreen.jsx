import React, { useState, useEffect } from 'react';
import { 
  ChevronLeft, 
  Package, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Calendar,
  Plus
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
    <div className="flex-1 flex flex-col pb-6">
      <FintechHeader
        title="Receiving History"
        subtitle="CONFIRMED & DENIED INVENTORY"
        showBackButton={true}
        showMenu={false}
        onBack={onBack}
        actions={
          <button
            onClick={onOpenGoodsReceiving}
            className="p-2 rounded-xl bg-[#161C28] border border-[#1E2635] text-[#00D1FF] hover:border-[#00D1FF]/50"
            title="Receive Goods"
          >
            <Plus size={17} />
          </button>
        }
      />

      <div className="px-5 pt-3 space-y-3">
        {/* Filter Pills */}
        <div className="flex gap-1.5 overflow-x-auto no-scrollbar py-0.5">
          {['ALL', 'CONFIRMED', 'DENIED', 'PENDING'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1 rounded-lg text-[10px] font-bold tracking-wider uppercase transition-colors shrink-0 ${
                filter === f
                  ? 'bg-[#00D1FF] text-[#0D121D]'
                  : 'bg-[#161C28] text-[#8E99AE] border border-[#1E2635] hover:text-white'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {filteredItems.length === 0 ? (
          <div className="p-8 text-center bg-[#161C28]/50 border border-[#1E2635] rounded-2xl">
            <p className="text-xs text-[#8E99AE]">No receiving history records found.</p>
          </div>
        ) : (
          filteredItems.map((item, idx) => {
            const status = item.receivingStatus || 'PENDING';
            const isConfirmed = status === 'CONFIRMED';
            const isDenied = status === 'DENIED';

            return (
              <FintechCard key={idx} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Package size={16} className="text-[#00D1FF]" />
                    <span className="text-xs font-bold text-white">{item.productName || 'Inventory Item'}</span>
                  </div>

                  <FintechBadge 
                    label={status} 
                    color={isConfirmed ? '#00FF94' : isDenied ? '#FF4D4D' : '#FFB800'} 
                  />
                </div>

                <div className="grid grid-cols-3 gap-2 py-2 border-y border-[#1E2635] text-xs">
                  <div>
                    <span className="text-[10px] text-[#8E99AE] uppercase font-bold block">Quantity</span>
                    <span className="text-white font-semibold">{item.quantity} units</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#8E99AE] uppercase font-bold block">Unit Cost</span>
                    <span className="text-white font-semibold">{formatETB(item.costPerItem)}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#8E99AE] uppercase font-bold block">Total</span>
                    <span className="text-white font-semibold">{formatETB(item.totalCost || (item.quantity * item.costPerItem))}</span>
                  </div>
                </div>

                <div className="flex justify-between items-center text-[11px] text-[#8E99AE]">
                  <span>Received by: {item.receivedBy || 'Staff'}</span>
                  {item.deniedReason && (
                    <span className="text-[#FF4D4D] italic">Reason: {item.deniedReason}</span>
                  )}
                </div>
              </FintechCard>
            );
          })
        )}
      </div>
    </div>
  );
}
