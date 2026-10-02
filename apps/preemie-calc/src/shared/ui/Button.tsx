"use client";

// 스펙: .curvez/design/preemie-calc/components/Button.md
import { forwardRef } from "react";
import type { ButtonHTMLAttributes, ReactNode } from "react";

import { ICONS, type IconName } from "./icons";

export type ButtonVariant = "primary" | "secondary" | "danger" | "pop" | "text";
export type ButtonSize = "md" | "lg";
export type ButtonIcon = { name: IconName; position: "leading" | "trailing" };

export type ButtonProps = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: ButtonIcon | null;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  onClick?: () => void;
  children: ReactNode;
  type?: ButtonHTMLAttributes<HTMLButtonElement>["type"];
};

const HEIGHT: Record<ButtonSize, number> = { md: 48, lg: 52 };

const VARIANT_STYLE: Record<ButtonVariant, React.CSSProperties> = {
  primary: {
    background: "var(--color-accent-primary)",
    color: "var(--color-text-on-accent)",
    border: "none",
  },
  secondary: {
    background: "var(--color-bg-surface)",
    color: "var(--color-text-primary)",
    border: "1px solid var(--color-border-strong)",
  },
  danger: {
    background: "var(--color-accent-danger)",
    color: "var(--color-text-on-accent)",
    border: "none",
  },
  pop: {
    background: "var(--color-accent-pop)",
    color: "var(--color-text-on-accent)",
    border: "none",
  },
  text: {
    background: "transparent",
    color: "var(--color-accent-primary)",
    border: "none",
    textDecoration: "underline",
  },
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = "primary",
    size = "md",
    icon = null,
    loading = false,
    disabled = false,
    fullWidth = false,
    onClick,
    children,
    type = "button",
  },
  ref,
) {
  const isDisabled = disabled || loading;
  const style: React.CSSProperties = {
    ...VARIANT_STYLE[variant],
    height: HEIGHT[size],
    minHeight: "var(--touch-target-min)",
    width: fullWidth ? "100%" : undefined,
    maxWidth: fullWidth ? 320 : undefined,
    padding: variant === "text" ? "0" : "0 var(--space-4)",
    borderRadius: variant === "pop" ? "var(--radius-pill)" : "var(--radius-md)",
    fontSize: "var(--font-size-button)",
    fontWeight: 600,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "var(--space-2)",
    cursor: isDisabled ? "not-allowed" : "pointer",
    opacity: disabled && !loading && variant !== "primary" ? 0.5 : 1,
    // 라벨은 항상 한 줄이다(Button.md 에 줄바꿈 규칙이 없다 — 버튼은 짧은 단일 문구를
    // 전제한다). flexShrink:0 은 좁은 flex 행(예: ChildSwitcherTabs) 안에서 버튼이
    // 눌려 라벨이 중간에 끊기는 대신, 형제 요소가 스크롤되게 한다.
    whiteSpace: "nowrap",
    flexShrink: 0,
  };

  if (disabled && variant === "primary") {
    style.background = "var(--color-accent-primary-disabled)";
  }

  // 스펙: loading 중에는 icon 의 leading/trailing 위치와 무관하게 스피너가 우측에 온다
  // ("우측에 16px 스피너 ... icon prop 이 있어도 loading 중에는 스피너가 그 자리를 대신한다").
  const Icon = icon && !loading ? ICONS[icon.name] : null;
  const iconEl = Icon ? (
    <Icon aria-hidden="true" style={{ width: "var(--icon-size-md)", height: "var(--icon-size-md)" }} />
  ) : null;
  const spinnerEl = loading ? (
    <span
      aria-hidden="true"
      style={{
        width: 16,
        height: 16,
        borderRadius: "50%",
        border: "2px solid currentColor",
        borderTopColor: "transparent",
        display: "inline-block",
        animation: "preemie-spin var(--motion-duration-base) linear infinite",
      }}
    />
  ) : null;

  return (
    <button
      ref={ref}
      type={type}
      onClick={isDisabled ? undefined : onClick}
      disabled={isDisabled}
      aria-disabled={isDisabled || undefined}
      style={style}
    >
      {icon?.position === "leading" ? iconEl : null}
      {children}
      {icon?.position !== "leading" ? iconEl : null}
      {spinnerEl}
    </button>
  );
});
