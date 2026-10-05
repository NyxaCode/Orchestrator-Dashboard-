import React, { useState, useEffect } from 'react';
import { useChatStore } from '../../stores/chat';

interface HermesStatusBarProps {
  projectId: string;
}

export const HermesStatusBar: React.FC<HermesStatusBarProps> = ({ projectId }) => {
  const isStreaming = useChatStore((s) => s.isStreaming);
  const errorMessage = useChatStore((s) => s.errorMessage);
  const projectConfigs = useChatStore((s) => s.projectConfigs);

  const rawConfig = projectConfigs[projectId];
  const config = {
    hermesMode: rawConfig?.hermesMode || 'default',
    thinkingLevel: rawConfig?.thinkingLevel || 'medium',
    hermesModel: rawConfig?.hermesModel || 'claude-opus-4.6',
    voiceActive: Boolean(rawConfig?.voiceActive),
    targetAgentId: rawConfig?.targetAgentId ?? null,
    sessionStartTime: rawConfig?.sessionStartTime || Date.now(),
    tokenUsage: {
      used: rawConfig?.tokenUsage?.used ?? 0,
      max: rawConfig?.tokenUsage?.max ?? 1000000,
    },
    sessionsCount: rawConfig?.sessionsCount ?? 1,
    latencyMs: rawConfig?.latencyMs ?? 42,
    lastThinkingDurationSec: rawConfig?.lastThinkingDurationSec ?? 1.2,
  };

  const [liveThinkingSec, setLiveThinkingSec] = useState<number>(config.lastThinkingDurationSec || 1.2);

  // Sync state when config updates while not streaming
  useEffect(() => {
    if (!isStreaming) {
      setLiveThinkingSec(config.lastThinkingDurationSec ?? 1.2);
    }
  }, [config.lastThinkingDurationSec, isStreaming]);

  // Live timer for thinking time while streaming
  useEffect(() => {
    if (isStreaming) {
      const startTime = Date.now();
      const timer = setInterval(() => {
        const elapsed = (Date.now() - startTime) / 1000;
        setLiveThinkingSec(Number(elapsed.toFixed(1)));
      }, 100);
      return () => clearInterval(timer);
    }
  }, [isStreaming]);

  const getShortModelLabel = (model?: string) => {
    if (!model || typeof model !== 'string') return 'opus 4.6';
    if (model.includes('opus')) return 'opus 4.7';
    if (model.includes('gpt-oss')) return 'gpt-oss 20b';
    if (model.includes('deepseek')) return 'deepseek v3';
    if (model.includes('gemini')) return 'gemini 2.5';
    if (model.includes('hermes')) return 'hermes 3';
    return model.split('/').pop() || model;
  };

  const tokenMax = config.tokenUsage?.max || 1000000;
  const tokenUsed = config.tokenUsage?.used || 0;
  const tokenPercent = Math.min(100, Math.round((tokenUsed / tokenMax) * 100));
  const blocksTotal = 5;
  const filledBlocks = Math.round((tokenPercent / 100) * blocksTotal);
  const barString = '█'.repeat(Math.max(0, filledBlocks)) + '░'.repeat(Math.max(0, blocksTotal - filledBlocks));

  let statusText = 'ready';
  let statusColor = 'text-cyan-400';
  if (errorMessage) {
    statusText = 'error';
    statusColor = 'text-red-400';
  } else if (isStreaming) {
    statusText = 'running';
    statusColor = 'text-amber-400 animate-pulse';
  }

  const latency = config.latencyMs || 42;

  return (
    <div className="flex items-center justify-between gap-2 px-3 py-1.5 bg-[#090d13] border-t border-b border-white/10 font-mono text-[11px] leading-tight select-none min-w-0 shrink-0">
      {/* Left: Status & Model */}
      <div className="flex items-center gap-1.5 min-w-0 shrink">
        <span className="text-gray-500 font-bold shrink-0">-</span>
        <span className={`font-semibold shrink-0 ${statusColor}`}>{statusText}</span>
        <span className="text-amber-500/40">|</span>
        <span
          className="text-amber-400 font-medium truncate max-w-[85px] sm:max-w-[120px]"
          title={config.hermesModel}
        >
          {getShortModelLabel(config.hermesModel)}
        </span>
      </div>

      {/* Right: Context % | Latency | Time Thinking */}
      <div className="flex items-center gap-1.5 text-gray-300 shrink-0 text-[10px] sm:text-[11px]">
        <span className="text-cyan-400">
          <span className="hidden md:inline">[{barString}] </span>{tokenPercent}% ctx
        </span>
        <span className="text-amber-500/40">·</span>
        <span className="text-emerald-400 tabular-nums">{latency}ms</span>
        <span className="text-amber-500/40">·</span>
        <span className="text-purple-300 tabular-nums">
          think {liveThinkingSec}s
        </span>
      </div>
    </div>
  );
};
