import {
  PAL,
  SPRITE_CHESS_KNIGHT,
  SPRITE_PIXEL_THINKER,
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
// SCENE 32 (163.90–169.47s): Stage 3 Dawn — Embrace Data Ocean & Prism
// Cues 83–86: 第三阶段： / 统计学崛起与标志性胜利 / 换个思路 / 拥抱数据
// ============================================================================
export function drawPixelSceneStageThreeData(
  g: CanvasRenderingContext2D,
  pw: number,
  ph: number,
  time: number,
  localTime: number,
  energy: number
): void {
  const cx = Math.floor(pw * 0.5);
  const riseP = easeOutExpo(clamp01(localTime / 1.35));

  // Crisp thawing emerald-to-gold dawn sky replacing the blue winter
  drawDitheredSky(g, pw, ph, [
    { stop: 0, color: '#0B1626' },
    { stop: 0.38, color: '#13283D' },
    { stop: 0.72, color: '#1E4654' },
    { stop: 0.9, color: '#396F6E' },
  ]);
  pxStarfield(g, pw, ph, time, 34, 0.55, time * 4);

  // Shimmering 16-bit Data Horizon Ocean (3 parallax sine wave bands)
  const seaY = Math.floor(ph * 0.74);
  const waveBands: Array<{ y: number; col: string; spd: number; amp: number }> = [
    { y: seaY, col: '#1B4958', spd: 1.8, amp: 2 },
    { y: seaY + 10, col: '#25616D', spd: 2.4, amp: 2.5 },
    { y: seaY + 20, col: '#132C3C', spd: 3.1, amp: 2 },
  ];
  for (const band of waveBands) {
    for (let x = 0; x < pw; x += 4) {
      const wy = Math.round(band.y + Math.sin(x * 0.06 + time * band.spd) * band.amp);
      pxRect(g, x, wy, 4, ph - wy, band.col);
      if (((x + Math.floor(time * 24)) & 15) === 0) {
        pxRect(g, x, wy, 3, 1, PAL.tealLight);
      }
    }
  }

  // Rising glowing binary data droplets floating from the ocean into the prism!
  for (let i = 0; i < 24; i++) {
    const dp = (time * 0.55 + i * 0.13) % 1;
    const dx = Math.floor(((i * 37 + Math.sin(time + i) * 10) % pw + pw) % pw);
    const dy = Math.round(lerp(seaY + 8, ph * 0.36, dp));
    pxRect(g, dx, dy, 2, 2, i % 3 === 0 ? PAL.goldLight : PAL.tealLight);
  }

  // HERO: Levitating 16-Bit Data Crystal Prism radiating statistical vectors
  const prismY = Math.floor(lerp(ph * 0.72, ph * 0.57, riseP) + Math.sin(time * 2.6) * 3);
  drawDitheredGlow(g, cx, prismY, Math.round(46 + energy * 10), PAL.tealLight, 'medium');
  pxRing(g, cx, prismY, Math.round(30 * riseP), PAL.gold, 1);
  pxRing(g, cx, prismY, Math.round(42 * riseP), PAL.tealDark, 1);

  // Faceted pixel diamond prism
  const pr = Math.round(20 * riseP);
  for (let dy = -pr; dy <= pr; dy++) {
    const span = Math.max(1, Math.round((1 - Math.abs(dy) / Math.max(1, pr)) * pr * 0.8));
    pxRect(g, cx - span, prismY + dy, span, 1, dy < 0 ? PAL.tealLight : PAL.teal);
    pxRect(g, cx, prismY + dy, span, 1, dy < 0 ? PAL.goldLight : PAL.gold);
  }
  pxSparkle(g, cx, prismY - pr - 4, 3, PAL.cream);
  pxSparkle(g, cx - 28, prismY + 4, 2, PAL.goldLight);
  pxSparkle(g, cx + 28, prismY - 6, 2, PAL.tealLight);
}

// ============================================================================
// SCENE 33 (169.47–178.97s): Abandon Hardcoded Rules -> Self-Learning Core
// Cues 87–90: 经历了两次寒冬 / 痛定思痛 / 靠硬编码规则行不通 / 让机器从数据中自己学习
// ============================================================================
export function drawPixelSceneAbandonHardcode(
  g: CanvasRenderingContext2D,
  pw: number,
  ph: number,
  time: number,
  localTime: number,
  energy: number
): void {
  const cx = Math.floor(pw * 0.5);
  const crossP = smoothstep(2.4, 3.6, localTime);
  const learnP = smoothstep(4.6, 6.8, localTime);

  drawDitheredSky(g, pw, ph, [
    { stop: 0, color: '#101424' },
    { stop: 0.5, color: '#192238' },
    { stop: 0.86, color: '#212E46' },
  ]);

  const floorY = Math.floor(ph * 0.8);
  pxRect(g, 0, floorY, pw, ph - floorY, '#141B2B');
  pxRect(g, 0, floorY, pw, 2, PAL.slate);

  const leftX = Math.floor(pw * 0.25);
  const rightX = Math.floor(pw * 0.74);

  // LEFT: Cracked old hard-coded IF-ELSE brick wall with bold red X stamp!
  const wallY = floorY - 56;
  const crumble = crossP * 6;
  for (let row = 0; row < 4; row++) {
    const bx = leftX - 30 + (row % 2 === 0 ? -crumble : crumble);
    const by = wallY + row * 14;
    pxRect(g, bx, by, 60, 12, row % 2 === 0 ? PAL.slate : PAL.navyLight);
    pxOutline(g, bx, by, 60, 12, PAL.void, 1);
    pxBitmapText(g, row % 2 === 0 ? 'IF/ELSE' : 'HARDCODE', bx + 30, by + 6, 1, PAL.creamDim);
  }

  // Bold crimson X slashing across the brittle hardcoded wall
  if (crossP > 0.05) {
    const xLen = Math.round(28 * easeOutExpo(crossP));
    const midWallY = wallY + 28;
    pxLine(g, leftX - xLen, midWallY - xLen, leftX + xLen, midWallY + xLen, PAL.coral, 3);
    pxLine(g, leftX - xLen, midWallY + xLen, leftX + xLen, midWallY - xLen, PAL.coral, 3);
  }

  // CENTER: Glowing Paradigm-Shift Arrow sweeping left -> right
  const arrowP = smoothstep(3.8, 5.4, localTime);
  if (arrowP > 0.04) {
    const ax0 = leftX + 38;
    const ax1 = Math.round(lerp(ax0, rightX - 42, easeOutExpo(arrowP)));
    const ay = floorY - 28;
    pxLine(g, ax0, ay, ax1, ay, PAL.goldLight, 3);
    if (arrowP > 0.6) {
      pxLine(g, ax1 - 7, ay - 6, ax1, ay, PAL.goldLight, 2);
      pxLine(g, ax1 - 7, ay + 6, ax1, ay, PAL.goldLight, 2);
    }
  }

  // RIGHT: Radiant Self-Learning Pixel Core absorbing streaming colorful data blocks!
  const coreY = floorY - 32;
  const glowR = Math.round(lerp(22, 46, learnP) + energy * 8);
  drawDitheredGlow(g, rightX, coreY, glowR, PAL.tealLight, 'medium');

  // Core chassis + pulsing neural core orb
  pxRect(g, rightX - 30, coreY - 24, 60, 48, PAL.navyDark);
  pxOutline(g, rightX - 30, coreY - 24, 60, 48, learnP > 0.3 ? PAL.goldLight : PAL.teal, 2);

  // Inner animated neural nodes lighting up as data enters
  const orbR = Math.round(11 + learnP * 4 + Math.sin(time * 6) * 1.5);
  pxCircle(g, rightX, coreY - 2, orbR, PAL.teal);
  pxCircle(g, rightX, coreY - 2, Math.max(4, orbR - 4), PAL.tealLight);
  pxCircle(g, rightX - 2, coreY - 4, 3, PAL.cream);
  pxBitmapText(g, 'LEARN', rightX, coreY + 17, 1, PAL.goldLight);

  // Colorful data packets streaming smoothly from above & right into the Learning Core!
  if (learnP > 0.05) {
    for (let i = 0; i < 12; i++) {
      const sp = (time * 0.9 + i * 0.19) % 1;
      const angle = -Math.PI * 0.85 + (i / 11) * Math.PI * 0.7;
      const dist = lerp(52, 8, sp);
      const dx = Math.round(rightX + Math.cos(angle) * dist);
      const dy = Math.round(coreY - 4 + Math.sin(angle) * dist);
      const col = i % 3 === 0 ? PAL.goldLight : i % 3 === 1 ? PAL.tealLight : PAL.coralLight;
      pxRect(g, dx - 1, dy - 1, 3, 3, col);
    }
  }
}

// ============================================================================
// SCENE 34 (178.97–188.90s): Statistics & Machine Learning Finding Patterns
// Cues 91–95: 统计学方法和机器学习大行其道 / 给成千上万个例子 / 让它自己寻找规律
// ============================================================================
export function drawPixelSceneMachineLearningRise(
  g: CanvasRenderingContext2D,
  pw: number,
  ph: number,
  time: number,
  localTime: number,
  energy: number
): void {
  const cx = Math.floor(pw * 0.5);
  const sampleCount = Math.floor(lerp(8, 68, clamp01((localTime - 1.2) / 5.5)));
  const fitP = smoothstep(5.4, 8.6, localTime);

  drawDitheredSky(g, pw, ph, [
    { stop: 0, color: '#0C1626' },
    { stop: 0.5, color: '#14243B' },
    { stop: 0.88, color: '#1B324A' },
  ]);

  // Large crisp 16-bit Statistical Coordinate & Pattern-Finding Console
  const boardW = Math.min(250, pw - 44);
  const boardH = Math.min(90, Math.floor(ph * 0.42));
  const bx = cx - Math.floor(boardW / 2);
  const by = Math.floor(ph * 0.39);

  pxRect(g, bx, by, boardW, boardH, '#0E1C28');
  pxRect(g, bx + 2, by + 2, boardW - 4, 13, '#13273A');
  pxOutline(g, bx, by, boardW, boardH, PAL.teal, 2);

  // Clean top telemetry header inside console (zero collision with bottom subtitles!)
  pxBitmapText(g, `SAMPLES:${sampleCount * 150}`, bx + 54, by + 8, 1, PAL.tealLight);
  pxBitmapText(
    g,
    fitP > 0.7 ? 'PATTERN FOUND!' : 'LEARNING...',
    bx + boardW - 58,
    by + 8,
    1,
    fitP > 0.7 ? PAL.goldLight : PAL.creamDim
  );

  // Subtle coordinate grid lines
  for (let gx = bx + 20; gx < bx + boardW; gx += 20) {
    pxRect(g, gx, by + 16, 1, boardH - 18, '#162D3F');
  }
  for (let gy = by + 28; gy < by + boardH; gy += 16) {
    pxRect(g, bx + 2, gy, boardW - 4, 1, '#162D3F');
  }

  // Axes
  const axX = bx + 16;
  const axY = by + boardH - 10;
  pxLine(g, axX, by + 20, axX, axY, PAL.slateLight, 1);
  pxLine(g, axX, axY, bx + boardW - 12, axY, PAL.slateLight, 1);

  // Scatter plot: two clear clusters of examples pouring in ("成千上万个例子")
  const plotW = boardW - 36;
  const plotH = boardH - 36;
  for (let i = 0; i < sampleCount; i++) {
    const isUpper = i % 2 === 0;
    const u = ((i * 37.7) % 100) / 100;
    const jitter = (((i * 61.3) % 100) / 100 - 0.5) * 0.24;
    const v = clamp01((isUpper ? 0.66 - u * 0.35 : 0.34 - u * 0.35) + jitter + 0.16);
    const sx = Math.round(axX + 4 + u * plotW);
    const sy = Math.round(axY - 4 - v * plotH);
    const col = isUpper ? PAL.goldLight : PAL.tealLight;
    pxRect(g, sx - 1, sy - 1, 3, 3, col);
  }

  // Animated Statistical Bell Curve + Self-Adjusting Golden Decision Boundary ("自己寻找规律")!
  const sweepX = axX + 4 + Math.round(fitP * plotW);
  if (fitP > 0.02) {
    // Glowing golden separating curve locking onto the data clusters
    let prevX = axX + 4;
    let prevY = Math.round(axY - 4 - 0.66 * plotH);
    const steps = 24;
    for (let s = 1; s <= steps; s++) {
      const f = (s / steps) * fitP;
      const x = Math.round(axX + 4 + f * plotW);
      const yNorm = 0.66 - f * 0.36 + Math.sin(f * Math.PI * 2) * 0.04;
      const y = Math.round(axY - 4 - yNorm * plotH);
      pxLine(g, prevX, prevY, x, y, PAL.coralLight, 2);
      prevX = x;
      prevY = y;
    }
    pxSparkle(g, prevX, prevY, 3 + Math.round(energy), PAL.goldLight);

    // Subtle probability bell curve shimmer along bottom of plot
    for (let dx = 0; dx < plotW; dx += 3) {
      const norm = (dx / plotW - 0.5) * 3.2;
      const bell = Math.exp(-norm * norm) * 18 * fitP;
      pxRect(g, axX + 4 + dx, Math.round(axY - bell), 2, Math.max(1, Math.round(bell)), 'rgba(126, 212, 192, 0.22)');
    }
  }

  // Scanning laser head sweeping across scatter plot while finding patterns
  if (fitP > 0.05 && fitP < 0.98) {
    pxRect(g, sweepX, by + 17, 1, boardH - 21, PAL.goldLight);
  }

  if (pw > 300) {
    const thinkPal: Record<string, string> = { S: PAL.cream, D: PAL.void, T: PAL.tealLight };
    drawSprite(g, SPRITE_PIXEL_THINKER, thinkPal, bx - 22, by + boardH - 12, 2);
  }
}

// ============================================================================
// SCENE 35 (188.90–192.80s): 1997 Championship Arena Curtains & Spotlight
// Cues 96–98: 这个时代的标志性事件 / 大家一定不陌生 / 1997年
// ============================================================================
export function drawPixelSceneMilestone1997(
  g: CanvasRenderingContext2D,
  pw: number,
  ph: number,
  time: number,
  localTime: number,
  energy: number
): void {
  const cx = Math.floor(pw * 0.5);
  const curtainOpen = easeOutCubic(clamp01(localTime / 1.4));

  // Royal midnight tournament hall
  drawDitheredSky(g, pw, ph, [
    { stop: 0, color: '#0C0E1E' },
    { stop: 0.45, color: '#171A34' },
    { stop: 0.85, color: '#222444' },
  ]);

  // Converging golden overhead tournament spotlights
  const tableY = Math.floor(ph * 0.72);
  for (const side of [-1, 1]) {
    const srcX = cx + side * 66;
    for (let i = -3; i <= 3; i++) {
      pxLine(g, srcX, 0, cx + i * 10, tableY, 'rgba(255, 224, 138, 0.14)', 2);
    }
  }
  drawDitheredGlow(g, cx, tableY - 12, Math.round(56 + energy * 8), PAL.gold, 'light');

  // Grand checkered championship table silhouette in center spotlight
  const tw = 112;
  pxRect(g, cx - Math.floor(tw / 2), tableY, tw, 8, PAL.amber);
  pxOutline(g, cx - Math.floor(tw / 2), tableY, tw, 8, PAL.void, 1);
  pxRect(g, cx - 44, tableY + 8, 8, ph - tableY - 8, '#3B251E');
  pxRect(g, cx + 36, tableY + 8, 8, ph - tableY - 8, '#3B251E');

  // Crisp checkered board sitting on top of the table
  for (let c = 0; c < 12; c++) {
    pxRect(g, cx - 48 + c * 8, tableY - 4, 8, 4, c % 2 === 0 ? PAL.cream : PAL.navyDark);
  }

  // Iconic Chess Knight piece gleaming in center spotlight
  drawSprite(
    g,
    SPRITE_CHESS_KNIGHT,
    { G: PAL.goldLight, D: PAL.goldDark },
    cx,
    tableY - 17,
    3
  );
  pxSparkle(g, cx - 18, tableY - 28, 2 + (Math.floor(time * 5) % 2), PAL.goldLight);
  pxSparkle(g, cx + 20, tableY - 24, 2, PAL.cream);

  // Glittering Tournament Marquee Banner on arena wall (complements 1997 title without repeating)
  if (localTime > 1.8) {
    const p97 = easeOutBack(clamp01((localTime - 1.8) / 0.45), 1.3);
    const mw = Math.round(92 * p97);
    if (mw > 10) {
      const my = Math.floor(ph * 0.45);
      pxRect(g, cx - Math.floor(mw / 2), my - 10, mw, 20, PAL.navyDark);
      pxOutline(g, cx - Math.floor(mw / 2), my - 10, mw, 20, PAL.goldLight, 2);
      if (p97 > 0.65) {
        pxBitmapText(g, 'CHESS MATCH', cx, my, 1, PAL.goldLight, PAL.void);
      }
    }
  }

  // Deep crimson velvet stage curtains parting smoothly on left & right!
  const curtainW = Math.round(lerp(pw * 0.36, pw * 0.11, curtainOpen));
  pxRect(g, 0, 0, curtainW, ph, '#4A1826');
  pxRect(g, pw - curtainW, 0, curtainW, ph, '#4A1826');
  for (let x = 6; x < curtainW; x += 8) {
    pxRect(g, x, 0, 2, ph, '#6E2436');
    pxRect(g, pw - x - 2, 0, 2, ph, '#6E2436');
  }
  pxRect(g, curtainW - 3, 0, 3, ph, PAL.goldDark);
  pxRect(g, pw - curtainW, 0, 3, ph, PAL.goldDark);
}

// ============================================================================
// SCENE 36 (192.80–198.60s): 1997 IBM Deep Blue Defeats World Champion Kasparov
// Cues 99–100: IBM 的超级计算机“深蓝” / 击败了人类国际象棋世界冠军卡斯帕罗夫
// ============================================================================
export function drawPixelSceneDeepBlueVictory(
  g: CanvasRenderingContext2D,
  pw: number,
  ph: number,
  time: number,
  localTime: number,
  energy: number
): void {
  const cx = Math.floor(pw * 0.5);
  const strikeP = smoothstep(2.1, 3.15, localTime);
  const winP = smoothstep(3.1, 3.9, localTime);

  // Electric cobalt-to-midnight championship arena sky
  drawDitheredSky(g, pw, ph, [
    { stop: 0, color: '#070E22' },
    { stop: 0.42, color: '#102147' },
    { stop: 0.8, color: '#19376B' },
  ]);
  pxStarfield(g, pw, ph, time, 30, 0.5);

  const floorY = Math.floor(ph * 0.82);
  pxRect(g, 0, floorY, pw, ph - floorY, '#0E172B');
  pxRect(g, 0, floorY, pw, 2, PAL.ice);

  // LEFT: Towering IBM DEEP BLUE Dual Supercomputer Monolith!
  const ibmX = Math.max(18, cx - 134);
  const ibmY = floorY - 82;
  const ibmW = 58;
  const ibmH = 82;
  drawDitheredGlow(g, ibmX + 29, ibmY + 40, 44, PAL.ice, 'light');
  pxRect(g, ibmX, ibmY, ibmW, ibmH, '#162C54');
  pxRect(g, ibmX + 3, ibmY + 3, ibmW - 6, ibmH - 6, '#0D1C38');
  pxOutline(g, ibmX, ibmY, ibmW, ibmH, PAL.iceLight, 2);

  // Glowing IBM blue horizontal stripe header + frantic 200M pos/sec compute LEDs
  pxRect(g, ibmX + 6, ibmY + 6, ibmW - 12, 11, '#1E4680');
  pxBitmapText(g, 'IBM', ibmX + 29, ibmY + 12, 1, PAL.iceWhite);
  for (let r = 0; r < 6; r++) {
    for (let c = 0; c < 6; c++) {
      const lit = Math.floor(time * 14 + r * 5 + c * 3) % 3 === 0;
      pxRect(g, ibmX + 9 + c * 7, ibmY + 23 + r * 7, 4, 4, lit ? PAL.iceWhite : '#1E3C6B');
    }
  }
  pxBitmapText(g, 'DEEP BLUE', ibmX + 29, ibmY + 73, 1, PAL.iceLight);

  // RIGHT: World Champion Kasparov Silhouette & Classic Chess Clock
  const kasX = Math.min(pw - 42, cx + 106);
  const kasY = floorY - 56;
  pxRect(g, kasX - 24, kasY, 48, 56, '#1B2034');
  pxOutline(g, kasX - 24, kasY, 48, 56, winP > 0.3 ? PAL.slate : PAL.gold, 1);
  // Champion portrait sprite (bowing slightly on checkmate)
  const bowY = Math.round(winP * 3);
  pxCircle(g, kasX, kasY + 18 + bowY, 8, PAL.cream);
  pxRect(g, kasX - 8, kasY + 10 + bowY, 16, 5, '#2A2226'); // dark hair
  pxRect(g, kasX - 4, kasY + 17 + bowY, 2, 2, PAL.void);
  pxRect(g, kasX + 2, kasY + 17 + bowY, 2, 2, PAL.void);
  pxRect(g, kasX - 13, kasY + 28, 26, 26, '#262C42'); // suit
  pxRect(g, kasX - 3, kasY + 28, 6, 12, PAL.cream); // collar
  pxRect(g, kasX - 1, kasY + 30, 2, 12, PAL.coral); // tie
  pxBitmapText(g, 'CHAMP', kasX, kasY - 7, 1, PAL.creamDim, PAL.void);

  // CENTER: Dramatic Perspective 16-Bit Chessboard & Parabolic Checkmate Strike!
  const boardW = 104;
  const boardH = 30;
  const bx = cx - Math.floor(boardW / 2);
  const by = floorY - boardH;
  const cols = 8;
  const rows = 4;
  const cellW = Math.floor(boardW / cols);
  const cellH = Math.floor(boardH / rows);

  pxOutline(g, bx - 2, by - 2, boardW + 4, boardH + 4, PAL.gold, 2);
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const light = (r + c) % 2 === 0;
      pxRect(g, bx + c * cellW, by + r * cellH, cellW, cellH, light ? PAL.creamDim : '#1D3358');
    }
  }

  // Opponent's King piece on right square toppling over on checkmate!
  const kingX = bx + boardW - 22;
  const kingY = by + 6;
  if (winP < 0.5) {
    pxRect(g, kingX - 4, kingY - 12, 8, 14, PAL.coral);
    pxRect(g, kingX - 6, kingY, 12, 3, PAL.coralDark);
    pxRect(g, kingX - 1, kingY - 17, 2, 5, PAL.goldLight);
    pxRect(g, kingX - 3, kingY - 15, 6, 2, PAL.goldLight);
  } else {
    // Fallen king lying sideways!
    pxRect(g, kingX + 2, kingY - 3, 14, 7, PAL.coralDark);
    pxRect(g, kingX + 14, kingY - 2, 4, 5, PAL.goldDark);
  }

  // Deep Blue's Glowing Cyan-Gold Knight leaping in a parabolic arc to deliver CHECKMATE!
  const knightStartX = bx + 20;
  const knightEndX = kingX - 6;
  const kx = Math.round(lerp(knightStartX, knightEndX, easeOutCubic(strikeP)));
  const arcLift = Math.round(Math.sin(strikeP * Math.PI) * 34);
  const ky = by + 2 - arcLift;

  drawSprite(
    g,
    SPRITE_CHESS_KNIGHT,
    { G: strikeP > 0.85 ? PAL.goldLight : PAL.iceWhite, D: PAL.ice },
    kx,
    ky - 8,
    2
  );

  // Checkmate Victory Burst + Floating Golden Crown!
  if (winP > 0.05) {
    drawDitheredGlow(g, knightEndX, by - 8, Math.round(36 * winP + energy * 8), PAL.goldLight, 'medium');
    for (let i = 0; i < 10; i++) {
      const a = (i / 10) * Math.PI * 2 + time * 1.4;
      const dist = 10 + winP * 28;
      pxSparkle(
        g,
        knightEndX + Math.cos(a) * dist,
        by - 10 + Math.sin(a) * dist * 0.7,
        i % 2 === 0 ? 2 : 1,
        i % 2 === 0 ? PAL.goldLight : PAL.iceWhite
      );
    }
    const crownPop = easeOutBack(winP, 1.3);
    if (crownPop > 0.25) {
      drawSprite(
        g,
        SPRITE_TROPHY_CROWN,
        { G: PAL.goldLight, R: PAL.iceWhite, D: PAL.goldDark },
        cx,
        by - 28 - Math.round(Math.sin(time * 4) * 2),
        2
      );
      pxBitmapText(g, 'CHECKMATE!', cx, by - 46, 1, PAL.goldLight, PAL.void);
    }
  }
}
