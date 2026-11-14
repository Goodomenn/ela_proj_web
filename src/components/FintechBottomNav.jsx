import React from 'react';
import { 
  LayoutGrid, 
  ArrowLeftRight, 
  CheckCheck, 
  UtensilsCrossed, 
  Settings 
} from 'lucide-react';

export const TABS = [
  { id: 'home', label: 'Home', icon: LayoutGrid },
  { id: 'transactions', label: 'Transactions', icon: ArrowLeftRight },
  { id: 'audit', label: 'Audit', icon: CheckCheck },
  { id: 'fb', label: 'F&B Hub', icon: UtensilsCrossed },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export default function FintechBottomNav({ activeTab, onChangeTab }) {
  return (
    <nav className="sticky bottom-0 z-30 bg-[#161C28] border-t border-[#1E2635] px-2 py-2 shadow-lg">
      <div className="flex items-center justify-around max-w-lg mx-auto">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onChangeTab(tab.id)}
              className="flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all duration-150 min-w-[56px] group"
            >
              {/* Active Indicator Pill */}
              <div 
                className={`flex items-center justify-center px-4 py-1 rounded-full transition-all duration-200 ${
                  isActive 
                    ? 'bg-[#00D1FF]/15 text-[#00D1FF]' 
                    : 'text-white/70 group-hover:text-white group-hover:bg-white/5'
                }`}
              >
                <Icon size={20} strokeWidth={isActive ? 2.3 : 1.8} />
              </div>
              <span 
                className={`text-[10px] mt-1 tracking-tight transition-colors ${
                  isActive 
                    ? 'text-[#00D1FF] font-bold' 
                    : 'text-white/70 group-hover:text-white'
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
