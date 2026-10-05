import { z } from 'zod';

export const AgentStatusSchema = z.enum(['online', 'busy', 'idle', 'offline', 'error']);
export type AgentStatus = z.infer<typeof AgentStatusSchema>;

export const AgentRoleSchema = z.enum(['orchestrator', 'agent']);
export type AgentRole = z.infer<typeof AgentRoleSchema>;

export const AgentSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  role: AgentRoleSchema,
  description: z.string().optional().default(''),
  model_label: z.string().optional().default('via 9router'),
  avatar_url: z.string().optional().nullable(),
  status: AgentStatusSchema.default('online'),
  pos_x: z.number().optional().default(0),
  pos_y: z.number().optional().default(0),
  group_id: z.string().optional().nullable(),
  parent_id: z.string().optional().nullable(),
  layer: z.number().optional().default(1),
  color: z.string().optional(),
  uptime: z.string().optional().default('99.9%'),
  active_tasks_count: z.number().optional().default(0),
  created_at: z.number(),
  // Dynamic Configuration Simulation Fields
  system_prompt: z.string().optional(),
  temperature: z.number().optional(),
  max_tokens: z.number().optional(),
  thinking_level: z.enum(['off', 'low', 'medium', 'high', 'extended']).optional(),
  tools: z.array(z.string()).optional(),
  context_window: z.number().optional(),
});
export type AgentDTO = z.infer<typeof AgentSchema>;

export const SubProjectSchema = z.object({
  id: z.string().min(1),
  project_id: z.string().min(1),
  name: z.string().min(1),
  description: z.string().optional().default(''),
  lead_agent_id: z.string().optional().nullable(),
  tasks_count: z.number().default(0),
  created_at: z.number(),
});
export type SubProjectDTO = z.infer<typeof SubProjectSchema>;

export const ProjectSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  description: z.string().optional().default(''),
  archived: z.number().default(0),
  agent_ids: z.array(z.string()).default([]),
  sub_projects: z.array(SubProjectSchema).optional().default([]),
  active_tasks_count: z.number().default(0),
  created_at: z.number(),
});
export type ProjectDTO = z.infer<typeof ProjectSchema>;

export const KanbanColumnIdSchema = z.enum(['backlog', 'ready', 'in_progress', 'review', 'done']);
export type KanbanColumnId = z.infer<typeof KanbanColumnIdSchema>;

export const KanbanPrioritySchema = z.enum(['low', 'medium', 'high', 'critical']);
export type KanbanPriority = z.infer<typeof KanbanPrioritySchema>;

export const KanbanTaskSchema = z.object({
  id: z.string().min(1),
  project_id: z.string().min(1),
  sub_project_id: z.string().optional().nullable(),
  title: z.string().min(1),
  description: z.string().default(''),
  column_id: KanbanColumnIdSchema.default('backlog'),
  priority: KanbanPrioritySchema.default('medium'),
  assigned_agent_id: z.string().optional().nullable(),
  tags: z.array(z.string()).default([]),
  skills: z.array(z.string()).default([]),
  tools: z.array(z.string()).default([]),
  prompt_context: z.string().default(''),
  output_artifact: z.string().optional().nullable(),
  created_by: z.string().default('operator'),
  created_at: z.number(),
  updated_at: z.number(),
});
export type KanbanTaskDTO = z.infer<typeof KanbanTaskSchema>;

export const MessageRoleSchema = z.enum(['user', 'orchestrator', 'agent', 'system']);
export type MessageRole = z.infer<typeof MessageRoleSchema>;

export const MessageStatusSchema = z.enum(['sending', 'sent', 'failed', 'streaming']);
export type MessageStatus = z.infer<typeof MessageStatusSchema>;

export const TaskStatusSchema = z.enum(['queued', 'running', 'done', 'failed', 'cancelled']);
export type TaskStatus = z.infer<typeof TaskStatusSchema>;

export const TaskSchema = z.object({
  id: z.string().min(1),
  project_id: z.string().min(1),
  from_agent_id: z.string().min(1),
  to_agent_id: z.string().min(1),
  title: z.string().min(1),
  status: TaskStatusSchema,
  result_summary: z.string().optional().nullable(),
  started_at: z.number().optional().nullable(),
  finished_at: z.number().optional().nullable(),
  created_at: z.number(),
});
export type TaskDTO = z.infer<typeof TaskSchema>;

export const MessageMetaSchema = z.object({
  taskId: z.string().optional(),
  taskTitle: z.string().optional(),
  taskStatus: TaskStatusSchema.optional(),
  targetAgentId: z.string().optional(),
  targetAgentIds: z.array(z.string()).optional(),
  attachmentName: z.string().optional(),
  attachmentSize: z.number().optional(),
  attachments: z.array(z.object({
    name: z.string(),
    size: z.number(),
    type: z.string().optional(),
  })).optional(),
  clientMessageId: z.string().optional(),
}).optional();
export type MessageMeta = z.infer<typeof MessageMetaSchema>;

export const MessageSchema = z.object({
  id: z.string().min(1),
  thread_id: z.string().min(1),
  role: MessageRoleSchema,
  agent_id: z.string().optional().nullable(),
  content: z.string(),
  status: MessageStatusSchema.default('sent'),
  meta: MessageMetaSchema,
  created_at: z.number(),
});
export type MessageDTO = z.infer<typeof MessageSchema>;

export const AgentLogSchema = z.object({
  id: z.number().optional(),
  agent_id: z.string().min(1),
  level: z.enum(['info', 'warn', 'error']),
  message: z.string().min(1),
  created_at: z.number(),
});
export type AgentLogDTO = z.infer<typeof AgentLogSchema>;

// Adapter Events
export const AdapterEventSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('agent.status'),
    agentId: z.string(),
    status: AgentStatusSchema,
  }),
  z.object({
    type: z.literal('message.delta'),
    messageId: z.string(),
    agentId: z.string(),
    delta: z.string(),
  }),
  z.object({
    type: z.literal('message.done'),
    messageId: z.string(),
  }),
  z.object({
    type: z.literal('task.created'),
    task: TaskSchema,
  }),
  z.object({
    type: z.literal('task.updated'),
    task: TaskSchema,
  }),
  z.object({
    type: z.literal('delegation.start'),
    taskId: z.string(),
    fromAgentId: z.string(),
    toAgentId: z.string(),
    label: z.string(),
  }),
  z.object({
    type: z.literal('delegation.end'),
    taskId: z.string(),
    fromAgentId: z.string(),
    toAgentId: z.string(),
    label: z.string(),
  }),
  z.object({
    type: z.literal('log'),
    agentId: z.string(),
    level: z.enum(['info', 'warn', 'error']),
    message: z.string(),
    ts: z.number(),
  }),
  z.object({
    type: z.literal('error'),
    code: z.string(),
    message: z.string(),
  }),
]);
export type AdapterEvent = z.infer<typeof AdapterEventSchema>;
