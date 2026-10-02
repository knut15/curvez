"use client";

// F14 목표키 참고. features/target-height-form 입력과 결과 표시를 묶는다.
import { useState } from "react";

import { TARGET_HEIGHT_FORMULA, type TargetHeightResult, type TargetHeightSex } from "@/entities/target-height";
import { TargetHeightForm } from "@/features/target-height-form";
import { ReferenceFooter, ValueCard } from "@/shared/ui";

export type TargetHeightPanelSectionProps = {
  sex: TargetHeightSex;
};

export function TargetHeightPanelSection({ sex }: TargetHeightPanelSectionProps) {
  const [result, setResult] = useState<TargetHeightResult | null>(null);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-5)" }}>
      <p style={{ margin: 0, fontSize: "var(--font-size-body)", color: "var(--color-text-muted)" }}>
        아이 성별: {sex === "male" ? "남아" : "여아"}(프로필 기준)
      </p>
      <TargetHeightForm sex={sex} onCompute={setResult} onInputChange={() => setResult(null)} />
      {result ? (
        <>
          <ValueCard
            icon="Target"
            tone="primary"
            label="목표키 참고"
            value={`${result.midCm.toFixed(1)}cm`}
            subValue={`(${result.minCm.toFixed(1)}~${result.maxCm.toFixed(1)}cm)`}
          />
          <p style={{ margin: 0, fontSize: "var(--font-size-body)", color: "var(--color-text-primary)" }}>
            부모 키로 계산한 참고값이며 성인 키 예측이 아닙니다
          </p>
          <p style={{ margin: 0, fontSize: "var(--font-size-meta)", color: "var(--color-text-muted)" }}>
            계산식 출처: {TARGET_HEIGHT_FORMULA.name}
          </p>
        </>
      ) : null}
      <ReferenceFooter variant="disclaimer-only" />
    </div>
  );
}
