"use client";

// 스펙: .curvez/design/preemie-calc/components/InfoRow.md
import Link from "next/link";

import { IconBadge, type IconBadgeTone } from "./IconBadge";
import { ICONS, type IconName } from "./icons";

export type InfoRowProps =
  | {
      variant: "basis";
      icon: IconName;
      iconTone?: IconBadgeTone;
      label: string;
      basis: string;
      value: string | null;
      sourceLabel?: string;
    }
  | {
      variant: "nav-card";
      icon: IconName;
      iconTone?: IconBadgeTone;
      label: string;
      description?: string;
      href: string;
    };

const ChevronRight = ICONS.ChevronRight;

export function InfoRow(props: InfoRowProps) {
  if (props.variant === "nav-card") {
    return (
      <Link
        href={props.href}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "var(--space-3)",
          padding: "var(--space-3) var(--space-4)",
          background: "var(--color-bg-surface)",
          borderRadius: "var(--radius-lg)",
          border: "1px solid var(--color-border-subtle)",
          textDecoration: "none",
          color: "var(--color-text-primary)",
          justifyContent: "space-between",
          minHeight: "var(--touch-target-min)",
        }}
      >
        <span style={{ display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
          <IconBadge icon={props.icon} tone={props.iconTone ?? "primary"} size="lg" />
          <span>
            <span style={{ display: "block", fontSize: "var(--font-size-body)" }}>{props.label}</span>
            {props.description ? (
              <span style={{ display: "block", fontSize: "var(--font-size-meta)", color: "var(--color-text-muted)" }}>
                {props.description}
              </span>
            ) : null}
          </span>
        </span>
        <ChevronRight
          aria-hidden="true"
          style={{ width: "var(--icon-size-md)", height: "var(--icon-size-md)", color: "var(--color-text-muted)" }}
        />
      </Link>
    );
  }

  return (
    <li
      className="pc-info-row-basis"
      style={{
        listStyle: "none",
        padding: "var(--space-3) var(--space-4)",
        background: "var(--color-bg-surface)",
        borderRadius: "var(--radius-md)",
        border: "1px solid var(--color-border-subtle)",
      }}
    >
      <span style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
        <IconBadge icon={props.icon} tone={props.iconTone ?? "primary"} size="sm" />
        <span style={{ fontSize: "var(--font-size-body)", color: "var(--color-text-primary)" }}>{props.label}</span>
      </span>
      <span
        style={{
          display: "inline-block",
          alignSelf: "flex-start",
          padding: "0 var(--space-2)",
          border: "1px solid var(--color-border-subtle)",
          borderRadius: "var(--radius-sm)",
          background: "var(--color-bg-canvas)",
          fontSize: "var(--font-size-meta)",
          color: "var(--color-text-muted)",
        }}
      >
        {props.basis}
      </span>
      <span style={{ display: "flex", flexDirection: "column" }}>
        {props.value ? (
          <span style={{ fontSize: "var(--font-size-body)", color: "var(--color-text-primary)" }}>{props.value}</span>
        ) : null}
        {props.sourceLabel ? (
          <span style={{ fontSize: "var(--font-size-meta)", color: "var(--color-text-muted)" }}>{props.sourceLabel}</span>
        ) : null}
      </span>
    </li>
  );
}
