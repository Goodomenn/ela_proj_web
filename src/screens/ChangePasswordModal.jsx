import React, { useState } from 'react';
import { X, Lock, Check } from 'lucide-react';
import { db, doc, updateDoc } from '../services/firebaseClient';
import { useAuth } from '../context/AuthContext';

export default function ChangePasswordModal({ isOpen, onClose }) {
  const { user } = useAuth();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [saving, setSaving] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    setSaving(true);
    try {
      if (db && user?.uid) {
        await updateDoc(doc(db, 'users', user.uid), {
          password: newPassword
        });
      }
      alert('Password updated successfully');
      onClose();
    } catch (err) {
      alert('Error updating password: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-sm bg-[#161C28] border border-[#1E2635] rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#1E2635]">
          <div className="flex items-center gap-2 text-[#00D1FF]">
            <Lock size={18} />
            <h3 className="text-sm font-bold text-white">Change Password</h3>
          </div>
          <button onClick={onClose} className="text-[#8E99AE] hover:text-white">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div>
            <label className="text-[10px] font-bold text-[#8E99AE] uppercase block mb-1">New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-[#0D121D] border border-[#1E2635] text-white focus:outline-none focus:border-[#00D1FF]"
              required
            />
          </div>

          <div>
            <label className="text-[10px] font-bold text-[#8E99AE] uppercase block mb-1">Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-[#0D121D] border border-[#1E2635] text-white focus:outline-none focus:border-[#00D1FF]"
              required
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-[#1E2635]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-[#8E99AE] hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 rounded-xl bg-[#00D1FF] text-[#0D121D] text-xs font-bold hover:bg-[#00D1FF]/90"
            >
              {saving ? 'Updating...' : 'Update Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
