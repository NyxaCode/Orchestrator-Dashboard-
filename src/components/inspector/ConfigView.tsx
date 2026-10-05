import React, { useState, useEffect } from 'react';
import { AgentDTO } from '../../lib/schemas';
import { useAgentsStore } from '../../stores/agents';
import {
  Cpu,
  Wrench,
  Shield,
  Sliders,
  Play,
  RotateCcw,
  Copy,
  Check,
  Code2,
  Terminal,
  Activity,
  Layers,
  Sparkles,
  Zap,
} from 'lucide-react';
import { Button } from '../ui/Button';

interface ConfigViewProps {
  agent: AgentDTO;
}

const AVAILABLE_MODELS = [
  { id: 'claude-3-7-sonnet', label: 'Claude 3.7 Sonnet (Hybrid Thinking)', provider: 'Anthropic' },
  { id: 'gpt-4o', label: 'GPT-4o Omni', provider: 'OpenAI' },
  { id: 'gpt-4o-mini', label: 'GPT-4o Mini (Fast)', provider: 'OpenAI' },
  { id: 'deepseek-chat', label: 'DeepSeek R1 / V3 (Reasoning)', provider: 'DeepSeek' },
  { id: 'gemini-2.0-flash', label: 'Gemini 2.0 Flash (Low Latency)', provider: 'Google' },
  { id: 'claude-3-5-haiku', label: 'Claude 3.5 Haiku (Compact)', provider: 'Anthropic' },
  { id: 'llama-3.3-70b', label: 'Llama 3.3 70B (Open Weights)', provider: 'Meta' },
  { id: 'hermes-3-llama-3.1-405b', label: 'Hermes 3 405B (Hermes Core)', provider: 'NousResearch' },
];

const AVAILABLE_TOOLS = [
  { id: '9router_gateway_v2', name: '9router Gateway v2', desc: 'Bridge multi-model & routing' },
  { id: 'delegate_task', name: 'delegate_task', desc: 'Protokol delegasi antar agen' },
  { id: 'read_telemetry', name: 'read_telemetry', desc: 'Pemantauan metrik & heartbeat' },
  { id: 'memory_sqlite', name: 'memory_sqlite', desc: 'Penyimpanan memori terisolasi' },
  { id: 'browser_sandbox', name: 'browser_sandbox', desc: 'Inspeksi & navigasi web sandbox' },
  { id: 'audio_dsp_kernel', name: 'audio_dsp_kernel', desc: 'Sintesis DSP & waveform audio' },
  { id: 'file_system_reader', name: 'file_system_reader', desc: 'Pembacaan file konfigurasi lokal' },
  { id: 'code_interpreter', name: 'code_interpreter', desc: 'Eksekusi script & analisis data terisolasi' },
];

const PROMPT_PRESETS: { label: string; text: (name: string, role: string) => string }[] = [
  {
    label: 'Standard Role',
    text: (name, role) =>
      role === 'orchestrator'
        ? `Anda adalah ${name}, Orchestrator DM Mission Control. Terima instruksi user, validasi batasan, petakan ke sub-agent terkait, dan sintesis hasil akhir secara terstruktur.`
        : `Anda adalah ${name}, spesialis worker di bawah koordinasi Orchestrator Shinaa. Eksekusi tugas dengan presisi tinggi dan laporkan hasil secara terstruktur.`,
  },
  {
    label: 'Ketat & Analitis',
    text: (name) =>
      `Anda adalah ${name}. Bekerja dengan tingkat determinisme maksimal. Setiap jawaban harus diawali dengan verifikasi asumsi, bukti logis, dan format terstruktur tanpa basa-basi.`,
  },
  {
    label: 'Empatik & Ramah',
    text: (name) =>
      `Anda adalah ${name}. Berikan respons yang hangat, suportif, komunikatif, dan mudah dipahami, sambil tetap menjaga akurasi instruksi teknis.`,
  },
  {
    label: 'High-Speed Worker',
    text: (name) =>
      `Anda adalah ${name}. Mode efisiensi tinggi: hasilkan output seringkas mungkin dalam format bullet point atau JSON tanpa kalimat pembuka/penutup.`,
  },
];

export const ConfigView: React.FC<ConfigViewProps> = ({ agent }) => {
  const updateAgentConfig = useAgentsStore((s) => s.updateAgentConfig);

  // Form State
  const [activeTab, setActiveTab] = useState<'simulator' | 'json'>('simulator');
  const [modelLabel, setModelLabel] = useState(agent.model_label || 'claude-3-7-sonnet');
  const [systemPrompt, setSystemPrompt] = useState(
    agent.system_prompt ||
      (agent.role === 'orchestrator'
        ? 'Anda adalah Shinaa, Orchestrator DM Mission Control. Terima instruksi user, validasi batasan, petakan ke sub-agent (Rika, Lia, dll), dan sintesis hasil akhir secara terstruktur.'
        : agent.id === 'rika'
        ? 'Anda adalah Rika, asisten CS dan spesialis komunitas hamster. Jawab pertanyaan user dengan nada ramah, periksa data adopsi, dan pastikan kepuasan komunitas optimal.'
        : agent.id === 'lia'
        ? 'Anda adalah Lia, sub-agent komputasi riset akustik dan komposisi musik. Ekstrak data frekuensi audio, pola harmoni, dan siapkan ringkasan teknis.'
        : `Anda adalah ${agent.name}, worker agen di DM Mission Control.`)
  );
  const [temperature, setTemperature] = useState(agent.temperature ?? 0.4);
  const [maxTokens, setMaxTokens] = useState(agent.max_tokens ?? 4096);
  const [thinkingLevel, setThinkingLevel] = useState(agent.thinking_level ?? 'medium');
  const [selectedTools, setSelectedTools] = useState<string[]>(
    agent.tools ?? ['9router_gateway_v2', 'delegate_task', 'read_telemetry', 'memory_sqlite']
  );
  const [contextWindow, setContextWindow] = useState(agent.context_window ?? 1000000);

  // Feedback states
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [copied, setCopied] = useState(false);

  // Simulation Playground State
  const [testQuery, setTestQuery] = useState('');
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulatedResponse, setSimulatedResponse] = useState<string | null>(null);
  const [simulatedThinking, setSimulatedThinking] = useState<string | null>(null);
  const [simMetrics, setSimMetrics] = useState<{ latency: number; tokens: number } | null>(null);

  // Keep state synced if agent changes
  useEffect(() => {
    setModelLabel(agent.model_label || 'claude-3-7-sonnet');
    setSystemPrompt(agent.system_prompt || '');
    setTemperature(agent.temperature ?? 0.4);
    setMaxTokens(agent.max_tokens ?? 4096);
    setThinkingLevel(agent.thinking_level ?? 'medium');
    setSelectedTools(agent.tools ?? ['9router_gateway_v2', 'delegate_task', 'read_telemetry', 'memory_sqlite']);
    setContextWindow(agent.context_window ?? 1000000);
    setSimulatedResponse(null);
    setSimulatedThinking(null);
    setSimMetrics(null);
  }, [agent.id]);

  const toggleTool = (toolId: string) => {
    setSelectedTools((prev) =>
      prev.includes(toolId) ? prev.filter((t) => t !== toolId) : [...prev, toolId]
    );
  };

  const handleApplyPreset = (presetText: string) => {
    setSystemPrompt(presetText);
  };

  const handleSaveToAgent = () => {
    updateAgentConfig(agent.id, {
      model_label: modelLabel,
      system_prompt: systemPrompt,
      temperature,
      max_tokens: maxTokens,
      thinking_level: thinkingLevel as any,
      tools: selectedTools,
      context_window: contextWindow,
    });

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2200);
  };

  const handleResetToDefault = () => {
    if (confirm(`Kembalikan konfigurasi simulator agen ${agent.name} ke default?`)) {
      const defaultPrompt =
        agent.role === 'orchestrator'
          ? 'Anda adalah Shinaa, Orchestrator DM Mission Control. Terima instruksi user, validasi batasan, petakan ke sub-agent (Rika, Lia, dll), dan sintesis hasil akhir secara terstruktur.'
          : `Anda adalah ${agent.name}, worker agen di DM Mission Control.`;
      setSystemPrompt(defaultPrompt);
      setModelLabel(agent.role === 'orchestrator' ? 'claude-3-7-sonnet' : 'gpt-4o-mini');
      setTemperature(0.4);
      setMaxTokens(4096);
      setThinkingLevel('medium');
      setSelectedTools(['9router_gateway_v2', 'delegate_task', 'read_telemetry', 'memory_sqlite']);
      setContextWindow(1000000);
      setSimulatedResponse(null);
    }
  };

  const handleCopyJson = async () => {
    const configPayload = {
      agent_id: agent.id,
      agent_name: agent.name,
      role: agent.role,
      model: modelLabel,
      temperature,
      max_tokens: maxTokens,
      thinking_level: thinkingLevel,
      context_window: contextWindow,
      tools: selectedTools,
      system_prompt: systemPrompt,
      simulated_at: new Date().toISOString(),
    };

    try {
      await navigator.clipboard.writeText(JSON.stringify(configPayload, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  const handleRunSimulation = async () => {
    const query = testQuery.trim() || 'Verifikasi kesiapan modul dan koordinasikan tugas berikutnya.';
    setIsSimulating(true);
    setSimulatedResponse('');
    setSimulatedThinking('Menginisiasi gateway 9router... Mengevaluasi system prompt dan batasan parameter...');
    setSimMetrics(null);

    const start = Date.now();

    // Step 1: Thinking simulation
    await new Promise((r) => setTimeout(r, 600));
    setSimulatedThinking(
      `[Thinking: Level ${thinkingLevel.toUpperCase()}]\n` +
        `• Model: ${modelLabel}\n` +
        `• Temperature: ${temperature.toFixed(2)} (${temperature < 0.35 ? 'Deterministic' : 'Creative'})\n` +
        `• Active Tools: [${selectedTools.join(', ')}]\n` +
        `• System Directive: Evaluasi valid. Merumuskan output terkalibrasi.`
    );

    await new Promise((r) => setTimeout(r, 700));

    // Step 2: Response generation simulation
    let output = '';
    if (agent.role === 'orchestrator') {
      output = `[SIMULASI SHINAA · MODEL: ${modelLabel}]\n` +
        `Instruksi: "${query}" diterima.\n` +
        `1. Parameter evaluasi: Temp=${temperature.toFixed(2)}, MaxTokens=${maxTokens}.\n` +
        `2. Toolset: Terhubung ke ${selectedTools.length} tool aktif.\n` +
        `3. Hasil: Rencana eksekusi tervalidasi. Sub-agent siap menerima pendelegasian terarah.`;
    } else {
      output = `[SIMULASI ${agent.name.toUpperCase()} · MODEL: ${modelLabel}]\n` +
        `Menanggapi: "${query}"\n` +
        `Sesuai directive: "${systemPrompt.slice(0, 70)}..."\n` +
        `Modul ${agent.name} memproses query dengan ${selectedTools.length} tools. Status: Sukses terkalibrasi.`;
    }

    const words = output.split(' ');
    let current = '';
    for (const w of words) {
      current += w + ' ';
      setSimulatedResponse(current);
      await new Promise((r) => setTimeout(r, 20));
    }

    const elapsed = Date.now() - start;
    setSimMetrics({
      latency: elapsed,
      tokens: Math.round(output.length / 4) + (thinkingLevel === 'high' ? 320 : 110),
    });
    setIsSimulating(false);
  };

  const getTemperatureBadge = (val: number) => {
    if (val <= 0.25) return { label: 'Deterministik & Presisi', color: 'text-cyan-400 bg-cyan-950/40 border-cyan-800/40' };
    if (val <= 0.65) return { label: 'Seimbang & Adaptif', color: 'text-emerald-400 bg-emerald-950/40 border-emerald-800/40' };
    return { label: 'Kreatif & Eksploratif', color: 'text-amber-400 bg-amber-950/40 border-amber-800/40' };
  };

  const tempBadge = getTemperatureBadge(temperature);

  return (
    <div className="space-y-4 text-xs font-sans text-gray-300 pb-6">
      {/* Top Banner: Simulator Header & Mode Switcher */}
      <div className="p-3 rounded-xl bg-gradient-to-r from-red-950/40 via-[#121820] to-[#0e141d] border border-red-500/30 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-mono font-bold text-xs text-white">SIMULATOR KONFIGURASI</span>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-mono text-emerald-300 bg-emerald-950/60 border border-emerald-700/50">
                ACTIVE SANDBOX
              </span>
            </div>
            <p className="text-[11px] text-gray-400 font-sans mt-0.5">
              Ubah model, prompt, parameter & toolset secara real-time.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 p-0.5 rounded-lg bg-[#080c10] border border-white/10 font-mono text-[10px]">
          <button
            type="button"
            onClick={() => setActiveTab('simulator')}
            className={`px-2 py-1 rounded transition-colors cursor-pointer ${
              activeTab === 'simulator' ? 'bg-red-600 text-white font-bold' : 'text-gray-400 hover:text-white'
            }`}
          >
            Editor
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('json')}
            className={`px-2 py-1 rounded transition-colors cursor-pointer ${
              activeTab === 'json' ? 'bg-red-600 text-white font-bold' : 'text-gray-400 hover:text-white'
            }`}
          >
            JSON
          </button>
        </div>
      </div>

      {activeTab === 'json' ? (
        /* JSON View */
        <div className="space-y-3">
          <div className="p-3.5 rounded-xl bg-[#090d12] border border-white/10 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[11px] text-gray-400 flex items-center gap-1.5">
                <Code2 className="w-3.5 h-3.5 text-red-400" />
                <span>agent.config.json (Simulasi Payload)</span>
              </span>
              <button
                type="button"
                onClick={handleCopyJson}
                className="flex items-center gap-1 px-2.5 py-1 rounded bg-white/10 hover:bg-white/15 text-white font-mono text-[10px] transition-colors cursor-pointer"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? 'Disalin!' : 'Salin JSON'}</span>
              </button>
            </div>
            <pre className="p-3 rounded-lg bg-[#05080c] border border-white/5 font-mono text-[11px] text-emerald-400 overflow-x-auto max-h-[420px] leading-relaxed selection:bg-red-900/50">
              {JSON.stringify(
                {
                  agent_id: agent.id,
                  name: agent.name,
                  role: agent.role,
                  model: modelLabel,
                  system_prompt: systemPrompt,
                  hyperparameters: {
                    temperature,
                    max_tokens: maxTokens,
                    thinking_level: thinkingLevel,
                    context_window: contextWindow,
                  },
                  active_tools: selectedTools,
                  updated_at: Date.now(),
                },
                null,
                2
              )}
            </pre>
          </div>
        </div>
      ) : (
        /* Interactive Simulator Form */
        <div className="space-y-4">
          {/* Section 1: Model & Reasoning Level */}
          <div className="p-3.5 rounded-xl bg-[#0e141c] border border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[11px] text-white font-bold flex items-center gap-1.5 uppercase">
                <Cpu className="w-3.5 h-3.5 text-red-400" />
                <span>1. Model AI via 9router Gateway</span>
              </span>
              <span className="text-[10px] font-mono text-gray-400">9router Mesh</span>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-mono text-gray-400 block">PILIH MODEL SIMULASI:</label>
              <select
                value={modelLabel}
                onChange={(e) => setModelLabel(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-[#141c26] border border-white/15 text-white font-mono text-xs focus:outline-none focus:border-red-500 cursor-pointer"
              >
                {AVAILABLE_MODELS.map((m) => (
                  <option key={m.id} value={m.id} className="bg-[#121820]">
                    {m.label} ({m.provider})
                  </option>
                ))}
              </select>
            </div>

            {/* Thinking / Reasoning Level */}
            <div className="space-y-1.5 pt-1">
              <div className="flex items-center justify-between text-[10px] font-mono">
                <span className="text-gray-400">THINKING / REASONING LEVEL:</span>
                <span className="text-purple-300 font-bold uppercase">{thinkingLevel}</span>
              </div>
              <div className="grid grid-cols-5 gap-1 font-mono text-[10px]">
                {(['off', 'low', 'medium', 'high', 'extended'] as const).map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setThinkingLevel(lvl)}
                    className={`py-1 rounded text-center transition-all cursor-pointer capitalize ${
                      thinkingLevel === lvl
                        ? 'bg-purple-600 text-white font-bold shadow-xs'
                        : 'bg-[#141c26] text-gray-400 hover:text-white hover:bg-white/5 border border-white/5'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Section 2: System Prompt Directive */}
          <div className="p-3.5 rounded-xl bg-[#0e141c] border border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[11px] text-white font-bold flex items-center gap-1.5 uppercase">
                <Shield className="w-3.5 h-3.5 text-red-400" />
                <span>2. System Prompt Directive</span>
              </span>
              <span className="text-[10px] font-mono text-gray-400">
                {systemPrompt.length} karakter
              </span>
            </div>

            {/* Quick Presets */}
            <div className="flex flex-wrap items-center gap-1 text-[10px] font-mono">
              <span className="text-gray-500 mr-1 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-400" />
                <span>Preset:</span>
              </span>
              {PROMPT_PRESETS.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleApplyPreset(p.text(agent.name, agent.role))}
                  className="px-2 py-0.5 rounded bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-white/10 transition-colors cursor-pointer"
                >
                  {p.label}
                </button>
              ))}
            </div>

            {/* Textarea */}
            <textarea
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
              rows={4}
              placeholder="Instruksi sistem untuk agent..."
              className="w-full p-2.5 rounded-lg bg-[#090d13] border border-white/15 text-gray-200 font-mono text-xs leading-relaxed focus:outline-none focus:border-red-500 resize-y selection:bg-red-900/50"
            />
          </div>

          {/* Section 3: Hyperparameters & Sampling Sliders */}
          <div className="p-3.5 rounded-xl bg-[#0e141c] border border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[11px] text-white font-bold flex items-center gap-1.5 uppercase">
                <Sliders className="w-3.5 h-3.5 text-red-400" />
                <span>3. Hyperparameters & Sampling</span>
              </span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-mono border ${tempBadge.color}`}>
                {tempBadge.label}
              </span>
            </div>

            {/* Temperature Slider */}
            <div className="space-y-1">
              <div className="flex items-center justify-between font-mono text-[10px]">
                <span className="text-gray-400">TEMPERATURE:</span>
                <span className="text-white font-bold">{temperature.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0.0"
                max="1.0"
                step="0.05"
                value={temperature}
                onChange={(e) => setTemperature(parseFloat(e.target.value))}
                className="w-full accent-red-500 cursor-pointer"
              />
              <div className="flex justify-between text-[9px] font-mono text-gray-500">
                <span>0.0 (Presisi/Strict)</span>
                <span>0.5 (Seimbang)</span>
                <span>1.0 (Kreatif)</span>
              </div>
            </div>

            {/* Max Output Tokens & Context Window */}
            <div className="grid grid-cols-2 gap-2 pt-1 font-mono text-[10px]">
              <div className="p-2 rounded-lg bg-[#141c26] border border-white/5 space-y-1">
                <span className="text-gray-400 block text-[9px]">MAX OUTPUT TOKENS</span>
                <select
                  value={maxTokens}
                  onChange={(e) => setMaxTokens(parseInt(e.target.value, 10))}
                  className="w-full bg-transparent text-white font-bold focus:outline-none cursor-pointer"
                >
                  <option value={1024} className="bg-[#121820]">1,024 tokens</option>
                  <option value={2048} className="bg-[#121820]">2,048 tokens</option>
                  <option value={4096} className="bg-[#121820]">4,096 tokens</option>
                  <option value={8192} className="bg-[#121820]">8,192 tokens</option>
                </select>
              </div>

              <div className="p-2 rounded-lg bg-[#141c26] border border-white/5 space-y-1">
                <span className="text-gray-400 block text-[9px]">CONTEXT WINDOW</span>
                <select
                  value={contextWindow}
                  onChange={(e) => setContextWindow(parseInt(e.target.value, 10))}
                  className="w-full bg-transparent text-white font-bold focus:outline-none cursor-pointer"
                >
                  <option value={128000} className="bg-[#121820]">128k tokens</option>
                  <option value={256000} className="bg-[#121820]">256k tokens</option>
                  <option value={1000000} className="bg-[#121820]">1M tokens</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 4: Toolsets Simulator */}
          <div className="p-3.5 rounded-xl bg-[#0e141c] border border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[11px] text-white font-bold flex items-center gap-1.5 uppercase">
                <Wrench className="w-3.5 h-3.5 text-red-400" />
                <span>4. Toolsets Simulator ({selectedTools.length} Aktif)</span>
              </span>
              <span className="text-[10px] font-mono text-gray-400">Dynamic Hooks</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {AVAILABLE_TOOLS.map((tool) => {
                const isActive = selectedTools.includes(tool.id);
                return (
                  <button
                    key={tool.id}
                    type="button"
                    onClick={() => toggleTool(tool.id)}
                    className={`p-2 rounded-lg text-left transition-all border cursor-pointer select-none ${
                      isActive
                        ? 'bg-red-950/30 border-red-500/40 text-white'
                        : 'bg-[#121820] border-white/5 text-gray-400 hover:border-white/15'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[10px] font-semibold truncate">{tool.name}</span>
                      <span
                        className={`w-2 h-2 rounded-full ${
                          isActive ? 'bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]' : 'bg-gray-600'
                        }`}
                      />
                    </div>
                    <p className="text-[9px] text-gray-400 mt-0.5 line-clamp-1">{tool.desc}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 5: Simulation Test Runner (Playground) */}
          <div className="p-3.5 rounded-xl bg-[#0e141c] border border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[11px] text-white font-bold flex items-center gap-1.5 uppercase">
                <Terminal className="w-3.5 h-3.5 text-amber-400" />
                <span>5. Uji Respon Simulator (Playground)</span>
              </span>
              {simMetrics && (
                <span className="font-mono text-[10px] text-emerald-400 flex items-center gap-1">
                  <Zap className="w-3 h-3" />
                  <span>{simMetrics.latency}ms · {simMetrics.tokens} tok</span>
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                value={testQuery}
                onChange={(e) => setTestQuery(e.target.value)}
                placeholder={`Uji respons ${agent.name}...`}
                className="flex-1 px-3 py-1.5 rounded-lg bg-[#090d13] border border-white/15 text-white font-mono text-xs focus:outline-none focus:border-red-500"
                onKeyDown={(e) => e.key === 'Enter' && handleRunSimulation()}
              />
              <Button
                size="sm"
                onClick={handleRunSimulation}
                disabled={isSimulating}
                className="font-mono text-xs flex items-center gap-1 shrink-0 bg-red-600 hover:bg-red-500"
              >
                <Play className="w-3.5 h-3.5" />
                <span>{isSimulating ? 'Memproses...' : 'Uji Respon'}</span>
              </Button>
            </div>

            {/* Simulated Live Output */}
            {(simulatedThinking || simulatedResponse) && (
              <div className="p-3 rounded-lg bg-[#060a0f] border border-white/10 space-y-2 font-mono text-[11px] leading-relaxed">
                {simulatedThinking && (
                  <div className="p-2 rounded bg-purple-950/20 border border-purple-800/30 text-purple-300 text-[10px] whitespace-pre-wrap">
                    {simulatedThinking}
                  </div>
                )}
                {simulatedResponse && (
                  <div className="text-gray-200 whitespace-pre-wrap border-t border-white/5 pt-2">
                    {simulatedResponse}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Action Toolbar */}
          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={handleResetToDefault}
              className="flex items-center gap-1 text-[11px] font-mono text-gray-400 hover:text-red-400 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Default</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopyJson}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-mono border border-white/10 transition-colors cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Tersalin' : 'Copy JSON'}</span>
              </button>

              <Button
                size="sm"
                onClick={handleSaveToAgent}
                className="font-mono text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1.5 shadow-md"
              >
                {savedSuccess ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Tersimpan!</span>
                  </>
                ) : (
                  <>
                    <Activity className="w-3.5 h-3.5" />
                    <span>Terapkan ke Agent</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
