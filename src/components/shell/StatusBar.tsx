import React from 'react';
import { useAgentsStore } from '../../stores/agents';
import { useChatStore } from '../../stores/chat';
import { getCurrentAdapterType } from '../../server/adapters';

export const StatusBar: React.FC = () => {
  const agents = useAgentsStore((s) => s.agents);
  const isAutoSaving = useAgentsStore((s) => s.isAutoSaving);
  const tasks = useChatStore((s) => s.tasks);
  const sseStatus = useChatStore((s) => s.sseStatus);

  const agentList = Object.values(agents);
  const onlineAgents = agentList.filter((a) => a.status === 'online' || a.status === 'busy');
  const runningTasks = tasks.filter((t) => t.status === 'running');
  const adapterType = getCurrentAdapterType();

  return (
    <footer className="h-6 border-t border-white/10 bg-[#0c1016] px-3 flex items-center justify-between text-[11px] font-mono select-none shrink-0 z-20 text-gray-400 overflow-hidden min-w-0">
      {/* Auto Save status left */}
      <div className="flex items-center gap-2 shrink-0">
        <div className={`flex items-center gap-1.5 transition-colors ${isAutoSaving ? 'auto-saving text-red-400 font-semibold' : 'text-gray-500'}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-current" />
          <span className="text-[10px]">AUTO SAVE</span>
        </div>
      </div>

      {/* Main Status telemetry right */}
      <div className="flex items-center gap-2 sm:gap-3 text-[10px] tracking-tight shrink-0 overflow-hidden">
        <span>
          AGENTS <strong className="text-white tabular-nums">{onlineAgents.length}/{agentList.length}</strong> ONLINE
        </span>
        <span className="text-gray-600">·</span>
        <span>
          TASKS <strong className="text-white tabular-nums">{runningTasks.length}</strong> RUNNING
        </span>
        <span className="text-gray-600 hidden sm:inline">·</span>
        <span className="hidden sm:flex items-center gap-1">
          <span>SSE</span>
          <span className={`inline-block w-1.5 h-1.5 rounded-full ${sseStatus === 'live' ? 'bg-emerald-400' : 'bg-amber-400 animate-ping'}`} />
        </span>
        <span className="text-gray-600 hidden md:inline">·</span>
        <span className="hidden md:inline">
          ADAPTER: <strong className="text-white uppercase">{adapterType}</strong>
        </span>
      </div>
    </footer>
  );
};
