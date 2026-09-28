import React from 'react';
import { useChatStore } from '../../stores/chat';
import { formatTime, formatDuration } from '../../lib/format';
import { CheckCircle2, Clock, AlertCircle, ArrowRight } from 'lucide-react';

interface TasksViewProps {
  agentId: string;
}

export const TasksView: React.FC<TasksViewProps> = ({ agentId }) => {
  const tasks = useChatStore((s) => s.tasks);
  const relevantTasks = tasks.filter(
    (t) => t.to_agent_id === agentId || t.from_agent_id === agentId
  );

  return (
    <div className="space-y-3 font-sans">
      <div className="text-xs font-mono text-gray-400 pb-2 border-b border-white/10 flex items-center justify-between">
        <span>RIWAYAT DELEGASI TASK</span>
        <span className="text-white font-bold">{relevantTasks.length} Total</span>
      </div>

      {relevantTasks.length === 0 ? (
        <div className="py-12 text-center text-gray-500 text-xs">
          Belum ada riwayat task untuk agent ini. Jalankan delegasi dari Chat Shinaa.
        </div>
      ) : (
        <div className="space-y-2.5">
          {relevantTasks.map((t) => {
            const isDone = t.status === 'done';
            const isRunning = t.status === 'running';
            const isFailed = t.status === 'failed';
            const duration =
              t.finished_at && t.started_at
                ? formatDuration(t.finished_at - t.started_at)
                : null;

            return (
              <div
                key={t.id}
                className="p-3 rounded-lg bg-[#0b0f14] border border-white/10 space-y-2"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 min-w-0">
                    {isDone && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
                    {isRunning && <Clock className="w-4 h-4 text-amber-400 animate-spin shrink-0" />}
                    {isFailed && <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />}
                    <h5 className="text-xs font-semibold text-white truncate">{t.title}</h5>
                  </div>
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded capitalize ${
                      isDone
                        ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-800/40'
                        : isRunning
                        ? 'bg-amber-950/60 text-amber-300 border border-amber-800/40 animate-pulse'
                        : 'bg-red-950/60 text-red-300 border border-red-800/40'
                    }`}
                  >
                    {t.status}
                  </span>
                </div>

                {t.result_summary && (
                  <p className="text-[11px] text-gray-400 leading-relaxed font-sans bg-white/[0.02] p-2 rounded border border-white/5">
                    {t.result_summary}
                  </p>
                )}

                <div className="flex items-center justify-between text-[10px] font-mono text-gray-500 pt-1 border-t border-white/5">
                  <span className="flex items-center gap-1">
                    <span>{t.from_agent_id}</span>
                    <ArrowRight className="w-2.5 h-2.5 text-red-400" />
                    <span>{t.to_agent_id}</span>
                  </span>
                  <span>
                    {duration ? `Durasi: ${duration}` : `Dibuat: ${formatTime(t.created_at)}`}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
