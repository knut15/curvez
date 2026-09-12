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
