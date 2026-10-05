import React from 'react';
import { KanbanColumnId, KanbanTaskDTO } from '../../lib/schemas';
import { KanbanCard } from './KanbanCard';
import { Plus } from 'lucide-react';
import { cn } from '../../lib/cn';

interface ColumnConfig {
  id: KanbanColumnId;
  title: string;
  subtitle: string;
  color: string;
  borderColor: string;
  badgeBg: string;
}

interface KanbanColumnProps {
  config: ColumnConfig;
  tasks: KanbanTaskDTO[];
  onAddTask: (columnId: KanbanColumnId) => void;
  onEditTask: (task: KanbanTaskDTO) => void;
}

export const KanbanColumn: React.FC<KanbanColumnProps> = ({
  config,
  tasks,
  onAddTask,
  onEditTask,
}) => {
  return (
    <div className="flex flex-col w-[86vw] max-w-[340px] sm:w-[320px] md:w-[340px] shrink-0 h-full rounded-xl bg-[#0e141c] border border-white/10 shadow-lg select-none overflow-hidden snap-center">
      {/* Column Header */}
      <div className={cn('flex items-center justify-between px-3.5 py-3 border-b', config.borderColor)}>
        <div className="flex items-center gap-2 min-w-0">
          <div className={cn('w-2.5 h-2.5 rounded-full', config.color)} />
          <div className="min-w-0">
            <h3 className="text-xs font-mono font-bold tracking-wider text-white uppercase truncate">
              {config.title}
            </h3>
            <p className="text-[10px] text-gray-500 font-sans truncate">
              {config.subtitle}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <span
            className={cn(
              'px-2 py-0.5 rounded-md text-[11px] font-mono font-bold tabular-nums',
              config.badgeBg
            )}
          >
            {tasks.length}
          </span>
          <button
            type="button"
            onClick={() => onAddTask(config.id)}
            title={`Tambah task di ${config.title}`}
            aria-label={`Tambah task di ${config.title}`}
            className="p-1 rounded-md text-gray-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Cards Scrollable Container */}
      <div className="flex-1 overflow-y-auto p-2.5 space-y-2.5">
        {tasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 px-4 text-center border border-dashed border-white/5 rounded-lg">
            <p className="text-xs text-gray-500 font-mono">Kosong</p>
            <button
              type="button"
              onClick={() => onAddTask(config.id)}
              className="mt-2 text-[11px] font-mono text-red-400 hover:text-red-300 underline underline-offset-2 cursor-pointer"
            >
              + Buat task baru
            </button>
          </div>
        ) : (
          tasks.map((task) => (
            <KanbanCard key={task.id} task={task} onEdit={onEditTask} />
          ))
        )}
      </div>

      {/* Bottom Quick-Add Bar */}
      <div className="p-2 border-t border-white/5 bg-[#0b1016]">
        <button
          type="button"
          onClick={() => onAddTask(config.id)}
          className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-mono text-gray-400 hover:text-white hover:bg-white/5 border border-dashed border-white/10 hover:border-white/20 transition-all cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Tambah Task</span>
        </button>
      </div>
    </div>
  );
};
