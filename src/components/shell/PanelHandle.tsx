import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PanelHandleProps {
  side: 'left' | 'right';
  isCollapsed: boolean;
  onToggle: () => void;
  label: string;
}

export const PanelHandle: React.FC<PanelHandleProps> = ({
  side,
  isCollapsed,
  onToggle,
  label,
}) => {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={`${isCollapsed ? 'Buka' : 'Tutup'} ${label}`}
      title={`${isCollapsed ? 'Buka' : 'Tutup'} ${label}`}
      className={`absolute top-1/2 -translate-y-1/2 z-30 w-4 h-14 bg-[#161e28] hover:bg-[#1f2937] border border-white/15 flex items-center justify-center text-gray-400 hover:text-white transition-colors cursor-pointer select-none ${
        side === 'left'
          ? 'left-0 rounded-r-md border-l-0 shadow-md'
          : 'right-0 rounded-l-md border-r-0 shadow-md'
      }`}
    >
      {side === 'left' ? (
        isCollapsed ? (
          <ChevronRight className="w-3 h-3 text-red-400" />
        ) : (
          <ChevronLeft className="w-3 h-3" />
        )
      ) : isCollapsed ? (
        <ChevronLeft className="w-3 h-3 text-red-400" />
      ) : (
        <ChevronRight className="w-3 h-3" />
      )}
    </button>
  );
};
