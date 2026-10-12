// F15 분유량 참고. 기준 데이터는 이 슬라이스 안에서만 읽는다(ARCH-107).
import type { AgeOffset, CalendarSpan } from "@/shared/lib/calendar-date";
import { resolveReferenceMeta, type ReferenceMeta, type ReferenceMetaInput } from "@/shared/lib/reference";

import rawData from "../data/formula-coefficients.json";

export type FormulaBand = {
  id: string;
  sourceRangeText: string;
  ageWindow: { start: AgeOffset; endExclusive: AgeOffset | null };
  mlPerKgPerDay: { min: number; max: number } | null;
};

type FormulaData = {
  meta: ReferenceMetaInput;
  bands: FormulaBand[];
};

// JSON 구조가 FormulaData 와 다르면 여기서 컴파일 오류가 난다(단언 없이 구조 검사).
const data: FormulaData = rawData;

export const formulaMeta: ReferenceMeta = resolveReferenceMeta(data.meta, "formula-coefficients");
export const formulaBands: FormulaBand[] = data.bands;

// PRD §8 가정: 입력 범위 0.5~15kg (양끝 포함).
export const FORMULA_WEIGHT_GRAMS = { min: 500, max: 15000 } as const;

export function isValidWeightGrams(weightGrams: number | null): boolean {
  return (
    weightGrams !== null &&
    weightGrams >= FORMULA_WEIGHT_GRAMS.min &&
    weightGrams <= FORMULA_WEIGHT_GRAMS.max
  );
}

// entities/child 의 ChildAges 에서 이 슬라이스가 실제로 읽는 필드만 담은 입력 타입이다(PLC-01).
export type FormulaAgeInput = {
  correctionApplies: boolean;
  chronological: CalendarSpan;
  corrected: { kind: "hidden" } | { kind: "before-due" } | { kind: "after-due"; span: CalendarSpan };
};

export type FormulaResult =
  | { kind: "invalid-weight" }
  | { kind: "out-of-range" }
  | { kind: "pending"; band: FormulaBand }
  | { kind: "ok"; band: FormulaBand; dailyMl: { min: number; max: number } };

function compareOffset(a: { months: number; days: number }, b: AgeOffset): number {
  if (a.months !== b.months) return a.months - b.months;
  return a.days - b.days;
}

function findBand(age: { months: number; days: number }): FormulaBand | null {
  return (
    formulaBands.find((band) => {
      const afterStart = compareOffset(age, band.ageWindow.start) >= 0;
      const beforeEnd = band.ageWindow.endExclusive === null || compareOffset(age, band.ageWindow.endExclusive) < 0;
      return afterStart && beforeEnd;
    }) ?? null
  );
}

export function formulaAmount(input: {
  weightGrams: number | null;
  ages: FormulaAgeInput;
}): { showMedicalTeamNotice: boolean; result: FormulaResult } {
  const { weightGrams, ages } = input;
  const showMedicalTeamNotice = ages.correctionApplies;

  if (!isValidWeightGrams(weightGrams)) {
    return { showMedicalTeamNotice, result: { kind: "invalid-weight" } };
  }

  let age: { months: number; days: number };
  if (!ages.correctionApplies) {
    age = ages.chronological;
  } else if (ages.corrected.kind === "before-due") {
    return { showMedicalTeamNotice, result: { kind: "out-of-range" } };
  } else if (ages.corrected.kind === "after-due") {
    age = ages.corrected.span;
  } else {
    // correctionApplies=true 면 corrected.kind 는 "hidden" 이 될 수 없다(entities/child
    // computeChildAges 의 불변식). 방어적 분기라 실제로는 닿지 않는다.
    age = ages.chronological;
  }

  const band = findBand(age);
  if (!band) {
    return { showMedicalTeamNotice, result: { kind: "out-of-range" } };
  }
  if (band.mlPerKgPerDay === null) {
    return { showMedicalTeamNotice, result: { kind: "pending", band } };
  }

  const weightKg = (weightGrams as number) / 1000;
  const dailyMl = {
    min: Math.round(weightKg * band.mlPerKgPerDay.min),
    max: Math.round(weightKg * band.mlPerKgPerDay.max),
  };
  return { showMedicalTeamNotice, result: { kind: "ok", band, dailyMl } };
}
