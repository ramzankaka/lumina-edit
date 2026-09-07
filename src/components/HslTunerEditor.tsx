/**
 * 8-Channel HSL Tuner Component - Geometric Balance Theme
 */

import React, { useState } from 'react';
import { HslColorChannel, HslTuner } from '../types';
import { RotateCcw, User } from 'lucide-react';
import { DEFAULT_HSL_TUNER } from '../utils/imageProcessing';

interface HslTunerEditorProps {
  hslTuner: HslTuner;
  onChange: (tuner: HslTuner) => void;
  onReset: () => void;
}

const CHANNELS: { id: HslColorChannel; label: string; color: string }[] = [
  { id: 'red', label: 'Red', color: '#EF4444' },
  { id: 'orange', label: 'Orange', color: '#F97316' },
  { id: 'yellow', label: 'Yellow', color: '#EAB308' },
  { id: 'green', label: 'Green', color: '#22C55E' },
  { id: 'cyan', label: 'Cyan', color: '#06B6D4' },
  { id: 'blue', label: 'Blue', color: '#3B82F6' },
  { id: 'purple', label: 'Purple', color: '#A855F7' },
  { id: 'magenta', label: 'Magenta', color: '#EC4899' }
];

export const HslTunerEditor: React.FC<HslTunerEditorProps> = ({
  hslTuner,
  onChange,
  onReset
}) => {
  const [activeChannel, setActiveChannel] = useState<HslColorChannel>('orange');

  const current = hslTuner[activeChannel];

  const updateCurrentChannel = (key: 'hue' | 'saturation' | 'luminance', val: number) => {
    onChange({
      ...hslTuner,
      [activeChannel]: {
        ...hslTuner[activeChannel],
        [key]: val
      }
    });
  };

  const handleSkinTonePreset = () => {
    // Perfect skin tone preset: soften orange saturation and boost luminance
    onChange({
      ...hslTuner,
      orange: { hue: 2, saturation: -6, luminance: 12 },
      red: { hue: 0, saturation: -4, luminance: 8 }
    });
    setActiveChannel('orange');
  };

  return (
    <div className="space-y-4">
      {/* Skin Tone Quick Preset Button */}
      <button
        onClick={handleSkinTonePreset}
        className="w-full py-1.5 px-2.5 bg-amber-500/15 border border-amber-500/30 hover:border-amber-500/60 rounded-lg text-xs font-mono text-amber-400 flex items-center justify-center gap-2 transition-all cursor-pointer"
      >
        <User className="w-3.5 h-3.5" />
        <span>Target Natural Skin Tone (Orange/Red)</span>
      </button>

      {/* 8 Color Swatches */}
      <div>
        <label className="text-[11px] font-mono text-white/60 uppercase tracking-wider block mb-2">
          Color Spectrum Channels
        </label>
        <div className="grid grid-cols-4 gap-1.5">
          {CHANNELS.map((ch) => {
            const isSelected = activeChannel === ch.id;
            return (
              <button
                key={ch.id}
                onClick={() => setActiveChannel(ch.id)}
                className={`py-1.5 px-2 rounded-lg border text-[11px] font-mono flex items-center gap-1.5 transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-white/20 border-white/40 text-white font-bold'
                    : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'
                }`}
              >
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: ch.color }}
                />
                <span className="truncate">{ch.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Sliders for Active Channel */}
      <div className="space-y-3 p-3 bg-white/5 border border-white/10 rounded-lg">
        <div className="flex items-center justify-between pb-1 border-b border-white/10">
          <span className="text-xs font-mono font-bold text-white capitalize flex items-center gap-1.5">
            <span
              className="w-2.5 h-2.5 rounded-full"
              style={{
                backgroundColor:
                  CHANNELS.find((c) => c.id === activeChannel)?.color || '#FFF'
              }}
            />
            {activeChannel} Channel Tuning
          </span>
          <button
            onClick={() =>
              onChange({
                ...hslTuner,
                [activeChannel]: { hue: 0, saturation: 0, luminance: 0 }
              })
            }
            className="text-[10px] font-mono text-white/40 hover:text-white"
          >
            Reset {activeChannel}
          </button>
        </div>

        {/* Hue */}
        <div className="space-y-1">
          <div className="flex justify-between text-[11px] font-mono">
            <span className="text-white/70">Hue Shift</span>
            <span className="text-amber-400 font-bold">
              {current.hue > 0 ? `+${current.hue}` : current.hue}°
            </span>
          </div>
          <input
            type="range"
            min="-50"
            max="50"
            value={current.hue}
            onChange={(e) => updateCurrentChannel('hue', Number(e.target.value))}
            className="w-full accent-amber-500 h-1 bg-white/10 rounded-lg appearance-none cursor-pointer"
          />
        </div>

        {/* Saturation */}
        <div className="space-y-1">
          <div className="flex justify-between text-[11px] font-mono">
            <span className="text-white/70">Saturation</span>
            <span className="text-amber-400 font-bold">
              {current.saturation > 0 ? `+${current.saturation}` : current.saturation}%
            </span>
          </div>
          <input
            type="range"
            min="-50"
            max="50"
            value={current.saturation}
            onChange={(e) =>
              updateCurrentChannel('saturation', Number(e.target.value))
            }
            className="w-full accent-amber-500 h-1 bg-white/10 rounded-lg appearance-none cursor-pointer"
          />
        </div>

        {/* Luminance */}
        <div className="space-y-1">
          <div className="flex justify-between text-[11px] font-mono">
            <span className="text-white/70">Luminance</span>
            <span className="text-amber-400 font-bold">
              {current.luminance > 0 ? `+${current.luminance}` : current.luminance}%
            </span>
          </div>
          <input
            type="range"
            min="-50"
            max="50"
            value={current.luminance}
            onChange={(e) =>
              updateCurrentChannel('luminance', Number(e.target.value))
            }
            className="w-full accent-amber-500 h-1 bg-white/10 rounded-lg appearance-none cursor-pointer"
          />
        </div>
      </div>

      <button
        onClick={onReset}
        className="w-full py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded text-[11px] font-mono text-white/70 hover:text-white flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
      >
        <RotateCcw className="w-3 h-3" />
        <span>Reset All 8 HSL Channels</span>
      </button>
    </div>
  );
};
