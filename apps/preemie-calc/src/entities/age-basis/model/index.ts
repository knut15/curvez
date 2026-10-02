// F3 "어느 나이를 쓰나" 안내. 기준 데이터는 이 슬라이스 안에서만 읽는다(ARCH-107).
import type { CalendarSpan } from "@/shared/lib/calendar-date";
import {
  resolveReferenceMeta,
  type ReferenceMeta,
  type ReferenceMetaInput,
} from "@/shared/lib/reference";

import rawData from "../data/age-basis.json";

export type AgeBasisId =
  | "vaccination"
  | "checkup-visit"
  | "checkup-questionnaire"
  | "solid-food"
  | "development";

export type AgeBasis = "chronological" | "corrected" | "corrected-until-checkup";

export type AgeBasisItem = {
  id: AgeBasisId;
  label: string;
  basis: AgeBasis;
  sourceId: string;
};

const AGE_BASIS_IDS: readonly AgeBasisId[] = [
  "vaccination",
  "checkup-visit",
  "checkup-questionnaire",
  "solid-food",
  "development",
];
const AGE_BASES: readonly AgeBasis[] = [
  "chronological",
  "corrected",
  "corrected-until-checkup",
];

function isAgeBasisId(value: string): value is AgeBasisId {
  return (AGE_BASIS_IDS as readonly string[]).includes(value);
}
function isAgeBasis(value: string): value is AgeBasis {
  return (AGE_BASES as readonly string[]).includes(value);
}

// JSON 이 주는 모양. id·basis 가 아직 리터럴로 좁혀지지 않은 `string` 이라는 점만 다르다.
type RawAgeBasisItem = { id: string; label: string; basis: string; sourceId: string };

type AgeBasisData = {
  meta: ReferenceMetaInput;
  items: RawAgeBasisItem[];
};

// JSON 구조가 AgeBasisData 와 다르면 여기서 컴파일 오류가 난다(단언 없이 구조 검사).
const data: AgeBasisData = rawData;

function resolveAgeBasisItem(raw: RawAgeBasisItem): AgeBasisItem {
  if (!isAgeBasisId(raw.id)) {
    throw new Error(`age-basis: 알 수 없는 항목 id 다 (${raw.id})`);
  }
  if (!isAgeBasis(raw.basis)) {
    throw new Error(`age-basis: 알 수 없는 basis 다 (${raw.basis})`);
  }
  return { id: raw.id, label: raw.label, basis: raw.basis, sourceId: raw.sourceId };
}

export const ageBasisMeta: ReferenceMeta = resolveReferenceMeta(data.meta, "age-basis");
export const ageBasisItems: AgeBasisItem[] = data.items.map(resolveAgeBasisItem);

export type AgeBasisRow = {
  id: AgeBasisId;
  label: string;
  // 오늘 실제로 적용된 기준. 교정이 숨겨지면 항상 chronological 이다(PC-F3-AC5).
  basis: "chronological" | "corrected";
  sourceId: string;
  // 검진 방문·문진표처럼 단일 나이값이 아니라 차수별 규칙인 항목은 null 이다.
  // (그 값은 entities/checkup 의 planCheckups 가 낸다.)
  age: { months: number; days: number } | null;
};

const NO_SINGLE_AGE: readonly AgeBasisId[] = ["checkup-visit", "checkup-questionnaire"];

// entities/child 의 CorrectedAge 에서 이 슬라이스가 실제로 읽는 필드만 담은 입력 타입이다
// (PLC-01). 같은 층 슬라이스를 import 하지 않는다 — widget 이 CorrectedAge 값을 그대로
// 넘겨도 TypeScript 구조 타입이 맞으므로 호출부는 바뀌지 않는다.
export type AgeBasisCorrectedInput =
  | { kind: "hidden" }
  | { kind: "before-due" }
  | { kind: "after-due"; span: CalendarSpan };

function resolve(
  basis: AgeBasis,
  chronological: CalendarSpan,
  corrected: AgeBasisCorrectedInput,
): { basis: "chronological" | "corrected"; age: { months: number; days: number } | null } {
  if (basis === "chronological") {
    return {
      basis: "chronological",
      age: { months: chronological.months, days: chronological.days },
    };
  }
  // "corrected" 와 "corrected-until-checkup" 은 교정이 적용되는 동안은 같은 방식으로 낸다.
  if (corrected.kind === "hidden") {
    return {
      basis: "chronological",
      age: { months: chronological.months, days: chronological.days },
    };
  }
  if (corrected.kind === "after-due") {
    return {
      basis: "corrected",
      age: { months: corrected.span.months, days: corrected.span.days },
    };
  }
  // before-due: 예정일 전이라 교정 나이가 아직 시작되지 않았다. 기준만 내고 값은 비운다.
  return { basis: "corrected", age: null };
}

export function ageBasisRows(input: {
  chronological: CalendarSpan;
  corrected: AgeBasisCorrectedInput;
}): AgeBasisRow[] {
  return ageBasisItems.map((item) => {
    const resolved = resolve(item.basis, input.chronological, input.corrected);
    const age = NO_SINGLE_AGE.includes(item.id) ? null : resolved.age;
    return {
      id: item.id,
      label: item.label,
      basis: resolved.basis,
      sourceId: item.sourceId,
      age,
    };
  });
}
