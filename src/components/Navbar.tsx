/**
 * Lumina Studio Pro - Professional Header Navigation
 * Sleek dark graphite bar with Studio Mode Switcher, Undo/Redo, Samples & Primary Actions.
 */

import React, { useRef } from 'react';
import { 
  Download, 
  RotateCcw, 
  RotateCw, 
  FolderOpen, 
  Share2, 
  Camera,
  Sliders,
  Crop,
  Sparkles,
  Grid,
  PenTool,
  Images
} from 'lucide-react';
import { ToolMode } from '../types';

export type MainStudioTab = 'passport' | 'adjust' | 'retouch' | 'sheet' | 'tools';

interface NavbarProps {
  imageLoaded: boolean;
  imageDimensions: { width: number; height: number };
  activeFilename: string;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onOpenImage: (file: File) => void;
  onOpenShareModal: () => void;
  onOpenExportModal: () => void;
  studioTab: MainStudioTab;
  onSelectStudioTab: (tab: MainStudioTab) => void;
  isSamplesTrayOpen: boolean;
  onToggleSamplesTray: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  imageLoaded,
  imageDimensions,
  activeFilename,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onOpenImage,
  onOpenShareModal,
  onOpenExportModal,
  studioTab,
  onSelectStudioTab,
  isSamplesTrayOpen,
  onToggleSamplesTray,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onOpenImage(e.target.files[0]);
    }
  };

  const studioModes: { id: MainStudioTab; label: string; icon: React.ReactNode }[] = [
    { id: 'adjust', label: 'Develop', icon: <Sliders className="w-3.5 h-3.5" /> },
    { id: 'passport', label: 'Passport & ID', icon: <Crop className="w-3.5 h-3.5" /> },
    { id: 'retouch', label: 'AI Retouch', icon: <Sparkles className="w-3.5 h-3.5" /> },
    { id: 'sheet', label: 'Print Grid', icon: <Grid className="w-3.5 h-3.5" /> },
    { id: 'tools', label: 'Exam Tools', icon: <PenTool className="w-3.5 h-3.5" /> },
  ];

  return (
    <header className="h-14 border-b border-white/10 bg-[#0B0D11] flex items-center justify-between px-3 sm:px-5 shrink-0 select-none z-30 text-white font-sans">
      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />

      {/* Left: Brand Identity & Active Document Badge */}
      <div className="flex items-center gap-3 min-w-0">
        <div className="flex items-center gap-2 shrink-0">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-black font-bold shadow-md shadow-amber-500/25 shrink-0">
            <Camera className="w-4 h-4 text-black stroke-[2.5]" />
          </div>
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-sm tracking-tight text-white hidden xs:inline">
              Lumina
            </span>
            <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-md bg-amber-500/20 text-amber-400 border border-amber-500/30">
              Pro
            </span>
          </div>
        </div>

        {/* Active Document Info Badge */}
        {imageLoaded && (
          <div className="hidden md:flex items-center gap-2 pl-3 border-l border-white/10 text-xs text-white/50 min-w-0">
            <span className="truncate max-w-[150px] lg:max-w-[200px] text-white/80 font-medium">
              {activeFilename}
            </span>
            <span className="text-[10px] px-1.5 py-0.5 bg-white/5 rounded text-amber-400 font-mono font-medium">
              {imageDimensions.width} × {imageDimensions.height} px
            </span>
          </div>
        )}
      </div>

      {/* Center: High-Level Studio Mode Switcher (Desktop & Laptop) */}
      <div className="hidden lg:flex items-center bg-black/40 p-1 rounded-xl border border-white/10 shadow-inner">
        {studioModes.map((mode) => {
          const isActive = studioTab === mode.id;
          return (
            <button
              key={mode.id}
              onClick={() => onSelectStudioTab(mode.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                isActive
                  ? 'bg-amber-500 text-black font-semibold shadow-md shadow-amber-500/20'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              {mode.icon}
              <span>{mode.label}</span>
            </button>
          );
        })}
      </div>

      {/* Right: History, Samples, Open, Share & Export */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* Undo / Redo */}
        <div className="flex items-center bg-white/5 p-0.5 rounded-xl border border-white/10">
          <button
            onClick={onUndo}
            disabled={!canUndo}
            className="p-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/10 disabled:opacity-20 disabled:hover:bg-transparent transition-colors cursor-pointer"
            title="Undo (Ctrl+Z)"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onRedo}
            disabled={!canRedo}
            className="p-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/10 disabled:opacity-20 disabled:hover:bg-transparent transition-colors cursor-pointer"
            title="Redo (Ctrl+Y)"
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Quick Samples Filmstrip Toggle */}
        <button
          onClick={onToggleSamplesTray}
          className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl border text-xs font-medium transition-all cursor-pointer ${
            isSamplesTrayOpen
              ? 'bg-amber-500/20 border-amber-500 text-amber-400'
              : 'bg-white/5 border-white/10 text-white/70 hover:text-white hover:bg-white/10'
          }`}
          title="Toggle Sample Photos Filmstrip Tray"
        >
          <Images className="w-3.5 h-3.5 text-amber-400" />
          <span className="hidden sm:inline">Samples</span>
        </button>

        {/* Open File Button */}
        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-medium text-white transition-all cursor-pointer"
          title="Open photo from your device"
        >
          <FolderOpen className="w-3.5 h-3.5 text-white/70" />
          <span className="hidden xs:inline">Open</span>
        </button>

        {/* Share Button (WhatsApp, Bluetooth, Native, etc.) */}
        <button
          onClick={onOpenShareModal}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-xl text-xs font-medium text-white transition-all cursor-pointer"
          title="Share picture to WhatsApp, Bluetooth, or Apps"
        >
          <Share2 className="w-3.5 h-3.5 text-blue-400" />
          <span className="hidden xs:inline">Share</span>
        </button>

        {/* Primary Export Action */}
        <button
          onClick={onOpenExportModal}
          className="flex items-center gap-1.5 px-3.5 sm:px-4 py-1.5 bg-amber-500 hover:bg-amber-400 active:scale-95 text-black font-semibold text-xs rounded-xl shadow-md shadow-amber-500/20 transition-all cursor-pointer"
          title="Export image with strict target KB compression"
        >
          <Download className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>Export</span>
        </button>
      </div>
    </header>
  );
};
