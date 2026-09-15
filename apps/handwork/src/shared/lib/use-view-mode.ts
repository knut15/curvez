"use client";

import { useSyncExternalStore } from "react";

export type ViewMode = "card" | "list";

const storageKey = (key: string) => `view-mode:${key}`;

/** 같은 탭 안의 구독자들. `storage` 이벤트는 **다른** 탭에서만 오므로 이쪽을 따로 둔다. */
const listeners = new Set<() => void>();

function subscribe(notify: () => void) {
  listeners.add(notify);
  window.addEventListener("storage", notify);
  return () => {
    listeners.delete(notify);
    window.removeEventListener("storage", notify);
  };
}

/**
 * `localStorage` 는 읽기·쓰기 양쪽을 감싼다. 사생활 보호 창이나 사이트 데이터를 막은
 * 브라우저에서는 접근 자체가 던진다. 그때는 저장을 포기하고 화면은 그대로 돈다.
 */
function read(key: string): ViewMode {
  try {
    return localStorage.getItem(storageKey(key)) === "list" ? "list" : "card";
  } catch {
    return "card";
  }
}

/**
 * 목록 화면의 보기 방식을 기억한다. 컬렉션마다 따로 둔다 — Cases 를 리스트로 보는 사람이
 * Labs 도 리스트로 볼 거라는 근거가 없다.
 *
 * **`useSyncExternalStore` 를 쓰는 이유가 둘이다.**
 *
 * 하나는 서버 스냅샷을 따로 줄 수 있어서다. 서버가 그린 HTML 에는 저장값이 없으므로 첫
 * 렌더는 무조건 `card` 여야 하고, 그 값을 세 번째 인자가 맡는다. 저장값을 초기 상태로 쓰면
 * 하이드레이션에서 서버와 클라이언트가 다른 트리를 그린다.
 *
 * 다른 하나는 effect 안에서 `setState` 를 부르지 않기 위해서다. 붙은 뒤에 한 번 읽어
 * 바꾸는 방식은 렌더를 한 번 더 돌리고, `react-hooks/set-state-in-effect` 가 그것을 막는다.
 *
 * `getSnapshot` 이 매번 새 값을 만들면 무한 루프가 된다. 여기서는 문자열이라 안전하다.
 */
export function useViewMode(key: string): [ViewMode, (next: ViewMode) => void] {
  const mode = useSyncExternalStore(
    subscribe,
    () => read(key),
    () => "card" as ViewMode,
  );

  const choose = (next: ViewMode) => {
    try {
      localStorage.setItem(storageKey(key), next);
    } catch {
      // 저장을 못 해도 이번 방문 동안은 바뀐 상태로 보인다.
    }
    listeners.forEach((notify) => notify());
  };

  return [mode, choose];
}
