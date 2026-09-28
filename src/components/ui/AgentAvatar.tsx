import React from 'react';
import { cn } from '../../lib/cn';

interface AgentAvatarProps {
  agent?: {
    id: string;
    name: string;
    role?: 'user' | 'orchestrator' | 'agent' | 'system';
    avatar_url?: string | null;
    color?: string;
  } | null;
  agentId?: string | null;
  role?: 'user' | 'orchestrator' | 'agent' | 'system';
  name?: string;
  avatarUrl?: string | null;
  size?: number | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  color?: string;
}

export const AgentAvatar: React.FC<AgentAvatarProps> = ({
  agent,
  agentId,
  role,
  name,
  avatarUrl,
  size = 28,
  className,
  color,
}) => {
  const pixelSize =
    typeof size === 'number'
      ? size
      : size === 'sm'
      ? 20
      : size === 'md'
      ? 28
      : size === 'lg'
      ? 40
      : 70;

  const effectiveRole = agent?.role || role;
  const isUser = effectiveRole === 'user';
  const effectiveId = (agent?.id || agentId || '').toLowerCase();
  const effectiveName = agent?.name || name;
  const effectiveAvatarUrl = agent?.avatar_url || avatarUrl;
  const effectiveColor =
    agent?.color || color || (effectiveRole === 'orchestrator' ? '#ef4444' : '#64748b');

  // If real avatar image url is provided
  if (effectiveAvatarUrl) {
    return (
      <img
        src={effectiveAvatarUrl}
        alt={effectiveName || 'Avatar'}
        style={{ width: `${pixelSize}px`, height: `${pixelSize}px` }}
        className={cn('rounded-full object-cover shrink-0 select-none shadow-md', className)}
      />
    );
  }

  // Render high-fidelity SVG illustration
  const renderVectorIllustration = () => {
    if (isUser) {
      return (
        <svg viewBox="0 0 80 80" className="w-full h-full rounded-full" aria-hidden="true">
          <defs>
            <radialGradient id="user-bg" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#2e1215" />
              <stop offset="70%" stopColor="#180709" />
              <stop offset="100%" stopColor="#0b0204" />
            </radialGradient>
            <linearGradient id="user-accent" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f87171" />
              <stop offset="100%" stopColor="#dc2626" />
            </linearGradient>
          </defs>
          <circle cx="40" cy="40" r="40" fill="url(#user-bg)" />
          <circle cx="40" cy="40" r="38" fill="none" stroke="#dc2626" strokeWidth="1" strokeDasharray="3 3" opacity="0.4" />
          <circle cx="40" cy="27" r="12" fill="url(#user-accent)" />
          <path d="M22 62 C22 47 30 41 40 41 C50 41 58 47 58 62 Z" fill="#991b1b" />
          <circle cx="40" cy="26" r="3" fill="#ffffff" opacity="0.9" />
        </svg>
      );
    }

    if (effectiveId === 'shinaa' || role === 'orchestrator') {
      return (
        <svg viewBox="0 0 80 80" className="w-full h-full rounded-full" aria-hidden="true">
          <defs>
            <radialGradient id="shinaa-bg" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#450a0a" />
              <stop offset="70%" stopColor="#1a0507" />
              <stop offset="100%" stopColor="#0b0204" />
            </radialGradient>
            <linearGradient id="shinaa-glow" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ef4444" />
              <stop offset="100%" stopColor="#991b1b" />
            </linearGradient>
          </defs>
          <circle cx="40" cy="40" r="40" fill="url(#shinaa-bg)" />
          <circle cx="40" cy="40" r="28" fill="none" stroke="#dc2626" strokeWidth="0.8" strokeDasharray="3 3" opacity="0.45" />
          <circle cx="40" cy="40" r="18" fill="none" stroke="#ef4444" strokeWidth="0.8" opacity="0.35" />
          <path d="M26 56 C26 44 32 38 40 38 C48 38 54 44 54 56 Z" fill="#7f1d1d" opacity="0.85" />
          <circle cx="40" cy="28" r="11" fill="url(#shinaa-glow)" />
          <rect x="33" y="26" width="14" height="3" rx="1.5" fill="#fecaca" />
          <circle cx="40" cy="27.5" r="1.2" fill="#ffffff" />
          <circle cx="22" cy="30" r="1.5" fill="#f87171" opacity="0.8" />
          <circle cx="58" cy="46" r="1.5" fill="#f87171" opacity="0.8" />
        </svg>
      );
    }

    if (effectiveId === 'rika') {
      return (
        <svg viewBox="0 0 80 80" className="w-full h-full rounded-full" aria-hidden="true">
          <defs>
            <radialGradient id="rika-bg" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#451a03" />
              <stop offset="70%" stopColor="#1c0c04" />
              <stop offset="100%" stopColor="#0a0502" />
            </radialGradient>
            <linearGradient id="rika-glow" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#b45309" />
            </linearGradient>
          </defs>
          <circle cx="40" cy="40" r="40" fill="url(#rika-bg)" />
          <ellipse cx="30" cy="20" rx="5" ry="6" fill="#d97706" opacity="0.75" />
          <ellipse cx="50" cy="20" rx="5" ry="6" fill="#d97706" opacity="0.75" />
          <circle cx="40" cy="30" r="12" fill="url(#rika-glow)" />
          <path d="M25 58 C25 46 31 40 40 40 C49 40 55 46 55 58 Z" fill="#92400e" opacity="0.85" />
          <path d="M28 29 C28 22 52 22 52 29" fill="none" stroke="#fde68a" strokeWidth="2" strokeLinecap="round" />
          <rect x="26" y="27" width="3" height="6" rx="1.5" fill="#fde68a" />
          <rect x="51" y="27" width="3" height="6" rx="1.5" fill="#fde68a" />
          <path d="M51 31 C51 35 46 37 42 37" fill="none" stroke="#fde68a" strokeWidth="1.2" strokeLinecap="round" />
          <circle cx="41.5" cy="37" r="1.5" fill="#ffffff" />
        </svg>
      );
    }

    if (effectiveId === 'lia') {
      return (
        <svg viewBox="0 0 80 80" className="w-full h-full rounded-full" aria-hidden="true">
          <defs>
            <radialGradient id="lia-bg" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#1e1b4b" />
              <stop offset="70%" stopColor="#0f0e26" />
              <stop offset="100%" stopColor="#050510" />
            </radialGradient>
            <linearGradient id="lia-glow" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#818cf8" />
              <stop offset="100%" stopColor="#4338ca" />
            </linearGradient>
          </defs>
          <circle cx="40" cy="40" r="40" fill="url(#lia-bg)" />
          <path d="M20 40 Q25 32 30 40 T40 40 T50 40 T60 40" fill="none" stroke="#6366f1" strokeWidth="1" opacity="0.45" />
          <path d="M22 45 Q31 36 40 45 T58 45" fill="none" stroke="#818cf8" strokeWidth="0.8" opacity="0.35" />
          <path d="M26 58 C26 46 32 41 40 41 C48 41 54 46 54 58 Z" fill="#3730a3" opacity="0.85" />
          <circle cx="40" cy="30" r="11" fill="url(#lia-glow)" />
          <path d="M27 30 C27 21 53 21 53 30" fill="none" stroke="#c7d2fe" strokeWidth="2.5" strokeLinecap="round" />
          <rect x="25" y="27" width="4" height="8" rx="2" fill="#c7d2fe" />
          <rect x="51" y="27" width="4" height="8" rx="2" fill="#c7d2fe" />
          <rect x="34" y="29" width="12" height="2.5" rx="1" fill="#e0e7ff" />
        </svg>
      );
    }

    if (effectiveId === 'shina-child-1' || effectiveId.includes('child')) {
      return (
        <svg viewBox="0 0 80 80" className="w-full h-full rounded-full" aria-hidden="true">
          <defs>
            <radialGradient id="child-bg" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#064e3b" />
              <stop offset="70%" stopColor="#022c22" />
              <stop offset="100%" stopColor="#011812" />
            </radialGradient>
            <linearGradient id="child-glow" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#34d399" />
              <stop offset="100%" stopColor="#059669" />
            </linearGradient>
          </defs>
          <circle cx="40" cy="40" r="40" fill="url(#child-bg)" />
          <circle cx="40" cy="40" r="28" fill="none" stroke="#10b981" strokeWidth="0.8" strokeDasharray="3 3" opacity="0.45" />
          <path d="M26 58 C26 46 32 41 40 41 C48 41 54 46 54 58 Z" fill="#047857" opacity="0.85" />
          <circle cx="40" cy="30" r="11" fill="url(#child-glow)" />
          <rect x="32" y="27" width="16" height="3" rx="1.5" fill="#a7f3d0" />
          <text x="40" y="52" textAnchor="middle" fill="#6ee7b7" fontSize="9" fontFamily="monospace" fontWeight="bold">C1</text>
        </svg>
      );
    }

    if (effectiveId === 'momo') {
      return (
        <svg viewBox="0 0 80 80" className="w-full h-full rounded-full" aria-hidden="true">
          <defs>
            <radialGradient id="momo-bg" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#431407" />
              <stop offset="100%" stopColor="#0a0502" />
            </radialGradient>
          </defs>
          <circle cx="40" cy="40" r="40" fill="url(#momo-bg)" />
          <ellipse cx="28" cy="22" rx="6" ry="7" fill="#ea580c" opacity="0.8" />
          <ellipse cx="52" cy="22" rx="6" ry="7" fill="#ea580c" opacity="0.8" />
          <circle cx="40" cy="32" r="13" fill="#fb923c" />
          <ellipse cx="34" cy="31" rx="2" ry="2.5" fill="#0f172a" />
          <ellipse cx="46" cy="31" rx="2" ry="2.5" fill="#0f172a" />
          <circle cx="40" cy="37" r="1.5" fill="#dc2626" />
          <path d="M24 58 C24 46 31 42 40 42 C49 42 56 46 56 58 Z" fill="#9a3412" />
        </svg>
      );
    }

    if (effectiveId === 'cody') {
      return (
        <svg viewBox="0 0 80 80" className="w-full h-full rounded-full" aria-hidden="true">
          <defs>
            <radialGradient id="cody-bg" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#3f2c00" />
              <stop offset="100%" stopColor="#080702" />
            </radialGradient>
          </defs>
          <circle cx="40" cy="40" r="40" fill="url(#cody-bg)" />
          <rect x="25" y="22" width="30" height="22" rx="4" fill="#ca8a04" opacity="0.85" />
          <circle cx="34" cy="32" r="2.5" fill="#fef08a" />
          <circle cx="46" cy="32" r="2.5" fill="#fef08a" />
          <rect x="33" y="38" width="14" height="2" rx="1" fill="#fef08a" />
          <path d="M24 58 C24 48 31 44 40 44 C49 44 56 48 56 58 Z" fill="#854d0e" />
        </svg>
      );
    }

    if (effectiveId === 'aria') {
      return (
        <svg viewBox="0 0 80 80" className="w-full h-full rounded-full" aria-hidden="true">
          <defs>
            <radialGradient id="aria-bg" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#3b0764" />
              <stop offset="100%" stopColor="#09020f" />
            </radialGradient>
          </defs>
          <circle cx="40" cy="40" r="40" fill="url(#aria-bg)" />
          <circle cx="40" cy="30" r="12" fill="#c084fc" />
          <path d="M22 30 Q31 20 40 30 T58 30" fill="none" stroke="#e9d5ff" strokeWidth="2" strokeLinecap="round" />
          <path d="M24 58 C24 46 31 41 40 41 C49 41 56 46 56 58 Z" fill="#7e22ce" />
        </svg>
      );
    }

    if (effectiveId === 'sonix') {
      return (
        <svg viewBox="0 0 80 80" className="w-full h-full rounded-full" aria-hidden="true">
          <defs>
            <radialGradient id="sonix-bg" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#082f49" />
              <stop offset="100%" stopColor="#02090f" />
            </radialGradient>
          </defs>
          <circle cx="40" cy="40" r="40" fill="url(#sonix-bg)" />
          <rect x="25" y="32" width="4" height="12" rx="1" fill="#38bdf8" />
          <rect x="33" y="24" width="4" height="20" rx="1" fill="#38bdf8" />
          <rect x="41" y="18" width="4" height="26" rx="1" fill="#7dd3fc" />
          <rect x="49" y="26" width="4" height="18" rx="1" fill="#38bdf8" />
          <rect x="57" y="34" width="4" height="10" rx="1" fill="#0284c7" />
          <path d="M24 58 C24 50 31 46 40 46 C49 46 56 50 56 58 Z" fill="#0369a1" />
        </svg>
      );
    }

    // Dynamic Generic Sub-Agent
    const initialText = (name || effectiveId || 'AG').slice(0, 2).toUpperCase();
    return (
      <svg viewBox="0 0 80 80" className="w-full h-full rounded-full" aria-hidden="true">
        <defs>
          <radialGradient id="gen-bg" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#1e293b" />
            <stop offset="100%" stopColor="#0b0f17" />
          </radialGradient>
        </defs>
        <circle cx="40" cy="40" r="40" fill="url(#gen-bg)" />
        <circle cx="40" cy="40" r="30" fill="none" stroke="#475569" strokeWidth="1" strokeDasharray="3 3" opacity="0.45" />
        <path d="M26 58 C26 46 32 41 40 41 C48 41 54 46 54 58 Z" fill="#334155" />
        <circle cx="40" cy="30" r="11" fill={effectiveColor} />
        <rect x="34" y="28" width="12" height="3" rx="1.5" fill="#f1f5f9" />
        <text x="40" y="52" textAnchor="middle" fill="#94a3b8" fontSize="10" fontFamily="monospace" fontWeight="bold">
          {initialText}
        </text>
      </svg>
    );
  };

  return (
    <div
      style={{ width: `${pixelSize}px`, height: `${pixelSize}px` }}
      className={cn(
        'rounded-full shrink-0 select-none overflow-hidden p-[1px] bg-[#0c1017] border shadow-md flex items-center justify-center',
        isUser
          ? 'border-red-500/50 shadow-[0_0_8px_rgba(220,38,38,0.25)]'
          : role === 'orchestrator' || effectiveId === 'shinaa'
          ? 'border-red-500/70 shadow-[0_0_8px_rgba(220,38,38,0.35)]'
          : 'border-white/20',
        className
      )}
    >
      {renderVectorIllustration()}
    </div>
  );
};
