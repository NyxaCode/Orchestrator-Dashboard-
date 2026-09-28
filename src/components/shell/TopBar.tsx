import React, { useState } from 'react';
import { useProjectsStore } from '../../stores/projects';
import { useUiStore } from '../../stores/ui';
import { useChatStore } from '../../stores/chat';
import { getCurrentAdapterType } from '../../server/adapters';
import {
  Layers,
  Undo2,
  Redo2,
  Settings,
  ChevronDown,
  Shield,
  Activity,
  Menu,
  Network,
  Kanban,
} from 'lucide-react';
import { IconButton } from '../ui/IconButton';
import { cn } from '../../lib/cn';

export const TopBar: React.FC = () => {
  const activeProjectId = useProjectsStore((s) => s.activeProjectId);
  const projects = useProjectsStore((s) => s.projects);
  const currentProject = projects.find((p) => p.id === activeProjectId) || projects[0];

  const viewMode = useUiStore((s) => s.viewMode);
  const setViewMode = useUiStore((s) => s.setViewMode);
  const toggleSidebar = useUiStore((s) => s.toggleSidebar);
  const sseStatus = useChatStore((s) => s.sseStatus);

  const [showViewDropdown, setShowViewDropdown] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const adapterType = getCurrentAdapterType();

  return (
    <header className="h-12 border-b border-white/10 bg-[#121820] px-3.5 flex items-center justify-between select-none shrink-0 z-30">
      {/* Left Zone: Brand + Breadcrumb */}
      <div className="flex items-center gap-3 min-w-0">
        <IconButton
          aria-label="Toggle Sidebar"
          size="sm"
          variant="ghost"
          onClick={toggleSidebar}
          className="md:hidden text-gray-400 hover:text-white"
        >
          <Menu className="w-4 h-4" />
        </IconButton>

        {/* Logo DMC */}
        <div className="flex items-center gap-1.5 shrink-0">
          <div className="w-6 h-6 rounded-md bg-red-600 flex items-center justify-center shadow-[0_0_12px_rgba(220,38,38,0.6)]">
            <span className="font-mono font-bold text-xs text-white tracking-tighter">DM</span>
          </div>
          <span className="text-sm font-bold tracking-tight text-white hidden sm:inline">
            Mission Control
          </span>
        </div>

        {/* Breadcrumb separator */}
        <div className="hidden sm:flex items-center gap-1.5 text-xs text-gray-500 font-mono">
          <span>/</span>
          <span className="text-gray-400">Project</span>
          <span>›</span>
          <span className="text-white font-medium truncate max-w-[180px]">
            {currentProject?.name || 'Overview'}
          </span>
        </div>
      </div>

      {/* Middle Zone: View Selector & Ornaments */}
      <div className="flex items-center gap-2">
        {/* Quick View Segmented Tabs: [Graph] [Kanban] */}
        <div className="flex items-center p-0.5 rounded-lg bg-[#0e141c] border border-white/10 shadow-xs">
          <button
            type="button"
            onClick={() => setViewMode('graph')}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-mono transition-all cursor-pointer',
              viewMode === 'graph'
                ? 'bg-red-600 text-white font-bold shadow-xs'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            )}
          >
            <Network className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Graph</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode('kanban')}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-mono transition-all cursor-pointer',
              viewMode === 'kanban'
                ? 'bg-red-600 text-white font-bold shadow-xs'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            )}
          >
            <Kanban className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Kanban</span>
          </button>
        </div>

        {/* VIEW ▾ Pill Selector for Full Options */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowViewDropdown(!showViewDropdown)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#161e28] hover:bg-[#1a232e] text-xs font-mono text-gray-300 border border-white/15 shadow-xs transition-colors cursor-pointer"
          >
            <Layers className="w-3 h-3 text-red-400" />
            <span className="uppercase hidden md:inline">{viewMode}</span>
            <ChevronDown className="w-3 h-3 text-gray-400" />
          </button>

          {showViewDropdown && (
            <div className="absolute top-full mt-1.5 left-0 z-40 w-44 rounded-lg glass-panel border border-white/15 p-1 shadow-2xl animate-in fade-in zoom-in-95 duration-100">
              <button
                type="button"
                onClick={() => {
                  setViewMode('graph');
                  setShowViewDropdown(false);
                }}
                className={`w-full text-left px-2.5 py-1.5 rounded text-xs font-mono transition-colors cursor-pointer ${
                  viewMode === 'graph' ? 'bg-red-950/60 text-white font-bold' : 'text-gray-300 hover:text-white hover:bg-white/5'
                }`}
              >
                ● Radial Graph
              </button>
              <button
                type="button"
                onClick={() => {
                  setViewMode('kanban');
                  setShowViewDropdown(false);
                }}
                className={`w-full text-left px-2.5 py-1.5 rounded text-xs font-mono transition-colors cursor-pointer ${
                  viewMode === 'kanban' ? 'bg-red-950/60 text-white font-bold' : 'text-gray-300 hover:text-white hover:bg-white/5'
                }`}
              >
                ● Kanban Board
              </button>
              <button
                type="button"
                onClick={() => {
                  setViewMode('list');
                  setShowViewDropdown(false);
                }}
                className={`w-full text-left px-2.5 py-1.5 rounded text-xs font-mono transition-colors cursor-pointer ${
                  viewMode === 'list' ? 'bg-red-950/60 text-white font-bold' : 'text-gray-300 hover:text-white hover:bg-white/5'
                }`}
              >
                ● Agent List
              </button>
            </div>
          )}
        </div>

        {/* Undo / Redo (Disabled Ornaments per Phase 1 spec) */}
        <div className="hidden lg:flex items-center gap-0.5 opacity-40">
          <IconButton aria-label="Undo" size="sm" disabled>
            <Undo2 className="w-3.5 h-3.5" />
          </IconButton>
          <IconButton aria-label="Redo" size="sm" disabled>
            <Redo2 className="w-3.5 h-3.5" />
          </IconButton>
        </div>
      </div>

      {/* Right Zone: SSE Live Status & Settings */}
      <div className="flex items-center gap-2.5">
        {/* SSE Indicator */}
        <div
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#161e28] border border-white/10 text-[11px] font-mono select-none"
          title="Status Koneksi SSE & Gateway Telemetri"
        >
          {sseStatus === 'live' ? (
            <>
              <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(34,197,94,0.8)] animate-pulse" />
              <span className="text-emerald-400 font-semibold hidden md:inline">LIVE</span>
            </>
          ) : (
            <>
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
              <span className="text-amber-400 font-semibold hidden md:inline">RECONNECTING</span>
            </>
          )}
        </div>

        {/* Adapter Tag */}
        <div className="hidden xl:flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded bg-white/5 border border-white/10 text-gray-400">
          <span>ADAPTER:</span>
          <span className="text-white font-semibold uppercase">{adapterType}</span>
        </div>

        {/* Gear / Settings */}
        <IconButton
          aria-label="Pengaturan sistem"
          size="sm"
          variant="ghost"
          onClick={() => setShowSettingsModal(true)}
          className="text-gray-400 hover:text-white"
        >
          <Settings className="w-4 h-4" />
        </IconButton>
      </div>

      {/* Settings Modal (Info / Tailscale / Config) */}
      {showSettingsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-sm glass-panel rounded-xl border border-white/15 p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <h3 className="text-sm font-semibold text-white">DM Mission Control (DMC)</h3>
              <button
                type="button"
                onClick={() => setShowSettingsModal(false)}
                className="text-gray-400 hover:text-white text-xs cursor-pointer font-mono"
              >
                [ESC]
              </button>
            </div>
            <div className="space-y-2 text-xs font-mono text-gray-300">
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-gray-500">Versi:</span>
                <span className="text-white">Phase 1 (Dashboard + Mock Adapter)</span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-gray-500">Gateway:</span>
                <span className="text-white">9router Model Bridge</span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-gray-500">Akses Jaringan:</span>
                <span className="text-emerald-400">Tailscale Internal Mesh</span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-gray-500">Target Phase 2:</span>
                <span className="text-red-400">Hermes Agent Socket & Dynamic Tools</span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowSettingsModal(false)}
              className="w-full py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-mono text-xs cursor-pointer"
            >
              Tutup
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
