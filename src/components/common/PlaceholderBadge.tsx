import React from 'react';
import { Info } from 'lucide-react';

interface PlaceholderBadgeProps {
  label?: string;
  variant?: 'subtle' | 'compact' | 'light';
  className?: string;
}

export const PlaceholderBadge: React.FC<PlaceholderBadgeProps> = ({
  label = 'Client Project Placeholder — Replace via CMS',
  variant = 'subtle',
  className = '',
}) => {
  if (variant === 'compact') {
    return (
      <span
        title="Temporary demonstration asset. Replace via Conclave Admin CMS."
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] tracking-widest uppercase font-mono bg-[#202124]/85 backdrop-blur-xs text-[#D6CBBE] border border-[#B08D57]/30 ${className}`}
      >
        <Info className="w-3 h-3 text-[#B08D57]" />
        <span>Placeholder Asset</span>
      </span>
    );
  }

  return (
    <div
      title="Temporary demonstration asset. Replace with client photography in CMS."
      className={`inline-flex items-center gap-2 px-3 py-1.5 text-[11px] tracking-wider uppercase font-mono bg-[#202124]/90 backdrop-blur-md text-[#F2EEE7] border border-[#B08D57]/40 shadow-xs ${className}`}
    >
      <Info className="w-3.5 h-3.5 text-[#B08D57] shrink-0" />
      <span className="opacity-90">{label}</span>
    </div>
  );
};
