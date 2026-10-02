// 재태기간 계산과 날짜 범위 검증. entities/child/model 안에서만 쓰는 조각이다(PLC-05).
import { addDays, daysBetween, type CalendarDate } from "@/shared/lib/calendar-date";

// SPEC F1 예외: 22주 0일 미만 또는 44주 0일 초과. 44주 0일 정각은 초과가 아니라서 받는다.
const MIN_GESTATION_DAYS = 154;
const MAX_GESTATION_DAYS = 308;

export type GestationalAge = { totalDays: number; weeks: number; days: number };

export function toGestationalAge(totalDays: number): GestationalAge {
  return { totalDays, weeks: Math.floor(totalDays / 7), days: totalDays % 7 };
}

/** 280 − daysBetween(birth, due). */
export function gestationFromDates(
  birthDate: CalendarDate,
  dueDate: CalendarDate,
): GestationalAge {
  return toGestationalAge(280 - daysBetween(birthDate, dueDate));
}

/** birth + (280 − 재태일수). */
export function dueDateFromGestation(
  birthDate: CalendarDate,
  ga: { weeks: number; days: number },
): CalendarDate {
  const gestationDays = ga.weeks * 7 + ga.days;
  return addDays(birthDate, 280 - gestationDays);
}

export type ProfileErrorCode =
  | "gestation-out-of-range"
  | "birth-after-today"
  | "invalid-date";

export type ProfileError = { code: ProfileErrorCode };

/** 출생일·출산예정일 자체의 유효성만 본다(재태 범위, 출생일<=오늘). 이름·성별 등 나머지 필드는 보지 않는다. */
export function validateGestationDates(
  birthDate: CalendarDate,
  dueDate: CalendarDate,
  today: CalendarDate,
): ProfileError[] {
  const errors: ProfileError[] = [];

  if (birthDate > today) {
    errors.push({ code: "birth-after-today" });
  }

  const gestation = gestationFromDates(birthDate, dueDate);
  if (
    gestation.totalDays < MIN_GESTATION_DAYS ||
    gestation.totalDays > MAX_GESTATION_DAYS
  ) {
    errors.push({ code: "gestation-out-of-range" });
  }

  return errors;
}
