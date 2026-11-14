import React, { useState } from 'react';
import { X, AlertTriangle, Trash2 } from 'lucide-react';
import { db, collection, getDocs, deleteDoc, doc } from '../services/firebaseClient';

export default function ClearDataModal({ isOpen, onClose }) {
  const [clearing, setClearing] = useState(false);

  if (!isOpen) return null;

  const handleClear = async () => {
    setClearing(true);
    try {
      if (db) {
        const snap = await getDocs(collection(db, 'sales_entries'));
        const promises = snap.docs.map(d => deleteDoc(doc(db, 'sales_entries', d.id)));
        await Promise.all(promises);
      }
      alert('All sales entries cleared successfully.');
      onClose();
    } catch (err) {
      alert('Error clearing data: ' + err.message);
    } finally {
      setClearing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-md bg-[#161C28] border border-[#FF4D4D]/40 rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#1E2635]">
          <div className="flex items-center gap-2 text-[#FF4D4D]">
            <AlertTriangle size={20} />
            <h3 className="text-sm font-bold text-white">Clear All Sales Data?</h3>
          </div>
          <button onClick={onClose} className="text-[#8E99AE] hover:text-white">
            <X size={18} />
          </button>
        </div>

        <p className="text-xs text-[#8E99AE] leading-relaxed">
          This will permanently delete all uploaded sales entries and item breakdown records from Firestore cloud database. This action is restricted and <strong className="text-[#FF4D4D]">cannot be undone</strong>.
        </p>

        <div className="flex justify-end gap-2 pt-3 border-t border-[#1E2635]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-[#8E99AE] hover:text-white"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={clearing}
            onClick={handleClear}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#FF4D4D] text-white text-xs font-bold hover:bg-[#FF4D4D]/90"
          >
            <Trash2 size={14} />
            <span>{clearing ? 'Clearing...' : 'Clear All Data'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
