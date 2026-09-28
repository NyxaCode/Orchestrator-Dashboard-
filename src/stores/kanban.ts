import { create } from 'zustand';
import { KanbanTaskDTO, KanbanColumnId, KanbanPriority } from '../lib/schemas';

export interface KanbanFilters {
  searchQuery: string;
  agentId: string | null;
  tag: string | null;
  priority: KanbanPriority | null;
}

interface KanbanState {
  tasks: KanbanTaskDTO[];
  filters: KanbanFilters;
  isSimulating: boolean;

  // Actions
  addTask: (taskData: Omit<KanbanTaskDTO, 'id' | 'created_at' | 'updated_at'>) => KanbanTaskDTO;
  updateTask: (id: string, updates: Partial<KanbanTaskDTO>) => void;
  moveTask: (id: string, toColumn: KanbanColumnId, targetIndex?: number) => void;
  deleteTask: (id: string) => void;
  setSearchQuery: (query: string) => void;
  setAgentFilter: (agentId: string | null) => void;
  setTagFilter: (tag: string | null) => void;
  setPriorityFilter: (priority: KanbanPriority | null) => void;
  clearFilters: () => void;
  importTasksConfig: (jsonString: string) => { success: boolean; count?: number; error?: string };
  exportTasksConfig: () => string;
  resetToDefaultTasks: () => void;
  simulateAgentExecution: (taskId: string) => Promise<void>;
}

const STORAGE_KEY = 'hermes_kanban_tasks_v2';

export const INITIAL_KANBAN_TASKS: KanbanTaskDTO[] = [
  {
    id: 'TASK-101',
    project_id: 'proj-1',
    sub_project_id: 'sub-1-1',
    title: 'Audit 9router Multi-LLM Fallback Latency',
    description: 'Bandingkan latency switching dari Claude ke DeepSeek saat rate-limit 429 terpicu.',
    column_id: 'in_progress',
    priority: 'high',
    assigned_agent_id: 'shinaa',
    tags: ['gateway', 'failover', 'perf'],
    skills: ['benchmarking', 'error-handling', 'circuit-breaker'],
    tools: ['bash_terminal', 'code_exec', 'web_search'],
    prompt_context: `Inspect the gateway response headers on /api/chat. Measure TTFT (Time To First Token) across provider switch events. If fallback exceeds 650ms, generate an aggressive exponential backoff patch in server/adapters/hermes.ts.`,
    output_artifact: 'reports/latency-audit.json',
    created_by: 'operator',
    created_at: Date.now() - 86400000 * 2,
    updated_at: Date.now() - 3600000 * 3,
  },
  {
    id: 'TASK-102',
    project_id: 'proj-1',
    sub_project_id: 'sub-1-2',
    title: 'Implement Hierarchical Agent Context Handoff',
    description: 'Format context window saat Shinaa mendelegasikan parent task ke Rika & Lia.',
    column_id: 'ready',
    priority: 'critical',
    assigned_agent_id: 'rika',
    tags: ['orchestration', 'context-window', 'prompt-spec'],
    skills: ['prompt-engineering', 'context-compaction', 'json-schema'],
    tools: ['file_editor', 'code_exec'],
    prompt_context: `You are Rika, customer & community lead. Shinaa delegates user intent token. Compact conversation history down to key state variables, user persona, and clear success criteria before dispatching sub-goals to Momo and Cody.`,
    output_artifact: 'src/lib/handoff-protocol.ts',
    created_by: 'shinaa',
    created_at: Date.now() - 86400000 * 1,
    updated_at: Date.now() - 3600000 * 8,
  },
  {
    id: 'TASK-103',
    project_id: 'proj-1',
    sub_project_id: 'sub-1-3',
    title: 'Stream Telemetry Buffer Auto-Flush',
    description: 'Optimasi memory ring-buffer SSE agar tidak memory leak pada high-concurrency log.',
    column_id: 'review',
    priority: 'medium',
    assigned_agent_id: 'lia',
    tags: ['telemetry', 'sse', 'memory'],
    skills: ['stream-parsing', 'memory-profiling'],
    tools: ['code_exec', 'file_editor'],
    prompt_context: `Validate log retention max size 500 items in chat.ts. Add circular array buffer ring to prevent V8 heap garbage collection spikes during high speed message generation.`,
    output_artifact: 'src/stores/chat.ts',
    created_by: 'operator',
    created_at: Date.now() - 86400000 * 3,
    updated_at: Date.now() - 3600000 * 2,
  },
  {
    id: 'TASK-104',
    project_id: 'proj-1',
    sub_project_id: 'sub-1-1',
    title: 'Config-File Schema Validation for Hermes Agent',
    description: 'Definisikan JSON schema resmi yang dibaca Hermes untuk delegasi dan queue otomatis.',
    column_id: 'done',
    priority: 'medium',
    assigned_agent_id: 'shinaa',
    tags: ['schema', 'config', 'hermes'],
    skills: ['zod', 'typescript-types'],
    tools: ['file_editor'],
    prompt_context: `Build robust Zod schema covering Kanban tasks, prompt directives, required skills, and tools. Ensure backwards compatibility with older tasks.json configs.`,
    output_artifact: 'src/lib/schemas.ts',
    created_by: 'operator',
    created_at: Date.now() - 86400000 * 4,
    updated_at: Date.now() - 86400000 * 1,
  },
  {
    id: 'TASK-105',
    project_id: 'proj-1',
    sub_project_id: 'sub-1-2',
    title: 'Dynamic Agent Capability Matcher',
    description: 'Algoritma matching otomatis antara prompt request user dengan tools agen yang tersedia.',
    column_id: 'backlog',
    priority: 'low',
    assigned_agent_id: null,
    tags: ['agent-matching', 'nlp', 'capabilities'],
    skills: ['similarity-scoring', 'prompt-routing'],
    tools: ['web_search'],
    prompt_context: `Score incoming task prompt keywords against registered agent skills. Recommend optimal worker (e.g. sound analysis -> Lia, user FAQ -> Cody).`,
    output_artifact: null,
    created_by: 'operator',
    created_at: Date.now() - 86400000 * 1,
    updated_at: Date.now() - 86400000 * 1,
  },
  {
    id: 'TASK-201',
    project_id: 'proj-2',
    sub_project_id: 'sub-2-1',
    title: 'Hamster Care FAQ Auto-Response Template',
    description: 'Rancang template prompt untuk penanganan diet, kandang, dan sanitasi hamster.',
    column_id: 'in_progress',
    priority: 'high',
    assigned_agent_id: 'cody',
    tags: ['faq', 'customer-care', 'prompts'],
    skills: ['prompt-engineering', 'empathy-tone'],
    tools: ['file_editor'],
    prompt_context: `Cody, act as senior support hamster specialist. Tone must be warm, reassuring, and concise. Provide 3-step action items for safe diet guidelines.`,
    output_artifact: 'prompts/hamster-faq.md',
    created_by: 'rika',
    created_at: Date.now() - 86400000 * 2,
    updated_at: Date.now() - 3600000 * 4,
  },
  {
    id: 'TASK-202',
    project_id: 'proj-2',
    sub_project_id: 'sub-2-2',
    title: 'Community Feed Meme Scraper & Filter',
    description: 'Penyaringan otomatis gambar dan teks lucu untuk feed harian komunitas.',
    column_id: 'ready',
    priority: 'medium',
    assigned_agent_id: 'momo',
    tags: ['curation', 'social', 'crawler'],
    skills: ['content-moderation', 'media-parsing'],
    tools: ['web_search', 'bash_terminal'],
    prompt_context: `Extract top 5 wholesome pet stories from public forums. Verify zero toxic language or spam keywords before approving to feed queue.`,
    output_artifact: 'dist/curated-feed.json',
    created_by: 'rika',
    created_at: Date.now() - 86400000 * 1,
    updated_at: Date.now() - 3600000 * 5,
  },
  {
    id: 'TASK-301',
    project_id: 'proj-3',
    sub_project_id: 'sub-3-1',
    title: 'Fourier Transform Spectrogram Visualizer',
    description: 'Plotting gelombang audio riil ke frekuensi visual warna berfrekuensi 20Hz-20kHz.',
    column_id: 'in_progress',
    priority: 'high',
    assigned_agent_id: 'aria',
    tags: ['dsp', 'audio', 'waveform'],
    skills: ['signal-processing', 'canvas-rendering'],
    tools: ['code_exec', 'file_editor'],
    prompt_context: `Compute Fast Fourier Transform (FFT) on synthetic sine wave streams. Output normalized 128-bin magnitude array for audio visualizer HUD.`,
    output_artifact: 'src/lib/fft-math.ts',
    created_by: 'lia',
    created_at: Date.now() - 86400000 * 2,
    updated_at: Date.now() - 3600000 * 1,
  },
  {
    id: 'TASK-302',
    project_id: 'proj-3',
    sub_project_id: 'sub-3-2',
    title: 'Stem Isolator: Vocal vs Instrument Track',
    description: 'Pemisahan vokal acapella dari background music track.',
    column_id: 'backlog',
    priority: 'critical',
    assigned_agent_id: 'sonix',
    tags: ['separation', 'ai-audio', 'stems'],
    skills: ['audio-synthesis', 'spectral-masking'],
    tools: ['bash_terminal'],
    prompt_context: `Apply Demucs spectral separation weights to input wav audio. Generate separate wav streams for vocal and percussion tracks.`,
    output_artifact: null,
    created_by: 'lia',
    created_at: Date.now() - 86400000 * 1,
    updated_at: Date.now() - 86400000 * 1,
  },
];

function loadSavedTasks(): KanbanTaskDTO[] {
  if (typeof window === 'undefined') return INITIAL_KANBAN_TASKS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return INITIAL_KANBAN_TASKS;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
  } catch (err) {
    console.warn('Failed to parse saved kanban tasks:', err);
  }
  return INITIAL_KANBAN_TASKS;
}

function persistTasks(tasks: KanbanTaskDTO[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks, null, 2));
  } catch {
    // ignore
  }
}

export const useKanbanStore = create<KanbanState>((set, get) => ({
  tasks: loadSavedTasks(),
  filters: {
    searchQuery: '',
    agentId: null,
    tag: null,
    priority: null,
  },
  isSimulating: false,

  addTask: (data) => {
    const now = Date.now();
    const newTask: KanbanTaskDTO = {
      ...data,
      id: `TASK-${Math.floor(100 + Math.random() * 900)}`,
      created_at: now,
      updated_at: now,
    };
    set((state) => {
      const updated = [newTask, ...state.tasks];
      persistTasks(updated);
      return { tasks: updated };
    });
    return newTask;
  },

  updateTask: (id, updates) => {
    set((state) => {
      const updated = state.tasks.map((t) =>
        t.id === id ? { ...t, ...updates, updated_at: Date.now() } : t
      );
      persistTasks(updated);
      return { tasks: updated };
    });
  },

  moveTask: (id, toColumn, targetIndex) => {
    set((state) => {
      const task = state.tasks.find((t) => t.id === id);
      if (!task) return state;

      const remaining = state.tasks.filter((t) => t.id !== id);
      const updatedTask: KanbanTaskDTO = {
        ...task,
        column_id: toColumn,
        updated_at: Date.now(),
      };

      if (typeof targetIndex === 'number' && targetIndex >= 0) {
        remaining.splice(targetIndex, 0, updatedTask);
      } else {
        remaining.push(updatedTask);
      }

      persistTasks(remaining);
      return { tasks: remaining };
    });
  },

  deleteTask: (id) => {
    set((state) => {
      const updated = state.tasks.filter((t) => t.id !== id);
      persistTasks(updated);
      return { tasks: updated };
    });
  },

  setSearchQuery: (searchQuery) => {
    set((state) => ({ filters: { ...state.filters, searchQuery } }));
  },

  setAgentFilter: (agentId) => {
    set((state) => ({ filters: { ...state.filters, agentId } }));
  },

  setTagFilter: (tag) => {
    set((state) => ({ filters: { ...state.filters, tag } }));
  },

  setPriorityFilter: (priority) => {
    set((state) => ({ filters: { ...state.filters, priority } }));
  },

  clearFilters: () => {
    set({
      filters: {
        searchQuery: '',
        agentId: null,
        tag: null,
        priority: null,
      },
    });
  },

  importTasksConfig: (jsonString) => {
    try {
      const parsed = JSON.parse(jsonString);
      const taskArray = Array.isArray(parsed)
        ? parsed
        : Array.isArray(parsed.tasks)
        ? parsed.tasks
        : null;

      if (!taskArray || taskArray.length === 0) {
        return { success: false, error: 'JSON harus berupa array task atau object dengan key "tasks".' };
      }

      const validTasks: KanbanTaskDTO[] = taskArray.map((raw: any, index: number) => ({
        id: String(raw.id || `TASK-${Date.now().toString(36)}-${index}`),
        project_id: String(raw.project_id || 'proj-1'),
        sub_project_id: raw.sub_project_id ? String(raw.sub_project_id) : null,
        title: String(raw.title || 'Untitled Task'),
        description: String(raw.description || ''),
        column_id: ['backlog', 'ready', 'in_progress', 'review', 'done'].includes(raw.column_id)
          ? raw.column_id
          : 'backlog',
        priority: ['low', 'medium', 'high', 'critical'].includes(raw.priority)
          ? raw.priority
          : 'medium',
        assigned_agent_id: raw.assigned_agent_id ? String(raw.assigned_agent_id) : null,
        tags: Array.isArray(raw.tags) ? raw.tags.map(String) : [],
        skills: Array.isArray(raw.skills) ? raw.skills.map(String) : [],
        tools: Array.isArray(raw.tools) ? raw.tools.map(String) : [],
        prompt_context: String(raw.prompt_context || ''),
        output_artifact: raw.output_artifact ? String(raw.output_artifact) : null,
        created_by: String(raw.created_by || 'agent'),
        created_at: Number(raw.created_at) || Date.now(),
        updated_at: Date.now(),
      }));

      set({ tasks: validTasks });
      persistTasks(validTasks);
      return { success: true, count: validTasks.length };
    } catch (err: any) {
      return { success: false, error: `Invalid JSON: ${err?.message || 'Syntax error'}` };
    }
  },

  exportTasksConfig: () => {
    const tasks = get().tasks;
    return JSON.stringify(
      {
        version: '2.0.0',
        generated_at: new Date().toISOString(),
        description: 'Hermes AI Agent Task Delegation & Queue Config File',
        tasks,
      },
      null,
      2
    );
  },

  resetToDefaultTasks: () => {
    set({ tasks: INITIAL_KANBAN_TASKS });
    persistTasks(INITIAL_KANBAN_TASKS);
  },

  simulateAgentExecution: async (taskId: string) => {
    const task = get().tasks.find((t) => t.id === taskId);
    if (!task) return;

    set({ isSimulating: true });

    // Step 1: If in backlog or ready, move to in_progress
    if (task.column_id === 'backlog' || task.column_id === 'ready') {
      get().moveTask(taskId, 'in_progress');
      await new Promise((resolve) => setTimeout(resolve, 800));
    }

    // Step 2: Progress to review
    get().moveTask(taskId, 'review');
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Step 3: Complete into done
    get().moveTask(taskId, 'done');
    get().updateTask(taskId, {
      output_artifact: task.output_artifact || `artifacts/output-${task.id.toLowerCase()}.json`,
    });

    set({ isSimulating: false });
  },
}));
