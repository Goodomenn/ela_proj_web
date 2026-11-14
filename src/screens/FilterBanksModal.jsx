import React from 'react';
import { X, Filter, Check } from 'lucide-react';

export const ALL_BANKS = [
  'Awash Bank',
  'Bank of Abyssinia',
  'CBE',
  'CBE Birr',
  'Telebirr'
];

export default function FilterBanksModal({ isOpen, onClose, selectedBanks, onToggleBank }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-sm bg-[#161C28] border border-[#1E2635] rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#1E2635]">
          <div className="flex items-center gap-2 text-[#00D1FF]">
            <Filter size={18} />
            <h3 className="text-sm font-bold text-white">Filter Banks for Reconciliation</h3>
          </div>
          <button onClick={onClose} className="text-[#8E99AE] hover:text-white">
            <X size={18} />
          </button>
        </div>

        <div className="space-y-2">
          {ALL_BANKS.map(bank => {
            const isSelected = selectedBanks.includes(bank);
            return (
              <div
                key={bank}
                onClick={() => onToggleBank(bank)}
                className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-colors ${
                  isSelected 
                    ? 'bg-[#00D1FF]/10 border-[#00D1FF]/40 text-white' 
                    : 'bg-[#0D121D] border-[#1E2635] text-[#8E99AE]'
                }`}
              >
                <span className="text-xs font-bold">{bank}</span>
                <div className={`w-5 h-5 rounded-md flex items-center justify-center border ${
                  isSelected 
                    ? 'bg-[#00D1FF] border-[#00D1FF] text-[#0D121D]' 
                    : 'border-[#1E2635] bg-transparent'
                }`}>
                  {isSelected && <Check size={13} strokeWidth={3} />}
                </div>
              </div>
            );
          })}
        </div>

        <div className="pt-2 text-right border-t border-[#1E2635]">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-[#00D1FF] text-[#0D121D] text-xs font-bold hover:bg-[#00D1FF]/90"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
