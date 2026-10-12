// F6 교정연령 적용 종료 안내. 기준 데이터는 이 슬라이스 안에서만 읽는다(ARCH-107).
import {
  resolveReferenceMeta,
  resolveSettledEnvelope,
  type ReferenceMeta,
  type ReferenceMetaInput,
  type Settled,
} from "@/shared/lib/reference";

import rawData from "../data/correction-period.json";

type AgeBasisValue = "chronological" | "corrected" | null;

// JSON 이 주는 모양. value 는 "chronological"·"corrected"·null 셋 뿐이라 리터럴로 그대로 온다.
type RawAgeBasis = {
  status: string;
  value: AgeBasisValue;
  openQuestion?: string;
  provisionalBasis?: string;
};

type CorrectionPeriodData = {
  meta: ReferenceMetaInput;
  appliesBelowGestationDays: number;
  defaultUntilMonths: number;
  extended: { untilMonths: number; gestationDaysBelow: number; birthWeightGramsBelow: number };
  ageBasis: RawAgeBasis;
};

// JSON 구조가 CorrectionPeriodData 와 다르면 여기서 컴파일 오류가 난다(단언 없이 구조 검사).
const data: CorrectionPeriodData = rawData;

export const correctionPeriodMeta: ReferenceMeta = resolveReferenceMeta(
  data.meta,
  "correction-period",
);
export const correctionPeriodAgeBasis: Settled<AgeBasisValue> = resolveSettledEnvelope(
  data.ageBasis,
  data.ageBasis.value,
  "correction-period: ageBasis",
);

// F16 가이드가 값을 문장에 직접 적지 않고 여기서 읽게 하는 공개 API(TEAM-09).
// 단위 변환(일→주, g→kg)은 하지 않는다 — 그 표시 형태를 정하는 곳은 화면이다.
export const correctionPeriodDefaultUntilMonths: number = data.defaultUntilMonths;
export const correctionPeriodExtended: {
  untilMonths: number;
  gestationDaysBelow: number;
  birthWeightGramsBelow: number;
} = data.extended;

export type CorrectionPeriodResult =
  | { kind: "not-applicable" }
  | { kind: "default"; untilMonths: number; showWeightHint: boolean }
  | { kind: "extended"; untilMonths: number; reason: "gestation" | "birth-weight" };

// entities/child 의 GestationalAge 에서 이 슬라이스가 실제로 읽는 필드만 담은 입력
// 타입이다(PLC-01). 같은 층 슬라이스를 import 하지 않는다.
export type CorrectionPeriodGestationInput = { totalDays: number };

export function correctionPeriod(input: {
  gestation: CorrectionPeriodGestationInput;
  birthWeightGrams: number | null;
}): CorrectionPeriodResult {
  const { gestation, birthWeightGrams } = input;

  if (gestation.totalDays >= data.appliesBelowGestationDays) {
    return { kind: "not-applicable" };
  }

  if (gestation.totalDays < data.extended.gestationDaysBelow) {
    return { kind: "extended", untilMonths: data.extended.untilMonths, reason: "gestation" };
  }

  if (birthWeightGrams !== null && birthWeightGrams < data.extended.birthWeightGramsBelow) {
    return { kind: "extended", untilMonths: data.extended.untilMonths, reason: "birth-weight" };
  }

  return {
    kind: "default",
    untilMonths: data.defaultUntilMonths,
    showWeightHint: birthWeightGrams === null,
  };
}
