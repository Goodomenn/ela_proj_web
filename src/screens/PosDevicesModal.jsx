import React, { useState, useEffect } from 'react';
import { 
  X, 
  Printer, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  Tablet, 
  AlertCircle,
  MapPin,
  Layers
} from 'lucide-react';
import { 
  subscribeToPosDevices, 
  savePosDevice, 
  deletePosDevice 
} from '../services/firebaseClient';

export default function PosDevicesModal({ isOpen, onClose }) {
  const [devices, setDevices] = useState([]);
  const [activeTab, setActiveTab] = useState('ALL'); // 'ALL', 'CENET', 'LOOP'
  
  // Add Device Form State
  const [name, setName] = useState('');
  const [type, setType] = useState('CENET');
  const [location, setLocation] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    if (!isOpen) return;
    const unsub = subscribeToPosDevices((devList) => {
      setDevices(devList);
    });
    return () => unsub();
  }, [isOpen]);

  if (!isOpen) return null;

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    setMessage(null);

    try {
      const cleanName = name.trim();
      const cleanLoc = location.trim() || 'Front Desk';
      const id = `${type}_device_${Date.now()}`;

      await savePosDevice({
        id,
        name: cleanName,
        type,
        location: cleanLoc,
        status: 'ONLINE',
        isSyncing: true
      });

      setName('');
      setLocation('');
      setMessage({ type: 'success', text: `Registered ${cleanName} for ${type}!` });
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id, devName) => {
    if (!window.confirm(`Are you sure you want to remove POS device "${devName}"?`)) return;
    try {
      await deletePosDevice(id);
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    }
  };

  const filteredDevices = devices.filter(d => {
    if (activeTab === 'ALL') return true;
    return d.type === activeTab;
  });

  const cenetCount = devices.filter(d => d.type === 'CENET').length;
  const loopCount = devices.filter(d => d.type === 'LOOP').length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-[#161C28] border border-[#1E2635] rounded-2xl p-5 space-y-4 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#1E2635]">
          <div className="flex items-center gap-2 text-[#00D1FF]">
            <Printer size={18} />
            <div>
              <h3 className="text-sm font-bold text-white">POS Hardware Devices</h3>
              <p className="text-[10px] text-[#8E99AE]">CENET & LOOP 2-Device Channel Configuration</p>
            </div>
          </div>
          <button onClick={onClose} className="text-[#8E99AE] hover:text-white">
            <X size={18} />
          </button>
        </div>

        {/* Feedback message */}
        {message && (
          <div className={`p-3 rounded-xl border flex items-center gap-2 text-xs ${
            message.type === 'success' 
              ? 'bg-[#00FF94]/10 border-[#00FF94]/30 text-[#00FF94]' 
              : 'bg-[#FF4D4D]/10 border-[#FF4D4D]/30 text-[#FF4D4D]'
          }`}>
            {message.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
            <span>{message.text}</span>
          </div>
        )}

        {/* Tab Filters */}
        <div className="flex gap-2 p-1 bg-[#0D121D] rounded-xl border border-[#1E2635]">
          <button
            type="button"
            onClick={() => setActiveTab('ALL')}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-colors ${
              activeTab === 'ALL'
                ? 'bg-[#00D1FF] text-[#0D121D]'
                : 'text-[#8E99AE] hover:text-white'
            }`}
          >
            All Hardware ({devices.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('CENET')}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-colors ${
              activeTab === 'CENET'
                ? 'bg-purple-600 text-white'
                : 'text-[#8E99AE] hover:text-white'
            }`}
          >
            CENET Devices ({cenetCount})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('LOOP')}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-colors ${
              activeTab === 'LOOP'
                ? 'bg-teal-600 text-white'
                : 'text-[#8E99AE] hover:text-white'
            }`}
          >
            LOOP Devices ({loopCount})
          </button>
        </div>

        {/* Device Registration Form */}
        <form onSubmit={handleAdd} className="p-3 bg-[#0D121D] border border-[#1E2635] rounded-xl space-y-2 text-xs">
          <span className="text-[10px] font-bold text-[#8E99AE] uppercase tracking-wider block">
            Add New POS Device (Admin)
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Counter 1 (Main Dining)"
              className="px-3 py-2 rounded-xl bg-[#161C28] border border-[#1E2635] text-white focus:outline-none focus:border-[#00D1FF]"
              required
            />
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="px-3 py-2 rounded-xl bg-[#161C28] border border-[#1E2635] text-white focus:outline-none focus:border-[#00D1FF]"
            >
              <option value="CENET">CENET System</option>
              <option value="LOOP">LOOP System</option>
            </select>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Hall A / Bar"
              className="px-3 py-2 rounded-xl bg-[#161C28] border border-[#1E2635] text-white focus:outline-none focus:border-[#00D1FF]"
            />
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2 rounded-xl bg-[#00D1FF]/15 border border-[#00D1FF]/40 text-[#00D1FF] font-bold text-xs hover:bg-[#00D1FF]/25 flex items-center justify-center gap-1.5 transition-colors"
          >
            <Plus size={14} />
            <span>{isSubmitting ? 'Registering...' : 'Register POS Hardware to Firestore'}</span>
          </button>
        </form>

        {/* Configured Devices List */}
        <div className="flex-1 space-y-2 overflow-y-auto pr-1 min-h-[160px]">
          {filteredDevices.length === 0 ? (
            <div className="p-8 text-center text-xs text-[#8E99AE]">
              No devices found for {activeTab}.
            </div>
          ) : (
            filteredDevices.map(d => {
              const isCenet = d.type === 'CENET';
              return (
                <div 
                  key={d.id} 
                  className="p-3 rounded-xl bg-[#0D121D] border border-[#1E2635] hover:border-[#00D1FF]/40 flex items-center justify-between text-xs transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${
                      isCenet ? 'bg-purple-500/10 text-purple-400' : 'bg-teal-500/10 text-teal-400'
                    }`}>
                      <Tablet size={16} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-xs">{d.name}</span>
                        <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${
                          isCenet ? 'bg-purple-500/20 text-purple-300' : 'bg-teal-500/20 text-teal-300'
                        }`}>
                          {d.type}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-[10px] text-[#8E99AE] mt-0.5">
                        <MapPin size={11} className="text-[#8E99AE]" />
                        <span>{d.location || 'Default Location'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#00FF94]/15 text-[#00FF94] border border-[#00FF94]/30">
                      {d.status || 'ONLINE'}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleDelete(d.id, d.name)}
                      className="p-1.5 text-[#8E99AE] hover:text-[#FF4D4D] rounded-lg hover:bg-[#FF4D4D]/10 transition-colors"
                      title="Remove Device"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center pt-2 border-t border-[#1E2635] text-[11px] text-[#8E99AE]">
          <span>Synced with Firestore (<span className="text-[#00D1FF] font-mono">pos_devices</span>)</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-[#1E2635] text-white text-xs font-bold hover:bg-[#2D3748] transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
