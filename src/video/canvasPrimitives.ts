import {
  clamp01,
  easeInOutQuint,
  easeOutBack,
  easeOutCubic,
  easeOutExpo,
  easeOutQuart,
  getStaggerProgress,
  lerp,
} from './timeline';
import type { ActiveTransition } from './types';

export const FONT_DISPLAY = `'Outfit', 'Noto Sans SC', 'PingFang SC', 'Microsoft YaHei', sans-serif`;
export const FONT_SERIF = `'Noto Serif SC', Georgia, serif`;
export const FONT_MONO = `'JetBrains Mono', ui-monospace, monospace`;

// Cached lightweight grain tile for 60fps performance
let cachedGrainCanvas: HTMLCanvasElement | null = null;

function getGrainTile(): HTMLCanvasElement | null {
  if (typeof document === 'undefined') return null;
  if (cachedGrainCanvas) return cachedGrainCanvas;
  const tile = document.createElement('canvas');
  tile.width = 160;
  tile.height = 160;
  const gctx = tile.getContext('2d');
  if (!gctx) return null;
  const img = gctx.createImageData(160, 160);
  let seed = 1337;
  for (let i = 0; i < img.data.length; i += 4) {
    seed = (seed * 16807) % 2147483647;
    const v = seed % 255;
    img.data[i] = v;
    img.data[i + 1] = v;
    img.data[i + 2] = v;
    img.data[i + 3] = 28;
  }
  gctx.putImageData(img, 0, 0);
  cachedGrainCanvas = tile;
  return tile;
}

export function drawFilmGrain(ctx: CanvasRenderingContext2D, w: number, h: number, time: number, opacity = 0.08): void {
  const tile = getGrainTile();
  if (!tile) return;
  ctx.save();
  ctx.globalAlpha = opacity;
  const ox = Math.floor((time * 473) % 160);
  const oy = Math.floor((time * 317) % 160);
  const pattern = ctx.createPattern(tile, 'repeat');
  if (pattern) {
    ctx.translate(-ox, -oy);
    ctx.fillStyle = pattern;
    ctx.fillRect(ox, oy, w + 160, h + 160);
  }
  ctx.restore();
}

export function drawVignette(ctx: CanvasRenderingContext2D, w: number, h: number, strength = 0.55): void {
  const grad = ctx.createRadialGradient(w * 0.5, h * 0.5, Math.min(w, h) * 0.28, w * 0.5, h * 0.5, Math.max(w, h) * 0.72);
  grad.addColorStop(0, 'rgba(0,0,0,0)');
  grad.addColorStop(1, `rgba(0,0,0,${strength})`);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);
}

export function drawArchitecturalGrid(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  color: string,
  alpha: number,
  spacingRatio = 0.08,
  offsetX = 0,
  offsetY = 0
): void {
  const step = Math.max(48, Math.round(Math.min(w, h) * spacingRatio));
  ctx.save();
  ctx.strokeStyle = color;
  ctx.globalAlpha = alpha;
  ctx.lineWidth = 1;
  ctx.beginPath();

  const startX = ((offsetX % step) + step) % step;
  for (let x = startX; x <= w; x += step) {
    ctx.moveTo(x, 0);
    ctx.lineTo(x, h);
  }
  const startY = ((offsetY % step) + step) % step;
  for (let y = startY; y <= h; y += step) {
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
  }
  ctx.stroke();
  ctx.restore();
}

export function drawViewfinderCorners(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  color: string,
  alpha = 0.35,
  margin = 48,
  arm = 24
): void {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.globalAlpha = alpha;
  ctx.lineWidth = 2;

  const corners: Array<[number, number, number, number]> = [
    [margin, margin, 1, 1],
    [w - margin, margin, -1, 1],
    [margin, h - margin, 1, -1],
    [w - margin, h - margin, -1, -1],
  ];

  ctx.beginPath();
  for (const [cx, cy, dx, dy] of corners) {
    ctx.moveTo(cx + dx * arm, cy);
    ctx.lineTo(cx, cy);
    ctx.lineTo(cx, cy + dy * arm);
  }
  ctx.stroke();
  ctx.restore();
}

export function drawRadialGlow(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  radius: number,
  innerColor: string,
  outerColor = 'rgba(0,0,0,0)'
): void {
  const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(1, radius));
  grad.addColorStop(0, innerColor);
  grad.addColorStop(1, outerColor);
  ctx.fillStyle = grad;
  ctx.fillRect(cx - radius, cy - radius, radius * 2, radius * 2);
}

/**
 * Draw crisp masked kinetic text that rises cleanly out of a hidden clip box.
 */
export function drawMaskedText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  font: string,
  color: string,
  progress: number,
  options?: {
    align?: CanvasTextAlign;
    direction?: 'up' | 'down';
    letterSpacing?: number;
    maxWidth?: number;
    shadowColor?: string;
    shadowBlur?: number;
  }
): void {
  const p = easeOutExpo(clamp01(progress));
  if (p <= 0.001) return;

  const align = options?.align ?? 'center';
  const dir = options?.direction ?? 'up';

  ctx.save();
  ctx.font = font;
  ctx.textAlign = align;
  ctx.textBaseline = 'middle';

  const metrics = ctx.measureText(text);
  const fontSizeMatch = font.match(/(\d+(?:\.\d+)?)px/);
  const fontSize = fontSizeMatch ? Number(fontSizeMatch[1]) : 64;
  const textWidth = Math.min(metrics.width + fontSize * 0.6, options?.maxWidth ?? metrics.width + fontSize * 0.6);
  const boxHeight = fontSize * 1.45;

  let clipX = x - textWidth / 2;
  if (align === 'left') clipX = x - fontSize * 0.15;
  if (align === 'right') clipX = x - textWidth + fontSize * 0.15;

  ctx.beginPath();
  ctx.rect(clipX, y - boxHeight / 2, textWidth + fontSize * 0.3, boxHeight);
  ctx.clip();

  const offset = (1 - p) * boxHeight * 0.9 * (dir === 'up' ? 1 : -1);
  ctx.globalAlpha = clamp01(p * 1.4);

  if (options?.shadowColor) {
    ctx.shadowColor = options.shadowColor;
    ctx.shadowBlur = options.shadowBlur ?? 24;
  }

  ctx.fillStyle = color;
  if (options?.maxWidth) {
    ctx.fillText(text, x, y + offset, options.maxWidth);
  } else {
    ctx.fillText(text, x, y + offset);
  }

  ctx.restore();
}

/**
 * Draw staggered kinetic characters with elastic slam, optional chromatic RGB offset on arrival,
 * and automatic max-width scaling so text never clips off-screen.
 */
export function drawKineticSlamChars(
  ctx: CanvasRenderingContext2D,
  text: string,
  cx: number,
  cy: number,
  fontSize: number,
  fontFamily: string,
  color: string,
  localTime: number,
  options?: {
    startDelay?: number;
    stagger?: number;
    duration?: number;
    tracking?: number;
    weight?: number | string;
    italic?: boolean;
    maxWidth?: number;
    chromatic?: boolean;
    accentColor?: string;
    highlightIndices?: number[];
  }
): void {
  const chars = Array.from(text);
  if (chars.length === 0) return;

  const weight = options?.weight ?? 900;
  const italic = options?.italic ? 'italic ' : '';
  const startDelay = options?.startDelay ?? 0;
  const stagger = options?.stagger ?? 0.045;
  const duration = options?.duration ?? 0.32;
  const tracking = options?.tracking ?? fontSize * 0.08;

  ctx.save();
  ctx.font = `${italic}${weight} ${fontSize}px ${fontFamily}`;

  const widths = chars.map((ch) => ctx.measureText(ch).width);
  const rawTotalWidth = widths.reduce((a, b) => a + b, 0) + tracking * Math.max(0, chars.length - 1);
  const scaleFit = options?.maxWidth && rawTotalWidth > options.maxWidth ? options.maxWidth / rawTotalWidth : 1;

  ctx.translate(cx, cy);
  ctx.scale(scaleFit, scaleFit);

  let cursorX = -rawTotalWidth / 2;

  for (let i = 0; i < chars.length; i++) {
    const ch = chars[i];
    const cw = widths[i];
    const p = getStaggerProgress(localTime, i, startDelay, stagger, duration);
    const eased = easeOutBack(p, 1.35);
    const alpha = clamp01(p * 2.2);

    if (alpha > 0.01) {
      const charCenterX = cursorX + cw / 2;
      const scale = lerp(1.55, 1.0, easeOutExpo(p));
      const yOffset = lerp(fontSize * 0.45, 0, eased);
      const isHighlighted = options?.highlightIndices?.includes(i);
      const fill = isHighlighted && options?.accentColor ? options.accentColor : color;

      ctx.save();
      ctx.translate(charCenterX, yOffset);
      ctx.scale(scale, scale);
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      // Chromatic micro-aberration on high-impact arrival
      const chromaStrength = options?.chromatic ? (1 - easeOutQuart(p)) * (fontSize * 0.065) : 0;
      if (chromaStrength > 0.6) {
        ctx.globalAlpha = alpha * 0.55;
        ctx.fillStyle = '#EF4444';
        ctx.fillText(ch, -chromaStrength, 0);
        ctx.fillStyle = '#38BDF8';
        ctx.fillText(ch, chromaStrength, 0);
      }

      ctx.globalAlpha = alpha;
      ctx.fillStyle = fill;
      ctx.fillText(ch, 0, 0);
      ctx.restore();
    }

    cursorX += cw + tracking;
  }

  ctx.restore();
}

/**
 * Draw subtle live audio waveform equalizer ribbon.
 */
export function drawAudioWaveform(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  width: number,
  maxHeight: number,
  time: number,
  energy: number,
  color: string,
  barCount = 36
): void {
  ctx.save();
  const gap = width / barCount;
  const barW = Math.max(2, gap * 0.48);
  const startX = cx - width / 2;

  for (let i = 0; i < barCount; i++) {
    const norm = i / (barCount - 1);
    const bell = Math.sin(norm * Math.PI);
    const wave =
      0.32 +
      0.38 * Math.abs(Math.sin(time * 11.5 + i * 0.55)) +
      0.3 * Math.abs(Math.cos(time * 18.2 - i * 0.35));
    const h = Math.max(3, maxHeight * bell * wave * (0.35 + energy * 0.85));
    const x = startX + i * gap;

    ctx.fillStyle = color;
    ctx.globalAlpha = 0.35 + bell * 0.55;
    ctx.fillRect(x, cy - h / 2, barW, h);
  }
  ctx.restore();
}

/**
 * Draw rhythmic motion-graphics transitions over the active canvas frame.
 */
export function drawTransitionOverlay(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  tr: ActiveTransition,
  beatFlashEnabled: boolean,
  intensity: number
): void {
  const p = clamp01(tr.progress);
  const k = intensity;

  ctx.save();

  switch (tr.type) {
    case 'aperture-open': {
      // Smooth theatrical golden shutter reveal at video start (already partially open at t=0 so frame 0 looks crisp)
      const openP = easeOutExpo(clamp01(p * 1.15 + 0.12));
      const barH = (1 - openP) * (h * 0.22);
      if (barH > 1) {
        ctx.fillStyle = '#040507';
        ctx.fillRect(0, 0, w, barH);
        ctx.fillRect(0, h - barH, w, barH);
        ctx.fillStyle = '#F59E0B';
        ctx.globalAlpha = (1 - openP) * 0.85;
        ctx.fillRect(0, barH - 2, w, 2);
        ctx.fillRect(0, h - barH, w, 2);
      }
      break;
    }

    case 'whip-blinds': {
      // Fast kinetic vertical shutter blinds sweeping across with gold flash lead edge
      const stripes = 8;
      const stripeW = w / stripes;
      const peak = Math.sin(p * Math.PI);
      const slide = easeInOutQuint(p);
      for (let i = 0; i < stripes; i++) {
        const phase = clamp01(peak * 1.25 - Math.abs(i / stripes - 0.5) * 0.35);
        const bw = stripeW * phase * 0.92 * k;
        const x = i * stripeW + (slide > 0.5 ? stripeW - bw : 0);
        ctx.fillStyle = i % 2 === 0 ? '#07080B' : '#121520';
        ctx.globalAlpha = 0.92;
        ctx.fillRect(x, 0, bw, h);
        if (beatFlashEnabled && phase > 0.35) {
          ctx.fillStyle = '#F59E0B';
          ctx.globalAlpha = phase * 0.65;
          ctx.fillRect(x, 0, 3, h);
        }
      }
      break;
    }

    case 'iris-flash': {
      // Geometric expanding diamond/circle flash cut into Main Title
      const peak = Math.pow(Math.sin(p * Math.PI), 1.4);
      if (beatFlashEnabled) {
        ctx.fillStyle = '#F5F2EB';
        ctx.globalAlpha = peak * 0.65 * Math.min(1.2, k);
        ctx.fillRect(0, 0, w, h);
      }
      const radius = easeOutExpo(p) * Math.hypot(w, h) * 0.72;
      ctx.strokeStyle = '#F59E0B';
      ctx.lineWidth = Math.max(2, (1 - p) * 28 * k);
      ctx.globalAlpha = (1 - p) * 0.9;
      ctx.beginPath();
      ctx.arc(w * 0.5, h * 0.5, radius, 0, Math.PI * 2);
      ctx.stroke();
      break;
    }

    case 'razor-wipe': {
      // High-velocity diagonal blade slice across frame
      const sweep = easeInOutQuint(p);
      const bladeX = lerp(-w * 0.35, w * 1.35, sweep);
      const bandW = w * 0.14 * Math.sin(p * Math.PI) * k;
      ctx.beginPath();
      ctx.moveTo(bladeX - bandW, 0);
      ctx.lineTo(bladeX + bandW, 0);
      ctx.lineTo(bladeX + bandW - w * 0.22, h);
      ctx.lineTo(bladeX - bandW - w * 0.22, h);
      ctx.closePath();
      ctx.fillStyle = '#3B82F6';
      ctx.globalAlpha = 0.85 * Math.sin(p * Math.PI);
      ctx.fill();

      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 4;
      ctx.globalAlpha = Math.sin(p * Math.PI);
      ctx.beginPath();
      ctx.moveTo(bladeX, 0);
      ctx.lineTo(bladeX - w * 0.22, h);
      ctx.stroke();
      break;
    }

    case 'invert-strobe': {
      // Razor-sharp hard invert flash on "但其实"
      if (beatFlashEnabled) {
        const flash = p < 0.35 ? 1 - p / 0.35 : 0;
        if (flash > 0.01) {
          ctx.fillStyle = '#07080B';
          ctx.globalAlpha = flash * 0.85;
          ctx.fillRect(0, 0, w, h);
        }
      }
      // Horizontal crimson shock line
      const lineP = easeOutExpo(p);
      ctx.fillStyle = '#E11D48';
      ctx.globalAlpha = (1 - p) * 0.9;
      ctx.fillRect(0, h * 0.5 - (1 - p) * 8, w * lineP, Math.max(2, (1 - p) * 16));
      break;
    }

    case 'camera-pullback': {
      // Concentric zoom-out framing guides indicating rapid lens pullback
      const rings = 3;
      for (let i = 0; i < rings; i++) {
        const rp = clamp01(p * 1.2 - i * 0.12);
        const scale = lerp(1.55, 0.72, easeOutExpo(rp));
        const rw = w * scale;
        const rh = h * scale;
        ctx.strokeStyle = '#F59E0B';
        ctx.lineWidth = 2;
        ctx.globalAlpha = Math.sin(rp * Math.PI) * 0.55;
        ctx.strokeRect((w - rw) / 2, (h - rh) / 2, rw, rh);
      }
      break;
    }

    case 'ember-curtain': {
      // Rising fiery gradient curtain wiping upward
      const lift = easeInOutQuint(p);
      const y = lerp(h * 1.15, -h * 0.25, lift);
      const bandH = h * 0.32 * Math.sin(p * Math.PI);
      if (bandH > 2) {
        const grad = ctx.createLinearGradient(0, y - bandH, 0, y + bandH);
        grad.addColorStop(0, 'rgba(249,115,22,0)');
        grad.addColorStop(0.5, 'rgba(250,204,21,0.85)');
        grad.addColorStop(1, 'rgba(249,115,22,0)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, y - bandH, w, bandH * 2);
      }
      break;
    }

    case 'gravity-shatter': {
      // Sudden downward plummet & crystalline frost fracture flash
      const drop = easeOutCubic(p);
      if (beatFlashEnabled && p < 0.4) {
        ctx.fillStyle = '#E0F2FE';
        ctx.globalAlpha = (1 - p / 0.4) * 0.55;
        ctx.fillRect(0, 0, w, h);
      }
      // Sharp diagonal shatter vectors radiating from center
      ctx.strokeStyle = '#7DD3FC';
      ctx.lineWidth = Math.max(1.5, (1 - drop) * 5);
      ctx.globalAlpha = (1 - drop) * 0.85;
      const rays = 10;
      for (let i = 0; i < rays; i++) {
        const ang = (i / rays) * Math.PI * 2 + 0.2;
        const r1 = Math.min(w, h) * 0.08 * drop;
        const r2 = Math.max(w, h) * 0.75 * drop;
        ctx.beginPath();
        ctx.moveTo(w * 0.5 + Math.cos(ang) * r1, h * 0.5 + Math.sin(ang) * r1);
        ctx.lineTo(w * 0.5 + Math.cos(ang) * r2, h * 0.5 + Math.sin(ang) * r2);
        ctx.stroke();
      }
      break;
    }

    case 'horizon-burst': {
      // Incandescent golden dawn beam slicing horizontally then blooming outward
      const open = easeOutExpo(p);
      const beamH = lerp(6, h * 0.55, open) * (1 - p * 0.85);
      const grad = ctx.createLinearGradient(0, h * 0.5 - beamH, 0, h * 0.5 + beamH);
      grad.addColorStop(0, 'rgba(245,158,11,0)');
      grad.addColorStop(0.5, `rgba(254,243,199,${(1 - p) * 0.95})`);
      grad.addColorStop(1, 'rgba(245,158,11,0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, h * 0.5 - beamH, w, beamH * 2);

      if (beatFlashEnabled && p < 0.35) {
        ctx.fillStyle = '#FFFBEB';
        ctx.globalAlpha = (1 - p / 0.35) * 0.45;
        ctx.fillRect(0, 0, w, h);
      }
      break;
    }
  }

  ctx.restore();
}
