"use client";

// F15 분유량 참고. entities/formula 계산과 entities/growth 체중 미리 채우기, features/formula-form
// 입력 폼을 묶는다.
import { useState } from "react";

import { formulaAmount, formulaMeta, type FormulaAgeInput } from "@/entities/formula";
import { latestWeightGrams, loadGrowthRecords } from "@/entities/growth";
import { FormulaForm } from "@/features/formula-form";
import { ReferenceFooter, StatePanel, UnconfirmedNotice, ValueCard } from "@/shared/ui";

export type FormulaPanelSectionProps = {
  childId: string;
  ages: FormulaAgeInput;
};

export function FormulaPanelSection({ childId, ages }: FormulaPanelSectionProps) {
  const [weightGrams, setWeightGrams] = useState<number | null>(null);

  const growthResult = loadGrowthRecords(childId);
  const initialWeightGrams =
    growthResult.status === "ok" ? latestWeightGrams(growthResult.records) : null;

  const sources = [{ title: formulaMeta.title, effectiveDate: formulaMeta.effectiveDate }];

  const computed = weightGrams !== null ? formulaAmount({ weightGrams, ages }) : null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-5)" }}>
      <FormulaForm
        initialWeightGrams={initialWeightGrams}
        onCompute={setWeightGrams}
        onInputChange={() => setWeightGrams(null)}
      />
      {ages.correctionApplies ? (
        <p style={{ margin: 0, fontSize: "var(--font-size-body)", color: "var(--color-text-primary)" }}>
          의료진이 정해 준 양이 있으면 그 양을 따르세요
        </p>
      ) : null}
      {computed?.result.kind === "out-of-range" ? (
        <StatePanel variant="domain-empty" message="이 시기에는 일반 권장량을 보여주지 않습니다" />
      ) : null}
      {computed?.result.kind === "pending" ? <UnconfirmedNotice text="기준 확인 중" /> : null}
      {computed?.result.kind === "ok" ? (
        <ValueCard
          icon="Milk"
          tone="primary"
          label="하루 권장량"
          value={`${computed.result.dailyMl.min}~${computed.result.dailyMl.max}ml`}
        />
      ) : null}
      <ReferenceFooter sources={sources} />
    </div>
  );
}
