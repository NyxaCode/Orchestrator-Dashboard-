import { AgentDTO, AgentStatus, TaskDTO, AdapterEvent } from '../../lib/schemas';

export interface AttachmentMeta {
  name: string;
  size: number;
  type: string;
}

export interface SendMessageInput {
  threadId: string;
  projectId: string;
  targetAgentId: string | null;
  content: string;
  attachments?: AttachmentMeta[];
  clientMessageId?: string;
  mode?: 'default' | 'planning' | 'ask';
  thinkingLevel?: 'off' | 'low' | 'medium' | 'high' | 'extended';
  model?: string;
}

export interface AgentAdapter {
  listAgents(): Promise<AgentDTO[]>;
  getAgentStatus(id: string): Promise<{ id: string; status: AgentStatus }>;
  sendMessage(input: SendMessageInput): AsyncIterable<AdapterEvent>;
  cancel(runId: string): Promise<void>;
  subscribe(onEvent: (e: AdapterEvent) => void): () => void;
}
