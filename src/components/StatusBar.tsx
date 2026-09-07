/**
 * Bottom Status Bar - Geometric Balance Theme
 */

import React from 'react';

interface StatusBarProps {
  cursorX: number;
  cursorY: number;
  cursorRgb: string;
  activeFilename: string;
  canvasWidth: number;
  canvasHeight: number;
}

export const StatusBar: React.FC<StatusBarProps> = ({
  cursorX,
  cursorY,
  cursorRgb,
  activeFilename,
  canvasWidth,
  canvasHeight
}) => {
  return (
    <footer className="h-12 border-t border-white/10 bg-[#0A0A0A] flex items-center justify-between px-6 shrink-0 select-none font-mono text-white/60">
      {/* Live Coordinate & RGB readouts from Geometric Balance design */}
      <div className="flex items-center gap-6 text-[10px] opacity-70">
        <span className="flex items-center gap-1">
          <span className="text-amber-500 font-bold">X:</span> {cursorX}
        </span>
        <span className="flex items-center gap-1">
          <span className="text-amber-500 font-bold">Y:</span> {cursorY}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="text-amber-500 font-bold">RGB:</span> {cursorRgb.replace('rgb(', '').replace(')', '')}
          <span 
            className="w-2.5 h-2.5 rounded-sm inline-block border border-white/20 shadow-xs"
            style={{ backgroundColor: cursorRgb }}
          />
        </span>
        <span className="hidden sm:inline-block opacity-40">|</span>
        <span className="hidden sm:inline-block">
          {canvasWidth > 0 ? `${canvasWidth}×${canvasHeight} px` : 'No Image'}
        </span>
      </div>

      {/* File status & green pulse indicator */}
      <div className="flex items-center gap-4 text-[10px]">
        <span className="uppercase tracking-tight opacity-50 font-semibold truncate max-w-[200px] sm:max-w-md">
          {activeFilename}
        </span>
        <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
          <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-sm shadow-emerald-500/50" />
          <span className="hidden md:inline text-[9px] uppercase tracking-wider opacity-80">100% Offline Engine</span>
        </div>
      </div>
    </footer>
  );
};
