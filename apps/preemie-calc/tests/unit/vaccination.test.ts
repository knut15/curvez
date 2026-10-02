// F10 예방접종 일정. PC-F10-AC1, AC2. (AC3 "새로 열어도 유지된다"는 localStorage 의 실제
// 브라우저 동작이라 vitest(node 환경)에서 window 를 쓸 수 없다 — E2E(tests/e2e/vaccinations.spec.ts)
// 에서 확인한다.)
import { describe, expect, it } from "vitest";

import { planVaccinations, vaccinationStatus } from "@/entities/vaccination";
import { parseCalendarDate } from "@/shared/lib/calendar-date";

const BIRTH = parseCalendarDate("2026-03-01")!;
const DUE = parseCalendarDate("2026-04-26")!; // 32주 0일 → correctionApplies

describe("PC-F10-AC1 생후 2개월 접종은 2026-05-01 로 표시되고 '교정 5일'이 보인다", () => {
  it("dtap-1(2개월)의 권장일이 2026-05-01, 교정 나이가 0개월 5일(after-due)이다", () => {
    const { doses } = planVaccinations({
      birthDate: BIRTH,
      correctedFrom: DUE,
      today: parseCalendarDate("2026-05-01")!,
      completedDoseIds: [],
    });
    const dtap1 = doses.find((d) => d.dose.id === "dtap-1");
    expect(dtap1).toBeDefined();
    expect(dtap1!.recommendedDate).toBe("2026-05-01");
    expect(dtap1!.correctedAtRecommended).toEqual({
      kind: "after-due",
      span: { totalDays: 5, months: 0, days: 5 },
    });
  });
});

describe("PC-F10-AC2 완료/임박/놓침 판정 — architecture.md ⑨ 예시 그대로", () => {
  // 예시 접종(권장일 2026-05-01, 한 시점 접종이라 lastDate 도 2026-05-01).
  const recommendedDate = parseCalendarDate("2026-05-01")!;
  const lastDate = parseCalendarDate("2026-05-01")!;

  it("오늘이 2026-04-23 이면 upcoming(8일 남음)이다", () => {
    const status = vaccinationStatus({
      recommendedDate,
      lastDate,
      completed: false,
      today: parseCalendarDate("2026-04-23")!,
    });
    expect(status).toBe("upcoming");
  });

  it("오늘이 2026-04-24 이면 soon(7일 남음, 경계 포함)이다", () => {
    const status = vaccinationStatus({
      recommendedDate,
      lastDate,
      completed: false,
      today: parseCalendarDate("2026-04-24")!,
    });
    expect(status).toBe("soon");
  });

  it("오늘이 권장일(2026-05-01) 당일이면 soon 이다", () => {
    const status = vaccinationStatus({
      recommendedDate,
      lastDate,
      completed: false,
      today: parseCalendarDate("2026-05-01")!,
    });
    expect(status).toBe("soon");
  });

  it("오늘이 2026-05-02 이고 체크하지 않았으면 missed 다", () => {
    const status = vaccinationStatus({
      recommendedDate,
      lastDate,
      completed: false,
      today: parseCalendarDate("2026-05-02")!,
    });
    expect(status).toBe("missed");
  });

  it("권장일이 지나도 완료 체크가 있으면 done 이다(미래에 미리 체크해도 done)", () => {
    const statusPast = vaccinationStatus({
      recommendedDate,
      lastDate,
      completed: true,
      today: parseCalendarDate("2026-06-01")!,
    });
    expect(statusPast).toBe("done");

    const statusFuture = vaccinationStatus({
      recommendedDate,
      lastDate,
      completed: true,
      today: parseCalendarDate("2026-04-01")!,
    });
    expect(statusFuture).toBe("done");
  });
});

describe("planVaccinations 은 대체 백신(로타바이러스)을 완료 여부로 거른다", () => {
  it("RV1 1차를 완료 체크하면 RV5 차수는 목록에서 빠진다", () => {
    const withoutCompletion = planVaccinations({
      birthDate: BIRTH,
      correctedFrom: DUE,
      today: parseCalendarDate("2026-05-01")!,
      completedDoseIds: [],
    });
    const rv5DosesBefore = withoutCompletion.doses.filter((d) => d.seriesId === "rv5");
    expect(rv5DosesBefore.length).toBeGreaterThan(0);

    const withCompletion = planVaccinations({
      birthDate: BIRTH,
      correctedFrom: DUE,
      today: parseCalendarDate("2026-05-01")!,
      completedDoseIds: ["rv1-1"],
    });
    const rv5DosesAfter = withCompletion.doses.filter((d) => d.seriesId === "rv5");
    const rv1DosesAfter = withCompletion.doses.filter((d) => d.seriesId === "rv1");
    expect(rv5DosesAfter.length).toBe(0);
    expect(rv1DosesAfter.length).toBeGreaterThan(0);
  });
});
