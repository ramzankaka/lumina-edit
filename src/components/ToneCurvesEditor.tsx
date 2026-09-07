/**
 * Interactive Tone Curves Editor - Geometric Balance Theme
 */

import React from 'react';
import { ToneCurves } from '../types';
import { RotateCcw } from 'lucide-react';

interface ToneCurvesEditorProps {
  curves: ToneCurves;
  onChange: (curves: ToneCurves) => void;
  onReset: () => void;
}

export const ToneCurvesEditor: React.FC<ToneCurvesEditorProps> = ({
  curves,
  onChange,
  onReset
}) => {
  // SVG points for visual representation of the curve
  const p0 = { x: 0, y: 100 - (0 + (curves.shadows / 50) * 25) };
  const p1 = { x: 33, y: 75 - (curves.darks / 50) * 25 };
  const p2 = { x: 66, y: 35 - (curves.lights / 50) * 25 };
  const p3 = { x: 100, y: Math.max(0, 0 - (curves.highlights / 50) * 25) };

  const pathD = `M 0,${p0.y} C 20,${p1.y} 50,${p2.y} 100,${p3.y}`;

  const channelColor =
    curves.channel === 'red'
      ? '#EF4444'
      : curves.channel === 'green'
      ? '#22C55E'
      : curves.channel === 'blue'
      ? '#3B82F6'
      : '#F59E0B';

  return (
    <div className="space-y-4">
      {/* Channel Selector */}
      <div className="flex items-center justify-between">
        <label className="text-[11px] font-mono text-white/60 uppercase tracking-wider">
          Channel
        </label>
        <div className="flex items-center gap-1 bg-white/5 p-0.5 rounded-lg border border-white/10">
          {(['all', 'red', 'green', 'blue'] as const).map((ch) => (
            <button
              key={ch}
              onClick={() => onChange({ ...curves, channel: ch })}
              className={`px-2 py-0.5 text-[10px] font-mono rounded capitalize transition-all cursor-pointer ${
                curves.channel === ch
                  ? 'bg-white/20 text-white font-bold shadow-xs'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              {ch === 'all' ? 'RGB' : ch}
            </button>
          ))}
        </div>
      </div>

      {/* Interactive Visual Spline Curve Box */}
      <div className="relative w-full h-36 bg-black/50 border border-white/10 rounded-lg p-2 overflow-hidden flex flex-col justify-between">
        {/* Subtle 4x4 Grid */}
        <div className="absolute inset-0 grid grid-cols-4 grid-rows-4 pointer-events-none opacity-15">
          {Array.from({ length: 16 }).map((_, i) => (
            <div key={i} className="border-r border-b border-white" />
          ))}
        </div>

        {/* Diagonal Reference Line */}
        <svg className="absolute inset-2 w-[calc(100%-16px)] h-[calc(100%-16px)] pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
          <line x1="0" y1="100" x2="100" y2="0" stroke="rgba(255,255,255,0.15)" strokeDasharray="3 3" />
          <path d={pathD} fill="none" stroke={channelColor} strokeWidth="2.5" />
        </svg>

        <div className="relative z-10 flex justify-between text-[9px] font-mono text-white/40">
          <span>Highlights</span>
          <span>Midtones</span>
          <span>Shadows</span>
        </div>
      </div>

      {/* Sliders */}
      <div className="space-y-2.5">
        {[
          { key: 'highlights', label: 'Highlights', val: curves.highlights },
          { key: 'lights', label: 'Lights', val: curves.lights },
          { key: 'darks', label: 'Darks', val: curves.darks },
          { key: 'shadows', label: 'Shadows', val: curves.shadows }
        ].map((item) => (
          <div key={item.key} className="space-y-1">
            <div className="flex justify-between text-[11px] font-mono">
              <span className="text-white/70">{item.label}</span>
              <span className="text-amber-400 font-bold">
                {item.val > 0 ? `+${item.val}` : item.val}
              </span>
            </div>
            <input
              type="range"
              min="-50"
              max="50"
              value={item.val}
              onChange={(e) =>
                onChange({ ...curves, [item.key]: Number(e.target.value) })
              }
              className="w-full accent-amber-500 h-1 bg-white/10 rounded-lg appearance-none cursor-pointer"
            />
          </div>
        ))}
      </div>

      <button
        onClick={onReset}
        className="w-full py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded text-[11px] font-mono text-white/70 hover:text-white flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
      >
        <RotateCcw className="w-3 h-3" />
        <span>Reset Curves</span>
      </button>
    </div>
  );
};
