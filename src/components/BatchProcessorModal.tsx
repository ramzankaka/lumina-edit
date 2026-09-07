/**
 * Batch Photo Processor & ZIP Exporter - Geometric Balance Theme
 */

import React, { useState, useRef } from 'react';
import JSZip from 'jszip';
import { 
  X, 
  Layers, 
  UploadCloud, 
  Download, 
  Loader2, 
  CheckCircle2, 
  FileImage, 
  Trash2,
  Scale
} from 'lucide-react';
import { GLOBAL_PASSPORT_PRESETS, compressToTargetKb } from '../utils/imageProcessing';
import { PassportPreset } from '../types';

interface BatchProcessorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface BatchFileItem {
  id: string;
  file: File;
  previewUrl: string;
  status: 'pending' | 'processing' | 'done' | 'error';
  finalKb?: number;
  blob?: Blob;
}

export const BatchProcessorModal: React.FC<BatchProcessorModalProps> = ({ isOpen, onClose }) => {
  const [fileList, setFileList] = useState<BatchFileItem[]>([]);
  const [selectedPreset, setSelectedPreset] = useState<PassportPreset>(GLOBAL_PASSPORT_PRESETS[0]);
  const [targetKb, setTargetKb] = useState<number>(100);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isZipping, setIsZipping] = useState<boolean>(false);
  const [progressPercent, setProgressPercent] = useState<number>(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFilesAdded = (files: FileList | null) => {
    if (!files) return;
    const newItems: BatchFileItem[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.type.startsWith('image/')) {
        newItems.push({
          id: Math.random().toString(),
          file,
          previewUrl: URL.createObjectURL(file),
          status: 'pending'
        });
      }
    }
    setFileList((prev) => [...prev, ...newItems]);
  };

  const handleRemoveFile = (id: string) => {
    setFileList((prev) => prev.filter((item) => item.id !== id));
  };

  const handleClearAll = () => {
    setFileList([]);
    setProgressPercent(0);
  };

  const handleProcessAndDownloadZip = async () => {
    if (fileList.length === 0) return;
    setIsProcessing(true);
    setProgressPercent(0);

    const zip = new JSZip();
    const updatedList = [...fileList];

    for (let i = 0; i < updatedList.length; i++) {
      const item = updatedList[i];
      item.status = 'processing';
      setFileList([...updatedList]);

      try {
        // Load image into an offscreen canvas
        const img = new Image();
        img.src = item.previewUrl;
        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
        });

        const targetW = Math.round((selectedPreset.widthMm / 25.4) * 300);
        const targetH = Math.round((selectedPreset.heightMm / 25.4) * 300);

        const canvas = document.createElement('canvas');
        canvas.width = targetW;
        canvas.height = targetH;
        const ctx = canvas.getContext('2d');

        if (ctx) {
          // Center crop fit
          const imgAspect = img.width / img.height;
          const targetAspect = targetW / targetH;
          let sx = 0, sy = 0, sw = img.width, sh = img.height;

          if (imgAspect > targetAspect) {
            sw = img.height * targetAspect;
            sx = (img.width - sw) / 2;
          } else {
            sh = img.width / targetAspect;
            sy = (img.height - sh) / 2;
          }

          ctx.drawImage(img, sx, sy, sw, sh, 0, 0, targetW, targetH);

          // Compress to target KB
          const comp = await compressToTargetKb(canvas, 'image/jpeg', targetKb);
          item.status = 'done';
          item.finalKb = comp.finalKb;
          item.blob = comp.blob;

          // Add to zip
          const cleanName = item.file.name.replace(/\.[^/.]+$/, "");
          zip.file(`${cleanName}_${selectedPreset.id}_${comp.finalKb}kb.jpg`, comp.blob);
        }
      } catch (err) {
        console.error(err);
        item.status = 'error';
      }

      setProgressPercent(Math.round(((i + 1) / updatedList.length) * 100));
      setFileList([...updatedList]);
    }

    setIsProcessing(false);
    setIsZipping(true);

    // Generate zip and download
    const zipBlob = await zip.generateAsync({ type: 'blob' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(zipBlob);
    link.download = `lumina_batch_${selectedPreset.id}_${Date.now()}.zip`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setIsZipping(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-sm select-none font-sans">
      <div className="bg-[#0F0F0F] border border-white/15 rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] text-white">
        {/* Header */}
        <div className="h-14 border-b border-white/10 flex items-center justify-between px-5 bg-[#0A0A0A] shrink-0">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-blue-400" />
            <h2 className="text-xs font-bold tracking-tight text-white uppercase font-mono">
              Batch Photo Processor & ZIP Exporter
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-white/50 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-5 flex-1 overflow-y-auto space-y-4">
          {/* Preset & Target Size Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-white/5 border border-white/10 rounded-lg">
            <div>
              <label className="text-[10px] font-mono uppercase tracking-wider text-white/60 block mb-1.5">
                Target Standard / Preset
              </label>
              <select
                value={selectedPreset.id}
                onChange={(e) => {
                  const p = GLOBAL_PASSPORT_PRESETS.find((x) => x.id === e.target.value);
                  if (p) setSelectedPreset(p);
                }}
                className="w-full bg-black/40 border border-white/15 rounded-lg px-2.5 py-1.5 text-xs font-mono text-white focus:outline-none focus:border-amber-500"
              >
                {GLOBAL_PASSPORT_PRESETS.map((p) => (
                  <option key={p.id} value={p.id} className="bg-[#111]">
                    {p.flag} {p.name} ({p.widthMm}x{p.heightMm}mm)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[10px] font-mono uppercase tracking-wider text-white/60 block mb-1.5 flex items-center gap-1.5">
                <Scale className="w-3 h-3 text-amber-400" />
                Strict Size Cap Per Photo: <strong className="text-amber-400">&lt; {targetKb} KB</strong>
              </label>
              <div className="grid grid-cols-4 gap-1">
                {[30, 50, 100, 200].map((kb) => (
                  <button
                    key={kb}
                    onClick={() => setTargetKb(kb)}
                    className={`py-1 rounded text-[11px] font-mono transition-all ${
                      targetKb === kb
                        ? 'bg-amber-500 text-black font-bold'
                        : 'bg-white/5 text-white/70 hover:bg-white/10'
                    }`}
                  >
                    &lt;{kb}KB
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Upload Drop Zone */}
          <input
            type="file"
            ref={fileInputRef}
            multiple
            accept="image/*"
            onChange={(e) => handleFilesAdded(e.target.files)}
            className="hidden"
          />

          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-white/20 hover:border-amber-500/60 bg-white/5 hover:bg-amber-500/5 rounded-xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all text-center"
          >
            <UploadCloud className="w-8 h-8 text-white/40 group-hover:text-amber-400" />
            <div className="text-xs font-mono text-white">
              Click to select 10–50 photos or drag and drop files here
            </div>
            <div className="text-[10px] text-white/40">
              JPEG, PNG, WebP supported. All photos will be resized to {selectedPreset.widthMm}×{selectedPreset.heightMm}mm and compressed under {targetKb} KB.
            </div>
          </div>

          {/* Uploaded File Queue */}
          {fileList.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-mono text-white/60">
                <span>{fileList.length} photos in batch queue</span>
                <button
                  onClick={handleClearAll}
                  className="text-red-400 hover:text-red-300 transition-colors flex items-center gap-1"
                >
                  <Trash2 className="w-3 h-3" />
                  Clear All
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-56 overflow-y-auto pr-1">
                {fileList.map((item) => (
                  <div
                    key={item.id}
                    className="relative bg-white/5 border border-white/10 rounded-lg p-2 flex items-center gap-2 overflow-hidden"
                  >
                    <img
                      src={item.previewUrl}
                      alt="preview"
                      className="w-10 h-10 object-cover rounded bg-black shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-[11px] font-mono text-white truncate">
                        {item.file.name}
                      </div>
                      <div className="text-[10px] font-mono text-white/50">
                        {item.status === 'pending' && 'Queued'}
                        {item.status === 'processing' && (
                          <span className="text-amber-400 flex items-center gap-1">
                            <Loader2 className="w-2.5 h-2.5 animate-spin" /> Processing
                          </span>
                        )}
                        {item.status === 'done' && (
                          <span className="text-emerald-400 font-bold">
                            Done ({item.finalKb} KB)
                          </span>
                        )}
                        {item.status === 'error' && (
                          <span className="text-red-400">Failed</span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemoveFile(item.id)}
                      className="text-white/40 hover:text-white p-1"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Progress Bar */}
          {isProcessing && (
            <div className="space-y-1.5 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
              <div className="flex justify-between text-xs font-mono text-amber-400">
                <span>Processing batch photos...</span>
                <span>{progressPercent}%</span>
              </div>
              <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-amber-500 h-full transition-all duration-200"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-white/10 bg-[#0A0A0A] flex items-center justify-between shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white/70 text-xs font-medium rounded-lg"
          >
            Cancel
          </button>

          <button
            onClick={handleProcessAndDownloadZip}
            disabled={fileList.length === 0 || isProcessing || isZipping}
            className="px-5 py-2 bg-amber-500 hover:bg-amber-400 active:scale-95 text-black text-xs font-bold rounded-lg flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all cursor-pointer disabled:opacity-40"
          >
            {isZipping ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Creating ZIP Archive...</span>
              </>
            ) : isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Processing ({progressPercent}%)...</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>Process & Download ZIP ({fileList.length})</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
