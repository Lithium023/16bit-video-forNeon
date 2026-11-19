import test from 'node:test';
import assert from 'node:assert/strict';
import { CLIP_DURATION } from './srtParser';
import {
  SCENE_CUTS,
  easeInOutQuint,
  easeOutBack,
  easeOutExpo,
  getActiveTransition,
  getSceneAtTime,
  getStaggerProgress,
  getSyntheticVoiceEnergy,
} from './timeline';

test('SCENE_CUTS cover [0, 271.0] contiguously without gaps or overlaps', () => {
  assert.equal(SCENE_CUTS.length, 48);
  assert.equal(SCENE_CUTS[0].start, 0);
  assert.equal(SCENE_CUTS[SCENE_CUTS.length - 1].end, CLIP_DURATION);

  for (let i = 1; i < SCENE_CUTS.length; i++) {
    assert.equal(
      SCENE_CUTS[i].start,
      SCENE_CUTS[i - 1].end,
      `Gap or overlap between scene ${i} and ${i + 1}`
    );
    assert.ok(SCENE_CUTS[i].end > SCENE_CUTS[i].start);
  }
});

test('getSceneAtTime resolves exact key story beats across 0–198.6s and clamps bounds', () => {
  assert.equal(getSceneAtTime(0).scene.id, 'intro-signal');
  assert.equal(getSceneAtTime(5.0).scene.id, 'epic-prologue');
  assert.equal(getSceneAtTime(9.0).scene.id, 'title-drop');
  assert.equal(getSceneAtTime(12.5).scene.id, 'recent-hype');
  assert.equal(getSceneAtTime(14.8).scene.id, 'plot-twist');
  assert.equal(getSceneAtTime(18.5).scene.id, 'eighty-years');
  assert.equal(getSceneAtTime(22.5).scene.id, 'peak-frenzy');
  assert.equal(getSceneAtTime(25.2).scene.id, 'ai-winter');
  assert.equal(getSceneAtTime(28.5).scene.id, 'golden-age');
  assert.equal(getSceneAtTime(32.5).scene.id, 'five-stages');
  assert.equal(getSceneAtTime(37.0).scene.id, 'stage-one-dawn');
  assert.equal(getSceneAtTime(43.5).scene.id, 'postwar-turing');
  assert.equal(getSceneAtTime(48.0).scene.id, 'turing-test');
  assert.equal(getSceneAtTime(52.5).scene.id, 'can-machines-think');
  assert.equal(getSceneAtTime(56.5).scene.id, 'spark-of-1956');
  assert.equal(getSceneAtTime(62.5).scene.id, 'dartmouth-pioneers');
  assert.equal(getSceneAtTime(67.5).scene.id, 'dartmouth-college');
  assert.equal(getSceneAtTime(72.0).scene.id, 'ai-named');
  assert.equal(getSceneAtTime(80.0).scene.id, 'wild-optimism');
  assert.equal(getSceneAtTime(92.0).scene.id, 'logic-dominion');
  assert.equal(getSceneAtTime(98.5).scene.id, 'stage-two-winter');
  assert.equal(getSceneAtTime(102.0).scene.id, 'cold-water-splash');
  assert.equal(getSceneAtTime(110.0).scene.id, 'combinatorial-explosion');
  assert.equal(getSceneAtTime(119.0).scene.id, 'mainframe-overload');
  assert.equal(getSceneAtTime(125.0).scene.id, 'overhyped-pie');
  assert.equal(getSceneAtTime(129.5).scene.id, 'funding-cuts');
  assert.equal(getSceneAtTime(136.5).scene.id, 'first-ai-winter');
  assert.equal(getSceneAtTime(143.5).scene.id, 'ember-thaw-1980s');
  assert.equal(getSceneAtTime(152.0).scene.id, 'expert-systems');
  assert.equal(getSceneAtTime(159.3).scene.id, 'fleeting-bloom');
  assert.equal(getSceneAtTime(162.0).scene.id, 'second-ai-winter');
  assert.equal(getSceneAtTime(167.0).scene.id, 'stage-three-data');
  assert.equal(getSceneAtTime(175.0).scene.id, 'abandon-hardcode');
  assert.equal(getSceneAtTime(185.0).scene.id, 'machine-learning-rise');
  assert.equal(getSceneAtTime(191.0).scene.id, 'milestone-1997');
  assert.equal(getSceneAtTime(196.0).scene.id, 'deep-blue-victory');
  assert.equal(getSceneAtTime(202.0).scene.id, 'beyond-human-peak');
  assert.equal(getSceneAtTime(209.5).scene.id, 'specialist-student');
  assert.equal(getSceneAtTime(215.0).scene.id, 'stage-four-deep-learning');
  assert.equal(getSceneAtTime(220.5).scene.id, 'internet-data-deluge');
  assert.equal(getSceneAtTime(225.0).scene.id, 'gpu-compute-surge');
  assert.equal(getSceneAtTime(231.0).scene.id, 'neural-network-awakening');
  assert.equal(getSceneAtTime(237.0).scene.id, 'alexnet-imagenet-2012');
  assert.equal(getSceneAtTime(242.0).scene.id, 'computer-sees-world');
  assert.equal(getSceneAtTime(247.5).scene.id, 'alphago-2016');
  assert.equal(getSceneAtTime(252.0).scene.id, 'go-last-bastion');
  assert.equal(getSceneAtTime(257.5).scene.id, 'modern-ai-prelude');
  assert.equal(getSceneAtTime(265.0).scene.id, 'stage-five-agi-dawn');
  assert.equal(getSceneAtTime(271.0).scene.id, 'stage-five-agi-dawn');
  assert.equal(getSceneAtTime(271.0).progress, 1);
});

test('getActiveTransition detects rhythmic transitions around cut points', () => {
  const openTr = getActiveTransition(0.15);
  assert.equal(openTr?.type, 'aperture-open');

  const twistTr = getActiveTransition(14.65);
  assert.equal(twistTr?.type, 'invert-strobe');
  assert.equal(twistTr?.toScene.id, 'plot-twist');

  const winterTr = getActiveTransition(24.30);
  assert.equal(winterTr?.type, 'gravity-shatter');
  assert.equal(winterTr?.toScene.id, 'ai-winter');

  const goldenTr = getActiveTransition(26.75);
  assert.equal(goldenTr?.type, 'horizon-burst');
  assert.equal(goldenTr?.toScene.id, 'golden-age');

  const mapTr = getActiveTransition(29.9);
  assert.equal(mapTr?.type, 'camera-pullback');
  assert.equal(mapTr?.toScene.id, 'five-stages');

  const turingLabTr = getActiveTransition(39.42);
  assert.equal(turingLabTr?.type, 'razor-wipe');
  assert.equal(turingLabTr?.toScene.id, 'postwar-turing');

  const sparkTr = getActiveTransition(53.9);
  assert.equal(sparkTr?.type, 'ember-curtain');
  assert.equal(sparkTr?.toScene.id, 'spark-of-1956');

  const pioneersTr = getActiveTransition(59.85);
  assert.equal(pioneersTr?.type, 'iris-flash');
  assert.equal(pioneersTr?.toScene.id, 'dartmouth-pioneers');

  const aiNamedTr = getActiveTransition(69.78);
  assert.equal(aiNamedTr?.type, 'camera-pullback');
  assert.equal(aiNamedTr?.toScene.id, 'ai-named');

  const logicTr = getActiveTransition(85.78);
  assert.equal(logicTr?.type, 'whip-blinds');
  assert.equal(logicTr?.toScene.id, 'logic-dominion');

  const stage2Tr = getActiveTransition(95.78);
  assert.equal(stage2Tr?.type, 'gravity-shatter');
  assert.equal(stage2Tr?.toScene.id, 'stage-two-winter');

  const splashTr = getActiveTransition(100.48);
  assert.equal(splashTr?.type, 'gravity-shatter');
  assert.equal(splashTr?.toScene.id, 'cold-water-splash');

  const emberTr = getActiveTransition(141.58);
  assert.equal(emberTr?.type, 'horizon-burst');
  assert.equal(emberTr?.toScene.id, 'ember-thaw-1980s');

  const expertTr = getActiveTransition(146.25);
  assert.equal(expertTr?.type, 'whip-blinds');
  assert.equal(expertTr?.toScene.id, 'expert-systems');

  const bloomToWinter2Tr = getActiveTransition(160.38);
  assert.equal(bloomToWinter2Tr?.type, 'gravity-shatter');
  assert.equal(bloomToWinter2Tr?.fromScene.id, 'fleeting-bloom');
  assert.equal(bloomToWinter2Tr?.toScene.id, 'second-ai-winter');

  const stage3Tr = getActiveTransition(163.95);
  assert.equal(stage3Tr?.type, 'horizon-burst');
  assert.equal(stage3Tr?.toScene.id, 'stage-three-data');

  const deepBlueTr = getActiveTransition(192.85);
  assert.equal(deepBlueTr?.type, 'whip-blinds');
  assert.equal(deepBlueTr?.toScene.id, 'deep-blue-victory');

  const peakTr = getActiveTransition(198.55);
  assert.equal(peakTr?.type, 'iris-flash');
  assert.equal(peakTr?.toScene.id, 'beyond-human-peak');

  const specialistTr = getActiveTransition(206.95);
  assert.equal(specialistTr?.type, 'invert-strobe');
  assert.equal(specialistTr?.toScene.id, 'specialist-student');

  const stage4Tr = getActiveTransition(212.3);
  assert.equal(stage4Tr?.type, 'horizon-burst');
  assert.equal(stage4Tr?.toScene.id, 'stage-four-deep-learning');

  const gpuTr = getActiveTransition(222.78);
  assert.equal(gpuTr?.type, 'whip-blinds');
  assert.equal(gpuTr?.toScene.id, 'gpu-compute-surge');

  const neuralTr = getActiveTransition(227.2);
  assert.equal(neuralTr?.type, 'camera-pullback');
  assert.equal(neuralTr?.toScene.id, 'neural-network-awakening');

  const alexTr = getActiveTransition(234.12);
  assert.equal(alexTr?.type, 'iris-flash');
  assert.equal(alexTr?.toScene.id, 'alexnet-imagenet-2012');

  const seeTr = getActiveTransition(239.82);
  assert.equal(seeTr?.type, 'razor-wipe');
  assert.equal(seeTr?.toScene.id, 'computer-sees-world');

  const alphaGoTr = getActiveTransition(244.4);
  assert.equal(alphaGoTr?.type, 'camera-pullback');
  assert.equal(alphaGoTr?.toScene.id, 'alphago-2016');

  const bastionTr = getActiveTransition(249.95);
  assert.equal(bastionTr?.type, 'whip-blinds');
  assert.equal(bastionTr?.toScene.id, 'go-last-bastion');

  const preludeTr = getActiveTransition(254.15);
  assert.equal(preludeTr?.type, 'ember-curtain');
  assert.equal(preludeTr?.toScene.id, 'modern-ai-prelude');

  const stage5Tr = getActiveTransition(260.12);
  assert.equal(stage5Tr?.type, 'horizon-burst');
  assert.equal(stage5Tr?.toScene.id, 'stage-five-agi-dawn');

  // Mid-scene steady state should have no transition
  assert.equal(getActiveTransition(5.5), null);
  assert.equal(getActiveTransition(43.0), null);
  assert.equal(getActiveTransition(79.0), null);
  assert.equal(getActiveTransition(150.0), null);
  assert.equal(getActiveTransition(185.0), null);
  assert.equal(getActiveTransition(220.0), null);
  assert.equal(getActiveTransition(247.0), null);
  assert.equal(getActiveTransition(265.0), null);
});

test('easing, stagger, and voice energy helpers stay within valid bounds', () => {
  assert.equal(easeOutExpo(0), 0);
  assert.equal(easeOutExpo(1), 1);
  assert.equal(easeInOutQuint(0.5), 0.5);
  assert.ok(easeOutBack(0.7) > 1, 'easeOutBack should gently overshoot before settling');
  assert.equal(getStaggerProgress(0.5, 0, 0.1, 0.08, 0.4), 1);
  assert.equal(getStaggerProgress(0.05, 1, 0.1, 0.08, 0.4), 0);

  for (let t = 0; t <= CLIP_DURATION; t += 0.5) {
    const energy = getSyntheticVoiceEnergy(t);
    assert.ok(energy >= 0 && energy <= 1, `Energy out of range at t=${t}: ${energy}`);
  }
});
