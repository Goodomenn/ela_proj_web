import React, { useState } from 'react';
import { Wallet, AlertCircle, Lock, User, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function LoginScreen({ onLoginSuccess }) {
  const { login } = useAuth();
  const [username, setUsername] = useState('dani');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim()) return;

    setLoading(true);
    setError(null);

    try {
      await login(username, password);
      if (onLoginSuccess) onLoginSuccess();
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070A10] flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-[#161C28] border border-[#1E2635] rounded-3xl p-7 shadow-2xl space-y-6">
        {/* Logo and Header */}
        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-full bg-[#00D1FF]/10 border border-[#00D1FF]/30 flex items-center justify-center text-[#00D1FF] mb-3">
            <Wallet size={32} />
          </div>

          <span className="text-[11px] font-bold text-[#00D1FF] tracking-[0.2em] uppercase">
            HABESHA ENTERPRISE
          </span>
          <h2 className="text-xl font-bold text-white mt-1">
            Welcome Back
          </h2>
          <p className="text-xs text-[#8E99AE] mt-0.5">
            Sign in to access your financial terminal
          </p>
        </div>

        {/* Error notification */}
        {error && (
          <div className="p-3 rounded-xl bg-[#FF4D4D]/10 border border-[#FF4D4D]/30 flex items-center gap-2 text-xs text-[#FF4D4D]">
            <AlertCircle size={16} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-[10px] font-bold text-[#8E99AE] uppercase tracking-wider block mb-1">
              Username
            </label>
            <div className="relative">
              <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8E99AE]" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#0D121D] border border-[#1E2635] text-white text-xs focus:outline-none focus:border-[#00D1FF] transition-colors"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-bold text-[#8E99AE] uppercase tracking-wider block mb-1">
              Password
            </label>
            <div className="relative">
              <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8E99AE]" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password (optional for demo)"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#0D121D] border border-[#1E2635] text-white text-xs focus:outline-none focus:border-[#00D1FF] transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-[#00D1FF] hover:bg-[#00D1FF]/90 text-[#0D121D] font-bold text-xs flex items-center justify-center gap-2 tracking-wider uppercase transition-all shadow-lg shadow-[#00D1FF]/10 active:scale-[0.99]"
          >
            <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
            <ArrowRight size={15} />
          </button>
        </form>

        <div className="pt-2 text-center">
          <p className="text-[11px] text-[#8E99AE]">
            Default terminal admin: <strong className="text-white">dani (Manager)</strong>
          </p>
        </div>
      </div>
    </div>
  );
}
