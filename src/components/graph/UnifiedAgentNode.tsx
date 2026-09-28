import React, { memo } from 'react';
import { Handle, Position, NodeProps, Node } from '@xyflow/react';
import { AgentDTO } from '../../lib/schemas';
import { useAgentsStore } from '../../stores/agents';
import { useProjectsStore } from '../../stores/projects';
import { useChatStore } from '../../stores/chat';
import { useUiStore } from '../../stores/ui';
import { cleanModelName } from '../../lib/format';
import { cn } from '../../lib/cn';
import { Terminal, MessageSquare } from 'lucide-react';

export type UnifiedNodeType = Node<{ agent: AgentDTO }, 'orchestrator' | 'agent'>;

export const UnifiedAgentNode = memo(({ data }: NodeProps<UnifiedNodeType>) => {
  const agent = data.agent;
  const isOrchestrator = agent.role === 'orchestrator';

  const selectedAgentId = useAgentsStore((s) => s.selectedAgentId);
  const selectAgent = useAgentsStore((s) => s.selectAgent);
  const openInspector = useUiStore((s) => s.openInspector);
  const setChatCollapsed = useUiStore((s) => s.setChatCollapsed);
  const activeProjectId = useProjectsStore((s) => s.activeProjectId);
  const projects = useProjectsStore((s) => s.projects);
  const setTargetAgentId = useChatStore((s) => s.setTargetAgentId);
  const setMobileActiveTab = useUiStore((s) => s.setMobileActiveTab);

  const activeProject = projects.find((p) => p.id === activeProjectId);
  const isIncludedInProject = !activeProject || activeProject.agent_ids.includes(agent.id);

  const isSelected = selectedAgentId === agent.id;
  const isBusy = agent.status === 'busy';
  const isError = agent.status === 'error';
  const isOffline = agent.status === 'offline';

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    selectAgent(agent.id);
    openInspector(agent.id, 'overview');
  };

  const handleOpenTerminal = (e: React.MouseEvent) => {
    e.stopPropagation();
    selectAgent(agent.id);
    openInspector(agent.id, 'logs');
  };

  const handleStartChat = (e: React.MouseEvent) => {
    e.stopPropagation();
    selectAgent(agent.id);
    setTargetAgentId(activeProjectId, agent.id);
    setChatCollapsed(false);
    setMobileActiveTab('chat');
  };

  const modelName = cleanModelName(agent.model_label);
  const agentColor = agent.color || (isOrchestrator ? '#ef4444' : '#64748b');

  // LED Color mapping per spec:
  // - Ijo (green): online
  // - Kuning (yellow): error, busy/thinking
  // - Red (merah): offline
  const getLedClass = () => {
    if (isOffline) {
      return 'bg-red-500 shadow-[0_0_12px_rgba(239,68,68,0.95)]';
    }
    if (isError) {
      return 'bg-yellow-400 shadow-[0_0_12px_rgba(250,204,21,0.95)] animate-pulse';
    }
    if (isBusy) {
      return 'bg-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.95)] animate-pulse';
    }
    if (agent.status === 'idle') {
      return 'bg-emerald-600/70 shadow-[0_0_6px_rgba(16,185,129,0.5)]';
    }
    // Default online: Hijau
    return 'bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.95)]';
  };

  // High-fidelity vector profile image tailored for each agent
  const renderProfileImage = () => {
    if (agent.id === 'shinaa') {
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

    if (agent.id === 'rika') {
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

    if (agent.id === 'lia') {
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

    if (agent.id === 'momo') {
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

    if (agent.id === 'cody') {
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

    if (agent.id === 'aria') {
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

    if (agent.id === 'sonix') {
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
        <circle cx="40" cy="30" r="11" fill={agentColor} />
        <rect x="34" y="28" width="12" height="3" rx="1.5" fill="#f1f5f9" />
        <text x="40" y="52" textAnchor="middle" fill="#94a3b8" fontSize="10" fontFamily="monospace" fontWeight="bold">
          {agent.name.slice(0, 2).toUpperCase()}
        </text>
      </svg>
    );
  };

  return (
    <div
      onClick={handleClick}
      role="button"
      tabIndex={0}
      aria-label={`${agent.name}, peran ${agent.role}, model ${modelName}, status ${agent.status}`}
      className={cn(
        'relative flex flex-col items-center justify-center cursor-pointer select-none transition-all duration-200 outline-none group',
        !isIncludedInProject && 'opacity-25 hover:opacity-70'
      )}
    >
      {/* 1. NAMA AGENT DI ATAS GAMBAR PROFILE (PERSIS DI TENGAH HORIZONTAL) */}
      <div className="mb-2 flex items-center justify-center gap-1.5 text-center">
        <span
          className="text-[13px] font-semibold tracking-wide text-white/95 font-sans group-hover:text-red-300 transition-colors drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]"
          style={{ color: isSelected ? agentColor : undefined }}
        >
          {agent.name}
        </span>
        {isOrchestrator ? (
          <span className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_6px_#ef4444]" title="Orchestrator Lead" />
        ) : (
          <span
            className="w-1.5 h-1.5 rounded-full"
            style={{ backgroundColor: agentColor, boxShadow: `0 0 6px ${agentColor}` }}
            title={`Layer ${agent.layer || 1}`}
          />
        )}
      </div>

      {/* 2. CENTER: PROFILE IMAGE (DEAD CENTER) DENGAN BUTTONS MELAYANG DI KANAN */}
      <div className="relative flex items-center justify-center">
        {/* Obsidian Celestial Node Body (Anchor Dead Center) */}
        <div className="relative group/node w-[70px] h-[70px]">
          {/* CENTER HANDLES: Tepat di titik tengah lingkaran avatar (Obsidian style) */}
          <Handle
            type="target"
            position={Position.Top}
            id="center-target"
            style={{
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%)',
              width: '1px',
              height: '1px',
              opacity: 0,
              pointerEvents: 'none',
              border: 0,
            }}
          />
          <Handle
            type="source"
            position={Position.Top}
            id="center-source"
            style={{
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%)',
              width: '1px',
              height: '1px',
              opacity: 0,
              pointerEvents: 'none',
              border: 0,
            }}
          />

          {/* Ambient Glow Aura (Obsidian Note Graph Feel) */}
          <div
            className={cn(
              'absolute -inset-2 rounded-full transition-opacity duration-300 pointer-events-none filter blur-[8px]',
              isSelected
                ? 'opacity-100'
                : isBusy
                ? 'opacity-100'
                : isOrchestrator
                ? 'opacity-80 group-hover/node:opacity-100'
                : 'opacity-35 group-hover/node:opacity-90'
            )}
            style={{
              backgroundColor: isSelected || isBusy ? agentColor : isOrchestrator ? '#ef4444' : agentColor,
              opacity: isSelected ? 0.45 : isBusy ? 0.35 : undefined,
            }}
            aria-hidden="true"
          />

          {/* THINKING STATE: OUTLINE CIRCLE YANG MUTER */}
          {isBusy && (
            <div
              className="absolute -inset-2.5 rounded-full border-2 border-transparent border-t-amber-400 border-r-yellow-400 animate-spin pointer-events-none shadow-[0_0_14px_rgba(250,204,21,0.7)] z-10"
              style={{ animationDuration: '0.8s' }}
              aria-hidden="true"
            />
          )}

          {/* Orchestrator Outer Subtle Ring */}
          {isOrchestrator && (
            <div
              className="absolute -inset-3.5 rounded-full border border-red-500/25 pointer-events-none animate-pulse"
              style={{ animationDuration: '3s' }}
              aria-hidden="true"
            />
          )}

          {/* Profile Image Circle (70px Obsidian Node) */}
          <div
            className={cn(
              'relative z-10 w-full h-full rounded-full p-1 transition-all duration-200 shadow-2xl overflow-hidden',
              'bg-[#0f141c]',
              isSelected
                ? 'border-2 shadow-2xl'
                : isBusy
                ? 'border-2 border-amber-400/90 shadow-[0_0_14px_rgba(245,158,11,0.5)]'
                : isOrchestrator
                ? 'border-2 border-red-500/70 shadow-[0_0_16px_rgba(220,38,38,0.4)]'
                : 'border border-white/25 hover:border-white/60 hover:shadow-[0_0_14px_rgba(255,255,255,0.2)]'
            )}
            style={
              isSelected
                ? {
                    borderColor: agentColor,
                    boxShadow: `0 0 20px ${agentColor}99`,
                  }
                : undefined
            }
          >
            {renderProfileImage()}
          </div>

          {/* LED INDIKATOR STATUS (Ijo=Online, Kuning=Error/Busy, Merah=Offline) */}
          <div
            className={cn(
              'absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-[#0b0f14] z-20 transition-all duration-300',
              getLedClass()
            )}
            title={agent.status}
          />
        </div>

        {/* SIDE BUTTONS DI SISI KANAN (ABSOLUTE POSITIONING) */}
        <div className="absolute left-[calc(100%+8px)] top-1/2 -translate-y-1/2 flex flex-col gap-1.5 z-30">
          {/* Button 1: Terminal / Log (>_) */}
          <button
            type="button"
            title="Terminal"
            aria-label="Terminal"
            onClick={handleOpenTerminal}
            className="w-7 h-7 rounded-full bg-[#161e28]/95 hover:bg-[#222d3d] border border-white/20 hover:border-red-400/60 text-gray-300 hover:text-white flex items-center justify-center shadow-xl transition-all duration-150 hover:scale-115 active:scale-95 cursor-pointer backdrop-blur-md group/btn"
          >
            <Terminal className="w-3.5 h-3.5 group-hover/btn:text-red-400 transition-colors" />
          </button>

          {/* Button 2: Chat (Direct Session Trigger) */}
          <button
            type="button"
            title="Chat"
            aria-label="Chat"
            onClick={handleStartChat}
            style={{
              borderColor: `${agentColor}80`,
            }}
            className="w-7 h-7 rounded-full bg-[#161218]/95 hover:bg-[#261520] border text-white flex items-center justify-center shadow-xl transition-all duration-150 hover:scale-115 active:scale-95 cursor-pointer backdrop-blur-md group/chat"
          >
            <MessageSquare
              className="w-3.5 h-3.5 transition-colors"
              style={{ color: agentColor }}
            />
          </button>
        </div>
      </div>

      {/* 3. NAMA MODEL DI BAWAH GAMBAR PROFILE (PERSIS DI TENGAH HORIZONTAL) */}
      <div className="mt-2 flex flex-col items-center justify-center text-center">
        <span className="px-2 py-0.5 rounded-full bg-[#121820]/90 border border-white/10 text-[10px] font-mono text-gray-300 tracking-tight shadow-sm group-hover:border-white/25 transition-colors">
          {modelName}
        </span>
      </div>
    </div>
  );
});

UnifiedAgentNode.displayName = 'UnifiedAgentNode';
