import React from 'react';
import { AgentDTO } from '../../lib/schemas';
import { StatusBadge } from '../ui/StatusBadge';
import { cleanModelName } from '../../lib/format';
import { useChatStore } from '../../stores/chat';
import { useUiStore } from '../../stores/ui';
import { useAgentsStore } from '../../stores/agents';
import { useProjectsStore } from '../../stores/projects';
import { Activity, Clock, Cpu, Server, MessageSquare, Terminal, Trash2 } from 'lucide-react';
import { Button } from '../ui/Button';

interface OverviewViewProps {
  agent: AgentDTO;
}

export const OverviewView: React.FC<OverviewViewProps> = ({ agent }) => {
  const isOrchestrator = agent.role === 'orchestrator';
  const setTargetAgentId = useChatStore((s) => s.setTargetAgentId);
  const setChatCollapsed = useUiStore((s) => s.setChatCollapsed);
  const setInspectorTab = useUiStore((s) => s.setInspectorTab);
  const closeInspector = useUiStore((s) => s.closeInspector);
  const removeAgent = useAgentsStore((s) => s.removeAgent);
  const activeProjectId = useProjectsStore((s) => s.activeProjectId);

  const handleStartDirectChat = () => {
    setTargetAgentId(activeProjectId || 'proj-1', isOrchestrator ? null : agent.id);
    setChatCollapsed(false);
    closeInspector();
    setTimeout(() => {
      document.querySelector('textarea')?.focus();
    }, 100);
  };

  const handleRemoveAgent = () => {
    if (window.confirm(`Yakin ingin menghapus agen "${agent.name}" dari sistem?`)) {
      removeAgent(agent.id);
      closeInspector();
    }
  };

  // Generative sparkline points
  const sparklineData = [24, 38, 45, 30, 52, 40, 68, 48, 62, 54, 70, 44];
  const maxVal = Math.max(...sparklineData);
  const minVal = Math.min(...sparklineData);
  const width = 280;
  const height = 48;
  const points = sparklineData
    .map((val, idx) => {
      const x = (idx / (sparklineData.length - 1)) * width;
      const y = height - ((val - minVal) / (maxVal - minVal)) * (height - 8) - 4;
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <div className="space-y-4 text-gray-200">
      {/* Top Card */}
      <div className="p-4 rounded-xl bg-[#0b0f14] border border-white/10 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-11 h-11 rounded-full border flex items-center justify-center font-mono font-bold text-sm uppercase text-white shadow-md"
              style={{
                backgroundColor: `${agent.color || '#ef4444'}20`,
                borderColor: `${agent.color || '#ef4444'}60`,
                color: agent.color || '#ef4444',
              }}
            >
              {agent.name.slice(0, 2)}
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white">{agent.name}</h4>
              <p className="text-[11px] font-mono text-gray-400 capitalize">
                {agent.role === 'orchestrator' ? 'Orchestrator Lead' : `Sub-Agent (Layer ${agent.layer || 1})`}
              </p>
            </div>
          </div>
          <StatusBadge status={agent.status} />
        </div>

        <p className="text-xs text-gray-300 leading-relaxed font-sans">
          {agent.description || 'Tidak ada deskripsi agent.'}
        </p>

        {/* Quick Action CTAs */}
        <div className="flex items-center gap-2 pt-2 border-t border-white/10">
          <Button
            type="button"
            size="sm"
            variant="primary"
            onClick={handleStartDirectChat}
            className="flex-1 font-mono text-xs gap-1.5"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Chat Langsung</span>
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => setInspectorTab('logs')}
            className="font-mono text-xs gap-1.5 text-gray-300 hover:text-white"
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Log Terminal</span>
          </Button>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 gap-2.5">
        <div className="p-3 rounded-lg bg-[#0b0f14] border border-white/10">
          <div className="flex items-center gap-1.5 text-gray-400 text-[11px] font-mono mb-1">
            <Clock className="w-3.5 h-3.5 text-emerald-400" />
            <span>UPTIME</span>
          </div>
          <span className="text-sm font-mono font-bold text-white tabular-nums">
            {agent.uptime || '99.9%'}
          </span>
        </div>

        <div className="p-3 rounded-lg bg-[#0b0f14] border border-white/10">
          <div className="flex items-center gap-1.5 text-gray-400 text-[11px] font-mono mb-1">
            <Activity className="w-3.5 h-3.5 text-amber-400" />
            <span>TASK AKTIF</span>
          </div>
          <span className="text-sm font-mono font-bold text-white tabular-nums">
            {agent.active_tasks_count || 0} Task
          </span>
        </div>

        <div className="p-3 rounded-lg bg-[#0b0f14] border border-white/10 col-span-2">
          <div className="flex items-center gap-1.5 text-gray-400 text-[11px] font-mono mb-1">
            <Server className="w-3.5 h-3.5 text-red-400" />
            <span>MODEL AI</span>
          </div>
          <span className="text-xs font-mono text-gray-200 block truncate">
            {cleanModelName(agent.model_label)}
          </span>
        </div>
      </div>

      {/* Load Sparkline */}
      <div className="p-3.5 rounded-lg bg-[#0b0f14] border border-white/10">
        <div className="flex items-center justify-between text-xs font-mono text-gray-400 mb-2">
          <span className="flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-red-400" />
            BEBAN PIPELINE (12 JAM)
          </span>
          <span className="text-white font-bold tabular-nums">44% Nominal</span>
        </div>
        <div className="w-full flex items-center justify-center pt-2">
          <svg width={width} height={height} className="overflow-visible">
            <polyline
              fill="none"
              stroke="#dc2626"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              points={points}
            />
            {/* Sparkline glow */}
            <polyline
              fill="none"
              stroke="#dc2626"
              strokeWidth="5"
              strokeOpacity="0.2"
              points={points}
            />
          </svg>
        </div>
      </div>

      {/* Remove Agent Option (if sub-agent) */}
      {!isOrchestrator && (
        <div className="pt-2">
          <button
            type="button"
            onClick={handleRemoveAgent}
            className="w-full py-2 px-3 rounded-lg bg-red-950/20 hover:bg-red-950/40 border border-red-500/20 hover:border-red-500/40 text-red-400 text-xs font-mono flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Hapus Agen dari Sistem</span>
          </button>
        </div>
      )}
    </div>
  );
};
