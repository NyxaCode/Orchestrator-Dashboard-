import React, { useState } from 'react';
import { ProjectDTO } from '../../lib/schemas';
import { useProjectsStore } from '../../stores/projects';
import { useUiStore } from '../../stores/ui';
import { useAgentsStore } from '../../stores/agents';
import { AgentAvatar } from '../ui/AgentAvatar';
import {
  Folder,
  FolderOpen,
  ChevronDown,
  ChevronRight,
  Plus,
  Layers,
  Kanban,
  Check,
  X,
  Trash2,
} from 'lucide-react';
import { cn } from '../../lib/cn';

interface ProjectItemProps {
  project: ProjectDTO;
  isActive: boolean;
  onSelect: (id: string) => void;
}

export const ProjectItem: React.FC<ProjectItemProps> = ({
  project,
  isActive,
  onSelect,
}) => {
  const expandedProjectIds = useProjectsStore((s) => s.expandedProjectIds);
  const toggleExpandProject = useProjectsStore((s) => s.toggleExpandProject);
  const activeSubProjectId = useProjectsStore((s) => s.activeSubProjectId);
  const selectSubProject = useProjectsStore((s) => s.selectSubProject);
  const addSubProject = useProjectsStore((s) => s.addSubProject);
  const removeSubProject = useProjectsStore((s) => s.removeSubProject);

  const setViewMode = useUiStore((s) => s.setViewMode);
  const setMobileActiveTab = useUiStore((s) => s.setMobileActiveTab);
  const agents = useAgentsStore((s) => s.agents);

  const [isAddingSub, setIsAddingSub] = useState(false);
  const [subName, setSubName] = useState('');
  const [subDesc, setSubDesc] = useState('');

  const isExpanded = expandedProjectIds.includes(project.id);
  const subProjects = project.sub_projects || [];

  const handleHeaderClick = () => {
    onSelect(project.id);
    toggleExpandProject(project.id);
  };

  const handleSubProjectClick = (e: React.MouseEvent, subId: string) => {
    e.stopPropagation();
    onSelect(project.id);
    selectSubProject(subId);
    // Switch to Kanban view automatically so user immediately sees the filtered tasks!
    setViewMode('kanban');
    setMobileActiveTab('kanban');
  };

  const handleOpenKanban = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect(project.id);
    selectSubProject(null);
    setViewMode('kanban');
    setMobileActiveTab('kanban');
  };

  const handleCreateSubProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subName.trim()) return;

    addSubProject(project.id, subName.trim(), subDesc.trim());
    setSubName('');
    setSubDesc('');
    setIsAddingSub(false);
  };

  return (
    <div className="flex flex-col rounded-lg overflow-hidden transition-all duration-150">
      {/* Main Project Header Row */}
      <div
        onClick={handleHeaderClick}
        className={cn(
          'w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-left transition-all duration-150 group cursor-pointer relative',
          isActive
            ? 'bg-[#1a232e] text-white shadow-xs'
            : 'text-gray-300 hover:text-white hover:bg-white/5'
        )}
      >
        {/* Left Accent Bar for Active Project */}
        {isActive && (
          <div className="absolute left-0 top-1.5 bottom-1.5 w-[3px] rounded-r bg-red-500 shadow-[0_0_8px_rgba(220,38,38,0.8)]" />
        )}

        <div className="flex items-center gap-2 min-w-0 pr-1">
          {/* Accordion Chevron Icon */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              toggleExpandProject(project.id);
            }}
            className="p-0.5 text-gray-500 hover:text-gray-200 transition-transform cursor-pointer"
            title={isExpanded ? 'Tutup sub-project' : 'Buka sub-project'}
          >
            {isExpanded ? (
              <ChevronDown className="w-3.5 h-3.5 text-red-400" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5" />
            )}
          </button>

          {isExpanded ? (
            <FolderOpen
              className={cn(
                'w-4 h-4 shrink-0 transition-colors',
                isActive ? 'text-red-400' : 'text-gray-400'
              )}
            />
          ) : (
            <Folder
              className={cn(
                'w-4 h-4 shrink-0 transition-colors',
                isActive ? 'text-red-400' : 'text-gray-500 group-hover:text-gray-300'
              )}
            />
          )}

          <div className="min-w-0">
            <p className="text-xs font-semibold truncate leading-tight">{project.name}</p>
            {project.description && (
              <p className="text-[10px] text-gray-500 truncate mt-0.5 font-sans">
                {project.description}
              </p>
            )}
          </div>
        </div>

        {/* Right Actions: Kanban Shortcut & Task Count */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={handleOpenKanban}
            title="Buka Task Kanban untuk Project ini"
            className="p-1 rounded text-gray-500 hover:text-red-400 hover:bg-white/10 transition-colors opacity-70 group-hover:opacity-100 cursor-pointer"
          >
            <Kanban className="w-3.5 h-3.5" />
          </button>

          {project.active_tasks_count > 0 && (
            <span className="shrink-0 px-1.5 py-0.5 rounded text-[10px] font-mono tabular-nums bg-white/10 text-gray-300 border border-white/10">
              {project.active_tasks_count}
            </span>
          )}
        </div>
      </div>

      {/* Accordion Dropdown of Sub-Projects */}
      {isExpanded && (
        <div className="pl-6 pr-1 py-1 space-y-1 border-l-2 border-white/5 ml-4 mt-0.5 animate-in slide-in-from-top-1 duration-150">
          {subProjects.length === 0 ? (
            <div className="px-2 py-1.5 text-[11px] text-gray-500 font-mono italic">
              Belum ada sub-project
            </div>
          ) : (
            subProjects.map((sub) => {
              const isSubActive = isActive && activeSubProjectId === sub.id;
              const leadAgent = sub.lead_agent_id ? agents[sub.lead_agent_id] : null;

              return (
                <div
                  key={sub.id}
                  onClick={(e) => handleSubProjectClick(e, sub.id)}
                  className={cn(
                    'group/sub flex items-center justify-between px-2.5 py-1.5 rounded-md text-left transition-all cursor-pointer text-xs',
                    isSubActive
                      ? 'bg-red-950/40 text-red-200 border border-red-500/30'
                      : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
                  )}
                >
                  <div className="flex items-center gap-2 min-w-0 pr-1">
                    <Layers className="w-3 h-3 shrink-0 text-gray-500 group-hover/sub:text-red-400" />
                    <div className="min-w-0">
                      <p className="font-mono text-[11px] font-medium truncate leading-tight">
                        {sub.name}
                      </p>
                      {sub.description && (
                        <p className="text-[10px] text-gray-500 truncate font-sans">
                          {sub.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {leadAgent && (
                      <div className="w-4 h-4 rounded-full overflow-hidden shrink-0 border border-white/15" title={`Lead: ${leadAgent.name}`}>
                        <AgentAvatar agent={leadAgent} size="sm" />
                      </div>
                    )}
                    {sub.tasks_count > 0 && (
                      <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-white/5 text-gray-400">
                        {sub.tasks_count}
                      </span>
                    )}

                    {/* Delete Sub-Project Button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm(`Hapus sub-project "${sub.name}"?`)) {
                          removeSubProject(project.id, sub.id);
                        }
                      }}
                      title={`Hapus ${sub.name}`}
                      className="p-1 rounded text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-colors opacity-0 group-hover/sub:opacity-100 cursor-pointer"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })
          )}

          {/* "+ Sub-project" quick inline creator */}
          {isAddingSub ? (
            <form onSubmit={handleCreateSubProject} className="p-2 rounded bg-[#161e28] border border-white/10 space-y-1.5">
              <input
                type="text"
                required
                autoFocus
                placeholder="Nama sub-project..."
                value={subName}
                onChange={(e) => setSubName(e.target.value)}
                className="w-full px-2 py-1 text-[11px] rounded bg-[#0e141c] border border-white/15 text-white placeholder-gray-500 focus:outline-none focus:border-red-500 font-mono"
              />
              <input
                type="text"
                placeholder="Deskripsi singkat (opsional)..."
                value={subDesc}
                onChange={(e) => setSubDesc(e.target.value)}
                className="w-full px-2 py-1 text-[10px] rounded bg-[#0e141c] border border-white/15 text-white placeholder-gray-500 focus:outline-none focus:border-red-500 font-sans"
              />
              <div className="flex items-center justify-end gap-1 pt-1">
                <button
                  type="button"
                  onClick={() => setIsAddingSub(false)}
                  className="px-2 py-0.5 rounded text-[10px] font-mono text-gray-400 hover:text-white"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-2.5 py-0.5 rounded bg-red-600 hover:bg-red-500 text-white text-[10px] font-mono font-bold"
                >
                  Tambah
                </button>
              </div>
            </form>
          ) : (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsAddingSub(true);
              }}
              className="flex items-center gap-1 px-2 py-1 text-[10px] font-mono text-gray-500 hover:text-red-400 hover:bg-white/5 rounded transition-colors cursor-pointer w-full text-left"
            >
              <Plus className="w-3 h-3" />
              <span>+ Sub-project</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};
