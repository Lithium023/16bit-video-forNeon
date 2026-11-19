import {
  PAL,
  SPRITE_CHESS_KNIGHT,
  SPRITE_FROZEN_BOT,
  SPRITE_ROCKET_HERO,
  SPRITE_SHIP_GALLEON,
  SPRITE_TRAVELER_UMBRELLA,
  SPRITE_TROPHY_CROWN,
  bayerThreshold,
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
import { drawPixelHudTag, drawPixelKineticTitle } from './pixelTypography';
import {
  drawPixelSceneCanMachinesThink,
  drawPixelSceneFiveStages,
  drawPixelScenePostwarTuring,
  drawPixelSceneSpark1956,
  drawPixelSceneStageOneDawn,
  drawPixelSceneTuringTest,
} from './retroPixelChapterTwo';
import {
  drawPixelSceneAiNamed,
  drawPixelSceneDartmouthCollege,
  drawPixelSceneDartmouthPioneers,
  drawPixelSceneLogicDominion,
  drawPixelSceneWildOptimism,
} from './retroPixelChapterThree';
import {
  drawPixelSceneColdWaterSplash,
  drawPixelSceneCombinatorialExplosion,
  drawPixelSceneEmberThaw1980s,
  drawPixelSceneExpertSystems,
  drawPixelSceneFirstAiWinter,
  drawPixelSceneFleetingBloom,
  drawPixelSceneFundingCuts,
  drawPixelSceneMainframeOverload,
  drawPixelSceneOverhypedPie,
  drawPixelSceneSecondAiWinter,
  drawPixelSceneStageTwoWinter,
} from './retroPixelChapterFour';
import {
  drawPixelSceneAbandonHardcode,
  drawPixelSceneDeepBlueVictory,
  drawPixelSceneMachineLearningRise,
  drawPixelSceneMilestone1997,
  drawPixelSceneStageThreeData,
} from './retroPixelChapterFive';
import {
  drawPixelSceneBeyondHumanPeak,
  drawPixelSceneGpuComputeSurge,
  drawPixelSceneInternetDataDeluge,
  drawPixelSceneNeuralNetworkAwakening,
  drawPixelSceneSpecialistStudent,
  drawPixelSceneStageFourDeepLearning,
} from './retroPixelChapterSix';
import {
  drawPixelSceneAlexNetImageNet,
  drawPixelSceneAlphaGo2016,
  drawPixelSceneComputerSeesWorld,
  drawPixelSceneGoLastBastion,
  drawPixelSceneModernAiPrelude,
  drawPixelSceneStageFiveAgiDawn,
} from './retroPixelChapterSeven';
import {
  drawPixelSceneCivilizationRevolution,
  drawPixelSceneHumanlikeCreativity,
  drawPixelSceneMultimodalAi,
  drawPixelSceneSparkToWorldTree,
  drawPixelSceneTransformerLlm,
  drawPixelSceneWinterAndBreakthrough,
  drawPixelSceneWitnessAndWriterFinale,
} from './retroPixelChapterEight';
import {
  clamp01,
  easeInOutQuint,
  easeOutCubic,
  easeOutExpo,
  lerp,
  smoothstep,
} from './timeline';
import type { ActiveTransition, PureVisualSceneContext, SceneCut, SceneId } from './types';

// Virtual pixel resolution: 384x216 (exact 5x integer scale to 1920x1080!)
const VW_LANDSCAPE = 384;
const VH_LANDSCAPE = 216;
const VW_PORTRAIT = 216;
const VH_PORTRAIT = 384;

interface PixelBuffer {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  w: number;
  h: number;
}

let bufA: PixelBuffer | null = null;
let bufB: PixelBuffer | null = null;
let bufDither: PixelBuffer | null = null;

function ensureBuffer(existing: PixelBuffer | null, w: number, h: number): PixelBuffer | null {
  if (typeof document === 'undefined') return null;
  if (!existing) {
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    ctx.imageSmoothingEnabled = false;
    return { canvas, ctx, w, h };
  }
  if (existing.w !== w || existing.h !== h) {
    existing.canvas.width = w;
    existing.canvas.height = h;
    existing.w = w;
    existing.h = h;
  }
  existing.ctx.imageSmoothingEnabled = false;
  return existing;
}

// ============================================================================
// SCENE 1 (0.00–2.27s): Cozy Late-Night 16-Bit Computer Studio
// ============================================================================
function drawPixelSceneIntro(
  g: CanvasRenderingContext2D,
  pw: number,
  ph: number,
  time: number,
  localTime: number,
  energy: number
): void {
  // Continuous CRT boot from t=0 (no poster jump at t=0.015s!)
  const bootP = lerp(0.82, 1.0, easeOutExpo(clamp01(localTime / 0.5)));
  const stepT = Math.floor(time * 10) / 10;

  // Warm shadowed studio wall
  drawDitheredSky(g, pw, ph, [
    { stop: 0, color: '#181C2E' },
    { stop: 0.52, color: '#21253B' },
    { stop: 0.72, color: '#2B2B3F' },
  ]);

  const cx = Math.floor(pw * 0.5);
  const deskY = Math.floor(ph * 0.74);

  // LEFT WINDOW: Rainy midnight pixel city skyline + drifting clouds
  const winW = Math.min(82, Math.floor(pw * 0.24));
  const winH = Math.min(72, Math.floor(ph * 0.34));
  const winX = Math.max(12, Math.floor(pw * 0.05));
  const winY = Math.floor(ph * 0.22);

  pxRect(g, winX - 3, winY - 3, winW + 6, winH + 6, '#3B3038');
  pxRect(g, winX, winY, winW, winH, PAL.navyDark);
  // Moon & stars through window
  pxCircle(g, winX + winW - 16, winY + 14, 6, PAL.goldLight);
  pxCircle(g, winX + winW - 14, winY + 12, 5, PAL.navyDark);
  for (let i = 0; i < 8; i++) {
    pxRect(g, winX + 6 + ((i * 19) % (winW - 12)), winY + 6 + ((i * 13) % 24), 1, 1, PAL.cream);
  }
  // Distant buildings in window
  for (let x = winX + 2; x < winX + winW - 6; x += 11) {
    const bh = 14 + ((x * 7) % 22);
    pxRect(g, x, winY + winH - bh, 9, bh, '#232B45');
    if (bh > 20) {
      pxRect(g, x + 2, winY + winH - bh + 4, 2, 2, PAL.gold);
      pxRect(g, x + 5, winY + winH - bh + 10, 2, 2, PAL.tealLight);
    }
  }
  // Window mullions + animated glass rain glints
  pxRect(g, winX + Math.floor(winW / 2), winY, 2, winH, '#3B3038');
  pxRect(g, winX, winY + Math.floor(winH * 0.55), winW, 2, '#3B3038');
  for (let i = 0; i < 5; i++) {
    const ry = winY + ((Math.floor(time * 28) + i * 17) % (winH - 6));
    const rx = winX + 8 + i * 14;
    if (rx < winX + winW - 4) pxRect(g, rx, ry, 1, 4, PAL.iceLight);
  }

  // RIGHT BOOKSHELF: Colorful pixel books & floppy boxes
  if (pw > 260) {
    const shW = 68;
    const shX = pw - shW - 14;
    const shY = Math.floor(ph * 0.24);
    pxRect(g, shX, shY + 24, shW, 4, '#5A3E36');
    pxRect(g, shX, shY + 52, shW, 4, '#5A3E36');
    const bookColors = [PAL.coral, PAL.teal, PAL.gold, PAL.slateLight, PAL.coralDark, PAL.tealLight];
    for (let i = 0; i < 9; i++) {
      const bh = 13 + ((i * 5) % 8);
      pxRect(g, shX + 4 + i * 6, shY + 24 - bh, 5, bh, bookColors[i % bookColors.length]);
    }
    for (let i = 0; i < 7; i++) {
      const bh = 11 + ((i * 7) % 9);
      pxRect(g, shX + 8 + i * 7, shY + 52 - bh, 5, bh, bookColors[(i + 2) % bookColors.length]);
    }
  }

  // DESK SURFACE & WARM LAMP GLOW
  pxRect(g, 0, deskY, pw, ph - deskY, '#3F2D2B');
  pxRect(g, 0, deskY, pw, 3, '#63463E');
  pxRect(g, 0, deskY + 3, pw, 2, '#2B1F1E');

  // Warm gooseneck desk lamp on right casting dithered amber light!
  const lampX = cx + Math.min(82, Math.floor(pw * 0.28));
  pxRect(g, lampX - 8, deskY - 3, 18, 4, PAL.goldDark);
  pxLine(g, lampX + 2, deskY - 3, lampX + 8, deskY - 38, PAL.slateLight, 2);
  pxLine(g, lampX + 8, deskY - 38, lampX - 8, deskY - 46, PAL.slateLight, 2);
  // Lamp shade
  pxRect(g, lampX - 18, deskY - 48, 16, 7, PAL.coral);
  pxRect(g, lampX - 16, deskY - 41, 12, 2, PAL.goldLight);
  drawDitheredGlow(g, lampX - 10, deskY - 18, 42, PAL.gold, 'light');

  // Steaming cozy pixel coffee mug on left side of desk
  const mugX = cx - Math.min(76, Math.floor(pw * 0.26));
  pxRect(g, mugX, deskY - 12, 11, 12, PAL.cream);
  pxRect(g, mugX + 2, deskY - 10, 7, 3, PAL.coral);
  pxOutline(g, mugX + 10, deskY - 10, 4, 7, PAL.cream, 1);
  // Animated rising steam puffs
  for (let s = 0; s < 3; s++) {
    const sy = deskY - 16 - ((Math.floor(time * 12) + s * 6) % 16);
    const sx = mugX + 3 + Math.round(Math.sin(time * 4 + s * 2) * 2);
    pxRect(g, sx, sy, 2, 2, PAL.slateLight);
  }

  // HERO: Detailed 16-Bit Vintage CRT Computer Workstation
  const monW = 104;
  const monH = 74;
  const mx = cx - Math.floor(monW / 2);
  const my = deskY - monH - 18;

  // Ambient screen glow behind monitor
  drawDitheredGlow(g, cx, my + monH / 2, 68, PAL.teal, 'light');

  // Base chassis + keyboard
  pxRect(g, cx - 26, my + monH, 52, 6, PAL.slate);
  pxRect(g, mx - 8, deskY - 12, monW + 16, 12, PAL.creamDim);
  pxRect(g, mx - 6, deskY - 10, monW + 12, 8, PAL.cream);
  pxRect(g, cx + 16, deskY - 7, 26, 3, PAL.void);
  // Blinking floppy LED
  pxRect(g, cx - 38, deskY - 7, 5, 3, Math.floor(stepT * 4) % 2 === 0 ? PAL.tealLight : PAL.gold);

  // CRT outer casing with 16-bit bevel shading
  pxRect(g, mx, my, monW, monH, PAL.creamDim);
  pxRect(g, mx + 2, my + 2, monW - 5, monH - 6, PAL.cream);
  pxOutline(g, mx, my, monW, monH, PAL.void, 1);

  // CRT inner glass screen
  const sx = mx + 9;
  const sy = my + 8;
  const sw = monW - 18;
  const sh = monH - 18;
  pxRect(g, sx, sy, sw, sh, '#0F1521');
  pxOutline(g, sx - 1, sy - 1, sw + 2, sh + 2, PAL.slate, 1);

  // Power-on phosphor bloom inside CRT
  const visH = Math.max(2, Math.round(sh * bootP));
  const vy = Math.round(sy + (sh - visH) / 2);
  pxRect(g, sx + 2, vy, sw - 4, visH, '#18333A');

  if (bootP > 0.4) {
    // Glowing scan grid inside monitor
    for (let y = sy + 4; y < sy + sh - 4; y += 6) {
      pxRect(g, sx + 3, y, sw - 6, 1, '#1E4148');
    }

    // Friendly blinking AI face inside screen
    const blink = Math.floor(stepT * 2) % 8 === 0;
    const eyeY = sy + 14;
    if (blink) {
      pxRect(g, cx - 18, eyeY + 3, 10, 2, PAL.goldLight);
      pxRect(g, cx + 8, eyeY + 3, 10, 2, PAL.goldLight);
    } else {
      pxRect(g, cx - 18, eyeY, 10, 7, PAL.gold);
      pxRect(g, cx + 8, eyeY, 10, 7, PAL.gold);
      pxRect(g, cx - 16, eyeY + 1, 3, 2, PAL.cream);
      pxRect(g, cx + 10, eyeY + 1, 3, 2, PAL.cream);
    }

    // Voice-reactive chiptune soundwave bars
    const bars = 11;
    for (let i = 0; i < bars; i++) {
      const bell = 1 - Math.abs(i - 5) / 6;
      const bh = Math.max(2, Math.round((2 + energy * 12 + Math.abs(Math.sin(time * 10 + i * 0.9)) * 5) * bell));
      pxRect(g, cx - 27 + i * 5, sy + sh - 8 - bh, 3, bh, i % 2 === 0 ? PAL.tealLight : PAL.goldLight);
    }
  }
}

// ============================================================================
// SCENE 2 (2.27–8.37s): Floating Cosmic Observatory -> Surging Sunset Ocean
// ============================================================================
function drawPixelScenePrologue(
  g: CanvasRenderingContext2D,
  pw: number,
  ph: number,
  time: number,
  localTime: number,
  energy: number
): void {
  // Smooth internal morph right at 4.32s (SRT 6.633s "最波澜壮阔的篇章")!
  const waveTransition = smoothstep(4.05, 4.65, localTime);

  if (waveTransition < 0.99) {
    // WORLD 2A: Cosmic Floating Islands & Levitating Prism Astrolabe
    drawDitheredSky(g, pw, ph, [
      { stop: 0, color: '#111426' },
      { stop: 0.35, color: '#1D203C' },
      { stop: 0.68, color: '#33284A' },
      { stop: 0.88, color: '#4E3554' },
    ]);
    pxStarfield(g, pw, ph, time, 48, 0.78, -time * 6);

    // Drifting glowing nebula clouds
    const cShift = (time * 8) % (pw + 80);
    pxCloud(g, pw - cShift + 20, ph * 0.22, 18, '#4E3B63', '#2E2342');
    pxCloud(g, ((pw * 0.4 - time * 5) % (pw + 60) + pw + 60) % (pw + 60) - 30, ph * 0.68, 22, '#433158', '#261E3B');

    // Distant mountain range silhouette at bottom
    const mBase = Math.floor(ph * 0.88);
    for (let x = 0; x < pw; x++) {
      const mh = Math.floor(
        18 + Math.sin(x * 0.032 + 1.1) * 14 + Math.cos(x * 0.075) * 7
      );
      pxRect(g, x, mBase - mh, 1, ph - (mBase - mh), '#17192E');
    }

    // Two floating pixel islands with waterfalls!
    const bobL = Math.round(Math.sin(time * 2.2) * 3);
    const bobR = Math.round(Math.cos(time * 1.9 + 1) * 3);
    const islands: Array<[number, number, number]> = [
      [Math.floor(pw * 0.19), Math.floor(ph * 0.62) + bobL, 26],
      [Math.floor(pw * 0.81), Math.floor(ph * 0.56) + bobR, 22],
    ];
    for (const [ix, iy, iw] of islands) {
      // Grass cap
      pxRect(g, ix - iw, iy - 4, iw * 2, 5, PAL.teal);
      pxRect(g, ix - iw + 2, iy - 5, iw * 2 - 4, 2, PAL.tealLight);
      // Tapered rocky underside
      for (let r = 0; r < 14; r++) {
        const half = Math.max(2, Math.round(iw * (1 - r / 14)));
        pxRect(g, ix - half, iy + 1 + r, half * 2, 1, r % 3 === 0 ? PAL.navyLight : PAL.navy);
      }
      // Animated pixel waterfall ribbon streaming off the island
      const wfX = ix + Math.floor(iw * 0.35);
      pxRect(g, wfX, iy, 3, 28, PAL.ice);
      const drop = Math.floor(time * 24) % 8;
      for (let y = iy + drop; y < iy + 26; y += 8) {
        pxRect(g, wfX + 1, y, 1, 3, PAL.iceWhite);
      }
      // Tiny glowing pillar / pine on top
      pxPineTree(g, ix - Math.floor(iw * 0.35), iy - 4, 18, PAL.pine, PAL.tealDark);
    }

    // HERO CENTER: Rotating Golden Astrolabe Rings + Radiant Floating Prism
    const cx = Math.floor(pw * 0.5);
    const cy = Math.floor(ph * 0.52) + Math.round(Math.sin(time * 3) * 3);
    drawDitheredGlow(g, cx, cy, 48 + Math.round(energy * 8), PAL.teal, 'medium');

    // Orbiting rings
    pxRing(g, cx, cy, 38, PAL.goldDark);
    pxRing(g, cx, cy, 52, PAL.slate);

    // Floating faceted crystal prism
    const pr = 22;
    for (let dy = -pr; dy <= pr; dy++) {
      const half = Math.round((pr - Math.abs(dy)) * 0.72);
      pxRect(g, cx - half, cy + dy, half, 1, dy < 0 ? PAL.teal : PAL.tealDark);
      pxRect(g, cx, cy + dy, half + 1, 1, dy < 0 ? PAL.iceLight : PAL.tealLight);
    }
    pxLine(g, cx - 6, cy - 12, cx - 2, cy - 16, PAL.cream, 1);

    // 4 orbiting pixel sparks
    for (let i = 0; i < 4; i++) {
      const a = time * 1.5 + (i * Math.PI) / 2;
      const ox = cx + Math.cos(a) * 52;
      const oy = cy + Math.sin(a) * 18;
      pxSparkle(g, ox, oy, i % 2 === 0 ? 3 : 2, i % 2 === 0 ? PAL.goldLight : PAL.coralLight);
    }
  }

  // WORLD 2B: Dramatic 16-Bit Sunset Ocean Waves rising seamlessly over 2A!
  if (waveTransition > 0.01) {
    const riseOffset = Math.round((1 - easeOutExpo(waveTransition)) * ph);
    g.save();
    g.translate(0, riseOffset);

    drawDitheredSky(g, pw, ph, [
      { stop: 0, color: '#241F3A' },
      { stop: 0.24, color: '#462C47' },
      { stop: 0.45, color: '#7D414F' },
      { stop: 0.62, color: '#C46C4B' },
    ]);

    // Glowing giant dithered sunset sun
    const sunX = Math.floor(pw * 0.5);
    const sunY = Math.floor(ph * 0.5);
    drawDitheredGlow(g, sunX, sunY, 54, PAL.gold, 'medium');
    pxCircle(g, sunX, sunY, 30, PAL.gold);
    pxCircle(g, sunX, sunY, 22, PAL.goldLight);
    pxCircle(g, sunX, sunY, 14, PAL.cream);

    // Drifting golden-rimmed pixel clouds
    const clX1 = ((pw * 0.2 + time * 7) % (pw + 80)) - 40;
    const clX2 = ((pw * 0.78 + time * 5) % (pw + 80)) - 40;
    pxCloud(g, clX1, ph * 0.24, 18, PAL.coralLight, PAL.dusk);
    pxCloud(g, clX2, ph * 0.3, 15, PAL.goldLight, PAL.dusk);

    // Distant coastal rocky cliff & flashing lighthouse on the far left!
    const lhX = Math.floor(pw * 0.12);
    const lhBase = Math.floor(ph * 0.56);
    pxRect(g, lhX - 18, lhBase, 36, 20, '#222238');
    pxRect(g, lhX - 4, lhBase - 22, 8, 22, PAL.creamDim);
    pxRect(g, lhX - 4, lhBase - 16, 8, 4, PAL.coral);
    pxRect(g, lhX - 4, lhBase - 8, 8, 4, PAL.coral);
    pxRect(g, lhX - 3, lhBase - 26, 6, 4, PAL.goldLight);
    // Lighthouse rotating beam flash
    if (Math.sin(time * 5) > 0) {
      pxLine(g, lhX + 3, lhBase - 24, lhX + 52, lhBase - 34, PAL.goldLight, 1);
      pxLine(g, lhX + 3, lhBase - 24, lhX + 48, lhBase - 20, PAL.gold, 1);
    }

    // 5 Parallax Surging 16-Bit Ocean Wave Layers!
    const waveCols = ['#4C7A8C', '#346078', '#254A66', '#1A3652', '#12253B'];
    for (let l = 0; l < 5; l++) {
      const baseY = Math.floor(ph * (0.54 + l * 0.095));
      const amp = 4 + l * 2.2 + energy * 2.5;
      const speed = 2.4 + l * 0.7;
      const freq = 0.048 + l * 0.01;
      for (let x = 0; x < pw; x++) {
        const wy = Math.round(
          baseY +
            Math.sin(x * freq + time * speed + l * 1.7) * amp +
            Math.cos(x * freq * 1.9 - time * 1.8) * (amp * 0.3)
        );
        pxRect(g, x, wy, 1, ph - wy, waveCols[l]);
        // Shimmering sun reflection & foam crest
        const inSunPath = Math.abs(x - sunX) < 34 - l * 3;
        pxRect(g, x, wy, 1, 2, l === 0 || inSunPath ? PAL.goldLight : PAL.iceLight);
      }
    }

    // Detailed 16-bit Wooden Galleon riding the middle wave crest!
    const shipX = Math.floor(pw * 0.52 + Math.sin(time * 0.9) * 14);
    const shipY = Math.floor(
      ph * 0.64 + Math.sin(shipX * 0.068 + time * 3.8 + 3.4) * 6 - 7
    );
    drawSprite(
      g,
      SPRITE_SHIP_GALLEON,
      { C: PAL.cream, M: PAL.goldDark, D: PAL.amber, R: PAL.coral, B: PAL.coralDark },
      shipX,
      shipY,
      2
    );

    // Flying pixel sea spray & distant soaring birds
    for (let i = 0; i < 6; i++) {
      const bx = ((pw * 0.25 + i * 42 + time * 22) % (pw + 20)) - 10;
      const by = Math.floor(ph * 0.22 + (i % 3) * 14 + Math.sin(time * 6 + i) * 3);
      const wing = Math.floor(time * 8 + i) % 2 === 0 ? -1 : 1;
      pxRect(g, bx - 2, by + wing, 2, 1, PAL.void);
      pxRect(g, bx, by, 1, 1, PAL.void);
      pxRect(g, bx + 1, by + wing, 2, 1, PAL.void);
    }

    g.restore();
  }
}

// ============================================================================
// SCENE 3 (8.37–10.27s): Monumental RPG Title Screen — Floating AI Citadel
// ============================================================================
function drawPixelSceneTitle(
  g: CanvasRenderingContext2D,
  pw: number,
  ph: number,
  time: number,
  localTime: number,
  energy: number
): void {
  drawDitheredSky(g, pw, ph, [
    { stop: 0, color: '#0E1224' },
    { stop: 0.36, color: '#18213D' },
    { stop: 0.68, color: '#243454' },
    { stop: 0.88, color: '#344B6E' },
  ]);
  pxStarfield(g, pw, ph, time, 46, 0.72, time * 4);

  // Shimmering teal aurora ribbon across upper sky
  for (let x = 0; x < pw; x += 2) {
    const ay = Math.floor(ph * 0.22 + Math.sin(x * 0.025 + time * 1.4) * 10);
    const ah = 6 + Math.floor(Math.abs(Math.cos(x * 0.04 - time)) * 8);
    pxRect(g, x, ay, 1, ah, PAL.tealDark);
    pxRect(g, x, ay, 1, 2, PAL.teal);
  }

  // Distant layered mountain peaks
  const base = Math.floor(ph * 0.86);
  for (let x = 0; x < pw; x++) {
    const h1 = Math.floor(24 + Math.sin(x * 0.022 + 0.5) * 18 + Math.cos(x * 0.055) * 8);
    pxRect(g, x, base - h1, 1, ph - (base - h1), '#1B2742');
    const h2 = Math.floor(14 + Math.sin(x * 0.036 + 2.4) * 10);
    pxRect(g, x, base - h2 + 6, 1, ph - (base - h2 + 6), '#12192E');
  }

  // HERO: Floating Glowing AI Core Shrine Pedestal in lower-center
  const cx = Math.floor(pw * 0.5);
  const shrineY = Math.floor(ph * 0.68) + Math.round(Math.sin(time * 2.5) * 2);
  const glowP = easeOutExpo(clamp01(localTime / 0.7));

  // Ascending golden energy beam behind title
  const beamW = Math.round(28 * glowP + energy * 8);
  pxRect(g, cx - Math.floor(beamW / 2), 0, beamW, shrineY, 'rgba(74, 160, 146, 0.18)');
  pxRect(g, cx - Math.floor(beamW / 4), 0, Math.floor(beamW / 2), shrineY, 'rgba(242, 180, 75, 0.24)');

  // Floating stone dais with glowing rune strips
  pxRect(g, cx - 54, shrineY, 108, 10, PAL.slate);
  pxRect(g, cx - 48, shrineY + 2, 96, 3, PAL.gold);
  pxRect(g, cx - 36, shrineY + 10, 72, 8, PAL.navyLight);
  pxRect(g, cx - 20, shrineY + 18, 40, 6, PAL.navy);

  // Twin glowing rune obelisks flanking the dais
  for (const side of [-1, 1]) {
    const ox = cx + side * 44;
    pxRect(g, ox - 5, shrineY - 26, 10, 26, PAL.navyLight);
    pxOutline(g, ox - 5, shrineY - 26, 10, 26, PAL.void, 1);
    pxRect(g, ox - 1, shrineY - 20, 2, 14, PAL.tealLight);
    pxSparkle(g, ox, shrineY - 30, 3, PAL.goldLight);
  }

  // Central glowing AI microchip crystal floating above dais
  const coreY = shrineY - 14 + Math.round(Math.cos(time * 3.5) * 2);
  drawDitheredGlow(g, cx, coreY, 32, PAL.gold, 'medium');
  pxRect(g, cx - 12, coreY - 12, 24, 24, PAL.tealDark);
  pxOutline(g, cx - 12, coreY - 12, 24, 24, PAL.goldLight, 2);
  pxBitmapText(g, 'AI', cx, coreY, 1, PAL.cream);
}

// ============================================================================
// SCENE 4 (10.27–14.63s): Neon 16-Bit Metropolis & Sudden Hype Eruption
// ============================================================================
function drawPixelSceneHype(
  g: CanvasRenderingContext2D,
  pw: number,
  ph: number,
  time: number,
  localTime: number,
  energy: number
): void {
  drawDitheredSky(g, pw, ph, [
    { stop: 0, color: '#111528' },
    { stop: 0.42, color: '#1B223C' },
    { stop: 0.76, color: '#2B2B4B' },
  ]);
  pxStarfield(g, pw, ph, time, 28, 0.45, -time * 4);

  // 2 Parallax layers of pixel city skyscrapers with animated glowing windows!
  const scrollFar = Math.floor(time * 8);
  const scrollNear = Math.floor(time * 18);

  // Far buildings
  for (let i = -1; i < 16; i++) {
    const bx = ((i * 34 - (scrollFar % 34)) + pw + 34) % (pw + 68) - 34;
    const bh = 54 + ((Math.abs(i * 37) % 5) * 14);
    const by = ph - bh;
    pxRect(g, bx, by, 28, bh, '#1A2036');
    for (let wy = by + 6; wy < ph - 12; wy += 8) {
      for (let wx = bx + 4; wx < bx + 24; wx += 7) {
        if (((wx + wy + i) % 3) === 0) {
          pxRect(g, wx, wy, 3, 4, (wx + i) % 2 === 0 ? PAL.slateLight : PAL.tealDark);
        }
      }
    }
  }

  // Near buildings framing left & right
  for (let i = -1; i < 12; i++) {
    const bx = ((i * 46 - (scrollNear % 46)) + pw + 46) % (pw + 92) - 46;
    const bh = 34 + ((Math.abs(i * 29) % 4) * 12);
    const by = ph - bh;
    pxRect(g, bx, by, 38, bh, '#131729');
    pxRect(g, bx, by, 38, 2, PAL.slate);
    for (let wy = by + 6; wy < ph - 8; wy += 9) {
      for (let wx = bx + 5; wx < bx + 32; wx += 9) {
        if ((wx * 3 + wy) % 4 === 0) {
          pxRect(g, wx, wy, 4, 4, PAL.gold);
        }
      }
    }
  }

  // HERO CENTER: Giant Rooftop Hologram Display with Exponential Spike Chart!
  const boardW = Math.min(248, Math.floor(pw * 0.74));
  const boardH = Math.min(116, Math.floor(ph * 0.56));
  const bx = Math.floor((pw - boardW) / 2);
  const by = Math.floor(ph * 0.44 - boardH / 2);

  pxRect(g, bx - 3, by - 3, boardW + 6, boardH + 6, PAL.slate);
  pxRect(g, bx, by, boardW, boardH, '#121829');
  pxOutline(g, bx, by, boardW, boardH, PAL.teal, 2);

  // Chart grid inside billboard
  for (let x = bx + 16; x < bx + boardW; x += 20) pxRect(g, x, by + 2, 1, boardH - 4, '#1D2740');
  for (let y = by + 16; y < by + boardH; y += 18) pxRect(g, bx + 2, y, boardW - 4, 1, '#1D2740');

  // 14 animated energy bars: calm until 2024, then explosive vertical surge!
  const bars = 14;
  const pad = 12;
  const slotW = Math.floor((boardW - pad * 2) / bars);
  const barW = Math.max(4, slotW - 3);
  const baseY = by + boardH - 12;

  for (let i = 0; i < bars; i++) {
    const frac = i / (bars - 1);
    const appear = clamp01((localTime - 0.55 - frac * 1.15) / 0.35);
    const curve = frac < 0.7 ? 0.1 + frac * 0.14 : 0.25 + Math.pow((frac - 0.68) / 0.32, 1.9) * 0.78;
    const bh = Math.round(curve * (boardH - 28) * appear * (0.94 + energy * 0.12));
    const x = bx + pad + i * slotW;
    const isSpike = frac >= 0.72;
    if (bh > 0) {
      pxRect(g, x, baseY - bh, barW, bh, isSpike ? PAL.coral : PAL.tealDark);
      pxRect(g, x, baseY - bh, barW, 3, isSpike ? PAL.goldLight : PAL.tealLight);
    }
  }

  // Pixel fireworks & spark bursts erupting right when "突然爆发" hits (localTime ~ 2.1s)!
  const burstP = clamp01((localTime - 2.05) / 0.9);
  if (burstP > 0) {
    const fx = bx + boardW - 22;
    const fy = by + 16;
    drawDitheredGlow(g, fx, fy, 42 * easeOutExpo(burstP), PAL.gold, 'medium');
    const spread = easeOutExpo(burstP) * 46;
    for (let i = 0; i < 14; i++) {
      const a = (i / 14) * Math.PI * 2 + time * 0.9;
      const sx = fx + Math.cos(a) * spread;
      const sy = fy + Math.sin(a) * spread;
      pxSparkle(g, sx, sy, i % 2 === 0 ? 3 : 2, i % 3 === 0 ? PAL.goldLight : PAL.coralLight);
    }
  }
}

// ============================================================================
// SCENE 5 (14.63–15.47s): Game Boy Pocket Rewind Cassette Snap ("但其实")
// ============================================================================
function drawPixelSceneTwist(
  g: CanvasRenderingContext2D,
  pw: number,
  ph: number,
  time: number,
  localTime: number
): void {
  pxRect(g, 0, 0, pw, ph, PAL.gbLight);

  // Authentic Game Boy Pocket LCD pixel bezel frame
  pxOutline(g, 8, 8, pw - 16, ph - 16, PAL.gbMid, 3);
  pxOutline(g, 13, 13, pw - 26, ph - 26, PAL.gbDark, 1);

  // Subtle diagonal dither stripes in corners
  for (let i = 0; i < 24; i += 4) {
    pxLine(g, 14, 14 + i, 14 + i, 14, PAL.gbMid, 1);
    pxLine(g, pw - 15, ph - 15 - i, pw - 15 - i, ph - 15, PAL.gbMid, 1);
  }

  // Battery LED dot on left bezel
  pxRect(g, 20, Math.floor(ph * 0.45), 4, 4, PAL.gbInk);

  const cx = Math.floor(pw * 0.5);
  const cy = Math.floor(ph * 0.58);

  // Detailed Retro Cassette Tape spinning rapidly backward!
  const cw = 136;
  const ch = 76;
  pxRect(g, cx - cw / 2 + 4, cy - ch / 2 + 4, cw, ch, PAL.gbMid);
  pxRect(g, cx - cw / 2, cy - ch / 2, cw, ch, PAL.gbDark);
  pxOutline(g, cx - cw / 2, cy - ch / 2, cw, ch, PAL.gbInk, 2);

  // Inner cream label & window
  pxRect(g, cx - cw / 2 + 9, cy - ch / 2 + 9, cw - 18, 42, PAL.gbLight);
  pxOutline(g, cx - cw / 2 + 9, cy - ch / 2 + 9, cw - 18, 42, PAL.gbInk, 1);
  // Bottom trapezoid tape housing
  pxRect(g, cx - 36, cy + ch / 2 - 14, 72, 14, PAL.gbMid);
  pxOutline(g, cx - 36, cy + ch / 2 - 14, 72, 14, PAL.gbInk, 1);

  // Rapidly rewinding dual tape spools
  const spin = -time * 16;
  for (const offset of [-30, 30]) {
    const rx = cx + offset;
    const ry = cy - 6;
    pxCircle(g, rx, ry, 12, PAL.gbInk);
    pxCircle(g, rx, ry, 7, PAL.gbLight);
    for (let s = 0; s < 3; s++) {
      const a = spin + (s * Math.PI * 2) / 3;
      pxLine(g, rx, ry, rx + Math.cos(a) * 7, ry + Math.sin(a) * 7, PAL.gbInk, 1);
    }
  }

  // Animated "<<" rewind chevrons pulsing in center tape window
  const shift = Math.floor(localTime * 20) % 8;
  for (const dx of [-8, 4]) {
    pxLine(g, cx + dx - shift + 5, cy - 12, cx + dx - shift, cy - 6, PAL.gbInk, 2);
    pxLine(g, cx + dx - shift, cy - 6, cx + dx - shift + 5, cy, PAL.gbInk, 2);
  }
}

// ============================================================================
// SCENE 6 (15.47–20.73s): 1950–2026 Parallax Highway -> Rainy 80-Year Walk
// ============================================================================
function drawPixelSceneEighty(
  g: CanvasRenderingContext2D,
  pw: number,
  ph: number,
  time: number,
  localTime: number
): void {
  const stormBlend = smoothstep(2.3, 2.9, localTime);

  drawDitheredSky(g, pw, ph, [
    { stop: 0, color: '#111626' },
    { stop: 0.45, color: '#1B253D' },
    { stop: 0.72, color: '#273552' },
  ]);

  // Drifting dark storm clouds scrolling smoothly
  for (let i = 0; i < 4; i++) {
    const cx = (((i * 110 - time * 14) % (pw + 80)) + pw + 80) % (pw + 80) - 40;
    pxCloud(g, cx, ph * (0.16 + (i % 2) * 0.08), 20, '#364666', '#212C45');
  }

  // Distant scrolling mountain ridge
  const roadY = Math.floor(ph * 0.72);
  const mScroll = time * 12;
  for (let x = 0; x < pw; x++) {
    const mh = Math.floor(18 + Math.sin((x + mScroll) * 0.025) * 12 + Math.cos((x + mScroll) * 0.06) * 5);
    pxRect(g, x, roadY - mh, 1, mh, '#182136');
  }

  // Wet glistening historical highway bridge
  pxRect(g, 0, roadY, pw, ph - roadY, '#141A2B');
  pxRect(g, 0, roadY, pw, 3, PAL.teal);
  // Animated dashed road lane markers scrolling backward into history
  const dashShift = Math.floor(time * 48) % 24;
  for (let x = -24 + dashShift; x < pw + 24; x += 24) {
    pxRect(g, x, roadY + 12, 12, 2, PAL.slate);
  }

  // Expanding 1950 -> 2026 glowing era milestone lamps along the highway!
  const stretchP = easeOutExpo(clamp01(localTime / 1.75));
  const margin = 26;
  const fullW = pw - margin * 2;
  const curW = lerp(fullW * 0.16, fullW, stretchP);
  const rightX = pw - margin;
  const leftX = rightX - curW;

  const eras = ['1950', '1956', '1974', '1997', '2016', '2026'];
  for (let i = 0; i < eras.length; i++) {
    const frac = i / (eras.length - 1);
    const mx = Math.round(leftX + frac * curW);
    if (mx < margin - 6) continue;

    // Vintage streetlamp post at each milestone
    pxRect(g, mx, roadY - 26, 2, 26, PAL.slate);
    pxRect(g, mx - 2, roadY - 28, 6, 3, i === 5 ? PAL.coral : PAL.goldLight);
    drawDitheredGlow(g, mx + 1, roadY - 24, 14, i === 5 ? PAL.coral : PAL.gold, 'light');

    // Mini milestone relic icon above lamp during Phase A
    if (stormBlend < 0.7 && stretchP > 0.45) {
      const iy = roadY - 40;
      if (i === 0) pxCircle(g, mx, iy, 6, PAL.gold);
      else if (i === 1) pxOutline(g, mx - 6, iy - 5, 12, 10, PAL.cream, 1);
      else if (i === 2) pxSparkle(g, mx, iy, 5, PAL.iceLight);
      else if (i === 3) drawSprite(g, SPRITE_CHESS_KNIGHT, { G: PAL.gold, D: PAL.goldDark }, mx, iy, 1);
      else if (i === 4) {
        pxOutline(g, mx - 5, iy - 5, 11, 11, PAL.creamDim, 1);
        pxCircle(g, mx - 1, iy - 1, 2, PAL.tealLight);
      } else pxSparkle(g, mx, iy, 6, PAL.coralLight);
    }

    // Year stamp cleanly below road deck
    pxBitmapText(g, eras[i], mx, roadY + 24, 1, i === 5 ? PAL.goldLight : PAL.creamDim);
  }

  // HERO PHASE B (18.07–20.73s): Pixel Traveler with Red Umbrella walking through diagonal rain!
  if (stormBlend > 0.05) {
    const walkX = Math.floor(lerp(pw * 0.2, pw * 0.56, clamp01((localTime - 2.3) / 3.0)));
    const bob = Math.floor(time * 8) % 2 === 0 ? 0 : -1;
    drawSprite(
      g,
      SPRITE_TRAVELER_UMBRELLA,
      { R: PAL.coral, M: PAL.creamDim, C: PAL.cream, T: PAL.teal, D: PAL.navyDark },
      walkX,
      roadY - 11 + bob,
      2
    );

    // Diagonal 16-bit rain + puddle splash ripples on road!
    const rainCount = Math.round(52 * stormBlend);
    for (let i = 0; i < rainCount; i++) {
      const rx = (((i * 39 - time * 110) % (pw + 40)) + pw + 40) % (pw + 40) - 20;
      const ry = ((i * 29 + time * 190) % (roadY + 6));
      pxLine(g, rx, ry, rx - 4, ry + 9, i % 3 === 0 ? PAL.iceLight : PAL.slateLight, 1);
      if (ry > roadY - 6) {
        pxRect(g, rx - 3, roadY - 1, 5, 1, PAL.iceLight);
      }
    }
  }
}

// ============================================================================
// SCENE 7 (20.73–24.27s): Blazing 16-Bit Arcade Rocket Ascent ("出生即巅峰")
// ============================================================================
function drawPixelScenePeak(
  g: CanvasRenderingContext2D,
  pw: number,
  ph: number,
  time: number,
  localTime: number,
  energy: number
): void {
  // Rich warm twilight-to-stratosphere dithered sky
  drawDitheredSky(g, pw, ph, [
    { stop: 0, color: '#18142C' },
    { stop: 0.34, color: '#331F3E' },
    { stop: 0.65, color: '#692F46' },
    { stop: 0.88, color: '#A84E3B' },
  ]);
  pxStarfield(g, pw, ph, time, 34, 0.62, 0);

  // Rapidly downward-streaking speed clouds so rocket feels like it's blasting upward!
  const speedY = time * 85;
  for (let i = 0; i < 7; i++) {
    const cx = ((i * 67 + 28) % (pw - 40)) + 20;
    const cy = ((i * 43 + speedY) % (ph + 60)) - 30;
    pxCloud(g, cx, cy, 14 + (i % 3) * 5, PAL.coralLight, PAL.dusk);
  }

  // Launchpad gantry tower dropping away rapidly below during first 1.2s
  const dropTower = easeOutCubic(clamp01(localTime / 1.3)) * ph;
  const towerY = Math.floor(ph * 0.55 + dropTower);
  if (towerY < ph + 40) {
    pxRect(g, Math.floor(pw * 0.2), towerY, 16, ph, PAL.navyLight);
    for (let y = towerY; y < ph; y += 12) {
      pxLine(g, Math.floor(pw * 0.2), y, Math.floor(pw * 0.2) + 15, y + 10, PAL.slateLight, 1);
    }
  }

  // Radiant golden sun crown trophy beacon at upper-right
  const crownX = Math.floor(pw * 0.78);
  const crownY = Math.floor(ph * 0.28);
  drawDitheredGlow(g, crownX, crownY, 36 + Math.round(energy * 8), PAL.gold, 'medium');
  drawSprite(
    g,
    SPRITE_TROPHY_CROWN,
    { G: PAL.goldLight, R: PAL.coral, D: PAL.goldDark },
    crownX,
    crownY + Math.round(Math.sin(time * 4) * 2),
    3
  );

  // HERO: Multi-color 16-Bit Rocket blasting skyward!
  const climbP = easeOutExpo(clamp01(localTime / 1.6));
  const rx = Math.floor(lerp(pw * 0.26, pw * 0.48, climbP));
  const ry = Math.floor(lerp(ph * 0.78, ph * 0.48, climbP)) + Math.round(Math.sin(time * 32) * 1.2);

  // Roaring multi-frame pixel booster flame + billowing smoke puffs
  const flameH = 24 + Math.round(energy * 16 + (Math.floor(time * 24) % 8));
  pxCircle(g, rx, ry + 18, 8, PAL.goldLight);
  for (let i = 0; i < 6; i++) {
    const f = i / 6;
    const py = ry + 16 + Math.round(f * flameH);
    const pr = Math.max(2, Math.round((1 - f * 0.65) * 9));
    pxCircle(g, rx + Math.round(Math.sin(time * 20 + i) * 2), py, pr, i < 2 ? PAL.cream : i < 4 ? PAL.gold : PAL.coral);
  }

  // Trailing smoke puffs streaming down
  for (let i = 0; i < 8; i++) {
    const sy = ry + 30 + ((Math.floor(time * 90) + i * 18) % 90);
    const sx = rx + Math.round(Math.sin(i * 2.1 + time * 4) * (6 + i * 2));
    pxCircle(g, sx, sy, Math.max(2, 8 - i * 0.7), i % 2 === 0 ? PAL.creamDim : PAL.slateLight);
  }

  drawSprite(
    g,
    SPRITE_ROCKET_HERO,
    {
      R: PAL.coral,
      W: PAL.coralLight,
      C: PAL.cream,
      S: PAL.slate,
      B: PAL.iceDark,
      I: PAL.iceWhite,
      D: PAL.navyLight,
    },
    rx,
    ry,
    2
  );

  // Rising golden sparks across frame
  for (let i = 0; i < 16; i++) {
    const sx = ((i * 53) % (pw - 20)) + 10;
    const sy = ((ph - ((time * (60 + (i % 4) * 22) + i * 27) % (ph + 20))));
    pxSparkle(g, sx, sy, i % 3 === 0 ? 2 : 1, i % 2 === 0 ? PAL.goldLight : PAL.cream);
  }
}

// ============================================================================
// SCENE 8 (24.27–26.70s): Melancholy 16-Bit Blizzard Forest ("AI 寒冬")
// ============================================================================
function drawPixelSceneWinter(
  g: CanvasRenderingContext2D,
  pw: number,
  ph: number,
  time: number,
  localTime: number
): void {
  drawDitheredSky(g, pw, ph, [
    { stop: 0, color: PAL.iceDeep },
    { stop: 0.42, color: PAL.iceDark },
    { stop: 0.72, color: '#274C73' },
  ]);

  // Subtle arctic aurora glow
  for (let x = 0; x < pw; x += 3) {
    const ay = Math.floor(ph * 0.24 + Math.sin(x * 0.03 + time * 1.1) * 7);
    pxRect(g, x, ay, 2, 5, '#336C85');
  }

  // Distant snowy mountain peaks
  const groundY = Math.floor(ph * 0.74);
  for (let x = 0; x < pw; x++) {
    const mh = Math.floor(24 + Math.abs(Math.sin(x * 0.024 + 0.8)) * 22);
    pxRect(g, x, groundY - mh, 1, mh, '#1E3C5E');
    if (mh > 34) pxRect(g, x, groundY - mh, 1, 4, PAL.iceLight);
  }

  // Rolling snow drifts floor
  pxRect(g, 0, groundY, pw, ph - groundY, '#2A4A6B');
  pxRect(g, 0, groundY, pw, 4, PAL.iceWhite);
  pxRect(g, 0, groundY + 4, pw, 3, PAL.iceLight);

  // Layered frosted pixel evergreen forest framing left & right
  const cx = Math.floor(pw * 0.5);
  const trees: Array<[number, number]> = [
    [cx - 125, 48],
    [cx - 92, 62],
    [cx - 60, 42],
    [cx + 64, 46],
    [cx + 96, 64],
    [cx + 132, 44],
  ];
  for (const [tx, th] of trees) {
    if (tx > -10 && tx < pw + 10) {
      pxPineTree(g, tx, groundY + 2, th, '#18364A', '#26526B', PAL.iceWhite);
    }
  }

  // HERO: Shivering Frost-Covered Pixel Robot + Plunging Pixel Thermometer Gauge!
  const shiver = localTime < 0.7 || Math.floor(time * 6) % 5 === 0 ? Math.round(Math.sin(time * 48)) : 0;
  drawSprite(
    g,
    SPRITE_FROZEN_BOT,
    { I: PAL.iceWhite, C: PAL.iceLight, S: PAL.iceMid, B: PAL.iceDeep, D: PAL.navy },
    cx + shiver,
    groundY - 14,
    3
  );

  // Pixel thermometer on right showing temperature plunging to freezing blue!
  const thermX = Math.min(pw - 26, cx + 62);
  const thermY = Math.floor(ph * 0.42);
  const thermH = 44;
  const tempLevel = lerp(0.82, 0.14, easeOutExpo(clamp01(localTime / 1.1)));
  pxRect(g, thermX - 4, thermY, 8, thermH, PAL.navyDark);
  pxOutline(g, thermX - 4, thermY, 8, thermH, PAL.iceLight, 1);
  pxCircle(g, thermX, thermY + thermH + 3, 6, PAL.iceLight);
  const fillH = Math.max(4, Math.round((thermH - 4) * tempLevel));
  const mercuryCol = tempLevel > 0.45 ? PAL.coral : PAL.ice;
  pxRect(g, thermX - 2, thermY + thermH - fillH - 2, 4, fillH, mercuryCol);
  pxCircle(g, thermX, thermY + thermH + 3, 4, mercuryCol);

  // Hanging pixel icicles across top frame edge
  for (let x = 8; x < pw - 8; x += 18) {
    const len = 6 + ((x * 13) % 14);
    for (let r = 0; r < len; r++) {
      const iw = Math.max(1, Math.round((1 - r / len) * 6));
      pxRect(g, x - Math.floor(iw / 2), r, iw, 1, r < 3 ? PAL.iceWhite : PAL.iceLight);
    }
  }

  // 3 Depth layers of drifting pixel snowflakes!
  for (let i = 0; i < 64; i++) {
    const layer = i % 3;
    const speed = 18 + layer * 14;
    const sx = Math.floor((((i * 47 - time * (12 + layer * 10) + Math.sin(time * 2 + i) * 8) % pw) + pw) % pw);
    const sy = Math.floor((time * speed + i * 21) % (ph * 0.88));
    const sz = layer === 2 ? 2 : 1;
    pxRect(g, sx, sy, sz, sz, layer === 0 ? PAL.ice : PAL.iceWhite);
  }
}

// ============================================================================
// SCENE 9 (26.70–30.00s): Grand 16-Bit Dawn Over Connected Pixel Earth
// ============================================================================
function drawPixelSceneFinale(
  g: CanvasRenderingContext2D,
  pw: number,
  ph: number,
  time: number,
  localTime: number,
  energy: number
): void {
  // Deep celestial space warming into a radiant golden dawn horizon!
  drawDitheredSky(g, pw, ph, [
    { stop: 0, color: '#101428' },
    { stop: 0.36, color: '#1B2240' },
    { stop: 0.66, color: '#393252' },
    { stop: 0.84, color: '#7D4B4B' },
    { stop: 0.94, color: '#C87C44' },
  ]);
  pxStarfield(g, pw, ph, time, 54, 0.76, time * 3);

  const bloom = easeOutExpo(clamp01(localTime / 1.1));
  const cx = Math.floor(pw * 0.5);
  const cy = Math.floor(ph * 0.62);
  const earthR = Math.round(Math.min(pw, ph) * 0.32 * lerp(0.84, 1.0, bloom));

  // Warm radiant golden dawn sun rising just behind top rim of Earth!
  const sunY = cy - earthR + 4;
  drawDitheredGlow(g, cx, sunY, earthR * 1.45, PAL.gold, 'medium');
  pxCircle(g, cx, sunY, Math.round(14 * bloom + energy * 3), PAL.goldLight);
  pxCircle(g, cx, sunY, Math.round(8 * bloom), PAL.cream);

  // Subtle rotating golden dawn rays fanning into deep space
  for (let i = 0; i < 14; i++) {
    const a = -Math.PI + (i / 13) * Math.PI + Math.sin(time * 0.3) * 0.05;
    const len = earthR + 24 + (i % 2) * 18;
    pxLine(
      g,
      cx + Math.cos(a) * (earthR + 4),
      cy + Math.sin(a) * (earthR + 4),
      cx + Math.cos(a) * len,
      cy + Math.sin(a) * len,
      i % 2 === 0 ? PAL.gold : PAL.coralLight,
      1
    );
  }

  // HERO: Detailed Rotating 16-Bit Pixel Earth with Glowing Connected City Lights!
  pxCircle(g, cx, cy, earthR + 2, PAL.goldLight);
  pxCircle(g, cx, cy, earthR, '#255D82');

  // Rotating pixel continents
  const drift = Math.floor((time * 9) % (earthR * 2.4)) - Math.floor(earthR * 1.2);
  const continents = [
    [-26, -18, 22, 14],
    [10, -10, 26, 16],
    [-16, 10, 20, 12],
    [18, 14, 18, 10],
    [-40, 2, 16, 12],
  ];
  const r2 = (earthR - 2) * (earthR - 2);
  for (const [bx, by, bw, bh] of continents) {
    for (let dy = 0; dy < bh; dy++) {
      for (let dx = 0; dx < bw; dx++) {
        const px = cx + bx + dx + Math.round(drift * 0.35);
        const py = cy + by + dy;
        const d2 = (px - cx) * (px - cx) + (py - cy) * (py - cy);
        if (d2 <= r2) {
          pxRect(g, px, py, 1, 1, dy < 3 ? PAL.tealLight : PAL.teal);
        }
      }
    }
  }

  // Glowing golden neural network nodes & connecting arcs across the globe!
  const nodes: Array<[number, number]> = [
    [cx - 18, cy - 12],
    [cx + 16, cy - 6],
    [cx - 8, cy + 12],
    [cx + 22, cy + 14],
    [cx + 2, cy - 20],
  ];
  for (let i = 0; i < nodes.length; i++) {
    const [nx, ny] = nodes[i];
    const [mx, my] = nodes[(i + 1) % nodes.length];
    if (Math.hypot(nx - cx, ny - cy) < earthR - 4 && Math.hypot(mx - cx, my - cy) < earthR - 4) {
      pxLine(g, nx, ny, mx, my, PAL.goldLight, 1);
      pxSparkle(g, nx, ny, 2, PAL.cream);
    }
  }

  // Dual orbiting pixel satellites gliding smoothly around Earth
  for (let s = 0; s < 2; s++) {
    const a = time * (1.2 + s * 0.4) + s * Math.PI;
    const sx = cx + Math.cos(a) * (earthR + 28);
    const sy = cy + Math.sin(a) * (earthR * 0.36);
    pxSparkle(g, sx, sy, 3, s === 0 ? PAL.goldLight : PAL.iceWhite);
  }
}

// Dispatch pixel world drawing by scene ID
function drawPixelWorldById(
  g: CanvasRenderingContext2D,
  pw: number,
  ph: number,
  sceneId: SceneId,
  time: number,
  localTime: number,
  energy: number
): void {
  switch (sceneId) {
    case 'intro-signal':
      drawPixelSceneIntro(g, pw, ph, time, localTime, energy);
      break;
    case 'epic-prologue':
      drawPixelScenePrologue(g, pw, ph, time, localTime, energy);
      break;
    case 'title-drop':
      drawPixelSceneTitle(g, pw, ph, time, localTime, energy);
      break;
    case 'recent-hype':
      drawPixelSceneHype(g, pw, ph, time, localTime, energy);
      break;
    case 'plot-twist':
      drawPixelSceneTwist(g, pw, ph, time, localTime);
      break;
    case 'eighty-years':
      drawPixelSceneEighty(g, pw, ph, time, localTime);
      break;
    case 'peak-frenzy':
      drawPixelScenePeak(g, pw, ph, time, localTime, energy);
      break;
    case 'ai-winter':
      drawPixelSceneWinter(g, pw, ph, time, localTime);
      break;
    case 'golden-age':
      drawPixelSceneFinale(g, pw, ph, time, localTime, energy);
      break;
    case 'five-stages':
      drawPixelSceneFiveStages(g, pw, ph, time, localTime, energy);
      break;
    case 'stage-one-dawn':
      drawPixelSceneStageOneDawn(g, pw, ph, time, localTime, energy);
      break;
    case 'postwar-turing':
      drawPixelScenePostwarTuring(g, pw, ph, time, localTime, energy);
      break;
    case 'turing-test':
      drawPixelSceneTuringTest(g, pw, ph, time, localTime, energy);
      break;
    case 'can-machines-think':
      drawPixelSceneCanMachinesThink(g, pw, ph, time, localTime, energy);
      break;
    case 'spark-of-1956':
      drawPixelSceneSpark1956(g, pw, ph, time, localTime, energy);
      break;
    case 'dartmouth-pioneers':
      drawPixelSceneDartmouthPioneers(g, pw, ph, time, localTime, energy);
      break;
    case 'dartmouth-college':
      drawPixelSceneDartmouthCollege(g, pw, ph, time, localTime, energy);
      break;
    case 'ai-named':
      drawPixelSceneAiNamed(g, pw, ph, time, localTime, energy);
      break;
    case 'wild-optimism':
      drawPixelSceneWildOptimism(g, pw, ph, time, localTime, energy);
      break;
    case 'logic-dominion':
      drawPixelSceneLogicDominion(g, pw, ph, time, localTime, energy);
      break;
    case 'stage-two-winter':
      drawPixelSceneStageTwoWinter(g, pw, ph, time, localTime, energy);
      break;
    case 'cold-water-splash':
      drawPixelSceneColdWaterSplash(g, pw, ph, time, localTime, energy);
      break;
    case 'combinatorial-explosion':
      drawPixelSceneCombinatorialExplosion(g, pw, ph, time, localTime, energy);
      break;
    case 'mainframe-overload':
      drawPixelSceneMainframeOverload(g, pw, ph, time, localTime, energy);
      break;
    case 'overhyped-pie':
      drawPixelSceneOverhypedPie(g, pw, ph, time, localTime, energy);
      break;
    case 'funding-cuts':
      drawPixelSceneFundingCuts(g, pw, ph, time, localTime, energy);
      break;
    case 'first-ai-winter':
      drawPixelSceneFirstAiWinter(g, pw, ph, time, localTime, energy);
      break;
    case 'ember-thaw-1980s':
      drawPixelSceneEmberThaw1980s(g, pw, ph, time, localTime, energy);
      break;
    case 'expert-systems':
      drawPixelSceneExpertSystems(g, pw, ph, time, localTime, energy);
      break;
    case 'fleeting-bloom':
      drawPixelSceneFleetingBloom(g, pw, ph, time, localTime, energy);
      break;
    case 'second-ai-winter':
      drawPixelSceneSecondAiWinter(g, pw, ph, time, localTime, energy);
      break;
    case 'stage-three-data':
      drawPixelSceneStageThreeData(g, pw, ph, time, localTime, energy);
      break;
    case 'abandon-hardcode':
      drawPixelSceneAbandonHardcode(g, pw, ph, time, localTime, energy);
      break;
    case 'machine-learning-rise':
      drawPixelSceneMachineLearningRise(g, pw, ph, time, localTime, energy);
      break;
    case 'milestone-1997':
      drawPixelSceneMilestone1997(g, pw, ph, time, localTime, energy);
      break;
    case 'deep-blue-victory':
      drawPixelSceneDeepBlueVictory(g, pw, ph, time, localTime, energy);
      break;
    case 'beyond-human-peak':
      drawPixelSceneBeyondHumanPeak(g, pw, ph, time, localTime, energy);
      break;
    case 'specialist-student':
      drawPixelSceneSpecialistStudent(g, pw, ph, time, localTime, energy);
      break;
    case 'stage-four-deep-learning':
      drawPixelSceneStageFourDeepLearning(g, pw, ph, time, localTime, energy);
      break;
    case 'internet-data-deluge':
      drawPixelSceneInternetDataDeluge(g, pw, ph, time, localTime, energy);
      break;
    case 'gpu-compute-surge':
      drawPixelSceneGpuComputeSurge(g, pw, ph, time, localTime, energy);
      break;
    case 'neural-network-awakening':
      drawPixelSceneNeuralNetworkAwakening(g, pw, ph, time, localTime, energy);
      break;
    case 'alexnet-imagenet-2012':
      drawPixelSceneAlexNetImageNet(g, pw, ph, time, localTime, energy);
      break;
    case 'computer-sees-world':
      drawPixelSceneComputerSeesWorld(g, pw, ph, time, localTime, energy);
      break;
    case 'alphago-2016':
      drawPixelSceneAlphaGo2016(g, pw, ph, time, localTime, energy);
      break;
    case 'go-last-bastion':
      drawPixelSceneGoLastBastion(g, pw, ph, time, localTime, energy);
      break;
    case 'modern-ai-prelude':
      drawPixelSceneModernAiPrelude(g, pw, ph, time, localTime, energy);
      break;
    case 'stage-five-agi-dawn':
      drawPixelSceneStageFiveAgiDawn(g, pw, ph, time, localTime, energy);
      break;
    case 'transformer-llm-birth':
      drawPixelSceneTransformerLlm(g, pw, ph, time, localTime, energy);
      break;
    case 'multimodal-allrounder':
      drawPixelSceneMultimodalAi(g, pw, ph, time, localTime, energy);
      break;
    case 'humanlike-creativity':
      drawPixelSceneHumanlikeCreativity(g, pw, ph, time, localTime, energy);
      break;
    case 'spark-to-world-tree':
      drawPixelSceneSparkToWorldTree(g, pw, ph, time, localTime, energy);
      break;
    case 'civilization-revolution':
      drawPixelSceneCivilizationRevolution(g, pw, ph, time, localTime, energy);
      break;
    case 'winter-and-breakthrough':
      drawPixelSceneWinterAndBreakthrough(g, pw, ph, time, localTime, energy);
      break;
    case 'witness-and-writer-finale':
      drawPixelSceneWitnessAndWriterFinale(g, pw, ph, time, localTime, energy);
      break;
  }
}

// ============================================================================
// NECESSARY KINETIC 16-BIT KEYWORD TITLES (Crisp, Restrained, Synced to Voice)
// ============================================================================
function drawPixelSceneTypography(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  isPortrait: boolean,
  sceneId: SceneId,
  localTime: number,
  opacity = 1
): void {
  if (opacity <= 0.02) return;
  ctx.save();
  ctx.globalAlpha = opacity;

  switch (sceneId) {
    case 'intro-signal': {
      // Continuously visible from t=0 with zero jump when playback starts!
      const introT = localTime + 0.45;
      drawPixelHudTag(ctx, 'STAGE 01 · AI CHRONICLE', w * 0.5, h * (isPortrait ? 0.14 : 0.125), isPortrait ? w * 0.028 : h * 0.022, 1, {
        border: PAL.tealLight,
        textColor: PAL.tealLight,
      });
      drawPixelKineticTitle(ctx, 'AI 专题分享', w * 0.5, h * (isPortrait ? 0.22 : 0.22), isPortrait ? w * 0.105 : h * 0.088, introT, {
        startDelay: 0.0,
        stagger: 0.04,
        accentColor: PAL.gold,
        highlightIndices: [0, 1],
        maxWidth: w * 0.84,
      });
      break;
    }

    case 'epic-prologue': {
      if (localTime < 1.55) {
        drawPixelHudTag(ctx, 'PROLOGUE · 序幕', w * 0.5, h * 0.18, isPortrait ? w * 0.03 : h * 0.024, clamp01(localTime / 0.35), {
          border: PAL.gold,
          textColor: PAL.goldLight,
        });
      } else if (localTime < 4.25) {
        const bt = localTime - 1.55;
        drawPixelHudTag(ctx, '人类历史上', w * 0.5, h * (isPortrait ? 0.16 : 0.145), isPortrait ? w * 0.034 : h * 0.026, clamp01(bt / 0.32), {
          border: PAL.tealLight,
          textColor: PAL.cream,
        });
        drawPixelKineticTitle(ctx, '最魔幻', w * 0.5, h * (isPortrait ? 0.26 : 0.255), isPortrait ? w * 0.165 : h * 0.14, bt, {
          startDelay: 0.05,
          stagger: 0.075,
          accentColor: PAL.gold,
          highlightIndices: [1, 2],
        });
      } else {
        const bt = localTime - 4.25;
        drawPixelKineticTitle(ctx, '波澜壮阔', w * 0.5, h * (isPortrait ? 0.23 : 0.22), isPortrait ? w * 0.15 : h * 0.135, bt, {
          startDelay: 0.04,
          stagger: 0.055,
          color: PAL.cream,
          accentColor: PAL.gold,
          highlightIndices: [0, 1, 2, 3],
          maxWidth: w * 0.86,
        });
      }
      break;
    }

    case 'title-drop': {
      // Classic 16-bit RPG Title Screen Lockup above the AI Citadel
      drawPixelHudTag(ctx, '1950 — 2026', w * 0.5, h * (isPortrait ? 0.15 : 0.145), isPortrait ? w * 0.032 : h * 0.024, clamp01(localTime / 0.32), {
        border: PAL.gold,
        textColor: PAL.goldLight,
      });
      drawPixelKineticTitle(ctx, '人工智能', w * 0.5, h * (isPortrait ? 0.27 : 0.28), isPortrait ? w * 0.175 : h * 0.15, localTime, {
        startDelay: 0.04,
        stagger: 0.055,
        color: PAL.cream,
        accentColor: PAL.gold,
        maxWidth: w * 0.88,
      });
      drawPixelKineticTitle(ctx, '的发展史', w * 0.5, h * (isPortrait ? 0.40 : 0.445), isPortrait ? w * 0.08 : h * 0.064, localTime, {
        startDelay: 0.26,
        stagger: 0.055,
        color: PAL.goldLight,
        plaqueBg: 'rgba(18, 22, 38, 0.92)',
        plaqueBorder: PAL.gold,
      });
      break;
    }

    case 'recent-hype': {
      if (localTime < 1.05) {
        drawPixelHudTag(ctx, '说到人工智能', w * 0.5, h * 0.15, isPortrait ? w * 0.038 : h * 0.03, clamp01(localTime / 0.3), {
          border: PAL.tealLight,
        });
      } else {
        const bt = localTime - 1.05;
        drawPixelHudTag(ctx, '2024 → 2026 · 这两年', w * 0.5, h * (isPortrait ? 0.14 : 0.125), isPortrait ? w * 0.032 : h * 0.025, clamp01(bt / 0.35), {
          border: PAL.coral,
          textColor: PAL.goldLight,
        });
        if (bt > 0.72) {
          drawPixelKineticTitle(ctx, '突然爆发', w * 0.5, h * (isPortrait ? 0.24 : 0.23), isPortrait ? w * 0.145 : h * 0.125, bt - 0.72, {
            startDelay: 0.02,
            stagger: 0.055,
            color: PAL.cream,
            accentColor: PAL.coral,
            highlightIndices: [2, 3],
          });
        }
      }
      break;
    }

    case 'plot-twist': {
      // High-contrast Game Boy olive headline — smooth, immediate lock above cassette tape
      drawPixelKineticTitle(ctx, '但其实', w * 0.5, h * (isPortrait ? 0.25 : 0.24), isPortrait ? w * 0.175 : h * 0.145, localTime + 0.08, {
        startDelay: 0,
        stagger: 0.035,
        duration: 0.2,
        color: PAL.gbInk,
        accentColor: PAL.gbDark,
        shadowColor: PAL.gbMid,
        outlineColor: PAL.gbLight,
      });
      break;
    }

    case 'eighty-years': {
      if (localTime < 2.5) {
        drawPixelHudTag(ctx, '1950 ← 2026 · 拉长历史来看', w * 0.5, h * (isPortrait ? 0.17 : 0.16), isPortrait ? w * 0.032 : h * 0.026, clamp01(localTime / 0.4), {
          border: PAL.gold,
          textColor: PAL.goldLight,
        });
      } else {
        const st = localTime - 2.5;
        const numVal = Math.round(lerp(2, 80, easeOutExpo(clamp01(st / 0.65))));
        drawPixelKineticTitle(ctx, `${numVal} 年`, w * 0.5, h * (isPortrait ? 0.25 : 0.25), isPortrait ? w * 0.2 : h * 0.175, st, {
          startDelay: 0.02,
          stagger: 0.04,
          color: PAL.gold,
          accentColor: PAL.cream,
          highlightIndices: [String(numVal).length + 1],
        });
        drawPixelHudTag(ctx, '风 风 雨 雨', w * 0.5, h * (isPortrait ? 0.37 : 0.39), isPortrait ? w * 0.038 : h * 0.028, clamp01((st - 0.35) / 0.35), {
          border: PAL.iceLight,
          textColor: PAL.iceWhite,
        });
      }
      break;
    }

    case 'peak-frenzy': {
      drawPixelHudTag(ctx, 'PEAK ERA · 狂热', w * 0.5, h * (isPortrait ? 0.13 : 0.12), isPortrait ? w * 0.03 : h * 0.023, clamp01(localTime / 0.35), {
        border: PAL.coralLight,
        textColor: PAL.goldLight,
      });
      drawPixelKineticTitle(ctx, '出生即巅峰', w * 0.5, h * (isPortrait ? 0.23 : 0.225), isPortrait ? w * 0.135 : h * 0.125, localTime, {
        startDelay: 0.42,
        stagger: 0.055,
        color: PAL.cream,
        accentColor: PAL.gold,
        highlightIndices: [3, 4],
        maxWidth: w * 0.86,
      });
      break;
    }

    case 'ai-winter': {
      drawPixelHudTag(ctx, 'TEMPERATURE -40°C', w * 0.5, h * (isPortrait ? 0.14 : 0.13), isPortrait ? w * 0.028 : h * 0.022, clamp01(localTime / 0.38), {
        border: PAL.ice,
        textColor: PAL.iceLight,
      });
      drawPixelKineticTitle(ctx, 'AI 寒冬', w * 0.5, h * (isPortrait ? 0.25 : 0.25), isPortrait ? w * 0.165 : h * 0.145, localTime, {
        startDelay: 0.28,
        stagger: 0.07,
        color: PAL.iceWhite,
        accentColor: PAL.iceLight,
        highlightIndices: [0, 1],
      });
      break;
    }

    case 'golden-age': {
      drawPixelHudTag(ctx, '1950 — 2026 · 改变世界', w * 0.5, h * (isPortrait ? 0.13 : 0.12), isPortrait ? w * 0.03 : h * 0.024, clamp01(localTime / 0.45), {
        border: PAL.gold,
        textColor: PAL.goldLight,
      });
      drawPixelKineticTitle(ctx, '璀璨盛世', w * 0.5, h * (isPortrait ? 0.24 : 0.235), isPortrait ? w * 0.16 : h * 0.145, localTime, {
        startDelay: 0.45,
        stagger: 0.075,
        color: PAL.cream,
        accentColor: PAL.gold,
        highlightIndices: [0, 1],
      });
      break;
    }

    case 'five-stages': {
      const isExploreBeat = localTime >= 3.35;
      drawPixelHudTag(
        ctx,
        isExploreBeat ? 'NEXT → 第一阶段 · 一探究竟' : 'CHRONICLE MAP · 历史拆解',
        w * 0.5,
        h * (isPortrait ? 0.125 : 0.115),
        isPortrait ? w * 0.029 : h * 0.023,
        clamp01(localTime / 0.35),
        {
          border: isExploreBeat ? PAL.goldLight : PAL.tealLight,
          textColor: isExploreBeat ? PAL.goldLight : PAL.tealLight,
        }
      );
      drawPixelKineticTitle(ctx, '五个关键阶段', w * 0.5, h * (isPortrait ? 0.22 : 0.225), isPortrait ? w * 0.125 : h * 0.118, localTime, {
        startDelay: 0.42,
        stagger: 0.055,
        color: PAL.cream,
        accentColor: PAL.gold,
        highlightIndices: [0, 1],
        maxWidth: w * 0.88,
      });
      break;
    }

    case 'stage-one-dawn': {
      if (localTime < 2.12) {
        drawPixelHudTag(ctx, 'STAGE 01 · 第一阶段', w * 0.5, h * (isPortrait ? 0.13 : 0.12), isPortrait ? w * 0.03 : h * 0.024, clamp01(localTime / 0.32), {
          border: PAL.tealLight,
          textColor: PAL.tealLight,
        });
        drawPixelKineticTitle(ctx, '萌芽与诞生', w * 0.5, h * (isPortrait ? 0.23 : 0.235), isPortrait ? w * 0.14 : h * 0.13, localTime, {
          startDelay: 0.55,
          stagger: 0.06,
          color: PAL.cream,
          accentColor: PAL.gold,
          highlightIndices: [0, 1],
          maxWidth: w * 0.88,
        });
      } else {
        const qt = localTime - 2.12;
        drawPixelHudTag(ctx, 'STAGE 01 · 萌芽与诞生', w * 0.5, h * (isPortrait ? 0.105 : 0.088), isPortrait ? w * 0.029 : h * 0.023, clamp01(qt / 0.28), {
          border: PAL.gold,
          textColor: PAL.goldLight,
        });
        drawPixelKineticTitle(ctx, '机器能思考吗？', w * 0.5, h * (isPortrait ? 0.235 : 0.235), isPortrait ? w * 0.11 : h * 0.095, qt, {
          startDelay: 0.04,
          stagger: 0.05,
          color: PAL.cream,
          accentColor: PAL.goldLight,
          highlightIndices: [3, 4],
          plaqueBg: 'rgba(18, 22, 38, 0.88)',
          plaqueBorder: PAL.gold,
          maxWidth: w * 0.86,
        });
      }
      break;
    }

    case 'postwar-turing': {
      if (localTime < 2.65) {
        drawPixelHudTag(ctx, 'ORIGIN · 故事的起点', w * 0.5, h * (isPortrait ? 0.125 : 0.115), isPortrait ? w * 0.03 : h * 0.024, clamp01(localTime / 0.35), {
          border: PAL.goldDark,
          textColor: PAL.creamDim,
        });
        drawPixelKineticTitle(ctx, '二战之后', w * 0.5, h * (isPortrait ? 0.225 : 0.22), isPortrait ? w * 0.15 : h * 0.13, localTime, {
          startDelay: 0.45,
          stagger: 0.065,
          color: PAL.cream,
          accentColor: PAL.gold,
          highlightIndices: [0, 1],
        });
      } else {
        const tt = localTime - 2.65;
        drawPixelHudTag(ctx, '1950 · 计算机科学之父', w * 0.5, h * (isPortrait ? 0.125 : 0.115), isPortrait ? w * 0.03 : h * 0.024, clamp01(tt / 0.32), {
          border: PAL.gold,
          textColor: PAL.goldLight,
        });
        drawPixelKineticTitle(ctx, '阿兰·图灵', w * 0.5, h * (isPortrait ? 0.225 : 0.225), isPortrait ? w * 0.145 : h * 0.132, tt, {
          startDelay: 0.25,
          stagger: 0.06,
          color: PAL.cream,
          accentColor: PAL.gold,
          highlightIndices: [3, 4],
          maxWidth: w * 0.88,
        });
      }
      break;
    }

    case 'turing-test': {
      if (localTime < 1.85) {
        drawPixelHudTag(ctx, 'MIND JOURNAL · 1950', w * 0.5, h * (isPortrait ? 0.125 : 0.115), isPortrait ? w * 0.029 : h * 0.023, clamp01(localTime / 0.32), {
          border: PAL.coralLight,
          textColor: PAL.goldLight,
        });
        drawPixelKineticTitle(ctx, '划时代的论文', w * 0.5, h * (isPortrait ? 0.225 : 0.225), isPortrait ? w * 0.125 : h * 0.115, localTime, {
          startDelay: 0.14,
          stagger: 0.055,
          color: PAL.cream,
          accentColor: PAL.gold,
          highlightIndices: [0, 1, 2],
          maxWidth: w * 0.88,
        });
      } else {
        const bt = localTime - 1.85;
        drawPixelHudTag(ctx, 'THE IMITATION GAME', w * 0.5, h * (isPortrait ? 0.105 : 0.088), isPortrait ? w * 0.029 : h * 0.023, clamp01(bt / 0.3), {
          border: PAL.tealLight,
          textColor: PAL.tealLight,
        });
        drawPixelKineticTitle(ctx, '图灵测试', w * 0.5, h * (isPortrait ? 0.235 : 0.235), isPortrait ? w * 0.13 : h * 0.108, bt, {
          startDelay: 0.04,
          stagger: 0.06,
          color: PAL.cream,
          accentColor: PAL.goldLight,
          highlightIndices: [0, 1],
          plaqueBg: 'rgba(16, 22, 38, 0.9)',
          plaqueBorder: PAL.tealLight,
        });
      }
      break;
    }

    case 'can-machines-think': {
      if (localTime < 2.38) {
        drawPixelHudTag(ctx, 'THE ULTIMATE QUESTION', w * 0.5, h * (isPortrait ? 0.125 : 0.115), isPortrait ? w * 0.028 : h * 0.023, clamp01(localTime / 0.32), {
          border: PAL.tealLight,
          textColor: PAL.tealLight,
        });
        drawPixelKineticTitle(ctx, '振聋发聩的问题', w * 0.5, h * (isPortrait ? 0.225 : 0.225), isPortrait ? w * 0.112 : h * 0.105, localTime, {
          startDelay: 0.22,
          stagger: 0.05,
          color: PAL.cream,
          accentColor: PAL.gold,
          highlightIndices: [0, 1, 2, 3],
          maxWidth: w * 0.88,
        });
      } else {
        const qt = localTime - 2.38;
        drawPixelHudTag(ctx, 'CAN MACHINES THINK?', w * 0.5, h * (isPortrait ? 0.12 : 0.11), isPortrait ? w * 0.029 : h * 0.023, clamp01(qt / 0.25), {
          border: PAL.goldLight,
          textColor: PAL.goldLight,
        });
        drawPixelKineticTitle(ctx, '机器能思考吗？', w * 0.5, h * (isPortrait ? 0.23 : 0.23), isPortrait ? w * 0.125 : h * 0.125, qt, {
          startDelay: 0.02,
          stagger: 0.05,
          color: PAL.cream,
          accentColor: PAL.goldLight,
          highlightIndices: [3, 4],
          maxWidth: w * 0.88,
        });
      }
      break;
    }

    case 'spark-of-1956': {
      if (localTime < 1.35) {
        drawPixelHudTag(ctx, 'THE FIRST SPARK', w * 0.5, h * (isPortrait ? 0.125 : 0.115), isPortrait ? w * 0.029 : h * 0.023, clamp01(localTime / 0.3), {
          border: PAL.coralLight,
          textColor: PAL.goldLight,
        });
        drawPixelKineticTitle(ctx, '一颗火种', w * 0.5, h * (isPortrait ? 0.225 : 0.225), isPortrait ? w * 0.155 : h * 0.135, localTime, {
          startDelay: 0.12,
          stagger: 0.06,
          color: PAL.cream,
          accentColor: PAL.goldLight,
          highlightIndices: [2, 3],
        });
      } else if (localTime < 4.0) {
        const dt = localTime - 1.35;
        drawPixelHudTag(ctx, 'HUMAN IMAGINATION', w * 0.5, h * (isPortrait ? 0.125 : 0.115), isPortrait ? w * 0.029 : h * 0.023, clamp01(dt / 0.32), {
          border: PAL.gold,
          textColor: PAL.goldLight,
        });
        drawPixelKineticTitle(ctx, '点燃最初幻想', w * 0.5, h * (isPortrait ? 0.225 : 0.225), isPortrait ? w * 0.125 : h * 0.118, dt, {
          startDelay: 0.05,
          stagger: 0.055,
          color: PAL.cream,
          accentColor: PAL.gold,
          highlightIndices: [0, 1],
          maxWidth: w * 0.88,
        });
      } else {
        const yt = localTime - 4.0;
        drawPixelHudTag(ctx, 'NEXT CHAPTER · 达特茅斯序曲', w * 0.5, h * (isPortrait ? 0.105 : 0.088), isPortrait ? w * 0.029 : h * 0.023, clamp01(yt / 0.32), {
          border: PAL.goldLight,
          textColor: PAL.goldLight,
        });
        drawPixelKineticTitle(ctx, '1956 年', w * 0.5, h * (isPortrait ? 0.24 : 0.24), isPortrait ? w * 0.145 : h * 0.118, yt, {
          startDelay: 0.04,
          stagger: 0.05,
          color: PAL.goldLight,
          accentColor: PAL.cream,
          highlightIndices: [5],
          plaqueBg: 'rgba(18, 22, 38, 0.92)',
          plaqueBorder: PAL.gold,
        });
      }
      break;
    }

    case 'dartmouth-pioneers': {
      const subTag =
        localTime < 1.4
          ? '1956 · 年轻先驱集结'
          : localTime < 2.55
            ? 'PIONEER 01 · 约翰·麦卡锡'
            : localTime < 3.8
              ? 'PIONEER 02 · 马文·明斯基'
              : 'PIONEER 03 · 克劳德·香农等';
      drawPixelHudTag(ctx, subTag, w * 0.5, h * (isPortrait ? 0.115 : 0.105), isPortrait ? w * 0.029 : h * 0.023, clamp01(localTime / 0.3), {
        border: PAL.gold,
        textColor: PAL.goldLight,
      });
      const heroName =
        localTime < 1.4
          ? '年轻的科学家'
          : localTime < 2.55
            ? '约翰·麦卡锡'
            : localTime < 3.8
              ? '马文·明斯基'
              : '克劳德·香农';
      const beatT =
        localTime < 1.4
          ? localTime
          : localTime < 2.55
            ? localTime - 1.4
            : localTime < 3.8
              ? localTime - 2.55
              : localTime - 3.8;
      drawPixelKineticTitle(ctx, heroName, w * 0.5, h * (isPortrait ? 0.21 : 0.215), isPortrait ? w * 0.125 : h * 0.11, beatT, {
        startDelay: 0.02,
        stagger: 0.045,
        color: PAL.cream,
        accentColor: PAL.goldLight,
        highlightIndices: [0, 1],
        maxWidth: w * 0.88,
      });
      break;
    }

    case 'dartmouth-college': {
      const isWorkshop = localTime >= 1.75;
      drawPixelHudTag(
        ctx,
        isWorkshop ? 'SUMMER 1956 · 长达两个月' : 'DARTMOUTH COLLEGE · USA',
        w * 0.5,
        h * (isPortrait ? 0.115 : 0.105),
        isPortrait ? w * 0.028 : h * 0.023,
        clamp01(localTime / 0.32),
        {
          border: isWorkshop ? PAL.goldLight : PAL.tealLight,
          textColor: isWorkshop ? PAL.goldLight : PAL.cream,
        }
      );
      drawPixelKineticTitle(
        ctx,
        isWorkshop ? '达特茅斯会议' : '达特茅斯学院',
        w * 0.5,
        h * (isPortrait ? 0.21 : 0.215),
        isPortrait ? w * 0.125 : h * 0.112,
        isWorkshop ? localTime - 1.75 : localTime,
        {
          startDelay: 0.04,
          stagger: 0.05,
          color: PAL.cream,
          accentColor: PAL.gold,
          highlightIndices: [0, 1, 2, 3],
          maxWidth: w * 0.88,
        }
      );
      break;
    }

    case 'ai-named': {
      if (localTime < 1.42) {
        drawPixelHudTag(ctx, 'HISTORIC MOMENT · 1956', w * 0.5, h * (isPortrait ? 0.115 : 0.105), isPortrait ? w * 0.028 : h * 0.023, clamp01(localTime / 0.3), {
          border: PAL.tealLight,
          textColor: PAL.tealLight,
        });
      } else {
        const nt = localTime - 1.42;
        drawPixelHudTag(ctx, 'FIRST COINED · 第一次正式提出', w * 0.5, h * (isPortrait ? 0.105 : 0.088), isPortrait ? w * 0.028 : h * 0.022, clamp01(nt / 0.28), {
          border: PAL.goldLight,
          textColor: PAL.goldLight,
        });
        drawPixelKineticTitle(ctx, '“人工智能”', w * 0.5, h * (isPortrait ? 0.235 : 0.235), isPortrait ? w * 0.12 : h * 0.108, nt, {
          startDelay: 0.02,
          stagger: 0.05,
          color: PAL.goldLight,
          accentColor: PAL.cream,
          highlightIndices: [1, 2, 3, 4],
          plaqueBg: 'rgba(18, 30, 32, 0.92)',
          plaqueBorder: PAL.gold,
          maxWidth: w * 0.88,
        });
      }
      break;
    }

    case 'wild-optimism': {
      if (localTime < 3.2) {
        drawPixelHudTag(ctx, '1956 · 乐观得惊人', w * 0.5, h * (isPortrait ? 0.115 : 0.105), isPortrait ? w * 0.029 : h * 0.023, clamp01(localTime / 0.32), {
          border: PAL.gold,
          textColor: PAL.goldLight,
        });
        drawPixelKineticTitle(ctx, '麦卡锡的预言', w * 0.5, h * (isPortrait ? 0.215 : 0.215), isPortrait ? w * 0.12 : h * 0.112, localTime, {
          startDelay: 0.25,
          stagger: 0.05,
          color: PAL.cream,
          accentColor: PAL.goldLight,
          highlightIndices: [0, 1, 2],
          maxWidth: w * 0.88,
        });
      } else if (localTime < 6.2) {
        const rt = localTime - 3.2;
        drawPixelHudTag(ctx, 'MCCARTHY PREDICTION', w * 0.5, h * (isPortrait ? 0.115 : 0.105), isPortrait ? w * 0.028 : h * 0.022, clamp01(rt / 0.28), {
          border: PAL.tealLight,
          textColor: PAL.tealLight,
        });
        drawPixelKineticTitle(ctx, '规则 + 算力', w * 0.5, h * (isPortrait ? 0.22 : 0.22), isPortrait ? w * 0.13 : h * 0.118, rt, {
          startDelay: 0.04,
          stagger: 0.055,
          color: PAL.cream,
          accentColor: PAL.goldLight,
          highlightIndices: [0, 1, 5, 6],
          maxWidth: w * 0.88,
        });
      } else {
        const wt = localTime - 6.2;
        drawPixelHudTag(ctx, 'WITHIN DECADES · 几十年内', w * 0.5, h * (isPortrait ? 0.105 : 0.088), isPortrait ? w * 0.028 : h * 0.022, clamp01(wt / 0.3), {
          border: PAL.goldLight,
          textColor: PAL.goldLight,
        });
        drawPixelKineticTitle(ctx, '人类全部智慧', w * 0.5, h * (isPortrait ? 0.235 : 0.235), isPortrait ? w * 0.115 : h * 0.104, wt, {
          startDelay: 0.06,
          stagger: 0.05,
          color: PAL.cream,
          accentColor: PAL.goldLight,
          highlightIndices: [2, 3, 4, 5],
          plaqueBg: 'rgba(20, 18, 40, 0.9)',
          plaqueBorder: PAL.gold,
          maxWidth: w * 0.88,
        });
      }
      break;
    }

    case 'logic-dominion': {
      if (localTime < 6.25) {
        const isTheorem = localTime >= 3.55;
        drawPixelHudTag(
          ctx,
          isTheorem ? 'SYMBOLIC AI · 解数学题 · 证明定理' : 'SYMBOLIC ERA · 符号主义时期',
          w * 0.5,
          h * (isPortrait ? 0.115 : 0.105),
          isPortrait ? w * 0.028 : h * 0.022,
          clamp01(localTime / 0.32),
          {
            border: isTheorem ? PAL.goldLight : PAL.tealLight,
            textColor: isTheorem ? PAL.goldLight : PAL.tealLight,
          }
        );
        drawPixelKineticTitle(
          ctx,
          isTheorem ? '定理证明机' : '编写逻辑规则',
          w * 0.5,
          h * (isPortrait ? 0.215 : 0.215),
          isPortrait ? w * 0.125 : h * 0.112,
          isTheorem ? localTime - 3.55 : localTime,
          {
            startDelay: 0.06,
            stagger: 0.05,
            color: PAL.cream,
            accentColor: PAL.goldLight,
            highlightIndices: isTheorem ? [0, 1, 2, 3] : [2, 3, 4, 5],
            maxWidth: w * 0.88,
          }
        );
      } else {
        const ft = localTime - 6.25;
        drawPixelHudTag(ctx, 'STAGE 01 FINALE · 黄金幻想', w * 0.5, h * (isPortrait ? 0.105 : 0.088), isPortrait ? w * 0.028 : h * 0.022, clamp01(ft / 0.32), {
          border: PAL.coralLight,
          textColor: PAL.goldLight,
        });
        drawPixelKineticTitle(ctx, 'AI 统治世界？', w * 0.5, h * (isPortrait ? 0.235 : 0.235), isPortrait ? w * 0.12 : h * 0.106, ft, {
          startDelay: 0.12,
          stagger: 0.05,
          color: PAL.cream,
          accentColor: PAL.goldLight,
          highlightIndices: [0, 1, 3, 4],
          plaqueBg: 'rgba(22, 16, 36, 0.9)',
          plaqueBorder: PAL.coralLight,
          maxWidth: w * 0.88,
        });
      }
      break;
    }

    case 'stage-two-winter': {
      if (localTime < 2.05) {
        drawPixelHudTag(ctx, 'STAGE 02 · 第二阶段', w * 0.5, h * (isPortrait ? 0.115 : 0.105), isPortrait ? w * 0.03 : h * 0.024, clamp01(localTime / 0.32), {
          border: PAL.iceLight,
          textColor: PAL.iceWhite,
        });
        drawPixelKineticTitle(ctx, '幻灭与寒冬', w * 0.5, h * (isPortrait ? 0.22 : 0.22), isPortrait ? w * 0.135 : h * 0.126, localTime, {
          startDelay: 0.48,
          stagger: 0.055,
          color: PAL.cream,
          accentColor: PAL.iceLight,
          highlightIndices: [3, 4],
          maxWidth: w * 0.88,
        });
      } else {
        const ct = localTime - 2.05;
        const isReality = ct >= 1.3;
        drawPixelHudTag(
          ctx,
          isReality ? 'IDEAL vs REALITY · 强烈反差' : 'STAGE 02 · 幻灭与寒冬',
          w * 0.5,
          h * (isPortrait ? 0.115 : 0.105),
          isPortrait ? w * 0.028 : h * 0.023,
          clamp01(ct / 0.28),
          {
            border: isReality ? PAL.iceLight : PAL.gold,
            textColor: isReality ? PAL.iceWhite : PAL.goldLight,
          }
        );
        drawPixelKineticTitle(
          ctx,
          isReality ? '现实很骨感' : '理想很丰满',
          w * 0.5,
          h * (isPortrait ? 0.22 : 0.22),
          isPortrait ? w * 0.13 : h * 0.12,
          isReality ? ct - 1.3 : ct,
          {
            startDelay: 0.02,
            stagger: 0.05,
            color: PAL.cream,
            accentColor: isReality ? PAL.iceLight : PAL.goldLight,
            highlightIndices: [3, 4],
            maxWidth: w * 0.88,
          }
        );
      }
      break;
    }

    case 'cold-water-splash': {
      drawPixelHudTag(ctx, 'REALITY CHECK · 然而', w * 0.5, h * (isPortrait ? 0.105 : 0.088), isPortrait ? w * 0.028 : h * 0.022, clamp01(localTime / 0.28), {
        border: PAL.iceLight,
        textColor: PAL.iceWhite,
      });
      drawPixelKineticTitle(ctx, '泼了一盆冷水', w * 0.5, h * (isPortrait ? 0.235 : 0.235), isPortrait ? w * 0.115 : h * 0.105, localTime, {
        startDelay: 0.45,
        stagger: 0.05,
        color: PAL.iceWhite,
        accentColor: PAL.iceLight,
        highlightIndices: [4, 5],
        plaqueBg: 'rgba(14, 24, 42, 0.9)',
        plaqueBorder: PAL.iceLight,
        maxWidth: w * 0.88,
      });
      break;
    }

    case 'combinatorial-explosion': {
      if (localTime < 4.6) {
        drawPixelHudTag(ctx, '1970S · 20世纪70年代', w * 0.5, h * (isPortrait ? 0.115 : 0.105), isPortrait ? w * 0.029 : h * 0.023, clamp01(localTime / 0.32), {
          border: PAL.tealLight,
          textColor: PAL.tealLight,
        });
        drawPixelKineticTitle(ctx, '思维远比想象复杂', w * 0.5, h * (isPortrait ? 0.215 : 0.215), isPortrait ? w * 0.095 : h * 0.095, localTime, {
          startDelay: 1.5,
          stagger: 0.045,
          color: PAL.cream,
          accentColor: PAL.goldLight,
          highlightIndices: [6, 7],
          maxWidth: w * 0.9,
        });
      } else {
        const bt = localTime - 4.6;
        drawPixelHudTag(ctx, 'COMBINATORIAL EXPLOSION', w * 0.5, h * (isPortrait ? 0.115 : 0.105), isPortrait ? w * 0.028 : h * 0.022, clamp01(bt / 0.3), {
          border: PAL.coralLight,
          textColor: PAL.coralLight,
        });
        drawPixelKineticTitle(ctx, '组合爆炸的泥潭', w * 0.5, h * (isPortrait ? 0.215 : 0.215), isPortrait ? w * 0.112 : h * 0.106, bt, {
          startDelay: 2.5,
          stagger: 0.05,
          color: PAL.cream,
          accentColor: PAL.coralLight,
          highlightIndices: [0, 1, 2, 3],
          maxWidth: w * 0.88,
        });
      }
      break;
    }

    case 'mainframe-overload': {
      if (localTime < 4.55) {
        drawPixelHudTag(ctx, 'EXPONENTIAL SPIKE · 算力与内存', w * 0.5, h * (isPortrait ? 0.115 : 0.105), isPortrait ? w * 0.028 : h * 0.022, clamp01(localTime / 0.3), {
          border: PAL.gold,
          textColor: PAL.goldLight,
        });
        drawPixelKineticTitle(ctx, '指数级暴涨', w * 0.5, h * (isPortrait ? 0.215 : 0.215), isPortrait ? w * 0.13 : h * 0.12, localTime, {
          startDelay: 0.8,
          stagger: 0.055,
          color: PAL.cream,
          accentColor: PAL.coral,
          highlightIndices: [3, 4],
          maxWidth: w * 0.88,
        });
      } else {
        const ot = localTime - 4.55;
        drawPixelHudTag(ctx, 'SYSTEM OVERLOAD · 算力极限', w * 0.5, h * (isPortrait ? 0.105 : 0.088), isPortrait ? w * 0.028 : h * 0.022, clamp01(ot / 0.22), {
          border: PAL.coral,
          textColor: PAL.coralLight,
        });
        drawPixelKineticTitle(ctx, '根本扛不住！', w * 0.5, h * (isPortrait ? 0.235 : 0.235), isPortrait ? w * 0.12 : h * 0.108, ot, {
          startDelay: 0.04,
          stagger: 0.045,
          color: PAL.cream,
          accentColor: PAL.coralLight,
          highlightIndices: [2, 3, 4],
          plaqueBg: 'rgba(34, 14, 22, 0.92)',
          plaqueBorder: PAL.coral,
          maxWidth: w * 0.88,
        });
      }
      break;
    }

    case 'overhyped-pie': {
      const isEmpty = localTime >= 2.95;
      drawPixelHudTag(
        ctx,
        isEmpty ? 'ZERO COMMERCIAL OUTPUT' : 'OVERHYPED PROMISES · 过度吹嘘',
        w * 0.5,
        h * (isPortrait ? 0.115 : 0.105),
        isPortrait ? w * 0.028 : h * 0.022,
        clamp01(localTime / 0.3),
        {
          border: isEmpty ? PAL.coral : PAL.gold,
          textColor: isEmpty ? PAL.coralLight : PAL.goldLight,
        }
      );
      drawPixelKineticTitle(
        ctx,
        isEmpty ? '拿不出商业成果' : '画大饼',
        w * 0.5,
        h * (isPortrait ? 0.22 : 0.22),
        isPortrait ? (isEmpty ? w * 0.11 : w * 0.155) : isEmpty ? h * 0.105 : h * 0.14,
        isEmpty ? localTime - 2.95 : localTime,
        {
          startDelay: isEmpty ? 0.08 : 1.4,
          stagger: 0.05,
          color: PAL.cream,
          accentColor: isEmpty ? PAL.coralLight : PAL.goldLight,
          highlightIndices: [0, 1, 2],
          maxWidth: w * 0.88,
        }
      );
      break;
    }

    case 'funding-cuts': {
      drawPixelHudTag(ctx, 'US & UK GOV / MILITARY · 美英政府及军方', w * 0.5, h * (isPortrait ? 0.105 : 0.088), isPortrait ? w * 0.027 : h * 0.021, clamp01(localTime / 0.28), {
        border: PAL.coral,
        textColor: PAL.coralLight,
      });
      drawPixelKineticTitle(ctx, '大幅削减经费', w * 0.5, h * (isPortrait ? 0.235 : 0.235), isPortrait ? w * 0.118 : h * 0.106, localTime, {
        startDelay: 1.35,
        stagger: 0.05,
        color: PAL.cream,
        accentColor: PAL.coralLight,
        highlightIndices: [2, 3, 4, 5],
        plaqueBg: 'rgba(28, 16, 26, 0.92)',
        plaqueBorder: PAL.coral,
        maxWidth: w * 0.88,
      });
      break;
    }

    case 'first-ai-winter': {
      if (localTime < 3.4) {
        drawPixelHudTag(ctx, '1974 — 1980 · 人工智能史上', w * 0.5, h * (isPortrait ? 0.105 : 0.088), isPortrait ? w * 0.028 : h * 0.022, clamp01(localTime / 0.35), {
          border: PAL.iceLight,
          textColor: PAL.iceWhite,
        });
        drawPixelKineticTitle(ctx, '第一个 AI 寒冬', w * 0.5, h * (isPortrait ? 0.235 : 0.235), isPortrait ? w * 0.11 : h * 0.104, localTime, {
          startDelay: 0.35,
          stagger: 0.05,
          color: PAL.iceWhite,
          accentColor: PAL.iceLight,
          highlightIndices: [4, 5, 7, 8],
          plaqueBg: 'rgba(13, 24, 42, 0.9)',
          plaqueBorder: PAL.ice,
          maxWidth: w * 0.88,
        });
      } else if (localTime < 6.2) {
        const dt = localTime - 3.4;
        drawPixelHudTag(ctx, 'ABANDONED LABS · 门庭冷落', w * 0.5, h * (isPortrait ? 0.115 : 0.105), isPortrait ? w * 0.028 : h * 0.022, clamp01(dt / 0.3), {
          border: PAL.ice,
          textColor: PAL.iceLight,
        });
        drawPixelKineticTitle(ctx, '研究人员转行', w * 0.5, h * (isPortrait ? 0.215 : 0.215), isPortrait ? w * 0.12 : h * 0.11, dt, {
          startDelay: 0.18,
          stagger: 0.05,
          color: PAL.cream,
          accentColor: PAL.iceLight,
          highlightIndices: [4, 5],
          maxWidth: w * 0.88,
        });
      } else {
        const st = localTime - 6.2;
        drawPixelHudTag(ctx, 'A DECADE OF SILENCE · 行业停滞', w * 0.5, h * (isPortrait ? 0.115 : 0.105), isPortrait ? w * 0.028 : h * 0.022, clamp01(st / 0.3), {
          border: PAL.slateLight,
          textColor: PAL.iceLight,
        });
        drawPixelKineticTitle(ctx, '十几年的沉寂', w * 0.5, h * (isPortrait ? 0.215 : 0.215), isPortrait ? w * 0.12 : h * 0.112, st, {
          startDelay: 0.15,
          stagger: 0.055,
          color: PAL.iceWhite,
          accentColor: PAL.ice,
          highlightIndices: [4, 5],
          maxWidth: w * 0.88,
        });
      }
      break;
    }

    case 'ember-thaw-1980s': {
      drawPixelHudTag(ctx, '1980S · 80年代初', w * 0.5, h * (isPortrait ? 0.115 : 0.105), isPortrait ? w * 0.029 : h * 0.023, clamp01(localTime / 0.32), {
        border: PAL.gold,
        textColor: PAL.goldLight,
      });
      drawPixelKineticTitle(ctx, '火种并未熄灭', w * 0.5, h * (isPortrait ? 0.22 : 0.22), isPortrait ? w * 0.125 : h * 0.115, localTime, {
        startDelay: 0.2,
        stagger: 0.055,
        color: PAL.cream,
        accentColor: PAL.goldLight,
        highlightIndices: [0, 1],
        maxWidth: w * 0.88,
      });
      break;
    }

    case 'expert-systems': {
      if (localTime < 9.4) {
        const isRules = localTime >= 3.55;
        drawPixelHudTag(
          ctx,
          isRules ? 'KNOWLEDGE BASE · 写入规则库' : 'EXPERT SYSTEMS · 短暂回暖',
          w * 0.5,
          h * (isPortrait ? 0.105 : 0.088),
          isPortrait ? w * 0.028 : h * 0.022,
          clamp01(localTime / 0.3),
          {
            border: PAL.tealLight,
            textColor: PAL.tealLight,
          }
        );
        drawPixelKineticTitle(
          ctx,
          isRules ? '模仿专家决策' : '专家系统',
          w * 0.5,
          h * (isPortrait ? 0.235 : 0.235),
          isPortrait ? w * 0.12 : h * 0.108,
          isRules ? localTime - 3.55 : localTime,
          {
            startDelay: 0.06,
            stagger: 0.055,
            color: PAL.cream,
            accentColor: PAL.goldLight,
            highlightIndices: isRules ? [2, 3, 4, 5] : [0, 1],
            plaqueBg: 'rgba(18, 30, 42, 0.9)',
            plaqueBorder: PAL.tealLight,
            maxWidth: w * 0.88,
          }
        );
      } else {
        const vt = localTime - 9.4;
        drawPixelHudTag(ctx, 'FIRST COMMERCIAL VALUE · 首次落地', w * 0.5, h * (isPortrait ? 0.105 : 0.088), isPortrait ? w * 0.028 : h * 0.022, clamp01(vt / 0.28), {
          border: PAL.goldLight,
          textColor: PAL.goldLight,
        });
        drawPixelKineticTitle(ctx, '商业落地价值', w * 0.5, h * (isPortrait ? 0.235 : 0.235), isPortrait ? w * 0.12 : h * 0.108, vt, {
          startDelay: 0.08,
          stagger: 0.05,
          color: PAL.cream,
          accentColor: PAL.goldLight,
          highlightIndices: [0, 1, 2, 3],
          plaqueBg: 'rgba(22, 28, 38, 0.9)',
          plaqueBorder: PAL.gold,
          maxWidth: w * 0.88,
        });
      }
      break;
    }

    case 'fleeting-bloom': {
      drawPixelHudTag(ctx, 'FLEETING BLOOM · 短暂回暖', w * 0.5, h * (isPortrait ? 0.115 : 0.105), isPortrait ? w * 0.028 : h * 0.022, clamp01(localTime / 0.28), {
        border: PAL.gold,
        textColor: PAL.goldLight,
      });
      drawPixelKineticTitle(ctx, '昙花一现', w * 0.5, h * (isPortrait ? 0.22 : 0.22), isPortrait ? w * 0.145 : h * 0.132, localTime, {
        startDelay: 0.08,
        stagger: 0.055,
        color: PAL.cream,
        accentColor: PAL.goldLight,
        highlightIndices: [0, 1],
      });
      break;
    }

    case 'second-ai-winter': {
      if (localTime < 2.2) {
        drawPixelHudTag(ctx, 'HIGH MAINTENANCE COST', w * 0.5, h * (isPortrait ? 0.115 : 0.105), isPortrait ? w * 0.028 : h * 0.022, clamp01(localTime / 0.25), {
          border: PAL.coral,
          textColor: PAL.coralLight,
        });
        drawPixelKineticTitle(ctx, '维护成本太高', w * 0.5, h * (isPortrait ? 0.22 : 0.22), isPortrait ? w * 0.12 : h * 0.11, localTime, {
          startDelay: 0.04,
          stagger: 0.045,
          color: PAL.cream,
          accentColor: PAL.coralLight,
          highlightIndices: [4, 5],
          maxWidth: w * 0.88,
        });
      } else {
        const wt = localTime - 2.2;
        drawPixelHudTag(ctx, 'STAGE 02 FINALE · 1987—1993', w * 0.5, h * (isPortrait ? 0.105 : 0.088), isPortrait ? w * 0.028 : h * 0.022, clamp01(wt / 0.25), {
          border: PAL.iceLight,
          textColor: PAL.iceWhite,
        });
        drawPixelKineticTitle(ctx, '第二个寒冬', w * 0.5, h * (isPortrait ? 0.235 : 0.235), isPortrait ? w * 0.125 : h * 0.112, wt, {
          startDelay: 0.02,
          stagger: 0.045,
          color: PAL.iceWhite,
          accentColor: PAL.iceLight,
          highlightIndices: [3, 4],
          plaqueBg: 'rgba(12, 22, 42, 0.92)',
          plaqueBorder: PAL.iceLight,
          maxWidth: w * 0.88,
        });
      }
      break;
    }

    case 'stage-three-data': {
      if (localTime < 3.2) {
        drawPixelHudTag(ctx, 'STAGE 03 · 第三阶段', w * 0.5, h * (isPortrait ? 0.115 : 0.105), isPortrait ? w * 0.03 : h * 0.024, clamp01(localTime / 0.32), {
          border: PAL.tealLight,
          textColor: PAL.tealLight,
        });
        drawPixelKineticTitle(ctx, '统计学崛起', w * 0.5, h * (isPortrait ? 0.22 : 0.22), isPortrait ? w * 0.135 : h * 0.124, localTime, {
          startDelay: 0.55,
          stagger: 0.055,
          color: PAL.cream,
          accentColor: PAL.goldLight,
          highlightIndices: [3, 4],
          maxWidth: w * 0.88,
        });
      } else {
        const dt = localTime - 3.2;
        drawPixelHudTag(ctx, 'CHANGE APPROACH · 换个思路', w * 0.5, h * (isPortrait ? 0.105 : 0.088), isPortrait ? w * 0.028 : h * 0.022, clamp01(dt / 0.28), {
          border: PAL.goldLight,
          textColor: PAL.goldLight,
        });
        drawPixelKineticTitle(ctx, '拥抱数据', w * 0.5, h * (isPortrait ? 0.235 : 0.235), isPortrait ? w * 0.138 : h * 0.124, dt, {
          startDelay: 0.32,
          stagger: 0.055,
          color: PAL.cream,
          accentColor: PAL.tealLight,
          highlightIndices: [2, 3],
          plaqueBg: 'rgba(12, 28, 42, 0.92)',
          plaqueBorder: PAL.tealLight,
          maxWidth: w * 0.88,
        });
      }
      break;
    }

    case 'abandon-hardcode': {
      if (localTime < 5.4) {
        drawPixelHudTag(ctx, 'AFTER TWO WINTERS · 痛定思痛', w * 0.5, h * (isPortrait ? 0.115 : 0.105), isPortrait ? w * 0.028 : h * 0.022, clamp01(localTime / 0.32), {
          border: PAL.coralLight,
          textColor: PAL.coralLight,
        });
        drawPixelKineticTitle(ctx, '硬编码行不通', w * 0.5, h * (isPortrait ? 0.215 : 0.215), isPortrait ? w * 0.118 : h * 0.108, localTime, {
          startDelay: 2.2,
          stagger: 0.05,
          color: PAL.cream,
          accentColor: PAL.coralLight,
          highlightIndices: [3, 4, 5],
          maxWidth: w * 0.88,
        });
      } else {
        const lt = localTime - 5.4;
        drawPixelHudTag(ctx, 'NEW PARADIGM · 换个思路', w * 0.5, h * (isPortrait ? 0.105 : 0.088), isPortrait ? w * 0.028 : h * 0.022, clamp01(lt / 0.28), {
          border: PAL.tealLight,
          textColor: PAL.tealLight,
        });
        drawPixelKineticTitle(ctx, '从数据中学习', w * 0.5, h * (isPortrait ? 0.235 : 0.235), isPortrait ? w * 0.118 : h * 0.108, lt, {
          startDelay: 0.2,
          stagger: 0.05,
          color: PAL.cream,
          accentColor: PAL.goldLight,
          highlightIndices: [1, 2, 4, 5],
          plaqueBg: 'rgba(14, 26, 40, 0.92)',
          plaqueBorder: PAL.gold,
          maxWidth: w * 0.88,
        });
      }
      break;
    }

    case 'machine-learning-rise': {
      if (localTime < 4.2) {
        drawPixelHudTag(ctx, 'STATISTICS & ML · 大行其道', w * 0.5, h * (isPortrait ? 0.115 : 0.105), isPortrait ? w * 0.028 : h * 0.022, clamp01(localTime / 0.32), {
          border: PAL.tealLight,
          textColor: PAL.tealLight,
        });
        drawPixelKineticTitle(ctx, '机器学习崛起', w * 0.5, h * (isPortrait ? 0.215 : 0.215), isPortrait ? w * 0.118 : h * 0.108, localTime, {
          startDelay: 0.72,
          stagger: 0.05,
          color: PAL.cream,
          accentColor: PAL.tealLight,
          highlightIndices: [0, 1, 2, 3],
          maxWidth: w * 0.88,
        });
      } else if (localTime < 8.35) {
        const et = localTime - 4.2;
        drawPixelHudTag(ctx, 'THOUSANDS OF EXAMPLES · 数据驱动', w * 0.5, h * (isPortrait ? 0.115 : 0.105), isPortrait ? w * 0.028 : h * 0.022, clamp01(et / 0.28), {
          border: PAL.gold,
          textColor: PAL.goldLight,
        });
        drawPixelKineticTitle(ctx, '成千上万例子', w * 0.5, h * (isPortrait ? 0.215 : 0.215), isPortrait ? w * 0.118 : h * 0.108, et, {
          startDelay: 1.4,
          stagger: 0.048,
          color: PAL.cream,
          accentColor: PAL.goldLight,
          highlightIndices: [0, 1, 2, 3],
          maxWidth: w * 0.88,
        });
      } else {
        const pt = localTime - 8.35;
        drawPixelHudTag(ctx, 'PATTERN DISCOVERY · 自主归纳', w * 0.5, h * (isPortrait ? 0.105 : 0.088), isPortrait ? w * 0.028 : h * 0.022, clamp01(pt / 0.25), {
          border: PAL.goldLight,
          textColor: PAL.goldLight,
        });
        drawPixelKineticTitle(ctx, '自己寻找规律', w * 0.5, h * (isPortrait ? 0.235 : 0.235), isPortrait ? w * 0.118 : h * 0.108, pt, {
          startDelay: 0.06,
          stagger: 0.045,
          color: PAL.cream,
          accentColor: PAL.goldLight,
          highlightIndices: [4, 5],
          plaqueBg: 'rgba(13, 24, 38, 0.92)',
          plaqueBorder: PAL.gold,
          maxWidth: w * 0.88,
        });
      }
      break;
    }

    case 'milestone-1997': {
      if (localTime < 2.85) {
        drawPixelHudTag(ctx, 'HISTORIC MILESTONE · 时代节点', w * 0.5, h * (isPortrait ? 0.115 : 0.105), isPortrait ? w * 0.028 : h * 0.022, clamp01(localTime / 0.3), {
          border: PAL.gold,
          textColor: PAL.goldLight,
        });
        drawPixelKineticTitle(ctx, '标志性事件', w * 0.5, h * (isPortrait ? 0.22 : 0.22), isPortrait ? w * 0.13 : h * 0.12, localTime, {
          startDelay: 0.12,
          stagger: 0.055,
          color: PAL.cream,
          accentColor: PAL.goldLight,
          highlightIndices: [0, 1, 2],
          maxWidth: w * 0.88,
        });
      } else {
        const yt = localTime - 2.85;
        drawPixelHudTag(ctx, 'MAY 1997 · NEW YORK', w * 0.5, h * (isPortrait ? 0.105 : 0.088), isPortrait ? w * 0.028 : h * 0.022, clamp01(yt / 0.22), {
          border: PAL.goldLight,
          textColor: PAL.goldLight,
        });
        drawPixelKineticTitle(ctx, '1997 年', w * 0.5, h * (isPortrait ? 0.235 : 0.235), isPortrait ? w * 0.145 : h * 0.122, yt, {
          startDelay: 0.02,
          stagger: 0.045,
          color: PAL.goldLight,
          accentColor: PAL.cream,
          highlightIndices: [5],
          plaqueBg: 'rgba(16, 18, 36, 0.92)',
          plaqueBorder: PAL.gold,
        });
      }
      break;
    }

    case 'deep-blue-victory': {
      if (localTime < 2.33) {
        drawPixelHudTag(ctx, '1997 · IBM SUPERCOMPUTER', w * 0.5, h * (isPortrait ? 0.115 : 0.105), isPortrait ? w * 0.028 : h * 0.022, clamp01(localTime / 0.28), {
          border: PAL.iceLight,
          textColor: PAL.iceWhite,
        });
        drawPixelKineticTitle(ctx, '深蓝 DEEP BLUE', w * 0.5, h * (isPortrait ? 0.11 : 0.215), isPortrait ? w * 0.095 : h * 0.104, localTime, {
          startDelay: 0.22,
          stagger: 0.038,
          color: PAL.cream,
          accentColor: PAL.iceLight,
          highlightIndices: [0, 1],
          maxWidth: w * 0.9,
        });
      } else {
        const vt = localTime - 2.33;
        drawPixelHudTag(ctx, 'CHECKMATE · 击败卡斯帕罗夫', w * 0.5, h * (isPortrait ? 0.105 : 0.088), isPortrait ? w * 0.028 : h * 0.022, clamp01(vt / 0.25), {
          border: PAL.goldLight,
          textColor: PAL.goldLight,
        });
        drawPixelKineticTitle(ctx, '击败世界冠军', w * 0.5, h * (isPortrait ? 0.235 : 0.235), isPortrait ? w * 0.118 : h * 0.108, vt, {
          startDelay: 0.12,
          stagger: 0.048,
          color: PAL.cream,
          accentColor: PAL.goldLight,
          highlightIndices: [2, 3, 4, 5],
          plaqueBg: 'rgba(12, 20, 42, 0.92)',
          plaqueBorder: PAL.gold,
          maxWidth: w * 0.88,
        });
      }
      break;
    }

    case 'beyond-human-peak': {
      if (localTime < 3.7) {
        drawPixelHudTag(ctx, 'WORLD ANNOUNCEMENT · 向全世界宣告', w * 0.5, h * (isPortrait ? 0.115 : 0.102), isPortrait ? w * 0.026 : h * 0.022, clamp01(localTime / 0.28), {
          border: PAL.goldLight,
          textColor: PAL.goldLight,
        });
        drawPixelKineticTitle(ctx, '不止是棋局胜利', w * 0.5, h * (isPortrait ? 0.215 : 0.215), isPortrait ? w * 0.108 : h * 0.102, localTime, {
          startDelay: 0.2,
          stagger: 0.042,
          color: PAL.cream,
          accentColor: PAL.goldLight,
          highlightIndices: [5, 6],
          maxWidth: w * 0.9,
        });
      } else if (localTime < 6.45) {
        const ct = localTime - 3.7;
        drawPixelHudTag(ctx, 'SPECIFIC DOMAINS · 在特定领域', w * 0.5, h * (isPortrait ? 0.115 : 0.102), isPortrait ? w * 0.027 : h * 0.022, clamp01(ct / 0.24), {
          border: PAL.iceLight,
          textColor: PAL.iceWhite,
        });
        drawPixelKineticTitle(ctx, '计算与搜索能力', w * 0.5, h * (isPortrait ? 0.215 : 0.215), isPortrait ? w * 0.108 : h * 0.102, ct, {
          startDelay: 0.05,
          stagger: 0.042,
          color: PAL.cream,
          accentColor: PAL.iceLight,
          highlightIndices: [0, 1, 3, 4],
          maxWidth: w * 0.9,
        });
      } else {
        const pt = localTime - 6.45;
        drawPixelHudTag(ctx, 'NEW BENCHMARK · 历史里程碑', w * 0.5, h * (isPortrait ? 0.105 : 0.088), isPortrait ? w * 0.028 : h * 0.022, clamp01(pt / 0.24), {
          border: PAL.goldLight,
          textColor: PAL.goldLight,
        });
        drawPixelKineticTitle(ctx, '超越人类巅峰', w * 0.5, h * (isPortrait ? 0.235 : 0.235), isPortrait ? w * 0.118 : h * 0.108, pt, {
          startDelay: 0.06,
          stagger: 0.045,
          color: PAL.cream,
          accentColor: PAL.goldLight,
          highlightIndices: [0, 1, 4, 5],
          plaqueBg: 'rgba(11, 22, 48, 0.92)',
          plaqueBorder: PAL.gold,
          maxWidth: w * 0.88,
        });
      }
      break;
    }

    case 'specialist-student': {
      if (localTime < 1.15) {
        drawPixelHudTag(ctx, 'HOWEVER · 现实局限', w * 0.5, h * (isPortrait ? 0.115 : 0.102), isPortrait ? w * 0.028 : h * 0.022, clamp01(localTime / 0.22), {
          border: PAL.coralLight,
          textColor: PAL.coralLight,
        });
        drawPixelKineticTitle(ctx, '但此时的 AI', w * 0.5, h * (isPortrait ? 0.215 : 0.215), isPortrait ? w * 0.12 : h * 0.11, localTime, {
          startDelay: 0.12,
          stagger: 0.04,
          color: PAL.cream,
          accentColor: PAL.coralLight,
          highlightIndices: [5, 6],
          maxWidth: w * 0.88,
        });
      } else {
        const st = localTime - 1.15;
        drawPixelHudTag(ctx, 'NARROW AI · 刻板计算', w * 0.5, h * (isPortrait ? 0.105 : 0.088), isPortrait ? w * 0.028 : h * 0.022, clamp01(st / 0.25), {
          border: PAL.coralLight,
          textColor: PAL.coralLight,
        });
        drawPixelKineticTitle(ctx, '仍是“偏科生”', w * 0.5, h * (isPortrait ? 0.235 : 0.235), isPortrait ? w * 0.118 : h * 0.108, st, {
          startDelay: 0.05,
          stagger: 0.045,
          color: PAL.cream,
          accentColor: PAL.coralLight,
          highlightIndices: [3, 4, 5],
          plaqueBg: 'rgba(26, 28, 46, 0.92)',
          plaqueBorder: PAL.coral,
          maxWidth: w * 0.88,
        });
      }
      break;
    }

    case 'stage-four-deep-learning': {
      if (localTime < 1.95) {
        drawPixelHudTag(ctx, 'STAGE 04 · 第四阶段', w * 0.5, h * (isPortrait ? 0.115 : 0.102), isPortrait ? w * 0.03 : h * 0.024, clamp01(localTime / 0.3), {
          border: PAL.tealLight,
          textColor: PAL.tealLight,
        });
        drawPixelKineticTitle(ctx, '深度学习革命', w * 0.5, h * (isPortrait ? 0.215 : 0.215), isPortrait ? w * 0.12 : h * 0.112, localTime, {
          startDelay: 0.35,
          stagger: 0.05,
          color: PAL.cream,
          accentColor: PAL.goldLight,
          highlightIndices: [0, 1, 4, 5],
          maxWidth: w * 0.88,
        });
      } else {
        const tt = localTime - 1.95;
        drawPixelHudTag(ctx, 'BIG DATA + GPU + NEURAL NET', w * 0.5, h * (isPortrait ? 0.105 : 0.088), isPortrait ? w * 0.026 : h * 0.022, clamp01(tt / 0.25), {
          border: PAL.goldLight,
          textColor: PAL.goldLight,
        });
        drawPixelKineticTitle(ctx, '数据 · 算力 · 神经', w * 0.5, h * (isPortrait ? 0.235 : 0.235), isPortrait ? w * 0.095 : h * 0.096, tt, {
          startDelay: 0.06,
          stagger: 0.042,
          color: PAL.cream,
          accentColor: PAL.tealLight,
          highlightIndices: [0, 1, 5, 6, 10, 11],
          plaqueBg: 'rgba(18, 16, 44, 0.92)',
          plaqueBorder: PAL.tealLight,
          maxWidth: w * 0.9,
        });
      }
      break;
    }

    case 'internet-data-deluge': {
      if (localTime < 2.38) {
        drawPixelHudTag(ctx, 'TURNING POINT · 历史转折点', w * 0.5, h * (isPortrait ? 0.115 : 0.102), isPortrait ? w * 0.028 : h * 0.022, clamp01(localTime / 0.28), {
          border: PAL.iceLight,
          textColor: PAL.iceWhite,
        });
        drawPixelKineticTitle(ctx, '2010 年代初', w * 0.5, h * (isPortrait ? 0.215 : 0.215), isPortrait ? w * 0.12 : h * 0.112, localTime, {
          startDelay: 0.22,
          stagger: 0.045,
          color: PAL.goldLight,
          accentColor: PAL.cream,
          highlightIndices: [5, 6, 7],
          maxWidth: w * 0.88,
        });
      } else {
        const dt = localTime - 2.38;
        drawPixelHudTag(ctx, 'INTERNET BOOM · 互联网爆发', w * 0.5, h * (isPortrait ? 0.105 : 0.088), isPortrait ? w * 0.028 : h * 0.022, clamp01(dt / 0.25), {
          border: PAL.tealLight,
          textColor: PAL.tealLight,
        });
        drawPixelKineticTitle(ctx, '海量数据爆发', w * 0.5, h * (isPortrait ? 0.235 : 0.235), isPortrait ? w * 0.118 : h * 0.108, dt, {
          startDelay: 0.06,
          stagger: 0.045,
          color: PAL.cream,
          accentColor: PAL.tealLight,
          highlightIndices: [0, 1, 2, 3],
          plaqueBg: 'rgba(10, 26, 48, 0.92)',
          plaqueBorder: PAL.tealLight,
          maxWidth: w * 0.88,
        });
      }
      break;
    }

    case 'gpu-compute-surge': {
      drawPixelHudTag(ctx, 'PARALLEL COMPUTE · 飞速发展', w * 0.5, h * (isPortrait ? 0.105 : 0.088), isPortrait ? w * 0.028 : h * 0.022, clamp01(localTime / 0.28), {
        border: PAL.goldLight,
        textColor: PAL.goldLight,
      });
      drawPixelKineticTitle(ctx, 'GPU 强大算力', w * 0.5, h * (isPortrait ? 0.235 : 0.235), isPortrait ? w * 0.115 : h * 0.108, localTime, {
        startDelay: 0.45,
        stagger: 0.045,
        color: PAL.cream,
        accentColor: PAL.goldLight,
        highlightIndices: [0, 1, 2, 6, 7],
        plaqueBg: 'rgba(16, 20, 36, 0.92)',
        plaqueBorder: PAL.gold,
        maxWidth: w * 0.88,
      });
      break;
    }

    case 'neural-network-awakening': {
      if (localTime < 4.1) {
        drawPixelHudTag(ctx, 'BRAIN-INSPIRED · 模仿大脑神经元', w * 0.5, h * (isPortrait ? 0.115 : 0.102), isPortrait ? w * 0.026 : h * 0.022, clamp01(localTime / 0.3), {
          border: PAL.tealLight,
          textColor: PAL.tealLight,
        });
        drawPixelKineticTitle(ctx, '沉寂多年 · 深度学习', w * 0.5, h * (isPortrait ? 0.095 : 0.215), isPortrait ? w * 0.095 : h * 0.098, localTime, {
          startDelay: 0.25,
          stagger: 0.04,
          color: PAL.cream,
          accentColor: PAL.tealLight,
          highlightIndices: [7, 8, 9, 10],
          maxWidth: w * 0.9,
        });
      } else if (localTime < 5.55) {
        const nt = localTime - 4.1;
        drawPixelHudTag(ctx, 'ARTIFICIAL NEURAL NETWORK', w * 0.5, h * (isPortrait ? 0.115 : 0.102), isPortrait ? w * 0.026 : h * 0.022, clamp01(nt / 0.22), {
          border: PAL.coralLight,
          textColor: PAL.coralLight,
        });
        drawPixelKineticTitle(ctx, '人工神经网络', w * 0.5, h * (isPortrait ? 0.215 : 0.215), isPortrait ? w * 0.118 : h * 0.108, nt, {
          startDelay: 0.04,
          stagger: 0.045,
          color: PAL.cream,
          accentColor: PAL.coralLight,
          highlightIndices: [2, 3, 4, 5],
          maxWidth: w * 0.88,
        });
      } else {
        const bt = localTime - 5.55;
        drawPixelHudTag(ctx, 'DEEP LEARNING REVOLUTION · 全面觉醒', w * 0.5, h * (isPortrait ? 0.105 : 0.088), isPortrait ? w * 0.025 : h * 0.022, clamp01(bt / 0.2), {
          border: PAL.goldLight,
          textColor: PAL.goldLight,
        });
        drawPixelKineticTitle(ctx, '迎来了爆发！', w * 0.5, h * (isPortrait ? 0.235 : 0.235), isPortrait ? w * 0.125 : h * 0.114, bt, {
          startDelay: 0.04,
          stagger: 0.045,
          color: PAL.cream,
          accentColor: PAL.goldLight,
          highlightIndices: [3, 4, 5],
          plaqueBg: 'rgba(20, 16, 44, 0.92)',
          plaqueBorder: PAL.goldLight,
          maxWidth: w * 0.88,
        });
      }
      break;
    }

    case 'alexnet-imagenet-2012': {
      // Cue 121 (0–0.93s) "2012年" | Cue 122 (0.93–2.63s) "深度学习模型 AlexNet" | Cue 123 (2.63–5.70s) "在 ImageNet 图像识别大赛中一战成名"
      if (localTime < 0.93) {
        drawPixelHudTag(ctx, 'STAGE 04 · COMPUTER VISION BREAKTHROUGH', w * 0.5, h * (isPortrait ? 0.105 : 0.088), isPortrait ? w * 0.024 : h * 0.022, clamp01(localTime / 0.22), {
          border: PAL.tealLight,
          textColor: PAL.tealLight,
        });
        drawPixelKineticTitle(ctx, '2012 年', w * 0.5, h * (isPortrait ? 0.23 : 0.23), isPortrait ? w * 0.132 : h * 0.12, localTime, {
          startDelay: 0.04,
          stagger: 0.045,
          color: PAL.goldLight,
          accentColor: PAL.cream,
          highlightIndices: [4],
          maxWidth: w * 0.86,
        });
      } else if (localTime < 2.63) {
        const at = localTime - 0.93;
        drawPixelHudTag(ctx, '2012 · DEEP CNN MODEL', w * 0.5, h * (isPortrait ? 0.105 : 0.088), isPortrait ? w * 0.025 : h * 0.022, clamp01(at / 0.2), {
          border: PAL.tealLight,
          textColor: PAL.tealLight,
        });
        drawPixelKineticTitle(ctx, 'AlexNet 模型', w * 0.5, h * (isPortrait ? 0.22 : 0.22), isPortrait ? w * 0.114 : h * 0.104, at, {
          startDelay: 0.04,
          stagger: 0.04,
          color: PAL.cream,
          accentColor: PAL.tealLight,
          highlightIndices: [0, 1, 2, 3, 4, 5, 6],
          maxWidth: w * 0.88,
        });
      } else {
        const it = localTime - 2.63;
        drawPixelHudTag(ctx, 'IMAGENET 2012 · 图像识别大赛', w * 0.5, h * (isPortrait ? 0.105 : 0.088), isPortrait ? w * 0.025 : h * 0.022, clamp01(it / 0.22), {
          border: PAL.goldLight,
          textColor: PAL.goldLight,
        });
        drawPixelKineticTitle(ctx, 'ImageNet 一战成名', w * 0.5, h * (isPortrait ? 0.22 : 0.225), isPortrait ? w * 0.102 : h * 0.096, it, {
          startDelay: 0.05,
          stagger: 0.036,
          color: PAL.cream,
          accentColor: PAL.goldLight,
          highlightIndices: [9, 10, 11, 12],
          plaqueBg: 'rgba(14, 24, 46, 0.9)',
          plaqueBorder: PAL.goldLight,
          maxWidth: w * 0.9,
        });
      }
      break;
    }

    case 'computer-sees-world': {
      // Cue 124 (0–2.10s) "错误率远远甩开传统算法" | Cue 125 (2.10–4.57s) "计算机终于“看清”了这个世界"
      if (localTime < 2.10) {
        drawPixelHudTag(ctx, 'ERROR RATE PLUMMETS · 断崖领先', w * 0.5, h * (isPortrait ? 0.105 : 0.088), isPortrait ? w * 0.025 : h * 0.022, clamp01(localTime / 0.22), {
          border: PAL.coralLight,
          textColor: PAL.coralLight,
        });
        drawPixelKineticTitle(ctx, '甩开传统算法', w * 0.5, h * (isPortrait ? 0.22 : 0.22), isPortrait ? w * 0.114 : h * 0.104, localTime, {
          startDelay: 0.05,
          stagger: 0.045,
          color: PAL.cream,
          accentColor: PAL.tealLight,
          highlightIndices: [0, 1],
          maxWidth: w * 0.88,
        });
      } else {
        const st = localTime - 2.10;
        drawPixelHudTag(ctx, 'COMPUTER VISION AWAKENS', w * 0.5, h * (isPortrait ? 0.105 : 0.088), isPortrait ? w * 0.025 : h * 0.022, clamp01(st / 0.2), {
          border: PAL.goldLight,
          textColor: PAL.goldLight,
        });
        drawPixelKineticTitle(ctx, '“看清”了这个世界', w * 0.5, h * (isPortrait ? 0.225 : 0.225), isPortrait ? w * 0.106 : h * 0.098, st, {
          startDelay: 0.05,
          stagger: 0.04,
          color: PAL.cream,
          accentColor: PAL.goldLight,
          highlightIndices: [1, 2],
          plaqueBg: 'rgba(16, 28, 52, 0.9)',
          plaqueBorder: PAL.tealLight,
          maxWidth: w * 0.9,
        });
      }
      break;
    }

    case 'alphago-2016': {
      // Cue 126 (0–0.93s) "2016年" | Cue 127 (0.93–2.50s) "DeepMind 的 AlphaGo" | Cue 128 (2.50–5.57s) "以 4:1 击败了围棋世界冠军李世石"
      if (localTime < 0.93) {
        drawPixelHudTag(ctx, 'HISTORIC MATCH · SEOUL', w * 0.5, h * (isPortrait ? 0.105 : 0.088), isPortrait ? w * 0.025 : h * 0.022, clamp01(localTime / 0.22), {
          border: PAL.goldLight,
          textColor: PAL.goldLight,
        });
        drawPixelKineticTitle(ctx, '2016 年', w * 0.5, h * (isPortrait ? 0.23 : 0.23), isPortrait ? w * 0.132 : h * 0.12, localTime, {
          startDelay: 0.04,
          stagger: 0.045,
          color: PAL.goldLight,
          accentColor: PAL.cream,
          highlightIndices: [4],
          maxWidth: w * 0.86,
        });
      } else if (localTime < 2.50) {
        const gt = localTime - 0.93;
        drawPixelHudTag(ctx, 'DEEPMIND · 围棋人工智能', w * 0.5, h * (isPortrait ? 0.105 : 0.088), isPortrait ? w * 0.025 : h * 0.022, clamp01(gt / 0.2), {
          border: PAL.tealLight,
          textColor: PAL.tealLight,
        });
        drawPixelKineticTitle(ctx, 'AlphaGo 登场', w * 0.5, h * (isPortrait ? 0.22 : 0.22), isPortrait ? w * 0.114 : h * 0.104, gt, {
          startDelay: 0.04,
          stagger: 0.04,
          color: PAL.cream,
          accentColor: PAL.tealLight,
          highlightIndices: [0, 1, 2, 3, 4, 5, 6],
          maxWidth: w * 0.88,
        });
      } else {
        const wt = localTime - 2.50;
        drawPixelHudTag(ctx, 'ALPHAGO VS LEE SEDOL · 4:1', w * 0.5, h * (isPortrait ? 0.105 : 0.088), isPortrait ? w * 0.025 : h * 0.022, clamp01(wt / 0.22), {
          border: PAL.goldLight,
          textColor: PAL.goldLight,
        });
        drawPixelKineticTitle(ctx, '4:1 击败李世石', w * 0.5, h * (isPortrait ? 0.225 : 0.225), isPortrait ? w * 0.11 : h * 0.102, wt, {
          startDelay: 0.05,
          stagger: 0.04,
          color: PAL.cream,
          accentColor: PAL.goldLight,
          highlightIndices: [0, 1, 2],
          plaqueBg: 'rgba(20, 22, 40, 0.92)',
          plaqueBorder: PAL.goldLight,
          maxWidth: w * 0.9,
        });
      }
      break;
    }

    case 'go-last-bastion': {
      // Cue 129 (0–1.57s) "围棋由于变化莫测" | Cue 130 (1.57–4.20s) "曾被视为人类智力防线的最后堡垒"
      if (localTime < 1.57) {
        drawPixelHudTag(ctx, '10^170 POSSIBILITIES · 棋局星海', w * 0.5, h * (isPortrait ? 0.105 : 0.088), isPortrait ? w * 0.024 : h * 0.022, clamp01(localTime / 0.22), {
          border: PAL.tealLight,
          textColor: PAL.tealLight,
        });
        drawPixelKineticTitle(ctx, '围棋 · 变化莫测', w * 0.5, h * (isPortrait ? 0.22 : 0.22), isPortrait ? w * 0.112 : h * 0.102, localTime, {
          startDelay: 0.05,
          stagger: 0.045,
          color: PAL.cream,
          accentColor: PAL.tealLight,
          highlightIndices: [4, 5, 6, 7],
          maxWidth: w * 0.88,
        });
      } else {
        const bt = localTime - 1.57;
        drawPixelHudTag(ctx, 'THE LAST BASTION OF HUMAN INTELLECT', w * 0.5, h * (isPortrait ? 0.105 : 0.088), isPortrait ? w * 0.023 : h * 0.021, clamp01(bt / 0.2), {
          border: PAL.coralLight,
          textColor: PAL.coralLight,
        });
        drawPixelKineticTitle(ctx, '人类智力最后堡垒', w * 0.5, h * (isPortrait ? 0.22 : 0.225), isPortrait ? w * 0.104 : h * 0.096, bt, {
          startDelay: 0.05,
          stagger: 0.04,
          color: PAL.cream,
          accentColor: PAL.coralLight,
          highlightIndices: [4, 5, 6, 7],
          plaqueBg: 'rgba(18, 18, 42, 0.9)',
          plaqueBorder: PAL.coralLight,
          maxWidth: w * 0.9,
        });
      }
      break;
    }

    case 'modern-ai-prelude': {
      // Cue 131 (0–2.70s) "而 AlphaGo 的胜利彻底震撼了全球" | Cue 132 (2.70–5.97s) "也正式拉开了现代 AI 狂飙突进的序幕"
      if (localTime < 2.70) {
        drawPixelHudTag(ctx, 'GLOBAL SHOCKWAVE · 震撼全球', w * 0.5, h * (isPortrait ? 0.105 : 0.088), isPortrait ? w * 0.025 : h * 0.022, clamp01(localTime / 0.22), {
          border: PAL.goldLight,
          textColor: PAL.goldLight,
        });
        drawPixelKineticTitle(ctx, '彻底震撼了全球', w * 0.5, h * (isPortrait ? 0.22 : 0.22), isPortrait ? w * 0.112 : h * 0.102, localTime, {
          startDelay: 0.05,
          stagger: 0.045,
          color: PAL.cream,
          accentColor: PAL.goldLight,
          highlightIndices: [2, 3, 5, 6],
          maxWidth: w * 0.88,
        });
      } else {
        const pt = localTime - 2.70;
        drawPixelHudTag(ctx, 'MODERN AI ACCELERATION · 狂飙突进', w * 0.5, h * (isPortrait ? 0.105 : 0.088), isPortrait ? w * 0.024 : h * 0.022, clamp01(pt / 0.22), {
          border: PAL.coralLight,
          textColor: PAL.coralLight,
        });
        drawPixelKineticTitle(ctx, '现代 AI 狂飙序幕', w * 0.5, h * (isPortrait ? 0.225 : 0.225), isPortrait ? w * 0.106 : h * 0.098, pt, {
          startDelay: 0.05,
          stagger: 0.04,
          color: PAL.cream,
          accentColor: PAL.goldLight,
          highlightIndices: [3, 4, 6, 7],
          plaqueBg: 'rgba(16, 20, 44, 0.92)',
          plaqueBorder: PAL.goldLight,
          maxWidth: w * 0.9,
        });
      }
      break;
    }

    case 'stage-five-agi-dawn': {
      // Cue 133 (0–1.00s) "第五阶段" | Cue 134 (1.00–3.80s) "大模型与通用人工智能曙光" | Cue 135 (3.80–5.47s) "我们正身处其中"
      // Cue 136 (5.47–7.00s) "时间来到最近几年" | Cue 137 (7.00–10.93s) "AI 的发展速度已经用“日新月异”都嫌慢来形容了"
      if (localTime < 1.0) {
        drawPixelHudTag(ctx, 'STAGE 05 · FINAL CHAPTER', w * 0.5, h * (isPortrait ? 0.105 : 0.088), isPortrait ? w * 0.025 : h * 0.022, clamp01(localTime / 0.22), {
          border: PAL.goldLight,
          textColor: PAL.goldLight,
        });
        drawPixelKineticTitle(ctx, '第五阶段', w * 0.5, h * (isPortrait ? 0.225 : 0.225), isPortrait ? w * 0.13 : h * 0.118, localTime, {
          startDelay: 0.04,
          stagger: 0.05,
          color: PAL.goldLight,
          accentColor: PAL.cream,
          highlightIndices: [1],
          maxWidth: w * 0.86,
        });
      } else if (localTime < 3.80) {
        const dt = localTime - 1.0;
        drawPixelHudTag(ctx, 'STAGE 05 · LLM & AGI DAWN', w * 0.5, h * (isPortrait ? 0.105 : 0.088), isPortrait ? w * 0.025 : h * 0.022, clamp01(dt / 0.22), {
          border: PAL.goldLight,
          textColor: PAL.goldLight,
        });
        drawPixelKineticTitle(ctx, '大模型与 AGI 曙光', w * 0.5, h * (isPortrait ? 0.22 : 0.225), isPortrait ? w * 0.104 : h * 0.096, dt, {
          startDelay: 0.05,
          stagger: 0.04,
          color: PAL.cream,
          accentColor: PAL.goldLight,
          highlightIndices: [0, 1, 2, 5, 6, 7],
          plaqueBg: 'rgba(18, 22, 48, 0.92)',
          plaqueBorder: PAL.goldLight,
          maxWidth: w * 0.9,
        });
      } else if (localTime < 5.47) {
        const wt = localTime - 3.80;
        drawPixelHudTag(ctx, 'WE ARE LIVING IN THIS ERA', w * 0.5, h * (isPortrait ? 0.105 : 0.088), isPortrait ? w * 0.024 : h * 0.022, clamp01(wt / 0.2), {
          border: PAL.tealLight,
          textColor: PAL.tealLight,
        });
        drawPixelKineticTitle(ctx, '我们正身处其中', w * 0.5, h * (isPortrait ? 0.22 : 0.22), isPortrait ? w * 0.112 : h * 0.102, wt, {
          startDelay: 0.04,
          stagger: 0.045,
          color: PAL.cream,
          accentColor: PAL.tealLight,
          highlightIndices: [3, 4, 5, 6],
          maxWidth: w * 0.88,
        });
      } else if (localTime < 7.0) {
        const rt = localTime - 5.47;
        drawPixelHudTag(ctx, 'RECENT YEARS · HYPER EVOLUTION', w * 0.5, h * (isPortrait ? 0.105 : 0.088), isPortrait ? w * 0.024 : h * 0.022, clamp01(rt / 0.2), {
          border: PAL.goldLight,
          textColor: PAL.goldLight,
        });
        drawPixelKineticTitle(ctx, '时间来到最近几年', w * 0.5, h * (isPortrait ? 0.22 : 0.22), isPortrait ? w * 0.106 : h * 0.096, rt, {
          startDelay: 0.04,
          stagger: 0.04,
          color: PAL.cream,
          accentColor: PAL.goldLight,
          highlightIndices: [4, 5, 6, 7],
          maxWidth: w * 0.88,
        });
      } else {
        const ft = localTime - 7.0;
        drawPixelHudTag(ctx, 'HYPER-SPEED EVOLUTION · 狂飙时代', w * 0.5, h * (isPortrait ? 0.105 : 0.088), isPortrait ? w * 0.024 : h * 0.022, clamp01(ft / 0.22), {
          border: PAL.goldLight,
          textColor: PAL.goldLight,
        });
        drawPixelKineticTitle(ctx, '“日新月异”都嫌慢', w * 0.5, h * (isPortrait ? 0.225 : 0.228), isPortrait ? w * 0.104 : h * 0.098, ft, {
          startDelay: 0.05,
          stagger: 0.04,
          color: PAL.cream,
          accentColor: PAL.goldLight,
          highlightIndices: [1, 2, 3, 4],
          plaqueBg: 'rgba(20, 22, 50, 0.92)',
          plaqueBorder: PAL.goldLight,
          maxWidth: w * 0.9,
        });
      }
      break;
    }

    case 'transformer-llm-birth': {
      // Cue 138 (0–1.97s) "从 Transformer 架构的诞生" | Cue 139 (1.97–5.57s) "到以 ChatGPT 为代表的大语言模型橫空出世"
      if (localTime < 1.97) {
        drawPixelHudTag(ctx, '2017 · ATTENTION IS ALL YOU NEED', w * 0.5, h * (isPortrait ? 0.105 : 0.088), isPortrait ? w * 0.023 : h * 0.021, clamp01(localTime / 0.22), {
          border: PAL.tealLight,
          textColor: PAL.tealLight,
        });
        drawPixelKineticTitle(ctx, 'Transformer 诞生', w * 0.5, h * (isPortrait ? 0.22 : 0.22), isPortrait ? w * 0.098 : h * 0.092, localTime, {
          startDelay: 0.05,
          stagger: 0.032,
          color: PAL.cream,
          accentColor: PAL.tealLight,
          highlightIndices: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
          maxWidth: w * 0.9,
        });
      } else {
        const ct = localTime - 1.97;
        drawPixelHudTag(ctx, 'LARGE LANGUAGE MODEL · 横空出世', w * 0.5, h * (isPortrait ? 0.105 : 0.088), isPortrait ? w * 0.024 : h * 0.022, clamp01(ct / 0.22), {
          border: PAL.goldLight,
          textColor: PAL.goldLight,
        });
        drawPixelKineticTitle(ctx, 'ChatGPT 横空出世', w * 0.5, h * (isPortrait ? 0.22 : 0.225), isPortrait ? w * 0.102 : h * 0.096, ct, {
          startDelay: 0.05,
          stagger: 0.036,
          color: PAL.cream,
          accentColor: PAL.goldLight,
          highlightIndices: [0, 1, 2, 3, 4, 5, 6],
          plaqueBg: 'rgba(12, 30, 42, 0.92)',
          plaqueBorder: PAL.goldLight,
          maxWidth: w * 0.9,
        });
      }
      break;
    }

    case 'multimodal-allrounder': {
      // Cue 140 (0–4.67s) "再到如今的文本、图像、视频、音频多模态全能 AI"
      drawPixelHudTag(ctx, 'TEXT · IMAGE · VIDEO · AUDIO', w * 0.5, h * (isPortrait ? 0.105 : 0.088), isPortrait ? w * 0.024 : h * 0.022, clamp01(localTime / 0.22), {
        border: PAL.goldLight,
        textColor: PAL.goldLight,
      });
      drawPixelKineticTitle(ctx, '多模态全能 AI', w * 0.5, h * (isPortrait ? 0.22 : 0.225), isPortrait ? w * 0.112 : h * 0.104, localTime, {
        startDelay: 0.06,
        stagger: 0.045,
        color: PAL.cream,
        accentColor: PAL.goldLight,
        highlightIndices: [3, 4, 6, 7],
        plaqueBg: 'rgba(16, 22, 48, 0.92)',
        plaqueBorder: PAL.tealLight,
        maxWidth: w * 0.88,
      });
      break;
    }

    case 'humanlike-creativity': {
      // Cue 141 (0–2.27s) "不再只会做单选题" | Cue 142 (2.27–5.10s) "语言理解" | Cue 143 (5.10–5.83s) "逻辑推理" | Cue 144 (5.83–8.73s) "艺术创作甚至是情感共鸣"
      if (localTime < 2.27) {
        drawPixelHudTag(ctx, 'BREAKING OUT OF THE BOX', w * 0.5, h * (isPortrait ? 0.105 : 0.088), isPortrait ? w * 0.024 : h * 0.022, clamp01(localTime / 0.22), {
          border: PAL.coralLight,
          textColor: PAL.coralLight,
        });
        drawPixelKineticTitle(ctx, '不再只会做单选题', w * 0.5, h * (isPortrait ? 0.22 : 0.22), isPortrait ? w * 0.102 : h * 0.094, localTime, {
          startDelay: 0.05,
          stagger: 0.04,
          color: PAL.cream,
          accentColor: PAL.coralLight,
          highlightIndices: [5, 6, 7],
          maxWidth: w * 0.9,
        });
      } else if (localTime < 5.10) {
        const lt = localTime - 2.27;
        drawPixelHudTag(ctx, 'HUMAN-LIKE UNDERSTANDING', w * 0.5, h * (isPortrait ? 0.105 : 0.088), isPortrait ? w * 0.024 : h * 0.022, clamp01(lt / 0.2), {
          border: PAL.tealLight,
          textColor: PAL.tealLight,
        });
        drawPixelKineticTitle(ctx, '语言理解', w * 0.5, h * (isPortrait ? 0.225 : 0.225), isPortrait ? w * 0.128 : h * 0.116, lt, {
          startDelay: 0.04,
          stagger: 0.05,
          color: PAL.cream,
          accentColor: PAL.tealLight,
          highlightIndices: [0, 1, 2, 3],
          maxWidth: w * 0.86,
        });
      } else if (localTime < 5.83) {
        const rt = localTime - 5.10;
        drawPixelHudTag(ctx, 'DEEP REASONING', w * 0.5, h * (isPortrait ? 0.105 : 0.088), isPortrait ? w * 0.024 : h * 0.022, clamp01(rt / 0.15), {
          border: PAL.goldLight,
          textColor: PAL.goldLight,
        });
        drawPixelKineticTitle(ctx, '逻辑推理', w * 0.5, h * (isPortrait ? 0.225 : 0.225), isPortrait ? w * 0.128 : h * 0.116, rt, {
          startDelay: 0.02,
          stagger: 0.04,
          color: PAL.goldLight,
          accentColor: PAL.cream,
          highlightIndices: [2, 3],
          maxWidth: w * 0.86,
        });
      } else {
        const et = localTime - 5.83;
        drawPixelHudTag(ctx, 'ARTISTIC CREATION & EMPATHY', w * 0.5, h * (isPortrait ? 0.105 : 0.088), isPortrait ? w * 0.024 : h * 0.022, clamp01(et / 0.22), {
          border: PAL.coralLight,
          textColor: PAL.coralLight,
        });
        drawPixelKineticTitle(ctx, '艺术创作 · 情感共鸣', w * 0.5, h * (isPortrait ? 0.22 : 0.225), isPortrait ? w * 0.098 : h * 0.092, et, {
          startDelay: 0.04,
          stagger: 0.036,
          color: PAL.cream,
          accentColor: PAL.coralLight,
          highlightIndices: [7, 8, 9, 10],
          plaqueBg: 'rgba(26, 20, 50, 0.92)',
          plaqueBorder: PAL.coralLight,
          maxWidth: w * 0.92,
        });
      }
      break;
    }

    case 'spark-to-world-tree': {
      // Cue 145 (0–2.13s) "从达特茅斯会议的星星之火" | Cue 146 (2.13–5.13s) "到今天赋能千行百业的参天大树" | Cue 147 (5.13–6.80s) "AI 用了近八十年"
      if (localTime < 2.13) {
        drawPixelHudTag(ctx, '1956 DARTMOUTH · THE FIRST SPARK', w * 0.5, h * (isPortrait ? 0.105 : 0.088), isPortrait ? w * 0.023 : h * 0.021, clamp01(localTime / 0.22), {
          border: PAL.goldLight,
          textColor: PAL.goldLight,
        });
        drawPixelKineticTitle(ctx, '达特茅斯 · 星星之火', w * 0.5, h * (isPortrait ? 0.22 : 0.22), isPortrait ? w * 0.098 : h * 0.092, localTime, {
          startDelay: 0.05,
          stagger: 0.038,
          color: PAL.cream,
          accentColor: PAL.goldLight,
          highlightIndices: [7, 8, 9, 10],
          maxWidth: w * 0.9,
        });
      } else if (localTime < 5.13) {
        const trT = localTime - 2.13;
        drawPixelHudTag(ctx, 'EMPOWERING EVERY INDUSTRY', w * 0.5, h * (isPortrait ? 0.105 : 0.088), isPortrait ? w * 0.024 : h * 0.022, clamp01(trT / 0.22), {
          border: PAL.tealLight,
          textColor: PAL.tealLight,
        });
        drawPixelKineticTitle(ctx, '赋能千行百业 · 参天大树', w * 0.5, h * (isPortrait ? 0.22 : 0.225), isPortrait ? w * 0.09 : h * 0.084, trT, {
          startDelay: 0.05,
          stagger: 0.034,
          color: PAL.cream,
          accentColor: PAL.tealLight,
          highlightIndices: [9, 10, 11, 12],
          plaqueBg: 'rgba(12, 30, 44, 0.92)',
          plaqueBorder: PAL.tealLight,
          maxWidth: w * 0.92,
        });
      } else {
        const yrT = localTime - 5.13;
        drawPixelHudTag(ctx, '1950 — 2026 · EIGHT DECADES', w * 0.5, h * (isPortrait ? 0.105 : 0.088), isPortrait ? w * 0.024 : h * 0.022, clamp01(yrT / 0.2), {
          border: PAL.goldLight,
          textColor: PAL.goldLight,
        });
        drawPixelKineticTitle(ctx, 'AI 用了近八十年', w * 0.5, h * (isPortrait ? 0.225 : 0.225), isPortrait ? w * 0.11 : h * 0.102, yrT, {
          startDelay: 0.04,
          stagger: 0.042,
          color: PAL.cream,
          accentColor: PAL.goldLight,
          highlightIndices: [6, 7, 8],
          plaqueBg: 'rgba(14, 26, 42, 0.92)',
          plaqueBorder: PAL.goldLight,
          maxWidth: w * 0.88,
        });
      }
      break;
    }

    case 'civilization-revolution': {
      // Cue 148 (0–1.47s) "它不仅是一项技术" | Cue 149 (1.47–4.83s) "更是一次深刻重塑人类文明的工业革命"
      if (localTime < 1.47) {
        drawPixelHudTag(ctx, 'MORE THAN TECHNOLOGY', w * 0.5, h * (isPortrait ? 0.105 : 0.088), isPortrait ? w * 0.024 : h * 0.022, clamp01(localTime / 0.2), {
          border: PAL.tealLight,
          textColor: PAL.tealLight,
        });
        drawPixelKineticTitle(ctx, '不仅是一项技术', w * 0.5, h * (isPortrait ? 0.22 : 0.22), isPortrait ? w * 0.112 : h * 0.102, localTime, {
          startDelay: 0.04,
          stagger: 0.042,
          color: PAL.cream,
          accentColor: PAL.tealLight,
          highlightIndices: [5, 6],
          maxWidth: w * 0.88,
        });
      } else {
        const revT = localTime - 1.47;
        drawPixelHudTag(ctx, 'INDUSTRIAL REVOLUTION 4.0 · 文明跃迁', w * 0.5, h * (isPortrait ? 0.105 : 0.088), isPortrait ? w * 0.023 : h * 0.021, clamp01(revT / 0.22), {
          border: PAL.goldLight,
          textColor: PAL.goldLight,
        });
        drawPixelKineticTitle(ctx, '重塑人类文明的工业革命', w * 0.5, h * (isPortrait ? 0.22 : 0.225), isPortrait ? w * 0.092 : h * 0.086, revT, {
          startDelay: 0.05,
          stagger: 0.034,
          color: PAL.cream,
          accentColor: PAL.goldLight,
          highlightIndices: [7, 8, 9, 10],
          plaqueBg: 'rgba(20, 20, 48, 0.92)',
          plaqueBorder: PAL.goldLight,
          maxWidth: w * 0.92,
        });
      }
      break;
    }

    case 'winter-and-breakthrough': {
      // Cue 150 (0–2.10s) "回顾这段历史" | Cue 151 (2.10–4.60s) "每一次寒冬都是技术的沉淀" | Cue 152 (4.60–7.43s) "每一次爆发都是底层逻辑的革新"
      if (localTime < 2.10) {
        drawPixelHudTag(ctx, 'LOOKING BACK AT 80 YEARS', w * 0.5, h * (isPortrait ? 0.105 : 0.088), isPortrait ? w * 0.024 : h * 0.022, clamp01(localTime / 0.22), {
          border: PAL.tealLight,
          textColor: PAL.tealLight,
        });
        drawPixelKineticTitle(ctx, '回顾这段历史', w * 0.5, h * (isPortrait ? 0.22 : 0.22), isPortrait ? w * 0.116 : h * 0.106, localTime, {
          startDelay: 0.05,
          stagger: 0.045,
          color: PAL.cream,
          accentColor: PAL.tealLight,
          highlightIndices: [4, 5],
          maxWidth: w * 0.88,
        });
      } else if (localTime < 4.60) {
        const wt = localTime - 2.10;
        drawPixelHudTag(ctx, 'WINTERS BUILD DEEP ROOTS', w * 0.5, h * (isPortrait ? 0.105 : 0.088), isPortrait ? w * 0.024 : h * 0.022, clamp01(wt / 0.22), {
          border: PAL.iceLight,
          textColor: PAL.iceLight,
        });
        drawPixelKineticTitle(ctx, '寒冬 · 技术的沉淀', w * 0.5, h * (isPortrait ? 0.22 : 0.225), isPortrait ? w * 0.106 : h * 0.098, wt, {
          startDelay: 0.05,
          stagger: 0.04,
          color: PAL.cream,
          accentColor: PAL.iceLight,
          highlightIndices: [0, 1, 8, 9],
          plaqueBg: 'rgba(12, 24, 48, 0.92)',
          plaqueBorder: PAL.iceLight,
          maxWidth: w * 0.9,
        });
      } else {
        const st = localTime - 4.60;
        drawPixelHudTag(ctx, 'PARADIGM SHIFT · 底层革新', w * 0.5, h * (isPortrait ? 0.105 : 0.088), isPortrait ? w * 0.024 : h * 0.022, clamp01(st / 0.22), {
          border: PAL.goldLight,
          textColor: PAL.goldLight,
        });
        drawPixelKineticTitle(ctx, '爆发 · 底层逻辑革新', w * 0.5, h * (isPortrait ? 0.22 : 0.225), isPortrait ? w * 0.102 : h * 0.094, st, {
          startDelay: 0.05,
          stagger: 0.038,
          color: PAL.cream,
          accentColor: PAL.goldLight,
          highlightIndices: [0, 1, 9, 10],
          plaqueBg: 'rgba(18, 22, 48, 0.92)',
          plaqueBorder: PAL.goldLight,
          maxWidth: w * 0.92,
        });
      }
      break;
    }

    case 'witness-and-writer-finale': {
      // Cue 153 (0–1.17s) "而今天" | Cue 154 (1.17–3.87s) "我们每个人既是这段历史的见证者" | Cue 155 (3.87–5.50s) "也是未来的书写者"
      if (localTime < 1.17) {
        drawPixelHudTag(ctx, 'FINALE · HERE & NOW', w * 0.5, h * (isPortrait ? 0.105 : 0.088), isPortrait ? w * 0.024 : h * 0.022, clamp01(localTime / 0.2), {
          border: PAL.goldLight,
          textColor: PAL.goldLight,
        });
        drawPixelKineticTitle(ctx, '而今天', w * 0.5, h * (isPortrait ? 0.225 : 0.225), isPortrait ? w * 0.136 : h * 0.124, localTime, {
          startDelay: 0.04,
          stagger: 0.05,
          color: PAL.goldLight,
          accentColor: PAL.cream,
          highlightIndices: [1, 2],
          maxWidth: w * 0.86,
        });
      } else if (localTime < 3.87) {
        const wt = localTime - 1.17;
        drawPixelHudTag(ctx, 'WITNESSES OF HISTORY', w * 0.5, h * (isPortrait ? 0.105 : 0.088), isPortrait ? w * 0.024 : h * 0.022, clamp01(wt / 0.22), {
          border: PAL.tealLight,
          textColor: PAL.tealLight,
        });
        drawPixelKineticTitle(ctx, '历史的见证者', w * 0.5, h * (isPortrait ? 0.225 : 0.225), isPortrait ? w * 0.118 : h * 0.108, wt, {
          startDelay: 0.05,
          stagger: 0.045,
          color: PAL.cream,
          accentColor: PAL.tealLight,
          highlightIndices: [3, 4, 5],
          plaqueBg: 'rgba(12, 20, 44, 0.9)',
          plaqueBorder: PAL.tealLight,
          maxWidth: w * 0.88,
        });
      } else {
        const ft = localTime - 3.87;
        drawPixelHudTag(ctx, 'AI CHRONICLE · TO BE CONTINUED', w * 0.5, h * (isPortrait ? 0.105 : 0.088), isPortrait ? w * 0.024 : h * 0.022, clamp01(ft / 0.2), {
          border: PAL.goldLight,
          textColor: PAL.goldLight,
        });
        drawPixelKineticTitle(ctx, '也是未来的书写者', w * 0.5, h * (isPortrait ? 0.225 : 0.228), isPortrait ? w * 0.11 : h * 0.102, ft, {
          startDelay: 0.04,
          stagger: 0.04,
          color: PAL.cream,
          accentColor: PAL.goldLight,
          highlightIndices: [2, 3, 5, 6, 7],
          plaqueBg: 'rgba(14, 18, 42, 0.92)',
          plaqueBorder: PAL.goldLight,
          maxWidth: w * 0.92,
        });
      }
      break;
    }
  }

  ctx.restore();
}

// ============================================================================
// SMOOTH 60FPS CAMERA MOTION + DUAL-SCENE TRANSITION COMPOSITOR
// ============================================================================

function blitWithCamera(
  ctx: CanvasRenderingContext2D,
  source: HTMLCanvasElement,
  w: number,
  h: number,
  scale: number,
  offsetX = 0,
  offsetY = 0,
  alpha = 1
): void {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.imageSmoothingEnabled = false;
  ctx.translate(w * 0.5 + offsetX, h * 0.5 + offsetY);
  ctx.scale(scale, scale);
  ctx.drawImage(source, -w * 0.5, -h * 0.5, w, h);
  ctx.restore();
}

/**
 * Compute continuous gentle 60fps camera dolly/breathing per scene so frame is always alive.
 */
function getSceneCamera(sceneId: SceneId, localTime: number, progress: number, intensity: number): {
  scale: number;
  dx: number;
  dy: number;
} {
  const amt = Math.min(1.25, intensity);
  switch (sceneId) {
    case 'intro-signal':
      return { scale: lerp(1.0, 1.09, progress), dx: 0, dy: 0 };
    case 'epic-prologue':
      return { scale: lerp(1.02, 1.09, progress), dx: Math.sin(localTime * 0.8) * 6 * amt, dy: Math.cos(localTime * 0.6) * 4 * amt };
    case 'title-drop':
      return { scale: lerp(1.1, 1.01, easeOutExpo(progress)), dx: 0, dy: 0 };
    case 'recent-hype': {
      const bump = localTime > 2.05 ? Math.sin((localTime - 2.05) * 28) * Math.exp(-(localTime - 2.05) * 6) * 8 * amt : 0;
      return { scale: lerp(1.01, 1.08, progress), dx: bump, dy: bump * 0.4 };
    }
    case 'plot-twist':
      return { scale: lerp(1.03, 1.0, easeOutCubic(progress)), dx: 0, dy: 0 };
    case 'eighty-years':
      return { scale: lerp(1.05, 1.0, progress), dx: 0, dy: 0 };
    case 'peak-frenzy':
      return { scale: lerp(1.0, 1.07, progress), dx: Math.sin(localTime * 18) * 2.5 * amt, dy: lerp(8, -8, progress) };
    case 'ai-winter':
      return { scale: lerp(1.05, 1.01, progress), dx: 0, dy: lerp(-6, 8, progress) };
    case 'golden-age':
      return { scale: lerp(0.98, 1.06, progress), dx: 0, dy: 0 };
    case 'five-stages': {
      // Gentle pullback over the map, then subtle zoom-in toward Stage I on the left!
      const lockZoom = smoothstep(3.2, 4.9, localTime);
      return {
        scale: lerp(1.03, 1.0, progress) + lockZoom * 0.08,
        dx: lerp(0, 18 * amt, lockZoom),
        dy: lerp(0, -6 * amt, lockZoom),
      };
    }
    case 'stage-one-dawn':
      return { scale: lerp(1.06, 1.01, easeOutExpo(progress)), dx: 0, dy: lerp(6, -4, progress) };
    case 'postwar-turing':
      return {
        scale: lerp(1.0, 1.07, progress),
        dx: lerp(8 * amt, -10 * amt, smoothstep(2.4, 4.2, localTime)),
        dy: 0,
      };
    case 'turing-test':
      return { scale: lerp(1.04, 1.0, easeOutExpo(progress)), dx: 0, dy: 0 };
    case 'can-machines-think': {
      const qImpulse = localTime >= 2.38 ? Math.sin((localTime - 2.38) * 34) * Math.exp(-(localTime - 2.38) * 6.5) * 9 * amt : 0;
      const qZoom = smoothstep(2.35, 2.75, localTime) * 0.06;
      return { scale: lerp(1.0, 1.06, progress) + qZoom, dx: qImpulse, dy: qImpulse * 0.35 };
    }
    case 'spark-of-1956': {
      const finaleZoom = smoothstep(3.9, 5.8, localTime) * 0.07;
      return { scale: lerp(1.02, 1.05, progress) + finaleZoom, dx: 0, dy: lerp(6, -6, progress) };
    }
    case 'dartmouth-pioneers':
      return { scale: lerp(1.02, 1.07, progress), dx: Math.sin(localTime * 0.7) * 5 * amt, dy: 0 };
    case 'dartmouth-college':
      return { scale: lerp(1.04, 1.0, easeOutCubic(progress)), dx: lerp(-10 * amt, 8 * amt, progress), dy: 0 };
    case 'ai-named': {
      const coinZoom = smoothstep(1.38, 1.95, localTime) * 0.06;
      return { scale: lerp(1.0, 1.04, progress) + coinZoom, dx: 0, dy: 0 };
    }
    case 'wild-optimism': {
      const domeLift = smoothstep(5.9, 7.2, localTime);
      return { scale: lerp(1.0, 1.06, progress), dx: 0, dy: lerp(4, -5, domeLift) };
    }
    case 'logic-dominion': {
      const giantZoom = smoothstep(6.1, 8.8, localTime) * 0.07;
      return { scale: lerp(1.01, 1.05, progress) + giantZoom, dx: 0, dy: lerp(4, -6, smoothstep(6.0, 7.5, localTime)) };
    }
    case 'stage-two-winter':
      return { scale: lerp(1.02, 1.05, progress), dx: 0, dy: 0 };
    case 'cold-water-splash': {
      const splashBump =
        localTime >= 0.85 ? Math.sin((localTime - 0.85) * 28) * Math.exp(-(localTime - 0.85) * 4.5) * 6 * amt : 0;
      return { scale: lerp(1.01, 1.07, progress), dx: splashBump * 0.5, dy: splashBump };
    }
    case 'combinatorial-explosion':
      return { scale: lerp(1.0, 1.06, progress), dx: Math.sin(localTime * 0.9) * 4 * amt, dy: 0 };
    case 'mainframe-overload': {
      const overloadShake =
        localTime >= 4.0 ? Math.sin(localTime * 42) * smoothstep(4.0, 5.2, localTime) * 5 * amt : 0;
      return { scale: lerp(1.01, 1.08, progress), dx: overloadShake, dy: overloadShake * 0.4 };
    }
    case 'overhyped-pie': {
      const popKick =
        localTime >= 2.65 ? Math.sin((localTime - 2.65) * 34) * Math.exp(-(localTime - 2.65) * 6.5) * 7 * amt : 0;
      return { scale: lerp(1.0, 1.06, progress), dx: popKick, dy: popKick * 0.3 };
    }
    case 'funding-cuts': {
      const snipPunch =
        localTime >= 1.65 ? Math.sin((localTime - 1.65) * 32) * Math.exp(-(localTime - 1.65) * 6) * 8 * amt : 0;
      return { scale: lerp(1.02, 1.06, progress), dx: snipPunch, dy: 0 };
    }
    case 'first-ai-winter':
      return { scale: lerp(1.05, 1.0, easeOutCubic(progress)), dx: lerp(-6 * amt, 8 * amt, progress), dy: 0 };
    case 'ember-thaw-1980s':
      return { scale: lerp(1.0, 1.07, progress), dx: 0, dy: lerp(6, -5, progress) };
    case 'expert-systems':
      return {
        scale: lerp(1.0, 1.06, progress),
        dx: lerp(8 * amt, -8 * amt, smoothstep(1.0, 10.5, localTime)),
        dy: 0,
      };
    case 'fleeting-bloom':
      return { scale: lerp(1.0, 1.08, progress), dx: 0, dy: lerp(4, -4, progress) };
    case 'second-ai-winter': {
      const crashShake =
        localTime >= 1.25 ? Math.sin((localTime - 1.25) * 30) * Math.exp(-(localTime - 1.25) * 4) * 7 * amt : 0;
      return { scale: lerp(1.02, 1.06, progress), dx: crashShake * 0.6, dy: crashShake };
    }
    case 'stage-three-data':
      return { scale: lerp(1.0, 1.07, progress), dx: 0, dy: lerp(6, -6, progress) };
    case 'abandon-hardcode':
      return {
        scale: lerp(1.01, 1.06, progress),
        dx: lerp(-10 * amt, 10 * amt, smoothstep(1.2, 6.5, localTime)),
        dy: 0,
      };
    case 'machine-learning-rise':
      return { scale: lerp(1.03, 1.0, easeOutCubic(progress)) + smoothstep(6.5, 9.2, localTime) * 0.05, dx: 0, dy: 0 };
    case 'milestone-1997': {
      const yearZoom = smoothstep(2.6, 3.5, localTime) * 0.07;
      return { scale: lerp(1.0, 1.05, progress) + yearZoom, dx: 0, dy: 0 };
    }
    case 'deep-blue-victory': {
      const checkmatePunch =
        localTime >= 2.7 ? Math.sin((localTime - 2.7) * 30) * Math.exp(-(localTime - 2.7) * 5.5) * 7 * amt : 0;
      return { scale: lerp(1.01, 1.07, progress), dx: checkmatePunch * 0.5, dy: checkmatePunch };
    }
    case 'beyond-human-peak': {
      const peakLift = smoothstep(4.5, 7.0, localTime);
      return { scale: lerp(1.0, 1.07, progress), dx: lerp(6 * amt, -8 * amt, peakLift), dy: lerp(4, -6, peakLift) };
    }
    case 'specialist-student': {
      const stampBump =
        localTime >= 2.65 ? Math.sin((localTime - 2.65) * 30) * Math.exp(-(localTime - 2.65) * 6) * 6 * amt : 0;
      return { scale: lerp(1.03, 1.0, easeOutCubic(progress)), dx: stampBump, dy: stampBump * 0.4 };
    }
    case 'stage-four-deep-learning':
      return { scale: lerp(1.0, 1.07, progress), dx: 0, dy: lerp(5, -5, progress) };
    case 'internet-data-deluge':
      return { scale: lerp(1.02, 1.06, progress), dx: Math.sin(localTime * 0.9) * 5 * amt, dy: 0 };
    case 'gpu-compute-surge': {
      const gpuHum = Math.sin(localTime * 28) * smoothstep(0.8, 2.5, localTime) * 2.5 * amt;
      return { scale: lerp(1.0, 1.08, progress), dx: gpuHum, dy: gpuHum * 0.4 };
    }
    case 'neural-network-awakening': {
      const burstZoom = smoothstep(5.0, 6.4, localTime) * 0.08;
      const burstPulse =
        localTime >= 5.3 ? Math.sin((localTime - 5.3) * 32) * Math.exp(-(localTime - 5.3) * 5) * 7 * amt : 0;
      return { scale: lerp(1.0, 1.05, progress) + burstZoom, dx: burstPulse * 0.5, dy: burstPulse * 0.5 };
    }
    case 'alexnet-imagenet-2012': {
      const winLift = smoothstep(2.5, 4.2, localTime);
      return {
        scale: lerp(1.0, 1.07, progress),
        dx: lerp(-6 * amt, 8 * amt, winLift),
        dy: lerp(4, -4, winLift),
      };
    }
    case 'computer-sees-world': {
      const eyeOpen = smoothstep(2.0, 3.3, localTime);
      return {
        scale: lerp(1.02, 1.08, progress),
        dx: lerp(8 * amt, -8 * amt, eyeOpen),
        dy: 0,
      };
    }
    case 'alphago-2016': {
      const move37 =
        localTime >= 2.55 ? Math.sin((localTime - 2.55) * 28) * Math.exp(-(localTime - 2.55) * 5.5) * 6 * amt : 0;
      return { scale: lerp(1.01, 1.07, progress), dx: move37 * 0.4, dy: move37 };
    }
    case 'go-last-bastion':
      return { scale: lerp(1.05, 1.0, easeOutCubic(progress)) + smoothstep(2.4, 4.0, localTime) * 0.05, dx: 0, dy: lerp(4, -5, progress) };
    case 'modern-ai-prelude': {
      const surge = smoothstep(2.7, 5.2, localTime);
      return {
        scale: lerp(1.0, 1.07, progress) + surge * 0.04,
        dx: lerp(-6 * amt, 8 * amt, surge),
        dy: lerp(6, -6, surge),
      };
    }
    case 'stage-five-agi-dawn': {
      const dawnRise = smoothstep(1.0, 6.8, localTime);
      const speedWarp = smoothstep(7.0, 10.2, localTime) * 0.06;
      return {
        scale: lerp(1.0, 1.05, progress) + speedWarp,
        dx: Math.sin(localTime * 0.65) * 4 * amt,
        dy: lerp(7, -6, dawnRise),
      };
    }
    case 'transformer-llm-birth': {
      const llmPan = smoothstep(1.8, 3.6, localTime);
      return {
        scale: lerp(1.0, 1.07, progress),
        dx: lerp(7 * amt, -7 * amt, llmPan),
        dy: 0,
      };
    }
    case 'multimodal-allrounder':
      return {
        scale: lerp(1.04, 1.0, easeOutCubic(progress)) + smoothstep(2.4, 4.4, localTime) * 0.05,
        dx: Math.sin(localTime * 0.85) * 4 * amt,
        dy: 0,
      };
    case 'humanlike-creativity': {
      const bloomZoom = smoothstep(2.1, 4.2, localTime);
      return {
        scale: lerp(1.02, 1.07, progress),
        dx: 0,
        dy: lerp(4, -5, bloomZoom),
      };
    }
    case 'spark-to-world-tree':
      return {
        scale: lerp(1.06, 1.0, easeOutExpo(progress)),
        dx: 0,
        dy: lerp(8, -6, smoothstep(1.4, 4.8, localTime)),
      };
    case 'civilization-revolution':
      return {
        scale: lerp(1.0, 1.07, progress),
        dx: lerp(8 * amt, -8 * amt, progress),
        dy: lerp(4, -5, progress),
      };
    case 'winter-and-breakthrough':
      return {
        scale: lerp(1.01, 1.06, progress),
        dx: lerp(6 * amt, -6 * amt, progress),
        dy: lerp(4, -5, smoothstep(4.2, 6.8, localTime)),
      };
    case 'witness-and-writer-finale':
      return {
        scale: lerp(1.05, 1.0, easeOutCubic(progress)),
        dx: 0,
        dy: lerp(6, -4, progress),
      };
  }
}

/**
 * True 16-bit Ordered Bayer 4x4 Pixel Dissolve onto an offscreen canvas.
 */
function composeBayerDissolve(
  out: PixelBuffer,
  from: PixelBuffer,
  to: PixelBuffer,
  progress: number
): void {
  const { ctx, w, h } = out;
  ctx.clearRect(0, 0, w, h);
  ctx.drawImage(from.canvas, 0, 0);

  // Coarse 4x4 pixel-block Bayer dissolve for buttery 60fps & authentic SNES look!
  const block = 4;
  ctx.save();
  ctx.beginPath();
  for (let y = 0; y < h; y += block) {
    for (let x = 0; x < w; x += block) {
      if (progress >= bayerThreshold(x / block, y / block)) {
        ctx.rect(x, y, block, block);
      }
    }
  }
  ctx.clip();
  ctx.drawImage(to.canvas, 0, 0);
  ctx.restore();
}

export interface RetroPixelRenderParams extends PureVisualSceneContext {
  activeTransition: ActiveTransition | null;
}

/**
 * Master 16-Bit Cinema Compositor:
 * - Renders 384x216 crisp integer pixel art
 * - Executes true DUAL-SCENE silky 60fps camera transitions (zero PPT hard snaps!)
 * - Renders synchronized kinetic 16-bit Chinese/English anchor titles cleanly above subtitles
 */
export function renderRetroPixelScene(sc: RetroPixelRenderParams): void {
  const { ctx, w, h, isPortrait, time, localTime, progress, energy, intensity, scene, activeTransition } = sc;
  const pw = isPortrait ? VW_PORTRAIT : VW_LANDSCAPE;
  const ph = isPortrait ? VH_PORTRAIT : VH_LANDSCAPE;

  bufA = ensureBuffer(bufA, pw, ph);
  bufB = ensureBuffer(bufB, pw, ph);
  bufDither = ensureBuffer(bufDither, pw, ph);
  if (!bufA || !bufB || !bufDither) return;

  const tr = activeTransition;

  if (!tr) {
    // STEADY SCENE RENDER WITH SMOOTH 60FPS CAMERA MOTION
    drawPixelWorldById(bufA.ctx, pw, ph, scene.id, time, localTime, energy);
    const cam = getSceneCamera(scene.id, localTime, progress, intensity);
    ctx.fillStyle = PAL.void;
    ctx.fillRect(0, 0, w, h);
    blitWithCamera(ctx, bufA.canvas, w, h, cam.scale, cam.dx, cam.dy, 1);

    // Subtle warm CRT scanlines
    drawSubtleCrtScanlines(ctx, w, h);

    // Crisp kinetic 16-bit titles
    drawPixelSceneTypography(ctx, w, h, isPortrait, scene.id, localTime, 1);
    return;
  }

  // ==========================================================================
  // DUAL-SCENE SILKY CINEMATIC TRANSITIONS (EXACT CAMERA CONTINUITY — ZERO POPS!)
  // ==========================================================================
  const p = clamp01(tr.progress);
  const eased = easeInOutQuint(p);
  const fromScene: SceneCut = tr.fromScene;
  const toScene: SceneCut = tr.toScene;
  const fromLocal = Math.max(0, time - fromScene.start);
  const toLocal = Math.max(0, time - toScene.start);
  const fromDur = Math.max(0.001, fromScene.end - fromScene.start);
  const toDur = Math.max(0.001, toScene.end - toScene.start);
  const fromCam = getSceneCamera(fromScene.id, fromLocal, clamp01(fromLocal / fromDur), intensity);
  const toCam = getSceneCamera(toScene.id, toLocal, clamp01(toLocal / toDur), intensity);

  // Render BOTH live worlds continuously!
  drawPixelWorldById(bufA.ctx, pw, ph, fromScene.id, time, fromLocal, energy);
  drawPixelWorldById(bufB.ctx, pw, ph, toScene.id, time, toLocal, energy);

  ctx.fillStyle = PAL.void;
  ctx.fillRect(0, 0, w, h);

  switch (tr.type) {
    case 'aperture-open': {
      // Silky opening CRT phosphor glow sweep (zero shutter jump at t=0!)
      blitWithCamera(ctx, bufB.canvas, w, h, toCam.scale, toCam.dx, toCam.dy, 1);
      const sweepAlpha = Math.sin(p * Math.PI) * 0.24;
      if (sweepAlpha > 0.01) {
        const beamY = h * easeOutCubic(p);
        ctx.fillStyle = `rgba(246, 238, 216, ${sweepAlpha})`;
        ctx.fillRect(0, beamY - 8, w, 16);
      }
      break;
    }

    case 'whip-blinds': {
      // Match-cut zoom dive seamlessly connecting fromCam -> toCam
      const zoomOutA = lerp(fromCam.scale, fromCam.scale + 1.85, eased);
      const inP = easeOutExpo(clamp01((p - 0.12) / 0.88));
      const zoomInB = lerp(0.62, toCam.scale, inP);
      const blendB = smoothstep(0.18, 0.78, p);

      blitWithCamera(
        ctx,
        bufA.canvas,
        w,
        h,
        zoomOutA,
        lerp(fromCam.dx, 0, eased),
        lerp(fromCam.dy, h * 0.08, eased),
        1 - blendB * 0.92
      );
      if (blendB > 0.01) {
        blitWithCamera(
          ctx,
          bufB.canvas,
          w,
          h,
          zoomInB,
          lerp(0, toCam.dx, inP),
          lerp(0, toCam.dy, inP),
          blendB
        );
      }
      const midGlow = Math.sin(p * Math.PI);
      if (midGlow > 0.05) {
        ctx.fillStyle = `rgba(126, 212, 192, ${midGlow * 0.16})`;
        ctx.fillRect(0, 0, w, h);
      }
      break;
    }

    case 'iris-flash': {
      // Expanding Golden Portal Iris with exact camera handoff
      blitWithCamera(ctx, bufA.canvas, w, h, lerp(fromCam.scale, fromCam.scale + 0.12, eased), fromCam.dx, fromCam.dy, 1);
      const maxR = Math.hypot(w, h) * 0.58;
      const curR = maxR * eased;
      ctx.save();
      ctx.beginPath();
      ctx.arc(w * 0.5, h * 0.5, curR, 0, Math.PI * 2);
      ctx.clip();
      blitWithCamera(
        ctx,
        bufB.canvas,
        w,
        h,
        lerp(toCam.scale + 0.08, toCam.scale, eased),
        lerp(0, toCam.dx, eased),
        lerp(0, toCam.dy, eased),
        1
      );
      ctx.restore();

      if (p > 0.04 && p < 0.96) {
        ctx.save();
        ctx.strokeStyle = PAL.goldLight;
        ctx.lineWidth = Math.max(4, (1 - p) * 14);
        ctx.beginPath();
        ctx.arc(w * 0.5, h * 0.5, curR, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }
      break;
    }

    case 'razor-wipe': {
      // Continuous 60fps Horizontal Camera Whip-Pan Left -> Right (exact fromCam -> toCam)
      const panX = eased * w;
      blitWithCamera(ctx, bufA.canvas, w, h, fromCam.scale, fromCam.dx - panX, fromCam.dy, 1);
      blitWithCamera(ctx, bufB.canvas, w, h, toCam.scale, toCam.dx + w - panX, toCam.dy, 1);

      const vel = Math.sin(p * Math.PI);
      if (vel > 0.2) {
        ctx.save();
        ctx.fillStyle = `rgba(246, 238, 216, ${vel * 0.16})`;
        for (let i = 0; i < 8; i++) {
          const sy = h * (0.12 + i * 0.1);
          ctx.fillRect(w * (0.1 + ((i * 19) % 5) * 0.12), sy, w * 0.24 * vel, 3);
        }
        ctx.restore();
      }
      break;
    }

    case 'invert-strobe': {
      // Silky Vertical CRT Raster Wipe (replaces jarring snap/jitter so "但其实" never jumps!)
      const wipeY = h * eased;
      blitWithCamera(ctx, bufA.canvas, w, h, fromCam.scale, fromCam.dx, fromCam.dy, 1);

      if (wipeY > 1) {
        ctx.save();
        ctx.beginPath();
        ctx.rect(0, 0, w, wipeY);
        ctx.clip();
        blitWithCamera(ctx, bufB.canvas, w, h, toCam.scale, toCam.dx, toCam.dy, 1);
        ctx.restore();
      }

      // Luminous CRT raster scan beam sweeping smoothly down the wipe seam
      const barAlpha = Math.sin(p * Math.PI);
      if (barAlpha > 0.04) {
        ctx.fillStyle = `rgba(216, 227, 192, ${barAlpha * 0.65})`;
        ctx.fillRect(0, wipeY - 10, w, 20);
        ctx.fillStyle = `rgba(255, 255, 255, ${barAlpha * 0.85})`;
        ctx.fillRect(0, wipeY - 2, w, 4);
      }
      break;
    }

    case 'camera-pullback': {
      // Authentic 16-Bit Ordered Bayer Pixel Dissolve with exact fromCam -> toCam interpolation
      composeBayerDissolve(bufDither, bufA, bufB, eased);
      blitWithCamera(
        ctx,
        bufDither.canvas,
        w,
        h,
        lerp(fromCam.scale, toCam.scale, eased),
        lerp(fromCam.dx, toCam.dx, eased),
        lerp(fromCam.dy, toCam.dy, eased),
        1
      );
      break;
    }

    case 'ember-curtain': {
      // Continuous Vertical Camera Tilt-Up (exact fromCam -> toCam)
      const panY = eased * h;
      blitWithCamera(ctx, bufA.canvas, w, h, fromCam.scale, fromCam.dx, fromCam.dy + panY, 1);
      blitWithCamera(ctx, bufB.canvas, w, h, toCam.scale, toCam.dx, toCam.dy + panY - h, 1);
      const seamAlpha = Math.sin(p * Math.PI) * 0.35;
      ctx.fillStyle = `rgba(242, 180, 75, ${seamAlpha})`;
      ctx.fillRect(0, panY - 22, w, 44);
      break;
    }

    case 'gravity-shatter': {
      // Continuous Vertical Camera Freefall Plunge Down (exact fromCam -> toCam)
      const panY = eased * h;
      blitWithCamera(ctx, bufA.canvas, w, h, fromCam.scale, fromCam.dx, fromCam.dy - panY, 1);
      blitWithCamera(ctx, bufB.canvas, w, h, toCam.scale, toCam.dx, toCam.dy + h - panY, 1);
      const seamAlpha = Math.sin(p * Math.PI) * 0.4;
      ctx.fillStyle = `rgba(168, 221, 242, ${seamAlpha})`;
      ctx.fillRect(0, h - panY - 20, w, 40);
      break;
    }

    case 'horizon-burst': {
      // Warm Dawn Horizon Parting + Bayer Dither Reveal with exact fromCam -> toCam
      composeBayerDissolve(bufDither, bufA, bufB, smoothstep(0.1, 0.92, p));
      blitWithCamera(
        ctx,
        bufDither.canvas,
        w,
        h,
        lerp(fromCam.scale, toCam.scale, eased),
        lerp(fromCam.dx, toCam.dx, eased),
        lerp(fromCam.dy, toCam.dy, eased),
        1
      );
      const dawnGlow = Math.sin(p * Math.PI);
      if (dawnGlow > 0.05) {
        const gGrad = ctx.createRadialGradient(w * 0.5, h * 0.55, 10, w * 0.5, h * 0.55, w * 0.65);
        gGrad.addColorStop(0, `rgba(255, 224, 138, ${dawnGlow * 0.42})`);
        gGrad.addColorStop(1, 'rgba(255, 224, 138, 0)');
        ctx.fillStyle = gGrad;
        ctx.fillRect(0, 0, w, h);
      }
      break;
    }
  }

  drawSubtleCrtScanlines(ctx, w, h);

  // Smoothly crossfade/hand-off typography across the cut with zero boundary flicker
  if (fromScene.id === toScene.id) {
    drawPixelSceneTypography(ctx, w, h, isPortrait, toScene.id, toLocal, 1);
  } else {
    const outAlpha = smoothstep(0.46, 0.04, p);
    if (outAlpha > 0.02) {
      drawPixelSceneTypography(ctx, w, h, isPortrait, fromScene.id, fromLocal, outAlpha);
    }
    const inAlpha = smoothstep(0.32, 0.78, p);
    if (inAlpha > 0.02) {
      drawPixelSceneTypography(ctx, w, h, isPortrait, toScene.id, toLocal, inAlpha);
    }
  }
}

function drawSubtleCrtScanlines(ctx: CanvasRenderingContext2D, w: number, h: number): void {
  ctx.save();
  ctx.fillStyle = 'rgba(0, 0, 0, 0.055)';
  const step = Math.max(4, Math.round(h / 216));
  for (let y = 0; y < h; y += step) {
    ctx.fillRect(0, y, w, 1);
  }
  ctx.restore();
}
