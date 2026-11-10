import React, { useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import CenetScreen from './screens/CenetScreen';
import LoopScreen from './screens/LoopScreen';
import LogReportScreen from './screens/LogReportScreen';
import { Database, ShieldCheck, Smartphone } from 'lucide-react';

function AppContent() {
  const [activeTab, setActiveTab] = useState('CENET');

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
      {/* Navigation Header */}
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Screen Content */}
      <main className="flex-1 pb-16">
        {activeTab === 'CENET' && <CenetScreen />}
        {activeTab === 'LOOP' && <LoopScreen />}
        {activeTab === 'LOGS' && <LogReportScreen />}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 text-slate-500 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-700">Daily Sales &amp; Import Manager (Web Edition)</span>
            <span>•</span>
            <span>React + Node.js Fullstack</span>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-[11px]">
            <span className="flex items-center gap-1.5 font-medium text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              <Database className="w-3.5 h-3.5" />
              Firestore: elaprojects-3212e
            </span>
            <span className="flex items-center gap-1.5 font-medium text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-200">
              <ShieldCheck className="w-3.5 h-3.5" />
              RBAC Enabled
            </span>
            <span className="flex items-center gap-1.5 font-medium text-purple-700 bg-purple-50 px-2.5 py-1 rounded-full border border-purple-200">
              <Smartphone className="w-3.5 h-3.5" />
              Shared with proj_ela Mobile
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
