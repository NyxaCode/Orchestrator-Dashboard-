import React from 'react';
import { MessageDTO } from '../../lib/schemas';
import { useAgentsStore } from '../../stores/agents';
import { useChatStore } from '../../stores/chat';
import { formatTime, cleanModelName } from '../../lib/format';
import { parseMarkdown, formatInlineMarkdown } from '../../lib/sanitize';
import { TaskChip } from './TaskChip';
import { AgentAvatar } from '../ui/AgentAvatar';
import { RotateCw, AlertTriangle, Paperclip, FileCode, FileArchive, FileText, File as FileIcon } from 'lucide-react';
import { cn } from '../../lib/cn';

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

interface MessageItemProps {
  message: MessageDTO;
  threadId: string;
}

export const MessageItem: React.FC<MessageItemProps> = ({ message, threadId }) => {
  const agents = useAgentsStore((s) => s.agents);
  const retryMessage = useChatStore((s) => s.retryMessage);

  // System Message Display
  if (message.role === 'system') {
    return (
      <div className="py-2 px-2 sm:px-3 flex flex-col items-center justify-center text-center my-1 select-none">
        <div className="flex items-center gap-2 w-full my-1">
          <div className="flex-1 border-t border-dashed border-white/10" />
          <span className="text-[11px] font-mono text-gray-400 px-2 tracking-tight max-w-[85%] break-words">
            {message.content}
          </span>
          <div className="flex-1 border-t border-dashed border-white/10" />
        </div>
        {message.meta?.taskId && (
          <div className="mt-1">
            <TaskChip
              taskId={message.meta.taskId}
              targetAgentId={message.meta.targetAgentId}
              taskTitle={message.meta.taskTitle || 'Delegasi Task'}
              status={message.meta.taskStatus}
            />
          </div>
        )}
      </div>
    );
  }

  const isUser = message.role === 'user';
  const agent = message.agent_id && agents ? agents[message.agent_id] : null;
  const senderName = isUser
    ? 'You'
    : agent?.name || (message.role === 'orchestrator' ? 'Shinaa (Lead)' : 'Agent');

  const [thinkingExpanded, setThinkingExpanded] = React.useState(false);

  // Extract <thinking> tags if present
  let thinkingContent = '';
  const rawContent = message?.content || '';
  let mainContent = rawContent;
  const thinkingMatch = rawContent.match(/<thinking>([\s\S]*?)<\/thinking>/i);
  if (thinkingMatch) {
    thinkingContent = thinkingMatch[1].trim();
    mainContent = rawContent.replace(/<thinking>[\s\S]*?<\/thinking>/i, '').trim();
  }

  const parsedBlocks = parseMarkdown(mainContent);

  return (
    <div
      className={cn(
        'group flex gap-2.5 sm:gap-3 p-3 transition-all rounded-xl select-text',
        isUser
          ? 'bg-red-950/20 border border-red-500/20 shadow-xs'
          : 'bg-[#101622] border border-white/10 shadow-xs hover:border-white/20'
      )}
    >
      {/* 28px Vector Profile Image Avatar */}
      <div className="shrink-0 mt-0.5">
        <AgentAvatar
          agentId={message.agent_id}
          role={message.role}
          name={senderName}
          avatarUrl={agent?.avatar_url}
          size={28}
          color={agent?.color}
        />
      </div>

      {/* Message Body */}
      <div className="flex-1 min-w-0">
        {/* Header: Name + Time + Status */}
        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
          <span className="text-xs font-semibold text-white tracking-tight shrink-0">
            {senderName}
          </span>
          {agent?.model_label && (
            <span className="text-[10px] font-mono text-gray-400 bg-white/5 border border-white/10 px-1.5 py-0.5 rounded truncate max-w-[130px]">
              {cleanModelName(agent.model_label)}
            </span>
          )}
          <span className="text-[10px] font-mono text-gray-400 tabular-nums ml-auto shrink-0">
            {formatTime(message.created_at)}
          </span>

          {/* Failed indicator & Retry */}
          {message.status === 'failed' && (
            <span className="flex items-center gap-1 text-[10px] font-mono text-red-400 ml-auto">
              <AlertTriangle className="w-3 h-3 shrink-0" />
              <span>Gagal kirim</span>
              <button
                type="button"
                onClick={() => retryMessage(threadId, message.id)}
                className="hover:underline flex items-center gap-0.5 ml-1 text-gray-300 hover:text-white cursor-pointer"
              >
                <RotateCw className="w-2.5 h-2.5" />
                <span>Retry</span>
              </button>
            </span>
          )}
        </div>

        {/* Hermes Reasoning / Thinking Process Accordion */}
        {thinkingContent && (
          <div className="mb-2 rounded-lg bg-purple-950/20 border border-purple-500/30 overflow-hidden font-mono text-[11px]">
            <button
              type="button"
              onClick={() => setThinkingExpanded(!thinkingExpanded)}
              className="w-full flex items-center justify-between px-2.5 py-1.5 bg-purple-950/40 hover:bg-purple-900/40 text-purple-300 font-semibold cursor-pointer transition-colors"
            >
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
                <span>Hermes Reasoning ({thinkingContent.length} chars)</span>
              </span>
              <span className="text-[10px] text-purple-400">{thinkingExpanded ? '▲ Sembunyikan' : '▼ Lihat Proses'}</span>
            </button>
            {thinkingExpanded && (
              <div className="p-2.5 text-purple-200/90 whitespace-pre-wrap leading-relaxed border-t border-purple-500/20 bg-black/30">
                {thinkingContent}
              </div>
            )}
          </div>
        )}

        {/* Content Render with Markdown */}
        <div className="text-xs text-gray-200 leading-relaxed space-y-1.5 break-words">
          {parsedBlocks.map((block, idx) => {
            if (block.type === 'code-block') {
              return (
                <div
                  key={idx}
                  className="p-2.5 rounded-md bg-[#0a0e14] border border-white/10 font-mono text-[11px] text-gray-300 overflow-x-auto my-1"
                >
                  <pre>{block.content}</pre>
                </div>
              );
            }
            if (block.type === 'table' && block.tableHeaders && block.tableRows) {
              return (
                <div key={idx} className="my-2 overflow-x-auto rounded-lg border border-white/10 bg-[#070a0e] shadow-xs">
                  <table className="w-full text-left font-mono text-[11px] border-collapse min-w-[260px]">
                    <thead>
                      <tr className="border-b border-white/10 bg-white/5 text-gray-300">
                        {block.tableHeaders.map((th, thIdx) => (
                          <th
                            key={thIdx}
                            className="px-3 py-1.5 font-bold whitespace-nowrap"
                            dangerouslySetInnerHTML={{ __html: formatInlineMarkdown(th) }}
                          />
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-gray-300">
                      {block.tableRows.map((row, rIdx) => (
                        <tr key={rIdx} className="hover:bg-white/5 transition-colors">
                          {row.map((cell, cIdx) => (
                            <td
                              key={cIdx}
                              className="px-3 py-1.5 whitespace-pre-wrap"
                              dangerouslySetInnerHTML={{ __html: formatInlineMarkdown(cell) }}
                            />
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              );
            }
            if (block.type === 'list' && block.items) {
              return (
                <ul key={idx} className="list-disc pl-4 space-y-0.5">
                  {block.items.map((item, itemIdx) => (
                    <li
                      key={itemIdx}
                      dangerouslySetInnerHTML={{ __html: formatInlineMarkdown(item) }}
                    />
                  ))}
                </ul>
              );
            }
            return (
              <p
                key={idx}
                dangerouslySetInnerHTML={{ __html: formatInlineMarkdown(block.content) }}
              />
            );
          })}

          {/* Streaming Cursor */}
          {message.status === 'streaming' && (
            <span className="inline-block w-1.5 h-3.5 bg-red-400 animate-pulse ml-0.5 align-middle" />
          )}
        </div>

        {/* Attached Files rendering */}
        {((message.meta?.attachments && message.meta.attachments.length > 0) || message.meta?.attachmentName) && (
          <div className="flex flex-wrap gap-1.5 mt-2.5">
            {message.meta?.attachments && message.meta.attachments.length > 0 ? (
              message.meta.attachments.map((att, attIdx) => (
                <div
                  key={attIdx}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#0a0e14] border border-white/10 text-xs font-mono text-gray-200 shadow-xs max-w-full"
                >
                  {getFileIcon(att.name)}
                  <span className="font-medium text-gray-200 truncate max-w-[140px] sm:max-w-[200px]">{att.name}</span>
                  <span className="text-[10px] text-gray-400 shrink-0">({formatFileSize(att.size)})</span>
                </div>
              ))
            ) : message.meta?.attachmentName ? (
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#0a0e14] border border-white/10 text-xs font-mono text-gray-200 shadow-xs max-w-full">
                <Paperclip className="w-3.5 h-3.5 text-red-400 shrink-0" />
                <span className="font-medium text-gray-200 truncate max-w-[140px] sm:max-w-[200px]">{message.meta.attachmentName}</span>
                {message.meta.attachmentSize && (
                  <span className="text-[10px] text-gray-400 shrink-0">({formatFileSize(message.meta.attachmentSize)})</span>
                )}
              </div>
            ) : null}
          </div>
        )}

        {/* Task Chip if delegation meta present */}
        {message.meta?.taskId && (
          <div className="mt-2.5">
            <TaskChip
              taskId={message.meta.taskId}
              targetAgentId={message.meta.targetAgentId}
              taskTitle={message.meta.taskTitle || 'Task'}
              status={message.meta.taskStatus}
            />
          </div>
        )}
      </div>
    </div>
  );
};
