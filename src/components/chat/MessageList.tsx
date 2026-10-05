import React, { useEffect, useRef, useState } from 'react';
import { MessageDTO } from '../../lib/schemas';
import { MessageItem } from './MessageItem';
import { ArrowDown } from 'lucide-react';

interface MessageListProps {
  messages: MessageDTO[];
  threadId: string;
  isStreaming: boolean;
  answeringAgentName?: string;
}

export const MessageList: React.FC<MessageListProps> = ({
  messages,
  threadId,
  isStreaming,
  answeringAgentName = 'Shinaa',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [showScrollBottomPill, setShowScrollBottomPill] = useState(false);
  const isNearBottomRef = useRef(true);

  const handleScroll = () => {
    if (!containerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    const distanceFromBottom = scrollHeight - (scrollTop + clientHeight);
    const near = distanceFromBottom < 70;
    isNearBottomRef.current = near;
    setShowScrollBottomPill(!near);
  };

  const scrollToBottom = (smooth = true) => {
    if (!containerRef.current) return;
    if (typeof containerRef.current.scrollTo === 'function') {
      containerRef.current.scrollTo({
        top: containerRef.current.scrollHeight,
        behavior: smooth ? 'smooth' : 'auto',
      });
    } else {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
    setShowScrollBottomPill(false);
    isNearBottomRef.current = true;
  };

  useEffect(() => {
    if (isNearBottomRef.current) {
      scrollToBottom(false);
    }
  }, [messages, isStreaming]);

  return (
    <div className="relative flex-1 min-h-0 w-full h-full flex flex-col overflow-hidden">
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto px-3 sm:px-4 py-3.5 space-y-3 min-h-0"
      >
        {messages.map((msg) => (
          <MessageItem key={msg.id} message={msg} threadId={threadId} />
        ))}

        {/* Typing Indicator */}
        {isStreaming && (
          <div className="flex items-center gap-2.5 px-3 py-2 text-xs font-mono text-gray-300 rounded-xl bg-white/5 border border-white/10 w-fit my-2 shadow-xs">
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
            <span>{answeringAgentName} sedang mengetik...</span>
          </div>
        )}
      </div>

      {/* Floating Scroll to Bottom Pill */}
      {showScrollBottomPill && (
        <button
          type="button"
          onClick={() => scrollToBottom(true)}
          className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-red-950/90 text-white border border-red-500/50 shadow-xl text-xs font-mono transition-transform hover:scale-105 active:scale-95 cursor-pointer backdrop-blur-md"
        >
          <ArrowDown className="w-3.5 h-3.5 text-red-400" />
          <span>Pesan baru</span>
        </button>
      )}
    </div>
  );
};
