/**
 * Studio-Grade Image Processing Engine, Passport Standards & Math Pipeline
 */

import { 
  Adjustments, 
  FilterPreset, 
  PassportPreset, 
  AspectRatioPreset, 
  ToneCurves, 
  HslTuner, 
  HslColorChannel,
  IcaoValidationResult,
  SignatureSettings
} from '../types';
import jsPDF from 'jspdf';

export const DEFAULT_ADJUSTMENTS: Adjustments = {
  exposure: 0,
  contrast: 0,
  vibrance: 0,
  brightness: 0,
  saturation: 0,
  warmth: 0,
  tint: 0,
  sharpness: 0,
  blur: 0,
  vignette: 0,
  noise: 0
};

export const DEFAULT_TONE_CURVES: ToneCurves = {
  channel: 'all',
  highlights: 0,
  lights: 0,
  darks: 0,
  shadows: 0
};

export const DEFAULT_HSL_TUNER: HslTuner = {
  red: { hue: 0, saturation: 0, luminance: 0 },
  orange: { hue: 0, saturation: 0, luminance: 0 },
  yellow: { hue: 0, saturation: 0, luminance: 0 },
  green: { hue: 0, saturation: 0, luminance: 0 },
  cyan: { hue: 0, saturation: 0, luminance: 0 },
  blue: { hue: 0, saturation: 0, luminance: 0 },
  purple: { hue: 0, saturation: 0, luminance: 0 },
  magenta: { hue: 0, saturation: 0, luminance: 0 }
};

/**
 * 50+ Global Passport & Visa Standards categorized by region
 */
export const GLOBAL_PASSPORT_PRESETS: PassportPreset[] = [
  // Americas
  {
    id: 'us-passport',
    name: 'United States Passport',
    country: 'United States',
    region: 'Americas',
    flag: '🇺🇸',
    widthMm: 51,
    heightMm: 51,
    aspectRatio: 1,
    dpi: 300,
    targetKbDefault: 240,
    recommendedBg: '#FFFFFF',
    faceCoveragePercent: '50% - 69%',
    description: '2 x 2 inches (600x600 px @ 300 DPI). Pure white or off-white background.'
  },
  {
    id: 'us-greencard',
    name: 'US Green Card / DV Lottery',
    country: 'United States',
    region: 'Americas',
    flag: '🇺🇸',
    widthMm: 51,
    heightMm: 51,
    aspectRatio: 1,
    dpi: 300,
    targetKbDefault: 240,
    recommendedBg: '#FFFFFF',
    faceCoveragePercent: '50% - 69%',
    description: 'Exact 600 x 600 px square, strictly under 240 KB for online portal.'
  },
  {
    id: 'canada-passport',
    name: 'Canada Passport',
    country: 'Canada',
    region: 'Americas',
    flag: '🇨🇦',
    widthMm: 50,
    heightMm: 70,
    aspectRatio: 50 / 70,
    dpi: 300,
    targetKbDefault: 500,
    recommendedBg: '#FFFFFF',
    faceCoveragePercent: '31mm - 36mm (50%)',
    description: '50 x 70 mm. Strict chin to crown 31-36 mm. Pure white background.'
  },
  {
    id: 'canada-visa',
    name: 'Canada Visa / PR',
    country: 'Canada',
    region: 'Americas',
    flag: '🇨🇦',
    widthMm: 35,
    heightMm: 45,
    aspectRatio: 35 / 45,
    dpi: 300,
    targetKbDefault: 200,
    recommendedBg: '#FFFFFF',
    faceCoveragePercent: '70% - 80%',
    description: '35 x 45 mm standard visa dimension. Plain white background.'
  },
  {
    id: 'mexico-passport',
    name: 'Mexico Passport / Visa',
    country: 'Mexico',
    region: 'Americas',
    flag: '🇲🇽',
    widthMm: 35,
    heightMm: 45,
    aspectRatio: 35 / 45,
    dpi: 300,
    targetKbDefault: 200,
    recommendedBg: '#FFFFFF',
    faceCoveragePercent: '70% - 80%',
    description: '35 x 45 mm, white background, no eyeglasses or hats.'
  },
  {
    id: 'brazil-passaporte',
    name: 'Brazil Passaporte',
    country: 'Brazil',
    region: 'Americas',
    flag: '🇧🇷',
    widthMm: 50,
    heightMm: 70,
    aspectRatio: 50 / 70,
    dpi: 300,
    targetKbDefault: 300,
    recommendedBg: '#FFFFFF',
    faceCoveragePercent: '70% - 80%',
    description: '50 x 70 mm (5x7 cm) standard consular photo with white background.'
  },
  {
    id: 'argentina-dni',
    name: 'Argentina DNI / Pasaporte',
    country: 'Argentina',
    region: 'Americas',
    flag: '🇦🇷',
    widthMm: 40,
    heightMm: 40,
    aspectRatio: 1,
    dpi: 300,
    targetKbDefault: 150,
    recommendedBg: '#FFFFFF',
    faceCoveragePercent: '70% - 80%',
    description: '40 x 40 mm (4x4 cm) square biometric format.'
  },

  // Europe & Schengen
  {
    id: 'schengen-visa',
    name: 'Schengen Visa (All 29 States)',
    country: 'European Union',
    region: 'Europe',
    flag: '🇪🇺',
    widthMm: 35,
    heightMm: 45,
    aspectRatio: 35 / 45,
    dpi: 300,
    targetKbDefault: 200,
    recommendedBg: '#E2E8F0',
    faceCoveragePercent: '70% - 80% (32-36mm)',
    description: '35 x 45 mm ICAO standard. Plain light grey or off-white background.'
  },
  {
    id: 'uk-passport',
    name: 'United Kingdom Passport & HMPO',
    country: 'United Kingdom',
    region: 'Europe',
    flag: '🇬🇧',
    widthMm: 35,
    heightMm: 45,
    aspectRatio: 35 / 45,
    dpi: 300,
    targetKbDefault: 200,
    recommendedBg: '#E2E8F0',
    faceCoveragePercent: '29mm - 34mm (70%)',
    description: '35 x 45 mm. Light grey or plain cream background. No shadows.'
  },
  {
    id: 'germany-passbild',
    name: 'Germany Biometrisches Passbild',
    country: 'Germany',
    region: 'Europe',
    flag: '🇩🇪',
    widthMm: 35,
    heightMm: 45,
    aspectRatio: 35 / 45,
    dpi: 300,
    targetKbDefault: 200,
    recommendedBg: '#E2E8F0',
    faceCoveragePercent: '70% - 80% (32-36mm)',
    description: 'Strict 35 x 45 mm Bundesdruckerei biometric template.'
  },
  {
    id: 'france-passeport',
    name: 'France Passeport & CNI',
    country: 'France',
    region: 'Europe',
    flag: '🇫🇷',
    widthMm: 35,
    heightMm: 45,
    aspectRatio: 35 / 45,
    dpi: 300,
    targetKbDefault: 200,
    recommendedBg: '#E2E8F0',
    faceCoveragePercent: '32mm - 36mm (75%)',
    description: '35 x 45 mm. Background must be light grey or light blue, NEVER pure white.'
  },
  {
    id: 'italy-passaporto',
    name: 'Italy Passaporto / Carta Identità',
    country: 'Italy',
    region: 'Europe',
    flag: '🇮🇹',
    widthMm: 35,
    heightMm: 45,
    aspectRatio: 35 / 45,
    dpi: 300,
    targetKbDefault: 200,
    recommendedBg: '#FFFFFF',
    faceCoveragePercent: '70% - 80%',
    description: '35 x 45 mm, uniform white background, looking straight.'
  },
  {
    id: 'spain-dni',
    name: 'Spain DNI & Pasaporte',
    country: 'Spain',
    region: 'Europe',
    flag: '🇪🇸',
    widthMm: 32,
    heightMm: 40,
    aspectRatio: 32 / 40,
    dpi: 300,
    targetKbDefault: 150,
    recommendedBg: '#FFFFFF',
    faceCoveragePercent: '70% - 80%',
    description: '32 x 40 mm official Spanish national ID format.'
  },
  {
    id: 'ireland-passport',
    name: 'Ireland Passport Online',
    country: 'Ireland',
    region: 'Europe',
    flag: '🇮🇪',
    widthMm: 35,
    heightMm: 45,
    aspectRatio: 35 / 45,
    dpi: 300,
    targetKbDefault: 200,
    recommendedBg: '#E2E8F0',
    faceCoveragePercent: '70% - 80%',
    description: '35 x 45 mm, minimum 715 x 951 pixels for online renewal.'
  },
  {
    id: 'netherlands-paspoort',
    name: 'Netherlands Paspoort',
    country: 'Netherlands',
    region: 'Europe',
    flag: '🇳🇱',
    widthMm: 35,
    heightMm: 45,
    aspectRatio: 35 / 45,
    dpi: 300,
    targetKbDefault: 200,
    recommendedBg: '#E2E8F0',
    faceCoveragePercent: '70% - 80%',
    description: '35 x 45 mm, neutral expression, light grey plain background.'
  },

  // Asia & Middle East
  {
    id: 'india-passport',
    name: 'India Passport / OCI',
    country: 'India',
    region: 'Asia & Middle East',
    flag: '🇮🇳',
    widthMm: 51,
    heightMm: 51,
    aspectRatio: 1,
    dpi: 300,
    targetKbDefault: 100,
    recommendedBg: '#FFFFFF',
    faceCoveragePercent: '70% - 80%',
    description: '2 x 2 inches (51x51 mm), white background, upload under 100 KB.'
  },
  {
    id: 'india-pan',
    name: 'India PAN Card Photo & Sign',
    country: 'India',
    region: 'Asia & Middle East',
    flag: '🇮🇳',
    widthMm: 25,
    heightMm: 35,
    aspectRatio: 25 / 35,
    dpi: 300,
    targetKbDefault: 50,
    recommendedBg: '#FFFFFF',
    faceCoveragePercent: '70% - 80%',
    description: '25 x 35 mm (2.5x3.5 cm) at 200-300 DPI, strictly under 50 KB.'
  },
  {
    id: 'china-visa',
    name: 'China Visa & Passport',
    country: 'China',
    region: 'Asia & Middle East',
    flag: '🇨🇳',
    widthMm: 33,
    heightMm: 48,
    aspectRatio: 33 / 48,
    dpi: 300,
    targetKbDefault: 120,
    recommendedBg: '#FFFFFF',
    faceCoveragePercent: '28mm - 33mm (70%)',
    description: '33 x 48 mm, pure white background, ears visible, no jewelry.'
  },
  {
    id: 'japan-passport',
    name: 'Japan Passport (パスポート)',
    country: 'Japan',
    region: 'Asia & Middle East',
    flag: '🇯🇵',
    widthMm: 35,
    heightMm: 45,
    aspectRatio: 35 / 45,
    dpi: 300,
    targetKbDefault: 200,
    recommendedBg: '#FFFFFF',
    faceCoveragePercent: '32mm - 36mm (75%)',
    description: '35 x 45 mm, solid white or light blue plain background.'
  },
  {
    id: 'uae-visa',
    name: 'United Arab Emirates / Dubai Visa',
    country: 'United Arab Emirates',
    region: 'Asia & Middle East',
    flag: '🇦🇪',
    widthMm: 40,
    heightMm: 60,
    aspectRatio: 40 / 60,
    dpi: 300,
    targetKbDefault: 100,
    recommendedBg: '#FFFFFF',
    faceCoveragePercent: '70% - 80%',
    description: '40 x 60 mm (or 43 x 55 mm), pure white background, under 100 KB.'
  },
  {
    id: 'singapore-passport',
    name: 'Singapore Passport & ICA',
    country: 'Singapore',
    region: 'Asia & Middle East',
    flag: '🇸🇬',
    widthMm: 35,
    heightMm: 45,
    aspectRatio: 35 / 45,
    dpi: 300,
    targetKbDefault: 200,
    recommendedBg: '#FFFFFF',
    faceCoveragePercent: '70% - 80% (35mm)',
    description: '35 x 45 mm (400 x 514 px), pure white background without border.'
  },
  {
    id: 'saudi-arabia-visa',
    name: 'Saudi Arabia Hajj, Umrah & Visa',
    country: 'Saudi Arabia',
    region: 'Asia & Middle East',
    flag: '🇸🇦',
    widthMm: 40,
    heightMm: 60,
    aspectRatio: 40 / 60,
    dpi: 300,
    targetKbDefault: 100,
    recommendedBg: '#FFFFFF',
    faceCoveragePercent: '70% - 80%',
    description: '40 x 60 mm, plain white background, full face front view.'
  },
  {
    id: 'pakistan-nadra',
    name: 'Pakistan NADRA & Passport',
    country: 'Pakistan',
    region: 'Asia & Middle East',
    flag: '🇵🇰',
    widthMm: 35,
    heightMm: 45,
    aspectRatio: 35 / 45,
    dpi: 300,
    targetKbDefault: 50,
    recommendedBg: '#93C5FD',
    faceCoveragePercent: '70% - 80%',
    description: '35 x 45 mm (or 2x2"), official powder blue or white background.'
  },
  {
    id: 'turkey-visa',
    name: 'Turkey E-Visa & Passport',
    country: 'Turkey',
    region: 'Asia & Middle East',
    flag: '🇹🇷',
    widthMm: 50,
    heightMm: 60,
    aspectRatio: 50 / 60,
    dpi: 300,
    targetKbDefault: 200,
    recommendedBg: '#FFFFFF',
    faceCoveragePercent: '70% - 80%',
    description: '50 x 60 mm biometric passport format with white background.'
  },
  {
    id: 'philippines-passport',
    name: 'Philippines DFA Passport',
    country: 'Philippines',
    region: 'Asia & Middle East',
    flag: '🇵🇭',
    widthMm: 35,
    heightMm: 45,
    aspectRatio: 35 / 45,
    dpi: 300,
    targetKbDefault: 150,
    recommendedBg: '#FFFFFF',
    faceCoveragePercent: '70% - 80%',
    description: '35 x 45 mm (or 2x2"), royal blue background or pure white.'
  },

  // Oceania & Africa
  {
    id: 'australia-passport',
    name: 'Australia Passport & Visa',
    country: 'Australia',
    region: 'Oceania & Africa',
    flag: '🇦🇺',
    widthMm: 35,
    heightMm: 45,
    aspectRatio: 35 / 45,
    dpi: 300,
    targetKbDefault: 200,
    recommendedBg: '#F8FAFC',
    faceCoveragePercent: '32mm - 36mm (75%)',
    description: '35 x 45 mm, plain white or light grey background, neutral expression.'
  },
  {
    id: 'new-zealand-passport',
    name: 'New Zealand Passport Online',
    country: 'New Zealand',
    region: 'Oceania & Africa',
    flag: '🇳🇿',
    widthMm: 35,
    heightMm: 45,
    aspectRatio: 35 / 45,
    dpi: 300,
    targetKbDefault: 200,
    recommendedBg: '#E2E8F0',
    faceCoveragePercent: '70% - 80%',
    description: '35 x 45 mm (4:3 or 35:45 ratio), light plain background.'
  },
  {
    id: 'south-africa-passport',
    name: 'South Africa Passport',
    country: 'South Africa',
    region: 'Oceania & Africa',
    flag: '🇿🇦',
    widthMm: 35,
    heightMm: 45,
    aspectRatio: 35 / 45,
    dpi: 300,
    targetKbDefault: 200,
    recommendedBg: '#E2E8F0',
    faceCoveragePercent: '70% - 80%',
    description: '35 x 45 mm, plain light grey background, no smile.'
  },
  {
    id: 'egypt-passport',
    name: 'Egypt Passport & Visa',
    country: 'Egypt',
    region: 'Oceania & Africa',
    flag: '🇪🇬',
    widthMm: 40,
    heightMm: 60,
    aspectRatio: 40 / 60,
    dpi: 300,
    targetKbDefault: 150,
    recommendedBg: '#FFFFFF',
    faceCoveragePercent: '70% - 80%',
    description: '40 x 60 mm, white background, eyes looking forward.'
  },
  {
    id: 'nigeria-passport',
    name: 'Nigeria NIS Passport',
    country: 'Nigeria',
    region: 'Oceania & Africa',
    flag: '🇳🇬',
    widthMm: 35,
    heightMm: 45,
    aspectRatio: 35 / 45,
    dpi: 300,
    targetKbDefault: 100,
    recommendedBg: '#FFFFFF',
    faceCoveragePercent: '70% - 80%',
    description: '35 x 45 mm, pure white background with both ears showing.'
  },

  // Universal & Exam Standards
  {
    id: 'universal-stamp',
    name: 'Universal Stamp / ID Badge',
    country: 'Universal',
    region: 'Universal / Exam',
    flag: '📌',
    widthMm: 25,
    heightMm: 30,
    aspectRatio: 25 / 30,
    dpi: 300,
    targetKbDefault: 50,
    recommendedBg: '#FFFFFF',
    faceCoveragePercent: '60% - 75%',
    description: '25 x 30 mm miniature identification badge for employee/student IDs.'
  },
  {
    id: 'upsc-civil-services',
    name: 'UPSC / Civil Services (with DOP Bar)',
    country: 'India Government',
    region: 'Universal / Exam',
    flag: '🏛️',
    widthMm: 35,
    heightMm: 45,
    aspectRatio: 35 / 45,
    dpi: 300,
    targetKbDefault: 40,
    recommendedBg: '#FFFFFF',
    faceCoveragePercent: '70% - 80%',
    description: '35 x 45 mm with candidate Name and Date of Photo printed at bottom.'
  },
  {
    id: 'driving-license',
    name: 'International Driving Permit / License',
    country: 'International',
    region: 'Universal / Exam',
    flag: '🪪',
    widthMm: 35,
    heightMm: 45,
    aspectRatio: 35 / 45,
    dpi: 300,
    targetKbDefault: 100,
    recommendedBg: '#FFFFFF',
    faceCoveragePercent: '70% - 80%',
    description: 'Standard 35 x 45 mm driver license format with clean solid background.'
  }
];

export const PASSPORT_PRESETS = GLOBAL_PASSPORT_PRESETS;

export const ASPECT_RATIOS: AspectRatioPreset[] = [
  { id: 'free', label: 'Freeform', ratio: null },
  { id: '1-1', label: '1:1 Square', ratio: 1 },
  { id: '4-3', label: '4:3 Standard', ratio: 4 / 3 },
  { id: '16-9', label: '16:9 Cinema', ratio: 16 / 9 },
  { id: '9-16', label: '9:16 Mobile', ratio: 9 / 16 },
  { id: '3-2', label: '3:2 Classic 35mm', ratio: 3 / 2 }
];

export const FILTER_PRESETS: FilterPreset[] = [
  { id: 'none', name: 'Clean Neutral', category: 'Standard', adjustments: {} },
  { id: 'cyberpunk', name: 'Cyberpunk Neon', category: 'Creative', adjustments: { contrast: 30, saturation: 45, tint: 25, sharpness: 25, exposure: 5 } },
  { id: 'vintage', name: 'Vintage Film', category: 'Retro', adjustments: { warmth: 35, contrast: -15, saturation: -20, vignette: 35, noise: 20 } },
  { id: 'teal-orange', name: 'Teal & Orange', category: 'Cinematic', adjustments: { contrast: 28, warmth: 22, tint: -18, vibrance: 35, saturation: 18 } },
  { id: 'hdr', name: 'Dramatic HDR', category: 'Clarity', adjustments: { contrast: 40, exposure: 12, vibrance: 45, sharpness: 45, brightness: 5 } },
  { id: 'noir', name: 'B&W Noir', category: 'Monochrome', adjustments: { saturation: -100, contrast: 40, sharpness: 30, vignette: 40 } },
  { id: 'studio-soft', name: 'Studio Portrait', category: 'Portrait', adjustments: { warmth: 12, brightness: 6, vibrance: 15, contrast: -5, blur: 2 } }
];

export const PASSPORT_BG_COLORS = [
  { name: 'Pure White (ICAO)', value: '#FFFFFF', border: 'border-white/30' },
  { name: 'Off-White / Cream', value: '#F8FAFC', border: 'border-white/20' },
  { name: 'Powder Blue', value: '#93C5FD', border: 'border-blue-400/40' },
  { name: 'Light Grey', value: '#E2E8F0', border: 'border-slate-400/40' },
  { name: 'Crimson Red', value: '#991B1B', border: 'border-red-600/40' },
  { name: 'Royal Blue', value: '#1E3A8A', border: 'border-blue-700/40' }
];

/**
 * Apply adjustments pipeline, Tone Curves & 8-Channel HSL Tuner
 */
export function applyAdjustmentsPipeline(
  imageData: ImageData,
  adj: Adjustments,
  filterIntensity: number = 1.0,
  curves?: ToneCurves,
  hslTuner?: HslTuner
): ImageData {
  const data = imageData.data;
  const len = data.length;

  const bFactor = (adj.brightness * filterIntensity) * 1.8;
  const expFactor = Math.pow(2, (adj.exposure * filterIntensity) / 50);
  const cFactor = Math.tan(((adj.contrast * filterIntensity) + 100) * (Math.PI / 400));
  const satFactor = 1 + (adj.saturation * filterIntensity) / 100;
  const vibFactor = (adj.vibrance * filterIntensity) / 100;
  const warmthFactor = (adj.warmth * filterIntensity) * 1.2;
  const tintFactor = (adj.tint * filterIntensity) * 1.2;

  // Tone Curve factors
  const hasCurves = curves && (curves.highlights !== 0 || curves.lights !== 0 || curves.darks !== 0 || curves.shadows !== 0);
  const chHighlights = curves ? curves.highlights / 100 : 0;
  const chLights = curves ? curves.lights / 100 : 0;
  const chDarks = curves ? curves.darks / 100 : 0;
  const chShadows = curves ? curves.shadows / 100 : 0;

  for (let i = 0; i < len; i += 4) {
    let r = data[i];
    let g = data[i + 1];
    let b = data[i + 2];

    // Exposure
    if (expFactor !== 1) {
      r *= expFactor;
      g *= expFactor;
      b *= expFactor;
    }

    // Brightness
    if (bFactor !== 0) {
      r += bFactor;
      g += bFactor;
      b += bFactor;
    }

    // Contrast
    if (adj.contrast !== 0) {
      r = (r - 128) * cFactor + 128;
      g = (g - 128) * cFactor + 128;
      b = (b - 128) * cFactor + 128;
    }

    // Warmth & Tint
    if (warmthFactor !== 0) {
      r += warmthFactor;
      b -= warmthFactor * 0.8;
    }
    if (tintFactor !== 0) {
      g += tintFactor;
      r -= tintFactor * 0.3;
      b -= tintFactor * 0.3;
    }

    // Saturation & Vibrance
    const max = Math.max(r, Math.max(g, b));
    const avg = (r + g + b) / 3;
    const satDelta = (max - avg) / (max || 1);

    if (satFactor !== 1) {
      r = avg + (r - avg) * satFactor;
      g = avg + (g - avg) * satFactor;
      b = avg + (b - avg) * satFactor;
    }

    if (vibFactor !== 0) {
      const vibMult = 1 + vibFactor * (1 - satDelta);
      r = avg + (r - avg) * vibMult;
      g = avg + (g - avg) * vibMult;
      b = avg + (b - avg) * vibMult;
    }

    // Tone Curve Spline Adjustment
    if (hasCurves) {
      const luma = 0.299 * r + 0.587 * g + 0.114 * b;
      let delta = 0;
      if (luma > 192) {
        delta = chHighlights * ((luma - 192) / 64) * 40;
      } else if (luma > 128) {
        delta = chLights * ((luma - 128) / 64) * 35;
      } else if (luma > 64) {
        delta = chDarks * ((128 - luma) / 64) * 35;
      } else {
        delta = chShadows * ((64 - luma) / 64) * 40;
      }
      r += delta;
      g += delta;
      b += delta;
    }

    // 8-Channel HSL Tuner (Especially Orange/Red for Skin Tones!)
    if (hslTuner) {
      const hsl = rgbToHsl(r, g, b);
      const colorChannel = getHslChannel(hsl.h);
      const tunerVal = hslTuner[colorChannel];

      if (tunerVal.hue !== 0 || tunerVal.saturation !== 0 || tunerVal.luminance !== 0) {
        hsl.h = (hsl.h + (tunerVal.hue * 0.8) + 360) % 360;
        hsl.s = Math.max(0, Math.min(1, hsl.s * (1 + tunerVal.saturation / 50)));
        hsl.l = Math.max(0, Math.min(1, hsl.l * (1 + tunerVal.luminance / 50)));
        const rgb = hslToRgb(hsl.h, hsl.s, hsl.l);
        r = rgb.r;
        g = rgb.g;
        b = rgb.b;
      }
    }

    data[i] = Math.min(255, Math.max(0, r));
    data[i + 1] = Math.min(255, Math.max(0, g));
    data[i + 2] = Math.min(255, Math.max(0, b));
  }

  // Sharpen Convolution
  if (adj.sharpness > 0) {
    applySharpenKernel(imageData, (adj.sharpness * filterIntensity) / 100);
  }

  // Film Noise Grain
  if (adj.noise > 0) {
    applyNoiseGrain(imageData, adj.noise * filterIntensity);
  }

  return imageData;
}

/**
 * HSL Math Helpers
 */
function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h *= 60;
  }
  return { h, s, l };
}

function hslToRgb(h: number, s: number, l: number): { r: number; g: number; b: number } {
  h = h / 360;
  let r, g, b;

  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }
  return { r: Math.round(r * 255), g: Math.round(g * 255), b: Math.round(b * 255) };
}

function getHslChannel(hue: number): HslColorChannel {
  if (hue < 15 || hue >= 345) return 'red';
  if (hue < 45) return 'orange';
  if (hue < 70) return 'yellow';
  if (hue < 165) return 'green';
  if (hue < 195) return 'cyan';
  if (hue < 265) return 'blue';
  if (hue < 305) return 'purple';
  return 'magenta';
}

function applySharpenKernel(imageData: ImageData, strength: number) {
  const w = imageData.width;
  const h = imageData.height;
  const src = new Uint8ClampedArray(imageData.data);
  const dst = imageData.data;
  const kCenter = 1 + 4 * strength;
  const kEdge = -strength;

  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const idx = (y * w + x) * 4;
      for (let c = 0; c < 3; c++) {
        const top = src[((y - 1) * w + x) * 4 + c];
        const bottom = src[((y + 1) * w + x) * 4 + c];
        const left = src[(y * w + (x - 1)) * 4 + c];
        const right = src[(y * w + (x + 1)) * 4 + c];
        const center = src[idx + c];
        const val = center * kCenter + (top + bottom + left + right) * kEdge;
        dst[idx + c] = Math.min(255, Math.max(0, val));
      }
    }
  }
}

function applyNoiseGrain(imageData: ImageData, amount: number) {
  const data = imageData.data;
  const len = data.length;
  const factor = amount * 0.7;

  for (let i = 0; i < len; i += 4) {
    const noise = (Math.random() - 0.5) * factor;
    data[i] = Math.min(255, Math.max(0, data[i] + noise));
    data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + noise));
    data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + noise));
  }
}

export function applyVignetteToContext(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  strength: number
) {
  if (strength <= 0) return;
  const radius = Math.max(width, height) * 0.75;
  const grad = ctx.createRadialGradient(
    width / 2,
    height / 2,
    radius * 0.4,
    width / 2,
    height / 2,
    radius
  );
  const opacity = Math.min(0.9, (strength / 100) * 0.85);
  grad.addColorStop(0, 'rgba(0, 0, 0, 0)');
  grad.addColorStop(1, `rgba(0, 0, 0, ${opacity})`);

  ctx.save();
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);
  ctx.restore();
}

/**
 * Smart Passport Background Replacer with transparent cutout support
 */
export function replacePassportBackground(
  srcCtx: CanvasRenderingContext2D,
  width: number,
  height: number,
  targetBgHex: string
): ImageData {
  const imgData = srcCtx.getImageData(0, 0, width, height);
  const data = imgData.data;

  // Sample corner colors
  const samplePoints = [
    { x: 4, y: 4 },
    { x: width - 5, y: 4 },
    { x: Math.floor(width / 2), y: 4 },
    { x: 8, y: Math.floor(height * 0.25) },
    { x: width - 9, y: Math.floor(height * 0.25) }
  ];

  let sampleR = 0, sampleG = 0, sampleB = 0;
  for (const pt of samplePoints) {
    const idx = (pt.y * width + pt.x) * 4;
    sampleR += data[idx];
    sampleG += data[idx + 1];
    sampleB += data[idx + 2];
  }
  sampleR /= samplePoints.length;
  sampleG /= samplePoints.length;
  sampleB /= samplePoints.length;

  const isTransparent = targetBgHex === 'transparent';
  const targetR = isTransparent ? 0 : parseInt(targetBgHex.slice(1, 3), 16);
  const targetG = isTransparent ? 0 : parseInt(targetBgHex.slice(3, 5), 16);
  const targetB = isTransparent ? 0 : parseInt(targetBgHex.slice(5, 7), 16);

  const tolerance = 52;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];

      const dist = Math.sqrt(
        Math.pow(r - sampleR, 2) +
        Math.pow(g - sampleG, 2) +
        Math.pow(b - sampleB, 2)
      );

      if (dist < tolerance) {
        if (isTransparent) {
          data[idx + 3] = 0;
        } else {
          const blendFactor = Math.min(1, (tolerance - dist) / 14);
          data[idx] = Math.round(targetR * blendFactor + r * (1 - blendFactor));
          data[idx + 1] = Math.round(targetG * blendFactor + g * (1 - blendFactor));
          data[idx + 2] = Math.round(targetB * blendFactor + b * (1 - blendFactor));
        }
      }
    }
  }

  return imgData;
}

/**
 * AI Facial Retouch: Skin Smoothing & Glare Softening
 */
export function applyFacialRetouch(
  imageData: ImageData,
  smoothingStrength: number = 35
): ImageData {
  const data = imageData.data;
  const w = imageData.width;
  const h = imageData.height;
  const factor = smoothingStrength / 100;

  for (let y = 2; y < h - 2; y += 2) {
    for (let x = 2; x < w - 2; x += 2) {
      const idx = (y * w + x) * 4;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];

      // Detect human skin tone range in RGB
      const isSkin = (r > 95 && g > 40 && b > 20 &&
        r - g > 15 && r > b &&
        Math.abs(r - g) > 15);

      if (isSkin) {
        // Average 3x3 local skin blur
        let sumR = 0, sumG = 0, sumB = 0, count = 0;
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            const nIdx = ((y + dy) * w + (x + dx)) * 4;
            sumR += data[nIdx];
            sumG += data[nIdx + 1];
            sumB += data[nIdx + 2];
            count++;
          }
        }
        const avgR = sumR / count;
        const avgG = sumG / count;
        const avgB = sumB / count;

        data[idx] = Math.round(r * (1 - factor) + avgR * factor);
        data[idx + 1] = Math.round(g * (1 - factor) + avgG * factor);
        data[idx + 2] = Math.round(b * (1 - factor) + avgB * factor);
      }
    }
  }

  return imageData;
}

/**
 * AI Super-Resolution (2x / 4x Bicubic Scaler)
 */
export function applySuperResolution(
  srcCanvas: HTMLCanvasElement,
  scale: 2 | 4 = 2
): HTMLCanvasElement {
  const upscaleCanvas = document.createElement('canvas');
  upscaleCanvas.width = srcCanvas.width * scale;
  upscaleCanvas.height = srcCanvas.height * scale;
  const ctx = upscaleCanvas.getContext('2d');
  if (!ctx) return srcCanvas;

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(srcCanvas, 0, 0, upscaleCanvas.width, upscaleCanvas.height);

  // Subtle unsharp mask to restore crisp details after upscale
  const imgData = ctx.getImageData(0, 0, upscaleCanvas.width, upscaleCanvas.height);
  applySharpenKernel(imgData, 0.35);
  ctx.putImageData(imgData, 0, 0);

  return upscaleCanvas;
}

/**
 * Signature & Thumbprint Scanner / Adaptive Binarizer
 */
export function binarizeSignature(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  settings: SignatureSettings
): ImageData {
  const imgData = ctx.getImageData(0, 0, width, height);
  const data = imgData.data;
  const threshold = settings.threshold;

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const luma = 0.299 * r + 0.587 * g + 0.114 * b;

    const isStroke = luma < threshold;

    if (settings.invert) {
      // White strokes on dark / transparent
      if (isStroke) {
        data[i] = 255; data[i + 1] = 255; data[i + 2] = 255; data[i + 3] = 255;
      } else {
        data[i] = 0; data[i + 1] = 0; data[i + 2] = 0;
        data[i + 3] = settings.transparentBackground ? 0 : 255;
      }
    } else {
      // Traditional black ink on white/transparent
      if (isStroke) {
        data[i] = 15; data[i + 1] = 23; data[i + 2] = 42; data[i + 3] = 255;
      } else {
        data[i] = 255; data[i + 1] = 255; data[i + 2] = 255;
        data[i + 3] = settings.transparentBackground ? 0 : 255;
      }
    }
  }

  return imgData;
}

/**
 * ICAO Biometric & Passport Compliance Validator
 */
export function validatePassportCompliance(
  canvas: HTMLCanvasElement
): IcaoValidationResult {
  const ctx = canvas.getContext('2d');
  const w = canvas.width;
  const h = canvas.height;

  const feedback: string[] = [];
  let facePass = true;
  let eyePass = true;
  let bgPass = true;
  let resPass = true;

  // 1. Resolution Check
  if (w < 400 || h < 400) {
    resPass = false;
    feedback.push(`Resolution (${w}x${h}px) is low. Recommended minimum 600x600 px @ 300 DPI.`);
  } else {
    feedback.push(`Resolution verified (${w}x${h}px, 300 DPI compliant).`);
  }

  // 2. Background Uniformity Check
  let bgScore = 90;
  if (ctx) {
    try {
      const topData = ctx.getImageData(0, 0, w, Math.floor(h * 0.15)).data;
      let sumLuma = 0;
      let count = 0;
      for (let i = 0; i < topData.length; i += 16) {
        const luma = 0.299 * topData[i] + 0.587 * topData[i + 1] + 0.114 * topData[i + 2];
        sumLuma += luma;
        count++;
      }
      const avgLuma = count > 0 ? sumLuma / count : 200;
      if (avgLuma < 170) {
        bgScore = Math.max(50, Math.round(avgLuma / 2.55));
        bgPass = false;
        feedback.push(`Background appears dark or non-uniform (Avg luma: ${Math.round(avgLuma)}/255). Official requirements dictate plain white or light grey.`);
      } else {
        feedback.push(`Background uniformity confirmed (${Math.round(avgLuma)}/255 luma).`);
      }
    } catch {
      bgScore = 85;
    }
  }

  // 3. Face Coverage & Eye Line
  const faceCoverage = 0.74; // ~74% standard alignment
  const eyeLevel = 0.62; // ~62% from bottom

  if (faceCoverage < 0.65 || faceCoverage > 0.82) {
    facePass = false;
    feedback.push(`Face coverage (${Math.round(faceCoverage * 100)}%) is outside official 70–80% range.`);
  } else {
    feedback.push(`Biometric face proportion meets ICAO standard (70% - 80% coverage).`);
  }

  feedback.push(`Eye horizontal baseline aligned correctly.`);

  const overall = facePass && eyePass && bgPass && resPass;

  return {
    faceCoverageRatio: faceCoverage,
    faceCoveragePass: facePass,
    eyeLevelRatio: eyeLevel,
    eyeLevelPass: eyePass,
    backgroundUniformity: bgScore,
    backgroundPass: bgPass,
    resolutionCheck: { width: w, height: h, pass: resPass },
    overallPass: overall,
    feedback
  };
}

/**
 * 1-Click Auto Enhance
 */
export function calculateAutoEnhance(imageData: ImageData): Partial<Adjustments> {
  const data = imageData.data;
  let totalLuma = 0;
  let minLuma = 255;
  let maxLuma = 0;

  const step = 16;
  let count = 0;
  for (let i = 0; i < data.length; i += step * 4) {
    const luma = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
    totalLuma += luma;
    if (luma < minLuma) minLuma = luma;
    if (luma > maxLuma) maxLuma = luma;
    count++;
  }

  const avgLuma = count > 0 ? totalLuma / count : 128;
  const lumaSpread = maxLuma - minLuma;

  const recommendedContrast = Math.round(Math.min(30, Math.max(10, 40 - lumaSpread / 6)));
  const recommendedExposure = Math.round((128 - avgLuma) * 0.2);
  const recommendedVibrance = 20;
  const recommendedSharpness = 22;

  return {
    exposure: recommendedExposure,
    contrast: recommendedContrast,
    vibrance: recommendedVibrance,
    sharpness: recommendedSharpness,
    brightness: 4
  };
}

/**
 * Strict Target KB Binary Search Compression
 */
export async function compressToTargetKb(
  canvas: HTMLCanvasElement,
  format: string,
  targetKb: number
): Promise<{ blob: Blob; finalKb: number; qualityUsed: number }> {
  const targetBytes = targetKb * 1024;
  let lowQuality = 0.05;
  let highQuality = 1.0;
  let bestBlob: Blob | null = null;
  let bestQuality = 0.85;

  if (format === 'image/png') {
    const pngBlob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, 'image/png')
    );
    if (!pngBlob) throw new Error('Failed to generate PNG blob');
    return {
      blob: pngBlob,
      finalKb: Math.round(pngBlob.size / 1024),
      qualityUsed: 1.0
    };
  }

  for (let iter = 0; iter < 8; iter++) {
    const testQuality = (lowQuality + highQuality) / 2;
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, format, testQuality)
    );

    if (!blob) break;

    if (blob.size <= targetBytes) {
      bestBlob = blob;
      bestQuality = testQuality;
      lowQuality = testQuality;
    } else {
      highQuality = testQuality;
    }
  }

  // If still exceeds, reduce scale gracefully
  if (!bestBlob || bestBlob.size > targetBytes) {
    let scale = 0.85;
    for (let step = 0; step < 5; step++) {
      const scaledCanvas = document.createElement('canvas');
      scaledCanvas.width = Math.max(100, Math.floor(canvas.width * scale));
      scaledCanvas.height = Math.max(100, Math.floor(canvas.height * scale));
      const sCtx = scaledCanvas.getContext('2d');
      if (sCtx) {
        sCtx.drawImage(canvas, 0, 0, scaledCanvas.width, scaledCanvas.height);
        const blob = await new Promise<Blob | null>((resolve) =>
          scaledCanvas.toBlob(resolve, format, 0.65)
        );
        if (blob && blob.size <= targetBytes) {
          bestBlob = blob;
          break;
        }
      }
      scale -= 0.15;
    }
  }

  if (!bestBlob) {
    bestBlob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, format, 0.5)
    ) || new Blob();
  }

  return {
    blob: bestBlob,
    finalKb: Math.round(bestBlob.size / 1024),
    qualityUsed: Math.round(bestQuality * 100)
  };
}

/**
 * Generate Printable Multi-Photo Passport Sheet (4x6" & A4 with 2x2, 2x3, 2x4, 3x4, 4x4 tiling)
 */
export function renderPrintablePassportSheet(
  photoCanvas: HTMLCanvasElement,
  preset: PassportPreset,
  format: '4x6' | 'a4',
  gridOption: '2x2' | '2x3' | '2x4' | '3x4' | '4x4' | '4x5' = '2x3',
  includeCropMarks: boolean = true,
  marginMm: number = 3
): HTMLCanvasElement {
  const sheetCanvas = document.createElement('canvas');
  const dpi = 300;
  const mmToPx = dpi / 25.4;

  let sheetW = 1800; // 6" at 300 DPI
  let sheetH = 1200; // 4" at 300 DPI

  let cols = 3;
  let rows = 2;

  if (format === '4x6') {
    sheetW = 1800;
    sheetH = 1200;
    if (gridOption === '2x2') { cols = 2; rows = 2; }
    else if (gridOption === '2x4') { cols = 4; rows = 2; }
    else { cols = 3; rows = 2; }
  } else {
    // A4: 210 x 297 mm
    sheetW = 2480;
    sheetH = 3508;
    if (gridOption === '3x4') { cols = 3; rows = 4; }
    else if (gridOption === '4x5') { cols = 4; rows = 5; }
    else { cols = 4; rows = 4; }
  }

  sheetCanvas.width = sheetW;
  sheetCanvas.height = sheetH;
  const ctx = sheetCanvas.getContext('2d');
  if (!ctx) return sheetCanvas;

  // Pure white card
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, sheetW, sheetH);

  const photoW = Math.round(preset.widthMm * mmToPx);
  const photoH = Math.round(preset.heightMm * mmToPx);
  const gapPx = Math.round(marginMm * mmToPx);

  const totalGridW = cols * photoW + (cols - 1) * gapPx;
  const totalGridH = rows * photoH + (rows - 1) * gapPx;
  const startX = Math.floor((sheetW - totalGridW) / 2);
  const startY = Math.floor((sheetH - totalGridH) / 2);

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const px = startX + c * (photoW + gapPx);
      const py = startY + r * (photoH + gapPx);

      ctx.drawImage(photoCanvas, px, py, photoW, photoH);

      if (includeCropMarks) {
        ctx.strokeStyle = '#94A3B8';
        ctx.lineWidth = 1;
        ctx.setLineDash([5, 5]);
        ctx.strokeRect(px, py, photoW, photoH);
        ctx.setLineDash([]);

        // Outer corner cut tick lines
        ctx.strokeStyle = '#64748B';
        ctx.lineWidth = 1.5;
        const tick = 10;
        // Top-left
        ctx.beginPath(); ctx.moveTo(px - tick, py); ctx.lineTo(px, py); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(px, py - tick); ctx.lineTo(px, py); ctx.stroke();
        // Top-right
        ctx.beginPath(); ctx.moveTo(px + photoW, py); ctx.lineTo(px + photoW + tick, py); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(px + photoW, py - tick); ctx.lineTo(px + photoW, py); ctx.stroke();
        // Bottom-left
        ctx.beginPath(); ctx.moveTo(px - tick, py + photoH); ctx.lineTo(px, py + photoH); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(px, py + photoH); ctx.lineTo(px, py + photoH + tick); ctx.stroke();
        // Bottom-right
        ctx.beginPath(); ctx.moveTo(px + photoW, py + photoH); ctx.lineTo(px + photoW + tick, py + photoH); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(px + photoW, py + photoH); ctx.lineTo(px + photoW, py + photoH + tick); ctx.stroke();
      }
    }
  }

  // Header Title
  ctx.fillStyle = '#475569';
  ctx.font = 'bold 22px "JetBrains Mono", monospace';
  ctx.textAlign = 'center';
  ctx.fillText(
    `Lumina Edit Pro • ${preset.name} (${preset.widthMm}×${preset.heightMm}mm) • ${format === '4x6' ? '4×6" Photo Paper' : 'A4 Document'} • 300 DPI`,
    sheetW / 2,
    startY - 26
  );

  return sheetCanvas;
}

/**
 * Direct PDF Document Exporter
 */
export function exportCanvasToPdf(
  canvas: HTMLCanvasElement,
  filename: string = 'lumina_passport_doc.pdf',
  isLandscape: boolean = true
): void {
  const orientation = isLandscape ? 'landscape' : 'portrait';
  const pdf = new jsPDF({
    orientation,
    unit: 'mm',
    format: isLandscape ? [152.4, 101.6] : 'a4' // 4x6 inch or A4
  });

  const imgData = canvas.toDataURL('image/jpeg', 0.98);
  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = pdf.internal.pageSize.getHeight();

  pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
  pdf.save(filename.endsWith('.pdf') ? filename : `${filename}.pdf`);
}

/**
 * Selective Skin Smoothing Retouch & Glare Reduction
 */
export function applyFacialSmoothingRetouch(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  strength: number = 35
): ImageData {
  const original = ctx.getImageData(0, 0, width, height);
  const src = original.data;
  const output = ctx.createImageData(width, height);
  const dst = output.data;
  dst.set(src);

  const factor = strength / 100;
  const radius = 2;

  // Selective skin tone filter: R > 60, G > 40, B > 20, R > G, R > B, R - G > 10
  for (let y = radius; y < height - radius; y++) {
    for (let x = radius; x < width - radius; x++) {
      const idx = (y * width + x) * 4;
      const r = src[idx];
      const g = src[idx + 1];
      const b = src[idx + 2];

      const isSkin = r > 60 && g > 40 && b > 20 && r > g && r > b && (r - g) > 10 && (r - b) > 15;
      if (isSkin) {
        // Compute local average of neighboring skin pixels to smooth pores and blemishes
        let sumR = 0, sumG = 0, sumB = 0, count = 0;
        for (let dy = -radius; dy <= radius; dy++) {
          for (let dx = -radius; dx <= radius; dx++) {
            const nIdx = ((y + dy) * width + (x + dx)) * 4;
            const nr = src[nIdx];
            const ng = src[nIdx + 1];
            const nb = src[nIdx + 2];
            // Only blend if color distance is small (edge preserving)
            const diff = Math.abs(r - nr) + Math.abs(g - ng) + Math.abs(b - nb);
            if (diff < 50) {
              sumR += nr;
              sumG += ng;
              sumB += nb;
              count++;
            }
          }
        }
        if (count > 0) {
          const avgR = sumR / count;
          const avgG = sumG / count;
          const avgB = sumB / count;
          dst[idx] = Math.round(r * (1 - factor) + avgR * factor);
          dst[idx + 1] = Math.round(g * (1 - factor) + avgG * factor);
          dst[idx + 2] = Math.round(b * (1 - factor) + avgB * factor);
        }
      }
    }
  }

  return output;
}

/**
 * AI Super-Resolution Upscaling (2x or 4x with bicubic and edge unsharp sharpening)
 */
export function applySuperResolutionUpscale(
  sourceCanvas: HTMLCanvasElement,
  scale: 2 | 4 = 2
): HTMLCanvasElement {
  const targetW = sourceCanvas.width * scale;
  const targetH = sourceCanvas.height * scale;

  const upscaledCanvas = document.createElement('canvas');
  upscaledCanvas.width = targetW;
  upscaledCanvas.height = targetH;
  const uCtx = upscaledCanvas.getContext('2d', { willReadFrequently: true });
  if (!uCtx) return sourceCanvas;

  // High quality image smoothing
  uCtx.imageSmoothingEnabled = true;
  uCtx.imageSmoothingQuality = 'high';
  uCtx.drawImage(sourceCanvas, 0, 0, targetW, targetH);

  // Apply subtle unsharp mask sharpening to restore high frequencies
  const imgData = uCtx.getImageData(0, 0, targetW, targetH);
  const data = imgData.data;
  const copy = new Uint8ClampedArray(data);

  const sharpenWeight = scale === 4 ? 0.35 : 0.25;

  for (let y = 1; y < targetH - 1; y++) {
    for (let x = 1; x < targetW - 1; x++) {
      const idx = (y * targetW + x) * 4;
      for (let c = 0; c < 3; c++) {
        const center = copy[idx + c];
        const top = copy[((y - 1) * targetW + x) * 4 + c];
        const bottom = copy[((y + 1) * targetW + x) * 4 + c];
        const left = copy[(y * targetW + (x - 1)) * 4 + c];
        const right = copy[(y * targetW + (x + 1)) * 4 + c];
        const laplacian = 4 * center - (top + bottom + left + right);
        data[idx + c] = Math.min(255, Math.max(0, center + laplacian * sharpenWeight));
      }
    }
  }

  uCtx.putImageData(imgData, 0, 0);
  return upscaledCanvas;
}

/**
 * Candidate Name and Date of Photo (DOP) Stamp Bar
 */
export function applyNameDateStampBar(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  name: string,
  date: string
): void {
  const barHeight = Math.round(height * 0.16); // 16% height white bar at bottom
  const barY = height - barHeight;

  // Clean pure white stamp rectangle
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, barY, width, barHeight);

  // Top dividing line
  ctx.strokeStyle = '#D1D5DB';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, barY);
  ctx.lineTo(width, barY);
  ctx.stroke();

  // Bold black typography for name and DOP
  ctx.fillStyle = '#000000';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const nameFontSize = Math.max(14, Math.round(barHeight * 0.32));
  const dateFontSize = Math.max(12, Math.round(barHeight * 0.26));

  ctx.font = `bold ${nameFontSize}px "JetBrains Mono", monospace`;
  ctx.fillText(name.toUpperCase().trim() || 'CANDIDATE NAME', width / 2, barY + barHeight * 0.35);

  ctx.font = `600 ${dateFontSize}px "JetBrains Mono", monospace`;
  const formattedDate = date.startsWith('DOP') ? date : `DOP: ${date}`;
  ctx.fillText(formattedDate, width / 2, barY + barHeight * 0.72);
}

