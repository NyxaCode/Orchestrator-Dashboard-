import React from 'react';
import { ForceGraphSettings } from './forceSimulation';
import { Sliders, RotateCcw, Play, X } from 'lucide-react';

interface ObsidianGraphControlsProps {
  settings: ForceGraphSettings;
  isOpen: boolean;
  onToggleOpen: () => void;
  onUpdateSettings: (newSettings: Partial<ForceGraphSettings>) => void;
  onReheat: () => void;
  onResetDefaults: () => void;
}

export const ObsidianGraphControls: React.FC<ObsidianGraphControlsProps> = ({
  settings,
  isOpen,
  onToggleOpen,
  onUpdateSettings,
  onReheat,
  onResetDefaults,
}) => {
  return (
    <div className="relative">
      {/* Sleek Toggle Button */}
      <button
        type="button"
        onClick={onToggleOpen}
        title="Pengaturan Gaya Graf (Force Settings)"
        aria-label="Graph Forces"
        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-mono transition-all cursor-pointer backdrop-blur-md ${
          isOpen
            ? 'bg-red-950/80 border-red-500/60 text-white shadow-lg'
            : 'bg-[#161e28]/90 hover:bg-[#202936] text-gray-300 hover:text-white border-white/15'
        }`}
      >
        <Sliders className="w-3.5 h-3.5 text-red-400" />
        <span className="hidden sm:inline">Forces</span>
      </button>

      {/* Clean Obsidian Minimalist Popover */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-64 p-3 rounded-xl bg-[#0f141c]/95 border border-white/15 text-white shadow-2xl backdrop-blur-xl z-50 select-none animate-in fade-in zoom-in-95 duration-100">
          {/* Header */}
          <div className="flex items-center justify-between pb-2 mb-2.5 border-b border-white/10">
            <span className="text-[11px] font-bold font-mono tracking-wider text-gray-200 uppercase">
              GRAPH FORCES
            </span>
            <button
              type="button"
              onClick={onToggleOpen}
              className="text-gray-400 hover:text-white p-0.5 rounded cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Simple Clean Sliders */}
          <div className="space-y-2.5 text-[11px] font-mono">
            {/* Repulsion Force */}
            <div>
              <div className="flex justify-between text-gray-400 mb-1">
                <span>Repulsion</span>
                <span className="text-gray-300 tabular-nums">{Math.abs(settings.repelForce)}</span>
              </div>
              <input
                type="range"
                min="-1200"
                max="-300"
                step="50"
                value={settings.repelForce}
                onChange={(e) => onUpdateSettings({ repelForce: parseInt(e.target.value, 10) })}
                className="w-full accent-red-500 cursor-pointer h-1 bg-white/15 rounded-lg appearance-none"
              />
            </div>

            {/* Link Distance */}
            <div>
              <div className="flex justify-between text-gray-400 mb-1">
                <span>Distance</span>
                <span className="text-gray-300 tabular-nums">{settings.linkDistance}px</span>
              </div>
              <input
                type="range"
                min="120"
                max="280"
                step="10"
                value={settings.linkDistance}
                onChange={(e) => onUpdateSettings({ linkDistance: parseInt(e.target.value, 10) })}
                className="w-full accent-red-500 cursor-pointer h-1 bg-white/15 rounded-lg appearance-none"
              />
            </div>

            {/* Center Gravity */}
            <div>
              <div className="flex justify-between text-gray-400 mb-1">
                <span>Gravity</span>
                <span className="text-gray-300 tabular-nums">{settings.centerForce.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0.02"
                max="0.20"
                step="0.01"
                value={settings.centerForce}
                onChange={(e) => onUpdateSettings({ centerForce: parseFloat(e.target.value) })}
                className="w-full accent-red-500 cursor-pointer h-1 bg-white/15 rounded-lg appearance-none"
              />
            </div>

            {/* Actions: Re-Simulate & Reset */}
            <div className="flex items-center gap-1.5 pt-2 border-t border-white/10">
              <button
                type="button"
                onClick={onReheat}
                title="Jalankan simulasi fisik"
                className="flex-1 flex items-center justify-center gap-1 py-1 px-2 rounded-md bg-red-600 hover:bg-red-700 text-white text-[10px] font-semibold transition-colors cursor-pointer"
              >
                <Play className="w-3 h-3 fill-current" />
                <span>Simulate</span>
              </button>

              <button
                type="button"
                onClick={onResetDefaults}
                title="Reset ke setelan standar"
                className="flex items-center justify-center gap-1 py-1 px-2.5 rounded-md bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white text-[10px] transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
