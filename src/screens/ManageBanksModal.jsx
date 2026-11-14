import React, { useState } from 'react';
import { X, Building2, Plus, Trash2 } from 'lucide-react';

export default function ManageBanksModal({ isOpen, onClose }) {
  const [banks, setBanks] = useState([
    { id: '1', name: 'Awash Bank', acc: '1000293847', active: true },
    { id: '2', name: 'Bank of Abyssinia', acc: '29384756', active: true },
    { id: '3', name: 'Commercial Bank of Ethiopia (CBE)', acc: '1000192837465', active: true },
    { id: '4', name: 'Telebirr Business', acc: '0911223344', active: true }
  ]);
  const [newName, setNewName] = useState('');
  const [newAcc, setNewAcc] = useState('');

  if (!isOpen) return null;

  const handleAdd = (e) => {
    e.preventDefault();
    if (!newName) return;
    setBanks([
      ...banks,
      { id: String(Date.now()), name: newName.trim(), acc: newAcc.trim() || 'Default', active: true }
    ]);
    setNewName('');
    setNewAcc('');
  };

  const handleRemove = (id) => {
    setBanks(banks.filter(b => b.id !== id));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-md bg-[#161C28] border border-[#1E2635] rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#1E2635]">
          <div className="flex items-center gap-2 text-[#00D1FF]">
            <Building2 size={18} />
            <h3 className="text-sm font-bold text-white">Manage Transfer Banks</h3>
          </div>
          <button onClick={onClose} className="text-[#8E99AE] hover:text-white">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleAdd} className="space-y-2 text-xs">
          <div className="grid grid-cols-2 gap-2">
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Bank / Service Name"
              className="px-3 py-2 rounded-xl bg-[#0D121D] border border-[#1E2635] text-white focus:outline-none focus:border-[#00D1FF]"
              required
            />
            <input
              type="text"
              value={newAcc}
              onChange={(e) => setNewAcc(e.target.value)}
              placeholder="Account # (Optional)"
              className="px-3 py-2 rounded-xl bg-[#0D121D] border border-[#1E2635] text-white focus:outline-none focus:border-[#00D1FF]"
            />
          </div>
          <button
            type="submit"
            className="w-full py-2 rounded-xl bg-[#00D1FF]/15 border border-[#00D1FF]/40 text-[#00D1FF] font-bold text-xs hover:bg-[#00D1FF]/25 transition-colors flex items-center justify-center gap-1.5"
          >
            <Plus size={14} />
            <span>Add Bank Account</span>
          </button>
        </form>

        <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
          {banks.map(b => (
            <div key={b.id} className="p-3 rounded-xl bg-[#0D121D] border border-[#1E2635] flex items-center justify-between text-xs">
              <div>
                <span className="font-bold text-white block">{b.name}</span>
                <span className="text-[11px] text-[#8E99AE]">Acc: {b.acc}</span>
              </div>
              <button
                onClick={() => handleRemove(b.id)}
                className="text-[#8E99AE] hover:text-[#FF4D4D] p-1.5"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>

        <div className="flex justify-end pt-2 border-t border-[#1E2635]">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-[#1E2635] text-white text-xs font-bold hover:bg-[#2D3748]"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
