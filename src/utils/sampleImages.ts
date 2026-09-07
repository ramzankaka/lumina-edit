/**
 * Sample image generators & presets for testing Lumina Edit Pro
 */

export interface SampleImageItem {
  id: string;
  name: string;
  category: 'portrait' | 'landscape' | 'passport' | 'document';
  description: string;
  type: 'portrait' | 'sunset' | 'cyberpunk' | 'passport' | 'signature';
}

// Generate reliable, self-contained high-res photo canvas data URLs
function generateSampleCanvas(type: 'portrait' | 'sunset' | 'cyberpunk' | 'passport' | 'signature'): string {
  const canvas = document.createElement('canvas');
  const width = type === 'passport' ? 600 : type === 'signature' ? 800 : 1024;
  const height = type === 'passport' ? 600 : type === 'signature' ? 400 : 768;
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  if (type === 'passport') {
    // Clean off-white studio background
    ctx.fillStyle = '#F0F2F5';
    ctx.fillRect(0, 0, width, height);

    // Subtle studio vignette
    const radGrad = ctx.createRadialGradient(300, 260, 50, 300, 300, 380);
    radGrad.addColorStop(0, 'rgba(255, 255, 255, 0.4)');
    radGrad.addColorStop(1, 'rgba(200, 208, 218, 0.5)');
    ctx.fillStyle = radGrad;
    ctx.fillRect(0, 0, width, height);

    // Shoulders & Navy Suit
    ctx.fillStyle = '#1A2436';
    ctx.beginPath();
    ctx.ellipse(300, 560, 200, 140, 0, 0, Math.PI * 2);
    ctx.fill();

    // White Collar
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.moveTo(270, 420);
    ctx.lineTo(300, 470);
    ctx.lineTo(330, 420);
    ctx.closePath();
    ctx.fill();

    // Amber Tie
    ctx.fillStyle = '#D97706';
    ctx.beginPath();
    ctx.moveTo(290, 460);
    ctx.lineTo(310, 460);
    ctx.lineTo(305, 580);
    ctx.lineTo(295, 580);
    ctx.closePath();
    ctx.fill();

    // Neck
    ctx.fillStyle = '#E0A97C';
    ctx.fillRect(268, 360, 64, 80);

    // Head / Face
    ctx.fillStyle = '#F2BC92';
    ctx.beginPath();
    ctx.ellipse(300, 270, 105, 130, 0, 0, Math.PI * 2);
    ctx.fill();

    // Hair
    ctx.fillStyle = '#261C14';
    ctx.beginPath();
    ctx.arc(300, 220, 110, Math.PI, 0);
    ctx.fill();

    // Eyes
    ctx.fillStyle = '#2A2018';
    ctx.beginPath();
    ctx.arc(260, 265, 8, 0, Math.PI * 2);
    ctx.arc(340, 265, 8, 0, Math.PI * 2);
    ctx.fill();

    // Eyebrows
    ctx.strokeStyle = '#1E1610';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(245, 248);
    ctx.quadraticCurveTo(260, 242, 275, 246);
    ctx.moveTo(325, 246);
    ctx.quadraticCurveTo(340, 242, 355, 248);
    ctx.stroke();

    // Nose
    ctx.strokeStyle = '#D49B6E';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(300, 265);
    ctx.lineTo(295, 305);
    ctx.lineTo(305, 305);
    ctx.stroke();

    // Neutral Passport Mouth
    ctx.strokeStyle = '#C47D5E';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(280, 335);
    ctx.lineTo(320, 335);
    ctx.stroke();

  } else if (type === 'signature') {
    // Light cream textured paper
    ctx.fillStyle = '#F8F6F0';
    ctx.fillRect(0, 0, width, height);

    // Subtle paper noise / shading
    ctx.fillStyle = 'rgba(0, 0, 0, 0.02)';
    for (let i = 0; i < 400; i++) {
      ctx.fillRect(Math.random() * width, Math.random() * height, 2, 2);
    }

    // Baseline ruler guide line
    ctx.strokeStyle = '#D1D5DB';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(100, 280);
    ctx.lineTo(700, 280);
    ctx.stroke();

    // Handwritten cursive ink signature
    ctx.strokeStyle = '#1E293B';
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.beginPath();
    ctx.moveTo(140, 260);
    ctx.bezierCurveTo(170, 160, 220, 150, 210, 280);
    ctx.bezierCurveTo(205, 310, 260, 200, 310, 240);
    ctx.bezierCurveTo(340, 260, 360, 180, 390, 250);
    ctx.bezierCurveTo(420, 290, 480, 160, 520, 270);
    ctx.bezierCurveTo(550, 310, 600, 240, 650, 250);
    ctx.stroke();

    // Signature underline flourish
    ctx.beginPath();
    ctx.moveTo(180, 300);
    ctx.quadraticCurveTo(400, 320, 640, 270);
    ctx.stroke();

  } else if (type === 'sunset') {
    // Sunset gradient
    const grad = ctx.createLinearGradient(0, 0, 0, height);
    grad.addColorStop(0, '#1e1b4b');
    grad.addColorStop(0.3, '#701a75');
    grad.addColorStop(0.6, '#ea580c');
    grad.addColorStop(0.85, '#f59e0b');
    grad.addColorStop(1, '#fef08a');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    // Glowing Sun
    ctx.fillStyle = '#fffbeb';
    ctx.beginPath();
    ctx.arc(512, 440, 70, 0, Math.PI * 2);
    ctx.fill();

    // Distant mountain ranges
    ctx.fillStyle = 'rgba(76, 29, 149, 0.7)';
    ctx.beginPath();
    ctx.moveTo(0, 560);
    ctx.lineTo(240, 410);
    ctx.lineTo(500, 510);
    ctx.lineTo(760, 390);
    ctx.lineTo(1024, 530);
    ctx.lineTo(1024, height);
    ctx.lineTo(0, height);
    ctx.closePath();
    ctx.fill();

    // Foreground mountain range
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.moveTo(0, 620);
    ctx.lineTo(320, 480);
    ctx.lineTo(620, 580);
    ctx.lineTo(890, 460);
    ctx.lineTo(1024, 600);
    ctx.lineTo(1024, height);
    ctx.lineTo(0, height);
    ctx.closePath();
    ctx.fill();

  } else if (type === 'cyberpunk') {
    // Cyberpunk night gradient
    const grad = ctx.createLinearGradient(0, 0, width, height);
    grad.addColorStop(0, '#09090b');
    grad.addColorStop(0.5, '#180d2b');
    grad.addColorStop(1, '#02182b');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    // Neon grid lines
    ctx.strokeStyle = 'rgba(236, 72, 153, 0.25)';
    ctx.lineWidth = 1.5;
    for (let x = 0; x < width; x += 64) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += 48) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Neon glowing buildings
    ctx.fillStyle = '#0a0a14';
    ctx.fillRect(80, 220, 160, 548);
    ctx.fillRect(280, 160, 200, 608);
    ctx.fillRect(520, 260, 180, 508);
    ctx.fillRect(740, 180, 210, 588);

    // Neon accents
    ctx.fillStyle = '#06b6d4';
    for (let i = 240; i < 700; i += 32) {
      ctx.fillRect(100, i, 12, 16);
      ctx.fillRect(140, i, 12, 16);
      ctx.fillRect(180, i, 12, 16);
    }

    ctx.fillStyle = '#f59e0b';
    for (let i = 200; i < 700; i += 40) {
      ctx.fillRect(320, i, 20, 12);
      ctx.fillRect(370, i, 20, 12);
      ctx.fillRect(420, i, 20, 12);
    }
  } else {
    // Golden hour portrait
    const grad = ctx.createLinearGradient(0, 0, width, height);
    grad.addColorStop(0, '#1c1917');
    grad.addColorStop(0.5, '#451a03');
    grad.addColorStop(1, '#78350f');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    // Soft warm circle highlight
    const rad = ctx.createRadialGradient(600, 320, 40, 512, 384, 450);
    rad.addColorStop(0, '#fef08a');
    rad.addColorStop(0.5, '#f59e0b');
    rad.addColorStop(1, 'rgba(69, 26, 3, 0)');
    ctx.fillStyle = rad;
    ctx.fillRect(0, 0, width, height);

    // Artistic silhouette
    ctx.fillStyle = '#0c0a09';
    ctx.beginPath();
    ctx.arc(460, 320, 90, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.ellipse(460, 550, 180, 160, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  return canvas.toDataURL('image/jpeg', 0.95);
}

export const SAMPLE_IMAGES: SampleImageItem[] = [
  {
    id: 'passport-sample',
    name: 'Official Passport',
    category: 'passport',
    description: 'Frontal studio portrait with neutral background',
    type: 'passport'
  },
  {
    id: 'portrait-sample',
    name: 'Golden Hour Portrait',
    category: 'portrait',
    description: 'Warm natural light portrait with subtle bokeh',
    type: 'portrait'
  },
  {
    id: 'sunset-sample',
    name: 'Mountain Sunset',
    category: 'landscape',
    description: 'High dynamic range landscape for color grading',
    type: 'sunset'
  },
  {
    id: 'cyberpunk-sample',
    name: 'Neon Cyberpunk',
    category: 'landscape',
    description: 'Vibrant city night with rich highlights',
    type: 'cyberpunk'
  },
  {
    id: 'signature-sample',
    name: 'Scanned Signature',
    category: 'document',
    description: 'Handwritten pen signature for threshold binarizing',
    type: 'signature'
  }
];

export function getSampleImageDataUrl(type: 'portrait' | 'sunset' | 'cyberpunk' | 'passport' | 'signature'): string {
  if (typeof document === 'undefined') return '';
  return generateSampleCanvas(type);
}
