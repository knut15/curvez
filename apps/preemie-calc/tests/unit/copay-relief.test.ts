// F5 본인부담 경감 종료일.
import { describe, expect, it } from "vitest";

import type { GestationalAge } from "@/entities/child";
import { classifyCopayRelief, copayReliefPolicyLabel } from "@/entities/copay-relief";
import { parseCalendarDate } from "@/shared/lib/calendar-date";

const BIRTH = parseCalendarDate("2026-03-01")!;

function ga(totalDays: number): GestationalAge {
  return { totalDays, weeks: Math.floor(totalDays / 7), days: totalDays % 7 };
}

describe("PC-F5-AC1 재태 32주 0일은 5년 3개월 구간", () => {
  it("재태 32주 0일(224일)은 5년 3개월 구간으로 분류된다", () => {
    const result = classifyCopayRelief({ birthDate: BIRTH, gestation: ga(224) });
    expect(result.kind).toBe("eligible");
    if (result.kind === "eligible") expect(result.tier.label).toBe("5년 3개월");
  });
});

describe("PC-F5-AC2 재태 28주 6일은 5년 4개월 구간", () => {
  it("재태 28주 6일(202일)은 5년 4개월 구간으로 분류된다", () => {
    const result = classifyCopayRelief({ birthDate: BIRTH, gestation: ga(202) });
    expect(result.kind).toBe("eligible");
    if (result.kind === "eligible") expect(result.tier.label).toBe("5년 4개월");
  });
});

describe("PC-F5-AC3 재태 35주 0일은 5년 2개월 구간", () => {
  it("재태 35주 0일(245일)은 5년 2개월 구간으로 분류된다", () => {
    const result = classifyCopayRelief({ birthDate: BIRTH, gestation: ga(245) });
    expect(result.kind).toBe("eligible");
    if (result.kind === "eligible") expect(result.tier.label).toBe("5년 2개월");
  });
});

describe("PC-F5-AC4 재태 37주 0일 이상은 경감 대상이 아니다", () => {
  it("재태 37주 0일(259일)은 not-eligible 이다", () => {
    const result = classifyCopayRelief({ birthDate: BIRTH, gestation: ga(259) });
    expect(result.kind).toBe("not-eligible");
  });
});

describe("PC-F5-AC5 종료 예정일과 제도 기준 문구가 함께 보인다", () => {
  it("정책 라벨이 '2026년 1월 시행 제도 기준' 이다", () => {
    expect(copayReliefPolicyLabel).toBe("2026년 1월 시행 제도 기준");
  });

  it("경감 대상이면 종료 예정일(endDate)이 CalendarDate 형식으로 계산된다", () => {
    const result = classifyCopayRelief({ birthDate: BIRTH, gestation: ga(224) });
    expect(result.kind).toBe("eligible");
    if (result.kind === "eligible") {
      expect(result.endDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });
});

// 경계 정각은 보건복지부 원문("33주 이상~37주 미만 5년 2개월", "29주 이상~33주 미만 5년 3개월")대로
// 재태기간이 더 긴 쪽 구간(= 더 짧은 경감기간)에 든다. PRD 버전 4 §9 정정, SPEC 버전 6 F5 AC6·AC7.
describe("PC-F5-AC6 재태 33주 0일은 5년 2개월 구간", () => {
  it("재태일수 231일(33주 0일)은 5년 2개월 구간으로 분류된다", () => {
    const result = classifyCopayRelief({ birthDate: BIRTH, gestation: ga(231) });
    expect(result.kind).toBe("eligible");
    if (result.kind === "eligible") expect(result.tier.label).toBe("5년 2개월");
  });

  it("바로 앞 230일(32주 6일)은 5년 3개월 구간이다", () => {
    const result = classifyCopayRelief({ birthDate: BIRTH, gestation: ga(230) });
    expect(result.kind).toBe("eligible");
    if (result.kind === "eligible") expect(result.tier.label).toBe("5년 3개월");
  });
});

describe("PC-F5-AC7 재태 29주 0일은 5년 3개월 구간", () => {
  it("재태일수 203일(29주 0일)은 5년 3개월 구간으로 분류된다", () => {
    const result = classifyCopayRelief({ birthDate: BIRTH, gestation: ga(203) });
    expect(result.kind).toBe("eligible");
    if (result.kind === "eligible") expect(result.tier.label).toBe("5년 3개월");
  });

  it("바로 앞 202일(28주 6일)은 5년 4개월 구간이다", () => {
    const result = classifyCopayRelief({ birthDate: BIRTH, gestation: ga(202) });
    expect(result.kind).toBe("eligible");
    if (result.kind === "eligible") expect(result.tier.label).toBe("5년 4개월");
  });
});
