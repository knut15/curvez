// 스펙: .curvez/design/preemie-calc/components/CheckupRoundItem.md
import { IconBadge, StatusBadge, type IconBadgeTone, type StatusBadgeKind } from "@/shared/ui";

export type CheckupRoundItemProps = {
  roundLabel: string;
  visitStart: string;
  visitEnd: string;
  questionnaireBasisLabel: string;
  status: StatusBadgeKind;
};

const BADGE_TONE: Record<StatusBadgeKind, IconBadgeTone> = {
  upcoming: "primary",
  current: "warm",
  past: "success",
  neutral: "neutral",
  // 이 위젯(검진 차수)은 done·soon·missed 를 쓰지 않는다(예방접종 전용, 8차 라운드).
  // Record 는 StatusBadgeKind 전체에 대해 완전해야 해 값만 채운다.
  done: "success",
  soon: "warm",
  missed: "danger",
};

export function CheckupRoundItem({
  roundLabel,
  visitStart,
  visitEnd,
  questionnaireBasisLabel,
  status,
}: CheckupRoundItemProps) {
  const bg =
    status === "current"
      ? "var(--color-status-current-bg)"
      : status === "past"
        ? "var(--color-status-past-bg)"
        : "var(--color-bg-surface)";
  const border = status === "current" ? "var(--color-status-current-text)" : "var(--color-border-subtle)";

  return (
    <li
      data-status={status}
      style={{
        listStyle: "none",
        background: bg,
        border: `1px solid ${border}`,
        borderRadius: "var(--radius-lg)",
        padding: "var(--space-3) var(--space-4)",
        display: "flex",
        flexDirection: "column",
        gap: "var(--space-2)",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
          <IconBadge icon="Stethoscope" tone={BADGE_TONE[status]} size="sm" />
          <strong style={{ fontSize: "var(--font-size-body)" }}>{roundLabel}</strong>
        </span>
        <StatusBadge kind={status} />
      </div>
      <p style={{ margin: 0, fontSize: "var(--font-size-body)", color: "var(--color-text-primary)" }}>
        {visitStart} ~ {visitEnd}
      </p>
      <p style={{ margin: 0, fontSize: "var(--font-size-meta)", color: "var(--color-text-muted)" }}>
        {questionnaireBasisLabel}
      </p>
    </li>
  );
}
