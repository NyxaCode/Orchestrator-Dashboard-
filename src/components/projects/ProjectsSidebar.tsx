import React, { useState } from 'react';
import { useProjectsStore } from '../../stores/projects';
import { useUiStore } from '../../stores/ui';
import { ProjectItem } from './ProjectItem';
import { NewProjectDialog } from './NewProjectDialog';
import { ChevronLeft, Plus, Search, FolderPlus, Inbox } from 'lucide-react';
import { IconButton } from '../ui/IconButton';

export const ProjectsSidebar: React.FC = () => {
  const projects = useProjectsStore((s) => s.projects);
  const activeProjectId = useProjectsStore((s) => s.activeProjectId);
  const selectProject = useProjectsStore((s) => s.selectProject);
  const searchQuery = useProjectsStore((s) => s.searchQuery);
  const setSearchQuery = useProjectsStore((s) => s.setSearchQuery);
  const toggleSidebar = useUiStore((s) => s.toggleSidebar);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [showSearch, setShowSearch] = useState(false);

  const filteredProjects = projects.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="flex flex-col h-full bg-[#121820] border-r border-white/10 select-none">
      {/* Sidebar Header */}
      <div className="flex items-center justify-between px-3.5 h-12 border-b border-white/10 shrink-0">
        <div className="flex items-center gap-2">
          <IconButton
            aria-label="Tutup sidebar projects"
            size="sm"
            variant="ghost"
            onClick={toggleSidebar}
            className="text-gray-400 hover:text-white"
          >
            <ChevronLeft className="w-4 h-4" />
          </IconButton>
          <span className="text-xs font-mono font-semibold tracking-wider text-gray-200 uppercase">
            PROJECTS
          </span>
        </div>

        <div className="flex items-center gap-1">
          <IconButton
            aria-label="Cari project"
            size="sm"
            variant="ghost"
            onClick={() => setShowSearch(!showSearch)}
            className={showSearch ? 'text-red-400 bg-white/5' : 'text-gray-400 hover:text-white'}
          >
            <Search className="w-3.5 h-3.5" />
          </IconButton>
          <IconButton
            aria-label="Buat project baru"
            size="sm"
            variant="secondary"
            onClick={() => setIsDialogOpen(true)}
            className="text-white hover:border-red-500/50"
          >
            <Plus className="w-3.5 h-3.5" />
          </IconButton>
        </div>
      </div>

      {/* Search Input Bar (collapsible) */}
      {showSearch && (
        <div className="p-2 border-b border-white/10 bg-[#0e141c]">
          <input
            type="text"
            placeholder="Cari project..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            autoFocus
            className="w-full px-2.5 py-1 text-xs rounded bg-[#161e28] border border-white/15 text-white placeholder-gray-500 focus:outline-none focus:border-red-500 font-mono"
          />
        </div>
      )}

      {/* Projects List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {filteredProjects.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <Inbox className="w-8 h-8 text-gray-600 mb-2" />
            <p className="text-xs text-gray-400 font-medium">Belum ada project</p>
            <p className="text-[11px] text-gray-600 mt-1">
              {searchQuery ? 'Tidak ada hasil untuk pencarian ini' : 'Klik "+" untuk membuat project pertama.'}
            </p>
          </div>
        ) : (
          filteredProjects.map((p) => (
            <ProjectItem
              key={p.id}
              project={p}
              isActive={p.id === activeProjectId}
              onSelect={selectProject}
            />
          ))
        )}
      </div>

      {/* New Project Dialog */}
      <NewProjectDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
      />
    </div>
  );
};
