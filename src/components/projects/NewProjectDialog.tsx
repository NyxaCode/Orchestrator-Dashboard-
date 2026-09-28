import React, { useState } from 'react';
import { X, Check } from 'lucide-react';
import { useAgentsStore } from '../../stores/agents';
import { useProjectsStore } from '../../stores/projects';
import { cleanModelName } from '../../lib/format';
import { Button } from '../ui/Button';
import { IconButton } from '../ui/IconButton';

interface NewProjectDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NewProjectDialog: React.FC<NewProjectDialogProps> = ({ isOpen, onClose }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const agents = useAgentsStore((s) => s.agents);
  const addProject = useProjectsStore((s) => s.addProject);
  
  const subAgents = Object.values(agents).filter((a) => a.role !== 'orchestrator');
  const [selectedAgentIds, setSelectedAgentIds] = useState<string[]>(['rika']);

  if (!isOpen) return null;

  const toggleAgent = (id: string) => {
    setSelectedAgentIds((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    addProject(name.trim(), description.trim(), selectedAgentIds);
    setName('');
    setDescription('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="dialog-title"
        className="w-full max-w-md glass-panel rounded-xl border border-white/15 p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150"
      >
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <h3 id="dialog-title" className="text-base font-semibold text-white">
            Buat Project Baru
          </h3>
          <IconButton aria-label="Tutup dialog" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </IconButton>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-mono text-gray-300 mb-1.5">
              NAMA PROJECT *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="mis. Audit Pipeline Q4"
              className="w-full px-3 py-2 text-sm rounded-lg bg-[#0b0f14] border border-white/15 text-white placeholder-gray-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
            />
          </div>

          <div>
            <label className="block text-xs font-mono text-gray-300 mb-1.5">
              DESKRIPSI
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Tujuan atau cakupan orkestrasi project..."
              className="w-full px-3 py-2 text-sm rounded-lg bg-[#0b0f14] border border-white/15 text-white placeholder-gray-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
            />
          </div>

          <div>
            <label className="block text-xs font-mono text-gray-300 mb-2">
              SUB-AGENT YANG DITUGASKAN
            </label>
            <div className="space-y-1.5 max-h-36 overflow-y-auto">
              {subAgents.map((agent) => {
                const isSelected = selectedAgentIds.includes(agent.id);
                return (
                  <button
                    key={agent.id}
                    type="button"
                    onClick={() => toggleAgent(agent.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-mono border transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-red-950/40 border-red-500/50 text-white'
                        : 'bg-[#121820] border-white/10 text-gray-400 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-4 h-4 rounded flex items-center justify-center border ${
                          isSelected
                            ? 'bg-red-600 border-red-500 text-white'
                            : 'border-white/20'
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3" />}
                      </div>
                      <span className="font-semibold">{agent.name}</span>
                      <span className="text-[10px] text-gray-500">
                        {cleanModelName(agent.model_label)}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/10">
            <Button type="button" variant="ghost" size="sm" onClick={onClose}>
              Batal
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Buat Project
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
