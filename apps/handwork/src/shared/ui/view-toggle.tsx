"use client";

import { LayoutGridIcon, ListIcon } from "lucide-react";

import type { ViewMode } from "@/shared/lib/use-view-mode";

/**
 * 카드 보기와 리스트 보기를 고르는 세그먼트 컨트롤.
 *
 * 두 버튼을 테두리 하나 안에 넣고 고른 쪽만 면을 준다. 따로 떼어 놓으면 각각이 독립된
 * 동작으로 보이는데, 실제로는 **둘 중 하나**를 고르는 일이라 한 덩어리로 묶는다.
 *
 * 버튼 크기는 28px 이고 아이콘은 14px 다. 최소 타깃 24px 을 넘긴다.
 *
 * 아이콘만 있으므로 `aria-label` 이 이름을 대신한다. 누른 상태는 `aria-pressed` 가 말한다 —
 * 색만으로 구분하면 대비를 못 보는 사람에게 아무것도 전달되지 않는다.
 */
const BUTTON =
  "inline-flex size-7 items-center justify-center rounded-md transition-colors duration-150 ease-out focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring motion-reduce:transition-none";

export function ViewToggle({
  mode,
  onChange,
}: {
  mode: ViewMode;
  onChange: (next: ViewMode) => void;
}) {
  const items: { value: ViewMode; label: string; Icon: typeof ListIcon }[] = [
    { value: "card", label: "카드로 보기", Icon: LayoutGridIcon },
    { value: "list", label: "리스트로 보기", Icon: ListIcon },
  ];

  return (
    <div className="inline-flex items-center gap-0.5 rounded-lg border border-border p-0.5">
      {items.map(({ value, label, Icon }) => {
        const active = mode === value;
        return (
          <button
            key={value}
            type="button"
            aria-label={label}
            aria-pressed={active}
            onClick={() => onChange(value)}
            className={`${BUTTON} ${
              active
                ? "bg-accent text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Icon size={14} strokeWidth={1.75} aria-hidden />
          </button>
        );
      })}
    </div>
  );
}
