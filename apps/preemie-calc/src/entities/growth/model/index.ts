// F8 성장 백분위 + 기록. 기준 데이터는 이 슬라이스 안에서만 읽는다(ARCH-107).
import {
  calendarSpan,
  daysBetween,
  parseCalendarDate,
  type CalendarDate,
  type CalendarSpan,
} from "@/shared/lib/calendar-date";
import { inverseStandardNormalCdf, standardNormalCdf } from "@/shared/lib/normal-distribution";
import {
  resolveReferenceMeta,
  type ReferenceMeta,
  type ReferenceMetaInput,
} from "@/shared/lib/reference";

import rawData from "../data/growth-lms.json";

export type GrowthSex = "male" | "female";
export type HeightPosture = "lying" | "standing";

export type GrowthRecord = {
  id: string;
  childId: string;
  measuredOn: CalendarDate;
  heightCm: number;
  weightGrams: number;
  headCircumferenceCm: number;
  heightPosture: HeightPosture;
};

export type GrowthMeasure = "height" | "weight" | "headCircumference";
export type LmsRow = { month: number; L: number; M: number; S: number };
export type GrowthLmsSeries = {
  measure: GrowthMeasure;
  sex: GrowthSex;
  unit: "cm" | "kg";
  rows: LmsRow[];
};

const GROWTH_MEASURES: readonly GrowthMeasure[] = ["height", "weight", "headCircumference"];
const GROWTH_SEXES: readonly GrowthSex[] = ["male", "female"];
const GROWTH_UNITS: readonly ("cm" | "kg")[] = ["cm", "kg"];

function isGrowthMeasure(value: string): value is GrowthMeasure {
  return (GROWTH_MEASURES as readonly string[]).includes(value);
}
function isGrowthSex(value: string): value is GrowthSex {
  return (GROWTH_SEXES as readonly string[]).includes(value);
}
function isGrowthUnit(value: string): value is "cm" | "kg" {
  return (GROWTH_UNITS as readonly string[]).includes(value);
}

// JSON 이 주는 모양. measure·sex·unit 이 아직 리터럴로 좁혀지지 않은 `string` 이라는 점만 다르다.
type RawGrowthLmsSeries = { measure: string; sex: string; unit: string; rows: LmsRow[] };

type GrowthData = {
  meta: ReferenceMetaInput;
  series: RawGrowthLmsSeries[];
};

// JSON 구조가 GrowthData 와 다르면 여기서 컴파일 오류가 난다(단언 없이 구조 검사).
const data: GrowthData = rawData;

function resolveGrowthLmsSeries(raw: RawGrowthLmsSeries): GrowthLmsSeries {
  if (!isGrowthMeasure(raw.measure)) {
    throw new Error(`growth-lms: 알 수 없는 measure 다 (${raw.measure})`);
  }
  if (!isGrowthSex(raw.sex)) {
    throw new Error(`growth-lms: 알 수 없는 sex 다 (${raw.sex})`);
  }
  if (!isGrowthUnit(raw.unit)) {
    throw new Error(`growth-lms: 알 수 없는 unit 다 (${raw.unit})`);
  }
  return { measure: raw.measure, sex: raw.sex, unit: raw.unit, rows: raw.rows };
}

export const growthMeta: ReferenceMeta = resolveReferenceMeta(data.meta, "growth-lms");
const growthLmsSeries: GrowthLmsSeries[] = data.series.map(resolveGrowthLmsSeries);

function findLmsRow(measure: GrowthMeasure, sex: GrowthSex, month: number): LmsRow | null {
  const series = growthLmsSeries.find((s) => s.measure === measure && s.sex === sex);
  if (!series) return null;
  return series.rows.find((r) => r.month === month) ?? null;
}

// ── 측정 기록 입력 검증 ──────────────────────────────────────────────────

export type GrowthDraft = {
  measuredOn: string;
  heightCm: string;
  weightKg: string;
  headCircumferenceCm: string;
  posture: HeightPosture | null;
};

export type GrowthErrorCode =
  | "invalid-date"
  | "measured-before-birth"
  | "measured-after-today"
  | "invalid-value"
  | "posture-required";

export type GrowthError = { code: GrowthErrorCode };

/** 키·몸무게·머리둘레 입력칸 하나가 유효한지(비지 않고, 숫자이고, 0 초과). 폼이 필드별
 * 에러를 보일 때도 이 함수 하나로 판정해 검증 규칙이 두 곳에서 갈리지 않게 한다. */
export function isValidMeasurementValue(input: string): boolean {
  if (input.trim() === "") return false;
  const n = Number(input);
  return Number.isFinite(n) && n > 0;
}

export function validateGrowthDraft(
  draft: GrowthDraft,
  child: { birthDate: CalendarDate },
  today: CalendarDate,
): GrowthError[] {
  const errors: GrowthError[] = [];

  const measuredOn = parseCalendarDate(draft.measuredOn);
  if (!measuredOn) {
    errors.push({ code: "invalid-date" });
  } else {
    if (measuredOn < child.birthDate) errors.push({ code: "measured-before-birth" });
    if (measuredOn > today) errors.push({ code: "measured-after-today" });
  }

  if (
    !isValidMeasurementValue(draft.heightCm) ||
    !isValidMeasurementValue(draft.weightKg) ||
    !isValidMeasurementValue(draft.headCircumferenceCm)
  ) {
    errors.push({ code: "invalid-value" });
  }

  if (draft.posture === null) {
    errors.push({ code: "posture-required" });
  }

  return errors;
}

/** draft(검증 통과 전제) → 저장용 GrowthRecord. */
export function createGrowthRecord(draft: GrowthDraft, childId: string): GrowthRecord {
  if (draft.posture === null) {
    throw new Error("createGrowthRecord: posture 가 없다");
  }
  const measuredOn = parseCalendarDate(draft.measuredOn);
  if (!measuredOn) {
    throw new Error("createGrowthRecord: measuredOn 이 올바른 달력 날짜가 아니다");
  }
  return {
    id: crypto.randomUUID(),
    childId,
    measuredOn,
    heightCm: Number(draft.heightCm),
    weightGrams: Math.round(Number(draft.weightKg) * 1000),
    headCircumferenceCm: Number(draft.headCircumferenceCm),
    heightPosture: draft.posture,
  };
}

// ── 백분위 계산 ──────────────────────────────────────────────────────────

export type GrowthAgeInput = {
  sex: GrowthSex;
  birthDate: CalendarDate;
  correctedFrom: CalendarDate | null;
};

export type GrowthAgeAtMeasurement = {
  basis: "corrected" | "chronological";
  span: CalendarSpan;
};

export type MeasureResult = {
  z: number;
  percentile: number;
  consult: boolean;
};

export type GrowthPercentileResult =
  | { kind: "before-due"; daysUntilDue: number }
  | { kind: "out-of-range"; age: GrowthAgeAtMeasurement }
  | {
      kind: "ok";
      age: GrowthAgeAtMeasurement;
      height: MeasureResult;
      weight: MeasureResult;
      headCircumference: MeasureResult;
    };

const MAX_LMS_MONTH = 36;

function computeMeasureResult(measure: GrowthMeasure, sex: GrowthSex, month: number, x: number): MeasureResult {
  const row = findLmsRow(measure, sex, month);
  if (!row) {
    throw new Error(`growth: LMS 행을 찾지 못했다 (${measure}/${sex}/${month}개월)`);
  }
  const { L, M, S } = row;
  const z = L === 0 ? Math.log(x / M) / S : ((x / M) ** L - 1) / (L * S);
  const percentile = Math.round(standardNormalCdf(z) * 100 * 10) / 10;
  const consult = percentile < 3 || percentile > 97;
  return { z, percentile, consult };
}

// growthPercentiles(측정값→백분위)와 growthReferenceValues(나이→백분위 기준선, F8 AC3 추이
// 그래프)가 같은 "측정일 → 나이 → LMS 월령" 판정을 공유한다(architect 결정 — growthPercentiles
// 시그니처·결과는 바꾸지 않는다). before-due/out-of-range 판정이 두 함수에서 갈리면 표의
// percentileHidden 과 그래프의 기준선 끊김이 서로 다른 지점에서 생겨 어긋난다.
type AgeResolution =
  | { kind: "before-due"; daysUntilDue: number }
  | { kind: "out-of-range"; age: GrowthAgeAtMeasurement }
  | { kind: "ok"; age: GrowthAgeAtMeasurement; month: number };

function resolveAgeAtMeasurement(input: GrowthAgeInput, measuredOn: CalendarDate): AgeResolution {
  const { birthDate, correctedFrom } = input;

  if (correctedFrom !== null && measuredOn < correctedFrom) {
    return { kind: "before-due", daysUntilDue: daysBetween(measuredOn, correctedFrom) };
  }

  const age: GrowthAgeAtMeasurement =
    correctedFrom !== null
      ? { basis: "corrected", span: calendarSpan(correctedFrom, measuredOn) }
      : { basis: "chronological", span: calendarSpan(birthDate, measuredOn) };

  if (age.span.months > MAX_LMS_MONTH) {
    return { kind: "out-of-range", age };
  }

  return { kind: "ok", age, month: age.span.months };
}

export function growthPercentiles(
  input: GrowthAgeInput,
  record: {
    measuredOn: CalendarDate;
    heightCm: number;
    weightGrams: number;
    headCircumferenceCm: number;
  },
): GrowthPercentileResult {
  const resolved = resolveAgeAtMeasurement(input, record.measuredOn);
  if (resolved.kind === "before-due" || resolved.kind === "out-of-range") {
    return resolved;
  }

  const { sex } = input;
  const { age, month } = resolved;
  const weightKg = record.weightGrams / 1000;

  return {
    kind: "ok",
    age,
    height: computeMeasureResult("height", sex, month, record.heightCm),
    weight: computeMeasureResult("weight", sex, month, weightKg),
    headCircumference: computeMeasureResult("headCircumference", sex, month, record.headCircumferenceCm),
  };
}

// ── 추이 그래프 백분위 기준선(F8 AC3) ──────────────────────────────────────
// LMS(L,M,S)에서 "주어진 백분위에 대응하는 실측값" 을 역산한다. computeMeasureResult 의
// z 공식(측정값→z)을 뒤집은 식이다(design: components/GrowthTrendChart.md `## 데이터 전제`).

/** LMS 행과 z 로 그 z 에 대응하는 실측값을 구한다. z=0 이면 항상 M 이다. */
export function lmsValueAtZ(row: LmsRow, z: number): number {
  const { L, M, S } = row;
  return L === 0 ? M * Math.exp(S * z) : M * (1 + L * S * z) ** (1 / L);
}

export const REFERENCE_PERCENTILES = [3, 50, 97] as const;

export type GrowthReferenceRow = { p3: number; p50: number; p97: number };

export type GrowthReferenceResult =
  | { kind: "before-due"; daysUntilDue: number }
  | { kind: "out-of-range"; age: GrowthAgeAtMeasurement }
  | {
      kind: "ok";
      age: GrowthAgeAtMeasurement;
      height: GrowthReferenceRow;
      weight: GrowthReferenceRow;
      headCircumference: GrowthReferenceRow;
    };

function roundToOneDecimal(n: number): number {
  return Math.round(n * 10) / 10;
}

function referenceRowFor(measure: GrowthMeasure, sex: GrowthSex, month: number): GrowthReferenceRow {
  const row = findLmsRow(measure, sex, month);
  if (!row) {
    throw new Error(`growth: LMS 행을 찾지 못했다 (${measure}/${sex}/${month}개월)`);
  }
  const [p3, p50, p97] = REFERENCE_PERCENTILES.map((p) =>
    roundToOneDecimal(lmsValueAtZ(row, inverseStandardNormalCdf(p / 100))),
  );
  return { p3, p50, p97 };
}

/** 측정일의 나이(개월)에 대응하는 3·50·97백분위 기준값. 실측값과 무관하다 — 추이
 * 그래프의 기준선용(측정일마다 그 나이의 LMS 행으로 계산, 개월 격자가 아니다). */
export function growthReferenceValues(input: GrowthAgeInput, measuredOn: CalendarDate): GrowthReferenceResult {
  const resolved = resolveAgeAtMeasurement(input, measuredOn);
  if (resolved.kind === "before-due" || resolved.kind === "out-of-range") {
    return resolved;
  }

  const { sex } = input;
  const { age, month } = resolved;

  return {
    kind: "ok",
    age,
    height: referenceRowFor("height", sex, month),
    weight: referenceRowFor("weight", sex, month),
    headCircumference: referenceRowFor("headCircumference", sex, month),
  };
}

/** 측정일이 가장 늦은 기록의 weightGrams. 같은 날이면 뒤에 저장된 것. 없으면 null. F15 미리 채우기용. */
export function latestWeightGrams(records: GrowthRecord[]): number | null {
  if (records.length === 0) return null;
  let latest = records[0];
  for (const record of records.slice(1)) {
    if (record.measuredOn >= latest.measuredOn) latest = record;
  }
  return latest.weightGrams;
}
