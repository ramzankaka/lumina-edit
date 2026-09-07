/**
 * Left Tool Navigation Rail - Professional Studio Tool Dock
 * Quick access to Pan, Crop, Rotate, Flip, Auto-Lighting, Compare, and Biometrics.
 */

import React from 'react';
import { 
  Crop, 
  RotateCw, 
  RotateCcw, 
  FlipHorizontal, 
  FlipVertical, 
  Sparkles, 
  Eye, 
  Columns, 
  UserCheck, 
  RotateCcw as ResetIcon,
  Sliders,
  PenTool,
  Grid
} from 'lucide-react';
import { MainStudioTab } from './Navbar';

interface ToolbarProps {
  studioTab: MainStudioTab;
  onSelectStudioTab: (tab: MainStudioTab) => void;
  onRotateClockwise: () => void;
  onRotateCounter: () => void;
  onToggleFlipH: () => void;
  flipH: boolean;
  onToggleFlipV: () => void;
  flipV: boolean;
  onAutoEnhance: () => void;
  showBiometricGuide: boolean;
  onToggleBiometricGuide: () => void;
  splitCompare: boolean;
  onToggleSplitCompare: () => void;
  isHoldingCompare: boolean;
  onStartHoldCompare: () => void;
  onEndHoldCompare: () => void;
  onResetAll: () => void;
}

export const Toolbar: React.FC<ToolbarProps> = ({
  studioTab,
  onSelectStudioTab,
  onRotateClockwise,
  onRotateCounter,
  onToggleFlipH,
  flipH,
  onToggleFlipV,
  flipV,
  onAutoEnhance,
  showBiometricGuide,
  onToggleBiometricGuide,
  splitCompare,
  onToggleSplitCompare,
  isHoldingCompare,
  onStartHoldCompare,
  onEndHoldCompare,
  onResetAll,
}) => {
  return (
    <aside className="hidden lg:flex w-14 border-r border-white/10 bg-[#0B0D11] flex-col items-center py-3 justify-between shrink-0 select-none z-20">
      {/* Top Quick Actions */}
      <div className="flex flex-col gap-1.5 w-full items-center">
        {/* Crop / Passport Mode */}
        <button
          onClick={() => onSelectStudioTab('passport')}
          title="Crop & 50+ Passport Standards (C)"
          className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
            studioTab === 'passport'
              ? 'bg-amber-500 text-black shadow-md shadow-amber-500/25 font-bold'
              : 'text-white/60 hover:text-white hover:bg-white/5'
          }`}
        >
          <Crop className="w-4 h-4" />
        </button>

        {/* Develop / Adjust Mode */}
        <button
          onClick={() => onSelectStudioTab('adjust')}
          title="Light, Color & Tone Curves (D)"
          className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
            studioTab === 'adjust'
              ? 'bg-amber-500 text-black shadow-md shadow-amber-500/25 font-bold'
              : 'text-white/60 hover:text-white hover:bg-white/5'
          }`}
        >
          <Sliders className="w-4 h-4" />
        </button>

        {/* Retouch Mode */}
        <button
          onClick={() => onSelectStudioTab('retouch')}
          title="AI Retouch & Solid Backgrounds (R)"
          className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
            studioTab === 'retouch'
              ? 'bg-amber-500 text-black shadow-md shadow-amber-500/25 font-bold'
              : 'text-white/60 hover:text-white hover:bg-white/5'
          }`}
        >
          <Sparkles className="w-4 h-4" />
        </button>

        {/* Print Grid Mode */}
        <button
          onClick={() => onSelectStudioTab('sheet')}
          title="Printable 4x6 / A4 Photo Grid (P)"
          className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
            studioTab === 'sheet'
              ? 'bg-amber-500 text-black shadow-md shadow-amber-500/25 font-bold'
              : 'text-white/60 hover:text-white hover:bg-white/5'
          }`}
        >
          <Grid className="w-4 h-4" />
        </button>

        {/* Exam Tools Mode */}
        <button
          onClick={() => onSelectStudioTab('tools')}
          title="Candidate Name Stamp & Signature Scanner (T)"
          className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
            studioTab === 'tools'
              ? 'bg-amber-500 text-black shadow-md shadow-amber-500/25 font-bold'
              : 'text-white/60 hover:text-white hover:bg-white/5'
          }`}
        >
          <PenTool className="w-4 h-4" />
        </button>

        <div className="w-6 h-[1px] bg-white/10 my-2" />

        {/* Rotate +90 */}
        <button
          onClick={onRotateClockwise}
          title="Rotate 90° Clockwise"
          className="w-9 h-9 rounded-xl flex items-center justify-center text-white/60 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
        >
          <RotateCw className="w-3.5 h-3.5" />
        </button>

        {/* Flip Horizontal */}
        <button
          onClick={onToggleFlipH}
          title="Flip Horizontal"
          className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors cursor-pointer ${
            flipH ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'text-white/60 hover:text-white hover:bg-white/5'
          }`}
        >
          <FlipHorizontal className="w-3.5 h-3.5" />
        </button>

        {/* 1-Click Auto Enhance */}
        <button
          onClick={onAutoEnhance}
          title="1-Click Auto Lighting Enhance"
          className="w-9 h-9 rounded-xl flex items-center justify-center text-amber-400 hover:text-amber-300 hover:bg-amber-500/10 transition-colors cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5" />
        </button>

        {/* Hold to Compare */}
        <button
          onMouseDown={onStartHoldCompare}
          onMouseUp={onEndHoldCompare}
          onMouseLeave={onEndHoldCompare}
          onTouchStart={onStartHoldCompare}
          onTouchEnd={onEndHoldCompare}
          title="Press & Hold to Compare Original"
          className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors cursor-pointer ${
            isHoldingCompare ? 'bg-amber-500 text-black font-bold' : 'text-white/60 hover:text-white hover:bg-white/5'
          }`}
        >
          <Eye className="w-3.5 h-3.5" />
        </button>

        {/* Split Screen */}
        <button
          onClick={onToggleSplitCompare}
          title="Toggle Split-Screen Comparison"
          className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors cursor-pointer ${
            splitCompare ? 'bg-amber-500 text-black font-bold' : 'text-white/60 hover:text-white hover:bg-white/5'
          }`}
        >
          <Columns className="w-3.5 h-3.5" />
        </button>

        {/* Biometric Guide Toggle */}
        <button
          onClick={onToggleBiometricGuide}
          title="Toggle Biometric Head Alignment Guides"
          className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors cursor-pointer ${
            showBiometricGuide ? 'bg-amber-500 text-black font-bold' : 'text-white/60 hover:text-white hover:bg-white/5'
          }`}
        >
          <UserCheck className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Bottom Reset Action */}
      <button
        onClick={onResetAll}
        title="Reset All Adjustments"
        className="w-9 h-9 rounded-xl flex items-center justify-center text-white/40 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
      >
        <ResetIcon className="w-3.5 h-3.5" />
      </button>
    </aside>
  );
};
