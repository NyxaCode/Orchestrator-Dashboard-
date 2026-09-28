import React, { useRef, useState, useCallback, useEffect } from 'react';
import { useUiStore } from '../../stores/ui';
import { TopBar } from './TopBar';
import { StatusBar } from './StatusBar';
import { PanelHandle } from './PanelHandle';
import { ProjectsSidebar } from '../projects/ProjectsSidebar';
import { GraphCanvas } from '../graph/GraphCanvas';
import { ChatPanel } from '../chat/ChatPanel';
import { AgentInspector } from '../inspector/AgentInspector';
import { Network, FolderGit2, MessageSquare } from 'lucide-react';
import { cn } from '../../lib/cn';

export const AppShell: React.FC = () => {
  const sidebarCollapsed = useUiStore((s) => s.sidebarCollapsed);
  const chatCollapsed = useUiStore((s) => s.chatCollapsed);
  const toggleSidebar = useUiStore((s) => s.toggleSidebar);
  const toggleChat = useUiStore((s) => s.toggleChat);
  const mobileActiveTab = useUiStore((s) => s.mobileActiveTab);
  const setMobileActiveTab = useUiStore((s) => s.setMobileActiveTab);
  const chatWidth = useUiStore((s) => s.chatWidth);
  const setChatWidth = useUiStore((s) => s.setChatWidth);

  // Resize drag handling for Chat Panel
  const [isResizingChat, setIsResizingChat] = useState(false);
  const resizingRef = useRef({ startX: 0, startWidth: chatWidth });

  const handleMouseDownResize = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      setIsResizingChat(true);
      resizingRef.current = {
        startX: e.clientX,
        startWidth: chatWidth,
      };
    },
    [chatWidth]
  );

  useEffect(() => {
    if (!isResizingChat) return;

    const handleMouseMove = (e: MouseEvent) => {
      const delta = resizingRef.current.startX - e.clientX;
      const newWidth = Math.max(340, Math.min(resizingRef.current.startWidth + delta, 680));
      setChatWidth(newWidth);
    };

    const handleMouseUp = () => {
      setIsResizingChat(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizingChat, setChatWidth]);

  return (
    <div className="flex flex-col h-[100dvh] w-full bg-[#0b0f14] overflow-hidden select-none">
      {/* Top Bar (48px) */}
      <TopBar />

      {/* Main Viewport Body */}
      <main className="relative flex-1 flex min-h-0 overflow-hidden">
        {/* DESKTOP 3-COLUMN LAYOUT */}

        {/* 1. Projects Sidebar (260px) */}
        <aside
          aria-label="Projects Sidebar"
          className={cn(
            'hidden md:block shrink-0 transition-[transform,width] duration-250 ease-out z-20 h-full',
            sidebarCollapsed ? 'w-0 -translate-x-full overflow-hidden' : 'w-[260px] translate-x-0'
          )}
        >
          <div className="w-[260px] h-full">
            <ProjectsSidebar />
          </div>
        </aside>

        {/* Collapse Handle Left */}
        <div className="hidden md:block">
          <PanelHandle
            side="left"
            isCollapsed={sidebarCollapsed}
            onToggle={toggleSidebar}
            label="Sidebar"
          />
        </div>

        {/* 2. Middle Canvas / Main View (1fr) */}
        <div className="relative flex-1 h-full min-w-0 overflow-hidden">
          {/* Desktop Canvas is always loaded */}
          <div className="hidden md:block w-full h-full">
            <GraphCanvas />
          </div>

          {/* MOBILE VIEWS (< 768px): Routed via mobileActiveTab */}
          <div className="block md:hidden w-full h-full">
            {mobileActiveTab === 'graph' && <GraphCanvas />}
            {mobileActiveTab === 'projects' && <ProjectsSidebar />}
            {mobileActiveTab === 'chat' && <ChatPanel />}
          </div>
        </div>

        {/* Collapse Handle Right */}
        <div className="hidden md:block">
          <PanelHandle
            side="right"
            isCollapsed={chatCollapsed}
            onToggle={toggleChat}
            label="Chat"
          />
        </div>

        {/* 3. Chat Panel (Resizable, Default 420px, clamped 340px-680px) */}
        {!chatCollapsed && (
          <div
            onMouseDown={handleMouseDownResize}
            title="Tarik untuk ubah lebar panel chat"
            className={cn(
              'hidden md:block relative shrink-0 z-30 cursor-col-resize select-none group',
              isResizingChat ? 'bg-amber-400' : 'bg-transparent hover:bg-amber-500/50'
            )}
            style={{ width: '4px', margin: '0 -2px' }}
          >
            <div className="absolute inset-y-0 -left-1 -right-1 z-40" />
          </div>
        )}

        <aside
          aria-label="Chat Panel"
          style={{ width: chatCollapsed ? 0 : `${chatWidth}px` }}
          className={cn(
            'hidden md:block shrink-0 z-20 h-full',
            isResizingChat ? '' : 'transition-[width] duration-150 ease-out',
            chatCollapsed && 'overflow-hidden'
          )}
        >
          <div style={{ width: `${chatWidth}px` }} className="h-full">
            <ChatPanel />
          </div>
        </aside>

        {/* Agent Inspector Drawer (Desktop right drawer / Mobile bottom sheet) */}
        <AgentInspector />
      </main>

      {/* MOBILE BOTTOM NAVIGATION (Height 56px + safe-area) */}
      <nav
        aria-label="Navigasi Bawah Mobile"
        className="flex md:hidden h-14 border-t border-white/10 bg-[#121820] px-2 items-center justify-around shrink-0 z-40 pb-[env(safe-area-inset-bottom)]"
      >
        <button
          type="button"
          onClick={() => setMobileActiveTab('graph')}
          className={cn(
            'flex flex-col items-center justify-center gap-1 w-20 h-11 rounded-lg text-[10px] font-mono transition-colors cursor-pointer',
            mobileActiveTab === 'graph'
              ? 'text-red-400 font-bold bg-white/5'
              : 'text-gray-400 hover:text-white'
          )}
        >
          <Network className="w-4 h-4" />
          <span>Graph</span>
        </button>

        <button
          type="button"
          onClick={() => setMobileActiveTab('projects')}
          className={cn(
            'flex flex-col items-center justify-center gap-1 w-20 h-11 rounded-lg text-[10px] font-mono transition-colors cursor-pointer',
            mobileActiveTab === 'projects'
              ? 'text-red-400 font-bold bg-white/5'
              : 'text-gray-400 hover:text-white'
          )}
        >
          <FolderGit2 className="w-4 h-4" />
          <span>Projects</span>
        </button>

        <button
          type="button"
          onClick={() => setMobileActiveTab('chat')}
          className={cn(
            'flex flex-col items-center justify-center gap-1 w-20 h-11 rounded-lg text-[10px] font-mono transition-colors cursor-pointer',
            mobileActiveTab === 'chat'
              ? 'text-red-400 font-bold bg-white/5'
              : 'text-gray-400 hover:text-white'
          )}
        >
          <MessageSquare className="w-4 h-4" />
          <span>Chat</span>
        </button>
      </nav>

      {/* Status Bar (Desktop only, 24px) */}
      <div className="hidden md:block">
        <StatusBar />
      </div>
    </div>
  );
};
