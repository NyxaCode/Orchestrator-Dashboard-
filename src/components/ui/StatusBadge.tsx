import React from 'react';
import { AgentStatus } from '../../lib/schemas';
import { cn } from '../../lib/cn';

interface StatusBadgeProps {
  status: AgentStatus;
  className?: string;
  size?: 'sm' | 'md';
}

const STATUS_CONFIG: Record<
  AgentStatus,
  { label: string; icon: string; textClass: string; dotClass: string }
> = {
  online: {
    label: 'Online',
    icon: '●',
    textClass: 'text-emerald-400',
    dotClass: 'bg-emerald-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]',
  },
  busy: {
    label: 'Busy',
    icon: '◐',
    textClass: 'text-amber-400',
    dotClass: 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.6)] animate-pulse',
  },
  idle: {
    label: 'Idle',
    icon: '○',
    textClass: 'text-slate-400',
    dotClass: 'bg-slate-400',
  },
  offline: {
    label: 'Offline',
    icon: '◌',
    textClass: 'text-slate-500',
    dotClass: 'bg-slate-600',
  },
  error: {
    label: 'Error',
    icon: '▲',
    textClass: 'text-red-400 font-semibold',
    dotClass: 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.7)]',
  },
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  className,
  size = 'md',
}) => {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.offline;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 font-mono select-none',
        size === 'sm' ? 'text-[11px]' : 'text-xs',
        cfg.textClass,
        className
      )}
      role="status"
      aria-label={`Status: ${cfg.label}`}
    >
      <span aria-hidden="true" className="font-bold text-[10px] leading-none">
        {cfg.icon}
      </span>
      <span>{cfg.label}</span>
    </span>
  );
};
