"use client";

// F15 분유량 참고. 사용자 행위(체중 입력·계산) 하나를 담당하는 feature.
// 분유량 체중은 저장하지 않는다(PRD §8, ARCH-110 이 이 층의 저장소 사용을 막는다).
import { useState } from "react";

import { isValidWeightGrams } from "@/entities/formula";
import { Button, TextField } from "@/shared/ui";

export type FormulaFormProps = {
  initialWeightGrams: number | null;
  onCompute: (weightGrams: number) => void;
  /** 입력이 바뀔 때마다 호출한다. 패널이 이전 계산 결과를 지운다(DSG-03). */
  onInputChange: () => void;
};

function formatKg(grams: number): string {
  return String(Math.round(grams) / 1000);
}

export function FormulaForm({ initialWeightGrams, onCompute, onInputChange }: FormulaFormProps) {
  const [weightKg, setWeightKg] = useState(initialWeightGrams !== null ? formatKg(initialWeightGrams) : "");

  const weightGrams = weightKg.trim() === "" ? null : Math.round(Number(weightKg) * 1000);
  const canSubmit = isValidWeightGrams(weightGrams);
  const showError = weightKg !== "" && !canSubmit;

  function handleWeightChange(value: string) {
    setWeightKg(value);
    onInputChange();
  }

  function handleSubmit() {
    if (weightGrams === null || !canSubmit) return;
    onCompute(weightGrams);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-5)" }}>
      <TextField label="체중" icon="Weight" suffix="kg" inputMode="decimal" required value={weightKg} onChange={handleWeightChange} />
      {showError ? (
        <p role="alert" style={{ margin: 0, color: "var(--color-accent-danger)", fontSize: "var(--font-size-body)" }}>
          체중을 확인하세요(0.5~15kg)
        </p>
      ) : null}
      <Button variant="primary" fullWidth disabled={!canSubmit} onClick={handleSubmit}>
        계산하기
      </Button>
    </div>
  );
}
