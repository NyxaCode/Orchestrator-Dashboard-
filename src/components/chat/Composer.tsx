import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  ArrowUp,
  Square,
  Paperclip,
  Mic,
  MicOff,
  Check,
  ChevronDown,
  X,
  FileCode,
  FileArchive,
  FileText,
  File as FileIcon,
} from 'lucide-react';
import { useChatStore, HermesMode, ThinkingLevel } from '../../stores/chat';
import { useAgentsStore } from '../../stores/agents';
import { MentionPopover } from './MentionPopover';
import { HermesCommandPopover, HermesCommand, HERMES_COMMANDS } from './HermesCommandPopover';
import { AgentDTO } from '../../lib/schemas';
import { extractAllMentions } from '../../lib/sanitize';

export interface ComposerAttachment {
  name: string;
  size: number;
  type?: string;
}

interface ComposerProps {
  projectId: string;
  onSendMessage: (content: string, attachments?: ComposerAttachment[]) => void;
  onCancelStream: () => void;
  isStreaming: boolean;
  disabled?: boolean;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getFileIcon(fileName: string) {
  const ext = fileName.split('.').pop()?.toLowerCase();
  if (['ts', 'js', 'jsx', 'tsx', 'py', 'json', 'html', 'css', 'go', 'rs', 'sh', 'sql'].includes(ext || '')) {
    return <FileCode className="w-3.5 h-3.5 text-cyan-400 shrink-0" />;
  }
  if (['zip', 'rar', 'tar', 'gz', '7z'].includes(ext || '')) {
    return <FileArchive className="w-3.5 h-3.5 text-amber-400 shrink-0" />;
  }
  if (['txt', 'md', 'pdf', 'doc', 'docx', 'csv', 'log'].includes(ext || '')) {
    return <FileText className="w-3.5 h-3.5 text-emerald-400 shrink-0" />;
  }
  return <FileIcon className="w-3.5 h-3.5 text-red-400 shrink-0" />;
}

const HERMES_MODELS = [
  { id: 'claude-opus-4.6', label: 'claude-opus-4.6', shortLabel: 'opus-4.6', provider: 'anthropic/claude-opus-4.6' },
  { id: 'openai/gpt-oss-20b', label: 'openai/gpt-oss-20b', shortLabel: 'gpt-oss-20b', provider: 'openai/gpt-oss-20b' },
  { id: 'deepseek-chat', label: 'deepseek-chat', shortLabel: 'deepseek', provider: 'deepseek/deepseek-v3' },
  { id: 'gemini-2.5-pro', label: 'gemini-2.5-pro', shortLabel: 'gemini-2.5', provider: 'google/gemini-2.5-pro' },
  { id: 'hermes-3-llama-3.1-405b', label: 'hermes-3-405b', shortLabel: 'hermes-3', provider: 'nousresearch/hermes-3' },
];

export const Composer: React.FC<ComposerProps> = ({
  projectId,
  onSendMessage,
  onCancelStream,
  isStreaming,
  disabled,
}) => {
  const [content, setContent] = useState('');
  const [mentionFilter, setMentionFilter] = useState<string | null>(null);
  const [commandFilter, setCommandFilter] = useState<string | null>(null);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const [attachments, setAttachments] = useState<ComposerAttachment[]>([]);

  // Popover menus state (pure text dropdowns)
  const [openDropdown, setOpenDropdown] = useState<'mode' | 'model' | 'thinking' | null>(null);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const agents = useAgentsStore((s) => s.agents);

  // Per-project Hermes state from store
  const projectConfigs = useChatStore((s) => s.projectConfigs);
  const setHermesMode = useChatStore((s) => s.setHermesMode);
  const setThinkingLevel = useChatStore((s) => s.setThinkingLevel);
  const setHermesModel = useChatStore((s) => s.setHermesModel);
  const setTargetAgentId = useChatStore((s) => s.setTargetAgentId);
  const toggleVoice = useChatStore((s) => s.toggleVoice);

  const rawConfig = projectConfigs[projectId];
  const config = {
    hermesMode: rawConfig?.hermesMode || 'default',
    thinkingLevel: rawConfig?.thinkingLevel || 'medium',
    hermesModel: rawConfig?.hermesModel || 'claude-opus-4.6',
    voiceActive: Boolean(rawConfig?.voiceActive),
    targetAgentId: rawConfig?.targetAgentId ?? null,
    sessionStartTime: rawConfig?.sessionStartTime || Date.now() - 938000,
    tokenUsage: {
      used: rawConfig?.tokenUsage?.used ?? 0,
      max: rawConfig?.tokenUsage?.max ?? 1000000,
    },
    sessionsCount: rawConfig?.sessionsCount ?? 2,
  };

  const hermesMode = config.hermesMode;
  const thinkingLevel = config.thinkingLevel;
  const hermesModel = config.hermesModel;
  const targetAgentId = config.targetAgentId;
  const voiceActive = config.voiceActive;

  const agentList = Object.values(agents || {});
  const targetAgent = targetAgentId && agents ? agents[targetAgentId] : null;

  // Filtered items for keyboard navigation and Tab selection
  const matchedAgents = useMemo(() => {
    if (mentionFilter === null) return [];
    return agentList.filter(
      (a) =>
        a.name.toLowerCase().includes(mentionFilter.toLowerCase()) ||
        a.id.toLowerCase().includes(mentionFilter.toLowerCase())
    );
  }, [mentionFilter, agentList]);

  const matchedCommands = useMemo(() => {
    if (commandFilter === null) return [];
    const cleanFilter = commandFilter.toLowerCase().replace(/^\//, '');
    return HERMES_COMMANDS.filter((cmd) => {
      if (!cleanFilter) return true;
      return (
        cmd.command.toLowerCase().includes(cleanFilter) ||
        cmd.description.toLowerCase().includes(cleanFilter)
      );
    });
  }, [commandFilter]);

  // Short label for model display button
  const currentModelMeta = HERMES_MODELS.find((m) => m.id === hermesModel);
  const modelShortDisplay = targetAgent
    ? targetAgent.name
    : currentModelMeta?.shortLabel || (typeof hermesModel === 'string' ? hermesModel.split('/').pop() : '') || 'opus 4.6';

  // Extract all agents mentioned anywhere in content
  const mentionedAgents = extractAllMentions(content, agents);

  // Auto-grow textarea up to 6 lines (approx 140px)
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 140)}px`;
    }
  }, [content]);

  // Close any popover when clicking outside
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('[data-hermes-popover]')) {
        setOpenDropdown(null);
      }
    };
    window.addEventListener('click', handleOutsideClick);
    return () => window.removeEventListener('click', handleOutsideClick);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Escape') {
      setMentionFilter(null);
      setCommandFilter(null);
      setOpenDropdown(null);
      return;
    }

    // Keyboard navigation & Tab selection for @mentions (VS Code style)
    if (mentionFilter !== null && matchedAgents.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setHighlightedIndex((prev) => (prev + 1) % matchedAgents.length);
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setHighlightedIndex((prev) => (prev - 1 + matchedAgents.length) % matchedAgents.length);
        return;
      }
      if (e.key === 'Tab') {
        e.preventDefault();
        const selected = matchedAgents[highlightedIndex] || matchedAgents[0];
        if (selected) {
          handleSelectMention(selected);
        }
        return;
      }
    }

    // Keyboard navigation & Tab selection for /commands (VS Code style)
    if (commandFilter !== null && matchedCommands.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setHighlightedIndex((prev) => (prev + 1) % matchedCommands.length);
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setHighlightedIndex((prev) => (prev - 1 + matchedCommands.length) % matchedCommands.length);
        return;
      }
      if (e.key === 'Tab') {
        e.preventDefault();
        const selected = matchedCommands[highlightedIndex] || matchedCommands[0];
        if (selected) {
          handleSelectCommand(selected);
        }
        return;
      }
    }

    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setContent(val);

    // Detect Hermes slash command (starts with / or word with /)
    const rawCursor = e.target.selectionStart;
    const cursor = typeof rawCursor === 'number' && rawCursor > 0 ? rawCursor : val.length;
    const textBefore = val.slice(0, cursor);

    if (textBefore.startsWith('/')) {
      const slashWord = textBefore.split(/\s+/)[0];
      setCommandFilter(slashWord);
      setMentionFilter(null);
      setHighlightedIndex(0);
      return;
    } else {
      setCommandFilter(null);
    }

    // Detect @mention trigger at current cursor position
    const lastAt = textBefore.lastIndexOf('@');
    if (lastAt !== -1 && (lastAt === 0 || /\s/.test(textBefore[lastAt - 1]))) {
      const query = textBefore.slice(lastAt + 1);
      if (!/\s/.test(query)) {
        setMentionFilter(query);
        setHighlightedIndex(0);
        return;
      }
    }
    setMentionFilter(null);
  };

  const handleSelectMention = (agent: AgentDTO) => {
    setMentionFilter(null);
    if (textareaRef.current) {
      const cursor = typeof textareaRef.current.selectionStart === 'number'
        ? textareaRef.current.selectionStart
        : content.length;
      const textBefore = content.slice(0, cursor);
      const lastAt = textBefore.lastIndexOf('@');
      if (lastAt !== -1) {
        const queryMatch = content.slice(lastAt).match(/^@\w*/);
        const tokenLength = queryMatch ? queryMatch[0].length : (cursor - lastAt);
        const textAfter = content.slice(lastAt + tokenLength);

        const mentionTag = `@${agent.name} `;
        const newContent = content.slice(0, lastAt) + mentionTag + textAfter;
        setContent(newContent);

        setTimeout(() => {
          if (textareaRef.current) {
            const newPos = lastAt + mentionTag.length;
            textareaRef.current.focus();
            textareaRef.current.setSelectionRange(newPos, newPos);
          }
        }, 10);
      }
    }
  };

  const handleSelectCommand = (cmd: HermesCommand) => {
    setCommandFilter(null);
    const cmdStr = cmd.command + ' ';
    setContent(cmdStr);
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(cmdStr.length, cmdStr.length);
      }
    }, 10);
  };

  const handleRemoveMention = (agentToRemove: { id: string; name: string }) => {
    const regex = new RegExp(`@(${agentToRemove.name}|${agentToRemove.id})\\b\\s?`, 'gi');
    const updated = content.replace(regex, '');
    setContent(updated);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const newItems: ComposerAttachment[] = Array.from(files).map((f) => ({
        name: f.name,
        size: f.size,
        type: f.type || 'application/octet-stream',
      }));
      setAttachments((prev) => [...prev, ...newItems]);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleSubmit = () => {
    if ((!content.trim() && attachments.length === 0) || isStreaming || disabled) return;
    onSendMessage(content.trim(), attachments.length > 0 ? attachments : undefined);
    setContent('');
    setAttachments([]);
    setMentionFilter(null);
    setCommandFilter(null);
    setOpenDropdown(null);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  return (
    <div className="relative bg-[#0c1017] p-2.5 select-none">
      {/* Hermes Slash Command Autocomplete Popover */}
      {commandFilter !== null && (
        <HermesCommandPopover
          filter={commandFilter}
          activeIndex={highlightedIndex}
          onHoverIndex={setHighlightedIndex}
          onSelectCommand={handleSelectCommand}
          onClose={() => setCommandFilter(null)}
        />
      )}

      {/* Mention Autocomplete Popover */}
      {mentionFilter !== null && (
        <MentionPopover
          filter={mentionFilter}
          activeIndex={highlightedIndex}
          onHoverIndex={setHighlightedIndex}
          onSelect={handleSelectMention}
          onClose={() => setMentionFilter(null)}
        />
      )}

      {/* MENTIONED AGENTS TAGS BAR */}
      {mentionedAgents.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 mb-1.5 px-0.5">
          <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wider font-semibold">
            Mentioned:
          </span>
          {mentionedAgents.map((ag) => (
            <span
              key={ag.id}
              className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-amber-950/80 border border-amber-500/50 text-amber-200 text-xs font-mono shadow-sm"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              <span className="font-semibold text-white">@{ag.name}</span>
              <button
                type="button"
                onClick={() => handleRemoveMention(ag)}
                title="Hapus"
                aria-label={`Hapus mention ${ag.name}`}
                className="text-amber-400 hover:text-white p-0.5 rounded hover:bg-white/10 cursor-pointer transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Attachment Previews List */}
      {attachments.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-1.5">
          {attachments.map((file, idx) => (
            <div
              key={`${file.name}-${idx}`}
              className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-[#161e28] border border-white/15 text-xs font-mono text-gray-200 shadow-sm max-w-[200px]"
            >
              {getFileIcon(file.name)}
              <div className="truncate flex-1 min-w-0">
                <p className="truncate font-medium text-white">{file.name}</p>
                <p className="text-[9px] text-gray-400">{formatFileSize(file.size)}</p>
              </div>
              <button
                type="button"
                onClick={() => handleRemoveAttachment(idx)}
                title="Hapus"
                aria-label={`Hapus file ${file.name}`}
                className="text-gray-400 hover:text-white p-0.5 rounded hover:bg-white/10 cursor-pointer transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* HERMES COMPOSER CARD */}
      <div className="relative rounded-xl bg-[#090d13] border border-white/15 focus-within:border-red-500/70 focus-within:shadow-[0_0_12px_rgba(220,38,38,0.2)] transition-all flex flex-col p-2.5 gap-1.5">
        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={handleFileChange}
        />

        {/* Textarea */}
        <textarea
          ref={textareaRef}
          rows={1}
          value={content}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="Message Hermes... (ketik @ untuk mention agent, / untuk command)"
          disabled={disabled}
          className="w-full bg-transparent text-xs text-white placeholder-gray-500 resize-none outline-none max-h-[140px] px-1 font-sans leading-relaxed"
        />

        {/* BOTTOM COMPACT TOOLBAR (Mode, Model, Thinking - Pure Text Dropdowns!) */}
        <div className="flex items-center justify-between gap-1.5 pt-1.5 border-t border-white/5 text-xs font-mono text-gray-300 min-w-0">
          {/* Left Action Buttons */}
          <div className="flex items-center gap-1 min-w-0 overflow-x-auto no-scrollbar py-0.5">
            {/* Attachment */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              title="Lampirkan file"
              aria-label="Lampirkan file"
              className="p-1 rounded text-gray-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer shrink-0"
            >
              <Paperclip className="w-3.5 h-3.5" />
            </button>

            {/* Separator */}
            <span className="text-gray-700 select-none shrink-0">|</span>

            {/* 1. MODE DROPDOWN (Pure Text: default ▾ / planning ▾ / ask ▾) */}
            <div className="relative shrink-0" data-hermes-popover>
              <button
                type="button"
                onClick={() => setOpenDropdown(openDropdown === 'mode' ? null : 'mode')}
                title="Pilih Mode Eksekusi"
                className="flex items-center gap-1 px-1.5 py-0.5 rounded hover:bg-white/5 text-amber-300 hover:text-amber-200 cursor-pointer transition-colors text-[11px]"
              >
                <span className="font-medium lowercase">{hermesMode}</span>
                <ChevronDown className="w-2.5 h-2.5 text-gray-400" />
              </button>

              {openDropdown === 'mode' && (
                <div className="absolute bottom-full left-0 mb-2 w-40 rounded-xl bg-[#0f141c]/98 border border-white/15 p-1.5 shadow-2xl backdrop-blur-xl z-50">
                  <div className="px-2 py-1 text-[10px] text-gray-400 font-bold uppercase border-b border-white/10">
                    Mode
                  </div>
                  <div className="py-1 space-y-0.5">
                    {(['default', 'planning', 'ask'] as HermesMode[]).map((mode) => (
                      <button
                        key={mode}
                        type="button"
                        onClick={() => {
                          setHermesMode(projectId, mode);
                          setOpenDropdown(null);
                        }}
                        className={`w-full flex items-center justify-between px-2 py-1.5 rounded text-[11px] transition-colors cursor-pointer ${
                          hermesMode === mode ? 'bg-amber-400/15 text-amber-300 font-bold' : 'text-gray-300 hover:bg-white/5'
                        }`}
                      >
                        <span className="lowercase">{mode}</span>
                        {hermesMode === mode && <Check className="w-3 h-3 text-amber-400" />}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* 2. MODEL & AGENT DROPDOWN (Pure Text) */}
            <div className="relative shrink-0" data-hermes-popover>
              <button
                type="button"
                onClick={() => setOpenDropdown(openDropdown === 'model' ? null : 'model')}
                title="Pilih Model AI atau Agent"
                className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-white/5 hover:bg-white/10 text-gray-200 border border-white/10 hover:border-amber-400/40 cursor-pointer transition-colors text-[11px] max-w-full"
              >
                <span className="font-medium truncate max-w-[75px] sm:max-w-[110px]">
                  {modelShortDisplay}
                </span>
                <ChevronDown className="w-2.5 h-2.5 text-gray-400 shrink-0" />
              </button>

              {openDropdown === 'model' && (
                <div className="absolute bottom-full left-0 mb-2 w-56 max-w-[calc(100vw-32px)] sm:max-w-xs rounded-xl bg-[#0f141c]/98 border border-white/15 p-2 shadow-2xl backdrop-blur-xl z-50 divide-y divide-white/10">
                  {/* Category A: Models */}
                  <div className="pb-1.5">
                    <div className="px-2 py-1 text-[10px] text-amber-400 font-bold uppercase tracking-wider">
                      Models
                    </div>
                    <div className="space-y-0.5">
                      {HERMES_MODELS.map((m) => (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => {
                            setHermesModel(projectId, m.id);
                            setTargetAgentId(projectId, null);
                            setOpenDropdown(null);
                          }}
                          className={`w-full text-left px-2 py-1.5 rounded transition-colors cursor-pointer group ${
                            hermesModel === m.id && !targetAgentId
                              ? 'bg-amber-400/15 text-white'
                              : 'text-gray-300 hover:bg-white/5'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold">{m.label}</span>
                            {hermesModel === m.id && !targetAgentId && (
                              <Check className="w-3 h-3 text-amber-400" />
                            )}
                          </div>
                          <span className="text-[10px] text-gray-500 block truncate group-hover:text-gray-400">
                            {m.provider}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Category B: Direct Agent Selection */}
                  <div className="pt-1.5">
                    <div className="px-2 py-1 text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                      Agents
                    </div>
                    <div className="space-y-0.5 max-h-36 overflow-y-auto">
                      <button
                        type="button"
                        onClick={() => {
                          setTargetAgentId(projectId, null);
                          setOpenDropdown(null);
                        }}
                        className={`w-full flex items-center justify-between px-2 py-1 rounded text-xs transition-colors cursor-pointer ${
                          !targetAgentId ? 'bg-amber-400/15 text-amber-300 font-bold' : 'text-gray-300 hover:bg-white/5'
                        }`}
                      >
                        <span>Shinaa (Lead)</span>
                        {!targetAgentId && <Check className="w-3 h-3 text-amber-400" />}
                      </button>

                      {agentList
                        .filter((a) => a.role !== 'orchestrator')
                        .map((ag) => (
                          <button
                            key={ag.id}
                            type="button"
                            onClick={() => {
                              setTargetAgentId(projectId, ag.id);
                              setOpenDropdown(null);
                            }}
                            className={`w-full flex items-center justify-between px-2 py-1 rounded text-xs transition-colors cursor-pointer ${
                              targetAgentId === ag.id ? 'bg-amber-400/15 text-amber-300 font-bold' : 'text-gray-300 hover:bg-white/5'
                            }`}
                          >
                            <span className="truncate">{ag.name}</span>
                            {targetAgentId === ag.id && <Check className="w-3 h-3 text-amber-400" />}
                          </button>
                        ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 3. THINKING LEVEL DROPDOWN (Pure Text: opens to right-0 so never cuts off!) */}
            <div className="relative shrink-0" data-hermes-popover>
              <button
                type="button"
                onClick={() => setOpenDropdown(openDropdown === 'thinking' ? null : 'thinking')}
                title="Level Thinking / Reasoning"
                className="flex items-center gap-1 px-1.5 py-0.5 rounded hover:bg-white/5 text-gray-300 hover:text-white cursor-pointer transition-colors text-[11px]"
              >
                <span className="lowercase">{thinkingLevel === 'extended' ? 'ext' : thinkingLevel}</span>
                <ChevronDown className="w-2.5 h-2.5 text-gray-400 shrink-0" />
              </button>

              {openDropdown === 'thinking' && (
                <div className="absolute bottom-full right-0 mb-2 w-40 rounded-xl bg-[#0f141c]/98 border border-white/15 p-1.5 shadow-2xl backdrop-blur-xl z-50">
                  <div className="px-2 py-1 text-[10px] text-gray-400 font-bold uppercase border-b border-white/10">
                    Thinking
                  </div>
                  <div className="py-1 space-y-0.5">
                    {(['off', 'low', 'medium', 'high', 'extended'] as ThinkingLevel[]).map((lvl) => (
                      <button
                        key={lvl}
                        type="button"
                        onClick={() => {
                          setThinkingLevel(projectId, lvl);
                          setOpenDropdown(null);
                        }}
                        className={`w-full flex items-center justify-between px-2 py-1.5 rounded text-[11px] transition-colors cursor-pointer ${
                          thinkingLevel === lvl ? 'bg-purple-400/15 text-purple-300 font-bold' : 'text-gray-300 hover:bg-white/5'
                        }`}
                      >
                        <span className="lowercase">{lvl}</span>
                        {thinkingLevel === lvl && <Check className="w-3 h-3 text-purple-400" />}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Submit / Stop Button */}
          <div className="shrink-0 ml-1.5">
            {isStreaming ? (
              <button
                type="button"
                onClick={onCancelStream}
                title="Hentikan eksekusi"
                aria-label="Hentikan eksekusi"
                className="w-7 h-7 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center transition-transform active:scale-95 cursor-pointer shadow-md"
              >
                <Square className="w-3 h-3 fill-current" />
              </button>
            ) : (
              <button
                type="button"
                disabled={!content.trim() && attachments.length === 0}
                onClick={handleSubmit}
                title="Kirim ke Hermes (Enter)"
                aria-label="Kirim ke Hermes"
                className="w-7 h-7 rounded-full bg-[#eab308] hover:bg-yellow-400 disabled:bg-white/10 text-black disabled:text-gray-500 font-bold flex items-center justify-center transition-all active:scale-95 disabled:active:scale-100 cursor-pointer disabled:cursor-not-allowed shadow-[0_0_10px_rgba(234,179,8,0.3)] disabled:shadow-none"
              >
                <ArrowUp className="w-4 h-4 stroke-[2.5]" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
