import React, { useState, useEffect } from 'react';
import { useKanbanStore } from '../../stores/kanban';
import {
  X,
  Copy,
  Check,
  Download,
  Upload,
  RefreshCw,
  FileCode,
  AlertTriangle,
  Save,
} from 'lucide-react';

interface ConfigFileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ConfigFileModal: React.FC<ConfigFileModalProps> = ({ isOpen, onClose }) => {
  const exportTasksConfig = useKanbanStore((s) => s.exportTasksConfig);
  const importTasksConfig = useKanbanStore((s) => s.importTasksConfig);
  const resetToDefaultTasks = useKanbanStore((s) => s.resetToDefaultTasks);

  const [rawJson, setRawJson] = useState('');
  const [copied, setCopied] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setRawJson(exportTasksConfig());
      setErrorMsg(null);
      setSuccessMsg(null);
      setCopied(false);
    }
  }, [isOpen, exportTasksConfig]);

  if (!isOpen) return null;

  const handleCopyForAgent = async () => {
    const promptPayload = `SYSTEM INSTRUCTION FOR HERMES AI AGENT / WORKER:
You are inspecting the active delegation task queue (tasks.config.json).
Review tasks in "ready" or "backlog" status. When picking up a task:
1. Match your model capabilities against the required skills & tools.
2. Execute the prompt_context instructions.
3. Produce the expected output_artifact.

CURRENT CONFIGURATION FILE:
\`\`\`json
${rawJson}
\`\`\``;

    try {
      await navigator.clipboard.writeText(promptPayload);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  const handleSaveAndApply = () => {
    setErrorMsg(null);
    setSuccessMsg(null);

    const result = importTasksConfig(rawJson);
    if (result.success) {
      setSuccessMsg(`Berhasil memuat ${result.count} tasks ke dalam Kanban Board!`);
      setTimeout(() => setSuccessMsg(null), 3000);
    } else {
      setErrorMsg(result.error || 'Gagal menyimpan konfigurasi.');
    }
  };

  const handleDownloadFile = () => {
    const blob = new Blob([rawJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tasks.config-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setRawJson(content);
        const res = importTasksConfig(content);
        if (res.success) {
          setSuccessMsg(`File "${file.name}" berhasil diimpor (${res.count} tasks).`);
        } else {
          setErrorMsg(res.error || 'Gagal membaca file JSON.');
        }
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleReset = () => {
    if (confirm('Kembalikan konfigurasi task ke default awal?')) {
      resetToDefaultTasks();
      setRawJson(exportTasksConfig());
      setSuccessMsg('Konfigurasi dikembalikan ke default.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-3xl max-h-[92vh] flex flex-col rounded-xl bg-[#121820] border border-white/15 shadow-2xl text-left overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 shrink-0 bg-[#0e141c]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-red-950/60 border border-red-500/40 text-red-400">
              <FileCode className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-mono font-bold text-white uppercase tracking-wider">
                  tasks.config.json
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono text-emerald-400 bg-emerald-950/50 border border-emerald-800/40">
                  AI Agent File Spec
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-0.5 font-sans">
                Basis konfigurasi file untuk Hermes AI & Operator. Bisa diedit, diexport, dan disinkronkan langsung.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-2 px-5 py-2.5 bg-[#161e28] border-b border-white/10 text-xs font-mono">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyForAgent}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-semibold transition-all cursor-pointer shadow-md"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Tersalin untuk AI!' : 'Salin Prompt Context untuk Agent'}</span>
            </button>

            <button
              type="button"
              onClick={handleSaveAndApply}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#222e3d] hover:bg-[#2b3a4d] text-white border border-white/15 transition-all cursor-pointer"
            >
              <Save className="w-3.5 h-3.5 text-emerald-400" />
              <span>Terapkan JSON</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <label className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10 transition-all cursor-pointer">
              <Upload className="w-3.5 h-3.5" />
              <span>Import File</span>
              <input
                type="file"
                accept=".json"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>

            <button
              type="button"
              onClick={handleDownloadFile}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10 transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download</span>
            </button>

            <button
              type="button"
              onClick={handleReset}
              title="Reset default tasks"
              className="p-1.5 rounded-lg text-gray-400 hover:text-red-400 hover:bg-white/5 transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Feedback messages */}
        {errorMsg && (
          <div className="flex items-center gap-2 px-5 py-2 bg-red-950/80 border-b border-red-500/40 text-xs text-red-300 font-mono">
            <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="flex items-center gap-2 px-5 py-2 bg-emerald-950/80 border-b border-emerald-500/40 text-xs text-emerald-300 font-mono">
            <Check className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* JSON Code Editor Area */}
        <div className="flex-1 p-4 bg-[#0a0e14] overflow-hidden flex flex-col">
          <textarea
            value={rawJson}
            onChange={(e) => setRawJson(e.target.value)}
            spellCheck={false}
            className="flex-1 w-full h-[380px] p-3 rounded-lg bg-[#0e141c] border border-white/10 text-emerald-300 font-mono text-xs leading-relaxed focus:outline-none focus:border-red-500 resize-none selection:bg-red-900/50"
          />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-white/10 bg-[#0e141c] text-xs font-mono text-gray-400">
          <span>Schema: Zod & JSON-compliant (Hermes Dispatcher)</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-white transition-colors cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
