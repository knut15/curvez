// F8 성장 백분위 + 기록. PC-F8-AC1, AC2, AC4, AC5, EX1.
//
// AC4 교차 검증(공공데이터포털 백분위수 기준 표): entities/growth 는 측정값→LMS→Z 를 계산해
// Φ(Z)×100 을 소수 첫째 자리로 반올림한다. 정부 파일(nhis-growth-percentile-20240731-utf8.csv,
// tests/fixtures 에 복사해 뒀다)은 "측정값→백분위" 예시가 아니라 "백분위 구간(1~99)별 Z 경계"
// 표다 — 그래서 이 테스트는 우리가 구성한 Z 값이 표의 어느 백분위 구간(bucket)에 드는지 찾고,
// 앱이 계산한 소수 첫째 자리 백분위가 그 구간 번호와 ±1 이내로 맞는지만 본다(구간 경계 자체가
// Z 를 반올림해 만든 값이라 소수 이하 오차가 생긴다 — 근사 대조라는 한계를 ac-matrix 에도 적는다).
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

import { growthPercentiles } from "@/entities/growth";
import { parseCalendarDate } from "@/shared/lib/calendar-date";

const BIRTH = parseCalendarDate("2026-03-01")!;
const DUE = parseCalendarDate("2026-04-26")!; // 32주 0일 → correctionApplies

type PercentileBucket = { p: number; s: number; e: number };

function loadPercentileBuckets(): PercentileBucket[] {
  const path = fileURLToPath(new URL("../fixtures/nhis-growth-percentile-20240731.csv", import.meta.url));
  const lines = readFileSync(path, "utf8").trim().split("\n").slice(1);
  return lines.map((line) => {
    const [p, s, e] = line.split(",").map(Number);
    return { p, s, e };
  });
}

function bucketForZ(z: number, rows: PercentileBucket[]): number | null {
  const row = rows.find((r) => z >= r.s && z <= r.e);
  return row ? row.p : null;
}

describe("PC-F8-AC1 재태 37주 미만 아이의 백분위는 측정일의 교정 나이로 계산된다", () => {
  it("측정일 2026-06-01(교정 36일 · 1개월)이면 basis=corrected, span.months=1 이다", () => {
    const result = growthPercentiles(
      { sex: "male", birthDate: BIRTH, correctedFrom: DUE },
      {
        measuredOn: parseCalendarDate("2026-06-01")!,
        heightCm: 54.7244, // month=1 남아 LMS M값(정확히 M 이면 Z=0)
        weightGrams: 4470.9, // month=1 남아 몸무게 M값(4.4709kg)
        headCircumferenceCm: 37.2759, // month=1 남아 머리둘레 M값
      },
    );
    expect(result.kind).toBe("ok");
    if (result.kind !== "ok") return;
    expect(result.age.basis).toBe("corrected");
    expect(result.age.span).toEqual({ totalDays: 36, months: 1, days: 6 });
  });
});

describe("PC-F8-AC4 회귀 — 측정값이 LMS M 값과 같으면 백분위가 정확히 50.0 이다", () => {
  it("남아 1개월(교정): 키·몸무게·머리둘레 모두 50.0, 상담 필요 없음", () => {
    const result = growthPercentiles(
      { sex: "male", birthDate: BIRTH, correctedFrom: DUE },
      {
        measuredOn: parseCalendarDate("2026-06-01")!,
        heightCm: 54.7244,
        weightGrams: 4470.9,
        headCircumferenceCm: 37.2759,
      },
    );
    expect(result.kind).toBe("ok");
    if (result.kind !== "ok") return;
    expect(result.height.percentile).toBe(50.0);
    expect(result.weight.percentile).toBe(50.0);
    expect(result.headCircumference.percentile).toBe(50.0);
    expect(result.height.consult).toBe(false);
    expect(result.weight.consult).toBe(false);
    expect(result.headCircumference.consult).toBe(false);
  });

  it("여아 0개월(생후 기준, 교정 없음): 키·몸무게·머리둘레 모두 50.0", () => {
    const birth0 = parseCalendarDate("2026-01-01")!;
    const result = growthPercentiles(
      { sex: "female", birthDate: birth0, correctedFrom: null },
      {
        measuredOn: birth0,
        heightCm: 49.1477,
        weightGrams: 3232.2,
        headCircumferenceCm: 33.8787,
      },
    );
    expect(result.kind).toBe("ok");
    if (result.kind !== "ok") return;
    expect(result.age.basis).toBe("chronological");
    expect(result.height.percentile).toBe(50.0);
    expect(result.weight.percentile).toBe(50.0);
    expect(result.headCircumference.percentile).toBe(50.0);
  });
});

describe("PC-F8-AC2 백분위가 3 미만이거나 97 초과면 상담이 필요하다", () => {
  it("Z=-2.0(키 50.828cm, 남아 1개월)은 백분위 2.3 로 3 미만 — 상담 필요", () => {
    const result = growthPercentiles(
      { sex: "male", birthDate: BIRTH, correctedFrom: DUE },
      {
        measuredOn: parseCalendarDate("2026-06-01")!,
        heightCm: 50.828,
        weightGrams: 4470.9,
        headCircumferenceCm: 37.2759,
      },
    );
    expect(result.kind).toBe("ok");
    if (result.kind !== "ok") return;
    expect(result.height.percentile).toBe(2.3);
    expect(result.height.consult).toBe(true);
  });

  it("Z=+2.0(키 58.6208cm, 남아 1개월)은 백분위 97.7 로 97 초과 — 상담 필요", () => {
    const result = growthPercentiles(
      { sex: "male", birthDate: BIRTH, correctedFrom: DUE },
      {
        measuredOn: parseCalendarDate("2026-06-01")!,
        heightCm: 58.6208,
        weightGrams: 4470.9,
        headCircumferenceCm: 37.2759,
      },
    );
    expect(result.kind).toBe("ok");
    if (result.kind !== "ok") return;
    expect(result.height.percentile).toBe(97.7);
    expect(result.height.consult).toBe(true);
  });
});

describe("PC-F8-AC4 계산한 백분위가 공공데이터포털 백분위수 기준 표(Z 구간)와 ±1 이내로 맞는다", () => {
  const rows = loadPercentileBuckets();

  it("Z=+1.0(키 56.67258864cm, 남아 1개월) → 백분위 84.1, 정부 표 84번째 구간과 ±1 이내", () => {
    const result = growthPercentiles(
      { sex: "male", birthDate: BIRTH, correctedFrom: DUE },
      {
        measuredOn: parseCalendarDate("2026-06-01")!,
        heightCm: 56.67258864,
        weightGrams: 4470.9,
        headCircumferenceCm: 37.2759,
      },
    );
    expect(result.kind).toBe("ok");
    if (result.kind !== "ok") return;
    expect(result.height.percentile).toBe(84.1);
    const bucket = bucketForZ(result.height.z, rows);
    expect(bucket).not.toBeNull();
    expect(Math.abs(result.height.percentile - (bucket ?? 0))).toBeLessThanOrEqual(1);
  });

  it("Z=-1.0(키 52.776211360...cm, 남아 1개월) → 백분위 15.9, 정부 표 15번째 구간과 ±1 이내", () => {
    const result = growthPercentiles(
      { sex: "male", birthDate: BIRTH, correctedFrom: DUE },
      {
        measuredOn: parseCalendarDate("2026-06-01")!,
        heightCm: 52.77621136,
        weightGrams: 4470.9,
        headCircumferenceCm: 37.2759,
      },
    );
    expect(result.kind).toBe("ok");
    if (result.kind !== "ok") return;
    expect(result.height.percentile).toBe(15.9);
    const bucket = bucketForZ(result.height.z, rows);
    expect(bucket).not.toBeNull();
    expect(Math.abs(result.height.percentile - (bucket ?? 0))).toBeLessThanOrEqual(1);
  });
});

describe("PC-F8-AC5 · PC-F8-EX1 측정일이 예정일보다 앞서면(교정 40주 이전) 백분위 대신 before-due 다", () => {
  it("재태 32주 아이가 예정일 하루 전에 재면 before-due(daysUntilDue=1)다", () => {
    const result = growthPercentiles(
      { sex: "male", birthDate: BIRTH, correctedFrom: DUE },
      {
        measuredOn: parseCalendarDate("2026-04-25")!,
        heightCm: 45,
        weightGrams: 2000,
        headCircumferenceCm: 30,
      },
    );
    expect(result).toEqual({ kind: "before-due", daysUntilDue: 1 });
  });

  it("(EX1) 재태 28주 아이도 예정일보다 앞서면 마찬가지로 before-due 다", () => {
    const birth28 = parseCalendarDate("2026-01-01")!;
    const due28 = parseCalendarDate("2026-03-26")!; // 재태 28주(196일): 280-196=84일 뒤
    const result = growthPercentiles(
      { sex: "female", birthDate: birth28, correctedFrom: due28 },
      {
        measuredOn: parseCalendarDate("2026-03-20")!,
        heightCm: 40,
        weightGrams: 1500,
        headCircumferenceCm: 28,
      },
    );
    expect(result.kind).toBe("before-due");
  });
});
