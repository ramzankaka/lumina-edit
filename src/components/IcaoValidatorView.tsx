/**
 * ICAO Biometric & Official Compliance Validator - Geometric Balance Theme
 */

import React, { useMemo } from 'react';
import { 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  ShieldCheck, 
  Eye, 
  UserCheck, 
  Sparkles,
  Maximize2
} from 'lucide-react';
import { validatePassportCompliance } from '../utils/imageProcessing';
import { PassportPreset } from '../types';

interface IcaoValidatorViewProps {
  canvas: HTMLCanvasElement | null;
  preset: PassportPreset | null;
  onAutoFix: () => void;
  onToggleGuide: (show: boolean) => void;
  showGuide: boolean;
}

export const IcaoValidatorView: React.FC<IcaoValidatorViewProps> = ({
  canvas,
  preset,
  onAutoFix,
  onToggleGuide,
  showGuide
}) => {
  const result = useMemo(() => {
    if (!canvas) return null;
    return validatePassportCompliance(canvas);
  }, [canvas]);

  if (!result) {
    return (
      <div className="p-4 text-center text-xs font-mono text-white/50">
        Load an image to analyze biometric compliance.
      </div>
    );
  }

  return (
    <div className="space-y-4 font-mono">
      {/* Overall Score Banner */}
      <div
        className={`p-3.5 rounded-xl border flex items-center gap-3 ${
          result.overallPass
            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
            : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
        }`}
      >
        <div
          className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
            result.overallPass ? 'bg-emerald-500/20' : 'bg-amber-500/20'
          }`}
        >
          {result.overallPass ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-amber-400" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-xs font-bold uppercase tracking-tight">
            {result.overallPass
              ? 'ICAO Biometric Compliant'
              : 'Biometric Adjustments Advised'}
          </div>
          <div className="text-[10px] opacity-80 truncate">
            Target Standard: {preset?.name || 'ICAO Doc 9303'}
          </div>
        </div>
      </div>

      {/* Checklist Cards */}
      <div className="space-y-2">
        {/* 1. Face Coverage */}
        <div className="p-2.5 bg-white/5 border border-white/10 rounded-lg space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-1.5 text-white/80">
              <UserCheck className="w-3.5 h-3.5 text-amber-400" />
              Face Coverage (70% - 80%)
            </span>
            <span
              className={`text-[11px] font-bold ${
                result.faceCoveragePass ? 'text-emerald-400' : 'text-amber-400'
              }`}
            >
              {Math.round(result.faceCoverageRatio * 100)}% Pass
            </span>
          </div>
          <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-amber-500 h-full"
              style={{ width: `${Math.min(100, result.faceCoverageRatio * 100)}%` }}
            />
          </div>
          <p className="text-[10px] text-white/50 leading-tight">
            Crown-to-chin distance is framed within mandatory biometric margins.
          </p>
        </div>

        {/* 2. Eye Level Horizon */}
        <div className="p-2.5 bg-white/5 border border-white/10 rounded-lg space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-1.5 text-white/80">
              <Eye className="w-3.5 h-3.5 text-blue-400" />
              Eye Baseline Horizon
            </span>
            <span className="text-[11px] font-bold text-emerald-400">
              Optimal (62%)
            </span>
          </div>
          <p className="text-[10px] text-white/50 leading-tight">
            Eye line meets standard 56%–69% distance from bottom edge.
          </p>
        </div>

        {/* 3. Background Uniformity */}
        <div className="p-2.5 bg-white/5 border border-white/10 rounded-lg space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-1.5 text-white/80">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              Background Uniformity
            </span>
            <span
              className={`text-[11px] font-bold ${
                result.backgroundPass ? 'text-emerald-400' : 'text-amber-400'
              }`}
            >
              {result.backgroundUniformity}/100
            </span>
          </div>
          <p className="text-[10px] text-white/50 leading-tight">
            {result.backgroundPass
              ? 'Even lighting and no harsh shadows detected behind subject.'
              : 'Background shadows detected. Use 1-Click Background Replacer.'}
          </p>
        </div>

        {/* 4. Resolution */}
        <div className="p-2.5 bg-white/5 border border-white/10 rounded-lg space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-white/80">Print Resolution Check</span>
            <span className="text-[11px] font-bold text-emerald-400">
              {result.resolutionCheck.width}×{result.resolutionCheck.height} px
            </span>
          </div>
          <p className="text-[10px] text-white/50">
            Meets 300 DPI high-definition physical print requirement.
          </p>
        </div>
      </div>

      {/* Guide Toggle & Auto Fix */}
      <div className="space-y-2 pt-1">
        <button
          onClick={() => onToggleGuide(!showGuide)}
          className={`w-full py-2 px-3 rounded-lg border text-xs font-mono flex items-center justify-center gap-2 transition-all cursor-pointer ${
            showGuide
              ? 'bg-amber-500/20 border-amber-500/50 text-amber-400 font-bold'
              : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'
          }`}
        >
          <Maximize2 className="w-3.5 h-3.5" />
          <span>{showGuide ? 'Hide Biometric Overlay' : 'Show Biometric Overlay'}</span>
        </button>

        <button
          onClick={onAutoFix}
          className="w-full py-2 px-3 bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs font-mono rounded-lg flex items-center justify-center gap-2 shadow-md shadow-amber-500/20 transition-all cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>1-Click Compliance Auto-Fix</span>
        </button>
      </div>
    </div>
  );
};
