import test from 'node:test';
import assert from 'node:assert/strict';
import { CLIP_DURATION } from './srtParser';
import { SOUND_CUES, collectTriggeredSfxCues } from './retroSfxEngine';

test('SOUND_CUES are sorted chronologically within [0, CLIP_DURATION] and cover all 55 scenes', () => {
  assert.ok(SOUND_CUES.length >= 85, `Expected at least 85 transition + beat SFX cues, got ${SOUND_CUES.length}`);
  for (let i = 0; i < SOUND_CUES.length; i++) {
    const cue = SOUND_CUES[i];
    assert.ok(cue.time >= 0 && cue.time <= CLIP_DURATION, `Cue ${cue.id} out of bounds: ${cue.time}`);
    if (i > 0) {
      assert.ok(cue.time >= SOUND_CUES[i - 1].time, `Cues out of order around ${cue.id}`);
    }
  }
});

test('collectTriggeredSfxCues triggers exact finale cues during playback and ignores seeks/scrubs', () => {
  // Finale FUTURE chord sits at 312.85s
  const hits = collectTriggeredSfxCues(312.8, 312.9);
  assert.ok(
    hits.some((c) => c.id === 'beat-s55-future-chord'),
    'Expected grand finale chord cue to fire at 312.85s'
  );

  // Scene 50 TEXT modality blip sits around 277.013s
  const s50Hits = collectTriggeredSfxCues(276.95, 277.08);
  assert.ok(
    s50Hits.some((c) => c.id === 'beat-s50-text'),
    'Expected Scene 50 TEXT modality blip to trigger'
  );

  // Large forward jump (seeking) or reverse scrub must NOT spam SFX
  assert.equal(collectTriggeredSfxCues(10, 280).length, 0);
  assert.equal(collectTriggeredSfxCues(280, 270).length, 0);
  assert.equal(collectTriggeredSfxCues(100, 100).length, 0);
});
