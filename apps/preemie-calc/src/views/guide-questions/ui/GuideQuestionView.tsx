// F16. route: /guide/questions/[slug]. 정적 빌드 페이지 — 훅이 없어 서버 컴포넌트다.
// 이 파일은 view 의 루트라서 entities 의 기준 데이터를 직접 읽는다(architecture: 루트는 예외).
// 문구의 근거는 각 entity 의 데이터 파일과 PRD §1 표다. 데이터에 없는 의료 권고는 쓰지 않는다.
import type { ReactNode } from "react";

import { ageBasisMeta } from "@/entities/age-basis";
import {
  checkupMeta,
  checkupRounds,
  questionnaireCorrection,
} from "@/entities/checkup";
import {
  copayReliefEndDateMethod,
  copayReliefMeta,
  copayReliefPolicyLabel,
  copayReliefSourceNotes,
  copayReliefTiers,
} from "@/entities/copay-relief";
import {
  correctionPeriodAgeBasis,
  correctionPeriodDefaultUntilMonths,
  correctionPeriodExtended,
  correctionPeriodMeta,
} from "@/entities/correction-period";
import { growthMeta } from "@/entities/growth";
import {
  vaccinationMeta,
  vaccinationNotes,
  vaccinationSeries,
  type VaccineSeries,
} from "@/entities/vaccination";
import type { ReferenceMeta } from "@/shared/lib/reference";
import { UnconfirmedNotice, type ReferenceFooterSource } from "@/shared/ui";

import { findGuideQuestion, type GuideQuestionSlug } from "../lib/questions";
import { QuestionShell } from "./QuestionShell";

export type GuideQuestionViewProps = { slug: GuideQuestionSlug };

const listStyle: React.CSSProperties = {
  margin: 0,
  paddingLeft: "var(--space-4)",
  display: "flex",
  flexDirection: "column",
  gap: "var(--space-1)",
};

const paragraph: React.CSSProperties = { margin: 0 };

// 메타의 출처 이름과 기준일을 푸터 형식으로 옮긴다. onlyIds 가 있으면 그 출처만 쓴다.
function footerSources(
  meta: ReferenceMeta,
  onlyIds?: string[],
): ReferenceFooterSource[] {
  return meta.sources
    .filter((source) => onlyIds === undefined || onlyIds.includes(source.id))
    .map((source) => ({
      title: source.name,
      effectiveDate: meta.effectiveDate,
    }));
}

const DAYS_PER_WEEK = 7;

// 경감 구간 표는 entities/copay-relief 의 공개 API(copayReliefTiers)를 그대로 읽는다
// (ARCH-107: data/*.json 은 슬라이스 밖에서 직접 읽지 않는다). PC-F16-AC4 가 요구하는
// 표시 순서(33~37주 → 29~33주 → 29주 미만)는 파일 순서(29주 미만 → 29~33주 → 33~37주)와
// 반대라 뒤집어서 쓴다.
function copayReliefTierRows(): { id: string; range: string; label: string }[] {
  return [...copayReliefTiers].reverse().map((tier) => {
    const { from, to } = tier.gestationDays;
    const upper = `${to / DAYS_PER_WEEK}주 미만`;
    const range =
      from === null
        ? `재태기간 ${upper}`
        : `재태기간 ${from / DAYS_PER_WEEK}주 이상 ${upper}`;
    return { id: tier.id, range, label: tier.label };
  });
}

// TEAM-07: alternativeGroup 이 같은 계열(로타바이러스 RV1·RV5, 일본뇌염 불활성화·약독화)은
// "둘 중 하나"로 묶어 보여준다. 데이터의 alternativeGroup 에서 그대로 읽는다(즉흥으로 짝을
// 짓지 않는다). 첫 등장 순서를 그대로 두고, 같은 그룹의 두 번째 이후 항목은 건너뛴다.
type VaccinationRow =
  | { kind: "single"; series: VaccineSeries }
  | { kind: "group"; groupId: string; members: VaccineSeries[] };

function groupVaccinationSeries(series: readonly VaccineSeries[]): VaccinationRow[] {
  const rows: VaccinationRow[] = [];
  const seenGroups = new Set<string>();
  for (const s of series) {
    if (s.alternativeGroup === null) {
      rows.push({ kind: "single", series: s });
      continue;
    }
    if (seenGroups.has(s.alternativeGroup)) continue;
    seenGroups.add(s.alternativeGroup);
    rows.push({
      kind: "group",
      groupId: s.alternativeGroup,
      members: series.filter((other) => other.alternativeGroup === s.alternativeGroup),
    });
  }
  return rows;
}

function seriesDoseText(series: VaccineSeries): string {
  return series.doses.map((dose) => `${dose.label} ${dose.sourceTimingText}`).join(" · ");
}

function Vaccination(): ReactNode {
  const rows = groupVaccinationSeries(vaccinationSeries);
  return (
    <>
      <p style={paragraph}>
        예방접종은 교정연령이 아니라{" "}
        <strong>출생일부터 센 나이(출생 기준)</strong>로 맞춥니다. 이른둥이도
        같습니다.
      </p>
      <ul style={listStyle}>
        {rows.map((row) =>
          row.kind === "single" ? (
            <li key={row.series.id}>
              <strong>{row.series.label}</strong> {seriesDoseText(row.series)}
            </li>
          ) : (
            <li key={row.groupId}>
              <strong>{row.members.map((m) => m.label).join(" 또는 ")}</strong> (둘 중 하나)
              <ul style={listStyle}>
                {row.members.map((member) => (
                  <li key={member.id}>
                    {member.label} {seriesDoseText(member)}
                  </li>
                ))}
              </ul>
            </li>
          ),
        )}
      </ul>
      {vaccinationNotes.map((note) => (
        <p key={note.id} style={paragraph}>
          {note.text}
        </p>
      ))}
    </>
  );
}

function CheckupQuestionnaire(): ReactNode {
  const lastRound = checkupRounds.find(
    (round) => round.id === questionnaireCorrection.value.lastCorrectedRoundId,
  );
  return (
    <>
      <p style={paragraph}>
        방문 날짜는 출생 기준, 문진표와 발달선별검사지는 교정 기준(24개월
        검진까지)
      </p>
      <p style={paragraph}>
        37주 미만으로 태어난 아이는{" "}
        {lastRound
          ? `${lastRound.label} 검진(${lastRound.sourceRangeText})까지`
          : "24개월 검진까지"}{" "}
        문진표와 발달선별검사지를 교정 나이로 씁니다. 검진을 받으러 가는 날짜는
        출생일부터 센 나이로 잡습니다.
      </p>
      <ul style={listStyle}>
        {checkupRounds.map((round) => (
          <li key={round.id}>
            {round.label} 생후 {round.sourceRangeText.replace(/^생후 /, "")}
            {round.unverifiedReason
              ? ` (원문 대조 전: ${round.unverifiedReason})`
              : ""}
          </li>
        ))}
      </ul>
    </>
  );
}

function Weaning(): ReactNode {
  return (
    <>
      <p style={paragraph}>
        이유식은 교정 나이로 봅니다. <strong>교정 6개월 전후</strong>가
        기준입니다. 교정 6개월은 출산 예정일에서 6개월이 지난 때를 말합니다.
      </p>
      <p style={paragraph}>시작 시기는 의료진과 상담하세요.</p>
      {/* TEAM-08: 아래 출처(아이사랑 이른둥이 안내)가 확인하는 것은 "이유식은 교정 나이를
          따른다"까지다(sources-v2 사실 #4). "교정 6개월 전후"는 그 출처의 표현이 아니라
          일반 안내라서, 출처처럼 보이지 않도록 따로 밝힌다. */}
      <p
        style={{
          ...paragraph,
          fontSize: "var(--font-size-meta)",
          color: "var(--color-text-muted)",
        }}
      >
        아래 출처가 확인하는 것은 &quot;이유식은 교정 나이를 따른다&quot;까지입니다. &quot;교정
        6개월 전후&quot;는 출처 문서의 표현이 아닌 일반 안내입니다.
      </p>
    </>
  );
}

function CorrectedAgeUntil(): ReactNode {
  // TEAM-09: 24·36개월, 28주, 1.5kg 은 미결 3(PRD-9-3)에 걸린 값이라 문장에 직접 적지
  // 않고 correction-period.json 에서 읽는다. 데이터가 바뀌면 이 문장도 같이 바뀐다.
  const gestationWeeksBelow = correctionPeriodExtended.gestationDaysBelow / DAYS_PER_WEEK;
  const birthWeightKgBelow = correctionPeriodExtended.birthWeightGramsBelow / 1000;
  return (
    <>
      {correctionPeriodAgeBasis.status === "미확정" ? (
        <UnconfirmedNotice text="교정연령을 언제까지 쓰는지는 원문을 찾지 못해 확정하지 않았습니다. 아래는 잠정 기준입니다." />
      ) : null}
      <p style={paragraph}>
        잠정 기준으로는 보통 <strong>{correctionPeriodDefaultUntilMonths}개월</strong>까지
        교정연령을 씁니다. {gestationWeeksBelow}주 미만 또는 {birthWeightKgBelow}kg 미만으로
        태어난 아이는 <strong>{correctionPeriodExtended.untilMonths}개월</strong>
        까지입니다.
      </p>
      <p style={paragraph}>
        {correctionPeriodDefaultUntilMonths}개월·{correctionPeriodExtended.untilMonths}개월을
        출생일부터 세는지, 교정 나이로 세는지는 정해지지 않았습니다.
      </p>
    </>
  );
}

function CatchUpGrowth(): ReactNode {
  return (
    <>
      <p style={paragraph}>
        이른둥이(재태 37주 미만)의 성장 백분위는 <strong>교정연령 기준</strong>
        으로 봅니다. 잰 날의 교정 나이로 백분위를 구하고, 기록이 쌓이면 그
        추이를 봅니다.
      </p>
      <p style={paragraph}>
        백분위가 3 미만이거나 97 초과이면 소아청소년과 상담을 권합니다. 교정
        40주가 되기 전에 잰 값은 성장도표가 예정일부터 시작해서 백분위를
        표시하지 않습니다.
      </p>
    </>
  );
}

function CopayRelief(): ReactNode {
  const tiers = copayReliefTierRows();
  return (
    <>
      <p style={paragraph}>
        {copayReliefPolicyLabel}입니다. 경감 기간은 <strong>출생일부터</strong>{" "}
        세고, 재태기간에 따라 세 구간으로 나뉩니다.
      </p>
      <ul style={listStyle}>
        {tiers.map((tier) => (
          <li key={tier.id}>
            {tier.range}: <strong>{tier.label}</strong>
          </li>
        ))}
      </ul>
      {copayReliefEndDateMethod.status === "미확정" ? (
        <UnconfirmedNotice text="종료일 당일을 포함하는지는 원문을 찾지 못했습니다. 출생일에 기간을 더한 날을 잠정 종료일로 봅니다." />
      ) : null}
      {copayReliefSourceNotes.map((note) => (
        <p
          key={note.text}
          style={{
            ...paragraph,
            fontSize: "var(--font-size-meta)",
            color: "var(--color-text-muted)",
          }}
        >
          {note.text}
        </p>
      ))}
    </>
  );
}

const BODIES: Record<GuideQuestionSlug, () => ReactNode> = {
  vaccination: Vaccination,
  "checkup-questionnaire": CheckupQuestionnaire,
  weaning: Weaning,
  "corrected-age-until": CorrectedAgeUntil,
  "catch-up-growth": CatchUpGrowth,
  "copay-relief": CopayRelief,
};

// 각 쪽이 가는 계산기 화면. 프로필이 없으면 그 화면이 입력 화면(/)으로 보낸다.
const CALCULATOR_HREF: Record<GuideQuestionSlug, string> = {
  vaccination: "/dashboard/vaccinations",
  "checkup-questionnaire": "/dashboard/checkups",
  weaning: "/dashboard/age-basis",
  "corrected-age-until": "/dashboard/correction-period",
  "catch-up-growth": "/dashboard/growth",
  "copay-relief": "/dashboard/copay-relief",
};

// F16 AC6 의 근거 자료 이름·기준일. 이유식 쪽은 age-basis 데이터가 아이사랑 이른둥이 안내를 근거로 든다.
function sourcesFor(slug: GuideQuestionSlug): ReferenceFooterSource[] {
  switch (slug) {
    case "vaccination":
      return footerSources(vaccinationMeta);
    case "checkup-questionnaire":
      return footerSources(checkupMeta);
    case "weaning":
      return footerSources(ageBasisMeta, ["source-childcare"]);
    case "corrected-age-until":
      return footerSources(correctionPeriodMeta);
    case "catch-up-growth":
      return footerSources(growthMeta);
    case "copay-relief":
      return footerSources(copayReliefMeta);
  }
}

export function GuideQuestionView({ slug }: GuideQuestionViewProps) {
  const question = findGuideQuestion(slug);
  if (!question) return null;
  const Body = BODIES[slug];
  return (
    <QuestionShell
      title={question.title}
      calculatorHref={CALCULATOR_HREF[slug]}
      sources={sourcesFor(slug)}
    >
      <Body />
    </QuestionShell>
  );
}
