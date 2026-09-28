import { create } from 'zustand';
import { ProjectDTO } from '../lib/schemas';

interface ProjectsState {
  projects: ProjectDTO[];
  activeProjectId: string;
  searchQuery: string;

  // Actions
  selectProject: (projectId: string) => void;
  setSearchQuery: (query: string) => void;
  addProject: (name: string, description: string, agentIds: string[]) => ProjectDTO;
}

const INITIAL_PROJECTS: ProjectDTO[] = [
  {
    id: 'proj-1',
    name: 'DMC Core Pipeline',
    description: 'Arsitektur orkestrasi utama dengan 9router gateway dan multi-layer sub-agent.',
    archived: 0,
    agent_ids: ['shinaa', 'rika', 'lia', 'momo', 'cody', 'aria', 'sonix'],
    active_tasks_count: 2,
    created_at: Date.now() - 86400000 * 5,
  },
  {
    id: 'proj-2',
    name: 'Hamster Community Hub',
    description: 'Manajemen customer care, feedback adopsi, dan kurasi konten komunitas.',
    archived: 0,
    agent_ids: ['shinaa', 'rika', 'momo', 'cody'],
    active_tasks_count: 1,
    created_at: Date.now() - 86400000 * 3,
  },
  {
    id: 'proj-3',
    name: 'Acoustic Audio Lab',
    description: 'Eksperimen sintesis harmoni musik dan ekstraksi spektrum frekuensi.',
    archived: 0,
    agent_ids: ['shinaa', 'lia', 'aria', 'sonix'],
    active_tasks_count: 0,
    created_at: Date.now() - 86400000 * 2,
  },
  {
    id: 'proj-4',
    name: '9router Gateway Sync',
    description: 'Pemantauan heartbeat dan routing model LLM (Claude, GPT, DeepSeek).',
    archived: 0,
    agent_ids: ['shinaa'],
    active_tasks_count: 0,
    created_at: Date.now() - 86400000 * 1,
  },
];

export const useProjectsStore = create<ProjectsState>((set) => ({
  projects: INITIAL_PROJECTS,
  activeProjectId: 'proj-1',
  searchQuery: '',

  selectProject: (projectId) => {
    set({ activeProjectId: projectId });
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
      active_tasks_count: 0,
      created_at: Date.now(),
    };
    set((state) => ({
      projects: [newProj, ...state.projects],
      activeProjectId: newProj.id,
    }));
    return newProj;
  },
}));
