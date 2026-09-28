import { create } from 'zustand';
import { MessageDTO, TaskDTO, AgentLogDTO } from '../lib/schemas';

export type HermesMode = 'default' | 'planning' | 'ask';
export type ThinkingLevel = 'off' | 'low' | 'medium' | 'high' | 'extended';

export interface ProjectAgentConfig {
  hermesMode: HermesMode;
  thinkingLevel: ThinkingLevel;
  hermesModel: string;
  voiceActive: boolean;
  targetAgentId: string | null;
  sessionStartTime: number;
  tokenUsage: { used: number; max: number };
  sessionsCount: number;
  latencyMs: number;
  lastThinkingDurationSec: number;
}

export const DEFAULT_PROJECT_CONFIG: ProjectAgentConfig = {
  hermesMode: 'default',
  thinkingLevel: 'medium',
  hermesModel: 'claude-opus-4.6',
  voiceActive: false,
  targetAgentId: null,
  sessionStartTime: Date.now() - (15 * 60 + 38) * 1000,
  tokenUsage: { used: 0, max: 1000000 },
  sessionsCount: 2,
  latencyMs: 42,
  lastThinkingDurationSec: 1.2,
};

const INITIAL_PROJECT_CONFIGS: Record<string, ProjectAgentConfig> = {
  'proj-1': {
    hermesMode: 'default',
    thinkingLevel: 'medium',
    hermesModel: 'claude-opus-4.6',
    voiceActive: false,
    targetAgentId: null,
    sessionStartTime: Date.now() - (15 * 60 + 38) * 1000,
    tokenUsage: { used: 0, max: 1000000 },
    sessionsCount: 2,
    latencyMs: 42,
    lastThinkingDurationSec: 1.2,
  },
  'proj-2': {
    hermesMode: 'planning',
    thinkingLevel: 'high',
    hermesModel: 'openai/gpt-oss-20b',
    voiceActive: false,
    targetAgentId: 'rika',
    sessionStartTime: Date.now() - (24 * 60 + 12) * 1000,
    tokenUsage: { used: 25000, max: 1000000 },
    sessionsCount: 3,
    latencyMs: 38,
    lastThinkingDurationSec: 2.4,
  },
  'proj-3': {
    hermesMode: 'ask',
    thinkingLevel: 'low',
    hermesModel: 'deepseek-chat',
    voiceActive: true,
    targetAgentId: 'lia',
    sessionStartTime: Date.now() - (8 * 60 + 45) * 1000,
    tokenUsage: { used: 12000, max: 1000000 },
    sessionsCount: 1,
    latencyMs: 51,
    lastThinkingDurationSec: 0.8,
  },
  'proj-4': {
    hermesMode: 'default',
    thinkingLevel: 'off',
    hermesModel: 'hermes-3-llama-3.1-405b',
    voiceActive: false,
    targetAgentId: null,
    sessionStartTime: Date.now() - (3 * 60 + 10) * 1000,
    tokenUsage: { used: 5000, max: 1000000 },
    sessionsCount: 1,
    latencyMs: 45,
    lastThinkingDurationSec: 1.1,
  },
};

interface ChatState {
  // Messages partitioned by thread/project id
  messages: Record<string, MessageDTO[]>;
  tasks: TaskDTO[];
  logs: AgentLogDTO[];
  isStreaming: boolean;
  activeRunId: string | null;
  streamingMessageId: string | null;
  draftInput: string;
  sseStatus: 'live' | 'reconnecting' | 'error';
  errorMessage: string | null;

  // Per-Project Configurations & Agent Sessions
  projectConfigs: Record<string, ProjectAgentConfig>;

  // Actions
  getProjectConfig: (projectId: string) => ProjectAgentConfig;
  setHermesMode: (projectId: string, mode: HermesMode) => void;
  setThinkingLevel: (projectId: string, level: ThinkingLevel) => void;
  setHermesModel: (projectId: string, model: string) => void;
  setTargetAgentId: (projectIdOrAgentId: string | null, maybeAgentId?: string | null) => void;
  toggleVoice: (projectId: string) => void;
  updateProjectTelemetry: (projectId: string, telemetry: { latencyMs?: number; lastThinkingDurationSec?: number; usedTokens?: number }) => void;
  clearMessages: (threadId: string) => void;
  setDraftInput: (text: string) => void;
  appendMessage: (threadId: string, message: MessageDTO) => void;
  updateMessageDelta: (messageId: string, delta: string) => void;
  finalizeMessage: (messageId: string) => void;
  setStreaming: (isStreaming: boolean, runId?: string | null, messageId?: string | null) => void;
  setSseStatus: (status: 'live' | 'reconnecting' | 'error') => void;
  setErrorMessage: (msg: string | null) => void;
  addTask: (task: TaskDTO) => void;
  updateTask: (task: TaskDTO) => void;
  addLog: (log: AgentLogDTO) => void;
  retryMessage: (threadId: string, messageId: string) => void;
}

const INITIAL_MESSAGES: Record<string, MessageDTO[]> = {
  'proj-1': [
    {
      id: 'm-seed-1',
      thread_id: 'proj-1',
      role: 'orchestrator',
      agent_id: 'shinaa',
      content: 'Mission Control aktif. Saya **Shinaa**, Orchestrator sistem ini. Rika (CS & Hamster) dan Lia (Audio & Riset) telah terhubung ke saluran 9router. Apa yang ingin kita koordinasikan hari ini?',
      status: 'sent',
      created_at: Date.now() - 3600000 * 2,
    },
    {
      id: 'm-seed-2',
      thread_id: 'proj-1',
      role: 'system',
      agent_id: null,
      content: 'Shinaa mendelegasikan verifikasi awal koneksi ke node Rika dan Lia.',
      status: 'sent',
      meta: {
        taskId: 'task_init',
        taskTitle: 'Verifikasi handshake 9router',
        taskStatus: 'done',
      },
      created_at: Date.now() - 3600000 * 1.8,
    },
  ],
  'proj-1:agent:rika': [
    {
      id: 'm-rika-direct-1',
      thread_id: 'proj-1:agent:rika',
      role: 'agent',
      agent_id: 'rika',
      content: 'Halo! Sesi komunikasi langsung dengan **Rika** (Customer Support & Community Hub). Di sini kamu bisa ngobrol langsung denganku tanpa routing global Shinaa. Ada yang bisa kubantu terkait feedback user atau hamster care?',
      status: 'sent',
      created_at: Date.now() - 3600000,
    },
  ],
  'proj-1:agent:lia': [
    {
      id: 'm-lia-direct-1',
      thread_id: 'proj-1:agent:lia',
      role: 'agent',
      agent_id: 'lia',
      content: 'Salam! Sesi komunikasi langsung dengan **Lia** (Audio Lab & Spectrogram Analysis). Kirimkan audio query, formula harmoni, atau instruksi riset yang ingin diuji.',
      status: 'sent',
      created_at: Date.now() - 3600000,
    },
  ],
  'proj-2': [
    {
      id: 'm-seed-p2-1',
      thread_id: 'proj-2',
      role: 'agent',
      agent_id: 'rika',
      content: 'Selamat datang di kanal **Hamster Community Hub**! Seluruh log adopsi dan postingan edukasi kandang sudah siap diaudit.',
      status: 'sent',
      created_at: Date.now() - 3600000,
    },
  ],
  'proj-2:agent:rika': [
    {
      id: 'm-seed-p2-r1',
      thread_id: 'proj-2:agent:rika',
      role: 'agent',
      agent_id: 'rika',
      content: 'Sesi privat **Hamster Care** aktif. Mode perencanaan diaktifkan untuk audit feeding schedule.',
      status: 'sent',
      created_at: Date.now() - 1800000,
    },
  ],
  'proj-3': [
    {
      id: 'm-seed-p3-1',
      thread_id: 'proj-3',
      role: 'agent',
      agent_id: 'lia',
      content: 'Kanal **Acoustic Audio Lab** aktif. Spektrogram dan modul harmoni siap menerima query analisis suara.',
      status: 'sent',
      created_at: Date.now() - 3600000,
    },
  ],
  'proj-3:agent:lia': [
    {
      id: 'm-seed-p3-l1',
      thread_id: 'proj-3:agent:lia',
      role: 'agent',
      agent_id: 'lia',
      content: 'Lab akustik siap. Menggunakan mode ask untuk konfirmasi parameter FFT sebelum kalkulasi.',
      status: 'sent',
      created_at: Date.now() - 2000000,
    },
  ],
  'proj-4': [
    {
      id: 'm-seed-p4-1',
      thread_id: 'proj-4',
      role: 'orchestrator',
      agent_id: 'shinaa',
      content: 'Kanal **9router Gateway Sync** siap memantau throughput model AI dan gateway mesh.',
      status: 'sent',
      created_at: Date.now() - 1000000,
    },
  ],
};

const INITIAL_LOGS: AgentLogDTO[] = [
  {
    id: 1,
    agent_id: 'shinaa',
    level: 'info',
    message: '9router gateway connection established via claude-3-7-sonnet',
    created_at: Date.now() - 7200000,
  },
  {
    id: 2,
    agent_id: 'rika',
    level: 'info',
    message: 'Agent Rika initialized with CS prompt template v1.4',
    created_at: Date.now() - 7100000,
  },
  {
    id: 3,
    agent_id: 'lia',
    level: 'info',
    message: 'Agent Lia audio analysis engine loaded. Spectrum bins: 1024',
    created_at: Date.now() - 7000000,
  },
];

export const useChatStore = create<ChatState>((set, get) => ({
  messages: INITIAL_MESSAGES,
  tasks: [],
  logs: INITIAL_LOGS,
  isStreaming: false,
  activeRunId: null,
  streamingMessageId: null,
  draftInput: '',
  sseStatus: 'live',
  errorMessage: null,

  // Per-Project Configurations
  projectConfigs: INITIAL_PROJECT_CONFIGS,

  getProjectConfig: (projectId: string) => {
    const configs = get().projectConfigs;
    return configs[projectId] || { ...DEFAULT_PROJECT_CONFIG };
  },

  setHermesMode: (projectId, mode) => {
    set((state) => {
      const current = state.projectConfigs[projectId] || { ...DEFAULT_PROJECT_CONFIG };
      return {
        projectConfigs: {
          ...state.projectConfigs,
          [projectId]: { ...current, hermesMode: mode },
        },
      };
    });
  },

  setThinkingLevel: (projectId, level) => {
    set((state) => {
      const current = state.projectConfigs[projectId] || { ...DEFAULT_PROJECT_CONFIG };
      return {
        projectConfigs: {
          ...state.projectConfigs,
          [projectId]: { ...current, thinkingLevel: level },
        },
      };
    });
  },

  setHermesModel: (projectId, model) => {
    set((state) => {
      const current = state.projectConfigs[projectId] || { ...DEFAULT_PROJECT_CONFIG };
      return {
        projectConfigs: {
          ...state.projectConfigs,
          [projectId]: { ...current, hermesModel: model },
        },
      };
    });
  },

  setTargetAgentId: (projectIdOrAgentId, maybeAgentId) => {
    set((state) => {
      const targetProjectId = maybeAgentId !== undefined ? (projectIdOrAgentId as string) || 'proj-1' : 'proj-1';
      const agentId = maybeAgentId !== undefined ? maybeAgentId : projectIdOrAgentId;

      const current = state.projectConfigs[targetProjectId] || { ...DEFAULT_PROJECT_CONFIG };
      return {
        projectConfigs: {
          ...state.projectConfigs,
          [targetProjectId]: { ...current, targetAgentId: agentId },
        },
      };
    });
  },

  toggleVoice: (projectId) => {
    set((state) => {
      const current = state.projectConfigs[projectId] || { ...DEFAULT_PROJECT_CONFIG };
      return {
        projectConfigs: {
          ...state.projectConfigs,
          [projectId]: { ...current, voiceActive: !current.voiceActive },
        },
      };
    });
  },

  updateProjectTelemetry: (projectId, telemetry) => {
    set((state) => {
      const current = state.projectConfigs[projectId] || { ...DEFAULT_PROJECT_CONFIG };
      return {
        projectConfigs: {
          ...state.projectConfigs,
          [projectId]: {
            ...current,
            latencyMs: telemetry.latencyMs !== undefined ? telemetry.latencyMs : current.latencyMs,
            lastThinkingDurationSec:
              telemetry.lastThinkingDurationSec !== undefined
                ? telemetry.lastThinkingDurationSec
                : current.lastThinkingDurationSec,
            tokenUsage:
              telemetry.usedTokens !== undefined
                ? { ...current.tokenUsage, used: current.tokenUsage.used + telemetry.usedTokens }
                : current.tokenUsage,
          },
        },
      };
    });
  },

  clearMessages: (threadId) =>
    set((state) => ({
      messages: {
        ...state.messages,
        [threadId]: [],
      },
    })),

  setDraftInput: (text) => {
    set({ draftInput: text });
  },

  appendMessage: (threadId, message) => {
    set((state) => {
      const threadMsgs = state.messages[threadId] || [];
      return {
        messages: {
          ...state.messages,
          [threadId]: [...threadMsgs, message],
        },
      };
    });
  },

  updateMessageDelta: (messageId, delta) => {
    set((state) => {
      const updatedMessages: Record<string, MessageDTO[]> = {};
      for (const [threadId, msgs] of Object.entries(state.messages)) {
        updatedMessages[threadId] = msgs.map((m) => {
          if (m.id === messageId) {
            return {
              ...m,
              content: m.content + delta,
              status: 'streaming',
            };
          }
          return m;
        });
      }
      return { messages: updatedMessages };
    });
  },

  finalizeMessage: (messageId) => {
    set((state) => {
      const updatedMessages: Record<string, MessageDTO[]> = {};
      for (const [threadId, msgs] of Object.entries(state.messages)) {
        updatedMessages[threadId] = msgs.map((m) => {
          if (m.id === messageId) {
            return { ...m, status: 'sent' };
          }
          return m;
        });
      }
      return {
        messages: updatedMessages,
        isStreaming: false,
        activeRunId: null,
        streamingMessageId: null,
      };
    });
  },

  setStreaming: (isStreaming, runId = null, messageId = null) => {
    set({
      isStreaming,
      activeRunId: runId,
      streamingMessageId: messageId,
    });
  },

  setSseStatus: (status) => {
    set({ sseStatus: status });
  },

  setErrorMessage: (msg) => {
    set({ errorMessage: msg });
  },

  addTask: (task) => {
    set((state) => ({
      tasks: [task, ...state.tasks.filter((t) => t.id !== task.id)],
    }));
  },

  updateTask: (task) => {
    set((state) => ({
      tasks: state.tasks.map((t) => (t.id === task.id ? task : t)),
    }));
  },

  addLog: (log) => {
    set((state) => ({
      logs: [{ ...log, id: log.id || Date.now() }, ...state.logs.slice(0, 199)],
    }));
  },

  retryMessage: (threadId, messageId) => {
    set((state) => {
      const threadMsgs = state.messages[threadId] || [];
      return {
        messages: {
          ...state.messages,
          [threadId]: threadMsgs.map((m) =>
            m.id === messageId ? { ...m, status: 'sending' } : m
          ),
        },
      };
    });
  },
}));
