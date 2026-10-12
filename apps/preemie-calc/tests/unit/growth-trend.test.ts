// F8 AC3 추이 그래프. 그래프를 그리는 데 쓰는 순수 함수 4개를 단위로 검증한다.
// 스펙: .curvez/design/preemie-calc/components/GrowthTrendChart.md `## 데이터 전제`.
import { describe, expect, it } from "vitest";

import { growthReferenceValues, lmsValueAtZ } from "@/entities/growth";
import type { GrowthAgeInput, GrowthRecord } from "@/entities/growth";
import { parseCalendarDate } from "@/shared/lib/calendar-date";
import { inverseStandardNormalCdf, standardNormalCdf } from "@/shared/lib/normal-distribution";
import { buildGrowthTrendPoints } from "@/widgets/growth-panel/lib/build-growth-trend-points";

const BIRTH = parseCalendarDate("2026-03-01")!;
const DUE = parseCalendarDate("2026-04-26")!; // 32주 0일

describe("PC-F8-AC3 inverseStandardNormalCdf(p) — Φ⁻¹", () => {
  it("Φ⁻¹(0.5) = 0", () => {
    expect(inverseStandardNormalCdf(0.5)).toBeCloseTo(0, 6);
  });

  it("Φ⁻¹(0.975) ≈ 1.959964", () => {
    expect(inverseStandardNormalCdf(0.975)).toBeCloseTo(1.959964, 5);
  });

  it("Φ⁻¹(0.03) ≈ -1.880794", () => {
    expect(inverseStandardNormalCdf(0.03)).toBeCloseTo(-1.880794, 5);
  });

  it("Φ(Φ⁻¹(p)) 왕복 오차가 0.001≤p≤0.999 구간에서 1e-6 이하다", () => {
    const ps = [0.001, 0.03, 0.1, 0.3, 0.5, 0.7, 0.9, 0.975, 0.999];
    for (const p of ps) {
      const roundTrip = standardNormalCdf(inverseStandardNormalCdf(p));
      expect(Math.abs(roundTrip - p), `p=${p}`).toBeLessThanOrEqual(1e-6);
    }
  });
});

describe("PC-F8-AC3 lmsValueAtZ(row, z) — z=0 이면 항상 M", () => {
  it("L=1 인 행(키, 남아 1개월)에서 z=0 → M(54.7244)", () => {
    expect(lmsValueAtZ({ month: 1, L: 1, M: 54.7244, S: 0.0356 }, 0)).toBeCloseTo(54.7244, 6);
  });

  it("L!=0 인 행(몸무게, 남아 1개월)에서도 z=0 → M(4.4709)", () => {
    expect(lmsValueAtZ({ month: 1, L: 0.2297, M: 4.4709, S: 0.134 }, 0)).toBeCloseTo(4.4709, 6);
  });
});

describe("PC-F8-AC3 growthReferenceValues — before-due · out-of-range · ok", () => {
  const AGE: GrowthAgeInput = { sex: "male", birthDate: BIRTH, correctedFrom: DUE };

  it("측정일이 예정일보다 앞서면 before-due 다", () => {
    const result = growthReferenceValues(AGE, parseCalendarDate("2026-04-25")!);
    expect(result).toEqual({ kind: "before-due", daysUntilDue: 1 });
  });

  it("교정 나이가 36개월을 넘으면 out-of-range 다", () => {
    const result = growthReferenceValues(AGE, parseCalendarDate("2030-01-01")!);
    expect(result.kind).toBe("out-of-range");
  });

  it("교정 1개월(2026-06-01)이면 ok 고, 지표마다 p3/p50/p97(소수 첫째 자리)이 LMS 역산값과 같다", () => {
    const result = growthReferenceValues(AGE, parseCalendarDate("2026-06-01")!);
    expect(result.kind).toBe("ok");
    if (result.kind !== "ok") return;
    expect(result.age.span.months).toBe(1);
    expect(result.height).toEqual({ p3: 51.1, p50: 54.7, p97: 58.4 });
    expect(result.weight).toEqual({ p3: 3.4, p50: 4.5, p97: 5.7 });
    expect(result.headCircumference).toEqual({ p3: 35.1, p50: 37.3, p97: 39.5 });
  });
});

describe("PC-F8-AC3 buildGrowthTrendPoints — 측정일 오름차순, 지표별, cautionNeeded 는 그 지표만", () => {
  const AGE: GrowthAgeInput = { sex: "male", birthDate: BIRTH, correctedFrom: DUE };

  const recordAfterDue: GrowthRecord = {
    id: "r-after",
    childId: "c1",
    measuredOn: parseCalendarDate("2026-06-01")!, // 교정 1개월
    heightCm: 50.828, // Z=-2.0 → 백분위 2.3 (3 미만, consult=true) — growth.test.ts AC2 와 같은 값
    weightGrams: 4470.9, // M 값 → 백분위 50.0 (consult=false)
    headCircumferenceCm: 37.2759, // M 값 → 백분위 50.0 (consult=false)
    heightPosture: "lying",
  };
  const recordBeforeDue: GrowthRecord = {
    id: "r-before",
    childId: "c1",
    measuredOn: parseCalendarDate("2026-04-25")!, // 예정일(2026-04-26) 하루 전
    heightCm: 45,
    weightGrams: 2000,
    headCircumferenceCm: 30,
    heightPosture: "lying",
  };

  // 입력 순서를 측정일 역순으로 섞어, 출력이 오름차순으로 재정렬되는지 확인한다.
  const points = buildGrowthTrendPoints({ records: [recordAfterDue, recordBeforeDue], age: AGE });

  it("측정일 오름차순으로 정렬된다(지표마다 길이 2, index 0 이 더 이른 날짜)", () => {
    expect(points.height.map((p) => p.measurementDate)).toEqual(["2026-04-25", "2026-06-01"]);
    expect(points.weight.map((p) => p.measurementDate)).toEqual(["2026-04-25", "2026-06-01"]);
    expect(points.headCircumference.map((p) => p.measurementDate)).toEqual(["2026-04-25", "2026-06-01"]);
  });

  it("예정일보다 앞선 점은 percentileHidden=true, ageBasisLabel=null, p3/p50/p97=null 이다", () => {
    const p = points.height[0];
    expect(p.percentileHidden).toBe(true);
    expect(p.ageBasisLabel).toBeNull();
    expect(p.percentileValue).toBeNull();
    expect(p.p3).toBeNull();
    expect(p.p50).toBeNull();
    expect(p.p97).toBeNull();
    expect(p.cautionNeeded).toBe(false);
    expect(p.value).toBe(45); // value(실측값)는 percentileHidden 과 무관하게 항상 있다
  });

  it("지표별 값(value)이 맞게 들어간다 — weight 는 Math.round(grams)/1000", () => {
    expect(points.weight[1].value).toBeCloseTo(4.471, 6);
    expect(points.height[1].value).toBe(50.828);
    expect(points.headCircumference[1].value).toBe(37.2759);
  });

  it("cautionNeeded 는 그 지표 하나의 consult 다 — height 만 주의, weight·headCircumference 는 아니다", () => {
    expect(points.height[1].cautionNeeded).toBe(true);
    expect(points.height[1].percentileValue).toBe(2.3);
    expect(points.weight[1].cautionNeeded).toBe(false);
    expect(points.weight[1].percentileValue).toBe(50.0);
    expect(points.headCircumference[1].cautionNeeded).toBe(false);
    expect(points.headCircumference[1].percentileValue).toBe(50.0);
  });

  it("같은 점의 ageBasisLabel·p50 은 세 지표 모두 같은 나이 기준을 쓴다", () => {
    expect(points.height[1].ageBasisLabel).toBe("교정 1개월 기준");
    expect(points.weight[1].ageBasisLabel).toBe("교정 1개월 기준");
    expect(points.headCircumference[1].ageBasisLabel).toBe("교정 1개월 기준");
    expect(points.height[1].p50).toBe(54.7);
    expect(points.weight[1].p50).toBe(4.5);
    expect(points.headCircumference[1].p50).toBe(37.3);
  });
});
