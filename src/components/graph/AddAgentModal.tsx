import React, { useState } from 'react';
import { useAgentsStore } from '../../stores/agents';
import { useProjectsStore } from '../../stores/projects';
import { AgentDTO } from '../../lib/schemas';
import { X, Bot, Sparkles, Check } from 'lucide-react';
import { Button } from '../ui/Button';

interface AddAgentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PRESET_MODELS = [
  'gpt-4o-mini',
  'gemini-2.0-flash',
  'deepseek-chat',
  'claude-3-5-haiku',
  'claude-3-7-sonnet',
  'hermes-3-llama-3.1-405b',
];

const PRESET_COLORS = [
  '#ef4444', // Red (Lead)
  '#f59e0b', // Amber
  '#10b981', // Emerald
  '#06b6d4', // Cyan
  '#3b82f6', // Blue
  '#8b5cf6', // Violet
  '#ec4899', // Pink
  '#f97316', // Orange
];

export const AddAgentModal: React.FC<AddAgentModalProps> = ({ isOpen, onClose }) => {
  const agents = useAgentsStore((s) => s.agents);
  const addAgent = useAgentsStore((s) => s.addAgent);
  const activeProjectId = useProjectsStore((s) => s.activeProjectId);
  const projects = useProjectsStore((s) => s.projects);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [modelLabel, setModelLabel] = useState('gpt-4o-mini');
  const [parentId, setParentId] = useState('shinaa');
  const [color, setColor] = useState('#3b82f6');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const agentList = Object.values(agents);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) {
      setError('Nama agen tidak boleh kosong.');
      return;
    }

    const generatedId = trimmedName
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');

    if (!generatedId) {
      setError('ID agen tidak valid.');
      return;
    }

    if (agents[generatedId]) {
      setError(`Agen dengan ID "${generatedId}" sudah ada. Gunakan nama lain.`);
      return;
    }

    const parentAgent = parentId ? agents[parentId] : null;
    const layer = parentAgent ? (parentAgent.layer || 0) + 1 : 1;

    const newAgent: AgentDTO = {
      id: generatedId,
      name: trimmedName,
      role: 'agent',
      description: description.trim() || 'Sub-agent terdaftar dalam sistem DMC.',
      model_label: modelLabel,
      avatar_url: null,
      status: 'online',
      pos_x: 400 + (Math.random() * 80 - 40),
      pos_y: 300 + (Math.random() * 80 - 40),
      group_id: parentAgent?.group_id || 'custom-cluster',
      parent_id: parentId || 'shinaa',
      layer,
      color,
      uptime: '100%',
      active_tasks_count: 0,
      created_at: Date.now(),
    };

    addAgent(newAgent);

    // Also associate with active project if active
    if (activeProjectId) {
      const currentProj = projects.find((p) => p.id === activeProjectId);
      if (currentProj && !currentProj.agent_ids.includes(generatedId)) {
        currentProj.agent_ids.push(generatedId);
      }
    }

    // Reset and close
    setName('');
    setDescription('');
    setError(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs select-none">
      <div className="w-full max-w-md rounded-2xl bg-[#0e141d] border border-white/15 p-5 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-red-600/20 border border-red-500/40 flex items-center justify-center text-red-400">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white tracking-tight">Tambah Sub-Agent Baru</h3>
              <p className="text-[11px] text-gray-400 font-sans">Registrasikan node agen ke dalam hierarki graf DMC</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-white p-1 rounded-md hover:bg-white/5 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {error && (
          <div className="p-2.5 rounded-lg bg-red-950/50 border border-red-500/40 text-xs text-red-300 font-mono">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs font-sans">
          {/* Name */}
          <div>
            <label className="block text-[11px] font-mono text-gray-400 mb-1">
              NAMA AGEN *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (error) setError(null);
              }}
              placeholder="Contoh: Nova, Kimi, Byte..."
              className="w-full px-3 py-2 rounded-lg bg-[#141b24] border border-white/15 text-white placeholder-gray-500 focus:outline-none focus:border-red-500 font-sans text-xs"
            />
          </div>

          {/* Description / Specialty */}
          <div>
            <label className="block text-[11px] font-mono text-gray-400 mb-1">
              SPESIALISASI / TUGAS
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Deskripsi kemampuan atau domain pendelegasian agen..."
              className="w-full px-3 py-2 rounded-lg bg-[#141b24] border border-white/15 text-white placeholder-gray-500 focus:outline-none focus:border-red-500 font-sans text-xs resize-none"
            />
          </div>

          {/* Model AI */}
          <div>
            <label className="block text-[11px] font-mono text-gray-400 mb-1">
              MODEL AI
            </label>
            <select
              value={modelLabel}
              onChange={(e) => setModelLabel(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-[#141b24] border border-white/15 text-white font-mono text-xs focus:outline-none focus:border-red-500 cursor-pointer"
            >
              {PRESET_MODELS.map((m) => (
                <option key={m} value={m} className="bg-[#141b24] text-white">
                  {m}
                </option>
              ))}
            </select>
          </div>

          {/* Parent Supervisor */}
          <div>
            <label className="block text-[11px] font-mono text-gray-400 mb-1">
              SUPERVISOR / INDUK HIERARKI
            </label>
            <select
              value={parentId}
              onChange={(e) => setParentId(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-[#141b24] border border-white/15 text-white font-mono text-xs focus:outline-none focus:border-red-500 cursor-pointer"
            >
              {agentList.map((a) => (
                <option key={a.id} value={a.id} className="bg-[#141b24] text-white">
                  {a.name} ({a.role === 'orchestrator' ? 'Orchestrator Lead' : `Sub-Agent L${a.layer || 1}`})
                </option>
              ))}
            </select>
          </div>

          {/* Color Accent */}
          <div>
            <label className="block text-[11px] font-mono text-gray-400 mb-1">
              WARNA INDIKATOR
            </label>
            <div className="flex items-center gap-2">
              {PRESET_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className="w-6 h-6 rounded-full flex items-center justify-center transition-transform hover:scale-110 cursor-pointer"
                  style={{ backgroundColor: c }}
                  title={c}
                >
                  {color === c && <Check className="w-3.5 h-3.5 text-white stroke-[3]" />}
                </button>
              ))}
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/10">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              className="font-mono text-xs"
            >
              Batal
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              className="font-mono text-xs gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Simpan Agen</span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
