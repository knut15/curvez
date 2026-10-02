// 스펙: .curvez/design/preemie-calc/components/IconBadge.md
// "색 있는 원 배경 + lucide 아이콘" 패턴. 항상 장식이다(aria-hidden) — 의미를 담아야 하면
// 이 컴포넌트를 쓰지 않고 텍스트 라벨이 있는 별도 컴포넌트(StatusBadge 등)를 쓴다.
import { ICONS, type IconName } from "./icons";

export type IconBadgeTone = "primary" | "corrected" | "pop" | "warm" | "success" | "danger" | "neutral";
export type IconBadgeSize = "sm" | "md" | "lg" | "hero";

export type IconBadgeProps = {
  icon: IconName;
  tone: IconBadgeTone;
  size?: IconBadgeSize;
};

const SIZE_CIRCLE: Record<IconBadgeSize, number> = { sm: 28, md: 36, lg: 44, hero: 56 };
const SIZE_ICON: Record<IconBadgeSize, string> = {
  sm: "var(--icon-size-sm)",
  md: "var(--icon-size-md)",
  lg: "var(--icon-size-lg)",
  hero: "var(--icon-size-hero)",
};

const TONE_STYLE: Record<IconBadgeTone, { bg: string; fg: string }> = {
  primary: { bg: "var(--color-accent-primary-soft-bg)", fg: "var(--color-accent-primary)" },
  corrected: { bg: "var(--color-accent-corrected-soft-bg)", fg: "var(--color-accent-corrected)" },
  pop: { bg: "var(--color-accent-pop-soft-bg)", fg: "var(--color-accent-pop)" },
  warm: { bg: "var(--color-accent-warm-soft-bg)", fg: "var(--color-accent-warm)" },
  success: { bg: "var(--color-accent-success-soft-bg)", fg: "var(--color-accent-success)" },
  danger: { bg: "var(--color-accent-danger-bg)", fg: "var(--color-accent-danger)" },
  neutral: { bg: "var(--color-status-neutral-bg)", fg: "var(--color-text-muted)" },
};

export function IconBadge({ icon, tone, size = "md" }: IconBadgeProps) {
  const Icon = ICONS[icon];
  const tokens = TONE_STYLE[tone];
  const circle = SIZE_CIRCLE[size];
  const iconSize = SIZE_ICON[size];

  return (
    <span
      aria-hidden="true"
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: circle,
        height: circle,
        borderRadius: "var(--radius-pill)",
        background: tokens.bg,
        color: tokens.fg,
        flexShrink: 0,
      }}
    >
      <Icon style={{ width: iconSize, height: iconSize }} />
    </span>
  );
}
