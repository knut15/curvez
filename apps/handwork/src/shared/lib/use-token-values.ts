"use client";

import { useSyncExternalStore } from "react";

/** 테마가 바뀌면 `html` 의 class 가 바뀐다. 그 변화를 구독한다. */
function subscribe(notify: () => void) {
  const observer = new MutationObserver(notify);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class"],
  });
  return () => observer.disconnect();
}

/**
 * 토큰의 **지금 값**을 읽는다. 화면에 적는 hex 를 손으로 옮겨 적지 않기 위해서다 —
 * 옮겨 적으면 토큰을 고칠 때 이 페이지만 옛 값을 들고 남는다.
 *
 * **반환이 문자열 하나인 이유가 있다.** `useSyncExternalStore` 의 `getSnapshot` 이 매번
 * 새 배열이나 객체를 만들면 React 가 값이 바뀐 것으로 보고 무한히 다시 그린다. 문자열로
 * 이어 붙이면 내용이 같을 때 같은 문자열이라 그 일이 없다. 쪼개는 것은 부르는 쪽이 한다.
 *
 * 서버에는 계산된 스타일이 없으므로 빈 문자열을 돌려준다. 화면은 값 자리만 비워 두고
 * 그대로 그려진다.
 */
export function useTokenValues(names: readonly string[]): string[] {
  const joined = useSyncExternalStore(
    subscribe,
    () => {
      const style = getComputedStyle(document.documentElement);
      return names.map((n) => style.getPropertyValue(n).trim()).join("|");
    },
    () => "",
  );

  return joined ? joined.split("|") : names.map(() => "");
}
