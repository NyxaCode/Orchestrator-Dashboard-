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
    system_prompt: 'Anda adalah Shinaa, Orchestrator DM Mission Control. Terima instruksi user, validasi batasan, petakan ke sub-agent (Rika, Lia, dll), dan sintesis hasil akhir secara terstruktur.',
    temperature: 0.35,
    max_tokens: 4096,
    thinking_level: 'high',
    tools: ['9router_gateway_v2', 'delegate_task', 'read_telemetry', 'memory_sqlite'],
    context_window: 1000000,
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
    system_prompt: 'Anda adalah Rika, asisten CS dan spesialis komunitas hamster. Jawab pertanyaan user dengan nada ramah, periksa data adopsi, dan pastikan kepuasan komunitas optimal.',
    temperature: 0.5,
    max_tokens: 2048,
    thinking_level: 'medium',
    tools: ['9router_gateway_v2', 'delegate_task', 'read_telemetry', 'browser_sandbox'],
    context_window: 128000,
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
    system_prompt: 'Anda adalah Lia, sub-agent komputasi riset akustik dan komposisi musik. Ekstrak data frekuensi audio, pola harmoni, dan siapkan ringkasan teknis.',
    temperature: 0.25,
    max_tokens: 4096,
    thinking_level: 'high',
    tools: ['9router_gateway_v2', 'delegate_task', 'read_telemetry', 'audio_dsp_kernel'],
    context_window: 1000000,
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
    system_prompt: 'Anda adalah Momo, kurator konten & feed hamster. Filter spam, pilih foto/video komunitas terbaik, dan jaga metrik interaksi feed.',
    temperature: 0.6,
    max_tokens: 2048,
    thinking_level: 'low',
    tools: ['9router_gateway_v2', 'browser_sandbox', 'read_telemetry'],
    context_window: 1000000,
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
    system_prompt: 'Anda adalah Cody, auto-responder FAQ & resolusi tiket user. Analisis pesan pelanggan, cocokkan dengan basis pengetahuan, dan jawab secara instan.',
    temperature: 0.2,
    max_tokens: 1024,
    thinking_level: 'low',
    tools: ['9router_gateway_v2', 'memory_sqlite', 'read_telemetry'],
    context_window: 128000,
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
    system_prompt: 'Anda adalah Aria, spesialis sintesis vokal & DSP audio waveform. Terapkan formant filtering, kompresi dinamik, dan harmonisasi vokal.',
    temperature: 0.3,
    max_tokens: 3072,
    thinking_level: 'medium',
    tools: ['9router_gateway_v2', 'audio_dsp_kernel', 'read_telemetry'],
    context_window: 200000,
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
    system_prompt: 'Anda adalah Sonix, engine Fast Fourier Transform & analisis spektrogram nada. Ekstrak frekuensi dominan, harmonik ganjil/genap, dan pastikan audio bebas clipping.',
    temperature: 0.1,
    max_tokens: 4096,
    thinking_level: 'extended',
    tools: ['9router_gateway_v2', 'audio_dsp_kernel', 'code_interpreter', 'read_telemetry'],
    context_window: 1000000,
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

  syncAgents(agentsMap: Record<string, AgentDTO> | Map<string, AgentDTO>): void {
    if (agentsMap instanceof Map) {
      this.agents = new Map(agentsMap);
    } else {
      this.agents = new Map(Object.entries(agentsMap));
    }
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
      } else if (target.id === 'momo') {
        const lower = input.content.toLowerCase();
        replyContent = `Hai! **Momo** di sini (Sub-Agent Kurasi Feed Komunitas · \`${target.model_label}\`). Mengenai: "${input.content}", postingan feed edukasi hamster telah diverifikasi, hashtag komunitas dibersihkan dari spam, dan antrian kurasi terjadwal rapi.`;
      } else if (target.id === 'cody') {
        const lower = input.content.toLowerCase();
        replyContent = `Halo! **Cody** siap membantu (Auto-Responder FAQ & Resolusi Tiket · \`${target.model_label}\`). Instruksi: "${input.content}" telah diproses. Template panduan kandang & penanganan komplain tiket dijawab instan dengan akurasi 99.2%.`;
      } else if (target.id === 'aria') {
        const lower = input.content.toLowerCase();
        replyContent = `Salam! **Aria** aktif (DSP Waveform & Sintesis Vokal · \`${target.model_label}\`). Parameter audio untuk: "${input.content}" selesai dikalibrasi. Filter formant resonansi vokal disetel seimbang tanpa distorsi clipping.`;
      } else if (target.id === 'sonix') {
        const lower = input.content.toLowerCase();
        replyContent = `Salam! **Sonix** standby (FFT Spectrogram Analyzer & Harmonics · \`${target.model_label}\`). Hasil kalkulasi spektrum Fourier untuk: "${input.content}" mendeteksi nada dasar optimal di 440Hz dengan harmonik bersih hingga 16kHz.`;
      } else {
        replyContent = `Halo! Saya **${target.name}** (${target.description || 'Sub-Agent terdaftar'} · \`${target.model_label}\`). Permintaan: "${input.content}" telah berhasil dieksekusi dalam simulasi mock.`;
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

    // Determine assignedAgent based on mentions, keywords, or roles
    let assignedAgent: AgentDTO | null = null;
    let customTaskTitle = '';

    // Check multiple agent mentions for Collaborative Multi-Agent Thinking
    const mentionedAgentsList: AgentDTO[] = [];
    for (const [id, agent] of this.agents.entries()) {
      if (agent.role === 'orchestrator') continue;
      if (
        contentLower.includes(`@${id.toLowerCase()}`) ||
        contentLower.includes(`@${agent.name.toLowerCase()}`)
      ) {
        if (!mentionedAgentsList.some((a) => a.id === agent.id)) {
          mentionedAgentsList.push(agent);
        }
      }
    }

    // MULTI-AGENT COLLABORATIVE REASONING:
    // If user mentions multiple agents to think together, coordinate and stream collaborative thoughts!
    if (mentionedAgentsList.length >= 2) {
      const agentNamesList = mentionedAgentsList.map((a) => `**@${a.name}**`).join(', ');
      const intro = `### 🤝 Multi-Agent Collaborative Reasoning\n\n` +
        `> **Instruksi**: "${input.content}"\n\n` +
        `Shinaa (Orchestrator Lead) mengaktifkan sesi penalaran kolaboratif bersama ${agentNamesList}. Semua agen yang ditag sedang menganalisis dan berpikir bersama secara mendalam.\n\n---\n\n`;

      for (const chunk of intro.split(' ')) {
        if (!this.activeRuns.has(runId)) break;
        yield { type: 'message.delta', messageId, agentId: 'shinaa', delta: chunk + ' ' };
        await new Promise((r) => setTimeout(r, 16));
      }

      // Start simultaneous delegations & busy status for all mentioned agents
      const taskIds: Record<string, string> = {};
      for (const agent of mentionedAgentsList) {
        const tId = `task_${++this.taskCounter}`;
        taskIds[agent.id] = tId;
        const taskLabel = `Reasoning Kolaboratif: ${agent.name}`;

        this.broadcast({ type: 'delegation.start', taskId: tId, fromAgentId: 'shinaa', toAgentId: agent.id, label: taskLabel });
        yield { type: 'delegation.start', taskId: tId, fromAgentId: 'shinaa', toAgentId: agent.id, label: taskLabel };

        agent.status = 'busy';
        this.broadcast({ type: 'agent.status', agentId: agent.id, status: 'busy' });
        yield { type: 'agent.status', agentId: agent.id, status: 'busy' };

        this.broadcast({
          type: 'log',
          agentId: agent.id,
          level: 'info',
          message: `[KOLABORASI] Memproses penalaran mendalam domain (${agent.model_label})...`,
          ts: Date.now(),
        });
      }

      // Stream each agent's individual domain thoughts & contributions
      for (const agent of mentionedAgentsList) {
        if (!this.activeRuns.has(runId)) break;

        let agentInsight = '';
        if (agent.id === 'rika') {
          agentInsight = `### 🐹 @${agent.name} (Customer Support & Community Lead · \`${agent.model_label}\`)\n` +
            `> 🧠 *Thinking*: Menganalisis kebutuhan user, kepuasan komunitas, dan mitigasi kendala operasional...\n\n` +
            `- **Dampak Komunitas**: Permintaan ini sangat positif untuk engagement user. Alur penanganan harus dibuat intuitif dengan template respons terstandar.\n` +
            `- **Kesiapan Layanan**: Kami menyarankan sistem auto-escalation jika terjadi komplain lanjutan, dengan target respon SLA < 2 menit.\n\n---\n\n`;
        } else if (agent.id === 'lia') {
          agentInsight = `### 🎵 @${agent.name} (Audio & Research Cluster Lead · \`${agent.model_label}\`)\n` +
            `> 🧠 *Thinking*: Menghitung parameter akustik, harmoni waveform, dan arsitektur data riset...\n\n` +
            `- **Analisis Domain Audio**: Pipeline suara dan ekstraksi fitur perlu dipastikan sinkron dengan modul DSP agar tidak terjadi fasa latency.\n` +
            `- **Rekomendasi Riset**: Dataset acuan menunjukkan akurasi sintesis meningkat signifikan dengan dynamic thresholding pada frekuensi tengah.\n\n---\n\n`;
        } else if (agent.id === 'momo') {
          agentInsight = `### 🐹 @${agent.name} (Kurasi Feed & Community Trends · \`${agent.model_label}\`)\n` +
            `> 🧠 *Thinking*: Menelusuri feed komunitas hamster dan tren interaksi terkini...\n\n` +
            `- **Kurasi Konten**: Algoritma kurasi mendeteksi antusiasme tinggi untuk format visual ringkas dan postingan informatif interaktif.\n` +
            `- **Rekomendasi Publikasi**: Jadwalkan pada prime-time engagement dengan tagar resmi komunitas yang telah diverifikasi.\n\n---\n\n`;
        } else if (agent.id === 'cody') {
          agentInsight = `### ⚡ @${agent.name} (Auto-Responder FAQ & Resolusi Tiket · \`${agent.model_label}\`)\n` +
            `> 🧠 *Thinking*: Mencocokkan knowledge base tiket dan merumuskan resolusi terotomatisasi...\n\n` +
            `- **Database Resolusi**: Pola masalah telah dipetakan ke 3 template jawaban cepat dengan probabilitas penyelesaian mandiri 94.6%.\n` +
            `- **Integrasi FAQ**: Pertanyaan umum akan otomatis ditambahkan ke ringkasan panduan bantuan interaktif.\n\n---\n\n`;
        } else if (agent.id === 'aria') {
          agentInsight = `### 🎙️ @${agent.name} (Vocal DSP & Formant Synthesis · \`${agent.model_label}\`)\n` +
            `> 🧠 *Thinking*: Memfilter spektrum suara vokal dan formant frekuensi harmonik...\n\n` +
            `- **DSP Waveform**: Filter formant vokal disetel pada rentang 1.2kHz – 3.8kHz dengan dynamic anti-aliasing bebas jitter.\n` +
            `- **Kualitas Vokal**: Resonansi nada jernih dengan rasio Signal-to-Noise (SNR) > 48dB tanpa distorsi clipping.\n\n---\n\n`;
        } else if (agent.id === 'sonix') {
          agentInsight = `### 📊 @${agent.name} (FFT Spectrogram Analyzer · \`${agent.model_label}\`)\n` +
            `> 🧠 *Thinking*: Melakukan fast Fourier transform dan inspeksi density spektral...\n\n` +
            `- **Spektrogram FFT**: Distribusi energi frekuensi stabil merata di seluruh oktav nada tanpa lonjakan harmonik liar.\n` +
            `- **Verifikasi Akurasi**: Konsistensi fasa frekuensi terverifikasi 99.8% siap dipasok ke modul berikutnya.\n\n---\n\n`;
        } else {
          agentInsight = `### ✦ @${agent.name} (${agent.description || 'Specialist Agent'} · \`${agent.model_label}\`)\n` +
            `> 🧠 *Thinking*: Menganalisis parameter tugas dari perspektif spesialisasi ${agent.name}...\n\n` +
            `- **Hasil Evaluasi**: Modul spesifik ${agent.name} telah diverifikasi dan siap dieksekusi secara terkoordinasi dengan agen lainnya.\n\n---\n\n`;
        }

        for (const chunk of agentInsight.split(' ')) {
          if (!this.activeRuns.has(runId)) break;
          yield { type: 'message.delta', messageId, agentId: 'shinaa', delta: chunk + ' ' };
          await new Promise((r) => setTimeout(r, 16));
        }

        const tId = taskIds[agent.id];
        if (tId) {
          this.broadcast({ type: 'delegation.end', taskId: tId, fromAgentId: 'shinaa', toAgentId: agent.id, label: `Kolaborasi: ${agent.name}` });
          yield { type: 'delegation.end', taskId: tId, fromAgentId: 'shinaa', toAgentId: agent.id, label: `Kolaborasi: ${agent.name}` };
        }
        agent.status = 'online';
        this.broadcast({ type: 'agent.status', agentId: agent.id, status: 'online' });
        yield { type: 'agent.status', agentId: agent.id, status: 'online' };
      }

      // Shinaa synthesizes consensus
      const synthesis = `### 👑 Kesimpulan Konsensus Shinaa (Orchestrator Lead)\n\n` +
        `Semua agen (${mentionedAgentsList.map((a) => `**${a.name}**`).join(', ')}) telah selesai menyumbangkan pemikiran mereka secara kolaboratif.\n` +
        `- **Hasil Sinergi**: Analisis lintas-disiplin berhasil disatukan tanpa konflik antar-modul.\n` +
        `- **Status Eksekusi**: Hasil reasoning telah dikonsolidasi dan siap ke tahap implementasi.\n\n` +
        `Apakah Anda ingin menginstruksikan langkah eksekusi berikutnya?`;

      for (const chunk of synthesis.split(' ')) {
        if (!this.activeRuns.has(runId)) break;
        yield { type: 'message.delta', messageId, agentId: 'shinaa', delta: chunk + ' ' };
        await new Promise((r) => setTimeout(r, 16));
      }

      yield { type: 'message.done', messageId };
      answeringAgent.status = 'online';
      this.broadcast({ type: 'agent.status', agentId: 'shinaa', status: 'online' });
      yield { type: 'agent.status', agentId: 'shinaa', status: 'online' };
      this.activeRuns.delete(runId);
      return;
    }

    // 1. Single direct mention check in message
    if (mentionedAgentsList.length === 1) {
      assignedAgent = mentionedAgentsList[0];
    }

    // 2. Keyword check if not directly mentioned
    if (!assignedAgent) {
      if (contentLower.includes('momo') || contentLower.includes('feed') || contentLower.includes('kurasi') || contentLower.includes('posting')) {
        assignedAgent = this.agents.get('momo') || this.agents.get('rika') || null;
        customTaskTitle = 'Kurasi feed & publikasi konten komunitas';
      } else if (contentLower.includes('cody') || contentLower.includes('faq') || contentLower.includes('tiket') || contentLower.includes('ticket') || contentLower.includes('resolusi')) {
        assignedAgent = this.agents.get('cody') || this.agents.get('rika') || null;
        customTaskTitle = 'Resolusi tiket bantuan & template FAQ';
      } else if (contentLower.includes('aria') || contentLower.includes('vokal') || contentLower.includes('synth') || contentLower.includes('formant') || contentLower.includes('waveform')) {
        assignedAgent = this.agents.get('aria') || this.agents.get('lia') || null;
        customTaskTitle = 'Sintesis DSP modul vokal & audio waveform';
      } else if (contentLower.includes('sonix') || contentLower.includes('fft') || contentLower.includes('spektrogram') || contentLower.includes('spectrogram') || contentLower.includes('frekuensi') || contentLower.includes('nada')) {
        assignedAgent = this.agents.get('sonix') || this.agents.get('lia') || null;
        customTaskTitle = 'FFT Spectrogram scan & kalkulasi frekuensi nada';
      } else if (contentLower.includes('lia') || contentLower.includes('audio') || contentLower.includes('musik') || contentLower.includes('riset') || contentLower.includes('akustik') || contentLower.includes('suara')) {
        assignedAgent = this.agents.get('lia') || null;
        customTaskTitle = 'Riset audio, harmoni akustik & analisis data';
      } else if (contentLower.includes('rika') || contentLower.includes('hamster') || contentLower.includes('cs') || contentLower.includes('customer') || contentLower.includes('komunitas')) {
        assignedAgent = this.agents.get('rika') || null;
        customTaskTitle = 'Audit interaksi CS & kurasi feed hamster';
      } else {
        // Check any custom agents by name
        for (const [id, agent] of this.agents.entries()) {
          if (agent.role === 'orchestrator') continue;
          if (contentLower.includes(agent.name.toLowerCase()) || contentLower.includes(id.toLowerCase())) {
            assignedAgent = agent;
            customTaskTitle = `Eksekusi modul spesifik ${agent.name}`;
            break;
          }
        }
      }
    }

    if (!assignedAgent) {
      assignedAgent = this.agents.get('rika') || this.agents.get('lia') || Array.from(this.agents.values()).find(a => a.role !== 'orchestrator') || this.agents.get('shinaa')!;
    }

    const taskId = `task_${++this.taskCounter}`;
    const taskTitle = customTaskTitle || (
      assignedAgent.id === 'rika'
        ? `Audit interaksi CS & kurasi feed hamster`
        : assignedAgent.id === 'lia'
        ? `Sintesis parameter audio & laporan riset`
        : assignedAgent.id === 'momo'
        ? `Kurasi & publish feed hamster`
        : assignedAgent.id === 'cody'
        ? `Auto-responder FAQ & resolusi tiket user`
        : assignedAgent.id === 'aria'
        ? `Sintesis DSP Vokal & Formant`
        : assignedAgent.id === 'sonix'
        ? `FFT Spectrogram Analyzer & Komposisi Frekuensi`
        : `Eksekusi sub-task untuk ${assignedAgent.name}`
    );

    const parentAgent = assignedAgent.parent_id && assignedAgent.parent_id !== 'shinaa'
      ? this.agents.get(assignedAgent.parent_id)
      : null;

    // 1. Orchestrator announces plan
    const delegationRoutingText = parentAgent
      ? `Aku mendelegasikan alur kerja melalui **${parentAgent.name}** (Cluster Lead) ke **${assignedAgent.name}** (\`${assignedAgent.model_label}\`) untuk eksekusi terdistribusi.`
      : `Aku mendelegasikan task ke **${assignedAgent.name}** (\`${assignedAgent.model_label}\`) untuk validasi mendalam.`;

    const intro = `Siap, aku sudah menerima instruksi: "${input.content}". ${delegationRoutingText}\n\n`;
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

    // 2. Multi-tier or Direct Delegation Start
    const parentTaskId = parentAgent ? `task_${++this.taskCounter}` : taskId;
    if (parentAgent) {
      // Shinaa -> Parent
      this.broadcast({
        type: 'delegation.start',
        taskId: parentTaskId,
        fromAgentId: 'shinaa',
        toAgentId: parentAgent.id,
        label: `Koordinasi Cluster: ${parentAgent.name}`,
      });
      yield {
        type: 'delegation.start',
        taskId: parentTaskId,
        fromAgentId: 'shinaa',
        toAgentId: parentAgent.id,
        label: `Koordinasi Cluster: ${parentAgent.name}`,
      };
      parentAgent.status = 'busy';
      this.broadcast({ type: 'agent.status', agentId: parentAgent.id, status: 'busy' });
      yield { type: 'agent.status', agentId: parentAgent.id, status: 'busy' };

      // Parent -> Child
      this.broadcast({
        type: 'delegation.start',
        taskId,
        fromAgentId: parentAgent.id,
        toAgentId: assignedAgent.id,
        label: taskTitle,
      });
      yield {
        type: 'delegation.start',
        taskId,
        fromAgentId: parentAgent.id,
        toAgentId: assignedAgent.id,
        label: taskTitle,
      };
    } else {
      // Direct: Shinaa -> assignedAgent
      this.broadcast({
        type: 'delegation.start',
        taskId,
        fromAgentId: 'shinaa',
        toAgentId: assignedAgent.id,
        label: taskTitle,
      });
      yield {
        type: 'delegation.start',
        taskId,
        fromAgentId: 'shinaa',
        toAgentId: assignedAgent.id,
        label: taskTitle,
      };
    }

    const taskDto: TaskDTO = {
      id: taskId,
      project_id: input.projectId,
      from_agent_id: parentAgent ? parentAgent.id : 'shinaa',
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
      message: `[DELEGASI DITERIMA] Menjalankan modul: "${taskTitle}" (${assignedAgent.model_label})`,
      ts: Date.now(),
    });

    // Sub-agent processing simulation
    await new Promise((r) => setTimeout(r, 1100));

    this.broadcast({
      type: 'log',
      agentId: assignedAgent.id,
      level: 'info',
      message: `[SELESAI] Hasil validasi berhasil dikompilasi dan dikirim ke Orchestrator.`,
      ts: Date.now(),
    });

    // 3. Task completed & delegation end
    const finishedTaskDto: TaskDTO = {
      ...taskDto,
      status: 'done',
      finished_at: Date.now(),
      result_summary: `Validasi berhasil diselesaikan oleh ${assignedAgent.name} (latency 1.1s, model: ${assignedAgent.model_label}).`,
    };

    this.broadcast({
      type: 'task.updated',
      task: finishedTaskDto,
    });
    yield {
      type: 'task.updated',
      task: finishedTaskDto,
    };

    if (parentAgent) {
      this.broadcast({
        type: 'delegation.end',
        taskId,
        fromAgentId: parentAgent.id,
        toAgentId: assignedAgent.id,
        label: taskTitle,
      });
      yield {
        type: 'delegation.end',
        taskId,
        fromAgentId: parentAgent.id,
        toAgentId: assignedAgent.id,
        label: taskTitle,
      };
      this.broadcast({
        type: 'delegation.end',
        taskId: parentTaskId,
        fromAgentId: 'shinaa',
        toAgentId: parentAgent.id,
        label: `Koordinasi Cluster: ${parentAgent.name}`,
      });
      yield {
        type: 'delegation.end',
        taskId: parentTaskId,
        fromAgentId: 'shinaa',
        toAgentId: parentAgent.id,
        label: `Koordinasi Cluster: ${parentAgent.name}`,
      };
      parentAgent.status = 'online';
      this.broadcast({ type: 'agent.status', agentId: parentAgent.id, status: 'online' });
      yield { type: 'agent.status', agentId: parentAgent.id, status: 'online' };
    } else {
      this.broadcast({
        type: 'delegation.end',
        taskId,
        fromAgentId: 'shinaa',
        toAgentId: assignedAgent.id,
        label: taskTitle,
      });
      yield {
        type: 'delegation.end',
        taskId,
        fromAgentId: 'shinaa',
        toAgentId: assignedAgent.id,
        label: taskTitle,
      };
    }

    assignedAgent.status = 'online';
    assignedAgent.active_tasks_count = Math.max(0, (assignedAgent.active_tasks_count || 1) - 1);
    this.broadcast({ type: 'agent.status', agentId: assignedAgent.id, status: 'online' });
    yield { type: 'agent.status', agentId: assignedAgent.id, status: 'online' };

    // 4. Orchestrator concludes
    const conclusion = `\n\nTask **[${taskTitle}]** selesai dieksekusi oleh **${assignedAgent.name}**.\n- Status: \`Done\` (validasi sukses)\n- Latency: \`38ms\` · Gateway: \`9router mesh\`\n- Pipeline delegasi kembali standby.\nAda tugas berikutnya yang ingin dieksekusi?`;
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
