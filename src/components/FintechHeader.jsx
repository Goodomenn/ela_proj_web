import React from 'react';
import { Menu, ChevronLeft } from 'lucide-react';

export default function FintechHeader({
  title,
  subtitle,
  onMenuClick,
  onBack,
  showBackButton = false,
  showMenu = true,
  actions = null
}) {
  return (
    <header className="sticky top-0 z-30 bg-[#0D121D]/95 backdrop-blur-md px-5 pt-4 pb-3 border-b border-[#1E2635]/60">
      <div className="flex items-center justify-between gap-3">
        {/* Left Side: Menu or Back */}
        <div className="flex items-center gap-2 min-w-[42px]">
          {showBackButton ? (
            <button
              onClick={onBack}
              aria-label="Go back"
              className="p-2.5 rounded-xl bg-[#161C28] border border-[#1E2635] text-white hover:border-[#00D1FF]/50 transition-colors"
            >
              <ChevronLeft size={18} />
            </button>
          ) : showMenu ? (
            <button
              onClick={onMenuClick}
              aria-label="Open menu"
              className="p-2.5 rounded-xl bg-[#161C28] border border-[#1E2635] text-white hover:border-[#00D1FF]/50 transition-colors"
            >
              <Menu size={18} />
            </button>
          ) : (
            <div className="w-10" />
          )}
        </div>

        {/* Center: Title & Subtitle */}
        <div className="flex-1 text-center truncate px-2">
          <h1 className="text-lg font-bold text-white tracking-tight truncate">
            {title}
          </h1>
          {subtitle && (
            <p className="text-[10px] font-semibold text-[#8E99AE] tracking-widest uppercase truncate mt-0.5">
              {subtitle}
            </p>
          )}
        </div>

        {/* Right Side: Action Slot */}
        <div className="flex items-center justify-end gap-1.5 min-w-[42px]">
          {actions}
        </div>
      </div>
    </header>
  );
}
