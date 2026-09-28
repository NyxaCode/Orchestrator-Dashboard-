import React from 'react';
import { ArrowRight, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { useAgentsStore } from '../../stores/agents';
import { useUiStore } from '../../stores/ui';
import { TaskStatus } from '../../lib/schemas';

interface TaskChipProps {
  taskId: string;
  targetAgentId?: string;
  taskTitle: string;
  status?: TaskStatus;
}

export const TaskChip: React.FC<TaskChipProps> = ({
  taskId,
  targetAgentId,
  taskTitle,
  status = 'running',
}) => {
  const selectAgent = useAgentsStore((s) => s.selectAgent);
  const openInspector = useUiStore((s) => s.openInspector);
  const agents = useAgentsStore((s) => s.agents);

  const agentName = targetAgentId && agents[targetAgentId] ? agents[targetAgentId].name : 'Sub-Agent';

  const handleClick = () => {
    if (targetAgentId) {
      selectAgent(targetAgentId);
      openInspector(targetAgentId, 'tasks');
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'done':
        return <CheckCircle2 className="w-3 h-3 text-emerald-400" />;
      case 'failed':
        return <AlertCircle className="w-3 h-3 text-red-400" />;
      case 'running':
      default:
        return <Clock className="w-3 h-3 text-amber-400 animate-spin" />;
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      title="Klik untuk memfokuskan agent di canvas"
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#161e28] hover:bg-[#1f2937] border border-white/15 text-xs font-mono transition-transform hover:-translate-y-0.5 active:scale-95 cursor-pointer text-gray-200 shadow-xs my-1"
    >
      <ArrowRight className="w-3 h-3 text-red-400" />
      <span className="font-semibold text-white">{agentName}</span>
      <span className="text-gray-400">·</span>
      <span className="text-gray-300 truncate max-w-[140px]">{taskTitle}</span>
      <span className="ml-1">{getStatusIcon()}</span>
    </button>
  );
};
