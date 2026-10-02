// F10 예방접종 일정. 기준 데이터는 이 슬라이스 안에서만 읽는다(ARCH-107).
import {
  addAgeOffset,
  addDays,
  calendarSpan,
  daysBetween,
  type AgeOffset,
  type CalendarDate,
  type CalendarSpan,
} from "@/shared/lib/calendar-date";
import { resolveReferenceMeta, type ReferenceMeta, type ReferenceMetaInput } from "@/shared/lib/reference";

import rawData from "../data/vaccination-schedule.json";

export type VaccineDose = {
  id: string;
  order: number;
  label: string;
  sourceTimingText: string;
  window: { start: AgeOffset; endExclusive: AgeOffset };
};

export type VaccineSeries = {
  id: string;
  label: string;
  alternativeGroup: string | null;
  doses: VaccineDose[];
};

export type VaccinationNote = { id: string; text: string };

type VaccinationData = {
  meta: ReferenceMetaInput;
  series: VaccineSeries[];
  notes: VaccinationNote[];
};

// JSON 구조가 VaccinationData 와 다르면 여기서 컴파일 오류가 난다(단언 없이 구조 검사).
const data: VaccinationData = rawData;

export const vaccinationMeta: ReferenceMeta = resolveReferenceMeta(data.meta, "vaccination-schedule");
export const vaccinationSeries: VaccineSeries[] = data.series;
export const vaccinationNotes: VaccinationNote[] = data.notes;

export type VaccinationStatus = "done" | "soon" | "missed" | "upcoming";

export type CorrectedAtDate =
  | { kind: "before-due"; daysUntilDue: number }
  | { kind: "after-due"; span: CalendarSpan };

export type PlannedDose = {
  seriesId: string;
  seriesLabel: string;
  dose: VaccineDose;
  recommendedDate: CalendarDate;
  lastDate: CalendarDate;
  correctedAtRecommended: CorrectedAtDate | null;
  status: VaccinationStatus;
};

/** 상태는 위에서부터 처음 맞는 줄로 정한다(architecture.md ⑨ 표). */
export function vaccinationStatus(input: {
  recommendedDate: CalendarDate;
  lastDate: CalendarDate;
  completed: boolean;
  today: CalendarDate;
}): VaccinationStatus {
  const { recommendedDate, lastDate, completed, today } = input;
  if (completed) return "done";
  if (today > lastDate) return "missed";
  if (daysBetween(today, recommendedDate) <= 7) return "soon";
  return "upcoming";
}

function correctedAt(date: CalendarDate, correctedFrom: CalendarDate | null): CorrectedAtDate | null {
  if (correctedFrom === null) return null;
  if (date < correctedFrom) {
    return { kind: "before-due", daysUntilDue: daysBetween(date, correctedFrom) };
  }
  return { kind: "after-due", span: calendarSpan(correctedFrom, date) };
}

/** 같은 alternativeGroup 의 다른 series 에 완료 체크가 있으면, 체크가 없는 쪽 series 를 뺀다. */
function filterAlternatives(series: VaccineSeries[], completedDoseIds: readonly string[]): VaccineSeries[] {
  const completedSet = new Set(completedDoseIds);
  const groups = new Map<string, VaccineSeries[]>();
  for (const s of series) {
    if (s.alternativeGroup === null) continue;
    const list = groups.get(s.alternativeGroup) ?? [];
    list.push(s);
    groups.set(s.alternativeGroup, list);
  }

  const excludedSeriesIds = new Set<string>();
  for (const [, group] of groups) {
    const withCompleted = group.filter((s) => s.doses.some((d) => completedSet.has(d.id)));
    if (withCompleted.length > 0) {
      const keep = new Set(withCompleted.map((s) => s.id));
      for (const s of group) {
        if (!keep.has(s.id)) excludedSeriesIds.add(s.id);
      }
    }
  }

  return series.filter((s) => !excludedSeriesIds.has(s.id));
}

export function planVaccinations(input: {
  birthDate: CalendarDate;
  correctedFrom: CalendarDate | null;
  today: CalendarDate;
  completedDoseIds: readonly string[];
}): { doses: PlannedDose[]; notes: VaccinationNote[] } {
  const { birthDate, correctedFrom, today, completedDoseIds } = input;
  const completedSet = new Set(completedDoseIds);
  const includedSeries = filterAlternatives(vaccinationSeries, completedDoseIds);

  const planned: { entry: PlannedDose; index: number }[] = [];
  let index = 0;
  for (const series of includedSeries) {
    for (const dose of series.doses) {
      const recommendedDate = addAgeOffset(birthDate, dose.window.start);
      const lastDate = addDays(addAgeOffset(birthDate, dose.window.endExclusive), -1);
      const completed = completedSet.has(dose.id);
      const status = vaccinationStatus({ recommendedDate, lastDate, completed, today });
      planned.push({
        entry: {
          seriesId: series.id,
          seriesLabel: series.label,
          dose,
          recommendedDate,
          lastDate,
          correctedAtRecommended: correctedAt(recommendedDate, correctedFrom),
          status,
        },
        index,
      });
      index += 1;
    }
  }

  planned.sort((a, b) => {
    if (a.entry.recommendedDate !== b.entry.recommendedDate) {
      return a.entry.recommendedDate < b.entry.recommendedDate ? -1 : 1;
    }
    return a.index - b.index;
  });

  return { doses: planned.map((p) => p.entry), notes: vaccinationNotes };
}
