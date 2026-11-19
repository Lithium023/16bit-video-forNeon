import {
  PAL,
  SPRITE_CIRCUIT_BRAIN,
  SPRITE_GIANT_ROBOT,
  SPRITE_PIONEER_MCCARTHY,
  SPRITE_PIONEER_MINSKY,
  SPRITE_PIONEER_SHANNON,
  SPRITE_TROPHY_CROWN,
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

// ============================================================================
// SCENE 16 (59.80–65.27s): 1956 Dartmouth Pioneers Assemble
// Cues 31–34: 几位年轻的科学家 / 约翰·麦卡锡 / 马文·明斯基 / 克劳德·香农等
// ============================================================================
export function drawPixelSceneDartmouthPioneers(
  g: CanvasRenderingContext2D,
  pw: number,
  ph: number,
  time: number,
  localTime: number,
  energy: number
): void {
  // Warm 1956 Ivy League oak-paneled lecture hall backdrop
  drawDitheredSky(g, pw, ph, [
    { stop: 0, color: '#181320' },
    { stop: 0.35, color: '#261C2B' },
    { stop: 0.72, color: '#382630' },
  ]);

  // Subtle vertical oak wall wainscoting ribs
  for (let x = 0; x < pw; x += 24) {
    pxRect(g, x, Math.floor(ph * 0.14), 2, Math.floor(ph * 0.66), '#201724');
  }
  // Upper crown molding & warm dado rail
  pxRect(g, 0, Math.floor(ph * 0.12), pw, 4, '#543832');
  pxRect(g, 0, Math.floor(ph * 0.78), pw, 5, '#543832');
  pxRect(g, 0, Math.floor(ph * 0.83), pw, ph - Math.floor(ph * 0.83), '#24191D');

  // Three warm hanging vintage brass lamps casting soft dithered cones
  const cx = Math.floor(pw * 0.5);
  const spreadX = pw > 260 ? Math.floor(pw * 0.27) : Math.floor(pw * 0.29);
  const cardXs = [cx - spreadX, cx, cx + spreadX];
  const cardY = Math.floor(ph * 0.54);
  const cardW = pw > 260 ? 74 : 56;
  const cardH = pw > 260 ? 84 : 74;

  // Pioneer reveal timings synced to exact SRT timestamps:
  // 0.00s: 几位年轻的科学家 | 1.50s (61.30s): 麦卡锡 | 2.67s (62.47s): 明斯基 | 3.93s (63.73s): 香农
  const revealStarts = [1.35, 2.55, 3.8];
  const pioneers: Array<{
    name: string;
    tag: string;
    sprite: string[];
    accent: string;
    pal: Record<string, string>;
  }> = [
    {
      name: 'MCCARTHY',
      tag: 'LISP',
      sprite: SPRITE_PIONEER_MCCARTHY,
      accent: PAL.goldLight,
      pal: {
        H: '#5C4438',
        S: '#F0CFA8',
        D: '#2B2024',
        M: '#9C6952',
        C: '#344059',
        W: PAL.cream,
        R: PAL.coral,
      },
    },
    {
      name: 'MINSKY',
      tag: 'NEURAL',
      sprite: SPRITE_PIONEER_MINSKY,
      accent: PAL.tealLight,
      pal: {
        H: '#383034',
        G: PAL.creamDim,
        S: '#F0CFA8',
        D: '#232028',
        M: '#A06D58',
        C: '#3D3448',
        W: PAL.cream,
        B: PAL.tealDark,
        T: PAL.teal,
      },
    },
    {
      name: 'SHANNON',
      tag: 'INFO',
      sprite: SPRITE_PIONEER_SHANNON,
      accent: PAL.coralLight,
      pal: {
        H: '#443530',
        S: '#F2D2AE',
        D: '#241E24',
        M: '#9E6E58',
        C: '#2F464B',
        W: PAL.cream,
        G: PAL.gold,
      },
    },
  ];

  // Golden connecting energy link between assembled pioneers once all 3 arrive!
  const linkP = smoothstep(4.2, 4.9, localTime);
  if (linkP > 0.02) {
    const linkEnd = Math.round(lerp(cardXs[0], cardXs[2], linkP));
    pxLine(g, cardXs[0], cardY, linkEnd, cardY, PAL.gold, 2);
    pxLine(g, cardXs[0], cardY - 1, linkEnd, cardY - 1, PAL.goldLight, 1);
  }

  for (let i = 0; i < 3; i++) {
    const px = cardXs[i];
    const pData = pioneers[i];
    const pop = clamp01((localTime - revealStarts[i]) / 0.45);
    const active = pop > 0.02;
    const bounce = active ? Math.round((1 - easeOutBack(pop, 1.35)) * 10) : 0;
    const cy = cardY + bounce;

    // Hanging lamp cord & glow above each portrait
    pxRect(g, px, 0, 1, cy - Math.floor(cardH / 2) - 10, PAL.goldDark);
    pxRect(g, px - 5, cy - Math.floor(cardH / 2) - 10, 11, 3, active ? PAL.gold : PAL.slate);
    if (active) {
      drawDitheredGlow(g, px, cy - 4, Math.round(38 * easeOutExpo(pop) + energy * 4), pData.accent, 'light');
    }

    // RPG Brass Portrait Frame
    const fx = px - Math.floor(cardW / 2);
    const fy = cy - Math.floor(cardH / 2);
    pxRect(g, fx + 3, fy + 3, cardW, cardH, 'rgba(10, 10, 16, 0.55)');
    pxRect(g, fx, fy, cardW, cardH, active ? '#1C2238' : '#181722');
    pxOutline(g, fx, fy, cardW, cardH, active ? PAL.gold : PAL.slate, 2);
    pxOutline(g, fx + 3, fy + 3, cardW - 6, cardH - 6, active ? pData.accent : '#2A2C3E', 1);

    // Brass corner rivets
    const rivet = active ? PAL.goldLight : PAL.slateLight;
    pxRect(g, fx + 1, fy + 1, 2, 2, rivet);
    pxRect(g, fx + cardW - 3, fy + 1, 2, 2, rivet);
    pxRect(g, fx + 1, fy + cardH - 3, 2, 2, rivet);
    pxRect(g, fx + cardW - 3, fy + cardH - 3, 2, 2, rivet);

    if (active) {
      // Inner portrait backdrop
      pxRect(g, fx + 6, fy + 6, cardW - 12, cardH - 28, '#26304D');
      // Subtle animated glow aura behind bust
      pxCircle(g, px, cy - 8, 16, '#324266');
      drawSprite(g, pData.sprite, pData.pal, px, cy - 6, pw > 260 ? 3 : 2);

      // Nameplate strip at bottom of portrait card
      pxRect(g, fx + 5, fy + cardH - 18, cardW - 10, 13, PAL.void);
      pxOutline(g, fx + 5, fy + cardH - 18, cardW - 10, 13, pData.accent, 1);
      pxBitmapText(g, pw > 260 ? pData.name : pData.tag, px, fy + cardH - 11, 1, PAL.cream);

      // Reveal sparkle flare right on cue hit
      if (pop < 0.95) {
        pxSparkle(g, fx + cardW - 8, fy + 8, 4, PAL.goldLight);
        pxSparkle(g, fx + 8, fy + cardH - 22, 3, PAL.cream);
      }
    } else {
      // Unrevealed mystery silhouette "?" waiting for cue callout
      pxRect(g, fx + 6, fy + 6, cardW - 12, cardH - 28, '#141624');
      pxBitmapText(g, '?', px, cy - 8, 2, PAL.slate);
      pxBitmapText(g, '1956', px, fy + cardH - 11, 1, PAL.slate);
    }
  }

  // Drifting warm dust motes in the seminar room
  for (let i = 0; i < 14; i++) {
    const mx = ((i * 37 + Math.floor(time * 6)) % (pw - 16)) + 8;
    const my = Math.floor(ph * 0.2 + ((i * 23 + time * 5) % Math.floor(ph * 0.56)));
    pxRect(g, mx, my, 1, 1, i % 2 === 0 ? PAL.goldLight : PAL.creamDim);
  }
}

// ============================================================================
// SCENE 17 (65.27–69.73s): Dartmouth College Summer 1956 Workshop
// Cues 35–36: 在美国的达特茅斯学院 / 举办了一场长达两个月的学术会议
// ============================================================================
export function drawPixelSceneDartmouthCollege(
  g: CanvasRenderingContext2D,
  pw: number,
  ph: number,
  time: number,
  localTime: number,
  energy: number
): void {
  // Bright golden New England late-summer afternoon sky
  drawDitheredSky(g, pw, ph, [
    { stop: 0, color: '#1F3A60' },
    { stop: 0.3, color: '#33618A' },
    { stop: 0.58, color: '#6196B2' },
    { stop: 0.78, color: '#C8B088' },
  ]);

  // Warm summer sun upper-left with gentle rays
  const sunX = Math.floor(pw * 0.16);
  const sunY = Math.floor(ph * 0.24);
  drawDitheredGlow(g, sunX, sunY, 34 + Math.round(energy * 4), PAL.goldLight, 'light');
  pxCircle(g, sunX, sunY, 12, PAL.goldLight);
  pxCircle(g, sunX, sunY, 8, PAL.cream);

  // Fluffy drifting summer clouds
  const cl1 = ((pw * 0.24 + time * 7) % (pw + 70)) - 35;
  const cl2 = ((pw * 0.76 + time * 5) % (pw + 70)) - 35;
  pxCloud(g, cl1, ph * 0.22, 16, PAL.cream, '#D6CCB8');
  pxCloud(g, cl2, ph * 0.28, 13, PAL.cream, '#C8C4BA');

  // Distant rolling New Hampshire green hills
  const groundY = Math.floor(ph * 0.74);
  for (let x = 0; x < pw; x++) {
    const hill = Math.floor(14 + Math.sin(x * 0.022 + 0.6) * 10 + Math.cos(x * 0.05) * 4);
    pxRect(g, x, groundY - hill, 1, hill, '#2D5954');
  }

  // Sunlit campus green lawn + central stone walkway
  pxRect(g, 0, groundY, pw, ph - groundY, '#2B6148');
  pxRect(g, 0, groundY, pw, 4, '#4B8E5C');
  pxRect(g, 0, groundY + 4, pw, 2, '#3C7A52');

  const cx = Math.floor(pw * 0.46);
  // Perspective stone walkway leading up to Baker Hall steps
  for (let r = 0; r < ph - groundY; r++) {
    const frac = r / Math.max(1, ph - groundY);
    const halfW = Math.round(lerp(12, 34, frac));
    pxRect(g, cx - halfW, groundY + r, halfW * 2, 1, r % 4 === 0 ? PAL.creamDim : '#B8AC96');
  }

  // HERO: Iconic 16-Bit Dartmouth College Baker Library & Clock Tower!
  const hallW = pw > 260 ? 154 : 124;
  const hallH = 44;
  const hx = cx - Math.floor(hallW / 2);
  const hy = groundY - hallH;

  // Main red-brick Georgian wings
  pxRect(g, hx, hy, hallW, hallH, '#8F3C37');
  pxRect(g, hx, hy, hallW, 3, PAL.cream); // White roof cornice
  pxRect(g, hx - 3, hy - 4, hallW + 6, 4, '#364152'); // Slate roof edge
  // Brick highlight lines
  for (let y = hy + 8; y < groundY - 4; y += 6) {
    pxRect(g, hx + 2, y, hallW - 4, 1, '#7A302C');
  }

  // Tall Georgian arched windows across both wings
  const winStep = pw > 260 ? 14 : 12;
  for (let wx = hx + 8; wx < hx + hallW - 10; wx += winStep) {
    if (Math.abs(wx - cx) < 18) continue;
    pxRect(g, wx, hy + 8, 7, 13, PAL.cream);
    pxRect(g, wx + 1, hy + 9, 5, 11, '#263854');
    pxRect(g, wx + 2, hy + 10, 2, 4, PAL.goldLight);
    pxRect(g, wx, hy + 26, 7, 11, PAL.cream);
    pxRect(g, wx + 1, hy + 27, 5, 9, '#263854');
  }

  // Central white portico pediment & columns
  pxRect(g, cx - 18, hy - 2, 36, hallH + 2, PAL.cream);
  pxRect(g, cx - 15, hy + 4, 30, hallH - 4, '#D8CEB8');
  for (let col = -13; col <= 13; col += 8) {
    pxRect(g, cx + col, hy + 5, 3, hallH - 5, PAL.cream);
  }
  // Entrance door
  pxRect(g, cx - 5, groundY - 14, 10, 14, '#3A2322');
  pxRect(g, cx - 4, groundY - 13, 8, 4, PAL.goldLight);

  // Iconic White Georgian Baker Clock Tower rising proudly from center!
  const tBaseY = hy - 4;
  // Square brick tower base
  pxRect(g, cx - 14, tBaseY - 22, 28, 22, '#9C443D');
  pxOutline(g, cx - 14, tBaseY - 22, 28, 22, PAL.cream, 1);
  // White clock story
  pxRect(g, cx - 12, tBaseY - 42, 24, 20, PAL.cream);
  pxOutline(g, cx - 12, tBaseY - 42, 24, 20, PAL.creamDim, 1);
  // Working animated clock face!
  const clkY = tBaseY - 32;
  pxCircle(g, cx, clkY, 6, PAL.void);
  pxCircle(g, cx, clkY, 5, PAL.cream);
  const handA = time * 1.4;
  pxLine(g, cx, clkY, cx + Math.cos(handA) * 4, clkY + Math.sin(handA) * 4, PAL.void, 1);
  pxLine(g, cx, clkY, cx, clkY - 3, PAL.coral, 1);

  // Lantern belfry + tapered spire + golden weathervane
  pxRect(g, cx - 8, tBaseY - 56, 16, 14, PAL.cream);
  pxRect(g, cx - 5, tBaseY - 53, 3, 9, '#2B4059');
  pxRect(g, cx + 2, tBaseY - 53, 3, 9, '#2B4059');
  for (let r = 0; r < 18; r++) {
    const hw = Math.max(1, Math.round((1 - r / 18) * 7));
    pxRect(g, cx - hw, tBaseY - 57 - r, hw * 2, 1, r % 2 === 0 ? PAL.cream : PAL.creamDim);
  }
  pxRect(g, cx, tBaseY - 82, 1, 7, PAL.goldLight);
  pxRect(g, cx - 3, tBaseY - 80, 7, 1, PAL.goldLight);

  // Campus trees flanking the college
  pxPineTree(g, hx - 18, groundY + 4, 42, '#1E4A3E', '#357355');
  pxPineTree(g, hx - 36, groundY + 6, 34, '#244A38', '#4E8A58');
  pxPineTree(g, hx + hallW + 16, groundY + 4, 40, '#1E4A3E', '#357355');

  // Tiny animated pixel scholars conversing on the campus lawn!
  for (let s = 0; s < 3; s++) {
    const sx = Math.floor(cx - 46 + s * 44 + Math.sin(time * 1.6 + s * 2) * 3);
    const sy = groundY + 12 + (s % 2) * 5;
    pxRect(g, sx - 1, sy - 6, 3, 3, '#F0CFA8'); // head
    pxRect(g, sx - 2, sy - 3, 5, 5, s === 1 ? PAL.coral : s === 0 ? PAL.navy : PAL.tealDark);
    pxRect(g, sx - 1, sy + 2, 1, 3, PAL.void);
    pxRect(g, sx + 1, sy + 2, 1, 3, PAL.void);
  }

  // Animated 2-Month Summer Calendar Flip Widget on right ("长达两个月" at localTime >= 1.6s)!
  const calP = easeOutExpo(clamp01((localTime - 1.4) / 0.55));
  if (calP > 0.02) {
    const calW = 46;
    const calH = 44;
    const calX = Math.floor(pw - calW - 14 + (1 - calP) * 40);
    const calY = Math.floor(ph * 0.44);
    const isAug = localTime > 2.85;
    const flipBounce = isAug ? Math.round(Math.exp(-(localTime - 2.85) * 6) * -5) : 0;

    pxRect(g, calX + 3, calY + 3 + flipBounce, calW, calH, 'rgba(12, 16, 26, 0.5)');
    pxRect(g, calX, calY + flipBounce, calW, calH, PAL.cream);
    pxRect(g, calX, calY + flipBounce, calW, 12, isAug ? PAL.teal : PAL.coral);
    pxOutline(g, calX, calY + flipBounce, calW, calH, PAL.void, 2);
    // Calendar ring bindings
    pxRect(g, calX + 10, calY - 3 + flipBounce, 4, 6, PAL.goldLight);
    pxRect(g, calX + calW - 14, calY - 3 + flipBounce, 4, 6, PAL.goldLight);

    pxBitmapText(g, '1956', calX + calW / 2, calY + 6 + flipBounce, 1, PAL.cream);
    pxBitmapText(g, isAug ? 'AUG' : 'JUL', calX + calW / 2, calY + 23 + flipBounce, 2, PAL.void);
    pxBitmapText(g, isAug ? '60D' : '30D', calX + calW / 2, calY + 37 + flipBounce, 1, PAL.amber);
  }
}

// ============================================================================
// SCENE 18 (69.73–74.70s): "Artificial Intelligence" Coined on the Chalkboard
// Cues 37–39: 正是在这次会议上 / “人工智能” / 这个词第一次被正式提出
// ============================================================================
export function drawPixelSceneAiNamed(
  g: CanvasRenderingContext2D,
  pw: number,
  ph: number,
  time: number,
  localTime: number,
  energy: number
): void {
  // Deep classic wooden seminar wall
  pxRect(g, 0, 0, pw, ph, '#2B1F22');

  // Giant oak-framed dark emerald chalkboard filling the center stage
  const padX = pw > 260 ? 22 : 12;
  const padTop = Math.floor(ph * 0.22);
  const padBot = Math.floor(ph * 0.16);
  const bw = pw - padX * 2;
  const bh = ph - padTop - padBot;

  // Oak wooden frame with 16-bit bevel
  pxRect(g, padX - 6, padTop - 6, bw + 12, bh + 12, '#6E4630');
  pxRect(g, padX - 4, padTop - 4, bw + 8, bh + 8, '#8C5C3E');
  pxOutline(g, padX - 6, padTop - 6, bw + 12, bh + 12, PAL.void, 2);

  // Dark green slate board surface with subtle chalk dust haze
  pxRect(g, padX, padTop, bw, bh, '#152B28');
  for (let i = 0; i < 42; i++) {
    const dx = padX + 8 + ((i * 53) % (bw - 16));
    const dy = padTop + 8 + ((i * 29) % (bh - 16));
    pxRect(g, dx, dy, 3, 1, '#1E3C37');
  }

  // Chalk tray at bottom of frame with white & gold chalk sticks + felt eraser
  const trayY = padTop + bh + 2;
  pxRect(g, padX + 12, trayY, bw - 24, 5, '#593625');
  pxRect(g, padX + 26, trayY - 2, 14, 3, PAL.cream);
  pxRect(g, padX + 46, trayY - 2, 10, 3, PAL.goldLight);
  pxRect(g, padX + bw - 54, trayY - 5, 22, 6, '#3D2A24');
  pxRect(g, padX + bw - 54, trayY - 2, 22, 2, PAL.creamDim);

  const cx = Math.floor(pw * 0.5);
  const cy = Math.floor(padTop + bh * 0.56);

  // Background chalk diagrams sketching on left & right margins of chalkboard
  const sketchP = easeOutCubic(clamp01(localTime / 1.4));
  if (pw > 260) {
    // Left chalk logic tree diagram
    const lx = padX + 34;
    const ly = padTop + 34;
    if (sketchP > 0.2) pxCircle(g, lx, ly, 5, '#3E6E64');
    if (sketchP > 0.45) {
      pxLine(g, lx, ly + 5, lx - 14, ly + 22, '#3E6E64', 1);
      pxLine(g, lx, ly + 5, lx + 14, ly + 22, '#3E6E64', 1);
      pxCircle(g, lx - 14, ly + 24, 4, '#3E6E64');
      pxCircle(g, lx + 14, ly + 24, 4, '#3E6E64');
    }
    if (sketchP > 0.75) {
      pxBitmapText(g, 'IF', lx, ly + 42, 1, '#4C8276');
    }

    // Right chalk neural node mesh
    const rx = padX + bw - 34;
    const ry = padTop + 36;
    if (sketchP > 0.3) {
      pxLine(g, rx - 12, ry, rx + 12, ry + 12, '#3E6E64', 1);
      pxLine(g, rx - 12, ry + 18, rx + 12, ry + 12, '#3E6E64', 1);
      pxCircle(g, rx - 12, ry, 3, '#4C8276');
      pxCircle(g, rx - 12, ry + 18, 3, '#4C8276');
      pxCircle(g, rx + 12, ry + 12, 4, '#5EA092');
    }
    if (sketchP > 0.75) {
      pxBitmapText(g, '1956', rx, ry + 38, 1, '#4C8276');
    }
  }

  // HERO MOMENT at localTime = 1.45s (SRT 71.266s "“人工智能”"):
  // Radiant golden chalk reveal of "ARTIFICIAL INTELLIGENCE" on the board!
  const coinP = easeOutExpo(clamp01((localTime - 1.38) / 0.65));
  if (coinP > 0.01) {
    // Golden chalk aura burst behind the coined term
    drawDitheredGlow(g, cx, cy, Math.round(52 * coinP + energy * 10), PAL.gold, 'medium');

    // Expanding starburst rays on the blackboard
    if (coinP < 0.98) {
      for (let i = 0; i < 12; i++) {
        const a = (i / 12) * Math.PI * 2 + time * 0.4;
        const r0 = 24 * coinP;
        const r1 = (46 + (i % 2) * 16) * coinP;
        pxLine(g, cx + Math.cos(a) * r0, cy + Math.sin(a) * r0, cx + Math.cos(a) * r1, cy + Math.sin(a) * r1, PAL.goldLight, 1);
      }
    }

    // Crisp handwritten pixel chalk emblem "A.I." + "ARTIFICIAL INTELLIGENCE"
    pxBitmapText(g, 'A.I.', cx, cy - 14, pw > 260 ? 3 : 2, PAL.goldLight, PAL.void);

    const revealLine = clamp01((localTime - 1.65) / 0.6);
    if (revealLine > 0.05) {
      pxBitmapText(g, 'ARTIFICIAL', cx, cy + 12, 1, PAL.cream, PAL.void);
      pxBitmapText(g, 'INTELLIGENCE', cx, cy + 23, 1, PAL.tealLight, PAL.void);

      // Animated chalk underline sweeping left -> right
      const uw = Math.round((pw > 260 ? 112 : 84) * easeOutExpo(revealLine));
      pxRect(g, cx - Math.floor(uw / 2), cy + 31, uw, 2, PAL.gold);
    }

    // Orbiting celebratory chalk sparkles
    for (let i = 0; i < 6; i++) {
      const a = time * 1.6 + (i * Math.PI) / 3;
      const sx = cx + Math.cos(a) * (pw > 260 ? 64 : 46);
      const sy = cy + Math.sin(a) * 28;
      pxSparkle(g, sx, sy, i % 2 === 0 ? 3 : 2, i % 2 === 0 ? PAL.goldLight : PAL.cream);
    }
  } else {
    // Anticipation chalk cursor blinking in center of board
    if (Math.floor(time * 6) % 2 === 0) {
      pxRect(g, cx - 2, cy - 6, 4, 14, PAL.cream);
    }
    pxBitmapText(g, 'DARTMOUTH 1956', cx, cy + 18, 1, '#5EA092');
  }
}

// ============================================================================
// SCENE 19 (74.70–85.73s): Wild 1950s Optimism -> Golden Human-Brain Hologram
// Cues 40–44: 当时的大佬们乐观得惊人 / 麦卡锡甚至预测 / 足够的规则和算力 / 几十年内 / 拥有人类全部智慧的机器
// ============================================================================
export function drawPixelSceneWildOptimism(
  g: CanvasRenderingContext2D,
  pw: number,
  ph: number,
  time: number,
  localTime: number,
  energy: number
): void {
  // Smooth morph at localTime = 6.1s (SRT ~80.8s "几十年内 / 拥有人类全部智慧的机器")
  const brainMorph = smoothstep(5.9, 6.7, localTime);

  // Retro-futuristic lab backdrop shifting from teal lab to golden cosmic optimism
  drawDitheredSky(g, pw, ph, [
    { stop: 0, color: brainMorph > 0.5 ? '#15142C' : '#101A2C' },
    { stop: 0.42, color: brainMorph > 0.5 ? '#261E42' : '#192D42' },
    { stop: 0.78, color: brainMorph > 0.5 ? '#482F4B' : '#234252' },
  ]);
  pxStarfield(g, pw, ph, time, 32, 0.66, time * 3);

  const cx = Math.floor(pw * 0.5);
  const floorY = Math.floor(ph * 0.78);

  // Subtle sunburst optimism rays fanning from center
  const rayCount = 12;
  for (let i = 0; i < rayCount; i++) {
    const a = (i / rayCount) * Math.PI * 2 + time * 0.25;
    pxLine(
      g,
      cx,
      Math.floor(ph * 0.54),
      cx + Math.cos(a) * Math.max(pw, ph) * 0.6,
      Math.floor(ph * 0.54) + Math.sin(a) * Math.max(pw, ph) * 0.6,
      brainMorph > 0.5 ? 'rgba(242, 180, 75, 0.12)' : 'rgba(126, 212, 192, 0.09)',
      1
    );
  }

  // Laboratory metallic floor
  pxRect(g, 0, floorY, pw, ph - floorY, '#141B2B');
  pxRect(g, 0, floorY, pw, 3, PAL.teal);

  // PHASE A (0.0s – 6.6s): Dual Pipelines ("规则" + "算力") Supercharging 1956 Mainframe!
  if (brainMorph < 0.98) {
    const shiftDown = Math.round(easeOutCubic(brainMorph) * ph * 0.45);
    g.save();
    g.translate(0, shiftDown);

    const coreW = pw > 260 ? 84 : 68;
    const coreH = 74;
    const coreX = cx - Math.floor(coreW / 2);
    const coreY = floorY - coreH;

    // Central Retro-Futuristic Mainframe Cabinet
    drawDitheredGlow(g, cx, coreY + 32, 46 + Math.round(energy * 8), PAL.teal, 'light');
    pxRect(g, coreX, coreY, coreW, coreH, PAL.navyLight);
    pxOutline(g, coreX, coreY, coreW, coreH, PAL.creamDim, 2);

    // Spinning twin magnetic tape reels at top of mainframe
    for (const side of [-1, 1]) {
      const rx = cx + side * 20;
      const ry = coreY + 18;
      pxCircle(g, rx, ry, 10, PAL.void);
      pxCircle(g, rx, ry, 8, PAL.cream);
      pxCircle(g, rx, ry, 3, PAL.coral);
      const a = time * 5 * side;
      pxLine(g, rx, ry, rx + Math.cos(a) * 7, ry + Math.sin(a) * 7, PAL.void, 1);
      pxLine(g, rx, ry, rx + Math.cos(a + 2.1) * 7, ry + Math.sin(a + 2.1) * 7, PAL.void, 1);
    }

    // Blinking indicator LED matrix in middle
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 8; c++) {
        const lit = Math.floor(time * 9 + r * 3 + c * 2) % 3 === 0;
        pxRect(g, coreX + 12 + c * 7, coreY + 36 + r * 6, 4, 3, lit ? (c % 2 === 0 ? PAL.goldLight : PAL.tealLight) : PAL.navyDark);
      }
    }
    pxBitmapText(g, 'AI-56', cx, coreY + 62, 1, PAL.goldLight);

    // LEFT PIPELINE: "RULES" — Golden Logic Rule Blocks feeding into Mainframe (peaks at localTime >= 3.3s)
    const pipeP = clamp01((localTime - 2.6) / 1.4);
    const pipeY = coreY + 42;
    if (pw > 250) {
      pxRect(g, 8, pipeY, coreX - 8, 12, '#1D2C44');
      pxOutline(g, 8, pipeY, coreX - 8, 12, PAL.goldDark, 1);
      pxBitmapText(g, 'RULES', Math.floor(coreX * 0.5), pipeY - 8, 1, PAL.goldLight);

      const beltShift = Math.floor(time * (28 + pipeP * 32)) % 22;
      for (let bx = 10 + beltShift; bx < coreX - 12; bx += 22) {
        pxRect(g, bx, pipeY + 2, 14, 8, PAL.gold);
        pxRect(g, bx + 2, pipeY + 4, 10, 4, PAL.goldLight);
      }

      // RIGHT PIPELINE: "POWER" — Vertical & Horizontal Compute Power Meter charging to 100%!
      const rx0 = coreX + coreW;
      const rightW = pw - rx0 - 8;
      pxRect(g, rx0, pipeY, rightW, 12, '#1D2C44');
      pxOutline(g, rx0, pipeY, rightW, 12, PAL.teal, 1);
      pxBitmapText(g, 'POWER', rx0 + Math.floor(rightW * 0.5), pipeY - 8, 1, PAL.tealLight);

      // Animated teal energy pulses shooting left into mainframe
      const pulseShift = Math.floor(time * (36 + pipeP * 40)) % 20;
      for (let px = pw - 16 - pulseShift; px > rx0 + 4; px -= 20) {
        pxRect(g, px, pipeY + 3, 10, 6, PAL.tealLight);
        pxRect(g, px + 2, pipeY + 4, 6, 4, PAL.cream);
      }

      // Vertical Power Gauge Bar on far right filling up!
      const gaugeX = pw - 22;
      const gaugeY = coreY - 6;
      const gaugeH = 40;
      const charge = lerp(0.25, 1.0, easeOutExpo(clamp01((localTime - 2.2) / 3.2)));
      pxRect(g, gaugeX, gaugeY, 10, gaugeH, PAL.void);
      pxOutline(g, gaugeX, gaugeY, 10, gaugeH, PAL.tealLight, 1);
      const fillH = Math.round((gaugeH - 4) * charge);
      pxRect(g, gaugeX + 2, gaugeY + gaugeH - 2 - fillH, 6, fillH, charge > 0.8 ? PAL.goldLight : PAL.tealLight);
    }

    g.restore();
  }

  // PHASE B (6.0s – 11.03s): Radiant Golden Pixel Human-Brain Hologram inside Glass Dome!
  if (brainMorph > 0.02) {
    const rise = easeOutExpo(brainMorph);
    const pedY = Math.floor(lerp(ph + 30, floorY, rise));
    const brainY = pedY - 58 + Math.round(Math.sin(time * 2.8) * 3);

    // Ornate glowing brass & teal laboratory pedestal
    pxRect(g, cx - 50, pedY - 12, 100, 12, PAL.navyLight);
    pxRect(g, cx - 44, pedY - 10, 88, 3, PAL.gold);
    pxRect(g, cx - 34, pedY - 20, 68, 8, PAL.slate);
    pxOutline(g, cx - 50, pedY - 12, 100, 12, PAL.goldLight, 1);

    // Ascending golden holographic projection beam
    pxRect(g, cx - 28, brainY - 26, 56, pedY - 20 - (brainY - 26), 'rgba(242, 180, 75, 0.16)');
    pxRect(g, cx - 16, brainY - 22, 32, pedY - 20 - (brainY - 22), 'rgba(126, 212, 192, 0.16)');

    // Glass dome silhouette ring
    pxRing(g, cx, brainY, 38, PAL.tealLight);
    pxRing(g, cx, brainY, 48, PAL.goldDark);

    // Radiant dithered halo & HERO Golden Circuit Brain!
    drawDitheredGlow(g, cx, brainY, 44 + Math.round(energy * 10), PAL.gold, 'medium');
    drawSprite(
      g,
      SPRITE_CIRCUIT_BRAIN,
      {
        T: PAL.tealLight,
        G: Math.floor(time * 6) % 2 === 0 ? PAL.goldLight : PAL.gold,
      },
      cx,
      brainY,
      3
    );

    // Orbiting wisdom sparks & floating golden crown emblem
    for (let i = 0; i < 6; i++) {
      const a = time * 1.7 + (i * Math.PI) / 3;
      const ox = cx + Math.cos(a) * 48;
      const oy = brainY + Math.sin(a) * 20;
      pxSparkle(g, ox, oy, i % 2 === 0 ? 3 : 2, i % 2 === 0 ? PAL.goldLight : PAL.tealLight);
    }
  }
}

// ============================================================================
// SCENE 20 (85.73–95.80s): Symbolic Logic & Proofs -> 1950s Giant Robot Dream
// Cues 45–50: 编写逻辑规则 / 解数学题 / 证明定理 / 大家都觉得 / AI统治世界的时代马上就要来了
// ============================================================================
export function drawPixelSceneLogicDominion(
  g: CanvasRenderingContext2D,
  pw: number,
  ph: number,
  time: number,
  localTime: number,
  energy: number
): void {
  // Dramatic Phase B morph at localTime = 6.2s (SRT ~91.93s "大家都觉得 / AI统治世界的时代马上就要来了")
  const robotMorph = smoothstep(6.05, 6.85, localTime);

  // PHASE A (0.00s – 6.80s): Symbolic Logic Lab — Punch Cards & Theorem Proving Board
  if (robotMorph < 0.98) {
    drawDitheredSky(g, pw, ph, [
      { stop: 0, color: '#111626' },
      { stop: 0.48, color: '#182238' },
      { stop: 0.85, color: '#212D46' },
    ]);

    const deskY = Math.floor(ph * 0.78);
    pxRect(g, 0, deskY, pw, ph - deskY, '#2E2326');
    pxRect(g, 0, deskY, pw, 3, '#543D38');

    // LEFT: Animated Stack of IBM Logic Punch Cards feeding into Brass Reader
    const cardAreaX = pw > 260 ? Math.floor(pw * 0.24) : Math.floor(pw * 0.26);
    const readerY = deskY - 26;
    pxRect(g, cardAreaX - 34, readerY, 68, 26, PAL.slate);
    pxOutline(g, cardAreaX - 34, readerY, 68, 26, PAL.creamDim, 2);
    pxRect(g, cardAreaX - 26, readerY + 6, 52, 4, PAL.void);
    pxBitmapText(g, 'LOGIC', cardAreaX, readerY + 18, 1, PAL.goldLight);

    // Rising & sliding punch cards with binary hole patterns
    const feedCycle = (time * 1.4) % 1;
    for (let c = 0; c < 3; c++) {
      const cy = readerY - 12 - c * 18 + Math.round(feedCycle * 18);
      const cw = 54;
      const ch = 15;
      const cx0 = cardAreaX - Math.floor(cw / 2);
      if (cy < readerY + 2) {
        pxRect(g, cx0, cy, cw, ch, PAL.cream);
        pxRect(g, cx0, cy, cw, 3, c % 2 === 0 ? PAL.gold : PAL.coral);
        pxOutline(g, cx0, cy, cw, ch, PAL.void, 1);
        for (let h = 0; h < 7; h++) {
          if ((h + c * 2) % 2 === 0) pxRect(g, cx0 + 5 + h * 7, cy + 6, 4, 2, PAL.void);
          if ((h + c) % 3 === 0) pxRect(g, cx0 + 5 + h * 7, cy + 10, 4, 2, PAL.void);
        }
      }
    }

    // Animated golden logic beam connecting punch-card reader -> theorem screen
    const screenX = pw > 260 ? Math.floor(pw * 0.48) : Math.floor(pw * 0.46);
    const screenW = pw - screenX - 16;
    const screenH = 82;
    const screenY = deskY - screenH - 12;
    pxLine(g, cardAreaX + 34, readerY + 10, screenX, screenY + screenH - 16, PAL.gold, 2);
    const pktX = Math.round(lerp(cardAreaX + 36, screenX - 2, (time * 2.2) % 1));
    pxRect(g, pktX - 2, readerY + 8, 5, 5, PAL.goldLight);

    // RIGHT: Glowing Retro Vector Theorem Proving Terminal!
    pxRect(g, screenX - 3, screenY - 3, screenW + 6, screenH + 6, PAL.creamDim);
    pxRect(g, screenX, screenY, screenW, screenH, '#102422');
    pxOutline(g, screenX, screenY, screenW, screenH, PAL.teal, 2);

    // Subtle scan grid inside terminal
    for (let y = screenY + 12; y < screenY + screenH; y += 14) {
      pxRect(g, screenX + 2, y, screenW - 4, 1, '#173632');
    }

    // Line 1: Logic rule (visible from 0.8s)
    const scx = screenX + Math.floor(screenW * 0.44);
    if (localTime > 0.7) {
      pxBitmapText(g, 'IF A>B', scx, screenY + 18, 1, PAL.goldLight);
    }
    // Line 2: Math problem solved ("解数学题" around localTime 3.5s -> SRT 89.2s)
    if (localTime > 2.4) {
      pxBitmapText(g, '2X+4=8', scx, screenY + 38, 1, PAL.cream);
      if (localTime > 3.5) {
        // Crisp green pixel checkmark ✓
        const kx = screenX + screenW - 22;
        const ky = screenY + 38;
        pxLine(g, kx - 4, ky, kx - 1, ky + 3, PAL.tealLight, 2);
        pxLine(g, kx - 1, ky + 3, kx + 6, ky - 4, PAL.tealLight, 2);
      }
    }
    // Line 3: Theorem proved ("证明定理" around localTime 5.0s -> SRT 90.8s)
    if (localTime > 4.2) {
      pxBitmapText(g, 'Q.E.D.', scx, screenY + 60, 2, PAL.tealLight);
      if (localTime > 5.0) {
        const kx = screenX + screenW - 22;
        const ky = screenY + 60;
        pxLine(g, kx - 4, ky, kx - 1, ky + 3, PAL.goldLight, 2);
        pxLine(g, kx - 1, ky + 3, kx + 6, ky - 4, PAL.goldLight, 2);
        pxSparkle(g, kx + 2, ky - 6, 3, PAL.goldLight);
      }
    }
  }

  // PHASE B (6.10s – 10.07s): 1950s Retro-Futuristic Skyline + Colossal Golden-Eyed Robot ("AI统治世界")!
  if (robotMorph > 0.02) {
    const riseOffset = Math.round((1 - easeOutExpo(robotMorph)) * ph);
    g.save();
    g.translate(0, riseOffset);

    // Dramatic 1950s sci-fi twilight crimson-to-violet sky
    drawDitheredSky(g, pw, ph, [
      { stop: 0, color: '#141129' },
      { stop: 0.34, color: '#2B1B40' },
      { stop: 0.64, color: '#5E2B48' },
      { stop: 0.84, color: '#A84E42' },
    ]);
    pxStarfield(g, pw, ph, time, 40, 0.55, time * 2);

    const cx = Math.floor(pw * 0.5);
    const horizonY = Math.floor(ph * 0.8);

    // Sweeping dramatic retro sci-fi searchlight beams across the sky!
    for (let b = 0; b < 3; b++) {
      const bx = Math.floor(pw * (0.18 + b * 0.32));
      const sway = Math.sin(time * (1.2 + b * 0.4) + b * 2) * 58;
      pxLine(g, bx, horizonY, bx + sway, 0, 'rgba(255, 224, 138, 0.22)', 4);
      pxLine(g, bx, horizonY, bx + sway * 0.9, 0, 'rgba(255, 224, 138, 0.32)', 2);
    }

    // HERO: Colossal 1950s Retro Tin Robot rising majestically behind the skyline!
    const robotRise = easeOutExpo(clamp01((localTime - 6.3) / 1.4));
    const robotY = Math.floor(lerp(horizonY + 40, ph * 0.6, robotRise)) + Math.round(Math.sin(time * 2.4) * 2);
    drawDitheredGlow(g, cx, robotY - 12, 56 + Math.round(energy * 10), PAL.gold, 'medium');

    drawSprite(
      g,
      SPRITE_GIANT_ROBOT,
      {
        G: Math.floor(time * 8) % 2 === 0 ? PAL.goldLight : PAL.coralLight,
        T: PAL.tealLight,
        C: PAL.creamDim,
        D: PAL.slate,
      },
      cx,
      robotY,
      pw > 260 ? 5 : 4
    );

    // Floating Golden Crown hovering triumphantly over the Giant Robot's antenna!
    const crownPop = easeOutBack(clamp01((localTime - 7.3) / 0.55), 1.4);
    if (crownPop > 0.02) {
      const crownY = robotY - (pw > 260 ? 50 : 40) + Math.round(Math.sin(time * 4) * 2);
      drawSprite(
        g,
        SPRITE_TROPHY_CROWN,
        { G: PAL.goldLight, R: PAL.coral, D: PAL.goldDark },
        cx,
        crownY,
        2
      );
      pxSparkle(g, cx - 20, crownY, 3, PAL.goldLight);
      pxSparkle(g, cx + 20, crownY - 2, 3, PAL.cream);
    }

    // Foreground Retro-Futuristic Metropolis Silhouette framing the Giant Robot!
    for (let i = 0; i < 14; i++) {
      const bw = 24 + ((i * 11) % 14);
      const bx = i * 28 - 4;
      const distCenter = Math.abs(bx + bw / 2 - cx);
      const bh = distCenter < 48 ? 22 + ((i * 7) % 14) : 40 + ((i * 17) % 34);
      const by = ph - bh;
      pxRect(g, bx, by, bw, bh, '#141526');
      pxRect(g, bx, by, bw, 2, PAL.coral);
      // Warm glowing city windows
      for (let wy = by + 6; wy < ph - 10; wy += 7) {
        for (let wx = bx + 4; wx < bx + bw - 4; wx += 6) {
          if ((wx + wy + i) % 3 === 0) {
            pxRect(g, wx, wy, 3, 3, (wx + i) % 2 === 0 ? PAL.gold : PAL.tealLight);
          }
        }
      }
    }

    // Elevated glowing monorail zipping across lower skyline
    pxRect(g, 0, ph - 18, pw, 2, PAL.slate);
    const trainX = ((Math.floor(time * 90) % (pw + 60)) - 30);
    pxRect(g, trainX, ph - 21, 24, 3, PAL.goldLight);
    pxRect(g, trainX + 20, ph - 21, 4, 3, PAL.cream);

    g.restore();
  }
}
