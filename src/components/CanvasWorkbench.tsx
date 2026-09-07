/**
 * Canvas Workbench & Image Display Stage - Geometric Balance Theme
 */

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { 
  ZoomIn, 
  ZoomOut, 
  Maximize2, 
  Eye, 
  Columns, 
  Check, 
  X,
  Upload,
  UserCheck
} from 'lucide-react';
import { 
  Adjustments, 
  CropRect, 
  PassportPreset, 
  TextLayer, 
  ToolMode,
  ToneCurves,
  HslTuner
} from '../types';
import { 
  applyAdjustmentsPipeline, 
  applyVignetteToContext, 
  FILTER_PRESETS 
} from '../utils/imageProcessing';

interface CanvasWorkbenchProps {
  imageElement: HTMLImageElement | null;
  adjustments: Adjustments;
  filterId: string;
  filterIntensity: number;
  rotation: number;
  flipH: boolean;
  flipV: boolean;
  activeTab: ToolMode;
  cropRect: CropRect;
  setCropRect: React.Dispatch<React.SetStateAction<CropRect>>;
  selectedPassportPreset: PassportPreset | null;
  showBiometricGuide: boolean;
  setShowBiometricGuide: (val: boolean) => void;
  textLayers: TextLayer[];
  onApplyCrop: () => void;
  onCancelCrop: () => void;
  onCursorMove: (x: number, y: number, rgb: string) => void;
  onFileDrop: (file: File) => void;
  onCanvasRendered: (canvas: HTMLCanvasElement) => void;
  isSheetMode: boolean;
  sheetCanvas: HTMLCanvasElement | null;
  curves?: ToneCurves;
  hslTuner?: HslTuner;
  isHoldingCompare?: boolean;
  splitCompare?: boolean;
  onToggleSplitCompare?: () => void;
}

export const CanvasWorkbench: React.FC<CanvasWorkbenchProps> = ({
  imageElement,
  adjustments,
  filterId,
  filterIntensity,
  rotation,
  flipH,
  flipV,
  activeTab,
  cropRect,
  setCropRect,
  selectedPassportPreset,
  showBiometricGuide,
  setShowBiometricGuide,
  textLayers,
  onApplyCrop,
  onCancelCrop,
  onCursorMove,
  onFileDrop,
  onCanvasRendered,
  isSheetMode,
  sheetCanvas,
  curves,
  hslTuner,
  isHoldingCompare: controlledHoldingCompare,
  splitCompare: controlledSplitCompare,
  onToggleSplitCompare
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mainCanvasRef = useRef<HTMLCanvasElement>(null);
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState<boolean>(false);
  const [panStart, setPanStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [internalHoldingCompare, setInternalHoldingCompare] = useState<boolean>(false);
  const [internalSplitCompare, setInternalSplitCompare] = useState<boolean>(false);
  const isHoldingCompare = controlledHoldingCompare ?? internalHoldingCompare;
  const setIsHoldingCompare = setInternalHoldingCompare;
  const splitCompare = controlledSplitCompare ?? internalSplitCompare;
  const setSplitCompare = setInternalSplitCompare;
  const [splitPosition, setSplitPosition] = useState<number>(0.5); // 0..1
  const [isDraggingSplit, setIsDraggingSplit] = useState<boolean>(false);
  const [isDraggingCrop, setIsDraggingCrop] = useState<string | null>(null); // handle name or 'box'
  const [cursorInfo, setCursorInfo] = useState<{ x: number; y: number; rgb: string } | null>(null);
  const [cropDragStart, setCropDragStart] = useState<{ x: number; y: number; rect: CropRect }>({
    x: 0,
    y: 0,
    rect: { x: 0.1, y: 0.1, width: 0.8, height: 0.8 }
  });

  // Render processed image onto canvas
  useEffect(() => {
    if (!imageElement || !mainCanvasRef.current) return;
    const canvas = mainCanvasRef.current;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    // Handle rotation dimensions
    const isRotated90or270 = Math.abs(rotation % 180) === 90;
    const origW = imageElement.naturalWidth || imageElement.width;
    const origH = imageElement.naturalHeight || imageElement.height;
    const canvasW = isRotated90or270 ? origH : origW;
    const canvasH = isRotated90or270 ? origW : origH;

    canvas.width = canvasW;
    canvas.height = canvasH;

    // Offscreen buffer for transformations
    const offscreen = document.createElement('canvas');
    offscreen.width = canvasW;
    offscreen.height = canvasH;
    const offCtx = offscreen.getContext('2d', { willReadFrequently: true });
    if (!offCtx) return;

    // Transform setup
    offCtx.save();
    offCtx.translate(canvasW / 2, canvasH / 2);
    offCtx.rotate((rotation * Math.PI) / 180);
    offCtx.scale(flipH ? -1 : 1, flipV ? -1 : 1);
    offCtx.drawImage(imageElement, -origW / 2, -origH / 2);
    offCtx.restore();

    // If holding compare, draw raw original and stop
    if (isHoldingCompare) {
      ctx.drawImage(offscreen, 0, 0);
      onCanvasRendered(canvas);
      return;
    }

    // Pipeline: Extract pixel data and apply adjustments + presets
    const filterPreset = FILTER_PRESETS.find(f => f.id === filterId);
    const combinedAdjustments: Adjustments = { ...adjustments };
    if (filterPreset?.adjustments) {
      Object.entries(filterPreset.adjustments).forEach(([k, v]) => {
        if (typeof v === 'number') {
          (combinedAdjustments as any)[k] = ((combinedAdjustments as any)[k] || 0) + v;
        }
      });
    }

    // Blur if set
    if (combinedAdjustments.blur > 0) {
      offCtx.filter = `blur(${combinedAdjustments.blur * 0.4}px)`;
      offCtx.drawImage(offscreen, 0, 0);
      offCtx.filter = 'none';
    }

    // Pixel math
    const imgData = offCtx.getImageData(0, 0, canvasW, canvasH);
    applyAdjustmentsPipeline(imgData, combinedAdjustments, filterIntensity, curves, hslTuner);
    offCtx.putImageData(imgData, 0, 0);

    // Vignette
    if (combinedAdjustments.vignette > 0) {
      applyVignetteToContext(offCtx, canvasW, canvasH, combinedAdjustments.vignette);
    }

    // Text Layers
    textLayers.forEach(layer => {
      offCtx.save();
      offCtx.font = `${layer.isBold ? 'bold ' : ''}${layer.fontSize}px ${layer.fontFamily}`;
      offCtx.fillStyle = layer.color;
      if (layer.hasShadow) {
        offCtx.shadowColor = 'rgba(0,0,0,0.8)';
        offCtx.shadowBlur = 8;
        offCtx.shadowOffsetX = 2;
        offCtx.shadowOffsetY = 2;
      }
      offCtx.fillText(layer.text, layer.x * canvasW, layer.y * canvasH);
      offCtx.restore();
    });

    // Split-screen comparison render
    if (splitCompare) {
      const splitX = Math.floor(canvasW * splitPosition);
      // Left side: original
      ctx.save();
      ctx.beginPath();
      ctx.rect(0, 0, splitX, canvasH);
      ctx.clip();
      ctx.translate(canvasW / 2, canvasH / 2);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1);
      ctx.drawImage(imageElement, -origW / 2, -origH / 2);
      ctx.restore();

      // Right side: processed
      ctx.save();
      ctx.beginPath();
      ctx.rect(splitX, 0, canvasW - splitX, canvasH);
      ctx.clip();
      ctx.drawImage(offscreen, 0, 0);
      ctx.restore();

      // Divider line
      ctx.strokeStyle = '#F59E0B';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(splitX, 0);
      ctx.lineTo(splitX, canvasH);
      ctx.stroke();
    } else {
      ctx.drawImage(offscreen, 0, 0);
    }

    onCanvasRendered(canvas);
  }, [
    imageElement,
    adjustments,
    filterId,
    filterIntensity,
    rotation,
    flipH,
    flipV,
    isHoldingCompare,
    splitCompare,
    splitPosition,
    textLayers,
    curves,
    hslTuner
  ]);

  // Fit to screen handler
  const handleFitToScreen = useCallback(() => {
    if (!containerRef.current || !mainCanvasRef.current) return;
    const cWidth = containerRef.current.clientWidth - 80;
    const cHeight = containerRef.current.clientHeight - 80;
    const imgW = mainCanvasRef.current.width || 600;
    const imgH = mainCanvasRef.current.height || 600;

    const scaleW = cWidth / imgW;
    const scaleH = cHeight / imgH;
    const fitScale = Math.min(scaleW, scaleH, 1.2);
    setZoom(Math.max(0.2, fitScale));
    setPan({ x: 0, y: 0 });
  }, []);

  // Initial fit on image load
  useEffect(() => {
    if (imageElement) {
      setTimeout(handleFitToScreen, 50);
    }
  }, [imageElement, handleFitToScreen]);

  // Mouse wheel zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomDelta = e.deltaY > 0 ? -0.1 : 0.1;
    setZoom(prev => Math.min(4, Math.max(0.2, prev + zoomDelta)));
  };

  // Canvas Mouse Move for coordinate and pixel color readout
  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = mainCanvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clientX = e.clientX - rect.left;
    const clientY = e.clientY - rect.top;

    const x = Math.floor((clientX / rect.width) * canvas.width);
    const y = Math.floor((clientY / rect.height) * canvas.height);

    if (x >= 0 && x < canvas.width && y >= 0 && y < canvas.height) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        try {
          const pixel = ctx.getImageData(x, y, 1, 1).data;
          const rgbStr = `rgb(${pixel[0]}, ${pixel[1]}, ${pixel[2]})`;
          setCursorInfo({ x, y, rgb: rgbStr });
          onCursorMove(x, y, rgbStr);
        } catch {
          onCursorMove(x, y, `rgb(0, 0, 0)`);
        }
      }
    }
  };

  // Drag and Drop files
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onFileDrop(e.dataTransfer.files[0]);
    }
  };

  // Crop Dragging logic
  const handleCropMouseDown = (handle: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDraggingCrop(handle);
    setCropDragStart({
      x: e.clientX,
      y: e.clientY,
      rect: { ...cropRect }
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    // Pan canvas
    if (isPanning) {
      setPan({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y
      });
      return;
    }

    // Split divider drag
    if (isDraggingSplit && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const pos = (e.clientX - rect.left) / rect.width;
      setSplitPosition(Math.max(0.05, Math.min(0.95, pos)));
      return;
    }

    // Crop box resize/drag
    if (isDraggingCrop && mainCanvasRef.current) {
      const rect = mainCanvasRef.current.getBoundingClientRect();
      const dx = (e.clientX - cropDragStart.x) / rect.width;
      const dy = (e.clientY - cropDragStart.y) / rect.height;
      const initial = cropDragStart.rect;

      let newRect = { ...initial };

      if (isDraggingCrop === 'box') {
        newRect.x = Math.max(0, Math.min(1 - initial.width, initial.x + dx));
        newRect.y = Math.max(0, Math.min(1 - initial.height, initial.y + dy));
      } else if (isDraggingCrop === 'br') {
        newRect.width = Math.max(0.1, Math.min(1 - initial.x, initial.width + dx));
        newRect.height = Math.max(0.1, Math.min(1 - initial.y, initial.height + dy));
      } else if (isDraggingCrop === 'tl') {
        const targetW = initial.width - dx;
        const targetH = initial.height - dy;
        if (targetW > 0.1 && initial.x + dx >= 0) {
          newRect.x = initial.x + dx;
          newRect.width = targetW;
        }
        if (targetH > 0.1 && initial.y + dy >= 0) {
          newRect.y = initial.y + dy;
          newRect.height = targetH;
        }
      }

      setCropRect(newRect);
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
    setIsDraggingSplit(false);
    setIsDraggingCrop(null);
  };

  return (
    <section 
      ref={containerRef}
      onWheel={handleWheel}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className="flex-1 relative bg-[#141414] flex items-center justify-center overflow-hidden p-6 sm:p-10 select-none cursor-default"
    >
      {/* Geometric background grid & subtle amber radial gradient from design */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-amber-500/6 via-transparent to-transparent pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff04_1px,transparent_1px),linear-gradient(to_bottom,#ffffff04_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />

      {/* When no image is loaded */}
      {!imageElement && (
        <div className="relative z-10 flex flex-col items-center justify-center max-w-md p-8 text-center bg-[#0D0D0D]/90 border border-white/10 rounded-2xl shadow-2xl backdrop-blur">
          <div className="w-16 h-16 mb-5 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-center justify-center text-amber-500 shadow-inner">
            <Upload className="w-8 h-8 animate-pulse" />
          </div>
          <h2 className="text-lg font-semibold text-white tracking-tight mb-2">
            Open or Drop Photo
          </h2>
          <p className="text-xs text-white/50 mb-6 leading-relaxed">
            Drag & drop any portrait or landscape photo to start editing, apply passport sizing, or compress under target KB.
          </p>
          <div className="flex flex-wrap gap-2 justify-center">
            <label 
              htmlFor="bench-upload"
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs rounded-lg transition-all cursor-pointer shadow-md"
            >
              Browse Photo
            </label>
            <input 
              id="bench-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) onFileDrop(e.target.files[0]);
              }}
            />
          </div>
        </div>
      )}

      {/* Main Working Canvas Frame */}
      {imageElement && !isSheetMode && (
        <div 
          className="relative transition-transform duration-75 ease-out shadow-2xl"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: 'center center'
          }}
        >
          {/* Main Visual Canvas */}
          <canvas
            ref={mainCanvasRef}
            onMouseMove={handleCanvasMouseMove}
            onMouseDown={(e) => {
              if (e.button === 0 && !isDraggingCrop) {
                setIsPanning(true);
                setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
              }
            }}
            className="block max-w-none rounded shadow-2xl border border-white/15 bg-black/40 cursor-crosshair"
          />

          {/* Interactive Crop Box Overlay */}
          {activeTab === 'crop' && (
            <div
              onMouseDown={(e) => handleCropMouseDown('box', e)}
              className="absolute border-2 border-amber-500 bg-amber-500/10 cursor-move"
              style={{
                left: `${cropRect.x * 100}%`,
                top: `${cropRect.y * 100}%`,
                width: `${cropRect.width * 100}%`,
                height: `${cropRect.height * 100}%`
              }}
            >
              {/* Corner Handles */}
              <div 
                onMouseDown={(e) => handleCropMouseDown('tl', e)}
                className="absolute -left-2 -top-2 w-4 h-4 bg-amber-500 border-2 border-black rounded-sm cursor-nwse-resize shadow-md" 
              />
              <div 
                onMouseDown={(e) => handleCropMouseDown('br', e)}
                className="absolute -right-2 -bottom-2 w-4 h-4 bg-amber-500 border-2 border-black rounded-sm cursor-nwse-resize shadow-md" 
              />

              {/* Composition 3x3 Grid */}
              <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 pointer-events-none opacity-30">
                <div className="border-r border-b border-amber-500/40" />
                <div className="border-r border-b border-amber-500/40" />
                <div className="border-b border-amber-500/40" />
                <div className="border-r border-b border-amber-500/40" />
                <div className="border-r border-b border-amber-500/40" />
                <div className="border-b border-amber-500/40" />
                <div className="border-r border-amber-500/40" />
                <div className="border-r border-amber-500/40" />
                <div className="" />
              </div>

              {/* Passport Biometric Face Guide Overlay */}
              {showBiometricGuide && (
                <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center">
                  {/* Head Oval (approx 65-75% of passport height) */}
                  <div className="w-[60%] h-[72%] border-2 border-dashed border-amber-400/80 rounded-full flex flex-col justify-between items-center py-4 relative shadow-lg">
                    {/* Crown Top Guide */}
                    <div className="w-12 h-0.5 bg-amber-400/70" />
                    {/* Eye Level Line */}
                    <div className="w-full h-0.5 bg-amber-400/70 relative">
                      <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 text-[9px] font-mono text-amber-300 uppercase tracking-widest bg-black/60 px-1 rounded">
                        Eye Level
                      </span>
                    </div>
                    {/* Chin Line */}
                    <div className="w-14 h-0.5 bg-amber-400/70 relative">
                      <span className="absolute -bottom-3.5 left-1/2 -translate-x-1/2 text-[9px] font-mono text-amber-300 uppercase tracking-widest bg-black/60 px-1 rounded">
                        Chin Line
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Crop action badge floating on crop box */}
              <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-[#0F0F0F] border border-amber-500/40 px-3 py-1 rounded-full shadow-xl">
                <button
                  onClick={onApplyCrop}
                  className="flex items-center gap-1 text-[11px] font-bold text-amber-400 hover:text-amber-300 cursor-pointer"
                >
                  <Check className="w-3 h-3" /> Apply
                </button>
                <span className="text-white/20">|</span>
                <button
                  onClick={onCancelCrop}
                  className="flex items-center gap-1 text-[11px] font-medium text-white/60 hover:text-white cursor-pointer"
                >
                  <X className="w-3 h-3" /> Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Printable Sheet View Canvas */}
      {isSheetMode && sheetCanvas && (
        <div 
          className="relative transition-transform duration-75 shadow-2xl p-4 bg-white/5 border border-white/15 rounded-lg"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom * 0.6})`,
            transformOrigin: 'center center'
          }}
        >
          <img 
            src={sheetCanvas.toDataURL('image/jpeg', 0.95)} 
            alt="Printable Passport Sheet" 
            className="shadow-2xl max-w-none border border-slate-300"
          />
        </div>
      )}

      {/* Docked Top Canvas Controls */}
      {imageElement && (
        <div className="absolute top-4 right-4 flex items-center gap-1 bg-[#111111]/90 backdrop-blur-md border border-white/10 p-1 rounded-xl z-20 shadow-xl">
          <button
            onClick={() => setZoom(prev => Math.max(0.2, prev - 0.15))}
            className="p-1.5 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
            title="Zoom Out (-)"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          
          <button
            onClick={handleFitToScreen}
            className="px-2 py-1 text-[11px] font-mono font-medium text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
            title="Fit to Screen (Reset Zoom)"
          >
            {Math.round(zoom * 100)}%
          </button>

          <button
            onClick={() => setZoom(prev => Math.min(4, prev + 0.15))}
            className="p-1.5 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
            title="Zoom In (+)"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>

          <div className="w-[1px] h-4 bg-white/15 mx-1" />

          {/* Hold to Compare Original */}
          <button
            onMouseDown={() => setIsHoldingCompare(true)}
            onMouseUp={() => setIsHoldingCompare(false)}
            onMouseLeave={() => setIsHoldingCompare(false)}
            onTouchStart={() => setIsHoldingCompare(true)}
            onTouchEnd={() => setIsHoldingCompare(false)}
            className={`p-1.5 rounded-lg text-xs flex items-center gap-1 transition-colors cursor-pointer ${
              isHoldingCompare ? 'bg-amber-500 text-black font-bold' : 'text-white/70 hover:text-white hover:bg-white/10'
            }`}
            title="Press and Hold to Compare with Original Photo"
          >
            <Eye className="w-3.5 h-3.5" />
            <span className="text-[11px] hidden sm:inline">Compare</span>
          </button>

          {/* Split Comparison */}
          <button
            onClick={() => {
              if (onToggleSplitCompare) onToggleSplitCompare();
              else setInternalSplitCompare(!splitCompare);
            }}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              splitCompare ? 'bg-amber-500 text-black font-bold' : 'text-white/70 hover:text-white hover:bg-white/10'
            }`}
            title="Split-Screen Original vs Processed"
          >
            <Columns className="w-3.5 h-3.5" />
          </button>

          {/* Biometric Guide Toggle */}
          <button
            onClick={() => setShowBiometricGuide(!showBiometricGuide)}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              showBiometricGuide ? 'bg-amber-500 text-black font-bold' : 'text-white/70 hover:text-white hover:bg-white/10'
            }`}
            title="Toggle Passport Biometric Face Alignment Guide"
          >
            <UserCheck className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Real-time Cursor & Pixel Sampler HUD */}
      {imageElement && cursorInfo && (
        <div className="absolute bottom-4 left-4 hidden sm:flex items-center gap-2.5 bg-[#0B0D11]/90 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-xl z-20 shadow-lg text-[11px] font-mono text-white/70 select-none">
          <div
            className="w-3 h-3 rounded-full border border-white/20 shadow-sm"
            style={{ backgroundColor: cursorInfo.rgb }}
          />
          <span className="text-white/40">POS:</span>
          <span className="text-amber-400 font-bold">{cursorInfo.x}×{cursorInfo.y}</span>
          <span className="text-white/20">|</span>
          <span className="text-white/40">RGB:</span>
          <span className="text-white font-medium">{cursorInfo.rgb}</span>
        </div>
      )}
    </section>
  );
};
