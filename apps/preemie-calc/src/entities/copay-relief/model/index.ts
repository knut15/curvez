// F5 본인부담 경감 종료일. 기준 데이터는 이 슬라이스 안에서만 읽는다(ARCH-107).
import { addMonths, type CalendarDate } from "@/shared/lib/calendar-date";
import {
  resolveReferenceMeta,
  resolveSettledEnvelope,
  type ReferenceMeta,
  type ReferenceMetaInput,
  type Settled,
} from "@/shared/lib/reference";

import rawData from "../data/copay-relief.json";

export type CopayReliefTier = {
  id: string;
  label: string;
  gestationDays: { from: number | null; to: number };
  period: { years: number; months: number };
};

// 출처 하나에 붙는 각주. 공단 안내 페이지가 개정 전 내용이라는 사실 등을 남긴다(2026-09-30).
export type CopayReliefSourceNote = { sourceId: string; text: string };

type InnerBoundary = "lower-inclusive" | "upper-inclusive";
type EndDateMethod = "birth-plus-period" | "birth-plus-period-minus-1-day";

const INNER_BOUNDARIES: readonly InnerBoundary[] = ["lower-inclusive", "upper-inclusive"];
const END_DATE_METHODS: readonly EndDateMethod[] = [
  "birth-plus-period",
  "birth-plus-period-minus-1-day",
];

function isInnerBoundary(value: string): value is InnerBoundary {
  return (INNER_BOUNDARIES as readonly string[]).includes(value);
}
function isEndDateMethod(value: string): value is EndDateMethod {
  return (END_DATE_METHODS as readonly string[]).includes(value);
}

// JSON 이 주는 모양. value 가 아직 리터럴로 좁혀지지 않은 `string` 이다.
type RawSettledString = {
  status: string;
  value: string;
  openQuestion?: string;
  provisionalBasis?: string;
};

type CopayReliefData = {
  meta: ReferenceMetaInput;
  policyLabel: string;
  eligibleBelowGestationDays: number;
  tiers: CopayReliefTier[];
  innerBoundary: RawSettledString;
  endDateMethod: RawSettledString;
  sourceNotes?: CopayReliefSourceNote[];
};

// JSON 구조가 CopayReliefData 와 다르면 여기서 컴파일 오류가 난다(단언 없이 구조 검사).
const data: CopayReliefData = rawData;

export const copayReliefMeta: ReferenceMeta = resolveReferenceMeta(data.meta, "copay-relief");
export const copayReliefPolicyLabel: string = data.policyLabel;
export const copayReliefSourceNotes: CopayReliefSourceNote[] = data.sourceNotes ?? [];
// 구간표(가이드 F16 등 슬라이스 밖 화면용 공개 API). data/ 파일을 슬라이스 밖에서 직접
// 읽지 않도록, 파일에 실린 구간 배열을 그대로 내보낸다(파일 순서: 29주 미만 → 29~33주 → 33~37주).
export const copayReliefTiers: readonly CopayReliefTier[] = data.tiers;

if (!isInnerBoundary(data.innerBoundary.value)) {
  throw new Error(`copay-relief: innerBoundary.value 값이 올바르지 않다 (${data.innerBoundary.value})`);
}
export const copayReliefInnerBoundary: Settled<InnerBoundary> = resolveSettledEnvelope(
  data.innerBoundary,
  data.innerBoundary.value,
  "copay-relief: innerBoundary",
);

if (!isEndDateMethod(data.endDateMethod.value)) {
  throw new Error(`copay-relief: endDateMethod.value 값이 올바르지 않다 (${data.endDateMethod.value})`);
}
export const copayReliefEndDateMethod: Settled<EndDateMethod> = resolveSettledEnvelope(
  data.endDateMethod,
  data.endDateMethod.value,
  "copay-relief: endDateMethod",
);

// 구간 경계(주 경계를 일수로 옮긴 값). 정확히 이 값이면 어느 구간인지 정하지 않는다.
const BOUNDARY_DAYS: readonly number[] = data.tiers
  .map((tier) => tier.gestationDays.from)
  .filter((value): value is number => value !== null);

export type CopayReliefResult =
  | { kind: "not-eligible" }
  | { kind: "boundary-unconfirmed"; boundaryDays: number }
  | { kind: "eligible"; tier: CopayReliefTier; endDate: CalendarDate; unconfirmed: boolean };

// entities/child 의 GestationalAge 에서 이 슬라이스가 실제로 읽는 필드만 담은 입력
// 타입이다(PLC-01). 같은 층 슬라이스를 import 하지 않는다.
export type CopayReliefGestationInput = { totalDays: number };

export function classifyCopayRelief(input: {
  birthDate: CalendarDate;
  gestation: CopayReliefGestationInput;
}): CopayReliefResult {
  const { birthDate, gestation } = input;

  if (gestation.totalDays >= data.eligibleBelowGestationDays) {
    return { kind: "not-eligible" };
  }

  // innerBoundary 가 아직 미확정일 때만 경계 정각(203일·231일)을 별도로 다룬다(architecture.md
  // ⑬ 표 반영 전 상태). PRD 버전 4 §9 결정(2026-10-02 정정)으로 upper-inclusive 가 확정된
  // 지금은 이 분기에 닿지 않는다 — 값이 다시 미확정으로 되돌아가는 경우를 위한 방어적 분기다.
  if (
    copayReliefInnerBoundary.status === "미확정" &&
    BOUNDARY_DAYS.includes(gestation.totalDays)
  ) {
    return { kind: "boundary-unconfirmed", boundaryDays: gestation.totalDays };
  }

  // upper-inclusive: 경계 정각(33주 0일=231일, 29주 0일=203일)은 그 주수가 "이상"인
  // 더 짧은 경감 구간(재태일수가 더 큰 쪽 tier)에 넣는다 — from 포함, to 배타
  // (PRD 버전 4 §9 결정, 2026-10-02 정정. 보건복지부 보도자료 원문 "33주 이상~37주 미만
  // 5년 2개월", "29주 이상~33주 미만 5년 3개월"대로 바로잡았다. 2026-09-30 당시의
  // lower-inclusive 결정은 원문과 반대였다). lower-inclusive 면 반대로 from 을 배타,
  // to 를 포함으로 본다.
  const lowerInclusive = copayReliefInnerBoundary.value === "lower-inclusive";
  const tier = data.tiers.find((t) =>
    lowerInclusive
      ? (t.gestationDays.from === null || gestation.totalDays > t.gestationDays.from) &&
        gestation.totalDays <= t.gestationDays.to
      : (t.gestationDays.from === null || gestation.totalDays >= t.gestationDays.from) &&
        gestation.totalDays < t.gestationDays.to,
  );
  if (!tier) {
    // 259일 미만이고 경계값도 아니면 반드시 세 구간 중 하나에 든다. 도달하면 데이터 오류다.
    throw new Error(
      `copay-relief: 재태일수 ${gestation.totalDays}가 어느 구간에도 속하지 않는다`,
    );
  }

  const totalMonths = tier.period.years * 12 + tier.period.months;
  const endDate = addMonths(birthDate, totalMonths);
  return {
    kind: "eligible",
    tier,
    endDate,
    unconfirmed: copayReliefEndDateMethod.status === "미확정",
  };
}
