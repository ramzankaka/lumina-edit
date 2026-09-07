/**
 * Lumina Edit Pro - Professional Photo & Passport Studio
 * Clean, modern, responsive layout adjustable to PC, Tablet & Mobile.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Navbar, MainStudioTab } from './components/Navbar';
import { Toolbar } from './components/Toolbar';
import { CanvasWorkbench } from './components/CanvasWorkbench';
import { SamplePhotosTray } from './components/SamplePhotosTray';
import { RightSidebar } from './components/RightSidebar';
import { ExportModal } from './components/ExportModal';
import { ShareModal } from './components/ShareModal';
import { BatchProcessorModal } from './components/BatchProcessorModal';
import { 
  Adjustments, 
  CropRect, 
  HistoryState, 
  PassportPreset, 
  TextLayer, 
  ToolMode, 
  ToneCurves, 
  HslTuner 
} from './types';
import { 
  DEFAULT_ADJUSTMENTS, 
  GLOBAL_PASSPORT_PRESETS, 
  DEFAULT_TONE_CURVES,
  DEFAULT_HSL_TUNER,
  calculateAutoEnhance, 
  replacePassportBackground, 
  renderPrintablePassportSheet,
  applyFacialSmoothingRetouch,
  applySuperResolutionUpscale,
  applyNameDateStampBar
} from './utils/imageProcessing';
import { getSampleImageDataUrl } from './utils/sampleImages';

export default function App() {
  // Main Image State
  const [imageElement, setImageElement] = useState<HTMLImageElement | null>(null);
  const [activeFilename, setActiveFilename] = useState<string>('portrait_official.jpg');
  const [imageDimensions, setImageDimensions] = useState<{ width: number; height: number }>({ width: 600, height: 600 });
  const [activeTab, setActiveTab] = useState<ToolMode>('crop');

  // Adjustments & Transforms
  const [adjustments, setAdjustments] = useState<Adjustments>(DEFAULT_ADJUSTMENTS);
  const [curves, setCurves] = useState<ToneCurves>(DEFAULT_TONE_CURVES);
  const [hslTuner, setHslTuner] = useState<HslTuner>(DEFAULT_HSL_TUNER);
  const [filterId, setFilterId] = useState<string>('none');
  const [filterIntensity, setFilterIntensity] = useState<number>(1.0);
  const [rotation, setRotation] = useState<number>(0);
  const [flipH, setFlipH] = useState<boolean>(false);
  const [flipV, setFlipV] = useState<boolean>(false);

  // Crop & 50+ Passport Presets
  const [cropRect, setCropRect] = useState<CropRect>({ x: 0.1, y: 0.1, width: 0.8, height: 0.8 });
  const [selectedPassportPreset, setSelectedPassportPreset] = useState<PassportPreset | null>(GLOBAL_PASSPORT_PRESETS[0]);
  const [selectedAspectRatio, setSelectedAspectRatio] = useState<string>('1-1');
  const [showBiometricGuide, setShowBiometricGuide] = useState<boolean>(true);

  // Text Layers
  const [textLayers, setTextLayers] = useState<TextLayer[]>([]);

  // Multi-Photo Printable Sheet
  const [sheetFormat, setSheetFormat] = useState<'4x6' | 'a4'>('4x6');
  const [sheetGrid, setSheetGrid] = useState<'2x2' | '2x3' | '2x4' | '3x4' | '4x4' | '4x5'>('2x3');
  const [includeCropMarks, setIncludeCropMarks] = useState<boolean>(true);
  const [isSheetMode, setIsSheetMode] = useState<boolean>(false);
  const [sheetCanvas, setSheetCanvas] = useState<HTMLCanvasElement | null>(null);

  // Canvas Reference
  const [currentCanvas, setCurrentCanvas] = useState<HTMLCanvasElement | null>(null);

  // Modals & Studio Modes
  const [studioTab, setStudioTab] = useState<MainStudioTab>('passport');
  const [isSamplesTrayOpen, setIsSamplesTrayOpen] = useState<boolean>(false);
  const [isHoldingCompare, setIsHoldingCompare] = useState<boolean>(false);
  const [splitCompare, setSplitCompare] = useState<boolean>(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState<boolean>(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState<boolean>(false);
  const [isBatchModalOpen, setIsBatchModalOpen] = useState<boolean>(false);

  // Studio Mode selection handler
  const handleSelectStudioTab = useCallback((tab: MainStudioTab) => {
    setStudioTab(tab);
    if (tab === 'passport') setActiveTab('crop');
    else if (tab === 'adjust') setActiveTab('adjust');
    else if (tab === 'retouch') setActiveTab('smart');
    else if (tab === 'sheet') setActiveTab('sheet');
    else if (tab === 'tools') setActiveTab('text');
  }, []);

  // History Stack for Undo / Redo
  const [history, setHistory] = useState<HistoryState[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);

  // Helper to load an image from URL or data URL
  const loadImageFromSrc = useCallback((src: string, filename: string = 'portrait.jpg') => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      setImageElement(img);
      const w = img.naturalWidth || img.width;
      const h = img.naturalHeight || img.height;
      setImageDimensions({ width: w, height: h });
      setActiveFilename(filename);

      // Record initial history state
      const initialState: HistoryState = {
        id: 'initial',
        name: 'Open Image',
        timestamp: Date.now(),
        adjustments: DEFAULT_ADJUSTMENTS,
        filterId: 'none',
        filterIntensity: 1.0,
        rotation: 0,
        flipH: false,
        flipV: false,
        textLayers: []
      };
      setHistory([initialState]);
      setHistoryIndex(0);
      setAdjustments(DEFAULT_ADJUSTMENTS);
      setCurves(DEFAULT_TONE_CURVES);
      setHslTuner(DEFAULT_HSL_TUNER);
      setFilterId('none');
      setRotation(0);
      setFlipH(false);
      setFlipV(false);
      setTextLayers([]);
      setIsSheetMode(false);
    };
    img.src = src;
  }, []);

  // Initial load
  useEffect(() => {
    const defaultSampleUrl = getSampleImageDataUrl('passport');
    loadImageFromSrc(defaultSampleUrl, 'portrait_official.jpg');
  }, [loadImageFromSrc]);

  // Push state to history
  const pushHistory = useCallback((name: string) => {
    const nextState: HistoryState = {
      id: Math.random().toString(),
      name,
      timestamp: Date.now(),
      adjustments: { ...adjustments },
      filterId,
      filterIntensity,
      rotation,
      flipH,
      flipV,
      textLayers: [...textLayers]
    };
    setHistory(prev => [...prev.slice(0, historyIndex + 1), nextState]);
    setHistoryIndex(prev => prev + 1);
  }, [adjustments, filterId, filterIntensity, rotation, flipH, flipV, textLayers, historyIndex]);

  // Undo / Redo
  const handleUndo = () => {
    if (historyIndex > 0) {
      const prevIdx = historyIndex - 1;
      const st = history[prevIdx];
      setAdjustments(st.adjustments);
      setFilterId(st.filterId);
      setFilterIntensity(st.filterIntensity);
      setRotation(st.rotation);
      setFlipH(st.flipH);
      setFlipV(st.flipV);
      setTextLayers(st.textLayers);
      setHistoryIndex(prevIdx);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const nextIdx = historyIndex + 1;
      const st = history[nextIdx];
      setAdjustments(st.adjustments);
      setFilterId(st.filterId);
      setFilterIntensity(st.filterIntensity);
      setRotation(st.rotation);
      setFlipH(st.flipH);
      setFlipV(st.flipV);
      setTextLayers(st.textLayers);
      setHistoryIndex(nextIdx);
    }
  };

  // Open User File
  const handleOpenImage = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        loadImageFromSrc(e.target.result as string, file.name);
      }
    };
    reader.readAsDataURL(file);
  };

  // Passport Preset Selection
  const handleSelectPassportPreset = (preset: PassportPreset) => {
    setSelectedPassportPreset(preset);
    setSelectedAspectRatio(preset.aspectRatio === 1 ? '1-1' : 'free');

    const currentRatio = preset.aspectRatio;
    let newW = 0.7;
    let newH = 0.7 / currentRatio;
    if (newH > 0.85) {
      newH = 0.85;
      newW = newH * currentRatio;
    }
    setCropRect({
      x: (1 - newW) / 2,
      y: (1 - newH) / 2,
      width: newW,
      height: newH
    });
    pushHistory(`Select ${preset.name}`);
  };

  // Aspect Ratio Selection
  const handleSelectAspectRatio = (ratioId: string) => {
    setSelectedAspectRatio(ratioId);
    let ratio: number | null = null;
    if (ratioId === '1-1') ratio = 1;
    else if (ratioId === '4-3') ratio = 4 / 3;
    else if (ratioId === '16-9') ratio = 16 / 9;
    else if (ratioId === '9-16') ratio = 9 / 16;
    else if (ratioId === '3-2') ratio = 3 / 2;

    if (ratio) {
      let newW = 0.75;
      let newH = 0.75 / ratio;
      if (newH > 0.85) {
        newH = 0.85;
        newW = newH * ratio;
      }
      setCropRect({
        x: (1 - newW) / 2,
        y: (1 - newH) / 2,
        width: newW,
        height: newH
      });
    }
  };

  // Apply Crop
  const handleApplyCrop = () => {
    if (!currentCanvas || !imageElement) return;
    const cw = currentCanvas.width;
    const ch = currentCanvas.height;

    const sourceX = Math.round(cropRect.x * cw);
    const sourceY = Math.round(cropRect.y * ch);
    const sourceW = Math.round(cropRect.width * cw);
    const sourceH = Math.round(cropRect.height * ch);

    const cropped = document.createElement('canvas');
    cropped.width = sourceW;
    cropped.height = sourceH;
    const cCtx = cropped.getContext('2d');
    if (!cCtx) return;

    cCtx.drawImage(currentCanvas, sourceX, sourceY, sourceW, sourceH, 0, 0, sourceW, sourceH);
    const dataUrl = cropped.toDataURL('image/jpeg', 0.98);
    loadImageFromSrc(dataUrl, `cropped_${activeFilename}`);
    pushHistory('Apply Crop');
  };

  const handleCancelCrop = () => {
    setCropRect({ x: 0.1, y: 0.1, width: 0.8, height: 0.8 });
  };

  // Reset Adjustments
  const handleResetAdjustments = () => {
    setAdjustments(DEFAULT_ADJUSTMENTS);
    setCurves(DEFAULT_TONE_CURVES);
    setHslTuner(DEFAULT_HSL_TUNER);
    setRotation(0);
    setFlipH(false);
    setFlipV(false);
    setFilterId('none');
    setFilterIntensity(1.0);
    pushHistory('Reset Adjustments');
  };

  // 1-Click Auto Enhance
  const handleAutoEnhance = () => {
    if (!currentCanvas) return;
    const ctx = currentCanvas.getContext('2d');
    if (!ctx) return;
    const imgData = ctx.getImageData(0, 0, currentCanvas.width, currentCanvas.height);
    const recommended = calculateAutoEnhance(imgData);
    setAdjustments(prev => ({
      ...prev,
      exposure: recommended.exposure ?? prev.exposure,
      contrast: recommended.contrast ?? prev.contrast,
      brightness: recommended.brightness ?? prev.brightness,
      vibrance: recommended.vibrance ?? prev.vibrance,
      sharpness: recommended.sharpness ?? prev.sharpness
    }));
    pushHistory('Auto-Enhance Lighting');
  };

  // 1-Click Solid Background Replacer
  const handleReplaceBackground = (targetColorHex: string) => {
    if (!currentCanvas) return;
    const ctx = currentCanvas.getContext('2d');
    if (!ctx) return;

    const replacedImageData = replacePassportBackground(ctx, currentCanvas.width, currentCanvas.height, targetColorHex);
    ctx.putImageData(replacedImageData, 0, 0);

    const updatedDataUrl = currentCanvas.toDataURL('image/png');
    loadImageFromSrc(updatedDataUrl, activeFilename);
    pushHistory(`Replace Background: ${targetColorHex}`);
  };

  // Facial Skin Smoothing & Glare Retouch
  const handleApplyFacialRetouch = (strength: number) => {
    if (!currentCanvas) return;
    const ctx = currentCanvas.getContext('2d');
    if (!ctx) return;

    const smoothed = applyFacialSmoothingRetouch(ctx, currentCanvas.width, currentCanvas.height, strength);
    ctx.putImageData(smoothed, 0, 0);
    const updatedDataUrl = currentCanvas.toDataURL('image/jpeg', 0.98);
    loadImageFromSrc(updatedDataUrl, activeFilename);
    pushHistory(`Skin Smoothing: ${strength}%`);
  };

  // AI Super-Resolution Upscaling
  const handleApplySuperResolution = (scale: 2 | 4) => {
    if (!currentCanvas) return;
    const upscaled = applySuperResolutionUpscale(currentCanvas, scale);
    const updatedDataUrl = upscaled.toDataURL('image/jpeg', 0.98);
    loadImageFromSrc(updatedDataUrl, `upscaled_${scale}x_${activeFilename}`);
    pushHistory(`AI Upscale ${scale}×`);
  };

  // Candidate Name & DOP Stamp Bar
  const handleApplyNameDateStamp = (name: string, date: string) => {
    if (!currentCanvas) return;
    const ctx = currentCanvas.getContext('2d');
    if (!ctx) return;

    applyNameDateStampBar(ctx, currentCanvas.width, currentCanvas.height, name, date);
    const updatedDataUrl = currentCanvas.toDataURL('image/jpeg', 0.98);
    loadImageFromSrc(updatedDataUrl, `stamped_${activeFilename}`);
    pushHistory(`Name & DOP Stamp: ${name}`);
  };

  // Add Text Layer
  const handleAddTextLayer = (text: string) => {
    const newLayer: TextLayer = {
      id: Math.random().toString(),
      text,
      x: 0.5,
      y: 0.85,
      fontSize: 24,
      fontFamily: 'Inter',
      color: '#000000',
      isBold: true,
      hasShadow: false,
      hasBackground: true
    };
    setTextLayers(prev => [...prev, newLayer]);
    pushHistory(`Add Text: ${text}`);
  };

  // Re-generate printable sheet when settings change
  useEffect(() => {
    if (isSheetMode && currentCanvas && selectedPassportPreset) {
      const sheet = renderPrintablePassportSheet(
        currentCanvas,
        selectedPassportPreset,
        sheetFormat,
        sheetGrid,
        includeCropMarks
      );
      setSheetCanvas(sheet);
    }
  }, [isSheetMode, currentCanvas, selectedPassportPreset, sheetFormat, sheetGrid, includeCropMarks]);

  return (
    <div className="flex flex-col h-screen w-screen bg-[#0F0F0F] text-white overflow-hidden select-none font-sans">
      {/* Clean, Uncluttered Top Bar */}
      <Navbar
        imageLoaded={!!imageElement}
        imageDimensions={imageDimensions}
        activeFilename={activeFilename}
        canUndo={historyIndex > 0}
        canRedo={historyIndex < history.length - 1}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onOpenImage={handleOpenImage}
        onOpenShareModal={() => setIsShareModalOpen(true)}
        onOpenExportModal={() => setIsExportModalOpen(true)}
        studioTab={studioTab}
        onSelectStudioTab={handleSelectStudioTab}
        isSamplesTrayOpen={isSamplesTrayOpen}
        onToggleSamplesTray={() => setIsSamplesTrayOpen(prev => !prev)}
      />

      {/* Main Studio Area: Left Tool Dock + Center Stage/Tray + Right Inspector */}
      <main className="flex-1 flex flex-col lg:flex-row overflow-hidden relative min-h-0">
        {/* Left Studio Tool Dock */}
        <Toolbar
          studioTab={studioTab}
          onSelectStudioTab={handleSelectStudioTab}
          onRotateClockwise={() => setRotation(prev => (prev + 90) % 360)}
          onRotateCounter={() => setRotation(prev => (prev - 90 + 360) % 360)}
          onToggleFlipH={() => setFlipH(prev => !prev)}
          flipH={flipH}
          onToggleFlipV={() => setFlipV(prev => !prev)}
          flipV={flipV}
          onAutoEnhance={handleAutoEnhance}
          showBiometricGuide={showBiometricGuide}
          onToggleBiometricGuide={() => setShowBiometricGuide(prev => !prev)}
          splitCompare={splitCompare}
          onToggleSplitCompare={() => setSplitCompare(prev => !prev)}
          isHoldingCompare={isHoldingCompare}
          onStartHoldCompare={() => setIsHoldingCompare(true)}
          onEndHoldCompare={() => setIsHoldingCompare(false)}
          onResetAll={handleResetAdjustments}
        />

        {/* Center: Stage + Sample Tray */}
        <div className="flex-1 flex flex-col overflow-hidden relative min-w-0">
          <CanvasWorkbench
            imageElement={imageElement}
            adjustments={adjustments}
            filterId={filterId}
            filterIntensity={filterIntensity}
            rotation={rotation}
            flipH={flipH}
            flipV={flipV}
            activeTab={activeTab}
            cropRect={cropRect}
            setCropRect={setCropRect}
            selectedPassportPreset={selectedPassportPreset}
            showBiometricGuide={showBiometricGuide}
            setShowBiometricGuide={setShowBiometricGuide}
            textLayers={textLayers}
            onApplyCrop={handleApplyCrop}
            onCancelCrop={handleCancelCrop}
            onCursorMove={() => {}}
            onFileDrop={handleOpenImage}
            onCanvasRendered={(canvas) => setCurrentCanvas(canvas)}
            isSheetMode={isSheetMode}
            sheetCanvas={sheetCanvas}
            curves={curves}
            hslTuner={hslTuner}
            isHoldingCompare={isHoldingCompare}
            splitCompare={splitCompare}
            onToggleSplitCompare={() => setSplitCompare(prev => !prev)}
          />

          {/* Quick Sample Photos Filmstrip Tray */}
          <SamplePhotosTray
            isOpen={isSamplesTrayOpen}
            onClose={() => setIsSamplesTrayOpen(false)}
            onSelectSample={loadImageFromSrc}
            activeFilename={activeFilename}
          />
        </div>

        {/* Unified Studio Inspector */}
        <RightSidebar
          studioTab={studioTab}
          onSelectStudioTab={handleSelectStudioTab}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          adjustments={adjustments}
          setAdjustments={setAdjustments}
          filterId={filterId}
          setFilterId={setFilterId}
          filterIntensity={filterIntensity}
          setFilterIntensity={setFilterIntensity}
          rotation={rotation}
          setRotation={setRotation}
          flipH={flipH}
          setFlipH={setFlipH}
          flipV={flipV}
          setFlipV={setFlipV}
          selectedPassportPreset={selectedPassportPreset}
          onSelectPassportPreset={handleSelectPassportPreset}
          selectedAspectRatio={selectedAspectRatio}
          onSelectAspectRatio={handleSelectAspectRatio}
          showBiometricGuide={showBiometricGuide}
          setShowBiometricGuide={setShowBiometricGuide}
          onApplyCrop={handleApplyCrop}
          onCancelCrop={handleCancelCrop}
          onResetAdjustments={handleResetAdjustments}
          onAutoEnhance={handleAutoEnhance}
          onReplaceBackground={handleReplaceBackground}
          sheetFormat={sheetFormat}
          setSheetFormat={setSheetFormat}
          sheetGrid={sheetGrid}
          setSheetGrid={setSheetGrid}
          includeCropMarks={includeCropMarks}
          setIncludeCropMarks={setIncludeCropMarks}
          isSheetMode={isSheetMode}
          setIsSheetMode={setIsSheetMode}
          currentCanvas={currentCanvas}
          sheetCanvas={sheetCanvas}
          textLayers={textLayers}
          onAddTextLayer={handleAddTextLayer}
          onApplyNameDateStamp={handleApplyNameDateStamp}
          onApplyFacialRetouch={handleApplyFacialRetouch}
          onApplySuperResolution={handleApplySuperResolution}
          onApplySignatureData={(url) => loadImageFromSrc(url, 'signature_clean.png')}
          curves={curves}
          setCurves={setCurves}
          hslTuner={hslTuner}
          setHslTuner={setHslTuner}
          onOpenBatchModal={() => setIsBatchModalOpen(true)}
        />
      </main>

      {/* Share Picture Modal (Native OS, WhatsApp, Bluetooth, Telegram, Email, Copy Image) */}
      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        canvas={currentCanvas}
        filename={activeFilename}
      />

      {/* Export & Strict KB Compression Modal */}
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        canvas={currentCanvas}
        sheetCanvas={sheetCanvas}
        defaultFilename={activeFilename}
      />

      {/* Batch Processing & ZIP Export Modal */}
      <BatchProcessorModal
        isOpen={isBatchModalOpen}
        onClose={() => setIsBatchModalOpen(false)}
        passportPreset={selectedPassportPreset}
      />
    </div>
  );
}
