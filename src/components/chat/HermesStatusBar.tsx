import React, { useState, useEffect } from 'react';
import { useChatStore } from '../../stores/chat';

interface HermesStatusBarProps {
  projectId: string;
}

export const HermesStatusBar: React.FC<HermesStatusBarProps> = ({ projectId }) => {
  const isStreaming = useChatStore((s) => s.isStreaming);
  const errorMessage = useChatStore((s) => s.errorMessage);
  const projectConfigs = useChatStore((s) => s.projectConfigs);

  const config = projectConfigs[projectId] || {
    hermesMode: 'default',
    thinkingLevel: 'medium',
    hermesModel: 'claude-opus-4.6',
    voiceActive: false,
    targetAgentId: null,
    sessionStartTime: Date.now(),
    tokenUsage: { used: 0, max: 1000000 },
    sessionsCount: 1,
    latencyMs: 42,
    lastThinkingDurationSec: 1.2,
  };

  const [liveThinkingSec, setLiveThinkingSec] = useState<number>(config.lastThinkingDurationSec || 1.2);

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

  const getShortModelLabel = (model: string) => {
    if (model.includes('opus')) return 'opus 4.7';
    if (model.includes('gpt-oss')) return 'gpt-oss 20b';
    if (model.includes('deepseek')) return 'deepseek v3';
    if (model.includes('gemini')) return 'gemini 2.5';
    if (model.includes('hermes')) return 'hermes 3';
    return model.split('/').pop() || model;
  };

  const tokenPercent = Math.min(100, Math.round((config.tokenUsage.used / config.tokenUsage.max) * 100));
  const blocksTotal = 5;
  const filledBlocks = Math.round((tokenPercent / 100) * blocksTotal);
  const barString = '█'.repeat(filledBlocks) + '░'.repeat(Math.max(0, blocksTotal - filledBlocks));

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
    <div className="flex items-center justify-between px-3 py-1.5 bg-[#090d13] border-t border-b border-white/10 font-mono text-[11px] leading-tight select-none">
      {/* Left: Status & Model */}
      <div className="flex items-center gap-2">
        <span className="text-gray-500 font-bold">-</span>
        <span className={`font-semibold ${statusColor}`}>{statusText}</span>
        <span className="text-amber-500/50">|</span>
        <span className="text-amber-400 font-medium">{getShortModelLabel(config.hermesModel)}</span>
      </div>

      {/* Right: Context % | Latency | Time Thinking */}
      <div className="flex items-center gap-2 text-gray-300">
        <span className="text-cyan-400">
          [{barString}] {tokenPercent}% ctx
        </span>
        <span className="text-amber-500/50">|</span>
        <span className="text-emerald-400 tabular-nums">{latency}ms</span>
        <span className="text-amber-500/50">|</span>
        <span className="text-purple-300 tabular-nums">
          think {liveThinkingSec}s
        </span>
      </div>
    </div>
  );
};
