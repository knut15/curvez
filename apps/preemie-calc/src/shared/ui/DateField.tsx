"use client";

// 스펙: .curvez/design/preemie-calc/components/DateField.md
import { useId } from "react";

import { ICONS } from "./icons";
import { RequiredMark } from "./RequiredMark";

export type DateFieldProps = {
  label: string;
  required?: boolean;
  value: string;
  min?: string;
  max?: string;
  onChange: (value: string) => void;
  /** 칸 아래 도움말 문단의 id. 있으면 입력칸에 aria-describedby 로 잇는다. */
  describedBy?: string;
};

const CalendarDays = ICONS.CalendarDays;

export function DateField({ label, required = true, value, min, max, onChange, describedBy }: DateFieldProps) {
  const id = useId();

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
      <label
        htmlFor={id}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "var(--space-1)",
          fontSize: "var(--font-size-body)",
          color: "var(--color-text-muted)",
        }}
      >
        <CalendarDays aria-hidden="true" style={{ width: "var(--icon-size-sm)", height: "var(--icon-size-sm)" }} />
        {label}
        <RequiredMark required={required} />
      </label>
      <input
        id={id}
        type="date"
        value={value}
        min={min}
        max={max}
        aria-required={required || undefined}
        aria-describedby={describedBy}
        onChange={(e) => onChange(e.target.value)}
        style={{
          width: "100%",
          height: "var(--touch-target-min)",
          padding: "0 var(--space-3)",
          borderRadius: "var(--radius-md)",
          border: "1px solid var(--color-border-strong)",
          background: "var(--color-bg-surface)",
          color: "var(--color-text-primary)",
          fontSize: "var(--font-size-body)",
          boxSizing: "border-box",
        }}
      />
    </div>
  );
}
