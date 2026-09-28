# DM Mission Control (DMC) — Asumsi Desain & Implementasi (Phase 1)

Berikut adalah daftar asumsi teknis dan operasional yang diambil untuk menyelesaikan implementasi Phase 1:

1. **Adapter Pattern vs Koneksi Hermes Nyata**:
   - Karena gateway Hermes dan 9router belum aktif di sesi sandbox ini, sistem menggunakan `MockAdapter` sebagai sumber kebenaran data interaksi agent, task streaming, status delegasi, dan log telemetri.
   - Interface `AgentAdapter` dirancang steril dari implementasi detail sehingga saat `AGENT_ADAPTER=hermes` diaktifkan di Phase 2, UI dan state management tidak perlu diubah sama sekali.

2. **Penyimpanan State & Persistensi**:
   - Di client-side, Zustand mengelola state terdistribusi untuk Agents, Projects, Chat, dan UI.
   - Posisi drag-and-drop node agent disimpan otomatis dan memicu indikator `AUTO SAVE ●`.
   - Seed data awal menyertakan 3 agent utama (Shinaa, Rika, Lia) dan 4 project contoh.
   - Tombol `+ Add Agent` disediakan untuk menguji skalabilitas graf hingga 12+ sub-agent tanpa tabrakan.

3. **Penanganan Error `/simulate-error`**:
   - Mengetik perintah `/simulate-error` di composer chat memicu skenario kegagalan: status agent berubah menjadi `error` (▲ Error), pesan kesalahan dialirkan, dan sistem auto-recover mengembalikan status ke `online` dalam 3 detik.

4. **Desain Mobile First**:
   - Pada resolusi mobile (< 768px), layout otomatis berpindah ke single-viewport dengan Bottom Navigation 3 tab: `Graph`, `Projects`, dan `Chat`.
   - Inspector agent bertransformasi menjadi Bottom Sheet dengan drag-handle sentuh.
