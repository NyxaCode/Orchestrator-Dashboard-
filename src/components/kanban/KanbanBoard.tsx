import React, { useState, useMemo } from 'react';
import { useKanbanStore } from '../../stores/kanban';
import { useProjectsStore } from '../../stores/projects';
import { useAgentsStore } from '../../stores/agents';
import { KanbanColumn } from './KanbanColumn';
import { TaskModal } from './TaskModal';
import { ConfigFileModal } from './ConfigFileModal';
import { KanbanColumnId, KanbanTaskDTO, KanbanPriority } from '../../lib/schemas';
import {
  Kanban,
  Plus,
  FileCode,
  Search,
  Filter,
  X,
  Layers,
  Sparkles,
  Bot,
  Tag,
  CheckCircle2,
  Clock,
  PlayCircle,
  HelpCircle,
} from 'lucide-react';
import { cn } from '../../lib/cn';

const COLUMNS_CONFIG: Array<{
  id: KanbanColumnId;
  title: string;
  subtitle: string;
  color: string;
  borderColor: string;
  badgeBg: string;
}> = [
  {
    id: 'backlog',
    title: 'Backlog',
    subtitle: 'Rencana & ide prompt',
    color: 'bg-gray-400',
    borderColor: 'border-gray-700/50',
    badgeBg: 'bg-gray-800 text-gray-300',
  },
  {
    id: 'ready',
    title: 'Queue / Ready',
    subtitle: 'Siap diambil agen AI',
    color: 'bg-blue-400',
    borderColor: 'border-blue-700/50',
    badgeBg: 'bg-blue-950 text-blue-300',
  },
  {
    id: 'in_progress',
    title: 'In Progress',
    subtitle: 'Sedang dieksekusi agen',
    color: 'bg-amber-400',
    borderColor: 'border-amber-700/50',
    badgeBg: 'bg-amber-950 text-amber-300',
  },
  {
    id: 'review',
    title: 'Review & Verify',
    subtitle: 'Evaluasi hasil & verifikasi',
    color: 'bg-purple-400',
    borderColor: 'border-purple-700/50',
    badgeBg: 'bg-purple-950 text-purple-300',
  },
  {
    id: 'done',
    title: 'Completed / Done',
    subtitle: 'Selesai & terarsip',
    color: 'bg-emerald-400',
    borderColor: 'border-emerald-700/50',
    badgeBg: 'bg-emerald-950 text-emerald-300',
  },
];

export const KanbanBoard: React.FC = () => {
  const tasks = useKanbanStore((s) => s.tasks);
  const filters = useKanbanStore((s) => s.filters);
  const setSearchQuery = useKanbanStore((s) => s.setSearchQuery);
  const setAgentFilter = useKanbanStore((s) => s.setAgentFilter);
  const setTagFilter = useKanbanStore((s) => s.setTagFilter);
  const setPriorityFilter = useKanbanStore((s) => s.setPriorityFilter);
  const clearFilters = useKanbanStore((s) => s.clearFilters);

  const projects = useProjectsStore((s) => s.projects);
  const activeProjectId = useProjectsStore((s) => s.activeProjectId);
  const activeSubProjectId = useProjectsStore((s) => s.activeSubProjectId);
  const selectSubProject = useProjectsStore((s) => s.selectSubProject);

  const agents = useAgentsStore((s) => s.agents);
  const agentList = Object.values(agents);

  const currentProject = projects.find((p) => p.id === activeProjectId);

  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<KanbanTaskDTO | null>(null);
  const [defaultColForNewTask, setDefaultColForNewTask] = useState<KanbanColumnId>('backlog');
  const [isConfigFileModalOpen, setIsConfigFileModalOpen] = useState(false);

  // Extract all distinct tags for filtering
  const allDistinctTags = useMemo(() => {
    const set = new Set<string>();
    tasks.forEach((t) => t.tags.forEach((tag) => set.add(tag)));
    return Array.from(set).sort();
  }, [tasks]);

  // Filter tasks
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      // Filter by project
      if (task.project_id && task.project_id !== activeProjectId) {
        return false;
      }

      // Filter by sub-project if one is active
      if (activeSubProjectId && task.sub_project_id !== activeSubProjectId) {
        return false;
      }

      // Filter by search query
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase();
        const matchesTitle = task.title.toLowerCase().includes(query);
        const matchesDesc = task.description.toLowerCase().includes(query);
        const matchesPrompt = task.prompt_context?.toLowerCase().includes(query);
        const matchesTags = task.tags.some((tag) => tag.toLowerCase().includes(query));
        if (!matchesTitle && !matchesDesc && !matchesPrompt && !matchesTags) {
          return false;
        }
      }

      // Filter by agent
      if (filters.agentId && task.assigned_agent_id !== filters.agentId) {
        return false;
      }

      // Filter by tag
      if (filters.tag && !task.tags.includes(filters.tag)) {
        return false;
      }

      // Filter by priority
      if (filters.priority && task.priority !== filters.priority) {
        return false;
      }

      return true;
    });
  }, [tasks, activeProjectId, activeSubProjectId, filters]);

  const handleOpenAddTask = (columnId: KanbanColumnId = 'backlog') => {
    setTaskToEdit(null);
    setDefaultColForNewTask(columnId);
    setIsTaskModalOpen(true);
  };

  const handleEditTask = (task: KanbanTaskDTO) => {
    setTaskToEdit(task);
    setIsTaskModalOpen(true);
  };

  const hasActiveFilters = Boolean(
    filters.searchQuery || filters.agentId || filters.tag || filters.priority || activeSubProjectId
  );

  return (
    <div className="flex flex-col h-full w-full bg-[#0a0e14] overflow-hidden select-none">
      {/* Board Top Toolbar */}
      <div className="px-3 sm:px-4 py-2.5 sm:py-3 border-b border-white/10 bg-[#121820]/95 backdrop-blur-md shrink-0 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 sm:gap-3">
        {/* Left Zone: Title, Sub-Project Selector, Task Counts */}
        <div className="flex items-center justify-between sm:justify-start gap-2.5 min-w-0">
          <div className="flex items-center gap-2 min-w-0">
            <div className="p-1.5 rounded-lg bg-red-600 text-white shadow-[0_0_10px_rgba(220,38,38,0.5)] shrink-0">
              <Kanban className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="text-xs sm:text-sm font-bold font-mono text-white tracking-tight truncate">
                  TASK BOARD
                </h2>
                <span className="px-1.5 py-0.2 rounded text-[10px] font-mono text-gray-300 bg-white/10 border border-white/10 shrink-0">
                  {filteredTasks.length}/{tasks.length}
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-gray-400 font-sans truncate">
                {currentProject?.name || 'Project'} · Queue delegasi AI
              </p>
            </div>
          </div>

          {/* Sub-Project Filter Pill */}
          {currentProject?.sub_projects && currentProject.sub_projects.length > 0 && (
            <div className="hidden lg:flex items-center gap-1.5 pl-3 border-l border-white/10 text-xs font-mono">
              <span className="text-gray-500 text-[11px]">Sub-Project:</span>
              <select
                value={activeSubProjectId || ''}
                onChange={(e) => selectSubProject(e.target.value || null)}
                className="px-2 py-1 rounded-md bg-[#18212d] border border-white/15 text-xs text-white focus:outline-none focus:border-red-500 cursor-pointer"
              >
                <option value="">Semua Sub-Project</option>
                {currentProject.sub_projects.map((sp) => (
                  <option key={sp.id} value={sp.id}>
                    {sp.name} ({sp.tasks_count} tasks)
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Mobile + Task CTA shortcut */}
          <button
            type="button"
            onClick={() => handleOpenAddTask('backlog')}
            className="sm:hidden flex items-center gap-1 px-2.5 py-1 rounded-lg bg-red-600 text-white text-xs font-mono font-bold shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Task</span>
          </button>
        </div>

        {/* Right Zone: Filter Controls + Config File Button + New Task Button */}
        <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-0.5 sm:pb-0">
          {/* Search bar */}
          <div className="relative flex-1 sm:flex-initial min-w-[120px]">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              value={filters.searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari task..."
              className="w-full sm:w-36 md:w-48 pl-7 sm:pl-8 pr-2 py-1 text-xs rounded-lg bg-[#18212d] border border-white/15 text-white placeholder-gray-500 focus:outline-none focus:border-red-500 font-mono"
            />
          </div>

          {/* Agent Filter */}
          <select
            value={filters.agentId || ''}
            onChange={(e) => setAgentFilter(e.target.value || null)}
            className="px-2 py-1 text-xs rounded-lg bg-[#18212d] border border-white/15 text-gray-300 focus:outline-none focus:border-red-500 font-mono cursor-pointer shrink-0 max-w-[130px]"
          >
            <option value="">Semua Agent</option>
            {agentList.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>

          {/* Priority Filter */}
          <select
            value={filters.priority || ''}
            onChange={(e) => setPriorityFilter((e.target.value as KanbanPriority) || null)}
            className="hidden sm:block px-2 py-1 text-xs rounded-lg bg-[#18212d] border border-white/15 text-gray-300 focus:outline-none focus:border-red-500 font-mono cursor-pointer shrink-0"
          >
            <option value="">Semua Prioritas</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>

          {/* Tag Filter */}
          {allDistinctTags.length > 0 && (
            <select
              value={filters.tag || ''}
              onChange={(e) => setTagFilter(e.target.value || null)}
              className="hidden md:block px-2 py-1 text-xs rounded-lg bg-[#18212d] border border-white/15 text-gray-300 focus:outline-none focus:border-red-500 font-mono cursor-pointer shrink-0"
            >
              <option value="">Semua Tag</option>
              {allDistinctTags.map((tag) => (
                <option key={tag} value={tag}>
                  #{tag}
                </option>
              ))}
            </select>
          )}

          {/* Clear Filters Button */}
          {hasActiveFilters && (
            <button
              type="button"
              onClick={() => {
                clearFilters();
                selectSubProject(null);
              }}
              className="p-1 rounded-md text-red-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer shrink-0"
              title="Reset semua filter"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          {/* Config File Spec Button */}
          <button
            type="button"
            onClick={() => setIsConfigFileModalOpen(true)}
            className="flex items-center gap-1 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg bg-[#18212d] hover:bg-[#202b3a] text-gray-200 border border-white/15 hover:border-red-500/40 text-xs font-mono transition-all cursor-pointer shadow-xs shrink-0"
            title="Buka konfigurasi file JSON (tasks.config.json)"
          >
            <FileCode className="w-3.5 h-3.5 text-red-400" />
            <span className="hidden sm:inline">Config</span>
          </button>

          {/* Add New Task Button (Desktop/Tablet) */}
          <button
            type="button"
            onClick={() => handleOpenAddTask('backlog')}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-mono font-bold shadow-md shadow-red-900/40 transition-all cursor-pointer active:scale-95 shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Task</span>
          </button>
        </div>
      </div>

      {/* Main Board View: 5 Horizontal Columns with Mobile Touch Snap */}
      <div className="flex-1 overflow-x-auto p-3 sm:p-4 flex gap-3 sm:gap-4 min-w-0 h-full snap-x snap-mandatory scroll-smooth">
        {COLUMNS_CONFIG.map((colConfig) => {
          const colTasks = filteredTasks.filter((t) => t.column_id === colConfig.id);
          return (
            <KanbanColumn
              key={colConfig.id}
              config={colConfig}
              tasks={colTasks}
              onAddTask={handleOpenAddTask}
              onEditTask={handleEditTask}
            />
          );
        })}
      </div>

      {/* Task Creation & Editing Modal */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        taskToEdit={taskToEdit}
        defaultColumnId={defaultColForNewTask}
      />

      {/* Config File Inspector Modal */}
      <ConfigFileModal
        isOpen={isConfigFileModalOpen}
        onClose={() => setIsConfigFileModalOpen(false)}
      />
    </div>
  );
};
