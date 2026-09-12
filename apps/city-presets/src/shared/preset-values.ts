// 이 파일은 `presets/export_values.py` 가 만든다. 손으로 고치지 마라.
// 값의 정본은 `presets/grade.py` 의 `PRESETS` 다.

export type PresetParams = {
  exposure?: number;
  brilliance?: number;
  highlights?: number;
  shadows?: number;
  contrast?: number;
  brightness?: number;
  black_point?: number;
  saturation?: number;
  vibrance?: number;
  warmth?: number;
  tint?: number;
  definition?: number;
  vignette?: number;
  grain?: number;
  bloom?: number;
  splitShadow?: [number, number];
  splitHigh?: [number, number];
  hueSat?: [number, number, number][];
};

export const PRESET_VALUES: Record<string, PresetParams> = {
  "01-oslo": {
    exposure: -14,
    shadows: -4,
    contrast: -6,
    black_point: 6,
    saturation: -24,
    warmth: -42,
    tint: 8,
    definition: 4,
    grain: 14,
    splitShadow: [225, 26],
    splitHigh: [215, 12],
  },
  "02-sapporo": {
    exposure: 26,
    brilliance: 22,
    highlights: -20,
    contrast: 10,
    black_point: 2,
    saturation: -40,
    warmth: -12,
    tint: -4,
    definition: 6,
    splitShadow: [205, 9],
  },
  "03-seoul": {
    shadows: -8,
    contrast: 26,
    black_point: 12,
    saturation: -34,
    vibrance: 22,
    warmth: 6,
    tint: -8,
    definition: 22,
    splitHigh: [225, 12],
    hueSat: [
      [52, 45, 30],
      [215, 45, 34],
    ],
  },
  "04-tokyo": {
    exposure: 16,
    brilliance: 14,
    highlights: -20,
    shadows: 14,
    contrast: -12,
    saturation: -2,
    vibrance: 14,
    warmth: 8,
    tint: 9,
    definition: -10,
    grain: 8,
    splitHigh: [345, 6],
  },
  "05-santorini": {
    exposure: 10,
    highlights: -10,
    contrast: 26,
    black_point: 12,
    saturation: 16,
    vibrance: 20,
    warmth: -14,
    tint: -4,
    definition: 18,
    splitHigh: [195, 8],
    hueSat: [
      [195, 55, 40],
      [52, 40, -45],
    ],
  },
  "06-lisbon": {
    highlights: 10,
    shadows: -8,
    contrast: 12,
    black_point: 6,
    vibrance: 16,
    warmth: 30,
    tint: 4,
    definition: 8,
    vignette: 10,
    splitShadow: [220, 14],
    splitHigh: [45, 20],
  },
  "07-havana": {
    shadows: 20,
    contrast: -18,
    black_point: -24,
    saturation: -20,
    warmth: 14,
    tint: -6,
    definition: -6,
    grain: 18,
    splitShadow: [188, 16],
    splitHigh: [30, 12],
  },
  "08-seattle": {
    exposure: 10,
    brilliance: 12,
    shadows: 16,
    contrast: -24,
    black_point: -10,
    saturation: -28,
    warmth: -26,
    tint: 10,
    definition: -8,
    splitShadow: [205, 22],
    splitHigh: [210, 10],
  },
  "09-paris": {
    shadows: 12,
    contrast: -10,
    black_point: -6,
    saturation: -18,
    vibrance: 10,
    warmth: 10,
    tint: 20,
    vignette: 22,
    grain: 20,
    splitShadow: [285, 18],
    splitHigh: [350, 12],
  },
  "10-marrakesh": {
    highlights: 6,
    contrast: 14,
    black_point: 16,
    saturation: 8,
    vibrance: 12,
    warmth: 44,
    tint: -6,
    vignette: 18,
    splitShadow: [15, 10],
    splitHigh: [35, 22],
  },
  "11-hongkong": {
    highlights: 14,
    contrast: 20,
    black_point: 8,
    saturation: 22,
    warmth: -18,
    tint: 26,
    definition: 12,
    vignette: 14,
    bloom: 26,
    splitShadow: [190, 22],
    splitHigh: [320, 20],
  },
  "12-reykjavik": {
    exposure: -8,
    shadows: -6,
    contrast: -4,
    black_point: 8,
    saturation: -66,
    warmth: -2,
    definition: -4,
    grain: 12,
    splitShadow: [190, 10],
  },
};

/** 프레임 아래에 찍히는 글자. 값 줄은 `frame.py` 의 `value_lines` 가 만든다 */
export type FrameLabel = {
  city: string;
  mood: string;
  lines: [string, string];
};

export const FRAME_LABELS: Record<string, FrameLabel> = {
  "01-oslo": {
    city: "Oslo",
    mood: "winter dawn",
    lines: [
      "Exp -14 · Shad -4 · Cont -6 · Black +6 · Sat -24 · Warm -42",
      "Tint +8 · Def +4 · Split S 225°/26 · Split H 215°/12 · Grain 14",
    ],
  },
  "02-sapporo": {
    city: "Sapporo",
    mood: "winter clear",
    lines: [
      "Exp +26 · Bril +22 · High -20 · Cont +10 · Black +2",
      "Sat -40 · Warm -12 · Tint -4 · Def +6 · Split S 205°/9",
    ],
  },
  "03-seoul": {
    city: "Seoul",
    mood: "autumn clear",
    lines: [
      "Shad -8 · Cont +26 · Black +12 · Sat -34 · Vib +22 · Warm +6",
      "Tint -8 · Def +22 · Split H 225°/12 · HSL 52°+30 · HSL 215°+34",
    ],
  },
  "04-tokyo": {
    city: "Tokyo",
    mood: "spring bloom",
    lines: [
      "Exp +16 · Bril +14 · High -20 · Shad +14 · Cont -12 · Sat -2",
      "Vib +14 · Warm +8 · Tint +9 · Def -10 · Split H 345°/6 · Grain 8",
    ],
  },
  "05-santorini": {
    city: "Santorini",
    mood: "summer noon",
    lines: [
      "Exp +10 · High -10 · Cont +26 · Black +12 · Sat +16 · Vib +20",
      "Warm -14 · Tint -4 · Def +18 · Split H 195°/8 · HSL 195°+40 · HSL 52°-45",
    ],
  },
  "06-lisbon": {
    city: "Lisbon",
    mood: "late afternoon",
    lines: [
      "High +10 · Shad -8 · Cont +12 · Black +6 · Vib +16 · Warm +30",
      "Tint +4 · Def +8 · Vign +10 · Split S 220°/14 · Split H 45°/20",
    ],
  },
  "07-havana": {
    city: "Havana",
    mood: "faded sun",
    lines: [
      "Shad +20 · Cont -18 · Black -24 · Sat -20 · Warm +14",
      "Tint -6 · Def -6 · Split S 188°/16 · Split H 30°/12 · Grain 18",
    ],
  },
  "08-seattle": {
    city: "Seattle",
    mood: "overcast rain",
    lines: [
      "Exp +10 · Bril +12 · Shad +16 · Cont -24 · Black -10 · Sat -28",
      "Warm -26 · Tint +10 · Def -8 · Split S 205°/22 · Split H 210°/10",
    ],
  },
  "09-paris": {
    city: "Paris",
    mood: "dusk",
    lines: [
      "Shad +12 · Cont -10 · Black -6 · Sat -18 · Vib +10 · Warm +10",
      "Tint +20 · Vign +22 · Split S 285°/18 · Split H 350°/12 · Grain 20",
    ],
  },
  "10-marrakesh": {
    city: "Marrakesh",
    mood: "desert sunset",
    lines: [
      "High +6 · Cont +14 · Black +16 · Sat +8 · Vib +12",
      "Warm +44 · Tint -6 · Vign +18 · Split S 15°/10 · Split H 35°/22",
    ],
  },
  "11-hongkong": {
    city: "Hong Kong",
    mood: "neon night",
    lines: [
      "High +14 · Cont +20 · Black +8 · Sat +22 · Warm -18 · Tint +26",
      "Def +12 · Vign +14 · Split S 190°/22 · Split H 320°/20 · Bloom 26",
    ],
  },
  "12-reykjavik": {
    city: "Reykjavik",
    mood: "winter grey",
    lines: [
      "Exp -8 · Shad -6 · Cont -4 · Black +8 · Sat -66",
      "Warm -2 · Def -4 · Split S 190°/10 · Grain 12",
    ],
  },
};
