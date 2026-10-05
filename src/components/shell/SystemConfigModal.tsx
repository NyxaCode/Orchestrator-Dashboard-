import React, { useState } from 'react';
import { useSystemConfigStore, SimulationScenario } from '../../stores/systemConfig';
import { getCurrentAdapterType } from '../../server/adapters';
import {
  X,
  Sliders,
  Activity,
  Check,
  RotateCcw,
  Zap,
  Flame,
  Gauge,
  Radio,
  Copy,
  Server,
  Terminal,
  ShieldAlert,
} from 'lucide-react';
import { Button } from '../ui/Button';

interface SystemConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SystemConfigModal: React.FC<SystemConfigModalProps> = ({ isOpen, onClose }) => {
  const config = useSystemConfigStore();
  const adapterType = getCurrentAdapterType();

  const [gatewayMode, setGatewayMode] = useState(config.gatewayMode);
  const [gatewayUrl, setGatewayUrl] = useState(config.gatewayUrl);
  const [simulatedLatencyMs, setSimulatedLatencyMs] = useState(config.simulatedLatencyMs);
  const [streamingSpeedMs, setStreamingSpeedMs] = useState(config.streamingSpeedMs);
  const [chaosErrorRate, setChaosErrorRate] = useState(config.chaosErrorRate);
  const [telemetryVerbosity, setTelemetryVerbosity] = useState(config.telemetryVerbosity);
  const [autoRecoverSeconds, setAutoRecoverSeconds] = useState(config.autoRecoverSeconds);
  const [maxConcurrentRuns, setMaxConcurrentRuns] = useState(config.maxConcurrentRuns);

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleApplyScenario = (scenario: SimulationScenario) => {
    config.applyScenario(scenario);
    const updated = useSystemConfigStore.getState();
    setSimulatedLatencyMs(updated.simulatedLatencyMs);
    setStreamingSpeedMs(updated.streamingSpeedMs);
    setChaosErrorRate(updated.chaosErrorRate);
    setTelemetryVerbosity(updated.telemetryVerbosity);
    setAutoRecoverSeconds(updated.autoRecoverSeconds);
    setMaxConcurrentRuns(updated.maxConcurrentRuns);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  const handleSave = () => {
    config.updateConfig({
      gatewayMode,
      gatewayUrl,
      simulatedLatencyMs,
      streamingSpeedMs,
      chaosErrorRate,
      telemetryVerbosity,
      autoRecoverSeconds,
      maxConcurrentRuns,
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  const handleReset = () => {
    if (confirm('Kembalikan konfigurasi sistem simulator ke pengaturan default?')) {
      config.resetDefaults();
      const updated = useSystemConfigStore.getState();
      setGatewayMode(updated.gatewayMode);
      setGatewayUrl(updated.gatewayUrl);
      setSimulatedLatencyMs(updated.simulatedLatencyMs);
      setStreamingSpeedMs(updated.streamingSpeedMs);
      setChaosErrorRate(updated.chaosErrorRate);
      setTelemetryVerbosity(updated.telemetryVerbosity);
      setAutoRecoverSeconds(updated.autoRecoverSeconds);
      setMaxConcurrentRuns(updated.maxConcurrentRuns);
    }
  };

  const handleCopyJson = async () => {
    const payload = {
      gateway_mode: gatewayMode,
      gateway_url: gatewayUrl,
      simulated_latency_ms: simulatedLatencyMs,
      streaming_speed_ms: streamingSpeedMs,
      chaos_error_rate: chaosErrorRate,
      telemetry_verbosity: telemetryVerbosity,
      auto_recover_seconds: autoRecoverSeconds,
      max_concurrent_runs: maxConcurrentRuns,
      exported_at: new Date().toISOString(),
    };
    try {
      await navigator.clipboard.writeText(JSON.stringify(payload, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-xl max-h-[90vh] flex flex-col rounded-2xl bg-[#0f151e] border border-white/15 shadow-2xl text-left overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 shrink-0 bg-[#0a0f16]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-red-950/60 border border-red-500/40 text-red-400">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-mono font-bold text-white uppercase tracking-wider">
                  Simulator Konfigurasi Sistem
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono text-emerald-400 bg-emerald-950/50 border border-emerald-800/40">
                  SANDBOX AKTIF
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-0.5 font-sans">
                Atur parameter simulasi jaringan 9router, latensi, streaming, dan chaos engineering.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 p-5 overflow-y-auto space-y-4 text-xs font-sans text-gray-300">
          {/* Quick Scenario Presets */}
          <div className="p-3.5 rounded-xl bg-[#090d13] border border-white/10 space-y-2">
            <span className="font-mono text-[10px] text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
              <Zap className="w-3 h-3 text-amber-400" />
              <span>Skenario Simulasi Cepat (Quick Presets)</span>
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-[11px]">
              <button
                type="button"
                onClick={() => handleApplyScenario('default')}
                className="p-2 rounded-lg bg-[#141c26] hover:bg-[#1b2533] border border-white/10 text-left transition-colors cursor-pointer"
              >
                <div className="font-bold text-white flex items-center gap-1">
                  <Gauge className="w-3 h-3 text-cyan-400" />
                  <span>Normal</span>
                </div>
                <span className="text-[10px] text-gray-400 block mt-0.5">42ms · 0% error</span>
              </button>

              <button
                type="button"
                onClick={() => handleApplyScenario('fast')}
                className="p-2 rounded-lg bg-[#141c26] hover:bg-[#1b2533] border border-white/10 text-left transition-colors cursor-pointer"
              >
                <div className="font-bold text-emerald-400 flex items-center gap-1">
                  <Zap className="w-3 h-3" />
                  <span>Ultra-Fast</span>
                </div>
                <span className="text-[10px] text-gray-400 block mt-0.5">12ms · Instant</span>
              </button>

              <button
                type="button"
                onClick={() => handleApplyScenario('stress')}
                className="p-2 rounded-lg bg-[#141c26] hover:bg-[#1b2533] border border-white/10 text-left transition-colors cursor-pointer"
              >
                <div className="font-bold text-amber-400 flex items-center gap-1">
                  <Flame className="w-3 h-3" />
                  <span>High Stress</span>
                </div>
                <span className="text-[10px] text-gray-400 block mt-0.5">180ms · 15% chaos</span>
              </button>

              <button
                type="button"
                onClick={() => handleApplyScenario('chaos')}
                className="p-2 rounded-lg bg-[#141c26] hover:bg-[#1b2533] border border-white/10 text-left transition-colors cursor-pointer"
              >
                <div className="font-bold text-red-400 flex items-center gap-1">
                  <ShieldAlert className="w-3 h-3" />
                  <span>Chaos Test</span>
                </div>
                <span className="text-[10px] text-gray-400 block mt-0.5">Auto-heal 2s</span>
              </button>
            </div>
          </div>

          {/* Section 1: Gateway & Adapter */}
          <div className="p-3.5 rounded-xl bg-[#090d13] border border-white/10 space-y-3">
            <span className="font-mono text-[11px] text-white font-bold flex items-center gap-1.5 uppercase">
              <Server className="w-3.5 h-3.5 text-red-400" />
              <span>1. Gateway & Adapter Simulation</span>
            </span>

            <div className="grid grid-cols-2 gap-2 font-mono text-[11px]">
              <div className="space-y-1">
                <label className="text-[10px] text-gray-400">ADAPTER TYPE</label>
                <div className="px-3 py-2 rounded-lg bg-[#141c26] border border-white/10 text-emerald-400 font-bold uppercase flex items-center justify-between">
                  <span>{adapterType}</span>
                  <span className="text-[10px] text-gray-400 font-normal">In-Memory</span>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-gray-400">GATEWAY MESH</label>
                <div className="px-3 py-2 rounded-lg bg-[#141c26] border border-white/10 text-white truncate">
                  <span>9router Bridge (Tailscale)</span>
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] text-gray-400 font-mono">HERMES GATEWAY ENDPOINT (SIMULATOR):</label>
              <input
                type="text"
                value={gatewayUrl}
                onChange={(e) => setGatewayUrl(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-[#141c26] border border-white/15 text-white font-mono text-xs focus:outline-none focus:border-red-500"
              />
            </div>
          </div>

          {/* Section 2: Latency & Streaming Speed */}
          <div className="p-3.5 rounded-xl bg-[#090d13] border border-white/10 space-y-3">
            <span className="font-mono text-[11px] text-white font-bold flex items-center gap-1.5 uppercase">
              <Radio className="w-3.5 h-3.5 text-red-400" />
              <span>2. Simulasi Latensi Jaringan & Throughput</span>
            </span>

            {/* Latency Slider */}
            <div className="space-y-1 font-mono">
              <div className="flex justify-between text-[11px]">
                <span className="text-gray-400">LATENSI JARINGAN TERSIMULASI:</span>
                <span className="text-emerald-400 font-bold">{simulatedLatencyMs} ms</span>
              </div>
              <input
                type="range"
                min="5"
                max="350"
                step="5"
                value={simulatedLatencyMs}
                onChange={(e) => setSimulatedLatencyMs(parseInt(e.target.value, 10))}
                className="w-full accent-red-500 cursor-pointer"
              />
              <div className="flex justify-between text-[9px] text-gray-500">
                <span>5ms (Lokal LAN)</span>
                <span>42ms (Standar 9router)</span>
                <span>350ms (Tinggi)</span>
              </div>
            </div>

            {/* Streaming Speed Slider */}
            <div className="space-y-1 font-mono pt-1">
              <div className="flex justify-between text-[11px]">
                <span className="text-gray-400">KECEPATAN STREAMING KATA:</span>
                <span className="text-purple-300 font-bold">{streamingSpeedMs} ms/token</span>
              </div>
              <input
                type="range"
                min="5"
                max="60"
                step="5"
                value={streamingSpeedMs}
                onChange={(e) => setStreamingSpeedMs(parseInt(e.target.value, 10))}
                className="w-full accent-purple-500 cursor-pointer"
              />
              <div className="flex justify-between text-[9px] text-gray-500">
                <span>5ms (Cepat Sekali)</span>
                <span>20ms (Alami)</span>
                <span>60ms (Lambat/Visual)</span>
              </div>
            </div>
          </div>

          {/* Section 3: Chaos & Resilience */}
          <div className="p-3.5 rounded-xl bg-[#090d13] border border-white/10 space-y-3">
            <span className="font-mono text-[11px] text-white font-bold flex items-center gap-1.5 uppercase">
              <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
              <span>3. Simulasi Ketahanan & Chaos Engineering</span>
            </span>

            <div className="space-y-1 font-mono">
              <div className="flex justify-between text-[11px]">
                <span className="text-gray-400">TINGKAT GANGGUAN / PACKET DROP:</span>
                <span className={`font-bold ${chaosErrorRate > 0 ? 'text-red-400' : 'text-gray-400'}`}>
                  {chaosErrorRate}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="50"
                step="5"
                value={chaosErrorRate}
                onChange={(e) => setChaosErrorRate(parseInt(e.target.value, 10))}
                className="w-full accent-amber-500 cursor-pointer"
              />
              <div className="flex justify-between text-[9px] text-gray-500">
                <span>0% (Stabil Tanpa Gangguan)</span>
                <span>25% (Jaringan Flaky)</span>
                <span>50% (Skenario Bencana)</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1 font-mono text-[10px]">
              <div className="p-2 rounded-lg bg-[#141c26] border border-white/5 space-y-1">
                <span className="text-gray-400 block text-[9px]">INTERVAL AUTO-HEAL</span>
                <select
                  value={autoRecoverSeconds}
                  onChange={(e) => setAutoRecoverSeconds(parseInt(e.target.value, 10))}
                  className="w-full bg-transparent text-white font-bold focus:outline-none cursor-pointer"
                >
                  <option value={1} className="bg-[#121820]">1 detik (Cepat)</option>
                  <option value={3} className="bg-[#121820]">3 detik (Standar)</option>
                  <option value={5} className="bg-[#121820]">5 detik</option>
                  <option value={10} className="bg-[#121820]">10 detik</option>
                </select>
              </div>

              <div className="p-2 rounded-lg bg-[#141c26] border border-white/5 space-y-1">
                <span className="text-gray-400 block text-[9px]">TELEMETRY VERBOSITY</span>
                <select
                  value={telemetryVerbosity}
                  onChange={(e) => setTelemetryVerbosity(e.target.value as any)}
                  className="w-full bg-transparent text-white font-bold focus:outline-none cursor-pointer uppercase"
                >
                  <option value="debug" className="bg-[#121820]">DEBUG (Lengkap)</option>
                  <option value="info" className="bg-[#121820]">INFO (Standar)</option>
                  <option value="warn" className="bg-[#121820]">WARN (Peringatan)</option>
                  <option value="error" className="bg-[#121820]">ERROR (Hanya Galat)</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-5 py-3.5 border-t border-white/10 bg-[#0a0f16] shrink-0 font-mono text-xs">
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-1.5 text-gray-400 hover:text-red-400 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Default</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyJson}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10 transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Tersalin' : 'Export JSON'}</span>
            </button>

            <Button
              size="sm"
              onClick={handleSave}
              className="bg-red-600 hover:bg-red-500 text-white font-semibold flex items-center gap-1.5 shadow-md"
            >
              {savedSuccess ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Tersimpan!</span>
                </>
              ) : (
                <>
                  <Activity className="w-3.5 h-3.5" />
                  <span>Terapkan Simulasi</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
