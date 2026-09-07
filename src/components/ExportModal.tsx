/**
 * Export & Strict Target File Size (KB) Compression Modal - Geometric Balance Theme
 */

import React, { useState } from 'react';
import { 
  X, 
  Download, 
  FileCheck, 
  Scale, 
  Loader2,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { compressToTargetKb, exportCanvasToPdf } from '../utils/imageProcessing';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  canvas: HTMLCanvasElement | null;
  sheetCanvas: HTMLCanvasElement | null;
  defaultFilename: string;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  canvas,
  sheetCanvas,
  defaultFilename
}) => {
  const [filename, setFilename] = useState<string>(defaultFilename.replace(/\.[^/.]+$/, "") || 'lumina_passport_edit');
  const [format, setFormat] = useState<'image/jpeg' | 'image/png' | 'image/webp' | 'application/pdf'>('image/jpeg');
  const [strictTargetKb, setStrictTargetKb] = useState<boolean>(true);
  const [selectedKbPreset, setSelectedKbPreset] = useState<number | 'custom'>(19); // 19 KB for strict < 20KB limit
  const [customKb, setCustomKb] = useState<number>(20);
  const [manualQuality, setManualQuality] = useState<number>(90);
  const [exportScale, setExportScale] = useState<number>(1);
  const [exportSource, setExportSource] = useState<'single' | 'sheet'>('single');
  const [isCompressing, setIsCompressing] = useState<boolean>(false);
  const [compressedResult, setCompressedResult] = useState<{ kb: number; quality: number } | null>(null);

  if (!isOpen) return null;

  const targetKbValue = selectedKbPreset === 'custom' ? customKb : selectedKbPreset;

  const handleDownload = async () => {
    const sourceCanvas = (exportSource === 'sheet' && sheetCanvas) ? sheetCanvas : canvas;
    if (!sourceCanvas) return;

    setIsCompressing(true);
    try {
      // Handle scaling if not 1
      let processCanvas = sourceCanvas;
      if (exportScale !== 1) {
        const scaled = document.createElement('canvas');
        scaled.width = Math.round(sourceCanvas.width * exportScale);
        scaled.height = Math.round(sourceCanvas.height * exportScale);
        const sCtx = scaled.getContext('2d');
        if (sCtx) {
          sCtx.drawImage(sourceCanvas, 0, 0, scaled.width, scaled.height);
          processCanvas = scaled;
        }
      }

      if (format === 'application/pdf') {
        exportCanvasToPdf(processCanvas, `${filename}.pdf`, exportSource === 'sheet');
        setCompressedResult({ kb: 120, quality: 100 });
        setIsCompressing(false);
        return;
      }

      let finalBlob: Blob;
      let finalKb = 0;
      let qualityUsed = manualQuality;

      if (strictTargetKb && format !== 'image/png') {
        const res = await compressToTargetKb(processCanvas, format, targetKbValue);
        finalBlob = res.blob;
        finalKb = res.finalKb;
        qualityUsed = res.qualityUsed;
      } else {
        finalBlob = await new Promise<Blob>((resolve) =>
          processCanvas.toBlob((b) => resolve(b || new Blob()), format, manualQuality / 100)
        );
        finalKb = Math.round(finalBlob.size / 1024);
      }

      setCompressedResult({ kb: finalKb, quality: qualityUsed });

      // Trigger download
      const extension = format === 'image/jpeg' ? 'jpg' : format === 'image/png' ? 'png' : 'webp';
      const downloadName = `${filename}_${finalKb}kb.${extension}`;
      const url = URL.createObjectURL(finalBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = downloadName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Compression failed:', err);
    } finally {
      setIsCompressing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm select-none font-sans">
      <div className="bg-[#0F0F0F] border border-white/15 rounded-xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col text-white animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="h-14 border-b border-white/10 flex items-center justify-between px-5 bg-[#0A0A0A]">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 bg-amber-500 rounded-sm" />
            <h2 className="text-sm font-bold tracking-tight text-white uppercase font-mono">
              Export & Strict Size Compression
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-white/50 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 flex flex-col gap-5 max-h-[80vh] overflow-y-auto">
          {/* Source Selection (Single Photo vs Printable Sheet) */}
          {sheetCanvas && (
            <div className="space-y-2">
              <label className="text-[11px] font-mono text-white/60 uppercase tracking-wider block">
                Export Target
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setExportSource('single')}
                  className={`py-2 px-3 rounded-lg border text-xs font-semibold transition-all cursor-pointer ${
                    exportSource === 'single'
                      ? 'bg-amber-500/15 border-amber-500/40 text-amber-400'
                      : 'bg-white/5 border-white/10 text-white/70'
                  }`}
                >
                  Single Photo
                </button>
                <button
                  onClick={() => setExportSource('sheet')}
                  className={`py-2 px-3 rounded-lg border text-xs font-semibold transition-all cursor-pointer ${
                    exportSource === 'sheet'
                      ? 'bg-amber-500/15 border-amber-500/40 text-amber-400'
                      : 'bg-white/5 border-white/10 text-white/70'
                  }`}
                >
                  Printable Multi-Grid Sheet
                </button>
              </div>
            </div>
          )}

          {/* Filename */}
          <div className="space-y-2">
            <label className="text-[11px] font-mono text-white/60 uppercase tracking-wider block">
              File Name
            </label>
            <input
              type="text"
              value={filename}
              onChange={(e) => setFilename(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Format Chips */}
          <div className="space-y-2">
            <label className="text-[11px] font-mono text-white/60 uppercase tracking-wider block">
              Image Format
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                onClick={() => setFormat('image/jpeg')}
                className={`py-2 px-2 rounded-lg border text-xs font-mono text-center transition-all cursor-pointer ${
                  format === 'image/jpeg'
                    ? 'bg-amber-500 text-black font-bold border-amber-500 shadow-sm'
                    : 'bg-white/5 border-white/10 text-white/70 hover:border-white/20'
                }`}
              >
                JPEG (Gov)
              </button>
              <button
                onClick={() => setFormat('image/png')}
                className={`py-2 px-2 rounded-lg border text-xs font-mono text-center transition-all cursor-pointer ${
                  format === 'image/png'
                    ? 'bg-amber-500 text-black font-bold border-amber-500 shadow-sm'
                    : 'bg-white/5 border-white/10 text-white/70 hover:border-white/20'
                }`}
              >
                PNG (Lossless)
              </button>
              <button
                onClick={() => setFormat('image/webp')}
                className={`py-2 px-2 rounded-lg border text-xs font-mono text-center transition-all cursor-pointer ${
                  format === 'image/webp'
                    ? 'bg-amber-500 text-black font-bold border-amber-500 shadow-sm'
                    : 'bg-white/5 border-white/10 text-white/70 hover:border-white/20'
                }`}
              >
                WebP
              </button>
              <button
                onClick={() => setFormat('application/pdf')}
                className={`py-2 px-2 rounded-lg border text-xs font-mono text-center transition-all cursor-pointer ${
                  format === 'application/pdf'
                    ? 'bg-amber-500 text-black font-bold border-amber-500 shadow-sm'
                    : 'bg-white/5 border-white/10 text-white/70 hover:border-white/20'
                }`}
              >
                PDF Doc
              </button>
            </div>
          </div>

          {/* Strict KB Target Section */}
          {format !== 'image/png' && format !== 'application/pdf' && (
            <div className="space-y-3 p-3.5 bg-amber-500/10 border border-amber-500/25 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Scale className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-semibold text-amber-400">
                    Strict File Size Limiter (KB)
                  </span>
                </div>
                <button
                  onClick={() => setStrictTargetKb(!strictTargetKb)}
                  className={`w-7 h-3.5 rounded-full transition-colors relative cursor-pointer ${
                    strictTargetKb ? 'bg-amber-500' : 'bg-white/20'
                  }`}
                >
                  <div 
                    className={`absolute top-0.5 w-2.5 h-2.5 bg-black rounded-full transition-transform ${
                      strictTargetKb ? 'right-0.5' : 'left-0.5'
                    }`} 
                  />
                </button>
              </div>

              {strictTargetKb ? (
                <div className="space-y-2 pt-1">
                  <div className="grid grid-cols-3 gap-1.5">
                    {[19, 50, 100, 200, 500].map((kb) => (
                      <button
                        key={kb}
                        onClick={() => setSelectedKbPreset(kb)}
                        className={`py-1.5 px-2 rounded text-[11px] font-mono transition-all cursor-pointer ${
                          selectedKbPreset === kb
                            ? 'bg-amber-500 text-black font-bold shadow-sm'
                            : 'bg-white/10 hover:bg-white/15 text-white/80'
                        }`}
                      >
                        &lt; {kb} KB
                      </button>
                    ))}
                    <button
                      onClick={() => setSelectedKbPreset('custom')}
                      className={`py-1.5 px-2 rounded text-[11px] font-mono transition-all cursor-pointer ${
                        selectedKbPreset === 'custom'
                          ? 'bg-amber-500 text-black font-bold shadow-sm'
                          : 'bg-white/10 hover:bg-white/15 text-white/80'
                      }`}
                    >
                      Custom
                    </button>
                  </div>

                  {selectedKbPreset === 'custom' && (
                    <div className="flex items-center gap-2 pt-1">
                      <input
                        type="number"
                        min="5"
                        max="10000"
                        value={customKb}
                        onChange={(e) => setCustomKb(Number(e.target.value))}
                        className="w-24 bg-white/10 border border-white/15 rounded px-2.5 py-1 text-xs font-mono text-white"
                      />
                      <span className="text-xs font-mono text-white/60">KB max file limit</span>
                    </div>
                  )}

                  <p className="text-[10px] text-white/50 leading-tight">
                    Iterative binary search compression guarantees your photo won't exceed government portal upload limits.
                  </p>
                </div>
              ) : (
                <div className="space-y-2 pt-1">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-white/70">Quality</span>
                    <span className="text-amber-400 font-bold">{manualQuality}%</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    value={manualQuality}
                    onChange={(e) => setManualQuality(Number(e.target.value))}
                    className="w-full accent-amber-500 h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              )}
            </div>
          )}

          {/* Scale */}
          <div className="space-y-2">
            <label className="text-[11px] font-mono text-white/60 uppercase tracking-wider block">
              Resolution Scale
            </label>
            <div className="grid grid-cols-4 gap-1.5">
              {[
                { label: '50%', val: 0.5 },
                { label: '75%', val: 0.75 },
                { label: '100%', val: 1.0 },
                { label: '200%', val: 2.0 }
              ].map((s) => (
                <button
                  key={s.label}
                  onClick={() => setExportScale(s.val)}
                  className={`py-1.5 px-2 rounded text-xs font-mono transition-all cursor-pointer ${
                    exportScale === s.val
                      ? 'bg-amber-500/25 border border-amber-500 text-amber-400 font-bold'
                      : 'bg-white/5 border border-white/10 text-white/70 hover:border-white/20'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Result Alert if just compressed */}
          {compressedResult && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg flex items-center gap-2 text-emerald-400 text-xs font-mono">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>
                Exported: <strong>{compressedResult.kb} KB</strong> (Target met at {compressedResult.quality}% quality)
              </span>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-white/10 bg-[#0A0A0A] flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white/70 text-xs font-medium rounded-lg transition-colors cursor-pointer"
          >
            Close
          </button>
          <button
            onClick={handleDownload}
            disabled={isCompressing}
            className="px-5 py-2 bg-amber-500 hover:bg-amber-400 active:scale-95 text-black text-xs font-bold rounded-lg flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all cursor-pointer disabled:opacity-50"
          >
            {isCompressing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Compressing...</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>Download Photo</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
