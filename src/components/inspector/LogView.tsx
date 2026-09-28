import React, { useState, useRef, useEffect } from 'react';
import { useChatStore } from '../../stores/chat';
import { formatTime } from '../../lib/format';
import { Copy, Check, Terminal, Trash2 } from 'lucide-react';
import { Button } from '../ui/Button';

interface LogViewProps {
  agentId: string;
}

export const LogView: React.FC<LogViewProps> = ({ agentId }) => {
  const [levelFilter, setLevelFilter] = useState<'all' | 'info' | 'warn' | 'error'>('all');
  const [copied, setCopied] = useState(false);
  const logs = useChatStore((s) => s.logs);
  const containerRef = useRef<HTMLDivElement>(null);

  const agentLogs = logs.filter(
    (l) => l.agent_id === agentId && (levelFilter === 'all' || l.level === levelFilter)
  );

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [agentLogs]);

  const handleCopy = () => {
    const text = agentLogs
      .map((l) => `[${formatTime(l.created_at)}] [${l.level.toUpperCase()}] ${l.message}`)
      .join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'error':
        return 'text-red-400 font-bold';
      case 'warn':
        return 'text-amber-400';
      case 'info':
      default:
        return 'text-emerald-400';
    }
  };

  return (
    <div className="flex flex-col h-full space-y-3 font-mono">
      {/* Log Toolbar */}
      <div className="flex items-center justify-between gap-2 pb-2 border-b border-white/10 text-xs">
        {/* Level Filters */}
        <div className="flex items-center gap-1 bg-[#0b0f14] p-1 rounded-md border border-white/10">
          {(['all', 'info', 'warn', 'error'] as const).map((lvl) => (
            <button
              key={lvl}
              type="button"
              onClick={() => setLevelFilter(lvl)}
              className={`px-2 py-0.5 rounded text-[10px] uppercase font-semibold transition-colors cursor-pointer ${
                levelFilter === lvl
                  ? 'bg-red-600 text-white shadow-xs'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {lvl}
            </button>
          ))}
        </div>

        {/* Copy Button */}
        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center gap-1 px-2.5 py-1 rounded bg-[#0b0f14] hover:bg-white/10 border border-white/10 text-[11px] text-gray-300 hover:text-white transition-colors cursor-pointer"
        >
          {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
          <span>{copied ? 'Tersalin' : 'Copy'}</span>
        </button>
      </div>

      {/* Terminal Output Screen */}
      <div
        ref={containerRef}
        className="flex-1 bg-[#090d12] rounded-lg border border-white/10 p-3 overflow-y-auto text-xs space-y-1.5 min-h-[300px]"
      >
        <div className="text-[11px] text-gray-500 pb-2 border-b border-white/5 flex items-center gap-1.5 select-none">
          <Terminal className="w-3 h-3 text-red-400" />
          <span>9ROUTER TELEMETRY STREAM · NODE_{agentId.toUpperCase()}</span>
        </div>

        {agentLogs.length === 0 ? (
          <div className="py-12 text-center text-gray-500 text-xs">
            Belum ada log untuk level "{levelFilter}".
          </div>
        ) : (
          agentLogs.map((log, idx) => (
            <div key={idx} className="flex items-start gap-2 leading-relaxed">
              <span className="text-gray-500 shrink-0 text-[10px] tabular-nums select-none">
                {formatTime(log.created_at)}
              </span>
              <span className={`text-[10px] uppercase shrink-0 ${getLevelColor(log.level)}`}>
                [{log.level}]
              </span>
              <span className="text-gray-300 break-words">{log.message}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
