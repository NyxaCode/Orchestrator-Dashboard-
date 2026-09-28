import React from 'react';
import { ProjectDTO } from '../../lib/schemas';
import { cn } from '../../lib/cn';
import { Folder } from 'lucide-react';

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
  return (
    <button
      type="button"
      onClick={() => onSelect(project.id)}
      className={cn(
        'w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-left transition-all duration-150 group cursor-pointer relative',
        isActive
          ? 'bg-[#1a232e] text-white shadow-xs'
          : 'text-gray-300 hover:text-white hover:bg-white/5'
      )}
    >
      {/* Left Accent Bar for Active Item */}
      {isActive && (
        <div className="absolute left-0 top-1.5 bottom-1.5 w-[3px] rounded-r bg-red-500 shadow-[0_0_8px_rgba(220,38,38,0.8)]" />
      )}

      <div className="flex items-center gap-2.5 min-w-0 pr-2">
        <Folder
          className={cn(
            'w-4 h-4 shrink-0 transition-colors',
            isActive ? 'text-red-400' : 'text-gray-500 group-hover:text-gray-300'
          )}
        />
        <div className="min-w-0">
          <p className="text-sm font-medium truncate">{project.name}</p>
          {project.description && (
            <p className="text-[11px] text-gray-500 truncate mt-0.5 font-sans">
              {project.description}
            </p>
          )}
        </div>
      </div>

      {/* Task Count Badge (Neutral, not accent, as mandated by design rules) */}
      {project.active_tasks_count > 0 && (
        <span className="shrink-0 px-1.5 py-0.5 rounded text-[10px] font-mono tabular-nums bg-white/10 text-gray-300 border border-white/10">
          {project.active_tasks_count}
        </span>
      )}
    </button>
  );
};
