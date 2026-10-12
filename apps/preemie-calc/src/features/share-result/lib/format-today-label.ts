// 공유 카드에 넣는 "오늘" 표시. CalendarDate 문자열을 직접 읽어 만든다 — Date 객체를 쓰지 않는다.
import type { CalendarDate } from "@/shared/lib/calendar-date";

/** "2026-06-01" → "2026년 6월 1일 기준" */
export function formatTodayLabel(today: CalendarDate): string {
  const [year, month, day] = today.split("-").map(Number);
  return `${year}년 ${month}월 ${day}일 기준`;
}
