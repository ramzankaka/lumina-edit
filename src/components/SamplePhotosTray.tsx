/**
 * Quick Sample Photos Tray (Collapsible Filmstrip)
 * Allows users to 1-click test passport, portrait, landscape, and scanned signatures
 */

import React from 'react';
import { X, Sparkles, Image as ImageIcon } from 'lucide-react';
import { SAMPLE_IMAGES, getSampleImageDataUrl, SampleImageItem } from '../utils/sampleImages';

interface SamplePhotosTrayProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectSample: (dataUrl: string, filename: string) => void;
  activeFilename: string;
}

export const SamplePhotosTray: React.FC<SamplePhotosTrayProps> = ({
  isOpen,
  onClose,
  onSelectSample,
  activeFilename,
}) => {
  if (!isOpen) return null;

  return (
    <div className="border-t border-white/10 bg-[#0C0E12] px-4 py-3 shrink-0 select-none z-20 transition-all animate-in slide-in-from-bottom duration-200">
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-2">
          <ImageIcon className="w-3.5 h-3.5 text-amber-400" />
          <span className="text-xs font-semibold text-white tracking-wide">
            Sample Test Photos Filmstrip
          </span>
          <span className="text-[10px] text-white/50 hidden sm:inline">
            Click any test photo to inspect presets, lighting, and passport standards
          </span>
        </div>

        <button
          onClick={onClose}
          className="p-1 text-white/50 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
          title="Close Filmstrip Tray"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="flex items-center gap-3 overflow-x-auto pb-1 scrollbar-thin">
        {SAMPLE_IMAGES.map((sample: SampleImageItem) => {
          const isCurrent = activeFilename.toLowerCase().includes(sample.type);
          return (
            <button
              key={sample.id}
              onClick={() => {
                const dataUrl = getSampleImageDataUrl(sample.type);
                onSelectSample(dataUrl, `sample_${sample.type}.jpg`);
              }}
              className={`flex items-center gap-2.5 p-2 rounded-xl border text-left shrink-0 transition-all cursor-pointer group ${
                isCurrent
                  ? 'bg-amber-500/15 border-amber-500/60 ring-1 ring-amber-500/40 text-white'
                  : 'bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/8 text-white/80'
              }`}
            >
              <div className="w-10 h-10 rounded-lg bg-black/50 border border-white/10 flex items-center justify-center overflow-hidden shrink-0 text-amber-400">
                {sample.type === 'passport' && <span className="text-base">🪪</span>}
                {sample.type === 'portrait' && <span className="text-base">👤</span>}
                {sample.type === 'sunset' && <span className="text-base">🌅</span>}
                {sample.type === 'cyberpunk' && <span className="text-base">🏙️</span>}
                {sample.type === 'signature' && <span className="text-base">✍️</span>}
              </div>

              <div className="min-w-0 pr-1">
                <div className="text-xs font-semibold text-white truncate group-hover:text-amber-400 transition-colors">
                  {sample.name}
                </div>
                <div className="text-[10px] text-white/50 truncate max-w-[150px]">
                  {sample.description}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
