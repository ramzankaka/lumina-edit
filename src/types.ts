/**
 * Core type definitions for Lumina Edit Pro - Geometric Balance Theme
 */

export interface Adjustments {
  exposure: number; // -100 to 100
  contrast: number; // -100 to 100
  vibrance: number; // -100 to 100
  brightness: number; // -100 to 100
  saturation: number; // -100 to 100
  warmth: number; // -100 to 100
  tint: number; // -100 to 100
  sharpness: number; // 0 to 100
  blur: number; // 0 to 50
  vignette: number; // 0 to 100
  noise: number; // 0 to 100
}

export interface ToneCurves {
  channel: 'all' | 'red' | 'green' | 'blue';
  highlights: number; // -50 to 50
  lights: number; // -50 to 50
  darks: number; // -50 to 50
  shadows: number; // -50 to 50
}

export type HslColorChannel = 
  | 'red' 
  | 'orange' 
  | 'yellow' 
  | 'green' 
  | 'cyan' 
  | 'blue' 
  | 'purple' 
  | 'magenta';

export interface HslChannelValue {
  hue: number; // -50 to 50
  saturation: number; // -50 to 50
  luminance: number; // -50 to 50
}

export type HslTuner = Record<HslColorChannel, HslChannelValue>;

export type ToolMode = 
  | 'adjust'
  | 'curves'
  | 'crop'
  | 'validator'
  | 'sheet'
  | 'smart'
  | 'signature'
  | 'batch'
  | 'filters'
  | 'text'
  | 'histogram';

export interface PassportPreset {
  id: string;
  name: string;
  country: string;
  region: 'Americas' | 'Europe' | 'Asia & Middle East' | 'Oceania & Africa' | 'Universal / Exam';
  flag: string;
  widthMm: number;
  heightMm: number;
  aspectRatio: number;
  dpi: number;
  targetKbDefault: number;
  recommendedBg: string;
  faceCoveragePercent: string;
  description: string;
}

export interface AspectRatioPreset {
  id: string;
  label: string;
  ratio: number | null; // null for free
}

export interface CropRect {
  x: number; // normalized 0..1
  y: number; // normalized 0..1
  width: number; // normalized 0..1
  height: number; // normalized 0..1
}

export interface FilterPreset {
  id: string;
  name: string;
  category: string;
  adjustments: Partial<Adjustments>;
}

export interface TextLayer {
  id: string;
  text: string;
  x: number; // normalized 0..1
  y: number; // normalized 0..1
  fontSize: number; // px
  fontFamily: string;
  color: string;
  isBold: boolean;
  hasShadow: boolean;
  hasBackground: boolean;
}

export interface HistoryState {
  id: string;
  name: string;
  timestamp: number;
  adjustments: Adjustments;
  filterId: string;
  filterIntensity: number;
  rotation: number;
  flipH: boolean;
  flipV: boolean;
  cropRect?: CropRect;
  textLayers: TextLayer[];
}

export interface ExportOptions {
  format: 'image/jpeg' | 'image/png' | 'image/webp' | 'application/pdf';
  strictTargetKb: boolean;
  targetKb: number;
  customKb: number;
  manualQuality: number; // 10..100
  scale: number; // 0.5, 0.75, 1, 2
  filename: string;
  isPrintableSheet: boolean;
  sheetGrid: '2x2' | '2x3' | '2x4' | '3x4' | '4x4' | '4x5';
  sheetFormat: '4x6' | 'a4';
  includeCropMarks: boolean;
  marginMm: number;
}

export interface IcaoValidationResult {
  faceCoverageRatio: number; // e.g. 0.75 (75%)
  faceCoveragePass: boolean;
  eyeLevelRatio: number; // e.g. 0.62 (62%)
  eyeLevelPass: boolean;
  backgroundUniformity: number; // 0..100
  backgroundPass: boolean;
  resolutionCheck: { width: number; height: number; pass: boolean };
  overallPass: boolean;
  feedback: string[];
}

export interface SignatureSettings {
  threshold: number; // 0..255
  invert: boolean; // Black on White vs White on Black
  transparentBackground: boolean;
  smoothing: number; // 0..5
}
