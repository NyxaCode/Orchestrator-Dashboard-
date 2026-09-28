# DM Mission Control (DMC) — Rencana Pengembangan Phase 2

Dokumen ini mencatat fitur lanjutan yang sengaja ditunda dari Phase 1 sesuai aturan anti-scope creep:

1. **Integrasi Hermes Agent Aktif**:
   - Menghubungkan `HermesAdapter` ke endpoint WebSocket / SSE 9router gateway (`HERMES_BASE_URL` dan `HERMES_TOKEN`).
   - Translasi otomatis dari streaming event Hermes tool-call (`delegate_task`, `terminal_exec`) ke `delegation.start` dan `task.created`.

2. **Dinamis Tool Configuration (Agent Inspector > Config)**:
   - Form editor untuk mengubah system prompt instruksi agent secara real-time.
   - Pilihan model 9router (Claude 3.7 Sonnet, GPT-4o, DeepSeek R1, Llama 3.3).
   - Pengaturan toolset kustom per agent (browser sandbox, file reader, database connector).

3. **Multi-User Collaboration & Authentication**:
   - Mode otentikasi Bearer Token / Tailscale Identity Header (`AUTH_MODE=token`).
   - Kursor multiplayer pada canvas graf orkestrasi.

4. **Upload Dokumen Nyata (File Attachments)**:
   - Penyimpanan file blob lokal untuk lampiran dataset analisis musik (Lia) dan CSV customer support (Rika).
