import React from 'react';
import { useAgentsStore } from '../../stores/agents';
import { AgentDTO } from '../../lib/schemas';
import { cleanModelName } from '../../lib/format';

interface MentionPopoverProps {
  filter: string;
  onSelect: (agent: AgentDTO) => void;
  onClose: () => void;
}

export const MentionPopover: React.FC<MentionPopoverProps> = ({
  filter,
  onSelect,
}) => {
  const agents = useAgentsStore((s) => s.agents);
  const agentList = Object.values(agents);

  const matched = agentList.filter((a) =>
    a.name.toLowerCase().includes(filter.toLowerCase()) ||
    a.id.toLowerCase().includes(filter.toLowerCase())
  );

  if (matched.length === 0) return null;

  return (
    <div className="absolute bottom-full mb-2 left-2 z-30 w-56 rounded-lg glass-panel border border-white/15 p-1 shadow-2xl animate-in fade-in zoom-in-95 duration-100">
      <div className="px-2 py-1 text-[10px] font-mono text-gray-400 border-b border-white/10 uppercase">
        PILIH TARGET AGENT
      </div>
      <div className="max-h-40 overflow-y-auto py-1">
        {matched.map((agent) => (
          <button
            key={agent.id}
            type="button"
            onClick={() => onSelect(agent)}
            className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded text-left text-xs font-mono text-gray-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center font-bold text-[10px] text-red-300 uppercase">
              {agent.name.slice(0, 2)}
            </div>
            <div className="truncate">
              <span className="font-semibold text-white">@{agent.name}</span>
              <span className="text-[10px] text-gray-500 block truncate">
                {agent.role === 'orchestrator' ? 'Orchestrator' : cleanModelName(agent.model_label)}
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
