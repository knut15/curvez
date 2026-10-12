// 달력 날짜 계산. `Date` 객체는 이 파일 안에서만 계산 도구로 쓰고 밖으로 내보내지 않는다.
// 날짜는 전부 KST 기준 달력 날짜 문자열 `YYYY-MM-DD` (`CalendarDate`) 로 표현한다.
// 시계를 읽는 함수(`todayInKst`)는 이 파일에 하나뿐이다. `useToday` 는 별도 파일(client)에 둔다.

export type CalendarDate = string & { readonly __brand: "CalendarDate" };

export type CalendarSpan = { totalDays: number; months: number; days: number };

export type AgeOffset = { months: number; days: number };

const DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

function toUtcMs(year: number, month: number, day: number): number {
  return Date.UTC(year, month - 1, day);
}

function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

function formatCalendarDate(year: number, month: number, day: number): CalendarDate {
  return `${year}-${pad2(month)}-${pad2(day)}` as CalendarDate;
}

function fromUtcMs(ms: number): CalendarDate {
  const d = new Date(ms);
  return formatCalendarDate(d.getUTCFullYear(), d.getUTCMonth() + 1, d.getUTCDate());
}

type DateParts = { year: number; month: number; day: number };

function parts(date: CalendarDate): DateParts {
  const match = DATE_PATTERN.exec(date);
  if (!match) {
    throw new Error(`잘못된 CalendarDate 값이다: ${date}`);
  }
  return { year: Number(match[1]), month: Number(match[2]), day: Number(match[3]) };
}

/** 문자열이 실제 달력 날짜인지 검증한다. "2026-02-30" 같은 값은 null 이다. */
export function parseCalendarDate(input: string): CalendarDate | null {
  const match = DATE_PATTERN.exec(input);
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const d = new Date(toUtcMs(year, month, day));
  if (
    d.getUTCFullYear() !== year ||
    d.getUTCMonth() + 1 !== month ||
    d.getUTCDate() !== day
  ) {
    return null;
  }
  return input as CalendarDate;
}

/** 시계를 읽는 유일한 함수다. `now` 에 9시간을 더한 UTC 날짜를 KST 달력 날짜로 읽는다.
 * 한국은 서머타임이 없어 이 방식으로 충분하다. */
export function todayInKst(now: Date = new Date()): CalendarDate {
  const kst = new Date(now.getTime() + 9 * 60 * 60 * 1000);
  return formatCalendarDate(kst.getUTCFullYear(), kst.getUTCMonth() + 1, kst.getUTCDate());
}

/** to − from. 같은 날이면 0. */
export function daysBetween(from: CalendarDate, to: CalendarDate): number {
  const a = parts(from);
  const b = parts(to);
  const msPerDay = 24 * 60 * 60 * 1000;
  return Math.round((toUtcMs(b.year, b.month, b.day) - toUtcMs(a.year, a.month, a.day)) / msPerDay);
}

export function addDays(date: CalendarDate, n: number): CalendarDate {
  const p = parts(date);
  return fromUtcMs(toUtcMs(p.year, p.month, p.day) + n * 24 * 60 * 60 * 1000);
}

/** month 는 1~12. 다음 달 0일 = 이번 달 말일. */
function daysInMonth(year: number, month: number): number {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

/** 없는 날짜는 그달 말일로 맞춘다 (01-31 + 1개월 = 02-28). */
export function addMonths(date: CalendarDate, n: number): CalendarDate {
  const p = parts(date);
  const totalMonths = p.month - 1 + n;
  const year = p.year + Math.floor(totalMonths / 12);
  const month = (((totalMonths % 12) + 12) % 12) + 1;
  const day = Math.min(p.day, daysInMonth(year, month));
  return formatCalendarDate(year, month, day);
}

export function addAgeOffset(date: CalendarDate, offset: AgeOffset): CalendarDate {
  return addDays(addMonths(date, offset.months), offset.days);
}

/** months = addMonths(from, m) <= to 인 가장 큰 m, days = daysBetween(addMonths(from, months), to). */
export function calendarSpan(from: CalendarDate, to: CalendarDate): CalendarSpan {
  const totalDays = daysBetween(from, to);
  if (totalDays < 0) {
    throw new Error("calendarSpan 은 from 이 to 보다 앞이거나 같은 구간만 계산한다");
  }
  // 한 달은 최대 31일이므로 이 추정값은 항상 실제 답보다 작거나 같다(안전한 하한).
  let months = Math.floor(totalDays / 31);
  while (daysBetween(from, addMonths(from, months + 1)) <= totalDays) {
    months += 1;
  }
  const days = daysBetween(addMonths(from, months), to);
  return { totalDays, months, days };
}
