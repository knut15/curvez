"use client";

// 스펙: .curvez/design/preemie-calc/components/SegmentedControl.md
import { useRef } from "react";
import type { KeyboardEvent } from "react";

import { nextRovingIndex } from "@/shared/lib/roving-tabindex";

import { ICONS } from "./icons";
import { RequiredMark } from "./RequiredMark";

export type SegmentedOption = { value: string; label: string };

export type SegmentedControlProps = {
  label: string;
  options: SegmentedOption[];
  value: string | null;
  required?: boolean;
  error?: string | null;
  onChange: (value: string) => void;
};

const Check = ICONS.Check;

export function SegmentedControl({
  label,
  options,
  value,
  required = true,
  error = null,
  onChange,
}: SegmentedControlProps) {
  const buttonRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const selectedIndex = options.findIndex((option) => option.value === value);
  // 선택 전에도 탭 정지점은 하나여야 한다(roving tabindex) — 없으면 첫 옵션을 정지점으로 둔다.
  const tabStopIndex = selectedIndex === -1 ? 0 : selectedIndex;
  // required=true 면 aria-label 값 자체를 "레이블, 필수" 로 설정한다(DSG-04) — RequiredMark 의
  // sr-only span 을 쓰지 않는다(속성값은 텍스트 노드를 이어붙일 수 없다).
  const groupAriaLabel = required ? `${label}, 필수` : label;

  function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    const next = nextRovingIndex(index, options.length, event.key);
    if (next === null) return;
    event.preventDefault();
    onChange(options[next].value);
    buttonRefs.current[next]?.focus();
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
      <span style={{ fontSize: "var(--font-size-body)", color: "var(--color-text-muted)" }}>
        {label}
        <RequiredMark required={required} />
      </span>
      <div
        role="radiogroup"
        aria-label={groupAriaLabel}
        style={{
          display: "flex",
          border: `1px solid ${error ? "var(--color-accent-danger)" : "var(--color-border-strong)"}`,
          borderRadius: "var(--radius-pill)",
          overflow: "hidden",
        }}
      >
        {options.map((option, index) => {
          const selected = option.value === value;
          return (
            <button
              key={option.value}
              ref={(el) => {
                buttonRefs.current[index] = el;
              }}
              type="button"
              role="radio"
              aria-checked={selected}
              tabIndex={index === tabStopIndex ? 0 : -1}
              onClick={() => onChange(option.value)}
              onKeyDown={(event) => handleKeyDown(event, index)}
              style={{
                flex: 1,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "var(--space-1)",
                height: "var(--touch-target-min)",
                border: "none",
                background: selected ? "var(--color-accent-primary)" : "var(--color-bg-surface)",
                color: selected ? "var(--color-text-on-accent)" : "var(--color-text-primary)",
                fontSize: "var(--font-size-body)",
                cursor: "pointer",
              }}
            >
              {selected ? (
                <Check aria-hidden="true" style={{ width: "var(--icon-size-sm)", height: "var(--icon-size-sm)" }} />
              ) : null}
              {option.label}
            </button>
          );
        })}
      </div>
      {error ? (
        <p role="alert" style={{ color: "var(--color-accent-danger)", fontSize: "var(--font-size-meta)", margin: 0 }}>
          {error}
        </p>
      ) : null}
    </div>
  );
}
