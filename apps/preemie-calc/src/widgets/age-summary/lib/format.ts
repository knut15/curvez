// F2 대시보드용 나이 요약 표시값 조립. 계산 자체는 entities/child/model 이 끝낸다.
import type { ChildAges } from "@/entities/child";

export type AgeSummaryFormatted = {
  chronological: { value: string; label: string };
  // subValue 는 before-due 일 때만 있다(DSG-01). "교정" 라벨은 여기 담지 않고 그리는
  // 쪽(AgeSummaryCard·ShareCardCanvas)이 붙인다 — 두 칸이 같은 규칙을 따르게 하기 위해서다
  // (ACC-02).
  corrected: { kind: "hidden" | "before-due" | "after-due"; value: string; subValue?: string } | null;
  basisLine: string;
  nextMonthDates: { chronological: string; corrected: string | null };
};

export function formatAgeSummary(ages: ChildAges): AgeSummaryFormatted {
  const chronologicalValue = `${ages.chronological.totalDays}일 · ${ages.chronological.months}개월`;

  let corrected: AgeSummaryFormatted["corrected"];
  if (ages.corrected.kind === "hidden") {
    corrected = null;
  } else if (ages.corrected.kind === "before-due") {
    const g = ages.corrected.gestationToday;
    corrected = {
      kind: "before-due",
      value: `D-${ages.corrected.daysUntilDue}`,
      subValue: `재태 ${g.weeks}주 ${g.days}일`,
    };
  } else {
    corrected = {
      kind: "after-due",
      value: `${ages.corrected.span.totalDays}일 · ${ages.corrected.span.months}개월`,
    };
  }

  return {
    chronological: { value: chronologicalValue, label: "생후" },
    corrected,
    basisLine: "생후: 출생일 기준 · 교정: 출산 예정일 기준",
    nextMonthDates: {
      chronological: `생후 ${ages.nextMonthDates.chronological.months}개월: ${ages.nextMonthDates.chronological.date}`,
      corrected: ages.nextMonthDates.corrected
        ? `교정 ${ages.nextMonthDates.corrected.months}개월: ${ages.nextMonthDates.corrected.date}`
        : null,
    },
  };
}
