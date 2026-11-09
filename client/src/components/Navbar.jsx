import React from 'react';
import { Store, Tag, ClipboardList, Shield, User, Database, CheckCircle2 } from 'lucide-react';
import { useAuth, ROLES } from '../context/AuthContext';

export default function Navbar({ activeTab, setActiveTab }) {
  const { currentUser, availableUsers, switchUser, role } = useAuth();

  const getRoleBadgeColor = (r) => {
    switch (r) {
      case ROLES.ADMIN:
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case ROLES.CENET_MANAGER:
        return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case ROLES.LOOP_MANAGER:
        return 'bg-teal-100 text-teal-800 border-teal-200';
      case ROLES.AUDITOR:
        return 'bg-amber-100 text-amber-800 border-amber-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
      {/* Top Banner: Title & Database Status */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-700 via-indigo-600 to-teal-500 flex items-center justify-center text-white shadow-md">
            <Store className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Daily Sales & Import Manager
            </h1>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span className="inline-flex items-center gap-1 font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                <CheckCircle2 className="w-3 h-3" /> Firestore: elaprojects-3212e
              </span>
              <span className="text-slate-400">•</span>
              <span>Synced with Phone App</span>
            </div>
          </div>
        </div>

        {/* RBAC Quick Role Switcher */}
        <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-xl p-1.5 self-start md:self-auto">
          <div className="flex items-center gap-2 pl-2">
            <Shield className="w-4 h-4 text-slate-500" />
            <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Role:</span>
          </div>

          <select
            value={currentUser?.id}
            onChange={(e) => switchUser(e.target.value)}
            className="text-xs font-semibold bg-white border border-slate-200 text-slate-800 rounded-lg py-1.5 px-3 focus:outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer shadow-sm"
          >
            {availableUsers.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name} ({u.role})
              </option>
            ))}
          </select>

          <span className={`text-[11px] font-bold px-2 py-1 rounded-md border ${getRoleBadgeColor(role)}`}>
            {role}
          </span>
        </div>
      </div>

      {/* Main Tabs matching Flutter NavigationBar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex space-x-1 border-t border-slate-100">
        <button
          onClick={() => setActiveTab('CENET')}
          className={`flex items-center gap-2 px-5 py-3.5 text-sm font-semibold border-b-2 transition-all ${
            activeTab === 'CENET'
              ? 'border-purple-600 text-purple-700 bg-purple-50/50'
              : 'border-transparent text-slate-600 hover:text-purple-600 hover:border-purple-300'
          }`}
        >
          <Store className={`w-4 h-4 ${activeTab === 'CENET' ? 'text-purple-600' : 'text-slate-400'}`} />
          <span>CENET Sales</span>
          <span className="text-[10px] font-medium bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded-full">
            Restaurant & Lounge
          </span>
        </button>

        <button
          onClick={() => setActiveTab('LOOP')}
          className={`flex items-center gap-2 px-5 py-3.5 text-sm font-semibold border-b-2 transition-all ${
            activeTab === 'LOOP'
              ? 'border-teal-600 text-teal-700 bg-teal-50/50'
              : 'border-transparent text-slate-600 hover:text-teal-600 hover:border-teal-300'
          }`}
        >
          <Tag className={`w-4 h-4 ${activeTab === 'LOOP' ? 'text-teal-600' : 'text-slate-400'}`} />
          <span>LOOP Sales</span>
          <span className="text-[10px] font-medium bg-teal-100 text-teal-700 px-1.5 py-0.5 rounded-full">
            Butchery & Liquor
          </span>
        </button>

        <button
          onClick={() => setActiveTab('LOGS')}
          className={`flex items-center gap-2 px-5 py-3.5 text-sm font-semibold border-b-2 transition-all ${
            activeTab === 'LOGS'
              ? 'border-indigo-600 text-indigo-700 bg-indigo-50/50'
              : 'border-transparent text-slate-600 hover:text-indigo-600 hover:border-indigo-300'
          }`}
        >
          <ClipboardList className={`w-4 h-4 ${activeTab === 'LOGS' ? 'text-indigo-600' : 'text-slate-400'}`} />
          <span>Log & Audit Report</span>
          <span className="text-[10px] font-medium bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded-full">
            Compliance
          </span>
        </button>
      </div>
    </header>
  );
}
