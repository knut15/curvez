// F14 목표키 참고. 데이터 파일이 없다 — 확인된 출처 URL 이 없어 ReferenceMeta 를 채울 수
// 없다(architecture.md ⑩). 계산식은 "Tanner 공식" 으로 표기한다(PRD §9 2026-09-30 결정).
export type TargetHeightSex = "male" | "female";

export const TARGET_HEIGHT_FORMULA = {
  name: "Tanner 공식",
  sexOffsetCm: 13,
  rangeCm: 6.5,
  parentHeightCm: { min: 100, max: 230 },
} as const;

/** 둘 다 값이 있고 100 이상 230 이하일 때만 true(PC-F14-EX1, PRD §8 가정). */
export function isValidParentHeights(input: {
  fatherCm: number | null;
  motherCm: number | null;
}): boolean {
  const { fatherCm, motherCm } = input;
  const { min, max } = TARGET_HEIGHT_FORMULA.parentHeightCm;
  return (
    fatherCm !== null &&
    motherCm !== null &&
    fatherCm >= min &&
    fatherCm <= max &&
    motherCm >= min &&
    motherCm <= max
  );
}

export type TargetHeightResult = { midCm: number; minCm: number; maxCm: number };

/** 0.1cm 정수로 계산한다 — 소수를 그대로 더하고 나누면 부동소수 오차로 반올림 결과가 바뀔 수 있다. */
export function computeTargetHeight(input: {
  sex: TargetHeightSex;
  fatherCm: number;
  motherCm: number;
}): TargetHeightResult {
  const { sex, fatherCm, motherCm } = input;
  const sexOffsetTenths = TARGET_HEIGHT_FORMULA.sexOffsetCm * 10;
  const rangeTenths = TARGET_HEIGHT_FORMULA.rangeCm * 2 * 10;

  const f = Math.round(fatherCm * 10);
  const m = Math.round(motherCm * 10);
  const sum = f + m + (sex === "male" ? sexOffsetTenths : -sexOffsetTenths);

  return {
    midCm: Math.round(sum / 2) / 10,
    minCm: Math.round((sum - rangeTenths) / 2) / 10,
    maxCm: Math.round((sum + rangeTenths) / 2) / 10,
  };
}
