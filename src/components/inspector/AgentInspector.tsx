import React from 'react';
import { useUiStore, InspectorTab } from '../../stores/ui';
import { useAgentsStore } from '../../stores/agents';
import { Sheet } from '../ui/Sheet';
import { cleanModelName } from '../../lib/format';
import { OverviewView } from './OverviewView';
import { LogView } from './LogView';
import { TasksView } from './TasksView';
import { ConfigView } from './ConfigView';
import { Activity, Terminal, CheckSquare, Settings } from 'lucide-react';

export const AgentInspector: React.FC = () => {
  const inspectorOpen = useUiStore((s) => s.inspectorOpen);
  const inspectorTab = useUiStore((s) => s.inspectorTab);
  const inspectorAgentId = useUiStore((s) => s.inspectorAgentId);
  const closeInspector = useUiStore((s) => s.closeInspector);
  const setInspectorTab = useUiStore((s) => s.setInspectorTab);

  const agents = useAgentsStore((s) => s.agents);
  const agent = inspectorAgentId ? agents[inspectorAgentId] : null;

  if (!agent) return null;

  const tabs: { id: InspectorTab; label: string; icon: React.ReactNode }[] = [
    { id: 'overview', label: 'Overview', icon: <Activity className="w-3.5 h-3.5" /> },
    { id: 'logs', label: 'Log', icon: <Terminal className="w-3.5 h-3.5" /> },
    { id: 'tasks', label: 'Tasks', icon: <CheckSquare className="w-3.5 h-3.5" /> },
    { id: 'config', label: 'Config', icon: <Settings className="w-3.5 h-3.5" /> },
  ];

  return (
    <Sheet
      isOpen={inspectorOpen}
      onClose={closeInspector}
      title={`Agent: ${agent.name}`}
      subtitle={`Model: ${cleanModelName(agent.model_label)}`}
      width="w-[440px]"
    >
      <div className="flex flex-col h-full space-y-4">
        {/* Tab Navigation */}
        <div className="flex items-center gap-1 p-1 bg-[#0b0f14] rounded-lg border border-white/10 shrink-0">
          {tabs.map((tab) => {
            const isActive = inspectorTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setInspectorTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-xs font-mono font-medium transition-colors cursor-pointer select-none ${
                  isActive
                    ? 'bg-[#1a232e] text-white shadow-xs border border-white/10'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div className="flex-1">
          {inspectorTab === 'overview' && <OverviewView agent={agent} />}
          {inspectorTab === 'logs' && <LogView agentId={agent.id} />}
          {inspectorTab === 'tasks' && <TasksView agentId={agent.id} />}
          {inspectorTab === 'config' && <ConfigView agent={agent} />}
        </div>
      </div>
    </Sheet>
  );
};
