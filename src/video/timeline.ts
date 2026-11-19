import { CLIP_DURATION } from './srtParser';
import type { ActiveTransition, SceneCut } from './types';

export const SCENE_CUTS: SceneCut[] = [
  {
    id: 'intro-signal',
    index: 1,
    title: '开篇信号',
    keyLine: '欢迎来到今天的AI专题分享',
    start: 0.0,
    end: 2.266,
    accentColor: '#F59E0B',
    secondaryColor: '#FDE68A',
    bgColor: '#07080B',
    transitionIn: 'aperture-open',
    transitionLabel: 'CRT 显像管开机',
    transitionDuration: 0.48,
    visualNote: '深夜像素工作室：雨夜窗景、暖光台灯、咖啡热气、CRT开机与「AI 专题分享」',
  },
  {
    id: 'epic-prologue',
    index: 2,
    title: '魔幻与波澜',
    keyLine: '人类历史上最魔幻、最波澜壮阔的篇章',
    start: 2.266,
    end: 8.366,
    accentColor: '#F59E0B',
    secondaryColor: '#60A5FA',
    bgColor: '#080A12',
    transitionIn: 'whip-blinds',
    transitionLabel: '穿屏推进转场',
    transitionDuration: 0.62,
    visualNote: '穿入屏幕进入浮空岛星盘「最魔幻」，6.63s 丝滑升起日落灯塔与五层巨浪「波澜壮阔」',
  },
  {
    id: 'title-drop',
    index: 3,
    title: '主标题落版',
    keyLine: '人工智能的发展史',
    start: 8.366,
    end: 10.266,
    accentColor: '#F59E0B',
    secondaryColor: '#F5F2EB',
    bgColor: '#0B0C10',
    transitionIn: 'iris-flash',
    transitionLabel: '金色光圈扩镜',
    transitionDuration: 0.56,
    visualNote: '极光山脉与悬浮芯片圣殿，RPG 标题牌「人工智能 · 的发展史」拉远定格',
  },
  {
    id: 'recent-hype',
    index: 4,
    title: '当代认知误区',
    keyLine: '这两年突然爆发的高科技',
    start: 10.266,
    end: 14.633,
    accentColor: '#3B82F6',
    secondaryColor: '#F59E0B',
    bgColor: '#090D16',
    transitionIn: 'razor-wipe',
    transitionLabel: '丝滑横移摇镜',
    transitionDuration: 0.56,
    visualNote: '双层视差像素都市夜景与屋顶大屏曲线飙升，像素烟花引爆「突然爆发」',
  },
  {
    id: 'plot-twist',
    index: 5,
    title: '高能反转硬切',
    keyLine: '但其实',
    start: 14.633,
    end: 15.466,
    accentColor: '#E11D48',
    secondaryColor: '#0A0A0C',
    bgColor: '#F5F2EB',
    transitionIn: 'invert-strobe',
    transitionLabel: '磁带拉丝快切',
    transitionDuration: 0.26,
    visualNote: '掌机橄榄绿液晶反色硬切，高速回卷卡带与强对比「但其实」弹出',
  },
  {
    id: 'eighty-years',
    index: 6,
    title: '八十年历史拉长',
    keyLine: '走过了快八十年的风风雨雨',
    start: 15.466,
    end: 20.733,
    accentColor: '#F59E0B',
    secondaryColor: '#E4E4E7',
    bgColor: '#090A0E',
    transitionIn: 'camera-pullback',
    transitionLabel: '像素抖动溶镜',
    transitionDuration: 0.42,
    visualNote: '1950–2026 历史高架路灯回溯，红伞像素旅人顶着斜风细雨走过「80 年」',
  },
  {
    id: 'peak-frenzy',
    index: 7,
    title: '出生即巅峰',
    keyLine: '经历过出生即巅峰的狂热',
    start: 20.733,
    end: 24.266,
    accentColor: '#F97316',
    secondaryColor: '#FACC15',
    bgColor: '#160906',
    transitionIn: 'ember-curtain',
    transitionLabel: '镜头仰拍直上',
    transitionDuration: 0.58,
    visualNote: '镜头连贯上摇穿云：16-Bit 火箭喷火直冲云霄奔向金冠，「出生即巅峰」弹出',
  },
  {
    id: 'ai-winter',
    index: 8,
    title: '冰冷刺骨寒冬',
    keyLine: '也跌入过冰冷刺骨的寒冬',
    start: 24.266,
    end: 26.700,
    accentColor: '#38BDF8',
    secondaryColor: '#E0F2FE',
    bgColor: '#050C17',
    transitionIn: 'gravity-shatter',
    transitionLabel: '镜头失重俯冲',
    transitionDuration: 0.58,
    visualNote: '镜头顺势下坠入雪夜松林：温度计骤降至 -40°C，冻僵小机器人与「AI 寒冬」',
  },
  {
    id: 'golden-age',
    index: 9,
    title: '璀璨盛世',
    keyLine: '最终迎来了如今改变世界的璀璨盛世',
    start: 26.700,
    end: 29.866,
    accentColor: '#F59E0B',
    secondaryColor: '#FEF3C7',
    bgColor: '#090807',
    transitionIn: 'horizon-burst',
    transitionLabel: '破晓像素溶镜',
    transitionDuration: 0.65,
    visualNote: '破晓金光融化冰原，自转像素地球连起金色神经光网与「璀璨盛世」定格',
  },
  {
    id: 'five-stages',
    index: 10,
    title: '五个关键阶段',
    keyLine: '把这段历史拆解为五个关键阶段',
    start: 29.866,
    end: 34.900,
    accentColor: '#4AA092',
    secondaryColor: '#FFE08A',
    bgColor: '#122640',
    transitionIn: 'camera-pullback',
    transitionLabel: '全景像素溶镜',
    transitionDuration: 0.58,
    visualNote: '16-Bit RPG 世界航海地图：五座阶段岛屿依次点亮航线，像素飞艇锁定第一阶段',
  },
  {
    id: 'stage-one-dawn',
    index: 11,
    title: '萌芽与诞生',
    keyLine: '第一阶段：萌芽与诞生',
    start: 34.900,
    end: 39.400,
    accentColor: '#7ED4C0',
    secondaryColor: '#FFE08A',
    bgColor: '#1A243A',
    transitionIn: 'iris-flash',
    transitionLabel: '晨曦光圈推进',
    transitionDuration: 0.56,
    visualNote: '晨曦绿野与半埋古铜齿轮，像素嫩芽破土绽放发光灯泡芯片花蕾',
  },
  {
    id: 'postwar-turing',
    index: 12,
    title: '1950 · 阿兰·图灵',
    keyLine: '1950年，计算机科学之父阿兰·图灵',
    start: 39.400,
    end: 45.233,
    accentColor: '#F2B44B',
    secondaryColor: '#D4C7A8',
    bgColor: '#141826',
    transitionIn: 'razor-wipe',
    transitionLabel: '丝滑横移摇镜',
    transitionDuration: 0.56,
    visualNote: '1950 英国战后实验室：哥特夜窗、旋转磁带电子管主机、纸带机与阿兰·图灵金色肖像',
  },
  {
    id: 'turing-test',
    index: 13,
    title: '划时代 · 图灵测试',
    keyLine: '发表划时代论文，提出“图灵测试”',
    start: 45.233,
    end: 49.400,
    accentColor: '#60A5FA',
    secondaryColor: '#F2B44B',
    bgColor: '#121A2A',
    transitionIn: 'whip-blinds',
    transitionLabel: '聚焦穿入推镜',
    transitionDuration: 0.54,
    visualNote: '1950《Mind》论文翻页书写，无缝切入经典三室隔墙像素「图灵测试」电传问答交互',
  },
  {
    id: 'can-machines-think',
    index: 14,
    title: '机器能思考吗',
    keyLine: '他抛出一个振聋发聩的问题：机器能思考吗',
    start: 49.400,
    end: 53.866,
    accentColor: '#F59E0B',
    secondaryColor: '#7ED4C0',
    bgColor: '#0E1224',
    transitionIn: 'invert-strobe',
    transitionLabel: '高能脉冲快切',
    transitionDuration: 0.34,
    visualNote: '深空暗房声呐思潮扩散，发光电路脑脉冲交汇，金色巨型像素问号轰然点亮',
  },
  {
    id: 'spark-of-1956',
    index: 15,
    title: '火种与 1956',
    keyLine: '一颗火种点燃最初幻想，紧接着在1956年',
    start: 53.866,
    end: 59.800,
    accentColor: '#F97316',
    secondaryColor: '#FFE08A',
    bgColor: '#101222',
    transitionIn: 'ember-curtain',
    transitionLabel: '星火仰拍升镜',
    transitionDuration: 0.60,
    visualNote: '金色火种坠入石盆燃起篝火，星火升空连成机器人与齿轮星座，定格悬念「1956 年」',
  },
  {
    id: 'dartmouth-pioneers',
    index: 16,
    title: '1956 · 先驱集结',
    keyLine: '约翰·麦卡锡、马文·明斯基、克劳德·香农等',
    start: 59.800,
    end: 65.266,
    accentColor: '#F2B44B',
    secondaryColor: '#7ED4C0',
    bgColor: '#181422',
    transitionIn: 'iris-flash',
    transitionLabel: '暖金光圈聚焦',
    transitionDuration: 0.52,
    visualNote: '1956 橡木学术讲堂，三位年轻先驱 RPG 黄铜像素肖像随点名依次亮起集结',
  },
  {
    id: 'dartmouth-college',
    index: 17,
    title: '达特茅斯学院',
    keyLine: '在美国达特茅斯学院举办长达两个月的学术会议',
    start: 65.266,
    end: 69.733,
    accentColor: '#7ED4C0',
    secondaryColor: '#FFE08A',
    bgColor: '#1C2C42',
    transitionIn: 'razor-wipe',
    transitionLabel: '校园横移摇镜',
    transitionDuration: 0.54,
    visualNote: '阳光草坪与经典贝克钟楼像素风景，夏末日历从 JUL 翻页至 AUG 记录两个月思想激荡',
  },
  {
    id: 'ai-named',
    index: 18,
    title: '“人工智能”诞生',
    keyLine: '“人工智能”这个词第一次被正式提出',
    start: 69.733,
    end: 74.700,
    accentColor: '#FFE08A',
    secondaryColor: '#4AA092',
    bgColor: '#112224',
    transitionIn: 'camera-pullback',
    transitionLabel: '像素溶镜推进',
    transitionDuration: 0.52,
    visualNote: '复古绿黑板与飞舞粉笔灰，金色手写星芒点亮 ARTIFICIAL INTELLIGENCE 与「人工智能」铭牌',
  },
  {
    id: 'wild-optimism',
    index: 19,
    title: '惊人的乐观预言',
    keyLine: '足够的规则和算力，造出拥有人类全部智慧的机器',
    start: 74.700,
    end: 85.733,
    accentColor: '#4AA092',
    secondaryColor: '#F2B44B',
    bgColor: '#10182A',
    transitionIn: 'ember-curtain',
    transitionLabel: '能量攀升仰镜',
    transitionDuration: 0.58,
    visualNote: '规则积木与算力能量条双管注入复古主机，随预言升起金色全息像素大脑「人类全部智慧」',
  },
  {
    id: 'logic-dominion',
    index: 20,
    title: '逻辑定理与幻想',
    keyLine: '编写逻辑规则解数学题、证明定理，AI统治世界',
    start: 85.733,
    end: 95.733,
    accentColor: '#F59E0B',
    secondaryColor: '#E06055',
    bgColor: '#141226',
    transitionIn: 'whip-blinds',
    transitionLabel: '穿屏全景推镜',
    transitionDuration: 0.56,
    visualNote: 'IF→THEN 穿孔卡与定理黑板勾画 QED，随即拉开黄昏复古科幻天际线与巨型像素机器人幻想',
  },
  {
    id: 'stage-two-winter',
    index: 21,
    title: '第二阶段 · 理想与现实',
    keyLine: '第二阶段：幻灭与寒冬，理想很丰满，现实很骨感',
    start: 95.733,
    end: 100.433,
    accentColor: '#6BB0D6',
    secondaryColor: '#FFE08A',
    bgColor: '#101828',
    transitionIn: 'gravity-shatter',
    transitionLabel: '冰裂坠落转场',
    transitionDuration: 0.56,
    visualNote: '左右反差切屏：左暖金浮空乌托邦城堡 vs 右冰冷钢骨废墟与冻僵机器人',
  },
  {
    id: 'cold-water-splash',
    index: 22,
    title: '一盆冰水泼下',
    keyLine: '然而，现实很快给狂热的人们泼了一盆冷水',
    start: 100.433,
    end: 103.866,
    accentColor: '#A8DDF2',
    secondaryColor: '#6BB0D6',
    bgColor: '#0D1322',
    transitionIn: 'gravity-shatter',
    transitionLabel: '冰水坠落切镜',
    transitionDuration: 0.52,
    visualNote: '巨型铁桶倾泻冰水浇灭狂热篝火，溅起冰冷浪花与升腾蒸汽',
  },
  {
    id: 'combinatorial-explosion',
    index: 23,
    title: '70年代 · 组合爆炸',
    keyLine: '人类思维远比想象复杂，AI 陷入组合爆炸的泥潭',
    start: 103.866,
    end: 115.133,
    accentColor: '#E06055',
    secondaryColor: '#7ED4C0',
    bgColor: '#15101E',
    transitionIn: 'razor-wipe',
    transitionLabel: '思维横移摇镜',
    transitionDuration: 0.54,
    visualNote: '人类思维星网无缝拉裂为无限分叉 IF 决策树，小机器人坠入紫暗泥潭',
  },
  {
    id: 'mainframe-overload',
    index: 24,
    title: '算力内存指数暴涨',
    keyLine: '规则越多，算力内存指数级暴涨，计算机根本扛不住',
    start: 115.133,
    end: 122.166,
    accentColor: '#E06055',
    secondaryColor: '#F2B44B',
    bgColor: '#181122',
    transitionIn: 'razor-wipe',
    transitionLabel: '算力横移摇镜',
    transitionDuration: 0.54,
    visualNote: '过载的 70 年代磁带主机在 CPU / RAM 爆表中震颤喷烟，红屏闪烁 OVERLOAD!',
  },
  {
    id: 'overhyped-pie',
    index: 25,
    title: '过度吹嘘 · 画大饼',
    keyLine: '前期过度吹嘘画大饼，迟迟拿不出实质商业成果',
    start: 122.166,
    end: 127.700,
    accentColor: '#F2B44B',
    secondaryColor: '#E06055',
    bgColor: '#18141E',
    transitionIn: 'iris-flash',
    transitionLabel: '聚光光圈扩镜',
    transitionDuration: 0.48,
    visualNote: '不断膨胀的金色 AI 100% 大饼气球被细针戳破，只剩空台上的 $0 铭牌',
  },
  {
    id: 'funding-cuts',
    index: 26,
    title: '美英大幅削减经费',
    keyLine: '美国和英国的政府及军方开始大幅削减 AI 研究经费',
    start: 127.700,
    end: 132.100,
    accentColor: '#E06055',
    secondaryColor: '#7ED4C0',
    bgColor: '#141320',
    transitionIn: 'invert-strobe',
    transitionLabel: '警示光栅快切',
    transitionDuration: 0.36,
    visualNote: '美英旗徽下巨型红剪刀咔嚓腰斩 AI FUNDING 经费条，金币散落并盖印 CUT!',
  },
  {
    id: 'first-ai-winter',
    index: 27,
    title: '第一个 AI 寒冬',
    keyLine: '实验室门庭冷落、人员转行，陷入十几年沉寂',
    start: 132.100,
    end: 141.533,
    accentColor: '#A8DDF2',
    secondaryColor: '#6BB0D6',
    bgColor: '#0D1729',
    transitionIn: 'camera-pullback',
    transitionLabel: '风雪溶镜拉远',
    transitionDuration: 0.58,
    visualNote: '暴雪冰封的废弃实验室：蛛网覆盖熄灭主机、摇晃 CLOSED 牌，研究员抱箱离去',
  },
  {
    id: 'ember-thaw-1980s',
    index: 28,
    title: '80年代 · 火种未熄',
    keyLine: '不过科学的火种并没有熄灭，80年代初迎来回暖',
    start: 141.533,
    end: 146.200,
    accentColor: '#F2B44B',
    secondaryColor: '#F58E7E',
    bgColor: '#1B223B',
    transitionIn: 'horizon-burst',
    transitionLabel: '余烬破晓溶镜',
    transitionDuration: 0.62,
    visualNote: '雪地深处金色火种重燃，融化冰霜并迎来 1980S 暖金晨曦',
  },
  {
    id: 'expert-systems',
    index: 29,
    title: '专家系统 · 商业落地',
    keyLine: '把专家知识写进规则库，AI 第一次有了商业落地价值',
    start: 146.200,
    end: 158.333,
    accentColor: '#7ED4C0',
    secondaryColor: '#FFE08A',
    bgColor: '#181A24',
    transitionIn: 'whip-blinds',
    transitionLabel: '穿镜聚焦推镜',
    transitionDuration: 0.56,
    visualNote: '专家将金色典籍灌入 80 年代 RULE DB 工作站，点亮医疗产业与飙升收益 $$$',
  },
  {
    id: 'fleeting-bloom',
    index: 30,
    title: '昙花一现',
    keyLine: '但也仅仅是昙花一现',
    start: 158.333,
    end: 160.333,
    accentColor: '#FFE08A',
    secondaryColor: '#A8DDF2',
    bgColor: '#0C1124',
    transitionIn: 'camera-pullback',
    transitionLabel: '像素抖动溶镜',
    transitionDuration: 0.50,
    visualNote: '深蓝夜幕下金色像素昙花瞬息盛放，转眼化作漫天漂浮的青白冰晶',
  },
  {
    id: 'second-ai-winter',
    index: 31,
    title: '维护崩塌 · 第二寒冬',
    keyLine: '很快因为规则维护成本太高，迎来了第二个寒冬',
    start: 160.333,
    end: 163.900,
    accentColor: '#6BB0D6',
    secondaryColor: '#E06055',
    bgColor: '#091022',
    transitionIn: 'gravity-shatter',
    transitionLabel: '冰晶下坠转场',
    transitionDuration: 0.54,
    visualNote: '承接冰晶下坠：摇晃的 RULE 积木塔在 COST $999K 飙升中轰然倒塌入松林暴雪',
  },
  {
    id: 'stage-three-data',
    index: 32,
    title: '第三阶段 · 拥抱数据',
    keyLine: '第三阶段：统计学崛起与标志性胜利，换个思路拥抱数据',
    start: 163.900,
    end: 169.466,
    accentColor: '#7ED4C0',
    secondaryColor: '#FFE08A',
    bgColor: '#0E1C2E',
    transitionIn: 'horizon-burst',
    transitionLabel: '破冰晨曦溶镜',
    transitionDuration: 0.62,
    visualNote: '冰原破晓升起发光数据棱镜，金色与青色 0/1 数据海浪涌向星穹',
  },
  {
    id: 'abandon-hardcode',
    index: 33,
    title: '告别硬编码 · 自主学习',
    keyLine: '靠硬编码规则行不通了，让机器从数据中自己学习',
    start: 169.466,
    end: 178.966,
    accentColor: '#F2B44B',
    secondaryColor: '#7ED4C0',
    bgColor: '#12182A',
    transitionIn: 'razor-wipe',
    transitionLabel: '思路横移摇镜',
    transitionDuration: 0.54,
    visualNote: '左侧旧硬编码规则墙碎裂打叉，光桥连接右侧自学习像素核心吞吐流动数据块',
  },
  {
    id: 'machine-learning-rise',
    index: 34,
    title: '统计学与机器学习',
    keyLine: '给它成千上万个例子，让它自己寻找规律',
    start: 178.966,
    end: 188.900,
    accentColor: '#4AA092',
    secondaryColor: '#FFE08A',
    bgColor: '#0F1B2B',
    transitionIn: 'iris-flash',
    transitionLabel: '统计光圈扩镜',
    transitionDuration: 0.52,
    visualNote: '海量青金样本点涌入坐标系，正态分布与金色拟合决策曲线自动校准锁定规律',
  },
  {
    id: 'milestone-1997',
    index: 35,
    title: '1997 · 标志性事件',
    keyLine: '这个时代的标志性事件，1997年',
    start: 188.900,
    end: 192.800,
    accentColor: '#F2B44B',
    secondaryColor: '#E06055',
    bgColor: '#111324',
    transitionIn: 'camera-pullback',
    transitionLabel: '聚光溶镜推进',
    transitionDuration: 0.52,
    visualNote: '深蓝赛场大幕拉开，暖金舞台聚光灯锁定锦标赛棋桌与 1997 霓虹灯牌',
  },
  {
    id: 'deep-blue-victory',
    index: 36,
    title: 'IBM“深蓝”击败冠军',
    keyLine: 'IBM 超级计算机“深蓝”击败国际象棋世界冠军卡斯帕罗夫',
    start: 192.800,
    end: 198.500,
    accentColor: '#38BDF8',
    secondaryColor: '#FFE08A',
    bgColor: '#0A1228',
    transitionIn: 'whip-blinds',
    transitionLabel: '穿镜对决推镜',
    transitionDuration: 0.56,
    visualNote: 'IBM 深蓝巨型主机阵列对决卡斯帕罗夫：金色骑士跃过棋盘绝杀并升起冠军金冠',
  },
  {
    id: 'beyond-human-peak',
    index: 37,
    title: '超越人类巅峰',
    keyLine: '机器的计算和搜索能力，已经超越了人类巅峰',
    start: 198.500,
    end: 206.900,
    accentColor: '#FFE08A',
    secondaryColor: '#7ED4C0',
    bgColor: '#0B1630',
    transitionIn: 'iris-flash',
    transitionLabel: '荣耀光圈扩镜',
    transitionDuration: 0.58,
    visualNote: '像素地球向全球广播胜利电波，右侧算力搜索光柱直冲云霄超越人类巅峰线',
  },
  {
    id: 'specialist-student',
    index: 38,
    title: '偏科生 · 刻板计算',
    keyLine: '但此时的 AI 本质上还是个“偏科生”，只会刻板计算',
    start: 206.900,
    end: 212.266,
    accentColor: '#E06055',
    secondaryColor: '#F2B44B',
    bgColor: '#1C1E30',
    transitionIn: 'invert-strobe',
    transitionLabel: '光栅反转快切',
    transitionDuration: 0.42,
    visualNote: '像素学生机器人展示极端偏科成绩单（象棋 A+、视觉/语音 F）并盖下 RIGID 印章',
  },
  {
    id: 'stage-four-deep-learning',
    index: 39,
    title: '第四阶段 · 深度学习',
    keyLine: '第四阶段：深度学习革命，大数据 + 大算力 + 神经网络',
    start: 212.266,
    end: 217.266,
    accentColor: '#7ED4C0',
    secondaryColor: '#F2B44B',
    bgColor: '#12102C',
    transitionIn: 'horizon-burst',
    transitionLabel: '革命破晓溶镜',
    transitionDuration: 0.68,
    visualNote: '深蓝紫星穹圣坛：大数据、GPU 算力与神经网络三大像素圣物依次点亮连成能量三角',
  },
  {
    id: 'internet-data-deluge',
    index: 40,
    title: '2010年代 · 海量数据',
    keyLine: '随着互联网爆发，人类积累了海量的数据',
    start: 217.266,
    end: 222.733,
    accentColor: '#38BDF8',
    secondaryColor: '#7ED4C0',
    bgColor: '#0A1A30',
    transitionIn: 'razor-wipe',
    transitionLabel: '数据横移摇镜',
    transitionDuration: 0.56,
    visualNote: '手机与电脑像素终端向云端发射漫天数据包，巨型 BIG DATA 数据仓被五彩数据块填满',
  },
  {
    id: 'gpu-compute-surge',
    index: 41,
    title: 'GPU · 强大算力',
    keyLine: 'GPU 的飞速发展带来了前所未有的强大算力',
    start: 222.733,
    end: 227.166,
    accentColor: '#F2B44B',
    secondaryColor: '#7ED4C0',
    bgColor: '#101424',
    transitionIn: 'whip-blinds',
    transitionLabel: '算力推进切镜',
    transitionDuration: 0.54,
    visualNote: '双风扇巨型 16-Bit GPU 显卡全速运转，中央 36 核并行矩阵以闪电波浪齐齐点亮',
  },
  {
    id: 'neural-network-awakening',
    index: 42,
    title: '人工神经网络爆发',
    keyLine: '模仿人类大脑神经元结构的人工神经网络，迎来了爆发',
    start: 227.166,
    end: 234.066,
    accentColor: '#FFE08A',
    secondaryColor: '#E06055',
    bgColor: '#0D1029',
    transitionIn: 'camera-pullback',
    transitionLabel: '神经溶镜扩镜',
    transitionDuration: 0.66,
    visualNote: '五层深度人工神经网络逐层点亮金色突触脉冲，最终化作星爆光束全面觉醒爆发',
  },
  {
    id: 'alexnet-imagenet-2012',
    index: 43,
    title: '2012 · AlexNet 一战成名',
    keyLine: '2012年，深度学习模型 AlexNet 在 ImageNet 图像识别大赛中一战成名',
    start: 234.066,
    end: 239.766,
    accentColor: '#7ED4C0',
    secondaryColor: '#FFE08A',
    bgColor: '#0E172E',
    transitionIn: 'iris-flash',
    transitionLabel: '视觉光圈聚焦',
    transitionDuration: 0.56,
    visualNote: '卷积特征层扫描像素猫咪并标出 CAT 99%，ImageNet 赛场灯牌下 AlexNet 夺冠升杯',
  },
  {
    id: 'computer-sees-world',
    index: 44,
    title: '计算机“看清”世界',
    keyLine: '错误率远远甩开传统算法，计算机终于“看清”了这个世界',
    start: 239.766,
    end: 244.333,
    accentColor: '#38BDF8',
    secondaryColor: '#FFE08A',
    bgColor: '#121E36',
    transitionIn: 'razor-wipe',
    transitionLabel: '视界横移摇镜',
    transitionDuration: 0.52,
    visualNote: '左屏错误率曲线断崖甩开传统算法，右屏像素之眼睁开为树、车与天空打上实时识别框',
  },
  {
    id: 'alphago-2016',
    index: 45,
    title: '2016 · AlphaGo 4:1',
    keyLine: '2016年，DeepMind 的 AlphaGo 以 4:1 击败了围棋世界冠军李世石',
    start: 244.333,
    end: 249.900,
    accentColor: '#F2B44B',
    secondaryColor: '#7ED4C0',
    bgColor: '#141728',
    transitionIn: 'camera-pullback',
    transitionLabel: '棋盘像素溶镜',
    transitionDuration: 0.58,
    visualNote: '温润木纹 19×19 像素围棋盘：黑白落子光波荡开第 37 手神之一手，大屏定格 4:1',
  },
  {
    id: 'go-last-bastion',
    index: 46,
    title: '人类智力的最后堡垒',
    keyLine: '围棋由于变化莫测，曾被视为人类智力防线的最后堡垒',
    start: 249.900,
    end: 254.100,
    accentColor: '#E06055',
    secondaryColor: '#FFE08A',
    bgColor: '#111229',
    transitionIn: 'whip-blinds',
    transitionLabel: '星河穿镜推镜',
    transitionDuration: 0.52,
    visualNote: '10^170 围棋棋局星河之上矗立巍峨像素智力城堡，青金神经网络光束缓缓穿透城垣',
  },
  {
    id: 'modern-ai-prelude',
    index: 47,
    title: '现代 AI 狂飙序幕',
    keyLine: 'AlphaGo 的胜利彻底震撼全球，正式拉开现代 AI 狂飙突进的序幕',
    start: 254.100,
    end: 260.066,
    accentColor: '#F97316',
    secondaryColor: '#7ED4C0',
    bgColor: '#0D132B',
    transitionIn: 'ember-curtain',
    transitionLabel: '冲霄仰拍升镜',
    transitionDuration: 0.60,
    visualNote: '全球像素地图被金色冲击波点亮，天幕大幕拉开，像素超音速列车沿指数光轨冲向未来',
  },
  {
    id: 'stage-five-agi-dawn',
    index: 48,
    title: '第五阶段 · 大模型与 AGI 曙光',
    keyLine: '第五阶段：大模型与通用人工智能曙光，发展速度用“日新月异”都嫌慢',
    start: 260.066,
    end: CLIP_DURATION,
    accentColor: '#FFE08A',
    secondaryColor: '#7ED4C0',
    bgColor: '#0C122B',
    transitionIn: 'horizon-burst',
    transitionLabel: '曙光破晓溶镜',
    transitionDuration: 0.72,
    visualNote: '像素旭日与多模态大模型圣殿升起，时间线加速跃迁至当代，万物互联展现日新月异的 AGI 曙光',
  },
];

// --- Easing & Math Utilities ---

export function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}

export function clamp01(val: number): number {
  return clamp(val, 0, 1);
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = clamp01((x - edge0) / (edge1 - edge0));
  return t * t * (3 - 2 * t);
}

export function easeOutExpo(t: number): number {
  const x = clamp01(t);
  return x === 1 ? 1 : 1 - Math.pow(2, -10 * x);
}

export function easeInExpo(t: number): number {
  const x = clamp01(t);
  return x === 0 ? 0 : Math.pow(2, 10 * x - 10);
}

export function easeOutCubic(t: number): number {
  const x = clamp01(t);
  return 1 - Math.pow(1 - x, 3);
}

export function easeInOutQuint(t: number): number {
  const x = clamp01(t);
  return x < 0.5 ? 16 * x * x * x * x * x : 1 - Math.pow(-2 * x + 2, 5) / 2;
}

export function easeOutBack(t: number, overshoot = 1.45): number {
  const x = clamp01(t);
  const c3 = overshoot + 1;
  return 1 + c3 * Math.pow(x - 1, 3) + overshoot * Math.pow(x - 1, 2);
}

export function easeOutQuart(t: number): number {
  const x = clamp01(t);
  return 1 - Math.pow(1 - x, 4);
}

/**
 * Look up the active scene cut and its normalized progress [0, 1] at time t.
 */
export function getSceneAtTime(time: number): {
  scene: SceneCut;
  localTime: number;
  progress: number;
} {
  const t = clamp(time, 0, CLIP_DURATION);
  for (let i = 0; i < SCENE_CUTS.length; i++) {
    const scene = SCENE_CUTS[i];
    const isLast = i === SCENE_CUTS.length - 1;
    if ((t >= scene.start && t < scene.end) || (isLast && t >= scene.start)) {
      const duration = Math.max(0.001, scene.end - scene.start);
      const localTime = Math.max(0, t - scene.start);
      return {
        scene,
        localTime,
        progress: clamp01(localTime / duration),
      };
    }
  }
  const fallback = SCENE_CUTS[0];
  return { scene: fallback, localTime: 0, progress: 0 };
}

/**
 * Return active rhythmic transition state when time t falls inside a cut's transition envelope.
 * Transitions straddle the cut slightly (20% pre-cut anticipation, 80% post-cut impact)
 * for snappy broadcast motion editing feel.
 */
export function getActiveTransition(time: number): ActiveTransition | null {
  const t = clamp(time, 0, CLIP_DURATION);

  for (let i = 0; i < SCENE_CUTS.length; i++) {
    const toScene = SCENE_CUTS[i];
    const fromScene = i > 0 ? SCENE_CUTS[i - 1] : toScene;
    const dur = toScene.transitionDuration;
    const pre = i === 0 ? 0 : dur * 0.42;
    const post = dur * (i === 0 ? 1.0 : 0.58);
    const startWindow = toScene.start - pre;
    const endWindow = toScene.start + post;

    if (t >= startWindow && t <= endWindow) {
      const progress = clamp01((t - startWindow) / Math.max(0.001, endWindow - startWindow));
      return {
        type: toScene.transitionIn,
        progress,
        cutTime: toScene.start,
        fromScene,
        toScene,
      };
    }
  }

  return null;
}

/**
 * Deterministic voice energy curve [0..1] synchronized to speech pacing,
 * blended with live Web Audio analyser energy when playing.
 */
export function getSyntheticVoiceEnergy(time: number): number {
  const t = clamp(time, 0, CLIP_DURATION);
  // Subtle pauses between sentences around 2.2s, 10.2s, 14.6s, 20.7s, 24.2s, 26.6s
  const syllableWave =
    0.45 +
    0.26 * Math.sin(t * 17.3) +
    0.18 * Math.sin(t * 29.1 + 1.2) +
    0.11 * Math.cos(t * 7.4);

  // Boost energy on dramatic climax hits across the 271.0s timeline
  let emphasis = 1.0;
  if (t >= 6.6 && t <= 10.2) emphasis = 1.2;
  if (t >= 14.63 && t <= 15.45) emphasis = 1.35;
  if (t >= 21.4 && t <= 24.2) emphasis = 1.25;
  if (t >= 26.7 && t <= 29.8) emphasis = 1.3;
  if (t >= 34.9 && t <= 39.4) emphasis = 1.18;
  if (t >= 43.1 && t <= 49.4) emphasis = 1.22;
  if (t >= 51.9 && t <= 53.86) emphasis = 1.35;
  if (t >= 55.2 && t <= 59.6) emphasis = 1.25;
  if (t >= 61.2 && t <= 65.2) emphasis = 1.2;
  if (t >= 71.2 && t <= 74.6) emphasis = 1.35;
  if (t >= 78.2 && t <= 85.6) emphasis = 1.24;
  if (t >= 92.5 && t <= 95.6) emphasis = 1.32;
  if (t >= 95.8 && t <= 103.8) emphasis = 1.26;
  if (t >= 112.5 && t <= 122.0) emphasis = 1.34;
  if (t >= 124.3 && t <= 132.0) emphasis = 1.3;
  if (t >= 132.1 && t <= 136.0) emphasis = 1.2;
  if (t >= 145.4 && t <= 158.0) emphasis = 1.25;
  if (t >= 158.4 && t <= 163.8) emphasis = 1.32;
  if (t >= 164.0 && t <= 169.4) emphasis = 1.24;
  if (t >= 175.0 && t <= 188.8) emphasis = 1.22;
  if (t >= 191.8 && t <= 198.4) emphasis = 1.36;
  if (t >= 203.0 && t <= 206.9) emphasis = 1.3;
  if (t >= 212.3 && t <= 217.2) emphasis = 1.32;
  if (t >= 223.4 && t <= 227.1) emphasis = 1.34;
  if (t >= 231.3 && t <= 234.0) emphasis = 1.38;
  if (t >= 235.0 && t <= 239.7) emphasis = 1.3;
  if (t >= 241.8 && t <= 244.3) emphasis = 1.28;
  if (t >= 246.8 && t <= 249.9) emphasis = 1.36;
  if (t >= 251.5 && t <= 254.0) emphasis = 1.26;
  if (t >= 256.8 && t <= 260.0) emphasis = 1.34;
  if (t >= 261.0 && t <= 270.8) emphasis = 1.38;
  if (t >= CLIP_DURATION - 0.3) emphasis = Math.max(0.15, (CLIP_DURATION - t) / 0.3);

  return clamp01(syllableWave * emphasis);
}

/**
 * Compute staggered character/segment reveal progress [0..1] for kinetic typography.
 */
export function getStaggerProgress(
  localTime: number,
  index: number,
  startDelay: number,
  staggerStep: number,
  itemDuration: number
): number {
  const itemStart = startDelay + index * staggerStep;
  return clamp01((localTime - itemStart) / Math.max(0.001, itemDuration));
}
