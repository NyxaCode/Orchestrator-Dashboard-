import { AgentDTO, AgentStatus, AdapterEvent, TaskDTO } from '../../lib/schemas';
import { AgentAdapter, SendMessageInput } from './types';

export const INITIAL_MOCK_AGENTS: AgentDTO[] = [
  {
    id: 'shinaa',
    name: 'Shinaa',
    role: 'orchestrator',
    description: 'Dev Lead & Task Orchestrator. Mengkoordinasikan pipeline delegasi multi-agent.',
    model_label: 'claude-3-7-sonnet',
    avatar_url: null,
    status: 'online',
    pos_x: 400,
    pos_y: 330,
    group_id: 'core-team',
    parent_id: null,
    layer: 0,
    color: '#ef4444',
    uptime: '99.98%',
    active_tasks_count: 0,
    created_at: Date.now() - 86400000 * 7,
  },
  {
    id: 'rika',
    name: 'Rika',
    role: 'agent',
    description: 'Sub-agent spesialis Customer Support, komunitas & konten hamster.',
    model_label: 'gpt-4o-mini',
    avatar_url: null,
    status: 'online',
    pos_x: 230,
    pos_y: 195,
    group_id: 'support-cluster',
    parent_id: 'shinaa',
    layer: 1,
    color: '#f59e0b',
    uptime: '99.85%',
    active_tasks_count: 0,
    created_at: Date.now() - 86400000 * 5,
  },
  {
    id: 'lia',
    name: 'Lia',
    role: 'agent',
    description: 'Sub-agent spesialis riset audio, komposisi musik & analisis data.',
    model_label: 'deepseek-chat',
    avatar_url: null,
    status: 'online',
    pos_x: 570,
    pos_y: 195,
    group_id: 'audio-cluster',
    parent_id: 'shinaa',
    layer: 1,
    color: '#818cf8',
    uptime: '99.91%',
    active_tasks_count: 0,
    created_at: Date.now() - 86400000 * 3,
  },
  {
    id: 'momo',
    name: 'Momo',
    role: 'agent',
    description: 'Sub-agent kurasi konten & hamster community feed. Melapor ke Rika.',
    model_label: 'gemini-2.0-flash',
    avatar_url: null,
    status: 'online',
    pos_x: 130,
    pos_y: 75,
    group_id: 'support-cluster',
    parent_id: 'rika',
    layer: 2,
    color: '#fb923c',
    uptime: '99.70%',
    active_tasks_count: 0,
    created_at: Date.now() - 86400000 * 2,
  },
  {
    id: 'cody',
    name: 'Cody',
    role: 'agent',
    description: 'Sub-agent auto-responder FAQ & resolusi tiket user. Melapor ke Rika.',
    model_label: 'gpt-4o-mini',
    avatar_url: null,
    status: 'online',
    pos_x: 275,
    pos_y: 65,
    group_id: 'support-cluster',
    parent_id: 'rika',
    layer: 2,
    color: '#facc15',
    uptime: '99.80%',
    active_tasks_count: 0,
    created_at: Date.now() - 86400000 * 2,
  },
  {
    id: 'aria',
    name: 'Aria',
    role: 'agent',
    description: 'Sub-agent modul sintesis vokal & DSP waveform suara. Melapor ke Lia.',
    model_label: 'claude-3-5-haiku',
    avatar_url: null,
    status: 'online',
    pos_x: 525,
    pos_y: 65,
    group_id: 'audio-cluster',
    parent_id: 'lia',
    layer: 2,
    color: '#c084fc',
    uptime: '99.95%',
    active_tasks_count: 0,
    created_at: Date.now() - 86400000 * 2,
  },
  {
    id: 'sonix',
    name: 'Sonix',
    role: 'agent',
    description: 'Sub-agent FFT spectrogram analyzer & komposisi nada. Melapor ke Lia.',
    model_label: 'deepseek-chat',
    avatar_url: null,
    status: 'online',
    pos_x: 670,
    pos_y: 75,
    group_id: 'audio-cluster',
    parent_id: 'lia',
    layer: 2,
    color: '#38bdf8',
    uptime: '99.88%',
    active_tasks_count: 0,
    created_at: Date.now() - 86400000 * 2,
  },
];

export class MockAdapter implements AgentAdapter {
  private agents: Map<string, AgentDTO> = new Map();
  private subscribers: Set<(event: AdapterEvent) => void> = new Set();
  private activeRuns: Set<string> = new Set();
  private taskCounter = 100;

  constructor() {
    INITIAL_MOCK_AGENTS.forEach((agent) => {
      this.agents.set(agent.id, { ...agent });
    });
  }

  async listAgents(): Promise<AgentDTO[]> {
    return Array.from(this.agents.values());
  }

  async getAgentStatus(id: string): Promise<{ id: string; status: AgentStatus }> {
    const agent = this.agents.get(id);
    return { id, status: agent ? agent.status : 'offline' };
  }

  addMockAgent(agent: AgentDTO): void {
    this.agents.set(agent.id, agent);
    this.broadcast({
      type: 'agent.status',
      agentId: agent.id,
      status: agent.status,
    });
    this.broadcast({
      type: 'log',
      agentId: agent.id,
      level: 'info',
      message: `Agent ${agent.name} terhubung ke node orchestrator via 9router`,
      ts: Date.now(),
    });
  }

  updateAgentPosition(id: string, x: number, y: number): void {
    const agent = this.agents.get(id);
    if (agent) {
      agent.pos_x = x;
      agent.pos_y = y;
    }
  }

  subscribe(onEvent: (e: AdapterEvent) => void): () => void {
    this.subscribers.add(onEvent);
    return () => {
      this.subscribers.delete(onEvent);
    };
  }

  private broadcast(event: AdapterEvent): void {
    this.subscribers.forEach((cb) => {
      try {
        cb(event);
      } catch (err) {
        console.error('Error in subscriber callback:', err);
      }
    });
  }

  async cancel(runId: string): Promise<void> {
    this.activeRuns.delete(runId);
  }

  async *sendMessage(input: SendMessageInput): AsyncIterable<AdapterEvent> {
    const runId = `run_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    this.activeRuns.add(runId);

    const messageId = `msg_${Date.now()}`;
    const target = input.targetAgentId ? this.agents.get(input.targetAgentId) : null;
    const isOrchestrator = !target || target.role === 'orchestrator';
    const answeringAgent = isOrchestrator ? this.agents.get('shinaa')! : target!;

    // Case 1: Error Simulation trigger
    if (input.content.includes('/simulate-error')) {
      const errTarget = target || this.agents.get('rika') || this.agents.get('shinaa')!;
      errTarget.status = 'error';
      
      const errStatusEvent: AdapterEvent = {
        type: 'agent.status',
        agentId: errTarget.id,
        status: 'error',
      };
      this.broadcast(errStatusEvent);
      yield errStatusEvent;

      const logEvent: AdapterEvent = {
        type: 'log',
        agentId: errTarget.id,
        level: 'error',
        message: `[ERROR] Kernel timeout pada 9router gateway. Node ${errTarget.name} gagal merespons heartbeat.`,
        ts: Date.now(),
      };
      this.broadcast(logEvent);
      yield logEvent;

      const errorEvent: AdapterEvent = {
        type: 'error',
        code: 'SIMULATED_FAILURE',
        message: `Agent ${errTarget.name} mengalami gangguan koneksi. Mencoba auto-recover...`,
      };
      this.broadcast(errorEvent);
      yield errorEvent;

      // Stream error message
      const errMsg = `⚠️ **Peringatan Sistem**: Simulasi kegagalan berhasil dipicu untuk agent **${errTarget.name}**. Status beralih ke \`error\` (▲ Error). Sistem auto-heal akan memulihkan koneksi dalam 3 detik.`;
      for (const char of errMsg.split(' ')) {
        if (!this.activeRuns.has(runId)) break;
        yield {
          type: 'message.delta',
          messageId,
          agentId: answeringAgent.id,
          delta: char + ' ',
        };
        await new Promise((r) => setTimeout(r, 20));
      }
      yield { type: 'message.done', messageId };

      // Recovery after 3s
      setTimeout(() => {
        errTarget.status = 'online';
        const recoverEvent: AdapterEvent = {
          type: 'agent.status',
          agentId: errTarget.id,
          status: 'online',
        };
        this.broadcast(recoverEvent);
        this.broadcast({
          type: 'log',
          agentId: errTarget.id,
          level: 'info',
          message: `Auto-recover sukses: Saluran telemetry ${errTarget.name} kembali online via 9router.`,
          ts: Date.now(),
        });
      }, 3000);

      this.activeRuns.delete(runId);
      return;
    }

    // Case 1.5: Hermes Slash Commands Handling
    const trimmedInput = input.content.trim();
    if (trimmedInput.startsWith('/')) {
      const parts = trimmedInput.split(/\s+/);
      const cmd = parts[0].toLowerCase();
      const arg = parts.slice(1).join(' ');

      let hermesReply = '';
      if (cmd === '/help') {
        hermesReply = `### ⚚ Hermes Agent CLI Reference\n\n| Command | Description | Syntax |\n| :--- | :--- | :--- |\n| \`/mode\` | Ganti mode eksekusi Hermes | \`/mode <default|planning|ask>\` |\n| \`/thinking\` | Atur tingkat penalaran | \`/thinking <off|low|medium|high|extended>\` |\n| \`/model\` | Ganti model AI | \`/model <model_id>\` |\n| \`/agent\` | Alihkan langsung ke agen | \`/agent <shinaa|rika|lia|...>\` |\n| \`/status\` | Telemetri runtime sistem | \`/status\` |\n| \`/plan\` | Dekomposisi langkah rencana | \`/plan <task>\` |\n| \`/ask\` | Mode konsultasi sebelum aksi | \`/ask <query>\` |\n| \`/voice\` | Nyalakan/matikan suara | \`/voice\` |\n| \`/clear\` | Reset riwayat percakapan | \`/clear\` |\n\n**Konfigurasi Aktif:**\n- Mode: \`${input.mode || 'default'}\`\n- Model: \`${input.model || 'claude-opus-4.6'}\`\n- Thinking Level: \`${input.thinkingLevel || 'medium'}\``;
      } else if (cmd === '/status') {
        hermesReply = `### ⚚ Hermes Runtime Status\n\n- **Node Aktif**: \`${answeringAgent.name}\` (${answeringAgent.role})\n- **Model**: \`${input.model || 'claude-opus-4.6'}\`\n- **Mode**: \`${input.mode || 'default'}\`\n- **Thinking Level**: \`${input.thinkingLevel || 'medium'}\`\n- **Gateway**: \`9router Model Bridge (Tailscale Mesh)\`\n- **Latency**: \`42ms\` · Status: \`● ready\`\n- **Context Allocation**: \`0/1m tokens (0% used)\``;
      } else if (cmd === '/mode') {
        hermesReply = `Mode Hermes beralih ke: **${arg || input.mode || 'default'}**.\nFormat respons dan penalaran akan disesuaikan dengan mode ini.`;
      } else if (cmd === '/thinking') {
        hermesReply = `Thinking level diperbarui ke: **${arg || input.thinkingLevel || 'medium'}**.\nAlokasi token reasoning internal diatur secara optimal.`;
      } else if (cmd === '/model') {
        hermesReply = `Model AI aktif beralih ke: **${arg || input.model || 'claude-opus-4.6'}** via gateway 9router.`;
      } else if (cmd === '/agent') {
        hermesReply = `Target agen dialihkan ke: **${arg || 'Shinaa (Lead)'}**.`;
      } else if (cmd === '/voice') {
        hermesReply = `Mode suara Hermes telah dialihkan. Status terbaru tampil di status bar atas.`;
      } else if (cmd === '/plan') {
        hermesReply = `### 📋 Hermes Plan: ${arg || 'Dekomposisi Tugas Multi-Agent'}\n\n> Mode: **Planning** · Thinking: **${input.thinkingLevel || 'medium'}**\n\n#### Phase 1: Analisis Masalah & Dependensi\n1. Mengidentifikasi kebutuhan data dan batas komputasi.\n2. Memeriksa ketersediaan sub-agent penanggung jawab.\n\n#### Phase 2: Distribusi Pekerjaan Terkoordinasi\n1. Pendelegasian modul spesifik ke agent terkait.\n2. Monitoring throughput pesan dan validitas hasil.\n\n#### Phase 3: Rekonsiliasi & Pelaporan\n1. Mengompilasi output menjadi satu ringkasan utuh.\n2. Finalisasi respon untuk pengguna.`;
      } else if (cmd === '/ask') {
        hermesReply = `### ❓ Hermes Ask Mode: ${arg || 'Permintaan Klarifikasi'}\n\nSebelum instruksi ini dieksekusi, mohon konfirmasi:\n1. Apakah task ini perlu didelegasikan ke sub-agent khusus atau dijalankan langsung?\n2. Apakah hasil perlu dicatat ke log audit sistem?\n\n*Ketik konfirmasi Anda untuk memulai.*`;
      }

      if (hermesReply) {
        for (const word of hermesReply.split(' ')) {
          if (!this.activeRuns.has(runId)) break;
          yield {
            type: 'message.delta',
            messageId,
            agentId: answeringAgent.id,
            delta: word + ' ',
          };
          await new Promise((r) => setTimeout(r, 15));
        }
        yield { type: 'message.done', messageId };
        this.activeRuns.delete(runId);
        return;
      }
    }

    // Case 2: Direct message to Sub-Agent
    if (!isOrchestrator) {
      target.status = 'busy';
      this.broadcast({ type: 'agent.status', agentId: target.id, status: 'busy' });
      yield { type: 'agent.status', agentId: target.id, status: 'busy' };

      this.broadcast({
        type: 'log',
        agentId: target.id,
        level: 'info',
        message: `Menerima pesan langsung: "${input.content.slice(0, 40)}..."`,
        ts: Date.now(),
      });

      // Brief thinking delay
      await new Promise((r) => setTimeout(r, 400));

      let replyContent = '';
      if (target.id === 'rika') {
        const lower = input.content.toLowerCase();
        if (lower.includes('momo') || lower.includes('konten')) {
          const sub = this.agents.get('momo');
          if (sub) {
            const taskId = `task_${++this.taskCounter}`;
            const taskTitle = 'Kurasi & publish feed hamster';
            this.broadcast({ type: 'delegation.start', taskId, fromAgentId: 'rika', toAgentId: 'momo', label: taskTitle });
            yield { type: 'delegation.start', taskId, fromAgentId: 'rika', toAgentId: 'momo', label: taskTitle };
            sub.status = 'busy';
            this.broadcast({ type: 'agent.status', agentId: 'momo', status: 'busy' });
            yield { type: 'agent.status', agentId: 'momo', status: 'busy' };
            await new Promise((r) => setTimeout(r, 800));
            this.broadcast({ type: 'delegation.end', taskId, fromAgentId: 'rika', toAgentId: 'momo', label: taskTitle });
            yield { type: 'delegation.end', taskId, fromAgentId: 'rika', toAgentId: 'momo', label: taskTitle };
            sub.status = 'online';
            this.broadcast({ type: 'agent.status', agentId: 'momo', status: 'online' });
            yield { type: 'agent.status', agentId: 'momo', status: 'online' };
          }
          replyContent = `Halo! **Rika** di sini. Aku telah mendelegasikan tugas ke **Momo** (sub-agent konten hamster). Momo telah mengkurasi feed dan memverifikasi interaksi komunitas. Status beres!`;
        } else if (lower.includes('lia')) {
          const peer = this.agents.get('lia');
          if (peer) {
            const taskId = `task_${++this.taskCounter}`;
            const taskTitle = 'Sinkronisasi L1 Peer: CS ➔ Audio';
            this.broadcast({ type: 'delegation.start', taskId, fromAgentId: 'rika', toAgentId: 'lia', label: taskTitle });
            yield { type: 'delegation.start', taskId, fromAgentId: 'rika', toAgentId: 'lia', label: taskTitle };
            peer.status = 'busy';
            this.broadcast({ type: 'agent.status', agentId: 'lia', status: 'busy' });
            yield { type: 'agent.status', agentId: 'lia', status: 'busy' };
            await new Promise((r) => setTimeout(r, 900));
            this.broadcast({ type: 'delegation.end', taskId, fromAgentId: 'rika', toAgentId: 'lia', label: taskTitle });
            yield { type: 'delegation.end', taskId, fromAgentId: 'rika', toAgentId: 'lia', label: taskTitle };
            peer.status = 'online';
            this.broadcast({ type: 'agent.status', agentId: 'lia', status: 'online' });
            yield { type: 'agent.status', agentId: 'lia', status: 'online' };
          }
          replyContent = `Halo! **Rika** di sini. Aku telah berkoordinasi langsung dengan **Lia** melalui saluran Secondary Peer L1. Feedback customer terkait kualitas audio podcast hamster sudah terkirim ke Lia.`;
        } else {
          replyContent = `Halo! **Rika** di sini. Terkait instruksi kamu: "${input.content}", data hamster & template customer support sudah aku verifikasi. Semua metrik kepuasan komunitas stabil di 98.4%. Ada yang mau ditambahkan?`;
        }
      } else if (target.id === 'lia') {
        const lower = input.content.toLowerCase();
        if (lower.includes('aria') || lower.includes('vokal') || lower.includes('synth')) {
          const sub = this.agents.get('aria');
          if (sub) {
            const taskId = `task_${++this.taskCounter}`;
            const taskTitle = 'Sintesis DSP Vokal & Formant';
            this.broadcast({ type: 'delegation.start', taskId, fromAgentId: 'lia', toAgentId: 'aria', label: taskTitle });
            yield { type: 'delegation.start', taskId, fromAgentId: 'lia', toAgentId: 'aria', label: taskTitle };
            sub.status = 'busy';
            this.broadcast({ type: 'agent.status', agentId: 'aria', status: 'busy' });
            yield { type: 'agent.status', agentId: 'aria', status: 'busy' };
            await new Promise((r) => setTimeout(r, 800));
            this.broadcast({ type: 'delegation.end', taskId, fromAgentId: 'lia', toAgentId: 'aria', label: taskTitle });
            yield { type: 'delegation.end', taskId, fromAgentId: 'lia', toAgentId: 'aria', label: taskTitle };
            sub.status = 'online';
            this.broadcast({ type: 'agent.status', agentId: 'aria', status: 'online' });
            yield { type: 'agent.status', agentId: 'aria', status: 'online' };
          }
          replyContent = `Salam! **Lia** di sini. Tugas sintesis DSP sudah didelegasikan ke **Aria**. Filter formulan nada dan gelombang vokal telah dikalibrasi sempurna.`;
        } else if (lower.includes('rika')) {
          const peer = this.agents.get('rika');
          if (peer) {
            const taskId = `task_${++this.taskCounter}`;
            const taskTitle = 'Sinkronisasi L1 Peer: Audio ➔ CS';
            this.broadcast({ type: 'delegation.start', taskId, fromAgentId: 'lia', toAgentId: 'rika', label: taskTitle });
            yield { type: 'delegation.start', taskId, fromAgentId: 'lia', toAgentId: 'rika', label: taskTitle };
            peer.status = 'busy';
            this.broadcast({ type: 'agent.status', agentId: 'rika', status: 'busy' });
            yield { type: 'agent.status', agentId: 'rika', status: 'busy' };
            await new Promise((r) => setTimeout(r, 900));
            this.broadcast({ type: 'delegation.end', taskId, fromAgentId: 'lia', toAgentId: 'rika', label: taskTitle });
            yield { type: 'delegation.end', taskId, fromAgentId: 'lia', toAgentId: 'rika', label: taskTitle };
            peer.status = 'online';
            this.broadcast({ type: 'agent.status', agentId: 'rika', status: 'online' });
            yield { type: 'agent.status', agentId: 'rika', status: 'online' };
          }
          replyContent = `Salam! **Lia** di sini. Aku sudah menghubungkan saluran Secondary Peer L1 ke **Rika** untuk menyinkronkan data audio dengan tim support.`;
        } else {
          replyContent = `Salam! **Lia** mendengarkan. Untuk riset "${input.content}", aku sudah mengekstrak pola harmoni audio dan referensi akustik. Sampel spektrum siap diintegrasikan ke pipeline.`;
        }
      } else {
        replyContent = `Halo! Saya **${target.name}**. Saya telah memproses permintaan: "${input.content}". Eksekusi tugas lokal selesai tanpa kendala.`;
      }

      const words = replyContent.split(' ');
      for (const word of words) {
        if (!this.activeRuns.has(runId)) break;
        yield {
          type: 'message.delta',
          messageId,
          agentId: target.id,
          delta: word + ' ',
        };
        await new Promise((r) => setTimeout(r, 25));
      }

      yield { type: 'message.done', messageId };

      target.status = 'online';
      this.broadcast({ type: 'agent.status', agentId: target.id, status: 'online' });
      yield { type: 'agent.status', agentId: target.id, status: 'online' };

      this.activeRuns.delete(runId);
      return;
    }

    // Case 3: Message to Orchestrator (Shinaa) with real delegation workflow
    answeringAgent.status = 'busy';
    this.broadcast({ type: 'agent.status', agentId: 'shinaa', status: 'busy' });
    yield { type: 'agent.status', agentId: 'shinaa', status: 'busy' };

    // Orchestrator thinking delay
    await new Promise((r) => setTimeout(r, 500));

    const contentLower = input.content.toLowerCase();
    // Check if peer communication between L1 agents is requested
    const isPeerSync = contentLower.includes('peer') || (contentLower.includes('rika') && contentLower.includes('lia'));

    if (isPeerSync && this.agents.has('rika') && this.agents.has('lia')) {
      const rika = this.agents.get('rika')!;
      const lia = this.agents.get('lia')!;
      const taskId1 = `task_${++this.taskCounter}`;
      const taskId2 = `task_${++this.taskCounter}`;

      // 1. Shinaa announces plan
      const plan = `Menginisiasi protokol: Mengaktifkan jalur **Secondary Graph (L1 Peer)** agar **Rika** dan **Lia** dapat bertukar data secara langsung tanpa perantara.\n\n`;
      for (const chunk of plan.split(' ')) {
        if (!this.activeRuns.has(runId)) break;
        yield { type: 'message.delta', messageId, agentId: 'shinaa', delta: chunk + ' ' };
        await new Promise((r) => setTimeout(r, 20));
      }

      // 2. Primary delegation to Rika
      this.broadcast({ type: 'delegation.start', taskId: taskId1, fromAgentId: 'shinaa', toAgentId: 'rika', label: 'Inisiasi L1 Peer' });
      yield { type: 'delegation.start', taskId: taskId1, fromAgentId: 'shinaa', toAgentId: 'rika', label: 'Inisiasi L1 Peer' };
      rika.status = 'busy';
      this.broadcast({ type: 'agent.status', agentId: 'rika', status: 'busy' });
      yield { type: 'agent.status', agentId: 'rika', status: 'busy' };
      await new Promise((r) => setTimeout(r, 400));
      this.broadcast({ type: 'delegation.end', taskId: taskId1, fromAgentId: 'shinaa', toAgentId: 'rika', label: 'Inisiasi L1 Peer' });
      yield { type: 'delegation.end', taskId: taskId1, fromAgentId: 'shinaa', toAgentId: 'rika', label: 'Inisiasi L1 Peer' };

      // 3. Secondary Peer delegation: Rika -> Lia
      this.broadcast({ type: 'delegation.start', taskId: taskId2, fromAgentId: 'rika', toAgentId: 'lia', label: 'L1 Peer: CS ➔ Audio Lab' });
      yield { type: 'delegation.start', taskId: taskId2, fromAgentId: 'rika', toAgentId: 'lia', label: 'L1 Peer: CS ➔ Audio Lab' };
      lia.status = 'busy';
      this.broadcast({ type: 'agent.status', agentId: 'lia', status: 'busy' });
      yield { type: 'agent.status', agentId: 'lia', status: 'busy' };

      await new Promise((r) => setTimeout(r, 1200));

      this.broadcast({ type: 'delegation.end', taskId: taskId2, fromAgentId: 'rika', toAgentId: 'lia', label: 'L1 Peer: CS ➔ Audio Lab' });
      yield { type: 'delegation.end', taskId: taskId2, fromAgentId: 'rika', toAgentId: 'lia', label: 'L1 Peer: CS ➔ Audio Lab' };
      rika.status = 'online';
      lia.status = 'online';
      this.broadcast({ type: 'agent.status', agentId: 'rika', status: 'online' });
      this.broadcast({ type: 'agent.status', agentId: 'lia', status: 'online' });
      yield { type: 'agent.status', agentId: 'rika', status: 'online' };
      yield { type: 'agent.status', agentId: 'lia', status: 'online' };

      const conclusion = `Sinkronisasi peer **L1 Inter-Agent (Rika ➔ Lia)** berhasil dilakukan.\n- Protokol: Saluran sekunder aktif.\n- Status: Sukses terhubung tanpa kendala isolasi.\nAda task lain yang ingin dikoordinasikan?`;
      for (const chunk of conclusion.split(' ')) {
        if (!this.activeRuns.has(runId)) break;
        yield { type: 'message.delta', messageId, agentId: 'shinaa', delta: chunk + ' ' };
        await new Promise((r) => setTimeout(r, 20));
      }
      yield { type: 'message.done', messageId };
      answeringAgent.status = 'online';
      this.broadcast({ type: 'agent.status', agentId: 'shinaa', status: 'online' });
      yield { type: 'agent.status', agentId: 'shinaa', status: 'online' };
      this.activeRuns.delete(runId);
      return;
    }

    const delegateToRika = contentLower.includes('rika') || contentLower.includes('hamster') || contentLower.includes('cs') || contentLower.includes('konten') || contentLower.includes('user') || !contentLower.includes('lia');
    const delegateToLia = contentLower.includes('lia') || contentLower.includes('musik') || contentLower.includes('riset') || contentLower.includes('audio') || contentLower.includes('analisis');

    const delegatedAgents: AgentDTO[] = [];
    if (delegateToRika && this.agents.has('rika')) delegatedAgents.push(this.agents.get('rika')!);
    if (delegateToLia && this.agents.has('lia') && delegatedAgents.length === 0) delegatedAgents.push(this.agents.get('lia')!);
    if (delegatedAgents.length === 0 && this.agents.size > 1) {
      const candidates = Array.from(this.agents.values()).filter((a) => a.id !== 'shinaa');
      if (candidates.length > 0) delegatedAgents.push(candidates[0]);
    }

    const assignedAgent = delegatedAgents[0];
    const taskId = `task_${++this.taskCounter}`;
    const taskTitle = assignedAgent.id === 'rika'
      ? `Audit interaksi CS & kurasi feed hamster`
      : assignedAgent.id === 'lia'
      ? `Sintesis parameter audio & laporan riset`
      : `Eksekusi sub-task untuk ${assignedAgent.name}`;

    // 1. Orchestrator announces plan
    const intro = `Siap, aku sudah menerima instruksi: "${input.content}". Aku delegasikan task ke **${assignedAgent.name}** untuk validasi mendalam.\n\n`;
    for (const chunk of intro.split(' ')) {
      if (!this.activeRuns.has(runId)) break;
      yield {
        type: 'message.delta',
        messageId,
        agentId: 'shinaa',
        delta: chunk + ' ',
      };
      await new Promise((r) => setTimeout(r, 20));
    }

    // 2. Delegation start
    const delegationStartEvent: AdapterEvent = {
      type: 'delegation.start',
      taskId,
      fromAgentId: 'shinaa',
      toAgentId: assignedAgent.id,
      label: taskTitle,
    };
    this.broadcast(delegationStartEvent);
    yield delegationStartEvent;

    const taskDto: TaskDTO = {
      id: taskId,
      project_id: input.projectId,
      from_agent_id: 'shinaa',
      to_agent_id: assignedAgent.id,
      title: taskTitle,
      status: 'running',
      started_at: Date.now(),
      created_at: Date.now(),
    };

    const taskCreatedEvent: AdapterEvent = {
      type: 'task.created',
      task: taskDto,
    };
    this.broadcast(taskCreatedEvent);
    yield taskCreatedEvent;

    // Sub-agent becomes busy
    assignedAgent.status = 'busy';
    assignedAgent.active_tasks_count = (assignedAgent.active_tasks_count || 0) + 1;
    this.broadcast({ type: 'agent.status', agentId: assignedAgent.id, status: 'busy' });
    yield { type: 'agent.status', agentId: assignedAgent.id, status: 'busy' };

    this.broadcast({
      type: 'log',
      agentId: assignedAgent.id,
      level: 'info',
      message: `[DELEGASI DITERIMA] Memulai task: "${taskTitle}"`,
      ts: Date.now(),
    });

    // Sub-agent processing simulation
    await new Promise((r) => setTimeout(r, 1200));

    this.broadcast({
      type: 'log',
      agentId: assignedAgent.id,
      level: 'info',
      message: `[SELESAI] Hasil validasi berhasil dikirim kembali ke Shinaa (Orchestrator).`,
      ts: Date.now(),
    });

    // 3. Task completed & delegation end
    const finishedTaskDto: TaskDTO = {
      ...taskDto,
      status: 'done',
      finished_at: Date.now(),
      result_summary: `Validasi berhasil diselesaikan oleh ${assignedAgent.name} (latency 1.2s, 0 error).`,
    };

    this.broadcast({
      type: 'task.updated',
      task: finishedTaskDto,
    });
    yield {
      type: 'task.updated',
      task: finishedTaskDto,
    };

    const delegationEndEvent: AdapterEvent = {
      type: 'delegation.end',
      taskId,
      fromAgentId: 'shinaa',
      toAgentId: assignedAgent.id,
      label: taskTitle,
    };
    this.broadcast(delegationEndEvent);
    yield delegationEndEvent;

    assignedAgent.status = 'online';
    assignedAgent.active_tasks_count = Math.max(0, (assignedAgent.active_tasks_count || 1) - 1);
    this.broadcast({ type: 'agent.status', agentId: assignedAgent.id, status: 'online' });
    yield { type: 'agent.status', agentId: assignedAgent.id, status: 'online' };

    // 4. Orchestrator concludes
    const conclusion = `\n\nTask **[${taskTitle}]** selesai dieksekusi oleh **${assignedAgent.name}**.\n- Status: \`Done\` (verifikasi lolos)\n- Pipeline delegasi kembali idle.\nSemua sistem sinkron di 9router. Ada hal lain yang perlu dikoordinasikan?`;
    for (const chunk of conclusion.split(' ')) {
      if (!this.activeRuns.has(runId)) break;
      yield {
        type: 'message.delta',
        messageId,
        agentId: 'shinaa',
        delta: chunk + ' ',
      };
      await new Promise((r) => setTimeout(r, 20));
    }

    yield { type: 'message.done', messageId };

    answeringAgent.status = 'online';
    this.broadcast({ type: 'agent.status', agentId: 'shinaa', status: 'online' });
    yield { type: 'agent.status', agentId: 'shinaa', status: 'online' };

    this.activeRuns.delete(runId);
  }
}
