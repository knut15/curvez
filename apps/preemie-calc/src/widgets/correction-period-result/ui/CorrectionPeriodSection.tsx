// F6 교정연령 적용 종료 안내. entities/correction-period 계산과 화면 표시를 묶는다.
import type { GestationalAge } from "@/entities/child";
import {
  correctionPeriod,
  correctionPeriodMeta,
  correctionPeriodAgeBasis,
} from "@/entities/correction-period";
import { ReferenceFooter, StatePanel, UnconfirmedNotice, ValueCard } from "@/shared/ui";

export type CorrectionPeriodSectionProps = {
  gestation: GestationalAge;
  birthWeightGrams: number | null;
};

export function CorrectionPeriodSection({ gestation, birthWeightGrams }: CorrectionPeriodSectionProps) {
  const result = correctionPeriod({ gestation, birthWeightGrams });
  const sources = [{ title: correctionPeriodMeta.title, effectiveDate: correctionPeriodMeta.effectiveDate }];

  if (result.kind === "not-applicable") {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-5)" }}>
        <StatePanel variant="domain-empty" message="이 아이는 교정연령을 쓰지 않습니다(재태 37주 이상)" />
        <ReferenceFooter sources={sources} />
      </div>
    );
  }

  const singleValue = result.kind === "extended" ? "36개월까지 쓸 수 있음" : "24개월까지";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-5)" }}>
      <ValueCard
        icon="Hourglass"
        tone="warm"
        label="교정연령 적용 종료"
        value={singleValue}
        subValue={
          result.kind === "default" && result.showWeightHint
            ? "출생 체중이 1.5kg 미만이면 36개월까지"
            : null
        }
      />
      {correctionPeriodAgeBasis.status === "미확정" ? (
        <UnconfirmedNotice text="종료 기준을 출생·교정 어느 나이로 셀지는 공식 원문 확인 전 잠정값입니다" />
      ) : null}
      <p style={{ margin: 0, fontSize: "var(--font-size-body)", color: "var(--color-text-primary)" }}>
        의료진과 상담해 정하세요
      </p>
      <ReferenceFooter sources={sources} />
    </div>
  );
}
