import React, { useEffect, useRef } from 'react';
import { useAgentsStore } from '../../stores/agents';
import { AgentDTO } from '../../lib/schemas';
import { cleanModelName } from '../../lib/format';
import { AgentAvatar } from '../ui/AgentAvatar';

interface MentionPopoverProps {
  filter: string;
  activeIndex?: number;
  onHoverIndex?: (index: number) => void;
  onSelect: (agent: AgentDTO) => void;
  onClose: () => void;
}

export const MentionPopover: React.FC<MentionPopoverProps> = ({
  filter,
  activeIndex = 0,
  onHoverIndex,
  onSelect,
}) => {
  const agents = useAgentsStore((s) => s.agents);
  const agentList = Object.values(agents);
  const listRef = useRef<HTMLDivElement>(null);

  const matched = agentList.filter(
    (a) =>
      a.name.toLowerCase().includes(filter.toLowerCase()) ||
      a.id.toLowerCase().includes(filter.toLowerCase())
  );

  // Auto-scroll active item into view
  useEffect(() => {
    if (listRef.current) {
      const activeEl = listRef.current.children[activeIndex] as HTMLElement;
      if (activeEl) {
        activeEl.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [activeIndex]);

  if (matched.length === 0) return null;

  return (
    <div className="absolute bottom-full mb-2 left-2.5 right-2.5 max-w-sm z-30 rounded-xl bg-[#0e131b]/98 border border-white/20 p-1.5 shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in-95 duration-100 select-none">
      <div className="px-2.5 py-1.5 flex items-center justify-between text-[10px] font-mono text-gray-400 border-b border-white/10 uppercase">
        <span className="font-bold text-gray-200">MENTION AGENT</span>
        <span className="text-[9px] text-gray-500 font-normal">Tekan Tab atau ↵</span>
      </div>
      <div ref={listRef} className="max-h-48 overflow-y-auto py-1 space-y-0.5">
        {matched.map((agent, idx) => {
          const isHighlighted = idx === activeIndex;
          return (
            <button
              key={agent.id}
              type="button"
              onMouseEnter={() => onHoverIndex?.(idx)}
              onClick={() => onSelect(agent)}
              className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-left text-xs font-mono transition-all cursor-pointer ${
                isHighlighted
                  ? 'bg-red-500/25 text-white border border-red-500/50 shadow-sm'
                  : 'text-gray-300 hover:text-white hover:bg-white/5 border border-transparent'
              }`}
            >
              <AgentAvatar
                agentId={agent.id}
                role={agent.role}
                name={agent.name}
                avatarUrl={agent.avatar_url}
                size={22}
                color={agent.color}
              />
              <div className="truncate flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold text-white">@{agent.name}</span>
                  <span className="text-[10px] text-gray-400 capitalize">
                    {agent.role === 'orchestrator' ? 'Lead' : `L${agent.layer || 1}`}
                  </span>
                </div>
                <span className="text-[10px] text-gray-400 block truncate">
                  {agent.description || cleanModelName(agent.model_label)}
                </span>
              </div>
              {isHighlighted && (
                <span className="shrink-0 text-[9px] px-1.5 py-0.5 rounded bg-white/15 text-gray-200 font-mono font-medium">
                  Tab ⇥
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
