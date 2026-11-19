import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {
  CLIP_DURATION,
  DEFAULT_30S_SRT,
  formatTimecode,
  getActiveCue,
  parseSrt,
  parseSrtTimestamp,
} from './srtParser';

test('parseSrtTimestamp converts SRT timestamps to exact seconds', () => {
  assert.equal(parseSrtTimestamp('00:00:00,000'), 0);
  assert.equal(parseSrtTimestamp('00:00:02,266'), 2.266);
  assert.equal(parseSrtTimestamp('00:00:29,866'), 29.866);
  assert.equal(parseSrtTimestamp('00:01:14,700'), 74.7);
});

test('parseSrt parses real uploaded SRT file completely through Finale (314.5s / 155 cues)', () => {
  const srtPath = path.resolve(process.cwd(), 'public/assets/aistudio/ai____416e1634.srt');
  const rawFile = fs.readFileSync(srtPath, 'utf8');
  const fullCues = parseSrt(rawFile);
  assert.equal(fullCues.length, 155, 'Expected full SRT file to contain exactly 155 cues');

  const clipped = parseSrt(rawFile, CLIP_DURATION);
  assert.equal(clipped.length, 155);
  assert.equal(clipped[0].text, '欢迎来到今天的AI专题分享');
  assert.equal(clipped[7].text, '但其实');
  assert.equal(clipped[13].text, '最终迎来了如今改变世界的璀璨盛世');
  assert.equal(clipped[24].text, '提出了著名的“图灵测试”');
  assert.equal(clipped[29].text, '紧接着在1956年');
  assert.equal(clipped[37].text, '“人工智能”');
  assert.equal(clipped[49].text, 'AI 统治世界的时代马上就要来了');
  assert.equal(clipped[50].text, '第二阶段');
  assert.equal(clipped[70].text, '这就是人工智能史上的第一个AI寒冬');
  assert.equal(clipped[81].text, '迎来了第二个寒冬');
  assert.equal(clipped[82].text, '第三阶段：');
  assert.equal(clipped[91].text, '统计学方法和机器学习开始大行其道');
  assert.equal(clipped[99].text, '击败了人类国际象棋世界冠军卡斯帕罗夫');
  assert.equal(clipped[106].text, '本质上还是个“偏科生”');
  assert.equal(clipped[109].text, '深度学习革命');
  assert.equal(clipped[115].text, 'GPU的飞速发展带来了前所未有的强大算力');
  assert.equal(clipped[119].text, '迎来了爆发');
  assert.equal(clipped[121].text, '深度学习模型 AlexNet');
  assert.equal(clipped[124].text, '计算机终于“看清”了这个世界');
  assert.equal(clipped[127].text, '以 4:1 击败了围棋世界冠军李世石');
  assert.equal(clipped[132].text, '第五阶段');
  assert.equal(clipped[136].text, 'AI 的发展速度已经用“日新月异”都嫌慢来形容了');
  assert.equal(clipped[137].text, '从 Transformer 架构的诞生');
  assert.equal(clipped[139].text, '再到如今的文本、图像、视频、音频多模态全能 AI');
  assert.equal(clipped[145].text, '到今天赋能千行百业的参天大树');
  assert.equal(clipped[151].text, '每一次爆发都是底层逻辑的革新');
  assert.equal(clipped[154].text, '也是未来的书写者');
  assert.equal(clipped[154].end, 314.233);
});

test('DEFAULT_30S_SRT matches all 155 cues through 314.5s and bridges micro-gaps', () => {
  const cues = parseSrt(DEFAULT_30S_SRT, CLIP_DURATION);
  assert.equal(cues.length, 155);
  assert.equal(getActiveCue(cues, 0.5)?.text, '欢迎来到今天的AI专题分享');
  assert.equal(getActiveCue(cues, 14.9)?.text, '但其实');
  assert.equal(getActiveCue(cues, 15.44)?.text, '但其实');
  assert.equal(getActiveCue(cues, 28.5)?.text, '最终迎来了如今改变世界的璀璨盛世');
  assert.equal(getActiveCue(cues, 48.2)?.text, '提出了著名的“图灵测试”');
  assert.equal(getActiveCue(cues, 61.8)?.text, '约翰·麦卡锡');
  assert.equal(getActiveCue(cues, 71.5)?.text, '“人工智能”');
  assert.equal(getActiveCue(cues, 98.5)?.text, '理想很丰满');
  assert.equal(getActiveCue(cues, 129.0)?.text, '美国和英国的政府及军方');
  assert.equal(getActiveCue(cues, 152.0)?.text, '它把某个特定领域专家的知识写进规则库里');
  assert.equal(getActiveCue(cues, 159.3)?.text, '但也仅仅是昙花一现');
  assert.equal(getActiveCue(cues, 163.2)?.text, '迎来了第二个寒冬');
  assert.equal(getActiveCue(cues, 168.5)?.text, '拥抱数据');
  assert.equal(getActiveCue(cues, 192.2)?.text, '1997年');
  assert.equal(getActiveCue(cues, 196.8)?.text, '击败了人类国际象棋世界冠军卡斯帕罗夫');
  assert.equal(getActiveCue(cues, 205.8)?.text, '已经超越了人类巅峰');
  assert.equal(getActiveCue(cues, 209.0)?.text, '本质上还是个“偏科生”');
  assert.equal(getActiveCue(cues, 215.5)?.text, '大数据 + 大算力 + 神经网络');
  assert.equal(getActiveCue(cues, 225.2)?.text, 'GPU的飞速发展带来了前所未有的强大算力');
  assert.equal(getActiveCue(cues, 233.4)?.text, '迎来了爆发');
  assert.equal(getActiveCue(cues, 238.5)?.text, '在 ImageNet 图像识别大赛中一战成名');
  assert.equal(getActiveCue(cues, 243.0)?.text, '计算机终于“看清”了这个世界');
  assert.equal(getActiveCue(cues, 248.5)?.text, '以 4:1 击败了围棋世界冠军李世石');
  assert.equal(getActiveCue(cues, 252.5)?.text, '曾被视为人类智力防线的最后堡垒');
  assert.equal(getActiveCue(cues, 258.5)?.text, '也正式拉开了现代 AI 狂飙突进的序幕');
  assert.equal(getActiveCue(cues, 262.0)?.text, '大模型与通用人工智能曙光');
  assert.equal(getActiveCue(cues, 269.5)?.text, 'AI 的发展速度已经用“日新月异”都嫌慢来形容了');
  assert.equal(getActiveCue(cues, 274.5)?.text, '到以 ChatGPT 为代表的大语言模型橫空出世');
  assert.equal(getActiveCue(cues, 279.5)?.text, '再到如今的文本、图像、视频、音频多模态全能 AI');
  assert.equal(getActiveCue(cues, 288.5)?.text, '艺术创作甚至是情感共鸣的能力');
  assert.equal(getActiveCue(cues, 294.0)?.text, '到今天赋能千行百业的参天大树');
  assert.equal(getActiveCue(cues, 300.0)?.text, '更是一次深刻重塑人类文明的工业革命');
  assert.equal(getActiveCue(cues, 307.5)?.text, '每一次爆发都是底层逻辑的革新');
  assert.equal(getActiveCue(cues, 313.5)?.text, '也是未来的书写者');
});

test('formatTimecode formats broadcast MM:SS.CC cleanly', () => {
  assert.equal(formatTimecode(0), '00:00.00');
  assert.equal(formatTimecode(8.366), '00:08.36');
  assert.equal(formatTimecode(14.633), '00:14.63');
  assert.equal(formatTimecode(60), '01:00.00');
  assert.equal(formatTimecode(95.8), '01:35.80');
  assert.equal(formatTimecode(164.0), '02:44.00');
  assert.equal(formatTimecode(198.6), '03:18.60');
  assert.equal(formatTimecode(234.2), '03:54.20');
  assert.equal(formatTimecode(271.0), '04:31.00');
  assert.equal(formatTimecode(314.5), '05:14.50');
});
