// 공유 링크 (F7): /share#b=YYYY-MM-DD&d=YYYY-MM-DD. entities/child/model 안에서만 쓰는
// 조각이다(PLC-05). 담는 값은 출생일·출산예정일 둘뿐이다 (PC-F7-AC1, AC3). 이름·성별·체중·
// 프로필 id 는 넣지 않는다. 값은 fragment 에만 둔다(architecture ⑤).
import { parseCalendarDate, type CalendarDate } from "@/shared/lib/calendar-date";

import { validateGestationDates, type ProfileError } from "./gestation";

export type SharePayload = { birthDate: CalendarDate; dueDate: CalendarDate };

export function encodeShareFragment(p: SharePayload): string {
  return `b=${p.birthDate}&d=${p.dueDate}`;
}

/** 앞의 "#" 는 있어도 없어도 된다. 모르는 키는 버린다. */
export function decodeShareFragment(hash: string): SharePayload | null {
  const trimmed = hash.startsWith("#") ? hash.slice(1) : hash;
  const params = new URLSearchParams(trimmed);
  const rawBirthDate = params.get("b");
  const rawDueDate = params.get("d");
  if (rawBirthDate === null || rawDueDate === null) return null;

  const birthDate = parseCalendarDate(rawBirthDate);
  const dueDate = parseCalendarDate(rawDueDate);
  if (!birthDate || !dueDate) return null;

  return { birthDate, dueDate };
}

/** decodeShareFragment 로 얻은 값의 재태 범위·출생일을 검증한다 (validateProfileDraft 와 같은 규칙). */
export function validateSharePayload(
  payload: SharePayload,
  today: CalendarDate,
): ProfileError[] {
  return validateGestationDates(payload.birthDate, payload.dueDate, today);
}
