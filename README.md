# DM Mission Control (DMC) — Multi-Agent Orchestration Dashboard

Dashboard orkestrasi multi-agent modern dengan arsitektur **1 Orchestrator Sentral (Shinaa)** dan **Sub-Agent Terdistribusi** dalam tata letak graf radial berbasis `@xyflow/react`.

> **Status Saat Ini: Mode Simulasi Mockup Interaktif**  
> Aplikasi ini berjalan dalam mode simulasi mockup penuh (`AGENT_ADAPTER=mock`). Seluruh komunikasi, alur pendelegasian tugas multi-tier, visualisasi partikel graf, log telemetri, dan respons agent disimulasikan secara real-time berdasarkan **konfigurasi agent aktif saat ini** tanpa memerlukan koneksi API model berbayar.

---

## 👥 Konfigurasi Agent Aktif

Saat ini sistem memiliki 7 agent dengan hierarki multi-tier:

| Agent | Role | Layer | Model AI | Induk (Parent) | Warna | Spesialisasi & Tanggung Jawab |
| :--- | :--- | :---: | :--- | :--- | :---: | :--- |
| **Shinaa** | `orchestrator` | L0 | `claude-3-7-sonnet` | *Root / Lead* | `#ef4444` | Dev Lead & Task Coordinator. Menganalisis instruksi user, memetakan task, dan mendelegasikan ke sub-agent terkait. |
| **Rika** | `agent` | L1 | `gpt-4o-mini` | Shinaa | `#f59e0b` | Lead Cluster Support: Customer Support, kepuasan komunitas, dan edukasi seputar hamster. |
| **Lia** | `agent` | L1 | `deepseek-chat` | Shinaa | `#818cf8` | Lead Cluster Audio: Riset akustik, ekstraksi formula harmoni musik, dan analisis data suara. |
| **Momo** | `agent` | L2 | `gemini-2.0-flash` | Rika | `#fb923c` | Kurasi feed komunitas hamster, filtering spam hashtag, dan penjadwalan konten interaktif. |
| **Cody** | `agent` | L2 | `gpt-4o-mini` | Rika | `#facc15` | Auto-responder FAQ, resolusi tiket keluhan user, dan template panduan perawatan hamster. |
| **Aria** | `agent` | L2 | `claude-3-5-haiku` | Lia | `#c084fc` | Sintesis vokal, formant filtering, kompresi dinamik, dan pemrosesan digital signal processing (DSP). |
| **Sonix** | `agent` | L2 | `deepseek-chat` | Lia | `#38bdf8` | FFT (Fast Fourier Transform) Spectrogram Analyzer, deteksi frekuensi puncak nada, dan kalkulasi harmonik. |

---

## ⚡ Fitur Utama Simulasi Mockup

### 1. Graf Orkestrasi Radial Real-time (`@xyflow/react`)
- **Central Core Orchestrator**: Node Shinaa di pusat dengan cincin konsentris berdenyut (*pulse rings*).
- **Auto-Radial Layout**: Penempatan node sub-agent otomatis dalam sudut radial simetris (L1 di ring dalam, L2 di ring luar).
- **Obsidian Force Controls**: Menu slider untuk mengatur gaya gravitasi (`Gravity`), jarak kabel (`Distance`), dan gaya tolak antar-node (`Repulsion`).
- **Interactive Node Dragging**: Geser node ke posisi mana pun dengan persistensi auto-save. Tombol `Reset` mengembalikan posisi ke pola radial rapi.

### 2. Pendelegasian Tugas Dinamis & Animasi Jalur (Delegation Stream)
- **Primary Delegation**: Shinaa mendelegasikan tugas ke sub-agent L1 (Rika atau Lia) dengan animasi garis konektor bercahaya dan partikel bergerak.
- **Hierarchical Multi-Tier Delegation**: Pendelegasian bertingkat otomatis:
  - Instruksi feed/konten: Shinaa ➔ Rika ➔ Momo
  - Instruksi tiket/FAQ: Shinaa ➔ Rika ➔ Cody
  - Instruksi vokal/synth: Shinaa ➔ Lia ➔ Aria
  - Instruksi spektrogram/FFT: Shinaa ➔ Lia ➔ Sonix
- **Secondary Peer Communication (L1 Peer)**: Jalur komunikasi horizontal langsung antar-agen L1 (Rika ➔ Lia atau Lia ➔ Rika) tanpa melalui Orchestrator. Ketik `sinkronisasi peer Rika dan Lia` untuk memicunya.

### 3. Sesi Chat Multi-Target & Autocomplete `@mention`
- **Global Orchestrator Room**: Mengirim pesan ke Shinaa yang akan mengoordinasikan pendelegasian otomatis ke agen yang paling tepat.
- **Direct 1-on-1 Agent Session**: Klik node agen di graf atau pilih dari menu dropdown untuk berbicara privat langsung dengan agen tersebut.
- **Tagging `@mention`**: Ketik `@` di kolom pesan untuk memunculkan popover autocomplete semua agen dengan filter pencarian instan.

### 4. Agent Inspector Drawer
Klik agen mana pun di graf untuk membuka panel inspeksi detail dengan 4 tab:
- **Overview**: Status koneksi, uptime 99.9%, sparkline beban komputasi, dan metrik tugas aktif.
- **Log**: Streaming log eksekusi terminal real-time dengan filter level (`INFO`, `WARN`, `ERROR`) dan tombol salin log.
- **Tasks**: Riwayat tugas pendelegasian lengkap dengan badge status (`Running`, `Done`).
- **Config**: Tampilan read-only untuk System Prompt Directive, toolset yang terhubung (`9router_gateway_v2`, `delegate_task`, `read_telemetry`), batas token, dan temperatur model.

### 5. Simulasi Kegagalan & Auto-Healing (`/simulate-error`)
- Ketik command `/simulate-error` di chat.
- Sistem akan memicu simulasi kegagalan koneksi kernel 9router pada agen.
- Status agen langsung beralih ke `error` (merah), log error tercatat di terminal, dan sistem auto-heal akan memulihkan status ke `online` dalam 3 detik.

### 6. Hermes CLI Slash Commands
Dashboard dilengkapi parser slash command bawaan:
- `/help` — Menampilkan tabel referensi seluruh command.
- `/status` — Informasi runtime node, model, gateway latency, dan context allocation.
- `/plan <task>` — Menghasilkan dekomposisi rencana terstruktur 3-fase.
- `/ask <query>` — Mode konfirmasi dan klarifikasi sebelum aksi dijalankan.
- `/mode <default|planning|ask>` — Mengganti mode eksekusi sistem.
- `/thinking <off|low|medium|high|extended>` — Mengatur alokasi reasoning internal.
- `/model <model_id>` — Mengganti label model AI aktif.
- `/agent <nama_agent>` — Mengalihkan target pesan langsung ke agen tertentu.
- `/clear` — Mereset riwayat percakapan pada project aktif.

### 7. Kanban Board Manajemen Task
- Terhubung langsung dengan pipeline pendelegasian agent: saat task baru dibuat via chat, task otomatis muncul di kolom `In Progress` dan berpindah ke `Done` setelah agen menyelesaikan validasi.
- Modal detail task dengan deskripsi, penanggung jawab (agent avatar), dan ringkasan hasil eksekusi.

---

## 🚀 Panduan Menjalankan

### Persyaratan Lingkungan
- **Node.js**: Versi 20+ atau Node.js 22 (LTS disarankan)
- **Package Manager**: `npm`

### 1. Instalasi Dependensi
```bash
npm install
```

### 2. Menjalankan Server Pengembangan (Port 3000)
```bash
npm run dev
```
Buka browser di:
```text
http://localhost:3000
```

### 3. Menjalankan Pengujian (Vitest Unit & E2E)
Aplikasi dilengkapi 29 pengujian otomatis (unit & end-to-end):
```bash
npm test
```

### 4. Pengecekan Type & Build Produksi
```bash
npm run lint
npm run build
```

---

## 🌐 Akses Jaringan Lokal & Tailscale

Aplikasi telah dikonfigurasi untuk menerima koneksi dari host `0.0.0.0` pada port `3000`:
1. **Local Network (LAN)**: Buka `http://<IP_KOMPUTER_ANDA>:3000` dari smartphone atau laptop lain di Wi-Fi yang sama.
2. **Tailscale Mesh**:
   - Aktifkan Tailscale pada mesin host.
   - Ambil IP Tailscale: `tailscale ip -4`
   - Buka `http://<TAILSCALE_IP>:3000` dari perangkat mobile Android/iOS yang terhubung ke Tailscale.

---

## ⌨️ Shortcut Keyboard

| Shortcut | Aksi |
| :--- | :--- |
| `Ctrl + K` / `Cmd + K` | Fokus langsung ke input chat |
| `[` | Buka / tutup Sidebar Project |
| `]` | Buka / tutup Panel Chat |
| `Esc` | Menutup Drawer Inspector atau Popover yang terbuka |

---

## 📂 Struktur Direktori Proyek

```text
├── src/
│   ├── components/
│   │   ├── chat/          # ChatPanel, Composer, MessageItem, MentionPopover, HermesStatusBar
│   │   ├── graph/         # GraphCanvas, UnifiedAgentNode, DelegationEdge, ObsidianGraphControls
│   │   ├── inspector/     # AgentInspector, OverviewView, LogView, TasksView, ConfigView
│   │   ├── kanban/        # KanbanBoard, KanbanColumn, KanbanCard, TaskModal
│   │   ├── projects/      # ProjectsSidebar, ProjectItem, NewProjectDialog
│   │   └── shell/         # AppShell, TopBar, StatusBar, PanelHandle
│   ├── server/
│   │   └── adapters/      # mock.ts (Simulasi Mockup), hermes.ts (Gateway Stub), types.ts
│   ├── stores/            # Zustand stores: agents, chat, kanban, projects, ui
│   ├── lib/               # Schemas (Zod), formatters, sanitizers
│   └── __tests__/         # Unit test & E2E suite
├── docs/                  # Dokumentasi arsitektur & Phase 2 roadmap
├── .env.example           # Contoh konfigurasi environment
├── index.html             # Entry point HTML & Typography
├── package.json           # Dependensi & skrip dev/test/build
├── vite.config.ts         # Konfigurasi Vite (Host 0.0.0.0, Port 3000, allowedHosts: true)
└── vitest.config.ts       # Konfigurasi runner pengujian jsdom
```

---

## 📚 Dokumentasi Lengkap Proyek

- **[Dokumentasi Arsitektur Sistem & Spesifikasi Detail (docs/ARCHITECTURE.md)](./docs/ARCHITECTURE.md)**: Panduan lengkap arsitektur C4, taksonomi multi-agent, struktur store Zustand, pola adapter async generator, dan skema kontrak DTO.
- **[Asumsi Desain & Implementasi (docs/ASSUMPTIONS.md)](./docs/ASSUMPTIONS.md)**: Catatan keputusan teknis.
- **[Rencana Pengembangan Phase 2 (docs/PHASE2.md)](./docs/PHASE2.md)**: Roadmap integrasi live gateway.

---

## 🔮 Rencana Phase 2 (Live Gateway)

Dalam fase berikutnya saat beralih dari mockup ke produksi:
- Menghubungkan `HermesAdapter` ke endpoint **9router gateway** via Server-Sent Events (SSE).
- Dynamic prompt and agent configuration editing dari UI.
- Autentikasi gateway via `HERMES_TOKEN` di file `.env`.
