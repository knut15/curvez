"use client";

// F10 예방접종 일정. entities/vaccination 계산·저장과 화면 표시를 묶는다.
import { useState } from "react";

import type { CalendarDate } from "@/shared/lib/calendar-date";
import {
  loadCompletedDoseIds,
  planVaccinations,
  setDoseCompleted,
  vaccinationMeta,
  type CorrectedAtDate,
  type VaccinationStatus,
} from "@/entities/vaccination";
import { ReferenceFooter, type StatusBadgeKind } from "@/shared/ui";

import { VaccinationRoundItem } from "./VaccinationRoundItem";

export type VaccinationPlanSectionProps = {
  childId: string;
  birthDate: CalendarDate;
  correctedFrom: CalendarDate | null;
  today: CalendarDate;
};

function correctedAgeLabel(corrected: CorrectedAtDate | null): string | null {
  if (corrected === null) return null;
  if (corrected.kind === "before-due") return `교정 D-${corrected.daysUntilDue}`;
  const { span } = corrected;
  if (span.months === 0) return `교정 ${span.days}일`;
  return `교정 ${span.totalDays}일 · ${span.months}개월`;
}

const STATUS_BADGE_KIND: Record<VaccinationStatus, StatusBadgeKind> = {
  done: "done",
  soon: "soon",
  missed: "missed",
  upcoming: "upcoming",
};

export function VaccinationPlanSection({ childId, birthDate, correctedFrom, today }: VaccinationPlanSectionProps) {
  const [, setRefreshKey] = useState(0);

  const completedResult = loadCompletedDoseIds(childId);
  const completedDoseIds = completedResult.status === "ok" ? completedResult.doseIds : [];

  const plan = planVaccinations({ birthDate, correctedFrom, today, completedDoseIds });
  const sources = [{ title: vaccinationMeta.title, effectiveDate: vaccinationMeta.effectiveDate }];

  function handleToggle(doseId: string, next: boolean) {
    setDoseCompleted(childId, doseId, next);
    setRefreshKey((k) => k + 1);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-5)" }}>
      <ul className="pc-round-list">
        {plan.doses.map((d) => (
          <VaccinationRoundItem
            key={d.dose.id}
            vaccineName={d.seriesLabel}
            doseLabel={d.dose.label}
            recommendedDate={d.recommendedDate}
            correctedAgeLabel={correctedAgeLabel(d.correctedAtRecommended)}
            status={STATUS_BADGE_KIND[d.status]}
            completed={d.status === "done"}
            onToggleComplete={(v) => handleToggle(d.dose.id, v)}
          />
        ))}
      </ul>
      <ReferenceFooter sources={sources} />
    </div>
  );
}
