# 🏛️ DM Mission Control (DMC) — Arsitektur & Spesifikasi Detail Sistem

> **Versi Dokumen**: 2.0  
> **Status Sistem**: Production Ready (Dual-Engine: Simulator/Mockup & Gateway Ready)  
> **Target Audiens**: Software Architects, Senior Frontend Engineers, AI Systems Engineers  

---

## 📑 Daftar Isi
1. [Ringkasan Eksekutif & Filosofi Desain](#1-ringkasan-eksekutif--filosofi-desain)
2. [Diagram Arsitektur Tingkat Tinggi (High-Level Architecture)](#2-diagram-arsitektur-tingkat-tinggi-high-level-architecture)
3. [Topologi & Taksonomi Multi-Agent](#3-topologi--taksonomi-multi-agent)
4. [Arsitektur Komponen UI & Layout Frontend](#4-arsitektur-komponen-ui--layout-frontend)
5. [Manajemen State Global (Zustand Stores)](#5-manajemen-state-global-zustand-stores)
6. [Pola Abstraksi Adapter & Event-Driven Streaming](#6-pola-abstraksi-adapter--event-driven-streaming)
7. [Kontrak Data & Skema Validasi (Zod DTO)](#7-kontrak-data--skema-validasi-zod-dto)
8. [Simulator Konfigurasi & Sandbox Hyperparameters](#8-simulator-konfigurasi--sandbox-hyperparameters)
9. [Strategi Keandalan, Pengujian & CI/CD](#9-strategi-keandalan-pengujian--cicd)
10. [Panduan Operasional & Rencana Integrasi Live Gateway](#10-panduan-operasional--rencana-integrasi-live-gateway)

---

## 1. Ringkasan Eksekutif & Filosofi Desain

**DM Mission Control (DMC)** adalah platform orkestrasi *multi-agent AI* tingkat lanjut yang dirancang untuk mengarahkan, memonitor, dan menganalisis jaringan agen otonom terdistribusi. Sistem mengusung paradigma **Hub-and-Spoke Hierarkis** dengan satu agen sentral (**Shinaa - Dev Lead & Orchestrator**) sebagai konduktor utama yang mendelegasikan beban kerja ke sub-agen kluster spesialis secara dinamis.

### Prinsip Utama Sistem (Design Constitution)
1. **Centralized Leadership, Distributed Execution**:  
   User berinteraksi primernya dengan Orchestrator. Orkestrator memecah instruksi kompleks menjadi subtugas, mendelegasikannya ke Lead Kluster (L1), yang kemudian dapat membagi lagi tugas ke Spesialis Domain (L2).
2. **Visual Topology as Single Source of Truth**:  
   Graf kanvas interaktif bukan sekadar diagram statis, melainkan representasi fisik hidup dari status jaringan, beban komputasi agen, dan aliran partikel pendelegasian data real-time.
3. **Decoupled Gateway Abstraction (Adapter Pattern)**:  
   Seluruh interaksi chat, streaming token, telemetri, dan logging diabstraksikan melalui interface `AgentAdapter`. Sistem dapat berjalan 100% otonom dalam mode simulator interaktif tanpa dependensi model cloud berbayar, dan beralih ke gateway live 9router/Hermes hanya dengan mengubah konfigurasi environment (`AGENT_ADAPTER=hermes`).
4. **Resilient Adaptive Ergonomics**:  
   Antarmuka beradaptasi mulus dari layar ultra-lebar multi-monitor (3-kolom fluid + canvas drag) hingga smartphone (< 768px dengan bottom navigation dan bottom sheet sheet drawer), dengan nol tabrakan teks (*zero collision*) dan padding proporsional.

---

## 2. Diagram Arsitektur Tingkat Tinggi (High-Level Architecture)

```
┌─────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                   DM MISSION CONTROL (CLIENT)                                   │
│                                                                                                 │
│  ┌───────────────────────────────────────────────────────────────────────────────────────────┐  │
│  │                                  PRESENTATION LAYER (UI)                                  │  │
│  │  ┌───────────────────┐  ┌───────────────────────────────────┐  ┌───────────────────────┐  │  │
│  │  │  Projects Sidebar │  │        View Area (1fr fluid)      │  │    Hermes Chat Box    │  │  │
│  │  │   (Search & CRUD) │  │  ┌───────────────┐ ┌───────────┐ │  │ (Mention, CLI, Tool)   │  │  │
│  │  │                   │  │  │ Graph Canvas  │ │  Kanban   │ │  │                       │  │  │
│  │  │                   │  │  │ (XYFlow + D3) │ │   Board   │ │  │                       │  │  │
│  │  └───────────────────┘  └──┴───────────────┴─┴───────────┴─┘  └───────────────────────┘  │  │
│  │  ┌─────────────────────────────────────────────────────────────────────────────────────┐  │  │
│  │  │     Agent Inspector Drawer (Overview | Live Logs | Tasks Queue | Config Sandbox)    │  │  │
│  │  └─────────────────────────────────────────────────────────────────────────────────────┘  │  │
│  └──────────────────────────────────────────────┬────────────────────────────────────────────┘  │
│                                                 │ Dispatches Actions / Reads Subscriptions      │
│  ┌──────────────────────────────────────────────▼────────────────────────────────────────────┐  │
│  │                             STATE MANAGEMENT LAYER (ZUSTAND)                              │  │
│  │  ┌──────────────────┐  ┌─────────────────┐  ┌────────────────┐  ┌──────────────────────┐  │  │
│  │  │  useAgentsStore  │  │  useChatStore   │  │ useKanbanStore │  │ useSystemConfigStore │  │  │
│  │  └──────────────────┘  └─────────────────┘  └────────────────┘  └──────────────────────┘  │  │
│  └──────────────────────────────────────────────┬────────────────────────────────────────────┘  │
│                                                 │ Invokes sendMessage / cancel                  │
│  ┌──────────────────────────────────────────────▼────────────────────────────────────────────┐  │
│  │                             ADAPTER ABSTRACTION BOUNDARY                                  │  │
│  │                                   interface AgentAdapter                                  │  │
│  └──────────────────────┬───────────────────────────────────────────┬────────────────────────┘  │
└─────────────────────────┼───────────────────────────────────────────┼───────────────────────────┘
                          │                                           │
         ┌────────────────▼────────────────┐         ┌────────────────▼────────────────┐
         │     MockAdapter (Simulator)     │         │     HermesAdapter (Gateway)     │
         │  - Async Generator Loop         │         │  - Fetch SSE Streaming API      │
         │  - Telemetry & Latency Emitter  │         │  - 9router Kernel Integration   │
         │  - Auto-Healing Fault Injector  │         │  - Tool Call Translation        │
         └─────────────────────────────────┘         └─────────────────────────────────┘
```

---

## 3. Topologi & Taksonomi Multi-Agent

DMC mengimplementasikan hierarki **3-Tier (L0, L1, L2)** yang merefleksikan pembagian kerja di lingkungan rekayasa perangkat lunak modern:

```
                                  ┌────────────────────────┐
                                  │   SHINAA (Lead / L0)   │
                                  │   claude-3-7-sonnet    │
                                  └───────────┬────────────┘
                                              │
                       ┌──────────────────────┴──────────────────────┐
                       │                                             │
             ┌─────────▼────────┐                           ┌────────▼─────────┐
             │ RIKA (Lead / L1) │◄── L1 Peer Communication ─►│ LIA (Lead / L1)  │
             │    gpt-4o-mini   │                           │  deepseek-chat   │
             │ (Support Lead)   │                           │  (Audio Lead)    │
             └────────┬─────────┘                           └────────┬─────────┘
                      │                                              │
         ┌────────────┴────────────┐                    ┌────────────┴────────────┐
         │                         │                    │                         │
┌────────▼────────┐       ┌────────▼────────┐  ┌────────▼────────┐       ┌────────▼────────┐
│  MOMO (L2 / SP) │       │  CODY (L2 / SP) │  │  ARIA (L2 / SP) │       │ SONIX (L2 / SP) │
│ gemini-2-flash  │       │   gpt-4o-mini   │  │ claude-3-5-haik │       │  deepseek-chat  │
│ (Feed & Social) │       │ (FAQ & Tickets) │  │ (Synth & DSP)   │       │ (FFT Analyzer)  │
└─────────────────┘       └─────────────────┘  └─────────────────┘       └─────────────────┘
```

### Tabel Rincian Agen & Model Mapping

| ID Agen | Nama | Layer | Induk (Parent) | Model Backend | Profil Peran & Kapabilitas |
| :--- | :--- | :---: | :--- | :--- | :--- |
| `shinaa` | **Shinaa** | **L0** | *Root Orchestrator* | `claude-3-7-sonnet` | Lead Architect. Analisis intensi natural language, pembagian sub-goal, routing delegasi, dan sintesis hasil akhir. |
| `rika` | **Rika** | **L1** | `shinaa` | `gpt-4o-mini` | Cluster Lead Support. Mengelola kepuasan pengguna, moderasi komunitas, dan orkestrasi tiket bantuan. |
| `lia` | **Lia** | **L1** | `shinaa` | `deepseek-chat` | Cluster Lead Audio & Research. Peneliti formula harmoni akustik, kalkulasi matriks audio, dan sintesis audio. |
| `momo` | **Momo** | **L2** | `rika` | `gemini-2.0-flash` | Kurator konten, deteksi tren feed, filtering spam hashtag, dan penjadwalan engagement interaktif. |
| `cody` | **Cody** | **L2** | `rika` | `gpt-4o-mini` | Resolusi tiket teknis, auto-responder FAQ otomatis, dan penyusunan panduan troubleshooting. |
| `aria` | **Aria** | **L2** | `lia` | `claude-3-5-haiku` | Sintesis vokal, formant filtering, kompresi dinamik audio, dan pemrosesan Digital Signal Processing (DSP). |
| `sonix` | **Sonix** | **L2** | `lia` | `deepseek-chat` | Analisis spektrum Fast Fourier Transform (FFT), ekstraksi puncak frekuensi, dan deteksi anomali harmonik. |

### Aturan Komunikasi Jaringan
1. **Vertical Downward Delegation (Primary)**:
   - Shinaa ➔ Rika ➔ [Momo / Cody]
   - Shinaa ➔ Lia ➔ [Aria / Sonix]
   - Memicu status agen tujuan menjadi `busy`, garis graf bercahaya (*active edge*), dan partikel bergerak searah aliran data.
2. **Horizontal Peer-to-Peer Communication (L1 Peer)**:
   - Rika ➔ Lia atau Lia ➔ Rika
   - Komunikasi langsung antar lead kluster tanpa melibatkan Shinaa untuk task sinkronisasi silang domain (contoh: audio tutorial support).
3. **Direct 1-on-1 Scoped Session**:
   - User dapat mem-bypass orchestrator dengan mengklik node agen tertentu atau menggunakan perintah `/agent <nama>`. Sesi percakapan diisolasi di thread privat `[projectId]:agent:[agentId]`.

---

## 4. Arsitektur Komponen UI & Layout Frontend

UI DMC dibangun dengan **React 19**, **Tailwind CSS v4**, dan **lucide-react** dengan prinsip kerapian ruang, tipografi proporsional, dan penanganan overflow deterministik.

```
src/components/
├── shell/
│   ├── AppShell.tsx         # Layout master (Desktop 3-Kolom vs Mobile Single Viewport)
│   ├── TopBar.tsx           # Navigasi utama, breadcrumb, switcher mode, action buttons
│   ├── StatusBar.tsx        # Telemetri footer (online agents count, SSE heartbeat)
│   └── PanelHandle.tsx      # Toggle handle expand/collapse sidebar & chat
├── graph/
│   ├── GraphCanvas.tsx      # Wrapper @xyflow/react canvas graf
│   ├── UnifiedAgentNode.tsx # Node graf custom (avatar SVG, pulse rings, hover action)
│   ├── DelegationEdge.tsx   # Edge konektor dengan partikel animasi delegasi
│   ├── ObsidianGraphControls.tsx # Kontrol gaya fisika D3 (Gravity, Distance, Repulsion)
│   ├── layoutRadial.ts      # Algoritma penempatan sudut konsentris polar
│   └── forceSimulation.ts   # Integrasi D3-force layout engine
├── chat/
│   ├── ChatPanel.tsx        # Container utama panel percakapan & session switcher
│   ├── MessageList.tsx      # Kontainer scrollable tunggal dengan auto-scroll bottom pill
│   ├── MessageItem.tsx      # Bubble pesan terisolasi (User, Agent, Reasoning, Code, Table)
│   ├── Composer.tsx         # Textarea responsif, file attachment, text dropdowns
│   ├── HermesStatusBar.tsx  # Bar status terminal ringkas (context %, latency, think timer)
│   ├── MentionPopover.tsx   # Autocomplete popover agen saat mengetik @
│   └── HermesCommandPopover.tsx # Autocomplete popover perintah CLI saat mengetik /
├── inspector/
│   ├── AgentInspector.tsx   # Drawer inspeksi agen (Desktop slide-right, Mobile bottom-sheet)
│   ├── OverviewView.tsx     # Metrik uptime, status, beban komputasi, model
│   ├── LogView.tsx          # Real-time streaming log terminal dengan filter level
│   ├── TasksView.tsx        # Daftar task yang didelegasikan ke agen
│   └── ConfigView.tsx       # Sandbox simulator konfigurasi agen & prompt playground
└── kanban/
    ├── KanbanBoard.tsx      # Papan kanban 3 kolom (Todo, In Progress, Done)
    ├── KanbanColumn.tsx     # Kolom antrian dengan badge counter
    ├── KanbanCard.tsx       # Kartu task dengan avatar penanggung jawab
    └── TaskModal.tsx        # Dialog detail evaluasi task
```

### Solusi Responsivitas & Anti-Collision
- **TopBar Responsif**: Menggunakan flexbox dengan `gap-2 min-w-0 overflow-hidden`. Teks panjang seperti nama project dipotong rapi dengan `truncate max-w-[140px] md:max-w-[190px]`. Label tab beralih otomatis dari teks panjang (`Graph Canvas`) ke teks ringkas (`Graph`) di resolusi sempit.
- **Single Scrollable Container pada Chat**: Menghapus nesting `overflow-y-auto` ganda. Seluruh riwayat pesan diatur oleh satu flex container dengan padding nyaman `px-3 sm:px-4 py-3.5 space-y-3`.
- **Right-Aligned Popovers**: Menu dropdown pada toolbar input (seperti *Thinking Level*) menggunakan penempatan `right-0` sehingga tidak pernah meluap (*overflow*) melewati batas kanan panel chat.
- **Visual Bubble Hierarchy**: Pesan user dibedakan dengan aksen merah lembut (`bg-red-950/20 border-red-500/20`), sementara pesan agen memiliki latar kartu tersendiri (`bg-[#101622] border-white/10`) agar mudah dipindai mata.

---

## 5. Manajemen State Global (Zustand Stores)

Seluruh state aplikasi bersifat terpusat, reaktif, dan terisolasi per domain menggunakan Zustand:

```
┌────────────────────────────────────────────────────────────────────────┐
│                          GLOBAL STATE SCHEMA                           │
├─────────────────────┬──────────────────────────────────────────────────┤
│ Store               │ Tanggung Jawab & Key Data                        │
├─────────────────────┼──────────────────────────────────────────────────┤
│ useAgentsStore      │ • agents: Record<string, AgentDTO>               │
│                     │ • activeDelegations: DelegationDTO[]             │
│                     │ • updateAgentStatus(), updateAgentConfig()       │
│                     │ • resetPositionsToRadial(), autoSaveIndicator    │
├─────────────────────┼──────────────────────────────────────────────────┤
│ useChatStore        │ • messages: Record<string, MessageDTO[]>         │
│                     │ • projectConfigs: Record<string, HermesConfig>   │
│                     │ • tasks: TaskDTO[], logs: LogEntryDTO[]          │
│                     │ • isStreaming, activeRunId, sseStatus            │
├─────────────────────┼──────────────────────────────────────────────────┤
│ useProjectsStore    │ • projects: ProjectDTO[], activeProjectId        │
│                     │ • createProject(), selectProject(), searchQuery  │
├─────────────────────┼──────────────────────────────────────────────────┤
│ useUiStore          │ • sidebarCollapsed, chatCollapsed, chatWidth     │
│                     │ • viewMode ('graph' | 'kanban'), mobileActiveTab │
│                     │ • inspectorOpen, inspectedAgentId, activeTab     │
├─────────────────────┼──────────────────────────────────────────────────┤
│ useSystemConfigStore│ • gatewayMode ('mock' | 'hermes_sim' | 'real')   │
│                     │ • simulatedLatencyMs, chaosErrorRate             │
│                     │ • activeScenario ('default'|'stress'|'chaos')    │
└─────────────────────┴──────────────────────────────────────────────────┘
```

---

## 6. Pola Abstraksi Adapter & Event-Driven Streaming

Untuk memastikan sistem tidak terikat mati pada satu penyedia AI, komunikasi data menggunakan pola **Adapter Pattern**:

```typescript
export interface AgentAdapter {
  sendMessage(options: SendMessageOptions): AsyncGenerator<StreamEvent, void, unknown>;
  cancel(runId: string): Promise<void>;
  syncAgents?(agents: Record<string, AgentDTO>): void;
}
```

### Taksonomi Event (`StreamEvent`)
Ketika user mengirim instruksi, adapter mengembalikan aliran *async generator* yang memancarkan event bertahap:
1. `message.delta` — Potongan token teks streaming.
2. `message.done` — Menandai selesainya respons pesan saat ini.
3. `delegation.start` — Pemicu animasi jalur pendelegasian antar-node di graf.
4. `delegation.end` — Menutup jalur pendelegasian setelah tugas selesai.
5. `agent.status` — Perubahan status agen (`online` ➔ `busy` ➔ `online`).
6. `task.created` & `task.updated` — Sinkronisasi otomatis ke antrian papan Kanban.
7. `log` — Streaming log terminal ke drawer inspeksi agen.
8. `error` — Event kesalahan jaringan / model untuk simulasi kegagalan dan auto-recovery.

---

## 7. Kontrak Data & Skema Validasi (Zod DTO)

Data divalidasi ketat menggunakan skema runtime Zod (`src/lib/schemas.ts`):

```typescript
// Status & Peran Agen
export const AgentRoleSchema = z.enum(['orchestrator', 'agent', 'subagent']);
export const AgentStatusSchema = z.enum(['online', 'busy', 'offline', 'error']);

// Entitas Agen Utama
export const AgentSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  role: AgentRoleSchema,
  description: z.string().default(''),
  model_label: z.string().default('via 9router'),
  avatar_url: z.string().optional(),
  color: z.string().default('#3b82f6'),
  status: AgentStatusSchema.default('online'),
  parent_id: z.string().nullable().default(null),
  layer: z.number().int().min(0).default(0),
  x: z.number().default(0),
  y: z.number().default(0),
  
  // Dynamic Configuration Simulation Fields
  system_prompt: z.string().optional(),
  temperature: z.number().optional(),
  max_tokens: z.number().optional(),
  thinking_level: z.enum(['off', 'low', 'medium', 'high', 'extended']).optional(),
  tools: z.array(z.string()).optional(),
});
```

---

## 8. Simulator Konfigurasi & Sandbox Hyperparameters

Fitur konfigurasi (`Agent Inspector > Config` & `TopBar > Settings`) dilengkapi **Simulator Sandbox Interaktif**:

1. **Model Switcher 9router Gateway**:
   Pengguna dapat menguji bagaimana agen merespons ketika dialihkan antar model seperti `Claude 3.7 Sonnet`, `GPT-4o`, `DeepSeek R1/V3`, atau `Gemini 2.0 Flash`.
2. **System Prompt Directive Sandbox**:
   Dilengkapi preset instan:
   - *Default Role*: Instruksi baku sesuai spesialisasi agen.
   - *Strict JSON Mode*: Format output validasi mesin.
   - *Creative & Brainstorming*: Gaya eksploratif tinggi.
   - *Concise & Bullet Points*: Ringkasan cepat minim token.
3. **Hyperparameters Control**:
   Slider interaktif untuk **Temperature** (0.0 – 1.0) dengan interpretasi otomatis (*Deterministik*, *Seimbang*, *Kreatif*), **Max Output Tokens**, serta pemilih **Reasoning / Thinking Level**.
4. **Interactive Prompt Playground**:
   Kolom uji coba cepat untuk memicu eksekusi lokal instan dan memverifikasi prompt directive tanpa mengubah riwayat chat project utama.
5. **Chaos & Resilience Simulator (Modal Pengaturan Sistem)**:
   Menu simulasi latensi jaringan (10ms – 500ms) dan injeksi kegagalan (0% – 25% *chaos error rate*) untuk menguji ketahanan UI saat terjadi kegagalan gateway.

---

## 9. Strategi Keandalan, Pengujian & CI/CD

Aplikasi diuji secara komprehensif menggunakan **Vitest** dan **React Testing Library** (29 pengujian otomatis terverifikasi):

```text
✓ src/__tests__/unit.test.ts (11 tests)
  ✓ MockAdapter generates valid event sequence
  ✓ MockAdapter handles hierarchical multi-tier delegation
  ✓ MockAdapter peer communication between L1 agents
  ✓ MockAdapter /simulate-error sets error status and auto-heals
  ✓ parseMarkdown handles headers, lists, code, and tables
  ✓ formatTime formats timestamps cleanly

✓ src/__tests__/e2e.test.tsx (18 tests)
  ✓ Chat Panel width resizing and persistence (420px <-> 560px)
  ✓ Hermes status bar telemetry in real-time
  ✓ Pure text dropdowns in composer without icon clutter
  ✓ Mention popover triggers on @ with keyboard navigation
  ✓ Slash commands (/mode, /thinking, /clear, /simulate-error)
  ✓ Direct 1-on-1 agent session scoping
  ✓ Agent Inspector drawer opening and tab transitions
```

### Pipeline Validasi Kualitas
Setiap perubahan kode diverifikasi melalui tiga tahap:
1. `npm run lint` — Pengecekan TypeScript (`tsc --noEmit`).
2. `npm test` — Eksekusi 29 skenario pengujian unit & E2E.
3. `npm run build` — Validasi bundling produksi Vite.

---

## 10. Panduan Operasional & Rencana Integrasi Live Gateway

### Menjalankan di Lingkungan Lokal
```bash
# 1. Pastikan dependensi terpasang
npm install

# 2. Jalankan development server
npm run dev

# 3. Buka dashboard di browser
http://localhost:3000
```

### Akses Jaringan Lokal & Tailscale Mesh
Server dev telah dikonfigurasi mengikat ke `0.0.0.0:3000` dengan `allowedHosts: true`. Anda dapat mengaksesnya langsung melalui IP LAN komputer Anda atau IP privat Tailscale (`http://100.x.y.z:3000`) dari perangkat mobile/tablet.

### Transisi ke Phase 2 (Gateway Nyata)
Untuk menghubungkan dashboard ke gateway Hermes / 9router aktif di lingkungan produksi:
1. Di file `.env`, atur:
   ```env
   AGENT_ADAPTER=hermes
   HERMES_BASE_URL=https://gateway.internal.domain
   HERMES_TOKEN=your_secure_bearer_token
   VITE_AGENT_ADAPTER=hermes
   VITE_HERMES_BASE_URL=https://gateway.internal.domain
   VITE_HERMES_TOKEN=your_secure_bearer_token
   ```
2. Kelas `HermesAdapter` (`src/server/adapters/hermes.ts`) akan otomatis mengambil alih alur `sendMessage()` dan mengalirkan data SSE asli dari kernel 9router tanpa memerlukan perubahan komponen UI.

---
*Dokumen ini dikelola sebagai referensi arsitektur baku DM Mission Control.*
