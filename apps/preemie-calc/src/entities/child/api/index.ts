// localStorage 저장소. 이 파일은 react·next 를 import 하지 않는다(entities/*/api 예외 표).
// 서버 렌더 중에는 `window` 가 없으므로 모든 함수가 브라우저 여부를 먼저 확인한다.
import { parseCalendarDate } from "@/shared/lib/calendar-date";

import type { ChildProfile, Sex } from "../model";

const PROFILE_STORE_KEY = "preemie-calc/profiles";
const CHILD_DATA_KEY_PREFIX = "preemie-calc/";

export type ProfileStoreV1 = {
  version: 1;
  profiles: ChildProfile[];
  selectedId: string | null;
};

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

function emptyStore(): ProfileStoreV1 {
  return { version: 1, profiles: [], selectedId: null };
}

function isSex(value: unknown): value is Sex {
  return value === "male" || value === "female";
}

function isValidProfile(value: unknown): value is ChildProfile {
  if (typeof value !== "object" || value === null) return false;
  // 경계 어댑터: localStorage 에서 온 JSON.parse 결과(unknown)를 임의 속성 접근이 가능하도록
  // 좁힌다. 위 typeof 가드로 object|null 은 걸러졌고, 이 함수 자체가 각 필드를 하나씩
  // 런타임으로 검증하는 타입 가드라 이 단언 뒤의 접근은 안전하다.
  const p = value as Record<string, unknown>;
  return (
    typeof p.id === "string" &&
    (p.name === null || typeof p.name === "string") &&
    isSex(p.sex) &&
    typeof p.birthDate === "string" &&
    parseCalendarDate(p.birthDate) !== null &&
    typeof p.dueDate === "string" &&
    parseCalendarDate(p.dueDate) !== null &&
    (p.birthWeightGrams === null || typeof p.birthWeightGrams === "number")
  );
}

function isValidStore(value: unknown): value is ProfileStoreV1 {
  if (typeof value !== "object" || value === null) return false;
  // 경계 어댑터: 위 isValidProfile 과 같은 이유(localStorage JSON.parse 결과를 검증 전
  // 속성 접근이 가능하도록 좁힌다).
  const s = value as Record<string, unknown>;
  return (
    s.version === 1 &&
    Array.isArray(s.profiles) &&
    s.profiles.every(isValidProfile) &&
    (s.selectedId === null || typeof s.selectedId === "string")
  );
}

export type ProfileStoreLoadResult =
  | { status: "ok"; store: ProfileStoreV1 }
  | { status: "empty" } // 키가 없거나, 형태는 맞지만 프로필이 0개
  | { status: "corrupted" } // 키는 있지만 JSON·버전·형태가 맞지 않음 (dashboard state:error)
  | { status: "unavailable" }; // localStorage 자체를 읽을 수 없다(차단·예외, ERR-02). "형태가
  // 맞지 않다"(corrupted)와는 다른 사실이라 별도 상태로 둔다.

/** dashboard 등이 "프로필 없음"과 "저장값이 깨짐"을 구분해야 할 때 쓴다. */
export function loadProfileStore(): ProfileStoreLoadResult {
  if (!isBrowser()) return { status: "empty" };

  let raw: string | null;
  try {
    raw = window.localStorage.getItem(PROFILE_STORE_KEY);
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

  if (!isValidStore(parsed)) return { status: "corrupted" };
  if (parsed.profiles.length === 0) return { status: "empty" };
  return { status: "ok", store: parsed };
}

/** 키가 없거나 JSON·버전이 맞지 않으면 빈 상태를 낸다(architecture.md 원 시그니처). */
export function readProfileStore(): ProfileStoreV1 {
  const result = loadProfileStore();
  return result.status === "ok" ? result.store : emptyStore();
}

/** 쓰기 성공 여부를 돌려준다(ERR-02) — 저장소가 막혔거나 용량을 넘으면 예외 대신 false. */
function writeStore(store: ProfileStoreV1): boolean {
  if (!isBrowser()) return false;
  try {
    window.localStorage.setItem(PROFILE_STORE_KEY, JSON.stringify(store));
    return true;
  } catch {
    return false;
  }
}

/** 같은 id 면 바꾸고, 없으면 뒤에 더한 뒤 그 아이를 선택한다. 쓰기 실패면 false(ERR-02) —
 * 호출부(폼)가 저장 실패를 사용자에게 알린다. */
export function saveProfile(profile: ChildProfile): boolean {
  const store = readProfileStore();
  const index = store.profiles.findIndex((p) => p.id === profile.id);
  const profiles =
    index >= 0
      ? store.profiles.map((p, i) => (i === index ? profile : p))
      : [...store.profiles, profile];
  return writeStore({ version: 1, profiles, selectedId: profile.id });
}

/** selectedId 만 바꾼다 (PC-F1-AC5). */
export function selectProfile(id: string): boolean {
  const store = readProfileStore();
  return writeStore({ ...store, selectedId: id });
}

/** `preemie-calc/` 로 시작하는 localStorage 키를 전부 지운다 (PC-F1-AC6). 저장소를 못 쓰는
 * 환경이면 지울 것도 없으니 조용히 넘어간다(ERR-02). */
export function deleteAllChildData(): void {
  if (!isBrowser()) return;
  try {
    const keys: string[] = [];
    for (let i = 0; i < window.localStorage.length; i += 1) {
      const key = window.localStorage.key(i);
      if (key && key.startsWith(CHILD_DATA_KEY_PREFIX)) keys.push(key);
    }
    keys.forEach((key) => window.localStorage.removeItem(key));
  } catch {
    // 저장소를 못 쓰는 환경이다. 지울 값도 없다고 본다.
  }
}

/** selectedId 에 해당하는 아이. 없는 id 면 profiles[0] (architecture ② 표). */
export function selectedProfileOf(store: ProfileStoreV1): ChildProfile | null {
  if (store.profiles.length === 0) return null;
  return store.profiles.find((p) => p.id === store.selectedId) ?? store.profiles[0];
}
