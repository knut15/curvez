// F3 "어느 나이를 쓰나" 안내.
import { describe, expect, it } from "vitest";

import { ageBasisItems, ageBasisMeta, ageBasisRows } from "@/entities/age-basis";
import { computeChildAges } from "@/entities/child";
import { parseCalendarDate } from "@/shared/lib/calendar-date";

const BIRTH = parseCalendarDate("2026-03-01")!;
const DUE = parseCalendarDate("2026-04-26")!;
const TODAY = parseCalendarDate("2026-06-01")!;

describe("PC-F3-AC1 예방접종은 출생 기준", () => {
  it("오늘이 2026-06-01 이면 예방접종이 출생 기준 생후 3개월이다", () => {
    const ages = computeChildAges({ birthDate: BIRTH, dueDate: DUE }, TODAY);
    const rows = ageBasisRows({ chronological: ages.chronological, corrected: ages.corrected });
    const row = rows.find((r) => r.id === "vaccination");
    expect(row?.basis).toBe("chronological");
    expect(row?.age).toEqual({ months: 3, days: 0 });
  });
});

describe("PC-F3-AC2 이유식은 교정 기준", () => {
  it("같은 날 이유식이 교정 기준 교정 1개월이다", () => {
    const ages = computeChildAges({ birthDate: BIRTH, dueDate: DUE }, TODAY);
    const rows = ageBasisRows({ chronological: ages.chronological, corrected: ages.corrected });
    const row = rows.find((r) => r.id === "solid-food");
    expect(row?.basis).toBe("corrected");
    expect(row?.age).toEqual({ months: 1, days: 6 });
  });
});

describe("PC-F3-AC3 영유아검진 방문은 출생 기준, 문진표는 교정 기준(24개월 검진까지)", () => {
  it("같은 날 영유아검진 방문은 출생 기준이다", () => {
    const ages = computeChildAges({ birthDate: BIRTH, dueDate: DUE }, TODAY);
    const rows = ageBasisRows({ chronological: ages.chronological, corrected: ages.corrected });
    expect(rows.find((r) => r.id === "checkup-visit")?.basis).toBe("chronological");
  });

  it("같은 날 문진표·발달선별검사지는 교정 기준이다", () => {
    const ages = computeChildAges({ birthDate: BIRTH, dueDate: DUE }, TODAY);
    const rows = ageBasisRows({ chronological: ages.chronological, corrected: ages.corrected });
    expect(rows.find((r) => r.id === "checkup-questionnaire")?.basis).toBe("corrected");
  });
});

describe("PC-F3-AC4 항목마다 근거 자료 이름과 기준일이 있다", () => {
  it("모든 항목의 sourceId 가 메타의 sources 목록에 있다", () => {
    const sourceIds = new Set(ageBasisMeta.sources.map((s) => s.id));
    for (const item of ageBasisItems) {
      expect(sourceIds.has(item.sourceId)).toBe(true);
    }
  });

  it(
    "메타의 effectiveDate·lastVerified 는 둘 다 날짜이거나 둘 다 null 이다(architect 결정 1, ACC-04) — 현재 값은 " +
      (ageBasisMeta.effectiveDate === null ? "둘 다 null(원문 대조 전)" : `둘 다 날짜(${ageBasisMeta.effectiveDate})`),
    () => {
      expect(ageBasisMeta.effectiveDate === null).toBe(ageBasisMeta.lastVerified === null);
      if (ageBasisMeta.effectiveDate !== null) {
        expect(ageBasisMeta.effectiveDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      }
    },
  );
});

describe("PC-F3-AC5 재태 37주 이상 아이는 모든 항목이 생후 나이 그대로 보인다", () => {
  it("재태 38주 5일 아이는 모든 항목의 basis 가 chronological 이다", () => {
    const dueEarly = parseCalendarDate("2026-03-10")!;
    const ages = computeChildAges({ birthDate: BIRTH, dueDate: dueEarly }, TODAY);
    const rows = ageBasisRows({ chronological: ages.chronological, corrected: ages.corrected });
    for (const row of rows) {
      expect(row.basis).toBe("chronological");
    }
  });
});
