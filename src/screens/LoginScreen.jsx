import React, { useState } from 'react';
import { 
  Wallet, 
  AlertCircle, 
  Lock, 
  User, 
  ArrowRight,
  ShieldCheck,
  Radio,
  Calculator,
  CheckCircle2
} from 'lucide-react';
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
    <div className="min-h-screen bg-[#070A10] flex items-center justify-center p-4 sm:p-6 lg:p-8 font-sans antialiased selection:bg-[#00D1FF]/30 selection:text-white">
      <div className="w-full max-w-4xl bg-[#0D121D] border border-[#1E2635] rounded-3xl overflow-hidden shadow-2xl grid grid-cols-1 md:grid-cols-12">
        {/* Left Side: Brand & Feature Highlights (Desktop) */}
        <div className="hidden md:flex md:col-span-5 bg-[#0B0F19] p-8 flex-col justify-between border-r border-[#1E2635] relative">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-[#00D1FF]/10 border border-[#00D1FF]/30 flex items-center justify-center text-[#00D1FF] shadow-[0_0_15px_rgba(0,209,255,0.2)]">
                <Radio size={20} className="animate-pulse" />
              </div>
              <div>
                <h1 className="text-sm font-black tracking-wider text-white uppercase">
                  ELA <span className="text-[#00D1FF]">FINTECH</span>
                </h1>
                <p className="text-[10px] font-semibold text-[#8E99AE] tracking-wider uppercase">
                  HABESHA ENTERPRISE
                </p>
              </div>
            </div>

            <h3 className="text-lg font-bold text-white tracking-tight leading-snug">
              Enterprise POS & Bank SMS Reconciliation System
            </h3>
            <p className="text-xs text-[#8E99AE] mt-2 leading-relaxed">
              Automated dual-channel reconciliation connecting CENET & LOOP registers with real-time bank SMS feeds.
            </p>

            <div className="mt-8 space-y-3.5">
              <div className="flex items-center gap-3 text-xs text-[#8E99AE]">
                <div className="w-6 h-6 rounded-lg bg-[#00FF94]/10 text-[#00FF94] flex items-center justify-center shrink-0">
                  <CheckCircle2 size={14} />
                </div>
                <span>Real-time Firestore Database Sync</span>
              </div>

              <div className="flex items-center gap-3 text-xs text-[#8E99AE]">
                <div className="w-6 h-6 rounded-lg bg-[#00D1FF]/10 text-[#00D1FF] flex items-center justify-center shrink-0">
                  <CheckCircle2 size={14} />
                </div>
                <span>Automated Over & Shortage Audit</span>
              </div>

              <div className="flex items-center gap-3 text-xs text-[#8E99AE]">
                <div className="w-6 h-6 rounded-lg bg-[#7C4DFF]/10 text-[#7C4DFF] flex items-center justify-center shrink-0">
                  <CheckCircle2 size={14} />
                </div>
                <span>Role-Based Access Control (RBAC)</span>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-[#1E2635] text-[11px] text-[#8E99AE] flex items-center justify-between">
            <span>Terminal v2.4</span>
            <span className="text-[#00FF94] flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#00FF94] animate-ping" />
              Operational
            </span>
          </div>
        </div>

        {/* Right Side: Login Form */}
        <div className="md:col-span-7 p-6 sm:p-10 flex flex-col justify-center bg-[#161C28]">
          <div className="max-w-md w-full mx-auto space-y-6">
            <div>
              <span className="text-[10px] font-bold text-[#00D1FF] tracking-[0.2em] uppercase">
                AUTHENTICATED ACCESS
              </span>
              <h2 className="text-2xl font-black text-white mt-1">
                Sign in to Terminal
              </h2>
              <p className="text-xs text-[#8E99AE] mt-0.5">
                Enter your authorized credentials to access enterprise intelligence
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
                <label className="text-[10px] font-bold text-[#8E99AE] uppercase tracking-wider block mb-1.5">
                  Username
                </label>
                <div className="relative">
                  <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8E99AE]" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter username"
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#0D121D] border border-[#1E2635] text-white text-xs focus:outline-none focus:border-[#00D1FF] transition-colors"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-[#8E99AE] uppercase tracking-wider block mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8E99AE]" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password (optional for demo)"
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#0D121D] border border-[#1E2635] text-white text-xs focus:outline-none focus:border-[#00D1FF] transition-colors"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl bg-[#00D1FF] hover:bg-[#00D1FF]/90 text-[#0D121D] font-black text-xs flex items-center justify-center gap-2 tracking-wider uppercase transition-all shadow-xl shadow-[#00D1FF]/20 active:scale-[0.99]"
              >
                <span>{loading ? 'Authenticating...' : 'Sign In to Terminal'}</span>
                <ArrowRight size={15} />
              </button>
            </form>

            <div className="pt-2 text-center border-t border-[#1E2635]/60">
              <p className="text-[11px] text-[#8E99AE]">
                Default manager account: <strong className="text-white font-mono">dani</strong>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
