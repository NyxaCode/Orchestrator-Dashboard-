import React, { useState } from 'react';
import { useProjectsStore } from '../../stores/projects';
import { useUiStore } from '../../stores/ui';
import { useChatStore } from '../../stores/chat';
import { getCurrentAdapterType } from '../../server/adapters';
import { AddAgentModal } from '../graph/AddAgentModal';
import { SystemConfigModal } from './SystemConfigModal';
import {
  Settings,
  Menu,
  Network,
  Kanban,
  UserPlus,
  HelpCircle,
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

  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showAddAgentModal, setShowAddAgentModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const adapterType = getCurrentAdapterType();

  return (
    <header className="h-12 border-b border-white/10 bg-[#121820] px-2.5 sm:px-3.5 flex items-center justify-between gap-2 select-none shrink-0 z-30 overflow-hidden">
      {/* Zone 1: Brand & Breadcrumb */}
      <div className="flex items-center gap-1.5 sm:gap-2.5 min-w-0 shrink">
        <IconButton
          aria-label="Toggle Sidebar"
          size="sm"
          variant="ghost"
          onClick={toggleSidebar}
          className="md:hidden text-gray-400 hover:text-white shrink-0 p-1"
        >
          <Menu className="w-4 h-4" />
        </IconButton>

        {/* Logo DMC */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="w-6 h-6 rounded-md bg-red-600 flex items-center justify-center shadow-[0_0_12px_rgba(220,38,38,0.5)] shrink-0">
            <span className="font-mono font-bold text-xs text-white tracking-tighter">DM</span>
          </div>
          <span className="text-sm font-bold tracking-tight text-white hidden md:inline font-sans shrink-0">
            Mission Control
          </span>
        </div>

        {/* Breadcrumb separator */}
        <div className="hidden sm:flex items-center gap-1 text-xs text-gray-500 font-mono min-w-0 truncate">
          <span className="text-gray-600 shrink-0">/</span>
          <span className="text-gray-400 hidden xl:inline shrink-0">Project</span>
          <span className="hidden xl:inline text-gray-600 shrink-0">›</span>
          <span className="text-white font-medium truncate max-w-[80px] sm:max-w-[110px] md:max-w-[140px] lg:max-w-[190px]">
            {currentProject?.name || 'Overview'}
          </span>
        </div>
      </div>

      {/* Zone 2: View Switcher (Desktop/Tablet Segmented Tabs: Graph & Kanban) */}
      <div className="hidden md:flex items-center justify-center shrink-0">
        <div className="flex items-center p-0.5 rounded-lg bg-[#0a0e14] border border-white/10 shadow-inner">
          <button
            type="button"
            onClick={() => setViewMode('graph')}
            className={cn(
              'flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-mono transition-all cursor-pointer',
              viewMode === 'graph'
                ? 'bg-red-600 text-white font-bold shadow-xs'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            )}
          >
            <Network className="w-3.5 h-3.5 shrink-0" />
            <span>Graph</span>
            <span className="hidden lg:inline">Canvas</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode('kanban')}
            className={cn(
              'flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-mono transition-all cursor-pointer',
              viewMode === 'kanban'
                ? 'bg-red-600 text-white font-bold shadow-xs'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            )}
          >
            <Kanban className="w-3.5 h-3.5 shrink-0" />
            <span>Kanban</span>
            <span className="hidden lg:inline">Board</span>
          </button>
        </div>
      </div>

      {/* Zone 3: Quick Actions, Live Status & Settings */}
      <div className="flex items-center gap-1 sm:gap-2 shrink-0 ml-auto">
        {/* + Add Agent CTA Button */}
        <button
          type="button"
          onClick={() => setShowAddAgentModal(true)}
          className="flex items-center gap-1.5 p-1.5 sm:px-2.5 sm:py-1 rounded-lg bg-red-600/15 hover:bg-red-600/25 border border-red-500/40 text-red-200 hover:text-white text-xs font-mono transition-colors cursor-pointer shrink-0"
          title="Tambah Sub-Agent ke Graf"
        >
          <UserPlus className="w-3.5 h-3.5 text-red-400 shrink-0" />
          <span className="hidden lg:inline">+ Add Agent</span>
        </button>

        {/* Quick Guide / Onboarding Button */}
        <button
          type="button"
          onClick={() => setShowHelpModal(true)}
          className="hidden sm:flex items-center gap-1 p-1.5 sm:px-2 sm:py-1 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white text-xs font-mono border border-white/10 transition-colors cursor-pointer shrink-0"
          title="Panduan Penggunaan Singkat"
        >
          <HelpCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span className="hidden xl:inline">Bantuan</span>
        </button>

        {/* SSE Live Status Indicator */}
        <div
          className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-[#161e28] border border-white/10 text-[11px] font-mono select-none shrink-0"
          title={sseStatus === 'live' ? 'Telemetri Live Terhubung' : 'Sedang Menghubungkan...'}
        >
          {sseStatus === 'live' ? (
            <>
              <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(34,197,94,0.8)] animate-pulse shrink-0" />
              <span className="text-emerald-400 font-semibold hidden lg:inline">LIVE</span>
            </>
          ) : (
            <>
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping shrink-0" />
              <span className="text-amber-400 font-semibold hidden lg:inline">SYNC</span>
            </>
          )}
        </div>

        {/* Settings */}
        <IconButton
          aria-label="Pengaturan sistem"
          size="sm"
          variant="ghost"
          onClick={() => setShowSettingsModal(true)}
          className="text-gray-400 hover:text-white shrink-0"
        >
          <Settings className="w-4 h-4" />
        </IconButton>
      </div>

      {/* Add Agent Modal */}
      <AddAgentModal
        isOpen={showAddAgentModal}
        onClose={() => setShowAddAgentModal(false)}
      />

      {/* Quick Help / Onboarding Modal */}
      {showHelpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs select-none">
          <div className="w-full max-w-md rounded-2xl bg-[#0e141d] border border-white/15 p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-semibold text-white">Panduan Navigasi & UX DMC</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowHelpModal(false)}
                className="text-gray-400 hover:text-white text-xs font-mono cursor-pointer"
              >
                [ESC]
              </button>
            </div>
            <div className="space-y-3 text-xs text-gray-300 font-sans leading-relaxed">
              <div className="p-2.5 rounded-lg bg-white/5 border border-white/10 space-y-1">
                <span className="font-semibold text-white block">1. Graf Orkestrasi Radial</span>
                <p className="text-gray-400">
                  Node merah di pusat adalah <strong>Shinaa (Orchestrator Lead)</strong>. Arahkan mouse ke node agen untuk melihat tombol cepat (Chat atau Log). Klik node mana pun untuk membuka panel Inspector.
                </p>
              </div>
              <div className="p-2.5 rounded-lg bg-white/5 border border-white/10 space-y-1">
                <span className="font-semibold text-white block">2. Chat & Pendelegasian Tugas</span>
                <p className="text-gray-400">
                  Kirim pesan ke Shinaa untuk pendelegasian otomatis. Gunakan <code>@nama_agent</code> untuk menargetkan agen tertentu, atau ketik <code>/</code> untuk menampilkan daftar perintah seperti <code>/simulate-error</code>, <code>/plan</code>, dan <code>/status</code>.
                </p>
              </div>
              <div className="p-2.5 rounded-lg bg-white/5 border border-white/10 space-y-1">
                <span className="font-semibold text-white block">3. Manajemen Task Kanban</span>
                <p className="text-gray-400">
                  Beralih ke tab <strong>Kanban Board</strong> untuk melihat antrian tugas yang sedang berjalan atau sudah selesai dikerjakan oleh para agen.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowHelpModal(false)}
              className="w-full py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-mono text-xs cursor-pointer"
            >
              Mengerti, Lanjutkan
            </button>
          </div>
        </div>
      )}

      {/* System & Gateway Configuration Simulator Modal */}
      <SystemConfigModal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
      />
    </header>
  );
};
