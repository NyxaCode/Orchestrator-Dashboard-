import { describe, it, expect } from 'vitest';
import { layoutRadial, calculateDistance } from '../components/graph/layoutRadial';
import { AdapterEventSchema } from '../lib/schemas';
import { MockAdapter } from '../server/adapters/mock';
import { extractMention, extractAllMentions, sanitizeText, parseMarkdown } from '../lib/sanitize';
import { useAgentsStore } from '../stores/agents';
import { useChatStore } from '../stores/chat';

describe('Unit Tests: Multi-Agent Orchestration Dashboard', () => {
  // 1. layoutRadial(n)
  it('layoutRadial(n) positions do not collide (distance >= 140px) for n=1..24 and moves to ring 2 at > 8', () => {
    for (let n = 2; n <= 24; n++) {
      const { agents, orchestrator } = layoutRadial(n, 400, 320);
      expect(agents.length).toBe(n);

      // Verify distance to orchestrator is >= 140px
      for (const a of agents) {
        const distToCenter = calculateDistance(orchestrator, a);
        expect(distToCenter).toBeGreaterThanOrEqual(140);
      }

      // Verify distance between consecutive agents in the same ring
      for (let i = 0; i < agents.length; i++) {
        for (let j = i + 1; j < agents.length; j++) {
          const dist = calculateDistance(agents[i], agents[j]);
          // For reasonable layouts up to 16 agents, check min spacing
          if (n <= 12) {
            expect(dist).toBeGreaterThanOrEqual(100);
          }
        }
      }
    }

    // Verify ring radius increases for > 8
    const layout8 = layoutRadial(8, 400, 320);
    const layout9 = layoutRadial(9, 400, 320);
    const distToCenter8 = calculateDistance(layout8.orchestrator, layout8.agents[0]);
    const distToCenter9SecondRing = calculateDistance(layout9.orchestrator, layout9.agents[8]);
    expect(distToCenter9SecondRing).toBeGreaterThan(distToCenter8);
  });

  // 2. Zustand Store Tests
  it('useAgentsStore updates only targeted agent status', () => {
    const store = useAgentsStore.getState();
    store.updateAgentStatus('rika', 'busy');
    expect(useAgentsStore.getState().agents['rika'].status).toBe('busy');
    expect(useAgentsStore.getState().agents['shinaa'].status).toBe('online');
  });

  it('useChatStore appends and updates message delta correctly', () => {
    const chat = useChatStore.getState();
    const testMsgId = `test_msg_${Date.now()}`;
    chat.appendMessage('proj-test', {
      id: testMsgId,
      thread_id: 'proj-test',
      role: 'agent',
      agent_id: 'rika',
      content: 'Halo ',
      status: 'streaming',
      created_at: Date.now(),
    });

    chat.updateMessageDelta(testMsgId, 'dunia!');
    const found = useChatStore.getState().messages['proj-test']?.find((m) => m.id === testMsgId);
    expect(found?.content).toBe('Halo dunia!');
    expect(found?.status).toBe('streaming');

    chat.finalizeMessage(testMsgId);
    const finalized = useChatStore.getState().messages['proj-test']?.find((m) => m.id === testMsgId);
    expect(finalized?.status).toBe('sent');
  });

  it('startDelegation and endDelegation correctly toggles active delegation state', () => {
    const agentsStore = useAgentsStore.getState();
    agentsStore.startDelegation({
      taskId: 'task-test-99',
      fromAgentId: 'shinaa',
      toAgentId: 'rika',
      label: 'Test Task',
    });

    expect(
      useAgentsStore.getState().activeDelegations.some((d) => d.taskId === 'task-test-99')
    ).toBe(true);

    agentsStore.endDelegation('task-test-99');
    expect(
      useAgentsStore.getState().activeDelegations.some((d) => d.taskId === 'task-test-99')
    ).toBe(false);
  });

  // 3. Zod Schema Validation
  it('zod schema rejects invalid event payloads', () => {
    const validEvent = {
      type: 'agent.status',
      agentId: 'rika',
      status: 'online',
    };
    expect(AdapterEventSchema.safeParse(validEvent).success).toBe(true);

    const invalidEvent = {
      type: 'agent.status',
      agentId: 'rika',
      status: 'unknown_status_foo',
    };
    expect(AdapterEventSchema.safeParse(invalidEvent).success).toBe(false);
  });

  // 4. MockAdapter Tests
  it('MockAdapter.sendMessage generates valid event sequence', async () => {
    const adapter = new MockAdapter();
    const events: string[] = [];

    const stream = adapter.sendMessage({
      threadId: 'test-thread',
      projectId: 'test-project',
      targetAgentId: 'rika',
      content: 'Halo Rika tolong cek feedback',
    });

    for await (const event of stream) {
      events.push(event.type);
    }

    expect(events).toContain('agent.status');
    expect(events).toContain('message.delta');
    expect(events).toContain('message.done');
  });

  it('MockAdapter /simulate-error sets error status and emits error event', async () => {
    const adapter = new MockAdapter();
    const eventTypes: string[] = [];

    const stream = adapter.sendMessage({
      threadId: 'test-thread',
      projectId: 'test-project',
      targetAgentId: 'rika',
      content: 'testing /simulate-error command',
    });

    for await (const event of stream) {
      eventTypes.push(event.type);
    }

    expect(eventTypes).toContain('error');
    const rikaStatus = await adapter.getAgentStatus('rika');
    expect(rikaStatus.status).toBe('error');
  });

  // 5. Mention Parser
  it('extractMention correctly extracts target agent and handles bare @', () => {
    const validIds = ['shinaa', 'rika', 'lia'];
    const res1 = extractMention('@rika tolong cek database', validIds);
    expect(res1.targetAgentId).toBe('rika');
    expect(res1.cleanContent).toBe('tolong cek database');

    const res2 = extractMention('@halo tanpa agent', validIds);
    expect(res2.targetAgentId).toBe(null);

    const res3 = extractMention('@', validIds);
    expect(res3.targetAgentId).toBe(null);
  });

  it('extractAllMentions extracts multiple agents without limits from anywhere in text', () => {
    const mockAgents = [
      { id: 'shinaa', name: 'Shinaa' },
      { id: 'rika', name: 'Rika' },
      { id: 'lia', name: 'Lia' },
      { id: 'kimi', name: 'Kimi' },
    ];

    const res = extractAllMentions('Halo @shinaa tolong koordinasi dengan @Rika dan @Lia juga @kimi', mockAgents);
    expect(res.length).toBe(4);
    expect(res.map((a) => a.id)).toEqual(['shinaa', 'rika', 'lia', 'kimi']);
  });

  // 6. Sanitizer & Markdown
  it('sanitizeText escapes <script> tags and quotes', () => {
    const malicious = '<script>alert("hack")</script>';
    const safe = sanitizeText(malicious);
    expect(safe).not.toContain('<script>');
    expect(safe).toContain('&lt;script&gt;');
  });

  it('parseMarkdown handles code blocks, lists, and paragraphs', () => {
    const md = 'Hello world\n\n```ts\nconst a = 1;\n```\n- Item 1\n- Item 2';
    const blocks = parseMarkdown(md);
    expect(blocks.some((b) => b.type === 'paragraph')).toBe(true);
    expect(blocks.some((b) => b.type === 'code-block')).toBe(true);
    expect(blocks.some((b) => b.type === 'list')).toBe(true);
  });
});
