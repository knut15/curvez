// 기준 데이터 파일(entities/*/data/*.json) 이 공통으로 쓰는 메타 타입.
// PRD §9 미결에 걸린 값을 감싸는 `Settled<T>` 도 여기 둔다.

import { parseCalendarDate, type CalendarDate } from "@/shared/lib/calendar-date";

export type ReferenceSource = { id: string; name: string; url: string };

// (2026-09-29 이의 1, ACC-04) effectiveDate·lastVerified 는 "둘 다 날짜(원문 대조를
// 마쳤다)" 또는 "둘 다 null(원문 대조 전)" 두 경우의 유니온이다. 대조 전에는 날짜를
// 지어 넣지 않는다 — 기준일은 원문과 대조해야 얻는 값이라 대조 없이는 알 수 없다.
// Settled<CalendarDate> 는 쓰지 않는다(architecture.md decisions 참고. 원문 대조는
// PRD §9 미결이 아니라 할 일이라 openQuestion 을 붙일 수 없다).
export type ReferenceMeta = {
  id: string;
  title: string;
  sources: ReferenceSource[];
  schemaVersion: 1;
} & (
  | { effectiveDate: CalendarDate; lastVerified: CalendarDate }
  | { effectiveDate: null; lastVerified: null }
);

// JSON 파일에 실제로 적히는 모양이다. 날짜 필드가 아직 `CalendarDate` 로 검증되지 않은
// 문자열이라는 점만 `ReferenceMeta` 와 다르다. `resolveReferenceMeta` 가 이 값을 검증해
// `ReferenceMeta` 로 바꾼다.
export type ReferenceMetaInput = {
  id: string;
  title: string;
  sources: ReferenceSource[];
  effectiveDate: string | null;
  lastVerified: string | null;
  // JSON 은 숫자 리터럴을 `number` 로 넓혀 가져온다. `resolveReferenceMeta` 가 값을
  // 확인한 뒤 좁혀 돌려준다.
  schemaVersion: number;
};

// PRD §9 표의 행 번호.
export type OpenQuestionId =
  | "PRD-9-1"
  | "PRD-9-2"
  | "PRD-9-3"
  | "PRD-9-5"
  | "PRD-9-6";

// PRD 미결에 걸린 값은 전부 이 모양으로 감싼다. "미확정" 이면 value 는 잠정값이고,
// 그 근거를 provisionalBasis 에 적는다.
export type Settled<T> =
  | { status: "확정"; value: T }
  | {
      status: "미확정";
      value: T;
      openQuestion: OpenQuestionId;
      provisionalBasis: string;
    };

const OPEN_QUESTION_IDS: readonly OpenQuestionId[] = [
  "PRD-9-1",
  "PRD-9-2",
  "PRD-9-3",
  "PRD-9-5",
  "PRD-9-6",
];

export function isOpenQuestionId(value: string): value is OpenQuestionId {
  return (OPEN_QUESTION_IDS as readonly string[]).includes(value);
}

// JSON 이 주는 `Settled<T>` 모양. status·openQuestion 은 아직 리터럴로 좁혀지지 않은
// `string` 이고, value 는 호출부가 각자 검증한 뒤 넘긴다.
export type RawSettledEnvelope = {
  status: string;
  openQuestion?: string;
  provisionalBasis?: string;
};

/**
 * `Settled<T>` 의 봉투(status·openQuestion·provisionalBasis) 를 검증한다.
 * `value` 는 호출부가 자기 도메인의 리터럴 타입으로 이미 좁혀서 넘긴다.
 */
export function resolveSettledEnvelope<T>(
  raw: RawSettledEnvelope,
  value: T,
  context: string,
): Settled<T> {
  if (raw.status === "확정") {
    return { status: "확정", value };
  }
  if (raw.status !== "미확정") {
    throw new Error(`${context}: status 값이 올바르지 않다 (${raw.status})`);
  }
  if (raw.openQuestion === undefined || !isOpenQuestionId(raw.openQuestion)) {
    throw new Error(`${context}: openQuestion 값이 올바르지 않다`);
  }
  if (raw.provisionalBasis === undefined) {
    throw new Error(`${context}: provisionalBasis 가 없다`);
  }
  return {
    status: "미확정",
    value,
    openQuestion: raw.openQuestion,
    provisionalBasis: raw.provisionalBasis,
  };
}

/**
 * 기준 데이터 JSON 의 `meta` 를 검증해 `ReferenceMeta` 로 바꾼다.
 *
 * JSON 파일의 다른 필드(문자열·숫자 리터럴)는 정적 import 라서 구조가 어긋나면
 * `tsc` 단계에서 이미 컴파일 오류가 난다. 컴파일러가 검사할 수 없는 것은 날짜 문자열이
 * 실제 달력 날짜인지뿐이라, 이 함수는 그 부분만 검증한다.
 */
export function resolveReferenceMeta(
  input: ReferenceMetaInput,
  expectedId: string,
): ReferenceMeta {
  if (input.id !== expectedId) {
    throw new Error(`${expectedId}: meta.id 가 파일 이름과 다르다 (${input.id})`);
  }
  if (input.sources.length === 0) {
    throw new Error(`${expectedId}: meta.sources 가 비어 있다`);
  }
  if (input.schemaVersion !== 1) {
    throw new Error(`${expectedId}: schemaVersion 이 1 이 아니다 (${input.schemaVersion})`);
  }

  // 원문 대조 전: 둘 다 null 이어야 한다. 한쪽만 null 이면 데이터 오류다.
  if (input.effectiveDate === null && input.lastVerified === null) {
    return {
      id: input.id,
      title: input.title,
      sources: input.sources,
      effectiveDate: null,
      lastVerified: null,
      schemaVersion: input.schemaVersion,
    };
  }
  if (input.effectiveDate === null || input.lastVerified === null) {
    throw new Error(
      `${expectedId}: meta.effectiveDate·lastVerified 는 둘 다 있거나 둘 다 null 이어야 한다`,
    );
  }

  const effectiveDate = parseCalendarDate(input.effectiveDate);
  if (!effectiveDate) {
    throw new Error(`${expectedId}: meta.effectiveDate 가 올바른 달력 날짜가 아니다`);
  }
  const lastVerified = parseCalendarDate(input.lastVerified);
  if (!lastVerified) {
    throw new Error(`${expectedId}: meta.lastVerified 가 올바른 달력 날짜가 아니다`);
  }

  return {
    id: input.id,
    title: input.title,
    sources: input.sources,
    effectiveDate,
    lastVerified,
    schemaVersion: input.schemaVersion,
  };
}
