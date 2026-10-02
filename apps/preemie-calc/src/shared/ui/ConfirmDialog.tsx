"use client";

// 스펙: .curvez/design/preemie-calc/components/ConfirmDialog.md
// 네이티브 <dialog>.showModal() 을 쓴다 — focus trap 과 닫힐 때 트리거로의 포커스 복귀를
// HTML 표준의 dialog focusing/closing steps 에 맡긴다(새 패키지를 쓰지 않는다, a11y:focus).
import { useEffect, useId, useRef } from "react";

import { Button } from "./Button";
import { IconBadge } from "./IconBadge";

export type ConfirmDialogProps = {
  open: boolean;
  title?: string;
  description?: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
};

export function ConfirmDialog({
  open,
  title = "정보 전체 삭제",
  description = "저장된 모든 아이 정보가 이 기기에서 사라집니다. 되돌릴 수 없습니다.",
  confirmLabel = "삭제",
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const titleId = useId();
  const descId = useId();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      dialog.showModal();
      // 위험한 "삭제" 가 아니라 "취소" 에 기본 포커스를 둔다(a11y:focus).
      cancelRef.current?.focus();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      className="preemie-dialog"
      role="alertdialog"
      aria-labelledby={titleId}
      aria-describedby={descId}
      onCancel={(event) => {
        // ESC 로 닫을 때도 같은 onCancel(아무 것도 지우지 않는다)로 상태를 맞춘다.
        event.preventDefault();
        onCancel();
      }}
      style={{
        display: open ? "flex" : "none",
        width: 320,
        maxWidth: 400,
        border: "none",
        background: "var(--color-bg-surface)",
        borderRadius: "var(--radius-lg)",
        boxShadow: "var(--elevation-modal)",
        padding: "var(--space-5)",
        flexDirection: "column",
        gap: "var(--space-4)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
        <IconBadge icon="AlertTriangle" tone="danger" size="md" />
        <h2 id={titleId} style={{ margin: 0, fontSize: "var(--font-size-title)" }}>
          {title}
        </h2>
      </div>
      <p id={descId} style={{ margin: 0, fontSize: "var(--font-size-body)", color: "var(--color-text-muted)" }}>
        {description}
      </p>
      <div style={{ display: "flex", gap: "var(--touch-target-gap)" }}>
        <Button ref={cancelRef} variant="secondary" onClick={onCancel}>
          취소
        </Button>
        <Button variant="danger" onClick={onConfirm}>
          {confirmLabel}
        </Button>
      </div>
    </dialog>
  );
}
