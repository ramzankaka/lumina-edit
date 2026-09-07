/**
 * Unified Studio Panel - Responsive across PC, Tablet & Mobile
 * Sleek, professional, non-scattered studio with 5 intuitive workspaces.
 */

import React, { useState } from 'react';
import { 
  Sliders, 
  RotateCcw, 
  Crop, 
  Sparkles, 
  Grid, 
  Layers, 
  Check, 
  X, 
  Maximize2,
  Calendar,
  PenTool,
  TrendingUp,
  FileText,
  ChevronDown,
  ChevronUp,
  Search,
  PanelRightClose,
  PanelRightOpen,
  Activity,
  SlidersHorizontal,
  FolderArchive
} from 'lucide-react';
import { 
  Adjustments, 
  PassportPreset, 
  TextLayer, 
  ToolMode, 
  ToneCurves, 
  HslTuner 
} from '../types';
import { 
  ASPECT_RATIOS, 
  FILTER_PRESETS, 
  GLOBAL_PASSPORT_PRESETS, 
  PASSPORT_BG_COLORS,
  DEFAULT_TONE_CURVES,
  DEFAULT_HSL_TUNER,
  exportCanvasToPdf
} from '../utils/imageProcessing';
import { ToneCurvesEditor } from './ToneCurvesEditor';
import { HslTunerEditor } from './HslTunerEditor';
import { IcaoValidatorView } from './IcaoValidatorView';
import { SignatureTool } from './SignatureTool';
import { HistogramView } from './HistogramView';

export type MainStudioTab = 'passport' | 'adjust' | 'retouch' | 'sheet' | 'tools';

interface RightSidebarProps {
  studioTab?: MainStudioTab;
  onSelectStudioTab?: (tab: MainStudioTab) => void;
  activeTab: ToolMode;
  setActiveTab: (tab: ToolMode) => void;
  adjustments: Adjustments;
  setAdjustments: React.Dispatch<React.SetStateAction<Adjustments>>;
  filterId: string;
  setFilterId: (id: string) => void;
  filterIntensity: number;
  setFilterIntensity: (val: number) => void;
  rotation: number;
  setRotation: React.Dispatch<React.SetStateAction<number>>;
  flipH: boolean;
  setFlipH: React.Dispatch<React.SetStateAction<boolean>>;
  flipV: boolean;
  setFlipV: React.Dispatch<React.SetStateAction<boolean>>;
  selectedPassportPreset: PassportPreset | null;
  onSelectPassportPreset: (preset: PassportPreset) => void;
  selectedAspectRatio: string;
  onSelectAspectRatio: (ratioId: string) => void;
  showBiometricGuide: boolean;
  setShowBiometricGuide: (show: boolean) => void;
  onApplyCrop: () => void;
  onCancelCrop: () => void;
  onResetAdjustments: () => void;
  onAutoEnhance: () => void;
  onReplaceBackground: (hex: string) => void;
  sheetFormat: '4x6' | 'a4';
  setSheetFormat: (format: '4x6' | 'a4') => void;
  sheetGrid: '2x2' | '2x3' | '2x4' | '3x4' | '4x4' | '4x5';
  setSheetGrid: (grid: '2x2' | '2x3' | '2x4' | '3x4' | '4x4' | '4x5') => void;
  includeCropMarks: boolean;
  setIncludeCropMarks: (inc: boolean) => void;
  isSheetMode: boolean;
  setIsSheetMode: (mode: boolean) => void;
  currentCanvas: HTMLCanvasElement | null;
  sheetCanvas: HTMLCanvasElement | null;
  textLayers: TextLayer[];
  onAddTextLayer: (text: string) => void;
  onApplyNameDateStamp: (name: string, date: string) => void;
  onApplyFacialRetouch: (strength: number) => void;
  onApplySuperResolution: (scale: 2 | 4) => void;
  onApplySignatureData: (dataUrl: string) => void;
  curves: ToneCurves;
  setCurves: React.Dispatch<React.SetStateAction<ToneCurves>>;
  hslTuner: HslTuner;
  setHslTuner: React.Dispatch<React.SetStateAction<HslTuner>>;
  onOpenBatchModal?: () => void;
}

export const RightSidebar: React.FC<RightSidebarProps> = ({
  studioTab: controlledStudioTab,
  onSelectStudioTab,
  activeTab,
  setActiveTab,
  adjustments,
  setAdjustments,
  filterId,
  setFilterId,
  filterIntensity,
  setFilterIntensity,
  rotation,
  setRotation,
  flipH,
  setFlipH,
  flipV,
  setFlipV,
  selectedPassportPreset,
  onSelectPassportPreset,
  selectedAspectRatio,
  onSelectAspectRatio,
  showBiometricGuide,
  setShowBiometricGuide,
  onApplyCrop,
  onCancelCrop,
  onResetAdjustments,
  onAutoEnhance,
  onReplaceBackground,
  sheetFormat,
  setSheetFormat,
  sheetGrid,
  setSheetGrid,
  includeCropMarks,
  setIncludeCropMarks,
  isSheetMode,
  setIsSheetMode,
  currentCanvas,
  sheetCanvas,
  onApplyNameDateStamp,
  onApplyFacialRetouch,
  onApplySuperResolution,
  onApplySignatureData,
  curves,
  setCurves,
  hslTuner,
  setHslTuner,
  onOpenBatchModal
}) => {
  // Main Studio Mode (5 High-Level Studios)
  const [internalStudioTab, setInternalStudioTab] = useState<MainStudioTab>('passport');
  const studioTab = controlledStudioTab ?? internalStudioTab;

  // Sub-tabs inside Adjust & Passport
  const [adjustSubTab, setAdjustSubTab] = useState<'sliders' | 'curves' | 'hsl'>('sliders');
  const [passportSubTab, setPassportSubTab] = useState<'standards' | 'ratios' | 'icao'>('standards');
  const [toolsSubTab, setToolsSubTab] = useState<'stamp' | 'signature' | 'filters'>('stamp');

  // Desktop Panel Collapse
  const [isPanelCollapsed, setIsPanelCollapsed] = useState<boolean>(false);

  // Mobile Bottom Sheet Height: 'minimized' | 'half' | 'full'
  const [mobileHeight, setMobileHeight] = useState<'minimized' | 'half' | 'full'>('half');

  // Search & Filter for 50+ Passport Presets
  const [passportSearch, setPassportSearch] = useState<string>('');
  const [passportRegion, setPassportRegion] = useState<string>('All');

  // Candidate Name & DOP State
  const [candidateName, setCandidateName] = useState<string>('JOHN DOE');
  const [photoDate, setPhotoDate] = useState<string>(new Date().toISOString().split('T')[0]);

  // Skin Smoothing Strength
  const [smoothingStrength, setSmoothingStrength] = useState<number>(35);

  const handleSliderChange = (key: keyof Adjustments, val: number) => {
    setAdjustments((prev) => ({ ...prev, [key]: val }));
  };

  const filteredPresets = GLOBAL_PASSPORT_PRESETS.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(passportSearch.toLowerCase()) ||
      p.country.toLowerCase().includes(passportSearch.toLowerCase()) ||
      p.description.toLowerCase().includes(passportSearch.toLowerCase());
    const matchesRegion = passportRegion === 'All' || p.region === passportRegion;
    return matchesSearch && matchesRegion;
  });

  const regions = ['All', 'Americas', 'Europe', 'Asia & Middle East', 'Oceania & Africa', 'Universal / Exam'];

  // Switch studio mode and update activeTab
  const handleStudioChange = (tab: MainStudioTab) => {
    setInternalStudioTab(tab);
    if (onSelectStudioTab) {
      onSelectStudioTab(tab);
    }
    if (tab === 'passport') setActiveTab('crop');
    else if (tab === 'adjust') setActiveTab('adjust');
    else if (tab === 'retouch') setActiveTab('smart');
    else if (tab === 'sheet') setActiveTab('sheet');
    else if (tab === 'tools') setActiveTab('text');
    
    // Auto un-minimize on mobile
    if (mobileHeight === 'minimized') setMobileHeight('half');
  };

  // Studio tabs configuration
  const studioTabsConfig = [
    { id: 'passport', label: 'Passport', icon: <Crop className="w-4 h-4" /> },
    { id: 'adjust', label: 'Light & Tone', icon: <Sliders className="w-4 h-4" /> },
    { id: 'retouch', label: 'Retouch', icon: <Sparkles className="w-4 h-4" /> },
    { id: 'sheet', label: 'Print Grid', icon: <Grid className="w-4 h-4" /> },
    { id: 'tools', label: 'Tools', icon: <PenTool className="w-4 h-4" /> }
  ];

  /* ---------------- CONTENT RENDERERS ---------------- */

  // 1. PASSPORT & CROP STUDIO
  const renderPassportStudio = () => (
    <div className="space-y-4">
      {/* Sub-navigation */}
      <div className="flex bg-white/5 p-1 rounded-xl border border-white/10 text-xs">
        <button
          onClick={() => setPassportSubTab('standards')}
          className={`flex-1 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
            passportSubTab === 'standards' ? 'bg-amber-500 text-black font-semibold shadow-sm' : 'text-white/60 hover:text-white'
          }`}
        >
          50+ Standards
        </button>
        <button
          onClick={() => setPassportSubTab('ratios')}
          className={`flex-1 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
            passportSubTab === 'ratios' ? 'bg-amber-500 text-black font-semibold shadow-sm' : 'text-white/60 hover:text-white'
          }`}
        >
          Aspect Ratio
        </button>
        <button
          onClick={() => setPassportSubTab('icao')}
          className={`flex-1 py-1.5 rounded-lg font-medium transition-all cursor-pointer flex items-center justify-center gap-1 ${
            passportSubTab === 'icao' ? 'bg-amber-500 text-black font-semibold shadow-sm' : 'text-white/60 hover:text-white'
          }`}
        >
          <Activity className="w-3 h-3" />
          <span>ICAO Check</span>
        </button>
      </div>

      {/* Subtab Content */}
      {passportSubTab === 'standards' && (
        <div className="space-y-3">
          {/* Search & Region Filter */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-white/40" />
            <input
              type="text"
              placeholder="Search country (US, UK, Schengen, India...)"
              value={passportSearch}
              onChange={(e) => setPassportSearch(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-8 pr-3 py-2 text-xs text-white placeholder-white/40 focus:outline-none focus:border-amber-500 transition-colors"
            />
          </div>

          {/* Region Chips */}
          <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none text-[11px]">
            {regions.map((reg) => (
              <button
                key={reg}
                onClick={() => setPassportRegion(reg)}
                className={`px-2.5 py-1 rounded-full whitespace-nowrap transition-all cursor-pointer font-medium ${
                  passportRegion === reg
                    ? 'bg-amber-500 text-black'
                    : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'
                }`}
              >
                {reg}
              </button>
            ))}
          </div>

          {/* Preset Cards List */}
          <div className="space-y-2 max-h-64 sm:max-h-72 overflow-y-auto pr-1">
            {filteredPresets.map((preset) => {
              const isSelected = selectedPassportPreset?.id === preset.id;
              return (
                <button
                  key={preset.id}
                  onClick={() => onSelectPassportPreset(preset)}
                  className={`w-full text-left p-3 rounded-xl border transition-all cursor-pointer flex flex-col gap-1 ${
                    isSelected
                      ? 'bg-amber-500/15 border-amber-500/50 text-white ring-1 ring-amber-500/30'
                      : 'bg-white/5 border-white/10 hover:border-white/20 text-white/80'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold flex items-center gap-2">
                      <span className="text-sm">{preset.flag}</span>
                      <span>{preset.name}</span>
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 bg-white/10 rounded-md text-amber-400 font-bold">
                      {preset.widthMm}×{preset.heightMm} mm
                    </span>
                  </div>
                  <div className="text-[11px] text-white/50 leading-relaxed">
                    {preset.description}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {passportSubTab === 'ratios' && (
        <div className="space-y-3">
          <label className="text-[11px] font-medium text-white/60 uppercase tracking-wider block">
            Select Aspect Ratio
          </label>
          <div className="grid grid-cols-3 gap-2">
            {ASPECT_RATIOS.map((ar) => (
              <button
                key={ar.id}
                onClick={() => onSelectAspectRatio(ar.id)}
                className={`py-2 px-2.5 rounded-xl border text-xs text-center transition-all cursor-pointer font-medium ${
                  selectedAspectRatio === ar.id
                    ? 'bg-amber-500/20 border-amber-500 text-amber-400 font-semibold'
                    : 'bg-white/5 border-white/10 text-white/70 hover:border-white/20'
                }`}
              >
                {ar.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {passportSubTab === 'icao' && (
        <IcaoValidatorView
          canvas={currentCanvas}
          preset={selectedPassportPreset}
          onAutoFix={() => {
            onAutoEnhance();
            onReplaceBackground('#FFFFFF');
          }}
          onToggleGuide={setShowBiometricGuide}
          showGuide={showBiometricGuide}
        />
      )}

      {/* Biometric Guide & Crop Action Buttons */}
      <div className="pt-3 border-t border-white/10 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs text-white/80 font-medium">Biometric Head Alignment Box</span>
          <button
            onClick={() => setShowBiometricGuide(!showBiometricGuide)}
            className={`w-9 h-5 rounded-full transition-colors relative cursor-pointer ${
              showBiometricGuide ? 'bg-amber-500' : 'bg-white/20'
            }`}
          >
            <div
              className={`absolute top-0.5 w-4 h-4 bg-black rounded-full transition-transform ${
                showBiometricGuide ? 'right-0.5' : 'left-0.5'
              }`}
            />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={onCancelCrop}
            className="py-2.5 px-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 text-xs font-medium rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
            <span>Cancel</span>
          </button>
          <button
            onClick={onApplyCrop}
            className="py-2.5 px-3 bg-amber-500 hover:bg-amber-400 active:scale-95 text-black text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 shadow-md shadow-amber-500/20 transition-all cursor-pointer"
          >
            <Check className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Apply Crop</span>
          </button>
        </div>
      </div>
    </div>
  );

  // 2. LIGHT & TONE STUDIO
  const renderAdjustStudio = () => (
    <div className="space-y-4">
      {/* Live RGB & Luminance Histogram */}
      <HistogramView canvas={currentCanvas} />

      {/* Sub-navigation */}
      <div className="flex bg-white/5 p-1 rounded-xl border border-white/10 text-xs">
        <button
          onClick={() => setAdjustSubTab('sliders')}
          className={`flex-1 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
            adjustSubTab === 'sliders' ? 'bg-amber-500 text-black font-semibold shadow-sm' : 'text-white/60 hover:text-white'
          }`}
        >
          Sliders
        </button>
        <button
          onClick={() => setAdjustSubTab('curves')}
          className={`flex-1 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
            adjustSubTab === 'curves' ? 'bg-amber-500 text-black font-semibold shadow-sm' : 'text-white/60 hover:text-white'
          }`}
        >
          Curves
        </button>
        <button
          onClick={() => setAdjustSubTab('hsl')}
          className={`flex-1 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
            adjustSubTab === 'hsl' ? 'bg-amber-500 text-black font-semibold shadow-sm' : 'text-white/60 hover:text-white'
          }`}
        >
          HSL Tuner
        </button>
      </div>

      {adjustSubTab === 'sliders' && (
        <div className="space-y-4">
          {/* Orientation & Rotate */}
          <div className="p-3 bg-white/5 border border-white/10 rounded-xl space-y-2">
            <span className="text-[11px] font-medium text-white/70 block">Orientation & Flip</span>
            <div className="grid grid-cols-4 gap-1.5">
              <button
                onClick={() => setRotation((prev) => (prev + 90) % 360)}
                className="py-1.5 px-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs text-white transition-colors cursor-pointer"
              >
                +90°
              </button>
              <button
                onClick={() => setRotation((prev) => (prev - 90 + 360) % 360)}
                className="py-1.5 px-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs text-white transition-colors cursor-pointer"
              >
                -90°
              </button>
              <button
                onClick={() => setFlipH((prev) => !prev)}
                className={`py-1.5 px-2 rounded-lg text-xs border cursor-pointer transition-colors ${
                  flipH ? 'bg-amber-500/20 border-amber-500 text-amber-400 font-bold' : 'bg-white/5 border-white/10 text-white'
                }`}
              >
                Flip H
              </button>
              <button
                onClick={() => setFlipV((prev) => !prev)}
                className={`py-1.5 px-2 rounded-lg text-xs border cursor-pointer transition-colors ${
                  flipV ? 'bg-amber-500/20 border-amber-500 text-amber-400 font-bold' : 'bg-white/5 border-white/10 text-white'
                }`}
              >
                Flip V
              </button>
            </div>
          </div>

          {/* Precision Sliders */}
          <div className="space-y-3">
            {[
              { key: 'exposure', label: 'Exposure', min: -100, max: 100 },
              { key: 'contrast', label: 'Contrast', min: -100, max: 100 },
              { key: 'brightness', label: 'Brightness', min: -100, max: 100 },
              { key: 'saturation', label: 'Saturation', min: -100, max: 100 },
              { key: 'warmth', label: 'Color Temperature', min: -100, max: 100 },
              { key: 'sharpness', label: 'Sharpness', min: 0, max: 100 },
              { key: 'vignette', label: 'Vignette', min: 0, max: 100 }
            ].map((item) => {
              const val = adjustments[item.key as keyof Adjustments];
              return (
                <div key={item.key} className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-white/70">{item.label}</span>
                    <span className="text-amber-400 font-mono font-medium">
                      {val > 0 ? `+${val}` : val}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={item.min}
                    max={item.max}
                    value={val}
                    onChange={(e) => handleSliderChange(item.key as keyof Adjustments, Number(e.target.value))}
                    className="w-full accent-amber-500 h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              );
            })}
          </div>

          <button
            onClick={onResetAdjustments}
            className="w-full py-2 px-3 bg-white/5 hover:bg-white/10 text-white/60 hover:text-white border border-white/10 rounded-xl text-xs font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Light Adjustments</span>
          </button>
        </div>
      )}

      {adjustSubTab === 'curves' && (
        <div className="space-y-4">
          <ToneCurvesEditor
            curves={curves}
            onChange={setCurves}
            onReset={() => setCurves(DEFAULT_TONE_CURVES)}
          />
        </div>
      )}

      {adjustSubTab === 'hsl' && (
        <div className="space-y-4">
          <HslTunerEditor
            hslTuner={hslTuner}
            onChange={setHslTuner}
            onReset={() => setHslTuner(DEFAULT_HSL_TUNER)}
          />
        </div>
      )}
    </div>
  );

  // 3. RETOUCH & AI STUDIO
  const renderRetouchStudio = () => (
    <div className="space-y-4">
      {/* 1-Click Auto Enhance */}
      <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl space-y-2">
        <div className="flex items-center gap-2 text-xs font-semibold text-amber-400">
          <Sparkles className="w-4 h-4" />
          <span>1-Click Studio Lighting Enhance</span>
        </div>
        <p className="text-[11px] text-white/60 leading-relaxed">
          Automatically balances histogram exposure, shadow fill, and skin tone vibrancy.
        </p>
        <button
          onClick={onAutoEnhance}
          className="w-full py-2.5 px-3 bg-amber-500 hover:bg-amber-400 active:scale-95 text-black font-semibold text-xs rounded-xl shadow-md transition-all cursor-pointer"
        >
          Auto-Enhance Photo
        </button>
      </div>

      {/* Solid Passport Backgrounds */}
      <div className="space-y-2.5 pt-2 border-t border-white/10">
        <label className="text-[11px] font-medium text-white/60 uppercase tracking-wider block">
          Official Solid Backgrounds
        </label>
        <div className="grid grid-cols-2 gap-2">
          {PASSPORT_BG_COLORS.map((bg) => (
            <button
              key={bg.value}
              onClick={() => onReplaceBackground(bg.value)}
              className="p-2.5 bg-white/5 border border-white/10 hover:border-white/30 rounded-xl flex items-center gap-2.5 transition-all cursor-pointer text-left"
            >
              <span
                className={`w-5 h-5 rounded-full border ${bg.border} shrink-0 shadow-sm`}
                style={{ backgroundColor: bg.value }}
              />
              <span className="text-xs text-white/80 truncate">
                {bg.name}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Skin Smoothing */}
      <div className="space-y-2 pt-2 border-t border-white/10">
        <div className="flex justify-between text-xs">
          <span className="text-white/80 font-medium">Facial Skin Smoothing</span>
          <span className="text-amber-400 font-mono">{smoothingStrength}%</span>
        </div>
        <input
          type="range"
          min="10"
          max="80"
          value={smoothingStrength}
          onChange={(e) => setSmoothingStrength(Number(e.target.value))}
          className="w-full accent-amber-500 h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer"
        />
        <button
          onClick={() => onApplyFacialRetouch(smoothingStrength)}
          className="w-full py-2 px-3 bg-white/10 hover:bg-white/15 text-white text-xs font-medium rounded-xl transition-colors cursor-pointer"
        >
          Apply Skin Smoothing & Glare Reduction
        </button>
      </div>

      {/* AI Super-Resolution */}
      <div className="space-y-2 pt-2 border-t border-white/10">
        <label className="text-[11px] font-medium text-white/60 uppercase tracking-wider block">
          AI Super-Resolution Upscaling
        </label>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => onApplySuperResolution(2)}
            className="py-2.5 px-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-medium rounded-xl transition-colors cursor-pointer text-center"
          >
            2× HD Upscale
          </button>
          <button
            onClick={() => onApplySuperResolution(4)}
            className="py-2.5 px-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-medium rounded-xl transition-colors cursor-pointer text-center"
          >
            4× Ultra Upscale
          </button>
        </div>
      </div>
    </div>
  );

  // 4. PRINT GRID STUDIO
  const renderSheetStudio = () => (
    <div className="space-y-4">
      <div className="p-3 bg-amber-500/10 border border-amber-500/25 rounded-xl text-amber-400 text-xs">
        Tile multiple passport copies onto standard photo card for print shops or instant home printing.
      </div>

      {/* Paper Size */}
      <div className="space-y-2">
        <label className="text-[11px] font-medium text-white/60 uppercase tracking-wider block">
          Paper Size
        </label>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => setSheetFormat('4x6')}
            className={`py-2 px-3 rounded-xl border text-xs text-center transition-all cursor-pointer font-medium ${
              sheetFormat === '4x6'
                ? 'bg-amber-500/20 border-amber-500 text-amber-400 font-semibold'
                : 'bg-white/5 border-white/10 text-white/70 hover:border-white/20'
            }`}
          >
            4×6" Photo Card
          </button>
          <button
            onClick={() => setSheetFormat('a4')}
            className={`py-2 px-3 rounded-xl border text-xs text-center transition-all cursor-pointer font-medium ${
              sheetFormat === 'a4'
                ? 'bg-amber-500/20 border-amber-500 text-amber-400 font-semibold'
                : 'bg-white/5 border-white/10 text-white/70 hover:border-white/20'
            }`}
          >
            A4 Sheet (210×297)
          </button>
        </div>
      </div>

      {/* Tiling Grid */}
      <div className="space-y-2">
        <label className="text-[11px] font-medium text-white/60 uppercase tracking-wider block">
          Grid Copies
        </label>
        <div className="grid grid-cols-3 gap-2">
          {sheetFormat === '4x6' ? (
            <>
              <button
                onClick={() => setSheetGrid('2x2')}
                className={`py-2 px-2 rounded-xl border text-xs transition-all cursor-pointer font-medium ${
                  sheetGrid === '2x2' ? 'bg-amber-500 text-black font-semibold' : 'bg-white/5 border-white/10 text-white/70'
                }`}
              >
                2×2 (4)
              </button>
              <button
                onClick={() => setSheetGrid('2x3')}
                className={`py-2 px-2 rounded-xl border text-xs transition-all cursor-pointer font-medium ${
                  sheetGrid === '2x3' ? 'bg-amber-500 text-black font-semibold' : 'bg-white/5 border-white/10 text-white/70'
                }`}
              >
                2×3 (6)
              </button>
              <button
                onClick={() => setSheetGrid('2x4')}
                className={`py-2 px-2 rounded-xl border text-xs transition-all cursor-pointer font-medium ${
                  sheetGrid === '2x4' ? 'bg-amber-500 text-black font-semibold' : 'bg-white/5 border-white/10 text-white/70'
                }`}
              >
                2×4 (8)
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setSheetGrid('3x4')}
                className={`py-2 px-2 rounded-xl border text-xs transition-all cursor-pointer font-medium ${
                  sheetGrid === '3x4' ? 'bg-amber-500 text-black font-semibold' : 'bg-white/5 border-white/10 text-white/70'
                }`}
              >
                3×4 (12)
              </button>
              <button
                onClick={() => setSheetGrid('4x4')}
                className={`py-2 px-2 rounded-xl border text-xs transition-all cursor-pointer font-medium ${
                  sheetGrid === '4x4' ? 'bg-amber-500 text-black font-semibold' : 'bg-white/5 border-white/10 text-white/70'
                }`}
              >
                4×4 (16)
              </button>
              <button
                onClick={() => setSheetGrid('4x5')}
                className={`py-2 px-2 rounded-xl border text-xs transition-all cursor-pointer font-medium ${
                  sheetGrid === '4x5' ? 'bg-amber-500 text-black font-semibold' : 'bg-white/5 border-white/10 text-white/70'
                }`}
              >
                4×5 (20)
              </button>
            </>
          )}
        </div>
      </div>

      {/* Scissors Cut Lines */}
      <div className="flex items-center justify-between p-3 bg-white/5 border border-white/10 rounded-xl">
        <span className="text-xs text-white/80 font-medium">Dashed Scissors Cut Lines</span>
        <button
          onClick={() => setIncludeCropMarks(!includeCropMarks)}
          className={`w-9 h-5 rounded-full transition-colors relative cursor-pointer ${
            includeCropMarks ? 'bg-amber-500' : 'bg-white/20'
          }`}
        >
          <div
            className={`absolute top-0.5 w-4 h-4 bg-black rounded-full transition-transform ${
              includeCropMarks ? 'right-0.5' : 'left-0.5'
            }`}
          />
        </button>
      </div>

      {/* Toggle View on Canvas */}
      <button
        onClick={() => setIsSheetMode(!isSheetMode)}
        className={`w-full py-3 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
          isSheetMode
            ? 'bg-amber-500 text-black border-amber-500'
            : 'bg-white/10 border-white/20 text-white hover:bg-white/15'
        }`}
      >
        <Grid className="w-4 h-4" />
        <span>{isSheetMode ? 'Return to Single Photo Mode' : 'Preview Printable Sheet on Canvas'}</span>
      </button>

      {/* Direct PDF Export Button */}
      {sheetCanvas && (
        <button
          onClick={() => exportCanvasToPdf(sheetCanvas, `lumina_print_sheet_${sheetFormat}.pdf`, sheetFormat === '4x6')}
          className="w-full py-2.5 px-3 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md"
        >
          <FileText className="w-4 h-4" />
          <span>Export Direct Print-Ready PDF</span>
        </button>
      )}
    </div>
  );

  // 5. OFFICIAL TOOLS STUDIO
  const renderToolsStudio = () => (
    <div className="space-y-4">
      {/* Sub-navigation */}
      <div className="flex bg-white/5 p-1 rounded-xl border border-white/10 text-xs">
        <button
          onClick={() => setToolsSubTab('stamp')}
          className={`flex-1 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
            toolsSubTab === 'stamp' ? 'bg-amber-500 text-black font-semibold shadow-sm' : 'text-white/60 hover:text-white'
          }`}
        >
          DOP Stamp
        </button>
        <button
          onClick={() => setToolsSubTab('signature')}
          className={`flex-1 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
            toolsSubTab === 'signature' ? 'bg-amber-500 text-black font-semibold shadow-sm' : 'text-white/60 hover:text-white'
          }`}
        >
          Signature
        </button>
        <button
          onClick={() => setToolsSubTab('filters')}
          className={`flex-1 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
            toolsSubTab === 'filters' ? 'bg-amber-500 text-black font-semibold shadow-sm' : 'text-white/60 hover:text-white'
          }`}
        >
          Filters
        </button>
      </div>

      {toolsSubTab === 'stamp' && (
        <div className="p-3 bg-white/5 border border-white/10 rounded-xl space-y-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-400">
            <Calendar className="w-4 h-4" />
            <span>Date of Photo & Candidate Name Bar</span>
          </div>
          <p className="text-[11px] text-white/50 leading-relaxed">
            Generates the mandatory bottom white bar for civil service, admission tests, and exams.
          </p>

          <div className="space-y-1">
            <label className="text-[10px] font-medium text-white/60 uppercase">Candidate Name</label>
            <input
              type="text"
              value={candidateName}
              onChange={(e) => setCandidateName(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-white uppercase focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-medium text-white/60 uppercase">Date of Photo (DOP)</label>
            <input
              type="date"
              value={photoDate}
              onChange={(e) => setPhotoDate(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          <button
            onClick={() => onApplyNameDateStamp(candidateName, photoDate)}
            className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-semibold text-xs rounded-xl transition-colors cursor-pointer shadow-md"
          >
            Apply Name & Date Stamp
          </button>
        </div>
      )}

      {toolsSubTab === 'signature' && (
        <SignatureTool
          canvas={currentCanvas}
          onApplySignature={onApplySignatureData}
        />
      )}

      {toolsSubTab === 'filters' && (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            {FILTER_PRESETS.map((f) => (
              <button
                key={f.id}
                onClick={() => setFilterId(f.id)}
                className={`p-2.5 rounded-xl border text-xs font-medium text-left transition-all cursor-pointer ${
                  filterId === f.id
                    ? 'bg-amber-500/20 border-amber-500 text-amber-400 font-semibold'
                    : 'bg-white/5 border-white/10 text-white/70 hover:border-white/20'
                }`}
              >
                {f.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Batch Processing Option */}
      {onOpenBatchModal && (
        <div className="pt-3 border-t border-white/10">
          <button
            onClick={onOpenBatchModal}
            className="w-full py-2.5 px-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-medium text-white/80 hover:text-white flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <FolderArchive className="w-4 h-4 text-amber-400" />
            <span>Open Batch Photos ZIP Processor</span>
          </button>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* ================= DESKTOP SIDEBAR (lg+) ================= */}
      <aside className={`hidden lg:flex flex-col border-l border-white/10 bg-[#121212] select-none z-20 transition-all duration-200 shrink-0 ${
        isPanelCollapsed ? 'w-14' : 'w-84 xl:w-92'
      }`}>
        {/* Panel Header */}
        <div className="h-14 border-b border-white/10 px-4 flex items-center justify-between shrink-0 bg-[#141414]">
          {!isPanelCollapsed ? (
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-semibold text-white tracking-wide uppercase">
                Studio Controls
              </span>
            </div>
          ) : (
            <div className="mx-auto text-amber-400 font-bold text-xs">
              <SlidersHorizontal className="w-4 h-4" />
            </div>
          )}

          <button
            onClick={() => setIsPanelCollapsed(!isPanelCollapsed)}
            className="p-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            title={isPanelCollapsed ? 'Expand Studio Panel' : 'Collapse Studio Panel'}
          >
            {isPanelCollapsed ? <PanelRightOpen className="w-4 h-4" /> : <PanelRightClose className="w-4 h-4" />}
          </button>
        </div>

        {/* Collapsed View Rail */}
        {isPanelCollapsed ? (
          <div className="flex-1 py-4 flex flex-col items-center gap-2">
            {studioTabsConfig.map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  handleStudioChange(tab.id as MainStudioTab);
                  setIsPanelCollapsed(false);
                }}
                title={tab.label}
                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                  studioTab === tab.id
                    ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                {tab.icon}
              </button>
            ))}
          </div>
        ) : (
          <>
            {/* Studio Navigation Tabs */}
            <div className="px-3 pt-3 pb-2 border-b border-white/10 bg-[#141414] shrink-0">
              <div className="grid grid-cols-5 gap-1 bg-white/5 p-1 rounded-xl border border-white/10">
                {studioTabsConfig.map((tab) => {
                  const isActive = studioTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => handleStudioChange(tab.id as MainStudioTab)}
                      className={`py-2 rounded-lg flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                        isActive
                          ? 'bg-amber-500 text-black font-semibold shadow-sm'
                          : 'text-white/60 hover:text-white hover:bg-white/5'
                      }`}
                      title={tab.label}
                    >
                      {tab.icon}
                      <span className="text-[10px] leading-none truncate max-w-[50px]">
                        {tab.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 p-4 overflow-y-auto">
              {studioTab === 'passport' && renderPassportStudio()}
              {studioTab === 'adjust' && renderAdjustStudio()}
              {studioTab === 'retouch' && renderRetouchStudio()}
              {studioTab === 'sheet' && renderSheetStudio()}
              {studioTab === 'tools' && renderToolsStudio()}
            </div>
          </>
        )}
      </aside>

      {/* ================= MOBILE / TABLET DOCKED BAR & DRAWER (<lg) ================= */}
      <div className="lg:hidden flex flex-col select-none z-30">
        {/* Slide-Up Bottom Drawer */}
        {mobileHeight !== 'minimized' && (
          <div
            className={`bg-[#141414] border-t border-white/15 shadow-2xl transition-all duration-200 flex flex-col overflow-hidden ${
              mobileHeight === 'half' ? 'h-[48vh]' : 'h-[85vh]'
            }`}
          >
            {/* Drawer Header & Handle */}
            <div className="px-4 py-2.5 border-b border-white/10 flex items-center justify-between bg-[#181818] shrink-0">
              {/* Drag Handle & State Toggles */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setMobileHeight(mobileHeight === 'half' ? 'full' : 'half')}
                  className="p-1 rounded text-white/60 hover:text-white"
                  title="Toggle Drawer Height"
                >
                  {mobileHeight === 'half' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                <span className="text-xs font-semibold text-white uppercase tracking-wider">
                  {studioTabsConfig.find((t) => t.id === studioTab)?.label || 'Studio'}
                </span>
              </div>

              {/* Close / Minimize Drawer */}
              <button
                onClick={() => setMobileHeight('minimized')}
                className="p-1 rounded-lg text-white/60 hover:text-white hover:bg-white/10"
                title="Minimize Panel to View Photo"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Drawer Body */}
            <div className="p-4 overflow-y-auto flex-1">
              {studioTab === 'passport' && renderPassportStudio()}
              {studioTab === 'adjust' && renderAdjustStudio()}
              {studioTab === 'retouch' && renderRetouchStudio()}
              {studioTab === 'sheet' && renderSheetStudio()}
              {studioTab === 'tools' && renderToolsStudio()}
            </div>
          </div>
        )}

        {/* Bottom Persistent Studio Tab Bar */}
        <nav className="h-16 bg-[#0E0E0E] border-t border-white/10 flex items-center justify-around px-2 shrink-0">
          {studioTabsConfig.map((tab) => {
            const isActive = studioTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleStudioChange(tab.id as MainStudioTab)}
                className={`flex-1 py-1.5 flex flex-col items-center justify-center gap-1 transition-colors cursor-pointer ${
                  isActive ? 'text-amber-400 font-semibold' : 'text-white/50 hover:text-white'
                }`}
              >
                <div className={`p-1.5 rounded-xl ${isActive ? 'bg-amber-500/20' : ''}`}>
                  {tab.icon}
                </div>
                <span className="text-[10px] leading-none">{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </>
  );
};
