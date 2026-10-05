import { AgentDTO, AgentStatus, AdapterEvent } from '../../lib/schemas';
import { AgentAdapter, SendMessageInput } from './types';

export class NotImplementedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NotImplementedError';
  }
}

/**
 * HermesAdapter (Phase 2 Stub)
 * 
 * Contract Documentation:
 * - Gateway: Communicates with Hermes Agent via 9router gateway.
 * - Endpoints:
 *     POST /v1/chat/completions (Stream with SSE)
 *     GET  /v1/agents (List registered agents and toolsets)
 *     GET  /v1/telemetry/status (Health and heartbeats)
 * - Event Mapping from Hermes SSE to AdapterEvent:
 *     data: {"type": "content_block_delta", "delta": {"text": "..."}} -> message.delta
 *     data: {"type": "tool_use", "name": "delegate_task", "input": {...}} -> delegation.start & task.created
 *     data: {"type": "tool_result", ...} -> delegation.end & task.updated
 *     data: {"type": "agent_status", "agent_id": "...", "status": "..."} -> agent.status
 * 
 * Environment variables required in Phase 2:
 * - HERMES_BASE_URL: string (e.g. "https://hermes.internal.net:8080")
 * - HERMES_TOKEN: string (bearer token for 9router gateway)
 */
export class HermesAdapter implements AgentAdapter {
  private baseUrl: string;
  private token: string;

  constructor() {
    this.baseUrl =
      (typeof process !== 'undefined' && process.env?.HERMES_BASE_URL) ||
      (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_HERMES_BASE_URL) ||
      'http://localhost:8080';
    this.token =
      (typeof process !== 'undefined' && process.env?.HERMES_TOKEN) ||
      (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_HERMES_TOKEN) ||
      '';
  }

  async listAgents(): Promise<AgentDTO[]> {
    throw new NotImplementedError(
      'Phase 2: Hermes Agent connection requires active 9router gateway and valid HERMES_BASE_URL.'
    );
  }

  async getAgentStatus(_id: string): Promise<{ id: string; status: AgentStatus }> {
    throw new NotImplementedError(
      'Phase 2: Hermes Agent status polling not implemented in Phase 1.'
    );
  }

  async *sendMessage(_input: SendMessageInput): AsyncIterable<AdapterEvent> {
    throw new NotImplementedError(
      `Phase 2: Hermes adapter cannot connect to ${this.baseUrl}. Please switch AGENT_ADAPTER=mock.`
    );
  }

  async cancel(_runId: string): Promise<void> {
    // no-op in stub
  }

  subscribe(_onEvent: (e: AdapterEvent) => void): () => void {
    return () => {};
  }
}
