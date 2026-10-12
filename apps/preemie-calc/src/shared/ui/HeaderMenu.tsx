"use client";

// 스펙: .curvez/design/preemie-calc/components/HeaderMenu.md
// dashboard 헤더의 "프로필 편집"·"정보 전체 삭제" 두 액션을 "더보기" 버튼 뒤로 묶는다.
// 도메인을 모르고 콜백 두 개만 받으므로(entities·features를 import 하지 않는다) shared/ui 에 둔다.
import { useEffect, useId, useRef, useState } from "react";
import type { KeyboardEvent } from "react";

import { nextRovingIndex } from "@/shared/lib/roving-tabindex";

import { ICONS } from "./icons";

export type HeaderMenuProps = {
  onEditProfile: () => void;
  onDeleteAll: () => void;
};

const MENU_ITEM_COUNT = 2;

export function HeaderMenu({ onEditProfile, onDeleteAll }: HeaderMenuProps) {
  const [open, setOpen] = useState(false);
  const menuId = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const itemRefs = useRef<Array<HTMLButtonElement | null>>([]);

  useEffect(() => {
    if (!open) return;
    itemRefs.current[0]?.focus();

    function handlePointerDown(event: PointerEvent) {
      // event.target 은 EventTarget | null 이다. Node.contains 를 쓰려면 좁혀야 한다 — 단언 대신
      // instanceof 타입 가드를 쓴다.
      if (!(event.target instanceof Node)) return;
      const target = event.target;
      if (triggerRef.current?.contains(target)) return;
      if (itemRefs.current.some((el) => el?.contains(target))) return;
      setOpen(false);
    }

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [open]);

  function closeAndFocusTrigger() {
    setOpen(false);
    triggerRef.current?.focus();
  }

  function handleItemKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    if (event.key === "Escape") {
      event.preventDefault();
      closeAndFocusTrigger();
      return;
    }
    const next = nextRovingIndex(index, MENU_ITEM_COUNT, event.key);
    if (next === null) return;
    event.preventDefault();
    itemRefs.current[next]?.focus();
  }

  const MoreIcon = ICONS.MoreVertical;
  const PencilIcon = ICONS.Pencil;
  const TrashIcon = ICONS.Trash2;

  return (
    <div style={{ position: "relative" }}>
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        onClick={() => setOpen((v) => !v)}
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 2,
          width: "var(--touch-target-min)",
          height: "var(--touch-target-min)",
          padding: 0,
          border: "none",
          background: "transparent",
          color: "var(--color-text-muted)",
          cursor: "pointer",
          borderRadius: "var(--radius-md)",
        }}
      >
        <MoreIcon aria-hidden="true" style={{ width: "var(--icon-size-md)", height: "var(--icon-size-md)" }} />
        <span style={{ fontSize: "var(--font-size-meta)" }}>더보기</span>
      </button>
      {open ? (
        <div
          id={menuId}
          role="menu"
          aria-label="더보기"
          style={{
            position: "absolute",
            top: "100%",
            right: 0,
            marginTop: "var(--space-1)",
            width: 200,
            background: "var(--color-bg-surface)",
            borderRadius: "var(--radius-lg)",
            boxShadow: "var(--elevation-modal)",
            padding: "var(--space-2) 0",
            zIndex: 20,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <button
            ref={(el) => {
              itemRefs.current[0] = el;
            }}
            type="button"
            role="menuitem"
            onClick={() => {
              closeAndFocusTrigger();
              onEditProfile();
            }}
            onKeyDown={(event) => handleItemKeyDown(event, 0)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "var(--space-2)",
              height: "var(--touch-target-min)",
              padding: "0 var(--space-4)",
              border: "none",
              background: "transparent",
              color: "var(--color-text-primary)",
              fontSize: "var(--font-size-body)",
              cursor: "pointer",
              textAlign: "left",
            }}
          >
            <PencilIcon aria-hidden="true" style={{ width: "var(--icon-size-md)", height: "var(--icon-size-md)" }} />
            프로필 편집
          </button>
          <button
            ref={(el) => {
              itemRefs.current[1] = el;
            }}
            type="button"
            role="menuitem"
            onClick={() => {
              closeAndFocusTrigger();
              onDeleteAll();
            }}
            onKeyDown={(event) => handleItemKeyDown(event, 1)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "var(--space-2)",
              height: "var(--touch-target-min)",
              padding: "0 var(--space-4)",
              border: "none",
              background: "transparent",
              color: "var(--color-accent-danger)",
              fontSize: "var(--font-size-body)",
              cursor: "pointer",
              textAlign: "left",
            }}
          >
            <TrashIcon aria-hidden="true" style={{ width: "var(--icon-size-md)", height: "var(--icon-size-md)" }} />
            정보 전체 삭제
          </button>
        </div>
      ) : null}
    </div>
  );
}
