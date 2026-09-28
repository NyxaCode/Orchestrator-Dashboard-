import { create } from 'zustand';
import { AgentDTO, AgentStatus } from '../lib/schemas';
import { INITIAL_MOCK_AGENTS } from '../server/adapters/mock';
import { layoutRadial } from '../components/graph/layoutRadial';

export interface ActiveDelegation {
  taskId: string;
  fromAgentId: string;
  toAgentId: string;
  label: string;
}

interface AgentsState {
  agents: Record<string, AgentDTO>;
  selectedAgentId: string | null;
  activeDelegations: ActiveDelegation[];
  isAutoSaving: boolean;
  
  // Actions
  setAgents: (agents: AgentDTO[]) => void;
  updateAgentStatus: (agentId: string, status: AgentStatus) => void;
  updateAgentPosition: (agentId: string, x: number, y: number) => void;
  addAgent: (agent: AgentDTO) => void;
  selectAgent: (agentId: string | null) => void;
  startDelegation: (delegation: ActiveDelegation) => void;
  endDelegation: (taskId: string) => void;
  resetPositionsToRadial: () => void;
  triggerAutoSaveIndicator: () => void;
}

const initialMap: Record<string, AgentDTO> = {};
INITIAL_MOCK_AGENTS.forEach((a) => {
  initialMap[a.id] = { ...a };
});

export const useAgentsStore = create<AgentsState>((set, get) => ({
  agents: initialMap,
  selectedAgentId: null,
  activeDelegations: [],
  isAutoSaving: false,

  setAgents: (agents) => {
    const map: Record<string, AgentDTO> = {};
    agents.forEach((a) => {
      map[a.id] = a;
    });
    set({ agents: map });
  },

  updateAgentStatus: (agentId, status) => {
    set((state) => {
      const existing = state.agents[agentId];
      if (!existing) return state;
      return {
        agents: {
          ...state.agents,
          [agentId]: { ...existing, status },
        },
      };
    });
  },

  updateAgentPosition: (agentId, x, y) => {
    set((state) => {
      const existing = state.agents[agentId];
      if (!existing) return state;
      return {
        agents: {
          ...state.agents,
          [agentId]: { ...existing, pos_x: x, pos_y: y },
        },
      };
    });
    get().triggerAutoSaveIndicator();
  },

  addAgent: (agent) => {
    set((state) => {
      return {
        agents: {
          ...state.agents,
          [agent.id]: agent,
        },
      };
    });
    get().triggerAutoSaveIndicator();
    get().resetPositionsToRadial();
  },

  selectAgent: (agentId) => {
    set({ selectedAgentId: agentId });
  },

  startDelegation: (delegation) => {
    set((state) => {
      const exists = state.activeDelegations.some((d) => d.taskId === delegation.taskId);
      if (exists) return state;
      return {
        activeDelegations: [...state.activeDelegations, delegation],
      };
    });
  },

  endDelegation: (taskId) => {
    set((state) => ({
      activeDelegations: state.activeDelegations.filter((d) => d.taskId !== taskId),
    }));
  },

  resetPositionsToRadial: () => {
    const state = get();
    const agentList = Object.values(state.agents);
    const orchestrator = agentList.find((a) => a.role === 'orchestrator');
    const subAgents = agentList.filter((a) => a.role !== 'orchestrator');

    const result = layoutRadial(subAgents.length, 420, 320);

    const updated: Record<string, AgentDTO> = {};
    if (orchestrator) {
      updated[orchestrator.id] = {
        ...orchestrator,
        pos_x: result.orchestrator.x,
        pos_y: result.orchestrator.y,
      };
    }

    subAgents.forEach((a, idx) => {
      const pos = result.agents[idx] || { x: 420, y: 160 };
      updated[a.id] = {
        ...a,
        pos_x: pos.x,
        pos_y: pos.y,
      };
    });

    set({ agents: updated });
    get().triggerAutoSaveIndicator();
  },

  triggerAutoSaveIndicator: () => {
    set({ isAutoSaving: true });
    setTimeout(() => {
      set({ isAutoSaving: false });
    }, 1200);
  },
}));
