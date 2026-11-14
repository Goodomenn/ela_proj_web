import React, { useState } from 'react';
import { X, Printer, Plus, Radio, Check } from 'lucide-react';

export default function PosDevicesModal({ isOpen, onClose }) {
  const [devices, setDevices] = useState([
    { id: '1', name: 'Main Restaurant Counter (CENET)', type: 'CENET', location: 'Hall A', status: 'ONLINE' },
    { id: '2', name: 'Butchery & Takeaway Terminal (LOOP)', type: 'LOOP', location: 'Counter 2', status: 'ONLINE' }
  ]);
  const [name, setName] = useState('');
  const [type, setType] = useState('CENET');

  if (!isOpen) return null;

  const handleAdd = (e) => {
    e.preventDefault();
    if (!name) return;
    setDevices([
      ...devices,
      { id: String(Date.now()), name: name.trim(), type, location: 'Front Desk', status: 'ONLINE' }
    ]);
    setName('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-md bg-[#161C28] border border-[#1E2635] rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#1E2635]">
          <div className="flex items-center gap-2 text-[#00D1FF]">
            <Printer size={18} />
            <h3 className="text-sm font-bold text-white">POS Devices Configuration</h3>
          </div>
          <button onClick={onClose} className="text-[#8E99AE] hover:text-white">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleAdd} className="space-y-2 text-xs">
          <div className="grid grid-cols-3 gap-2">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Device name..."
              className="col-span-2 px-3 py-2 rounded-xl bg-[#0D121D] border border-[#1E2635] text-white focus:outline-none focus:border-[#00D1FF]"
              required
            />
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="px-2 py-2 rounded-xl bg-[#0D121D] border border-[#1E2635] text-white focus:outline-none focus:border-[#00D1FF]"
            >
              <option value="CENET">CENET</option>
              <option value="LOOP">LOOP</option>
            </select>
          </div>
          <button
            type="submit"
            className="w-full py-2 rounded-xl bg-[#00D1FF]/15 border border-[#00D1FF]/40 text-[#00D1FF] font-bold text-xs hover:bg-[#00D1FF]/25 flex items-center justify-center gap-1.5"
          >
            <Plus size={14} />
            <span>Register POS Hardware</span>
          </button>
        </form>

        <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
          {devices.map(d => (
            <div key={d.id} className="p-3 rounded-xl bg-[#0D121D] border border-[#1E2635] flex items-center justify-between text-xs">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-[#00D1FF]/10 text-[#00D1FF]">
                  <Printer size={15} />
                </div>
                <div>
                  <span className="font-bold text-white block">{d.name}</span>
                  <span className="text-[10px] text-[#8E99AE]">{d.type} • {d.location}</span>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#00FF94]/15 text-[#00FF94] border border-[#00FF94]/30">
                {d.status}
              </span>
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
