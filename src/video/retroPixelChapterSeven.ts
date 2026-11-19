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
// SCENE 43 (234.07–239.77s): 2012 AlexNet Conquers ImageNet Vision Challenge
// Cues 121–123: 2012年 / 深度学习模型 AlexNet / 在 ImageNet 图像识别大赛中一战成名
// ============================================================================
export function drawPixelSceneAlexNetImageNet(
  g: CanvasRenderingContext2D,
  pw: number,
  ph: number,
  time: number,
  localTime: number,
  energy: number
): void {
  const cx = Math.floor(pw * 0.5);
  const scanP = clamp01((localTime - 0.6) / 3.8);
  const winP = smoothstep(3.0, 4.4, localTime);

  drawDitheredSky(g, pw, ph, [
    { stop: 0, color: '#091224' },
    { stop: 0.45, color: '#11223E' },
    { stop: 0.88, color: '#1A3452' },
  ]);
  pxStarfield(g, pw, ph, time, 26, 0.45);

  const floorY = Math.floor(ph * 0.8);
  pxRect(g, 0, floorY, pw, ph - floorY, '#0B1626');
  pxRect(g, 0, floorY, pw, 2, PAL.tealLight);

  // LEFT + CENTER: 2x2 ImageNet Pixel Dataset Grid scanned by golden-cyan CNN bounding boxes!
  const gridX = Math.floor(pw * 0.14);
  const gridY = Math.floor(ph * 0.39);
  const cardW = 54;
  const cardH = 36;
  const gapX = 10;
  const gapY = 8;

  const samples: Array<{ label: string; kind: 'cat' | 'car' | 'bird' | 'dog'; revealAt: number }> = [
    { label: 'CAT 99%', kind: 'cat', revealAt: 0.12 },
    { label: 'CAR 98%', kind: 'car', revealAt: 0.34 },
    { label: 'BIRD 99%', kind: 'bird', revealAt: 0.56 },
    { label: 'DOG 97%', kind: 'dog', revealAt: 0.78 },
  ];

  for (let i = 0; i < samples.length; i++) {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const sx = gridX + col * (cardW + gapX);
    const sy = gridY + row * (cardH + gapY);
    const locked = scanP >= samples[i].revealAt;

    pxRect(g, sx, sy, cardW, cardH, '#102033');
    pxOutline(g, sx, sy, cardW, cardH, locked ? PAL.tealLight : PAL.slate, locked ? 2 : 1);

    // Cute 16-bit mini pixel subject inside each ImageNet sample frame
    const icx = sx + Math.floor(cardW / 2);
    const icy = sy + 14;
    if (samples[i].kind === 'cat') {
      pxRect(g, icx - 7, icy - 4, 14, 10, PAL.gold);
      pxRect(g, icx - 7, icy - 7, 4, 3, PAL.gold);
      pxRect(g, icx + 3, icy - 7, 4, 3, PAL.gold);
      pxRect(g, icx - 4, icy - 1, 2, 2, PAL.void);
      pxRect(g, icx + 2, icy - 1, 2, 2, PAL.void);
      pxRect(g, icx - 1, icy + 2, 2, 1, PAL.coral);
    } else if (samples[i].kind === 'car') {
      pxRect(g, icx - 11, icy, 22, 6, PAL.coral);
      pxRect(g, icx - 7, icy - 4, 14, 4, PAL.iceLight);
      pxCircle(g, icx - 6, icy + 6, 3, PAL.void);
      pxCircle(g, icx + 6, icy + 6, 3, PAL.void);
    } else if (samples[i].kind === 'bird') {
      pxRect(g, icx - 6, icy - 2, 12, 7, PAL.iceLight);
      pxRect(g, icx + 5, icy - 5, 5, 5, PAL.iceLight);
      pxRect(g, icx + 10, icy - 3, 3, 2, PAL.goldLight);
      pxRect(g, icx - 10, icy - 4, 5, 3, PAL.tealLight);
    } else {
      pxRect(g, icx - 7, icy - 3, 14, 9, PAL.amber);
      pxRect(g, icx - 9, icy - 3, 3, 7, PAL.goldDark);
      pxRect(g, icx + 6, icy - 3, 3, 7, PAL.goldDark);
      pxRect(g, icx - 4, icy - 1, 2, 2, PAL.void);
      pxRect(g, icx + 2, icy - 1, 2, 2, PAL.void);
    }

    // Green bounding reticle corners & confidence tag once recognized!
    if (locked) {
      pxRect(g, sx + 4, sy + 3, 4, 1, PAL.goldLight);
      pxRect(g, sx + 4, sy + 3, 1, 4, PAL.goldLight);
      pxRect(g, sx + cardW - 8, sy + 3, 4, 1, PAL.goldLight);
      pxRect(g, sx + cardW - 5, sy + 3, 1, 4, PAL.goldLight);
      pxBitmapText(g, samples[i].label, icx, sy + cardH - 7, 1, PAL.tealLight);
    }
  }

  // Animated CNN convolution scanner sweep line across the 2x2 grid
  if (scanP > 0.02 && scanP < 0.96) {
    const sweepY = Math.round(lerp(gridY, gridY + cardH * 2 + gapY, scanP));
    pxRect(g, gridX - 4, sweepY, cardW * 2 + gapX + 8, 2, PAL.goldLight);
  }

  // RIGHT: ImageNet 2012 Champion Podium & AlexNet #1 Trophy Board!
  const podX = Math.floor(pw * 0.75);
  const podW = 104;
  const podH = 80;
  const px0 = podX - Math.floor(podW / 2);
  const py0 = Math.floor(ph * 0.39);

  drawDitheredGlow(g, podX, py0 + 36, Math.round(36 + winP * 18 + energy * 8), PAL.gold, 'light');
  pxRect(g, px0, py0, podW, podH, '#0E1C32');
  pxOutline(g, px0, py0, podW, podH, winP > 0.3 ? PAL.goldLight : PAL.ice, 2);
  pxRect(g, px0 + 2, py0 + 2, podW - 4, 12, '#162D4D');
  pxBitmapText(g, 'IMAGENET 2012', podX, py0 + 8, 1, PAL.goldLight);

  // Leaderboard bars: #1 ALEXNET surging ahead!
  const barW = podW - 22;
  const alexW = Math.round(barW * lerp(0.25, 0.96, easeOutExpo(clamp01(localTime / 2.6))));
  pxBitmapText(g, '#1 ALEXNET', px0 + 38, py0 + 26, 1, PAL.goldLight);
  pxRect(g, px0 + 10, py0 + 32, barW, 8, '#172940');
  pxRect(g, px0 + 10, py0 + 32, alexW, 8, PAL.tealLight);
  pxRect(g, px0 + 10, py0 + 32, alexW, 2, PAL.cream);

  pxBitmapText(g, '#2 LEGACY', px0 + 34, py0 + 50, 1, PAL.creamDim);
  pxRect(g, px0 + 10, py0 + 56, barW, 7, '#172940');
  pxRect(g, px0 + 10, py0 + 56, Math.round(barW * 0.56), 7, PAL.slate);

  if (winP > 0.2) {
    const crownPop = easeOutBack(winP, 1.3);
    if (crownPop > 0.25) {
      drawSprite(
        g,
        SPRITE_TROPHY_CROWN,
        { G: PAL.goldLight, R: PAL.tealLight, D: PAL.goldDark },
        podX + 34,
        py0 + 24,
        1
      );
      pxSparkle(g, px0 + podW - 8, py0 + 6, 2, PAL.goldLight);
    }
  }
}

// ============================================================================
// SCENE 44 (239.77–244.33s): Error Rate Plunge & Computer Vision Eye Awakening
// Cues 124–125: 错误率远远甩开传统算法 / 计算机终于“看清”了这个世界
// ============================================================================
export function drawPixelSceneComputerSeesWorld(
  g: CanvasRenderingContext2D,
  pw: number,
  ph: number,
  time: number,
  localTime: number,
  energy: number
): void {
  const dropP = easeOutExpo(clamp01(localTime / 1.9));
  const focusP = smoothstep(1.4, 3.2, localTime);

  drawDitheredSky(g, pw, ph, [
    { stop: 0, color: '#0A1626' },
    { stop: 0.45, color: '#14293F' },
    { stop: 0.86, color: '#1F4252' },
  ]);

  const floorY = Math.floor(ph * 0.8);
  pxRect(g, 0, floorY, pw, ph - floorY, '#0B1726');
  pxRect(g, 0, floorY, pw, 2, PAL.tealLight);

  // LEFT: Crisp Error-Rate Plunge Chart (26% -> 15% leaving legacy far behind!)
  const chartX = Math.floor(pw * 0.08);
  const chartY = Math.floor(ph * 0.4);
  const chartW = 114;
  const chartH = 74;

  pxRect(g, chartX, chartY, chartW, chartH, '#0C1A2A');
  pxOutline(g, chartX, chartY, chartW, chartH, PAL.ice, 2);
  pxRect(g, chartX + 2, chartY + 2, chartW - 4, 12, '#142B42');
  pxBitmapText(g, 'ERROR RATE', chartX + Math.floor(chartW / 2), chartY + 8, 1, PAL.coralLight);

  // Traditional bar (high error 26%)
  const barBase = chartY + chartH - 14;
  pxRect(g, chartX + 18, barBase - 30, 24, 30, PAL.coralDark);
  pxOutline(g, chartX + 18, barBase - 30, 24, 30, PAL.coralLight, 1);
  pxBitmapText(g, '26%', chartX + 30, barBase - 37, 1, PAL.coralLight);
  pxBitmapText(g, 'OLD', chartX + 30, barBase + 7, 1, PAL.creamDim);

  // AlexNet bar plunging dramatically down to 15%!
  const alexH = Math.round(lerp(30, 14, dropP));
  pxRect(g, chartX + 68, barBase - alexH, 24, alexH, PAL.teal);
  pxOutline(g, chartX + 68, barBase - alexH, 24, alexH, PAL.tealLight, 1);
  const errVal = Math.round(lerp(26, 15, dropP));
  pxBitmapText(g, `${errVal}%`, chartX + 80, barBase - alexH - 7, 1, PAL.goldLight);
  pxBitmapText(g, 'CNN', chartX + 80, barBase + 7, 1, PAL.tealLight);

  // Downward plunge arrow between bars
  pxLine(g, chartX + 46, barBase - 27, chartX + 63, barBase - 14, PAL.goldLight, 2);
  pxLine(g, chartX + 58, barBase - 14, chartX + 63, barBase - 14, PAL.goldLight, 2);
  pxLine(g, chartX + 63, barBase - 19, chartX + 63, barBase - 14, PAL.goldLight, 2);

  // RIGHT: Radiant Opening 16-Bit Cyber Eye Focusing a Crisp Living Landscape!
  const viewX = Math.floor(pw * 0.44);
  const viewY = Math.floor(ph * 0.4);
  const viewW = Math.min(184, pw - viewX - 24);
  const viewH = 74;

  drawDitheredGlow(g, viewX + Math.floor(viewW / 2), viewY + 37, Math.round(48 + focusP * 18 + energy * 8), PAL.tealLight, 'light');
  pxRect(g, viewX, viewY, viewW, viewH, '#163B59');
  // Vibrant sunrise world inside the computer's vision frame!
  pxRect(g, viewX + 2, viewY + 2, viewW - 4, 34, '#2A5E7A');
  pxRect(g, viewX + 2, viewY + 36, viewW - 4, 16, '#E29E56');
  pxRect(g, viewX + 2, viewY + 52, viewW - 4, viewH - 54, '#2F6E5B');

  // Sun, pine trees & mountain inside vision viewport
  const sunX = viewX + Math.floor(viewW * 0.72);
  const sunY = viewY + 26;
  pxCircle(g, sunX, sunY, 11, PAL.goldLight);
  pxCircle(g, sunX, sunY, 7, PAL.cream);
  pxPineTree(g, viewX + 34, viewY + 54, 24, '#1D4F44', '#2E7866');
  pxPineTree(g, viewX + 58, viewY + 56, 18, '#1D4F44', '#2E7866');

  // Animated focusing shutter eyelids parting vertically as focusP -> 1!
  const shutterH = Math.round((1 - focusP) * (viewH * 0.46));
  if (shutterH > 1) {
    pxRect(g, viewX, viewY, viewW, shutterH, '#0C1626');
    pxRect(g, viewX, viewY + viewH - shutterH, viewW, shutterH, '#0C1626');
  }

  // Crisp glowing AI vision bounding boxes locking onto SUN & TREE once focused!
  if (focusP > 0.45) {
    pxOutline(g, sunX - 14, sunY - 14, 28, 28, PAL.goldLight, 1);
    pxBitmapText(g, 'SUN', sunX, sunY + 19, 1, PAL.goldLight, PAL.void);

    pxOutline(g, viewX + 18, viewY + 26, 32, 32, PAL.tealLight, 1);
    pxBitmapText(g, 'TREE', viewX + 34, viewY + 64, 1, PAL.tealLight, PAL.void);
  }

  // Outer optical viewfinder corners
  pxOutline(g, viewX, viewY, viewW, viewH, focusP > 0.6 ? PAL.goldLight : PAL.tealLight, 2);
  const crossX = viewX + Math.floor(viewW * 0.5);
  const crossY = viewY + Math.floor(viewH * 0.5);
  pxRing(g, crossX, crossY, Math.round(lerp(24, 14, focusP)), PAL.cream, 1);
  if (focusP > 0.7) {
    pxSparkle(g, sunX + 16, sunY - 12, 2 + (Math.floor(time * 6) % 2), PAL.cream);
  }
}

// ============================================================================
// SCENE 45 (244.33–249.90s): 2016 DeepMind AlphaGo 4:1 Defeats Lee Sedol
// Cues 126–128: 2016年 / DeepMind 的 AlphaGo / 以 4:1 击败了围棋世界冠军李世石
// ============================================================================
export function drawPixelSceneAlphaGo2016(
  g: CanvasRenderingContext2D,
  pw: number,
  ph: number,
  time: number,
  localTime: number,
  energy: number
): void {
  const cx = Math.floor(pw * 0.5);
  const move37P = smoothstep(2.4, 3.6, localTime);

  // Serene midnight-indigo & warm temple-gold Go match room
  drawDitheredSky(g, pw, ph, [
    { stop: 0, color: '#0B1120' },
    { stop: 0.45, color: '#141E36' },
    { stop: 0.88, color: '#1E2A44' },
  ]);
  pxStarfield(g, pw, ph, time, 22, 0.4);

  // CENTER: Crisp 16-Bit Warm Kaya-Wood Go Board (Goban) with 11x7 Grid!
  const boardW = Math.min(208, pw - 60);
  const boardH = 82;
  const bx = cx - Math.floor(boardW / 2);
  const by = Math.floor(ph * 0.4);

  // Wooden board thickness + shadow
  pxRect(g, bx + 4, by + 6, boardW, boardH, 'rgba(0, 0, 0, 0.42)');
  pxRect(g, bx, by + 3, boardW, boardH, '#8F6030');
  pxRect(g, bx, by, boardW, boardH - 3, '#D8A85E');
  pxOutline(g, bx, by, boardW, boardH - 3, '#5C3B1A', 2);

  // Crisp dark wood grid lines
  const cols = 10;
  const rows = 5;
  const padX = 16;
  const padY = 12;
  const cellW = (boardW - padX * 2) / cols;
  const cellH = (boardH - 6 - padY * 2) / rows;

  for (let c = 0; c <= cols; c++) {
    const lx = Math.round(bx + padX + c * cellW);
    pxRect(g, lx, by + padY, 1, Math.round(rows * cellH), '#5C3B1A');
  }
  for (let r = 0; r <= rows; r++) {
    const ly = Math.round(by + padY + r * cellH);
    pxRect(g, bx + padX, ly, Math.round(cols * cellW), 1, '#5C3B1A');
  }

  // Authentic Go stone sequence snapping onto intersections!
  const stones: Array<{ c: number; r: number; black: boolean; at: number }> = [
    { c: 2, r: 1, black: true, at: 0.1 },
    { c: 3, r: 2, black: false, at: 0.35 },
    { c: 2, r: 3, black: true, at: 0.6 },
    { c: 7, r: 1, black: false, at: 0.85 },
    { c: 8, r: 2, black: true, at: 1.1 },
    { c: 7, r: 3, black: false, at: 1.35 },
    { c: 4, r: 2, black: true, at: 1.6 },
    { c: 6, r: 2, black: false, at: 1.85 },
    { c: 4, r: 3, black: true, at: 2.1 },
    { c: 6, r: 3, black: false, at: 2.3 },
  ];

  for (const s of stones) {
    if (localTime < s.at) continue;
    const sx = Math.round(bx + padX + s.c * cellW);
    const sy = Math.round(by + padY + s.r * cellH);
    pxCircle(g, sx + 1, sy + 1, 5, 'rgba(40, 24, 10, 0.35)');
    pxCircle(g, sx, sy, 5, s.black ? '#161B26' : '#F4EFE4');
    pxRect(g, sx - 2, sy - 2, 2, 2, s.black ? '#48566E' : '#FFFFFF');
  }

  // ICONIC MOVE 37: AlphaGo's Divine Center-Right Black Stone with Cyan-Gold Ripple!
  if (move37P > 0.04) {
    const m37x = Math.round(bx + padX + 5 * cellW);
    const m37y = Math.round(by + padY + 2 * cellH);
    const rippleR = Math.round(8 + easeOutExpo(move37P) * 32);
    drawDitheredGlow(g, m37x, m37y, Math.round(28 * move37P + energy * 8), PAL.tealLight, 'medium');
    pxRing(g, m37x, m37y, rippleR, PAL.tealLight, 1);
    pxRing(g, m37x, m37y, Math.max(6, rippleR - 10), PAL.goldLight, 1);
    pxCircle(g, m37x, m37y, 6, '#101624');
    pxOutline(g, m37x - 6, m37y - 6, 12, 12, PAL.goldLight, 1);
    pxRect(g, m37x - 2, m37y - 2, 2, 2, PAL.tealLight);
    pxSparkle(g, m37x + 12, m37y - 10, 2, PAL.goldLight);
  }

  // Clean Top-Right & Top-Left Match Scoreboard Badges flanking the board (above subtitle zone!)
  if (pw > 300) {
    const leftBadgeX = Math.max(36, bx - 40);
    const rightBadgeX = Math.min(pw - 36, bx + boardW + 40);
    const badgeY = by + 34;

    pxRect(g, leftBadgeX - 28, badgeY - 22, 56, 44, '#0E1A30');
    pxOutline(g, leftBadgeX - 28, badgeY - 22, 56, 44, PAL.tealLight, 2);
    pxBitmapText(g, 'ALPHAGO', leftBadgeX, badgeY - 10, 1, PAL.tealLight);
    pxBitmapText(g, move37P > 0.4 ? '4' : '3', leftBadgeX, badgeY + 8, 2, PAL.goldLight);

    pxRect(g, rightBadgeX - 28, badgeY - 22, 56, 44, '#1C1A28');
    pxOutline(g, rightBadgeX - 28, badgeY - 22, 56, 44, PAL.slateLight, 1);
    pxBitmapText(g, 'LEE', rightBadgeX, badgeY - 10, 1, PAL.creamDim);
    pxBitmapText(g, '1', rightBadgeX, badgeY + 8, 2, PAL.cream);
  }
}

// ============================================================================
// SCENE 46 (249.90–254.10s): Go's Infinite Universe & Human Intellect's Last Bastion
// Cues 129–130: 围棋由于变化莫测 / 曾被视为人类智力防线的最后堡垒
// ============================================================================
export function drawPixelSceneGoLastBastion(
  g: CanvasRenderingContext2D,
  pw: number,
  ph: number,
  time: number,
  localTime: number,
  energy: number
): void {
  const cx = Math.floor(pw * 0.5);
  const riseP = easeOutExpo(clamp01(localTime / 1.1));

  // Deep cosmic starry obsidian-violet Go galaxy
  drawDitheredSky(g, pw, ph, [
    { stop: 0, color: '#070917' },
    { stop: 0.45, color: '#121633' },
    { stop: 0.86, color: '#1D224A' },
  ]);
  pxStarfield(g, pw, ph, time, 52, 0.8, -time * 5);

  // Swirling cosmic orbital rings of Black & White Go Stones ("变化莫测 10^170")!
  const orbCy = Math.floor(ph * 0.58);
  pxRing(g, cx, orbCy, 74, 'rgba(126, 212, 192, 0.25)', 1);
  pxRing(g, cx, orbCy, 54, 'rgba(242, 180, 75, 0.28)', 1);

  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2 + time * 0.55;
    const radX = i % 2 === 0 ? 116 : 84;
    const radY = i % 2 === 0 ? 34 : 24;
    const sx = Math.round(cx + Math.cos(a) * radX);
    const sy = Math.round(orbCy + Math.sin(a) * radY);
    const isWhite = i % 2 === 0;
    pxCircle(g, sx, sy, 4, isWhite ? PAL.cream : '#131A2B');
    pxRing(g, sx, sy, 4, isWhite ? PAL.goldLight : PAL.tealLight, 1);
  }

  // CENTER HERO: Monumental 16-Bit Stone Citadel — Humanity's Last Bastion!
  const baseY = Math.floor(ph * 0.8);
  const fortH = Math.round(58 * riseP);
  const fortTop = baseY - fortH;

  drawDitheredGlow(g, cx, orbCy, Math.round(44 + energy * 10), PAL.gold, 'light');

  // Mountain crag pedestal
  pxRect(g, 0, baseY, pw, ph - baseY, '#0C1022');
  pxRect(g, cx - 72, baseY - 8, 144, 8, '#1A233D');
  pxRect(g, cx - 54, baseY - 14, 108, 6, '#232F50');

  // Twin side turrets + grand central keep with battlements
  for (const side of [-1, 1]) {
    const tx = cx + side * 38;
    const th = Math.round(fortH * 0.78);
    pxRect(g, tx - 14, baseY - th, 28, th, '#2C3858');
    pxOutline(g, tx - 14, baseY - th, 28, th, PAL.iceLight, 1);
    // Battlements
    for (let b = -12; b <= 8; b += 8) {
      pxRect(g, tx + b, baseY - th - 5, 5, 5, '#3E4F78');
    }
    // Glowing warm torchlit tower window
    pxRect(g, tx - 3, baseY - th + 12, 6, 10, PAL.goldLight);
  }

  // Central citadel keep
  pxRect(g, cx - 24, fortTop, 48, fortH, '#364468');
  pxOutline(g, cx - 24, fortTop, 48, fortH, PAL.goldLight, 2);
  for (let b = -22; b <= 16; b += 10) {
    pxRect(g, cx + b, fortTop - 6, 6, 6, '#485A86');
  }
  // Glowing golden fortress gate + radiant crest shield
  pxRect(g, cx - 8, baseY - 22, 16, 22, '#171E34');
  pxOutline(g, cx - 8, baseY - 22, 16, 22, PAL.gold, 1);
  pxCircle(g, cx, fortTop + 16, 8, PAL.navyDark);
  pxRing(g, cx, fortTop + 16, 8, PAL.goldLight, 1);
  pxBitmapText(g, 'GO', cx, fortTop + 16, 1, PAL.goldLight);

  // Crisp bordered HUD plaques flanking the citadel so orbiting stones pass cleanly behind
  const lx = cx - 96;
  const rx = cx + 96;
  const tagY = fortTop + 2;
  pxRect(g, lx - 28, tagY - 9, 56, 18, '#0D132B');
  pxOutline(g, lx - 28, tagY - 9, 56, 18, PAL.tealLight, 1);
  pxBitmapText(g, '10', lx - 14, tagY + 1, 1, PAL.tealLight);
  pxBitmapText(g, '170', lx + 9, tagY - 3, 1, PAL.goldLight);

  pxRect(g, rx - 28, tagY - 9, 56, 18, '#0D132B');
  pxOutline(g, rx - 28, tagY - 9, 56, 18, PAL.goldLight, 1);
  pxBitmapText(g, 'BASTION', rx, tagY, 1, PAL.goldLight);
}

// ============================================================================
// SCENE 47 (254.10–260.07s): Global Shockwave & Modern AI Hyper-Speed Prelude
// Cues 131–132: 而 AlphaGo 的胜利彻底震撼了全球 / 也正式拉开了现代 AI 狂飙突进的序幕
// ============================================================================
export function drawPixelSceneModernAiPrelude(
  g: CanvasRenderingContext2D,
  pw: number,
  ph: number,
  time: number,
  localTime: number,
  energy: number
): void {
  const cx = Math.floor(pw * 0.5);
  const rushP = smoothstep(2.2, 4.4, localTime);
  const horizY = Math.floor(ph * 0.64);

  // Electric twilight-to-magenta-gold speed sky
  drawDitheredSky(g, pw, ph, [
    { stop: 0, color: '#090D24' },
    { stop: 0.38, color: '#161B44' },
    { stop: 0.68, color: '#332458' },
    { stop: 0.9, color: '#7D3B56' },
  ]);
  pxStarfield(g, pw, ph, time, 40, 0.6, time * 18);

  // Radiant horizon sun bursting with global shockwave rings!
  drawDitheredGlow(g, cx, horizY, Math.round(58 + rushP * 24 + energy * 12), PAL.goldLight, 'medium');
  pxCircle(g, cx, horizY, 26, PAL.gold);
  pxCircle(g, cx, horizY, 18, PAL.goldLight);
  pxCircle(g, cx, horizY, 10, PAL.cream);

  for (let i = 0; i < 3; i++) {
    const wp = (time * 0.9 + i * 0.33) % 1;
    pxRing(g, cx, horizY, Math.round(28 + wp * 90), i % 2 === 0 ? PAL.tealLight : PAL.goldLight, 1);
  }

  // Synthwave 16-Bit Hyper-Speed Perspective Highway rushing toward viewer!
  pxRect(g, 0, horizY, pw, ph - horizY, '#101228');
  pxRect(g, 0, horizY, pw, 2, PAL.goldLight);

  // Accelerating horizontal speed-grid lines scrolling down!
  const speed = lerp(2.2, 6.5, rushP);
  for (let i = 0; i < 8; i++) {
    const z = ((time * speed * 0.35 + i / 8) % 1);
    const y = Math.round(horizY + z * z * (ph - horizY));
    pxRect(g, 0, y, pw, 1, 'rgba(126, 212, 192, 0.35)');
  }
  // Perspective lane lines converging to the sun
  for (let l = -5; l <= 5; l++) {
    pxLine(g, cx + l * 10, horizY, cx + l * 58, ph, l === 0 ? PAL.goldLight : 'rgba(242, 180, 75, 0.28)', 1);
  }

  // High-velocity horizontal anime/16-bit speed streaks across left & right sky
  for (let i = 0; i < 14; i++) {
    const sy = Math.floor(ph * 0.36 + ((i * 19) % 58));
    const len = Math.round((16 + (i % 4) * 12) * (0.6 + rushP));
    const sx = Math.floor(((i * 59 + time * (160 + rushP * 140)) % (pw + len)) - len);
    pxRect(g, sx, sy, len, 2, i % 2 === 0 ? PAL.tealLight : PAL.goldLight);
  }

  // HERO: Sleek 16-Bit Turbo Pixel Bullet-Shuttle Rocketing Forward Along the Highway!
  const shipY = Math.floor(ph * 0.72 + Math.sin(time * 9) * 1.5);
  const thrust = Math.round(14 + rushP * 24 + energy * 10);
  // Twin glowing cyan-gold afterburner plumes
  pxRect(g, cx - 22, shipY + 5, 10, thrust, PAL.tealLight);
  pxRect(g, cx + 12, shipY + 5, 10, thrust, PAL.tealLight);
  pxRect(g, cx - 19, shipY + 5, 4, Math.max(4, thrust - 4), PAL.cream);
  pxRect(g, cx + 15, shipY + 5, 4, Math.max(4, thrust - 4), PAL.cream);

  // Delta-wing pixel starfighter silhouette
  pxRect(g, cx - 28, shipY - 2, 56, 8, PAL.iceLight);
  pxRect(g, cx - 18, shipY - 8, 36, 12, PAL.cream);
  pxRect(g, cx - 8, shipY - 14, 16, 8, PAL.goldLight);
  pxRect(g, cx - 4, shipY - 10, 8, 5, PAL.navyDark); // cockpit canopy
  pxOutline(g, cx - 28, shipY - 2, 56, 8, PAL.void, 1);
  pxSparkle(g, cx, shipY - 18, 3, PAL.goldLight);
}

// ============================================================================
// SCENE 48 (260.07–271.00s): Stage 5 — Large Models, AGI Dawn & Hyper-Evolution
// Cues 133–137: 第五阶段 / 大模型与通用人工智能曙光 / 我们正身处其中 / 日新月异都嫌慢
// ============================================================================
export function drawPixelSceneStageFiveAgiDawn(
  g: CanvasRenderingContext2D,
  pw: number,
  ph: number,
  time: number,
  localTime: number,
  energy: number
): void {
  const cx = Math.floor(pw * 0.5);
  const dawnP = easeOutExpo(clamp01(localTime / 2.2));
  const warpP = smoothstep(5.4, 9.6, localTime);
  const horizY = Math.floor(ph * 0.72);

  // Grand Stage 5 Cosmic Dawn Sky warming from twilight indigo into radiant AGI sunrise gold!
  drawDitheredSky(g, pw, ph, [
    { stop: 0, color: '#0A1026' },
    { stop: 0.34, color: '#18244B' },
    { stop: 0.62, color: '#2F436B' },
    { stop: 0.84, color: '#A6634D' },
    { stop: 0.96, color: '#E8A852' },
  ]);
  pxStarfield(g, pw, ph, time, 46, 0.7, time * (4 + warpP * 26));

  // Colossal Ascending AGI Dawn Sun rising above planet horizon!
  const sunY = Math.round(lerp(horizY + 26, horizY - 14, dawnP));
  const sunR = Math.round(32 + warpP * 6 + energy * 4);
  drawDitheredGlow(g, cx, sunY, Math.round(74 + warpP * 20), PAL.goldLight, 'medium');

  // Rotating golden sunrise fan rays
  for (let i = 0; i < 14; i++) {
    const a = -Math.PI + (i / 13) * Math.PI + Math.sin(time * 0.5) * 0.04;
    const len = 128 + (i % 2) * 26;
    pxLine(
      g,
      cx,
      sunY,
      Math.round(cx + Math.cos(a) * len),
      Math.round(sunY + Math.sin(a) * len),
      i % 2 === 0 ? 'rgba(255, 224, 138, 0.24)' : 'rgba(126, 212, 192, 0.16)',
      2
    );
  }

  pxCircle(g, cx, sunY, sunR, PAL.gold);
  pxCircle(g, cx, sunY, sunR - 7, PAL.goldLight);
  pxCircle(g, cx, sunY, sunR - 15, PAL.cream);
  pxRing(g, cx, sunY, sunR + 8, PAL.tealLight, 1);

  // Crisp glowing "AGI" core crystal emblem inside the rising sun
  pxBitmapText(g, 'AGI', cx, sunY - 2, 1, PAL.navyDark);

  // Curved Earth-Horizon Silhouette + Glowing Observation Cliff ("我们正身处其中")
  pxRect(g, 0, horizY, pw, ph - horizY, '#10182B');
  pxRect(g, 0, horizY, pw, 2, PAL.goldLight);
  // Subtle golden reflections shimmering on the dawn sea
  for (let r = 0; r < 5; r++) {
    const ry = horizY + 5 + r * 5;
    const rw = Math.max(18, 84 - r * 14 + Math.round(Math.sin(time * 6 + r) * 8));
    pxRect(g, cx - Math.floor(rw / 2), ry, rw, 2, r < 2 ? PAL.goldLight : PAL.gold);
  }

  // Left Foreground Cliff Silhouette with Pixel Human Observer gazing at the AGI Sunrise!
  const cliffW = 76;
  pxRect(g, 0, horizY - 12, cliffW, ph - horizY + 12, '#0B101E');
  pxRect(g, cliffW - 8, horizY - 6, 16, ph - horizY + 6, '#0B101E');
  const obsX = 46;
  const obsY = horizY - 12;
  // Tiny crisp pixel explorer silhouette with gold rim light
  pxRect(g, obsX - 2, obsY - 16, 5, 5, '#19223B'); // head
  pxRect(g, obsX + 2, obsY - 15, 1, 3, PAL.goldLight); // sunrise rim highlight!
  pxRect(g, obsX - 3, obsY - 11, 7, 7, '#19223B'); // torso
  pxRect(g, obsX + 3, obsY - 10, 1, 5, PAL.goldLight);
  pxRect(g, obsX - 3, obsY - 4, 2, 4, '#19223B'); // legs
  pxRect(g, obsX + 2, obsY - 4, 2, 4, '#19223B');

  // RIGHT HUD: Hyper-Evolution Speedometer & Flipping Year Counter accelerating on "日新月异都嫌慢"!
  if (warpP > 0.04) {
    // Hyperspace radial warp streaks fanning cleanly across upper sky only (above horizon & subtitles!)
    for (let i = 0; i < 10; i++) {
      const a = -Math.PI * 0.94 + (i / 9) * (Math.PI * 0.88);
      const d1 = 68 + ((time * 95 + i * 19) % 48);
      const d2 = d1 + Math.round(14 * warpP);
      pxLine(
        g,
        Math.round(cx + Math.cos(a) * d1),
        Math.round(sunY + Math.sin(a) * d1 * 0.62),
        Math.round(cx + Math.cos(a) * d2),
        Math.round(sunY + Math.sin(a) * d2 * 0.62),
        i % 2 === 0 ? PAL.goldLight : PAL.tealLight,
        1
      );
    }

    const hudX = Math.floor(pw * 0.8);
    const hudY = Math.floor(ph * 0.56);
    const hw = 78;
    const hh = 42;
    pxRect(g, hudX - Math.floor(hw / 2), hudY - Math.floor(hh / 2), hw, hh, '#0E1930');
    pxOutline(g, hudX - Math.floor(hw / 2), hudY - Math.floor(hh / 2), hw, hh, PAL.tealLight, 2);

    const year = Math.min(2026, Math.floor(lerp(2022, 2026.9, warpP)));
    pxBitmapText(g, `ERA ${year}`, hudX, hudY - 11, 1, PAL.goldLight);
    // Surging hyperspeed gauge bar
    const gw = hw - 14;
    const fill = Math.round(gw * clamp01(warpP * 1.15));
    pxRect(g, hudX - Math.floor(gw / 2), hudY - 2, gw, 6, '#182C4A');
    pxRect(g, hudX - Math.floor(gw / 2), hudY - 2, fill, 6, warpP > 0.7 ? PAL.coralLight : PAL.tealLight);
    pxBitmapText(g, 'HYPER AI', hudX, hudY + 11, 1, PAL.cream);
  }
}
