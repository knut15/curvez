// localStorage 저장소. 이 파일은 react·next 를 import 하지 않는다(entities/*/api 예외 표).

const VACCINATION_STORE_KEY = "preemie-calc/vaccinations";

export type VaccinationStoreV1 = {
  version: 1;
  completed: { childId: string; doseId: string }[];
};

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

function isValidEntry(value: unknown): value is { childId: string; doseId: string } {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  return typeof v.childId === "string" && typeof v.doseId === "string";
}

/** 저장소의 최상위 모양만 본다. 항목 하나하나의 형식은 여기서 걸러 내지 않는다(growth 의
 * isValidStoreShape 와 같은 패턴) — 항목 하나가 틀렸다고 저장소 전체를 손상으로 보면(예전
 * every 검사), 다음 저장에서 읽을 수 있던 나머지 항목까지 함께 지워지고, 그 손상이 남아
 * 있는 한 이후 어떤 저장도 계속 거부된다. 형식이 틀린 항목만 걸러 내고 나머지는 보존한다.
 *
 * 이 필터링은 "다음 저장" 시점에 실제로 적용된다 — readStore() 가 걸러 낸 결과를
 * writeStore() 에 그대로 넘기기 때문에, 형식이 틀린 항목은 그 저장을 기점으로 저장소에서
 * 사라진다(되살릴 수 없는 손상 항목을 계속 들고 있지 않는다는 의도된 동작이다). */
function isValidStoreShape(value: unknown): value is { version: 1; completed: unknown[] } {
  if (typeof value !== "object" || value === null) return false;
  const s = value as Record<string, unknown>;
  return s.version === 1 && Array.isArray(s.completed);
}

export type CompletedDosesLoadResult =
  | { status: "ok"; doseIds: string[] }
  | { status: "empty" }
  | { status: "corrupted" }
  | { status: "unavailable" };

function readStore(): VaccinationStoreV1 | null {
  if (!isBrowser()) return null;
  let raw: string | null;
  try {
    raw = window.localStorage.getItem(VACCINATION_STORE_KEY);
  } catch {
    return null;
  }
  if (raw === null) return { version: 1, completed: [] };
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!isValidStoreShape(parsed)) return null;
    return { version: 1, completed: parsed.completed.filter(isValidEntry) };
  } catch {
    return null;
  }
}

/** 그 아이의 완료 doseId 목록. */
export function loadCompletedDoseIds(childId: string): CompletedDosesLoadResult {
  if (!isBrowser()) return { status: "empty" };

  let raw: string | null;
  try {
    raw = window.localStorage.getItem(VACCINATION_STORE_KEY);
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

  const doseIds = parsed.completed
    .filter(isValidEntry)
    .filter((c) => c.childId === childId)
    .map((c) => c.doseId);
  if (doseIds.length === 0) return { status: "empty" };
  return { status: "ok", doseIds };
}

function writeStore(store: VaccinationStoreV1): boolean {
  if (!isBrowser()) return false;
  try {
    window.localStorage.setItem(VACCINATION_STORE_KEY, JSON.stringify(store));
    return true;
  } catch {
    return false;
  }
}

/** 켜면 더하고(이미 있으면 그대로), 끄면 뺀다. 쓰기 실패면 false.
 *
 * readStore() 가 null 이면(저장소 JSON 이 깨졌거나 최상위 모양이 버전 1 과 다르면) 쓰지
 * 않고 false 를 돌려준다(growth 의 ERR-06 수정과 같은 규칙). 여기서 빈 저장소로 되돌려
 * 쓰면, 손상 전에 있던 다른 아이의 완료 기록까지 이번 항목 하나로 통째로 덮어쓰게 된다. */
export function setDoseCompleted(childId: string, doseId: string, completed: boolean): boolean {
  const existing = readStore();
  if (existing === null) return false;
  const already = existing.completed.some((c) => c.childId === childId && c.doseId === doseId);

  let next: { childId: string; doseId: string }[];
  if (completed) {
    next = already ? existing.completed : [...existing.completed, { childId, doseId }];
  } else {
    next = existing.completed.filter((c) => !(c.childId === childId && c.doseId === doseId));
  }

  return writeStore({ version: 1, completed: next });
}
