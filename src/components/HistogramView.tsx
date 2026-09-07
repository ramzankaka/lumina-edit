/**
 * Live RGB & Luminance Histogram
 * Real-time 256-bucket histogram display like Lightroom & Photoshop
 */

import React, { useEffect, useRef, useState } from 'react';

interface HistogramViewProps {
  canvas: HTMLCanvasElement | null;
}

export const HistogramView: React.FC<HistogramViewProps> = ({ canvas }) => {
  const histogramCanvasRef = useRef<HTMLCanvasElement>(null);
  const [channelMode, setChannelMode] = useState<'rgb' | 'luma'>('rgb');
  const [stats, setStats] = useState<{ mean: number; shadowClip: boolean; highlightClip: boolean }>({
    mean: 128,
    shadowClip: false,
    highlightClip: false,
  });

  useEffect(() => {
    if (!canvas || !histogramCanvasRef.current) return;

    const hCanvas = histogramCanvasRef.current;
    const hCtx = hCanvas.getContext('2d');
    if (!hCtx) return;

    const srcCtx = canvas.getContext('2d');
    if (!srcCtx) return;

    try {
      const w = canvas.width;
      const h = canvas.height;
      // Sample image efficiently (downscale if large)
      const sampleCanvas = document.createElement('canvas');
      const maxSampleDim = 240;
      const scale = Math.min(1, maxSampleDim / Math.max(w, h));
      const sw = Math.max(20, Math.round(w * scale));
      const sh = Math.max(20, Math.round(h * scale));
      sampleCanvas.width = sw;
      sampleCanvas.height = sh;

      const sCtx = sampleCanvas.getContext('2d');
      if (!sCtx) return;
      sCtx.drawImage(canvas, 0, 0, sw, sh);

      const imgData = sCtx.getImageData(0, 0, sw, sh);
      const data = imgData.data;

      const rBuckets = new Uint32Array(256);
      const gBuckets = new Uint32Array(256);
      const bBuckets = new Uint32Array(256);
      const lumaBuckets = new Uint32Array(256);

      let totalLuma = 0;
      const totalPixels = data.length / 4;

      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const luma = Math.round(0.299 * r + 0.587 * g + 0.114 * b);

        rBuckets[r]++;
        gBuckets[g]++;
        bBuckets[b]++;
        lumaBuckets[luma]++;
        totalLuma += luma;
      }

      const meanLuma = Math.round(totalLuma / totalPixels);
      const shadowClip = lumaBuckets[0] > totalPixels * 0.05;
      const highlightClip = lumaBuckets[255] > totalPixels * 0.05;
      setStats({ mean: meanLuma, shadowClip, highlightClip });

      // Find max bucket value for normalization
      let maxVal = 1;
      for (let i = 0; i < 256; i++) {
        if (channelMode === 'rgb') {
          if (rBuckets[i] > maxVal) maxVal = rBuckets[i];
          if (gBuckets[i] > maxVal) maxVal = gBuckets[i];
          if (bBuckets[i] > maxVal) maxVal = bBuckets[i];
        } else {
          if (lumaBuckets[i] > maxVal) maxVal = lumaBuckets[i];
        }
      }

      // Draw Histogram
      const width = hCanvas.width;
      const height = hCanvas.height;
      hCtx.clearRect(0, 0, width, height);

      // Dark background
      hCtx.fillStyle = '#0F1115';
      hCtx.fillRect(0, 0, width, height);

      // Subtle grid lines (Shadows, Midtones, Highlights)
      hCtx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
      hCtx.lineWidth = 1;
      for (let x = 1; x <= 3; x++) {
        const gx = Math.round((width * x) / 4);
        hCtx.beginPath();
        hCtx.moveTo(gx, 0);
        hCtx.lineTo(gx, height);
        hCtx.stroke();
      }

      const drawChannel = (buckets: Uint32Array, strokeColor: string, fillColor: string) => {
        hCtx.beginPath();
        hCtx.moveTo(0, height);
        for (let i = 0; i < 256; i++) {
          const x = (i / 255) * width;
          const y = height - (buckets[i] / maxVal) * (height * 0.92);
          hCtx.lineTo(x, y);
        }
        hCtx.lineTo(width, height);
        hCtx.closePath();

        hCtx.fillStyle = fillColor;
        hCtx.fill();
        hCtx.strokeStyle = strokeColor;
        hCtx.lineWidth = 1.2;
        hCtx.stroke();
      };

      if (channelMode === 'rgb') {
        hCtx.globalCompositeOperation = 'screen';
        drawChannel(rBuckets, 'rgba(239, 68, 68, 0.9)', 'rgba(239, 68, 68, 0.25)');
        drawChannel(gBuckets, 'rgba(34, 197, 94, 0.9)', 'rgba(34, 197, 94, 0.25)');
        drawChannel(bBuckets, 'rgba(59, 130, 246, 0.9)', 'rgba(59, 130, 246, 0.25)');
        hCtx.globalCompositeOperation = 'source-over';
      } else {
        drawChannel(lumaBuckets, 'rgba(245, 158, 11, 0.9)', 'rgba(245, 158, 11, 0.25)');
      }
    } catch {
      // Ignore canvas read errors if image not yet loaded
    }
  }, [canvas, channelMode]);

  return (
    <div className="bg-[#0E1013] border border-white/10 rounded-xl p-2.5 space-y-2 select-none">
      <div className="flex items-center justify-between text-[10px] font-mono text-white/50 px-0.5">
        <div className="flex items-center gap-1.5">
          <span className="font-semibold text-white/70 uppercase tracking-wider">Histogram</span>
          <span className="text-[9px] px-1.5 py-0.5 bg-white/5 rounded text-white/40">
            Luma: {stats.mean}
          </span>
        </div>

        <div className="flex items-center gap-1 bg-white/5 p-0.5 rounded-lg border border-white/10">
          <button
            onClick={() => setChannelMode('rgb')}
            className={`px-1.5 py-0.5 rounded text-[9px] font-medium transition-colors cursor-pointer ${
              channelMode === 'rgb' ? 'bg-amber-500 text-black font-bold' : 'text-white/60 hover:text-white'
            }`}
          >
            RGB
          </button>
          <button
            onClick={() => setChannelMode('luma')}
            className={`px-1.5 py-0.5 rounded text-[9px] font-medium transition-colors cursor-pointer ${
              channelMode === 'luma' ? 'bg-amber-500 text-black font-bold' : 'text-white/60 hover:text-white'
            }`}
          >
            Luma
          </button>
        </div>
      </div>

      <div className="relative rounded-lg overflow-hidden border border-white/5 bg-[#090A0D]">
        <canvas
          ref={histogramCanvasRef}
          width={280}
          height={68}
          className="w-full h-16 block"
        />

        {/* Shadow / Highlight Clipping Indicators */}
        {stats.shadowClip && (
          <span
            className="absolute bottom-1 left-1.5 w-1.5 h-1.5 rounded-full bg-blue-500 shadow-sm shadow-blue-500/80 animate-pulse"
            title="Shadow Clipping Detected"
          />
        )}
        {stats.highlightClip && (
          <span
            className="absolute bottom-1 right-1.5 w-1.5 h-1.5 rounded-full bg-red-500 shadow-sm shadow-red-500/80 animate-pulse"
            title="Highlight Clipping Detected"
          />
        )}
      </div>

      <div className="flex justify-between text-[9px] font-mono text-white/40 px-1">
        <span>Shadows</span>
        <span>Midtones</span>
        <span>Highlights</span>
      </div>
    </div>
  );
};
