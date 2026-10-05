import { create } from 'zustand';

export type SimulationScenario = 'default' | 'stress' | 'fast' | 'chaos';

export interface SystemConfigState {
  gatewayMode: 'mock' | 'hermes_sim' | 'standalone';
  gatewayUrl: string;
  simulatedLatencyMs: number;
  streamingSpeedMs: number;
  chaosErrorRate: number; // 0 to 50 percent
  telemetryVerbosity: 'debug' | 'info' | 'warn' | 'error';
  autoRecoverSeconds: number;
  defaultModel: string;
  activeScenario: SimulationScenario;
  mockTokenRate: number; // tokens/sec
  maxConcurrentRuns: number;

  // Actions
  updateConfig: (partial: Partial<SystemConfigState>) => void;
  applyScenario: (scenario: SimulationScenario) => void;
  resetDefaults: () => void;
}

const defaultValues = {
  gatewayMode: 'mock' as const,
  gatewayUrl: 'http://localhost:8080/v1',
  simulatedLatencyMs: 42,
  streamingSpeedMs: 18,
  chaosErrorRate: 0,
  telemetryVerbosity: 'info' as const,
  autoRecoverSeconds: 3,
  defaultModel: 'claude-3-7-sonnet',
  activeScenario: 'default' as SimulationScenario,
  mockTokenRate: 85,
  maxConcurrentRuns: 4,
};

export const useSystemConfigStore = create<SystemConfigState>((set) => ({
  ...defaultValues,

  updateConfig: (partial) => {
    set((state) => ({ ...state, ...partial }));
  },

  applyScenario: (scenario) => {
    switch (scenario) {
      case 'fast':
        set({
          activeScenario: 'fast',
          simulatedLatencyMs: 12,
          streamingSpeedMs: 6,
          chaosErrorRate: 0,
          mockTokenRate: 150,
          telemetryVerbosity: 'info',
        });
        break;
      case 'stress':
        set({
          activeScenario: 'stress',
          simulatedLatencyMs: 180,
          streamingSpeedMs: 35,
          chaosErrorRate: 15,
          mockTokenRate: 35,
          telemetryVerbosity: 'debug',
          maxConcurrentRuns: 8,
        });
        break;
      case 'chaos':
        set({
          activeScenario: 'chaos',
          simulatedLatencyMs: 120,
          streamingSpeedMs: 25,
          chaosErrorRate: 40,
          telemetryVerbosity: 'warn',
          autoRecoverSeconds: 2,
        });
        break;
      case 'default':
      default:
        set({
          ...defaultValues,
          activeScenario: 'default',
        });
        break;
    }
  },

  resetDefaults: () => {
    set(defaultValues);
  },
}));
