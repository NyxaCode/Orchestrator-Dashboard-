import { create } from 'zustand';

export type InspectorTab = 'overview' | 'logs' | 'tasks' | 'config';

interface UiState {
  sidebarCollapsed: boolean;
  chatCollapsed: boolean;
  inspectorOpen: boolean;
  inspectorTab: InspectorTab;
  inspectorAgentId: string | null;
  viewMode: 'graph' | 'list';
  mobileActiveTab: 'graph' | 'projects' | 'chat';
  highlightedAgentId: string | null;
  chatWidth: number;

  // Actions
  toggleSidebar: () => void;
  toggleChat: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setChatCollapsed: (collapsed: boolean) => void;
  setChatWidth: (width: number) => void;
  openInspector: (agentId: string, tab?: InspectorTab) => void;
  closeInspector: () => void;
  setInspectorTab: (tab: InspectorTab) => void;
  setViewMode: (mode: 'graph' | 'list') => void;
  setMobileActiveTab: (tab: 'graph' | 'projects' | 'chat') => void;
  setHighlightedAgentId: (id: string | null) => void;
}

export const useUiStore = create<UiState>((set) => ({
  sidebarCollapsed: false,
  chatCollapsed: false,
  inspectorOpen: false,
  inspectorTab: 'overview',
  inspectorAgentId: null,
  viewMode: 'graph',
  mobileActiveTab: 'graph',
  highlightedAgentId: null,
  chatWidth: typeof window !== 'undefined' ? Number(localStorage.getItem('hermes_chat_width')) || 420 : 420,

  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  toggleChat: () => set((state) => ({ chatCollapsed: !state.chatCollapsed })),
  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
  setChatCollapsed: (collapsed) => set({ chatCollapsed: collapsed }),
  setChatWidth: (width) => {
    const clamped = Math.max(320, Math.min(width, 700));
    try {
      localStorage.setItem('hermes_chat_width', String(clamped));
    } catch {
      // ignore
    }
    set({ chatWidth: clamped });
  },

  openInspector: (agentId, tab = 'overview') =>
    set({
      inspectorOpen: true,
      inspectorAgentId: agentId,
      inspectorTab: tab,
    }),

  closeInspector: () =>
    set({
      inspectorOpen: false,
      inspectorAgentId: null,
    }),

  setInspectorTab: (tab) => set({ inspectorTab: tab }),
  setViewMode: (mode) => set({ viewMode: mode }),
  setMobileActiveTab: (tab) => set({ mobileActiveTab: tab }),
  setHighlightedAgentId: (id) => set({ highlightedAgentId: id }),
}));
