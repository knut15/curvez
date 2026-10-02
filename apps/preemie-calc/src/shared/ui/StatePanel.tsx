"use client";

// 스펙: .curvez/design/preemie-calc/components/StatePanel.md
import { Button } from "./Button";
import { IconBadge } from "./IconBadge";

export type StatePanelProps = {
  variant: "error" | "domain-empty";
  message: string;
  actionLabel?: string;
  onAction?: () => void;
};

export function StatePanel({ variant, message, actionLabel, onAction }: StatePanelProps) {
  const isError = variant === "error";
  return (
    <div
      role={isError ? "alert" : "status"}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "var(--space-4)",
        padding: "var(--space-6) var(--space-4)",
        background: isError ? "var(--color-accent-danger-bg)" : "var(--color-bg-canvas)",
        borderRadius: "var(--radius-lg)",
        textAlign: "center",
      }}
    >
      <IconBadge icon={isError ? "AlertTriangle" : "Info"} tone={isError ? "danger" : "primary"} size="hero" />
      <p
        style={{
          margin: 0,
          fontSize: isError ? "var(--font-size-body)" : "var(--font-size-subtitle)",
          color: isError ? "var(--color-accent-danger)" : "var(--color-text-primary)",
        }}
      >
        {message}
      </p>
      {actionLabel && onAction ? (
        <Button variant="secondary" onClick={onAction}>
          {actionLabel}
        </Button>
      ) : null}
    </div>
  );
}
