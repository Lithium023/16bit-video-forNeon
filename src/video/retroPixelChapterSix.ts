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
  pxRect,
  pxRing,
  pxSparkle,
  pxStarfield,
} from './pixelSprites';
import { clamp01, easeOutBack, easeOutCubic, easeOutExpo, lerp, smoothstep } from './timeline';

// ============================================================================
// SCENE 37 (198.50–206.90s): Beyond Human Peak — Global Signal & Compute Tower
// Cues 101–105: 这不仅是一场棋局的胜利 / 向全世界宣告 / 机器的计算和搜索能力 / 超越人类巅峰
// ============================================================================
export function drawPixelSceneBeyondHumanPeak(
  g: CanvasRenderingContext2D,
  pw: number,
  ph: number,
  time: number,
  localTime: number,
  energy: number
): void {
  const cx = Math.floor(pw * 0.5);
  const floorY = Math.floor(ph * 0.8);
  const surgeP = smoothstep(3.4, 6.2, localTime);
  const exceedP = smoothstep(5.4, 7.2, localTime);

  drawDitheredSky(g, pw, ph, [
    { stop: 0, color: '#081024' },
    { stop: 0.42, color: '#112244' },
    { stop: 0.78, color: '#1B3A63' },
  ]);
  pxStarfield(g, pw, ph, time, 36, 0.65);

  // Dark pedestal floor
  pxRect(g, 0, floorY, pw, ph - floorY, '#0B1324');
  pxRect(g, 0, floorY, pw, 2, PAL.ice);

  // LEFT: Spinning 16-Bit Broadcast Earth Globe sending victory waves worldwide!
  const globeX = Math.floor(pw * 0.28);
  const globeY = Math.floor(ph * 0.59);
  const globeR = 26;

  // Expanding broadcast radio rings
  for (let i = 0; i < 3; i++) {
    const rp = (time * 0.65 + i * 0.33) % 1;
    const rad = Math.round(globeR + 6 + rp * 34);
    if (rad < 62) {
      pxRing(g, globeX, globeY, rad, rp < 0.5 ? PAL.goldLight : PAL.ice, 1);
    }
  }

  drawDitheredGlow(g, globeX, globeY, 36, PAL.ice, 'light');
  pxCircle(g, globeX, globeY, globeR, '#1C4B78');
  pxCircle(g, globeX, globeY, globeR - 2, '#225B8E');
  pxRing(g, globeX, globeY, globeR, PAL.iceLight, 1);

  // Scrolling pixel continents across globe
  const rotShift = Math.floor(time * 12) % 36;
  const continents: Array<[number, number, number, number]> = [
    [-16, -12, 12, 7],
    [-4, -4, 14, 9],
    [8, 6, 10, 7],
    [-18, 6, 9, 6],
  ];
  for (const [ox, oy, cw, ch] of continents) {
    const sx = ((ox + rotShift + 18) % 36) - 18;
    const dist = Math.hypot(sx, oy);
    if (dist < globeR - 5) {
      pxRect(g, globeX + sx - Math.floor(cw / 2), globeY + oy - Math.floor(ch / 2), cw, ch, PAL.tealLight);
    }
  }
  // Tiny broadcast satellite orbiting top of globe
  const satA = time * 1.9;
  const satX = Math.round(globeX + Math.cos(satA) * (globeR + 10));
  const satY = Math.round(globeY + Math.sin(satA) * 14 - 8);
  pxRect(g, satX - 3, satY - 1, 7, 3, PAL.goldLight);
  pxRect(g, satX - 1, satY - 3, 3, 7, PAL.cream);

  // RIGHT: Benchmark Monument — Human Peak Bar vs Surging Machine Search Beam!
  const benchX = Math.floor(pw * 0.71);
  const humanX = benchX - 32;
  const aiX = benchX + 24;
  const humanH = 40;
  const aiMaxH = 74;
  const aiH = Math.round(lerp(16, aiMaxH, easeOutExpo(surgeP)));

  // Dotted "HUMAN PEAK" horizon threshold line
  const peakY = floorY - humanH;
  for (let x = benchX - 56; x < benchX + 56; x += 6) {
    pxRect(g, x, peakY, 3, 1, PAL.gold);
  }

  // Human column + tiny crown on top
  pxRect(g, humanX - 17, peakY, 34, humanH, '#2B3A57');
  pxOutline(g, humanX - 17, peakY, 34, humanH, PAL.gold, 1);
  for (let y = floorY - 14; y > peakY + 4; y -= 6) {
    pxRect(g, humanX - 12, y, 24, 3, PAL.goldDark);
  }
  drawSprite(
    g,
    SPRITE_TROPHY_CROWN,
    { G: PAL.goldLight, R: PAL.coralLight, D: PAL.goldDark },
    humanX,
    peakY - 10,
    1
  );
  pxBitmapText(g, 'HUMAN', humanX, floorY - 7, 1, PAL.cream);

  // Machine Search & Compute Beam shooting way past Human Peak!
  const aiTopY = floorY - aiH;
  drawDitheredGlow(g, aiX, aiTopY + 12, Math.round(28 + exceedP * 20 + energy * 8), PAL.iceWhite, 'medium');
  pxRect(g, aiX - 15, aiTopY, 30, aiH, '#164B7A');
  pxRect(g, aiX - 11, aiTopY + 2, 22, aiH - 2, PAL.ice);
  pxRect(g, aiX - 5, aiTopY + 2, 10, aiH - 2, exceedP > 0.4 ? PAL.goldLight : PAL.iceWhite);
  pxOutline(g, aiX - 15, aiTopY, 30, aiH, PAL.iceWhite, 1);

  // Rising binary search tree branches radiating off the machine beam tip
  if (surgeP > 0.25) {
    const treeSpan = Math.round(24 * surgeP);
    pxLine(g, aiX, aiTopY + 10, aiX - treeSpan, aiTopY - 8, PAL.tealLight, 1);
    pxLine(g, aiX, aiTopY + 10, aiX + treeSpan, aiTopY - 8, PAL.tealLight, 1);
    pxRect(g, aiX - treeSpan - 2, aiTopY - 10, 4, 4, PAL.goldLight);
    pxRect(g, aiX + treeSpan - 2, aiTopY - 10, 4, 4, PAL.goldLight);
  }

  // Victory apex star & crown burst once machine passes peak!
  if (exceedP > 0.1) {
    pxSparkle(g, aiX, aiTopY - 8, 3 + (Math.floor(time * 8) % 2), PAL.goldLight);
    pxSparkle(g, aiX - 18, aiTopY + 2, 2, PAL.iceWhite);
    pxSparkle(g, aiX + 18, aiTopY - 2, 2, PAL.cream);
    pxBitmapText(g, 'PEAK+', aiX, aiTopY - 18, 1, PAL.goldLight, PAL.void);
  }
}

// ============================================================================
// SCENE 38 (206.90–212.27s): Specialist "Lopsided Student" Report Card & Gears
// Cues 106–108: 但此时的 AI / 本质上还是个“偏科生” / 只会干特定、刻板的计算活
// ============================================================================
export function drawPixelSceneSpecialistStudent(
  g: CanvasRenderingContext2D,
  pw: number,
  ph: number,
  time: number,
  localTime: number,
  energy: number
): void {
  const cx = Math.floor(pw * 0.5);
  const floorY = Math.floor(ph * 0.8);
  const cardP = easeOutBack(clamp01((localTime - 0.35) / 0.55), 1.25);
  const stampP = easeOutBack(clamp01((localTime - 2.6) / 0.4), 1.35);

  drawDitheredSky(g, pw, ph, [
    { stop: 0, color: '#171828' },
    { stop: 0.5, color: '#22243A' },
    { stop: 0.88, color: '#2B2F47' },
  ]);

  // Subtle retro classroom drafting grid
  for (let gx = 16; gx < pw; gx += 24) {
    pxRect(g, gx, 0, 1, floorY, 'rgba(246, 238, 216, 0.04)');
  }
  for (let gy = 16; gy < floorY; gy += 24) {
    pxRect(g, 0, gy, pw, 1, 'rgba(246, 238, 216, 0.04)');
  }

  // Classroom desk surface
  pxRect(g, 0, floorY, pw, ph - floorY, '#2A1F1B');
  pxRect(g, 0, floorY, pw, 3, PAL.amber);

  // LEFT: Quirky 16-Bit Student Robot with Mechanical Gears
  const botX = Math.floor(pw * 0.23);
  const botY = floorY - 40;
  const bob = Math.round(Math.sin(time * 4) * 1.5);

  // Spinning rigid cogwheel behind the robot ("刻板的计算活")
  const gearX = botX - 24;
  const gearY = botY - 8;
  const gearR = 14;
  pxCircle(g, gearX, gearY, gearR - 3, PAL.slate);
  pxCircle(g, gearX, gearY, 5, '#1D2034');
  for (let t = 0; t < 8; t++) {
    const a = (t / 8) * Math.PI * 2 + Math.floor(time * 6) * 0.25;
    pxRect(g, Math.round(gearX + Math.cos(a) * gearR) - 2, Math.round(gearY + Math.sin(a) * gearR) - 2, 4, 4, PAL.slateLight);
  }

  // Robot chassis + mortarboard student cap
  pxRect(g, botX - 18, botY + 8, 36, 32, '#34425E');
  pxOutline(g, botX - 18, botY + 8, 36, 32, PAL.iceLight, 1);
  // Chest calculator grid
  pxRect(g, botX - 11, botY + 14, 22, 10, '#122230');
  pxBitmapText(g, '1+1', botX, botY + 19, 1, PAL.tealLight);
  for (let c = 0; c < 4; c++) {
    pxRect(g, botX - 10 + c * 6, botY + 28, 4, 4, c === Math.floor(time * 5) % 4 ? PAL.goldLight : PAL.slateLight);
  }
  // Head
  pxRect(g, botX - 15, botY - 14 + bob, 30, 20, PAL.creamDim);
  pxOutline(g, botX - 15, botY - 14 + bob, 30, 20, PAL.void, 1);
  // Square "nerd glasses" eyes
  pxRect(g, botX - 11, botY - 8 + bob, 9, 7, PAL.navyDark);
  pxRect(g, botX + 2, botY - 8 + bob, 9, 7, PAL.navyDark);
  pxRect(g, botX - 8, botY - 6 + bob, 3, 3, PAL.goldLight);
  pxRect(g, botX + 5, botY - 6 + bob, 3, 3, PAL.goldLight);
  pxRect(g, botX - 2, botY - 5 + bob, 4, 2, PAL.void);
  // Student mortarboard cap
  pxRect(g, botX - 20, botY - 19 + bob, 40, 4, PAL.navyDark);
  pxRect(g, botX - 11, botY - 22 + bob, 22, 3, PAL.slate);
  pxRect(g, botX + 16, botY - 16 + bob, 2, 9, PAL.goldLight);

  // RIGHT: Oversized Crisp 16-Bit Lopsided Report Card!
  const cardW = Math.min(184, Math.floor(pw * 0.52));
  const cardH = 82;
  const cardX = Math.floor(cx + pw * 0.14 - cardW * 0.5);
  const cardY = Math.floor(lerp(ph, ph * 0.38, clamp01(cardP)));

  pxRect(g, cardX + 3, cardY + 3, cardW, cardH, 'rgba(0, 0, 0, 0.35)');
  pxRect(g, cardX, cardY, cardW, cardH, '#EFE7D2');
  pxOutline(g, cardX, cardY, cardW, cardH, PAL.void, 2);
  pxRect(g, cardX + 2, cardY + 2, cardW - 4, 13, PAL.navyDark);
  pxBitmapText(g, 'AI REPORT CARD', cardX + Math.floor(cardW / 2), cardY + 8, 1, PAL.goldLight);

  const subjects: Array<{ name: string; score: number; grade: string; good: boolean }> = [
    { name: 'CHESS', score: 0.96, grade: 'A+', good: true },
    { name: 'VISION', score: 0.14, grade: 'F', good: false },
    { name: 'SPEECH', score: 0.11, grade: 'F', good: false },
    { name: 'COMMON', score: 0.08, grade: 'F', good: false },
  ];

  const barMaxW = cardW - 86;
  for (let i = 0; i < subjects.length; i++) {
    const s = subjects[i];
    const ry = cardY + 24 + i * 14;
    const fillP = easeOutExpo(clamp01((localTime - 0.7 - i * 0.2) / 0.6));
    pxBitmapText(g, s.name, cardX + 24, ry, 1, PAL.void);
    pxRect(g, cardX + 48, ry - 4, barMaxW, 8, '#D5CCB4');
    const bw = Math.max(3, Math.round(barMaxW * s.score * fillP));
    pxRect(g, cardX + 48, ry - 4, bw, 8, s.good ? PAL.gold : PAL.coral);
    if (s.good) {
      pxRect(g, cardX + 48, ry - 4, bw, 2, PAL.goldLight);
    }
    pxBitmapText(g, s.grade, cardX + cardW - 18, ry, 1, s.good ? PAL.tealDark : PAL.coralDark);
  }

  // Bold Red Stamp "RIGID!" slamming onto bottom-right corner of report card!
  if (stampP > 0.05) {
    const sw = Math.round(62 * clamp01(stampP));
    const sh = Math.round(16 * clamp01(stampP));
    const sx = cardX + cardW - 68;
    const sy = cardY + cardH - 22;
    pxRect(g, sx, sy, sw, sh, '#EFE7D2');
    pxOutline(g, sx, sy, sw, sh, PAL.coral, 2);
    if (stampP > 0.6) {
      pxBitmapText(g, 'RIGID!', sx + Math.floor(sw / 2), sy + Math.floor(sh / 2), 1, PAL.coral);
    }
    if (energy > 0.4) {
      pxSparkle(g, sx + sw, sy, 2, PAL.coralLight);
    }
  }
}

// ============================================================================
// SCENE 39 (212.27–217.27s): Stage 4 Dawn — Deep Learning Trinity Altar
// Cues 109–111: 第四阶段 / 深度学习革命 / 大数据 + 大算力 + 神经网络
// ============================================================================
export function drawPixelSceneStageFourDeepLearning(
  g: CanvasRenderingContext2D,
  pw: number,
  ph: number,
  time: number,
  localTime: number,
  energy: number
): void {
  const cx = Math.floor(pw * 0.5);
  const dataP = easeOutBack(clamp01((localTime - 1.55) / 0.55), 1.3);
  const gpuP = easeOutBack(clamp01((localTime - 2.35) / 0.55), 1.3);
  const netP = easeOutBack(clamp01((localTime - 3.1) / 0.55), 1.3);
  const linkP = smoothstep(2.6, 4.1, localTime);

  // Electric Indigo-Violet to Emerald-Teal Stage 4 Cosmic Sky
  drawDitheredSky(g, pw, ph, [
    { stop: 0, color: '#0B0A1F' },
    { stop: 0.36, color: '#18153A' },
    { stop: 0.72, color: '#212A54' },
    { stop: 0.92, color: '#1C485B' },
  ]);
  pxStarfield(g, pw, ph, time, 44, 0.75, time * 5);

  // Perspective retro-synth floor grid at bottom
  const horizY = Math.floor(ph * 0.78);
  pxRect(g, 0, horizY, pw, ph - horizY, '#0E172E');
  pxRect(g, 0, horizY, pw, 2, PAL.tealLight);
  for (let i = -7; i <= 7; i++) {
    pxLine(g, cx + i * 18, horizY, cx + i * 52, ph, 'rgba(126, 212, 192, 0.16)', 1);
  }

  // Three Trinity Pillar Positions (cleanly placed below top title, above bottom subtitle)
  const pData = { x: cx - 84, y: Math.floor(ph * 0.66) + Math.round(Math.sin(time * 2.6) * 2) };
  const pGpu = { x: cx + 84, y: Math.floor(ph * 0.66) + Math.round(Math.cos(time * 2.6) * 2) };
  const pNet = { x: cx, y: Math.floor(ph * 0.48) + Math.round(Math.sin(time * 3 + 1) * 2) };

  // Radiant connecting energy triangle beams between all three pillars!
  if (linkP > 0.05) {
    drawDitheredGlow(g, cx, Math.floor(ph * 0.6), Math.round(42 * linkP + energy * 10), PAL.goldLight, 'medium');
    pxLine(g, pData.x, pData.y, pGpu.x, pGpu.y, PAL.tealLight, 2);
    pxLine(g, pData.x, pData.y, pNet.x, pNet.y, PAL.goldLight, 2);
    pxLine(g, pGpu.x, pGpu.y, pNet.x, pNet.y, PAL.coralLight, 2);

    // Animated energy pulses racing along the triangle edges
    const edges: Array<[{ x: number; y: number }, { x: number; y: number }, string]> = [
      [pData, pGpu, PAL.tealLight],
      [pGpu, pNet, PAL.goldLight],
      [pNet, pData, PAL.coralLight],
    ];
    for (let e = 0; e < edges.length; e++) {
      const [a, b, col] = edges[e];
      const ep = (time * 1.4 + e * 0.33) % 1;
      const px = Math.round(lerp(a.x, b.x, ep));
      const py = Math.round(lerp(a.y, b.y, ep));
      pxRect(g, px - 2, py - 2, 4, 4, col);
    }
  }

  // PILLAR 1 (LEFT): BIG DATA Cylinder Relic
  if (dataP > 0.05) {
    const s = clamp01(dataP);
    drawDitheredGlow(g, pData.x, pData.y, Math.round(28 * s), PAL.tealLight, 'light');
    pxRect(g, pData.x - 24, pData.y - 18, 48, 36, '#102C38');
    pxOutline(g, pData.x - 24, pData.y - 18, 48, 36, PAL.tealLight, 2);
    for (let r = 0; r < 3; r++) {
      pxRect(g, pData.x - 16, pData.y - 13 + r * 6, 32, 4, r % 2 === 0 ? PAL.tealLight : PAL.iceLight);
    }
    pxBitmapText(g, 'DATA', pData.x, pData.y + 10, 1, PAL.cream);
  }

  // PILLAR 2 (RIGHT): BIG GPU Compute Chip Relic
  if (gpuP > 0.05) {
    const s = clamp01(gpuP);
    drawDitheredGlow(g, pGpu.x, pGpu.y, Math.round(28 * s), PAL.gold, 'light');
    // Gold chip pins
    for (let p = -14; p <= 14; p += 7) {
      pxRect(g, pGpu.x + p - 1, pGpu.y - 22, 2, 44, PAL.goldDark);
      pxRect(g, pGpu.x - 28, pGpu.y + p - 1, 56, 2, PAL.goldDark);
    }
    pxRect(g, pGpu.x - 24, pGpu.y - 18, 48, 36, '#2B2014');
    pxOutline(g, pGpu.x - 24, pGpu.y - 18, 48, 36, PAL.goldLight, 2);
    pxRect(g, pGpu.x - 12, pGpu.y - 12, 24, 13, PAL.gold);
    pxRect(g, pGpu.x - 8, pGpu.y - 9, 16, 7, PAL.goldLight);
    pxBitmapText(g, 'GPU', pGpu.x, pGpu.y + 10, 1, PAL.goldLight);
  }

  // PILLAR 3 (TOP): NEURAL NETWORK Star Relic
  if (netP > 0.05) {
    const s = clamp01(netP);
    drawDitheredGlow(g, pNet.x, pNet.y, Math.round(32 * s), PAL.coralLight, 'light');
    pxRect(g, pNet.x - 30, pNet.y - 18, 60, 36, '#261436');
    pxOutline(g, pNet.x - 30, pNet.y - 18, 60, 36, PAL.coralLight, 2);
    // Mini 3-layer neural web inside badge
    const nx = [pNet.x - 16, pNet.x, pNet.x + 16];
    const ny = [pNet.y - 11, pNet.y - 1];
    for (let i = 0; i < 2; i++) {
      for (let j = 0; j < 2; j++) {
        pxLine(g, nx[0], ny[i], nx[1], ny[j], PAL.gold, 1);
        pxLine(g, nx[1], ny[i], nx[2], ny[j], PAL.coralLight, 1);
      }
    }
    for (const x of nx) {
      for (const y of ny) {
        pxRect(g, x - 2, y - 2, 4, 4, PAL.cream);
      }
    }
    pxBitmapText(g, 'NEURAL', pNet.x, pNet.y + 10, 1, PAL.coralLight);
  }

  // Central fusion star spark
  if (linkP > 0.4) {
    pxSparkle(g, cx, Math.floor(ph * 0.6), 4 + Math.round(energy * 2), PAL.cream);
  }
}

// ============================================================================
// SCENE 40 (217.27–222.73s): 2010s Internet Boom & Big Data Deluge
// Cues 112–114: 转折点发生在2010年代初 / 随着互联网爆发 / 人类积累了海量的数据
// ============================================================================
export function drawPixelSceneInternetDataDeluge(
  g: CanvasRenderingContext2D,
  pw: number,
  ph: number,
  time: number,
  localTime: number,
  energy: number
): void {
  const cx = Math.floor(pw * 0.5);
  const floorY = Math.floor(ph * 0.8);
  const fillP = easeOutCubic(clamp01((localTime - 1.4) / 3.6));

  drawDitheredSky(g, pw, ph, [
    { stop: 0, color: '#071426' },
    { stop: 0.45, color: '#0E2644' },
    { stop: 0.85, color: '#173C5E' },
  ]);
  pxStarfield(g, pw, ph, time, 28, 0.55);

  // Subtle 2010s city skyline silhouettes along horizon
  const bHeights = [22, 34, 18, 42, 26, 30, 20, 38, 24, 32, 16, 28];
  const bw = Math.ceil(pw / bHeights.length);
  for (let i = 0; i < bHeights.length; i++) {
    const bx = i * bw;
    const bh = bHeights[i];
    pxRect(g, bx, floorY - bh, bw - 2, bh, '#0D1E36');
    for (let wy = floorY - bh + 4; wy < floorY - 4; wy += 6) {
      if ((i + wy) % 3 === 0) {
        pxRect(g, bx + 4, wy, 3, 3, PAL.goldDark);
        pxRect(g, bx + 11, wy, 3, 3, PAL.tealDark);
      }
    }
  }
  pxRect(g, 0, floorY, pw, ph - floorY, '#0A1628');
  pxRect(g, 0, floorY, pw, 2, PAL.tealLight);

  // LEFT DEVICE: 2010s Smartphone beaming media packets upward
  const phoneX = Math.floor(pw * 0.17);
  const phoneY = floorY - 36;
  pxRect(g, phoneX - 11, phoneY, 22, 36, '#1E293B');
  pxOutline(g, phoneX - 11, phoneY, 22, 36, PAL.iceLight, 1);
  pxRect(g, phoneX - 8, phoneY + 4, 16, 24, '#133A52');
  pxRect(g, phoneX - 5, phoneY + 8, 10, 8, PAL.goldLight); // mini photo icon
  pxRect(g, phoneX - 5, phoneY + 19, 10, 2, PAL.tealLight);
  pxRect(g, phoneX - 2, phoneY + 31, 4, 2, PAL.creamDim);

  // RIGHT DEVICE: Retro-Modern Laptop beaming packets upward
  const lapX = Math.floor(pw * 0.83);
  const lapY = floorY - 28;
  pxRect(g, lapX - 18, lapY, 36, 22, '#1E293B');
  pxOutline(g, lapX - 18, lapY, 36, 22, PAL.iceLight, 1);
  pxRect(g, lapX - 15, lapY + 3, 30, 16, '#10344A');
  pxRect(g, lapX - 11, lapY + 7, 14, 3, PAL.coralLight);
  pxRect(g, lapX - 11, lapY + 12, 20, 3, PAL.tealLight);
  pxRect(g, lapX - 24, lapY + 22, 48, 6, PAL.slateLight);

  // Wi-Fi signal arcs above both devices
  for (const dx of [phoneX, lapX]) {
    for (let r = 0; r < 2; r++) {
      const pulse = (Math.floor(time * 5 + r) % 2) === 0;
      pxLine(g, dx - 6 - r * 4, floorY - 42 - r * 5, dx, floorY - 46 - r * 5, pulse ? PAL.tealLight : PAL.ice, 1);
      pxLine(g, dx, floorY - 46 - r * 5, dx + 6 + r * 4, floorY - 42 - r * 5, pulse ? PAL.tealLight : PAL.ice, 1);
    }
  }

  // CENTER HERO: Colossal Glowing BIG DATA Cloud Vault Filling with Pixel Tiles!
  const vaultW = 124;
  const vaultH = 74;
  const vx = cx - Math.floor(vaultW / 2);
  const vy = Math.floor(ph * 0.4);

  drawDitheredGlow(g, cx, vy + 36, Math.round(52 + energy * 10), PAL.tealLight, 'light');
  pxRect(g, vx, vy, vaultW, vaultH, '#0C1E33');
  pxOutline(g, vx, vy, vaultW, vaultH, PAL.tealLight, 2);

  // Top telemetry header inside vault (clean, zero subtitle overlap)
  pxRect(g, vx + 2, vy + 2, vaultW - 4, 12, '#13304A');
  pxBitmapText(g, 'BIG DATA CLOUD', cx, vy + 8, 1, PAL.goldLight);

  // Rising sea of colorful pixel data blocks filling the vault!
  const innerTop = vy + 16;
  const innerH = vaultH - 19;
  const fillH = Math.max(4, Math.round(innerH * lerp(0.16, 0.94, fillP)));
  const fillTop = vy + vaultH - 3 - fillH;

  const tileCols = [PAL.tealLight, PAL.iceLight, PAL.goldLight, PAL.coralLight, PAL.teal];
  for (let ty = vy + vaultH - 7; ty >= fillTop; ty -= 5) {
    for (let tx = vx + 5; tx < vx + vaultW - 8; tx += 7) {
      const hash = (tx * 13 + ty * 7 + Math.floor(time * 4)) % tileCols.length;
      pxRect(g, tx, ty, 5, 3, tileCols[hash]);
    }
  }

  // Streaming luminous data packets arcing from Smartphone & Laptop right into the Vault!
  for (let i = 0; i < 16; i++) {
    const fromLeft = i % 2 === 0;
    const sp = (time * 0.85 + i * 0.13) % 1;
    const sx0 = fromLeft ? phoneX : lapX;
    const sy0 = floorY - 38;
    const sx1 = cx + (fromLeft ? -28 : 28) + ((i * 11) % 24) - 12;
    const sy1 = innerTop + 12;
    const px = Math.round(lerp(sx0, sx1, sp));
    const py = Math.round(lerp(sy0, sy1, sp) - Math.sin(sp * Math.PI) * 28);
    pxRect(g, px - 2, py - 2, 4, 4, i % 3 === 0 ? PAL.goldLight : i % 3 === 1 ? PAL.tealLight : PAL.coralLight);
  }
}

// ============================================================================
// SCENE 41 (222.73–227.17s): GPU Compute Surge — Dual-Fan Parallel Core Engine
// Cues 115–116: 同时 / GPU的飞速发展带来了前所未有的强大算力
// ============================================================================
export function drawPixelSceneGpuComputeSurge(
  g: CanvasRenderingContext2D,
  pw: number,
  ph: number,
  time: number,
  localTime: number,
  energy: number
): void {
  const cx = Math.floor(pw * 0.5);
  const revP = easeOutExpo(clamp01(localTime / 2.2));

  // Dark obsidian silicon-forge backdrop
  drawDitheredSky(g, pw, ph, [
    { stop: 0, color: '#0A0D18' },
    { stop: 0.48, color: '#14192B' },
    { stop: 0.88, color: '#211C30' },
  ]);

  // Glowing copper/gold PCB circuit bus traces running left & right
  for (let i = 0; i < 6; i++) {
    const ty = Math.floor(ph * 0.44 + i * 12);
    pxRect(g, 0, ty, pw, 1, 'rgba(242, 180, 75, 0.18)');
    const pulseX = Math.floor(((time * (80 + i * 18) + i * 47) % (pw + 40)) - 20);
    pxRect(g, pulseX, ty - 1, 12, 3, i % 2 === 0 ? PAL.tealLight : PAL.goldLight);
  }

  // HERO: Monumental 16-Bit Dual-Fan GPU Graphics Card!
  const cardW = Math.min(224, pw - 34);
  const cardH = 74;
  const gx = cx - Math.floor(cardW / 2);
  const gy = Math.floor(ph * 0.42);

  drawDitheredGlow(g, cx, gy + 36, Math.round(58 + revP * 18 + energy * 12), PAL.gold, 'medium');

  // Gold PCIe contact connector strip underneath card
  pxRect(g, gx + 28, gy + cardH, cardW - 76, 6, PAL.goldDark);
  for (let px = gx + 31; px < gx + cardW - 50; px += 5) {
    pxRect(g, px, gy + cardH + 1, 3, 4, PAL.goldLight);
  }

  // Main GPU shroud chassis
  pxRect(g, gx, gy, cardW, cardH, '#192236');
  pxRect(g, gx + 4, gy + 4, cardW - 8, cardH - 8, '#101624');
  pxOutline(g, gx, gy, cardW, cardH, PAL.goldLight, 2);

  // Top glowing GPU status bar inside shroud
  pxRect(g, gx + 4, gy + 4, cardW - 8, 12, '#1D2942');
  pxBitmapText(g, 'GPU PARALLEL CORE', cx - 34, gy + 10, 1, PAL.tealLight);
  const tflops = Math.round(lerp(12, 1024, revP));
  pxBitmapText(g, `${tflops}X`, gx + cardW - 24, gy + 10, 1, PAL.goldLight);

  // LEFT & RIGHT: Dual High-Speed Spinning Pixel Cooling Fans!
  const fanOffsets = [-Math.floor(cardW * 0.31), Math.floor(cardW * 0.31)];
  const fanY = gy + 44;
  const fanR = 20;
  for (let f = 0; f < fanOffsets.length; f++) {
    const fx = cx + fanOffsets[f];
    pxCircle(g, fx, fanY, fanR, '#0A101B');
    pxRing(g, fx, fanY, fanR, f === 0 ? PAL.tealLight : PAL.goldLight, 1);

    // 6 fast-spinning fan blades
    const spin = time * (6 + revP * 14) * (f === 0 ? 1 : -1);
    for (let b = 0; b < 6; b++) {
      const a = spin + (b / 6) * Math.PI * 2;
      const bx = Math.round(fx + Math.cos(a) * (fanR - 3));
      const by = Math.round(fanY + Math.sin(a) * (fanR - 3));
      pxLine(g, fx, fanY, bx, by, f === 0 ? PAL.teal : PAL.amber, 3);
    }
    pxCircle(g, fx, fanY, 5, PAL.cream);
    pxCircle(g, fx, fanY, 2, PAL.void);
  }

  // CENTER: Exposed 6x6 Parallel Shader Core Matrix firing in lightning waves!
  const matW = 46;
  const matH = 42;
  const mx = cx - Math.floor(matW / 2);
  const my = gy + 23;
  pxRect(g, mx, my, matW, matH, '#09111E');
  pxOutline(g, mx, my, matW, matH, PAL.iceLight, 1);

  const wavePhase = time * 14;
  for (let r = 0; r < 6; r++) {
    for (let c = 0; c < 6; c++) {
      const pulse = Math.sin(wavePhase - (r + c) * 0.75);
      const col =
        pulse > 0.45 ? PAL.goldLight : pulse > -0.1 ? PAL.tealLight : '#1B334A';
      pxRect(g, mx + 4 + c * 6 + 1, my + 4 + r * 6, 4, 4, col);
    }
  }

  // Crackling electric surge sparks leaping off top of GPU!
  for (let i = 0; i < 8; i++) {
    const sx = gx + 18 + ((i * 29 + Math.floor(time * 40)) % (cardW - 36));
    const sy = gy - 4 - ((Math.floor(time * 24) + i * 5) % 14);
    pxSparkle(g, sx, sy, i % 2 === 0 ? 2 : 1, i % 2 === 0 ? PAL.goldLight : PAL.tealLight);
  }
}

// ============================================================================
// SCENE 42 (227.17–234.20s): Deep Artificial Neural Network Awakening & Eruption!
// Cues 117–120: 沉寂多年的深度学习 / 模仿人类大脑神经元结构 / 人工神经网络 / 迎来了爆发
// ============================================================================
export function drawPixelSceneNeuralNetworkAwakening(
  g: CanvasRenderingContext2D,
  pw: number,
  ph: number,
  time: number,
  localTime: number,
  energy: number
): void {
  const cx = Math.floor(pw * 0.5);
  const cy = Math.floor(ph * 0.59);
  const wakeP = smoothstep(0.6, 4.8, localTime);
  const eruptP = smoothstep(4.9, 6.2, localTime);

  // Deep Neural Nebula Sky warming dramatically on eruption!
  drawDitheredSky(g, pw, ph, [
    { stop: 0, color: '#080B1D' },
    { stop: 0.4, color: eruptP > 0.3 ? '#1D1846' : '#121736' },
    { stop: 0.78, color: eruptP > 0.3 ? '#3A2352' : '#1B254A' },
    { stop: 0.96, color: eruptP > 0.3 ? '#6E3B4A' : '#1C3B54' },
  ]);
  pxStarfield(g, pw, ph, time, 46, 0.75, time * 4);

  // Subtle luminous pixel brain hemisphere aura framing the neural network
  const auraR = Math.round(lerp(56, 78, wakeP) + eruptP * 18 + energy * 10);
  drawDitheredGlow(g, cx - 28, cy, auraR, PAL.tealLight, 'light');
  drawDitheredGlow(g, cx + 28, cy, auraR, eruptP > 0.2 ? PAL.goldLight : PAL.coralLight, 'light');

  // Dramatic Golden-Cyan Supernova Beams erupting on Cue 120 ("迎来了爆发")!
  if (eruptP > 0.04) {
    const rayLen = Math.round(140 * easeOutExpo(eruptP));
    for (let i = 0; i < 16; i++) {
      const a = (i / 16) * Math.PI * 2 + time * 0.45;
      const col = i % 2 === 0 ? 'rgba(255, 224, 138, 0.28)' : 'rgba(126, 212, 192, 0.22)';
      pxLine(g, cx, cy, Math.round(cx + Math.cos(a) * rayLen), Math.round(cy + Math.sin(a) * rayLen * 0.72), col, 2);
    }
    pxRing(g, cx, cy, Math.round(eruptP * 110), PAL.goldLight, 1);
    pxRing(g, cx, cy, Math.round(eruptP * 76), PAL.tealLight, 1);
  }

  // 5-Layer Deep Neural Network Topology (Input -> 3 Hidden Layers -> Output)
  const layerCounts = [4, 6, 6, 5, 3];
  const netW = Math.min(248, pw - 44);
  const netH = 74;
  const x0 = cx - Math.floor(netW / 2);

  const nodes: Array<Array<{ x: number; y: number }>> = [];
  for (let l = 0; l < layerCounts.length; l++) {
    const count = layerCounts[l];
    const lx = Math.round(x0 + (l / (layerCounts.length - 1)) * netW);
    const layerNodes: Array<{ x: number; y: number }> = [];
    for (let n = 0; n < count; n++) {
      const frac = count === 1 ? 0.5 : n / (count - 1);
      const ly = Math.round(cy - netH / 2 + frac * netH + Math.sin(time * 2.2 + l + n) * 1.5);
      layerNodes.push({ x: lx, y: ly });
    }
    nodes.push(layerNodes);
  }

  // Synaptic connections between layers (igniting progressively left -> right!)
  const activeFront = wakeP * (layerCounts.length - 1) + eruptP * 2;
  for (let l = 0; l < nodes.length - 1; l++) {
    const litLayer = clamp01(activeFront - l);
    for (let i = 0; i < nodes[l].length; i++) {
      for (let j = 0; j < nodes[l + 1].length; j++) {
        // Keep dense yet crisp pixel readability by drawing deterministic synaptic mesh
        if ((i + j + l) % 2 !== 0 && eruptP < 0.2) continue;
        const a = nodes[l][i];
        const b = nodes[l + 1][j];
        const col =
          eruptP > 0.35
            ? (i + j) % 2 === 0
              ? PAL.goldLight
              : PAL.tealLight
            : litLayer > 0.45
              ? PAL.teal
              : '#1C2B4A';
        pxLine(g, a.x, a.y, b.x, b.y, col, 1);

        // Animated forward-propagation signal spark racing along activated synapses!
        if (litLayer > 0.15 && (i + j) % 3 === 0) {
          const sp = (time * 1.6 + i * 0.21 + j * 0.17 + l * 0.25) % 1;
          const sx = Math.round(lerp(a.x, b.x, sp));
          const sy = Math.round(lerp(a.y, b.y, sp));
          pxRect(g, sx - 1, sy - 1, 2, 2, eruptP > 0.3 ? PAL.cream : PAL.goldLight);
        }
      }
    }
  }

  // Draw crisp glowing pixel neuron nodes on top of synapses
  for (let l = 0; l < nodes.length; l++) {
    const layerLit = clamp01(activeFront - l + 0.45);
    for (let n = 0; n < nodes[l].length; n++) {
      const node = nodes[l][n];
      const pulse = Math.sin(time * 7 + l * 1.1 + n * 0.9) > 0.3;
      const r = eruptP > 0.3 ? 4 : layerLit > 0.5 ? 3 : 2;
      const outerCol =
        eruptP > 0.35
          ? PAL.goldLight
          : layerLit > 0.5
            ? l % 2 === 0
              ? PAL.tealLight
              : PAL.coralLight
            : PAL.slate;
      pxCircle(g, node.x, node.y, r + 1, PAL.void);
      pxCircle(g, node.x, node.y, r, outerCol);
      if (layerLit > 0.4 || pulse) {
        pxRect(g, node.x - 1, node.y - 1, 2, 2, PAL.cream);
      }
    }
  }

  // Eruption celebratory starburst sparkles floating around the awakened network!
  if (eruptP > 0.15) {
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2 + time * 0.8;
      const dist = 36 + eruptP * 54 + (i % 3) * 14;
      pxSparkle(
        g,
        cx + Math.cos(a) * dist,
        cy + Math.sin(a) * dist * 0.55,
        i % 2 === 0 ? 3 : 2,
        i % 3 === 0 ? PAL.goldLight : i % 3 === 1 ? PAL.tealLight : PAL.cream
      );
    }
  }
}
