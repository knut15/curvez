"use client";

// 스펙: .curvez/design/preemie-calc/components/ChildSwitcherTabs.md
// 사용자 행위(아이 바꾸기·아이 추가) 하나를 담당하는 feature.
import { useRef } from "react";
import type { KeyboardEvent } from "react";
import { useRouter } from "next/navigation";

import { selectProfile } from "@/entities/child";
import { announce } from "@/shared/lib/announce";
import { withLocativeParticle } from "@/shared/lib/korean-particle";
import { nextRovingIndex } from "@/shared/lib/roving-tabindex";
import { Button, ICONS } from "@/shared/ui";

export type ChildOption = { id: string; label: string };

export type ChildSwitcherTabsProps = {
  options: ChildOption[];
  selectedId: string;
  onSelect: (id: string) => void;
};

const Baby = ICONS.Baby;
const Check = ICONS.Check;

export function ChildSwitcherTabs({ options, selectedId, onSelect }: ChildSwitcherTabsProps) {
  const router = useRouter();
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);

  function handleSelect(id: string) {
    if (id === selectedId) return;
    const saved = selectProfile(id);
    if (!saved) {
      // ERR-03: 쓰기 실패면 onSelect·성공 announce 를 부르지 않는다. 기존 폼 저장 실패
      // 문구(ProfileForm.tsx·EditProfileDialog.tsx)와 같은 문구로 알린다.
      announce("저장하지 못했습니다. 저장 공간을 확인해 주세요");
      return;
    }
    onSelect(id);
    // dashboard.md announce: "○○(으)로 바꿨습니다"(이름 없으면 "아이 N" — label 에 이미 반영됨)
    const child = options.find((c) => c.id === id);
    if (child) announce(`${withLocativeParticle(child.label)} 바꿨습니다`);
  }

  const selectedIndex = options.findIndex((child) => child.id === selectedId);
  const tabStopIndex = selectedIndex === -1 ? 0 : selectedIndex;

  function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    const next = nextRovingIndex(index, options.length, event.key);
    if (next === null) return;
    event.preventDefault();
    handleSelect(options[next].id);
    tabRefs.current[next]?.focus();
  }

  return (
    <div
      className="pc-child-switcher-row pc-content-max pc-content-pad-x"
      style={{
        display: "flex",
        alignItems: "center",
        gap: "var(--touch-target-gap)",
        overflowX: "auto",
      }}
    >
      {options.length >= 2 ? (
        <div role="tablist" aria-label="아이 선택" style={{ display: "flex", gap: "var(--touch-target-gap)" }}>
          {options.map((child, index) => {
            const selected = child.id === selectedId;
            return (
              <button
                key={child.id}
                ref={(el) => {
                  tabRefs.current[index] = el;
                }}
                type="button"
                role="tab"
                aria-selected={selected}
                tabIndex={index === tabStopIndex ? 0 : -1}
                onClick={() => handleSelect(child.id)}
                onKeyDown={(event) => handleKeyDown(event, index)}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "var(--space-1)",
                  height: "var(--touch-target-min)",
                  padding: "0 var(--space-3)",
                  borderRadius: "var(--radius-pill)",
                  border: "1px solid var(--color-border-subtle)",
                  background: selected ? "var(--color-accent-primary)" : "var(--color-bg-surface)",
                  color: selected ? "var(--color-text-on-accent)" : "var(--color-text-primary)",
                  fontSize: "var(--font-size-body)",
                  whiteSpace: "nowrap",
                  cursor: "pointer",
                }}
              >
                <Baby aria-hidden="true" style={{ width: "var(--icon-size-sm)", height: "var(--icon-size-sm)" }} />
                {selected ? (
                  <Check aria-hidden="true" style={{ width: "var(--icon-size-sm)", height: "var(--icon-size-sm)" }} />
                ) : null}
                {child.label}
              </button>
            );
          })}
        </div>
      ) : null}
      {/* 2026-09-30 결함 수정: 라벨 "+ 아이 추가" 에 이미 "+" 가 있어 스펙의 leading
          UserRoundPlus 아이콘을 더하면 더하기 표시가 두 번 보였다. 아이콘을 뺀다
          (ChildSwitcherTabs.md 의 icon={{name:"UserRoundPlus",...}} 과 다른 점 — decisions 참고). */}
      <Button variant="pop" onClick={() => router.push("/?new=1")}>
        + 아이 추가
      </Button>
    </div>
  );
}
