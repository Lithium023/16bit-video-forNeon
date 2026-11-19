import test from 'node:test';
import assert from 'node:assert/strict';
import {
  computeVoiceEnergyTimeline,
  getExportConfig,
  selectSupportedMediaRecorderMime,
} from './videoExporter';

test('getExportConfig defaults to native 1920x1080 Full HD for 16:9 and 1080x1920 for 9:16', () => {
  const landscape1080 = getExportConfig('16:9', '1080p');
  assert.equal(landscape1080.width, 1920);
  assert.equal(landscape1080.height, 1080);
  assert.equal(landscape1080.fps, 30);
  assert.equal(landscape1080.resolutionTag, '1920x1080');
  assert.equal(landscape1080.videoBitsPerSecond, 14_000_000);

  const portrait1080 = getExportConfig('9:16', '1080p');
  assert.equal(portrait1080.width, 1080);
  assert.equal(portrait1080.height, 1920);
  assert.equal(portrait1080.resolutionTag, '1080x1920');

  const landscape720 = getExportConfig('16:9', '720p');
  assert.equal(landscape720.width, 1280);
  assert.equal(landscape720.height, 720);
  assert.equal(landscape720.resolutionTag, '1280x720');

  const portrait720 = getExportConfig('9:16', '720p');
  assert.equal(portrait720.width, 720);
  assert.equal(portrait720.height, 1280);
  assert.equal(portrait720.resolutionTag, '720x1280');
});

test('selectSupportedMediaRecorderMime prioritizes H.264/AAC MP4 over WebM', () => {
  const mp4Choice = selectSupportedMediaRecorderMime(
    (m) => m === 'video/mp4;codecs=avc1.42E01E,mp4a.40.2' || m === 'video/webm;codecs=vp9,opus'
  );
  assert.equal(mp4Choice.extension, 'mp4');
  assert.equal(mp4Choice.mimeType, 'video/mp4;codecs=avc1.42E01E,mp4a.40.2');

  const webmFallback = selectSupportedMediaRecorderMime((m) => m === 'video/webm;codecs=vp9,opus');
  assert.equal(webmFallback.extension, 'webm');
  assert.equal(webmFallback.mimeType, 'video/webm;codecs=vp9,opus');
});

test('computeVoiceEnergyTimeline returns normalized [0, 1] energies reflecting signal amplitude', () => {
  const sampleRate = 48000;
  const fps = 30;
  const totalFrames = 60;
  const samples = new Float32Array(sampleRate * 2);
  // First second silent, second second audible 440Hz tone
  for (let i = sampleRate; i < samples.length; i++) {
    samples[i] = Math.sin((2 * Math.PI * 440 * i) / sampleRate) * 0.25;
  }
  const energies = computeVoiceEnergyTimeline(samples, sampleRate, totalFrames, fps);
  assert.equal(energies.length, totalFrames);
  assert.ok(energies[10] < 0.01);
  assert.ok(energies[50] > 0.3 && energies[50] <= 1.0);
});
