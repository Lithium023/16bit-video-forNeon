import {
  PAL,
  SPRITE_AIRSHIP,
  SPRITE_CHESS_KNIGHT,
  SPRITE_CIRCUIT_BRAIN,
  SPRITE_PIXEL_THINKER,
  SPRITE_ROCKET_HERO,
  SPRITE_TURING_BUST,
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
import { clamp01, easeOutCubic, easeOutExpo, lerp, smoothstep } from './timeline';

// ============================================================================
// SCENE 10 (29.87–34.90s): 16-Bit JRPG Overworld Chronicle Map — Five Stages
// "今天，我们就把这段历史拆解为五个关键阶段，带大家一探究竟"
// ============================================================================
export function drawPixelSceneFiveStages(
  g: CanvasRenderingContext2D,
  pw: number,
  ph: number,
  time: number,
  localTime: number,
  energy: number
): void {
  // Deep ocean chart background with subtle dithered depth bands
  drawDitheredSky(g, pw, ph, [
    { stop: 0, color: '#11223C' },
    { stop: 0.32, color: '#173152' },
    { stop: 0.68, color: '#1E4166' },
    { stop: 0.9, color: '#173252' },
  ]);

  // Subtle nautical latitude / longitude pixel chart grid
  for (let x = 24; x < pw; x += 32) {
    for (let y = 16; y < ph; y += 6) {
      pxRect(g, x, y, 1, 2, '#224A72');
    }
  }
  for (let y = 36; y < ph; y += 32) {
    for (let x = 8; x < pw; x += 6) {
      pxRect(g, x, y, 2, 1, '#224A72');
    }
  }

  // Shimmering ocean wave glints across the sea
  for (let i = 0; i < 26; i++) {
    const wx = Math.floor((((i * 53 + Math.sin(time * 0.9 + i) * 6) % (pw - 24)) + pw - 24) % (pw - 24)) + 12;
    const wy = Math.floor(ph * 0.34 + ((i * 29) % Math.floor(ph * 0.56)));
    const phase = Math.floor(time * 4 + i) % 3;
    if (phase !== 2) {
      pxRect(g, wx, wy, 5 - phase, 1, phase === 0 ? PAL.ice : '#2E628A');
    }
  }

  // Ornate pixel compass rose tucked cleanly in bottom-right corner
  const compX = pw - 24;
  const compY = Math.floor(ph * 0.78);
  pxRing(g, compX, compY, 10, PAL.goldDark);
  pxLine(g, compX - 12, compY, compX + 12, compY, PAL.gold, 1);
  pxLine(g, compX, compY - 12, compX, compY + 12, PAL.gold, 1);
  pxRect(g, compX - 1, compY - 1, 3, 3, PAL.goldLight);

  // Five Distinct Stage Islands arcing gracefully across the mid-lower map!
  const isPortrait = ph > pw;
  const islands: Array<{
    x: number;
    y: number;
    roman: string;
    r: number;
    landCol: string;
    trimCol: string;
    kind: 'sprout' | 'tower' | 'ice' | 'chess' | 'spire';
  }> = isPortrait
    ? [
        { x: Math.floor(pw * 0.28), y: Math.floor(ph * 0.42), roman: 'I', r: 17, landCol: PAL.teal, trimCol: PAL.tealLight, kind: 'sprout' },
        { x: Math.floor(pw * 0.72), y: Math.floor(ph * 0.49), roman: 'II', r: 16, landCol: PAL.goldDark, trimCol: PAL.gold, kind: 'tower' },
        { x: Math.floor(pw * 0.30), y: Math.floor(ph * 0.59), roman: 'III', r: 16, landCol: PAL.iceMid, trimCol: PAL.iceLight, kind: 'ice' },
        { x: Math.floor(pw * 0.72), y: Math.floor(ph * 0.67), roman: 'IV', r: 16, landCol: PAL.dusk, trimCol: PAL.coralLight, kind: 'chess' },
        { x: Math.floor(pw * 0.46), y: Math.floor(ph * 0.76), roman: 'V', r: 18, landCol: PAL.amber, trimCol: PAL.goldLight, kind: 'spire' },
      ]
    : [
        { x: Math.floor(pw * 0.14), y: Math.floor(ph * 0.63), roman: 'I', r: 22, landCol: PAL.teal, trimCol: PAL.tealLight, kind: 'sprout' },
        { x: Math.floor(pw * 0.32), y: Math.floor(ph * 0.53), roman: 'II', r: 20, landCol: PAL.goldDark, trimCol: PAL.gold, kind: 'tower' },
        { x: Math.floor(pw * 0.50), y: Math.floor(ph * 0.66), roman: 'III', r: 20, landCol: PAL.iceMid, trimCol: PAL.iceLight, kind: 'ice' },
        { x: Math.floor(pw * 0.68), y: Math.floor(ph * 0.52), roman: 'IV', r: 20, landCol: PAL.dusk, trimCol: PAL.coralLight, kind: 'chess' },
        { x: Math.floor(pw * 0.85), y: Math.floor(ph * 0.62), roman: 'V', r: 22, landCol: PAL.amber, trimCol: PAL.goldLight, kind: 'spire' },
      ];

  // Winding golden dotted voyage trail lighting up sequentially (localTime 0.35s -> 2.75s)
  const routeP = easeOutCubic(clamp01((localTime - 0.35) / 2.4));
  const totalSegs = islands.length - 1;
  for (let s = 0; s < totalSegs; s++) {
    const a = islands[s];
    const b = islands[s + 1];
    const segP = clamp01(routeP * totalSegs - s);
    if (segP <= 0) continue;
    const dots = 10;
    for (let d = 1; d < dots; d++) {
      const f = d / dots;
      if (f > segP) break;
      const mx = lerp(a.x, b.x, f);
      const my = lerp(a.y, b.y, f) - Math.sin(f * Math.PI) * 9;
      pxRect(g, mx - 1, my - 1, 2, 2, f > segP - 0.15 ? PAL.cream : PAL.goldLight);
    }
  }

  // Lock-on targeting pulse on Stage I during "带大家一探究竟" (localTime >= 3.25s)
  const lockP = clamp01((localTime - 3.25) / 0.55);

  // Draw each handcrafted 16-bit island + mini landmark + Roman numeral beacon
  for (let i = 0; i < islands.length; i++) {
    const isl = islands[i];
    const lit = routeP >= i / totalSegs - 0.04;
    const isStage1Lock = i === 0 && lockP > 0.05;

    // Shallow turquoise coastline foam ring
    pxCircle(g, isl.x, isl.y + 2, isl.r + 3, '#2D6888');
    // Island rock base & grass/terrain cap
    pxCircle(g, isl.x, isl.y + 1, isl.r, '#3B3038');
    pxCircle(g, isl.x, isl.y - 1, isl.r - 2, isl.landCol);
    pxRect(g, isl.x - isl.r + 5, isl.y - Math.floor(isl.r * 0.45), (isl.r - 5) * 2, 4, isl.trimCol);

    // Glow halo once the trail reaches this stage
    if (lit) {
      drawDitheredGlow(g, isl.x, isl.y - 8, isStage1Lock ? 28 + Math.round(energy * 6) : 18, PAL.gold, isStage1Lock ? 'medium' : 'light');
    }

    // Mini landmark silhouette atop each island
    const ly = isl.y - 4;
    if (isl.kind === 'sprout') {
      // Glowing emerald sprout & golden gear
      pxRect(g, isl.x - 1, ly - 9, 2, 9, PAL.tealLight);
      pxRect(g, isl.x - 5, ly - 8, 4, 3, PAL.tealLight);
      pxRect(g, isl.x + 1, ly - 10, 4, 3, PAL.goldLight);
      pxSparkle(g, isl.x, ly - 13, isStage1Lock ? 3 : 2, PAL.cream);
    } else if (isl.kind === 'tower') {
      // 1960s Mainframe citadel
      pxRect(g, isl.x - 6, ly - 12, 12, 12, PAL.navyLight);
      pxOutline(g, isl.x - 6, ly - 12, 12, 12, PAL.void, 1);
      pxRect(g, isl.x - 3, ly - 9, 2, 2, PAL.goldLight);
      pxRect(g, isl.x + 1, ly - 9, 2, 2, PAL.coral);
      pxRect(g, isl.x - 3, ly - 5, 6, 2, PAL.tealLight);
    } else if (isl.kind === 'ice') {
      // AI Winter frosted crystal peak
      pxPineTree(g, isl.x - 6, ly + 2, 14, PAL.iceDark, PAL.iceMid, PAL.iceWhite);
      pxPineTree(g, isl.x + 6, ly + 2, 12, PAL.iceDark, PAL.iceMid, PAL.iceWhite);
      pxSparkle(g, isl.x, ly - 10, 2, PAL.iceWhite);
    } else if (isl.kind === 'chess') {
      // Golden Chess Knight monument (Deep Blue / AlphaGo)
      drawSprite(g, SPRITE_CHESS_KNIGHT, { G: PAL.goldLight, D: PAL.goldDark }, isl.x, ly - 6, 1);
    } else {
      // Radiant Generative Spire (Modern Era)
      pxRect(g, isl.x - 4, ly - 13, 8, 13, PAL.creamDim);
      pxRect(g, isl.x - 2, ly - 18, 4, 5, PAL.goldLight);
      pxSparkle(g, isl.x, ly - 21, 3, PAL.cream);
    }

    // Crisp Roman numeral badge below island
    const badgeY = isl.y + isl.r + 7;
    pxRect(g, isl.x - 10, badgeY - 5, 20, 10, lit ? PAL.navyDark : '#13243B');
    pxOutline(g, isl.x - 10, badgeY - 5, 20, 10, isStage1Lock ? PAL.goldLight : lit ? PAL.gold : PAL.slate, 1);
    pxBitmapText(g, isl.roman, isl.x, badgeY, 1, lit ? PAL.goldLight : PAL.slateLight);

    // Pulsing quest reticle locking onto Stage I at the end of Scene 10
    if (isStage1Lock) {
      const pulseR = Math.round(isl.r + 7 + Math.sin(time * 12) * 2);
      pxRing(g, isl.x, isl.y - 2, pulseR, PAL.goldLight);
      pxSparkle(g, isl.x - pulseR, isl.y - 2, 2, PAL.cream);
      pxSparkle(g, isl.x + pulseR, isl.y - 2, 2, PAL.cream);
    }
  }

  // Charming 16-Bit Pixel Airship cruising the route, then swooping back to hover over Stage I!
  let shipX: number;
  let shipY: number;
  if (localTime < 3.0) {
    const posF = routeP * totalSegs;
    const idx = Math.min(totalSegs - 1, Math.floor(posF));
    const sub = posF - idx;
    const a = islands[idx];
    const b = islands[idx + 1];
    shipX = lerp(a.x, b.x, sub);
    shipY = lerp(a.y, b.y, sub) - 24 - Math.sin(sub * Math.PI) * 10;
  } else {
    const returnP = easeOutExpo(clamp01((localTime - 3.0) / 0.85));
    shipX = lerp(islands[4].x, islands[0].x + 2, returnP);
    shipY = lerp(islands[4].y - 24, islands[0].y - 28, returnP) + Math.sin(time * 4) * 2;
  }

  // Soft dark shadow on ocean below airship
  pxRect(g, Math.round(shipX - 7), Math.round(shipY + 18), 14, 3, 'rgba(16, 18, 30, 0.45)');
  drawSprite(
    g,
    SPRITE_AIRSHIP,
    { R: PAL.coral, C: PAL.cream, G: PAL.goldLight, D: PAL.goldDark, M: PAL.slate },
    shipX,
    shipY,
    2
  );
  // Animated spinning propeller glint at tail
  const propY = Math.floor(time * 24) % 2 === 0 ? -2 : 2;
  pxRect(g, Math.round(shipX - 15), Math.round(shipY - 2 + propY), 2, 4, PAL.iceWhite);

  // Drifting high-altitude pixel clouds
  const cl1 = (((time * 10) % (pw + 70)) + pw + 70) % (pw + 70) - 35;
  const cl2 = (((pw * 0.65 - time * 7) % (pw + 70)) + pw + 70) % (pw + 70) - 35;
  pxCloud(g, cl1, ph * 0.34, 14, PAL.cream, PAL.slateLight);
  pxCloud(g, cl2, ph * 0.84, 13, PAL.creamDim, PAL.slate);
}

// ============================================================================
// SCENE 11 (34.90–39.40s): Stage 01 — Dawn Meadow & Sprouting Circuit Bud
// "第一阶段 · 萌芽与诞生 · 机器能思考吗"
// ============================================================================
export function drawPixelSceneStageOneDawn(
  g: CanvasRenderingContext2D,
  pw: number,
  ph: number,
  time: number,
  localTime: number,
  energy: number
): void {
  // Warm golden-rose dawn sky (fresh, hopeful birth of a field!)
  drawDitheredSky(g, pw, ph, [
    { stop: 0, color: '#181F3A' },
    { stop: 0.28, color: '#333152' },
    { stop: 0.54, color: '#6E4658' },
    { stop: 0.74, color: '#BD7256' },
    { stop: 0.88, color: '#E8B16B' },
  ]);

  // Fading morning stars in upper sky
  pxStarfield(g, pw, ph, time, 20, 0.34, time * 2);

  // Rising sunrise disk behind rolling green hills
  const cx = Math.floor(pw * 0.5);
  const hillBase = Math.floor(ph * 0.72);
  const sunRise = easeOutExpo(clamp01(localTime / 1.4));
  const sunY = Math.round(lerp(hillBase + 16, ph * 0.54, sunRise));
  drawDitheredGlow(g, cx, sunY, 56 + Math.round(energy * 8), PAL.gold, 'medium');
  pxCircle(g, cx, sunY, 26, PAL.gold);
  pxCircle(g, cx, sunY, 18, PAL.goldLight);
  pxCircle(g, cx, sunY, 11, PAL.cream);

  // Warm morning clouds drifting gently
  const c1 = (((pw * 0.18 + time * 5) % (pw + 80)) + pw + 80) % (pw + 80) - 40;
  const c2 = (((pw * 0.82 - time * 4) % (pw + 80)) + pw + 80) % (pw + 80) - 40;
  pxCloud(g, c1, ph * 0.32, 16, PAL.goldLight, PAL.dusk);
  pxCloud(g, c2, ph * 0.38, 13, PAL.coralLight, PAL.plum);

  // Far misty mountain ridge
  for (let x = 0; x < pw; x++) {
    const mh = Math.floor(20 + Math.sin(x * 0.025 + 0.6) * 14 + Math.cos(x * 0.05) * 6);
    pxRect(g, x, hillBase - mh, 1, mh + 6, '#2A4252');
  }

  // Rolling lush emerald foreground meadow
  for (let x = 0; x < pw; x++) {
    const curve = Math.floor(Math.sin(x * 0.016 - 0.5) * 7 + Math.cos(x * 0.04) * 3);
    const gy = hillBase + curve;
    pxRect(g, x, gy, 1, ph - gy, PAL.pine);
    pxRect(g, x, gy, 1, 5, PAL.tealDark);
    pxRect(g, x, gy, 1, 2, PAL.teal);
  }

  // Distant cozy silhouette trees on far left & right edges
  pxPineTree(g, Math.floor(pw * 0.1), hillBase + 2, 34, '#16343A', PAL.pine);
  pxPineTree(g, Math.floor(pw * 0.18), hillBase + 4, 24, '#16343A', PAL.tealDark);
  pxPineTree(g, Math.floor(pw * 0.86), hillBase + 2, 32, '#16343A', PAL.pine);
  pxPineTree(g, Math.floor(pw * 0.92), hillBase + 5, 22, '#16343A', PAL.tealDark);

  // HERO: Ancient Brass Mechanical Cogwheel half-embedded in soil
  const groundY = hillBase + 6;
  const cogR = 22;
  const cogRot = time * 0.35;
  // Soil mound framing base
  pxCircle(g, cx, groundY + 12, 34, '#3B2C2A');
  pxCircle(g, cx, groundY + 14, 28, '#2B1F1E');

  // Rotating brass gear teeth emerging from the earth
  for (let i = 0; i < 10; i++) {
    const a = cogRot + (i / 10) * Math.PI * 2;
    const tx = cx + Math.cos(a) * (cogR + 3);
    const ty = groundY + 4 + Math.sin(a) * (cogR + 3);
    if (ty <= groundY + 10) {
      pxRect(g, tx - 3, ty - 3, 6, 6, PAL.goldDark);
      pxRect(g, tx - 2, ty - 2, 4, 4, PAL.gold);
    }
  }
  pxCircle(g, cx, groundY + 4, cogR, PAL.goldDark);
  pxCircle(g, cx, groundY + 4, cogR - 4, PAL.amber);
  pxCircle(g, cx, groundY + 4, 8, PAL.navyDark);
  // Cover lower half of gear with lush foreground turf
  pxRect(g, cx - 34, groundY + 6, 68, 22, PAL.pine);
  pxRect(g, cx - 32, groundY + 6, 64, 3, PAL.teal);

  // HERO: Animated Pixel Seedling growing from the gear hub into a glowing Bulb-Chip Bud!
  const growP = easeOutExpo(clamp01((localTime - 0.25) / 1.55));
  const stemH = Math.round(44 * growP);
  const stemTopY = groundY + 4 - stemH;

  // Gently swaying stem
  for (let i = 0; i < stemH; i++) {
    const sway = Math.round(Math.sin(time * 2.5 + i * 0.08) * (i / 24));
    pxRect(g, cx - 1 + sway, groundY + 4 - i, 3, 1, i % 4 === 0 ? PAL.tealLight : PAL.teal);
  }

  // Twin unfolding pixel leaves once stem reaches halfway
  if (growP > 0.35) {
    const leafP = easeOutExpo(clamp01((growP - 0.35) / 0.5));
    const lw = Math.round(16 * leafP);
    const ly = groundY - Math.round(stemH * 0.45);
    // Left leaf
    for (let dx = 0; dx < lw; dx++) {
      const h = Math.max(1, Math.round(Math.sin((dx / Math.max(1, lw)) * Math.PI) * 7));
      pxRect(g, cx - 2 - dx, ly - Math.floor(dx * 0.35) - Math.floor(h / 2), 1, h, dx < lw * 0.5 ? PAL.tealLight : PAL.teal);
    }
    // Right leaf
    for (let dx = 0; dx < lw; dx++) {
      const h = Math.max(1, Math.round(Math.sin((dx / Math.max(1, lw)) * Math.PI) * 7));
      pxRect(g, cx + 2 + dx, ly - 3 - Math.floor(dx * 0.35) - Math.floor(h / 2), 1, h, dx < lw * 0.5 ? PAL.tealLight : PAL.teal);
    }
  }

  // Glowing Filament Light-Bulb Flower blooming at stem tip!
  if (growP > 0.6) {
    const budP = easeOutExpo(clamp01((growP - 0.6) / 0.4));
    const swayTop = Math.round(Math.sin(time * 2.5 + stemH * 0.08) * (stemH / 24));
    const bx = cx + swayTop;
    const by = stemTopY - 8;
    const br = Math.max(3, Math.round(10 * budP));

    drawDitheredGlow(g, bx, by, Math.round(28 * budP + energy * 8), PAL.goldLight, 'medium');
    pxCircle(g, bx, by, br + 1, PAL.gold);
    pxCircle(g, bx, by, Math.max(2, br - 2), PAL.goldLight);
    pxCircle(g, bx - 1, by - 1, Math.max(1, br - 5), PAL.cream);
    // Tiny glowing circuit filament inside bud
    pxRect(g, bx - 3, by + br - 1, 6, 3, PAL.slateLight);
    pxRect(g, bx - 2, by + br + 2, 4, 2, PAL.goldDark);

    // At localTime >= 2.15 ("机器能思考吗"), radiant thought rings expand from the glowing bud!
    if (localTime >= 2.1) {
      for (let r = 0; r < 3; r++) {
        const cyc = ((time * 0.7 + r / 3) % 1);
        const rad = Math.round(14 + cyc * 46);
        pxRing(g, bx, by, rad, cyc < 0.5 ? PAL.goldLight : PAL.tealLight);
      }
    }
  }

  // Swaying foreground grass blades & floating golden morning fireflies
  for (let x = 6; x < pw - 6; x += 11) {
    const sway = Math.round(Math.sin(time * 3 + x * 0.15));
    const gy = hillBase + Math.floor(Math.sin(x * 0.016 - 0.5) * 7 + Math.cos(x * 0.04) * 3) + 4;
    pxLine(g, x, gy + 3, x + sway, gy - 4, PAL.tealLight, 1);
    if (x % 33 === 0) {
      pxRect(g, x + sway, gy - 5, 2, 2, PAL.goldLight);
    }
  }
  for (let i = 0; i < 16; i++) {
    const fx = Math.floor((((i * 41 + Math.sin(time * 1.4 + i) * 14) % pw) + pw) % pw);
    const fy = Math.floor(ph * 0.42 + (((i * 23 - time * 12) % (ph * 0.42) + ph * 0.42) % (ph * 0.42)));
    pxSparkle(g, fx, fy, i % 4 === 0 ? 2 : 1, i % 2 === 0 ? PAL.goldLight : PAL.cream);
  }
}

// ============================================================================
// SCENE 12 (39.40–45.23s): 1950 Post-War British Lab & Alan Turing Cameo
// "故事的起点，要从二战后说起 · 1950年 · 计算机科学之父阿兰·图灵"
// ============================================================================
export function drawPixelScenePostwarTuring(
  g: CanvasRenderingContext2D,
  pw: number,
  ph: number,
  time: number,
  localTime: number,
  energy: number
): void {
  const isPortrait = ph > pw;

  // Vintage 1950s Manchester stone & mahogany lab interior
  drawDitheredSky(g, pw, ph, [
    { stop: 0, color: '#131726' },
    { stop: 0.48, color: '#1B2034' },
    { stop: 0.76, color: '#242538' },
  ]);

  const deskY = Math.floor(ph * 0.74);

  // Subtle vintage stone brick wall texture
  for (let y = 18; y < deskY - 6; y += 14) {
    pxRect(g, 0, y, pw, 1, '#181D2E');
    for (let x = ((y / 14) % 2) * 18; x < pw; x += 36) {
      pxRect(g, x, y, 1, 14, '#181D2E');
    }
  }

  // LEFT: Tall Arched Gothic Twilight Window (British University Lab atmosphere)
  const winW = isPortrait ? 52 : 66;
  const winH = isPortrait ? 84 : 88;
  const winX = isPortrait ? 12 : 18;
  const winY = Math.floor(ph * 0.25);

  pxRect(g, winX - 3, winY + 12, winW + 6, winH - 12, '#37303D');
  pxCircle(g, winX + winW / 2, winY + 14, winW / 2 + 3, '#37303D');
  pxRect(g, winX, winY + 12, winW, winH - 14, PAL.navyDark);
  pxCircle(g, winX + winW / 2, winY + 14, winW / 2, PAL.navyDark);
  // Crescent moon & twilight clouds through Gothic window
  pxCircle(g, winX + 18, winY + 22, 6, PAL.goldLight);
  pxCircle(g, winX + 20, winY + 20, 5, PAL.navyDark);
  pxRect(g, winX + winW / 2 - 1, winY, 2, winH - 2, '#37303D');
  pxRect(g, winX, winY + Math.floor(winH * 0.48), winW, 2, '#37303D');
  // Faint diagonal moonlight rays slanting onto floor
  pxLine(g, winX + winW, winY + 26, winX + winW + 40, deskY - 4, 'rgba(168, 221, 242, 0.08)', 8);

  // CENTER-LEFT: Iconic 1950s Vacuum-Tube Mainframe / Bombe Rotor Rack!
  const rackW = isPortrait ? 86 : 112;
  const rackH = 82;
  const rackX = isPortrait ? Math.floor(pw * 0.44) : Math.floor(pw * 0.28);
  const rackY = deskY - rackH - 6;

  pxRect(g, rackX, rackY, rackW, rackH, '#252B40');
  pxOutline(g, rackX, rackY, rackW, rackH, PAL.void, 2);
  pxRect(g, rackX + 3, rackY + 3, rackW - 6, rackH - 6, '#1B2133');

  // Spinning twin magnetic tape / brass cipher rotors!
  const reelSpin = time * 4.5;
  for (const offset of [26, rackW - 26]) {
    const rx = rackX + offset;
    const ry = rackY + 22;
    pxCircle(g, rx, ry, 13, PAL.slate);
    pxCircle(g, rx, ry, 10, PAL.navyDark);
    pxCircle(g, rx, ry, 4, PAL.gold);
    for (let s = 0; s < 3; s++) {
      const a = reelSpin + (s * Math.PI * 2) / 3;
      pxLine(g, rx, ry, rx + Math.cos(a) * 9, ry + Math.sin(a) * 9, PAL.creamDim, 1);
    }
  }
  // Tape ribbon looping between reels
  pxLine(g, rackX + 26, rackY + 35, rackX + rackW - 26, rackY + 35, PAL.goldDark, 1);

  // Blinking vacuum-tube amber & teal indicator bulb matrix
  for (let row = 0; row < 2; row++) {
    for (let col = 0; col < 8; col++) {
      const bx = rackX + 10 + col * Math.floor((rackW - 20) / 8);
      const by = rackY + 44 + row * 8;
      const on = Math.floor(time * 7 + col * 2 + row * 5) % 3 === 0;
      pxRect(g, bx, by, 4, 3, on ? (col % 2 === 0 ? PAL.goldLight : PAL.coral) : '#2F3852');
    }
  }

  // Green CRT Oscilloscope strip inside mainframe
  const oscX = rackX + 10;
  const oscY = rackY + 62;
  const oscW = rackW - 20;
  pxRect(g, oscX, oscY, oscW, 13, '#0D1E1E');
  pxOutline(g, oscX, oscY, oscW, 13, PAL.slate, 1);
  for (let x = 2; x < oscW - 2; x += 2) {
    const sy = oscY + 6 + Math.round(Math.sin(x * 0.25 + time * 14) * (2.5 + energy * 2.5));
    pxRect(g, oscX + x, sy, 2, 1, PAL.tealLight);
  }

  // FOREGROUND: Heavy Mahogany Desk + Banker's Lamp + Scrolling Binary Ticker Tape!
  pxRect(g, 0, deskY, pw, ph - deskY, '#3D2B27');
  pxRect(g, 0, deskY, pw, 3, '#69493E');
  pxRect(g, 0, deskY + 3, pw, 2, '#261A18');

  // Brass Banker's Lamp casting warm amber glow on desk
  const lampX = isPortrait ? 34 : Math.floor(pw * 0.22);
  pxRect(g, lampX - 7, deskY - 3, 14, 3, PAL.goldDark);
  pxRect(g, lampX - 1, deskY - 24, 2, 21, PAL.gold);
  pxRect(g, lampX - 10, deskY - 29, 20, 6, PAL.teal);
  pxRect(g, lampX - 8, deskY - 23, 16, 2, PAL.goldLight);
  drawDitheredGlow(g, lampX, deskY - 6, 34, PAL.gold, 'light');

  // Scrolling Perforated Binary Paper Ticker-Tape across lower desk
  const tapeY = deskY + 9;
  pxRect(g, 10, tapeY, pw - 20, 9, PAL.cream);
  pxRect(g, 10, tapeY, pw - 20, 1, PAL.creamDim);
  const tapeShift = Math.floor(time * 32) % 10;
  for (let x = 14 - tapeShift; x < pw - 14; x += 10) {
    if (x < 12) continue;
    pxRect(g, x, tapeY + 2, 2, 2, PAL.navy);
    if ((Math.floor((x + tapeShift) / 10) % 2) === 0) {
      pxRect(g, x + 4, tapeY + 5, 2, 2, PAL.navy);
    } else {
      pxRect(g, x + 4, tapeY + 2, 2, 2, PAL.navy);
    }
  }

  // HERO PHASE B (localTime >= 2.55s, "1950年 · 计算机科学之父阿兰·图灵"):
  // Ornate Golden Medallion Portrait of Alan Turing rising smoothly on the right!
  const turingP = easeOutExpo(clamp01((localTime - 2.45) / 0.72));
  if (turingP > 0.02) {
    const px = isPortrait ? Math.floor(pw * 0.5) : Math.floor(pw * 0.76);
    const py = Math.round(lerp(deskY + 18, Math.floor(ph * 0.54), turingP));
    const medR = isPortrait ? 30 : 34;

    drawDitheredGlow(g, px, py, medR + 18, PAL.gold, 'medium');
    // Ornate pixel cameo medallion frame
    pxCircle(g, px, py, medR + 3, PAL.goldDark);
    pxCircle(g, px, py, medR + 1, PAL.goldLight);
    pxCircle(g, px, py, medR - 2, '#1F253D');

    // Warm dither backdrop inside portrait
    for (let dy = -medR + 5; dy < medR - 5; dy += 4) {
      pxRect(g, px - 18, py + dy, 36, 1, '#28314F');
    }

    // Respectful 16-bit Pixel Portrait Bust of Alan Turing
    drawSprite(
      g,
      SPRITE_TURING_BUST,
      {
        H: '#4D3A34',
        S: '#EAC7A4',
        D: '#2D2121',
        M: '#BA8B74',
        C: '#3B4A66',
        W: PAL.cream,
        R: PAL.coralDark,
      },
      px,
      py + 4,
      3
    );

    // 1950 Brass Nameplate pinned cleanly below medallion
    pxRect(g, px - 22, py + medR - 3, 44, 11, PAL.navyDark);
    pxOutline(g, px - 22, py + medR - 3, 44, 11, PAL.goldLight, 1);
    pxBitmapText(g, '1950', px, py + medR + 2, 1, PAL.goldLight);

    // Subtle twinkling golden sparks flanking the portrait
    pxSparkle(g, px - medR - 8, py - 14, 3, PAL.goldLight);
    pxSparkle(g, px + medR + 8, py + 8, 2, PAL.cream);
  }
}

// ============================================================================
// SCENE 13 (45.23–49.40s): 1950 MIND Journal -> 3-Booth Pixel Turing Test
// "发表了一篇划时代的论文 · 提出了著名的“图灵测试”"
// ============================================================================
export function drawPixelSceneTuringTest(
  g: CanvasRenderingContext2D,
  pw: number,
  ph: number,
  time: number,
  localTime: number,
  energy: number
): void {
  // Smooth morph right when "提出了著名的图灵测试" enters (localTime ~ 1.85s)
  const testBlend = smoothstep(1.65, 2.2, localTime);

  // PHASE A: Glowing Open 1950 "MIND" Academic Paper on Wooden Desk
  if (testBlend < 0.99) {
    drawDitheredSky(g, pw, ph, [
      { stop: 0, color: '#1E1718' },
      { stop: 0.5, color: '#2F221F' },
      { stop: 0.85, color: '#3E2D28' },
    ]);

    const cx = Math.floor(pw * 0.5);
    const cy = Math.floor(ph * 0.62);
    const openP = easeOutExpo(clamp01(localTime / 0.65));
    const pageW = Math.round(lerp(24, Math.min(82, pw * 0.24), openP));
    const pageH = Math.min(78, Math.floor(ph * 0.36));

    drawDitheredGlow(g, cx, cy, 74, PAL.gold, 'light');

    // Leather bound journal cover shadow & rim
    pxRect(g, cx - pageW - 6, cy - pageH / 2 - 4, pageW * 2 + 12, pageH + 10, '#1A1214');
    pxRect(g, cx - pageW - 4, cy - pageH / 2 - 2, pageW * 2 + 8, pageH + 6, PAL.coralDark);

    // Cream left & right pages
    pxRect(g, cx - pageW, cy - pageH / 2, pageW - 1, pageH, PAL.cream);
    pxRect(g, cx + 1, cy - pageH / 2, pageW - 1, pageH, PAL.creamDim);
    pxRect(g, cx - 1, cy - pageH / 2, 2, pageH, PAL.amber);

    if (openP > 0.5) {
      // Left page header: MIND 1950 + mini diagram
      pxBitmapText(g, 'MIND', cx - Math.floor(pageW * 0.5), cy - pageH / 2 + 11, 1, PAL.coralDark);
      pxBitmapText(g, '1950', cx - Math.floor(pageW * 0.5), cy - pageH / 2 + 22, 1, PAL.navy);
      pxRect(g, cx - pageW + 8, cy - pageH / 2 + 30, pageW - 16, 2, PAL.goldDark);

      // Animated typing ink lines across both pages!
      const typedLines = Math.floor(clamp01((localTime - 0.25) / 1.2) * 10);
      for (let i = 0; i < Math.min(4, typedLines); i++) {
        const lw = (pageW - 16) * (i === 3 ? 0.65 : 1);
        pxRect(g, cx - pageW + 8, cy + 2 + i * 7, lw, 2, PAL.slate);
      }
      for (let i = 0; i < Math.max(0, typedLines - 4); i++) {
        const ly = cy - pageH / 2 + 12 + i * 9;
        if (ly < cy + pageH / 2 - 8) {
          const lw = (pageW - 14) * (i % 2 === 0 ? 0.92 : 0.72);
          pxRect(g, cx + 8, ly, lw, 2, i === 0 ? PAL.coral : PAL.navyLight);
        }
      }

      // Golden fountain pen nib glinting over the active line
      const penX = cx + 12 + Math.floor(Math.sin(time * 18) * 14);
      const penY = cy - pageH / 2 + 18 + Math.min(40, typedLines * 5);
      pxLine(g, penX, penY, penX + 16, penY - 20, PAL.goldLight, 2);
      pxSparkle(g, penX, penY, 2, PAL.goldLight);
    }
  }

  // PHASE B: Iconic Animated 16-Bit 3-Booth TURING TEST Diagram sliding smoothly in!
  if (testBlend > 0.01) {
    const slideX = Math.round((1 - easeOutExpo(testBlend)) * pw);
    g.save();
    g.translate(slideX, 0);

    // Clean deep blueprint slate-navy backdrop
    drawDitheredSky(g, pw, ph, [
      { stop: 0, color: '#0F1526' },
      { stop: 0.5, color: '#162138' },
      { stop: 1, color: '#111A2E' },
    ]);

    // Blueprint grid lines
    for (let x = 12; x < pw; x += 24) pxRect(g, x, 0, 1, ph, '#1B2844');
    for (let y = 12; y < ph; y += 24) pxRect(g, 0, y, pw, 1, '#1B2844');

    const isPortrait = ph > pw;
    const boxTop = Math.floor(ph * (isPortrait ? 0.36 : 0.38));
    const boxBot = Math.floor(ph * (isPortrait ? 0.80 : 0.84));
    const boxH = boxBot - boxTop;
    const midY = Math.floor((boxTop + boxBot) / 2);
    const margin = isPortrait ? 12 : 24;
    const wallX = Math.floor(pw * 0.48);

    // Outer Architectural Blueprint Room Frame
    pxOutline(g, margin, boxTop, pw - margin * 2, boxH, PAL.tealLight, 2);

    // LEFT ROOM: Interrogator C (Human Evaluator at Teleprinter Terminal)
    const leftW = wallX - margin - 6;
    pxRect(g, margin + 2, boxTop + 2, leftW, boxH - 4, '#18243A');
    const cCenterX = margin + Math.floor(leftW * 0.46);
    const cCenterY = midY;
    drawDitheredGlow(g, cCenterX, cCenterY, 26, PAL.gold, 'light');
    // Desk + CRT teleprinter + Human Interrogator
    pxRect(g, cCenterX - 24, cCenterY + 12, 48, 5, '#5E4237');
    pxRect(g, cCenterX + 4, cCenterY - 2, 16, 14, PAL.creamDim);
    pxRect(g, cCenterX + 6, cCenterY, 12, 9, '#193C3B');
    pxRect(g, cCenterX + 8, cCenterY + 3, Math.floor((time * 12) % 8) + 1, 2, PAL.tealLight);
    drawSprite(
      g,
      SPRITE_PIXEL_THINKER,
      { S: '#EAC7A4', D: PAL.void, T: PAL.gold },
      cCenterX - 10,
      cCenterY + 3,
      2
    );
    // Label badge C
    pxRect(g, margin + 8, boxTop + 7, 14, 12, PAL.gold);
    pxBitmapText(g, 'C', margin + 15, boxTop + 13, 1, PAL.void);

    // CENTER OPAQUE PIXEL BRICK PARTITION WALL (Cannot see through!)
    pxRect(g, wallX - 5, boxTop, 10, boxH, '#4E393F');
    pxOutline(g, wallX - 5, boxTop, 10, boxH, PAL.gold, 1);
    for (let y = boxTop + 6; y < boxBot - 4; y += 8) {
      pxRect(g, wallX - 4, y, 8, 1, '#2D2025');
    }
    // Pulsing Golden "?" Mystery Seal right in the middle of the wall!
    pxCircle(g, wallX, midY, 10, PAL.navyDark);
    pxRing(g, wallX, midY, 10, PAL.goldLight);
    pxBitmapText(g, '?', wallX, midY, 1, PAL.goldLight);

    // RIGHT UPPER ROOM (A: Human) & RIGHT LOWER ROOM (B: Machine)
    const rightX = wallX + 6;
    const rightW = pw - margin - rightX - 2;
    const halfH = Math.floor((boxH - 6) / 2);

    // Room A (Top-Right: Human Thinker)
    pxRect(g, rightX, boxTop + 2, rightW, halfH - 2, '#1A2A3B');
    const aCenterX = rightX + Math.floor(rightW * 0.56);
    const aCenterY = boxTop + Math.floor(halfH * 0.55);
    drawSprite(
      g,
      SPRITE_PIXEL_THINKER,
      { S: '#EAC7A4', D: PAL.void, T: PAL.coral },
      aCenterX,
      aCenterY,
      2
    );
    pxRect(g, rightX + rightW - 18, boxTop + 6, 14, 12, PAL.coral);
    pxBitmapText(g, 'A', rightX + rightW - 11, boxTop + 12, 1, PAL.cream);

    // Horizontal divider between Room A and Room B
    pxRect(g, rightX - 1, midY - 1, rightW + 2, 3, PAL.tealLight);

    // Room B (Bottom-Right: Blinking AI Computer Mainframe!)
    pxRect(g, rightX, midY + 2, rightW, halfH - 2, '#16263A');
    const bCenterX = rightX + Math.floor(rightW * 0.56);
    const bCenterY = midY + Math.floor(halfH * 0.52);
    pxRect(g, bCenterX - 16, bCenterY - 11, 32, 22, PAL.navyLight);
    pxOutline(g, bCenterX - 16, bCenterY - 11, 32, 22, PAL.tealLight, 1);
    for (let i = 0; i < 4; i++) {
      const blink = Math.floor(time * 9 + i) % 2 === 0;
      pxRect(g, bCenterX - 12 + i * 7, bCenterY - 6, 4, 3, blink ? PAL.goldLight : PAL.teal);
    }
    pxRect(g, bCenterX - 10, bCenterY + 2, 20, 5, '#0F1B26');
    pxRect(g, bCenterX - 8, bCenterY + 4, Math.round(6 + energy * 10), 2, PAL.tealLight);

    pxRect(g, rightX + rightW - 18, midY + 6, 14, 12, PAL.teal);
    pxBitmapText(g, 'B', rightX + rightW - 11, midY + 12, 1, PAL.void);

    // ANIMATED TELEPRINTER DATA PACKETS ZIPPING BACK & FORTH THROUGH THE WALL!
    const wireLeftX = cCenterX + 20;
    const wireRightX = rightX + Math.floor(rightW * 0.34);
    const wireAY = aCenterY;
    const wireBY = bCenterY;

    // Cable conduit lines
    pxLine(g, wireLeftX, cCenterY - 2, wallX - 5, wireAY, PAL.slate, 1);
    pxLine(g, wallX + 5, wireAY, wireRightX, wireAY, PAL.slate, 1);
    pxLine(g, wireLeftX, cCenterY + 2, wallX - 5, wireBY, PAL.slate, 1);
    pxLine(g, wallX + 5, wireBY, wireRightX, wireBY, PAL.slate, 1);

    // Traveling glowing message pulses (Question out -> Answer back!)
    const p1 = (time * 0.85) % 1;
    const p2 = (time * 0.85 + 0.5) % 1;
    const pkt1X = lerp(wireLeftX, wireRightX, p1);
    const pkt1Y = pkt1X < wallX ? lerp(cCenterY - 2, wireAY, (pkt1X - wireLeftX) / Math.max(1, wallX - wireLeftX)) : wireAY;
    pxRect(g, pkt1X - 3, pkt1Y - 2, 6, 4, PAL.goldLight);
    pxSparkle(g, pkt1X, pkt1Y, 2, PAL.cream);

    const pkt2X = lerp(wireRightX, wireLeftX, p2);
    const pkt2Y = pkt2X > wallX ? wireBY : lerp(wireBY, cCenterY + 2, (wallX - pkt2X) / Math.max(1, wallX - wireLeftX));
    pxRect(g, pkt2X - 3, pkt2Y - 2, 6, 4, PAL.tealLight);
    pxSparkle(g, pkt2X, pkt2Y, 2, PAL.iceWhite);

    g.restore();
  }
}

// ============================================================================
// SCENE 14 (49.40–53.87s): Cosmic Darkroom Thought-Waves & Giant Golden "?"
// "他抛出一个振聋发聩的问题 · 机器能思考吗"
// ============================================================================
export function drawPixelSceneCanMachinesThink(
  g: CanvasRenderingContext2D,
  pw: number,
  ph: number,
  time: number,
  localTime: number,
  energy: number
): void {
  const qHit = localTime >= 2.38;
  const qT = Math.max(0, localTime - 2.38);

  // Deep cosmic indigo-to-violet darkroom
  drawDitheredSky(g, pw, ph, [
    { stop: 0, color: '#0B0E1D' },
    { stop: 0.4, color: '#141933' },
    { stop: 0.78, color: '#221E3D' },
    { stop: 1, color: '#131426' },
  ]);
  pxStarfield(g, pw, ph, time, 44, 0.9, time * 3);

  const cx = Math.floor(pw * 0.5);
  const cy = Math.floor(ph * 0.6);

  // Expanding pixel sonar thought-waves pulsing outward continuously
  for (let i = 0; i < 5; i++) {
    const cyc = (time * (qHit ? 0.65 : 0.42) + i / 5) % 1;
    const rad = Math.round(16 + Math.pow(cyc, 1.25) * Math.max(pw, ph) * 0.46);
    const col = qHit ? (i % 2 === 0 ? PAL.gold : PAL.teal) : (i % 2 === 0 ? PAL.tealDark : PAL.navyLight);
    pxRing(g, cx, cy, rad, col);
  }

  // Symmetrical luminous neural circuit traces feeding inward from left & right edges!
  for (const dir of [-1, 1]) {
    for (let b = 0; b < 4; b++) {
      const yOff = (b - 1.5) * 24;
      const startX = dir === -1 ? 0 : pw;
      const elbowX = cx + dir * (66 + (b % 2) * 22);
      const endX = cx + dir * 32;
      const startY = cy + yOff;
      const endY = cy + yOff * 0.4;

      pxLine(g, startX, startY, elbowX, startY, '#263B59', 1);
      pxLine(g, elbowX, startY, endX, endY, '#2A6360', 1);

      // Animated electrical synapse pulse traveling inward toward the brain core!
      const pulseF = (time * 1.15 + b * 0.27) % 1;
      const px = pulseF < 0.5 ? lerp(startX, elbowX, pulseF * 2) : lerp(elbowX, endX, (pulseF - 0.5) * 2);
      const py = pulseF < 0.5 ? startY : lerp(startY, endY, (pulseF - 0.5) * 2);
      pxRect(g, px - 1, py - 1, 3, 3, qHit ? PAL.goldLight : PAL.tealLight);
    }
  }

  // Central dithered aura — intensifies dramatically when "机器能思考吗" lands!
  const auraR = qHit ? Math.round(58 + easeOutExpo(clamp01(qT / 0.5)) * 24 + energy * 10) : Math.round(44 + energy * 8);
  drawDitheredGlow(g, cx, cy, auraR, qHit ? PAL.gold : PAL.teal, 'medium');

  // Detailed 16-Bit Circuit Brain Core hovering in center
  const bob = Math.round(Math.sin(time * 3.2) * 2);
  drawSprite(
    g,
    SPRITE_CIRCUIT_BRAIN,
    { T: qHit ? PAL.goldDark : PAL.tealLight, G: qHit ? PAL.teal : PAL.navyLight },
    cx,
    cy + bob,
    4
  );

  // Orbiting glowing pixel synapse nodes
  for (let i = 0; i < 6; i++) {
    const a = time * 1.6 + (i / 6) * Math.PI * 2;
    const ox = cx + Math.cos(a) * 44;
    const oy = cy + Math.sin(a) * 22;
    pxSparkle(g, ox, oy, i % 2 === 0 ? 3 : 2, qHit ? PAL.goldLight : PAL.tealLight);
  }

  // CLIMAX BEAT (localTime >= 2.38s): Monumental Golden Pixel "?" ignites right inside the Brain Core!
  if (qHit) {
    const pop = easeOutExpo(clamp01(qT / 0.32));
    // Radial golden impact rays
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2 + time * 0.3;
      const r0 = 26;
      const r1 = Math.round(34 + pop * 36 + (i % 2) * 14);
      pxLine(g, cx + Math.cos(a) * r0, cy + Math.sin(a) * r0, cx + Math.cos(a) * r1, cy + Math.sin(a) * r1, PAL.goldLight, 1);
    }

    // Solid dark core medallion behind "?" so silhouette pops with 10/10 contrast
    pxCircle(g, cx, cy + bob, Math.round(22 * pop), PAL.void);
    pxRing(g, cx, cy + bob, Math.round(23 * pop), PAL.goldLight, 2);

    if (pop > 0.35) {
      pxBitmapText(g, '?', cx, cy + bob, 4, PAL.goldLight, PAL.amber);
    }
  }
}

// ============================================================================
// SCENE 15 (53.87–60.00s): Starry Night Valley, First Spark & 1956 Horizon
// "这就像一颗火种 · 点燃了人类对人工智能的最初幻想 · 紧接着在1956年"
// ============================================================================
export function drawPixelSceneSpark1956(
  g: CanvasRenderingContext2D,
  pw: number,
  ph: number,
  time: number,
  localTime: number,
  energy: number
): void {
  const igniteP = clamp01((localTime - 0.55) / 0.55);
  const constellationP = smoothstep(1.3, 2.5, localTime);
  const year1956P = smoothstep(3.95, 4.55, localTime);

  // Starry night sky gently warming near horizon as the bonfire & 1956 dawn glow!
  drawDitheredSky(g, pw, ph, [
    { stop: 0, color: '#0B0E20' },
    { stop: 0.36, color: '#161B36' },
    { stop: 0.68, color: year1956P > 0.2 ? '#442A45' : '#28223E' },
    { stop: 0.88, color: year1956P > 0.2 ? '#8B4942' : '#422B3B' },
  ]);
  pxStarfield(g, pw, ph, time, 54, 0.72, time * 2);

  const cx = Math.floor(pw * 0.5);
  const ridgeY = Math.floor(ph * 0.76);

  // Distant mountain valley silhouette
  for (let x = 0; x < pw; x++) {
    const distFromCenter = Math.abs(x - cx) / (pw * 0.5);
    const mh = Math.floor(10 + distFromCenter * 28 + Math.sin(x * 0.04) * 7);
    pxRect(g, x, ridgeY - mh, 1, ph - (ridgeY - mh), '#15182B');
  }

  // Foreground dark stone cliff & pine silhouettes framing the valley
  pxRect(g, 0, ridgeY, pw, ph - ridgeY, '#121322');
  pxRect(g, 0, ridgeY, pw, 2, '#2B2B45');
  pxPineTree(g, Math.floor(pw * 0.1), ridgeY + 2, 42, '#0D1322', '#1B253C');
  pxPineTree(g, Math.floor(pw * 0.19), ridgeY + 3, 28, '#0D1322', '#1B253C');
  pxPineTree(g, Math.floor(pw * 0.84), ridgeY + 2, 34, '#0D1322', '#1B253C');
  pxPineTree(g, Math.floor(pw * 0.92), ridgeY + 3, 44, '#0D1322', '#1B253C');

  // Stone Brazier Altar sitting on the cliff center
  const brazierY = ridgeY - 2;
  pxRect(g, cx - 18, brazierY - 6, 36, 8, PAL.slate);
  pxRect(g, cx - 14, brazierY + 2, 28, 6, PAL.navyLight);
  pxOutline(g, cx - 18, brazierY - 6, 36, 8, PAL.void, 1);

  // PHASE A (0.00 -> 0.65s): Descending Golden Spark Comet dropping into the stone brazier!
  if (localTime < 0.7) {
    const fallP = easeOutCubic(clamp01(localTime / 0.62));
    const sx = Math.round(lerp(cx - 38, cx, fallP));
    const sy = Math.round(lerp(ph * 0.18, brazierY - 10, fallP));
    pxLine(g, sx, sy, sx - 12, sy - 18, PAL.gold, 2);
    pxSparkle(g, sx, sy, 4, PAL.goldLight);
    pxCircle(g, sx, sy, 3, PAL.cream);
  }

  // IGNITED BONFIRE & RISING EMBERS (localTime >= 0.55s)
  if (igniteP > 0.01) {
    const fireH = Math.round((22 + energy * 10) * easeOutExpo(igniteP));
    drawDitheredGlow(g, cx, brazierY - 14, Math.round(48 * igniteP + energy * 12), PAL.gold, 'medium');

    // Flickering multi-tongue 16-bit bonfire
    for (let i = 0; i < 7; i++) {
      const f = i / 7;
      const sway = Math.round(Math.sin(time * 16 + i * 1.4) * (1 + f * 3));
      const fy = brazierY - 8 - Math.round(f * fireH);
      const fr = Math.max(2, Math.round((1 - f * 0.72) * 11 * igniteP));
      const col = i < 2 ? PAL.cream : i < 4 ? PAL.goldLight : i < 6 ? PAL.gold : PAL.coral;
      pxCircle(g, cx + sway, fy, fr, col);
    }

    // Rising glowing pixel embers drifting skyward into dreams!
    const emberCount = 24;
    for (let i = 0; i < emberCount; i++) {
      const speed = 18 + (i % 5) * 9;
      const age = (time * speed + i * 13) % (ph * 0.68);
      const ex = cx + Math.round(Math.sin(age * 0.07 + i * 2.1) * (12 + age * 0.65));
      const ey = Math.round(brazierY - 14 - age);
      if (ey > 16) {
        pxRect(g, ex, ey, i % 3 === 0 ? 2 : 1, i % 3 === 0 ? 2 : 1, i % 2 === 0 ? PAL.goldLight : PAL.coralLight);
      }
    }
  }

  // PHASE B (1.30s – 4.30s): Glowing Starry Constellations of Human AI Imagination!
  if (constellationP > 0.02 && year1956P < 0.85) {
    const cAlpha = constellationP * (1 - year1956P);
    g.save();
    g.globalAlpha = cAlpha;

    // LEFT CONSTELLATION: Starry Pixel Robot Silhouette linked by golden star-lines
    const lx = Math.floor(pw * 0.22);
    const ly = Math.floor(ph * 0.44);
    const botPts: Array<[number, number]> = [
      [lx - 10, ly - 10],
      [lx + 10, ly - 10],
      [lx + 10, ly + 4],
      [lx - 10, ly + 4],
      [lx - 10, ly - 10],
      [lx, ly - 18],
    ];
    for (let i = 0; i < botPts.length - 1; i++) {
      pxLine(g, botPts[i][0], botPts[i][1], botPts[i + 1][0], botPts[i + 1][1], PAL.tealLight, 1);
    }
    for (const [bx, by] of botPts) pxSparkle(g, bx, by, 2, PAL.cream);
    pxRect(g, lx - 5, ly - 4, 2, 2, PAL.goldLight);
    pxRect(g, lx + 3, ly - 4, 2, 2, PAL.goldLight);

    // RIGHT CONSTELLATION: Starry Pixel Rocket / Future Explorer linked by golden lines
    const rx = Math.floor(pw * 0.78);
    const ry = Math.floor(ph * 0.44);
    drawSprite(
      g,
      SPRITE_ROCKET_HERO,
      { R: PAL.gold, W: PAL.cream, C: PAL.tealLight, S: PAL.navyLight, B: PAL.ice, I: PAL.cream, D: PAL.goldDark },
      rx,
      ry,
      1
    );
    pxRing(g, rx, ry, 18, PAL.goldDark);
    pxSparkle(g, rx - 16, ry - 10, 2, PAL.goldLight);
    pxSparkle(g, rx + 16, ry + 8, 2, PAL.cream);

    // Sweeping constellation arc connecting both dreams across the sky
    for (let i = 0; i <= 10; i++) {
      const f = i / 10;
      const ax = lerp(lx + 16, rx - 16, f);
      const ay = Math.round(ph * 0.44 - Math.sin(f * Math.PI) * 18);
      if (i % 2 === 0) pxSparkle(g, ax, ay, 1, PAL.goldLight);
    }

    g.restore();
  }

  // PHASE C (localTime >= 3.95s, "紧接着在1956年"): Radiant 1956 Horizon Cliffhanger Portal!
  if (year1956P > 0.02) {
    const portalY = Math.floor(ph * 0.48);
    const pr = Math.round(44 * easeOutExpo(year1956P));
    drawDitheredGlow(g, cx, portalY, pr + 26, PAL.goldLight, 'medium');
    pxRing(g, cx, portalY, pr, PAL.goldLight, 2);
    pxRing(g, cx, portalY, Math.max(4, pr - 6), PAL.tealLight, 1);

    // Subtle starburst rays heralding the 1956 Dartmouth Conference
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2 + time * 0.25;
      pxLine(
        g,
        cx + Math.cos(a) * (pr + 2),
        portalY + Math.sin(a) * (pr + 2),
        cx + Math.cos(a) * (pr + 18),
        portalY + Math.sin(a) * (pr + 18),
        PAL.gold,
        1
      );
    }
  }
}
