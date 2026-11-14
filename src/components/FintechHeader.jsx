import React from 'react';
import { Menu, ChevronLeft, Calendar, Database } from 'lucide-react';

export default function FintechHeader({
  title,
  subtitle,
  category = 'Habesha Enterprise',
  onMenuClick,
  onBack,
  showBackButton = false,
  showMenu = true,
  actions = null
}) {
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <header className="sticky top-0 z-30 bg-[#0D121D]/90 backdrop-blur-md px-4 sm:px-6 lg:px-8 py-3.5 border-b border-[#1E2635]">
      <div className="flex items-center justify-between gap-4">
        {/* Left Side: Back Button OR Mobile Menu + Title */}
        <div className="flex items-center gap-3 min-w-0">
          {showBackButton ? (
            <button
              onClick={onBack}
              aria-label="Go back"
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#161C28] border border-[#1E2635] text-white hover:border-[#00D1FF]/50 hover:bg-[#1A2232] transition-colors shrink-0"
            >
              <ChevronLeft size={16} />
              <span className="text-xs font-semibold hidden sm:inline">Back</span>
            </button>
          ) : showMenu ? (
            <button
              onClick={onMenuClick}
              aria-label="Open mobile menu"
              className="md:hidden p-2.5 rounded-xl bg-[#161C28] border border-[#1E2635] text-white hover:border-[#00D1FF]/50 transition-colors shrink-0"
            >
              <Menu size={18} />
            </button>
          ) : null}

          <div className="min-w-0">
            {category && (
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-[#8E99AE] tracking-widest uppercase mb-0.5">
                <span>{category}</span>
                {subtitle && <span>•</span>}
                {subtitle && <span className="text-[#00D1FF]">{subtitle}</span>}
              </div>
            )}
            <h1 className="text-lg sm:text-xl font-bold text-white tracking-tight truncate">
              {title}
            </h1>
          </div>
        </div>

        {/* Right Side: Global Status & Screen-Specific Actions */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Live Date display (desktop) */}
          <div className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#161C28] border border-[#1E2635] text-xs text-[#8E99AE]">
            <Calendar size={13} className="text-[#00D1FF]" />
            <span>{today}</span>
          </div>

          {/* Screen Actions */}
          {actions && (
            <div className="flex items-center gap-2">
              {actions}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
