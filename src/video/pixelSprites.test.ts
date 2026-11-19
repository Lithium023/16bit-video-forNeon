import test from 'node:test';
import assert from 'node:assert/strict';
import {
  BAYER_4X4,
  BITMAP_5X7,
  SPRITE_FROZEN_BOT,
  SPRITE_ROCKET_HERO,
  SPRITE_SHIP_GALLEON,
  SPRITE_TRAVELER_UMBRELLA,
  bayerThreshold,
} from './pixelSprites';

test('bayerThreshold maps 4x4 matrix evenly into (0, 1) across coordinates', () => {
  assert.equal(BAYER_4X4.length, 4);
  const seen = new Set<number>();
  for (let y = 0; y < 4; y++) {
    for (let x = 0; x < 4; x++) {
      const val = bayerThreshold(x, y);
      assert.ok(val > 0 && val < 1, `Expected (0,1), got ${val}`);
      seen.add(val);
    }
  }
  assert.equal(seen.size, 16, '4x4 Bayer matrix should have 16 distinct thresholds');
  // Periodic wrapping
  assert.equal(bayerThreshold(0, 0), bayerThreshold(4, 8));
});

test('16-bit sprites and 5x7 bitmap glyphs have rectangular uniform row widths', () => {
  const sprites = [
    SPRITE_ROCKET_HERO,
    SPRITE_SHIP_GALLEON,
    SPRITE_TRAVELER_UMBRELLA,
    SPRITE_FROZEN_BOT,
  ];
  for (const sprite of sprites) {
    assert.ok(sprite.length >= 8);
    const width = sprite[0].length;
    for (const row of sprite) {
      assert.equal(row.length, width);
    }
  }

  for (const [key, glyph] of Object.entries(BITMAP_5X7)) {
    assert.equal(glyph.length, 7, `Glyph ${key} must be 7 rows tall`);
    for (const row of glyph) {
      assert.equal(row.length, 5, `Glyph ${key} must be 5 columns wide`);
    }
  }
});
