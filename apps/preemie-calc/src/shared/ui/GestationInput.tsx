"use client";

// 스펙: .curvez/design/preemie-calc/components/GestationInput.md
import { useId } from "react";

import { ICONS } from "./icons";
import { RequiredMark } from "./RequiredMark";

export type GestationInputProps = {
  label?: string;
  weeks: number | null;
  days: number;
  required?: boolean;
  onChange: (value: { weeks: number; days: number }) => void;
};

const numberFieldStyle: React.CSSProperties = {
  width: 64,
  height: "var(--touch-target-min)",
  padding: "0 var(--space-2)",
  borderRadius: "var(--radius-md)",
  border: "1px solid var(--color-border-strong)",
  background: "var(--color-bg-surface)",
  color: "var(--color-text-primary)",
  fontSize: "var(--font-size-body)",
  boxSizing: "border-box",
};

const CalendarClock = ICONS.CalendarClock;

export function GestationInput({
  label = "출생 시 재태주수",
  weeks,
  days,
  required = true,
  onChange,
}: GestationInputProps) {
  const weeksId = useId();
  const daysId = useId();

  return (
    <fieldset
      style={{ border: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "var(--space-2)" }}
    >
      <legend
        style={{
          display: "flex",
          alignItems: "center",
          gap: "var(--space-1)",
          fontSize: "var(--font-size-body)",
          color: "var(--color-text-muted)",
          padding: 0,
        }}
      >
        <CalendarClock aria-hidden="true" style={{ width: "var(--icon-size-sm)", height: "var(--icon-size-sm)" }} />
        {label}
        <RequiredMark required={required} />
      </legend>
      <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
        <input
          id={weeksId}
          type="number"
          inputMode="numeric"
          aria-label="주"
          min={22}
          max={44}
          value={weeks ?? ""}
          onChange={(e) => onChange({ weeks: Number(e.target.value) || 0, days })}
          style={numberFieldStyle}
        />
        <span aria-hidden="true">주</span>
        <input
          id={daysId}
          type="number"
          inputMode="numeric"
          aria-label="일"
          min={0}
          max={6}
          value={days}
          onChange={(e) => onChange({ weeks: weeks ?? 0, days: Number(e.target.value) || 0 })}
          style={numberFieldStyle}
        />
        <span aria-hidden="true">일</span>
      </div>
    </fieldset>
  );
}
