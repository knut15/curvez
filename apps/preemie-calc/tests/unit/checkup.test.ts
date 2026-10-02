// F4 영유아검진 도우미.
import { describe, expect, it } from "vitest";

import { checkupRounds, planCheckups } from "@/entities/checkup";
import { addAgeOffset, addDays, parseCalendarDate } from "@/shared/lib/calendar-date";

const BIRTH = parseCalendarDate("2026-03-01")!;
const DUE = parseCalendarDate("2026-04-26")!;

describe("PC-F4-AC1 차수별 방문 기간 = 데이터 파일의 개월 범위 + 출생일", () => {
  it("각 차수의 visitStart·visitEnd 가 checkup-rounds.json 의 개월 범위를 출생일에 더한 값과 같다", () => {
    // 값을 하드코딩하지 않고, 공개 API 로 노출된 데이터(checkupRounds, 즉 JSON 을 그대로
    // 읽은 값)에서 기대값을 직접 계산해 planCheckups 의 출력과 대조한다.
    const plan = planCheckups({
      birthDate: BIRTH,
      correctedFrom: null,
      today: parseCalendarDate("2026-01-01")!,
    });
    expect(plan.rounds.length).toBe(checkupRounds.length);
    for (const entry of plan.rounds) {
      const expectedStart = addAgeOffset(BIRTH, entry.round.visitWindow.start);
      const expectedEnd = addDays(addAgeOffset(BIRTH, entry.round.visitWindow.endExclusive), -1);
      expect(entry.visitStart).toBe(expectedStart);
      expect(entry.visitEnd).toBe(expectedEnd);
    }
  });
});

describe("PC-F4-AC2 교정 4개월 기준 검사지 (2026-09-15, 생후 6개월 14일·교정 4개월 20일)", () => {
  it("오늘이 2026-09-15 면 작성할 검사지가 교정 4개월 기준으로 표시된다", () => {
    const plan = planCheckups({
      birthDate: BIRTH,
      correctedFrom: DUE,
      today: parseCalendarDate("2026-09-15")!,
    });
    expect(plan.currentQuestionnaireMonths).toBe(4);
    const current = plan.rounds.find((r) => r.status === "current");
    expect(current?.questionnaireBasis).toBe("corrected");
  });
});

describe("PC-F4-AC3 24개월 검진보다 뒤 차수는 검사지도 출생 기준", () => {
  it("5차(30~36개월) 방문 기간 안에서는 questionnaireBasis 가 chronological 이다", () => {
    const round5 = checkupRounds.find((r) => r.id === "round-5");
    expect(round5).toBeDefined();
    const today = addAgeOffset(BIRTH, round5!.visitWindow.start);
    const plan = planCheckups({ birthDate: BIRTH, correctedFrom: DUE, today });
    const entry = plan.rounds.find((r) => r.round.id === "round-5");
    expect(entry?.status).toBe("current");
    expect(entry?.questionnaireBasis).toBe("chronological");
  });
});

describe("PC-F4-EX1 모든 차수가 지난 아이(생후 72개월 이상)는 검진 대상 기간이 끝난다", () => {
  it("8차 방문 기간 마지막 날까지는 allPassed 가 false 다 (경계 아래)", () => {
    const round8 = checkupRounds.find((r) => r.id === "round-8");
    expect(round8).toBeDefined();
    const lastDay = addDays(addAgeOffset(BIRTH, round8!.visitWindow.endExclusive), -1);
    const plan = planCheckups({ birthDate: BIRTH, correctedFrom: null, today: lastDay });
    expect(plan.allPassed).toBe(false);
  });

  it("8차 방문 기간이 끝난 다음 날(생후 72개월 이상)은 allPassed 가 true 다 (경계 위)", () => {
    const round8 = checkupRounds.find((r) => r.id === "round-8");
    expect(round8).toBeDefined();
    const dayAfter = addAgeOffset(BIRTH, round8!.visitWindow.endExclusive);
    const plan = planCheckups({ birthDate: BIRTH, correctedFrom: null, today: dayAfter });
    expect(plan.allPassed).toBe(true);
  });
});

describe("[curvez-reviewer/ERR-01] 오늘이 출산 예정일 전이어도 planCheckups 는 예외를 던지지 않는다", () => {
  it("출생 2026-03-01·예정일 2026-04-26 아이를 출생일부터 120일 동안 하루씩 돌려도 예외가 0건이다", () => {
    let thrown = 0;
    for (let i = 0; i <= 120; i += 1) {
      const today = addDays(BIRTH, i);
      try {
        planCheckups({ birthDate: BIRTH, correctedFrom: DUE, today });
      } catch {
        thrown += 1;
      }
    }
    expect(thrown).toBe(0);
  });

  it("1차 검진 창 안(2026-03-15, 출산 예정일 2026-04-26 전)은 currentBeforeDue 가 true 이고 currentQuestionnaireMonths 가 null 이다", () => {
    const plan = planCheckups({
      birthDate: BIRTH,
      correctedFrom: DUE,
      today: parseCalendarDate("2026-03-15")!,
    });
    expect(plan.currentBeforeDue).toBe(true);
    expect(plan.currentQuestionnaireMonths).toBeNull();
  });
});
