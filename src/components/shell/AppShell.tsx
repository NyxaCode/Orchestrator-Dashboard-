import React, { useRef, useState, useCallback, useEffect } from 'react';
import { useUiStore } from '../../stores/ui';
import { TopBar } from './TopBar';
import { StatusBar } from './StatusBar';
import { PanelHandle } from './PanelHandle';
import { ProjectsSidebar } from '../projects/ProjectsSidebar';
import { GraphCanvas } from '../graph/GraphCanvas';
import { KanbanBoard } from '../kanban/KanbanBoard';
import { ChatPanel } from '../chat/ChatPanel';
import { AgentInspector } from '../inspector/AgentInspector';
import { ErrorBoundary } from '../ui/ErrorBoundary';
import { useIsMobile } from '../../lib/useIsMobile';
import { Network, Kanban, FolderGit2, MessageSquare } from 'lucide-react';
import { cn } from '../../lib/cn';

export const AppShell: React.FC = () => {
  const sidebarCollapsed = useUiStore((s) => s.sidebarCollapsed);
  const chatCollapsed = useUiStore((s) => s.chatCollapsed);
  const toggleSidebar = useUiStore((s) => s.toggleSidebar);
  const toggleChat = useUiStore((s) => s.toggleChat);
  const mobileActiveTab = useUiStore((s) => s.mobileActiveTab);
  const setMobileActiveTab = useUiStore((s) => s.setMobileActiveTab);
  const viewMode = useUiStore((s) => s.viewMode);
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
      const maxAllowed = typeof window !== 'undefined' ? Math.max(320, window.innerWidth - 300) : 680;
      const newWidth = Math.max(320, Math.min(resizingRef.current.startWidth + delta, Math.min(maxAllowed, 680)));
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

  const isMobile = useIsMobile();

  return (
    <div className="flex flex-col h-[100dvh] w-full bg-[#0b0f14] overflow-hidden select-none">
      {/* Top Bar (48px) */}
      <TopBar />

      {/* Main Viewport Body */}
      <main className="relative flex-1 flex min-h-0 overflow-hidden">
        {isMobile ? (
          /* MOBILE SINGLE VIEW (100% viewport, no duplicates) */
          <div className="w-full h-full overflow-hidden">
            {mobileActiveTab === 'graph' && <GraphCanvas />}
            {mobileActiveTab === 'kanban' && <KanbanBoard />}
            {mobileActiveTab === 'projects' && <ProjectsSidebar />}
            {mobileActiveTab === 'chat' && (
              <ErrorBoundary fallbackTitle="Panel Chat Mobile">
                <ChatPanel />
              </ErrorBoundary>
            )}
          </div>
        ) : (
          /* DESKTOP 3-COLUMN LAYOUT */
          <>
            {/* 1. Projects Sidebar (260px) */}
            <aside
              aria-label="Projects Sidebar"
              className={cn(
                'shrink-0 transition-[transform,width] duration-250 ease-out z-20 h-full',
                sidebarCollapsed ? 'w-0 -translate-x-full overflow-hidden' : 'w-[260px] translate-x-0'
              )}
            >
              <div className="w-[260px] h-full">
                <ProjectsSidebar />
              </div>
            </aside>

            {/* Collapse Handle Left */}
            <PanelHandle
              side="left"
              isCollapsed={sidebarCollapsed}
              onToggle={toggleSidebar}
              label="Sidebar"
            />

            {/* 2. Middle Main View: Graph or Kanban (1fr) */}
            <div className="relative flex-1 h-full min-w-0 overflow-hidden">
              {viewMode === 'kanban' ? <KanbanBoard /> : <GraphCanvas />}
            </div>

            {/* Collapse Handle Right */}
            <PanelHandle
              side="right"
              isCollapsed={chatCollapsed}
              onToggle={toggleChat}
              label="Chat"
            />

            {/* 3. Chat Panel (Resizable, Default 420px, clamped 340px-680px) */}
            {!chatCollapsed && (
              <div
                onMouseDown={handleMouseDownResize}
                title="Tarik untuk ubah lebar panel chat"
                className={cn(
                  'relative shrink-0 z-30 cursor-col-resize select-none group',
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
                'shrink-0 z-20 h-full',
                isResizingChat ? '' : 'transition-[width] duration-150 ease-out',
                chatCollapsed && 'overflow-hidden'
              )}
            >
              <div className="w-full h-full min-w-0 flex flex-col overflow-hidden">
                <ErrorBoundary fallbackTitle="Panel Chat">
                  <ChatPanel />
                </ErrorBoundary>
              </div>
            </aside>
          </>
        )}

        {/* Agent Inspector Drawer (Desktop right drawer / Mobile bottom sheet) */}
        <AgentInspector />
      </main>

      {/* MOBILE BOTTOM NAVIGATION (Height 56px + safe-area) */}
      {isMobile && (
        <nav
          aria-label="Navigasi Bawah Mobile"
          className="flex h-14 border-t border-white/10 bg-[#121820] px-2 items-center justify-around shrink-0 z-40 pb-[env(safe-area-inset-bottom)]"
        >
          <button
            type="button"
            onClick={() => setMobileActiveTab('graph')}
            className={cn(
              'flex flex-col items-center justify-center gap-1 w-16 h-11 rounded-lg text-[10px] font-mono transition-colors cursor-pointer',
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
            onClick={() => setMobileActiveTab('kanban')}
            className={cn(
              'flex flex-col items-center justify-center gap-1 w-16 h-11 rounded-lg text-[10px] font-mono transition-colors cursor-pointer',
              mobileActiveTab === 'kanban'
                ? 'text-red-400 font-bold bg-white/5'
                : 'text-gray-400 hover:text-white'
            )}
          >
            <Kanban className="w-4 h-4" />
            <span>Kanban</span>
          </button>

          <button
            type="button"
            onClick={() => setMobileActiveTab('projects')}
            className={cn(
              'flex flex-col items-center justify-center gap-1 w-16 h-11 rounded-lg text-[10px] font-mono transition-colors cursor-pointer',
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
              'flex flex-col items-center justify-center gap-1 w-16 h-11 rounded-lg text-[10px] font-mono transition-colors cursor-pointer',
              mobileActiveTab === 'chat'
                ? 'text-red-400 font-bold bg-white/5'
                : 'text-gray-400 hover:text-white'
            )}
          >
            <MessageSquare className="w-4 h-4" />
            <span>Chat</span>
          </button>
        </nav>
      )}

      {/* Status Bar (Desktop only, 24px) */}
      {!isMobile && (
        <div>
          <StatusBar />
        </div>
      )}
    </div>
  );
};
