// F8 AC3 추이 그래프. 기록(GrowthRecord[]) → 측정일 오름차순 GrowthTrendPoint[](지표별).
// 스펙: .curvez/design/preemie-calc/components/GrowthTrendChart.md `## 데이터 전제`.
// @/entities/growth 를 부르므로 widget(레이어 정의 판정 순서 1) 이고, React 를 쓰지 않는
// 순수 함수라 lib 에 둔다(architect 결정 — ARCH-104 의 영향을 받지 않는다, recharts 는
// 여기서 import 하지 않는다. ARCH-114~118).
import type { CalendarDate } from "@/shared/lib/calendar-date";
import {
  growthPercentiles,
  growthReferenceValues,
  type GrowthAgeInput,
  type GrowthMeasure,
  type GrowthRecord,
} from "@/entities/growth";

export type GrowthTrendPoint = {
  measurementDate: CalendarDate;
  value: number;
  ageBasisLabel: string | null;
  percentileValue: number | null;
  p3: number | null;
  p50: number | null;
  p97: number | null;
  cautionNeeded: boolean;
  percentileHidden: boolean;
};

export type BuildGrowthTrendPointsInput = {
  records: GrowthRecord[];
  age: GrowthAgeInput;
};

function ageBasisLabelOf(basis: "corrected" | "chronological", months: number): string {
  return `${basis === "corrected" ? "교정" : "생후"} ${months}개월 기준`;
}

function measureValue(record: GrowthRecord, measure: GrowthMeasure): number {
  if (measure === "height") return record.heightCm;
  if (measure === "weight") return Math.round(record.weightGrams) / 1000;
  return record.headCircumferenceCm;
}

/** 지표(measure)마다 측정일 오름차순(가장 오래된 기록이 배열 맨 앞) 추이 점 배열을 만든다.
 * GrowthRecordTable 과 같은 레코드 배열을 다른 정렬(오름차순)로 한 번 더 쓸 뿐, 저장 모양은
 * 새로 만들지 않는다. */
export function buildGrowthTrendPoints({
  records,
  age,
}: BuildGrowthTrendPointsInput): Record<GrowthMeasure, GrowthTrendPoint[]> {
  const sorted = [...records].sort((a, b) => (a.measuredOn < b.measuredOn ? -1 : a.measuredOn > b.measuredOn ? 1 : 0));

  const measures: readonly GrowthMeasure[] = ["height", "weight", "headCircumference"];
  const result: Record<GrowthMeasure, GrowthTrendPoint[]> = {
    height: [],
    weight: [],
    headCircumference: [],
  };

  for (const record of sorted) {
    const percentileResult = growthPercentiles(age, {
      measuredOn: record.measuredOn,
      heightCm: record.heightCm,
      weightGrams: record.weightGrams,
      headCircumferenceCm: record.headCircumferenceCm,
    });
    const referenceResult = growthReferenceValues(age, record.measuredOn);

    const percentileHidden = percentileResult.kind !== "ok";
    const ageBasisLabel =
      percentileResult.kind === "before-due"
        ? null
        : ageBasisLabelOf(percentileResult.age.basis, percentileResult.age.span.months);

    for (const measure of measures) {
      const point: GrowthTrendPoint = {
        measurementDate: record.measuredOn,
        value: measureValue(record, measure),
        ageBasisLabel,
        percentileValue: percentileResult.kind === "ok" ? percentileResult[measure].percentile : null,
        p3: referenceResult.kind === "ok" ? referenceResult[measure].p3 : null,
        p50: referenceResult.kind === "ok" ? referenceResult[measure].p50 : null,
        p97: referenceResult.kind === "ok" ? referenceResult[measure].p97 : null,
        cautionNeeded: percentileResult.kind === "ok" ? percentileResult[measure].consult : false,
        percentileHidden,
      };
      result[measure].push(point);
    }
  }

  return result;
}
