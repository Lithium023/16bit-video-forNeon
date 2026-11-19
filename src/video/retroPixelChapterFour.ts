import {
  PAL,
  SPRITE_FROZEN_BOT,
  SPRITE_PIXEL_THINKER,
  drawDitheredGlow,
  drawDitheredSky,
  drawSprite,
  pxBitmapText,
  pxCircle,
  pxCloud,
  pxLine,
  pxOutline,
  pxPineTree,
  pxRect,
  pxRing,
  pxSparkle,
  pxStarfield,
} from './pixelSprites';
import { clamp01, easeOutBack, easeOutCubic, easeOutExpo, lerp, smoothstep } from './timeline';

// Helper: 16-bit hanging icicle fringe along top edge
function drawIcicleFringe(
  g: CanvasRenderingContext2D,
  pw: number,
  amount: number,
  seedOffset = 0
): void {
  if (amount <= 0.02) return;
  for (let x = 6; x < pw - 6; x += 16) {
    const baseLen = 5 + (((x + seedOffset) * 13) % 13);
    const len = Math.max(1, Math.round(baseLen * amount));
    for (let r = 0; r < len; r++) {
      const iw = Math.max(1, Math.round((1 - r / Math.max(1, len)) * 5));
      pxRect(g, x - Math.floor(iw / 2), r, iw, 1, r < 2 ? PAL.iceWhite : PAL.iceLight);
    }
  }
}

// Helper: layered falling pixel blizzard
function drawSnowStorm(
  g: CanvasRenderingContext2D,
  pw: number,
  ph: number,
  time: number,
  count: number,
  windX = -22,
  fallSpeed = 24
): void {
  for (let i = 0; i < count; i++) {
    const layer = i % 3;
    const vx = windX * (0.65 + layer * 0.35);
    const vy = fallSpeed * (0.7 + layer * 0.4);
    const sx = Math.floor((((i * 53.7 + time * vx + Math.sin(time * 2.1 + i) * 5) % pw) + pw) % pw);
    const sy = Math.floor(((i * 29.3 + time * vy) % ph + ph) % ph);
    const sz = layer === 2 ? 2 : 1;
    pxRect(g, sx, sy, sz, sz, layer === 0 ? PAL.ice : PAL.iceWhite);
  }
}

// ============================================================================
// SCENE 21 (95.73–100.43s): Stage 2 — Ideal Utopia vs Frozen Reality Split
// Cues 51–54: 第二阶段 / 幻灭与寒冬 / 理想很丰满 / 现实很骨感
// ============================================================================
export function drawPixelSceneStageTwoWinter(
  g: CanvasRenderingContext2D,
  pw: number,
  ph: number,
  time: number,
  localTime: number,
  _energy: number
): void {
  const splitX = Math.floor(pw * 0.5);
  const contrastP = smoothstep(1.9, 3.6, localTime);

  // Left half: Warm golden utopia sky + floating fantasy island & castle
  g.save();
  g.beginPath();
  g.rect(0, 0, splitX, ph);
  g.clip();

  drawDitheredSky(g, splitX, ph, [
    { stop: 0, color: '#241836' },
    { stop: 0.38, color: '#4A2B45' },
    { stop: 0.72, color: '#965222' },
    { stop: 0.9, color: '#C27E28' },
  ]);
  drawDitheredGlow(g, Math.floor(splitX * 0.5), Math.floor(ph * 0.52), 54, PAL.goldLight, 'light');
  pxCloud(g, Math.floor(splitX * 0.25) + Math.sin(time * 0.7) * 5, Math.floor(ph * 0.44), 16, PAL.goldLight, PAL.coralLight);
  pxCloud(g, Math.floor(splitX * 0.76) - Math.sin(time * 0.6) * 4, Math.floor(ph * 0.48), 14, PAL.cream, PAL.gold);

  // Floating utopia island with golden castle spires
  const islandX = Math.floor(splitX * 0.5);
  const islandY = Math.floor(ph * 0.68 + Math.sin(time * 2.2) * 3);
  pxRect(g, islandX - 38, islandY, 76, 6, PAL.tealLight);
  pxRect(g, islandX - 32, islandY + 6, 64, 5, PAL.amber);
  pxRect(g, islandX - 22, islandY + 11, 44, 5, PAL.dusk);
  pxRect(g, islandX - 10, islandY + 16, 20, 4, PAL.plum);

  pxRect(g, islandX - 22, islandY - 18, 44, 18, PAL.creamDim);
  pxRect(g, islandX - 10, islandY - 30, 20, 30, PAL.cream);
  pxRect(g, islandX - 26, islandY - 24, 10, 24, PAL.cream);
  pxRect(g, islandX + 16, islandY - 24, 10, 24, PAL.cream);
  for (let r = 0; r < 9; r++) {
    pxRect(g, islandX - (9 - r), islandY - 30 - r, (9 - r) * 2, 1, PAL.gold);
    pxRect(g, islandX - 21 - Math.floor(6 - r * 0.6), islandY - 24 - r, Math.max(2, Math.floor((6 - r * 0.6) * 2)), 1, PAL.coral);
    pxRect(g, islandX + 21 - Math.floor(6 - r * 0.6), islandY - 24 - r, Math.max(2, Math.floor((6 - r * 0.6) * 2)), 1, PAL.coral);
  }
  pxRect(g, islandX - 4, islandY - 12, 8, 12, PAL.goldLight);
  pxSparkle(g, islandX - 26, islandY - 36, 2 + (Math.floor(time * 4) % 2), PAL.goldLight);
  pxSparkle(g, islandX + 28, islandY - 32, 2, PAL.cream);
  g.restore();

  // Right half: Bleak frozen steel wasteland & shattered girder skeleton
  g.save();
  g.beginPath();
  g.rect(splitX, 0, pw - splitX, ph);
  g.clip();

  drawDitheredSky(g, pw, ph, [
    { stop: 0, color: '#0B1324' },
    { stop: 0.42, color: '#14243D' },
    { stop: 0.78, color: '#1F3A5C' },
  ]);

  const rcx = splitX + Math.floor((pw - splitX) * 0.5);
  const groundY = Math.floor(ph * 0.74);

  pxCircle(g, rcx + 30, Math.floor(ph * 0.4), 11, PAL.iceLight);
  pxCircle(g, rcx + 33, Math.floor(ph * 0.38), 10, '#14243D');

  pxRect(g, splitX, groundY, pw - splitX, ph - groundY, PAL.iceDeep);
  pxRect(g, splitX, groundY, pw - splitX, 3, PAL.ice);

  const tx = rcx - 8;
  pxRect(g, tx - 18, groundY - 36, 3, 36, PAL.slate);
  pxRect(g, tx + 18, groundY - 28, 3, 28, PAL.slate);
  pxRect(g, tx - 2, groundY - 46, 3, 46, PAL.slateLight);
  pxLine(g, tx - 17, groundY - 32, tx + 18, groundY - 22, PAL.slate, 1);
  pxLine(g, tx - 17, groundY - 18, tx + 18, groundY - 8, PAL.slate, 1);
  pxLine(g, tx - 17, groundY - 8, tx - 1, groundY - 26, PAL.iceMid, 1);

  drawSprite(
    g,
    SPRITE_FROZEN_BOT,
    { I: PAL.iceWhite, C: PAL.iceLight, S: PAL.iceMid, B: PAL.iceDeep, D: PAL.navy },
    rcx + 26,
    groundY - 9,
    2
  );

  drawSnowStorm(g, pw, ph, time, 28, -16, 22);
  g.restore();

  const shakeX = contrastP > 0.3 ? Math.round(Math.sin(time * 26) * contrastP * 1.4) : 0;
  for (let y = 0; y < ph; y += 6) {
    const zig = ((y / 6) % 2 === 0 ? -2 : 2) + shakeX;
    pxRect(g, splitX + zig - 1, y, 3, 6, PAL.void);
    pxRect(g, splitX + zig, y, 1, 6, PAL.iceWhite);
  }
  drawIcicleFringe(g, pw, contrastP * 0.45, 7);
}

// ============================================================================
// SCENE 22 (100.43–103.87s): Cold Water Poured on Campfire Frenzy
// Cues 55–56: 然而 / 现实很快给狂热的人们泼了一盆冷水
// ============================================================================
export function drawPixelSceneColdWaterSplash(
  g: CanvasRenderingContext2D,
  pw: number,
  ph: number,
  time: number,
  localTime: number,
  energy: number
): void {
  const cx = Math.floor(pw * 0.5);
  const pourP = smoothstep(0.55, 1.3, localTime);
  const douseP = smoothstep(1.1, 2.2, localTime);

  drawDitheredSky(g, pw, ph, [
    { stop: 0, color: '#0D1322' },
    { stop: 0.45, color: '#172138' },
    { stop: 0.8, color: '#21314E' },
  ]);
  pxStarfield(g, pw, ph, time, 28, 0.55);

  const floorY = Math.floor(ph * 0.78);
  pxRect(g, 0, floorY, pw, ph - floorY, '#192235');
  pxRect(g, 0, floorY, pw, 2, PAL.slate);

  const fireX = cx;
  const fireY = floorY - 3;
  pxRect(g, fireX - 18, fireY - 2, 36, 5, '#4A3127');
  pxRect(g, fireX - 14, fireY - 5, 28, 4, '#6B4433');

  const flameLife = 1 - douseP;
  if (flameLife > 0.05) {
    drawDitheredGlow(g, fireX, fireY - 12, Math.round(44 * flameLife), PAL.gold, 'light');
    const fh = Math.round((24 + energy * 8) * flameLife);
    pxCircle(g, fireX, fireY - fh * 0.45, Math.max(2, Math.round(11 * flameLife)), PAL.coral);
    pxCircle(g, fireX, fireY - fh * 0.55, Math.max(2, Math.round(7 * flameLife)), PAL.gold);
    pxCircle(g, fireX, fireY - fh * 0.35, Math.max(1, Math.round(4 * flameLife)), PAL.goldLight);
  }

  const botPal: Record<string, string> = {
    I: douseP > 0.4 ? PAL.iceWhite : PAL.goldLight,
    C: douseP > 0.4 ? PAL.iceLight : PAL.cream,
    S: PAL.iceMid,
    B: PAL.navyDark,
    D: PAL.void,
  };
  drawSprite(g, SPRITE_FROZEN_BOT, botPal, fireX - 42, floorY - 10, 2);

  // Giant tilted wooden/iron cold-water bucket entering smoothly from upper right
  const bucketEnter = easeOutBack(clamp01((localTime - 0.12) / 0.55), 1.1);
  const bx = Math.round(lerp(pw + 34, fireX + 44, bucketEnter));
  const by = Math.floor(ph * 0.46);

  pxRect(g, bx - 14, by - 10, 26, 22, PAL.slate);
  pxRect(g, bx - 12, by - 8, 22, 18, PAL.navyLight);
  pxRect(g, bx - 14, by - 4, 26, 3, PAL.iceLight);
  pxRect(g, bx - 14, by + 5, 26, 3, PAL.iceLight);
  pxOutline(g, bx - 15, by - 11, 28, 24, PAL.void, 1);

  if (pourP > 0.02) {
    const streamTopX = bx - 15;
    const streamTopY = by + 2;
    const streamReachY = lerp(streamTopY, fireY, pourP);
    for (let y = streamTopY; y <= streamReachY; y += 2) {
      const tFrac = (y - streamTopY) / Math.max(1, fireY - streamTopY);
      const sx = Math.round(lerp(streamTopX, fireX, Math.pow(tFrac, 0.72)));
      const sw = Math.round(lerp(8, 22, tFrac));
      const ripple = Math.round(Math.sin(time * 28 + y * 0.4) * 2);
      pxRect(g, sx - Math.floor(sw / 2) + ripple, y, sw, 3, PAL.ice);
      pxRect(g, sx - Math.floor(sw / 3) + ripple, y, Math.max(2, Math.floor(sw * 0.55)), 2, PAL.iceLight);
      if (((y + Math.floor(time * 40)) & 7) < 3) {
        pxRect(g, sx + ripple, y, 2, 2, PAL.iceWhite);
      }
    }

    if (douseP > 0.05) {
      const pudW = Math.round(lerp(16, 130, douseP));
      pxRect(g, fireX - Math.floor(pudW / 2), floorY, pudW, 4, PAL.ice);
      pxRect(g, fireX - Math.floor(pudW * 0.35), floorY + 1, Math.floor(pudW * 0.7), 2, PAL.iceWhite);

      for (let i = 0; i < 14; i++) {
        const phase = (time * 3.4 + i * 0.31) % 1;
        const dir = i % 2 === 0 ? 1 : -1;
        const dx = dir * (10 + (i % 5) * 9) * phase;
        const dy = -Math.sin(phase * Math.PI) * (18 + (i % 4) * 8);
        pxRect(g, fireX + dx, fireY + dy, 2, 2, i % 2 === 0 ? PAL.iceWhite : PAL.iceLight);
      }

      for (let s = 0; s < 6; s++) {
        const sp = (time * 0.85 + s * 0.19) % 1;
        const sx = fireX + Math.sin(s * 2.1 + time * 2) * 18;
        const sy = fireY - 8 - sp * 46;
        const sr = Math.max(2, Math.round(lerp(8, 3, sp)));
        pxCircle(g, sx, sy, sr, sp < 0.5 ? PAL.creamDim : PAL.slateLight);
      }
    }
  }
}

// ============================================================================
// SCENE 23 (103.87–115.13s): 1970s Complex Mind -> Morphing Decision Tree Swamp
// Cues 57–61: 70年代 / 人类思维远比想象复杂 / 组合爆炸的泥潭 (ZERO internal hard cut!)
// ============================================================================
export function drawPixelSceneCombinatorialExplosion(
  g: CanvasRenderingContext2D,
  pw: number,
  ph: number,
  time: number,
  localTime: number,
  _energy: number
): void {
  const cx = Math.floor(pw * 0.5);
  // Smooth continuous morph from Mind Constellation (0..4.5s) -> Branching IF Tree (4.5..11.2s)
  const treeMorph = smoothstep(4.2, 5.1, localTime);
  const swampP = smoothstep(7.8, 10.6, localTime);

  drawDitheredSky(g, pw, ph, [
    { stop: 0, color: '#111022' },
    { stop: 0.45, color: '#1D1833' },
    { stop: 0.82, color: '#2B1F3A' },
  ]);
  pxStarfield(g, pw, ph, time, 32, 0.65);

  // Layer 1: Human Mind Constellation gliding upward and fading cleanly out as Tree unfurls
  if (treeMorph < 0.99) {
    const webP = easeOutExpo(clamp01(localTime / 1.4));
    const liftY = Math.round(treeMorph * -ph * 0.34);
    const cy = Math.floor(ph * 0.6) + liftY;
    g.save();
    g.globalAlpha = 1 - treeMorph;

    drawDitheredGlow(g, cx, cy, Math.round(52 * webP), PAL.teal, 'light');
    pxRing(g, cx, cy, Math.round(36 * webP), PAL.slate, 1);
    pxRing(g, cx, cy, Math.round(22 * webP), PAL.tealDark, 1);

    const nodeCount = 12;
    const pts: Array<[number, number]> = [];
    for (let i = 0; i < nodeCount; i++) {
      const a = (i / nodeCount) * Math.PI * 2 + time * 0.32;
      const rad = (i % 2 === 0 ? 38 : 22) * webP;
      pts.push([Math.round(cx + Math.cos(a) * rad * 1.45), Math.round(cy + Math.sin(a) * rad * 0.85)]);
    }
    for (let i = 0; i < pts.length; i++) {
      const [x1, y1] = pts[i];
      const [x2, y2] = pts[(i + 3) % pts.length];
      const [x3, y3] = pts[(i + 5) % pts.length];
      pxLine(g, x1, y1, x2, y2, PAL.tealDark, 1);
      if (localTime > 2.2) {
        pxLine(g, x1, y1, x3, y3, i % 3 === 0 ? PAL.goldDark : PAL.slate, 1);
      }
    }
    for (let i = 0; i < pts.length; i++) {
      pxCircle(g, pts[i][0], pts[i][1], 2, i % 3 === 0 ? PAL.goldLight : PAL.tealLight);
    }

    const thinkPal: Record<string, string> = { S: PAL.cream, D: PAL.void, T: PAL.teal };
    drawSprite(g, SPRITE_PIXEL_THINKER, thinkPal, cx - 78, Math.floor(ph * 0.8) - liftY * 0.5, 2);
    drawSprite(g, SPRITE_PIXEL_THINKER, thinkPal, cx + 78, Math.floor(ph * 0.8) - liftY * 0.5, 2);
    pxBitmapText(g, '1970S', cx, Math.floor(ph * 0.85) - liftY * 0.5, 1, PAL.goldLight, PAL.void);
    g.restore();
  }

  // Layer 2: Exponentially Branching IF Decision Tree unfurling smoothly down into Swamp!
  if (treeMorph > 0.02) {
    const tt = Math.max(0, localTime - 4.4);
    const depthProg = clamp01(tt / 3.4);
    const rootY = Math.floor(lerp(ph * 0.52, ph * 0.38, easeOutCubic(treeMorph)));

    g.save();
    g.globalAlpha = treeMorph;

    const maxLevels = 5;
    let prevNodes: Array<[number, number]> = [[cx, rootY]];
    for (let lvl = 1; lvl <= maxLevels; lvl++) {
      const lvlAlpha = clamp01(depthProg * maxLevels - (lvl - 1));
      if (lvlAlpha <= 0.02) break;
      const nextNodes: Array<[number, number]> = [];
      const span = Math.max(7, Math.floor((pw * 0.42) / Math.pow(1.9, lvl - 1)));
      const dy = Math.floor(ph * 0.082);
      const lineCol = lvl >= 4 ? PAL.coral : lvl === 3 ? PAL.gold : PAL.tealLight;

      for (const [px0, py0] of prevNodes) {
        for (const dir of [-1, 1]) {
          const nx = Math.round(px0 + dir * span * lvlAlpha);
          const ny = Math.round(py0 + dy * lvlAlpha);
          pxLine(g, px0, py0, nx, ny, lineCol, 1);
          nextNodes.push([nx, ny]);
        }
      }
      for (const [nx, ny] of nextNodes) {
        pxRect(g, nx - 1, ny - 1, 3, 3, lvl >= 4 ? PAL.coralLight : PAL.goldLight);
      }
      prevNodes = nextNodes;
    }

    pxRect(g, cx - 13, rootY - 5, 26, 11, PAL.navyDark);
    pxOutline(g, cx - 13, rootY - 5, 26, 11, PAL.goldLight, 1);
    pxBitmapText(g, 'IF?', cx, rootY, 1, PAL.goldLight);

    if (swampP > 0.02) {
      const swampTop = Math.floor(lerp(ph, ph * 0.72, swampP));
      pxRect(g, 0, swampTop, pw, ph - swampTop, '#24182E');
      pxRect(g, 0, swampTop, pw, 3, '#4A2B45');
      for (let b = 0; b < 9; b++) {
        const bx = Math.floor((b + 0.5) * (pw / 9));
        const bp = (time * 1.8 + b * 0.37) % 1;
        const br = Math.max(1, Math.round(Math.sin(bp * Math.PI) * 5));
        pxCircle(g, bx, swampTop + 6 + (b % 3) * 5, br, '#6E3E52');
        pxRect(g, bx - 1, swampTop + 5 + (b % 3) * 5, 1, 1, PAL.coralLight);
      }

      const sinkY = Math.round(lerp(swampTop - 8, swampTop + 6, swampP));
      const wiggle = Math.round(Math.sin(time * 14) * 2);
      const botPal: Record<string, string> = {
        I: PAL.goldLight,
        C: PAL.creamDim,
        S: PAL.slate,
        B: PAL.coral,
        D: PAL.void,
      };
      g.save();
      g.beginPath();
      g.rect(0, 0, pw, swampTop + 8);
      g.clip();
      drawSprite(g, SPRITE_FROZEN_BOT, botPal, cx + wiggle, sinkY, 2);
      g.restore();
    }

    g.restore();
  }
}

// ============================================================================
// SCENE 24 (115.13–122.17s): Overloaded 1970s Mainframe & CPU/RAM Redline
// Cues 62–64: 规则写得越多 / 算力和内存呈指数级暴涨 / 当时的计算机根本扛不住
// ============================================================================
export function drawPixelSceneMainframeOverload(
  g: CanvasRenderingContext2D,
  pw: number,
  ph: number,
  time: number,
  localTime: number,
  energy: number
): void {
  const cx = Math.floor(pw * 0.5);
  const loadP = clamp01(localTime / 5.0);
  const overload = smoothstep(4.0, 5.3, localTime);
  const shakeX = overload > 0.05 ? Math.round(Math.sin(time * 54) * overload * 3) : 0;
  const shakeY = overload > 0.05 ? Math.round(Math.cos(time * 48) * overload * 2) : 0;

  drawDitheredSky(g, pw, ph, [
    { stop: 0, color: overload > 0.4 && Math.floor(time * 8) % 2 === 0 ? '#2B121D' : '#141122' },
    { stop: 0.5, color: '#21182E' },
    { stop: 0.85, color: '#2E1E32' },
  ]);

  const floorY = Math.floor(ph * 0.84);
  pxRect(g, 0, floorY, pw, ph - floorY, '#1A1624');
  pxRect(g, 0, floorY, pw, 2, PAL.slate);

  const mw = 96;
  const mh = 76;
  const mx = cx - Math.floor(mw / 2) + shakeX;
  const my = floorY - mh + shakeY;

  pxRect(g, mx, my, mw, mh, '#3A435E');
  pxRect(g, mx + 3, my + 3, mw - 6, mh - 6, '#262D45');
  pxOutline(g, mx, my, mw, mh, PAL.void, 2);
  pxRect(g, mx + 2, my + 2, mw - 4, 2, PAL.slateLight);

  for (const rOff of [-22, 22]) {
    const rx = mx + Math.floor(mw / 2) + rOff;
    const ry = my + 21;
    pxCircle(g, rx, ry, 13, PAL.navyDark);
    pxRing(g, rx, ry, 12, PAL.creamDim, 1);
    const spinA = time * lerp(4, 24, loadP) * (rOff < 0 ? 1 : -1);
    for (let s = 0; s < 3; s++) {
      const a = spinA + (s / 3) * Math.PI * 2;
      pxLine(g, rx, ry, rx + Math.cos(a) * 9, ry + Math.sin(a) * 9, PAL.gold, 1);
    }
    pxCircle(g, rx, ry, 3, PAL.coral);
  }

  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 10; col++) {
      const blink = Math.floor(time * (6 + loadP * 16) + row * 7 + col * 3) % 3;
      const ledCol =
        overload > 0.35
          ? blink === 0
            ? PAL.coral
            : PAL.coralDark
          : blink === 0
            ? PAL.goldLight
            : blink === 1
              ? PAL.tealLight
              : PAL.navyLight;
      pxRect(g, mx + 12 + col * 7, my + 42 + row * 6, 4, 3, ledCol);
    }
  }

  pxRect(g, mx + 10, my + 61, mw - 20, 10, PAL.void);
  const statusText = overload > 0.3 ? 'OVERLOAD!' : 'RULES:999';
  const statusCol = overload > 0.3 ? (Math.floor(time * 10) % 2 === 0 ? PAL.coralLight : PAL.goldLight) : PAL.tealLight;
  pxBitmapText(g, statusText, mx + Math.floor(mw / 2), my + 66, 1, statusCol);

  const gaugeH = 68;
  const gaugeY = floorY - gaugeH;
  const gauges = [
    { x: mx - 42, label: 'CPU', val: Math.pow(loadP, 1.8) },
    { x: mx + mw + 22, label: 'RAM', val: Math.pow(loadP, 2.2) },
  ];
  for (const gauge of gauges) {
    if (gauge.x < 8 || gauge.x + 20 > pw - 8) continue;
    pxRect(g, gauge.x, gaugeY, 20, gaugeH, PAL.navyDark);
    pxOutline(g, gauge.x, gaugeY, 20, gaugeH, PAL.slateLight, 1);
    const fillH = Math.max(4, Math.round((gaugeH - 6) * clamp01(gauge.val * 1.15 + energy * 0.06)));
    const segs = Math.floor(fillH / 4);
    for (let s = 0; s < segs; s++) {
      const frac = s / Math.max(1, Math.floor((gaugeH - 6) / 4));
      const c = frac > 0.72 ? PAL.coral : frac > 0.42 ? PAL.gold : PAL.tealLight;
      pxRect(g, gauge.x + 3, gaugeY + gaugeH - 5 - s * 4, 14, 3, c);
    }
    pxBitmapText(g, gauge.label, gauge.x + 10, gaugeY - 7, 1, PAL.cream, PAL.void);
  }

  for (let i = 0; i < 6; i++) {
    const cp = (time * 1.5 + i * 0.17) % 1;
    const fromLeft = i % 2 === 0;
    const cardX = Math.round(lerp(fromLeft ? 8 : pw - 18, cx, cp));
    const cardY = Math.round(lerp(ph * 0.42 + (i % 3) * 14, my + 32, cp));
    pxRect(g, cardX - 6, cardY - 3, 12, 7, PAL.goldLight);
    pxRect(g, cardX - 4, cardY - 1, 8, 1, PAL.amber);
    pxRect(g, cardX - 4, cardY + 1, 5, 1, PAL.amber);
  }

  if (overload > 0.05) {
    for (let s = 0; s < 10; s++) {
      const sp = (time * 1.3 + s * 0.11) % 1;
      const sx = cx + Math.sin(s * 2.4 + time * 3) * (16 + sp * 22);
      const sy = my - 2 - sp * 42;
      const sr = Math.max(2, Math.round(lerp(4, 11, sp) * overload));
      pxCircle(g, sx, sy, sr, sp < 0.35 ? PAL.slate : PAL.navyLight);
    }
    for (let k = 0; k < 8; k++) {
      const kp = (time * 3.8 + k * 0.21) % 1;
      const dir = k % 2 === 0 ? 1 : -1;
      const kx = cx + dir * (22 + kp * 42);
      const ky = my + 12 + (k % 3) * 14 - Math.sin(kp * Math.PI) * 18;
      pxSparkle(g, kx, ky, 2, k % 2 === 0 ? PAL.goldLight : PAL.coralLight);
    }
  }
}

// ============================================================================
// SCENE 25 (122.17–127.70s): Overhyped Promises ("画大饼") Bursting to $0
// Cues 65–68: 此外 / 前期过度吹嘘 / 画大饼 / 迟迟拿不出实质性的商业成果
// ============================================================================
export function drawPixelSceneOverhypedPie(
  g: CanvasRenderingContext2D,
  pw: number,
  ph: number,
  time: number,
  localTime: number,
  energy: number
): void {
  const cx = Math.floor(pw * 0.5);

  drawDitheredSky(g, pw, ph, [
    { stop: 0, color: '#171222' },
    { stop: 0.5, color: '#271B30' },
    { stop: 0.85, color: '#382234' },
  ]);

  const floorY = Math.floor(ph * 0.82);
  pxRect(g, 0, floorY, pw, ph - floorY, '#1D1524');
  pxRect(g, 0, floorY, pw, 2, PAL.dusk);

  pxRect(g, cx - 32, floorY - 14, 64, 14, PAL.navyLight);
  pxRect(g, cx - 36, floorY - 17, 72, 4, PAL.goldDark);
  pxOutline(g, cx - 32, floorY - 14, 64, 14, PAL.void, 1);

  const popTime = 2.95;
  const pieY = Math.floor(ph * 0.57);

  if (localTime < popTime) {
    const swell = clamp01(localTime / (popTime - 0.1));
    const r = Math.round(lerp(18, 44, easeOutCubic(swell)) + energy * 2);
    const wobble = swell > 0.72 ? Math.round(Math.sin(time * 42) * 2) : 0;

    drawDitheredGlow(g, cx + wobble, pieY, r + 14, PAL.gold, 'light');
    pxCircle(g, cx + wobble, pieY, r + 2, PAL.amber);
    pxCircle(g, cx + wobble, pieY, r, PAL.gold);
    pxCircle(g, cx + wobble - 3, pieY - 3, Math.max(4, r - 6), PAL.goldLight);

    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2 + time * 0.5;
      pxRect(g, cx + wobble + Math.cos(a) * (r - 2) - 1, pieY + Math.sin(a) * (r - 2) - 1, 3, 3, PAL.amber);
    }
    pxBitmapText(g, 'AI 100%', cx + wobble, pieY, 1, PAL.void);

    if (localTime > 1.9) {
      const pinP = smoothstep(1.9, popTime, localTime);
      const pinX = Math.round(lerp(pw - 18, cx + r + 2, pinP));
      pxLine(g, pinX, pieY, pinX + 24, pieY - 8, PAL.iceWhite, 2);
      pxCircle(g, pinX + 25, pieY - 8, 4, PAL.coral);
    }
  } else {
    const pt = localTime - popTime;
    if (pt < 0.85) {
      const burst = easeOutExpo(clamp01(pt / 0.75));
      for (let i = 0; i < 18; i++) {
        const a = (i / 18) * Math.PI * 2;
        const dist = 14 + burst * (55 + (i % 3) * 18);
        const sx = cx + Math.cos(a) * dist;
        const sy = pieY + Math.sin(a) * dist + pt * pt * 35;
        pxRect(g, sx, sy, 3, 3, i % 3 === 0 ? PAL.goldLight : i % 3 === 1 ? PAL.coral : PAL.cream);
      }
      if (pt < 0.28) {
        pxBitmapText(g, 'POP!', cx, pieY - 12, 2, PAL.coralLight, PAL.void);
      }
    }

    const signP = easeOutBack(clamp01((pt - 0.15) / 0.4), 1.2);
    const sw = Math.round(48 * signP);
    const sh = Math.round(22 * signP);
    if (sw > 4) {
      pxRect(g, cx - Math.floor(sw / 2), floorY - 17 - sh, sw, sh, PAL.navyDark);
      pxOutline(g, cx - Math.floor(sw / 2), floorY - 17 - sh, sw, sh, PAL.slateLight, 1);
      if (signP > 0.7) {
        pxBitmapText(g, '$0', cx, floorY - 17 - Math.floor(sh / 2), 2, PAL.coralLight, PAL.void);
      }
    }
  }
}

// ============================================================================
// SCENE 26 (127.70–132.10s): US & UK Government/Military Slashing AI Funding
// Cues 69–70: 美国和英国的政府及军方 / 开始大幅削减 AI 研究经费
// ============================================================================
export function drawPixelSceneFundingCuts(
  g: CanvasRenderingContext2D,
  pw: number,
  ph: number,
  _time: number,
  localTime: number,
  _energy: number
): void {
  const cx = Math.floor(pw * 0.5);
  const cutP = smoothstep(1.7, 2.25, localTime);

  drawDitheredSky(g, pw, ph, [
    { stop: 0, color: '#141320' },
    { stop: 0.55, color: '#1F1B2E' },
    { stop: 0.88, color: '#291E30' },
  ]);

  const flagY = Math.floor(ph * 0.46);
  const flagGap = pw > 260 ? 58 : 44;

  // US Flag Badge
  const usX = cx - flagGap;
  pxRect(g, usX - 24, flagY - 14, 48, 28, PAL.cream);
  for (let s = 0; s < 7; s++) {
    pxRect(g, usX - 24, flagY - 14 + s * 4, 48, 2, PAL.coral);
  }
  pxRect(g, usX - 24, flagY - 14, 21, 14, '#254275');
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 4; c++) {
      pxRect(g, usX - 22 + c * 5, flagY - 12 + r * 4, 1, 1, PAL.cream);
    }
  }
  pxOutline(g, usX - 25, flagY - 15, 50, 30, PAL.gold, 1);
  pxBitmapText(g, 'USA', usX, flagY + 21, 1, PAL.cream, PAL.void);

  // UK Flag Badge
  const ukX = cx + flagGap;
  pxRect(g, ukX - 24, flagY - 14, 48, 28, '#203B73');
  pxLine(g, ukX - 23, flagY - 13, ukX + 23, flagY + 13, PAL.cream, 3);
  pxLine(g, ukX - 23, flagY + 13, ukX + 23, flagY - 13, PAL.cream, 3);
  pxLine(g, ukX - 23, flagY - 13, ukX + 23, flagY + 13, PAL.coral, 1);
  pxLine(g, ukX - 23, flagY + 13, ukX + 23, flagY - 13, PAL.coral, 1);
  pxRect(g, ukX - 24, flagY - 4, 48, 8, PAL.cream);
  pxRect(g, ukX - 4, flagY - 14, 8, 28, PAL.cream);
  pxRect(g, ukX - 24, flagY - 2, 48, 4, PAL.coral);
  pxRect(g, ukX - 2, flagY - 14, 4, 28, PAL.coral);
  pxOutline(g, ukX - 25, flagY - 15, 50, 30, PAL.gold, 1);
  pxBitmapText(g, 'UK', ukX, flagY + 21, 1, PAL.cream, PAL.void);

  const barW = Math.min(220, pw - 56);
  const barH = 22;
  const barX = cx - Math.floor(barW / 2);
  const barY = Math.floor(ph * 0.72);
  const cutSplitX = barX + Math.floor(barW * 0.28);

  pxRect(g, barX, barY, cutSplitX - barX, barH, PAL.teal);
  pxRect(g, barX + 2, barY + 2, Math.max(2, cutSplitX - barX - 4), 4, PAL.tealLight);
  pxOutline(g, barX, barY, cutSplitX - barX, barH, PAL.void, 1);

  const dropY = Math.round(cutP * cutP * 54);
  const dropX = Math.round(cutP * 14);
  if (barY + dropY < ph + 20) {
    const rightW = barX + barW - cutSplitX;
    pxRect(g, cutSplitX + dropX, barY + dropY, rightW, barH, cutP > 0.1 ? PAL.coralDark : PAL.teal);
    pxRect(g, cutSplitX + dropX + 2, barY + dropY + 2, rightW - 4, 4, cutP > 0.1 ? PAL.coral : PAL.tealLight);
    pxOutline(g, cutSplitX + dropX, barY + dropY, rightW, barH, PAL.void, 1);
    pxBitmapText(g, 'AI FUNDING', cutSplitX + dropX + Math.floor(rightW * 0.48), barY + dropY + 11, 1, PAL.cream, PAL.void);
  }

  const scisY = barY + Math.floor(barH / 2);
  const bladeOpen = lerp(16, 2, cutP);
  pxLine(g, cutSplitX - 2, scisY - bladeOpen, cutSplitX + 18, scisY + 4, PAL.iceWhite, 2);
  pxLine(g, cutSplitX - 2, scisY + bladeOpen, cutSplitX + 18, scisY - 4, PAL.iceWhite, 2);
  pxCircle(g, cutSplitX + 22, scisY - 7, 5, PAL.coral);
  pxCircle(g, cutSplitX + 22, scisY + 7, 5, PAL.coral);
  pxCircle(g, cutSplitX + 22, scisY - 7, 2, PAL.navyDark);
  pxCircle(g, cutSplitX + 22, scisY + 7, 2, PAL.navyDark);

  if (cutP > 0.25) {
    const post = localTime - 1.9;
    for (let c = 0; c < 10; c++) {
      const cp = clamp01((post - c * 0.06) / 1.1);
      if (cp <= 0) continue;
      const coinX = cutSplitX + 14 + c * 14 + cp * 18;
      const coinY = barY + 6 + cp * cp * 58;
      if (coinY < ph) {
        pxCircle(g, coinX, coinY, 3, PAL.gold);
        pxRect(g, coinX - 1, coinY - 1, 2, 2, PAL.goldLight);
      }
    }
    const stampP = easeOutBack(clamp01((post - 0.15) / 0.3), 1.3);
    if (stampP > 0.2) {
      const sx = cx + 44;
      const sy = barY - 16;
      pxRect(g, sx - 28, sy - 10, 56, 20, PAL.coralDark);
      pxOutline(g, sx - 28, sy - 10, 56, 20, PAL.coralLight, 2);
      pxBitmapText(g, 'CUT!', sx, sy, 2, PAL.cream, PAL.void);
    }
  }
}

// ============================================================================
// SCENE 27 (132.10–141.53s): The First AI Winter — Abandoned Snowed-In Lab
// Cues 71–73: 第一个AI寒冬 / 实验室门庭冷落，研究人员转行 / 长达十几年的沉寂
// ============================================================================
export function drawPixelSceneFirstAiWinter(
  g: CanvasRenderingContext2D,
  pw: number,
  ph: number,
  time: number,
  localTime: number,
  _energy: number
): void {
  const cx = Math.floor(pw * 0.5);

  drawDitheredSky(g, pw, ph, [
    { stop: 0, color: '#0B1324' },
    { stop: 0.45, color: '#13213A' },
    { stop: 0.85, color: '#1A2D4A' },
  ]);

  const winW = Math.min(110, Math.floor(pw * 0.34));
  const winH = Math.floor(ph * 0.38);
  const winX = cx - Math.floor(winW / 2);
  const winY = Math.floor(ph * 0.34);

  pxRect(g, winX, winY, winW, winH, '#0F223D');
  pxPineTree(g, winX + 20, winY + winH, 24, '#162D4C', '#22456E', PAL.iceLight);
  pxPineTree(g, winX + winW - 22, winY + winH, 28, '#162D4C', '#22456E', PAL.iceLight);
  g.save();
  g.beginPath();
  g.rect(winX, winY, winW, winH);
  g.clip();
  drawSnowStorm(g, pw, ph, time, 46, -24, 26);
  g.restore();

  pxRect(g, winX, winY + Math.floor(winH * 0.5), winW, 2, PAL.navyLight);
  pxRect(g, cx - 1, winY, 2, winH, PAL.navyLight);
  pxOutline(g, winX, winY, winW, winH, PAL.iceMid, 2);
  pxRect(g, winX + 2, winY + winH - 5, winW - 4, 4, PAL.iceWhite);
  pxRect(g, winX + 10, winY + winH - 7, winW - 24, 2, PAL.iceLight);

  const floorY = Math.floor(ph * 0.78);
  pxRect(g, 0, floorY, pw, ph - floorY, '#101B2E');
  pxRect(g, 0, floorY, pw, 2, PAL.iceMid);
  for (let dy = 0; dy < ph - floorY; dy++) {
    const spread = Math.floor(dy * 0.6);
    if ((dy & 1) === 0) {
      pxRect(g, winX - spread, floorY + dy, winW + spread * 2, 1, '#1A3150');
    }
  }

  const cabX = Math.max(12, winX - 66);
  const cabY = floorY - 56;
  pxRect(g, cabX, cabY, 44, 56, '#1C263B');
  pxOutline(g, cabX, cabY, 44, 56, PAL.void, 1);
  pxCircle(g, cabX + 13, cabY + 15, 7, PAL.navyDark);
  pxCircle(g, cabX + 31, cabY + 15, 7, PAL.navyDark);
  pxRect(g, cabX + 6, cabY + 30, 32, 8, PAL.void);
  if (Math.floor(time * 3) % 7 === 0) {
    pxRect(g, cabX + 8, cabY + 32, 2, 2, PAL.ice);
  }
  pxLine(g, cabX, cabY, cabX + 16, cabY + 14, PAL.iceLight, 1);
  pxLine(g, cabX, cabY + 6, cabX + 14, cabY + 8, PAL.slateLight, 1);
  pxLine(g, cabX + 6, cabY, cabX + 10, cabY + 16, PAL.slateLight, 1);

  const rightX = Math.min(pw - 56, winX + winW + 24);
  const sway = Math.round(Math.sin(time * 1.9) * 2);
  pxLine(g, rightX + 18, winY + 2, rightX + 18 + sway, winY + 14, PAL.slateLight, 1);
  pxRect(g, rightX + sway, winY + 14, 38, 15, '#253450');
  pxOutline(g, rightX + sway, winY + 14, 38, 15, PAL.iceLight, 1);
  pxBitmapText(g, 'CLOSED', rightX + 19 + sway, winY + 21, 1, PAL.iceWhite);

  const decadeYear = Math.round(lerp(1974, 1980, smoothstep(4.0, 8.6, localTime)));
  pxRect(g, rightX + 2, floorY - 34, 34, 16, PAL.navyDark);
  pxOutline(g, rightX + 2, floorY - 34, 34, 16, PAL.iceMid, 1);
  pxBitmapText(g, String(decadeYear), rightX + 19, floorY - 26, 1, PAL.iceLight);

  const walkP = smoothstep(2.4, 8.2, localTime);
  if (walkP > 0.01 && walkP < 0.99) {
    const rx = Math.round(lerp(cabX + 46, pw - 22, walkP));
    const stepBob = Math.floor(time * 6) % 2;
    const ry = floorY - 17 - stepBob;
    pxRect(g, rx - 3, ry - 6, 6, 5, PAL.creamDim);
    pxRect(g, rx - 4, ry - 7, 8, 2, PAL.navyDark);
    pxRect(g, rx - 3, ry - 1, 7, 2, PAL.coral);
    pxRect(g, rx - 4, ry + 1, 8, 9, PAL.slate);
    pxRect(g, rx - 3 + (stepBob ? 1 : -1), ry + 10, 2, 6, PAL.navyDark);
    pxRect(g, rx + 1 - (stepBob ? 1 : -1), ry + 10, 2, 6, PAL.navyDark);
    pxRect(g, rx + 3, ry + 1, 10, 8, PAL.goldDark);
    pxOutline(g, rx + 3, ry + 1, 10, 8, PAL.void, 1);
    pxRect(g, rx + 5, ry - 2, 3, 3, PAL.cream);
    pxRect(g, rx + 9, ry - 1, 2, 2, PAL.tealLight);
  }

  drawIcicleFringe(g, pw, 0.85, 19);
  drawSnowStorm(g, pw, ph, time, 20, -8, 12);
}

// ============================================================================
// SCENE 28 (141.53–146.20s): Unextinguished Scientific Spark & 1980s Thaw
// Cues 74–75: 不过科学的火种并没有熄灭 / 80年代初
// ============================================================================
export function drawPixelSceneEmberThaw1980s(
  g: CanvasRenderingContext2D,
  pw: number,
  ph: number,
  time: number,
  localTime: number,
  energy: number
): void {
  const cx = Math.floor(pw * 0.5);
  const thawP = smoothstep(0.5, 4.0, localTime);

  drawDitheredSky(g, pw, ph, [
    { stop: 0, color: thawP > 0.5 ? '#1B223B' : '#0E182E' },
    { stop: 0.45, color: thawP > 0.5 ? '#35314E' : '#182C4C' },
    { stop: 0.78, color: thawP > 0.5 ? '#7E4A3E' : '#254368' },
    { stop: 0.92, color: thawP > 0.5 ? '#D48A42' : '#3C6E99' },
  ]);
  pxStarfield(g, pw, ph, time, 28, 0.5);

  const groundY = Math.floor(ph * 0.76);
  pxRect(g, 0, groundY, pw, ph - groundY, PAL.iceDark);
  pxRect(g, 0, groundY, pw, 3, PAL.iceLight);

  const ringR = Math.round(lerp(14, 84, thawP));
  pxRect(g, cx - ringR, groundY, ringR * 2, ph - groundY, '#2A2330');
  pxRect(g, cx - ringR, groundY, ringR * 2, 3, PAL.goldDark);

  const flameY = groundY - 4;
  drawDitheredGlow(g, cx, flameY - 12, Math.round(lerp(24, 68, thawP) + energy * 8), PAL.gold, 'medium');
  const fh = Math.round(lerp(12, 28, thawP) + Math.sin(time * 12) * 2);
  pxCircle(g, cx, flameY - fh * 0.4, Math.round(fh * 0.42), PAL.coral);
  pxCircle(g, cx, flameY - fh * 0.5, Math.round(fh * 0.28), PAL.gold);
  pxCircle(g, cx, flameY - fh * 0.35, Math.round(fh * 0.16), PAL.cream);

  for (let i = 0; i < 16; i++) {
    const ep = (time * 0.75 + i * 0.17) % 1;
    const ex = cx + Math.sin(time * 3 + i * 2.1) * (12 + ep * 32);
    const ey = flameY - ep * 64;
    pxRect(g, ex, ey, 2, 2, i % 2 === 0 ? PAL.goldLight : PAL.coralLight);
  }

  if (localTime > 2.55) {
    pxBitmapText(g, '1980S', cx, Math.floor(ph * 0.87), 2, PAL.goldLight, PAL.void);
  }
}

// ============================================================================
// SCENE 29 (146.20–158.33s): 1980s Expert Systems Commercial Value
// Cues 76–79: 专家系统短暂回暖 / 写入规则库 / 模仿专家做决策 / 第一次有了商业落地价值
// ============================================================================
export function drawPixelSceneExpertSystems(
  g: CanvasRenderingContext2D,
  pw: number,
  ph: number,
  time: number,
  localTime: number,
  _energy: number
): void {
  const cx = Math.floor(pw * 0.5);
  const rulesFlowP = smoothstep(1.6, 4.2, localTime);
  const bizValueP = smoothstep(5.0, 8.4, localTime);

  drawDitheredSky(g, pw, ph, [
    { stop: 0, color: '#141B2B' },
    { stop: 0.45, color: '#1E2C3E' },
    { stop: 0.82, color: '#283A4A' },
  ]);

  const deskY = Math.floor(ph * 0.78);
  pxRect(g, 0, deskY, pw, ph - deskY, '#362724');
  pxRect(g, 0, deskY, pw, 3, '#6B4E3D');

  const spreadX = pw > 260 ? Math.floor(pw * 0.29) : Math.floor(pw * 0.3);
  const leftX = cx - spreadX;
  const rightX = cx + spreadX;
  const midY = deskY - 26;

  // 1. LEFT: Domain Expert
  pxRect(g, leftX - 24, deskY - 46, 48, 46, '#233044');
  pxOutline(g, leftX - 24, deskY - 46, 48, 46, PAL.teal, 1);
  const exY = deskY - 26;
  pxCircle(g, leftX, exY - 8, 7, PAL.cream);
  pxRect(g, leftX - 7, exY - 15, 14, 4, PAL.slateLight);
  pxRect(g, leftX - 5, exY - 9, 4, 3, PAL.tealLight);
  pxRect(g, leftX + 1, exY - 9, 4, 3, PAL.tealLight);
  pxRect(g, leftX - 10, exY, 20, 16, PAL.cream);
  pxRect(g, leftX - 2, exY, 4, 14, PAL.teal);
  pxRect(g, leftX - 21, deskY - 12, 12, 4, PAL.gold);
  pxRect(g, leftX - 20, deskY - 16, 11, 4, PAL.coral);
  pxRect(g, leftX - 21, deskY - 20, 12, 4, PAL.tealLight);
  pxBitmapText(g, 'EXPERT', leftX, deskY - 52, 1, PAL.goldLight, PAL.void);

  // 2. CENTER: 1980s Beige Expert System Workstation
  const pcW = 66;
  const pcH = 54;
  pxRect(g, cx - Math.floor(pcW / 2), deskY - pcH, pcW, pcH, PAL.creamDim);
  pxRect(g, cx - Math.floor(pcW / 2) + 2, deskY - pcH + 2, pcW - 4, 3, PAL.cream);
  pxOutline(g, cx - Math.floor(pcW / 2), deskY - pcH, pcW, pcH, PAL.void, 2);

  pxRect(g, cx - 26, deskY - pcH + 7, 52, 28, '#10241E');
  pxOutline(g, cx - 26, deskY - pcH + 7, 52, 28, PAL.navy, 1);
  const stepCycle = Math.floor(time * 2.4) % 3;
  pxBitmapText(g, 'IF', cx - 15, deskY - pcH + 15, 1, stepCycle === 0 ? PAL.goldLight : PAL.tealLight);
  pxBitmapText(g, '>', cx - 4, deskY - pcH + 15, 1, PAL.teal);
  pxBitmapText(g, 'THEN', cx + 12, deskY - pcH + 15, 1, stepCycle === 1 ? PAL.goldLight : PAL.tealLight);
  pxBitmapText(g, stepCycle === 2 ? 'DECIDE!' : 'RULE DB', cx, deskY - pcH + 27, 1, stepCycle === 2 ? PAL.goldLight : PAL.cream);

  for (let i = 0; i < 3; i++) {
    pxRect(g, cx - 22 + i * 16, deskY - 13, 12, 5, PAL.navyDark);
    pxRect(g, cx - 20 + i * 16, deskY - 11, 8, 1, i === stepCycle ? PAL.goldLight : PAL.teal);
  }

  if (rulesFlowP > 0.05) {
    pxLine(g, leftX + 25, midY, cx - Math.floor(pcW / 2) - 2, midY, PAL.goldDark, 1);
    for (let p = 0; p < 3; p++) {
      const f = (time * 1.15 + p * 0.33) % 1;
      const kx = Math.round(lerp(leftX + 26, cx - Math.floor(pcW / 2) - 4, f));
      const ky = midY + Math.round(Math.sin(f * Math.PI) * -5);
      pxRect(g, kx - 4, ky - 3, 8, 6, PAL.goldLight);
      pxRect(g, kx - 2, ky - 1, 4, 2, PAL.amber);
    }
  }

  // 3. RIGHT: Commercial Landing Card (Medical Cross + Rising Profit Chart $$$)
  const cardAlpha = easeOutExpo(bizValueP);
  pxRect(g, rightX - 28, deskY - 52, 56, 52, '#1A2638');
  pxOutline(g, rightX - 28, deskY - 52, 56, 52, cardAlpha > 0.2 ? PAL.gold : PAL.slate, 1);

  if (cardAlpha > 0.05) {
    const barHeights = [10, 18, 28, 38];
    for (let b = 0; b < barHeights.length; b++) {
      const bh = Math.max(2, Math.round(barHeights[b] * cardAlpha));
      const bx = rightX - 21 + b * 11;
      pxRect(g, bx, deskY - 6 - bh, 8, bh, b === 3 ? PAL.goldLight : PAL.tealLight);
      pxRect(g, bx, deskY - 6 - bh, 8, 2, PAL.cream);
    }
    pxRect(g, rightX - 22, deskY - 48, 8, 8, PAL.coral);
    pxRect(g, rightX - 19, deskY - 47, 2, 6, PAL.cream);
    pxRect(g, rightX - 21, deskY - 45, 6, 2, PAL.cream);

    pxLine(g, cx + Math.floor(pcW / 2) + 2, midY, rightX - 29, midY, PAL.tealLight, 1);
    const pulseX = Math.round(lerp(cx + Math.floor(pcW / 2) + 3, rightX - 30, (time * 1.4) % 1));
    pxSparkle(g, pulseX, midY, 2, PAL.goldLight);

    if (cardAlpha > 0.65) {
      pxBitmapText(g, '$$$', rightX + 6, deskY - 44, 1, PAL.goldLight, PAL.void);
      pxSparkle(g, rightX + 20, deskY - 56, 2 + (Math.floor(time * 5) % 2), PAL.goldLight);
    }
  } else {
    pxBitmapText(g, 'VALUE?', rightX, deskY - 26, 1, PAL.slateLight);
  }
}

// ============================================================================
// SCENE 30 (158.33–160.33s): Fleeting Night-Blooming Flower ("昙花一现")
// Cue 80: 但也仅仅是昙花一现 -> smoothly plunges into Scene 31 via gravity-shatter!
// ============================================================================
export function drawPixelSceneFleetingBloom(
  g: CanvasRenderingContext2D,
  pw: number,
  ph: number,
  time: number,
  localTime: number,
  _energy: number
): void {
  const cx = Math.floor(pw * 0.5);
  const bloomP = easeOutExpo(clamp01(localTime / 0.85));
  const shatterP = smoothstep(1.1, 1.95, localTime);

  drawDitheredSky(g, pw, ph, [
    { stop: 0, color: '#0C1124' },
    { stop: 0.5, color: '#181C38' },
    { stop: 0.88, color: '#222848' },
  ]);
  pxStarfield(g, pw, ph, time, 36, 0.72);

  const flowerY = Math.floor(ph * 0.62);
  pxLine(g, cx, ph, cx, flowerY + 8, PAL.tealDark, 2);
  pxLine(g, cx, flowerY + 24, cx - 14, flowerY + 14, PAL.teal, 2);
  pxLine(g, cx, flowerY + 28, cx + 14, flowerY + 18, PAL.teal, 2);

  drawDitheredGlow(g, cx, flowerY, Math.round(48 * bloomP * (1 - shatterP * 0.5)), shatterP > 0.4 ? PAL.ice : PAL.goldLight, 'medium');

  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2 - Math.PI / 2;
    const dist = lerp(4, 22, bloomP) + shatterP * (28 + (i % 3) * 14);
    const px = Math.round(cx + Math.cos(a) * dist + shatterP * 14);
    const py = Math.round(flowerY + Math.sin(a) * dist * 0.78 - shatterP * 8);
    const col = shatterP > 0.38 ? (i % 2 === 0 ? PAL.iceWhite : PAL.iceLight) : i % 2 === 0 ? PAL.goldLight : PAL.cream;
    pxCircle(g, px, py, Math.max(2, Math.round(lerp(7, 3, shatterP))), col);
  }
  if (shatterP < 0.7) {
    pxCircle(g, cx, flowerY, Math.max(2, Math.round(7 * (1 - shatterP))), PAL.gold);
    pxSparkle(g, cx, flowerY, 4, PAL.cream);
  }
}

// ============================================================================
// SCENE 31 (160.33–163.90s): Rule Tower Collapse -> Second AI Winter
// Cues 81–82: 很快因为规则维护成本太高 / 迎来了第二个寒冬
// ============================================================================
export function drawPixelSceneSecondAiWinter(
  g: CanvasRenderingContext2D,
  pw: number,
  ph: number,
  time: number,
  localTime: number,
  _energy: number
): void {
  const cx = Math.floor(pw * 0.5);
  const collapseP = smoothstep(1.3, 2.3, localTime);
  const freezeP = smoothstep(1.65, 3.1, localTime);

  drawDitheredSky(g, pw, ph, [
    { stop: 0, color: '#091022' },
    { stop: 0.45, color: '#11203B' },
    { stop: 0.85, color: '#1A3459' },
  ]);

  const floorY = Math.floor(ph * 0.82);
  pxPineTree(g, Math.floor(pw * 0.14), floorY, 26, '#132844', '#1E3C61', PAL.iceLight);
  pxPineTree(g, Math.floor(pw * 0.24), floorY, 20, '#132844', '#1E3C61', PAL.iceLight);
  pxPineTree(g, Math.floor(pw * 0.84), floorY, 28, '#132844', '#1E3C61', PAL.iceLight);
  pxRect(g, 0, floorY, pw, ph - floorY, PAL.iceDeep);
  pxRect(g, 0, floorY, pw, 3, PAL.iceLight);

  const blockCount = 7;
  const rubbleOffsets: Array<[number, number]> = [
    [-44, 0],
    [16, 0],
    [-86, 0],
    [58, 0],
    [-22, 10],
    [34, 10],
    [-64, 10],
  ];
  for (let i = 0; i < blockCount; i++) {
    const bw = 42 - (i % 2) * 4;
    const bh = 9;
    const baseX = cx - Math.floor(bw / 2);
    const baseY = floorY - (i + 1) * (bh + 1);
    const sway = Math.sin(time * 9 + i * 0.4) * (i * 1.4) * (1 - collapseP);
    const [rDx, rLift] = rubbleOffsets[i];
    const bx = Math.round(lerp(baseX + sway, cx + rDx - Math.floor(bw / 2), collapseP));
    const targetY = floorY - bh - rLift;
    const by = Math.round(lerp(baseY, targetY, collapseP * collapseP));

    const bCol = freezeP > 0.45 ? PAL.iceMid : i >= 5 ? PAL.coral : PAL.goldDark;
    const hiCol = freezeP > 0.45 ? PAL.iceLight : i >= 5 ? PAL.coralLight : PAL.goldLight;
    pxRect(g, bx, by, bw, bh, bCol);
    pxRect(g, bx + 1, by + 1, bw - 2, 2, hiCol);
    pxOutline(g, bx, by, bw, bh, PAL.void, 1);
    if (i < 4) {
      pxBitmapText(g, 'RULE', bx + Math.floor(bw / 2), by + 5, 1, PAL.cream);
    }
  }

  if (freezeP > 0.15) {
    const shiver = Math.round(Math.sin(time * 42) * freezeP);
    drawSprite(
      g,
      SPRITE_FROZEN_BOT,
      { I: PAL.iceWhite, C: PAL.iceLight, S: PAL.iceMid, B: PAL.iceDeep, D: PAL.navy },
      Math.max(36, cx - 88) + shiver,
      floorY - 12,
      2
    );
  }

  const costX = Math.min(pw - 52, cx + 82);
  const costY = Math.floor(ph * 0.56);
  const costVal = Math.round(lerp(120, 999, clamp01(localTime / 1.5)));
  pxRect(g, costX - 24, costY - 12, 48, 24, PAL.navyDark);
  pxOutline(g, costX - 24, costY - 12, 48, 24, freezeP > 0.5 ? PAL.iceLight : PAL.coral, 1);
  pxBitmapText(g, 'COST', costX, costY - 5, 1, PAL.cream);
  pxBitmapText(g, `$${costVal}K`, costX, costY + 5, 1, freezeP > 0.5 ? PAL.iceLight : PAL.coralLight);

  drawIcicleFringe(g, pw, freezeP * 1.05, 31);
  drawSnowStorm(g, pw, ph, time, Math.round(lerp(18, 72, freezeP)), -32, 30);
}
