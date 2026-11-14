import React from 'react';

export function FintechCard({
  children,
  className = '',
  onClick,
  isSelected = false
}) {
  return (
    <div
      onClick={onClick}
      className={`bg-[#161C28] border rounded-2xl p-4 transition-all duration-200 ${
        isSelected
          ? 'border-[#00D1FF] shadow-[0_0_15px_rgba(0,209,255,0.15)]'
          : 'border-[#1E2635] hover:border-[#1E2635]/80'
      } ${onClick ? 'cursor-pointer active:scale-[0.99]' : ''} ${className}`}
    >
      {children}
    </div>
  );
}

export function FintechBadge({
  label,
  color = '#339AF0',
  isOutline = false,
  className = ''
}) {
  return (
    <span
      style={{
        color: color,
        backgroundColor: isOutline ? 'transparent' : `${color}1A`,
        borderColor: `${color}80`
      }}
      className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold border tracking-wider uppercase ${className}`}
    >
      {label}
    </span>
  );
}

export function SectionHeader({ title, action, className = '' }) {
  return (
    <div className={`flex items-center justify-between mt-5 mb-3 px-1 ${className}`}>
      <div className="flex items-center gap-2">
        <div className="w-1 h-3 rounded-full bg-[#00D1FF]" />
        <h3 className="text-[11px] font-bold text-[#00D1FF] tracking-wider uppercase">
          {title}
        </h3>
      </div>
      {action}
    </div>
  );
}

export function FintechHubTile({
  title,
  subtitle,
  icon: Icon,
  iconColor = '#00D1FF',
  onTap,
  badge = null,
  className = ''
}) {
  return (
    <div
      onClick={onTap}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { onTap?.(); } }}
      className={`flex items-center gap-3.5 p-3.5 mb-2.5 bg-[#161C28] border border-[#1E2635] rounded-2xl cursor-pointer hover:border-[#00D1FF]/40 hover:bg-[#1A2232] active:scale-[0.99] transition-all duration-150 ${className}`}
    >
      <div
        style={{
          backgroundColor: `${iconColor}15`,
          borderColor: `${iconColor}30`,
          color: iconColor
        }}
        className="w-11 h-11 rounded-xl border flex items-center justify-center shrink-0"
      >
        {Icon && <Icon size={22} />}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <h4 className="text-[13px] font-bold text-white tracking-tight truncate">
            {title}
          </h4>
          {badge}
        </div>
        {subtitle && (
          <p className="text-[11px] text-[#8E99AE] truncate mt-0.5">
            {subtitle}
          </p>
        )}
      </div>

      <svg
        className="w-4 h-4 text-[#8E99AE] shrink-0 ml-1"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
      </svg>
    </div>
  );
}
