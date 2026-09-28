# DM Mission Control (DMC) — Multi-Agent Orchestration Dashboard

Dashboard orkestrasi chatting multi-agent dengan 1 Orchestrator (Shinaa) sebagai pusat komando dan N Sub-Agent di sekelilingnya via 9router model gateway.

## Fitur Utama (Phase 1)
- **Radial Orchestration Graph**: Tampilan graf real-time dengan `@xyflow/react`. Orchestrator di pusat dengan cincin konsentris berdenyut, sub-agent di cincin radial otomatis.
- **Dynamic Task Delegation**: Edge konektor dashed animasi dengan partikel bergerak saat Shinaa mendelegasikan tugas ke Rika atau Lia.
- **Chat & Multi-Agent Targeting**: Chat langsung ke Orchestrator atau pilih sub-agent via tombol node atau `@mention`.
- **Agent Inspector**: Panel drawer tab Overview (sparkline beban), Log (terminal stream + copy), Tasks (riwayat delegasi), dan Config.
- **Error Simulation**: Ketik `/simulate-error` di chat untuk menguji deteksi failure dan auto-recovery.
- **Skalabilitas N-Agent**: Tombol `+ Add Agent` untuk menguji tata letak hingga 12+ sub-agent tanpa tabrakan.
- **Mobile Optimized**: Layar Android responsive dengan Bottom Navigation dan touch bottom sheet.

## Cara Menjalankan

### Persyaratan
- Node.js 20+ / Node.js 22
- npm

### Instalasi & Menjalankan di Local / Windows
```bash
npm install
npm run dev
```

Server akan aktif di `http://localhost:3000`.

### Akses via Tailscale
1. Jalankan Tailscale di mesin host Anda.
2. Dapatkan IP Tailscale mesin Anda (`tailscale ip -4`).
3. Akses dari browser Android atau perangkat lain di jaringan Tailscale:
   `http://<TAILSCALE_IP>:3000`

## Konfigurasi Environment (`.env`)
```bash
# Pilihan adapter: 'mock' (default Phase 1) atau 'hermes' (Phase 2)
AGENT_ADAPTER=mock

# Konfigurasi Hermes (Phase 2)
HERMES_BASE_URL=http://localhost:8080
HERMES_TOKEN=your_9router_bearer_token
```

## Shortcut Keyboard
- `Ctrl + K` / `Cmd + K`: Fokus ke input pesan chat
- `[`: Buka/tutup sidebar projects
- `]`: Buka/tutup panel chat
- `Esc`: Tutup drawer Inspector / popover
