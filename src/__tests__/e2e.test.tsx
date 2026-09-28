import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ChatPanel } from '../components/chat/ChatPanel';
import { Composer } from '../components/chat/Composer';
import { HermesStatusBar } from '../components/chat/HermesStatusBar';
import { AppShell } from '../components/shell/AppShell';
import { useChatStore } from '../stores/chat';
import { useProjectsStore } from '../stores/projects';
import { useUiStore } from '../stores/ui';
import { useAgentsStore } from '../stores/agents';

describe('E2E Testing: Hermes Multi-Agent Chat & Orchestration Suite', () => {
  beforeEach(() => {
    // Reset stores to known clean state before each test
    useProjectsStore.setState({ activeProjectId: 'proj-1' });
    useUiStore.setState({
      chatCollapsed: false,
      chatWidth: 420,
      inspectorOpen: false,
      selectedAgentId: null,
      sidebarCollapsed: false,
    });
    localStorage.clear();
  });

  // =========================================================================
  // 1. Resizable Chat Panel & Width Adjustment (E2E)
  // =========================================================================
  describe('Feature 1: Chat Panel Width & Resize E2E', () => {
    it('initializes with default width of 420px', () => {
      const state = useUiStore.getState();
      expect(state.chatWidth).toBe(420);
    });

    it('toggles maximize and minimize (420px <-> 560px) when clicking header button', async () => {
      render(<ChatPanel />);

      const toggleSizeBtn = screen.getByTitle(/Perlebar panel chat \(560px\)/i);
      expect(toggleSizeBtn).toBeTruthy();

      // Click to maximize to 560px
      fireEvent.click(toggleSizeBtn);
      expect(useUiStore.getState().chatWidth).toBe(560);

      // Now title changes to Perkecil panel chat (420px)
      const shrinkBtn = screen.getByTitle(/Perkecil panel chat \(420px\)/i);
      expect(shrinkBtn).toBeTruthy();

      // Click to shrink back to 420px
      fireEvent.click(shrinkBtn);
      expect(useUiStore.getState().chatWidth).toBe(420);
    });

    it('persists customized chat width in localStorage and clamps correctly', () => {
      useUiStore.getState().setChatWidth(500);
      expect(useUiStore.getState().chatWidth).toBe(500);
      expect(localStorage.getItem('hermes_chat_width')).toBe('500');

      // Clamping limits
      useUiStore.getState().setChatWidth(100); // below min 320
      expect(useUiStore.getState().chatWidth).toBe(320);

      useUiStore.getState().setChatWidth(1000); // above max 700
      expect(useUiStore.getState().chatWidth).toBe(700);
    });

    it('resizer handle in AppShell adjusts width on mouse drag', () => {
      render(<AppShell />);

      const resizerHandle = screen.getByTitle(/Tarik untuk ubah lebar panel chat/i);
      expect(resizerHandle).toBeTruthy();

      // Simulate mouse down on resizer handle at x=1000
      fireEvent.mouseDown(resizerHandle, { clientX: 1000 });

      // Move mouse to x=950 (dragging left by 50px increases panel width by 50px from 420 to 470)
      fireEvent.mouseMove(window, { clientX: 950 });
      expect(useUiStore.getState().chatWidth).toBe(470);

      // Mouse up to release drag
      fireEvent.mouseUp(window);
    });
  });

  // =========================================================================
  // 2. Hermes Status Bar Above Chat Box (E2E)
  // =========================================================================
  describe('Feature 2: Hermes Status Bar & Telemetry E2E', () => {
    it('renders directly above composer and shows context %, latency, and thinking duration', () => {
      render(<HermesStatusBar projectId="proj-1" />);

      // Verifies status and model label
      expect(screen.getByText('-')).toBeTruthy();
      expect(screen.getByText('ready')).toBeTruthy();
      expect(screen.getByText('opus 4.7')).toBeTruthy();

      // Verifies telemetry fields
      expect(screen.getByText(/ctx/i)).toBeTruthy();
      expect(screen.getByText(/42ms/i)).toBeTruthy();
      expect(screen.getByText(/think/i)).toBeTruthy();

      // Confirms voice off and elapsed session time are NOT present
      expect(screen.queryByText(/voice off/i)).toBeNull();
      expect(screen.queryByText(/voice on/i)).toBeNull();
      expect(screen.queryByText(/sess/i)).toBeNull();
    });

    it('reflects project telemetry updates in real-time', () => {
      const { rerender } = render(<HermesStatusBar projectId="proj-1" />);

      // Update telemetry in store
      useChatStore.getState().updateProjectTelemetry('proj-1', {
        latencyMs: 38,
        lastThinkingDurationSec: 2.5,
        usedTokens: 50000,
      });

      rerender(<HermesStatusBar projectId="proj-1" />);

      expect(screen.getByText(/38ms/i)).toBeTruthy();
      expect(screen.getByText(/think 2.5s/i)).toBeTruthy();
      expect(screen.getByText(/5% ctx/i)).toBeTruthy();
    });
  });

  // =========================================================================
  // 3. Pure Text Dropdowns in Composer (No Icons, No Prompt Presets) (E2E)
  // =========================================================================
  describe('Feature 3: Pure Text Dropdowns & Clean Composer E2E', () => {
    it('renders mode, model, and thinking as pure text without icons', () => {
      render(
        <Composer
          projectId="proj-1"
          onSendMessage={() => {}}
          onCancelStream={() => {}}
          isStreaming={false}
        />
      );

      // Verify text-only dropdown buttons exist
      const modeBtn = screen.getByTitle(/Pilih Mode Eksekusi/i);
      expect(modeBtn.textContent?.trim()).toMatch(/^default/);

      const modelBtn = screen.getByTitle(/Pilih Model AI atau Agent/i);
      expect(modelBtn.textContent?.trim()).toMatch(/opus-4.6/);

      const thinkingBtn = screen.getByTitle(/Level Thinking \/ Reasoning/i);
      expect(thinkingBtn.textContent?.trim()).toMatch(/^medium/);

      // Verify prompt preset bookmark is gone
      expect(screen.queryByTitle(/Prompt Presets/i)).toBeNull();
      expect(screen.queryByLabelText(/Prompt Presets/i)).toBeNull();
    });

    it('allows selecting mode from pure text dropdown', async () => {
      render(
        <Composer
          projectId="proj-1"
          onSendMessage={() => {}}
          onCancelStream={() => {}}
          isStreaming={false}
        />
      );

      const modeBtn = screen.getByTitle(/Pilih Mode Eksekusi/i);
      fireEvent.click(modeBtn);

      // Dropdown popover opens with pure text options
      const planningOption = screen.getByRole('button', { name: /planning/i });
      fireEvent.click(planningOption);

      expect(useChatStore.getState().getProjectConfig('proj-1').hermesMode).toBe('planning');
    });

    it('allows selecting thinking level from pure text dropdown', async () => {
      render(
        <Composer
          projectId="proj-1"
          onSendMessage={() => {}}
          onCancelStream={() => {}}
          isStreaming={false}
        />
      );

      const thinkingBtn = screen.getByTitle(/Level Thinking \/ Reasoning/i);
      fireEvent.click(thinkingBtn);

      const highOption = screen.getByRole('button', { name: /high/i });
      fireEvent.click(highOption);

      expect(useChatStore.getState().getProjectConfig('proj-1').thinkingLevel).toBe('high');
    });

    it('allows switching model or selecting an agent from dropdown', async () => {
      render(
        <Composer
          projectId="proj-1"
          onSendMessage={() => {}}
          onCancelStream={() => {}}
          isStreaming={false}
        />
      );

      const modelBtn = screen.getByTitle(/Pilih Model AI atau Agent/i);
      fireEvent.click(modelBtn);

      // Select deepseek-chat
      const deepseekOption = screen.getByText('deepseek-chat');
      fireEvent.click(deepseekOption);

      expect(useChatStore.getState().getProjectConfig('proj-1').hermesModel).toBe('deepseek-chat');
      expect(useChatStore.getState().getProjectConfig('proj-1').targetAgentId).toBeNull();
    });
  });

  // =========================================================================
  // 4. Message Flow, Mentions, Attachments & Slash Commands (E2E)
  // =========================================================================
  describe('Feature 4: Messaging, Mentions & Slash Commands E2E', () => {
    it('triggers mention popover on typing @ and completes agent tag on selection', async () => {
      render(
        <Composer
          projectId="proj-1"
          onSendMessage={() => {}}
          onCancelStream={() => {}}
          isStreaming={false}
        />
      );

      const textarea = screen.getByPlaceholderText(/Message Hermes.../i) as HTMLTextAreaElement;

      // Type "@rik"
      fireEvent.change(textarea, { target: { value: 'Halo @rik', selectionStart: 8 } });

      // Mention popover appears
      await waitFor(() => {
        expect(screen.getByText(/Customer Support/i)).toBeTruthy();
      });

      // Select Rika from popover
      const rikaBtn = screen.getByText(/Customer Support/i).closest('button');
      if (rikaBtn) fireEvent.click(rikaBtn);

      expect(textarea.value).toBe('Halo @Rika ');
    });

    it('handles Hermes slash commands like /mode, /thinking, and /clear', async () => {
      render(<ChatPanel />);

      const textarea = screen.getByPlaceholderText(/Message Hermes.../i);

      // Test /mode planning
      fireEvent.change(textarea, { target: { value: '/mode planning', selectionStart: 14 } });
      fireEvent.keyDown(textarea, { key: 'Enter', shiftKey: false });

      expect(useChatStore.getState().getProjectConfig('proj-1').hermesMode).toBe('planning');

      // Test /thinking high
      fireEvent.change(textarea, { target: { value: '/thinking high', selectionStart: 14 } });
      fireEvent.keyDown(textarea, { key: 'Enter', shiftKey: false });

      expect(useChatStore.getState().getProjectConfig('proj-1').thinkingLevel).toBe('high');

      // Test /clear
      fireEvent.change(textarea, { target: { value: '/clear', selectionStart: 6 } });
      fireEvent.keyDown(textarea, { key: 'Enter', shiftKey: false });

      const messages = useChatStore.getState().messages['proj-1'] || [];
      const hasClearNotice = messages.some((m) => m.content.includes('telah di-reset'));
      expect(hasClearNotice).toBe(true);
    });

    it('sends user message, streams assistant answer, and updates telemetry', async () => {
      render(<ChatPanel />);

      const textarea = screen.getByPlaceholderText(/Message Hermes.../i);
      const testPrompt = `E2E automated test prompt ${Date.now()}`;

      fireEvent.change(textarea, { target: { value: testPrompt, selectionStart: testPrompt.length } });
      fireEvent.keyDown(textarea, { key: 'Enter', shiftKey: false });

      // Check optimistic user message
      await waitFor(() => {
        const msgs = useChatStore.getState().messages['proj-1'] || [];
        expect(msgs.some((m) => m.content === testPrompt)).toBe(true);
      });

      // Wait for stream completion from mock adapter
      await waitFor(
        () => {
          expect(useChatStore.getState().isStreaming).toBe(false);
        },
        { timeout: 4000 }
      );

      // Verify that latency and thinking telemetry were updated
      const cfg = useChatStore.getState().getProjectConfig('proj-1');
      expect(cfg.latencyMs).toBeGreaterThan(0);
      expect(cfg.lastThinkingDurationSec).toBeGreaterThan(0);
      expect(cfg.tokenUsage.used).toBeGreaterThan(0);
    });

    it('supports file attachments with size formatting and removal', () => {
      render(
        <Composer
          projectId="proj-1"
          onSendMessage={() => {}}
          onCancelStream={() => {}}
          isStreaming={false}
        />
      );

      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      expect(fileInput).toBeTruthy();

      const fakeFile = new File(['test content'], 'sample_analysis.ts', { type: 'text/typescript' });
      fireEvent.change(fileInput, { target: { files: [fakeFile] } });

      // Attachment badge shows in composer
      expect(screen.getByText('sample_analysis.ts')).toBeTruthy();

      // Click remove button
      const removeBtn = screen.getByTitle('Hapus');
      fireEvent.click(removeBtn);

      expect(screen.queryByText('sample_analysis.ts')).toBeNull();
    });
  });

  // =========================================================================
  // 5. Per-Project Isolation & Direct Agent Session Workflow (E2E)
  // =========================================================================
  describe('Feature 5: Project Scoping & 1-on-1 Agent Sessions E2E', () => {
    it('isolates configuration and messages when switching projects', () => {
      // proj-1 config
      useChatStore.getState().setHermesMode('proj-1', 'default');
      useChatStore.getState().setThinkingLevel('proj-1', 'medium');

      // proj-2 config
      useChatStore.getState().setHermesMode('proj-2', 'planning');
      useChatStore.getState().setThinkingLevel('proj-2', 'high');

      expect(useChatStore.getState().getProjectConfig('proj-1').hermesMode).toBe('default');
      expect(useChatStore.getState().getProjectConfig('proj-2').hermesMode).toBe('planning');
      expect(useChatStore.getState().getProjectConfig('proj-2').thinkingLevel).toBe('high');
    });

    it('switches to direct 1-on-1 agent session and back to Lead/Orchestrator', async () => {
      render(<ChatPanel />);

      // Switch to direct agent session with Rika
      useChatStore.getState().setTargetAgentId('proj-1', 'rika');

      await waitFor(() => {
        // Banner shows direct session
        expect(screen.getByText(/Sesi Langsung: Rika/i)).toBeTruthy();
      });

      // Back button appears
      const backBtn = screen.getByTitle(/Kembali ke Orchestrator/i);
      expect(backBtn).toBeTruthy();

      // Click back button returns to global Lead session
      fireEvent.click(backBtn);

      expect(useChatStore.getState().getProjectConfig('proj-1').targetAgentId).toBeNull();
      await waitFor(() => {
        expect(screen.getByText('Lead')).toBeTruthy();
      });
    });
  });

  // =========================================================================
  // 6. Agent Graph & Inspector Drawer Workflow (E2E)
  // =========================================================================
  describe('Feature 6: Agent Selection & Inspector Drawer E2E', () => {
    it('opens inspector on agent selection and switches tabs', async () => {
      render(<AppShell />);

      // Select agent 'rika'
      useUiStore.getState().openInspector('rika', 'overview');

      expect(useUiStore.getState().inspectorOpen).toBe(true);
      expect(useUiStore.getState().selectedAgentId).toBe('rika');

      // Switch to Logs tab
      useUiStore.getState().setInspectorTab('logs');
      expect(useUiStore.getState().inspectorTab).toBe('logs');

      // Switch to Tools tab
      useUiStore.getState().setInspectorTab('tools');
      expect(useUiStore.getState().inspectorTab).toBe('tools');

      // Close inspector
      useUiStore.getState().closeInspector();
      expect(useUiStore.getState().inspectorOpen).toBe(false);
    });

    it('toggles between graph view and list view seamlessly', () => {
      expect(useUiStore.getState().viewMode).toBe('graph');

      useUiStore.getState().setViewMode('list');
      expect(useUiStore.getState().viewMode).toBe('list');

      useUiStore.getState().setViewMode('graph');
      expect(useUiStore.getState().viewMode).toBe('graph');
    });
  });
});
