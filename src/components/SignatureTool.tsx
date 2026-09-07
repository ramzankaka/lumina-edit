/**
 * Signature & Thumbprint Scanner / Adaptive Binarizer - Geometric Balance Theme
 */

import React, { useState } from 'react';
import { PenTool, Download, Check, RefreshCw, Sliders } from 'lucide-react';
import { SignatureSettings } from '../types';
import { binarizeSignature, compressToTargetKb } from '../utils/imageProcessing';

interface SignatureToolProps {
  canvas: HTMLCanvasElement | null;
  onApplySignature: (dataUrl: string) => void;
}

export const SignatureTool: React.FC<SignatureToolProps> = ({
  canvas,
  onApplySignature
}) => {
  const [settings, setSettings] = useState<SignatureSettings>({
    threshold: 135,
    invert: false,
    transparentBackground: true,
    smoothing: 1
  });
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const handleProcessSignature = async (downloadDirect: boolean = false) => {
    if (!canvas) return;
    setIsProcessing(true);

    try {
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = canvas.width;
      tempCanvas.height = canvas.height;
      const ctx = tempCanvas.getContext('2d');
      if (!ctx) return;

      ctx.drawImage(canvas, 0, 0);
      const binarizedData = binarizeSignature(ctx, tempCanvas.width, tempCanvas.height, settings);
      ctx.putImageData(binarizedData, 0, 0);

      const mime = settings.transparentBackground ? 'image/png' : 'image/jpeg';
      const compressed = await compressToTargetKb(tempCanvas, mime, 20); // Strict under 20KB for signatures!

      if (downloadDirect) {
        const ext = settings.transparentBackground ? 'png' : 'jpg';
        const url = URL.createObjectURL(compressed.blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `signature_binarized_${compressed.finalKb}kb.${ext}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } else {
        const reader = new FileReader();
        reader.onload = (e) => {
          if (e.target?.result) {
            onApplySignature(e.target.result as string);
          }
        };
        reader.readAsDataURL(compressed.blob);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-4 font-mono">
      <div className="p-3 bg-amber-500/10 border border-amber-500/25 rounded-lg flex items-center gap-2 text-amber-400 text-xs">
        <PenTool className="w-4 h-4 shrink-0" />
        <span className="leading-tight font-semibold">
          Converts camera snapshots of paper signatures into clean 10–20 KB transparent PNGs.
        </span>
      </div>

      {/* Threshold Slider */}
      <div className="space-y-1.5 p-3 bg-white/5 border border-white/10 rounded-lg">
        <div className="flex justify-between text-xs">
          <span className="text-white/70">Ink Threshold</span>
          <span className="text-amber-400 font-bold">{settings.threshold} / 255</span>
        </div>
        <input
          type="range"
          min="40"
          max="220"
          value={settings.threshold}
          onChange={(e) =>
            setSettings((prev) => ({ ...prev, threshold: Number(e.target.value) }))
          }
          className="w-full accent-amber-500 h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer"
        />
        <div className="flex justify-between text-[9px] text-white/40">
          <span>Lighter Strokes</span>
          <span>Darker Strokes</span>
        </div>
      </div>

      {/* Options */}
      <div className="space-y-2">
        {/* Transparent Background */}
        <button
          onClick={() =>
            setSettings((prev) => ({
              ...prev,
              transparentBackground: !prev.transparentBackground
            }))
          }
          className={`w-full py-2 px-3 rounded-lg border text-xs flex items-center justify-between transition-all cursor-pointer ${
            settings.transparentBackground
              ? 'bg-amber-500/20 border-amber-500/40 text-amber-400 font-bold'
              : 'bg-white/5 border-white/10 text-white/70'
          }`}
        >
          <span>Transparent PNG Cutout</span>
          <span className="text-[10px] uppercase">
            {settings.transparentBackground ? 'Active' : 'Solid White'}
          </span>
        </button>

        {/* Invert */}
        <button
          onClick={() =>
            setSettings((prev) => ({ ...prev, invert: !prev.invert }))
          }
          className={`w-full py-2 px-3 rounded-lg border text-xs flex items-center justify-between transition-all cursor-pointer ${
            settings.invert
              ? 'bg-amber-500/20 border-amber-500/40 text-amber-400 font-bold'
              : 'bg-white/5 border-white/10 text-white/70'
          }`}
        >
          <span>Ink Color Inversion</span>
          <span className="text-[10px] uppercase">
            {settings.invert ? 'White on Dark' : 'Black on White'}
          </span>
        </button>
      </div>

      {/* Action Buttons */}
      <div className="space-y-2 pt-2">
        <button
          onClick={() => handleProcessSignature(false)}
          disabled={isProcessing}
          className="w-full py-2.5 px-3 bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs rounded-lg flex items-center justify-center gap-2 shadow-md shadow-amber-500/20 transition-all cursor-pointer disabled:opacity-50"
        >
          <Check className="w-3.5 h-3.5" />
          <span>Apply Clean Binarized Ink to Canvas</span>
        </button>

        <button
          onClick={() => handleProcessSignature(true)}
          disabled={isProcessing}
          className="w-full py-2 px-3 bg-white/10 hover:bg-white/15 text-white font-semibold text-xs rounded-lg flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Download Strict &lt; 20KB Signature PNG</span>
        </button>
      </div>
    </div>
  );
};
