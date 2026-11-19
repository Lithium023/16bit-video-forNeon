// ============================================================================
// 16-BIT PIXEL ART PALETTE, DITHERING & SPRITE LIBRARY
// Designed for 384x216 (16:9) / 216x384 (9:16) virtual pixel canvas
// ============================================================================

export const PAL = {
  // Deep night & interior shadows
  void: '#10121E',
  navyDark: '#171B2C',
  navy: '#21273F',
  navyLight: '#313A59',
  slate: '#49557A',
  slateLight: '#7382A8',

  // Warm lamp / gold / amber highlights
  cream: '#F6EED8',
  creamDim: '#D4C7A8',
  goldLight: '#FFE08A',
  gold: '#F2B44B',
  goldDark: '#C27E28',
  amber: '#965222',

  // Cozy coral / crimson accents
  coralLight: '#F58E7E',
  coral: '#E06055',
  coralDark: '#99363B',
  plum: '#4A2B45',
  dusk: '#6E3E52',

  // Cool teal / cyan / emerald
  tealLight: '#7ED4C0',
  teal: '#4AA092',
  tealDark: '#2A6360',
  pine: '#1E454B',

  // Ice / snow / arctic winter
  iceWhite: '#ECF7FC',
  iceLight: '#A8DDF2',
  ice: '#6BB0D6',
  iceMid: '#3C6E99',
  iceDark: '#1E3A5C',
  iceDeep: '#11223B',

  // Game Boy Pocket olive monochrome (Plot Twist)
  gbLight: '#D8E3C0',
  gbMid: '#9EB386',
  gbDark: '#486348',
  gbInk: '#1D2B1F',
} as const;

// 4x4 Ordered Bayer matrix normalized to [0..15]
export const BAYER_4X4 = [
  [0, 8, 2, 10],
  [12, 4, 14, 6],
  [3, 11, 1, 9],
  [15, 7, 13, 5],
];

export function bayerThreshold(x: number, y: number): number {
  const row = BAYER_4X4[((y | 0) & 3)];
  return (row[((x | 0) & 3)] + 0.5) / 16;
}

export function pxRect(
  g: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  color: string
): void {
  if (w <= 0 || h <= 0) return;
  g.fillStyle = color;
  g.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
}

export function pxOutline(
  g: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  color: string,
  t = 1
): void {
  const rx = Math.round(x);
  const ry = Math.round(y);
  const rw = Math.round(w);
  const rh = Math.round(h);
  g.fillStyle = color;
  g.fillRect(rx, ry, rw, t);
  g.fillRect(rx, ry + rh - t, rw, t);
  g.fillRect(rx, ry, t, rh);
  g.fillRect(rx + rw - t, ry, t, rh);
}

export function pxCircle(
  g: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  r: number,
  color: string
): void {
  const rcx = Math.round(cx);
  const rcy = Math.round(cy);
  const rr = Math.round(r);
  if (rr <= 0) return;
  g.fillStyle = color;
  for (let dy = -rr; dy <= rr; dy++) {
    const span = Math.floor(Math.sqrt(Math.max(0, rr * rr - dy * dy)));
    g.fillRect(rcx - span, rcy + dy, span * 2 + 1, 1);
  }
}

export function pxRing(
  g: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  r: number,
  color: string,
  size = 1
): void {
  const rcx = Math.round(cx);
  const rcy = Math.round(cy);
  const rr = Math.round(r);
  g.fillStyle = color;
  const steps = Math.max(24, rr * 6);
  for (let i = 0; i < steps; i++) {
    const a = (i / steps) * Math.PI * 2;
    g.fillRect(Math.round(rcx + Math.cos(a) * rr), Math.round(rcy + Math.sin(a) * rr), size, size);
  }
}

export function pxLine(
  g: CanvasRenderingContext2D,
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  color: string,
  size = 1
): void {
  let ix0 = Math.round(x0);
  let iy0 = Math.round(y0);
  const ix1 = Math.round(x1);
  const iy1 = Math.round(y1);
  const dx = Math.abs(ix1 - ix0);
  const dy = Math.abs(iy1 - iy0);
  const sx = ix0 < ix1 ? 1 : -1;
  const sy = iy0 < iy1 ? 1 : -1;
  let err = dx - dy;
  g.fillStyle = color;

  for (let guard = 0; guard < 1000; guard++) {
    g.fillRect(ix0, iy0, size, size);
    if (ix0 === ix1 && iy0 === iy1) break;
    const e2 = 2 * err;
    if (e2 > -dy) {
      err -= dy;
      ix0 += sx;
    }
    if (e2 < dx) {
      err += dx;
      iy0 += sy;
    }
  }
}

/**
 * Draw authentic 16-bit dithered multi-band sky gradient using crisp Bayer patterns
 * at band seams (just like SNES / Sea of Stars backgrounds!).
 */
export function drawDitheredSky(
  g: CanvasRenderingContext2D,
  pw: number,
  ph: number,
  bands: Array<{ stop: number; color: string }>
): void {
  if (bands.length === 0) return;
  pxRect(g, 0, 0, pw, ph, bands[0].color);

  for (let i = 1; i < bands.length; i++) {
    const prev = bands[i - 1];
    const curr = bands[i];
    const seamY = Math.round(curr.stop * ph);
    const prevY = Math.round(prev.stop * ph);
    const ditherH = Math.min(12, Math.max(4, Math.floor((seamY - prevY) * 0.35)));

    // Solid region from seam downward
    pxRect(g, 0, seamY, pw, ph - seamY, curr.color);

    // Classic 16-bit checkerboard / Bayer transition rows just above the seam
    g.fillStyle = curr.color;
    for (let dy = 0; dy < ditherH; dy++) {
      const y = seamY - ditherH + dy;
      if (y < 0 || y >= ph) continue;
      const frac = (dy + 1) / (ditherH + 1);
      if (frac > 0.66) {
        for (let x = (y & 1); x < pw; x += 2) g.fillRect(x, y, 1, 1);
        for (let x = ((y + 1) & 1); x < pw; x += 4) g.fillRect(x, y, 1, 1);
      } else if (frac > 0.34) {
        for (let x = (y & 1); x < pw; x += 2) g.fillRect(x, y, 1, 1);
      } else {
        for (let x = ((y & 1) * 2); x < pw; x += 4) g.fillRect(x, y, 1, 1);
      }
    }
  }
}

/**
 * Draw a pixel-dithered radial light halo (warm lamp glow, sun aura, portal glow).
 */
export function drawDitheredGlow(
  g: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  r: number,
  color: string,
  density: 'light' | 'medium' = 'light'
): void {
  const rcx = Math.round(cx);
  const rcy = Math.round(cy);
  const rr = Math.round(r);
  const step = density === 'medium' ? 2 : 3;
  g.fillStyle = color;
  for (let dy = -rr; dy <= rr; dy += 2) {
    for (let dx = -rr; dx <= rr; dx += step) {
      const d = Math.hypot(dx, dy);
      if (d > rr) continue;
      const prob = 1 - d / rr;
      if (prob > bayerThreshold(dx + rcx, dy + rcy) * 1.35) {
        g.fillRect(rcx + dx, rcy + dy, 1, 1);
      }
    }
  }
}

export function drawSprite(
  g: CanvasRenderingContext2D,
  grid: string[],
  palette: Record<string, string>,
  cx: number,
  cy: number,
  scale = 1
): void {
  const rows = grid.length;
  const cols = grid[0]?.length ?? 0;
  const ox = Math.round(cx - (cols * scale) / 2);
  const oy = Math.round(cy - (rows * scale) / 2);
  for (let r = 0; r < rows; r++) {
    const row = grid[r];
    for (let c = 0; c < cols; c++) {
      const ch = row[c];
      if (ch === '.' || ch === ' ') continue;
      const col = palette[ch];
      if (!col) continue;
      g.fillStyle = col;
      g.fillRect(ox + c * scale, oy + r * scale, scale, scale);
    }
  }
}

export function pxSparkle(
  g: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  r: number,
  color: string
): void {
  const x = Math.round(cx);
  const y = Math.round(cy);
  g.fillStyle = color;
  g.fillRect(x - r, y, r * 2 + 1, 1);
  g.fillRect(x, y - r, 1, r * 2 + 1);
  if (r >= 3) {
    g.fillRect(x - 1, y - 1, 3, 3);
  }
}

export function pxCloud(
  g: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  size: number,
  topCol: string,
  botCol: string
): void {
  const x = Math.round(cx);
  const y = Math.round(cy);
  pxCircle(g, x - size * 0.55, y + 2, size * 0.36, botCol);
  pxCircle(g, x + size * 0.52, y + 2, size * 0.32, botCol);
  pxCircle(g, x, y - 1, size * 0.5, botCol);
  pxRect(g, x - size * 0.65, y + 2, size * 1.3, size * 0.25, botCol);

  pxCircle(g, x - size * 0.5, y, size * 0.3, topCol);
  pxCircle(g, x + size * 0.48, y, size * 0.26, topCol);
  pxCircle(g, x - 1, y - 3, size * 0.44, topCol);
}

export function pxPineTree(
  g: CanvasRenderingContext2D,
  x: number,
  groundY: number,
  h: number,
  foliageDark: string,
  foliageLight: string,
  snowCol?: string
): void {
  const ix = Math.round(x);
  const gy = Math.round(groundY);
  const trunkH = Math.max(4, Math.round(h * 0.18));
  pxRect(g, ix - 2, gy - trunkH, 4, trunkH, '#3E2D2A');

  const tiers = 3;
  for (let t = 0; t < tiers; t++) {
    const tierH = Math.round((h * 0.42) * (1 - t * 0.16));
    const tierBaseY = gy - trunkH - Math.round(t * h * 0.24);
    const maxW = Math.round(h * (0.34 - t * 0.065));
    for (let r = 0; r < tierH; r++) {
      const frac = r / Math.max(1, tierH);
      const half = Math.max(1, Math.round(frac * maxW));
      const py = tierBaseY - tierH + r;
      pxRect(g, ix - half, py, half, 1, foliageDark);
      pxRect(g, ix, py, half + 1, 1, foliageLight);
      if (snowCol && r < Math.max(2, Math.round(tierH * 0.28))) {
        pxRect(g, ix - half, py, half * 2 + 1, 1, snowCol);
      }
    }
  }
}

export function pxStarfield(
  g: CanvasRenderingContext2D,
  pw: number,
  ph: number,
  time: number,
  count = 40,
  maxYRatio = 0.72,
  driftX = 0
): void {
  for (let i = 0; i < count; i++) {
    const sx = Math.floor(((((i * 67.3 + driftX * (0.2 + (i % 3) * 0.25)) % pw) + pw) % pw));
    const sy = Math.floor(((i * 39.7) % 1) * (ph * maxYRatio));
    const phase = Math.floor(time * 4 + i * 1.7) % 6;
    g.fillStyle = phase === 0 ? PAL.goldLight : phase === 1 ? PAL.cream : PAL.slateLight;
    g.fillRect(sx, sy, 1, 1);
    if (phase === 0 && i % 5 === 0) {
      g.fillRect(sx - 1, sy, 3, 1);
      g.fillRect(sx, sy - 1, 1, 3);
    }
  }
}

// Detailed multi-color 16-bit sprites
export const SPRITE_ROCKET_HERO = [
  '......R......',
  '.....RRR.....',
  '....RRRRR....',
  '....RRWRR....',
  '...CCCCCCC...',
  '...CCSSSCC...',
  '..CCSBIBSCC..',
  '..CCSBBBSCC..',
  '..CCCSSSCCC..',
  '..CCCCCCCCC..',
  '.RCCCCCCCCCR.',
  'RRCCCCWCCCCRR',
  'RR.CCCCCCC.RR',
  'R..DDDDDDD..R',
];

export const SPRITE_SHIP_GALLEON = [
  '........C........',
  '.......CCC.......',
  '......CCCCC......',
  '.....CCCCCCC.....',
  '......CCCCC......',
  '........M........',
  '..DDDDDDDDDDDDD..',
  '...RRRRRRRRRRR...',
  '....BBBBBBBBB....',
];

export const SPRITE_TRAVELER_UMBRELLA = [
  '....RRRRR....',
  '..RRRRRRRRR..',
  '.RRRRRRRRRRR.',
  '......M......',
  '.....MMM.....',
  '.....CCC.....',
  '....TTMT.....',
  '....TTTT.....',
  '....TTTT.....',
  '....D..D.....',
  '...DD..DD....',
];

export const SPRITE_FROZEN_BOT = [
  '....IIIII....',
  '...ICCCCCI...',
  '..ICSSSSSCI..',
  '..ICSB.BSCI..',
  '..ICSSSSSCI..',
  '.IICCCCCCCII.',
  '..IC.CCC.CI..',
  '..ICCCCCCC...',
  '...CC...CC...',
  '..DDD...DDD..',
];

export const SPRITE_CHESS_KNIGHT = [
  '...GGGG..',
  '..GGGGGG.',
  '.GGGDGGG.',
  'GGGGGGG..',
  '...GGGG..',
  '..GGGGG..',
  '..GGGGG..',
  '.GGGGGGG.',
  'DDDDDDDDD',
];

export const SPRITE_TROPHY_CROWN = [
  '.G...G...G.',
  'GG..GGG..GG',
  'GGGGGGGGGGG',
  'GGRGGRGGRGG',
  'GGGGGGGGGGG',
  '.DDDDDDDDD.',
];

export const SPRITE_AIRSHIP = [
  '....RRRRRR....',
  '..RRCCCCCCRR..',
  '.RCCCCCCCCCCR.',
  'RRGGGGGGGGGGGR',
  '.RCCCCCCCCCCR.',
  '..RRDDDDDDRR..',
  '....M....M....',
  '...GGGGGGGG...',
  '....DDDDDD....',
];

export const SPRITE_TURING_BUST = [
  '.....HHHHH.....',
  '....HHHHHHH....',
  '...HHSSSSSHH...',
  '...HSSSSSSSH...',
  '...HSSDSDSSH...',
  '...HSSSSSSSH...',
  '....SSSMSSS....',
  '.....SSSSS.....',
  '....CWWRWWC....',
  '...CCWWRWWCC...',
  '..CCCCWRWCCCC..',
  '..CCCCCCCCCCC..',
  '.CCCCCCCCCCCCC.',
];

export const SPRITE_CIRCUIT_BRAIN = [
  '....TTTTTTT....',
  '..TTGGGGGGGTT..',
  '.TGTTGGGGGTTGT.',
  'TGTTGGGGGGGTTGT',
  'TGGGTTTTTTTGGGT',
  'TGGTGGGGGGGTGGT',
  'TGTTTGGGGGTTTGT',
  '.TGGGGTTTGGGGT.',
  '..TTGGGGGGGTT..',
  '....TTTTTTT....',
  '.....T.G.T.....',
  '.....T.G.T.....',
];

export const SPRITE_PIXEL_THINKER = [
  '....SSSS....',
  '...SSSSSS...',
  '...SSDDSS...',
  '....SSSS....',
  '..TTTTTTTT..',
  '.TTTTTTTTTT.',
  '.TT.TTTT.TT.',
];

// 1956 Dartmouth pioneers portrait sprites
export const SPRITE_PIONEER_MCCARTHY = [
  '....HHHHHHH....',
  '...HHHHHHHHH...',
  '...HHSSSSSHH...',
  '..HHSSDSDSSHH..',
  '...HSSSSSSSH...',
  '...HSSMMMSS....',
  '....HSSSSSH....',
  '.....HHHHH.....',
  '....CWWRWWC....',
  '...CCWWRWWCC...',
  '..CCCCWRWCCCC..',
  '..CCCCCCCCCCC..',
];

export const SPRITE_PIONEER_MINSKY = [
  '.....SSSSS.....',
  '....SSSSSSS....',
  '...SSSSSSSSS...',
  '..HGGGGGGGGGH..',
  '..HGDSSGSSDG...',
  '...HSSSSSSSH...',
  '....SSSMSSS....',
  '.....SSSSS.....',
  '....CWWBWWC....',
  '...CCWWTWWCC...',
  '..CCCCWTWCCCC..',
  '..CCCCCCCCCCC..',
];

export const SPRITE_PIONEER_SHANNON = [
  '....HHHHHHH....',
  '...HHHHHHHHH...',
  '...HHSSSSSHH...',
  '...HSSDSDSSH...',
  '...HSSSSSSSH...',
  '....SSSMSSS....',
  '.....SSSSS.....',
  '....CWWRWWC....',
  '...CCWWGWWCC...',
  '..CCCCWGWCCCC..',
  '..CCCCCCCCCCC..',
  '.CCCCCCCCCCCCC.',
];

export const SPRITE_GIANT_ROBOT = [
  '.......G.......',
  '.......T.......',
  '.....CCCCC.....',
  '....CCCCCCC....',
  '....CGGCGCC....',
  '....CCCCCCC....',
  '.....CDDDC.....',
  '..CCCCTTTTCCC..',
  '.CCCTTTTTTTCCC.',
  '.CCCTTGGGTTCCC.',
  '.CCCTTTTTTTCCC.',
  '.CC.CCCCCC.CC..',
  '.CC.CCDDCC.CC..',
  '....CC..CC.....',
  '....CC..CC.....',
  '...DDD..DDD....',
];

// Crisp 5x7 pixel bitmap digits/letters for compact in-world signage
export const BITMAP_5X7: Record<string, string[]> = {
  '0': ['.###.', '#...#', '#..##', '#.#.#', '##..#', '#...#', '.###.'],
  '1': ['..#..', '.##..', '..#..', '..#..', '..#..', '..#..', '.###.'],
  '2': ['.###.', '#...#', '....#', '..##.', '.#...', '#....', '#####'],
  '3': ['.###.', '#...#', '....#', '..##.', '....#', '#...#', '.###.'],
  '4': ['...#.', '..##.', '.#.#.', '#..#.', '#####', '...#.', '...#.'],
  '5': ['#####', '#....', '####.', '....#', '....#', '#...#', '.###.'],
  '6': ['.###.', '#....', '####.', '#...#', '#...#', '#...#', '.###.'],
  '7': ['#####', '....#', '...#.', '..#..', '.#...', '.#...', '.#...'],
  '8': ['.###.', '#...#', '#...#', '.###.', '#...#', '#...#', '.###.'],
  '9': ['.###.', '#...#', '#...#', '.####', '....#', '...#.', '.##..'],
  A: ['..#..', '.#.#.', '#...#', '#####', '#...#', '#...#', '#...#'],
  B: ['####.', '#...#', '#...#', '####.', '#...#', '#...#', '####.'],
  C: ['.###.', '#...#', '#....', '#....', '#....', '#...#', '.###.'],
  D: ['####.', '#...#', '#...#', '#...#', '#...#', '#...#', '####.'],
  E: ['#####', '#....', '#....', '####.', '#....', '#....', '#####'],
  F: ['#####', '#....', '#....', '####.', '#....', '#....', '#....'],
  G: ['.###.', '#...#', '#....', '#.###', '#...#', '#...#', '.###.'],
  H: ['#...#', '#...#', '#...#', '#####', '#...#', '#...#', '#...#'],
  I: ['.###.', '..#..', '..#..', '..#..', '..#..', '..#..', '.###.'],
  J: ['..###', '...#.', '...#.', '...#.', '#..#.', '#..#.', '.##..'],
  K: ['#...#', '#..#.', '#.#..', '##...', '#.#..', '#..#.', '#...#'],
  L: ['#....', '#....', '#....', '#....', '#....', '#....', '#####'],
  M: ['#...#', '##.##', '#.#.#', '#...#', '#...#', '#...#', '#...#'],
  N: ['#...#', '##..#', '#.#.#', '#..##', '#...#', '#...#', '#...#'],
  O: ['.###.', '#...#', '#...#', '#...#', '#...#', '#...#', '.###.'],
  P: ['####.', '#...#', '#...#', '####.', '#....', '#....', '#....'],
  Q: ['.###.', '#...#', '#...#', '#...#', '#.#.#', '#..#.', '.##.#'],
  R: ['####.', '#...#', '#...#', '####.', '#.#..', '#..#.', '#...#'],
  S: ['.####', '#....', '#....', '.###.', '....#', '....#', '####.'],
  T: ['#####', '..#..', '..#..', '..#..', '..#..', '..#..', '..#..'],
  U: ['#...#', '#...#', '#...#', '#...#', '#...#', '#...#', '.###.'],
  V: ['#...#', '#...#', '#...#', '#...#', '.#.#.', '.#.#.', '..#..'],
  W: ['#...#', '#...#', '#...#', '#.#.#', '#.#.#', '##.##', '#...#'],
  X: ['#...#', '#...#', '.#.#.', '..#..', '.#.#.', '#...#', '#...#'],
  Y: ['#...#', '#...#', '.#.#.', '..#..', '..#..', '..#..', '..#..'],
  Z: ['#####', '....#', '...#.', '..#..', '.#...', '#....', '#####'],
  '$': ['..#..', '.####', '#.#..', '.###.', '..#.#', '####.', '..#..'],
  '!': ['..#..', '..#..', '..#..', '..#..', '..#..', '.....', '..#..'],
  ':': ['.....', '..#..', '..#..', '.....', '..#..', '..#..', '.....'],
  '/': ['....#', '...#.', '...#.', '..#..', '.#...', '.#...', '#....'],
  '?': ['.###.', '#...#', '....#', '..##.', '..#..', '.....', '..#..'],
  '-': ['.....', '.....', '.....', '#####', '.....', '.....', '.....'],
  '+': ['.....', '..#..', '..#..', '#####', '..#..', '..#..', '.....'],
  '=': ['.....', '.....', '#####', '.....', '#####', '.....', '.....'],
  '>': ['#....', '.#...', '..#..', '...#.', '..#..', '.#...', '#....'],
  '.': ['.....', '.....', '.....', '.....', '.....', '.##..', '.##..'],
  ' ': ['.....', '.....', '.....', '.....', '.....', '.....', '.....'],
};

export function pxBitmapText(
  g: CanvasRenderingContext2D,
  text: string,
  cx: number,
  cy: number,
  scale: number,
  color: string,
  shadowColor?: string
): void {
  const chars = text.split('');
  const charW = 5 * scale;
  const gap = scale;
  const totalW = chars.length * charW + (chars.length - 1) * gap;
  const startX = Math.round(cx - totalW / 2);
  const startY = Math.round(cy - (7 * scale) / 2);

  for (let idx = 0; idx < chars.length; idx++) {
    const bmp = BITMAP_5X7[chars[idx]];
    if (!bmp) continue;
    const gx = startX + idx * (charW + gap);
    for (let r = 0; r < 7; r++) {
      for (let c = 0; c < 5; c++) {
        if (bmp[r][c] === '#') {
          if (shadowColor) {
            g.fillStyle = shadowColor;
            g.fillRect(gx + c * scale + scale, startY + r * scale + scale, scale, scale);
          }
          g.fillStyle = color;
          g.fillRect(gx + c * scale, startY + r * scale, scale, scale);
        }
      }
    }
  }
}
