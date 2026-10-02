// F1 아이 프로필 — 재태기간 계산, 주수 역산, 검증 예외.
import { describe, expect, it } from "vitest";

import {
  dueDateFromGestation,
  gestationFromDates,
  validateProfileDraft,
  type ProfileDraft,
} from "@/entities/child";
import { parseCalendarDate } from "@/shared/lib/calendar-date";

const BIRTH = parseCalendarDate("2026-03-01")!;
const DUE = parseCalendarDate("2026-04-26")!;
const TODAY = parseCalendarDate("2026-12-01")!;

function gestationDraft(weeks: number, days: number): ProfileDraft {
  return {
    mode: "gestation",
    name: "",
    sex: "male",
    birthDate: "2026-03-01",
    gestation: { weeks, days },
    birthWeightGrams: null,
  };
}

describe("PC-F1-AC2 출생일·출산 예정일 → 재태기간", () => {
  it("출생일 2026-03-01, 출산 예정일 2026-04-26 이면 재태기간이 32주 0일이다", () => {
    const ga = gestationFromDates(BIRTH, DUE);
    expect(ga.totalDays).toBe(224);
    expect(ga.weeks).toBe(32);
    expect(ga.days).toBe(0);
  });
});

describe("PC-F1-AC3 출생일·주수 → 예정일 역산 (AC2 와 같은 프로필)", () => {
  it("출생일 2026-03-01, 주수 32주 0일이면 예정일이 2026-04-26 으로 계산된다", () => {
    const due = dueDateFromGestation(BIRTH, { weeks: 32, days: 0 });
    expect(due).toBe(DUE);
  });

  it("역산한 예정일로 재태기간을 다시 계산하면 AC2 와 같은 값이 나온다", () => {
    const due = dueDateFromGestation(BIRTH, { weeks: 32, days: 0 });
    expect(gestationFromDates(BIRTH, due)).toEqual(gestationFromDates(BIRTH, DUE));
  });
});

describe("PC-F1-EX1 재태기간 범위 예외 (22주 0일 미만 · 44주 0일 초과, 경계 154·308일 양쪽)", () => {
  it("재태 21주 6일(153일, 하한 경계 바로 아래)은 gestation-out-of-range 오류다", () => {
    const errors = validateProfileDraft(gestationDraft(21, 6), TODAY);
    expect(errors.map((e) => e.code)).toContain("gestation-out-of-range");
  });

  it("재태 22주 0일(154일, 하한 경계)은 오류가 아니다", () => {
    const errors = validateProfileDraft(gestationDraft(22, 0), TODAY);
    expect(errors.map((e) => e.code)).not.toContain("gestation-out-of-range");
  });

  it("재태 44주 0일(308일, 상한 경계)은 오류가 아니다", () => {
    const errors = validateProfileDraft(gestationDraft(44, 0), TODAY);
    expect(errors.map((e) => e.code)).not.toContain("gestation-out-of-range");
  });

  it("재태 44주 1일(309일, 상한 경계 바로 위)은 gestation-out-of-range 오류다", () => {
    const errors = validateProfileDraft(gestationDraft(44, 1), TODAY);
    expect(errors.map((e) => e.code)).toContain("gestation-out-of-range");
  });

  it("SPEC 예시: 출산 예정일 2026-08-01, 출생일 2026-03-01 은 22주 0일 미만이라 오류다", () => {
    const errors = validateProfileDraft(
      {
        mode: "due-date",
        name: "",
        sex: "male",
        birthDate: "2026-03-01",
        dueDate: "2026-08-01",
        birthWeightGrams: null,
      },
      TODAY,
    );
    expect(errors.map((e) => e.code)).toContain("gestation-out-of-range");
  });
});

describe("PC-F1-EX2 출생일이 오늘보다 뒤면 저장을 막는다", () => {
  it("출생일이 오늘보다 뒤면 birth-after-today 오류다", () => {
    const errors = validateProfileDraft(
      {
        mode: "due-date",
        name: "",
        sex: "male",
        birthDate: "2026-12-31",
        dueDate: "2027-02-01",
        birthWeightGrams: null,
      },
      parseCalendarDate("2026-12-01")!,
    );
    expect(errors.map((e) => e.code)).toContain("birth-after-today");
  });

  it("출생일이 오늘이거나 이전이면 birth-after-today 오류가 없다", () => {
    const errors = validateProfileDraft(gestationDraft(32, 0), TODAY);
    expect(errors.map((e) => e.code)).not.toContain("birth-after-today");
  });
});

describe("[curvez-reviewer/ACC-05] 주수 입력의 '일' 칸은 0~6 정수만 허용한다", () => {
  it("일 칸에 9(범위 밖)를 넣으면 invalid-date 오류다(gestation-out-of-range 가 아니다)", () => {
    const errors = validateProfileDraft(gestationDraft(32, 9), TODAY);
    expect(errors.map((e) => e.code)).toEqual(["invalid-date"]);
  });

  it("일 칸에 -3(음수)을 넣으면 invalid-date 오류다", () => {
    const errors = validateProfileDraft(gestationDraft(32, -3), TODAY);
    expect(errors.map((e) => e.code)).toEqual(["invalid-date"]);
  });

  it("일 칸에 1.5(소수)를 넣으면 invalid-date 오류다", () => {
    const errors = validateProfileDraft(gestationDraft(32, 1.5), TODAY);
    expect(errors.map((e) => e.code)).toEqual(["invalid-date"]);
  });

  it("일 칸에 0~6 사이 정수는 오류가 없다(경계값 0·6)", () => {
    expect(validateProfileDraft(gestationDraft(32, 0), TODAY)).toEqual([]);
    expect(validateProfileDraft(gestationDraft(32, 6), TODAY)).toEqual([]);
  });
});
