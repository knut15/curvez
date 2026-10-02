// localStorage 저장소. 이 파일은 react·next 를 import 하지 않는다(entities/*/api 예외 표).
import { parseCalendarDate } from "@/shared/lib/calendar-date";

import type { GrowthRecord, HeightPosture } from "../model";

const GROWTH_STORE_KEY = "preemie-calc/growth-records";

export type GrowthStoreV1 = {
  version: 1;
  records: GrowthRecord[];
};

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

function isHeightPosture(value: unknown): value is HeightPosture {
  return value === "lying" || value === "standing";
}

function isValidRecord(value: unknown): value is GrowthRecord {
  if (typeof value !== "object" || value === null) return false;
  // 경계 어댑터: localStorage 에서 온 JSON.parse 결과(unknown)를 임의 속성 접근이 가능하도록
  // 좁힌다. 위 typeof 가드로 object|null 은 걸러졌고, 이 함수 자체가 각 필드를 하나씩
  // 런타임으로 검증하는 타입 가드라 이 단언 뒤의 접근은 안전하다.
  const r = value as Record<string, unknown>;
  return (
    typeof r.id === "string" &&
    typeof r.childId === "string" &&
    typeof r.measuredOn === "string" &&
    parseCalendarDate(r.measuredOn) !== null &&
    typeof r.heightCm === "number" &&
    typeof r.weightGrams === "number" &&
    typeof r.headCircumferenceCm === "number" &&
    isHeightPosture(r.heightPosture)
  );
}

/** 저장소의 최상위 모양만 본다. 기록 하나하나의 형식은 여기서 걸러 내지 않는다(ERR-01) —
 * 기록 하나가 틀렸다고 저장소 전체를 손상으로 보면, 다음 저장에서 읽을 수 있던 나머지
 * 기록까지 함께 지워진다. 형식이 틀린 기록만 걸러 내고 나머지는 보존한다.
 *
 * 다만 이 필터링은 "다음 저장" 시점에 실제로 적용된다 — readStore() 가 걸러 낸 결과를
 * writeStore() 에 그대로 넘기기 때문에, 형식이 틀린 기록은 그 저장을 기점으로 저장소에서
 * 사라진다(되살릴 수 없는 손상 기록을 계속 들고 있지 않는다는 의도된 동작이다. ERR-06). */
function isValidStoreShape(value: unknown): value is { version: 1; records: unknown[] } {
  if (typeof value !== "object" || value === null) return false;
  const s = value as Record<string, unknown>;
  return s.version === 1 && Array.isArray(s.records);
}

export type GrowthRecordsLoadResult =
  | { status: "ok"; records: GrowthRecord[] }
  | { status: "empty" }
  | { status: "corrupted" }
  | { status: "unavailable" };

function readStore(): GrowthStoreV1 | null {
  if (!isBrowser()) return null;
  let raw: string | null;
  try {
    raw = window.localStorage.getItem(GROWTH_STORE_KEY);
  } catch {
    return null;
  }
  if (raw === null) return { version: 1, records: [] };
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!isValidStoreShape(parsed)) return null;
    return { version: 1, records: parsed.records.filter(isValidRecord) };
  } catch {
    return null;
  }
}

/** 그 아이 것만, 측정일 오름차순(같은 날이면 저장한 순서)으로 돌려준다. */
export function loadGrowthRecords(childId: string): GrowthRecordsLoadResult {
  if (!isBrowser()) return { status: "empty" };

  let raw: string | null;
  try {
    raw = window.localStorage.getItem(GROWTH_STORE_KEY);
  } catch {
    return { status: "unavailable" };
  }
  if (raw === null) return { status: "empty" };

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return { status: "corrupted" };
  }
  if (!isValidStoreShape(parsed)) return { status: "corrupted" };

  const records = parsed.records
    .filter(isValidRecord)
    .filter((r) => r.childId === childId)
    .map((r, index) => ({ r, index }))
    .sort((a, b) => (a.r.measuredOn === b.r.measuredOn ? a.index - b.index : a.r.measuredOn < b.r.measuredOn ? -1 : 1))
    .map(({ r }) => r);

  if (records.length === 0) return { status: "empty" };
  return { status: "ok", records };
}

function writeStore(store: GrowthStoreV1): boolean {
  if (!isBrowser()) return false;
  try {
    window.localStorage.setItem(GROWTH_STORE_KEY, JSON.stringify(store));
    return true;
  } catch {
    return false;
  }
}

/** 같은 id 면 바꾸고, 없으면 뒤에 더한다. 쓰기 실패면 false.
 *
 * readStore() 가 null 이면(저장소 JSON 이 깨졌거나 최상위 모양이 버전 1 과 다르면) 쓰지
 * 않고 false 를 돌려준다(ERR-06). 여기서 빈 저장소로 되돌려 쓰면, 손상 전에 있던 다른
 * 아이의 정상 기록까지 새 기록 하나로 통째로 덮어쓰게 된다. */
export function saveGrowthRecord(record: GrowthRecord): boolean {
  const existing = readStore();
  if (existing === null) return false;
  const index = existing.records.findIndex((r) => r.id === record.id);
  const records =
    index >= 0
      ? existing.records.map((r, i) => (i === index ? record : r))
      : [...existing.records, record];
  return writeStore({ version: 1, records });
}
