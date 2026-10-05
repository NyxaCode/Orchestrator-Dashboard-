import React, { useState, useEffect } from 'react';
import { KanbanTaskDTO, KanbanColumnId, KanbanPriority } from '../../lib/schemas';
import { useKanbanStore } from '../../stores/kanban';
import { useAgentsStore } from '../../stores/agents';
import { useProjectsStore } from '../../stores/projects';
import { AgentAvatar } from '../ui/AgentAvatar';
import {
  X,
  Plus,
  Trash2,
  Tag,
  Wrench,
  Zap,
  FileCode,
  FileCheck,
  User,
  FolderGit2,
} from 'lucide-react';
import { cn } from '../../lib/cn';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  taskToEdit?: KanbanTaskDTO | null;
  defaultColumnId?: KanbanColumnId;
}

const COMMON_TAGS = ['frontend', 'backend', 'gateway', 'audio', 'security', 'crawler', 'llm', 'bugfix', 'docs'];
const COMMON_SKILLS = [
  'prompt-engineering',
  'code-analysis',
  'stream-parsing',
  'fourier-transform',
  'content-moderation',
  'benchmarking',
  'circuit-breaker',
];
const COMMON_TOOLS = [
  'web_search',
  'file_editor',
  'bash_terminal',
  'code_exec',
  'git_manager',
  'browser_eval',
];

export const TaskModal: React.FC<TaskModalProps> = ({
  isOpen,
  onClose,
  taskToEdit,
  defaultColumnId = 'backlog',
}) => {
  const addTask = useKanbanStore((s) => s.addTask);
  const updateTask = useKanbanStore((s) => s.updateTask);

  const agents = useAgentsStore((s) => s.agents);
  const agentList = Object.values(agents);

  const projects = useProjectsStore((s) => s.projects);
  const activeProjectId = useProjectsStore((s) => s.activeProjectId);
  const activeSubProjectId = useProjectsStore((s) => s.activeSubProjectId);
  const currentProject = projects.find((p) => p.id === activeProjectId);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [subProjectId, setSubProjectId] = useState<string | null>(null);
  const [columnId, setColumnId] = useState<KanbanColumnId>(defaultColumnId);
  const [priority, setPriority] = useState<KanbanPriority>('medium');
  const [assignedAgentId, setAssignedAgentId] = useState<string | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [skills, setSkills] = useState<string[]>([]);
  const [tools, setTools] = useState<string[]>([]);
  const [promptContext, setPromptContext] = useState('');
  const [outputArtifact, setOutputArtifact] = useState('');

  const [tagInput, setTagInput] = useState('');
  const [skillInput, setSkillInput] = useState('');
  const [toolInput, setToolInput] = useState('');

  useEffect(() => {
    if (taskToEdit) {
      setTitle(taskToEdit.title);
      setDescription(taskToEdit.description);
      setSubProjectId(taskToEdit.sub_project_id || null);
      setColumnId(taskToEdit.column_id);
      setPriority(taskToEdit.priority);
      setAssignedAgentId(taskToEdit.assigned_agent_id || null);
      setTags(taskToEdit.tags || []);
      setSkills(taskToEdit.skills || []);
      setTools(taskToEdit.tools || []);
      setPromptContext(taskToEdit.prompt_context || '');
      setOutputArtifact(taskToEdit.output_artifact || '');
    } else {
      setTitle('');
      setDescription('');
      setSubProjectId(activeSubProjectId || currentProject?.sub_projects?.[0]?.id || null);
      setColumnId(defaultColumnId);
      setPriority('medium');
      setAssignedAgentId(null);
      setTags([]);
      setSkills([]);
      setTools([]);
      setPromptContext('');
      setOutputArtifact('');
    }
  }, [taskToEdit, defaultColumnId, isOpen, activeSubProjectId, currentProject]);

  if (!isOpen) return null;

  const handleAddTag = (t: string) => {
    const clean = t.trim().toLowerCase().replace(/^#/, '');
    if (clean && !tags.includes(clean)) {
      setTags([...tags, clean]);
    }
    setTagInput('');
  };

  const handleRemoveTag = (t: string) => {
    setTags(tags.filter((item) => item !== t));
  };

  const handleAddSkill = (s: string) => {
    const clean = s.trim().toLowerCase();
    if (clean && !skills.includes(clean)) {
      setSkills([...skills, clean]);
    }
    setSkillInput('');
  };

  const handleRemoveSkill = (s: string) => {
    setSkills(skills.filter((item) => item !== s));
  };

  const handleAddTool = (tool: string) => {
    const clean = tool.trim().toLowerCase();
    if (clean && !tools.includes(clean)) {
      setTools([...tools, clean]);
    }
    setToolInput('');
  };

  const handleRemoveTool = (tool: string) => {
    setTools(tools.filter((item) => item !== tool));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    if (taskToEdit) {
      updateTask(taskToEdit.id, {
        title: title.trim(),
        description: description.trim(),
        sub_project_id: subProjectId,
        column_id: columnId,
        priority,
        assigned_agent_id: assignedAgentId,
        tags,
        skills,
        tools,
        prompt_context: promptContext.trim(),
        output_artifact: outputArtifact.trim() || null,
      });
    } else {
      addTask({
        project_id: activeProjectId,
        sub_project_id: subProjectId,
        title: title.trim(),
        description: description.trim(),
        column_id: columnId,
        priority,
        assigned_agent_id: assignedAgentId,
        tags,
        skills,
        tools,
        prompt_context: promptContext.trim(),
        output_artifact: outputArtifact.trim() || null,
        created_by: 'operator',
      });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-2xl max-h-[92dvh] flex flex-col rounded-xl bg-[#121820] border border-white/15 shadow-2xl text-left overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-4 sm:px-5 py-3 sm:py-4 border-b border-white/10 shrink-0 bg-[#0e141c]">
          <div className="min-w-0 pr-2">
            <h3 className="text-xs sm:text-sm font-mono font-bold text-white uppercase tracking-wider truncate">
              {taskToEdit ? `EDIT TASK [${taskToEdit.id}]` : 'BUAT TASK BARU UNTUK AGENT AI'}
            </h3>
            <p className="text-[11px] sm:text-xs text-gray-400 mt-0.5 font-sans truncate">
              Spesifikasi tugas, prompt instruction, skill & tool yang dibaca oleh Hermes.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-3.5 sm:p-5 space-y-3.5 sm:space-y-4">
          {/* Title */}
          <div>
            <label className="block text-xs font-mono text-gray-300 font-semibold mb-1">
              Judul Task <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Contoh: Audit Fallback Latency Gateway..."
              className="w-full px-3 py-2 text-xs rounded-lg bg-[#18212d] border border-white/15 text-white placeholder-gray-500 focus:outline-none focus:border-red-500 font-sans"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-mono text-gray-300 font-semibold mb-1">
              Deskripsi Singkat
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Jelaskan ringkasan tujuan tugas ini..."
              className="w-full px-3 py-2 text-xs rounded-lg bg-[#18212d] border border-white/15 text-white placeholder-gray-500 focus:outline-none focus:border-red-500 font-sans resize-none"
            />
          </div>

          {/* Grid: Sub-Project, Column, Priority */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Sub-Project */}
            <div>
              <label className="block text-xs font-mono text-gray-300 font-semibold mb-1">
                Sub-Project
              </label>
              <select
                value={subProjectId || ''}
                onChange={(e) => setSubProjectId(e.target.value || null)}
                className="w-full px-2.5 py-1.5 text-xs rounded-lg bg-[#18212d] border border-white/15 text-white focus:outline-none focus:border-red-500 font-mono"
              >
                <option value="">(Tanpa Sub-Project)</option>
                {currentProject?.sub_projects?.map((sp) => (
                  <option key={sp.id} value={sp.id}>
                    {sp.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Column Status */}
            <div>
              <label className="block text-xs font-mono text-gray-300 font-semibold mb-1">
                Kolom Status
              </label>
              <select
                value={columnId}
                onChange={(e) => setColumnId(e.target.value as KanbanColumnId)}
                className="w-full px-2.5 py-1.5 text-xs rounded-lg bg-[#18212d] border border-white/15 text-white focus:outline-none focus:border-red-500 font-mono uppercase"
              >
                <option value="backlog">📋 Backlog</option>
                <option value="ready">⚡ Ready / Queue</option>
                <option value="in_progress">🚀 In Progress</option>
                <option value="review">🔍 Review</option>
                <option value="done">✅ Done</option>
              </select>
            </div>

            {/* Priority */}
            <div>
              <label className="block text-xs font-mono text-gray-300 font-semibold mb-1">
                Prioritas
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as KanbanPriority)}
                className="w-full px-2.5 py-1.5 text-xs rounded-lg bg-[#18212d] border border-white/15 text-white focus:outline-none focus:border-red-500 font-mono uppercase"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
          </div>

          {/* Assigned Agent Picker */}
          <div>
            <label className="block text-xs font-mono text-gray-300 font-semibold mb-1">
              Assign ke Agent AI
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => setAssignedAgentId(null)}
                className={cn(
                  'flex items-center gap-2 p-2 rounded-lg border text-left cursor-pointer transition-all',
                  assignedAgentId === null
                    ? 'border-red-500 bg-red-950/40 text-white'
                    : 'border-white/10 bg-[#161e28] text-gray-400 hover:text-white'
                )}
              >
                <User className="w-4 h-4 text-gray-500" />
                <span className="text-xs font-mono truncate">Unassigned</span>
              </button>

              {agentList.map((agent) => (
                <button
                  key={agent.id}
                  type="button"
                  onClick={() => setAssignedAgentId(agent.id)}
                  className={cn(
                    'flex items-center gap-2 p-2 rounded-lg border text-left cursor-pointer transition-all',
                    assignedAgentId === agent.id
                      ? 'border-red-500 bg-red-950/40 text-white shadow-xs'
                      : 'border-white/10 bg-[#161e28] text-gray-400 hover:text-white'
                  )}
                >
                  <div className="w-5 h-5 rounded-full overflow-hidden shrink-0">
                    <AgentAvatar agent={agent} size="sm" />
                  </div>
                  <span className="text-xs font-medium truncate">{agent.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* PROMPT DIRECTIVE CONTEXT (The heart of the AI agent instruction) */}
          <div className="p-3.5 rounded-xl bg-[#0b0f15] border border-red-500/30 space-y-2">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-1.5 text-xs font-mono text-red-400 font-bold uppercase tracking-wider">
                <FileCode className="w-3.5 h-3.5" />
                <span>Prompt Directives (Instruksi Eksekusi Agen)</span>
              </label>
              <span className="text-[10px] font-mono text-gray-500">
                Dibaca Hermes saat didelegasikan
              </span>
            </div>
            <textarea
              rows={4}
              value={promptContext}
              onChange={(e) => setPromptContext(e.target.value)}
              placeholder="Tuliskan prompt spesifik untuk agent, contoh:
1. Parse log error di /var/log/nginx.
2. Identifikasi 429 rate limit.
3. Buat patch konfigurasi JSON..."
              className="w-full px-3 py-2 text-xs rounded-lg bg-[#141b24] border border-white/10 text-gray-200 placeholder-gray-500 focus:outline-none focus:border-red-500 font-mono resize-y"
            />
          </div>

          {/* Skills & Tools Management */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Required Skills */}
            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-xs font-mono text-purple-300 font-semibold">
                <Zap className="w-3.5 h-3.5 text-purple-400" />
                <span>Required Skills</span>
              </label>
              <div className="flex gap-1.5">
                <input
                  type="text"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddSkill(skillInput);
                    }
                  }}
                  placeholder="Tambah skill..."
                  className="flex-1 px-2.5 py-1 text-xs rounded bg-[#18212d] border border-white/15 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 font-mono"
                />
                <button
                  type="button"
                  onClick={() => handleAddSkill(skillInput)}
                  className="px-2.5 py-1 rounded bg-purple-900/60 hover:bg-purple-800 text-purple-200 text-xs font-mono cursor-pointer"
                >
                  +
                </button>
              </div>

              {/* Skills list */}
              <div className="flex flex-wrap gap-1 mt-1">
                {skills.map((s) => (
                  <span
                    key={s}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-purple-950/60 border border-purple-800/50 text-[10px] font-mono text-purple-200"
                  >
                    <span>{s}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(s)}
                      className="text-purple-400 hover:text-white cursor-pointer"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>

              {/* Common Skills suggestions */}
              <div className="pt-1">
                <p className="text-[10px] text-gray-500 font-mono">Saran skill:</p>
                <div className="flex flex-wrap gap-1 mt-0.5">
                  {COMMON_SKILLS.filter((s) => !skills.includes(s)).slice(0, 4).map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => handleAddSkill(s)}
                      className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-white/5 hover:bg-white/10 text-gray-400 hover:text-purple-300 border border-white/5 cursor-pointer"
                    >
                      +{s}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Required Tools */}
            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-xs font-mono text-cyan-300 font-semibold">
                <Wrench className="w-3.5 h-3.5 text-cyan-400" />
                <span>Required Tools</span>
              </label>
              <div className="flex gap-1.5">
                <input
                  type="text"
                  value={toolInput}
                  onChange={(e) => setToolInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddTool(toolInput);
                    }
                  }}
                  placeholder="Tambah tool..."
                  className="flex-1 px-2.5 py-1 text-xs rounded bg-[#18212d] border border-white/15 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 font-mono"
                />
                <button
                  type="button"
                  onClick={() => handleAddTool(toolInput)}
                  className="px-2.5 py-1 rounded bg-cyan-900/60 hover:bg-cyan-800 text-cyan-200 text-xs font-mono cursor-pointer"
                >
                  +
                </button>
              </div>

              {/* Tools list */}
              <div className="flex flex-wrap gap-1 mt-1">
                {tools.map((t) => (
                  <span
                    key={t}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-cyan-950/60 border border-cyan-800/50 text-[10px] font-mono text-cyan-200"
                  >
                    <span>{t}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveTool(t)}
                      className="text-cyan-400 hover:text-white cursor-pointer"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>

              {/* Common Tools suggestions */}
              <div className="pt-1">
                <p className="text-[10px] text-gray-500 font-mono">Saran tool:</p>
                <div className="flex flex-wrap gap-1 mt-0.5">
                  {COMMON_TOOLS.filter((t) => !tools.includes(t)).slice(0, 4).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => handleAddTool(t)}
                      className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-white/5 hover:bg-white/10 text-gray-400 hover:text-cyan-300 border border-white/5 cursor-pointer"
                    >
                      +{t}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-1.5">
            <label className="flex items-center gap-1.5 text-xs font-mono text-gray-300 font-semibold">
              <Tag className="w-3.5 h-3.5 text-gray-400" />
              <span>Tags / Label</span>
            </label>
            <div className="flex gap-1.5">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTag(tagInput);
                  }
                }}
                placeholder="Tambah tag (misal: frontend, api)..."
                className="flex-1 px-2.5 py-1 text-xs rounded bg-[#18212d] border border-white/15 text-white placeholder-gray-500 focus:outline-none focus:border-red-500 font-mono"
              />
              <button
                type="button"
                onClick={() => handleAddTag(tagInput)}
                className="px-2.5 py-1 rounded bg-[#222e3d] hover:bg-[#2b3a4d] text-white text-xs font-mono cursor-pointer"
              >
                + Tag
              </button>
            </div>

            <div className="flex flex-wrap gap-1 mt-1">
              {tags.map((t) => (
                <span
                  key={t}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-white/10 border border-white/15 text-[10px] font-mono text-gray-200"
                >
                  <span>#{t}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(t)}
                    className="text-gray-400 hover:text-white cursor-pointer"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>

            <div className="flex flex-wrap gap-1 pt-1">
              {COMMON_TAGS.filter((t) => !tags.includes(t)).slice(0, 6).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => handleAddTag(t)}
                  className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white border border-white/5 cursor-pointer"
                >
                  +{t}
                </button>
              ))}
            </div>
          </div>

          {/* Expected Output Artifact */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-mono text-emerald-400 font-semibold mb-1">
              <FileCheck className="w-3.5 h-3.5" />
              <span>Output Artifact (File Hasil Target)</span>
            </label>
            <input
              type="text"
              value={outputArtifact}
              onChange={(e) => setOutputArtifact(e.target.value)}
              placeholder="Contoh: dist/patch.json atau reports/summary.md"
              className="w-full px-3 py-1.5 text-xs rounded-lg bg-[#18212d] border border-white/15 text-emerald-300 placeholder-gray-500 focus:outline-none focus:border-emerald-500 font-mono"
            />
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-2 pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs font-mono text-gray-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-mono font-bold shadow-lg shadow-red-900/40 transition-all cursor-pointer"
            >
              {taskToEdit ? 'Simpan Perubahan' : 'Buat Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
