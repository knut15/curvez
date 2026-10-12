"use client";

// 스펙: .curvez/design/preemie-calc/components/TextField.md
import { useId } from "react";

import { ICONS, type IconName } from "./icons";
import { RequiredMark } from "./RequiredMark";

export type TextFieldProps = {
  label: string;
  icon?: IconName | null;
  required?: boolean;
  placeholder?: string;
  value: string;
  inputMode?: "text" | "decimal";
  suffix?: string | null;
  maxLength?: number | null;
  error?: string | null;
  onChange: (value: string) => void;
};

export function TextField({
  label,
  icon = null,
  required = false,
  placeholder,
  value,
  inputMode = "text",
  suffix = null,
  maxLength = null,
  error = null,
  onChange,
}: TextFieldProps) {
  const id = useId();
  const errorId = `${id}-error`;
  const Icon = icon ? ICONS[icon] : null;
  const AlertCircle = ICONS.AlertCircle;

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
        {Icon ? (
          <Icon aria-hidden="true" style={{ width: "var(--icon-size-sm)", height: "var(--icon-size-sm)" }} />
        ) : null}
        {label}
        <RequiredMark required={required} />
      </label>
      <div style={{ position: "relative" }}>
        <input
          id={id}
          type="text"
          inputMode={inputMode}
          value={value}
          placeholder={placeholder}
          maxLength={maxLength ?? undefined}
          aria-required={required || undefined}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          onChange={(e) => onChange(e.target.value)}
          style={{
            width: "100%",
            height: "var(--touch-target-min)",
            padding: "0 var(--space-3)",
            paddingRight: suffix ? "var(--space-7)" : "var(--space-3)",
            borderRadius: "var(--radius-md)",
            border: `1px solid ${error ? "var(--color-accent-danger)" : "var(--color-border-strong)"}`,
            background: "var(--color-bg-surface)",
            color: "var(--color-text-primary)",
            fontSize: "var(--font-size-body)",
            boxSizing: "border-box",
          }}
        />
        {suffix ? (
          <span
            aria-hidden="true"
            style={{
              position: "absolute",
              right: "var(--space-3)",
              top: "50%",
              transform: "translateY(-50%)",
              color: "var(--color-text-muted)",
              fontSize: "var(--font-size-body)",
            }}
          >
            {suffix}
          </span>
        ) : null}
      </div>
      {error ? (
        <p
          id={errorId}
          role="alert"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "var(--space-1)",
            color: "var(--color-accent-danger)",
            fontSize: "var(--font-size-meta)",
            margin: 0,
          }}
        >
          <AlertCircle aria-hidden="true" style={{ width: "var(--icon-size-sm)", height: "var(--icon-size-sm)" }} />
          {error}
        </p>
      ) : null}
    </div>
  );
}
