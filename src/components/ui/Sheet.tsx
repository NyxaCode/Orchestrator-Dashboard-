import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { cn } from '../../lib/cn';
import { IconButton } from './IconButton';

interface SheetProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  width?: string;
}

export const Sheet: React.FC<SheetProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  width = 'w-[420px]',
}) => {
  const sheetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end md:bg-black/40 md:backdrop-blur-xs transition-opacity duration-200">
      {/* Mobile Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 md:hidden"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sheet Content: Bottom Sheet on mobile, Right Drawer on desktop */}
      <div
        ref={sheetRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={cn(
          'relative z-10 flex flex-col glass-panel shadow-2xl transition-transform duration-250 ease-out',
          // Desktop: right drawer
          'hidden md:flex h-full border-l border-white/10',
          width,
          // Mobile: bottom sheet
          'max-md:flex max-md:fixed max-md:inset-x-0 max-md:bottom-0 max-md:h-[86dvh] max-md:rounded-t-2xl max-md:border-t max-md:border-white/15'
        )}
      >
        {/* Mobile Drag Handle */}
        <div className="flex md:hidden justify-center pt-2.5 pb-1 cursor-grab active:cursor-grabbing">
          <div className="w-12 h-1.5 rounded-full bg-white/25" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-5 py-3 border-b border-white/10 shrink-0">
          <div className="min-w-0 pr-2">
            <h3 className="text-xs sm:text-sm font-semibold text-white tracking-wide truncate">{title}</h3>
            {subtitle && <p className="text-[11px] sm:text-xs font-mono text-gray-400 mt-0.5 truncate">{subtitle}</p>}
          </div>
          <IconButton
            aria-label="Tutup panel"
            size="sm"
            variant="ghost"
            onClick={onClose}
            className="shrink-0"
          >
            <X className="w-4 h-4" />
          </IconButton>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 text-sm">{children}</div>
      </div>
    </div>
  );
};
