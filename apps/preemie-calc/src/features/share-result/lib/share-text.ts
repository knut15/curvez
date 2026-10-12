// F7 결과 문구 복사(PC-F7-AC5~AC7). 순수 함수 — 이름은 입력 타입에 없어 문구에 들어갈 길이
// 타입에서 막힌다(PC-F7-AC6). architecture.md ⑫ 참고.
import type { CalendarDate } from "@/shared/lib/calendar-date";

import { formatTodayLabel } from "./format-today-label";

export type ShareTextInput = {
  today: CalendarDate;
  chronological: { value: string };
  corrected: { kind: "hidden" | "before-due" | "after-due"; value: string; subValue?: string } | null;
  shareUrl: string;
};

export function buildShareText(input: ShareTextInput): string {
  const { today, chronological, corrected, shareUrl } = input;

  const lines = [formatTodayLabel(today), `생후 ${chronological.value}`];

  if (corrected && corrected.kind !== "hidden") {
    const correctedLine =
      corrected.kind === "before-due" && corrected.subValue
        ? `교정 ${corrected.value} (${corrected.subValue})`
        : `교정 ${corrected.value}`;
    lines.push(correctedLine);
  }

  lines.push(shareUrl);

  return lines.join("\n");
}
