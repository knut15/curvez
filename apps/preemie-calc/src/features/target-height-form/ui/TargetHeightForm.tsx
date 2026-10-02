"use client";

// F14 목표키 참고. 사용자 행위(부모 키 입력·계산) 하나를 담당하는 feature.
// 부모 키는 저장하지 않는다(PRD §8, ARCH-110 이 이 층의 저장소 사용을 막는다).
import { useState } from "react";

import {
  computeTargetHeight,
  isValidParentHeights,
  type TargetHeightResult,
  type TargetHeightSex,
} from "@/entities/target-height";
import { Button, ICONS, TextField } from "@/shared/ui";

const AlertCircle = ICONS.AlertCircle;

export type TargetHeightFormProps = {
  sex: TargetHeightSex;
  onCompute: (result: TargetHeightResult) => void;
  /** 입력이 바뀔 때마다 호출한다. 패널이 이전 계산 결과를 지운다(DSG-01). */
  onInputChange: () => void;
};

export function TargetHeightForm({ sex, onCompute, onInputChange }: TargetHeightFormProps) {
  const [fatherCm, setFatherCm] = useState("");
  const [motherCm, setMotherCm] = useState("");

  const touched = fatherCm !== "" || motherCm !== "";
  const fatherNum = fatherCm.trim() === "" ? null : Number(fatherCm);
  const motherNum = motherCm.trim() === "" ? null : Number(motherCm);
  const canSubmit = isValidParentHeights({ fatherCm: fatherNum, motherCm: motherNum });
  const showError = touched && !canSubmit;

  function handleFatherChange(value: string) {
    setFatherCm(value);
    onInputChange();
  }

  function handleMotherChange(value: string) {
    setMotherCm(value);
    onInputChange();
  }

  function handleSubmit() {
    if (!canSubmit || fatherNum === null || motherNum === null) return;
    onCompute(computeTargetHeight({ sex, fatherCm: fatherNum, motherCm: motherNum }));
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-5)" }}>
      <TextField label="아빠 키" icon="Ruler" suffix="cm" inputMode="decimal" required value={fatherCm} onChange={handleFatherChange} />
      <TextField label="엄마 키" icon="Ruler" suffix="cm" inputMode="decimal" required value={motherCm} onChange={handleMotherChange} />
      {showError ? (
        <p
          role="alert"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "var(--space-2)",
            margin: 0,
            fontSize: "var(--font-size-body)",
            color: "var(--color-accent-danger)",
          }}
        >
          <AlertCircle aria-hidden="true" style={{ width: "var(--icon-size-sm)", height: "var(--icon-size-sm)" }} />
          부모님 키를 모두 확인하세요
        </p>
      ) : null}
      <Button variant="primary" fullWidth disabled={!canSubmit} onClick={handleSubmit}>
        계산하기
      </Button>
    </div>
  );
}
