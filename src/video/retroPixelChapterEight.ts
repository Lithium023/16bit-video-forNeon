import {
  PAL,
  SPRITE_TROPHY_CROWN,
  drawDitheredGlow,
  drawDitheredSky,
  drawSprite,
  pxBitmapText,
  pxCircle,
  pxLine,
  pxOutline,
  pxPineTree,
  pxRect,
  pxRing,
  pxSparkle,
  pxStarfield,
} from './pixelSprites';
import { clamp01, easeOutBack, easeOutCubic, easeOutExpo, lerp, smoothstep } from './timeline';

// ============================================================================
// SCENE 49 (270.97–276.53s): Transformer Architecture -> ChatGPT LLM Emerges
// Cues 138–139: 从 Transformer 架构的诞生 / 到以 ChatGPT 为代表的大语言模型橫空出世
// ============================================================================
export function drawPixelSceneTransformerLlm(
  g: CanvasRenderingContext2D,
  pw: number,
  ph: number,
  time: number,
  localTime: number,
  energy: number
): void {
  const attnP = easeOutExpo(clamp01(localTime / 1.5));
  const llmP = easeOutExpo(clamp01((localTime - 1.75) / 1.4));

  drawDitheredSky(g, pw, ph, [
    { stop: 0, color: '#090F22' },
    { stop: 0.45, color: '#11213B' },
    { stop: 0.86, color: '#18344B' },
  ]);
  pxStarfield(g, pw, ph, time, 32, 0.55);

  const floorY = Math.floor(ph * 0.8);
  pxRect(g, 0, floorY, pw, ph - floorY, '#0A1224');
  pxRect(g, 0, floorY, pw, 2, PAL.tealLight);

  // LEFT PANEL: Transformer Self-Attention Lattice!
  const tx = Math.floor(pw * 0.06);
  const ty = Math.floor(ph * 0.4);
  const tw = 148;
  const th = 76;

  pxRect(g, tx, ty, tw, th, '#0C182D');
  pxOutline(g, tx, ty, tw, th, PAL.tealLight, 2);
  pxRect(g, tx + 2, ty + 2, tw - 4, 12, '#142B46');
  pxBitmapText(g, 'TRANSFORMER', tx + Math.floor(tw / 2), ty + 8, 1, PAL.tealLight);

  // Two rows of glowing token nodes connected by all-to-all Self-Attention arcs!
  const tokenCount = 5;
  const topY = ty + 27;
  const botY = ty + 52;
  const nodeXs: number[] = [];
  for (let i = 0; i < tokenCount; i++) {
    nodeXs.push(tx + 18 + i * 28);
  }

  // Animated attention beams between token rows
  const activeFocus = Math.floor(time * 3.5) % tokenCount;
  for (let i = 0; i < tokenCount; i++) {
    for (let j = 0; j < tokenCount; j++) {
      const reveal = clamp01(attnP * 2 - (i + j) * 0.08);
      if (reveal <= 0.1) continue;
      const isStrong = i === activeFocus || j === activeFocus;
      pxLine(
        g,
        nodeXs[i],
        topY,
        nodeXs[j],
        botY,
        isStrong ? PAL.goldLight : 'rgba(126, 212, 192, 0.25)',
        1
      );
    }
  }

  for (let i = 0; i < tokenCount; i++) {
    const hi = i === activeFocus;
    pxCircle(g, nodeXs[i], topY, 4, hi ? PAL.goldLight : PAL.teal);
    pxCircle(g, nodeXs[i], botY, 4, hi ? PAL.cream : PAL.tealLight);
  }
  pxBitmapText(g, 'ATTENTION', tx + Math.floor(tw / 2), ty + th - 10, 1, PAL.goldLight);

  // Glowing bridge conduit from Transformer -> LLM Chat Core
  if (llmP > 0.05) {
    const bx1 = tx + tw + 2;
    const bx2 = tx + tw + 26;
    const by = ty + 38;
    pxLine(g, bx1, by, Math.round(lerp(bx1, bx2, llmP)), by, PAL.goldLight, 2);
    const pulseX = Math.round(lerp(bx1, bx2, (time * 2.2) % 1));
    pxRect(g, pulseX - 2, by - 2, 4, 4, PAL.cream);
  }

  // RIGHT PANEL: ChatGPT / Large Language Model Streaming Terminal!
  const cx = Math.floor(pw * 0.52);
  const cy = Math.floor(ph * 0.4);
  const cw = Math.min(162, pw - cx - 18);
  const ch = 76;

  if (llmP > 0.02) {
    const popScale = easeOutBack(llmP, 1.15);
    const curH = Math.max(16, Math.round(ch * Math.min(1, popScale)));
    const curY = cy + Math.floor((ch - curH) / 2);

    drawDitheredGlow(g, cx + Math.floor(cw / 2), cy + 38, Math.round(44 * llmP + energy * 8), PAL.teal, 'light');
    pxRect(g, cx, curY, cw, curH, '#0C2129');
    pxOutline(g, cx, curY, cw, curH, PAL.goldLight, 2);

    if (curH > 50) {
      pxRect(g, cx + 2, curY + 2, cw - 4, 13, '#133840');
      pxBitmapText(g, 'CHATGPT - LLM', cx + Math.floor(cw / 2), curY + 8, 1, PAL.goldLight);

      // Iconic pixel neural-knot badge on left of terminal
      const icoX = cx + 22;
      const icoY = curY + 38;
      pxCircle(g, icoX, icoY, 12, '#1A5E56');
      pxRing(g, icoX, icoY, 12, PAL.tealLight, 1);
      pxRing(g, icoX, icoY, 6, PAL.cream, 1);
      for (let k = 0; k < 6; k++) {
        const a = time * 1.4 + (k * Math.PI) / 3;
        pxRect(g, Math.round(icoX + Math.cos(a) * 8), Math.round(icoY + Math.sin(a) * 8), 2, 2, PAL.goldLight);
      }

      // Streaming token bars typing out inside the LLM response window!
      const streamX = cx + 42;
      const streamW = cw - 52;
      const lineWidths = [0.92, 0.78, 0.88, 0.62];
      for (let r = 0; r < lineWidths.length; r++) {
        const lineP = clamp01((localTime - 2.1 - r * 0.45) / 0.55);
        const wNow = Math.round(streamW * lineWidths[r] * lineP);
        if (wNow > 0) {
          pxRect(g, streamX, curY + 22 + r * 11, wNow, 5, r === 0 ? PAL.goldLight : PAL.tealLight);
        }
      }

      // Blinking cursor pixel
      if (Math.floor(time * 6) % 2 === 0 && localTime > 2.4) {
        pxRect(g, streamX + Math.round(streamW * 0.65), curY + 55, 4, 6, PAL.cream);
      }
      pxSparkle(g, cx + cw - 9, curY + 8, 2, PAL.goldLight);
    }
  }
}

// ============================================================================
// SCENE 50 (276.53–281.20s): Multimodal All-Rounder AI (Text/Image/Video/Audio)
// Cue 140: 再到如今的文本、图像、视频、音频多模态全能 AI
// ============================================================================
export function drawPixelSceneMultimodalAi(
  g: CanvasRenderingContext2D,
  pw: number,
  ph: number,
  time: number,
  localTime: number,
  energy: number
): void {
  const cx = Math.floor(pw * 0.5);
  const cy = Math.floor(ph * 0.59);

  drawDitheredSky(g, pw, ph, [
    { stop: 0, color: '#0B1026' },
    { stop: 0.45, color: '#161D42' },
    { stop: 0.86, color: '#212A54' },
  ]);
  pxStarfield(g, pw, ph, time, 36, 0.62);

  // 4 Modality Cards radiating cleanly from central OMNI AI prism!
  const cards: Array<{
    id: 'text' | 'image' | 'video' | 'audio';
    label: string;
    x: number;
    y: number;
    color: string;
    at: number;
  }> = [
    { id: 'text', label: 'TEXT', x: cx - 108, y: cy - 22, color: PAL.goldLight, at: 0.1 },
    { id: 'image', label: 'IMAGE', x: cx + 108, y: cy - 22, color: PAL.tealLight, at: 0.7 },
    { id: 'video', label: 'VIDEO', x: cx - 108, y: cy + 26, color: PAL.coralLight, at: 1.35 },
    { id: 'audio', label: 'AUDIO', x: cx + 108, y: cy + 26, color: PAL.iceLight, at: 1.95 },
  ];

  // Energy conduits linking center OMNI core to each modality
  for (const c of cards) {
    const p = easeOutExpo(clamp01((localTime - c.at) / 0.55));
    if (p <= 0.02) continue;
    const ex = Math.round(lerp(cx, c.x, p));
    const ey = Math.round(lerp(cy, c.y, p));
    pxLine(g, cx, cy, ex, ey, c.color, 2);
    const dotT = (time * 1.8 + c.at) % 1;
    pxRect(
      g,
      Math.round(lerp(cx, c.x, dotT)) - 1,
      Math.round(lerp(cy, c.y, dotT)) - 1,
      3,
      3,
      PAL.cream
    );
  }

  // Draw the 4 modality pixel cards
  const cardW = 92;
  const cardH = 38;
  for (const c of cards) {
    const p = easeOutBack(clamp01((localTime - c.at) / 0.5), 1.15);
    if (p <= 0.08) continue;
    const x0 = c.x - Math.floor(cardW / 2);
    const y0 = c.y - Math.floor(cardH / 2);

    pxRect(g, x0, y0, cardW, cardH, '#0F1630');
    pxOutline(g, x0, y0, cardW, cardH, c.color, 2);

    // Mini bespoke 16-bit icon on the left side of each card
    const ix = x0 + 18;
    const iy = c.y;
    if (c.id === 'text') {
      pxRect(g, ix - 9, iy - 10, 18, 20, PAL.cream);
      pxRect(g, ix - 6, iy - 6, 12, 2, PAL.navyDark);
      pxRect(g, ix - 6, iy - 1, 10, 2, PAL.goldDark);
      pxRect(g, ix - 6, iy + 4, 12, 2, PAL.navyDark);
    } else if (c.id === 'image') {
      pxRect(g, ix - 10, iy - 9, 20, 18, '#1E4C6B');
      pxOutline(g, ix - 10, iy - 9, 20, 18, PAL.tealLight, 1);
      pxCircle(g, ix + 4, iy - 4, 3, PAL.goldLight);
      pxLine(g, ix - 9, iy + 8, ix - 2, iy, PAL.tealLight, 2);
      pxLine(g, ix - 2, iy, ix + 4, iy + 8, PAL.teal, 2);
    } else if (c.id === 'video') {
      pxRect(g, ix - 10, iy - 9, 20, 18, '#2B1B38');
      pxOutline(g, ix - 10, iy - 9, 20, 18, PAL.coralLight, 1);
      // Pixel play triangle
      for (let r = -5; r <= 5; r++) {
        const wTri = Math.max(1, 6 - Math.abs(r));
        pxRect(g, ix - 3, iy + r, wTri, 1, PAL.goldLight);
      }
    } else {
      // Animated chiptune audio equalizer bars
      for (let b = 0; b < 5; b++) {
        const bh = 4 + Math.round(Math.abs(Math.sin(time * 9 + b * 1.1)) * (10 + energy * 4));
        pxRect(g, ix - 10 + b * 4, iy + 9 - bh, 3, bh, b % 2 === 0 ? PAL.iceLight : PAL.tealLight);
      }
    }

    pxBitmapText(g, c.label, x0 + 62, c.y, 1, c.color);
  }

  // CENTER HERO: Radiant Rotating OMNI AI Crystal Prism!
  drawDitheredGlow(g, cx, cy, Math.round(36 + energy * 10), PAL.goldLight, 'medium');
  const pr = 22;
  for (let dy = -pr; dy <= pr; dy++) {
    const half = pr - Math.abs(dy);
    pxRect(g, cx - half, cy + dy, half * 2 + 1, 1, Math.abs(dy) < 10 ? '#1C2E52' : '#13203E');
  }
  pxLine(g, cx, cy - pr, cx + pr, cy, PAL.goldLight, 2);
  pxLine(g, cx + pr, cy, cx, cy + pr, PAL.tealLight, 2);
  pxLine(g, cx, cy + pr, cx - pr, cy, PAL.goldLight, 2);
  pxLine(g, cx - pr, cy, cx, cy - pr, PAL.tealLight, 2);
  pxBitmapText(g, 'OMNI', cx, cy, 1, PAL.cream);
  pxSparkle(g, cx, cy - pr - 6, 2 + (Math.floor(time * 5) % 2), PAL.goldLight);
}

// ============================================================================
// SCENE 51 (281.20–289.93s): Beyond Multiple-Choice -> Language/Logic/Art/Empathy
// Cues 141–144: 不再只会做单选题 / 语言理解 / 逻辑推理 / 艺术创作甚至是情感共鸣
// ============================================================================
export function drawPixelSceneHumanlikeCreativity(
  g: CanvasRenderingContext2D,
  pw: number,
  ph: number,
  time: number,
  localTime: number,
  energy: number
): void {
  const cx = Math.floor(pw * 0.5);
  const cy = Math.floor(ph * 0.59);
  const breakP = smoothstep(1.8, 2.55, localTime);

  drawDitheredSky(g, pw, ph, [
    { stop: 0, color: '#110F26' },
    { stop: 0.45, color: '#1F1B3D' },
    { stop: 0.86, color: '#2F254A' },
  ]);
  pxStarfield(g, pw, ph, time, 34, 0.58);

  // ACT A (0–2.4s): Old Rigid "Multiple-Choice" (A/B/C/D) Card Breaking Away!
  if (breakP < 0.98) {
    const slideOut = Math.round(easeOutCubic(breakP) * 140);
    const bx = cx - 64 - slideOut;
    const by = Math.floor(ph * 0.41);
    const bw = 128;
    const bh = 74;

    pxRect(g, bx, by, bw, bh, '#1A1E2F');
    pxOutline(g, bx, by, bw, bh, PAL.slateLight, 2);
    pxBitmapText(g, 'QUIZ ONLY', bx + 64, by + 11, 1, PAL.slateLight);

    const opts = ['A', 'B', 'C', 'D'];
    for (let i = 0; i < 4; i++) {
      const ox = bx + 18 + (i % 2) * 56;
      const oy = by + 28 + Math.floor(i / 2) * 24;
      pxOutline(g, ox, oy, 36, 16, i === 1 ? PAL.teal : PAL.slate, 1);
      pxBitmapText(g, opts[i], ox + 18, oy + 8, 1, i === 1 ? PAL.tealLight : PAL.creamDim);
    }

    // Bold coral slash crossing out rigid multiple-choice at t > 1.1s!
    const slashP = clamp01((localTime - 0.95) / 0.55);
    if (slashP > 0.02) {
      pxLine(g, bx + 8, by + 8, Math.round(lerp(bx + 8, bx + bw - 8, slashP)), Math.round(lerp(by + 8, by + bh - 8, slashP)), PAL.coral, 3);
      pxLine(g, bx + bw - 8, by + 8, Math.round(lerp(bx + bw - 8, bx + 8, slashP)), Math.round(lerp(by + 8, by + bh - 8, slashP)), PAL.coral, 3);
    }
  }

  // ACT B (2.0s–8.73s): Blooming Four-Pillar Human-Like Mind & Heart Constellation!
  if (breakP > 0.05) {
    const pillars: Array<{
      id: 'lang' | 'logic' | 'art' | 'heart';
      label: string;
      x: number;
      y: number;
      color: string;
      at: number;
    }> = [
      { id: 'lang', label: 'LANGUAGE', x: cx - 114, y: cy - 22, color: PAL.tealLight, at: 2.2 },
      { id: 'logic', label: 'LOGIC', x: cx + 114, y: cy - 22, color: PAL.goldLight, at: 4.8 },
      { id: 'art', label: 'ART', x: cx - 114, y: cy + 26, color: PAL.coralLight, at: 5.75 },
      { id: 'heart', label: 'EMPATHY', x: cx + 114, y: cy + 26, color: '#FF8FA3', at: 6.55 },
    ];

    // Central warm pulsing 16-bit Soul Heart-Brain Emblem
    const heartPulse = 1 + Math.sin(time * 6) * 0.08 + energy * 0.1;
    drawDitheredGlow(g, cx, cy, Math.round(42 * breakP * heartPulse), PAL.coralLight, 'medium');
    pxCircle(g, cx, cy, Math.round(22 * breakP), '#26183A');
    pxRing(g, cx, cy, Math.round(22 * breakP), PAL.goldLight, 2);

    // Classic crisp 16-bit pixel heart inside center medallion!
    if (breakP > 0.45) {
      const heartRows = [
        '.RR.RR.',
        'RRRRRRR',
        'RRRRRRR',
        '.RRRRR.',
        '..RRR..',
        '...R...',
      ];
      const hs = 3;
      const hx0 = cx - Math.floor((7 * hs) / 2);
      const hy0 = cy - Math.floor((6 * hs) / 2);
      for (let r = 0; r < heartRows.length; r++) {
        for (let c = 0; c < heartRows[r].length; c++) {
          if (heartRows[r][c] === 'R') {
            pxRect(g, hx0 + c * hs, hy0 + r * hs, hs, hs, r <= 1 && c === 1 ? PAL.cream : PAL.coralLight);
          }
        }
      }
    }

    for (const p of pillars) {
      const prog = easeOutBack(clamp01((localTime - p.at) / 0.55), 1.15);
      if (prog <= 0.08) continue;

      pxLine(g, cx, cy, p.x, p.y, p.color, 1);

      const bw = 96;
      const bh = 34;
      const x0 = p.x - Math.floor(bw / 2);
      const y0 = p.y - Math.floor(bh / 2);
      pxRect(g, x0, y0, bw, bh, '#161430');
      pxOutline(g, x0, y0, bw, bh, p.color, 2);

      // Tiny icon dot + crisp label
      pxCircle(g, x0 + 13, p.y, 4, p.color);
      pxBitmapText(g, p.label, x0 + 56, p.y, 1, p.color);
      if (localTime > p.at + 0.35) {
        pxSparkle(g, x0 + bw - 6, y0 - 4, 2, PAL.goldLight);
      }
    }
  }
}

// ============================================================================
// SCENE 52 (289.93–296.73s): 1956 Dartmouth Spark -> Towering 80-Year World Tree
// Cues 145–147: 从达特茅斯会议的星星之火 / 到今天赋能千行百业的参天大树 / AI 用了近八十年
// ============================================================================
export function drawPixelSceneSparkToWorldTree(
  g: CanvasRenderingContext2D,
  pw: number,
  ph: number,
  time: number,
  localTime: number,
  energy: number
): void {
  const cx = Math.floor(pw * 0.5);
  const groundY = Math.floor(ph * 0.78);
  const growP = easeOutExpo(clamp01((localTime - 1.35) / 2.6));
  const fruitP = smoothstep(3.2, 4.9, localTime);

  // Warm golden-emerald twilight sky
  drawDitheredSky(g, pw, ph, [
    { stop: 0, color: '#0B1626' },
    { stop: 0.42, color: '#142B3E' },
    { stop: 0.84, color: '#244A52' },
  ]);
  pxStarfield(g, pw, ph, time, 34, 0.55);

  // Ground meadow & glowing golden circuit roots underneath
  pxRect(g, 0, groundY, pw, ph - groundY, '#10242A');
  pxRect(g, 0, groundY, pw, 3, PAL.tealLight);

  // 1956 Golden Spark at base of the tree (always glowing as the origin!)
  const sparkR = Math.round(18 + Math.sin(time * 7) * 4 + energy * 6);
  drawDitheredGlow(g, cx, groundY - 4, sparkR + Math.round(growP * 28), PAL.goldLight, 'medium');
  pxCircle(g, cx, groundY - 4, 5, PAL.goldLight);
  pxCircle(g, cx, groundY - 4, 2, PAL.cream);

  // Rising golden embers drifting upward from the 1956 spark
  for (let i = 0; i < 14; i++) {
    const sy = groundY - 6 - ((time * 28 + i * 11) % 72);
    const sx = cx + Math.round(Math.sin(time * 2.5 + i * 1.3) * (10 + growP * 36));
    pxRect(g, sx, Math.round(sy), 2, 2, i % 2 === 0 ? PAL.goldLight : PAL.tealLight);
  }

  // Towering 16-Bit World Tree growing smoothly out of the spark!
  if (growP > 0.04) {
    const trunkH = Math.round(48 * growP);
    const trunkW = Math.max(4, Math.round(14 * growP));
    const trunkTop = groundY - trunkH;

    // Textured bark trunk with golden circuit vein running up its heart!
    pxRect(g, cx - Math.floor(trunkW / 2), trunkTop, trunkW, trunkH, '#6E4730');
    pxRect(g, cx - Math.floor(trunkW / 2) + 2, trunkTop, 3, trunkH, '#916042');
    pxRect(g, cx - 1, trunkTop + 4, 2, trunkH - 4, PAL.goldLight);

    // Sweeping tree roots hugging the soil
    pxLine(g, cx - 4, groundY - 4, cx - 22, groundY + 1, '#6E4730', 3);
    pxLine(g, cx + 4, groundY - 4, cx + 22, groundY + 1, '#6E4730', 3);

    // Lush layered pixel canopy clouds blooming at the top (clamped below title zone!)
    if (growP > 0.35) {
      const canP = clamp01((growP - 0.35) / 0.65);
      const canopyY = Math.max(Math.floor(ph * 0.47), trunkTop - 4);
      const blobs: Array<[number, number, number, string]> = [
        [cx - 38, canopyY + 12, Math.round(18 * canP), PAL.tealDark],
        [cx + 38, canopyY + 12, Math.round(18 * canP), PAL.tealDark],
        [cx - 22, canopyY + 2, Math.round(22 * canP), PAL.teal],
        [cx + 22, canopyY + 2, Math.round(22 * canP), PAL.teal],
        [cx, canopyY - 6, Math.round(24 * canP), PAL.tealLight],
        [cx - 12, canopyY - 2, Math.round(16 * canP), PAL.teal],
        [cx + 14, canopyY - 2, Math.round(16 * canP), PAL.teal],
      ];
      for (const [bx, by, br, col] of blobs) {
        if (br > 2) pxCircle(g, bx, by, br, col);
      }

      // Glowing industry fruits ("赋能千行百业") perched across the canopy!
      if (fruitP > 0.08) {
        const badges: Array<{ label: string; x: number; y: number; col: string }> = [
          { label: 'MED', x: cx - 78, y: canopyY + 6, col: PAL.coralLight },
          { label: 'CODE', x: cx - 74, y: canopyY + 30, col: PAL.tealLight },
          { label: 'SCI', x: cx + 78, y: canopyY + 6, col: PAL.goldLight },
          { label: 'ART', x: cx + 74, y: canopyY + 30, col: PAL.iceLight },
        ];
        for (const b of badges) {
          pxLine(g, cx, canopyY + 8, b.x, b.y, 'rgba(255, 224, 138, 0.38)', 1);
          pxRect(g, b.x - 20, b.y - 8, 40, 16, '#0E1C2E');
          pxOutline(g, b.x - 20, b.y - 8, 40, 16, b.col, 1);
          pxBitmapText(g, b.label, b.x, b.y, 1, b.col);
        }
      }
    }
  }

  // Left/Right era anchors flanking the trunk
  pxRect(g, 20, groundY - 20, 44, 16, '#0D1729');
  pxOutline(g, 20, groundY - 20, 44, 16, PAL.gold, 1);
  pxBitmapText(g, '1956', 42, groundY - 12, 1, PAL.goldLight);

  pxRect(g, pw - 64, groundY - 20, 44, 16, '#0D1729');
  pxOutline(g, pw - 64, groundY - 20, 44, 16, PAL.tealLight, 1);
  pxBitmapText(g, '80 YRS', pw - 42, groundY - 12, 1, PAL.tealLight);
}

// ============================================================================
// SCENE 53 (296.73–301.57s): Four Industrial Revolutions -> Reshaping Civilization
// Cues 148–149: 它不仅是一项技术 / 更是一次深刻重塑人类文明的工业革命
// ============================================================================
export function drawPixelSceneCivilizationRevolution(
  g: CanvasRenderingContext2D,
  pw: number,
  ph: number,
  time: number,
  localTime: number,
  energy: number
): void {
  const baseY = Math.floor(ph * 0.79);

  drawDitheredSky(g, pw, ph, [
    { stop: 0, color: '#0C0E24' },
    { stop: 0.42, color: '#1A1C3C' },
    { stop: 0.84, color: '#33264E' },
  ]);
  pxStarfield(g, pw, ph, time, 38, 0.62);

  pxRect(g, 0, baseY, pw, ph - baseY, '#0B0E1E');
  pxRect(g, 0, baseY, pw, 2, PAL.goldLight);

  // 4 Ascending 16-Bit Civilization Monoliths: 1.0 Steam -> 2.0 Electric -> 3.0 Info -> 4.0 AI!
  const eras = [
    { label: '1.0', sub: 'STEAM', h: 42, color: PAL.slateLight, at: 0.05 },
    { label: '2.0', sub: 'POWER', h: 52, color: PAL.gold, at: 0.45 },
    { label: '3.0', sub: 'INFO', h: 64, color: PAL.tealLight, at: 0.9 },
    { label: '4.0', sub: 'AI ERA', h: 78, color: PAL.goldLight, at: 1.45 },
  ];

  const slotW = Math.floor((pw - 44) / 4);
  for (let i = 0; i < eras.length; i++) {
    const e = eras[i];
    const p = easeOutExpo(clamp01((localTime - e.at) / 0.75));
    if (p <= 0.02) continue;

    const ex = 22 + i * slotW + Math.floor(slotW / 2);
    const bw = Math.min(68, slotW - 14);
    const bh = Math.round(e.h * p);
    const topY = baseY - bh;
    const isAi = i === 3;

    if (isAi) {
      drawDitheredGlow(g, ex, topY + 18, Math.round(46 * p + energy * 10), PAL.goldLight, 'medium');
    }

    // Stepped monumental pillar
    pxRect(g, ex - Math.floor(bw / 2), topY, bw, bh, isAi ? '#1B2D52' : '#151B33');
    pxOutline(g, ex - Math.floor(bw / 2), topY, bw, bh, e.color, isAi ? 2 : 1);
    pxRect(g, ex - Math.floor(bw / 2) + 2, topY + 2, bw - 4, 4, e.color);

    // Distinct 16-bit icon motif inside each civilization tier
    if (bh > 28) {
      const iy = i === 0 ? topY + 17 : topY + 21;
      if (i === 0) {
        // Crisp toothed pixel steam gear cleanly separated above STEAM label
        pxCircle(g, ex, iy, 5, PAL.slateLight);
        pxRect(g, ex - 7, iy - 1, 14, 2, PAL.slateLight);
        pxRect(g, ex - 1, iy - 7, 2, 14, PAL.slateLight);
        pxCircle(g, ex, iy, 2, '#151B33');
      } else if (i === 1) {
        // Electric lightning spark
        pxLine(g, ex + 2, iy - 7, ex - 3, iy, PAL.goldLight, 2);
        pxLine(g, ex - 3, iy, ex + 3, iy, PAL.goldLight, 2);
        pxLine(g, ex + 3, iy, ex - 2, iy + 7, PAL.goldLight, 2);
      } else if (i === 2) {
        // Microchip square
        pxRect(g, ex - 6, iy - 6, 12, 12, PAL.tealDark);
        pxOutline(g, ex - 6, iy - 6, 12, 12, PAL.tealLight, 1);
        pxRect(g, ex - 2, iy - 2, 4, 4, PAL.cream);
      } else {
        // Radiant AI Era Crown + Neural Halo!
        drawSprite(
          g,
          SPRITE_TROPHY_CROWN,
          { G: PAL.goldLight, R: PAL.tealLight, D: PAL.goldDark },
          ex,
          iy - 1,
          2
        );
        pxRing(g, ex, iy + 1, 15 + Math.round(Math.sin(time * 5) * 2), PAL.tealLight, 1);
        pxSparkle(g, ex + 18, topY - 4, 2 + (Math.floor(time * 6) % 2), PAL.goldLight);
      }

      pxBitmapText(g, e.sub, ex, baseY - 10, 1, e.color);
    }

    // Ascending arrow linking pillar to pillar
    if (i > 0 && p > 0.5) {
      const prevX = 22 + (i - 1) * slotW + Math.floor(slotW / 2) + Math.floor(bw / 2) + 2;
      const curLeft = ex - Math.floor(bw / 2) - 2;
      pxLine(g, prevX, baseY - eras[i - 1].h + 10, curLeft, topY + 12, PAL.gold, 1);
    }
  }
}

// ============================================================================
// SCENE 54 (301.57–309.00s): Every Winter Builds Roots, Every Surge Rewrites Logic
// Cues 150–152: 回顾这段历史 / 每一次寒冬都是技术的沉淀 / 每一次爆发都是底层逻辑的革新
// ============================================================================
export function drawPixelSceneWinterAndBreakthrough(
  g: CanvasRenderingContext2D,
  pw: number,
  ph: number,
  time: number,
  localTime: number,
  energy: number
): void {
  const waveP = easeOutExpo(clamp01(localTime / 5.4));
  const winterGlow = smoothstep(2.0, 3.6, localTime);
  const surgeGlow = smoothstep(4.5, 6.2, localTime);

  drawDitheredSky(g, pw, ph, [
    { stop: 0, color: '#091124' },
    { stop: 0.45, color: '#12203E' },
    { stop: 0.86, color: '#1B2E4E' },
  ]);
  pxStarfield(g, pw, ph, time, 32, 0.55);

  // Subtle historical graph grid
  const topBound = Math.floor(ph * 0.4);
  const midY = Math.floor(ph * 0.62);
  const botBound = Math.floor(ph * 0.79);
  for (let x = 24; x < pw - 20; x += 48) {
    pxRect(g, x, topBound, 1, botBound - topBound, 'rgba(126, 212, 192, 0.12)');
  }
  pxRect(g, 20, midY, pw - 40, 1, 'rgba(242, 180, 75, 0.22)');

  // 80-Year Rollercoaster Curve Points (1956 Peak -> Winter I -> 1980s -> Winter II -> 2012 DL -> 2026 LLM!)
  const pts: Array<{ x: number; y: number; tag: string; isWinter?: boolean }> = [
    { x: 28, y: midY + 2, tag: '1950' },
    { x: 74, y: midY - 20, tag: '1956' },
    { x: 126, y: botBound - 14, tag: 'W1', isWinter: true },
    { x: 174, y: midY - 14, tag: '1980S' },
    { x: 222, y: botBound - 16, tag: 'W2', isWinter: true },
    { x: 284, y: midY - 26, tag: '2012' },
    { x: pw - 32, y: topBound + 6, tag: '2026' },
  ];

  // Draw glowing underground winter foundation crystals ("每一次寒冬都是技术的沉淀")!
  for (const pt of pts) {
    if (!pt.isWinter) continue;
    if (winterGlow > 0.05) {
      drawDitheredGlow(g, pt.x, pt.y + 6, Math.round(22 * winterGlow), PAL.iceLight, 'light');
      // Crystalline foundation blocks accumulating below the valley floor
      for (let b = -1; b <= 1; b++) {
        pxRect(g, pt.x + b * 9 - 3, pt.y + 4, 6, 5, PAL.ice);
        pxOutline(g, pt.x + b * 9 - 3, pt.y + 4, 6, 5, PAL.iceWhite, 1);
      }
      pxBitmapText(g, 'ROOTS', pt.x, pt.y + 15, 1, PAL.iceLight);
    }
  }

  // Animated trajectory tracing across the 6 segments
  const segCount = pts.length - 1;
  const maxSeg = waveP * segCount;
  let headX = pts[0].x;
  let headY = pts[0].y;

  for (let i = 0; i < segCount; i++) {
    const segFrac = clamp01(maxSeg - i);
    if (segFrac <= 0) break;
    const p0 = pts[i];
    const p1 = pts[i + 1];
    const ex = Math.round(lerp(p0.x, p1.x, segFrac));
    const ey = Math.round(lerp(p0.y, p1.y, segFrac));
    const col = p1.isWinter ? PAL.iceLight : i >= 4 ? PAL.goldLight : PAL.tealLight;
    pxLine(g, p0.x, p0.y, ex, ey, col, i >= 4 ? 3 : 2);
    headX = ex;
    headY = ey;

    // Node landmark dot + year tag once passed
    if (segFrac > 0.92 && !p1.isWinter) {
      pxCircle(g, p1.x, p1.y, i >= 4 ? 4 : 3, i >= 4 ? PAL.goldLight : PAL.tealLight);
      pxBitmapText(g, p1.tag, p1.x, p1.y - 10, 1, i >= 4 ? PAL.goldLight : PAL.creamDim);
    }
  }

  // Glowing golden breakthrough pillars erupting upward on "底层逻辑的革新"!
  if (surgeGlow > 0.05) {
    const lastPt = pts[pts.length - 1];
    const dlPt = pts[pts.length - 2];
    drawDitheredGlow(g, lastPt.x, lastPt.y + 4, Math.round(34 * surgeGlow + energy * 8), PAL.goldLight, 'medium');
    pxLine(g, dlPt.x, botBound, dlPt.x, dlPt.y + 5, 'rgba(126, 212, 192, 0.45)', 2);
    pxLine(g, lastPt.x, botBound, lastPt.x, lastPt.y + 5, 'rgba(255, 224, 138, 0.55)', 2);
    pxSparkle(g, lastPt.x, lastPt.y - 2, 3 + (Math.floor(time * 6) % 2), PAL.cream);
  }

  // Glowing leading comet spark
  pxCircle(g, headX, headY, 3, PAL.cream);
}

// ============================================================================
// SCENE 55 (309.00–314.50s): GRAND FINALE — Witnesses of History, Writers of the Future
// Cues 153–155: 而今天 / 我们每个人既是这段历史的见证者 / 也是未来的书写者
// ============================================================================
export function drawPixelSceneWitnessAndWriterFinale(
  g: CanvasRenderingContext2D,
  pw: number,
  ph: number,
  time: number,
  localTime: number,
  energy: number
): void {
  const cx = Math.floor(pw * 0.5);
  const horizonY = Math.floor(ph * 0.74);
  const riseP = easeOutExpo(clamp01(localTime / 1.8));
  const writeP = smoothstep(2.6, 4.9, localTime);

  // Serene, inspiring midnight-indigo to golden-dawn cosmic finale sky!
  drawDitheredSky(g, pw, ph, [
    { stop: 0, color: '#080D1F' },
    { stop: 0.36, color: '#141E42' },
    { stop: 0.66, color: '#273660' },
    { stop: 0.88, color: '#6E4C5E' },
    { stop: 0.97, color: '#D69550' },
  ]);
  pxStarfield(g, pw, ph, time, 58, 0.74, time * 3);

  // Radiant golden dawn sun halo glowing on the horizon
  drawDitheredGlow(g, cx, horizonY - 8, Math.round(68 * riseP + energy * 10), PAL.goldLight, 'medium');
  pxCircle(g, cx, horizonY - 6, Math.round(24 * riseP), PAL.gold);
  pxCircle(g, cx, horizonY - 6, Math.round(16 * riseP), PAL.goldLight);
  pxCircle(g, cx, horizonY - 6, Math.round(9 * riseP), PAL.cream);

  // Glowing golden constellation arc being WRITTEN across the sky ("也是未来的书写者")!
  const arcPts: Array<[number, number]> = [
    [cx - 118, Math.floor(ph * 0.62)],
    [cx - 64, Math.floor(ph * 0.5)],
    [cx, Math.floor(ph * 0.43)],
    [cx + 66, Math.floor(ph * 0.49)],
    [cx + 122, Math.floor(ph * 0.58)],
  ];
  const segTotal = arcPts.length - 1;
  const arcProg = lerp(0.35, 1.0, writeP) * segTotal;
  let penX = arcPts[0][0];
  let penY = arcPts[0][1];

  for (let i = 0; i < segTotal; i++) {
    const f = clamp01(arcProg - i);
    if (f <= 0) break;
    const [x0, y0] = arcPts[i];
    const [x1, y1] = arcPts[i + 1];
    const ex = Math.round(lerp(x0, x1, f));
    const ey = Math.round(lerp(y0, y1, f));
    pxLine(g, x0, y0, ex, ey, i % 2 === 0 ? PAL.goldLight : PAL.tealLight, 2);
    pxSparkle(g, x0, y0, 2, PAL.cream);
    penX = ex;
    penY = ey;
  }
  // Luminous golden pixel stylus/star tip actively writing the future!
  pxSparkle(g, penX, penY, 4 + (Math.floor(time * 8) % 2), PAL.goldLight);

  // Gentle rolling silhouette hills + 3 pixel humans standing together gazing into tomorrow!
  for (let x = 0; x < pw; x++) {
    const hill = Math.round(Math.sin(x * 0.014) * 6 + Math.cos(x * 0.029) * 3);
    pxRect(g, x, horizonY + hill, 1, ph - (horizonY + hill), '#0A1021');
  }
  pxRect(g, 0, horizonY + 8, pw, ph - horizonY, '#0A1021');

  // Distant silhouettes of pine trees flanking outer left & right
  pxPineTree(g, 24, horizonY + 6, 22, '#0E1830', '#162642');
  pxPineTree(g, 42, horizonY + 8, 16, '#0E1830', '#162642');
  pxPineTree(g, pw - 26, horizonY + 6, 22, '#0E1830', '#162642');
  pxPineTree(g, pw - 44, horizonY + 8, 16, '#0E1830', '#162642');

  // 3 Pixel Humans ("我们每个人") standing side-by-side on the sunlit ridge!
  const people: Array<{ x: number; h: number }> = [
    { x: cx - 18, h: 16 },
    { x: cx, h: 18 },
    { x: cx + 18, h: 16 },
  ];
  for (const person of people) {
    const py = horizonY + 2;
    const topY = py - person.h;
    // Distinct head with warm dawn rim highlight
    pxRect(g, person.x - 1, topY, 3, 4, '#111930');
    pxRect(g, person.x - 1, topY, 3, 1, PAL.goldLight);
    // Neck + broader shoulders + arms
    pxRect(g, person.x, topY + 4, 1, 1, '#111930');
    pxRect(g, person.x - 4, topY + 5, 9, 2, '#111930');
    pxRect(g, person.x - 4, topY + 5, 9, 1, 'rgba(255, 224, 138, 0.55)');
    pxRect(g, person.x - 3, topY + 7, 7, 5, '#111930');
    // Left & right legs planted firmly on the hill
    pxRect(g, person.x - 3, topY + 12, 2, person.h - 12, '#111930');
    pxRect(g, person.x + 2, topY + 12, 2, person.h - 12, '#111930');
  }

  // Crisp final chronological tribute plaque above horizon when "未来的书写者" lands!
  if (writeP > 0.35) {
    const bw = 114;
    const bh = 18;
    const by = Math.floor(ph * 0.56);
    pxRect(g, cx - Math.floor(bw / 2), by - 9, bw, bh, '#0C142B');
    pxOutline(g, cx - Math.floor(bw / 2), by - 9, bw, bh, PAL.goldLight, 1);
    pxBitmapText(g, '1950 - FUTURE', cx, by, 1, PAL.goldLight);
  }
}
