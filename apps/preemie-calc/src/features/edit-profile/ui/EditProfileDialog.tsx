"use client";

// 스펙: .curvez/design/preemie-calc/components/EditProfileDialog.md
// 사용자 행위(프로필 이름·출생 체중 편집) 하나를 담당하는 feature.
// 네이티브 <dialog>.showModal() 을 쓴다 — focus trap 과 닫힐 때 트리거로의 포커스 복귀를
// HTML 표준의 dialog focusing/closing steps 에 맡긴다(새 패키지를 쓰지 않는다, a11y:focus).
import { useEffect, useId, useRef, useState } from "react";

import { saveProfile, type ChildProfile } from "@/entities/child";
import { announce } from "@/shared/lib/announce";
import { Button, ICONS, IconBadge, TextField } from "@/shared/ui";

const AlertCircle = ICONS.AlertCircle;

export type EditProfileDialogProps = {
  open: boolean;
  profile: ChildProfile;
  onSaved: () => void;
  onCancel: () => void;
};

const NAME_MAX_LENGTH = 20;
const MIN_WEIGHT_KG = 0.2;
const MAX_WEIGHT_KG = 6.0;

type EditProfileFormProps = {
  profile: ChildProfile;
  onSaved: () => void;
  onCancel: () => void;
};

// 폼 입력값은 열릴 때마다 profile 의 최신 값으로 되돌아가야 한다. 이 컴포넌트를 open===true
// 일 때만 마운트해(부모 참고) "열릴 때 초기화"를 effect 없이 마운트 시점 초기값으로 얻는다.
function EditProfileForm({ profile, onSaved, onCancel }: EditProfileFormProps) {
  const [name, setName] = useState(profile.name ?? "");
  const [weightText, setWeightText] = useState(
    profile.birthWeightGrams !== null ? String(profile.birthWeightGrams / 1000) : "",
  );
  const [saveError, setSaveError] = useState(false);

  const nameError = name.length > NAME_MAX_LENGTH ? "이름은 20자 이내로 입력하세요" : null;

  const weightKg = weightText.trim() === "" ? null : Number(weightText);
  const weightError =
    weightText.trim() !== "" &&
    (weightKg === null || Number.isNaN(weightKg) || weightKg < MIN_WEIGHT_KG || weightKg > MAX_WEIGHT_KG)
      ? "체중을 확인하세요(0.2~6.0kg)"
      : null;

  const canSave = nameError === null && weightError === null;

  function handleSave() {
    if (!canSave) return;
    const trimmedName = name.trim();
    const birthWeightGrams = weightKg === null ? null : Math.round(weightKg * 1000);
    const saved = saveProfile({ ...profile, name: trimmedName === "" ? null : trimmedName, birthWeightGrams });
    if (!saved) {
      // ERR-02: 쓰기 실패는 폼 오류로 알린다.
      setSaveError(true);
      return;
    }
    setSaveError(false);
    // dashboard.md announce: 프로필 편집 저장 완료 시 원문 그대로.
    announce("프로필 정보를 저장했습니다");
    onSaved();
  }

  return (
    <>
      <TextField
        label="이름 (선택)"
        icon="UserRound"
        value={name}
        maxLength={NAME_MAX_LENGTH}
        error={nameError}
        onChange={setName}
      />
      <TextField
        label="출생 체중 (kg, 선택)"
        icon="Weight"
        value={weightText}
        inputMode="decimal"
        suffix="kg"
        error={weightError}
        onChange={setWeightText}
      />
      {saveError ? (
        <p
          role="alert"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "var(--space-1)",
            margin: 0,
            fontSize: "var(--font-size-meta)",
            color: "var(--color-accent-danger)",
          }}
        >
          <AlertCircle aria-hidden="true" style={{ width: "var(--icon-size-sm)", height: "var(--icon-size-sm)" }} />
          저장하지 못했습니다. 저장 공간을 확인해 주세요
        </p>
      ) : null}
      <div style={{ display: "flex", gap: "var(--touch-target-gap)" }}>
        <Button variant="secondary" onClick={onCancel}>
          취소
        </Button>
        <Button variant="primary" disabled={!canSave} onClick={handleSave}>
          저장
        </Button>
      </div>
    </>
  );
}

export function EditProfileDialog({ open, profile, onSaved, onCancel }: EditProfileDialogProps) {
  const titleId = useId();
  const descId = useId();
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      dialog.showModal();
      // 열리면 이름 입력칸으로 포커스(a11y:focus). 이름 입력칸이 첫 번째 입력이다.
      dialog.querySelector<HTMLInputElement>("input")?.focus();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      className="preemie-dialog"
      role="dialog"
      aria-labelledby={titleId}
      aria-describedby={descId}
      onCancel={(event) => {
        // ESC 로 닫을 때도 같은 onCancel(아무 것도 바꾸지 않는다)로 상태를 맞춘다.
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
        <IconBadge icon="Pencil" tone="primary" size="md" />
        <h2 id={titleId} style={{ margin: 0, fontSize: "var(--font-size-title)" }}>
          프로필 편집
        </h2>
      </div>
      <p id={descId} style={{ margin: 0, fontSize: "var(--font-size-meta)", color: "var(--color-text-muted)" }}>
        이름과 출생 체중은 선택 입력입니다
      </p>
      {open ? <EditProfileForm profile={profile} onSaved={onSaved} onCancel={onCancel} /> : null}
    </dialog>
  );
}
