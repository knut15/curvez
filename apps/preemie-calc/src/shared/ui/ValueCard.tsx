// 스펙: .curvez/design/preemie-calc/components/ValueCard.md
// 값 하나(아이콘+라벨+큰 값+보조값)를 보여주는 shared 층 카드. 도메인 타입을 모르고 문자열
// 3개 + 아이콘 이름 하나만 받는다 — AgeSummaryCard(variant=single) 이 하던 역할을 뗀 것이다(PLC-02).
import { useId } from "react";

import { IconBadge, type IconBadgeTone } from "./IconBadge";
import type { IconName } from "./icons";

export type ValueCardProps = {
  icon: IconName;
  tone?: IconBadgeTone;
  label: string;
  value: string;
  subValue?: string | null;
};

const cardStyle: React.CSSProperties = {
  background: "var(--color-bg-surface)",
  borderRadius: "var(--radius-lg)",
  boxShadow: "var(--elevation-card)",
  padding: "var(--space-4)",
  display: "flex",
  flexDirection: "column",
  gap: "var(--space-2)",
};

export function ValueCard({ icon, tone = "primary", label, value, subValue = null }: ValueCardProps) {
  const labelId = useId();

  return (
    <div className="pc-value-card" style={cardStyle} role="group" aria-labelledby={labelId}>
      <IconBadge icon={icon} tone={tone} size="lg" />
      <p
        id={labelId}
        style={{ margin: 0, fontSize: "var(--font-size-subtitle)", color: "var(--color-text-primary)" }}
      >
        {label}
      </p>
      <p
        style={{
          margin: 0,
          fontSize: "var(--font-size-display)",
          color: "var(--color-text-primary)",
        }}
      >
        {value}
      </p>
      {subValue ? (
        <p
          style={{
            margin: 0,
            fontSize: "var(--font-size-body)",
            color: "var(--color-text-primary)",
          }}
        >
          {subValue}
        </p>
      ) : null}
    </div>
  );
}
