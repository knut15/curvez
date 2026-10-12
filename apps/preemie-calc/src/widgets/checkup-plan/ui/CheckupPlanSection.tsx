// F4 영유아검진 도우미. entities/checkup 계산과 화면 표시를 묶는다(architecture "widgets" 예시:
// "검진 도우미 카드").
import type { CalendarDate } from "@/shared/lib/calendar-date";
import { planCheckups, checkupMeta } from "@/entities/checkup";
import { IconBadge, ReferenceFooter, StatePanel, UnconfirmedNotice } from "@/shared/ui";

import { CheckupRoundItem } from "./CheckupRoundItem";

export type CheckupPlanSectionProps = {
  birthDate: CalendarDate;
  correctedFrom: CalendarDate | null;
  today: CalendarDate;
};

function basisLabel(basis: "corrected" | "chronological"): string {
  return basis === "corrected" ? "교정" : "생후";
}

export function CheckupPlanSection({ birthDate, correctedFrom, today }: CheckupPlanSectionProps) {
  const plan = planCheckups({ birthDate, correctedFrom, today });

  const sources = [{ title: checkupMeta.title, effectiveDate: checkupMeta.effectiveDate }];

  if (plan.allPassed) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-5)" }}>
        <StatePanel variant="domain-empty" message="영유아검진 대상 기간이 끝났습니다" />
        <ReferenceFooter sources={sources} />
      </div>
    );
  }

  const current = plan.rounds.find((r) => r.status === "current") ?? null;
  // 출산 예정일 전이라 교정 나이가 아직 없다(ERR-01). 새 규칙을 만들지 않고 이 사실만
  // 그대로 보인다(오케스트레이터 tie-break) — 기존 UnconfirmedNotice 컴포넌트를 재사용한다.
  const BEFORE_DUE_TEXT = "출산 예정일 전이라 교정 나이가 아직 없습니다";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-5)" }}>
      {current && plan.currentBeforeDue ? (
        <UnconfirmedNotice text={BEFORE_DUE_TEXT} />
      ) : current && plan.currentQuestionnaireMonths !== null ? (
        <p
          style={{
            display: "flex",
            alignItems: "center",
            gap: "var(--space-2)",
            margin: 0,
            fontSize: "var(--font-size-subtitle)",
            color: "var(--color-text-primary)",
          }}
        >
          <IconBadge icon="Stethoscope" tone="warm" size="sm" />
          오늘은 {basisLabel(current.questionnaireBasis)} {plan.currentQuestionnaireMonths}개월 기준으로 문진표를
          쓰세요
        </p>
      ) : null}
      {plan.unconfirmed ? (
        <UnconfirmedNotice text="문진표·발달선별검사지의 교정 기준 적용 구간은 공식 원문 확인 전 잠정값입니다" />
      ) : null}
      <ul className="pc-round-list">
        {[...plan.rounds]
          .sort((a, b) => (a.status === "current" ? -1 : b.status === "current" ? 1 : 0))
          .map((r) => (
            <CheckupRoundItem
              key={r.round.id}
              roundLabel={r.round.label}
              visitStart={r.visitStart}
              visitEnd={r.visitEnd}
              questionnaireBasisLabel={
                r.status === "current" && plan.currentBeforeDue
                  ? BEFORE_DUE_TEXT
                  : r.status === "current" && plan.currentQuestionnaireMonths !== null
                    ? `${basisLabel(r.questionnaireBasis)} ${plan.currentQuestionnaireMonths}개월 기준`
                    : `${basisLabel(r.questionnaireBasis)} 기준`
              }
              status={r.status}
            />
          ))}
      </ul>
      <ReferenceFooter sources={sources} />
    </div>
  );
}
