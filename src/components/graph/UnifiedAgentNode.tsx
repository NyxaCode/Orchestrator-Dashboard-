import React, { memo } from 'react';
import { Handle, Position, NodeProps, Node } from '@xyflow/react';
import { AgentDTO } from '../../lib/schemas';
import { useAgentsStore } from '../../stores/agents';
import { useProjectsStore } from '../../stores/projects';
import { useChatStore } from '../../stores/chat';
import { useUiStore } from '../../stores/ui';
import { cleanModelName } from '../../lib/format';
import { cn } from '../../lib/cn';
import { AgentAvatar } from '../ui/AgentAvatar';
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
  const setTargetAgentId = useChatStore((s) => s.setTargetAgentId);
  const setMobileActiveTab = useUiStore((s) => s.setMobileActiveTab);

  const isIncludedInProject = useProjectsStore((s) => {
    const p = s.projects.find((proj) => proj.id === s.activeProjectId);
    return !p || p.agent_ids.includes(agent.id);
  });

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
    const target = isOrchestrator ? null : agent.id;
    setTargetAgentId(activeProjectId || 'proj-1', target);
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
              'relative z-10 w-full h-full rounded-full transition-all duration-200 shadow-2xl overflow-hidden',
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
            <AgentAvatar
              agentId={agent.id}
              role={agent.role}
              name={agent.name}
              avatarUrl={agent.avatar_url}
              size={70}
              color={agentColor}
              className="border-0 shadow-none w-full h-full"
            />
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
