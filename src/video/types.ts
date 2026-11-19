export interface SrtCue {
  id: number;
  start: number; // seconds
  end: number; // seconds
  text: string;
}

export type TransitionType =
  | 'aperture-open'
  | 'whip-blinds'
  | 'iris-flash'
  | 'razor-wipe'
  | 'invert-strobe'
  | 'camera-pullback'
  | 'ember-curtain'
  | 'gravity-shatter'
  | 'horizon-burst';

export type AspectRatio = '16:9' | '9:16';

export type SceneId =
  | 'intro-signal'
  | 'epic-prologue'
  | 'title-drop'
  | 'recent-hype'
  | 'plot-twist'
  | 'eighty-years'
  | 'peak-frenzy'
  | 'ai-winter'
  | 'golden-age'
  | 'five-stages'
  | 'stage-one-dawn'
  | 'postwar-turing'
  | 'turing-test'
  | 'can-machines-think'
  | 'spark-of-1956'
  | 'dartmouth-pioneers'
  | 'dartmouth-college'
  | 'ai-named'
  | 'wild-optimism'
  | 'logic-dominion'
  | 'stage-two-winter'
  | 'cold-water-splash'
  | 'combinatorial-explosion'
  | 'mainframe-overload'
  | 'overhyped-pie'
  | 'funding-cuts'
  | 'first-ai-winter'
  | 'ember-thaw-1980s'
  | 'expert-systems'
  | 'fleeting-bloom'
  | 'second-ai-winter'
  | 'stage-three-data'
  | 'abandon-hardcode'
  | 'machine-learning-rise'
  | 'milestone-1997'
  | 'deep-blue-victory'
  | 'beyond-human-peak'
  | 'specialist-student'
  | 'stage-four-deep-learning'
  | 'internet-data-deluge'
  | 'gpu-compute-surge'
  | 'neural-network-awakening'
  | 'alexnet-imagenet-2012'
  | 'computer-sees-world'
  | 'alphago-2016'
  | 'go-last-bastion'
  | 'modern-ai-prelude'
  | 'stage-five-agi-dawn'
  | 'transformer-llm-birth'
  | 'multimodal-allrounder'
  | 'humanlike-creativity'
  | 'spark-to-world-tree'
  | 'civilization-revolution'
  | 'winter-and-breakthrough'
  | 'witness-and-writer-finale';

export interface SceneCut {
  id: SceneId;
  index: number;
  title: string;
  keyLine: string;
  start: number;
  end: number;
  accentColor: string;
  secondaryColor: string;
  bgColor: string;
  transitionIn: TransitionType;
  transitionLabel: string;
  transitionDuration: number;
  visualNote: string;
}

export interface PureVisualSceneContext {
  ctx: CanvasRenderingContext2D;
  w: number;
  h: number;
  isPortrait: boolean;
  time: number;
  localTime: number;
  progress: number;
  energy: number;
  intensity: number;
  scene: SceneCut;
}

export interface RenderSettings {
  aspectRatio: AspectRatio;
  showSubtitles: boolean;
  motionIntensity: number; // 0.6 to 1.35
}

export interface ActiveTransition {
  type: TransitionType;
  progress: number; // 0 to 1 across transition window
  cutTime: number;
  fromScene: SceneCut;
  toScene: SceneCut;
}

export interface ExportStatus {
  state: 'idle' | 'recording' | 'encoding' | 'done' | 'error';
  progress: number; // 0..1
  message?: string;
  downloadUrl?: string;
}
