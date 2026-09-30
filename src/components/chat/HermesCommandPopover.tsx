import React, { useEffect, useRef } from 'react';
import { Terminal, Shield, Brain, Cpu, MessageSquare, Mic, Trash2, ListOrdered, HelpCircle } from 'lucide-react';

export interface HermesCommand {
  command: string;
  syntax: string;
  description: string;
  icon: React.ReactNode;
  category: 'mode' | 'config' | 'control';
}

export const HERMES_COMMANDS: HermesCommand[] = [
  {
    command: '/mode',
    syntax: '/mode <default|planning|ask>',
    description: 'Ubah mode eksekusi Hermes (default, planning, atau ask)',
    icon: <MessageSquare className="w-3.5 h-3.5 text-amber-400" />,
    category: 'mode',
  },
  {
    command: '/thinking',
    syntax: '/thinking <off|low|medium|high|extended>',
    description: 'Atur level reasoning / pemikiran mendalam model',
    icon: <Brain className="w-3.5 h-3.5 text-purple-400" />,
    category: 'config',
  },
  {
    command: '/model',
    syntax: '/model <claude-opus-4.6|gpt-oss-20b|deepseek|gemini>',
    description: 'Ganti model AI yang digunakan Hermes',
    icon: <Cpu className="w-3.5 h-3.5 text-cyan-400" />,
    category: 'config',
  },
  {
    command: '/agent',
    syntax: '/agent <shinaa|rika|lia|momo|cody|aria|sonix>',
    description: 'Pilih atau alihkan target langsung ke sub-agent Hermes',
    icon: <Shield className="w-3.5 h-3.5 text-red-400" />,
    category: 'control',
  },
  {
    command: '/status',
    syntax: '/status',
    description: 'Tampilkan laporan telemetri & status Hermes saat ini',
    icon: <Terminal className="w-3.5 h-3.5 text-emerald-400" />,
    category: 'control',
  },
  {
    command: '/plan',
    syntax: '/plan <task deskripsi>',
    description: 'Jalankan task dalam mode planning dengan dekomposisi langkah',
    icon: <ListOrdered className="w-3.5 h-3.5 text-amber-400" />,
    category: 'mode',
  },
  {
    command: '/ask',
    syntax: '/ask <pertanyaan>',
    description: 'Jalankan dalam mode konsultasi & konfirmasi sebelum eksekusi',
    icon: <HelpCircle className="w-3.5 h-3.5 text-blue-400" />,
    category: 'mode',
  },
  {
    command: '/voice',
    syntax: '/voice',
    description: 'Aktifkan atau nonaktifkan mode suara (voice on/off)',
    icon: <Mic className="w-3.5 h-3.5 text-yellow-400" />,
    category: 'control',
  },
  {
    command: '/clear',
    syntax: '/clear',
    description: 'Bersihkan riwayat percakapan thread saat ini',
    icon: <Trash2 className="w-3.5 h-3.5 text-red-400" />,
    category: 'control',
  },
  {
    command: '/help',
    syntax: '/help',
    description: 'Lihat daftar lengkap panduan perintah Hermes CLI',
    icon: <Terminal className="w-3.5 h-3.5 text-gray-300" />,
    category: 'control',
  },
];

interface HermesCommandPopoverProps {
  filter: string;
  activeIndex?: number;
  onHoverIndex?: (index: number) => void;
  onSelectCommand: (cmd: HermesCommand) => void;
  onClose: () => void;
}

export const HermesCommandPopover: React.FC<HermesCommandPopoverProps> = ({
  filter,
  activeIndex = 0,
  onHoverIndex,
  onSelectCommand,
}) => {
  const cleanFilter = filter.toLowerCase().replace(/^\//, '');
  const listRef = useRef<HTMLDivElement>(null);

  const filtered = HERMES_COMMANDS.filter((cmd) => {
    if (!cleanFilter) return true;
    const nameMatch = cmd.command.toLowerCase().includes(cleanFilter);
    const descMatch = cmd.description.toLowerCase().includes(cleanFilter);
    return nameMatch || descMatch;
  });

  // Auto-scroll active item into view
  useEffect(() => {
    if (listRef.current) {
      const activeEl = listRef.current.children[activeIndex] as HTMLElement;
      if (activeEl) {
        activeEl.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [activeIndex]);

  if (filtered.length === 0) return null;

  return (
    <div className="absolute bottom-full mb-2 left-3 right-3 max-w-md z-50 rounded-xl bg-[#0e131b]/98 border border-amber-500/40 p-1.5 shadow-2xl backdrop-blur-xl text-white font-mono animate-in fade-in zoom-in-95 duration-100 select-none">
      <div className="px-2 py-1.5 flex items-center justify-between border-b border-white/10 text-[10px] text-amber-400 font-bold uppercase tracking-wider">
        <span>HERMES CLI COMMANDS</span>
        <span className="text-gray-400 font-normal">Tekan Tab atau ↵</span>
      </div>

      <div ref={listRef} className="max-h-56 overflow-y-auto divide-y divide-white/5 py-1">
        {filtered.map((cmd, idx) => {
          const isHighlighted = idx === activeIndex;
          return (
            <button
              key={cmd.command}
              type="button"
              onMouseEnter={() => onHoverIndex?.(idx)}
              onClick={() => onSelectCommand(cmd)}
              className={`w-full text-left px-2 py-1.5 rounded-lg flex items-start gap-2.5 transition-all cursor-pointer ${
                isHighlighted
                  ? 'bg-amber-500/25 text-white border border-amber-500/60 shadow-sm'
                  : 'hover:bg-white/5 border border-transparent'
              }`}
            >
              <div
                className={`mt-0.5 shrink-0 p-1 rounded ${
                  isHighlighted ? 'bg-amber-400/20 text-white' : 'bg-white/5 text-gray-400'
                }`}
              >
                {cmd.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-amber-300">
                    {cmd.command}
                  </span>
                  <span className="text-[10px] text-gray-500 truncate">
                    {cmd.syntax}
                  </span>
                </div>
                <p className="text-[10px] text-gray-400 truncate">
                  {cmd.description}
                </p>
              </div>
              {isHighlighted && (
                <span className="shrink-0 text-[9px] px-1.5 py-0.5 rounded bg-amber-400/20 text-amber-200 font-mono font-medium self-center">
                  Tab ⇥
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
