import React, { useEffect } from 'react';
import { AppShell } from './components/shell/AppShell';
import { ErrorBoundary } from './components/ui/ErrorBoundary';
import { useUiStore } from './stores/ui';
import { useAgentsStore } from './stores/agents';
import { getAdapter } from './server/adapters';

export default function App() {
  const toggleSidebar = useUiStore((s) => s.toggleSidebar);
  const toggleChat = useUiStore((s) => s.toggleChat);
  const closeInspector = useUiStore((s) => s.closeInspector);
  const inspectorOpen = useUiStore((s) => s.inspectorOpen);
  const resetPositionsToRadial = useAgentsStore((s) => s.resetPositionsToRadial);

  // Initial radial positioning on mount
  useEffect(() => {
    resetPositionsToRadial();
  }, [resetPositionsToRadial]);

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore shortcut when active in textarea or input
      const target = e.target as HTMLElement;
      const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA';

      if (e.key === 'Escape') {
        if (inspectorOpen) {
          closeInspector();
        }
      }

      if (!isInput) {
        if (e.key === '[') {
          e.preventDefault();
          toggleSidebar();
        } else if (e.key === ']') {
          e.preventDefault();
          toggleChat();
        }
      }

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        const chatInput = document.querySelector('textarea');
        chatInput?.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleSidebar, toggleChat, closeInspector, inspectorOpen]);

  return (
    <ErrorBoundary fallbackTitle="DM Mission Control Error">
      <AppShell />
    </ErrorBoundary>
  );
}
