import React from 'react';
import { AgentDTO } from '../../lib/schemas';
import { Lock, Wrench, Shield, Key } from 'lucide-react';
import { Button } from '../ui/Button';

interface ConfigViewProps {
  agent: AgentDTO;
}

export const ConfigView: React.FC<ConfigViewProps> = ({ agent }) => {
  return (
    <div className="space-y-4 text-xs font-sans text-gray-300">
      {/* Notice Banner */}
      <div className="p-3 rounded-lg bg-white/5 border border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-2 text-gray-400 font-mono text-[11px]">
          <Lock className="w-3.5 h-3.5 text-amber-400" />
          <span>KONFIGURASI READ-ONLY (PHASE 1)</span>
        </div>
        <div className="relative group">
          <Button size="sm" variant="outline" disabled className="text-[11px] opacity-40">
            Edit Config
          </Button>
          <div className="absolute bottom-full right-0 mb-1 hidden group-hover:block px-2 py-1 bg-black/90 border border-white/20 text-[10px] font-mono text-gray-300 rounded shadow-lg whitespace-nowrap">
            Tersedia di Phase 2 (Hermes Dynamic Config)
          </div>
        </div>
      </div>

      {/* System Prompt Summary */}
      <div className="p-3.5 rounded-lg bg-[#0b0f14] border border-white/10 space-y-2">
        <div className="flex items-center gap-1.5 font-mono text-[11px] text-gray-400 uppercase">
          <Shield className="w-3.5 h-3.5 text-red-400" />
          <span>System Prompt Directive</span>
        </div>
        <div className="p-2.5 rounded bg-[#070a0f] border border-white/5 font-mono text-[11px] text-gray-300 leading-relaxed">
          {agent.role === 'orchestrator'
            ? 'Anda adalah Shinaa, Orchestrator DM Mission Control. Terima instruksi user, validasi batasan, petakan ke sub-agent (Rika, Lia, dll), dan sintesis hasil akhir secara terstruktur.'
            : agent.id === 'rika'
            ? 'Anda adalah Rika, asisten CS dan spesialis komunitas hamster. Jawab pertanyaan user dengan nada ramah, periksa data adopsi, dan pastikan kepuasan komunitas optimal.'
            : agent.id === 'lia'
            ? 'Anda adalah Lia, sub-agent komputasi riset akustik dan komposisi musik. Ekstrak data frekuensi audio, pola harmoni, dan siapkan ringkasan teknis.'
            : agent.id === 'momo'
            ? 'Anda adalah Momo, kurator konten & feed hamster. Filter spam, pilih foto/video komunitas terbaik, dan jaga metrik interaksi feed.'
            : agent.id === 'cody'
            ? 'Anda adalah Cody, auto-responder FAQ & resolusi tiket user. Analisis pesan pelanggan, cocokkan dengan basis pengetahuan, dan jawab secara instan.'
            : agent.id === 'aria'
            ? 'Anda adalah Aria, spesialis sintesis vokal & DSP audio waveform. Terapkan formant filtering, kompresi dinamik, dan harmonisasi vokal.'
            : agent.id === 'sonix'
            ? 'Anda adalah Sonix, engine Fast Fourier Transform & analisis spektrogram nada. Ekstrak frekuensi dominan, harmonik ganjil/genap, dan pastikan audio bebas clipping.'
            : `Sub-agent ${agent.name} bertindak sebagai worker terdistribusi di bawah koordinasi Shinaa.`}
        </div>
      </div>

      {/* Active Tools */}
      <div className="p-3.5 rounded-lg bg-[#0b0f14] border border-white/10 space-y-2">
        <div className="flex items-center gap-1.5 font-mono text-[11px] text-gray-400 uppercase">
          <Wrench className="w-3.5 h-3.5 text-red-400" />
          <span>Toolset yang Terhubung</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {['9router_gateway_v2', 'delegate_task', 'read_telemetry', 'memory_sqlite'].map(
            (tool) => (
              <div
                key={tool}
                className="px-2.5 py-1.5 rounded bg-[#121820] border border-white/5 font-mono text-[10px] text-gray-300 flex items-center gap-1.5 truncate"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span className="truncate">{tool}</span>
              </div>
            )
          )}
        </div>
      </div>

      {/* Token Limits */}
      <div className="p-3.5 rounded-lg bg-[#0b0f14] border border-white/10 space-y-2">
        <div className="flex items-center gap-1.5 font-mono text-[11px] text-gray-400 uppercase">
          <Key className="w-3.5 h-3.5 text-red-400" />
          <span>Batas Token & Routing</span>
        </div>
        <div className="grid grid-cols-2 gap-2 font-mono text-[11px]">
          <div className="p-2 rounded bg-[#121820] border border-white/5">
            <span className="text-gray-500 block text-[10px]">MAX OUTPUT TOKENS</span>
            <span className="text-white font-bold">4,096 tokens</span>
          </div>
          <div className="p-2 rounded bg-[#121820] border border-white/5">
            <span className="text-gray-500 block text-[10px]">TEMPERATURE</span>
            <span className="text-white font-bold">0.4 (Deterministic)</span>
          </div>
        </div>
      </div>
    </div>
  );
};
