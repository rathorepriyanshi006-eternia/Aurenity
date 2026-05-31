'use client';

import { create } from 'zustand';

// Module types
export type Module = 
  | 'dashboard'
  | 'discovery'
  | 'digital-twin'
  | 'intelligence'
  | 'prediction'
  | 'time-machine'
  | 'war-room'
  | 'reports'
  | 'settings';

interface NavigationStore {
  currentModule: Module;
  setCurrentModule: (module: Module) => void;
  sidebarOpen: boolean;
  toggleSidebar: () => void;
}

interface AIStore {
  messages: Array<{
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: number;
  }>;
  addMessage: (role: 'user' | 'assistant', content: string) => void;
  clearMessages: () => void;
  isStreaming: boolean;
  setIsStreaming: (streaming: boolean) => void;
}

interface InfrastructureStore {
  selectedNodeId: string | null;
  setSelectedNode: (nodeId: string | null) => void;
  hoveredNodeId: string | null;
  setHoveredNode: (nodeId: string | null) => void;
  graphZoom: number;
  setGraphZoom: (zoom: number) => void;
}

interface UIStore {
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  theme: 'dark' | 'light';
  setTheme: (theme: 'dark' | 'light') => void;
}

// Navigation Store
export const useNavigationStore = create<NavigationStore>((set) => ({
  currentModule: 'dashboard',
  setCurrentModule: (module) => set({ currentModule: module }),
  sidebarOpen: true,
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
}));

// AI Store
export const useAIStore = create<AIStore>((set) => ({
  messages: [],
  addMessage: (role, content) =>
    set((state) => ({
      messages: [
        ...state.messages,
        {
          id: `msg-${Date.now()}`,
          role,
          content,
          timestamp: Date.now(),
        },
      ],
    })),
  clearMessages: () => set({ messages: [] }),
  isStreaming: false,
  setIsStreaming: (streaming) => set({ isStreaming: streaming }),
}));

// Infrastructure Store
export const useInfrastructureStore = create<InfrastructureStore>((set) => ({
  selectedNodeId: null,
  setSelectedNode: (nodeId) => set({ selectedNodeId: nodeId }),
  hoveredNodeId: null,
  setHoveredNode: (nodeId) => set({ hoveredNodeId: nodeId }),
  graphZoom: 1,
  setGraphZoom: (zoom) => set({ graphZoom: zoom }),
}));

// UI Store
export const useUIStore = create<UIStore>((set) => ({
  isLoading: false,
  setIsLoading: (loading) => set({ isLoading: loading }),
  theme: 'dark',
  setTheme: (theme) => set({ theme }),
}));
