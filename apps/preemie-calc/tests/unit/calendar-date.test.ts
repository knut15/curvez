// shared/lib/calendar-date 의 가장자리 규칙.
// architecture.md ③ "addMonths 는 없는 날짜를 그달 말일로 맞춘다", "todayInKst 는 KST 로 계산한다".
import { describe, expect, it } from "vitest";

import { addMonths, parseCalendarDate, todayInKst } from "@/shared/lib/calendar-date";

describe("addMonths 말일 보정 (architecture.md ③ 결정 로그)", () => {
  it("1월 31일 + 1개월은 없는 날짜(2월 31일) 대신 그달 말일(2월 28일)로 보정된다", () => {
    const jan31 = parseCalendarDate("2026-01-31");
    expect(jan31).not.toBeNull();
    expect(addMonths(jan31!, 1)).toBe("2026-02-28");
  });
});

describe("todayInKst KST 경계 (UTC 15:00 전후)", () => {
  it("UTC 14:59:59 는 같은 날짜 23:59:59 KST 라 날짜가 그대로다", () => {
    expect(todayInKst(new Date("2026-01-01T14:59:59.000Z"))).toBe("2026-01-01");
  });

  it("UTC 15:00:00 은 다음 날 00:00:00 KST 라 날짜가 넘어간다", () => {
    expect(todayInKst(new Date("2026-01-01T15:00:00.000Z"))).toBe("2026-01-02");
  });
});
