// F5 본인부담 경감 종료일. entities/copay-relief 계산과 화면 표시를 묶는다.
import type { CalendarDate } from "@/shared/lib/calendar-date";
import type { GestationalAge } from "@/entities/child";
import {
  classifyCopayRelief,
  copayReliefMeta,
  copayReliefPolicyLabel,
  copayReliefSourceNotes,
} from "@/entities/copay-relief";
import { ReferenceFooter, StatePanel, UnconfirmedNotice, ValueCard } from "@/shared/ui";

export type CopayReliefSectionProps = {
  birthDate: CalendarDate;
  gestation: GestationalAge;
};

export function CopayReliefSection({ birthDate, gestation }: CopayReliefSectionProps) {
  const result = classifyCopayRelief({ birthDate, gestation });
  const sources = [{ title: copayReliefMeta.title, effectiveDate: copayReliefMeta.effectiveDate }];

  if (result.kind === "not-eligible") {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-5)" }}>
        <StatePanel variant="domain-empty" message="경감 대상이 아닙니다" />
        <ReferenceFooter sources={sources} />
      </div>
    );
  }

  if (result.kind === "boundary-unconfirmed") {
    // 문구 원문: .curvez/design/preemie-calc/screens/copay-relief.md state:boundary-unconfirmed
    // (curvez-designer 가 curvez-nextjs 의 blocked_on 질문에 답해 확정했다). 두 후보 구간명은
    // 같은 글자 크기·굵기·색으로 나란히 적어 어느 쪽도 강조하지 않는다.
    const text =
      result.boundaryDays === 203
        ? "재태 29주 0일은 구간 경계 정각이라, '5년 4개월' 구간과 '5년 3개월' 구간 중 어느 쪽인지 원문 확인 전이라 정하지 않았습니다. 확정되면 이 안내는 자동으로 없어집니다."
        : "재태 33주 0일은 구간 경계 정각이라, '5년 3개월' 구간과 '5년 2개월' 구간 중 어느 쪽인지 원문 확인 전이라 정하지 않았습니다. 확정되면 이 안내는 자동으로 없어집니다.";
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-5)" }}>
        <UnconfirmedNotice text={text} />
        <ReferenceFooter sources={sources} extraNote={copayReliefPolicyLabel} />
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-5)" }}>
      <ValueCard
        icon="Banknote"
        tone="primary"
        label="경감 구간"
        value={result.tier.label}
        subValue={`종료 예정일: ${result.endDate}`}
      />
      <p style={{ margin: 0, fontSize: "var(--font-size-body)", color: "var(--color-text-muted)" }}>
        {copayReliefPolicyLabel}
      </p>
      {result.unconfirmed ? (
        <UnconfirmedNotice text="종료일 계산 방식은 공식 원문 확인 전 잠정값입니다" />
      ) : null}
      {copayReliefSourceNotes.map((note) => (
        <p
          key={note.sourceId}
          style={{ margin: 0, fontSize: "var(--font-size-meta)", color: "var(--color-text-muted)" }}
        >
          {note.text}
        </p>
      ))}
      <ReferenceFooter sources={sources} />
    </div>
  );
}
