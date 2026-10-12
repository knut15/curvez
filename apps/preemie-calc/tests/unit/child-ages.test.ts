// F2 교정연령 대시보드 — 오늘 날짜를 고정한 단위 테스트.
import { describe, expect, it } from "vitest";

import { computeChildAges } from "@/entities/child";
import { parseCalendarDate } from "@/shared/lib/calendar-date";

const BIRTH = parseCalendarDate("2026-03-01")!;
const DUE = parseCalendarDate("2026-04-26")!;

describe("PC-F2-AC1 생후·교정 나이가 나란히 보인다", () => {
  it("오늘이 2026-06-01 이면 생후 92일·3개월, 교정 36일·1개월이다", () => {
    const ages = computeChildAges(
      { birthDate: BIRTH, dueDate: DUE },
      parseCalendarDate("2026-06-01")!,
    );
    expect(ages.chronological).toEqual({ totalDays: 92, months: 3, days: 0 });
    expect(ages.corrected.kind).toBe("after-due");
    if (ages.corrected.kind === "after-due") {
      expect(ages.corrected.span.totalDays).toBe(36);
      expect(ages.corrected.span.months).toBe(1);
    }
  });
});

describe("PC-F2-AC2 예정일 이전이면 교정 D-day 와 오늘 재태주수가 보인다", () => {
  it("오늘이 2026-04-01 이면 교정 D-25, 재태 36주 3일이다", () => {
    const ages = computeChildAges(
      { birthDate: BIRTH, dueDate: DUE },
      parseCalendarDate("2026-04-01")!,
    );
    expect(ages.corrected.kind).toBe("before-due");
    if (ages.corrected.kind === "before-due") {
      expect(ages.corrected.daysUntilDue).toBe(25);
      expect(ages.corrected.gestationToday).toEqual({ totalDays: 255, weeks: 36, days: 3 });
    }
  });
});

describe("PC-F2-AC3 다음 월령일이 생후·교정 나란히 보인다", () => {
  it("오늘이 2026-06-01 이면 생후 4개월(2026-07-01), 교정 2개월(2026-06-26) 이다", () => {
    const ages = computeChildAges(
      { birthDate: BIRTH, dueDate: DUE },
      parseCalendarDate("2026-06-01")!,
    );
    expect(ages.nextMonthDates.chronological).toEqual({ months: 4, date: "2026-07-01" });
    expect(ages.nextMonthDates.corrected).toEqual({ months: 2, date: "2026-06-26" });
  });
});

describe("PC-F2-AC4 재태 37주 이상이면 교정 칸이 보이지 않는다", () => {
  it("출산 예정일 2026-03-10(재태 38주 5일)이면 교정이 숨겨지고 생후 나이만 남는다", () => {
    const dueEarly = parseCalendarDate("2026-03-10")!;
    const ages = computeChildAges(
      { birthDate: BIRTH, dueDate: dueEarly },
      parseCalendarDate("2026-06-01")!,
    );
    expect(ages.gestationAtBirth).toEqual({ totalDays: 271, weeks: 38, days: 5 });
    expect(ages.correctionApplies).toBe(false);
    expect(ages.corrected).toEqual({ kind: "hidden" });
  });
});
