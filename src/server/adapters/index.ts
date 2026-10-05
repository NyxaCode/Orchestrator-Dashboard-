import { AgentAdapter } from './types';
import { MockAdapter } from './mock';
import { HermesAdapter } from './hermes';

let adapterInstance: AgentAdapter | null = null;
let currentAdapterType: 'mock' | 'hermes' = 'mock';

export function getAdapter(forceType?: 'mock' | 'hermes'): AgentAdapter {
  const envType = (
    (typeof process !== 'undefined' && process.env?.AGENT_ADAPTER === 'hermes') ||
    (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_AGENT_ADAPTER === 'hermes')
  ) ? 'hermes' : 'mock';
  const type = forceType || envType;

  if (!adapterInstance || currentAdapterType !== type) {
    currentAdapterType = type;
    if (type === 'hermes') {
      adapterInstance = new HermesAdapter();
    } else {
      adapterInstance = new MockAdapter();
    }
  }

  return adapterInstance;
}

export function getCurrentAdapterType(): 'mock' | 'hermes' {
  return currentAdapterType;
}

export * from './types';
export * from './mock';
export * from './hermes';
