import React from 'react';
import { KanbanTaskDTO, KanbanColumnId } from '../../lib/schemas';
import { useKanbanStore } from '../../stores/kanban';
import { useAgentsStore } from '../../stores/agents';
import { useProjectsStore } from '../../stores/projects';
import { useChatStore } from '../../stores/chat';
import { useUiStore } from '../../stores/ui';
import { AgentAvatar } from '../ui/AgentAvatar';
import {
  Clock,
  ArrowRight,
  ArrowLeft,
  Edit2,
  Trash2,
  Send,
  Bot,
  Tag,
  Wrench,
  Zap,
  FileCode,
  FileCheck,
} from 'lucide-react';
import { cn } from '../../lib/cn';

interface KanbanCardProps {
  task: KanbanTaskDTO;
  onEdit: (task: KanbanTaskDTO) => void;
}

const COLUMN_FLOW: KanbanColumnId[] = ['backlog', 'ready', 'in_progress', 'review', 'done'];

export const KanbanCard: React.FC<KanbanCardProps> = ({ task, onEdit }) => {
  const moveTask = useKanbanStore((s) => s.moveTask);
  const deleteTask = useKanbanStore((s) => s.deleteTask);
  const simulateAgentExecution = useKanbanStore((s) => s.simulateAgentExecution);
  const isSimulating = useKanbanStore((s) => s.isSimulating);

  const agents = useAgentsStore((s) => s.agents);
  const projects = useProjectsStore((s) => s.projects);
  const activeProjectId = useProjectsStore((s) => s.activeProjectId);

  const setDraftInput = useChatStore((s) => s.setDraftInput);
  const setTargetAgentId = useChatStore((s) => s.setTargetAgentId);
  const setChatCollapsed = useUiStore((s) => s.setChatCollapsed);

  const assignedAgent = task.assigned_agent_id ? agents[task.assigned_agent_id] : null;

  // Find subproject name
  const currentProject = projects.find((p) => p.id === (task.project_id || activeProjectId));
  const subProject = currentProject?.sub_projects?.find((sp) => sp.id === task.sub_project_id);

  const currentColIdx = COLUMN_FLOW.indexOf(task.column_id);
  const prevCol = currentColIdx > 0 ? COLUMN_FLOW[currentColIdx - 1] : null;
  const nextCol = currentColIdx < COLUMN_FLOW.length - 1 ? COLUMN_FLOW[currentColIdx + 1] : null;

  const handleMovePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (prevCol) moveTask(task.id, prevCol);
  };

  const handleMoveNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (nextCol) moveTask(task.id, nextCol);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(`Hapus task "${task.title}"?`)) {
      deleteTask(task.id);
    }
  };

  const handleDelegateToChat = (e: React.MouseEvent) => {
    e.stopPropagation();
    setChatCollapsed(false);
    if (task.assigned_agent_id) {
      setTargetAgentId(activeProjectId, task.assigned_agent_id);
    }

    const agentTag = assignedAgent ? `@${assignedAgent.name} ` : '';
    const delegatePrompt = `${agentTag}Tolong eksekusi task [${task.id}] "${task.title}":\n\n${task.prompt_context || task.description}`;
    setDraftInput(delegatePrompt);

    // If currently in backlog or ready, automatically advance to in_progress
    if (task.column_id === 'backlog' || task.column_id === 'ready') {
      moveTask(task.id, 'in_progress');
    }
  };

  const handleSimulateRun = (e: React.MouseEvent) => {
    e.stopPropagation();
    simulateAgentExecution(task.id);
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'text-red-400 bg-red-950/60 border-red-500/40';
      case 'high':
        return 'text-amber-400 bg-amber-950/60 border-amber-500/40';
      case 'medium':
        return 'text-blue-400 bg-blue-950/60 border-blue-500/40';
      default:
        return 'text-gray-400 bg-gray-900 border-gray-700/50';
    }
  };

  return (
    <div
      onClick={() => onEdit(task)}
      className="group relative flex flex-col gap-2.5 p-3.5 rounded-lg bg-[#141b24] hover:bg-[#18212d] border border-white/10 hover:border-red-500/40 shadow-md transition-all duration-150 cursor-pointer text-left"
    >
      {/* Top Header: ID + Priority + SubProject Badge */}
      <div className="flex items-center justify-between gap-1 text-[11px] font-mono">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="font-bold text-gray-300 tracking-wider shrink-0">{task.id}</span>
          {subProject && (
            <span className="truncate max-w-[120px] text-[10px] text-gray-400 bg-white/5 px-1.5 py-0.5 rounded border border-white/5">
              {subProject.name}
            </span>
          )}
        </div>
        <span
          className={cn(
            'shrink-0 px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider border',
            getPriorityBadge(task.priority)
          )}
        >
          {task.priority}
        </span>
      </div>

      {/* Title */}
      <h4 className="text-xs font-semibold text-white leading-snug line-clamp-2">
        {task.title}
      </h4>

      {/* Description Snippet */}
      {task.description && (
        <p className="text-[11px] text-gray-400 line-clamp-2 leading-relaxed">
          {task.description}
        </p>
      )}

      {/* Prompt Instruction Preview Box (Highlighting the AI prompting nature) */}
      {task.prompt_context && (
        <div className="p-2 rounded bg-[#0b0f14] border border-white/5 text-[10px] font-mono text-gray-300 space-y-1">
          <div className="flex items-center gap-1 text-[9px] text-red-400 uppercase tracking-widest font-bold">
            <FileCode className="w-2.5 h-2.5" />
            <span>Prompt Directive</span>
          </div>
          <p className="line-clamp-2 text-gray-400 font-sans italic">
            "{task.prompt_context}"
          </p>
        </div>
      )}

      {/* Skills & Tools chips */}
      {(task.skills.length > 0 || task.tools.length > 0) && (
        <div className="flex flex-wrap gap-1 text-[10px] font-mono">
          {task.skills.map((skill) => (
            <span
              key={skill}
              className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-purple-950/50 text-purple-300 border border-purple-800/40"
              title={`Required Skill: ${skill}`}
            >
              <Zap className="w-2.5 h-2.5 text-purple-400" />
              <span>{skill}</span>
            </span>
          ))}
          {task.tools.map((tool) => (
            <span
              key={tool}
              className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-cyan-950/50 text-cyan-300 border border-cyan-800/40"
              title={`Required Tool: ${tool}`}
            >
              <Wrench className="w-2.5 h-2.5 text-cyan-400" />
              <span>{tool}</span>
            </span>
          ))}
        </div>
      )}

      {/* Tags */}
      {task.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 text-[10px] font-mono text-gray-400">
          {task.tags.map((t) => (
            <span
              key={t}
              className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-white/5 text-gray-300 border border-white/5"
            >
              <Tag className="w-2.5 h-2.5 text-gray-500" />
              <span>#{t}</span>
            </span>
          ))}
        </div>
      )}

      {/* Artifact Deliverable */}
      {task.output_artifact && (
        <div className="flex items-center gap-1 text-[10px] font-mono text-emerald-400 bg-emerald-950/30 px-2 py-1 rounded border border-emerald-800/30">
          <FileCheck className="w-3 h-3 shrink-0" />
          <span className="truncate">{task.output_artifact}</span>
        </div>
      )}

      {/* Bottom Footer: Assignee & Action Buttons */}
      <div className="flex items-center justify-between pt-2 mt-1 border-t border-white/5">
        {/* Assigned Agent */}
        <div className="flex items-center gap-1.5 min-w-0">
          {assignedAgent ? (
            <div className="flex items-center gap-1.5 min-w-0">
              <div className="w-5 h-5 rounded-full overflow-hidden shrink-0 border border-white/20">
                <AgentAvatar agent={assignedAgent} size="sm" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-medium text-gray-200 truncate">
                  {assignedAgent.name}
                </p>
              </div>
            </div>
          ) : (
            <span className="text-[10px] font-mono text-gray-500 italic">
              Belum ada agent
            </span>
          )}
        </div>

        {/* Card Quick Actions */}
        <div className="flex items-center gap-0.5 shrink-0 opacity-80 group-hover:opacity-100 transition-opacity">
          {/* Shift Left */}
          {prevCol && (
            <button
              type="button"
              onClick={handleMovePrev}
              title={`Pindah ke ${prevCol}`}
              className="p-1 rounded text-gray-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3 h-3" />
            </button>
          )}

          {/* Delegate into Chat prompt */}
          <button
            type="button"
            onClick={handleDelegateToChat}
            title="Delegasikan prompt ke chat agent"
            className="p-1 rounded text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors cursor-pointer"
          >
            <Send className="w-3 h-3" />
          </button>

          {/* Simulate AI Agent execution */}
          <button
            type="button"
            disabled={isSimulating}
            onClick={handleSimulateRun}
            title="Simulasikan eksekusi agen"
            className="p-1 rounded text-amber-400 hover:text-amber-300 hover:bg-amber-500/10 transition-colors cursor-pointer disabled:opacity-40"
          >
            <Bot className="w-3 h-3" />
          </button>

          {/* Shift Right */}
          {nextCol && (
            <button
              type="button"
              onClick={handleMoveNext}
              title={`Pindah ke ${nextCol}`}
              className="p-1 rounded text-gray-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <ArrowRight className="w-3 h-3" />
            </button>
          )}

          {/* Edit */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(task);
            }}
            title="Edit task"
            className="p-1 rounded text-gray-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <Edit2 className="w-3 h-3" />
          </button>

          {/* Delete */}
          <button
            type="button"
            onClick={handleDelete}
            title="Hapus task"
            className="p-1 rounded text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
};
