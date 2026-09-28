import { create } from 'zustand';
import { ProjectDTO, SubProjectDTO } from '../lib/schemas';

interface ProjectsState {
  projects: ProjectDTO[];
  activeProjectId: string;
  activeSubProjectId: string | null;
  expandedProjectIds: string[];
  searchQuery: string;

  // Actions
  selectProject: (projectId: string) => void;
  selectSubProject: (subProjectId: string | null) => void;
  toggleExpandProject: (projectId: string) => void;
  setSearchQuery: (query: string) => void;
  addProject: (name: string, description: string, agentIds: string[]) => ProjectDTO;
  addSubProject: (
    projectId: string,
    name: string,
    description: string,
    leadAgentId?: string
  ) => SubProjectDTO;
  removeSubProject: (projectId: string, subProjectId: string) => void;
}

const INITIAL_PROJECTS: ProjectDTO[] = [
  {
    id: 'proj-1',
    name: 'DMC Core Pipeline',
    description: 'Arsitektur orkestrasi utama dengan 9router gateway dan multi-layer sub-agent.',
    archived: 0,
    agent_ids: ['shinaa', 'rika', 'lia', 'momo', 'cody', 'aria', 'sonix'],
    sub_projects: [
      {
        id: 'sub-1-1',
        project_id: 'proj-1',
        name: 'Gateway & Model Dispatch',
        description: 'Multi-LLM rate limiting, fallback circuit breaker, & heartbeat check.',
        lead_agent_id: 'shinaa',
        tasks_count: 3,
        created_at: Date.now() - 86400000 * 5,
      },
      {
        id: 'sub-1-2',
        project_id: 'proj-1',
        name: 'Parent-Child Agent Hierarchy',
        description: 'Protokol delegasi hierarkis, evaluasi context window, & handoff.',
        lead_agent_id: 'rika',
        tasks_count: 2,
        created_at: Date.now() - 86400000 * 4,
      },
      {
        id: 'sub-1-3',
        project_id: 'proj-1',
        name: 'Live Stream Telemetry & Logs',
        description: 'SSE streaming, metrics buffer, dan integrasi Hermes observer.',
        lead_agent_id: 'lia',
        tasks_count: 2,
        created_at: Date.now() - 86400000 * 3,
      },
    ],
    active_tasks_count: 7,
    created_at: Date.now() - 86400000 * 5,
  },
  {
    id: 'proj-2',
    name: 'Hamster Community Hub',
    description: 'Manajemen customer care, feedback adopsi, dan kurasi konten komunitas.',
    archived: 0,
    agent_ids: ['shinaa', 'rika', 'momo', 'cody'],
    sub_projects: [
      {
        id: 'sub-2-1',
        project_id: 'proj-2',
        name: 'Automated Ticket Triage',
        description: 'Resolusi instan pertanyaan umum komunitas via prompt template.',
        lead_agent_id: 'cody',
        tasks_count: 2,
        created_at: Date.now() - 86400000 * 3,
      },
      {
        id: 'sub-2-2',
        project_id: 'proj-2',
        name: 'Content Feeds & Curations',
        description: 'Ekstraksi meme, tips nutrisi hamster, dan auto-moderasi komentar.',
        lead_agent_id: 'momo',
        tasks_count: 1,
        created_at: Date.now() - 86400000 * 2,
      },
    ],
    active_tasks_count: 3,
    created_at: Date.now() - 86400000 * 3,
  },
  {
    id: 'proj-3',
    name: 'Acoustic Audio Lab',
    description: 'Eksperimen sintesis harmoni musik dan ekstraksi spektrum frekuensi.',
    archived: 0,
    agent_ids: ['shinaa', 'lia', 'aria', 'sonix'],
    sub_projects: [
      {
        id: 'sub-3-1',
        project_id: 'proj-3',
        name: 'Harmonic Synthesis Engine',
        description: 'Generasi gelombang sinus, overtone layering, dan auto-tuning.',
        lead_agent_id: 'aria',
        tasks_count: 2,
        created_at: Date.now() - 86400000 * 2,
      },
      {
        id: 'sub-3-2',
        project_id: 'proj-3',
        name: 'Stem Separation & DSP',
        description: 'Pemisahan instrumen vokal/drum dan visualisasi spektrum Fourier.',
        lead_agent_id: 'sonix',
        tasks_count: 1,
        created_at: Date.now() - 86400000 * 1,
      },
    ],
    active_tasks_count: 3,
    created_at: Date.now() - 86400000 * 2,
  },
  {
    id: 'proj-4',
    name: '9router Gateway Sync',
    description: 'Pemantauan heartbeat dan routing model LLM (Claude, GPT, DeepSeek).',
    archived: 0,
    agent_ids: ['shinaa'],
    sub_projects: [
      {
        id: 'sub-4-1',
        project_id: 'proj-4',
        name: 'Multi-Provider Failover',
        description: 'Auto switch ke Gemini / DeepSeek saat endpoint utama timeout.',
        lead_agent_id: 'shinaa',
        tasks_count: 1,
        created_at: Date.now() - 86400000 * 1,
      },
    ],
    active_tasks_count: 1,
    created_at: Date.now() - 86400000 * 1,
  },
];

export const useProjectsStore = create<ProjectsState>((set) => ({
  projects: INITIAL_PROJECTS,
  activeProjectId: 'proj-1',
  activeSubProjectId: null,
  expandedProjectIds: ['proj-1'],
  searchQuery: '',

  selectProject: (projectId) => {
    set((state) => {
      // Toggle expand on click or keep expanded
      const isAlreadyExpanded = state.expandedProjectIds.includes(projectId);
      return {
        activeProjectId: projectId,
        activeSubProjectId: null, // reset sub-project filter to view all project tasks
        expandedProjectIds: isAlreadyExpanded
          ? state.expandedProjectIds
          : [...state.expandedProjectIds, projectId],
      };
    });
  },

  selectSubProject: (subProjectId) => {
    set({ activeSubProjectId: subProjectId });
  },

  toggleExpandProject: (projectId) => {
    set((state) => ({
      expandedProjectIds: state.expandedProjectIds.includes(projectId)
        ? state.expandedProjectIds.filter((id) => id !== projectId)
        : [...state.expandedProjectIds, projectId],
    }));
  },

  setSearchQuery: (query) => {
    set({ searchQuery: query });
  },

  addProject: (name, description, agentIds) => {
    const newProj: ProjectDTO = {
      id: `proj-${Date.now()}`,
      name,
      description,
      archived: 0,
      agent_ids: agentIds.includes('shinaa') ? agentIds : ['shinaa', ...agentIds],
      sub_projects: [],
      active_tasks_count: 0,
      created_at: Date.now(),
    };
    set((state) => ({
      projects: [newProj, ...state.projects],
      activeProjectId: newProj.id,
      activeSubProjectId: null,
      expandedProjectIds: [...state.expandedProjectIds, newProj.id],
    }));
    return newProj;
  },

  addSubProject: (projectId, name, description, leadAgentId) => {
    const newSub: SubProjectDTO = {
      id: `sub-${Date.now().toString(36)}`,
      project_id: projectId,
      name,
      description,
      lead_agent_id: leadAgentId || 'shinaa',
      tasks_count: 0,
      created_at: Date.now(),
    };

    set((state) => ({
      projects: state.projects.map((p) => {
        if (p.id !== projectId) return p;
        const currentSubs = p.sub_projects || [];
        return {
          ...p,
          sub_projects: [...currentSubs, newSub],
        };
      }),
      activeProjectId: projectId,
      activeSubProjectId: newSub.id,
      expandedProjectIds: state.expandedProjectIds.includes(projectId)
        ? state.expandedProjectIds
        : [...state.expandedProjectIds, projectId],
    }));

    return newSub;
  },

  removeSubProject: (projectId, subProjectId) => {
    set((state) => ({
      projects: state.projects.map((p) => {
        if (p.id !== projectId) return p;
        return {
          ...p,
          sub_projects: (p.sub_projects || []).filter((sp) => sp.id !== subProjectId),
        };
      }),
      activeSubProjectId:
        state.activeSubProjectId === subProjectId ? null : state.activeSubProjectId,
    }));
  },
}));
