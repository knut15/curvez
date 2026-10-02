// 생후·교정 나이 계산. entities/child/model 안에서만 쓰는 조각이다(PLC-05).
import {
  addMonths,
  calendarSpan,
  daysBetween,
  type CalendarDate,
  type CalendarSpan,
} from "@/shared/lib/calendar-date";

import { gestationFromDates, toGestationalAge, type GestationalAge } from "./gestation";

// 재태 37주(259일) 이상이면 교정 표시를 숨긴다.
const CORRECTION_HIDDEN_FROM_DAYS = 259;

export type CorrectedAge =
  | { kind: "hidden" }
  | {
      kind: "before-due";
      daysUntilDue: number;
      gestationToday: GestationalAge;
    }
  | { kind: "after-due"; span: CalendarSpan };

export type ChildAges = {
  today: CalendarDate;
  gestationAtBirth: GestationalAge;
  correctionApplies: boolean;
  chronological: CalendarSpan;
  corrected: CorrectedAge;
  nextMonthDates: {
    chronological: { months: number; date: CalendarDate };
    corrected: { months: number; date: CalendarDate } | null;
  };
};

export function computeChildAges(
  input: { birthDate: CalendarDate; dueDate: CalendarDate },
  today: CalendarDate,
): ChildAges {
  const { birthDate, dueDate } = input;
  const gestationAtBirth = gestationFromDates(birthDate, dueDate);
  const correctionApplies = gestationAtBirth.totalDays < CORRECTION_HIDDEN_FROM_DAYS;
  const chronological = calendarSpan(birthDate, today);

  let corrected: CorrectedAge;
  if (!correctionApplies) {
    corrected = { kind: "hidden" };
  } else if (today < dueDate) {
    const daysUntilDue = daysBetween(today, dueDate);
    const gestationToday = toGestationalAge(
      gestationAtBirth.totalDays + daysBetween(birthDate, today),
    );
    corrected = { kind: "before-due", daysUntilDue, gestationToday };
  } else {
    corrected = { kind: "after-due", span: calendarSpan(dueDate, today) };
  }

  const nextChronologicalMonths = chronological.months + 1;
  const nextCorrected =
    corrected.kind === "after-due"
      ? {
          months: corrected.span.months + 1,
          date: addMonths(dueDate, corrected.span.months + 1),
        }
      : null;

  return {
    today,
    gestationAtBirth,
    correctionApplies,
    chronological,
    corrected,
    nextMonthDates: {
      chronological: {
        months: nextChronologicalMonths,
        date: addMonths(birthDate, nextChronologicalMonths),
      },
      corrected: nextCorrected,
    },
  };
}
