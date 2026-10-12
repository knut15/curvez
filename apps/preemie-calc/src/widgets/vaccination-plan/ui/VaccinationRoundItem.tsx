"use client";

// 스펙: .curvez/design/preemie-calc/components/VaccinationRoundItem.md
import { useId } from "react";

import { IconBadge, StatusBadge, type StatusBadgeKind } from "@/shared/ui";

export type VaccinationRoundItemProps = {
  vaccineName: string;
  doseLabel: string;
  recommendedDate: string;
  correctedAgeLabel: string | null;
  status: StatusBadgeKind;
  completed: boolean;
  onToggleComplete: (v: boolean) => void;
};

export function VaccinationRoundItem({
  vaccineName,
  doseLabel,
  recommendedDate,
  correctedAgeLabel,
  status,
  completed,
  onToggleComplete,
}: VaccinationRoundItemProps) {
  const checkboxId = useId();

  return (
    <li
      style={{
        listStyle: "none",
        background: "var(--color-bg-surface)",
        border: "1px solid var(--color-border-subtle)",
        borderRadius: "var(--radius-lg)",
        padding: "var(--space-3) var(--space-4)",
        display: "flex",
        flexDirection: "column",
        gap: "var(--space-2)",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
          <IconBadge icon="Syringe" tone="primary" size="sm" />
          <strong style={{ fontSize: "var(--font-size-body)" }}>
            {vaccineName} {doseLabel}
          </strong>
        </span>
        <StatusBadge kind={status} />
      </div>
      <p style={{ margin: 0, fontSize: "var(--font-size-body)", color: "var(--color-text-primary)" }}>
        {recommendedDate}
        {correctedAgeLabel ? ` · ${correctedAgeLabel}` : ""}
      </p>
      <label htmlFor={checkboxId} style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", minHeight: "var(--touch-target-min)" }}>
        <input
          id={checkboxId}
          type="checkbox"
          checked={completed}
          onChange={(e) => onToggleComplete(e.target.checked)}
          aria-label={`${vaccineName} ${doseLabel} 완료로 표시`}
          style={{ width: 24, height: 24 }}
        />
        완료로 표시
      </label>
    </li>
  );
}
