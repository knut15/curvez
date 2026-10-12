// 스펙: .curvez/design/preemie-calc/components/StatusBadge.md
// 순수 프레젠테이션. 훅을 쓰지 않아 "use client" 가 필요 없다(부모가 클라이언트면 그대로 딸려간다).
import { ICONS, type IconName } from "./icons";

export type StatusBadgeKind = "past" | "current" | "upcoming" | "neutral" | "done" | "soon" | "missed";

export type StatusBadgeProps = {
  kind: StatusBadgeKind;
  label?: string;
};

const KIND_META: Record<StatusBadgeKind, { label: string; icon: IconName; bg: string; fg: string }> = {
  past: { label: "지남", icon: "CircleCheckBig", bg: "var(--color-status-past-bg)", fg: "var(--color-status-past-text)" },
  current: { label: "오늘", icon: "CircleDot", bg: "var(--color-status-current-bg)", fg: "var(--color-status-current-text)" },
  upcoming: { label: "예정", icon: "Circle", bg: "var(--color-status-upcoming-bg)", fg: "var(--color-status-upcoming-text)" },
  neutral: { label: "대상 아님", icon: "Minus", bg: "var(--color-status-neutral-bg)", fg: "var(--color-status-neutral-text)" },
  // 8차 라운드(F10 예방접종): 새 색을 만들지 않고 기존 past·current·danger 색 쌍을 재사용한다.
  done: { label: "완료", icon: "CircleCheckBig", bg: "var(--color-status-past-bg)", fg: "var(--color-status-past-text)" },
  soon: { label: "임박", icon: "Clock", bg: "var(--color-status-current-bg)", fg: "var(--color-status-current-text)" },
  missed: { label: "놓침", icon: "AlertTriangle", bg: "var(--color-accent-danger-bg)", fg: "var(--color-accent-danger)" },
};

export function StatusBadge({ kind, label }: StatusBadgeProps) {
  const meta = KIND_META[kind];
  const Icon = ICONS[meta.icon];
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "var(--space-1)",
        height: 24,
        padding: "0 var(--space-2)",
        borderRadius: "var(--radius-pill)",
        background: meta.bg,
        color: meta.fg,
        fontSize: "var(--font-size-meta)",
        border: kind === "upcoming" ? "1px solid var(--color-border-subtle)" : "none",
      }}
    >
      <Icon aria-hidden="true" style={{ width: "var(--icon-size-sm)", height: "var(--icon-size-sm)" }} />
      {label ?? meta.label}
    </span>
  );
}
