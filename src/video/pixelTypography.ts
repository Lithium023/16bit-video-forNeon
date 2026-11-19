import { PAL } from './pixelSprites';
import { clamp01, easeOutBack, easeOutCubic, easeOutExpo, getStaggerProgress, lerp } from './timeline';
import type { SrtCue } from './types';

export const FONT_PIXEL_CJK = '"Noto Sans SC", "PingFang SC", "Microsoft YaHei", sans-serif';
export const FONT_PIXEL_LATIN = '"Silkscreen", "JetBrains Mono", monospace';

export interface PixelTitleOptions {
  startDelay?: number;
  stagger?: number;
  duration?: number;
  color?: string;
  accentColor?: string;
  shadowColor?: string;
  outlineColor?: string;
  highlightIndices?: number[];
  tracking?: number;
  maxWidth?: number;
  plaqueBg?: string;
  plaqueBorder?: string;
}

interface PixelGlyphSprite {
  canvas: HTMLCanvasElement;
  w: number; // virtual pixel width (excluding padding)
  h: number; // virtual pixel height (excluding padding)
  pad: number;
}

const MAX_GLYPH_CACHE = 450;
const glyphCache = new Map<string, PixelGlyphSprite>();
let measureCanvas: HTMLCanvasElement | null = null;
let measureCtx: CanvasRenderingContext2D | null = null;

function getMeasureCtx(): CanvasRenderingContext2D | null {
  if (typeof document === 'undefined') return null;
  if (!measureCanvas) {
    measureCanvas = document.createElement('canvas');
    measureCanvas.width = 128;
    measureCanvas.height = 128;
    measureCtx = measureCanvas.getContext('2d', { willReadFrequently: true });
  }
  return measureCtx;
}

function parseHexRgb(hex: string): [number, number, number] {
  const clean = hex.replace('#', '');
  if (clean.length === 3) {
    return [
      parseInt(clean[0] + clean[0], 16),
      parseInt(clean[1] + clean[1], 16),
      parseInt(clean[2] + clean[2], 16),
    ];
  }
  const n = parseInt(clean.slice(0, 6), 16);
  if (Number.isNaN(n)) return [246, 238, 216];
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function isAsciiChar(ch: string): boolean {
  const code = ch.charCodeAt(0);
  return code >= 32 && code <= 126;
}

/**
 * Rasterize any single Chinese or ASCII character onto a true low-resolution binary pixel grid
 * with 1-pixel 8-neighbor dark outline, 1-pixel stepped drop shadow, and 16-bit top bevel highlight.
 * Cached in memory so subsequent frames blit in O(1) at 60fps with zero anti-alias blur!
 */
function getPixelGlyphSprite(
  ch: string,
  gridPx: number,
  topCol: string,
  midCol: string,
  botCol: string,
  outlineCol: string,
  shadowCol: string,
  withOutline = true
): PixelGlyphSprite | null {
  if (typeof document === 'undefined') return null;
  const key = `${ch}|${gridPx}|${topCol}|${midCol}|${botCol}|${outlineCol}|${shadowCol}|${withOutline ? 1 : 0}`;
  const hit = glyphCache.get(key);
  if (hit) return hit;

  const mctx = getMeasureCtx();
  if (!mctx) return null;

  const fontStack = isAsciiChar(ch) ? FONT_PIXEL_LATIN : FONT_PIXEL_CJK;
  const weight = isAsciiChar(ch) ? '400' : '500';
  mctx.font = `${weight} ${gridPx}px ${fontStack}`;
  const measuredW = Math.max(Math.ceil(gridPx * 0.36), Math.ceil(mctx.measureText(ch).width));

  const pad = withOutline ? 3 : 2;
  const cw = measuredW + pad * 2 + 2;
  const chH = gridPx + pad * 2 + 4;

  const canvas = document.createElement('canvas');
  canvas.width = cw;
  canvas.height = chH;
  const g = canvas.getContext('2d', { willReadFrequently: true });
  if (!g) return null;

  g.clearRect(0, 0, cw, chH);
  g.font = `${weight} ${gridPx}px ${fontStack}`;
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.fillStyle = '#FFFFFF';
  g.fillText(ch, cw / 2, chH / 2 + 0.5);

  const img = g.getImageData(0, 0, cw, chH);
  const src = img.data;
  const mask = new Uint8Array(cw * chH);

  // Snap alpha to crisp binary 1-bit pixel silhouette (CJK stays high to keep dense counters open; Silkscreen ASCII lower so thin bars stay solid)
  const thresh = isAsciiChar(ch) ? 88 : gridPx <= 24 ? 142 : 148;
  let minY = chH;
  let maxY = 0;
  for (let y = 0; y < chH; y++) {
    for (let x = 0; x < cw; x++) {
      const a = src[(y * cw + x) * 4 + 3];
      if (a >= thresh) {
        mask[y * cw + x] = 1;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }

  const out = g.createImageData(cw, chH);
  const dst = out.data;

  const [tr, tg, tb] = parseHexRgb(topCol);
  const [mr, mg, mb] = parseHexRgb(midCol);
  const [br, bg, bb] = parseHexRgb(botCol);
  const [or, og, ob] = parseHexRgb(outlineCol);
  const [sr, sg, sb] = parseHexRgb(shadowCol);

  const glyphSpanY = Math.max(1, maxY - minY);

  const setPx = (x: number, y: number, r: number, gr: number, b: number, a = 255) => {
    if (x < 0 || x >= cw || y < 0 || y >= chH) return;
    const idx = (y * cw + x) * 4;
    dst[idx] = r;
    dst[idx + 1] = gr;
    dst[idx + 2] = b;
    dst[idx + 3] = a;
  };

  // Pass 1: Stepped 16-bit pixel drop shadow (+1,+2 and +2,+2 for titles, +1,+1 for compact text)
  const shOff = withOutline ? 2 : 1;
  for (let y = 0; y < chH; y++) {
    for (let x = 0; x < cw; x++) {
      if (mask[y * cw + x]) {
        setPx(x + shOff, y + shOff, sr, sg, sb, 255);
        if (withOutline) {
          setPx(x + 1, y + shOff, sr, sg, sb, 255);
          setPx(x + shOff, y + 1, sr, sg, sb, 255);
        }
      }
    }
  }

  // Pass 2: Crisp 1-pixel 8-neighbor dark outline
  if (withOutline) {
    for (let y = 0; y < chH; y++) {
      for (let x = 0; x < cw; x++) {
        if (!mask[y * cw + x]) continue;
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            if (dx === 0 && dy === 0) continue;
            const nx = x + dx;
            const ny = y + dy;
            if (nx >= 0 && nx < cw && ny >= 0 && ny < chH && !mask[ny * cw + nx]) {
              setPx(nx, ny, or, og, ob, 255);
            }
          }
        }
      }
    }
  }

  // Pass 3: Main 3-band 16-bit pixel fill (top bevel highlight -> midtone -> lower subtle shade)
  for (let y = 0; y < chH; y++) {
    const yf = (y - minY) / glyphSpanY;
    const r = yf < 0.28 ? tr : yf > 0.78 ? br : mr;
    const gr = yf < 0.28 ? tg : yf > 0.78 ? bg : mg;
    const b = yf < 0.28 ? tb : yf > 0.78 ? bb : mb;
    for (let x = 0; x < cw; x++) {
      if (mask[y * cw + x]) {
        setPx(x, y, r, gr, b, 255);
      }
    }
  }

  g.putImageData(out, 0, 0);

  if (glyphCache.size >= MAX_GLYPH_CACHE) {
    const firstKey = glyphCache.keys().next().value;
    if (firstKey !== undefined) glyphCache.delete(firstKey);
  }

  const sprite: PixelGlyphSprite = { canvas, w: measuredW, h: gridPx, pad };
  glyphCache.set(key, sprite);
  return sprite;
}

/**
 * Draw a crisp 16-bit pixelated string centered at (cx, cy) using cached binary-snapped pixel glyphs.
 */
export function drawPixelString(
  ctx: CanvasRenderingContext2D,
  text: string,
  cx: number,
  cy: number,
  targetFontSize: number,
  options: {
    gridPx?: number;
    color?: string;
    topColor?: string;
    botColor?: string;
    outlineColor?: string;
    shadowColor?: string;
    withOutline?: boolean;
    trackingPx?: number;
    maxWidth?: number;
  } = {}
): { width: number; height: number } {
  const chars = Array.from(text);
  if (chars.length === 0) return { width: 0, height: 0 };

  const gridPx = options.gridPx ?? 16;
  const baseScale = Math.max(1, targetFontSize / gridPx);
  const midCol = options.color ?? PAL.cream;
  const topCol = options.topColor ?? midCol;
  const botCol = options.botColor ?? midCol;
  const outlineCol = options.outlineColor ?? PAL.void;
  const shadowCol = options.shadowColor ?? '#0A0C16';
  const withOutline = options.withOutline ?? false;

  const sprites = chars.map((ch) =>
    getPixelGlyphSprite(ch, gridPx, topCol, midCol, botCol, outlineCol, shadowCol, withOutline)
  );
  const track = options.trackingPx ?? 1;

  let rawW = 0;
  for (let i = 0; i < sprites.length; i++) {
    const sp = sprites[i];
    rawW += (sp ? sp.w : Math.round(gridPx * 0.4)) + (i < sprites.length - 1 ? track : 0);
  }

  let scale = baseScale;
  if (options.maxWidth && rawW * scale > options.maxWidth) {
    scale = options.maxWidth / Math.max(1, rawW);
  }

  const totalW = rawW * scale;
  let cursorX = cx - totalW / 2;

  ctx.save();
  ctx.imageSmoothingEnabled = false;
  for (let i = 0; i < sprites.length; i++) {
    const sp = sprites[i];
    if (!sp) {
      cursorX += Math.round(gridPx * 0.4) * scale + track * scale;
      continue;
    }
    const drawW = sp.canvas.width * scale;
    const drawH = sp.canvas.height * scale;
    const glyphCenterX = cursorX + (sp.w * scale) / 2;
    ctx.drawImage(
      sp.canvas,
      Math.round(glyphCenterX - drawW / 2),
      Math.round(cy - drawH / 2),
      Math.round(drawW),
      Math.round(drawH)
    );
    cursorX += (sp.w + track) * scale;
  }
  ctx.restore();

  return { width: totalW, height: gridPx * scale };
}

/**
 * Draw authentic 16-bit RPG / arcade kinetic title typography.
 * Every Chinese & English glyph is rasterized onto a crisp integer pixel grid with
 * 1-pixel ink outline, stepped pixel drop shadow, metallic bevel highlight, and bouncy pop-in.
 */
export function drawPixelKineticTitle(
  ctx: CanvasRenderingContext2D,
  text: string,
  cx: number,
  cy: number,
  fontSize: number,
  localTime: number,
  options: PixelTitleOptions = {}
): void {
  const {
    startDelay = 0.05,
    stagger = 0.05,
    duration = 0.34,
    color = PAL.cream,
    accentColor = PAL.gold,
    shadowColor = '#0A0D18',
    outlineColor = '#10121E',
    highlightIndices = [],
    tracking = fontSize * 0.08,
    maxWidth,
    plaqueBg,
    plaqueBorder,
  } = options;

  const chars = Array.from(text);
  if (chars.length === 0) return;

  // Virtual 38px/32px pixel grid upscaled 3x-4.5x with nearest-neighbor:
  // keeps dense Chinese glyphs (最/魔/幻/澜) razor-sharp & open while preserving authentic 16-bit stair-steps!
  const gridPx = fontSize >= 90 ? 38 : 32;
  const baseScale = Math.max(1.5, fontSize / gridPx);

  const sprites = chars.map((ch, idx) => {
    const isHl = highlightIndices.includes(idx);
    const midCol = isHl ? accentColor : color;
    const [mr, mg, mb] = parseHexRgb(midCol);
    const isDarkFill = mr * 0.299 + mg * 0.587 + mb * 0.114 < 95;
    const topCol = isDarkFill ? PAL.gbDark : isHl ? PAL.goldLight : '#FFFFFF';
    const botCol = isDarkFill ? midCol : isHl ? PAL.goldDark : PAL.creamDim;
    return getPixelGlyphSprite(ch, gridPx, topCol, midCol, botCol, outlineColor, shadowColor, true);
  });

  const widths = sprites.map((sp) => (sp ? sp.w * baseScale : fontSize * 0.45));
  let totalW = widths.reduce((a, b) => a + b, 0) + tracking * (chars.length - 1);
  let scaleFit = 1;
  if (maxWidth && totalW > maxWidth) {
    scaleFit = maxWidth / totalW;
    totalW = maxWidth;
  }

  ctx.save();
  ctx.imageSmoothingEnabled = false;

  // Optional classic 16-bit RPG notched frame plaque behind headline
  if (plaqueBg) {
    const plaqueP = easeOutExpo(clamp01((localTime - Math.max(0, startDelay - 0.06)) / 0.28));
    if (plaqueP > 0.02) {
      const padX = fontSize * 0.52;
      const padY = fontSize * 0.28;
      const pw = Math.round((totalW + padX * 2) * plaqueP);
      const ph = Math.round(fontSize * scaleFit + padY * 2);
      const bx = Math.round(cx - pw / 2);
      const by = Math.round(cy - ph / 2);
      const pxStep = Math.max(4, Math.round(baseScale));

      // Hard stepped pixel drop shadow
      ctx.fillStyle = 'rgba(8, 10, 18, 0.78)';
      ctx.fillRect(bx + pxStep * 2, by + pxStep * 2, pw, ph);

      ctx.fillStyle = plaqueBg;
      ctx.fillRect(bx, by, pw, ph);

      // Stepped pixel outer & inner border
      const bCol = plaqueBorder ?? PAL.gold;
      ctx.fillStyle = bCol;
      ctx.fillRect(bx, by, pw, pxStep);
      ctx.fillRect(bx, by + ph - pxStep, pw, pxStep);
      ctx.fillRect(bx, by, pxStep, ph);
      ctx.fillRect(bx + pw - pxStep, by, pxStep, ph);

      ctx.fillStyle = 'rgba(246, 238, 216, 0.24)';
      ctx.fillRect(bx + pxStep * 2, by + pxStep * 2, Math.max(0, pw - pxStep * 4), 2);
      ctx.fillRect(bx + pxStep * 2, by + ph - pxStep * 2 - 2, Math.max(0, pw - pxStep * 4), 2);

      // Pixel corner rivets
      ctx.fillStyle = bCol;
      const rOff = pxStep * 2 + 2;
      ctx.fillRect(bx + rOff, by + rOff, pxStep, pxStep);
      ctx.fillRect(bx + pw - rOff - pxStep, by + rOff, pxStep, pxStep);
      ctx.fillRect(bx + rOff, by + ph - rOff - pxStep, pxStep, pxStep);
      ctx.fillRect(bx + pw - rOff - pxStep, by + ph - rOff - pxStep, pxStep, pxStep);
    }
  }

  let cursorX = cx - totalW / 2;

  for (let i = 0; i < chars.length; i++) {
    const sp = sprites[i];
    const cw = widths[i] * scaleFit;
    const charCx = cursorX + cw / 2;
    cursorX += cw + tracking * scaleFit;
    if (!sp) continue;

    const rawP = getStaggerProgress(localTime, i, startDelay, stagger, duration);
    if (rawP <= 0.005) continue;

    const popScale = lerp(0.55, 1.0, easeOutBack(rawP, 1.35));
    const dropY = lerp(-fontSize * 0.24, 0, easeOutExpo(rawP));
    const alpha = clamp01(rawP * 3);
    const drawScale = baseScale * scaleFit * popScale;
    const drawW = sp.canvas.width * drawScale;
    const drawH = sp.canvas.height * drawScale;

    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(
      sp.canvas,
      Math.round(charCx - drawW / 2),
      Math.round(cy + dropY - drawH / 2),
      Math.round(drawW),
      Math.round(drawH)
    );
    ctx.restore();
  }

  ctx.restore();
}

/**
 * Draw a compact 16-bit pixelated HUD badge / chapter stamp (e.g. "STAGE 01 · 第一阶段").
 */
export function drawPixelHudTag(
  ctx: CanvasRenderingContext2D,
  label: string,
  cx: number,
  cy: number,
  fontSize: number,
  progress: number,
  options?: {
    bg?: string;
    border?: string;
    textColor?: string;
    align?: CanvasTextAlign;
  }
): void {
  const p = easeOutExpo(clamp01(progress));
  if (p <= 0.02) return;

  const bg = options?.bg ?? 'rgba(14, 17, 29, 0.92)';
  const border = options?.border ?? PAL.teal;
  const textColor = options?.textColor ?? PAL.cream;

  const gridPx = 24;
  const scale = Math.max(1.0, fontSize / gridPx);
  const chars = Array.from(label);
  const sprites = chars.map((ch) =>
    getPixelGlyphSprite(ch, gridPx, textColor, textColor, textColor, PAL.void, '#090B14', false)
  );
  const track = 1.5;
  let rawW = 0;
  for (let i = 0; i < sprites.length; i++) {
    rawW += (sprites[i]?.w ?? 6) + (i < sprites.length - 1 ? track : 0);
  }

  const tw = rawW * scale;
  const padX = Math.round(fontSize * 0.72);
  const padY = Math.round(fontSize * 0.38);
  const bw = Math.round(tw + padX * 2);
  const bh = Math.round(fontSize + padY * 2);
  const drawCx =
    options?.align === 'left' ? cx + bw / 2 : options?.align === 'right' ? cx - bw / 2 : cx;
  const bx = Math.round(drawCx - bw / 2);
  const by = Math.round(cy - bh / 2 + lerp(8, 0, p));

  ctx.save();
  ctx.globalAlpha = p;
  ctx.imageSmoothingEnabled = false;

  // Offset pixel shadow
  ctx.fillStyle = 'rgba(8, 10, 18, 0.76)';
  ctx.fillRect(bx + 4, by + 4, bw, bh);

  ctx.fillStyle = bg;
  ctx.fillRect(bx, by, bw, bh);

  // Crisp pixel 2px border
  ctx.fillStyle = border;
  ctx.fillRect(bx, by, bw, 2);
  ctx.fillRect(bx, by + bh - 2, bw, 2);
  ctx.fillRect(bx, by, 2, bh);
  ctx.fillRect(bx + bw - 2, by, 2, bh);

  let cursorX = drawCx - tw / 2;
  const textCy = by + bh / 2;
  for (let i = 0; i < sprites.length; i++) {
    const sp = sprites[i];
    if (!sp) continue;
    const dw = sp.canvas.width * scale;
    const dh = sp.canvas.height * scale;
    const gx = cursorX + (sp.w * scale) / 2;
    ctx.drawImage(sp.canvas, Math.round(gx - dw / 2), Math.round(textCy - dh / 2), Math.round(dw), Math.round(dh));
    cursorX += (sp.w + track) * scale;
  }

  ctx.restore();
}

/**
 * Draw authentic 16-bit JRPG dialog-box lower-third subtitles with crisp pixel-snapped Chinese text
 * and a bobbing golden pixel cursor arrow!
 */
export function drawPixelSubtitleBar(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  isPortrait: boolean,
  cue: SrtCue | null,
  time: number
): void {
  if (!cue) return;
  const elapsed = time - cue.start;
  const remaining = cue.end - time;
  const fadeIn = easeOutCubic(clamp01(elapsed / 0.12));
  const fadeOut = clamp01(remaining / 0.08);
  const alpha = Math.min(fadeIn, Math.max(0.35, fadeOut));

  const targetFontSize = isPortrait ? Math.round(w * 0.036) : Math.round(h * 0.032);
  const y = Math.round(h * (isPortrait ? 0.885 : 0.905));
  const maxW = w * 0.84;

  // Measure crisp 16px pixel glyphs scaled 2x -> unmistakable crisp 16-bit RPG dialog text
  const gridPx = 16;
  const chars = Array.from(cue.text);
  const sprites = chars.map((ch) =>
    getPixelGlyphSprite(ch, gridPx, '#FFFDF5', PAL.cream, PAL.creamDim, PAL.void, '#090B14', false)
  );
  const track = 1;
  let rawW = 0;
  for (let i = 0; i < sprites.length; i++) {
    rawW += (sprites[i]?.w ?? 7) + (i < sprites.length - 1 ? track : 0);
  }
  let scale = Math.max(1.8, targetFontSize / gridPx);
  if (rawW * scale > maxW) {
    scale = maxW / Math.max(1, rawW);
  }

  const textW = rawW * scale;
  const padX = Math.round(targetFontSize * 0.95);
  const padY = Math.round(targetFontSize * 0.44);
  const boxW = Math.round(textW + padX * 2 + 12);
  const boxH = Math.round(gridPx * scale + padY * 2);
  const bx = Math.round(w * 0.5 - boxW / 2);
  const by = Math.round(y - boxH / 2);

  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.imageSmoothingEnabled = false;

  // Stepped RPG box drop shadow
  ctx.fillStyle = 'rgba(7, 9, 16, 0.78)';
  ctx.fillRect(bx + 5, by + 5, boxW, boxH);

  // Deep RPG midnight indigo dialog fill
  ctx.fillStyle = 'rgba(18, 22, 36, 0.94)';
  ctx.fillRect(bx, by, boxW, boxH);

  // Authentic notched 16-bit outer cream frame & inner teal trim
  ctx.fillStyle = PAL.cream;
  ctx.fillRect(bx + 3, by, boxW - 6, 3);
  ctx.fillRect(bx + 3, by + boxH - 3, boxW - 6, 3);
  ctx.fillRect(bx, by + 3, 3, boxH - 6);
  ctx.fillRect(bx + boxW - 3, by + 3, 3, boxH - 6);

  ctx.fillStyle = PAL.teal;
  ctx.fillRect(bx + 6, by + 5, boxW - 12, 2);
  ctx.fillRect(bx + 6, by + boxH - 7, boxW - 12, 2);
  ctx.fillRect(bx + 5, by + 6, 2, boxH - 12);
  ctx.fillRect(bx + boxW - 7, by + 6, 2, boxH - 12);

  // Blit crisp pixel-snapped Chinese dialogue glyphs
  let cursorX = w * 0.5 - textW / 2 - 4;
  for (let i = 0; i < sprites.length; i++) {
    const sp = sprites[i];
    if (!sp) continue;
    const dw = sp.canvas.width * scale;
    const dh = sp.canvas.height * scale;
    const gx = cursorX + (sp.w * scale) / 2;
    ctx.drawImage(sp.canvas, Math.round(gx - dw / 2), Math.round(y - dh / 2), Math.round(dw), Math.round(dh));
    cursorX += (sp.w + track) * scale;
  }

  // Classic bobbing golden 16-bit RPG "next dialogue" pixel triangle on right edge!
  const bobY = Math.floor(time * 5) % 2 === 0 ? 0 : 3;
  const ax = bx + boxW - 18;
  const ay = by + boxH - 15 + bobY;
  ctx.fillStyle = PAL.goldLight;
  ctx.fillRect(ax, ay, 8, 2);
  ctx.fillRect(ax + 2, ay + 2, 4, 2);
  ctx.fillRect(ax + 3, ay + 4, 2, 2);

  ctx.restore();
}
