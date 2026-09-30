import React, { useRef } from 'react';
import { useChatStore, HermesMode, ThinkingLevel } from '../../stores/chat';
import { useProjectsStore } from '../../stores/projects';
import { useAgentsStore } from '../../stores/agents';
import { useUiStore } from '../../stores/ui';
import { MessageList } from './MessageList';
import { Composer, ComposerAttachment } from './Composer';
import { HermesStatusBar } from './HermesStatusBar';
import { AgentAvatar } from '../ui/AgentAvatar';
import { getAdapter } from '../../server/adapters';
import { ChevronRight, ArrowLeft, AlertTriangle, ShieldCheck, UserCheck, Sparkles, Maximize2, Minimize2 } from 'lucide-react';
import { IconButton } from '../ui/IconButton';
import { MessageDTO } from '../../lib/schemas';
import { extractAllMentions } from '../../lib/sanitize';
import { cleanModelName } from '../../lib/format';

export const ChatPanel: React.FC = () => {
  const rawProjectId = useProjectsStore((s) => s.activeProjectId);
  const activeProjectId = rawProjectId || 'proj-1';
  const projects = useProjectsStore((s) => s.projects) || [];
  const currentProject = projects.find((p) => p.id === activeProjectId) || projects[0] || {
    id: activeProjectId,
    name: 'DMC Core Pipeline',
    description: '',
    archived: 0,
    agent_ids: ['shinaa', 'rika', 'lia'],
    active_tasks_count: 0,
    created_at: Date.now(),
  };

  // Per-project Hermes agent configuration & sessions
  const projectConfigs = useChatStore((s) => s.projectConfigs);
  const setTargetAgentId = useChatStore((s) => s.setTargetAgentId);
  const setHermesMode = useChatStore((s) => s.setHermesMode);
  const setThinkingLevel = useChatStore((s) => s.setThinkingLevel);
  const setHermesModel = useChatStore((s) => s.setHermesModel);
  const toggleVoice = useChatStore((s) => s.toggleVoice);
  const clearMessages = useChatStore((s) => s.clearMessages);
  const updateProjectTelemetry = useChatStore((s) => s.updateProjectTelemetry);

  const rawConfig = projectConfigs[activeProjectId];
  const config = {
    hermesMode: rawConfig?.hermesMode || 'default',
    thinkingLevel: rawConfig?.thinkingLevel || 'medium',
    hermesModel: rawConfig?.hermesModel || 'claude-opus-4.6',
    voiceActive: Boolean(rawConfig?.voiceActive),
    targetAgentId: rawConfig?.targetAgentId ?? null,
    sessionStartTime: rawConfig?.sessionStartTime || Date.now() - 938000,
    tokenUsage: {
      used: rawConfig?.tokenUsage?.used ?? 0,
      max: rawConfig?.tokenUsage?.max ?? 1000000,
    },
    sessionsCount: rawConfig?.sessionsCount ?? 2,
  };

  const targetAgentId = config.targetAgentId;
  const hermesMode = config.hermesMode;
  const thinkingLevel = config.thinkingLevel;
  const hermesModel = config.hermesModel;

  // Direct 1-on-1 session thread partition when an agent besides orchestrator is targeted
  const threadKey = targetAgentId ? `${activeProjectId}:agent:${targetAgentId}` : activeProjectId;

  const messages = useChatStore((s) => s.messages[threadKey] || []);
  const isStreaming = useChatStore((s) => s.isStreaming);
  const setStreaming = useChatStore((s) => s.setStreaming);
  const appendMessage = useChatStore((s) => s.appendMessage);
  const updateMessageDelta = useChatStore((s) => s.updateMessageDelta);
  const finalizeMessage = useChatStore((s) => s.finalizeMessage);
  const addTask = useChatStore((s) => s.addTask);
  const updateTask = useChatStore((s) => s.updateTask);
  const addLog = useChatStore((s) => s.addLog);

  const agents = useAgentsStore((s) => s.agents);
  const updateAgentStatus = useAgentsStore((s) => s.updateAgentStatus);
  const startDelegation = useAgentsStore((s) => s.startDelegation);
  const endDelegation = useAgentsStore((s) => s.endDelegation);

  const toggleChat = useUiStore((s) => s.toggleChat);
  const chatWidth = useUiStore((s) => s.chatWidth);
  const setChatWidth = useUiStore((s) => s.setChatWidth);

  const activeRunIdRef = useRef<string | null>(null);

  const targetAgent = targetAgentId ? agents[targetAgentId] : null;
  const isTargetOffline = targetAgent?.status === 'offline';
  const isTargetError = targetAgent?.status === 'error';
  const targetColor = targetAgent?.color || '#ef4444';

  const handleSendMessage = async (content: string, attachments?: ComposerAttachment[]) => {
    const trimmed = content.trim();

    // Client-side quick command interception (updates per-project settings)
    if (trimmed === '/clear' || trimmed === '/reset') {
      clearMessages(threadKey);
      appendMessage(threadKey, {
        id: `sys_${Date.now()}`,
        thread_id: threadKey,
        role: 'system',
        content: `Sesi percakapan ${currentProject.name} telah di-reset (/clear).`,
        status: 'sent',
        created_at: Date.now(),
      });
      return;
    }

    if (trimmed.startsWith('/mode ')) {
      const modeArg = trimmed.split(/\s+/)[1]?.toLowerCase() as HermesMode;
      if (['default', 'planning', 'ask'].includes(modeArg)) {
        setHermesMode(activeProjectId, modeArg);
      }
      return;
    } else if (trimmed.startsWith('/thinking ')) {
      const thinkArg = trimmed.split(/\s+/)[1]?.toLowerCase() as ThinkingLevel;
      if (['off', 'low', 'medium', 'high', 'extended'].includes(thinkArg)) {
        setThinkingLevel(activeProjectId, thinkArg);
      }
      return;
    } else if (trimmed.startsWith('/model ')) {
      const modelArg = trimmed.split(/\s+/)[1];
      if (modelArg) {
        setHermesModel(activeProjectId, modelArg);
      }
      return;
    } else if (trimmed === '/voice') {
      toggleVoice(activeProjectId);
      return;
    } else if (trimmed.startsWith('/agent ')) {
      const agentArg = trimmed.split(/\s+/)[1]?.toLowerCase();
      const matched = Object.values(agents).find(
        (a) => a.id.toLowerCase() === agentArg || a.name.toLowerCase() === agentArg
      );
      if (matched) {
        setTargetAgentId(activeProjectId, matched.role === 'orchestrator' ? null : matched.id);
      }
      return;
    }

    const adapter = getAdapter();
    adapter.syncAgents?.(agents);
    const userMsgId = `usr_${Date.now()}`;
    const clientMsgId = `c_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

    // Extract all mentions from text
    const mentioned = extractAllMentions(content, agents);
    const mentionedIds = mentioned.map((m) => m.id);

    // In direct agent session, effective target is strictly that agent.
    // In global room, if single mention and no manual target, route to that agent.
    let effectiveTargetId = targetAgentId;
    if (!effectiveTargetId && mentioned.length === 1) {
      effectiveTargetId = mentioned[0].id;
    }

    // 1. Optimistic User Message
    const userMsg: MessageDTO = {
      id: userMsgId,
      thread_id: threadKey,
      role: 'user',
      agent_id: null,
      content,
      status: 'sent',
      meta: {
        attachmentName: attachments?.[0]?.name,
        attachmentSize: attachments?.[0]?.size,
        attachments: attachments,
        targetAgentId: effectiveTargetId || undefined,
        targetAgentIds: mentionedIds.length > 0 ? mentionedIds : undefined,
        clientMessageId: clientMsgId,
      },
      created_at: Date.now(),
    };
    appendMessage(threadKey, userMsg);

    // 2. Prepare answering agent message placeholder
    const assistantMsgId = `ast_${Date.now()}`;
    const answeringRole = !effectiveTargetId || effectiveTargetId === 'shinaa' ? 'orchestrator' : 'agent';
    const answeringAgentId = effectiveTargetId || 'shinaa';

    const assistantMsg: MessageDTO = {
      id: assistantMsgId,
      thread_id: threadKey,
      role: answeringRole,
      agent_id: answeringAgentId,
      content: '',
      status: 'streaming',
      created_at: Date.now(),
    };
    appendMessage(threadKey, assistantMsg);

    setStreaming(true, userMsgId, assistantMsgId);
    activeRunIdRef.current = userMsgId;
    const sendStartTime = Date.now();

    try {
      const stream = adapter.sendMessage({
        threadId: threadKey,
        projectId: activeProjectId,
        targetAgentId: effectiveTargetId,
        content,
        mode: hermesMode,
        thinkingLevel: thinkingLevel,
        model: hermesModel,
        attachments: attachments?.map((a) => ({
          name: a.name,
          size: a.size,
          type: a.type || 'application/octet-stream',
        })),
        clientMessageId: clientMsgId,
      });

      for await (const event of stream) {
        if (event.type === 'message.delta') {
          updateMessageDelta(assistantMsgId, event.delta);
        } else if (event.type === 'message.done') {
          finalizeMessage(assistantMsgId);
        } else if (event.type === 'error') {
          finalizeMessage(assistantMsgId);
        } else if (event.type === 'delegation.start') {
          startDelegation({
            taskId: event.taskId,
            fromAgentId: event.fromAgentId,
            toAgentId: event.toAgentId,
            label: event.label,
          });
          // Insert system line in chat
          appendMessage(threadKey, {
            id: `sys_${Date.now()}`,
            thread_id: threadKey,
            role: 'system',
            content: `${agents[event.fromAgentId]?.name || 'Orchestrator'} mendelegasikan task ke ${agents[event.toAgentId]?.name || 'Sub-Agent'}: "${event.label}"`,
            status: 'sent',
            meta: {
              taskId: event.taskId,
              targetAgentId: event.toAgentId,
              taskTitle: event.label,
              taskStatus: 'running',
            },
            created_at: Date.now(),
          });
        } else if (event.type === 'delegation.end') {
          endDelegation(event.taskId);
        } else if (event.type === 'agent.status') {
          updateAgentStatus(event.agentId, event.status);
        } else if (event.type === 'task.created') {
          addTask(event.task);
        } else if (event.type === 'task.updated') {
          updateTask(event.task);
        } else if (event.type === 'log') {
          addLog({
            agent_id: event.agentId,
            level: event.level,
            message: event.message,
            created_at: event.ts,
          });
        }
      }

      // Record thinking duration & network latency telemetry
      const elapsedSec = Number(((Date.now() - sendStartTime) / 1000).toFixed(1));
      const simulatedLatency = 36 + Math.floor(Math.random() * 18);
      updateProjectTelemetry(activeProjectId, {
        latencyMs: simulatedLatency,
        lastThinkingDurationSec: elapsedSec,
        usedTokens: 140 + Math.floor(Math.random() * 60),
      });
    } catch (err) {
      console.error('Error during adapter.sendMessage:', err);
      finalizeMessage(assistantMsgId);
    } finally {
      setStreaming(false, null, null);
      activeRunIdRef.current = null;
    }
  };

  const handleCancelStream = async () => {
    if (activeRunIdRef.current) {
      const adapter = getAdapter();
      await adapter.cancel(activeRunIdRef.current);
      setStreaming(false, null, null);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#0c1017] border-l border-white/10 select-none overflow-hidden">
      {/* Header (Top Title Bar) */}
      <div className="h-11 border-b border-white/10 px-3 flex items-center justify-between shrink-0 bg-[#121820]">
        <div className="flex items-center gap-2 min-w-0">
          {targetAgent ? (
            <div className="flex items-center gap-2 min-w-0">
              <button
                type="button"
                onClick={() => setTargetAgentId(activeProjectId, null)}
                title="Kembali ke Orchestrator"
                aria-label="Kembali ke Orchestrator"
                className="p-1 rounded hover:bg-white/10 text-gray-400 hover:text-white transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>

              <div
                className="flex items-center gap-2 px-2 py-0.5 rounded-full border text-xs font-mono shadow-xs truncate"
                style={{
                  backgroundColor: `${targetColor}18`,
                  borderColor: `${targetColor}40`,
                  color: targetColor,
                }}
              >
                <AgentAvatar
                  agentId={targetAgent.id}
                  role={targetAgent.role}
                  name={targetAgent.name}
                  avatarUrl={targetAgent.avatar_url}
                  size={18}
                  color={targetColor}
                />
                <span className="font-semibold text-white truncate max-w-[120px]">
                  {targetAgent.name}
                </span>
                <span className="text-[10px] opacity-75 font-mono">
                  {cleanModelName(targetAgent.model_label)}
                </span>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-xs font-mono font-semibold tracking-wider text-gray-200 uppercase truncate">
                {currentProject.name}
              </span>
              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white/5 border border-white/15 text-[11px] font-mono text-gray-300 shrink-0">
                <AgentAvatar
                  agentId="shinaa"
                  role="orchestrator"
                  name="Shinaa"
                  size={16}
                  color="#ef4444"
                />
                <span>Lead</span>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-1">
          <IconButton
            aria-label={chatWidth >= 500 ? 'Perkecil lebar chat (420px)' : 'Perlebar chat (560px)'}
            title={chatWidth >= 500 ? 'Perkecil panel chat (420px)' : 'Perlebar panel chat (560px)'}
            size="sm"
            variant="ghost"
            onClick={() => setChatWidth(chatWidth >= 500 ? 420 : 560)}
            className="text-gray-400 hover:text-white"
          >
            {chatWidth >= 500 ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </IconButton>

          <IconButton
            aria-label="Tutup panel chat"
            size="sm"
            variant="ghost"
            onClick={toggleChat}
            className="text-gray-400 hover:text-white"
          >
            <ChevronRight className="w-4 h-4" />
          </IconButton>
        </div>
      </div>

      {/* Target Agent Status Alert (if offline / error) */}
      {(isTargetOffline || isTargetError) && (
        <div className="px-3 py-1 bg-red-950/40 border-b border-red-900/50 flex items-center gap-2 text-xs font-mono text-red-300">
          <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
          <span>Agent {targetAgent?.name} sedang {targetAgent?.status}. Pesan mungkin tertunda.</span>
        </div>
      )}

      {/* Direct Session Context Banner */}
      {targetAgent && (
        <div
          className="px-3 py-1 border-b flex items-center justify-between text-[11px] font-mono"
          style={{
            backgroundColor: `${targetColor}0e`,
            borderColor: `${targetColor}25`,
            color: '#d1d5db',
          }}
        >
          <div className="flex items-center gap-1.5 truncate">
            <UserCheck className="w-3.5 h-3.5" style={{ color: targetColor }} />
            <span className="truncate">Sesi Langsung: {targetAgent.name}</span>
          </div>
          <span className="text-[10px] text-gray-400 shrink-0">
            {targetAgent.parent_id ? `Supervisor: ${agents[targetAgent.parent_id]?.name || 'Shinaa'}` : 'Direct L1'}
          </span>
        </div>
      )}

      {/* Message List */}
      <div className="flex-1 overflow-y-auto">
        {/* If direct session is empty, show welcoming prompt */}
        {targetAgent && messages.length === 0 && (
          <div className="p-4 flex flex-col items-center justify-center text-center my-6">
            <div className="mb-3 relative">
              <div
                className="absolute -inset-2 rounded-full blur-md opacity-40 pointer-events-none"
                style={{ backgroundColor: targetColor }}
              />
              <AgentAvatar
                agentId={targetAgent.id}
                role={targetAgent.role}
                name={targetAgent.name}
                avatarUrl={targetAgent.avatar_url}
                size={54}
                color={targetColor}
                className="relative z-10"
              />
            </div>
            <h4 className="text-sm font-semibold text-white mb-1">
              Sesi Langsung: {targetAgent.name}
            </h4>
            <p className="text-xs text-gray-400 max-w-[260px] leading-relaxed mb-3">
              {targetAgent.description || 'Sub-agent spesialis dalam pipeline orkestrasi.'}
            </p>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-black/40 border border-white/10 text-[10px] font-mono text-gray-300">
              <span>Model: {cleanModelName(targetAgent.model_label)}</span>
              <span>·</span>
              <span>Status: {targetAgent.status}</span>
            </div>
          </div>
        )}

        <MessageList
          messages={messages}
          threadId={threadKey}
          isStreaming={isStreaming}
          answeringAgentName={targetAgent ? targetAgent.name : 'Shinaa'}
        />
      </div>

      {/* COMPACT HERMES TERMINAL STATUS BAR (Directly Above Chat Box) */}
      <HermesStatusBar projectId={activeProjectId} />

      {/* Composer (Compact & fits cleanly without horizontal overflow) */}
      <Composer
        projectId={activeProjectId}
        onSendMessage={handleSendMessage}
        onCancelStream={handleCancelStream}
        isStreaming={isStreaming}
      />
    </div>
  );
};
